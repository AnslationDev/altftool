import assert from "node:assert/strict";
import test from "node:test";

import { boldLength, convertToBionic } from "./lib.js";

test("keeps a plain tail on multi-letter fixation words", () => {
  assert.equal(boldLength("reading", 0.5), 4);
  assert.equal(boldLength("go", 0.9), 1);
});

test("escapes pasted markup before producing preview HTML", () => {
  const result = convertToBionic({ text: "<script>alert('x')</script>" });

  assert.equal(result.error, undefined);
  assert.equal(result.html.includes("<script>"), false);
  assert.match(result.html, /&lt;/);
  assert.equal(result.wordCount, 4);
});

test("rejects empty input and invalid fixation controls", () => {
  assert.match(convertToBionic({ text: "" }).error, /some text/i);
  assert.match(convertToBionic({ text: "hello", level: 9 }).error, /1 to 5/i);
});
