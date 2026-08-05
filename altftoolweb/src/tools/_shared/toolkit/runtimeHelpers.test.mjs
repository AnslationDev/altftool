import assert from "node:assert/strict";
import test from "node:test";

import { createSeededRandom } from "./runtimeHelpers.js";

function sequence(seed, length = 8) {
  const random = createSeededRandom(seed);
  return Array.from({ length }, () => random());
}

test("seeded random returns the same sequence for the same regenerate seed", () => {
  assert.deepEqual(sequence(42), sequence(42));
});

test("incrementing the regenerate seed produces a different sequence", () => {
  assert.notDeepEqual(sequence(42), sequence(43));
});

test("seeded random values stay in the Math.random interval", () => {
  for (const value of sequence(7, 100)) {
    assert.ok(value >= 0 && value < 1);
  }
});
