import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { loadConfig, validateConfig, mergeWithDefaults, type VerifyConfig } from "../src/config.js";

async function createTempDir(): Promise<string> {
  const dir = join(
    tmpdir(),
    `verify-config-test-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
  await mkdir(dir, { recursive: true });
  return dir;
}

void test("loadConfig returns null when .verifyrc.json does not exist", async () => {
  const tempDir = await createTempDir();
  try {
    const config = await loadConfig(tempDir);
    assert.strictEqual(config, null);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

void test("loadConfig loads and parses valid config file", async () => {
  const tempDir = await createTempDir();
  try {
    const validConfig: VerifyConfig = {
      commands: {
        nodejs: {
          test: "npm run test:ci",
          lint: "npm run lint:strict",
        },
      },
      parallel: false,
    };
    await writeFile(join(tempDir, ".verifyrc.json"), JSON.stringify(validConfig, null, 2));

    const config = await loadConfig(tempDir);
    assert.deepStrictEqual(config, validConfig);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

void test("loadConfig throws error for invalid JSON", async () => {
  const tempDir = await createTempDir();
  try {
    await writeFile(join(tempDir, ".verifyrc.json"), "{ invalid json }");

    await assert.rejects(async () => loadConfig(tempDir), /Invalid JSON/);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

void test("validateConfig returns valid config with all fields", () => {
  const input = {
    commands: {
      nodejs: { test: "npm test" },
      rust: { build: "cargo build --release" },
    },
    parallel: true,
  };

  const result = validateConfig(input);
  assert.deepStrictEqual(result, input);
});

void test("validateConfig returns valid config with only commands", () => {
  const input = {
    commands: {
      python: { lint: "ruff check ." },
    },
  };

  const result = validateConfig(input);
  assert.deepStrictEqual(result, input);
});

void test("validateConfig returns valid config with only parallel flag", () => {
  const input = { parallel: false };

  const result = validateConfig(input);
  assert.deepStrictEqual(result, input);
});

void test("validateConfig throws error for null input", () => {
  assert.throws(() => validateConfig(null), /Config must be an object/);
});

void test("validateConfig throws error for invalid commands type", () => {
  const input = { commands: "not an object" };

  assert.throws(() => validateConfig(input), /Config field 'commands' must be an object/);
});

void test("validateConfig throws error for invalid parallel type", () => {
  const input = { parallel: "yes" };

  assert.throws(() => validateConfig(input), /Config field 'parallel' must be a boolean/);
});

void test("validateConfig allows unknown top-level properties for extensibility", () => {
  const input = { unknownProperty: true, parallel: true };

  // Unknown properties are allowed for forward compatibility
  const result = validateConfig(input);
  assert.strictEqual(result.parallel, true);
});

void test("validateConfig throws error for invalid check type commands", () => {
  const input = {
    commands: {
      nodejs: { invalidCheck: "npm test" },
    },
  };

  assert.throws(() => validateConfig(input), /Invalid check type/);
});

void test("mergeWithDefaults uses custom command when specified in config", () => {
  const config: VerifyConfig = {
    commands: {
      nodejs: {
        test: "npm run test:ci",
      },
    },
  };

  const result = mergeWithDefaults("nodejs", "test", config, {});
  assert.strictEqual(result, "npm run test:ci");
});

void test("mergeWithDefaults falls back to default when config has no override", () => {
  const config: VerifyConfig = {};
  const scripts = { test: "jest" };

  const result = mergeWithDefaults("nodejs", "test", config, scripts);
  assert.strictEqual(result, "npm run test");
});

void test("mergeWithDefaults falls back to default when config is null", () => {
  const scripts = { test: "jest" };

  const result = mergeWithDefaults("nodejs", "test", null, scripts);
  assert.strictEqual(result, "npm run test");
});

void test("mergeWithDefaults returns null for unsupported language/check combination", () => {
  const config: VerifyConfig = {};

  // Go doesn't have a format command
  const result = mergeWithDefaults("go", "format", config, {});
  assert.strictEqual(result, null);
});

void test("mergeWithDefaults uses language-specific custom command for non-nodejs projects", () => {
  const config: VerifyConfig = {
    commands: {
      rust: {
        test: "cargo test --release",
      },
    },
  };

  const result = mergeWithDefaults("rust", "test", config, {});
  assert.strictEqual(result, "cargo test --release");
});

void test("mergeWithDefaults handles partial config per language - uses custom when available", () => {
  const config: VerifyConfig = {
    commands: {
      nodejs: {
        lint: "npm run lint:strict",
        // test not specified
      },
    },
  };
  const scripts = { test: "jest", lint: "eslint ." };

  const lintResult = mergeWithDefaults("nodejs", "lint", config, scripts);
  const testResult = mergeWithDefaults("nodejs", "test", config, scripts);

  assert.strictEqual(lintResult, "npm run lint:strict");
  assert.strictEqual(testResult, "npm run test");
});

void test("mergeWithDefaults correctly merges for python with custom lint command", () => {
  const config: VerifyConfig = {
    commands: {
      python: {
        lint: "pylint .",
        typecheck: null, // explicitly disabled
      },
    },
  };

  const lintResult = mergeWithDefaults("python", "lint", config, {});
  const typecheckResult = mergeWithDefaults("python", "typecheck", config, {});
  const testResult = mergeWithDefaults("python", "test", config, {});

  assert.strictEqual(lintResult, "pylint .");
  assert.strictEqual(typecheckResult, null);
  assert.strictEqual(testResult, "pytest"); // default
});
