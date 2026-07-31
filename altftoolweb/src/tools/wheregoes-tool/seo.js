// Search Console, 7 days to 2026-07-27: /tools/all/wheregoes-tool took 1,483
// impressions at average position 2.9 and earned 13 clicks (0.9% CTR), and the
// sibling /tools/web/wheregoes-tool took 821 more at position 4.2 for 3 clicks.
// Position 3 normally earns 10%+.
//
// Two separate causes, and only one of them was a copy problem:
//
// 1. The snippet was the generic tool template rather than authored copy. The
//    exact strings Google served during that window are NOT recoverable from
//    this repo — the export carries no snippet column and the template has been
//    edited since — so no specific title or description is quoted here. What is
//    verifiable is that this tool had no curated title or description of its own
//    before these edits, so it inherited the formulaic template every tool
//    without curated SEO copy gets.
//
// 2. Every query feeding this page is the WhereGoes brand ("wheregoes",
//    "wheregoes url"); the only generic query in the whole export is "url
//    tracer" at 3 impressions. WhereGoes is somebody else's product, so a
//    searcher typing it wants wheregoes.com — at position 3, behind the brand's
//    own pages, no wording lifts that to 10%. The July 28-30 titles chased the
//    brand anyway ("WhereGoes Tool — Trace Any URL's Redirect Chain", then
//    "Trace URL Redirects — Free WhereGoes Alternative"), and "Alternative"
//    tells the brand searcher outright that this is not the site they asked for.
//
// So this stops bidding for the brand and targets the generic intent instead —
// "url redirect checker", "redirect checker", "url tracer", "where does this
// link go". Those words now lead the title, the H1 and the first sentence of the
// description, none of which previously contained "redirect checker" at all.
// The trade is deliberate: the ~16 brand clicks a week are at risk, and they are
// worth less than a page that can compete for the generic phrase. The slug keeps
// the brand token, and one honest, non-affiliated mention stays in the copy for
// anyone who lands here from the brand search.
//
// Authored title is 44 chars, so 55 rendered with the " | AltFTool" the root
// layout appends — inside the mobile truncation limit, which matters because 84%
// of this site's clicks are mobile.
const seo = {
  title: "URL Redirect Checker — See Where a Link Goes",
  h1: "URL Redirect Checker — See Every Hop a Link Takes",
  // 154 chars, ends in a period, so trimMetaDescription in
  // src/platform/seo/generateMetadata.js returns it byte-for-byte (the < 160
  // branch) instead of clipping it. Everything before char 118 — the part a
  // mobile SERP actually shows — carries the whole offer.
  //
  // Every claim is in the code: the per-hop status code, response time and
  // expandable headers are the "Status Code" / "Response Time" / "Actions"
  // columns in components/RedirectDetails.jsx, and the two export buttons are
  // ExportResults in components/SidebarCards.jsx. There is no signup path
  // anywhere in the tool.
  metaDescription:
    "Check where any short or tracking link goes. Trace every redirect hop, its 301/302 status code, response time and headers. Free, no signup, export as CSV.",
  intro:
    "A URL redirect checker shows what really happens when a link is requested. Paste any URL — a shortened link, an affiliate or tracking link, or one of your own — and the trace runs on a server, so you find out where the link leads without your browser ever visiting it. You get every hop in order with its HTTP status code (301, 302, 303, 307, 308), how long that hop took, and its full response headers on demand, plus the final destination URL. Nothing to install, no signup, and the finished chain exports as JSON or CSV. This tool is independent and not affiliated with wheregoes.com.",
  useCases: [
    "Checking where a shortened link (bit.ly, t.co, an affiliate or tracking link) leads before you click it",
    "Debugging a redirect loop or an unexpected extra hop in your own site's URLs",
    "Confirming a 301 redirect resolves correctly after a site migration or URL change",
  ],
  benefits: [
    [
      "The whole chain, not just the final URL",
      "Every hop the link passes through, in order, with the HTTP status code (301, 302, 303, 307, 308) returned at each one.",
    ],
    [
      "Headers for any hop you open",
      "Expand a row in the redirect table to read the response headers that hop returned — useful for caching, tracking and redirect debugging.",
    ],
    [
      "Timing for each step",
      "The response time of every hop, and the total, so you can see which redirect in the chain is the slow one.",
    ],
    [
      "Nothing to install, nothing to sign up for",
      "Open the page, paste a link, read the chain — no account and no browser extension. The finished trace exports as JSON or CSV.",
    ],
  ],
  faqs: [
    [
      "How do I check where a URL redirects?",
      "Paste the URL into the box and run the trace. The redirect chain comes back as a list: every hop from the link you pasted to its final destination, each with its HTTP status code, its response time, and its response headers on demand.",
    ],
    [
      "How do I see where a shortened or tracking link goes without clicking it?",
      "The trace runs on a server rather than in your browser, so the redirects are followed for you and you can read the final destination before deciding whether to open it.",
    ],
    [
      "What is the difference between a 301 and a 302 redirect?",
      "A 301 is permanent, and search engines pass ranking signals to the new URL; a 302 is temporary, and the original URL keeps being treated as the real one. Each hop in the chain shows its exact code, so you can tell which type a link is using.",
    ],
    [
      "Can it expand a short URL to its real destination?",
      "Yes. Paste any shortened link (bit.ly, t.co, or similar) and the chain resolves down to the final destination URL.",
    ],
    [
      "Will my UTM parameters survive the trace?",
      "Paste the full URL including its UTM parameters — the chain is traced exactly as given, and each row shows the URL that hop was sent to, so you can see where a parameter is dropped.",
    ],
    [
      "Is this URL redirect checker free?",
      "Yes — it is free to use, with no signup and no trial limit.",
    ],
    [
      "Is there an API for checking redirects programmatically?",
      "Not a public, documented one today. Use the page directly by pasting the URL you want to trace.",
    ],
    [
      "Is this wheregoes.com?",
      "No. This is an independent redirect checker on AltFTool and is not affiliated with, endorsed by, or connected to wheregoes.com. It is here because the URL of this page uses that name; the tool itself is our own.",
    ],
    [
      "Why does my link resolve through a domain I did not expect?",
      "That is normal for tracking, affiliate and shortened links — they redirect through one or more intermediate domains before reaching the final page. The chain shows every one of them, so nothing is hidden.",
    ],
  ],
  steps: [
    "Paste the URL you want to check into the box.",
    "Run the trace — every redirect hop is followed for you, server-side.",
    "Read the chain: final destination, status code, response time and headers for each hop.",
  ],
};

export default seo;
