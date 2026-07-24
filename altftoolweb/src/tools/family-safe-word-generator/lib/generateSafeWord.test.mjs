import assert from "node:assert/strict";
import test from "node:test";

import {
  SAFE_WORDS,
  buildFamilyProtocol,
  estimateEntropyBits,
  generateFamilySafeWord,
  uniformIndex,
} from "./generateSafeWord.mjs";

function sequence(values) {
  let index = 0;
  return () => values[index++ % values.length];
}

test("generates the requested shape from an injectable source", () => {
  const result = generateFamilySafeWord({
    wordCount: 3,
    digitCount: 2,
    randomUint32: sequence([0, 1, 2, 3, 4]),
  });

  assert.equal(result.phrase, `${SAFE_WORDS[0]}-${SAFE_WORDS[1]}-${SAFE_WORDS[2]}-34`);
  assert.equal(result.words.length, 3);
  assert.equal(result.digits, "34");
});

test("uniformIndex rejects values in the modulo-bias tail", () => {
  const random = sequence([0xffffffff, 7]);
  assert.equal(uniformIndex(10, random), 7);
});

test("entropy estimate grows with words and digits", () => {
  const shorter = estimateEntropyBits({ wordPoolSize: 64, wordCount: 3, digitCount: 0 });
  const longer = estimateEntropyBits({ wordPoolSize: 64, wordCount: 5, digitCount: 3 });
  assert.ok(longer > shorter);
  assert.ok(longer >= 39);
});

test("rejects an undersized word pool", () => {
  assert.throws(
    () =>
      generateFamilySafeWord({
        words: ["one", "two"],
        randomUint32: () => 0,
      }),
    /at least 32/i,
  );
});

test("protocol requires callback verification and rotation", () => {
  const protocol = buildFamilyProtocol("amber-river-123");
  assert.match(protocol.join(" "), /saved number/i);
  assert.match(protocol.join(" "), /replace/i);
});
