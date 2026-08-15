const seo = {
  title: "Robots.txt Generator: Allow, Disallow",
  metaDescription:
    "Build robots.txt from a form: global allow or Disallow: /, per-crawler rules grouped by user agent, Crawl-delay and a Sitemap line, with a live preview.",
  steps: [
    "In the Crawler Configuration Form set Global Bot Access to \"Allow All Bots (*)\" or \"Block All Bots (*)\", pick a Crawl Delay of 2, 5 or 10 seconds, and paste a Sitemap Path such as https://example.com/sitemap.xml.",
    "Add each path under Global Disallowed Directories, then use \"Add Bot-Specific Directives\" to pair Googlebot, Bingbot, Baiduspider, Yandex, Yahoo Slurp or Alexa ia_archiver with Disallow or Allow and a path.",
    "\"File Preview (robots.txt)\" rebuilds on every change so you see the literal text that will ship; Copy puts it on the clipboard and Download saves it as robots.txt for your site root.",
  ],
  intro:
    "The Robots.txt Generator builds a valid Robots Exclusion Protocol file from a form: a global User-agent: * group that either allows everything (an empty Disallow:) or blocks everything (Disallow: /), a list of disallowed paths, per-crawler Allow and Disallow rules grouped by user agent, an optional Crawl-delay, and a Sitemap line. The preview updates as you type and you can copy it or download it as robots.txt ready for your site root. It is for site owners who know which directories should stay out of search results but not the exact syntax that expresses it.",
  useCases: [
    "You are launching a site and need /admin/, /private/ and /tmp/ kept out of crawls while everything else stays open, without hand-writing the file.",
    "A staging or pre-launch site needs to be closed to all crawlers, which is a single Disallow: / under User-agent: * — and you want to be sure that is exactly what you deploy.",
    "You want one crawler treated differently from the rest, such as blocking a specific bot from a directory while allowing another bot into a public folder, correctly grouped under its own user-agent block.",
  ],
  benefits: [
    ["Correct grouping by user agent", "Rules for the same crawler are collected into one User-agent block rather than scattered, which is how parsers expect directives to be scoped."],
    ["Live preview of the exact file", "The output rebuilds on every change, so you see the literal text that will ship instead of guessing what the form produced."],
    ["Sitemap and crawl directives in the right places", "The Sitemap line is emitted independently of the user-agent groups, and an optional Crawl-delay sits with the global group."],
  ],
  faqs: [
    [
      "Where does the robots.txt file go?",
      "At the root of the host it applies to — https://example.com/robots.txt — and nowhere else. A file in a subdirectory is ignored, and each subdomain and each scheme needs its own, so www and non-www are separate files as far as crawlers are concerned.",
    ],
    [
      "How do I block all search engines from my site?",
      "Use User-agent: * followed by Disallow: / , which is what the block-everything option generates. An empty Disallow: line means the opposite — it allows everything — so the difference between blocking and allowing your entire site is the single slash.",
    ],
    [
      "Does Google respect the Crawl-delay directive?",
      "No. Crawl-delay was never part of the original Robots Exclusion Protocol and Google's crawlers ignore it; some other crawlers, including Bing and Yandex, do honour it. Use Search Console's crawl rate settings if you need Googlebot to slow down.",
    ],
    [
      "Will disallowing a page keep it out of search results?",
      "Not reliably. Disallow stops crawling, not indexing — a blocked URL linked from elsewhere can still appear in results without a description. To keep a page out of the index, allow it to be crawled and serve a noindex meta tag or X-Robots-Tag header instead, and remember robots.txt is public and is not an access control.",
    ],
  ],
};

export default seo;
