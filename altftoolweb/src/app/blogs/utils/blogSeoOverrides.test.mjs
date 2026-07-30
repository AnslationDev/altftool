import assert from "node:assert/strict";
import test from "node:test";

import {
  getBlogNoindexReason,
  shouldNoindexBlogPost,
} from "./blogIndexPolicy.js";
import { getBlogSeoOverride } from "./blogSeoOverrides.js";

test("returns complete, bounded metadata for an authored blog override", () => {
  const override = getBlogSeoOverride(
    "ultimate-guide-to-crossing-from-the-uk-to-europe-by-ferry",
  );

  assert.deepEqual(override, {
    title: "UK to Europe Ferry Routes: Times and Booking",
    description:
      "Five UK to Europe ferry crossings compared: Dover to Calais in 90 minutes, Hull to Rotterdam in 11-12 hours, plus booking, car and passport basics.",
  });
  assert.ok(override.title.length <= 49);
  assert.ok(override.description.length <= 158);
});

test("normalizes override slugs and leaves unknown posts untouched", () => {
  assert.equal(
    getBlogSeoOverride(
      "  THE-BEST-REAL-TIME-WORD-COUNTER-TOOLS-YOU-SHOULD-TRY-TODAY  ",
    )?.title,
    "Best Real-Time Word Counter Tools Compared",
  );
  assert.equal(getBlogSeoOverride("not-a-real-post"), null);
  assert.equal(getBlogSeoOverride(), null);
});

test("reindexed posts have authored metadata while unservable posts stay noindex", () => {
  const ferrySlug =
    "ultimate-guide-to-crossing-from-the-uk-to-europe-by-ferry";
  const trivagoSlug =
    "trivago-singapore-find-the-best-hotel-deals-for-your-stay";

  assert.ok(getBlogSeoOverride(ferrySlug));
  assert.equal(shouldNoindexBlogPost(ferrySlug), false);
  assert.equal(getBlogNoindexReason(ferrySlug), "");

  assert.equal(shouldNoindexBlogPost(trivagoSlug), true);
  assert.match(getBlogNoindexReason(trivagoSlug), /navigational query/i);
});
