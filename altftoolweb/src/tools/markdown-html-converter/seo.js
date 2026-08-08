const seo = {
  title: "Markdown to HTML Converter, and HTML Back to Markdown",
  metaDescription:
    "Convert Markdown to HTML with GitHub-flavoured tables and strikethrough, or turn HTML back into Markdown or plain text. Runs in your browser.",
  steps: [
    "Paste your text into the Input box and choose a Direction: Markdown → HTML, HTML → Markdown, or HTML → plain text.",
    "Leave \"Allow raw HTML in the Markdown\" unticked so pasted tags stay escaped as text, or tick it to pass raw HTML straight through — the result re-renders on every keystroke, with no convert button.",
    "Read the Result box, which reports output characters, words and lines plus reading time at 200 wpm, then press Copy result; Reset restores the sample release-note Markdown.",
  ],
  intro:
    "This converter turns Markdown into HTML and takes HTML back to Markdown or plain text, entirely in your browser. The Markdown side covers the CommonMark constructs people actually type — ATX headings, paragraphs, hard line breaks, emphasis, inline and fenced code, links, images, blockquotes, ordered and unordered lists and thematic breaks — plus the GitHub Flavored Markdown extensions for tables and strikethrough. Text is HTML-escaped by default and only http, https, mailto, tel and relative URLs are emitted, so a pasted snippet cannot inject markup or a javascript: link into your page.",
  useCases: [
    "Paste a README and get HTML you can drop straight into a CMS field or an email template.",
    "Convert a block of CMS-generated HTML back into Markdown for a docs repository.",
    "Strip tags from a scraped page to get clean plain text with a word count and reading time.",
  ],
  benefits: [
    ["Escaped by default", "Angle brackets and quotes in your text stay text; raw HTML is opt-in with one checkbox."],
    ["Safe links only", "javascript: and data: URLs are left as literal text instead of becoming clickable."],
    ["Round-trips cleanly", "Markdown converted to HTML and back returns the same headings, lists, tables and code fences."],
  ],
  faqs: [
    [
      "Does this support GitHub Flavored Markdown tables?",
      "Yes. A header row followed by a divider row of dashes becomes a full <table> with <thead> and <tbody>, and the reverse direction rebuilds the pipe-and-dash syntax. Strikethrough with ~~double tildes~~ is supported too.",
    ],
    [
      "Is my document uploaded to a server?",
      "No. Both directions are plain JavaScript running in the page, with no network request, so drafts and internal documentation stay on your machine.",
    ],
    [
      "Why was my HTML in the Markdown escaped?",
      "Because raw HTML is off by default: `<div>` comes out as &lt;div&gt; so pasted content cannot inject markup. Tick \"Allow raw HTML in the Markdown\" to pass tags straight through, which is what CommonMark does by default.",
    ],
    [
      "What Markdown features are not supported?",
      "Reference-style links (`[text][ref]` with a definition elsewhere), nested blockquotes, nested lists beyond one level, footnotes and setext headings written with underlines of === or ---. Everything else in the list above converts both ways.",
    ],
  ],
};

export default seo;
