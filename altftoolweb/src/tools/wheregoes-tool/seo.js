const seo = {
  title: "WhereGoes Tool — Trace Any URL's Redirect Chain",
  h1: "WhereGoes Tool — URL Redirect & Link Checker",
  metaDescription:
    "See exactly where any link redirects. WhereGoes traces the full hop-by-hop chain, HTTP status codes, and response headers — free, instant, no signup.",
  intro:
    "WhereGoes Tool traces what actually happens when a URL is requested: it follows every redirect hop from the original link to its final destination, reporting the HTTP status code (301, 302, 307…) and response headers at each step. Paste any link and get the full chain in seconds — no signup, no browser extension.",
  useCases: [
    "Checking where a shortened link (bit.ly, t.co, an affiliate or tracking link) actually leads before you click it",
    "Debugging a redirect loop or an unexpected extra hop in your own site's URLs",
    "Verifying that a 301 redirect is set up correctly after a site migration or URL change",
  ],
  benefits: [
    [
      "Full redirect chain, not just the final URL",
      "See every hop the link passes through, in order, with the HTTP status code (301, 302, 307, meta refresh…) for each one.",
    ],
    [
      "Response headers included",
      "Inspect the headers returned at each hop — useful for debugging caching, redirects, and tracking parameters.",
    ],
    [
      "Free, instant, no signup",
      "Paste a link and get results in seconds; no account required for normal use.",
    ],
    [
      "Works on any link",
      "Shortened URLs, affiliate links, UTM-tagged campaign links, or your own site's redirects — trace any of them.",
    ],
  ],
  faqs: [
    [
      "What does WhereGoes Tool do?",
      "It traces the full redirect chain of any URL — every hop from the link you paste to its final destination — and shows the HTTP status code and response headers at each step, so you can see exactly where a link goes before you click it.",
    ],
    [
      "How do I check where a shortened or tracking link actually goes?",
      "Paste the link into WhereGoes Tool and it follows every redirect automatically, showing the final destination plus every hop in between — no need to click the link yourself to find out.",
    ],
    [
      "Is WhereGoes Tool free to use?",
      "Yes, it's free with no signup required for normal use.",
    ],
    [
      "What's the difference between a 301 and a 302 redirect, and does WhereGoes show it?",
      "Yes — each hop in the chain shows its exact status code. A 301 is a permanent redirect, and search engines transfer ranking signals to the new URL; a 302 is temporary, and the original URL keeps being treated as the real one. Seeing the code at each hop tells you which type a given link is using.",
    ],
    [
      "Can I check a UTM-tagged campaign link without losing the tracking parameters?",
      "Yes — paste the full URL including its UTM parameters, and WhereGoes traces the actual redirect chain while showing exactly what each hop received.",
    ],
    [
      "Does WhereGoes Tool work as a URL expander for shortened links?",
      "Yes. Paste any shortened link (bit.ly, t.co, or similar) and it resolves the full chain down to the real final destination URL.",
    ],
    [
      "Is there an API for checking redirects programmatically?",
      "The web tool doesn't expose a public API today — use the page directly by pasting the URL you want to trace.",
    ],
    [
      "Why does the tool show my link resolving through a domain I didn't expect?",
      "That's normal for tracking, affiliate, and shortened links — they're designed to redirect through one or more intermediate domains before reaching the final page. WhereGoes shows the full path so nothing is hidden.",
    ],
  ],
  steps: [
    "Paste the URL you want to trace into the box.",
    "WhereGoes Tool follows every redirect hop automatically.",
    "Review the full chain — final destination, status codes, and response headers for each step.",
  ],
};

export default seo;
