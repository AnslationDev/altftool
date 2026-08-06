import assert from "node:assert/strict";
import test from "node:test";

import { transformEnclosedText } from "./lib.js";

test("supplementary-plane enclosed letters use complete Unicode code points", () => {
  assert.deepEqual(
    [...transformEnclosedText("az", "filled")].map((character) => character.codePointAt(0)),
    [0x1f150, 0x1f169],
  );
  assert.deepEqual(
    [...transformEnclosedText("az", "negative-squared")].map((character) =>
      character.codePointAt(0),
    ),
    [0x1f170, 0x1f189],
  );
  assert.deepEqual(
    [...transformEnclosedText("az", "parenthesized")].map((character) =>
      character.codePointAt(0),
    ),
    [0x1f110, 0x1f129],
  );
});

test("case and digit coverage matches each style's published behavior", () => {
  assert.equal(transformEnclosedText("Aa 10!", "circled"), "Ⓐⓐ ①⓪!");
  assert.equal(
    transformEnclosedText("a1", "negative-squared"),
    `${String.fromCodePoint(0x1f170)}1`,
  );
  assert.equal(
    transformEnclosedText("a10", "parenthesized"),
    `${String.fromCodePoint(0x1f110)}⑴0`,
  );
});
