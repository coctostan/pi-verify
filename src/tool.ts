import type { VerifyInput } from "./types.js";
import { formatCheckResult } from "./formatters.js";
import { runVerification } from "./verify.js";

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
  // Include error summary in formatted output if present
  if (result.errorSummary) {
    lines.push("");
    lines.push("Error Summary:");
    lines.push(`  Total: ${result.errorSummary.total} error(s)`);
    for (const [category, count] of Object.entries(result.errorSummary.byCategory)) {
      if (count > 0) {
        lines.push(`  ${category}: ${count}`);
      }
    }
    for (const error of result.errorSummary.errors) {
      lines.push("");
      lines.push(`  [${error.category}] ${error.message}`);
      if (error.file) {
        lines.push(`    at ${error.file}${error.line ? `:${error.line}` : ""}`);
      }
      if (error.suggestion) {
        lines.push(`    💡 ${error.suggestion}`);
      }
    }
  }

  return {
    content: [{ type: "text", text: lines.join("\n") }],
    details: result,
  };
}
