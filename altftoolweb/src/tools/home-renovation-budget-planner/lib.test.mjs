import test from "node:test";
import assert from "node:assert/strict";

import { planRenovationBudget } from "./lib.js";

test("renovation ledger reconciles visible rows through the grand total", () => {
  const result = planRenovationBudget({
    rooms: [
      { id: 1, name: "One", area: 1, ratePerSqft: 100.4 },
      { id: 2, name: "Two", area: 1, ratePerSqft: 100.4 },
    ],
    qualityTier: "standard",
    extras: 10.6,
    professionalFeesPct: 7.5,
    contingencyPct: 10,
    applyGst: true,
    gstRatePct: 18,
    monthsToStart: 6,
    existingSavings: 0,
    savingsReturn: 0,
  });

  assert.equal(result.error, undefined);
  assert.equal(result.worksTotal, result.rooms.reduce((sum, room) => sum + room.cost, 0));
  assert.equal(result.subtotal, result.worksTotal + result.extras);
  assert.equal(result.taxableValue, result.subtotal + result.fees + result.contingency);
  assert.equal(result.grandTotal, result.taxableValue + result.gst);
  assert.equal(result.grandTotal, 295);
});
