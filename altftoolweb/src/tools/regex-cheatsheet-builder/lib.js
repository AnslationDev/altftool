/**
 * Regex cheatsheet builder — feature tables sourced from:
 *  - ECMA-262 §22.2 (JavaScript RegExp) — includes g/y flags, \u{...} with
 *    the u flag, named groups (ES2018), lookbehind (ES2018).
 *  - PCRE2 documentation (pcre2pattern) — includes \A \z anchors, possessive
 *    quantifiers, atomic groups, the x extended flag.
 *  - Python 3 `re` module docs — (?P<name>…) group syntax, \A \Z anchors,
 *    re.X verbose flag; \p{...} properties live in the third-party `regex`
 *    module, not `re`.
 * Each entry records which flavors support the token so a generated sheet
 * never shows syntax your engine will reject.
 */

export const FLAVORS = [
  { id: "js", name: "JavaScript (ECMA-262)" },
  { id: "pcre", name: "PCRE2 (PHP, grep -P)" },
  { id: "python", name: "Python re module" },
];

/** Every entry: token, meaning, example, per-flavor support, optional note. */
export const SECTIONS = [
  {
    id: "anchors",
    title: "Anchors & boundaries",
    entries: [
      { token: "^", meaning: "Start of string (or line with m flag)", example: "^Hello", support: { js: true, pcre: true, python: true } },
      { token: "$", meaning: "End of string (or line with m flag)", example: "end$", support: { js: true, pcre: true, python: true } },
      { token: "\\b", meaning: "Word boundary", example: "\\bcat\\b", support: { js: true, pcre: true, python: true } },
      { token: "\\B", meaning: "Not a word boundary", example: "\\Bend", support: { js: true, pcre: true, python: true } },
      { token: "\\A", meaning: "Start of string, ignoring m flag", example: "\\Aid:", support: { js: false, pcre: true, python: true }, note: "JavaScript has no \\A — use ^ without m." },
      { token: "\\z", meaning: "Absolute end of string", example: "done\\z", support: { js: false, pcre: true, python: false }, note: "Python uses \\Z for this instead." },
      { token: "\\Z", meaning: "End of string (before final newline in PCRE)", example: "done\\Z", support: { js: false, pcre: true, python: true } },
    ],
  },
  {
    id: "classes",
    title: "Character classes",
    entries: [
      { token: ".", meaning: "Any character except newline (unless s flag)", example: "a.c", support: { js: true, pcre: true, python: true } },
      { token: "\\d / \\D", meaning: "Digit / non-digit", example: "\\d{3}", support: { js: true, pcre: true, python: true } },
      { token: "\\w / \\W", meaning: "Word character [A-Za-z0-9_] / opposite", example: "\\w+", support: { js: true, pcre: true, python: true } },
      { token: "\\s / \\S", meaning: "Whitespace / non-whitespace", example: "\\s*", support: { js: true, pcre: true, python: true } },
      { token: "[abc]", meaning: "Any one of a, b or c", example: "[aeiou]", support: { js: true, pcre: true, python: true } },
      { token: "[^abc]", meaning: "Any character except a, b, c", example: "[^0-9]", support: { js: true, pcre: true, python: true } },
      { token: "[a-z]", meaning: "Character range", example: "[A-Fa-f0-9]", support: { js: true, pcre: true, python: true } },
      { token: "\\p{L}", meaning: "Unicode property (letter, any script)", example: "\\p{L}+", support: { js: true, pcre: true, python: false }, note: "JavaScript requires the u flag; Python needs the third-party regex module." },
    ],
  },
  {
    id: "quantifiers",
    title: "Quantifiers",
    entries: [
      { token: "*", meaning: "0 or more (greedy)", example: "ab*", support: { js: true, pcre: true, python: true } },
      { token: "+", meaning: "1 or more (greedy)", example: "\\d+", support: { js: true, pcre: true, python: true } },
      { token: "?", meaning: "0 or 1 (greedy)", example: "colou?r", support: { js: true, pcre: true, python: true } },
      { token: "{n}", meaning: "Exactly n times", example: "\\d{4}", support: { js: true, pcre: true, python: true } },
      { token: "{n,}", meaning: "n or more times", example: "a{2,}", support: { js: true, pcre: true, python: true } },
      { token: "{n,m}", meaning: "Between n and m times", example: "\\d{2,4}", support: { js: true, pcre: true, python: true } },
      { token: "*? +? ??", meaning: "Lazy versions — match as little as possible", example: "<.+?>", support: { js: true, pcre: true, python: true } },
      { token: "*+ ++ ?+", meaning: "Possessive — no backtracking", example: "\\d++", support: { js: false, pcre: true, python: true }, note: "Python supports possessive quantifiers from 3.11." },
    ],
  },
  {
    id: "groups",
    title: "Groups & backreferences",
    entries: [
      { token: "(abc)", meaning: "Capture group", example: "(\\d+)-(\\d+)", support: { js: true, pcre: true, python: true } },
      { token: "(?:abc)", meaning: "Non-capturing group", example: "(?:ab)+", support: { js: true, pcre: true, python: true } },
      { token: "(?<name>abc)", meaning: "Named capture group", example: "(?<year>\\d{4})", support: { js: true, pcre: true, python: false }, note: "Python spells it (?P<name>…)." },
      { token: "(?P<name>abc)", meaning: "Named capture group (Python style)", example: "(?P<year>\\d{4})", support: { js: false, pcre: true, python: true } },
      { token: "\\1", meaning: "Backreference to group 1", example: "(\\w)\\1", support: { js: true, pcre: true, python: true } },
      { token: "\\k<name>", meaning: "Backreference to a named group", example: "\\k<year>", support: { js: true, pcre: true, python: false }, note: "Python uses (?P=name)." },
      { token: "(?>abc)", meaning: "Atomic group — no backtracking inside", example: "(?>a+)b", support: { js: false, pcre: true, python: true }, note: "Python supports atomic groups from 3.11." },
    ],
  },
  {
    id: "lookaround",
    title: "Lookaround",
    entries: [
      { token: "(?=abc)", meaning: "Positive lookahead", example: "\\d(?=px)", support: { js: true, pcre: true, python: true } },
      { token: "(?!abc)", meaning: "Negative lookahead", example: "\\d(?!px)", support: { js: true, pcre: true, python: true } },
      { token: "(?<=abc)", meaning: "Positive lookbehind", example: "(?<=\\$)\\d+", support: { js: true, pcre: true, python: true }, note: "In JavaScript since ES2018." },
      { token: "(?<!abc)", meaning: "Negative lookbehind", example: "(?<!-)\\d+", support: { js: true, pcre: true, python: true }, note: "Python lookbehind must be fixed-width." },
    ],
  },
  {
    id: "flags",
    title: "Flags / modifiers",
    entries: [
      { token: "i", meaning: "Case-insensitive matching", example: "/abc/i", support: { js: true, pcre: true, python: true } },
      { token: "m", meaning: "^ and $ match at every line", example: "/^ok$/m", support: { js: true, pcre: true, python: true } },
      { token: "s", meaning: "Dot also matches newline", example: "/a.b/s", support: { js: true, pcre: true, python: true }, note: "Called DOTALL in Python (re.S)." },
      { token: "g", meaning: "Global — find all matches", example: "/\\d+/g", support: { js: true, pcre: false, python: false }, note: "PCRE and Python iterate matches via the API instead." },
      { token: "u", meaning: "Full Unicode mode (\\u{…}, \\p{…})", example: "/\\p{L}/u", support: { js: true, pcre: false, python: false }, note: "PCRE uses the (*UTF) option; Python 3 strings are Unicode by default." },
      { token: "y", meaning: "Sticky — match exactly at lastIndex", example: "/\\d+/y", support: { js: true, pcre: false, python: false } },
      { token: "x", meaning: "Extended — whitespace and # comments ignored", example: "(?x) \\d+  # amount", support: { js: false, pcre: true, python: true }, note: "Python: re.X / re.VERBOSE." },
    ],
  },
  {
    id: "escapes",
    title: "Escapes & literals",
    entries: [
      { token: "\\\\", meaning: "A literal backslash", example: "C:\\\\Users", support: { js: true, pcre: true, python: true } },
      { token: "\\. \\* \\+ \\?", meaning: "Escaped metacharacters, matched literally", example: "3\\.14", support: { js: true, pcre: true, python: true } },
      { token: "\\n \\r \\t", meaning: "Newline, carriage return, tab", example: "line1\\nline2", support: { js: true, pcre: true, python: true } },
      { token: "\\xhh", meaning: "Character by 2-digit hex code", example: "\\x41 = A", support: { js: true, pcre: true, python: true } },
      { token: "\\u{hhhh}", meaning: "Character by Unicode code point", example: "\\u{1F600}", support: { js: true, pcre: false, python: false }, note: "Needs the u flag in JS; PCRE writes \\x{1F600}, Python \\U0001F600." },
      { token: "\\x{hhhh}", meaning: "Code point, PCRE style", example: "\\x{20B9}", support: { js: false, pcre: true, python: false } },
    ],
  },
];

/**
 * Build a cheatsheet for one flavor from the selected sections.
 * @returns {{flavor, sections, entryCount, skippedCount} | {error: string}}
 */
export function buildCheatsheet({ flavorId, sectionIds }) {
  const flavor = FLAVORS.find((candidate) => candidate.id === flavorId);
  if (!flavor) {
    return { error: "Choose a regex flavor (JavaScript, PCRE or Python)." };
  }
  if (!Array.isArray(sectionIds) || sectionIds.length === 0) {
    return { error: "Select at least one section to include in the cheatsheet." };
  }
  const unknown = sectionIds.filter(
    (id) => !SECTIONS.some((section) => section.id === id),
  );
  if (unknown.length > 0) {
    return { error: `Unknown section: ${unknown.join(", ")}.` };
  }

  let entryCount = 0;
  let skippedCount = 0;
  const sections = SECTIONS.filter((section) => sectionIds.includes(section.id)).map(
    (section) => {
      const entries = section.entries.filter((entry) => {
        const supported = Boolean(entry.support[flavorId]);
        if (!supported) skippedCount += 1;
        return supported;
      });
      entryCount += entries.length;
      return { id: section.id, title: section.title, entries };
    },
  );

  return { flavor, sections, entryCount, skippedCount };
}

/** Render a built cheatsheet as GitHub-flavoured Markdown. */
export function toMarkdown(cheatsheet) {
  if (!cheatsheet || cheatsheet.error || !Array.isArray(cheatsheet.sections)) return "";
  const lines = [`# Regex cheatsheet — ${cheatsheet.flavor.name}`, ""];
  for (const section of cheatsheet.sections) {
    if (section.entries.length === 0) continue;
    lines.push(`## ${section.title}`, "", "| Token | Meaning | Example |", "| --- | --- | --- |");
    for (const entry of section.entries) {
      const note = entry.note ? ` (${entry.note})` : "";
      const escape = (value) => value.replace(/\|/g, "\\|");
      lines.push(
        `| \`${escape(entry.token)}\` | ${escape(entry.meaning)}${escape(note)} | \`${escape(entry.example)}\` |`,
      );
    }
    lines.push("");
  }
  return lines.join("\n").trim();
}
