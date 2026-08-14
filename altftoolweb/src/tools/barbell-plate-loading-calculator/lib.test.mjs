import assert from "node:assert/strict";
import test from "node:test";

import {
  computePlateLoading,
  loadingLadder,
  nearestLoadableWeight,
} from "./lib.js";

const LIMITED_RACK = [
  { weight: 20, pairs: 1 },
  { weight: 15, pairs: 2 },
];

test("bounded loading finds an exact non-greedy combination", () => {
  const result = computePlateLoading({
    targetWeight: 80,
    barWeight: 20,
    inventory: LIMITED_RACK,
  });

  assert.equal(result.error, undefined);
  assert.equal(result.exact, true);
  assert.equal(result.achievedWeight, 80);
  assert.deepEqual(result.loading, [{ weight: 15, count: 2 }]);
});

test("compatibility helpers remain exported and use the exact loader", () => {
  const nearest = nearestLoadableWeight({
    targetWeight: 80,
    barWeight: 20,
    inventory: LIMITED_RACK,
  });
  assert.deepEqual(nearest, {
    weight: 80,
    exact: true,
    loading: [{ weight: 15, count: 2 }],
  });

  const ladder = loadingLadder({
    topWeight: 100,
    percentages: [80],
    barWeight: 20,
    inventory: LIMITED_RACK,
  });
  assert.equal(ladder.length, 1);
  assert.equal(ladder[0].loadable, 80);
  assert.equal(ladder[0].error, null);
});
