// Node test runner: `node --test packages/core/src/seo/health.test.mjs`
import { test } from "node:test";
import assert from "node:assert/strict";
import { analyzeSeoHealth } from "./health.js";

const AT = "2026-01-01T00:00:00.000Z";

test("clean config => no errors/warnings, score 100", () => {
  const r = analyzeSeoHealth({ enabled: true, pages: {}, redirects: [] }, { generatedAt: AT });
  assert.equal(r.metrics.errors, 0);
  assert.equal(r.metrics.warnings, 0);
  assert.equal(r.metrics.score, 100);
  assert.equal(r.generatedAt, AT);
});

test("global noindex => error", () => {
  const r = analyzeSeoHealth({ enabled: true, global: { robots: { index: false } } });
  assert.ok(r.findings.some((f) => f.code === "GLOBAL_NOINDEX" && f.severity === "error"));
  assert.ok(r.metrics.score < 100);
});

test("redirect loop + chain detection", () => {
  const loop = analyzeSeoHealth({ enabled: true, redirects: [
    { source: "/a", destination: "/b" },
    { source: "/b", destination: "/a" },
  ] });
  assert.ok(loop.findings.some((f) => f.code === "REDIRECT_LOOP"));

  const chain = analyzeSeoHealth({ enabled: true, redirects: [
    { source: "/a", destination: "/b" },
    { source: "/b", destination: "/c" },
  ] });
  assert.ok(chain.findings.some((f) => f.code === "REDIRECT_CHAIN"));
});

test("duplicate canonical + duplicate redirect + self redirect", () => {
  const r = analyzeSeoHealth({
    enabled: true,
    pages: { "/x": { canonical: "/c" }, "/y": { canonical: "/c" } },
    redirects: [
      { source: "/d", destination: "/d" },
      { source: "/e", destination: "/f" },
      { source: "/e", destination: "/g" },
    ],
  });
  assert.ok(r.findings.some((f) => f.code === "DUPLICATE_CANONICAL"));
  assert.ok(r.findings.some((f) => f.code === "SELF_REDIRECT"));
  assert.ok(r.findings.some((f) => f.code === "DUPLICATE_REDIRECT"));
});

test("broad noindex rule + invalid glob", () => {
  const r = analyzeSeoHealth({
    enabled: true,
    rules: [
      { pathGlob: "/**", set: { noindex: true } },
      { pathGlob: "", set: {} },
    ],
  });
  assert.ok(r.findings.some((f) => f.code === "BROAD_NOINDEX_RULE" && f.severity === "error"));
  assert.ok(r.findings.some((f) => f.code === "INVALID_RULE_GLOB"));
});

test("metrics counts + noindex pages + redirect/page conflict", () => {
  const r = analyzeSeoHealth({
    enabled: true,
    pages: { "/p1": { noindex: true }, "/p2": { title: "t" }, "/dup": { title: "x" } },
    redirects: [{ source: "/dup", destination: "/elsewhere" }],
  });
  assert.equal(r.metrics.pages, 3);
  assert.equal(r.metrics.noindexPages, 1);
  assert.ok(r.findings.some((f) => f.code === "REDIRECT_PAGE_CONFLICT"));
  assert.ok(r.findings.some((f) => f.code === "PAGE_MISSING_DESCRIPTION"));
});

test("route inventory: redirect over live route + unknown override route", () => {
  const r = analyzeSeoHealth(
    { enabled: true, pages: { "/ghost": { title: "t" } }, redirects: [{ source: "/live", destination: "/new" }] },
    { routes: ["/live", "/real"] },
  );
  assert.ok(r.findings.some((f) => f.code === "REDIRECT_OVER_LIVE_ROUTE"));
  assert.ok(r.findings.some((f) => f.code === "PAGE_OVERRIDE_UNKNOWN_ROUTE"));
});
