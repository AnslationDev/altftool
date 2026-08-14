const seo = {
  title: "HTML to Plain-Text Email Converter for Multipart",
  steps: [
    "Paste your campaign markup into the HTML input panel, or use Upload .html to load a .html or .htm file.",
    "Watch the Plain-text output panel convert as you type: anchors become Text (URL), H1 gains an = underline, and 1x1 tracking pixels are skipped.",
    "Check the chars, words and lines counters, then use Copy text or Download .txt to save email-plain-text.txt.",
  ],
  intro:
    "This converter turns an HTML email into the plain-text alternative half of a multipart/alternative send, parsing the markup with the browser's own DOMParser and walking the tree with fixed rules: links become \"anchor text (https://url)\", H1 and H2 get = and - underlines, lists become bulleted or numbered lines with two-space indents per nesting level, and blockquotes are prefixed with >. Tracking pixels, display:none preheaders, scripts, styles and hidden elements are dropped rather than rendered as stray text. It is for anyone sending marketing or transactional mail who needs a text part that reads properly instead of a tag-stripped mess.",
  useCases: [
    "Your ESP requires a text/plain part for every campaign and the auto-generated one turns your layout tables into a wall of run-together words",
    "You need to check what a subscriber sees in a text-only client or a smartwatch preview before the send goes out",
    "You are debugging spam placement and want to confirm the text part carries the same links and unsubscribe line as the HTML part, with no leftover tracking pixel alt text",
  ],
  benefits: [
    ["Layout tables and data tables handled differently", "Tables marked role=\"presentation\", or whose cells contain block content, are flattened into paragraphs; genuine data tables are rendered as aligned columns."],
    ["Tracking pixels and preheaders removed", "1x1 and 0x0 images, and any element styled display:none, visibility:hidden or opacity:0, are skipped so they never appear as [Image] or a stray sentence."],
    ["Links stay usable", "Anchor text is kept with the URL in parentheses, mailto: and tel: prefixes are stripped, and a link whose visible text already is the URL is not duplicated."],
  ],
  faqs: [
    [
      "How are links written in the plain-text version?",
      "As anchor text followed by the URL in parentheses — \"Read the full changelog (https://example.com/changelog)\". Empty anchors fall back to the bare URL, mailto: and tel: prefixes are stripped so the address or number shows plainly, and in-page # anchors and javascript: hrefs are dropped, leaving just their text.",
    ],
    [
      "Does it remove tracking pixels?",
      "Yes. Any img with width and height of 1 and 1 or 0 and 0, or with inline styles setting width and height to 0px or 1px, is skipped entirely. Real images become [Image: alt text], or just [Image] when no alt attribute is present.",
    ],
    [
      "How wide are the table columns in the output?",
      "Columns are padded to their content width, capped at 30 characters each. If the combined width of all columns comes to 78 characters or less the table is rendered as aligned columns separated by two spaces; anything wider falls back to pipe-separated \"cell | cell\" rows so nothing wraps unpredictably.",
    ],
    [
      "Is my email content uploaded anywhere?",
      "No. Parsing uses the browser's built-in DOMParser and the parsed document is never attached to the live page, so no scripts in the pasted HTML execute and no network request is made. Very large inputs still convert, but above 500KB a warning suggests trimming the template first.",
    ],
  ],
};

export default seo;
