import assert from "node:assert/strict";
import test from "node:test";

import {
  normalizeCanonicalUrl,
  PRODUCTION_SITE_URL,
  resolveSiteUrl,
} from "../altftoolweb/src/platform/seo/siteUrl.js";

test("production metadata always uses the canonical www host", () => {
  assert.equal(resolveSiteUrl("https://altftool.com", "production"), PRODUCTION_SITE_URL);
  assert.equal(resolveSiteUrl("https://www.altftool.com/", "production"), PRODUCTION_SITE_URL);
  assert.equal(resolveSiteUrl("https://altftool.com./", "production"), PRODUCTION_SITE_URL);
  assert.equal(resolveSiteUrl("https://www.altftool.com./", "production"), PRODUCTION_SITE_URL);
});

test("unsafe or malformed production site URLs cannot poison canonicals", () => {
  assert.equal(resolveSiteUrl("http://localhost:3002", "production"), PRODUCTION_SITE_URL);
  assert.equal(resolveSiteUrl("https://preview.example.com", "production"), PRODUCTION_SITE_URL);
  assert.equal(resolveSiteUrl("not a URL", "production"), PRODUCTION_SITE_URL);
});

test("local origins remain available while developing", () => {
  assert.equal(resolveSiteUrl("http://localhost:3002/path", "development"), "http://localhost:3002");
  assert.equal(resolveSiteUrl("http://127.0.0.1:3002", "test"), "http://127.0.0.1:3002");
});

test("same-site canonicals are consolidated on the www production host", () => {
  assert.equal(
    normalizeCanonicalUrl(
      "https://altftool.com/lander/shein?source=cms#details",
      "/lander/shein",
      PRODUCTION_SITE_URL,
    ),
    "https://www.altftool.com/lander/shein?source=cms",
  );
  assert.equal(
    normalizeCanonicalUrl("/tools/all/json-formatter", "/", PRODUCTION_SITE_URL),
    "https://www.altftool.com/tools/all/json-formatter",
  );
  assert.equal(
    normalizeCanonicalUrl(
      "https://altftool.com./tools/all/utm-link-builder#form",
      "/tools/all/utm-link-builder",
      PRODUCTION_SITE_URL,
    ),
    "https://www.altftool.com/tools/all/utm-link-builder",
  );
});

test("external canonicals remain supported for syndicated content", () => {
  assert.equal(
    normalizeCanonicalUrl(
      "https://publisher.example/article",
      "/blogs/article",
      PRODUCTION_SITE_URL,
    ),
    "https://publisher.example/article",
  );
});

test("malformed canonical values fall back to the route path", () => {
  assert.equal(
    normalizeCanonicalUrl("not a URL", "/blogs/article", PRODUCTION_SITE_URL),
    "https://www.altftool.com/blogs/article",
  );
  assert.equal(
    normalizeCanonicalUrl("javascript:alert(1)", "/blogs/article", PRODUCTION_SITE_URL),
    "https://www.altftool.com/blogs/article",
  );
});
