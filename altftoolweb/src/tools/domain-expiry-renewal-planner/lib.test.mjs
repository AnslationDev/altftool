import assert from "node:assert/strict";
import test from "node:test";

import { planDomainRenewal } from "./lib.js";

test("dropped-domain guidance presents neutral recovery options", () => {
  const plan = planDomainRenewal({
    expiryDate: "2026-01-01",
    today: "2026-04-01",
    graceDays: 30,
  });
  const guidance = plan.actions.join(" ");

  assert.equal(plan.phase, "dropped");
  assert.doesNotMatch(guidance, /only (?:route|path)/i);
  assert.match(guidance, /purchase inquiry|broker/i);
  assert.match(guidance, /qualified legal advice/i);
});
