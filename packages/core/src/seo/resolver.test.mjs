// Node test runner: `node --test packages/core/src/seo/resolver.test.mjs`
import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveSeo, applyResolvedSeo, globToRegExp } from "./resolver.js";
import { validateSeoConfig, emptySeoConfig } from "./schemas.js";

test("empty/disabled config is fully inert", () => {
  const args = { title: "X", description: "d", path: "/p" };
  for (const cfg of [null, undefined, {}, emptySeoConfig(), { enabled: false, pages: { "/p": { title: "Z" } } }]) {
    const r = resolveSeo(cfg, { path: "/p", pageType: "tools" });
    assert.deepEqual(r.fill, {});
    assert.deepEqual(r.force, {});
    assert.deepEqual(applyResolvedSeo(args, r), args);
  }
});

test("globToRegExp matches segment and cross-segment wildcards", () => {
  assert.ok(globToRegExp("/news/topics/*").test("/news/topics/ai"));
  assert.ok(!globToRegExp("/news/topics/*").test("/news/topics/ai/extra"));
  assert.ok(globToRegExp("/blogs/**").test("/blogs/a/b/c"));
  assert.ok(globToRegExp("/tools/all/*").test("/tools/all/json-formatter"));
  assert.ok(!globToRegExp("/tools/all/*").test("/tools/dev/x"));
});

test("type defaults FILL only missing fields; caller args win", () => {
  const config = {
    enabled: true,
    types: { policies: { description: "Default policy description", keywords: ["legal"] } },
  };
  const r = resolveSeo(config, { path: "/policypages/privacy", pageType: "policies" });
  const args = { title: "Privacy Policy", path: "/policypages/privacy" }; // no description
  const out = applyResolvedSeo(args, r);
  assert.equal(out.title, "Privacy Policy");
  assert.equal(out.description, "Default policy description"); // filled
  assert.deepEqual(out.keywords, ["legal"]);

  // If caller passes description, fill must NOT override it.
  const out2 = applyResolvedSeo({ ...args, description: "Caller desc" }, r);
  assert.equal(out2.description, "Caller desc");
});

test("per-page override FORCES over caller args", () => {
  const config = {
    enabled: true,
    pages: { "/tools/all/json-formatter": { title: "Admin Title", noindex: true } },
  };
  const r = resolveSeo(config, { path: "/tools/all/json-formatter", pageType: "tools" });
  const args = { title: "Code Title", description: "d", path: "/tools/all/json-formatter" };
  const out = applyResolvedSeo(args, r);
  assert.equal(out.title, "Admin Title"); // forced
  assert.equal(out.noindex, true);
  assert.equal(out.description, "d"); // untouched
});

test("precedence: global < brand < type < rules < page", () => {
  const config = {
    enabled: true,
    global: { image: "/g.png", keywords: ["g"] },
    brands: { altftool: { image: "/b.png" } },
    types: { tools: { image: "/t.png" } },
    rules: [{ pathGlob: "/tools/**", order: 1, set: { image: "/r.png" } }],
    pages: { "/tools/all/x": { image: "/p.png" } },
  };
  const r = resolveSeo(config, { path: "/tools/all/x", pageType: "tools", brandId: "altftool" });
  // fill resolves to highest default tier (rules)
  assert.equal(r.fill.image, "/r.png");
  // page override forces
  assert.equal(r.force.image, "/p.png");
  const out = applyResolvedSeo({ title: "t", path: "/tools/all/x" }, r);
  assert.equal(out.image, "/p.png");
});

test("rule noindex applies via fill, robots normalized", () => {
  const config = {
    enabled: true,
    rules: [{ pathGlob: "/news/topics/*", set: { noindex: true } }],
  };
  const r = resolveSeo(config, { path: "/news/topics/ai", pageType: "news" });
  assert.equal(r.fill.noindex, true);
  const out = applyResolvedSeo({ title: "t", path: "/news/topics/ai" }, r);
  assert.equal(out.noindex, true);
});

test("sitemap directives resolve from type/rule/page", () => {
  const config = {
    enabled: true,
    types: { tools: { defaultPriority: 0.8, defaultChangeFreq: "weekly", includeInSitemap: true } },
    rules: [{ pathGlob: "/tools/all/*", set: { priority: 0.9 } }],
    pages: { "/tools/all/x": { sitemap: { include: false } } },
  };
  const r = resolveSeo(config, { path: "/tools/all/x", pageType: "tools" });
  assert.equal(r.sitemap.priority, 0.9); // rule beats type default
  assert.equal(r.sitemap.changeFreq, "weekly");
  assert.equal(r.sitemap.include, false); // page override wins
});

test("validateSeoConfig normalizes and flags global noindex guardrail", () => {
  const { ok, value, errors } = validateSeoConfig({
    enabled: true,
    version: 3,
    global: { robots: { index: false } },
    pages: { "bad-key": { title: "x" }, "/ok": { title: "Y", keywords: ["a", "", " b "] } },
  });
  assert.equal(value.version, 3);
  assert.ok(errors.some((e) => /noindex the entire site/i.test(e)));
  assert.ok(errors.some((e) => /must start with/i.test(e)));
  assert.equal(ok, false);
  assert.deepEqual(value.pages["/ok"].keywords, ["a", "b"]);
  assert.equal(value.pages["bad-key"], undefined);
});

test("trailing-slash path override matches", () => {
  const config = { enabled: true, pages: { "/about": { title: "About" } } };
  const r = resolveSeo(config, { path: "/about/", pageType: "policies" });
  assert.equal(r.force.title, "About");
});
