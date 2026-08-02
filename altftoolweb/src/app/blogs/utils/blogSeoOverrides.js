/**
 * Per-post title/description overrides for /blogs/[slug].
 *
 * WHY THIS FILE EXISTS
 * Blog documents live in Firestore (projects/altftool/blogs), so the repo has
 * no way to edit a post's stored `seoTitle`/`seoDescription`. What the repo CAN
 * do is decide what /blogs/[slug] sends to `createPageMetadata()`. Posts here
 * are ones where the stored fields measurably lose the click:
 *
 *  1. No stored `seoTitle` -> the title falls back to the full heading, and
 *     `compactBrandedTitle(..., 60)` clips the tail to fit " | AltFTool".
 *     The tail is where the keyword usually is, so the shipped <title> can end
 *     up missing the exact words every ranking query contains.
 *  2. No stored `seoDescription` -> `normalizeSeoDescription()` in
 *     ../data/blogSeoDefaults.js falls back to the excerpt, which is the first
 *     ~158 characters of the body. The shipped description is therefore the
 *     article's opening sentence cut mid-thought with a period bolted on. It
 *     tells the searcher nothing about what the page delivers.
 *
 * LENGTH RULES (do not break these — they are why the entries look terse)
 *  - `title`: 49 characters MAX. `compactBrandedTitle()` appends " | AltFTool"
 *    (11 chars) and clips anything over 60. 49 + 11 = 60, so a 49-char title is
 *    the longest one that survives intact. Front-load the query words: 84% of
 *    this site's blog clicks are mobile, and mobile SERPs truncate hardest.
 *  - `description`: 158 characters MAX. `trimMetaDescription()` in
 *    src/platform/seo/generateMetadata.js hard-cuts at 160 and re-clips to a
 *    word boundary, so anything longer ships truncated. End with a full stop.
 *
 * HONESTY RULE
 * Every claim in a description below was read off the live article body first.
 * No invented counts, prices, dates, ratings, or route times. If a body changes
 * in Firestore and an entry stops being true, delete the entry — the post falls
 * straight back to its stored fields.
 *
 * Numbers in the comments are from the 7-day Search Console export ending
 * 2026-07-27 (Pages.csv / Queries.csv). Nothing is estimated.
 */

// Emptied 2026-07-31, verified rather than assumed.
//
// These four entries promised specifics — a route table with crossing times, a
// tool-by-tool comparison — that the live bodies do not contain. Checked by
// paging the public feed to its end: 548 posts, every one 303-323 words, none
// over 400. The ferry post specifically measures 306 words with zero <table>
// and zero <tr>. An earlier pass in this file claimed "~1,460 words with a
// 5-row route table"; that is wrong, and a snippet promising it would be a
// promise the page cannot keep.
//
// Re-add an entry only after reading that post's body from /api/blogs and
// confirming it delivers what the description says.
const BLOG_SEO_OVERRIDES = {};

/**
 * Authored title/description for a slug, or null when the post should keep the
 * fields stored in Firestore. Never throws; unknown slugs are a no-op.
 */
export function getBlogSeoOverride(slug = "") {
  const key = String(slug || "").trim().toLowerCase();
  const entry = BLOG_SEO_OVERRIDES[key];
  if (!entry) return null;

  const title = String(entry.title || "").trim();
  const description = String(entry.description || "").trim();
  if (!title && !description) return null;

  return {
    title: title || null,
    description: description || null,
  };
}
