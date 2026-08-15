const seo = {
  title: "URL Slug Collision Checker With WordPress",
  metaDescription:
    "Paste titles one per line and see which slugs collide after NFKD folding, lowercasing and truncation, with -2 and -3 suffixes assigned as a CMS would.",
  steps: [
    "Paste your post titles into the box, one title per line.",
    "Choose hyphen or underscore as the separator, set the maximum slug length, and optionally drop English stop words.",
    "Read the collision groups and the per-title table of final slug and normalisation steps, then press Copy result.",
  ],
  intro:
    "This checker normalises a list of titles into URL slugs and reports which ones land on the same path once accents, case and punctuation have been folded away. Normalisation follows the usual pipeline — transliterate the letters NFKD cannot decompose, apply Unicode NFKD and strip the combining marks in U+0300 to U+036F, lowercase, reduce everything outside a-z and 0-9 to a single separator, then truncate — and duplicates get WordPress-style numeric suffixes starting at -2. It also flags slugs that are empty, all-numeric, or reserved by a framework route.",
  useCases: [
    "Migrating a few hundred blog posts to a new CMS and finding, before the import runs, which titles will silently overwrite each other.",
    "Checking that \"Café Münster\" and \"Cafe Munster\" — two genuinely different articles — are not both about to claim /cafe-munster.",
    "Catching a product page titled \"Admin\" or \"Search\" that would shadow an application route once it becomes a top-level path.",
  ],
  benefits: [
    ["Shows the whole pipeline", "Expand any title to see the exact string after each normalisation step."],
    ["Truncation-aware", "Two long headlines with the same opening are caught after the length limit is applied, not before."],
    ["Deterministic suffixes", "The first title keeps the clean slug and later ones take the next free number, matching what a CMS would do."],
  ],
  faqs: [
    [
      "Why do two different titles produce the same URL slug?",
      "Because slug generation throws information away. Case is folded, accented letters are reduced to their base letter, and every run of punctuation or whitespace collapses to one hyphen. \"Cafe Munster\", \"Café Münster!\" and \"CAFE MUNSTER\" all reduce to cafe-munster, so the second and third need a suffix.",
    ],
    [
      "How does WordPress handle duplicate slugs?",
      "It keeps the first one clean and appends the lowest free integer starting at 2, giving my-post, my-post-2, my-post-3. It also skips numbers already taken, so if my-post-2 exists from a different title the next duplicate becomes my-post-3. The post_name column is VARCHAR(200), so a very long slug is trimmed to make room for the suffix.",
    ],
    [
      "Should a slug use hyphens or underscores?",
      "Hyphens. Google has said for years that it treats a hyphen as a word separator and an underscore as a word joiner, so my_blog_post reads as one token while my-blog-post reads as three words. Both characters are unreserved under RFC 3986 section 2.3, so neither needs percent-encoding — the difference is purely how search engines segment the words.",
    ],
    [
      "What happens to a title written entirely in a non-Latin script?",
      "It normalises to an empty string, because the pipeline keeps only a-z and 0-9. An empty slug cannot be a URL, so you need a fallback — a transliteration library for that script, the record id, or a manually written slug. This tool substitutes a positional placeholder and flags the row so the problem is visible rather than silent.",
    ],
  ],
};

export default seo;
