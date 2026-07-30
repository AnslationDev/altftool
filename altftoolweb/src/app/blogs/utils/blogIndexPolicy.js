/**
 * Per-post indexing policy for /blogs/[slug].
 *
 * Blog bodies live in Firestore (projects/altftool/blogs), not in this repo, so
 * the repo cannot unpublish or rewrite a post. What it CAN control is whether
 * the rendered page asks to be indexed. `createPageMetadata()` already accepts
 * a `noindex` flag (src/platform/seo/generateMetadata.js) and the blog hub
 * pages use it — category, tag, author and topic hubs all noindex when thin —
 * but /blogs/[slug] never passed it, so every published post was indexable
 * regardless of whether it could serve the queries it ranked for.
 *
 * Entries below are drawn from the 7-day Search Console export
 * (Pages.csv / Queries.csv). Each one records its own numbers. Nothing here is
 * estimated: if a slug is listed, the impression and click counts next to it
 * came straight out of that export.
 *
 * This is a live-visibility change. Removing a slug from the list restores
 * indexing on the next revalidate; there is no other state to unwind.
 */

/**
 * Posts whose ranking queries this site structurally cannot satisfy.
 *
 * These are not thin-content cases and not CTR cases — the intent behind the
 * queries has no answer on a utility-tools domain, so the impressions cannot
 * convert no matter how the snippet is written. Combined they drew 2,696
 * impressions and 2 clicks (0.07%) in the export window.
 */
const UNSERVABLE_INTENT_SLUGS = {
  // 985 impressions, 0 clicks, avg position 11.6. Every ranking query is a
  // literal ferry-route lookup ("ferry routes from uk to europe...", 37 imp
  // top query, 0 clicks). Nothing on AltFTool books or times a ferry.
  "ultimate-guide-to-crossing-from-the-uk-to-europe-by-ferry":
    "Ferry-route intent; no AltFTool tool serves it. 985 imp / 0 clicks / pos 11.6.",

  // 747 impressions, 0 clicks, avg position 10.2. Top query is "trivago
  // singapore" (363 imp, 0 clicks, pos 7.01) — a navigational query for
  // trivago's own site. Ranking 7th for someone else's brand name yields
  // nothing and never will.
  "trivago-singapore-find-the-best-hotel-deals-for-your-stay":
    "Navigational query for a third-party brand. 747 imp / 0 clicks / pos 10.2.",

  // 964 impressions, 2 clicks, avg position 10.2. Top query "what is iim"
  // (625 imp, 2 clicks, pos 10.16) is a definition lookup about Indian MBA
  // colleges. This is the most debatable entry in the list: it holds a
  // page-one position and is the only one earning any clicks at all. It is
  // included because those 2 clicks cannot become tool usage, and the post
  // spends the domain's topical authority on an unrelated subject.
  "what-is-iim-complete-guide-to-indias-top-mba-colleges":
    "Education-definition intent, unrelated to tools. 964 imp / 2 clicks / pos 10.2.",
};

/** Reason string for a noindexed slug, or "" when the post stays indexable. */
export function getBlogNoindexReason(slug = "") {
  const key = String(slug || "").trim().toLowerCase();
  return UNSERVABLE_INTENT_SLUGS[key] || "";
}

export function shouldNoindexBlogPost(slug = "") {
  return Boolean(getBlogNoindexReason(slug));
}
