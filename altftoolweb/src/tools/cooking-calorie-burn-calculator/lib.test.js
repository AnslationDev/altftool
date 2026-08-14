import assert from "node:assert/strict";
import test from "node:test";

import { computeCookingCalories } from "./lib.js";

test("pound bounds advertise only values accepted by the kilogram limits", () => {
  const below = computeCookingCalories({
    weight: 44,
    weightUnit: "lb",
    minutes: { prep: 30 },
  });
  assert.match(below.error, /between 45 and 661 lb/iu);
  assert.equal(
    computeCookingCalories({
      weight: 45,
      weightUnit: "lb",
      minutes: { prep: 30 },
    }).error,
    undefined,
  );
  assert.match(
    computeCookingCalories({
      weight: 662,
      weightUnit: "lb",
      minutes: { prep: 30 },
    }).error,
    /between 45 and 661 lb/iu,
  );
});
