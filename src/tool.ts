import type { VerifyInput } from "./types.js";
import { runVerification, type CheckResult } from "./verify.js";

function formatCheckResult(check: CheckResult): string {
  const indicator = check.success ? "✓" : "✗";
  const duration = (check.duration / 1000).toFixed(1);
  let line = `${indicator} ${check.type}: ${duration}s`;

  if (check.parsedTestResult) {
    const { passed, failed, skipped } = check.parsedTestResult;
    const parts = [`${passed} passed`];
    if (failed > 0) parts.push(`${failed} failed`);
    if (skipped > 0) parts.push(`${skipped} skipped`);
    line += ` (${parts.join(", ")})`;
  } else if (!check.success && check.error) {
    line += ` (${check.error})`;
  }

  return line;
}

export async function executeVerifyCheck(
  input: VerifyInput,
  cwd: string
): Promise<{
  content: { type: "text"; text: string }[];
  details: unknown;
}> {
  const result = await runVerification(input.scope, cwd);
  // Build formatted summary
  const lines: string[] = [];
  const indicator = result.success ? "✓" : "✗";
  const duration = (result.summary.duration / 1000).toFixed(1);

  lines.push(
    `${indicator} ${result.summary.passed} passed, ${result.summary.failed} failed (${duration}s total)`
  );
  lines.push("");

  for (const check of result.checks) {
    lines.push(formatCheckResult(check));
  }
  return {
    content: [{ type: "text", text: lines.join("\n") }],
    details: result,
  };
}
