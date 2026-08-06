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
  normalizeCodeBlock,
} from "./schemas.js";
import { resolveExtendedMeta, resolveInjectedCode } from "./resolver.js";

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

test("normalizeCodeBlock keeps non-empty raw code, drops blanks", () => {
  assert.deepEqual(
    normalizeCodeBlock({ head: "<script>a()</script>", bodyStart: "  ", bodyEnd: "<!-- x -->" }),
    { head: "<script>a()</script>", bodyEnd: "<!-- x -->" },
  );
  assert.equal(normalizeCodeBlock({ head: "" }), undefined);
});

test("resolveInjectedCode returns global + per-page blocks, inert when disabled", () => {
  const { value } = validateSeoConfig({
    enabled: true,
    global: { code: { head: "<script>gtm()</script>", bodyEnd: "<!-- chat -->" } },
    pages: { "/deal": { code: { bodyStart: "<script>pixel()</script>" } } },
  });
  const r = resolveInjectedCode(value, "/deal");
  assert.equal(r.global.head, "<script>gtm()</script>");
  assert.equal(r.global.bodyEnd, "<!-- chat -->");
  assert.equal(r.page.bodyStart, "<script>pixel()</script>");
  assert.equal(r.page.head, undefined);

  const off = resolveInjectedCode({ ...value, enabled: false }, "/deal");
  assert.deepEqual(off, { global: {}, page: {} });
});

test("resolveInjectedCode strips navigation from global and per-page code", () => {
  const safeAnalytics =
    '<script>window.dataLayer=window.dataLayer||[];dataLayer.push({event:"page_view",page:window.location.href})</script>';
  const unsafeRedirect = '<script>window.location.replace("https://redirect.invalid")</script>';
  const safeVerification = '<meta name="google-site-verification" content="token">';
  const unsafeRefresh = '<meta http-equiv="refresh" content="0;url=https://redirect.invalid">';

  const resolved = resolveInjectedCode(
    {
      enabled: true,
      global: {
        code: {
          head: `${safeVerification}${unsafeRefresh}${safeAnalytics}`,
          bodyEnd: '<script>window["loc\\u0061tion"]["href"]="https://redirect.invalid"</script>',
        },
      },
      pages: {
        "/deal": {
          code: {
            head: `${safeAnalytics}${unsafeRedirect}`,
            bodyStart: '<a href="https://redirect.invalid">Leave</a><script>pixel()</script>',
          },
        },
      },
    },
    "/deal",
  );

  assert.equal(resolved.global.head, `${safeVerification}${safeAnalytics}`);
  assert.equal(resolved.global.bodyEnd, undefined);
  assert.equal(resolved.page.head, safeAnalytics);
  assert.equal(resolved.page.bodyStart, "<script>pixel()</script>");
});

test("resolveInjectedCode preserves common analytics and verification snippets", () => {
  const gtm = `<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-TEST');</script>`;
  const verification = '<meta name="google-site-verification" content="verify-token">';
  const pixel = '<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TEST"></iframe></noscript>';
  const resolved = resolveInjectedCode({
    enabled: true,
    global: { code: { head: `${verification}${gtm}`, bodyStart: pixel } },
  });

  assert.equal(resolved.global.head, `${verification}${gtm}`);
  assert.equal(resolved.global.bodyStart, pixel);
  assert.deepEqual(resolved.page, {});
});

test("resolveInjectedCode rejects other URL-changing primitives without throwing on malformed entities", () => {
  const safe = '<script>analytics.track("view")</script>';
  const malformedButSafe = '<meta name="note" content="&#999999999999999999999;">';
  const resolved = resolveInjectedCode({
    enabled: true,
    global: {
      code: {
        head: `<script>history.pushState({}, "", "/different")</script>${safe}`,
        bodyStart: `<form action="https://redirect.invalid"></form>${malformedButSafe}`,
      },
    },
    pages: {
      "/deal": {
        code: {
          head: '<base href="https://redirect.invalid/">',
          bodyEnd: `<script>window.open("https://redirect.invalid")</script>${safe}`,
        },
      },
    },
  }, "/deal");

  assert.equal(resolved.global.head, safe);
  assert.equal(resolved.global.bodyStart, malformedButSafe);
  assert.equal(resolved.page.head, undefined);
  assert.equal(resolved.page.bodyEnd, safe);
});

test("resolveInjectedCode rejects direct navigation syntax variants and page replacement", () => {
  const unsafe = [
    '<script>window.location?.assign("https://redirect.invalid")</script>',
    '<script>location.replace.call(location,"https://redirect.invalid")</script>',
    '<script>document.defaultView.location.assign("https://redirect.invalid")</script>',
    '<script>window.frames[0].location="https://redirect.invalid"</script>',
    '<script>window.open.call(window,"https://redirect.invalid")</script>',
    '<script>navigation?.navigate("https://redirect.invalid")</script>',
    '<script>history?.replaceState({},"","/different")</script>',
    '<script>window["loca"+"tion"].href="https://redirect.invalid"</script>',
    '<script>window["op"+"en"]("https://redirect.invalid")</script>',
    '<script>document.write("replacement content")</script>',
    '<script>document.body.innerHTML="replacement content"</script>',
    '<script>document.documentElement.replaceChildren()</script>',
  ];

  const resolved = resolveInjectedCode({
    enabled: true,
    global: { code: { head: unsafe.join("") } },
    pages: { "/deal": { code: { bodyEnd: unsafe.join("") } } },
  }, "/deal");

  assert.deepEqual(resolved, { global: {}, page: {} });
});

test("resolveInjectedCode keeps non-navigation location reads and XHR open calls", () => {
  const safe = [
    '<script>fetch("/collect?p="+encodeURIComponent(location.href))</script>',
    '<script>const xhr=new XMLHttpRequest();xhr.open("GET","/collect")</script>',
    '<script>analytics.track("page_view")</script>',
  ].join("");

  const resolved = resolveInjectedCode({
    enabled: true,
    global: { code: { bodyEnd: safe } },
    pages: { "/deal": { code: { head: safe } } },
  }, "/deal");

  assert.equal(resolved.global.bodyEnd, safe);
  assert.equal(resolved.page.head, safe);
});

test("resolveExtendedMeta is inert when disabled", () => {
  const meta = resolveExtendedMeta({ enabled: false, global: { favicon: "/x" } }, { path: "/" });
  assert.equal(meta.favicon, null);
  assert.deepEqual(meta.og, {});
  assert.deepEqual(meta.jsonLd, []);
});
