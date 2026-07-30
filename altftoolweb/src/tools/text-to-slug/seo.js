const seo = {
  intro:
    "Text to Slug converts a title, heading or filename into a lowercase, hyphen-separated URL slug by applying Unicode NFKD normalisation, stripping the accent marks it exposes, spelling out &, @ and + as \"and\", \"at\" and \"plus\", dropping apostrophes, and collapsing every remaining non-alphanumeric run into a single hyphen. It is for anyone naming a page, a blog post, a docs anchor or an asset file and wanting the same clean result every time. \"Café & Restaurant Guide\" comes out as cafe-and-restaurant-guide.",
  useCases: [
    "Publishing a post titled \"React.js @ Scale\" and needing the permalink now, before the CMS auto-generates something with a stray dot or trailing hyphen in it — you get react-js-at-scale.",
    "Renaming a batch of download files so they survive URLs and shell commands: apostrophes and quotes disappear rather than turning into hyphens, so \"Editor's Handbook\" becomes editors-handbook, not editor-s-handbook.",
    "Checking what an accented or punctuation-heavy headline will look like in a URL before you commit to it, so you do not have to set up a 301 redirect a week later when the ugly slug is already indexed.",
  ],
  benefits: [
    [
      "Accents folded, not deleted",
      "NFKD splits é into e plus a combining mark and only the mark is removed, so café keeps its c-a-f-e instead of losing the letter entirely.",
    ],
    [
      "Symbols spelled out where it matters",
      "&, @ and + become and, at and plus before the strip step, so \"C++ vs C#\" reads as c-plus-plus-vs-c rather than collapsing to a bare c-vs-c.",
    ],
    [
      "No double or dangling hyphens",
      "Repeated separators collapse to one and leading or trailing hyphens are trimmed, which is exactly the shape most routers and CMS uniqueness checks expect.",
    ],
  ],
  faqs: [
    [
      "What makes a good URL slug?",
      "Lowercase ASCII letters, digits and single hyphens as word separators, kept short and readable. Hyphens rather than underscores are the long-standing search-engine convention for word boundaries, and lowercase avoids the case-sensitivity mismatch between servers that treat /About and /about as two different pages.",
    ],
    [
      "Does it handle accented characters and emoji?",
      "Accents are folded to their base Latin letter — é becomes e, ü becomes u, ñ becomes n — because NFKD normalisation separates the combining mark and the mark is then stripped. Emoji, punctuation and any other non-alphanumeric character are treated as separators and collapse into a hyphen.",
    ],
    [
      "Why did my Cyrillic, Greek or Chinese title come out empty?",
      "Only A–Z, a–z and 0–9 survive, so a title written entirely in a non-Latin script has no characters left and returns an empty slug. Transliterate the title to Latin characters first, or keep a short Latin working title alongside the display title.",
    ],
    [
      "Can I convert several titles at once?",
      "No — the whole input box is treated as one string, so line breaks become hyphens and multiple lines join into a single slug. Paste one title at a time to get one slug per conversion.",
    ],
  ],
};

export default seo;
