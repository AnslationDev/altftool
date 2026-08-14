import assert from "node:assert/strict";
import test from "node:test";

import { shouldNoindexPagePath } from "./pageIndexPolicy.js";

test("Top49 preview routes remain noindex after a force override clears the page flag", () => {
  const forceOverrideNoindex = false;
  const paths = [
    "/top49",
    "/top49/movies",
    "/top49/movies/best-horror-movies",
    "/top49/item/the-shining",
    "https://www.altftool.com/top49/search?q=horror#results",
  ];

  for (const path of paths) {
    const suppressIndexing =
      forceOverrideNoindex || shouldNoindexPagePath(path);
    assert.equal(suppressIndexing, true, path);
  }
});

test("Top49 policy does not capture similarly prefixed routes", () => {
  assert.equal(shouldNoindexPagePath("/top490"), false);
  assert.equal(shouldNoindexPagePath("/top49-preview"), false);
});

test("paused editorial preview remains centrally noindex", () => {
  assert.equal(shouldNoindexPagePath("/buzzfeed"), true);
  assert.equal(shouldNoindexPagePath("/buzzfeed/story-preview"), true);
  assert.equal(shouldNoindexPagePath("/buzzfeed-preview"), false);
});

test("AltfWorld mock community routes remain centrally noindex", () => {
  assert.equal(shouldNoindexPagePath("/altfworld"), true);
  assert.equal(shouldNoindexPagePath("/altfworld/community/sample"), true);
  assert.equal(shouldNoindexPagePath("/altfworld-preview"), false);
});

test("quarantined Animal Hub routes remain centrally noindex", () => {
  assert.equal(shouldNoindexPagePath("/animalhub"), true);
  assert.equal(shouldNoindexPagePath("/animalhub/mammals/lion"), true);
  assert.equal(shouldNoindexPagePath("/animalhub-preview"), false);
});

test("quarantined Top3 mock rankings remain centrally noindex", () => {
  assert.equal(shouldNoindexPagePath("/top3"), true);
  assert.equal(shouldNoindexPagePath("/top3/technology/best-vpns"), true);
  assert.equal(shouldNoindexPagePath("/top30"), false);
  assert.equal(shouldNoindexPagePath("/top3-preview"), false);
});
