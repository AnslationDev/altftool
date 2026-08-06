import assert from "node:assert/strict";
import test from "node:test";

import { PATTERNS, compileRegex, selfTest, testInput } from "./lib.js";

for (const pattern of PATTERNS) {
  test(`${pattern.id}: pattern compiles`, () => {
    const compiled = compileRegex(pattern.source, pattern.flags);
    assert.equal(compiled.error, undefined, compiled.error);
  });

  test(`${pattern.id}: matches its documented "shouldMatch" examples and rejects its "shouldNotMatch" examples`, () => {
    const result = selfTest(pattern);
    assert.equal(
      result.passed,
      true,
      `selfTest failures for ${pattern.id}: ${JSON.stringify(result.failures)}`,
    );
    assert.equal(result.total, pattern.shouldMatch.length + pattern.shouldNotMatch.length);
  });
}

test("testInput surfaces a friendly error instead of throwing on a broken pattern", () => {
  const result = testInput({ source: "(", flags: "", input: "anything" });
  assert.match(result.error, /Invalid regular expression/);
});
