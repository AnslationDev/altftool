import assert from "node:assert/strict";
import test from "node:test";

import { computeApplianceStatus } from "./lib.js";

const base = {
  name: "Fridge",
  type: "fridge",
  purchaseIso: "2023-01-01",
};

test("consumer complaint deadline is anchored to the cause of action", () => {
  const status = computeApplianceStatus(
    { ...base, causeOfActionIso: "2025-01-31" },
    "2026-07-31",
  );

  assert.equal(status.claimDeadlineIso, "2027-01-31");
  assert.equal(status.daysToClaimDeadline, 184);
  assert.equal(status.claimWindowNote, null);
});

test("missing or future cause dates never invent a deadline from today", () => {
  const missing = computeApplianceStatus(base, "2026-07-31");
  const future = computeApplianceStatus(
    { ...base, causeOfActionIso: "2026-08-01" },
    "2026-07-31",
  );

  assert.equal(missing.claimDeadlineIso, null);
  assert.match(missing.claimWindowNote, /runs from then, not from today/i);
  assert.equal(future.claimDeadlineIso, null);
  assert.match(future.claimWindowNote, /cannot be in the future/i);
});

test("month arithmetic clamps a leap-day cause to February 28", () => {
  const status = computeApplianceStatus(
    { ...base, causeOfActionIso: "2024-02-29" },
    "2025-01-01",
  );
  assert.equal(status.claimDeadlineIso, "2026-02-28");
});
