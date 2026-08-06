import assert from "node:assert/strict";
import test from "node:test";

import {
  METER_EV_MAX,
  METER_EV_MIN,
  clampExposureMeterValue,
  exposureMeterPercent,
} from "./lib.js";

test("exposure meter clamps ARIA values and visual percentage to the declared range", () => {
  assert.equal(clampExposureMeterValue(-20), METER_EV_MIN);
  assert.equal(clampExposureMeterValue(30), METER_EV_MAX);
  assert.equal(clampExposureMeterValue(7), 7);
  assert.equal(exposureMeterPercent(-20), 0);
  assert.equal(exposureMeterPercent(30), 100);
  assert.equal(exposureMeterPercent(7), 50);
});
