import { exec } from "node:child_process";
import { promisify } from "node:util";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const execAsync = promisify(exec);

export type CheckType = "typecheck" | "test" | "lint" | "format" | "build";

export interface CheckResult {
  type: CheckType;
  success: boolean;
  duration: number;
  output?: string;
  error?: string;
}

export interface VerifyResult {
  success: boolean;
  checks: CheckResult[];
  summary: {
    passed: number;
    failed: number;
    duration: number;
  };
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

  // Fallback commands if no script found
  const fallbackMap: Record<CheckType, string | null> = {
    typecheck: "npx tsc --noEmit",
    test: null, // No reliable fallback
    lint: "npx eslint .",
    format: "npx prettier --check .",
    build: null, // No reliable fallback
  };

  return fallbackMap[check];
}

export async function runCheck(type: CheckType, cwd: string): Promise<CheckResult> {
  const startTime = Date.now();

  const projectType = await detectProjectType(cwd);
  if (projectType !== "nodejs") {
    return {
      type,
      success: false,
      duration: 0,
      error: "No Node.js project detected (package.json not found)",
    };
  }

  const packageJson = await loadPackageJson(cwd);
  const command = getCheckCommand(type, packageJson.scripts ?? {});

  if (!command) {
    return {
      type,
      success: false,
      duration: 0,
      error: `No command available for ${type} check`,
    };
  }

  try {
    const { stdout, stderr } = await execAsync(command, {
      cwd,
      timeout: 300000, // 5 minute timeout
    });

    const duration = Date.now() - startTime;

    return {
      type,
      success: true,
      duration,
      ...(stdout || stderr ? { output: stdout || stderr } : {}),
    };
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

    return {
      type,
      success: false,
      duration,
      output: errorOutput,
    };
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
  cwd: string
): Promise<VerifyResult> {
  const startTime = Date.now();
  const checksToRun = scopeToChecks[scope];
  const results: CheckResult[] = [];

  for (const checkType of checksToRun) {
    const result = await runCheck(checkType, cwd);
    results.push(result);
  }

  const passed = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;
  const duration = Date.now() - startTime;

  return {
    success: failed === 0,
    checks: results,
    summary: {
      passed,
      failed,
      duration,
    },
  };
}
