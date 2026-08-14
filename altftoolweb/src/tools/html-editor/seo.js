const seo = {
  title: "HTML Editor: Format, Minify, Escape and Unescape",
  metaDescription:
    "Reindent, minify, escape or decode an HTML fragment up to 500,000 characters. Void elements never indent; pre, textarea, script and style pass through.",
  steps: [
    "Paste your markup into the \"HTML in\" box, which accepts up to 500,000 characters.",
    "Pick Format, Minify, Escape or Unescape, then set the indent size or tick \"Drop every space between tags\".",
    "Check the bytes-in and bytes-out figures and the \"Tags never closed\" row, then press Copy output.",
  ],
  intro:
    "This HTML editor does four jobs on a fragment of markup: pretty-prints it with real indentation, minifies it by collapsing the whitespace the browser would collapse anyway, escapes the five markup-special characters (& < > \" ') into entities, and decodes named and numeric character references back to plain text. It follows the HTML Living Standard's void-element list, so tags like img, br and input never open an indent level, and it copies pre, textarea, script and style content through byte for byte. It is for developers cleaning up scraped or generated markup, and for anyone who needs to paste HTML into a CMS field as visible text.",
  useCases: [
    "Reindent a single-line HTML fragment pasted out of a minified template so you can read the nesting.",
    "Escape a code sample so it displays as markup in a blog post instead of rendering as elements.",
    "Strip comments and inter-tag whitespace from an email template before pasting it into a sending tool.",
  ],
  benefits: [
    ["Whitespace-safe", "Content inside pre and textarea is preserved exactly, because white-space: pre makes every space visible."],
    ["Flags broken nesting", "Reports tags that were never closed and closing tags with no opener instead of quietly reindenting around them."],
    ["Runs locally", "All four operations are plain string work in your browser — no upload, no size limit beyond 500,000 characters."],
  ],
  faqs: [
    [
      "Which characters need escaping in HTML?",
      "Five: & becomes &amp;, < becomes &lt;, > becomes &gt;, \" becomes &quot; and ' becomes &#39;. The ampersand must be replaced first, otherwise the entities produced by the other four get escaped a second time.",
    ],
    [
      "Does minifying HTML break the layout?",
      "Not with the default settings. Runs of whitespace in a text node are collapsed to one space, which is exactly what the browser does at render time, and whitespace-only gaps are dropped only between block-level elements. Turning on \"drop every space between tags\" can visually join two inline elements, so check that output.",
    ],
    [
      "Why is content inside <pre> left alone?",
      "Because pre carries CSS white-space: pre, so every space and newline inside it is rendered. Reindenting it would change what the reader sees. The same applies to textarea, and to script and style whose contents are raw text, not markup.",
    ],
    [
      "What is the difference between &#169; and &#xA9;?",
      "Nothing — both are numeric character references for the copyright sign, one in decimal and one in hexadecimal. This tool resolves both forms, plus around 40 named references such as &nbsp;, &mdash; and &pound;, in a single pass so nothing is decoded twice.",
    ],
  ],
};

export default seo;
