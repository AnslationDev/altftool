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
 * CORPUS NOTE — 2026-07-31. READ THIS BEFORE TRUSTING ANY WORD COUNT BELOW.
 *
 * The per-slug reasoning in this file was written against article bodies that
 * are no longer what Firestore serves. Every live post was re-read through the
 * public feed (`/api/blogs?offset=N&limit=100`) on 2026-07-31: 548 posts came
 * back, and all 548 have the same shape — one truncated opening sentence, then
 * four generated headings ("Who should use <Category>", "How to get a better
 * result", "Quality checks before you trust the output", "Continue your
 * workflow") — running 299-321 words. Not one post in the corpus exceeded 400
 * words.
 *
 * That contradicts, directly, two claims this file uses to justify live
 * decisions:
 *   - The removed ferry entry below says the body is "~1,460 words with a 5-row
 *     route table (real crossing times), booking, onboard, vehicle and passport
 *     sections". Measured 2026-07-31: 308 words, no table, no crossing times.
 *   - The IIM entry below says "The 1,150-word body names IIMs and the CAT
 *     stages". Measured 2026-07-31: 313 words of the scaffold above.
 * (For reference, the other noindexed slug, trivago-singapore, measures 312.)
 *
 * Both entries' *conclusions* are left standing — this note does not flip any
 * page's indexability, because deindexing on a corpus scale is a call for a
 * human, not a side effect of an audit. But the stated reasons are stale, and
 * the distinction the file draws between "thin content" and "unservable
 * intent" no longer separates anything: on current bodies every post is thin.
 *
 * The open question this raises is deliberately NOT answered here: 548 posts
 * are indexable and none of them delivers what its title promises. The
 * standing rule is that thin posts get noindex rather than machine-written
 * padding, and applying that rule honestly would deindex most of /blogs. That
 * needs an explicit decision, not a quiet commit.
 *
 * Re-measure before editing an entry. Do not copy a word count out of a
 * comment.
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
  //   - The body is not thin or off-pillar filler: ~1,460 words with a 5-row
  //     route table (real crossing times), booking, onboard, vehicle and
  //     passport sections, sitting in an active Travel category whose sibling
  //     posts (Kiwi.com, Trainline, TrainPal, Emirates, Etihad…) all stay
  //     indexed. Removing the best-performing one while keeping the weaker
  //     siblings was inconsistent, and blog pages carry ads, so the traffic has
  //     value even though no tool serves the query.
  // It now has an authored title/description in ./blogSeoOverrides.js. If it
  // still earns no clicks after that ships and re-ranks, add it back here.

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
