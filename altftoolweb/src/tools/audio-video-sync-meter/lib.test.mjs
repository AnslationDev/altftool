import assert from "node:assert/strict";
import test from "node:test";

import {
  averageOffsets,
  correctionCommand,
  gradeOffset,
  measureSync,
  parseTimeToSeconds,
} from "./lib.js";

test("measures signed slate offset using one-based frame numbers", () => {
  const result = measureSync({
    flashFrame: 26,
    fps: 25,
    audioSeconds: 1.04,
  });

  assert.ok(Math.abs(result.offsetMs - 40) < 1e-9);
  assert.equal(result.direction, "audio late");
  assert.ok(Math.abs(result.offsetFrames - 1) < 1e-9);
});

test("grades lead and lag against asymmetric standards", () => {
  assert.equal(gradeOffset(-20).standards[0].pass, false);
  assert.equal(gradeOffset(20).standards[0].pass, true);
});

test("builds the inverse audio correction and stable aggregate", () => {
  assert.equal(correctionCommand(125).audioOffsetSeconds, -0.125);
  assert.deepEqual(averageOffsets([10, 20, 30]), {
    count: 3,
    meanMs: 20,
    stdDevMs: 10,
    minMs: 10,
    maxMs: 30,
    rangeMs: 20,
  });
  assert.equal(parseTimeToSeconds("00:01:02.500").seconds, 62.5);
});
