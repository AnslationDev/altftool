import test from "node:test";
import assert from "node:assert/strict";

import { smoothWeighIns } from "./lib.js";

test("weigh-in summaries retain legacy public fields", () => {
  const result = smoothWeighIns(
    [
      { date: "2026-07-01", weight: 80 },
      { date: "2026-07-02", weight: 79.8 },
      { date: "2026-07-03", weight: 79.6 },
    ],
    { window: 2, units: "kg" },
  );

  assert.equal(result.error, undefined);
  assert.equal(result.firstAverage, 80);
  assert.equal(result.lastAverage, 79.7);
  assert.equal(result.averageChange, -0.3);
  assert.equal(result.slopePerDay, -0.2);
});
