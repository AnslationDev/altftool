import assert from "node:assert/strict";
import test from "node:test";

import spec from "./spec.js";

const matches = (pattern, input) =>
  spec.compute({ pattern, input_string: input, case_insensitive: false }).rows[0][1] === "yes";

test("single star and question mark stay within one path segment", () => {
  assert.equal(matches("src/*.ts", "src/index.ts"), true);
  assert.equal(matches("src/*.ts", "src/lib/index.ts"), false);
  assert.equal(matches("src/?.ts", "src/a.ts"), true);
  assert.equal(matches("src/?.ts", "src/ab.ts"), false);
});

test("globstar directory syntax matches zero or more directory levels", () => {
  assert.equal(matches("src/**/*.ts", "src/index.ts"), true);
  assert.equal(matches("src/**/*.ts", "src/lib/index.ts"), true);
  assert.equal(matches("src/**/*.ts", "src/lib/deep/index.ts"), true);
  assert.equal(matches("src/**/*.ts", "test/index.ts"), false);
});

test("empty pattern keeps the input prompt instead of compiling an empty regex", () => {
  assert.deepEqual(spec.compute({ pattern: "", input_string: "" }), {
    result: "—",
    caption: "Enter a glob pattern",
  });
});
