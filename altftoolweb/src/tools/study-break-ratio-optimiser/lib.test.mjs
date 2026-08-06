import assert from "node:assert/strict";
import test from "node:test";

import { buildBreakPlan, pickProtocol } from "./lib.js";

test("custom work blocks never round above the stated focus span", () => {
  const protocol = pickProtocol(24.9);
  const plan = buildBreakPlan({ focusSpanMinutes: 24.9, totalMinutes: 90 });

  assert.equal(protocol.id, "custom");
  assert.equal(protocol.workMinutes, 24);
  assert.equal(plan.workMinutes, 24);
  assert.equal(
    plan.segments.filter((segment) => segment.type === "work").every((segment) => segment.minutes <= 24.9),
    true,
  );
});

test("an exact protocol boundary still selects the sourced protocol", () => {
  assert.equal(pickProtocol(25).id, "pomodoro");
});
