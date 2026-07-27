const seo = {
  "intro": "URL Slug Generator turns headlines into clean, lowercase, hyphenated slugs that are safe in any URL. It transliterates accented Latin, German, Cyrillic and Greek letters to ASCII, converts symbols such as & and % into words, optionally strips stop words, enforces a maximum length at a word boundary, and numbers duplicate slugs. Paste one title or a whole list — bloggers, CMS editors and developers can generate hundreds of slugs at once.",
  "useCases": [
    "Create a permalink for a new blog post before publishing it in WordPress or a headless CMS.",
    "Bulk-convert an export of 200 product names into slugs for an ecommerce migration.",
    "Turn a non-English title with accents or Cyrillic text into an ASCII-only URL that never percent-encodes."
  ],
  "benefits": [
    [
      "Real transliteration",
      "Café becomes cafe, Straßenfest becomes strassenfest and Привет becomes privet — not stripped-out gaps."
    ],
    [
      "Bulk with de-duplication",
      "Paste one title per line; identical slugs are automatically numbered so your URLs stay unique."
    ],
    [
      "Length capped cleanly",
      "Slugs are trimmed at the last full word, so you never ship a URL ending in half a word."
    ]
  ],
  "faqs": [
    [
      "What makes a good URL slug?",
      "Keep it lowercase, hyphen-separated, ASCII-only and short — roughly three to six meaningful words. Hyphens are preferred over underscores because search engines treat them as word separators."
    ],
    [
      "Should I remove stop words from slugs?",
      "It is optional. Removing words like 'the' and 'of' shortens the URL, but keep them when dropping them makes the slug read strangely or changes its meaning."
    ],
    [
      "Are hyphens or underscores better in URLs?",
      "Hyphens. Google has long treated a hyphen as a word separator and an underscore as a word joiner, so best-blog-post is read as three words while best_blog_post can be read as one."
    ],
    [
      "Will changing an existing slug hurt my SEO?",
      "Changing a live URL breaks the old link unless you add a 301 redirect from the old slug to the new one. Set the redirect at the same time as the change so links and rankings carry over."
    ]
  ]
};

export default seo;
