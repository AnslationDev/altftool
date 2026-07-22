import assert from "node:assert/strict";
import test from "node:test";

import {
  PRODUCT_PHASES,
  PRODUCT_REGISTRY,
  getProductById,
  getProductProgress,
} from "../packages/core/src/productRegistry.js";
import {
  SIGNAL_CATALOG,
  getSignalBySlug,
} from "../packages/core/src/signalCatalog.js";

test("product registry has unique ids and valid phases", () => {
  const ids = PRODUCT_REGISTRY.map((product) => product.id);
  const phases = new Set(PRODUCT_PHASES.map((phase) => phase.id));

  assert.equal(new Set(ids).size, ids.length);
  assert.ok(PRODUCT_REGISTRY.every((product) => phases.has(product.phase)));
  assert.ok(PRODUCT_REGISTRY.every((product) => product.name && product.summary));
  assert.equal(getProductById("signals")?.publicPath, "/signals");
});

test("product progress accounts for every registry entry", () => {
  const progress = getProductProgress();
  assert.equal(
    progress.live + progress.active + progress.partial + progress.planned + progress.gated,
    progress.total,
  );
});

test("signal catalog has unique slugs and actionable records", () => {
  const slugs = SIGNAL_CATALOG.map((signal) => signal.slug);

  assert.equal(new Set(slugs).size, slugs.length);
  assert.ok(SIGNAL_CATALOG.every((signal) => signal.query && signal.actions.length));
  assert.equal(getSignalBySlug("ai-content-detector")?.category, "AI & Content");
});
