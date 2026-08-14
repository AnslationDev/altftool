import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync(new URL("./layout.jsx", import.meta.url), "utf8");
const sitemapSource = fs.readFileSync(new URL("../sitemap.js", import.meta.url), "utf8");
const categorySource = fs.readFileSync(
  new URL("./[slug]/[category]/page.jsx", import.meta.url),
  "utf8",
);
const detailSource = fs.readFileSync(
  new URL("./[slug]/[category]/[pdetail]/page.jsx", import.meta.url),
  "utf8",
);
const mockSource = fs.readFileSync(new URL("./(data)/mockBrands.js", import.meta.url), "utf8");

test("brand rating hub owns its canonical and stays out of search previews", () => {
  assert.match(source, /path:\s*["']\/brandrating["']/u);
  assert.match(source, /noindex:\s*true/u);
  assert.match(source, /follow:\s*true/u);
  assert.doesNotMatch(
    sitemapSource,
    /\{\s*path:\s*["']\/brandrating["']/u,
  );
  assert.doesNotMatch(sitemapSource, /\/brandrating\//u);
});

test("brand rating server layout restores the complete hub schema bundle", () => {
  assert.match(source, /createCollectionPageJsonLd/u);
  assert.match(source, /createItemListJsonLd/u);
  assert.match(source, /createBreadcrumbJsonLd/u);
  assert.match(source, /getRouteHubJsonLdItems\(["']brandrating["']\)/u);
  assert.match(source, /getRouteHub\(["']brandrating["']\)/u);
  assert.match(source, /<RouteDiscoveryBand/u);
});

test("category and brand compatibility routes stay in source-verification mode", () => {
  for (const routeSource of [categorySource, detailSource]) {
    assert.match(routeSource, /noindex:\s*true/u);
    assert.match(routeSource, /follow:\s*true/u);
    assert.match(routeSource, /<VerificationPreview/u);
    assert.doesNotMatch(routeSource, /<PageView/u);
  }
  assert.match(categorySource, /subcategory\?\.name \|\| ["']Brand category["']/u);
  assert.match(detailSource, /brand\?\.name \|\| ["']Brand["']/u);
});

test("legacy mock brand injection is disabled by default", () => {
  assert.match(mockSource, /MOCK_DATA_ENABLED\s*=\s*false/u);
});
