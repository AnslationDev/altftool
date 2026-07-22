import assert from "node:assert/strict";
import test from "node:test";
import {
  MAX_ITEMS,
  fillPattern,
  formatBytes,
  generateBatch,
  outputBytes,
  toCsv,
  toJson,
} from "./batchEngine.js";

/* ------------------------------ pattern tokens ------------------------------ */

test("zero-pad token pads the sequence number to the brace width", () => {
  assert.equal(fillPattern("ALT-{00000}", 7, "sequential"), "ALT-00007");
  assert.equal(fillPattern("ALT-{000}", 4321, "sequential"), "ALT-4321");
});

test("{N} inserts the plain sequence number", () => {
  assert.equal(fillPattern("item-{N}", 42, "sequential"), "item-42");
});

test("{YYYY} inserts the year", () => {
  assert.equal(fillPattern("INV-{YYYY}-{000}", 5, "sequential", 2026), "INV-2026-005");
});

test("random char tokens draw from the right alphabets", () => {
  for (let i = 0; i < 50; i += 1) {
    assert.match(fillPattern("{A}", 0, "sequential"), /^[A-Z]$/);
    assert.match(fillPattern("{a}", 0, "sequential"), /^[a-z]$/);
    assert.match(fillPattern("{R}", 0, "sequential"), /^[A-Za-z0-9]$/);
  }
});

test("unknown tokens stay visible instead of vanishing", () => {
  assert.equal(fillPattern("x-{WAT}-{N}", 3, "sequential"), "x-{WAT}-3");
});

test("random mode turns numeric tokens into random digits of same width", () => {
  for (let i = 0; i < 20; i += 1) {
    assert.match(fillPattern("{0000}", 9, "random"), /^\d{4}$/);
    assert.match(fillPattern("{N}", 9, "random"), /^\d$/);
  }
});

/* -------------------------------- generation -------------------------------- */

test("sequential respects start / end / step", () => {
  const { items } = generateBatch({
    type: "sequential", pattern: "A{00}", start: 1, end: 9, step: 3,
  });
  assert.deepEqual(items, ["A01", "A04", "A07"]);
});

test("sequential caps at MAX_ITEMS and reports it", () => {
  const { items, capped } = generateBatch({
    type: "sequential", pattern: "{N}", start: 1, end: 50000, step: 1,
  });
  assert.equal(items.length, MAX_ITEMS);
  assert.equal(capped, true);
});

test("text mode makes `count` items starting at `start`", () => {
  const { items } = generateBatch({
    type: "text", pattern: "User_{0000}", start: 1, count: 3,
  });
  assert.deepEqual(items, ["User_0001", "User_0002", "User_0003"]);
});

test("custom list splits lines, trims and drops blanks", () => {
  const { items } = generateBatch({
    type: "custom", customList: " alpha \n\n beta\r\ngamma \n",
  });
  assert.deepEqual(items, ["alpha", "beta", "gamma"]);
});

test("prefix / suffix / uppercase transforms apply in order", () => {
  const { items } = generateBatch({
    type: "sequential", pattern: "id{N}", start: 2, end: 2, step: 1,
    prefix: "pre-", suffix: ".txt", uppercase: true,
  });
  assert.deepEqual(items, ["PRE-ID2.TXT"]);
});

test("uniqueOnly dedupes a custom list", () => {
  const { items } = generateBatch({
    type: "custom", customList: "a\nb\na\nb\nc", uniqueOnly: true,
  });
  assert.deepEqual(items, ["a", "b", "c"]);
});

test("random mode with uniqueOnly refills collisions up to the count", () => {
  const { items } = generateBatch({
    type: "random", pattern: "{R}{R}{R}{R}{R}{R}", count: 200, uniqueOnly: true,
  });
  assert.equal(items.length, 200);
  assert.equal(new Set(items).size, 200);
});

test("empty pattern still produces rows (transforms only)", () => {
  const { items } = generateBatch({
    type: "sequential", pattern: "", start: 1, end: 2, step: 1, prefix: "p",
  });
  assert.deepEqual(items, ["p", "p"]);
});

/* --------------------------------- exports ---------------------------------- */

test("outputBytes measures UTF-8 bytes of the joined text", () => {
  assert.equal(outputBytes(["ab", "c"]), 4); // "ab\nc"
  assert.equal(outputBytes([]), 0);
});

test("formatBytes picks sensible units", () => {
  assert.equal(formatBytes(512), "512 B");
  assert.equal(formatBytes(2048), "2.0 KB");
  assert.equal(formatBytes(3 * 1024 * 1024), "3.00 MB");
});

test("toCsv quotes values containing commas or quotes", () => {
  const csv = toCsv(['pl,ain', 'say "hi"']);
  assert.equal(csv, 'index,value\n1,"pl,ain"\n2,"say ""hi"""');
});

test("toJson emits a valid array", () => {
  assert.deepEqual(JSON.parse(toJson(["x", "y"])), ["x", "y"]);
});
