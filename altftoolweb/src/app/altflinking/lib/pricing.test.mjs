import assert from "node:assert/strict";
import test from "node:test";

import {
  formatPrice,
  isOrderable,
  normalizePrice,
  resolveGuestPostPrice,
  resolveLinkInsertionPrice,
  resolveOrderPrice,
  validateListingPrices,
} from "./pricing.js";

test("preserves explicit free and paid listing prices", () => {
  assert.equal(resolveGuestPostPrice({ prices: { guestPost: 0 } }), 0);
  assert.equal(resolveGuestPostPrice({ prices: { guestPost: "125" } }), 125);
  assert.equal(formatPrice(0), "Free");
  assert.equal(formatPrice(125), "$125");
});

test("does not invent prices for incomplete or invalid listings", () => {
  for (const value of [undefined, null, "", "   ", -1, "not-a-price", false, Infinity]) {
    assert.equal(resolveGuestPostPrice({ price: value }), null);
  }
  assert.equal(normalizePrice("0"), 0);
  assert.equal(isOrderable({}), false);
  assert.equal(formatPrice(null), "—");
});

test("uses only an explicit publisher-set insertion price", () => {
  assert.equal(resolveLinkInsertionPrice({ prices: { guestPost: 200, linkInsertion: 90 } }), 90);
  assert.equal(resolveLinkInsertionPrice({ prices: { guestPost: 200 } }), null);
  assert.equal(resolveLinkInsertionPrice({}), null);
  assert.equal(resolveOrderPrice({ prices: { guestPost: 200, linkInsertion: 90 } }, "GUEST_POST"), 200);
  assert.equal(resolveOrderPrice({ prices: { guestPost: 200, linkInsertion: 90 } }, "LINK_INSERTION"), 90);
  assert.equal(resolveOrderPrice({ prices: { guestPost: 200 } }, "LINK_INSERTION"), null);
  assert.equal(resolveOrderPrice({}, "UNKNOWN"), null);
  assert.equal(isOrderable({ prices: { guestPost: 200 } }, "LINK_INSERTION"), false);
});

test("validates listing prices while preserving explicit free values", () => {
  assert.deepEqual(validateListingPrices({ guestPost: 0, linkInsertion: "25" }), {
    error: null,
    value: { guestPost: 0, linkInsertion: 25 },
  });
  assert.deepEqual(validateListingPrices({ guestPost: "", linkInsertion: 25 }), {
    error: null,
    value: { guestPost: null, linkInsertion: 25 },
  });
  assert.match(validateListingPrices({ guestPost: -1, linkInsertion: 25 }).error, /guestPost/);
  assert.match(validateListingPrices({ guestPost: 10, linkInsertion: false }).error, /linkInsertion/);
  assert.match(validateListingPrices({ guestPost: null, linkInsertion: "" }).error, /At least one/);
  assert.match(validateListingPrices(null).error, /prices must be an object/);
});
