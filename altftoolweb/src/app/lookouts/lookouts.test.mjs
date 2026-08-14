import assert from "node:assert/strict";
import test from "node:test";

import { PUBLIC_NAV_ITEMS } from "../../platform/navigation/siteRoutes.js";
import { LOOKOUTS_PRODUCTS } from "./lookouts.js";

test("Lookouts navigation exposes every live product at its canonical route", () => {
  const menu = PUBLIC_NAV_ITEMS.find((item) => item.href === "/lookouts");
  assert.ok(menu, "Lookouts is missing from public navigation");

  const menuHrefs = new Set(menu.options.map((item) => item.href));
  for (const product of LOOKOUTS_PRODUCTS.filter((item) => item.status === "live")) {
    assert.ok(menuHrefs.has(product.href), `Lookouts nav is missing ${product.href}`);
  }
});
