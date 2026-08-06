import assert from "node:assert/strict";
import test from "node:test";

import { humidHydrationPlan } from "./lib.js";

const base = {
  sex: "male",
  age: 30,
  weightKg: 70,
  tempC: 40,
  humidityPct: 80,
  intensity: "moderate",
  exerciseHours: 1,
  sweatType: "typical",
  wakingHours: 16,
};

test("humid-heat multiplier applies only to exercise during exposed hours", () => {
  const indoor = humidHydrationPlan({ ...base, outdoorHours: 0 });
  const outdoor = humidHydrationPlan({ ...base, outdoorHours: 1 });

  assert.equal(indoor.indoorExerciseHours, 1);
  assert.equal(indoor.heatedExerciseHours, 0);
  assert.equal(indoor.exerciseSweatL, 0.9);
  assert.ok(outdoor.exerciseSweatL > indoor.exerciseSweatL);
});

test("extreme combinations are explicitly marked outside the published chart", () => {
  const result = humidHydrationPlan({ ...base, tempC: 55, humidityPct: 100, outdoorHours: 1 });
  assert.equal(result.heatIndexOutOfRange, true);
});
