import assert from "node:assert/strict";
import test from "node:test";

import {
  getBlogNoindexReason,
  shouldNoindexBlogPost,
} from "./blogIndexPolicy.js";
import { getBlogSeoOverride } from "./blogSeoOverrides.js";

// This test used to assert both overrides were null, on a "live-content audit"
// that measured the bodies through /api/blogs — an endpoint that truncates
// `content` at about 310 words, so every post read as 300-word filler. The
// pages' own BlogPosting wordCount puts these two at 1,464 and 1,570 words, and
// the ferry body really does carry the route table the description cites:
// "Dover to Calais | 1.5 hours", "Hull to Rotterdam | 11-12 hours",
// "Plymouth to Santander | 20+ hours", plus "take about 90 minutes" in prose.
// The override is correct; the audit that removed it was not.
test("publishes the authored overrides, which the live bodies support", () => {
  const ferry = getBlogSeoOverride(
    "ultimate-guide-to-crossing-from-the-uk-to-europe-by-ferry",
  );
  assert.ok(ferry, "ferry override should be published");
  assert.match(ferry.description, /Dover to Calais/);

  const counter = getBlogSeoOverride(
    "the-best-real-time-word-counter-tools-you-should-try-today",
  );
  assert.ok(counter, "word-counter override should be published");
  assert.ok(counter.description.length >= 70);
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

  // The ferry post carries an authored override AND stays indexable — the two
  // mechanisms are independent, which is the point of this test.
  assert.ok(getBlogSeoOverride(ferrySlug));
  assert.equal(shouldNoindexBlogPost(ferrySlug), false);
  assert.equal(getBlogNoindexReason(ferrySlug), "");

  assert.equal(shouldNoindexBlogPost(trivagoSlug), true);
  assert.match(getBlogNoindexReason(trivagoSlug), /navigational query/i);
});
