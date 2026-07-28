const seo = {
  title: "Regex Tester Online — Free JavaScript Regex Debugger",
  h1: "Regex Tester — Live JavaScript Regex Matching",
  metaDescription:
    "Free online regex tester: live match highlighting, capture groups, positions. Runs on your browser's own JavaScript RegExp engine — nothing is uploaded.",
  intro:
    "The Regex Tester compiles your pattern with the browser's own new RegExp(pattern, flags) — the same ECMAScript engine your JavaScript runs on — and re-evaluates it on every keystroke. With the global flag on it walks the test string with repeated exec() calls, collecting each match's text, its zero-based start index and its numbered capture groups; with the flag off you get the first match only. An invalid pattern surfaces the browser's own SyntaxError message in a red alert instead of failing silently. Everything happens inside the page: your pattern and test text never leave the browser.",
  useCases: [
    "Checking an email, IPv4 or date validation pattern against a paragraph of real sample data before it goes into production code",
    "Debugging capture groups — seeing exactly which substring landed in group [1] and at which character position in the string",
    "Exporting a JSON match report (pattern, flags, total and every match with its index and groups) to attach to a bug report or code review",
  ],
  benefits: [
    [
      "Browser-native engine",
      "Patterns run through the same ECMAScript RegExp your JavaScript uses, so what matches here matches in your code — no PCRE or Python dialect surprises.",
    ],
    [
      "Every match, fully described",
      "The Result tab highlights all matches inline in your test string, while Match Details lists each hit with its matched text, zero-based start position and numbered capture groups.",
    ],
    [
      "Eight one-click patterns",
      "Email, URL, Phone (US), Hex Color, IPv4, Date (YYYY-MM-DD), Credit Card and HTML Tag load complete with the right flags already toggled on.",
    ],
    [
      "Nothing leaves your device",
      "The tool is a client-side React component with no network calls; the JSON report is built in memory and saved as a local Blob download.",
    ],
  ],
  faqs: [
    [
      "What regex flavour does this tester use?",
      "JavaScript (ECMAScript). Patterns are compiled with the browser's native new RegExp(), so lookahead, lookbehind, named groups and \\d behave exactly as they will in your JS code. Perl/PCRE-only constructs such as \\A, \\z, possessive quantifiers and recursion will raise a syntax error, and Python's re or .NET syntax differs in places — test those in their own runtimes.",
    ],
    [
      "Why does my regex only show one match?",
      "The global flag (g) is off. Without g the tester calls exec() once and reports only the first match; switch g on and it loops exec() across the whole string, collecting every match with its own start index. The big number above the Test String is the running match count.",
    ],
    [
      "What do the g, i, m, s and u flags do?",
      "g finds all matches instead of just the first; i makes the pattern case-insensitive; m makes ^ and $ match at every line break rather than only at the string boundaries; s (dotAll) lets . match newline characters; u enables full Unicode mode, including \\u{...} escapes. Those five are the flags this tester exposes — the sticky (y) and indices (d) flags are not offered.",
    ],
    [
      "Does it support named capture groups?",
      "Yes — (?<name>...) compiles fine, but the Match Details panel lists groups by number, not by name. Group values come from match.slice(1), so a named group appears as [1], [2] and so on in the order it opens, and optional groups that didn't participate in the match are skipped rather than shown as undefined.",
    ],
    [
      "Is my pattern or test data uploaded anywhere?",
      "No. Compilation, matching, highlighting and report generation are all client-side JavaScript running in your tab, and the tool makes no API or upload calls. The download is created from an in-memory Blob saved as altftool-regex-report.json. It's free and requires no signup.",
    ],
    [
      "What's in the JSON report?",
      "Four keys, pretty-printed with 2-space indentation: pattern (your expression as a string), flags (the enabled letters, e.g. \"gi\"), total (the match count) and matches — an array in which each entry has match (the matched text), index (zero-based start position) and groups (an array of captured values).",
    ],
    [
      "Why does the page hang on a pattern like \\d* or a*?",
      "Because a zero-length match doesn't advance the search position. With the global flag on, the tester loops exec() until it returns null, and a pattern that can match the empty string keeps matching at the same index forever. Require at least one character — use + instead of * , or anchor the pattern — or turn the global flag off.",
    ],
    [
      "How do I test an email or IP address regex quickly?",
      "Click Email or IPv4 in the Common Patterns column and the pattern loads with its flags applied. Eight presets ship with the tool — Email, URL, Phone (US), Hex Color, IPv4, Date (YYYY-MM-DD), Credit Card and HTML Tag — and each is an editable starting point, not a validation standard. The page opens with the email pattern and a sample sentence already filled in.",
    ],
  ],
  steps: [
    "Type or paste your expression into the Pattern field between the two slashes — the delimiters are part of the UI, so you don't escape them. Or click one of the eight Common Patterns to load it instantly.",
    "Toggle the flags you need: g (find all matches), i (ignore case), m (^ and $ match at line breaks), s (dot matches newlines), u (Unicode).",
    "Paste your sample text into Test String, then switch to the Result tab to see matches highlighted or scroll to Match Details for positions and groups. Use Copy report or Download JSON to save the output.",
  ],
};

export default seo;
