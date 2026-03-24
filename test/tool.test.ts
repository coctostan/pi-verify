import test from "node:test";
import assert from "node:assert/strict";
import { parseSubcommand, buildHelpText } from "../src/commands.js";
import { detectProjectType, getCheckCommand } from "../src/verify.js";

void test("parseSubcommand extracts name and rest", () => {
  const result = parseSubcommand("all");
  assert.equal(result.name, "all");
  assert.equal(result.rest, "");
});

void test("parseSubcommand handles multiple words", () => {
  const result = parseSubcommand("test extra args");
  assert.equal(result.name, "test");
  assert.equal(result.rest, "extra args");
});

void test("buildHelpText contains all subcommands", () => {
  const help = buildHelpText();
  assert.match(help, /verify all/);
  assert.match(help, /verify test/);
  assert.match(help, /verify lint/);
  assert.match(help, /verify quick/);
});

void test("detectProjectType returns nodejs for package.json", async () => {
  const result = await detectProjectType(process.cwd());
  assert.equal(result, "nodejs");
});

void test("detectProjectType returns null for non-existent path", async () => {
  const result = await detectProjectType("/non/existent/path");
  assert.equal(result, null);
});

void test("getCheckCommand returns command for available scripts", () => {
  const scripts = { test: "node --test", lint: "eslint ." };
  assert.equal(getCheckCommand("test", scripts), "npm run test");
  assert.equal(getCheckCommand("lint", scripts), "npm run lint");
});

void test("getCheckCommand returns fallback for typecheck", () => {
  const scripts = {};
  assert.equal(getCheckCommand("typecheck", scripts), "npx tsc --noEmit");
});
