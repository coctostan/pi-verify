import type { CheckResult } from "./verify.js";
import type chalk from "chalk";

/**
 * Formats a single check result for display.
 *
 * @param check - The check result to format
 * @param chalkInstance - Optional chalk instance for coloring (defaults to no color)
 * @returns Formatted string representation of the check result
 */
export function formatCheckResult(check: CheckResult, chalkInstance?: typeof chalk): string {
  const indicator = check.success
    ? (chalkInstance?.green("✓") ?? "✓")
    : (chalkInstance?.red("✗") ?? "✗");
  const duration = (check.duration / 1000).toFixed(1);
  const typeLabel = chalkInstance?.cyan(check.type) ?? check.type;
  let line = `${indicator} ${typeLabel}: ${duration}s`;

  if (check.parsedTestResult) {
    const { passed, failed, skipped } = check.parsedTestResult;
    const parts = [`${passed} passed`];
    if (failed > 0) parts.push(chalkInstance?.red(`${failed} failed`) ?? `${failed} failed`);
    if (skipped > 0) parts.push(`${skipped} skipped`);
    line += ` (${parts.join(", ")})`;
  } else if (!check.success && check.error) {
    line += ` (${chalkInstance?.red(check.error) ?? check.error})`;
  }

  return line;
}
