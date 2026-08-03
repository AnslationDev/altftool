import assert from "node:assert/strict";
import test from "node:test";

import { HERO_CARDS } from "./heroCarouselData.js";
import { PRODUCT_REGISTRY } from "./productRegistry.js";
import { CATEGORY_STRIP, POPULAR_SEARCH_CATEGORY, UNIVERSE_PRODUCT_KEYS } from "./top10Data.js";

const categoryIds = new Set(PRODUCT_REGISTRY.map((product) => product.categoryId));
const productKeys = new Set(PRODUCT_REGISTRY.map((product) => product.key));

test("Top10 navigation never advertises a missing product", () => {
  for (const category of CATEGORY_STRIP) {
    assert.ok(categoryIds.has(category.id), `Missing registry entry for category ${category.id}`);
  }
  for (const card of HERO_CARDS) {
    assert.ok(categoryIds.has(card.id), `Missing registry entry for hero ${card.id}`);
  }
  for (const [label, categoryId] of Object.entries(POPULAR_SEARCH_CATEGORY)) {
    assert.ok(categoryIds.has(categoryId), `Popular search ${label} targets missing category ${categoryId}`);
  }
});

test("Top10 registry and navigation identifiers are unique", () => {
  assert.equal(categoryIds.size, PRODUCT_REGISTRY.length);
  assert.equal(productKeys.size, PRODUCT_REGISTRY.length);
  assert.equal(new Set(CATEGORY_STRIP.map((item) => item.id)).size, CATEGORY_STRIP.length);
  assert.equal(new Set(HERO_CARDS.map((item) => item.id)).size, HERO_CARDS.length);
});

test("Every universe references real products", () => {
  for (const [universe, keys] of Object.entries(UNIVERSE_PRODUCT_KEYS)) {
    assert.ok(keys.length > 0, `${universe} has no products`);
    for (const key of keys) {
      assert.ok(productKeys.has(key), `${universe} references missing product ${key}`);
    }
  }
});
