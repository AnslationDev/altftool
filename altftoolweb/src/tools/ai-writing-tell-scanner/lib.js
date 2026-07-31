/**
 * Over-used AI phrase scanner.
 *
 * A phrase bank plus an exact, case-insensitive matcher. Nothing here judges
 * authorship: every entry is a real English word or phrase that a person may use
 * deliberately. The point is to surface the ones that pile up in unedited model
 * output so an editor can decide, phrase by phrase, whether to keep it.
 */

/** Weight per occurrence. High = the phrase is a strong stylistic marker. */
export const WEIGHT_HIGH = 2;
export const WEIGHT_MEDIUM = 1;

export const CATEGORIES = {
  verb: "Inflated verbs",
  noun: "Grand nouns",
  adjective: "Filler adjectives",
  phrase: "Stock phrases",
  hedge: "Hedges and boosters",
};

/**
 * phrase: matched case-insensitively on whole-word boundaries.
 * fix: a plainer replacement, or the advice to cut it.
 */
export const PHRASE_BANK = [
  // Inflated verbs
  { phrase: "delve", category: "verb", weight: WEIGHT_HIGH, fix: "look at, dig into, study" },
  { phrase: "delve into", category: "verb", weight: WEIGHT_HIGH, fix: "look at, dig into" },
  { phrase: "embark", category: "verb", weight: WEIGHT_HIGH, fix: "start, begin" },
  { phrase: "harness", category: "verb", weight: WEIGHT_HIGH, fix: "use" },
  { phrase: "leverage", category: "verb", weight: WEIGHT_HIGH, fix: "use" },
  { phrase: "foster", category: "verb", weight: WEIGHT_MEDIUM, fix: "build, encourage" },
  { phrase: "navigate", category: "verb", weight: WEIGHT_MEDIUM, fix: "handle, deal with" },
  { phrase: "underscore", category: "verb", weight: WEIGHT_HIGH, fix: "show, stress" },
  { phrase: "underscores", category: "verb", weight: WEIGHT_HIGH, fix: "shows, stresses" },
  { phrase: "elevate", category: "verb", weight: WEIGHT_HIGH, fix: "improve, raise" },
  { phrase: "unlock", category: "verb", weight: WEIGHT_HIGH, fix: "get, enable" },
  { phrase: "unleash", category: "verb", weight: WEIGHT_HIGH, fix: "release, start" },
  { phrase: "streamline", category: "verb", weight: WEIGHT_MEDIUM, fix: "simplify, speed up" },
  { phrase: "spearhead", category: "verb", weight: WEIGHT_MEDIUM, fix: "lead" },
  { phrase: "cultivate", category: "verb", weight: WEIGHT_MEDIUM, fix: "build, grow" },
  { phrase: "illuminate", category: "verb", weight: WEIGHT_MEDIUM, fix: "explain, show" },
  { phrase: "resonate", category: "verb", weight: WEIGHT_MEDIUM, fix: "connect, land" },
  { phrase: "encapsulate", category: "verb", weight: WEIGHT_MEDIUM, fix: "sum up" },
  { phrase: "empower", category: "verb", weight: WEIGHT_MEDIUM, fix: "let, help" },
  { phrase: "supercharge", category: "verb", weight: WEIGHT_MEDIUM, fix: "speed up, improve" },

  // Grand nouns
  { phrase: "tapestry", category: "noun", weight: WEIGHT_HIGH, fix: "mix, range — or cut" },
  { phrase: "testament", category: "noun", weight: WEIGHT_HIGH, fix: "proof, sign" },
  { phrase: "realm", category: "noun", weight: WEIGHT_HIGH, fix: "field, area" },
  { phrase: "landscape", category: "noun", weight: WEIGHT_HIGH, fix: "market, field" },
  { phrase: "cornerstone", category: "noun", weight: WEIGHT_MEDIUM, fix: "basis, foundation" },
  { phrase: "beacon", category: "noun", weight: WEIGHT_MEDIUM, fix: "example — or cut" },
  { phrase: "plethora", category: "noun", weight: WEIGHT_HIGH, fix: "many, lots of" },
  { phrase: "myriad", category: "noun", weight: WEIGHT_HIGH, fix: "many" },
  { phrase: "paradigm", category: "noun", weight: WEIGHT_MEDIUM, fix: "model, approach" },
  { phrase: "synergy", category: "noun", weight: WEIGHT_MEDIUM, fix: "fit, overlap" },
  { phrase: "treasure trove", category: "noun", weight: WEIGHT_HIGH, fix: "large collection" },
  { phrase: "game-changer", category: "noun", weight: WEIGHT_HIGH, fix: "say what changed" },
  { phrase: "game changer", category: "noun", weight: WEIGHT_HIGH, fix: "say what changed" },
  { phrase: "journey", category: "noun", weight: WEIGHT_MEDIUM, fix: "process, work" },
  { phrase: "ecosystem", category: "noun", weight: WEIGHT_MEDIUM, fix: "set of tools, market" },

  // Filler adjectives
  { phrase: "pivotal", category: "adjective", weight: WEIGHT_HIGH, fix: "key, decisive" },
  { phrase: "robust", category: "adjective", weight: WEIGHT_MEDIUM, fix: "reliable, strong" },
  { phrase: "seamless", category: "adjective", weight: WEIGHT_HIGH, fix: "smooth — or cut" },
  { phrase: "meticulous", category: "adjective", weight: WEIGHT_HIGH, fix: "careful" },
  { phrase: "unwavering", category: "adjective", weight: WEIGHT_HIGH, fix: "steady, constant" },
  { phrase: "multifaceted", category: "adjective", weight: WEIGHT_HIGH, fix: "complex, varied" },
  { phrase: "intricate", category: "adjective", weight: WEIGHT_MEDIUM, fix: "complex, detailed" },
  { phrase: "invaluable", category: "adjective", weight: WEIGHT_MEDIUM, fix: "useful, important" },
  { phrase: "unparalleled", category: "adjective", weight: WEIGHT_HIGH, fix: "best, unmatched" },
  { phrase: "bespoke", category: "adjective", weight: WEIGHT_MEDIUM, fix: "custom" },
  { phrase: "holistic", category: "adjective", weight: WEIGHT_MEDIUM, fix: "complete, whole" },
  { phrase: "transformative", category: "adjective", weight: WEIGHT_HIGH, fix: "say what it changed" },
  { phrase: "cutting-edge", category: "adjective", weight: WEIGHT_HIGH, fix: "new, latest" },
  { phrase: "ever-evolving", category: "adjective", weight: WEIGHT_HIGH, fix: "changing — or cut" },
  { phrase: "vibrant", category: "adjective", weight: WEIGHT_MEDIUM, fix: "busy, lively" },
  { phrase: "vital", category: "adjective", weight: WEIGHT_MEDIUM, fix: "needed, important" },
  { phrase: "crucial", category: "adjective", weight: WEIGHT_MEDIUM, fix: "important" },

  // Stock phrases
  { phrase: "in today's fast-paced world", category: "phrase", weight: WEIGHT_HIGH, fix: "delete the whole clause" },
  { phrase: "in today's digital age", category: "phrase", weight: WEIGHT_HIGH, fix: "delete the whole clause" },
  { phrase: "in the ever-evolving landscape", category: "phrase", weight: WEIGHT_HIGH, fix: "delete the whole clause" },
  { phrase: "in the realm of", category: "phrase", weight: WEIGHT_HIGH, fix: "in" },
  { phrase: "in the world of", category: "phrase", weight: WEIGHT_MEDIUM, fix: "in" },
  { phrase: "it is important to note", category: "phrase", weight: WEIGHT_HIGH, fix: "state the point directly" },
  { phrase: "it's worth noting", category: "phrase", weight: WEIGHT_HIGH, fix: "state the point directly" },
  { phrase: "it is worth noting", category: "phrase", weight: WEIGHT_HIGH, fix: "state the point directly" },
  { phrase: "when it comes to", category: "phrase", weight: WEIGHT_MEDIUM, fix: "for, with" },
  { phrase: "at the end of the day", category: "phrase", weight: WEIGHT_MEDIUM, fix: "cut it" },
  { phrase: "let's dive in", category: "phrase", weight: WEIGHT_HIGH, fix: "cut it and start" },
  { phrase: "dive into", category: "phrase", weight: WEIGHT_MEDIUM, fix: "look at" },
  { phrase: "in conclusion", category: "phrase", weight: WEIGHT_HIGH, fix: "cut it — the reader can see the end" },
  { phrase: "stands as a testament", category: "phrase", weight: WEIGHT_HIGH, fix: "shows" },
  { phrase: "plays a crucial role", category: "phrase", weight: WEIGHT_HIGH, fix: "matters because…" },
  { phrase: "plays a vital role", category: "phrase", weight: WEIGHT_HIGH, fix: "matters because…" },
  { phrase: "a wide range of", category: "phrase", weight: WEIGHT_MEDIUM, fix: "many, or name them" },
  { phrase: "take your", category: "phrase", weight: WEIGHT_MEDIUM, fix: "avoid 'take your X to the next level'" },
  { phrase: "to the next level", category: "phrase", weight: WEIGHT_HIGH, fix: "say what actually improves" },
  { phrase: "unlock the potential", category: "phrase", weight: WEIGHT_HIGH, fix: "say what becomes possible" },
  { phrase: "as we navigate", category: "phrase", weight: WEIGHT_HIGH, fix: "cut it" },
  { phrase: "the key takeaway", category: "phrase", weight: WEIGHT_MEDIUM, fix: "just state the takeaway" },
  { phrase: "rest assured", category: "phrase", weight: WEIGHT_MEDIUM, fix: "cut it" },
  { phrase: "look no further", category: "phrase", weight: WEIGHT_HIGH, fix: "cut it" },

  // Hedges and boosters
  { phrase: "arguably", category: "hedge", weight: WEIGHT_MEDIUM, fix: "cut it or defend the claim" },
  { phrase: "undoubtedly", category: "hedge", weight: WEIGHT_MEDIUM, fix: "cut it" },
  { phrase: "notably", category: "hedge", weight: WEIGHT_MEDIUM, fix: "cut it" },
  { phrase: "importantly", category: "hedge", weight: WEIGHT_MEDIUM, fix: "cut it" },
  { phrase: "essentially", category: "hedge", weight: WEIGHT_MEDIUM, fix: "cut it" },
  { phrase: "fundamentally", category: "hedge", weight: WEIGHT_MEDIUM, fix: "cut it" },
  { phrase: "ultimately", category: "hedge", weight: WEIGHT_MEDIUM, fix: "cut it" },
  { phrase: "moreover", category: "hedge", weight: WEIGHT_MEDIUM, fix: "and, also — or cut" },
  { phrase: "furthermore", category: "hedge", weight: WEIGHT_MEDIUM, fix: "and, also — or cut" },
  { phrase: "additionally", category: "hedge", weight: WEIGHT_MEDIUM, fix: "and, also — or cut" },
];

/**
 * Density that maps to a score of 100: 25 weighted hits per 1,000 words, i.e.
 * roughly one stock phrase every 40 words — about one every second sentence.
 */
export const DENSITY_AT_MAX_SCORE = 25;

/** Escapes regex metacharacters and lets a straight apostrophe match a curly one. */
const escapeRe = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/'/g, "['’]");
/** Character class shared by the word-boundary lookaround below and countWords(). */
const BOUNDARY_CLASS = "\\p{L}\\p{N}";

export function countWords(text) {
  const matches = String(text).match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu);
  return matches ? matches.length : 0;
}

/**
 * Finds non-overlapping, whole-word matches for every bank entry.
 *
 * The word-boundary check is embedded directly in the regex as lookaround
 * assertions rather than applied after the fact. That matters: with a plain
 * `source.matchAll(pattern)` and a post-hoc boundary check, `matchAll` still
 * advances its internal cursor to the end of a raw match even when that match
 * gets rejected for failing the boundary test, so the engine can never go back
 * and try a shorter alternative (or a later phrase) whose start falls inside
 * the span the rejected match already consumed — e.g. "let's dive in" (which
 * fails the boundary check when followed by "into") would silently swallow
 * the scan position and prevent "dive into" from ever being tried. Putting the
 * boundary check inside the pattern lets the regex engine itself backtrack to
 * the next alternative (or the next starting position) whenever a candidate
 * match fails its boundary, so it can never "consume" a span it didn't
 * actually accept.
 */
export function findMatches(text, bank = PHRASE_BANK) {
  const source = String(text);
  const ordered = [...bank].sort((a, b) => b.phrase.length - a.phrase.length);
  const alternation = ordered.map((item) => escapeRe(item.phrase)).join("|");
  const pattern = new RegExp(
    `(?<![${BOUNDARY_CLASS}])(?:${alternation})(?![${BOUNDARY_CLASS}])`,
    "giu",
  );
  const byPhrase = new Map(bank.map((item) => [item.phrase.toLowerCase(), item]));

  const ranges = [];
  for (const match of source.matchAll(pattern)) {
    const start = match.index;
    const end = start + match[0].length;
    const entry = byPhrase.get(match[0].toLowerCase().replace(/’/g, "'"));
    if (!entry) continue;
    // Longest-first alternation already prevents overlap, but guard anyway.
    if (ranges.length > 0 && start < ranges[ranges.length - 1].end) continue;
    ranges.push({ start, end, text: match[0], entry });
  }
  return ranges;
}

/** Turns the text plus its match ranges into renderable runs. */
export function buildSegments(text, ranges) {
  const source = String(text);
  const segments = [];
  let cursor = 0;
  for (const range of ranges) {
    if (range.start > cursor) {
      segments.push({ text: source.slice(cursor, range.start), hit: false });
    }
    segments.push({
      text: source.slice(range.start, range.end),
      hit: true,
      category: range.entry.category,
      fix: range.entry.fix,
      weight: range.entry.weight,
    });
    cursor = range.end;
  }
  if (cursor < source.length) segments.push({ text: source.slice(cursor), hit: false });
  return segments;
}

/**
 * Scans a draft against the phrase bank.
 *
 * @param {string} text
 * @param {{categories?: string[]}} options limit to these category keys
 */
export function scanForTells(text, options = {}) {
  if (typeof text !== "string" || text.trim() === "") {
    return { error: "Paste a draft to scan." };
  }
  // An explicit empty array (the caller passed `categories: []`, e.g. every checkbox
  // unchecked) must mean "scan nothing", not fall back to scanning everything — only
  // an omitted/non-array `categories` option defaults to the full set.
  const active = Array.isArray(options.categories) ? options.categories : Object.keys(CATEGORIES);
  const unknown = active.filter((key) => !CATEGORIES[key]);
  if (unknown.length > 0) {
    return { error: `Unknown category: ${unknown.join(", ")}.` };
  }
  if (active.length === 0) {
    return { error: "Select at least one category to scan." };
  }

  const words = countWords(text);
  if (words < 10) {
    return { error: "Paste at least 10 words so the density figure means something." };
  }

  const bank = PHRASE_BANK.filter((item) => active.includes(item.category));
  const ranges = findMatches(text, bank);
  const segments = buildSegments(text, ranges);

  const grouped = new Map();
  for (const range of ranges) {
    const key = range.entry.phrase;
    const current = grouped.get(key) || {
      phrase: range.entry.phrase,
      category: range.entry.category,
      categoryLabel: CATEGORIES[range.entry.category],
      weight: range.entry.weight,
      fix: range.entry.fix,
      count: 0,
    };
    current.count += 1;
    grouped.set(key, current);
  }

  const matches = [...grouped.values()].sort(
    (a, b) => b.count * b.weight - a.count * a.weight || a.phrase.localeCompare(b.phrase),
  );

  const totalHits = ranges.length;
  const weightedHits = ranges.reduce((sum, range) => sum + range.entry.weight, 0);
  const density = (weightedHits / words) * 1000;
  const score = Math.max(0, Math.min(100, Math.round((density / DENSITY_AT_MAX_SCORE) * 100)));
  // Words actually covered by a flagged phrase — not the same as totalHits, since a
  // single matched phrase (e.g. "in today's fast-paced world") can span several words.
  // Ranges never overlap, so summing per-range word counts double-counts nothing.
  const flaggedWords = ranges.reduce((sum, range) => sum + countWords(range.text), 0);

  let band = "Clean";
  let bandNote = "Barely any stock phrasing. Leave it alone.";
  if (score >= 70) {
    band = "Very heavy";
    bandNote = "Stock phrasing on almost every line. Rewrite rather than patch.";
  } else if (score >= 40) {
    band = "Heavy";
    bandNote = "Enough filler to flatten the voice. Replace the high-weight hits first.";
  } else if (score >= 15) {
    band = "Some filler";
    bandNote = "A handful of stock phrases. Cutting them is quick and worth it.";
  }

  const byCategory = Object.keys(CATEGORIES)
    .filter((key) => active.includes(key))
    .map((key) => ({
      key,
      label: CATEGORIES[key],
      count: matches.filter((m) => m.category === key).reduce((sum, m) => sum + m.count, 0),
      distinct: matches.filter((m) => m.category === key).length,
    }));

  return {
    words,
    totalHits,
    weightedHits,
    density,
    score,
    band,
    bandNote,
    matches,
    byCategory,
    segments,
    distinctPhrases: matches.length,
    cleanWordShare: words > 0 ? Math.max(0, 1 - flaggedWords / words) : 0,
  };
}
