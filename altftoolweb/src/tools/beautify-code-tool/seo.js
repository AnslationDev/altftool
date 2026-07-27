const seo = {
  intro:
    "Code Beautifier re-indents a messy snippet — JavaScript, JSON, CSS, HTML, XML or SQL — into readable, consistently nested code, and compacts it again on demand. Indentation for the JavaScript, CSS and HTML family is produced by js-beautify; JSON is parsed with the browser's own parser so a syntax error is reported with its exact line and column, and SQL is re-laid-out one clause per line with parenthesised sub-queries indented. It is for developers reading minified output, a log line or a snippet pasted out of a chat.",
  useCases: [
    "Make a one-line JSON API response readable, and find the exact character where an invalid payload breaks",
    "Re-indent a SQL query copied out of an ORM log so the joins and WHERE conditions are visible",
    "Expand a minified CSS or HTML fragment enough to see what a third-party widget is actually injecting",
  ],
  benefits: [
    ["Six languages, one box", "JavaScript, JSON, CSS, HTML, XML and SQL, with automatic language detection from the snippet's shape."],
    ["Errors located, not just reported", "Invalid JSON comes back with a line and column, so you go straight to the trailing comma."],
    ["Safe JavaScript compaction", "Comments and indentation are removed but line breaks are kept, so automatic semicolon insertion cannot change behaviour."],
  ],
  faqs: [
    [
      "Does beautifying code change what it does?",
      "No. Beautifying only alters whitespace and line breaks, never tokens, so the program is identical. The one place whitespace matters in JavaScript is automatic semicolon insertion, which is why this tool's minify mode keeps every line break rather than collapsing the file onto one line.",
    ],
    [
      "How many spaces should I indent with?",
      "Two is the most common default — it is what Prettier, the Google JavaScript style guide and the Node.js codebase use. Four suits Python-influenced teams and PHP's PSR-12. The width matters far less than being consistent across a repository, which is why most teams commit an .editorconfig or a Prettier config rather than arguing.",
    ],
    [
      "Why does my JSON fail to parse?",
      "The three usual causes are a trailing comma after the last item, single quotes instead of double quotes, and unquoted property names — all legal in JavaScript object literals but forbidden by RFC 8259. This tool reports the line and column where the parser stopped, which is normally one character past the real mistake.",
    ],
    [
      "Is this a replacement for a real minifier?",
      "No. Terser or esbuild rename variables, drop dead branches and rewrite expressions, typically cutting 40–60% off a bundle; this tool only removes comments and indentation, which is closer to 10–20% and completely reversible. Use it to read code, and use a build-step minifier to ship it.",
    ],
  ],
};

export default seo;
