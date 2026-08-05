import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function source(relativePath) {
  return readFileSync(new URL(relativePath, import.meta.url), "utf8");
}

const alternatives = source("../../app/alternatives/[incumbent]/page.jsx");
const blogs = source("../../app/blogs/[slug]/page.jsx");
const landers = source("../../app/lander/[slug]/page.jsx");
const buySmartStores = source("../../app/buysmart/stores/[slug]/page.jsx");
const geoEntities = source("./geoEntities.js");
const prankSeo = source("../../app/pranx/prankSeo.js");
const prankPage = source("../../app/pranx/[slug]/page.jsx");
const prankChildPage = source("../../app/pranx/[slug]/[child]/page.jsx");

test("unknown dynamic route metadata is explicitly noindexed", () => {
  for (const [label, routeSource, missBranchPattern] of [
    ["alternatives", alternatives, /if\s*\(!entry\)\s*\{([\s\S]*?)\n\s{2}\}/u],
    ["blogs", blogs, /if\s*\(!blog\)\s*\{([\s\S]*?)\n\s{2}\}/u],
    ["landers", landers, /if\s*\(!lander\)\s*\{([\s\S]*?)\n\s{2}\}/u],
    ["BuySmart stores", buySmartStores, /if\s*\(!KNOWN_STORE_SLUGS\.has\([^\n]+\)\)\s*\{([\s\S]*?)\n\s{2}\}/u],
  ]) {
    const missBranch = routeSource.match(missBranchPattern)?.[1] || "";
    assert.ok(missBranch, `${label} must identify a missing record`);
    assert.match(missBranch, /noindex:\s*true/u, `${label} misses must be noindexed`);
  }

  assert.match(
    geoEntities,
    /if\s*\(!location\)\s*return createPageMetadata\(\{\s*\.\.\.overrides,\s*noindex:\s*true\s*\}\)/u,
  );
});

test("BuySmart only publishes store metadata for resolvable slugs", () => {
  assert.match(buySmartStores, /fallbackStores\.map/u);
  assert.match(buySmartStores, /fallbackBuySmartOffers\.flatMap/u);
  assert.match(buySmartStores, /slugifyBuySmartBrand\(slug\)/u);
  assert.doesNotMatch(buySmartStores, /verified BuySmart savings/u);
});

test("Pranx returns metadata arguments for its callers to resolve once", () => {
  const missBranch = prankSeo.match(/if\s*\(!prank\)\s*\{([\s\S]*?)\n\s*\}/u)?.[1] || "";

  assert.match(missBranch, /return\s*\{/u);
  assert.match(missBranch, /noindex:\s*true/u);
  assert.doesNotMatch(missBranch, /createPageMetadata\(\{/u);
  assert.match(prankPage, /createPageMetadata\(getPrankMetadataArgs\(/u);
  assert.match(prankChildPage, /createPageMetadata\([\s\S]*getPrankMetadataArgs\(/u);
});
