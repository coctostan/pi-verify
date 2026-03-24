import test from "node:test";
import assert from "node:assert/strict";
import { buildHelpText, parseSubcommand } from "../src/commands.js";
import { EXTENSION_COMMAND } from "../src/constants.js";

void test("parseSubcommand splits name and rest", () => {
  assert.deepEqual(parseSubcommand("set-label shipping-ready"), {
    name: "set-label",
    rest: "shipping-ready",
  });
});

void test("parseSubcommand handles single word", () => {
  assert.deepEqual(parseSubcommand("all"), { name: "all", rest: "" });
});

void test("parseSubcommand handles empty input", () => {
  assert.deepEqual(parseSubcommand(""), { name: "", rest: "" });
  assert.deepEqual(parseSubcommand("  "), { name: "", rest: "" });
});

void test("parseSubcommand lowercases name", () => {
  assert.deepEqual(parseSubcommand("ALL"), { name: "all", rest: "" });
  assert.deepEqual(parseSubcommand("Quick Check"), { name: "quick", rest: "Check" });
});

void test("buildHelpText includes command name", () => {
  const help = buildHelpText();
  assert.match(help, new RegExp(`/${EXTENSION_COMMAND} all`));
  assert.match(help, new RegExp(`/${EXTENSION_COMMAND} test`));
  assert.match(help, new RegExp(`/${EXTENSION_COMMAND} lint`));
  assert.match(help, new RegExp(`/${EXTENSION_COMMAND} quick`));
});
