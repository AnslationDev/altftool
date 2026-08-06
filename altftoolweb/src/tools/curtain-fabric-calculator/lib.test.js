import assert from "node:assert/strict";
import test from "node:test";

import { calculateCurtainFabric } from "./lib.js";

const base = {
  trackWidth: 200,
  finishedDrop: 220,
  headingId: "pencil",
  fabricWidthCm: 137,
  patternRepeatCm: 0,
  hemAllowanceCm: 20,
  returnCm: 8,
  overlapCm: 10,
  fabricPricePerMetre: 0,
  liningPricePerMetre: 0,
};

test("an explicitly enabled but blank custom fullness is rejected", () => {
  assert.match(
    calculateCurtainFabric({ ...base, fullnessOverride: NaN }).error,
    /custom fullness/iu,
  );
  assert.equal(calculateCurtainFabric(base).fullness, 2.5);
});

test("heading tape follows joined usable widths after selvedge turnings", () => {
  const result = calculateCurtainFabric(base);
  assert.equal(result.drops, 5);
  assert.equal(result.usableWidthCm, 133);
  assert.equal(result.tapeMetres, 6.65);
});
