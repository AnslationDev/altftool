import assert from "node:assert/strict";
import test from "node:test";

import { computeEbsCost } from "./lib.js";

test("snapshotGb is one fleet-wide total and is not multiplied by volume count", () => {
  const one = computeEbsCost({
    volumeType: "gp3",
    sizeGb: 100,
    provisionedIops: 3000,
    throughputMbps: 125,
    volumeCount: 1,
    snapshotGb: 200,
  });
  const three = computeEbsCost({
    volumeType: "gp3",
    sizeGb: 100,
    provisionedIops: 3000,
    throughputMbps: 125,
    volumeCount: 3,
    snapshotGb: 200,
  });

  assert.equal(one.snapshotCost, 10);
  assert.equal(three.snapshotCost, 10);
  assert.equal(three.snapshotGbTotal, 200);
  assert.equal(three.perVolume, 8);
  assert.equal(three.total, 34);
});
