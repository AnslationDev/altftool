import assert from "node:assert/strict";
import test from "node:test";

import { isQuarantinedRoute } from "./quarantinedRoutePolicy.js";

test("unsourced product families and every nested route stay quarantined", () => {
  for (const prefix of [
    "/ai-explore",
    "/animalhub",
    "/top3",
    "/top8",
    "/top11",
    "/tradeon",
  ]) {
    assert.equal(isQuarantinedRoute(prefix), true, prefix);
    assert.equal(isQuarantinedRoute(`${prefix}/sample`), true, `${prefix}/sample`);
  }
});

test("quarantine prefixes do not capture similarly named or unrelated routes", () => {
  assert.equal(isQuarantinedRoute("/top30"), false);
  assert.equal(isQuarantinedRoute("/top3-preview"), false);
  assert.equal(isQuarantinedRoute("/tools/all/top3"), false);
  assert.equal(isQuarantinedRoute("/"), false);
});
