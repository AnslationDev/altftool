import assert from "node:assert/strict";
import test from "node:test";

import { computeParacetamolPlan } from "./lib.js";

test("four-dose daily cap applies even when spacing and milligrams allow more", () => {
  const result = computeParacetamolPlan({
    mode: "adult",
    dosesTaken: 1,
    intervalHours: 4,
    lastDoseTime: "08:00",
    mgPerDose: 500,
  });

  assert.equal(result.error, undefined);
  assert.equal(result.dosesLeftBySpacing, 5);
  assert.equal(result.dosesLeftByCount, 3);
  assert.equal(result.remainingDoses, 3);
  assert.match(result.limitingFactor, /4-dose daily limit/u);
});

test("countdown API remains available for existing consumers", () => {
  const result = computeParacetamolPlan({
    mode: "adult",
    dosesTaken: 1,
    intervalHours: 4,
    lastDoseTime: "08:00",
    mgPerDose: 500,
    nowMinutes: 9 * 60,
  });

  assert.equal(result.countdown.minutesUntilNext, 180);
  assert.equal(result.countdown.dueNow, false);
});

test("fractional dose counts are rejected instead of rounded", () => {
  const result = computeParacetamolPlan({
    mode: "adult",
    dosesTaken: 1.5,
    intervalHours: 4,
    lastDoseTime: "08:00",
    mgPerDose: 500,
  });

  assert.match(result.error, /whole number/u);
});

test("adult doses enforce the documented 500 to 1000 mg range", () => {
  const result = computeParacetamolPlan({
    mode: "adult",
    dosesTaken: 1,
    intervalHours: 4,
    lastDoseTime: "08:00",
    mgPerDose: 250,
  });

  assert.match(result.error, /adult dose should be between 500 and 1000 mg/u);
});

test("count-bound result does not invent an earliest rolling-window reset time", () => {
  const result = computeParacetamolPlan({
    mode: "adult",
    dosesTaken: 4,
    intervalHours: 4,
    lastDoseTime: "20:00",
    mgPerDose: 500,
  });

  assert.equal(result.remainingDoses, 0);
  assert.match(result.warnings[0], /cannot determine when the earliest older dose leaves/u);
});

test("a fifth dose is flagged even when the milligram ceiling is not exceeded", () => {
  const result = computeParacetamolPlan({
    mode: "adult",
    dosesTaken: 5,
    intervalHours: 4,
    lastDoseTime: "20:00",
    mgPerDose: 500,
  });

  assert.equal(result.mgOverLimit, false);
  assert.equal(result.countOverLimit, true);
  assert.equal(result.overLimit, true);
  assert.match(result.warnings[0], /above the standard maximum of 4/u);
});
