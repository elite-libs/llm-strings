import assert from "node:assert/strict";
import { createRequire } from "node:module";

const connection = "llm://openai/gpt-6.1-sol?max=1024&effort=low";
const require = createRequire(import.meta.url);

for (const subpath of [
  "",
  "/parse",
  "/normalize",
  "/validate",
  "/ai-sdk",
  "/providers",
  "/model-catalog",
  "/safe",
]) {
  const specifier = `llm-strings${subpath}`;
  assert.ok(Object.keys(await import(specifier)).length > 0, specifier);
  assert.ok(Object.keys(require(specifier)).length > 0, specifier);
}

const esm = await import("llm-strings");
const esmParse = await import("llm-strings/parse");
const esmNormalize = await import("llm-strings/normalize");
const esmValidate = await import("llm-strings/validate");

assert.equal(esm.parse, esmParse.parse);
assert.equal(esm.parse(connection).model, "gpt-6.1-sol");
assert.deepEqual(esmNormalize.normalize(esm.parse(connection)).config.params, {
  max_completion_tokens: "1024",
  reasoning_effort: "low",
});
assert.deepEqual(esmValidate.validate(connection), []);

const cjs = require("llm-strings");
const cjsNormalize = require("llm-strings/normalize");
const cjsValidate = require("llm-strings/validate");

assert.equal(cjs.parse(connection).model, "gpt-6.1-sol");
assert.deepEqual(cjsNormalize.normalize(cjs.parse(connection)).config.params, {
  max_completion_tokens: "1024",
  reasoning_effort: "low",
});
assert.deepEqual(cjsValidate.validate(connection), []);

console.log(`Runtime exports work on Node ${process.version}`);
