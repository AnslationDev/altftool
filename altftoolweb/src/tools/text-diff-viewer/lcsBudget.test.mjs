import assert from "node:assert/strict";
import test from "node:test";

import {
  MAX_LCS_CELLS,
  ROW_CHANGED,
  SEG_ADD,
  SEG_REMOVE,
  buildSideBySide,
  diffWords,
  lcsOps,
  toMarkdownTable,
} from "./lib.js";

test("LCS falls back before allocating a table beyond the shared cell budget", () => {
  const side = Math.floor(Math.sqrt(MAX_LCS_CELLS));
  const result = lcsOps(Array(side).fill("left"), Array(side).fill("right"));

  assert.equal(result.exact, false);
  assert.equal(result.lcs, 0);
  assert.equal(result.ops.length, side * 2);
});

test("oversized single-line comparisons use bounded full-line rendering", () => {
  const common = Array.from({ length: 1_600 }, (_, index) => `word-${index}`);
  const left = [...common, "old-ending"].join(" ");
  const right = [...common, "new-ending"].join(" ");
  const result = buildSideBySide(left, right);

  assert.equal(result.error, undefined);
  assert.equal(result.rows.length, 1);
  assert.equal(result.rows[0].type, ROW_CHANGED);
  assert.deepEqual(result.rows[0].leftSegments, [{ type: SEG_REMOVE, text: left }]);
  assert.deepEqual(result.rows[0].rightSegments, [{ type: SEG_ADD, text: right }]);
  assert.equal(result.sharedWords, 1_600);
  assert.equal(result.wordsRemoved, 1);
  assert.equal(result.wordsAdded, 1);
  assert.equal(result.statsExact, false);
  assert.equal(result.wordHighlightsExact, false);
});

test("two interior changes in an oversized line are visibly labelled as estimates", () => {
  const original = Array.from({ length: 1_601 }, (_, index) => `word-${index}`);
  const revised = [...original];
  revised[400] = "first-change";
  revised[1_200] = "second-change";

  const result = buildSideBySide(original.join(" "), revised.join(" "));
  const exported = toMarkdownTable(result);

  assert.equal(result.statsExact, false);
  assert.equal(result.wordHighlightsExact, false);
  assert.match(exported, /Approximate similarity/);
  assert.match(exported, /Bounded mode:/);
});

test("word similarity counts real words rather than whitespace tokens", () => {
  const words = diffWords("alpha beta", "alpha gamma");
  const result = buildSideBySide("alpha beta", "alpha gamma");

  assert.equal(words.exact, true);
  assert.equal(words.shared, 1);
  assert.equal(result.similarityPct, 50);
});
