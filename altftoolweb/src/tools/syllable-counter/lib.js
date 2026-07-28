/**
 * Syllable Counter — count syllables in English words, lines and passages.
 *
 * THE COUNTING ALGORITHM
 *   English spelling does not map cleanly to sound, so with no pronunciation dictionary
 *   available offline the count is produced by the rule set of Greg Fast's
 *   Lingua::EN::Syllable (Perl, 1999), which is the most widely reused open syllable
 *   heuristic and is the basis of the syllable step in most readability libraries.
 *
 *   The rules, in order:
 *     1. Reduce the word to letters and apostrophes, lower case.
 *     2. Drop a trailing silent "e" — but not when the word ends "-le" after a
 *        consonant ("table", "little"), where that e carries its own syllable.
 *     3. Drop a leading "y", which is a consonant there ("yellow", not "y-ellow").
 *     4. Count runs of vowels: every match of [aeiouy]+ is one syllable.
 *     5. Apply the correction lists below — patterns where step 4 reliably
 *        over-counts (SUBTRACT) or under-counts (ADD).
 *     6. Never return less than 1: every written word has at least one syllable.
 *
 *   Accuracy on ordinary prose is roughly nine words in ten. The irregulars that the
 *   rules cannot reach are held in EXCEPTIONS below and checked first.
 *
 * READABILITY FORMULAS (both need a syllable count, which is why they live here)
 *   Flesch Reading Ease, Rudolf Flesch, "A New Readability Yardstick" (Journal of
 *   Applied Psychology, 1948):
 *       206.835 - 1.015 x (words / sentences) - 84.6 x (syllables / words)
 *   Flesch-Kincaid Grade Level, Kincaid et al. for the US Navy (Research Branch Report
 *   8-75, 1975):
 *       0.39 x (words / sentences) + 11.8 x (syllables / words) - 15.59
 *   The Reading Ease bands are Flesch's own.
 *
 * Pure module: text in, numbers out. No clock, no DOM, no network.
 */

/** Words the rules get wrong often enough to be worth listing, with their true count. */
export const EXCEPTIONS = {
  business: 2,
  colonel: 2,
  wednesday: 2,
  every: 2,
  everything: 3,
  everyone: 3,
  everybody: 4,
  people: 2,
  simile: 3,
  forever: 3,
  shoreline: 2,
  evening: 2,
  chocolate: 3,
  camera: 3,
  family: 3,
  interesting: 4,
  vegetable: 4,
  comfortable: 4,
  temperature: 4,
  favorite: 3,
  favourite: 3,
  different: 3,
  aisle: 1,
  queue: 1,
  guide: 1,
  guise: 1,
  rhythm: 2,
  poem: 2,
  poet: 2,
  quiet: 2,
  diet: 2,
  science: 2,
  ocean: 2,
  idea: 3,
  area: 3,
  create: 2,
  created: 3,
  being: 2,
  doing: 2,
  going: 2,
  seeing: 2,
  fire: 1,
  hour: 1,
  our: 1,
  once: 1,
  one: 1,
  two: 1,
  through: 1,
  though: 1,
  thought: 1,
  laughed: 1,
  businesses: 3,
};

/**
 * Patterns where the vowel-run count is one too many.
 * From Lingua::EN::Syllable's SubSyl list.
 */
export const SUBTRACT_PATTERNS = [
  /cial/,
  /tia/,
  /cius/,
  /cious/,
  /giu/,
  /ion/,
  /iou/,
  /sia$/,
  /[^aeiuoyt]{2}ed$/,
  /.gh$/,
];

/**
 * Patterns where the vowel-run count is one too few.
 * From Lingua::EN::Syllable's AddSyl list.
 */
export const ADD_PATTERNS = [
  /ia/,
  /riet/,
  /dien/,
  /iu/,
  /io/,
  /ii/,
  /[aeiouym]bl$/,
  /[aeiou]{3}/,
  /^mc/,
  /ism$/,
  /([^aeiouy])\1l$/,
  /[^l]lien/,
  /^coa[dglx]./,
  /[^gq]ua[^auieo]/,
  /dnt$/,
];

/** Flesch's own Reading Ease bands, from the 1948 paper. */
export const FLESCH_BANDS = [
  [90, 100, "Very easy", "5th grade"],
  [80, 90, "Easy", "6th grade"],
  [70, 80, "Fairly easy", "7th grade"],
  [60, 70, "Standard", "8th–9th grade"],
  [50, 60, "Fairly difficult", "10th–12th grade"],
  [30, 50, "Difficult", "College"],
  [0, 30, "Very confusing", "College graduate"],
];

/** A word of this many syllables or more counts as polysyllabic. */
export const POLYSYLLABIC_THRESHOLD = 3;

/** Haiku line pattern, for the line-by-line check. */
export const HAIKU_PATTERN = [5, 7, 5];

/** Longest passage this tool will process in one go, in characters. */
export const MAX_CHARACTERS = 200000;

/**
 * Count the syllables in a single English word.
 * @param {string} word
 * @returns {number} at least 1 for any word containing a letter, 0 for no letters
 */
export function countSyllablesInWord(word) {
  if (typeof word !== "string") return 0;
  // Keep letters and internal apostrophes; everything else is punctuation.
  const cleaned = word.toLowerCase().replace(/[^a-z']/g, "");
  if (cleaned === "") return 0;

  const key = cleaned.replace(/'/g, "");
  if (Object.prototype.hasOwnProperty.call(EXCEPTIONS, key)) return EXCEPTIONS[key];
  if (key === "") return 0;

  let stem = key;
  // Step 2: silent trailing e, unless the word ends "-le" after a consonant.
  if (/e$/.test(stem) && !/[^aeiouy]le$/.test(stem)) stem = stem.replace(/e$/, "");
  // Step 3: a leading y is a consonant.
  stem = stem.replace(/^y/, "");

  const runs = stem.match(/[aeiouy]+/g);
  let count = runs ? runs.length : 0;

  for (const pattern of SUBTRACT_PATTERNS) if (pattern.test(key)) count -= 1;
  for (const pattern of ADD_PATTERNS) if (pattern.test(key)) count += 1;

  return count > 0 ? count : 1;
}

/**
 * Placeholder swapped in for the full stop inside a protected abbreviation, so the
 * sentence splitter does not treat "Dr." as the end of a sentence. It is put back
 * afterwards. Any string that cannot occur in ordinary prose would do.
 */
export const ABBREVIATION_DOT = "⁢";

/** Split text into words, keeping internal apostrophes and hyphenated halves separate. */
export function tokenizeWords(text) {
  if (typeof text !== "string") return [];
  const matches = text.toLowerCase().match(/[a-z]+(?:'[a-z]+)*/g);
  return matches ?? [];
}

/**
 * Split text into sentences on . ! ? and paragraph breaks.
 * Common abbreviations are protected so "Dr. Smith left." counts as one sentence.
 */
export function splitSentences(text) {
  if (typeof text !== "string") return [];
  const protectedText = text
    .replace(/\b(Mr|Mrs|Ms|Dr|Prof|Sr|Jr|St|vs|etc|e\.g|i\.e|Inc|Ltd|Co)\./gi, `$1${ABBREVIATION_DOT}`)
    .replace(/\b([A-Z])\./g, `$1${ABBREVIATION_DOT}`);
  return protectedText
    .split(/[.!?]+[\s"')\]]*|\n{2,}/)
    .map((s) => s.split(ABBREVIATION_DOT).join(".").trim())
    .filter((s) => /[a-zA-Z]/.test(s));
}

/** Where a Flesch Reading Ease score sits on Flesch's own scale. */
export function fleschBand(score) {
  if (!Number.isFinite(score)) return null;
  const clamped = Math.max(0, Math.min(100, score));
  for (const [low, high, label, grade] of FLESCH_BANDS) {
    if (clamped >= low && clamped <= high) return { label, grade, low, high };
  }
  return null;
}

/**
 * Analyse a passage.
 *
 * @param {string} text
 * @returns {object} totals, per-word and per-line syllable counts and readability
 *                   scores — or { error }
 */
export function analyzeText(text) {
  if (typeof text !== "string" || text.trim() === "")
    return { error: "Type or paste some text to count its syllables." };
  if (text.length > MAX_CHARACTERS)
    return {
      error: `That passage is ${text.length.toLocaleString("en-US")} characters — the limit is ${MAX_CHARACTERS.toLocaleString("en-US")}.`,
    };

  const words = tokenizeWords(text);
  if (words.length === 0)
    return { error: "No English words were found — the counter needs Latin letters." };

  const perWord = words.map((word) => ({ word, syllables: countSyllablesInWord(word) }));
  const syllables = perWord.reduce((sum, w) => sum + w.syllables, 0);

  const sentences = splitSentences(text);
  const sentenceCount = sentences.length > 0 ? sentences.length : 1;

  const wordsPerSentence = words.length / sentenceCount;
  const syllablesPerWord = syllables / words.length;

  // Flesch (1948) and Kincaid et al. (1975); both are undefined without words.
  const fleschReadingEase = 206.835 - 1.015 * wordsPerSentence - 84.6 * syllablesPerWord;
  const fleschKincaidGrade = 0.39 * wordsPerSentence + 11.8 * syllablesPerWord - 15.59;

  const lines = text.split(/\r?\n/).map((line) => {
    const lineWords = tokenizeWords(line);
    return {
      text: line,
      words: lineWords.length,
      syllables: lineWords.reduce((sum, w) => sum + countSyllablesInWord(w), 0),
    };
  });

  const monosyllabic = perWord.filter((w) => w.syllables === 1).length;
  const polysyllabic = perWord.filter((w) => w.syllables >= POLYSYLLABIC_THRESHOLD).length;

  const longest = perWord.reduce(
    (best, w) => (w.syllables > best.syllables ? w : best),
    perWord[0],
  );

  const contentLines = lines.filter((l) => l.words > 0);
  const haiku =
    contentLines.length === HAIKU_PATTERN.length
      ? {
          matches: contentLines.every((l, i) => l.syllables === HAIKU_PATTERN[i]),
          counts: contentLines.map((l) => l.syllables),
        }
      : null;

  return {
    words: words.length,
    syllables,
    sentences: sentenceCount,
    characters: text.length,
    syllablesPerWord,
    wordsPerSentence,
    monosyllabic,
    polysyllabic,
    monosyllabicShare: (monosyllabic / words.length) * 100,
    polysyllabicShare: (polysyllabic / words.length) * 100,
    longestWord: longest,
    perWord,
    lines,
    fleschReadingEase,
    fleschKincaidGrade,
    band: fleschBand(fleschReadingEase),
    haiku,
  };
}
