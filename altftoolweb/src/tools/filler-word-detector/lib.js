/**
 * Filler Word Detector — pure logic.
 *
 * Scans prose for four kinds of padding — intensifiers, hedges, filler adverbs
 * and wordy phrases — reports the density, and produces a stripped draft with
 * the safely deletable ones removed and the wordy phrases replaced.
 *
 * No React, no DOM, no clock reads.
 */

/* ------------------------------- categories ------------------------------- */

export const CATEGORIES = {
  intensifier: {
    id: "intensifier",
    label: "Intensifier",
    summary: "Props up a weak word instead of replacing it. \"Very cold\" wants to be \"freezing\".",
  },
  hedge: {
    id: "hedge",
    label: "Hedge",
    summary: "Softens a claim until it commits to nothing. Delete it or make the claim you mean.",
  },
  adverb: {
    id: "adverb",
    label: "Filler adverb",
    summary: "Adds emphasis the sentence has not earned. Almost always deletable.",
  },
  phrase: {
    id: "phrase",
    label: "Wordy phrase",
    summary: "Several words doing one word's job. Swap in the shorter form.",
  },
  opener: {
    id: "opener",
    label: "Throat-clearing",
    summary: "Delays the sentence's real subject. Start with the thing you are talking about.",
  },
};

/**
 * Editorial thresholds used by this tool, not published standards. Measured
 * per 100 words: under 2 reads tight, 2-4 is ordinary, above 4 is padded.
 */
export const TIGHT_DENSITY_PER_100 = 2;
export const LOOSE_DENSITY_PER_100 = 4;

/** Repeat count at which a single filler becomes an audible tic. */
export const REPEAT_FLAG_COUNT = 3;

/* --------------------------------- data ---------------------------------- */

/**
 * `deletable` means the sentence still reads correctly with the word simply
 * removed. `replacement` is the shorter form for wordy phrases.
 * `ambiguous` marks words with a common non-filler sense, which are counted
 * but never auto-deleted.
 */
export const FILLERS = [
  // Intensifiers
  { word: "very", category: "intensifier", deletable: true, advice: "Delete it, or replace the adjective with a stronger one." },
  { word: "really", category: "intensifier", deletable: true, advice: "Delete it. It rarely survives a read-aloud." },
  { word: "extremely", category: "intensifier", deletable: true, advice: "Delete, or use a word that already means the extreme." },
  { word: "incredibly", category: "intensifier", deletable: true, advice: "Delete. It claims disbelief the reader has not felt." },
  { word: "quite", category: "intensifier", deletable: true, advice: "Ambiguous in British English — it can mean 'somewhat' or 'entirely'." },
  { word: "rather", category: "intensifier", deletable: true, advice: "Delete unless you mean 'instead'." },
  { word: "fairly", category: "intensifier", deletable: true, advice: "Delete. It downgrades the claim without adding information." },
  { word: "pretty", category: "intensifier", deletable: false, ambiguous: true, advice: "As an intensifier ('pretty good'), delete it. As an adjective, keep it." },
  { word: "totally", category: "intensifier", deletable: true, advice: "Delete, or use 'entirely' if the totality matters." },
  { word: "absolutely", category: "intensifier", deletable: true, advice: "Delete. Absolutes are stronger stated plainly." },
  { word: "completely", category: "intensifier", deletable: true, advice: "Keep only where partial completion is a real possibility." },
  { word: "utterly", category: "intensifier", deletable: true, advice: "Delete. Reserve for genuine hyperbole." },
  { word: "highly", category: "intensifier", deletable: true, advice: "Delete, except in fixed terms like 'highly strung'." },
  { word: "super", category: "intensifier", deletable: true, advice: "Conversational. Delete in formal prose." },
  { word: "truly", category: "intensifier", deletable: true, advice: "Delete. If the claim is true, saying so does not help." },

  // Hedges
  { word: "just", category: "hedge", deletable: true, advice: "The most common apology in English prose. Delete it." },
  { word: "kind of", category: "hedge", deletable: true, advice: "Delete, or name what it actually is." },
  { word: "sort of", category: "hedge", deletable: true, advice: "Delete, or name what it actually is." },
  { word: "somewhat", category: "hedge", deletable: true, advice: "Delete, or give the number that makes it precise." },
  { word: "a bit", category: "hedge", deletable: true, advice: "Delete, or quantify." },
  { word: "a little", category: "hedge", deletable: true, advice: "Delete, or quantify." },
  { word: "maybe", category: "hedge", deletable: false, advice: "Keep only where the uncertainty is real and load-bearing." },
  { word: "perhaps", category: "hedge", deletable: false, advice: "Keep only where the uncertainty is real and load-bearing." },
  { word: "possibly", category: "hedge", deletable: false, advice: "One hedge per sentence at most — never stack it with 'might'." },
  { word: "arguably", category: "hedge", deletable: true, advice: "Delete. If it is arguable, make the argument." },
  { word: "I think", category: "hedge", deletable: true, advice: "In your own piece, everything is what you think. Delete it." },
  { word: "I believe", category: "hedge", deletable: true, advice: "Delete in your own writing; the byline already says it." },
  { word: "in my opinion", category: "hedge", deletable: true, advice: "Delete. The sentence is already your opinion." },
  { word: "it seems that", category: "hedge", deletable: true, replacement: "", advice: "Delete, or say who it seems that way to." },
  { word: "tends to", category: "hedge", deletable: false, advice: "Keep only where you have evidence of a tendency rather than a rule." },

  // Filler adverbs
  { word: "basically", category: "adverb", deletable: true, advice: "Delete. It signals a summary the sentence already is." },
  { word: "actually", category: "adverb", deletable: true, advice: "Delete unless you are correcting something just said." },
  { word: "literally", category: "adverb", deletable: true, advice: "Keep only where the literal reading is genuinely surprising." },
  { word: "essentially", category: "adverb", deletable: true, advice: "Delete. It hedges and pads at the same time." },
  { word: "definitely", category: "adverb", deletable: true, advice: "Delete. Certainty is stronger unannounced." },
  { word: "certainly", category: "adverb", deletable: true, advice: "Delete. Asserting certainty invites doubt." },
  { word: "obviously", category: "adverb", deletable: true, advice: "Delete. If it is obvious, cut the sentence; if not, this reads as rude." },
  { word: "clearly", category: "adverb", deletable: true, advice: "Delete. Let the clarity come from the sentence." },
  { word: "simply", category: "adverb", deletable: true, advice: "Delete. It often implies the reader should have known." },
  { word: "honestly", category: "adverb", deletable: true, advice: "Delete. It implies the other sentences were not." },
  { word: "frankly", category: "adverb", deletable: true, advice: "Delete in written prose." },
  { word: "of course", category: "adverb", deletable: true, advice: "Delete. Same problem as 'obviously'." },
  { word: "needless to say", category: "adverb", deletable: true, advice: "If it is needless, delete the whole clause." },

  // Wordy phrases
  { word: "in order to", category: "phrase", replacement: "to", advice: "\"To\" does the same work in one word." },
  { word: "due to the fact that", category: "phrase", replacement: "because", advice: "Five words for one." },
  { word: "owing to the fact that", category: "phrase", replacement: "because", advice: "Five words for one." },
  { word: "in spite of the fact that", category: "phrase", replacement: "although", advice: "Six words for one." },
  { word: "despite the fact that", category: "phrase", replacement: "although", advice: "Four words for one." },
  { word: "at this point in time", category: "phrase", replacement: "now", advice: "Five words for one." },
  { word: "at the present time", category: "phrase", replacement: "now", advice: "Four words for one." },
  { word: "in the event that", category: "phrase", replacement: "if", advice: "Four words for one." },
  { word: "for the purpose of", category: "phrase", replacement: "to", advice: "Four words for one." },
  { word: "in the process of", category: "phrase", replacement: "", advice: "Usually deletable — the verb already carries it." },
  { word: "a large number of", category: "phrase", replacement: "many", advice: "Or give the actual number." },
  { word: "a majority of", category: "phrase", replacement: "most", advice: "Or give the percentage." },
  { word: "each and every", category: "phrase", replacement: "every", advice: "One of the two is enough." },
  { word: "first and foremost", category: "phrase", replacement: "first", advice: "One of the two is enough." },
  { word: "in terms of", category: "phrase", replacement: "", advice: "Almost always deletable; rebuild the sentence around the noun." },
  { word: "with regard to", category: "phrase", replacement: "about", advice: "Or 'on', depending on the verb." },
  { word: "in the near future", category: "phrase", replacement: "soon", advice: "Or name the date." },
  { word: "on a regular basis", category: "phrase", replacement: "regularly", advice: "Or say how often." },
  { word: "for all intents and purposes", category: "phrase", replacement: "effectively", advice: "Four syllables instead of nine words." },
  { word: "the fact that", category: "phrase", replacement: "that", advice: "Usually just 'that', and often deletable entirely." },
  { word: "in my personal opinion", category: "phrase", replacement: "", advice: "Delete. Opinions are already personal." },

  // Throat-clearing openers
  { word: "it is important to note that", category: "opener", replacement: "", advice: "Delete. If it were not important you would not have written it." },
  { word: "it should be noted that", category: "opener", replacement: "", advice: "Delete and state the point." },
  { word: "it is worth noting that", category: "opener", replacement: "", advice: "Delete and state the point." },
  { word: "one of the most", category: "opener", deletable: false, advice: "Superlative-by-committee. Name the specific claim instead." },
  { word: "there are a number of", category: "opener", replacement: "several", advice: "Or give the number and start with the noun." },
  { word: "when it comes to", category: "opener", replacement: "", advice: "Delete and start with the subject." },
];

/* -------------------------------- helpers -------------------------------- */

const escapeRegExp = (text) => String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Words separated by whitespace. */
export function countWords(text) {
  const trimmed = String(text ?? "").trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

const BY_WORD = FILLERS.reduce((acc, entry) => {
  acc[entry.word.toLowerCase()] = entry;
  return acc;
}, {});

/** One alternation of every filler, longest first so phrases beat their parts. */
const MATCH_PATTERN = (() => {
  const sorted = [...FILLERS].sort((a, b) => b.word.length - a.word.length);
  const body = sorted.map((entry) => escapeRegExp(entry.word)).join("|");
  return new RegExp(`(?<![\\p{L}'-])(?:${body})(?![\\p{L}'-])`, "giu");
})();

/**
 * Split text into segments so a UI can highlight the fillers without doing any
 * matching of its own.
 * @returns {Array<{text:string, filler?:object}>}
 */
export function segmentText(text) {
  const source = String(text ?? "");
  if (!source) return [];

  const segments = [];
  let cursor = 0;
  const pattern = new RegExp(MATCH_PATTERN.source, MATCH_PATTERN.flags);
  let match = pattern.exec(source);

  while (match !== null) {
    if (match.index > cursor) segments.push({ text: source.slice(cursor, match.index) });
    const entry = BY_WORD[match[0].toLowerCase()];
    segments.push({ text: match[0], filler: entry || null });
    cursor = match.index + match[0].length;
    match = pattern.exec(source);
  }

  if (cursor < source.length) segments.push({ text: source.slice(cursor) });
  return segments;
}

/* -------------------------------- detector -------------------------------- */

/**
 * Scan a passage for fillers.
 * @param {string} text
 * @returns {object} report, or { error }.
 */
export function detectFillers(text) {
  const source = String(text ?? "");
  const words = countWords(source);
  if (words === 0) {
    return { error: "Paste some writing to scan it for filler." };
  }

  const counts = new Map();
  const pattern = new RegExp(MATCH_PATTERN.source, MATCH_PATTERN.flags);
  let match = pattern.exec(source);
  let total = 0;

  while (match !== null) {
    const key = match[0].toLowerCase();
    counts.set(key, (counts.get(key) || 0) + 1);
    total += 1;
    match = pattern.exec(source);
  }

  const items = Array.from(counts.entries())
    .map(([key, count]) => {
      const entry = BY_WORD[key];
      return {
        word: entry ? entry.word : key,
        count,
        category: entry ? entry.category : "adverb",
        categoryLabel: CATEGORIES[entry ? entry.category : "adverb"].label,
        advice: entry ? entry.advice : "",
        replacement: entry && typeof entry.replacement === "string" ? entry.replacement : null,
        deletable: Boolean(entry && entry.deletable),
        ambiguous: Boolean(entry && entry.ambiguous),
      };
    })
    .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word));

  const byCategory = Object.values(CATEGORIES).map((category) => {
    const inCategory = items.filter((item) => item.category === category.id);
    return {
      ...category,
      count: inCategory.reduce((sum, item) => sum + item.count, 0),
      items: inCategory,
    };
  });

  const densityPer100 = (total / words) * 100;
  const overused = items.filter((item) => item.count >= REPEAT_FLAG_COUNT);

  let verdict = "tight";
  if (densityPer100 > LOOSE_DENSITY_PER_100) verdict = "loose";
  else if (densityPer100 >= TIGHT_DENSITY_PER_100) verdict = "ordinary";

  return {
    words,
    total,
    unique: items.length,
    items,
    byCategory,
    overused,
    densityPer100: Math.round(densityPer100 * 10) / 10,
    verdict,
    worst: items[0] || null,
    deletableCount: items
      .filter((item) => item.deletable || typeof item.replacement === "string")
      .reduce((sum, item) => sum + item.count, 0),
  };
}

/**
 * Strip pattern. The optional groups either side let a deletion take the
 * commas that only existed to fence the filler off:
 *   "very, very important"          -> "very," goes, then "very" goes
 *   "The plan, needless to say, failed" -> both commas go with the phrase
 */
const STRIP_PATTERN = (() => {
  const sorted = [...FILLERS].sort((a, b) => b.word.length - a.word.length);
  const body = sorted.map((entry) => escapeRegExp(entry.word)).join("|");
  return new RegExp(`(,\\s*)?(?<![\\p{L}'-])(${body})(?![\\p{L}'-])(\\s*,)?`, "giu");
})();

/**
 * Produce a stripped version: deletable fillers removed, wordy phrases
 * replaced with their shorter form. Ambiguous words are left alone.
 *
 * @param {string} text
 * @returns {object} { text, removed, replaced, words, wordsSaved } or { error }.
 */
export function stripFillers(text) {
  const source = String(text ?? "");
  if (countWords(source) === 0) {
    return { error: "Paste some writing before stripping it." };
  }

  let removed = 0;
  let replaced = 0;

  const pattern = new RegExp(STRIP_PATTERN.source, STRIP_PATTERN.flags);
  const rewritten = source.replace(pattern, (whole, before, found, after) => {
    const entry = BY_WORD[String(found).toLowerCase()];
    if (!entry || entry.ambiguous) return whole;

    const keepsLeadingComma = before && !after ? before : "";
    const keepsTrailingComma = after && !before ? after : "";

    if (typeof entry.replacement === "string" && entry.replacement !== "") {
      replaced += 1;
      const isCapital = /^[A-Z]/.test(found);
      const word = isCapital
        ? entry.replacement.charAt(0).toUpperCase() + entry.replacement.slice(1)
        : entry.replacement;
      return `${before || ""}${word}${after || ""}`;
    }

    if (entry.replacement === "" || entry.deletable) {
      removed += 1;
      // A filler fenced by commas on both sides takes both with it.
      if (before && after) return "";
      return keepsLeadingComma || keepsTrailingComma ? `${keepsLeadingComma}` : "";
    }

    return whole;
  });

  const tidied = rewritten
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/([,;:])(\s*[,;:])+/g, "$1")
    .replace(/^[ \t]+/gm, "")
    .replace(/(^|[.!?]\s+)([a-z])/g, (match, lead, letter) => `${lead}${letter.toUpperCase()}`)
    .trim();

  return {
    text: tidied,
    removed,
    replaced,
    words: countWords(tidied),
    wordsSaved: countWords(source) - countWords(tidied),
  };
}

/** Render the report as copyable plain text. */
export function reportToText(report) {
  if (!report || report.error) return "";
  const lines = [
    `Filler check — ${report.total} instances in ${report.words} words (${report.densityPer100} per 100)`,
    "",
  ];
  report.items.forEach((item) => {
    const fix = item.replacement ? ` → "${item.replacement}"` : item.deletable ? " → delete" : "";
    lines.push(`${item.word} (${item.count})${fix} — ${item.advice}`);
  });
  return lines.join("\n").trim();
}
