import assert from "node:assert/strict";
import test from "node:test";

import {
  buildRedactionPlan,
  computeSamplingPlan,
} from "./lib.js";

test("sampling reserves budget for non-overlapping tail matches", () => {
  const plan = computeSamplingPlan({
    requestsPerDay: 1000,
    targetTracesPerDay: 100,
    retentionDays: 7,
    avgTraceKb: 8,
    tailKeepRatePct: 5,
  });

  assert.equal(plan.error, undefined);
  assert.equal(plan.sampledPerDay, 53);
  assert.equal(plan.tailKeptPerDay, 47);
  assert.equal(plan.capturedPerDay, 100);
  assert.equal(plan.overBudget, false);
});

test("sampling never counts more traces than actual runs", () => {
  const keepAll = computeSamplingPlan({
    requestsPerDay: 1000,
    targetTracesPerDay: 1000,
    retentionDays: 1,
    tailKeepRatePct: 100,
  });
  assert.equal(keepAll.capturedPerDay, 1000);
  assert.equal(keepAll.tailKeptPerDay, 0);

  const constrained = computeSamplingPlan({
    requestsPerDay: 1000,
    targetTracesPerDay: 10,
    retentionDays: 1,
    tailKeepRatePct: 100,
  });
  assert.equal(constrained.capturedPerDay, 1000);
  assert.equal(constrained.overBudget, true);
});

test("sampling rejects impossible tail percentages", () => {
  const plan = computeSamplingPlan({
    requestsPerDay: 100,
    targetTracesPerDay: 10,
    retentionDays: 1,
    tailKeepRatePct: 101,
  });
  assert.match(plan.error, /between 0 and 100 percent/i);
});

test("all-never-log redaction has no fabricated retention window", () => {
  const plan = buildRedactionPlan(["card", "secret"]);
  assert.equal(plan.empty, false);
  assert.equal(plan.strictestRetentionDays, null);
  assert.equal(plan.neverLog.length, 2);
});
