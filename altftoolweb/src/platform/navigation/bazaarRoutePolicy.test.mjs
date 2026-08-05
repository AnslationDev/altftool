import assert from "node:assert/strict";
import test from "node:test";
import { isBazaarRouteBlocked } from "./bazaarRoutePolicy.js";

test("Bazaar routes are blocked by default", () => {
  assert.equal(isBazaarRouteBlocked("/bazaar", null), true);
  assert.equal(isBazaarRouteBlocked("/bazaar/", null), true);
  assert.equal(isBazaarRouteBlocked("/bazaar/listing/sample", null), true);
});

test("Bazaar routes require exact explicit enablement", () => {
  assert.equal(isBazaarRouteBlocked("/bazaar", "true"), false);
  assert.equal(isBazaarRouteBlocked("/bazaar/listing/sample", "true"), false);
  assert.equal(isBazaarRouteBlocked("/bazaar", "TRUE"), true);
  assert.equal(isBazaarRouteBlocked("/bazaar", "1"), true);
});

test("Bazaar guard does not block similarly named or unrelated routes", () => {
  assert.equal(isBazaarRouteBlocked("/bazaar-preview", null), false);
  assert.equal(isBazaarRouteBlocked("/tools/all/bazaar", null), false);
  assert.equal(isBazaarRouteBlocked("/", null), false);
});
