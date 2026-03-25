import { access } from "node:fs/promises";
import { join } from "node:path";

export type ProjectType = "nodejs" | "rust" | "python" | "go" | "swift";

export type CheckType = "typecheck" | "test" | "lint" | "format" | "build";

async function fileExists(cwd: string, filename: string): Promise<boolean> {
  try {
    await access(join(cwd, filename));
    return true;
  } catch {
    return false;
  }
}

export async function detectNodejs(cwd: string): Promise<boolean> {
  return fileExists(cwd, "package.json");
}

export async function detectRust(cwd: string): Promise<boolean> {
  return fileExists(cwd, "Cargo.toml");
}

export async function detectPython(cwd: string): Promise<boolean> {
  return (
    (await fileExists(cwd, "pyproject.toml")) ||
    (await fileExists(cwd, "requirements.txt")) ||
    (await fileExists(cwd, "setup.py"))
  );
}

export async function detectGo(cwd: string): Promise<boolean> {
  return fileExists(cwd, "go.mod");
}

export async function detectSwift(cwd: string): Promise<boolean> {
  return fileExists(cwd, "Package.swift");
}

export async function detectProjectType(cwd: string): Promise<ProjectType | null> {
  if (await detectNodejs(cwd)) return "nodejs";
  if (await detectRust(cwd)) return "rust";
  if (await detectPython(cwd)) return "python";
  if (await detectGo(cwd)) return "go";
  if (await detectSwift(cwd)) return "swift";
  return null;
}

export function getNodejsCheckCommand(
  check: CheckType,
  scripts: Record<string, string>
): string | null {
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

export function getRustCheckCommand(check: CheckType): string | null {
  const commands: Record<CheckType, string | null> = {
    typecheck: "cargo check",
    test: "cargo test",
    lint: "cargo clippy",
    format: "cargo fmt --check",
    build: "cargo build",
  };
  return commands[check];
}

export function getPythonCheckCommand(check: CheckType): string | null {
  const commands: Record<CheckType, string | null> = {
    typecheck: "python -m mypy .",
    test: "pytest",
    lint: "ruff check .",
    format: "ruff format --check .",
    build: null,
  };
  return commands[check];
}

export function getGoCheckCommand(check: CheckType): string | null {
  const commands: Record<CheckType, string | null> = {
    typecheck: null,
    test: "go test ./...",
    lint: "go vet ./...",
    format: null,
    build: "go build ./...",
  };
  return commands[check];
}

export function getSwiftCheckCommand(check: CheckType): string | null {
  const commands: Record<CheckType, string | null> = {
    typecheck: null,
    test: "swift test",
    lint: null,
    format: "swiftformat --lint .",
    build: "swift build",
  };
  return commands[check];
}

export function getCheckCommand(
  projectType: ProjectType | null,
  check: CheckType,
  scripts?: Record<string, string>
): string | null {
  if (projectType === null) return null;

  switch (projectType) {
    case "nodejs":
      return getNodejsCheckCommand(check, scripts ?? {});
    case "rust":
      return getRustCheckCommand(check);
    case "python":
      return getPythonCheckCommand(check);
    case "go":
      return getGoCheckCommand(check);
    case "swift":
      return getSwiftCheckCommand(check);
    default:
      return null;
  }
}
