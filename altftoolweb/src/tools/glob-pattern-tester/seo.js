const seo = {
  intro:
    "The Glob Pattern Tester answers whether a glob matches a given string and shows the exact regular expression it compiles to: * becomes .*, ? becomes . , every other regex metacharacter is escaped literally, and the whole thing is anchored with ^ and $. Type a pattern like *.js and a string like app.js, toggle case-insensitivity if you need it, and you get a yes/no plus the compiled regex source. It is for developers debugging an ignore rule, a CI path filter or a config glob that is matching more or less than they expected.",
  useCases: [
    "A build step is skipping a file you expected it to pick up, and you want to confirm whether src/*/util.ts really matches src/lib/nested/util.ts before rewriting the config.",
    "You are writing a deny-list rule and need to check that *.min.js catches vendor.min.js but not minify.js, without running the pipeline again.",
    "You are porting a shell-style pattern into code that takes a regex, and you want the escaped, anchored equivalent handed to you rather than converting it by hand.",
  ],
  benefits: [
    [
      "Shows the compiled regex, not just a verdict",
      "The exact anchored pattern source is printed, so you can paste it straight into code or see why an unexpected character changed the match.",
    ],
    [
      "Whole-string matching, like real glob rules",
      "The compiled expression is anchored at both ends, so a pattern must consume the entire string — no accidental substring matches to mislead you.",
    ],
    [
      "Case sensitivity is a deliberate switch",
      "Toggling ignore-case adds the regex i flag, which lets you reproduce the difference between a case-sensitive Linux runner and a case-insensitive macOS or Windows filesystem.",
    ],
  ],
  faqs: [
    [
      "Which glob wildcards are supported?",
      "Two: * matches any run of characters including none, and ? matches exactly one character. Everything else — dots, plus signs, brackets, braces, parentheses — is escaped and matched literally, so *.js matches app.js but not appxjs.",
    ],
    [
      "Does ** work for matching across directories?",
      "There is no separate ** behaviour here. Because * compiles to .*, which also matches the / character, a single * already crosses directory boundaries — src/*/index.ts will match src/a/b/index.ts. That differs from tools like Git and most build systems, where a single * stops at a slash and you need ** to descend, so verify path-heavy patterns against your actual tool.",
    ],
    [
      "What regex does *.js compile to?",
      "^.*\\.js$ — the star becomes .*, the dot is escaped to \\., and ^ plus $ anchor the whole string. With the ignore-case toggle on, the same source is compiled with the i flag so App.JS also matches.",
    ],
    [
      "Why does my pattern fail on an empty or partial string?",
      "Because matching is all-or-nothing against the full test string. A pattern like *.js will not match a bare js or a trailing fragment, and an empty pattern returns no result at all — add a leading * if you intended a suffix match rather than a whole-name match.",
    ],
  ],
};

export default seo;
