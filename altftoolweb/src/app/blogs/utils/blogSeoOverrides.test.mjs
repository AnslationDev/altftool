import assert from "node:assert/strict";
import test from "node:test";

import {
  getBlogNoindexReason,
  shouldNoindexBlogPost,
} from "./blogIndexPolicy.js";
import { getBlogSeoOverride } from "./blogSeoOverrides.js";

test("does not publish metadata claims removed by the live-content audit", () => {
  assert.equal(
    getBlogSeoOverride(
      "ultimate-guide-to-crossing-from-the-uk-to-europe-by-ferry",
    ),
    null,
  );
  assert.equal(
    getBlogSeoOverride(
      "the-best-real-time-word-counter-tools-you-should-try-today",
    ),
    null,
  );
});

test("leaves unknown and empty posts untouched", () => {
  assert.equal(getBlogSeoOverride("not-a-real-post"), null);
  assert.equal(getBlogSeoOverride(), null);
});

test("the existing index policy remains separate from metadata overrides", () => {
  const ferrySlug =
    "ultimate-guide-to-crossing-from-the-uk-to-europe-by-ferry";
  const trivagoSlug =
    "trivago-singapore-find-the-best-hotel-deals-for-your-stay";

  assert.equal(getBlogSeoOverride(ferrySlug), null);
  assert.equal(shouldNoindexBlogPost(ferrySlug), false);
  assert.equal(getBlogNoindexReason(ferrySlug), "");

  assert.equal(shouldNoindexBlogPost(trivagoSlug), true);
  assert.match(getBlogNoindexReason(trivagoSlug), /navigational query/i);
});
