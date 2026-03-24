import type { VerifyInput } from "./types.js";
import { runVerification } from "./verify.js";

export async function executeVerifyCheck(
  input: VerifyInput,
  cwd: string
): Promise<{
  content: { type: "text"; text: string }[];
  details: unknown;
}> {
  const result = await runVerification(input.scope, cwd);

  const text = result.success
    ? `✓ Verification passed (${result.summary.passed}/${result.checks.length} checks)`
    : `✗ Verification failed (${result.summary.failed}/${result.checks.length} checks failed)`;

  return {
    content: [{ type: "text", text }],
    details: result,
  };
}
