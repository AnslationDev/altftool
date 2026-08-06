import assert from "node:assert/strict";
import test from "node:test";

import {
  computeCprTiming,
  cprPhaseAt,
  cprSessionMetricsAt,
} from "./lib.js";

test("a pacing edit preserves the monotonic rescuer-swap countdown", () => {
  const initialTiming = computeCprTiming({
    bpm: 100,
    scenarioId: "adult",
    breathPauseSeconds: 6,
    switchMinutes: 2,
  });
  const revisedTiming = computeCprTiming({
    bpm: 120,
    scenarioId: "adult",
    breathPauseSeconds: 6,
    switchMinutes: 2,
  });
  const beforeEdit = cprPhaseAt(90, initialTiming);
  const firstRebasedSegment = cprPhaseAt(0.5, revisedTiming);
  const delivered = beforeEdit.totalCompressions + firstRebasedSegment.totalCompressions;
  const session = cprSessionMetricsAt(90.5, revisedTiming, delivered);

  assert.equal(firstRebasedSegment.secondsToSwitch, 119.5);
  assert.equal(session.secondsToSwitch, 29.5);
  assert.notEqual(session.averageRate, null);
});
