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

// Restored 2026-08-03. These four were deleted on the finding that their
// descriptions promised specifics the bodies do not contain — a route table
// with crossing times, a tool-by-tool comparison. That finding measured the
// bodies through /api/blogs, which truncates `content` at about 310 words, so
// every post looked like 300-word filler. The pages' own BlogPosting wordCount,
// computed by getWordCount() from what the server renders, puts these bodies at
// 1,464 and 1,570 words. The premise was a truncation artefact.
//
// Measure a blog body from the page's own wordCount or a single-post fetch,
// never from the list endpoint.
const BLOG_SEO_OVERRIDES = {
  // 985 impressions, 0 clicks, avg position 11.6.
  // Shipped title was "Ultimate Guide to Crossing from the UK to Europe |
  // AltFTool" — the clip dropped "by Ferry", so the one word present in every
  // ranking query ("ferry routes from uk to europe", …) was missing from the
  // title. Shipped description was the body's opening sentence, cut at
  // "Unlike flying, where the journey." Body verified: a 5-row route table
  // (Dover–Calais 1.5 h, Portsmouth–Caen 5–6 h, Portsmouth–Le Havre 9–10 h,
  // Hull–Rotterdam 11–12 h, Plymouth–Santander 20+ h) plus booking, onboard,
  // vehicle and passport/visa sections.
  "ultimate-guide-to-crossing-from-the-uk-to-europe-by-ferry": {
    title: "UK to Europe Ferry Routes: Times and Booking",
    description:
      "Five UK to Europe ferry crossings compared: Dover to Calais in 90 minutes, Hull to Rotterdam in 11-12 hours, plus booking, car and passport basics.",
  },

  // 484 impressions, 0 clicks, avg position 13.7; the word-count query cluster
  // around it drew 296 impressions and 0 clicks.
  // Shipped title was "The Best Real-Time Word Counter Tools You Should |
  // AltFTool" — clipped mid-phrase on a dangling "You Should". Shipped
  // description was the body opener cut at "…marketer, or business
  // professional,." Body verified: sections for WordCounter.net,
  // CharacterCountOnline, Grammarly, Google Docs, Hemingway Editor and
  // ProWritingAid, a features-to-look-for list, and a free vs paid section.
  "the-best-real-time-word-counter-tools-you-should-try-today": {
    title: "Best Real-Time Word Counter Tools Compared",
    description:
      "Compare real-time word counter tools: WordCounter.net, Grammarly, Google Docs, Hemingway and ProWritingAid, plus features to check and free vs paid notes.",
  },

  // 702 impressions, 0 clicks, avg position 29.0. Position 29 is page three, so
  // the snippet is not the whole story here — but the stored fields are broken
  // in both of the ways described above and a page cannot climb on a truncated
  // body-opener snippet. Shipped title carried a stray space before the colon
  // ("Email Types Explained : When and How to Use Them"); shipped description
  // was cut at "From professional work environments to personal." Body
  // verified: exactly ten numbered types (professional, personal, marketing,
  // transactional, informational, follow-up, request, complaint, thank you,
  // apology), each with tone/format guidance, plus a summary table and FAQ.
  "email-types-explained-when-and-how-to-use-them": {
    title: "10 Types of Emails and When to Use Each",
    description:
      "Professional, marketing, transactional, follow-up, complaint, apology and more: what each email type is for, the tone it needs, and a summary table.",
  },

  // 105 impressions, 0 clicks for "cyber monday deals 2026" at avg position
  // 6.5 — position six with zero clicks.
  // Shipped title was "Top Cyber Monday Software Deals You Should Grab |
  // AltFTool", which clipped "in 2026" — the year the searcher typed. Shipped
  // description was the body opener cut at "…looking to save money on."
  // Body verified: it names Grammarly, Canva, Adobe, Notion, Microsoft 365,
  // Jasper, NordVPN, Slack, Trello and Asana and walks through AI writing,
  // design, productivity and VPN categories, a 30-80% typical discount range,
  // and how to evaluate an offer. It lists NO prices and NO specific offers,
  // so the description promises guidance, not a deals table.
  "top-cyber-monday-software-deals-you-should-grab-in-2026": {
    title: "Cyber Monday 2026 Software Deals: What to Expect",
    description:
      "Which software discounts to expect on Cyber Monday 2026: AI writing, design, productivity and VPN tools, plus how to judge an offer before you buy.",
  },
};

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
