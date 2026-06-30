// Tests for the extended SEO meta fields (Meta SEO Management module):
// verification tags, favicon, OG/Twitter overrides, hreflang, JSON-LD, slug.

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  validateSeoConfig,
  normalizeOg,
  normalizeTwitter,
  normalizeVerification,
  normalizeHreflang,
  normalizeSchemaList,
} from "./schemas.js";
import { resolveExtendedMeta } from "./resolver.js";

test("normalizeVerification keeps known providers, drops blanks", () => {
  const v = normalizeVerification({
    google: " g-token ",
    bing: "b-token",
    yandex: "",
    pinterest: "p-token",
    facebook: "fb-token",
    unknown: "x",
  });
  assert.deepEqual(v, {
    google: "g-token",
    bing: "b-token",
    pinterest: "p-token",
    facebook: "fb-token",
  });
});

test("normalizeOg / normalizeTwitter coerce and validate", () => {
  assert.deepEqual(normalizeOg({ title: "T", type: "article", junk: 1 }), {
    title: "T",
    type: "article",
  });
  // Invalid twitter card type is dropped, valid one kept.
  assert.deepEqual(
    normalizeTwitter({ card: "nope", title: "Hi" }),
    { title: "Hi" },
  );
  assert.deepEqual(
    normalizeTwitter({ card: "summary_large_image" }),
    { card: "summary_large_image" },
  );
});

test("normalizeHreflang validates lang codes and href", () => {
  const out = normalizeHreflang([
    { lang: "en", href: "/" },
    { lang: "en-US", href: "https://altftool.com/" },
    { lang: "x-default", href: "/" },
    { lang: "english", href: "/" }, // invalid code -> dropped
    { lang: "fr", href: "ftp://bad" }, // invalid href -> dropped
  ]);
  assert.deepEqual(out, [
    { lang: "en", href: "/" },
    { lang: "en-US", href: "https://altftool.com/" },
    { lang: "x-default", href: "/" },
  ]);
});

test("normalizeSchemaList accepts object, array, and JSON string", () => {
  assert.equal(normalizeSchemaList({ "@type": "FAQPage" }).length, 1);
  assert.equal(normalizeSchemaList([{ a: 1 }, "notobj", { b: 2 }]).length, 2);
  assert.equal(normalizeSchemaList('[{"@type":"Article"}]').length, 1);
  assert.equal(normalizeSchemaList("not json"), undefined);
});

test("validateSeoConfig persists global + per-page extended fields", () => {
  const { value } = validateSeoConfig({
    enabled: true,
    global: {
      siteTitle: "AltFTool",
      baseUrl: "https://altftool.com",
      favicon: "/favicon.ico",
      og: { type: "website", siteName: "AltFTool" },
      twitter: { card: "summary_large_image", site: "@altftool" },
      verification: { google: "gtok", bing: "btok" },
    },
    pages: {
      "/tools/all/json-formatter": {
        title: "JSON Formatter",
        slug: "json-formatter",
        og: { title: "OG JSON", description: "og desc" },
        twitter: { card: "summary", title: "TW JSON" },
        hreflang: [{ lang: "en", href: "/tools/all/json-formatter" }],
        schema: [{ "@type": "SoftwareApplication", name: "JSON Formatter" }],
      },
    },
  });

  assert.equal(value.global.baseUrl, "https://altftool.com");
  assert.equal(value.global.favicon, "/favicon.ico");
  assert.equal(value.global.verification.google, "gtok");
  const page = value.pages["/tools/all/json-formatter"];
  assert.equal(page.slug, "json-formatter");
  assert.equal(page.og.title, "OG JSON");
  assert.equal(page.twitter.card, "summary");
  assert.equal(page.hreflang.length, 1);
  assert.equal(page.schema.length, 1);
});

test("resolveExtendedMeta merges global defaults under per-page overrides", () => {
  const config = {
    enabled: true,
    global: {
      og: { type: "website", siteName: "AltFTool" },
      twitter: { card: "summary_large_image", site: "@altftool" },
      verification: { google: "gtok" },
      favicon: "/favicon.ico",
      baseUrl: "https://altftool.com",
    },
    pages: {
      "/p": {
        og: { title: "Page OG" },
        twitter: { title: "Page TW" },
        hreflang: [{ lang: "en", href: "/p" }],
        schema: [{ "@type": "FAQPage" }],
      },
    },
  };
  const meta = resolveExtendedMeta(config, { path: "/p" });
  assert.equal(meta.og.siteName, "AltFTool"); // global fill
  assert.equal(meta.og.title, "Page OG"); // page override
  assert.equal(meta.twitter.site, "@altftool");
  assert.equal(meta.twitter.title, "Page TW");
  assert.equal(meta.verification.google, "gtok");
  assert.equal(meta.favicon, "/favicon.ico");
  assert.equal(meta.hreflang.length, 1);
  assert.equal(meta.jsonLd.length, 1);
});

test("resolveExtendedMeta is inert when disabled", () => {
  const meta = resolveExtendedMeta({ enabled: false, global: { favicon: "/x" } }, { path: "/" });
  assert.equal(meta.favicon, null);
  assert.deepEqual(meta.og, {});
  assert.deepEqual(meta.jsonLd, []);
});
