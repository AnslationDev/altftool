import assert from "node:assert/strict";
import test from "node:test";
import {
  buildSiteMapGroups,
  getDefaultRouteLabel,
  getSiteMapGroupId,
  humanizeRouteSegment,
} from "../altftoolweb/src/app/site-map/siteMapData.js";
import {
  canonicalizePublicPath,
  PUBLIC_ROUTE_FAMILIES,
} from "../altftoolweb/src/platform/navigation/publicRouteTaxonomy.js";

test("site map routes are categorized by product area", () => {
  assert.equal(getSiteMapGroupId("/tools/all/json-editor"), "tools");
  assert.equal(getSiteMapGroupId("/blogs/how-to-use-json"), "learn");
  assert.equal(getSiteMapGroupId("/fact-net/categories/science-nature"), "experiences");
  assert.equal(getSiteMapGroupId("/imgprompt/studio"), "automation");
  assert.equal(getSiteMapGroupId("/n8n/category/ai"), "automation");
  assert.equal(getSiteMapGroupId("/exclusivedeals/software"), "commerce");
  assert.equal(getSiteMapGroupId("/business-ops"), "business");
  assert.equal(getSiteMapGroupId("/housingneeds/roofing"), "business");
  assert.equal(getSiteMapGroupId("/prank-socialmedia/templates"), "experiences");
  assert.equal(getSiteMapGroupId("/labs"), "experiences");
  assert.equal(getSiteMapGroupId("/kym/trending"), "experiences");
  assert.equal(getSiteMapGroupId("/policypages/privacy"), "support");
  assert.equal(getSiteMapGroupId("/"), "platform");
});

test("public route taxonomy keeps families unique and canonicalizes legacy URLs", () => {
  assert.equal(
    new Set(PUBLIC_ROUTE_FAMILIES.map((family) => family.id)).size,
    PUBLIC_ROUTE_FAMILIES.length,
  );
  assert.equal(canonicalizePublicPath("/housingneeds/roofing"), "/bops/housingneeds/roofing");
  assert.equal(
    canonicalizePublicPath("https://altftool.com/business-ops/loans"),
    "/bops/loans",
  );
  assert.equal(canonicalizePublicPath("/tripfindbox/about-us"), "/bops/tripfindbox/about-us");
  assert.equal(canonicalizePublicPath("/games"), "/tools/games");
});

test("route labels preserve common technical acronyms", () => {
  assert.equal(humanizeRouteSegment("json-to-csv-api"), "JSON To CSV API");
  assert.equal(getDefaultRouteLabel("/tools/all/qr-generator"), "QR Generator");
  assert.equal(
    getDefaultRouteLabel("/exclusivedeals/beauty/1"),
    "Beauty exclusive deals - Page 1",
  );
});

test("site map grouping deduplicates routes and supports search", () => {
  const entries = [
    { url: "https://www.altftool.com/" },
    { url: "https://www.altftool.com/tools/all/json-editor" },
    { url: "https://www.altftool.com/tools/all/json-editor/" },
    { url: "https://www.altftool.com/blogs/json-guide" },
    { url: "https://www.altftool.com/housingneeds/roofing" },
    { url: "https://www.altftool.com/bops/housingneeds/roofing" },
  ];
  const labels = new Map([["/tools/all/json-editor", "JSON Editor"]]);

  const groups = buildSiteMapGroups(entries, { labels });
  assert.equal(groups.reduce((total, group) => total + group.routes.length, 0), 4);

  const results = buildSiteMapGroups(entries, { labels, query: "json editor" });
  assert.equal(results.length, 1);
  assert.equal(results[0].id, "tools");
  assert.deepEqual(results[0].routes.map((route) => route.path), ["/tools/all/json-editor"]);
});
