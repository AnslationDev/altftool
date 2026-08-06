import assert from "node:assert/strict";
import test from "node:test";

import { planKeyRotation } from "./lib.js";

test("an overdue rotation keeps the compliance due date but schedules cutover from today", () => {
  const result = planKeyRotation({
    lastRotationDate: "2026-01-01",
    rotationPeriodDays: 90,
    overlapDays: 7,
    noticeDays: 14,
    keyCount: 3,
    today: "2026-08-06",
  });

  assert.equal(result.overdue, true);
  assert.equal(result.dueDate, "2026-04-01");
  assert.equal(result.notifyDate, "2026-08-06");
  assert.equal(result.createDate, "2026-08-06");
  assert.equal(result.disableDate, "2026-08-13");
  assert.equal(result.deleteDate, "2026-08-20");
  assert.deepEqual(result.steps.map((step) => step.date), [
    "2026-08-06",
    "2026-08-06",
    "2026-08-06",
    "2026-08-13",
    "2026-08-20",
  ]);
  assert.match(result.steps[0].detail, /immediately/i);
});

test("a future rotation keeps notice, overlap and quarantine anchored to its due date", () => {
  const result = planKeyRotation({
    lastRotationDate: "2026-07-01",
    rotationPeriodDays: 90,
    overlapDays: 7,
    noticeDays: 14,
    keyCount: 1,
    today: "2026-08-06",
  });

  assert.equal(result.overdue, false);
  assert.equal(result.dueDate, "2026-09-29");
  assert.equal(result.notifyDate, "2026-09-15");
  assert.equal(result.createDate, "2026-09-22");
  assert.equal(result.disableDate, "2026-09-29");
  assert.equal(result.deleteDate, "2026-10-06");
});
