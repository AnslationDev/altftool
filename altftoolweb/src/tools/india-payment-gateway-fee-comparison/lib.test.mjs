import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_MIX,
  GATEWAY_DEFAULTS,
  gatewayMonthlyCost,
  isZeroMdrRail,
} from "./lib.js";

test("zero-MDR classification remains public and detailed fee lines are retained", () => {
  assert.equal(isZeroMdrRail("upi"), true);
  assert.equal(isZeroMdrRail("cards"), false);

  const result = gatewayMonthlyCost({
    monthlyVolume: 100_000,
    averageTicket: 1_000,
    mix: DEFAULT_MIX,
    gateway: GATEWAY_DEFAULTS[0],
  });

  assert.equal(result.lines.length, 6);
  assert.equal(result.lines.find((line) => line.railId === "upi").fee, 0);
  assert.ok(result.lines.find((line) => line.railId === "cards").fee > 0);
});
