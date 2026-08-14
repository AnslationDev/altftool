import assert from "node:assert/strict";
import test from "node:test";

import { checkSafeWord } from "./lib.js";

test("surrounding punctuation cannot disguise weak or digits-only spoken tokens", () => {
  for (const value of [
    "password! orange",
    "1234! orange",
    "secret, mango",
    "violet 5678!",
    "ｐａｓｓｗｏｒｄ！ orange",
  ]) {
    assert.equal(checkSafeWord(value).ok, false, value);
    assert.equal(checkSafeWord(value).level, "weak", value);
  }
});

test("punctuation around unrelated words does not weaken a strong phrase", () => {
  const result = checkSafeWord("orange! mango?");
  assert.equal(result.ok, true);
  assert.equal(result.level, "strong");
});
