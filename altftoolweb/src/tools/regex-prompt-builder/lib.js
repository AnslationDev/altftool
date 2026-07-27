/**
 * Regex Prompt Builder.
 *
 * Collects must-match and must-not-match example strings, validates them
 * (no duplicates, no string appearing in both lists), and writes a
 * regex-generation prompt that pins the target flavour and its documented
 * limitations, so the returned pattern is testable rather than plausible.
 */

/**
 * Regex flavours and their documented limitations.
 * - RE2 (used by Go's regexp and Google's re2 library) guarantees linear-time
 *   matching and therefore supports neither backreferences nor lookaround —
 *   stated in the RE2 documentation.
 * - JavaScript gained lookbehind in ES2018; older runtimes lack it.
 * - POSIX ERE has no shorthand classes like \d and no lazy quantifiers.
 */
export const FLAVOURS = [
  {
    id: "javascript",
    label: "JavaScript (ECMAScript)",
    notes:
      "Lookbehind requires ES2018+. Use the 'u' flag for correct Unicode handling. No possessive quantifiers or atomic groups before ES2024's 'v'-flag features.",
  },
  {
    id: "pcre2",
    label: "PCRE2 (PHP, grep -P)",
    notes:
      "Full feature set: lookaround, backreferences, atomic groups, possessive quantifiers, named groups (?<name>...).",
  },
  {
    id: "python",
    label: "Python (re module)",
    notes:
      "Lookbehind must be fixed-width. Named groups use (?P<name>...). No possessive quantifiers or atomic groups before Python 3.11.",
  },
  {
    id: "re2",
    label: "RE2 / Go (regexp)",
    notes:
      "Linear-time engine: NO backreferences and NO lookahead/lookbehind at all — the pattern must be written without them.",
  },
  {
    id: "posix-ere",
    label: "POSIX ERE (grep -E, awk)",
    notes:
      "No shorthand classes (write [0-9] not \\d), no lazy quantifiers, no lookaround, no backreferences.",
  },
];

export const FLAGS = [
  { id: "i", label: "Case-insensitive (i)" },
  { id: "m", label: "Multiline anchors (m)" },
  { id: "s", label: "Dot matches newline (s)" },
  { id: "g", label: "All occurrences (g / global)" },
];

/** Bounds that keep the example set useful. */
export const LIMITS = {
  examples: { minMatches: 1, maxPerList: 50, maxLineLength: 500 },
};

/** About four characters per token for ordinary English prose. */
export const AVERAGE_CHARS_PER_TOKEN = 4;

export function getFlavour(flavourId) {
  return FLAVOURS.find((flavour) => flavour.id === flavourId) || null;
}

/**
 * Parse one example per line: trims trailing whitespace-only lines away,
 * keeps internal content verbatim, drops empty lines, de-duplicates.
 */
export function parseExamples(text) {
  if (typeof text !== "string") return [];
  const seen = new Set();
  const result = [];
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line.length === 0) continue;
    if (seen.has(line)) continue;
    seen.add(line);
    result.push(line);
  }
  return result;
}

/**
 * Validate the two example lists against each other.
 * @returns {{error:string}|{matches:string[], nonMatches:string[], conflicts:string[]}}
 */
export function validateExamples({ matchText, nonMatchText } = {}) {
  const matches = parseExamples(matchText);
  const nonMatches = parseExamples(nonMatchText);

  if (matches.length < LIMITS.examples.minMatches) {
    return { error: "Give at least one example the regex MUST match — one per line." };
  }
  if (matches.length > LIMITS.examples.maxPerList || nonMatches.length > LIMITS.examples.maxPerList) {
    return { error: `Keep each list to ${LIMITS.examples.maxPerList} examples or fewer.` };
  }
  const tooLong = [...matches, ...nonMatches].find(
    (line) => line.length > LIMITS.examples.maxLineLength,
  );
  if (tooLong) {
    return { error: `One example exceeds ${LIMITS.examples.maxLineLength} characters — shorten it to the part that matters.` };
  }
  const nonMatchSet = new Set(nonMatches);
  const conflicts = matches.filter((line) => nonMatchSet.has(line));
  if (conflicts.length > 0) {
    return {
      error: `"${conflicts[0]}" appears in BOTH lists — no regex can match and not match the same string. Remove it from one list.`,
    };
  }
  return { matches, nonMatches, conflicts: [] };
}

export function measureText(text) {
  if (typeof text !== "string" || text.trim().length === 0) {
    return { characters: 0, words: 0, approxTokens: 0 };
  }
  const characters = text.length;
  const words = text.trim().split(/\s+/).length;
  return {
    characters,
    words,
    approxTokens: Math.max(1, Math.ceil(characters / AVERAGE_CHARS_PER_TOKEN)),
  };
}

/**
 * Write the regex-generation prompt.
 * @returns {{error:string}|{text:string, examples:object}}
 */
export function buildRegexPrompt({ description, flavourId, flagIds, wholeString, examples } = {}) {
  if (!examples || examples.error) {
    return { error: examples?.error || "Provide valid example lists first." };
  }
  const goal = typeof description === "string" && description.trim() ? description.trim() : "";
  if (!goal) return { error: "Describe in one sentence what the regex should find." };
  const flavour = getFlavour(flavourId);
  if (!flavour) return { error: "Choose a regex flavour." };
  const flags = FLAGS.filter((flag) => (Array.isArray(flagIds) ? flagIds : []).includes(flag.id));

  const lines = [
    `Write one regular expression for the ${flavour.label} flavour.`,
    "",
    `GOAL: ${goal}`,
    `FLAVOUR RULES: ${flavour.notes}`,
    flags.length > 0
      ? `FLAGS: use ${flags.map((flag) => flag.label).join(", ")} — and no others.`
      : "FLAGS: none — the pattern itself must handle case and structure.",
    wholeString
      ? "ANCHORING: the pattern must match the ENTIRE string (anchor with ^ and $ or the flavour's equivalent)."
      : "ANCHORING: the pattern matches substrings; do not anchor unless an example requires it.",
    "",
    `MUST MATCH — all ${examples.matches.length}:`,
  ];
  for (const example of examples.matches) lines.push(`  ${example}`);
  if (examples.nonMatches.length > 0) {
    lines.push("", `MUST NOT MATCH — none of these ${examples.nonMatches.length}:`);
    for (const example of examples.nonMatches) lines.push(`  ${example}`);
  }
  lines.push(
    "",
    "DELIVER:",
    "1. The regex, alone on its own line.",
    "2. A test table: every example above, whether the regex matches it, and the captured text — verify each row mentally against the pattern before answering.",
    "3. A part-by-part explanation of the pattern.",
    "4. Any input the regex would wrongly match that the examples do not cover, if you can see one.",
    "",
    "RULES:",
    "- If the MUST MATCH and MUST NOT MATCH lists cannot both be satisfied by one pattern, say which pair conflicts and why instead of returning a wrong regex.",
    "- Prefer the simplest pattern that passes every example; no lookaround or backreferences unless an example forces them (and the flavour allows them).",
    "- Avoid catastrophic backtracking: no nested unbounded quantifiers like (a+)+.",
  );

  const text = lines.join("\n");
  return { text, examples, flavour, ...measureText(text) };
}
