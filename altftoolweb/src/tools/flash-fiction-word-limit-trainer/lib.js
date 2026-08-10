/**
 * Flash-fiction word budget analysis.
 *
 * Counting follows the rule almost every competition and journal states in its
 * guidelines: a word is any run of non-space characters, a hyphenated compound
 * counts as ONE word, and numerals count as one word each. Title and byline are
 * normally excluded, so they are not part of the text you paste here.
 */

/**
 * Named flash-fiction forms and the limits they are defined by.
 * dribble = 50 words and drabble = 100 words are long-standing fixed-length
 * forms; 500 and 1000 are the two most common competition ceilings.
 */
export const LIMIT_PRESETS = [
  { id: "dribble", label: "Dribble", limit: 50, exact: true, note: "Exactly 50 words. One image, one turn." },
  { id: "drabble", label: "Drabble", limit: 100, exact: true, note: "Exactly 100 words, title excluded." },
  { id: "micro", label: "Micro fiction", limit: 300, exact: false, note: "Up to 300 words. One scene, one decision." },
  { id: "flash500", label: "Flash fiction", limit: 500, exact: false, note: "Up to 500 words — the most common contest cap." },
  { id: "flash1000", label: "Long flash", limit: 1000, exact: false, note: "Up to 1000 words, the usual upper bound for 'flash'." },
];

/** Hard bounds on a custom limit, so the meter stays meaningful. */
export const MIN_LIMIT = 10;
export const MAX_LIMIT = 5000;

/**
 * 238 words per minute — the mean silent reading rate for English fiction
 * reported in Brysbaert's 2019 meta-analysis of 190 reading-rate studies.
 */
export const SILENT_READING_WPM = 238;

/**
 * 130 words per minute — a typical unhurried read-aloud pace, the rate open-mic
 * and podcast timings are usually planned against.
 */
export const READ_ALOUD_WPM = 130;

/**
 * Words that are almost always cuttable in very short fiction. Grouped so the
 * report can explain *why* each one is flagged rather than just listing it.
 */
export const CUT_FIRST = [
  { group: "Intensifiers", reason: "Weakens the noun or verb it props up.", words: ["very", "really", "quite", "rather", "so", "extremely", "totally", "absolutely", "utterly", "pretty"] },
  { group: "Hedges", reason: "Softens a sentence that should commit.", words: ["just", "somewhat", "somehow", "slightly", "almost", "nearly", "kind", "sort", "maybe", "perhaps", "probably"] },
  { group: "Filter verbs", reason: "Puts the narrator between the reader and the scene.", words: ["felt", "saw", "heard", "noticed", "realised", "realized", "watched", "seemed", "wondered", "thought", "decided"] },
  { group: "Empty adverbs", reason: "Tells what the verb should already show.", words: ["suddenly", "actually", "basically", "literally", "simply", "definitely", "certainly", "obviously", "immediately", "quickly", "slowly"] },
  { group: "Throat clearing", reason: "Delays the sentence that matters.", words: ["began", "started", "proceeded", "managed"] },
];

const CUT_SET = new Map();
CUT_FIRST.forEach((entry) => {
  entry.words.forEach((word) => {
    if (!word.includes(" ")) CUT_SET.set(word, entry);
  });
});

const SENTENCE_SPLIT = /[.!?…]+["'”’)\]]*\s+|[.!?…]+["'”’)\]]*$/;
// Base token, plus optional trailing "[.,]digit..." runs so grouped numerals
// like "12,000" or "3.5" stay one token instead of splitting on the separator.
const WORD_TOKEN = /[\p{L}\p{N}][\p{L}\p{N}'’\-–]*(?:[.,]\d[\p{L}\p{N}'’\-–]*)*/gu;

// A small set of abbreviations/initials whose trailing period should not be
// treated as a sentence boundary (e.g. "Mr. Smith ran." is one sentence).
const ABBREVIATION_PERIOD = /\b(?:Mr|Mrs|Ms|Dr|St|vs|e\.g|i\.e|[A-Z])\.(?=\s)/g;
const ABBREVIATION_PLACEHOLDER = "\u0000";

function guardAbbreviations(text) {
  return text.replace(ABBREVIATION_PERIOD, (match) => `${match.slice(0, -1)}${ABBREVIATION_PLACEHOLDER}`);
}

function unguardAbbreviations(text) {
  return text.split(ABBREVIATION_PLACEHOLDER).join(".");
}

/** Splits text into word tokens using the "hyphenated compound = one word" rule. */
export function tokenise(text, { splitHyphens = false } = {}) {
  if (typeof text !== "string" || text.trim() === "") return [];
  const source = splitHyphens ? text.replace(/[-–]/g, " ") : text;
  return source.match(WORD_TOKEN) || [];
}

/** Word count under contest rules. Never throws, never returns NaN. */
export function countWords(text, options) {
  return tokenise(text, options).length;
}

/** Splits text into sentences, guarding common abbreviations so "Mr. Smith ran." is one sentence. */
function sentenceList(text) {
  if (typeof text !== "string") return [];
  const trimmed = text.trim();
  if (!trimmed) return [];
  return guardAbbreviations(trimmed)
    .split(SENTENCE_SPLIT)
    .map((part) => unguardAbbreviations(part.trim()))
    .filter(Boolean);
}

// Single shared source of truth for the sentence count, so the reported total
// never disagrees with sentenceList()'s own splitting/abbreviation logic (no
// separate fallback here — punctuation-only text has zero sentences, matching
// the 0-word longest/average stats derived from the same sentenceList()).
function countSentences(text) {
  if (typeof text !== "string") return 0;
  if (!text.trim()) return 0;
  return sentenceList(text).length;
}

function normalise(word) {
  return word
    .toLowerCase()
    .replace(/[’']s$/, "")
    .replace(/[’']/g, "'")
    .replace(/^[-–]+|[-–]+$/g, "");
}

/**
 * Full report on a draft against a word budget.
 *
 * @param {object} options
 * @param {string} options.text          the draft
 * @param {number} options.limit         word budget
 * @param {boolean} [options.exact]      true when the form demands the exact count (drabble)
 * @param {boolean} [options.splitHyphens] count "well-lit" as two words instead of one
 * @returns {object|{error: string}}
 */
export function analyseDraft(options = {}) {
  const { text = "", limit, exact = false, splitHyphens = false } = options;

  if (typeof text !== "string") return { error: "Draft text must be plain text." };

  const budget = Number(limit);
  if (!Number.isFinite(budget)) return { error: "Enter a word limit as a whole number." };
  const rounded = Math.floor(budget);
  if (rounded < MIN_LIMIT || rounded > MAX_LIMIT) {
    return { error: `Word limit must be between ${MIN_LIMIT} and ${MAX_LIMIT} words.` };
  }

  const tokens = tokenise(text, { splitHyphens });
  const words = tokens.length;
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, "").length;
  const paragraphs = text.trim() ? text.trim().split(/\n\s*\n+/).filter((p) => p.trim()).length : 0;
  const sentences = countSentences(text);

  const remaining = rounded - words;
  const over = Math.max(0, -remaining);
  const percentUsed = rounded > 0 ? (words / rounded) * 100 : 0;

  let status = "under";
  if (exact) status = words === rounded ? "exact" : words > rounded ? "over" : "under";
  else if (words > rounded) status = "over";
  else if (words === rounded) status = "exact";

  const sentenceWordCounts = sentenceList(text).map((sentence) => countWords(sentence, { splitHyphens }));
  const longestSentence = sentenceWordCounts.length ? Math.max(...sentenceWordCounts) : 0;
  const averageSentenceWords = sentences > 0 ? words / sentences : 0;

  const cutCounts = new Map();
  tokens.forEach((token) => {
    const key = normalise(token);
    const entry = CUT_SET.get(key);
    if (!entry) return;
    const existing = cutCounts.get(key);
    if (existing) existing.count += 1;
    else cutCounts.set(key, { word: key, count: 1, group: entry.group, reason: entry.reason });
  });
  const cutCandidates = Array.from(cutCounts.values()).sort(
    (a, b) => b.count - a.count || a.word.localeCompare(b.word),
  );
  const cuttableWords = cutCandidates.reduce((sum, item) => sum + item.count, 0);

  const uniqueWords = new Set(tokens.map(normalise)).size;

  return {
    words,
    limit: rounded,
    exact,
    characters,
    charactersNoSpaces,
    sentences,
    paragraphs,
    remaining,
    headroom: Math.max(0, remaining),
    over,
    percentUsed,
    barPercent: Math.max(0, Math.min(100, percentUsed)),
    status,
    longestSentence,
    averageSentenceWords,
    uniqueWords,
    uniqueRatio: words > 0 ? uniqueWords / words : 0,
    uniqueRatioPercent: words > 0 ? (uniqueWords / words) * 100 : 0,
    cutCandidates,
    cuttableWords,
    wordsAfterCuts: Math.max(0, words - cuttableWords),
    readAloudSeconds: (words / READ_ALOUD_WPM) * 60,
    silentReadSeconds: (words / SILENT_READING_WPM) * 60,
    message: buildMessage(status, words, rounded, over, exact),
  };
}

function buildMessage(status, words, limit, over, exact) {
  if (words === 0) return "Start typing — the counter updates on every keystroke.";
  if (status === "exact") return exact ? `Exactly ${limit} words. That is a valid submission.` : `Bang on ${limit} words.`;
  if (status === "over") return `${over} word${over === 1 ? "" : "s"} over. Cut before you polish.`;
  const left = limit - words;
  if (exact) return `${left} word${left === 1 ? "" : "s"} short of the required ${limit}.`;
  return `${left} word${left === 1 ? "" : "s"} of headroom left.`;
}

/** Seconds -> "1 min 24 s". Total: always returns a string. */
export function formatDuration(totalSeconds) {
  const seconds = Number.isFinite(totalSeconds) ? Math.max(0, Math.round(totalSeconds)) : 0;
  if (seconds < 60) return `${seconds} s`;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return rest === 0 ? `${minutes} min` : `${minutes} min ${rest} s`;
}
