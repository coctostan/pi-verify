import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, rmdir } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  detectNodejs,
  detectRust,
  detectPython,
  detectGo,
  detectSwift,
  detectProjectType,
  getRustCheckCommand,
  getPythonCheckCommand,
  getGoCheckCommand,
  getSwiftCheckCommand,
  getCheckCommand,
} from "../src/detectors.js";

async function createTempDir(): Promise<string> {
  return mkdtemp(join(tmpdir(), "pi-verify-test-"));
}

async function cleanup(dir: string): Promise<void> {
  try {
    await rmdir(dir, { recursive: true });
  } catch {
    // Ignore cleanup errors
  }
}

void test("detectNodejs returns true when package.json exists", async () => {
  const dir = await createTempDir();
  await writeFile(join(dir, "package.json"), "{}");
  const result = await detectNodejs(dir);
  assert.equal(result, true);
  await cleanup(dir);
});

void test("detectNodejs returns false when no package.json", async () => {
  const dir = await createTempDir();
  const result = await detectNodejs(dir);
  assert.equal(result, false);
  await cleanup(dir);
});

void test("detectRust returns true when Cargo.toml exists", async () => {
  const dir = await createTempDir();
  await writeFile(join(dir, "Cargo.toml"), "[package]");
  const result = await detectRust(dir);
  assert.equal(result, true);
  await cleanup(dir);
});

void test("detectRust returns false when no Cargo.toml", async () => {
  const dir = await createTempDir();
  const result = await detectRust(dir);
  assert.equal(result, false);
  await cleanup(dir);
});

void test("detectPython returns true when pyproject.toml exists", async () => {
  const dir = await createTempDir();
  await writeFile(join(dir, "pyproject.toml"), "[project]");
  const result = await detectPython(dir);
  assert.equal(result, true);
  await cleanup(dir);
});

void test("detectPython returns true when requirements.txt exists", async () => {
  const dir = await createTempDir();
  await writeFile(join(dir, "requirements.txt"), "requests");
  const result = await detectPython(dir);
  assert.equal(result, true);
  await cleanup(dir);
});

void test("detectPython returns true when setup.py exists", async () => {
  const dir = await createTempDir();
  await writeFile(join(dir, "setup.py"), "from setuptools import setup");
  const result = await detectPython(dir);
  assert.equal(result, true);
  await cleanup(dir);
});

void test("detectPython returns false when no Python files", async () => {
  const dir = await createTempDir();
  const result = await detectPython(dir);
  assert.equal(result, false);
  await cleanup(dir);
});

void test("detectGo returns true when go.mod exists", async () => {
  const dir = await createTempDir();
  await writeFile(join(dir, "go.mod"), "module example.com/test");
  const result = await detectGo(dir);
  assert.equal(result, true);
  await cleanup(dir);
});

void test("detectGo returns false when no go.mod", async () => {
  const dir = await createTempDir();
  const result = await detectGo(dir);
  assert.equal(result, false);
  await cleanup(dir);
});

void test("detectSwift returns true when Package.swift exists", async () => {
  const dir = await createTempDir();
  await writeFile(join(dir, "Package.swift"), "// swift-tools-version:5.0");
  const result = await detectSwift(dir);
  assert.equal(result, true);
  await cleanup(dir);
});

void test("detectSwift returns false when no Package.swift", async () => {
  const dir = await createTempDir();
  const result = await detectSwift(dir);
  assert.equal(result, false);
  await cleanup(dir);
});

void test("detectProjectType returns nodejs for package.json projects", async () => {
  const dir = await createTempDir();
  await writeFile(join(dir, "package.json"), "{}");
  const result = await detectProjectType(dir);
  assert.equal(result, "nodejs");
  await cleanup(dir);
});

void test("detectProjectType returns rust for Cargo.toml projects", async () => {
  const dir = await createTempDir();
  await writeFile(join(dir, "Cargo.toml"), "[package]");
  const result = await detectProjectType(dir);
  assert.equal(result, "rust");
  await cleanup(dir);
});

void test("detectProjectType returns python for pyproject.toml projects", async () => {
  const dir = await createTempDir();
  await writeFile(join(dir, "pyproject.toml"), "[project]");
  const result = await detectProjectType(dir);
  assert.equal(result, "python");
  await cleanup(dir);
});

void test("detectProjectType returns go for go.mod projects", async () => {
  const dir = await createTempDir();
  await writeFile(join(dir, "go.mod"), "module example.com/test");
  const result = await detectProjectType(dir);
  assert.equal(result, "go");
  await cleanup(dir);
});

void test("detectProjectType returns swift for Package.swift projects", async () => {
  const dir = await createTempDir();
  await writeFile(join(dir, "Package.swift"), "// swift-tools-version:5.0");
  const result = await detectProjectType(dir);
  assert.equal(result, "swift");
  await cleanup(dir);
});

void test("detectProjectType returns null for unrecognized projects", async () => {
  const dir = await createTempDir();
  const result = await detectProjectType(dir);
  assert.equal(result, null);
  await cleanup(dir);
});

void test("getRustCheckCommand returns cargo commands for all check types", () => {
  assert.equal(getRustCheckCommand("typecheck"), "cargo check");
  assert.equal(getRustCheckCommand("test"), "cargo test");
  assert.equal(getRustCheckCommand("lint"), "cargo clippy");
  assert.equal(getRustCheckCommand("format"), "cargo fmt --check");
  assert.equal(getRustCheckCommand("build"), "cargo build");
});

void test("getPythonCheckCommand returns appropriate commands for Python", () => {
  assert.equal(getPythonCheckCommand("typecheck"), "python -m mypy .");
  assert.equal(getPythonCheckCommand("test"), "pytest");
  assert.equal(getPythonCheckCommand("lint"), "ruff check .");
  assert.equal(getPythonCheckCommand("format"), "ruff format --check .");
  assert.equal(getPythonCheckCommand("build"), null);
});

void test("getGoCheckCommand returns appropriate commands for Go", () => {
  assert.equal(getGoCheckCommand("typecheck"), null);
  assert.equal(getGoCheckCommand("test"), "go test ./...");
  assert.equal(getGoCheckCommand("lint"), "go vet ./...");
  assert.equal(getGoCheckCommand("format"), null);
  assert.equal(getGoCheckCommand("build"), "go build ./...");
});

void test("getSwiftCheckCommand returns appropriate commands for Swift", () => {
  assert.equal(getSwiftCheckCommand("typecheck"), null);
  assert.equal(getSwiftCheckCommand("test"), "swift test");
  assert.equal(getSwiftCheckCommand("lint"), null);
  assert.equal(getSwiftCheckCommand("format"), "swiftformat --lint .");
  assert.equal(getSwiftCheckCommand("build"), "swift build");
});

void test("getCheckCommand returns null for null project type", () => {
  const result = getCheckCommand(null, "test");
  assert.equal(result, null);
});

void test("getCheckCommand returns Node.js commands for nodejs projects", () => {
  const scripts = { test: "jest" };
  assert.equal(getCheckCommand("nodejs", "test", scripts), "npm run test");
});

void test("getCheckCommand returns Rust commands for rust projects", () => {
  assert.equal(getCheckCommand("rust", "test"), "cargo test");
});

void test("getCheckCommand returns Python commands for python projects", () => {
  assert.equal(getCheckCommand("python", "test"), "pytest");
});

void test("getCheckCommand returns Go commands for go projects", () => {
  assert.equal(getCheckCommand("go", "test"), "go test ./...");
});

void test("getCheckCommand returns Swift commands for swift projects", () => {
  assert.equal(getCheckCommand("swift", "test"), "swift test");
});
