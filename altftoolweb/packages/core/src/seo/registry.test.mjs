// node --test packages/core/src/seo/registry.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildPageIndexEntry,
  computePageHealth,
  searchPages,
  summarizeRegistry,
  normalizeSearchText,
} from "./registry.js";

const sample = [
  buildPageIndexEntry({ path: "/tools/all/image-compressor", pageType: "tools", source: "tool", title: "Image Compressor", description: "Compress images online", keywords: ["image", "compress"], hasSchema: true, h1: "Image Compressor" }),
  buildPageIndexEntry({ path: "/tools/all/json-formatter", pageType: "tools", source: "tool", title: "JSON Formatter", description: "Format JSON", h1: "JSON Formatter", hasSchema: true }),
  buildPageIndexEntry({ path: "/blogs/best-image-tools", pageType: "blogs", source: "blog", title: "Best Image Tools", description: "A roundup", noindex: false }),
  buildPageIndexEntry({ path: "/news/topics/ai", pageType: "news", source: "news", title: "AI News", description: "", noindex: true }),
];

test("normalizeSearchText lowercases and strips punctuation", () => {
  assert.equal(normalizeSearchText("Image, Compressor!", ["PNG"]), "image compressor png");
});

test("buildPageIndexEntry computes searchText + health + indexState", () => {
  const e = sample[0];
  assert.equal(e.indexState, "index");
  assert.ok(e.searchText.includes("image compressor"));
  assert.equal(e.health.missingTitle, false);
  assert.equal(e.health.missingSchema, false);
});

test("computePageHealth flags missing fields + noindex", () => {
  const h = sample[3].health; // AI News, no description, noindex
  assert.equal(h.missingDescription, true);
  assert.equal(h.noindex, true);
  assert.equal(h.missingTitle, false);
});

test("search ranks exact/title matches first, AND semantics", () => {
  const r = searchPages(sample, "image compressor");
  assert.equal(r[0].path, "/tools/all/image-compressor"); // exact title wins
  // AND: 'image xyz' matches nothing (xyz absent)
  assert.equal(searchPages(sample, "image xyz").length, 0);
});

test("search filters by type", () => {
  const r = searchPages(sample, "image", { type: "blogs" });
  assert.equal(r.length, 1);
  assert.equal(r[0].pageType, "blogs");
});

test("empty query returns all (type-filtered), alphabetized", () => {
  const r = searchPages(sample, "", { type: "tools" });
  assert.equal(r.length, 2);
  assert.equal(r[0].title, "Image Compressor"); // alpha
});

test("summarizeRegistry counts by type + aggregate health", () => {
  const s = summarizeRegistry(sample);
  assert.equal(s.total, 4);
  assert.equal(s.byType.tools, 2);
  assert.equal(s.byType.news, 1);
  assert.equal(s.health.noindex, 1);
  assert.equal(s.health.missingDescription, 1);
});
