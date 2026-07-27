const seo = {
  intro:
    "This CSS tool parses a stylesheet into a real node tree and then prints it two ways: formatted with one declaration per line, or minified to a single line with comments and whitespace removed. Because it scans characters rather than matching regular expressions, it handles the cases that break naive minifiers — semicolons inside url(data:image/svg+xml;base64,…), braces inside quoted content values, and commas inside :is() and :not(). It is for front-end developers who want a quick, offline tidy-up or size check without wiring up a build step.",
  useCases: [
    "Minify a hand-written stylesheet before pasting it into a CMS or an email template where no build pipeline exists",
    "Reformat CSS copied out of a minified bundle so you can read a specific rule and see how it cascades",
    "Measure how many bytes whitespace and comments are costing a stylesheet before deciding whether a build tool is worth it",
  ],
  benefits: [
    ["Safe minification", "Only whitespace and comments are removed — no property value is rewritten, so rendering cannot change."],
    ["Licence comments survive", "Comments opening with /*! are kept, matching the convention terser and cssnano follow."],
    ["Runs entirely offline", "The stylesheet never leaves the browser, so unreleased design work stays private."],
  ],
  faqs: [
    [
      "How much smaller does minifying CSS make a file?",
      "Whitespace and comment removal alone typically cuts 15-30% off a hand-written stylesheet — the exact figure is shown for your input. On top of that, gzip or Brotli on the server usually removes another 70-80%, and the two compound, so minified plus gzipped is where the real saving is.",
    ],
    [
      "Will minifying break my CSS?",
      "Not here. This tool only removes whitespace, comments and empty rules; it never merges rules, shortens colours, drops units or reorders declarations. Those transforms are where aggressive minifiers occasionally change rendering, so they are deliberately left out.",
    ],
    [
      "Why do some minifiers corrupt background images?",
      "Because a data URI legally contains semicolons — url(data:image/svg+xml;base64,…) — and a regex that splits declarations on ; cuts it in half. A real parser tracks parenthesis depth and string state, which is why this tool leaves the URI whole.",
    ],
    [
      "Does it keep my /*! licence header?",
      "Yes, when the option is ticked. A comment whose first character is an exclamation mark is the long-standing convention for a header that must survive minification, and it is honoured by terser, UglifyJS and cssnano too. Ordinary /* … */ comments are dropped.",
    ],
  ],
};

export default seo;
