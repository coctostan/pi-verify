import test from "node:test";
import assert from "node:assert/strict";
import { detectWatchMode, supportsWatchMode, type WatchModeConfig } from "../src/verify.js";

void test("detectWatchMode returns true for --watch flag", () => {
  const result = detectWatchMode(["--watch"]);
  assert.equal(result.enabled, true);
  assert.equal(result.flags.includes("--watch"), true);
});

void test("detectWatchMode returns true for -w shorthand", () => {
  const result = detectWatchMode(["-w"]);
  assert.equal(result.enabled, true);
  assert.equal(result.flags.includes("-w"), true);
});

void test("detectWatchMode returns false without watch flags", () => {
  const result = detectWatchMode(["--reporter", "dot"]);
  assert.equal(result.enabled, false);
  assert.equal(result.flags.length, 0);
});

void test("supportsWatchMode returns true for Jest", () => {
  const config: WatchModeConfig = { framework: "jest" };
  assert.equal(supportsWatchMode(config), true);
});

void test("supportsWatchMode returns true for Vitest", () => {
  const config: WatchModeConfig = { framework: "vitest" };
  assert.equal(supportsWatchMode(config), true);
});

void test("supportsWatchMode returns false for node:test", () => {
  const config: WatchModeConfig = { framework: "node:test" };
  assert.equal(supportsWatchMode(config), false);
});

void test("detectWatchMode handles multiple flags", () => {
  const result = detectWatchMode(["--watch", "--reporter", "dot"]);
  assert.equal(result.enabled, true);
  assert.equal(result.flags.length, 1);
  assert.equal(result.flags[0], "--watch");
});

void test("detectWatchMode handles --watchAll", () => {
  const result = detectWatchMode(["--watchAll"]);
  assert.equal(result.enabled, true);
  assert.equal(result.flags.includes("--watchAll"), true);
});
