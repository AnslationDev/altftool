import assert from "node:assert/strict";
import test from "node:test";

import {
  normalizeCanonicalUrl,
  PRODUCTION_SITE_URL,
  resolveSiteUrl,
} from "./siteUrl.js";

test("DNS root-dot variants stay on the canonical production host", () => {
  assert.equal(
    resolveSiteUrl("https://altftool.com./", "production"),
    PRODUCTION_SITE_URL,
  );
  assert.equal(
    resolveSiteUrl("https://www.altftool.com./", "production"),
    PRODUCTION_SITE_URL,
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
