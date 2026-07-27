/**
 * Stopword Impact Tester
 *
 * Removes stopwords and prose filler from a text and reports what it cost and
 * what it saved.
 *
 * Word list and constants:
 *   - STOPWORDS is the widely used English stopword list distributed with NLTK,
 *     which is the same list most tutorials and search pipelines start from.
 *   - MEANING_CRITICAL is the subset of that list which changes what a sentence
 *     asserts when it is dropped: negations, contrastives, comparatives and
 *     directional prepositions. Removing "not" from "does not scale" is the
 *     classic stopword-removal bug, so these are protected by default.
 *   - Reading time uses 238 words per minute, the mean silent reading rate for
 *     English non-fiction reported in Brysbaert's 2019 meta-analysis of 190
 *     studies.
 *   - Token estimates use the common English rules of thumb of roughly four
 *     characters per token and roughly 0.75 words per token. These are
 *     approximations, not a tokeniser, and are labelled as such everywhere.
 */

/** Mean silent reading rate for English non-fiction, words per minute. */
export const READING_WPM = 238;

/** English rule of thumb: about four characters per token. */
export const CHARS_PER_TOKEN = 4;

/** English rule of thumb: about 0.75 words per token. */
export const WORDS_PER_TOKEN = 0.75;

/** Guard against pathological input sizes in the browser. */
export const MAX_INPUT_CHARS = 200000;

/** The English stopword list distributed with NLTK. */
export const STOPWORDS = [
  "i", "me", "my", "myself", "we", "our", "ours", "ourselves",
  "you", "you're", "you've", "you'll", "you'd", "your", "yours", "yourself", "yourselves",
  "he", "him", "his", "himself", "she", "she's", "her", "hers", "herself",
  "it", "it's", "its", "itself", "they", "them", "their", "theirs", "themselves",
  "what", "which", "who", "whom", "this", "that", "that'll", "these", "those",
  "am", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "having", "do", "does", "did", "doing",
  "a", "an", "the", "and", "but", "if", "or", "because", "as", "until", "while",
  "of", "at", "by", "for", "with", "about", "against", "between", "into",
  "through", "during", "before", "after", "above", "below",
  "to", "from", "up", "down", "in", "out", "on", "off", "over", "under",
  "again", "further", "then", "once",
  "here", "there", "when", "where", "why", "how",
  "all", "any", "both", "each", "few", "more", "most", "other", "some", "such",
  "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very",
  "s", "t", "can", "will", "just", "don", "don't", "should", "should've", "now",
  "d", "ll", "m", "o", "re", "ve", "y",
  "ain", "aren", "aren't", "couldn", "couldn't", "didn", "didn't",
  "doesn", "doesn't", "hadn", "hadn't", "hasn", "hasn't", "haven", "haven't",
  "isn", "isn't", "ma", "mightn", "mightn't", "mustn", "mustn't",
  "needn", "needn't", "shan", "shan't", "shouldn", "shouldn't",
  "wasn", "wasn't", "weren", "weren't", "won", "won't", "wouldn", "wouldn't",
];

/**
 * Stopwords whose removal changes what the sentence asserts.
 * Negations flip polarity; contrastives and comparatives carry the logic;
 * directional prepositions carry the relation.
 */
export const MEANING_CRITICAL = [
  "no", "nor", "not", "don", "don't", "ain",
  "aren", "aren't", "couldn", "couldn't", "didn", "didn't",
  "doesn", "doesn't", "hadn", "hadn't", "hasn", "hasn't", "haven", "haven't",
  "isn", "isn't", "mightn", "mightn't", "mustn", "mustn't",
  "needn", "needn't", "shan", "shan't", "shouldn", "shouldn't",
  "wasn", "wasn't", "weren", "weren't", "won", "won't", "wouldn", "wouldn't",
  "but", "if", "or", "than", "against", "only", "same", "such",
  "few", "more", "most", "all", "any", "both", "each",
  "before", "after", "above", "below", "over", "under", "up", "down", "off", "out",
  "until", "while", "because",
];

/**
 * Prose filler: hedges and intensifiers that are not stopwords but that add
 * length without adding information in most writing.
 */
export const FILLER_WORDS = [
  "actually", "basically", "essentially", "literally", "really", "very",
  "quite", "rather", "somewhat", "just", "simply", "honestly", "frankly",
  "obviously", "clearly", "certainly", "definitely", "absolutely", "totally",
  "truly", "extremely", "incredibly", "seriously", "perhaps", "maybe",
  "arguably", "generally", "typically", "particularly", "especially",
];

const STOPWORD_SET = new Set(STOPWORDS);
const MEANING_CRITICAL_SET = new Set(MEANING_CRITICAL);
const FILLER_SET = new Set(FILLER_WORDS);

/** A word is letters, digits, apostrophes and hyphens; everything else is separator. */
const TOKEN_PATTERN = /[\p{L}\p{N}][\p{L}\p{N}'’-]*|[^\p{L}\p{N}]+/gu;
const WORD_TEST = /^[\p{L}\p{N}]/u;

function normalise(word) {
  return word.toLowerCase().replace(/’/g, "'");
}

function countWords(text) {
  return String(text).split(/\s+/).filter(Boolean).length;
}

function parseCustomList(raw) {
  return String(raw ?? "")
    .split(/[\s,]+/)
    .map((item) => normalise(item.trim()))
    .filter(Boolean);
}

/**
 * Strip stopwords and filler, and report the impact.
 *
 * @param {object} input
 * @param {string} input.text
 * @param {boolean} input.removeStopwords
 * @param {boolean} input.removeFillers
 * @param {boolean} input.protectMeaningCritical keep negations and contrastives
 * @param {string} input.customStopwords extra words to strip, space or comma separated
 * @param {string} input.keepWords words to never strip, space or comma separated
 * @returns {object|{error:string}}
 */
export function analyseStopwordImpact({
  text = "",
  removeStopwords = true,
  removeFillers = true,
  protectMeaningCritical = true,
  customStopwords = "",
  keepWords = "",
} = {}) {
  if (typeof text !== "string") return { error: "The input must be text." };
  if (text.length > MAX_INPUT_CHARS) {
    return { error: `Paste under ${MAX_INPUT_CHARS.toLocaleString("en-IN")} characters at a time.` };
  }
  if (text.trim().length === 0) {
    return { error: "Paste some text to see the impact of removing stopwords." };
  }
  if (!removeStopwords && !removeFillers && parseCustomList(customStopwords).length === 0) {
    return { error: "Nothing is selected for removal, so the text would come back unchanged." };
  }

  const customSet = new Set(parseCustomList(customStopwords));
  const keepSet = new Set(parseCustomList(keepWords));

  const removedCounts = new Map();
  const protectedCounts = new Map();
  const criticalRemoved = new Map();

  const pieces = String(text).match(TOKEN_PATTERN) || [];
  const kept = [];
  let originalWords = 0;

  for (const piece of pieces) {
    if (!WORD_TEST.test(piece)) {
      kept.push(piece);
      continue;
    }

    originalWords += 1;
    const word = normalise(piece);

    const isCritical = MEANING_CRITICAL_SET.has(word);
    const targeted =
      customSet.has(word) ||
      (removeStopwords && STOPWORD_SET.has(word)) ||
      (removeFillers && FILLER_SET.has(word));

    if (!targeted || keepSet.has(word)) {
      kept.push(piece);
      continue;
    }

    if (isCritical && protectMeaningCritical) {
      protectedCounts.set(word, (protectedCounts.get(word) || 0) + 1);
      kept.push(piece);
      continue;
    }

    if (isCritical) criticalRemoved.set(word, (criticalRemoved.get(word) || 0) + 1);
    removedCounts.set(word, (removedCounts.get(word) || 0) + 1);
  }

  // Rejoin, then collapse the whitespace and dangling spaces left behind.
  const filteredText = kept
    .join("")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/ ([,.;:!?)])/g, "$1")
    .replace(/([(]) /g, "$1")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const filteredWords = countWords(filteredText);
  const originalChars = text.length;
  const filteredChars = filteredText.length;

  const wordsRemoved = originalWords - filteredWords;
  const wordReduction = originalWords > 0 ? (wordsRemoved / originalWords) * 100 : 0;
  const charReduction =
    originalChars > 0 ? ((originalChars - filteredChars) / originalChars) * 100 : 0;

  const estimateTokens = (chars, words) =>
    Math.max(Math.round(chars / CHARS_PER_TOKEN), Math.round(words / WORDS_PER_TOKEN));

  const originalTokens = estimateTokens(originalChars, originalWords);
  const filteredTokens = estimateTokens(filteredChars, filteredWords);
  const tokensSaved = originalTokens - filteredTokens;

  const toSortedList = (map) =>
    [...map.entries()]
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word));

  const warnings = [];
  if (criticalRemoved.size > 0) {
    warnings.push(
      `Meaning-changing words were removed: ${[...criticalRemoved.keys()].slice(0, 12).join(", ")}. Negations and contrastives flip what a sentence claims, so read the stripped text before using it.`,
    );
  }
  if (wordReduction > 60) {
    warnings.push(
      `Over ${Math.round(wordReduction)}% of the words are gone. At that level the output is a keyword bag rather than readable prose.`,
    );
  }
  if (filteredWords === 0) {
    warnings.push("Every word was removed. Nothing usable is left.");
  }

  return {
    filteredText,
    originalWords,
    filteredWords,
    wordsRemoved,
    wordReduction,
    originalChars,
    filteredChars,
    charReduction,
    originalTokens,
    filteredTokens,
    tokensSaved,
    originalReadingSeconds: (originalWords / READING_WPM) * 60,
    filteredReadingSeconds: (filteredWords / READING_WPM) * 60,
    removed: toSortedList(removedCounts),
    protectedWords: toSortedList(protectedCounts),
    criticalRemoved: toSortedList(criticalRemoved),
    warnings,
  };
}
