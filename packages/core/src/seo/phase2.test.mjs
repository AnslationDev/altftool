// Node test runner: `node --test packages/core/src/seo/phase2.test.mjs`
import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveCrawl, resolveSitemap } from "./resolver.js";
import { validateSeoConfig, emptySeoConfig } from "./schemas.js";

test("resolveCrawl is inert for empty/disabled config", () => {
  for (const cfg of [null, {}, emptySeoConfig(), { enabled: false, crawl: { disallow: ["/x"] } }]) {
    assert.deepEqual(resolveCrawl(cfg), { disallow: [], allow: [], extraSitemaps: [] });
  }
});

test("resolveCrawl returns configured directives when enabled", () => {
  const cfg = {
    enabled: true,
    crawl: { disallow: ["/admin/", "/tmp/"], allow: ["/tmp/public"], extraSitemaps: ["https://x.com/sitemap.xml"] },
  };
  const c = resolveCrawl(cfg);
  assert.deepEqual(c.disallow, ["/admin/", "/tmp/"]);
  assert.deepEqual(c.allow, ["/tmp/public"]);
  assert.deepEqual(c.extraSitemaps, ["https://x.com/sitemap.xml"]);
});

test("resolveSitemap excludes via page override and overrides priority via rule", () => {
  const cfg = {
    enabled: true,
    types: { tools: { defaultPriority: 0.7, defaultChangeFreq: "monthly" } },
    rules: [{ pathGlob: "/tools/all/*", set: { priority: 0.9 } }],
    pages: { "/tools/all/hidden": { sitemap: { include: false } } },
  };
  assert.equal(resolveSitemap(cfg, { path: "/tools/all/x", pageType: "tools" }).priority, 0.9);
  assert.equal(resolveSitemap(cfg, { path: "/tools/all/x", pageType: "tools" }).changeFreq, "monthly");
  assert.equal(resolveSitemap(cfg, { path: "/tools/all/hidden" }).include, false);
});

test("resolveSitemap is empty (inert) when disabled", () => {
  assert.deepEqual(resolveSitemap({ enabled: false, rules: [{ pathGlob: "/*", set: { priority: 0.1 } }] }, { path: "/x" }), {});
});

test("validateSeoConfig normalizes crawl: drops non-rooted disallow + bad sitemaps", () => {
  const { value } = validateSeoConfig({
    enabled: true,
    crawl: {
      disallow: ["/ok/", "no-slash", "  /trim/  "],
      allow: ["/a"],
      extraSitemaps: ["https://x.com/s.xml", "ftp://bad", "not-a-url"],
    },
  });
  assert.deepEqual(value.crawl.disallow, ["/ok/", "/trim/"]);
  assert.deepEqual(value.crawl.allow, ["/a"]);
  assert.deepEqual(value.crawl.extraSitemaps, ["https://x.com/s.xml"]);
});

test("emptySeoConfig includes empty crawl section", () => {
  assert.deepEqual(emptySeoConfig().crawl, { disallow: [], allow: [], extraSitemaps: [] });
});
