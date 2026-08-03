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
 * CORPUS NOTE — RETRACTED 2026-08-03. The note that stood here was wrong, and
 * the way it was wrong is worth keeping.
 *
 * It reported that a complete pass through /api/blogs returned 548 posts all of
 * roughly 300 words, none over 400, and concluded the corpus was uniform
 * generated scaffold. That measurement came from the LIST endpoint, which
 * truncates `content` at about 310 words. The full bodies are not truncated,
 * and they are much longer.
 *
 * Measured against each page's own BlogPosting JSON-LD, whose wordCount
 * getWordCount() computes from the body the server actually renders:
 *   5-must-know-travel-websites      API 309 words   real 1,159
 *   cardione-review                  API 308         real 1,511
 *   french-open-makes-history        API 319         real   937
 *   intenskin-review                 API 310         real 1,689
 *   trip-com-travel-guide            API 310         real 1,653
 *   ultimate-guide-...-by-ferry      API 306         real 1,464
 *
 * So: do not measure a blog body through /api/blogs. Read the page's own
 * wordCount, or fetch the single post. A word count taken from the list
 * endpoint is a truncation artefact and will make every post look like filler.
 */

/**
 * Posts whose ranking queries this site structurally cannot satisfy.
 *
 * These are not thin-content cases and not CTR cases — the intent behind the
 * queries has no answer on a utility-tools domain, so the impressions cannot
 * convert no matter how the snippet is written. Combined they drew 1,711
 * impressions and 2 clicks (0.12%) in the export window.
 *
 * The bar for an entry here is deliberately high: the query must be one no
 * snippet could win. A post that lost its clicks to a broken title or a
 * truncated description is NOT an unservable-intent case — it is a snippet
 * case, and it belongs in ./blogSeoOverrides.js instead.
 */
const UNSERVABLE_INTENT_SLUGS = {
  // REMOVED 2026-07-30: ultimate-guide-to-crossing-from-the-uk-to-europe-by-ferry
  // (985 imp / 0 clicks / pos 11.6) was listed here as ferry-route intent that
  // "no AltFTool tool serves". Re-checked against the live page and the reason
  // did not hold up:
  //   - The shipped <title> was "Ultimate Guide to Crossing from the UK to
  //     Europe | AltFTool". compactBrandedTitle() clipped "by Ferry", so the
  //     one word present in every ranking query was absent from the title, and
  //     the description was the body's first sentence cut at "Unlike flying,
  //     where the journey." Zero clicks cannot be read as unservable intent
  //     when the snippet never showed the keyword.
  //   - A later corpus audit found that the live body no longer contains the
  //     route table or long-form details previously cited here. The matching
  //     metadata override was therefore removed rather than shipping claims
  //     the page cannot support.
  // The slug remains out of this per-post list only to preserve the existing
  // visibility decision until the thin blog corpus is reviewed as a whole.

  // 747 impressions, 0 clicks, avg position 10.2. Top query is "trivago
  // singapore" (363 imp, 0 clicks, pos 7.01) — a navigational query for
  // trivago's own site. Ranking 7th for someone else's brand name yields
  // nothing and never will.
  // Re-checked 2026-07-30: this post has the same clipped title ("…Hotel Deals
  // For | AltFTool") and a description cut mid-word ("…and move to t."), so the
  // snippet is broken too — but it stays noindexed anyway. Position 7 with 363
  // impressions and zero clicks on a brand-navigational query means searchers
  // saw the result and wanted trivago.com; no wording wins that, and
  // intercepting another company's brand query is not a play worth fixing.
  "trivago-singapore-find-the-best-hotel-deals-for-your-stay":
    "Navigational query for a third-party brand. 747 imp / 0 clicks / pos 10.2.",

  // 964 impressions, 2 clicks, avg position 10.2. Top query "what is iim"
  // (625 imp, 2 clicks, pos 10.16) is a definition lookup about Indian MBA
  // colleges. This is the most debatable entry in the list: it holds a
  // page-one position and is the only one earning any clicks at all. It is
  // included because those 2 clicks cannot become tool usage, and the post
  // spends the domain's topical authority on an unrelated subject.
  // Re-checked 2026-07-30 against the live page, and unlike the ferry post
  // there is no snippet defect to blame: the title already opens with the exact
  // query ("What is IIM? Complete Guide to India's Top MBA | AltFTool"), so a
  // rewrite has nothing to fix. The 1,150-word body names IIMs and the CAT
  // stages but carries no fees, cut-offs, NIRF ranks or placement figures, and
  // it is filed under the "Digital Tools" section rather than any education
  // category — a one-off, not a content pillar. It stays noindexed.
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
