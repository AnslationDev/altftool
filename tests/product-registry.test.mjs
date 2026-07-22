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
import {
  PRODUCT_SUITE_CATALOG,
  getProductSuiteBySlug,
} from "../packages/core/src/productSuiteCatalog.js";
import {
  analyzeTranscript,
  calculateNetworkMetrics,
  evaluateIdea,
  generateTotp,
  runTextWorkflow,
} from "../packages/core/src/productUtilities.js";
import { toolMetaMap } from "../altftoolweb/src/platform/registry/toolMetaMap.js";

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

test("product suites map to unique product registry records", () => {
  const slugs = PRODUCT_SUITE_CATALOG.map((suite) => suite.slug);
  const productIds = new Set(PRODUCT_REGISTRY.map((product) => product.id));
  assert.equal(new Set(slugs).size, slugs.length);
  assert.ok(PRODUCT_SUITE_CATALOG.every((suite) => productIds.has(suite.productId)));
  assert.equal(getProductSuiteBySlug("domainops")?.productId, "domain-ops");
  for (const suite of PRODUCT_SUITE_CATALOG) {
    for (const [, href] of suite.relatedTools) {
      const slug = href.split("/").filter(Boolean).at(-1);
      assert.ok(toolMetaMap[slug], `${suite.slug} references missing tool ${slug}`);
    }
  }
});

test("local product utilities produce useful deterministic outputs", async () => {
  const idea = evaluateIdea({
    problem: "Independent shops lose time checking DNS and email records across separate dashboards.",
    audience: "Small business owners and freelance developers",
    urgency: 4,
    willingness: 4,
    frequency: "weekly",
    reach: "focused",
  });
  assert.ok(idea.score >= 60);
  assert.equal(idea.experiments.length, 4);

  const minutes = analyzeTranscript("We agreed to ship Friday. Nikhil will update the DNS records by Thursday. What remains unknown?");
  assert.equal(minutes.decisions.length, 1);
  assert.equal(minutes.actions.length, 1);
  assert.equal(minutes.questions.length, 1);

  const flow = runTextWorkflow("beta\nalpha\nbeta", ["unique-lines", "sort-lines"]);
  assert.equal(flow.output, "alpha\nbeta");

  const network = calculateNetworkMetrics({ latencies: [20, 24, 22], downloadBytes: 1_000_000, downloadMs: 1000 });
  assert.equal(network.downloadMbps, 8);
  assert.equal(network.quality, "Responsive");

  assert.equal(await generateTotp("GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ", 59_000, { digits: 8 }), "94287082");
});
