import { exec } from "node:child_process";
import { promisify } from "node:util";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type {
  ProgressUpdate,
  ParsedTestResult,
  WatchModeConfig,
  ErrorCategory,
  CategorizedError,
} from "./types.js";

export type { WatchModeConfig };
const execAsync = promisify(exec);

export type CheckType = "typecheck" | "test" | "lint" | "format" | "build";

export interface CheckResult {
  type: CheckType;
  success: boolean;
  duration: number;
  output?: string;
  error?: string;
  parsedTestResult?: ParsedTestResult;
}

export interface ErrorSummary {
  total: number;
  byCategory: Record<ErrorCategory, number>;
  errors: CategorizedError[];
}
export interface VerifyResult {
  success: boolean;
  checks: CheckResult[];
  summary: {
    passed: number;
    failed: number;
    duration: number;
  };
  errorSummary?: ErrorSummary;
}

interface PackageJson {
  scripts?: Record<string, string>;
}

export async function detectProjectType(cwd: string): Promise<"nodejs" | null> {
  try {
    await readFile(join(cwd, "package.json"), "utf-8");
    return "nodejs";
  } catch {
    return null;
  }
}

async function loadPackageJson(cwd: string): Promise<PackageJson> {
  const content = await readFile(join(cwd, "package.json"), "utf-8");
  return JSON.parse(content) as PackageJson;
}

export function getCheckCommand(check: CheckType, scripts: Record<string, string>): string | null {
  const scriptMap: Record<CheckType, string[]> = {
    typecheck: ["typecheck", "tsc", "typescript"],
    test: ["test", "tests", "jest", "vitest"],
    lint: ["lint", "eslint", "lint:check"],
    format: ["format:check", "format", "prettier:check", "prettier"],
    build: ["build", "compile", "dist"],
  };

  const candidates = scriptMap[check];
  for (const candidate of candidates) {
    if (scripts[candidate]) {
      return `npm run ${candidate}`;
    }
  }

  const fallbackMap: Record<CheckType, string | null> = {
    typecheck: "npx tsc --noEmit",
    test: null,
    lint: "npx eslint .",
    format: "npx prettier --check .",
    build: null,
  };

  return fallbackMap[check];
}

export function parseTestOutput(output: string): ParsedTestResult | undefined {
  const tests: ParsedTestResult["tests"] = [];
  let passed = 0;
  let failed = 0;
  let skipped = 0;
  let framework = "unknown";

  const isJest = output.includes("PASS") || output.includes("FAIL");
  const isVitest = output.includes("Test Files") || output.includes("Vitest");
  const isNodeTest = output.includes("✔") || output.includes("✗") || output.includes("subtests:");

  if (isJest) framework = "jest";
  else if (isVitest) framework = "vitest";
  else if (isNodeTest) framework = "node:test";

  if (isJest) {
    const testMatch = output.match(
      /Tests:\s+(\d+)\s+passed(?:,\s+(\d+)\s+failed)?(?:,\s+(\d+)\s+skipped)?/
    );
    if (testMatch) {
      passed = parseInt(testMatch[1] ?? "0", 10);
      failed = parseInt(testMatch[2] ?? "0", 10);
      skipped = parseInt(testMatch[3] ?? "0", 10);
    }
  }

  if (isVitest) {
    const passMatch = output.match(/(\d+)\s+passed/);
    const failMatch = output.match(/(\d+)\s+failed/);
    if (passMatch) passed = parseInt(passMatch[1] ?? "0", 10);
    if (failMatch) failed = parseInt(failMatch[1] ?? "0", 10);
  }

  if (isNodeTest) {
    const passMatch = output.match(/✔/g);
    const failMatch = output.match(/✗/g);
    if (passMatch) passed = passMatch.length;
    if (failMatch) failed = failMatch.length;
  }

  const lines = output.split("\n");
  for (const line of lines) {
    const testMatch = line.match(/[✔✗]\s+(.+)/);
    if (testMatch) {
      tests.push({
        name: testMatch[1]?.trim() ?? "",
        status: line.includes("✔") ? "passed" : "failed",
      });
    }
  }

  if (passed === 0 && failed === 0 && tests.length === 0) {
    return undefined;
  }

  return { framework, passed, failed, skipped, tests };
}

/**
 * Executes a single verification check (typecheck, test, lint, format, or build).
 *
 * @param type - The type of check to run
 * @param cwd - The working directory to run the check in
 * @param onProgress - Optional callback for progress updates during execution
 * @returns The result of the check including success status, duration, and output
 */
export async function runCheck(
  type: CheckType,
  cwd: string,
  onProgress?: (update: ProgressUpdate) => void
): Promise<CheckResult> {
  const startTime = Date.now();

  onProgress?.({ type, status: "running", message: `Running ${type}...` });

  const projectType = await detectProjectType(cwd);
  if (projectType !== "nodejs") {
    const result: CheckResult = {
      type,
      success: false,
      duration: 0,
      error: "No Node.js project detected (package.json not found)",
    };
    onProgress?.({ type, status: "complete", result });
    return result;
  }

  const packageJson = await loadPackageJson(cwd);
  const command = getCheckCommand(type, packageJson.scripts ?? {});

  if (!command) {
    const result: CheckResult = {
      type,
      success: false,
      duration: 0,
      error: `No command available for ${type} check`,
    };
    onProgress?.({ type, status: "complete", result });
    return result;
  }

  try {
    const { stdout, stderr } = await execAsync(command, {
      cwd,
      timeout: 300000,
    });

    const duration = Date.now() - startTime;
    const output = stdout || stderr;
    const parsedTestResult = type === "test" && output ? parseTestOutput(output) : undefined;

    const result: CheckResult = {
      type,
      success: true,
      duration,
      ...(output ? { output } : {}),
      ...(parsedTestResult ? { parsedTestResult } : {}),
    };
    onProgress?.({ type, status: "complete", result });
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;

    let errorOutput = "";
    if (error && typeof error === "object") {
      const execError = error as {
        stdout?: string;
        stderr?: string;
        message?: string;
      };
      errorOutput = execError.stdout ?? execError.stderr ?? execError.message ?? "Unknown error";
    } else {
      errorOutput = String(error);
    }

    const parsedTestResult = type === "test" ? parseTestOutput(errorOutput) : undefined;

    const result: CheckResult = {
      type,
      success: false,
      duration,
      output: errorOutput,
      ...(parsedTestResult ? { parsedTestResult } : {}),
    };
    onProgress?.({ type, status: "complete", result });
    return result;
  }
}

const scopeToChecks: Record<"all" | "test" | "lint" | "quick", CheckType[]> = {
  all: ["typecheck", "test", "lint", "format"],
  test: ["test"],
  lint: ["lint", "format"],
  quick: ["typecheck", "lint"],
};

export async function runVerification(
  scope: "all" | "test" | "lint" | "quick",
  cwd: string,
  onProgress?: (update: ProgressUpdate) => void
): Promise<VerifyResult> {
  const startTime = Date.now();
  const checksToRun = scopeToChecks[scope];
  const results: CheckResult[] = [];

  for (const checkType of checksToRun) {
    const result = await runCheck(checkType, cwd, onProgress);
    results.push(result);
  }

  const passed = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;
  const duration = Date.now() - startTime;
  const result: VerifyResult = {
    success: failed === 0,
    checks: results,
    summary: {
      passed,
      failed,
      duration,
    },
  };

  if (failed > 0) {
    result.errorSummary = aggregateErrors(results);
  }

  return result;
}

/**
 * Detects if watch mode flags are present in command arguments
 * @param args - Array of command arguments to check
 * @returns Object with enabled flag and detected watch flags
 */
export function detectWatchMode(args: string[]): { enabled: boolean; flags: string[] } {
  const watchFlags = ["--watch", "--watchAll", "-w"];
  const foundFlags = args.filter((arg) => watchFlags.includes(arg));
  return {
    enabled: foundFlags.length > 0,
    flags: foundFlags,
  };
}

/**
 * Determines if a test framework supports watch mode
 * @param config - Object containing the framework name
 * @returns true if the framework supports watch mode
 */
export function supportsWatchMode(config: { framework: string }): boolean {
  const supportedFrameworks = ["jest", "vitest"];
  return supportedFrameworks.includes(config.framework.toLowerCase());
}

/**
 * Categorizes an error based on its output and check type
 */
export function categorizeError(output: string, checkType: CheckType): CategorizedError {
  const lines = output.split("\n");
  const firstLine = lines[0]?.trim() ?? "";

  // Try to extract file path and line number
  const locationMatch =
    output.match(/([^\s(]+)\s*\((\d+),?\s*(\d+)?\)/) ??
    output.match(/([^\s:]+):(\d+):(\d+)/) ??
    output.match(/([^\s:]+):(\d+)/);

  const file = locationMatch?.[1];
  const line = locationMatch?.[2] ? parseInt(locationMatch[2], 10) : undefined;
  const column = locationMatch?.[3] ? parseInt(locationMatch[3], 10) : undefined;

  // Determine category based on patterns
  let category: ErrorCategory = "Unknown";
  let message = firstLine;

  if (checkType === "typecheck" || output.includes("error TS")) {
    category = "TypeError";
    const tsErrorMatch = output.match(/error\s+TS\d+:\s*(.+)/);
    if (tsErrorMatch) {
      message = tsErrorMatch[1]?.trim() ?? firstLine;
    }
  } else if (checkType === "lint" || output.includes(" ESLint ") || output.includes("eslint")) {
    category = "LintViolation";
    const eslintMatch = output.match(/error\s+(.+?)(?:\s+\(|$)/);
    if (eslintMatch) {
      message = eslintMatch[1]?.trim() ?? firstLine;
    }
  } else if (
    checkType === "test" ||
    output.includes("✗") ||
    output.includes("FAIL") ||
    output.includes("failed")
  ) {
    category = "TestFailure";
    const testMatch = output.match(/(?:✗|FAIL|failed)[:\s]*(.+)/i);
    if (testMatch) {
      message = testMatch[1]?.trim() ?? firstLine;
    }
  } else if (output.includes("SyntaxError") || output.includes("ParseError")) {
    category = "SyntaxError";
    const syntaxMatch = output.match(/(?:SyntaxError|ParseError):\s*(.+)/);
    if (syntaxMatch) {
      message = syntaxMatch[1]?.trim() ?? firstLine;
    }
  } else if (output.includes("config") || output.includes("cannot find")) {
    category = "ConfigError";
  }

  return {
    category,
    message,
    ...(file && { file }),
    ...(line && { line }),
    ...(column && { column }),
    originalOutput: output,
  };
}

/**
 * Generates a suggestion for fixing an error
 */
export function getSuggestedFix(error: CategorizedError): string | undefined {
  const { category, message, originalOutput } = error;

  if (category === "TypeError") {
    if (
      originalOutput.includes("Cannot find module") ||
      originalOutput.includes("cannot find module")
    ) {
      return "Run 'npm install' or 'pnpm install' to install missing dependencies";
    }
    if (originalOutput.includes("is not assignable to type")) {
      return "Check type annotations and ensure types are compatible";
    }
  }

  if (category === "LintViolation") {
    if (message.includes("semicolon") || message.includes("comma")) {
      return "Run 'pnpm run lint:fix' to auto-fix formatting issues";
    }
    if (message.includes("unused")) {
      return "Remove unused variables or imports";
    }
  }

  if (category === "TestFailure") {
    if (originalOutput.includes("timeout") || originalOutput.includes("timed out")) {
      return "Increase timeout in test config or check for infinite loops";
    }
    return "Review test assertions and expected values";
  }

  if (category === "ConfigError") {
    return "Check configuration files and ensure all required settings are present";
  }

  return undefined;
}

/**
 * Aggregates errors from all check results into a summary
 */
export function aggregateErrors(results: CheckResult[]): ErrorSummary {
  const errors: CategorizedError[] = [];
  const byCategory: Record<ErrorCategory, number> = {
    SyntaxError: 0,
    TypeError: 0,
    TestFailure: 0,
    LintViolation: 0,
    ConfigError: 0,
    Unknown: 0,
  };

  for (const result of results) {
    if (!result.success && result.output) {
      const categorized = categorizeError(result.output, result.type);
      const suggestion = getSuggestedFix(categorized);
      const error: CategorizedError = {
        ...categorized,
        ...(suggestion && { suggestion }),
      };
      errors.push(error);
      byCategory[error.category]++;
    }
  }

  return {
    total: errors.length,
    byCategory,
    errors,
  };
}
