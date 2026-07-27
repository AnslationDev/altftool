/**
 * Vocabulary complexity analyser.
 *
 * Every formula below is the published original; no coefficients are invented.
 * Syllable counting uses the standard English vowel-group heuristic, which is
 * accurate to roughly a syllable on unusual words — that is stated in the UI.
 */

/** Flesch Reading Ease (Flesch, 1948). */
export const FLESCH_BASE = 206.835;
export const FLESCH_SENTENCE_COEF = 1.015;
export const FLESCH_SYLLABLE_COEF = 84.6;

/** Flesch-Kincaid Grade Level (Kincaid et al., US Navy report 8-75, 1975). */
export const FK_SENTENCE_COEF = 0.39;
export const FK_SYLLABLE_COEF = 11.8;
export const FK_CONSTANT = 15.59;

/** Gunning Fog Index (Gunning, The Technique of Clear Writing, 1952). */
export const FOG_COEF = 0.4;
/** Fog counts words of three or more syllables as "complex". */
export const COMPLEX_SYLLABLE_MIN = 3;

/** LIX readability (Björnsson, 1968) counts words of more than six letters as long. */
export const LONG_WORD_MIN_LETTERS = 7;

/** Below this, sentence-length averages are too noisy to report a grade level. */
export const MIN_WORDS_FOR_SCORE = 10;

/** Guard so a pasted book cannot lock the tab up. */
export const MAX_INPUT_CHARS = 200000;

/** Fog excludes verb forms made three syllables only by a suffix. */
const FOG_SUFFIX_EXEMPT = /(?:es|ed|ing)$/i;

export const FLESCH_BANDS = [
  { min: 90, label: "Very easy", audience: "5th grade" },
  { min: 80, label: "Easy", audience: "6th grade" },
  { min: 70, label: "Fairly easy", audience: "7th grade" },
  { min: 60, label: "Plain English", audience: "8th to 9th grade" },
  { min: 50, label: "Fairly difficult", audience: "10th to 12th grade" },
  { min: 30, label: "Difficult", audience: "College" },
  { min: -Infinity, label: "Very difficult", audience: "University graduate" },
];

/** Words are letters plus internal apostrophes and hyphens. */
const WORD_PATTERN = /[A-Za-z][A-Za-z'’-]*/g;

/** Sentence terminators: . ! ? and the ellipsis, one or more in a row. */
const SENTENCE_SPLIT = /[.!?…]+/;

/**
 * English syllable heuristic: strip a silent trailing "e" and "ed", then count
 * runs of vowels. "beautiful" -> eau|i|u = 3, "syllable" -> y|a|e = 3.
 */
export function countSyllables(word) {
  const cleaned = String(word).toLowerCase().replace(/[^a-z]/g, "");
  if (cleaned.length === 0) return 0;
  if (cleaned.length <= 3) return 1;

  const trimmed = cleaned
    .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "")
    .replace(/^y/, "");

  const groups = trimmed.match(/[aeiouy]+/g);
  return groups ? groups.length : 1;
}

export function splitWords(text) {
  return String(text).match(WORD_PATTERN) || [];
}

export function splitSentences(text) {
  return String(text)
    .split(SENTENCE_SPLIT)
    .map((sentence) => sentence.trim())
    .filter((sentence) => splitWords(sentence).length > 0);
}

export function fleschBand(score) {
  return FLESCH_BANDS.find((band) => score >= band.min) ?? FLESCH_BANDS[FLESCH_BANDS.length - 1];
}

/**
 * Analyse a passage.
 * @param {{text:string}} input
 * @returns {object|{error:string}}
 */
export function analyseVocabulary({ text = "" } = {}) {
  if (typeof text !== "string") return { error: "Input must be text." };
  if (text.trim().length === 0) return { error: "Paste some text to analyse." };
  if (text.length > MAX_INPUT_CHARS) {
    return {
      error: `Input is ${text.length.toLocaleString()} characters. The limit is ${MAX_INPUT_CHARS.toLocaleString()}.`,
    };
  }

  const words = splitWords(text);
  const sentences = splitSentences(text);

  if (words.length < MIN_WORDS_FOR_SCORE) {
    return {
      error: `Only ${words.length} word(s) found. Readability formulas need at least ${MIN_WORDS_FOR_SCORE} words to mean anything.`,
    };
  }
  if (sentences.length === 0) {
    return { error: "No sentences found. Add a full stop, question mark or exclamation mark." };
  }

  const syllablesPerWord = words.map(countSyllables);
  const totalSyllables = syllablesPerWord.reduce((sum, value) => sum + value, 0);
  const totalLetters = words.reduce((sum, word) => sum + word.replace(/[^A-Za-z]/g, "").length, 0);

  const wordsPerSentence = words.length / sentences.length;
  const syllablesPerWordAvg = totalSyllables / words.length;

  // --- vocabulary ---
  const frequency = new Map();
  for (const word of words) {
    const key = word.toLowerCase();
    frequency.set(key, (frequency.get(key) || 0) + 1);
  }
  const uniqueWords = frequency.size;
  const hapaxCount = [...frequency.values()].filter((count) => count === 1).length;

  const complexWords = [];
  const longWords = [];
  for (let i = 0; i < words.length; i += 1) {
    if (syllablesPerWord[i] >= COMPLEX_SYLLABLE_MIN && !FOG_SUFFIX_EXEMPT.test(words[i])) {
      complexWords.push(words[i]);
    }
    if (words[i].replace(/[^A-Za-z]/g, "").length >= LONG_WORD_MIN_LETTERS) {
      longWords.push(words[i]);
    }
  }

  // --- readability ---
  const flesch =
    FLESCH_BASE - FLESCH_SENTENCE_COEF * wordsPerSentence - FLESCH_SYLLABLE_COEF * syllablesPerWordAvg;
  const fleschKincaid =
    FK_SENTENCE_COEF * wordsPerSentence + FK_SYLLABLE_COEF * syllablesPerWordAvg - FK_CONSTANT;
  const fog = FOG_COEF * (wordsPerSentence + (100 * complexWords.length) / words.length);
  const lix = wordsPerSentence + (100 * longWords.length) / words.length;

  // Type-token ratio and Guiraud's root TTR, which is far less length-sensitive.
  const typeTokenRatio = uniqueWords / words.length;
  const rootTypeTokenRatio = uniqueWords / Math.sqrt(words.length);

  const hardestWords = [...new Set(complexWords.map((word) => word.toLowerCase()))]
    .map((word) => ({ word, syllables: countSyllables(word), letters: word.length }))
    .sort((a, b) => b.syllables - a.syllables || b.letters - a.letters)
    .slice(0, 12);

  const band = fleschBand(flesch);

  return {
    words: words.length,
    sentences: sentences.length,
    uniqueWords,
    hapaxCount,
    totalSyllables,
    wordsPerSentence: Number(wordsPerSentence.toFixed(2)),
    syllablesPerWord: Number(syllablesPerWordAvg.toFixed(2)),
    lettersPerWord: Number((totalLetters / words.length).toFixed(2)),
    complexWordCount: complexWords.length,
    complexWordPercent: Number(((complexWords.length / words.length) * 100).toFixed(1)),
    longWordPercent: Number(((longWords.length / words.length) * 100).toFixed(1)),
    typeTokenRatio: Number(typeTokenRatio.toFixed(3)),
    rootTypeTokenRatio: Number(rootTypeTokenRatio.toFixed(2)),
    hapaxPercent: Number(((hapaxCount / uniqueWords) * 100).toFixed(1)),
    flesch: Number(flesch.toFixed(1)),
    fleschLabel: band.label,
    fleschAudience: band.audience,
    fleschKincaid: Number(fleschKincaid.toFixed(1)),
    fog: Number(fog.toFixed(1)),
    lix: Number(lix.toFixed(1)),
    hardestWords,
  };
}

/** Plain-text report for pasting into a review or a brief. */
export function buildReport(result) {
  if (!result || result.error) return { error: result?.error || "Nothing to report yet." };
  return {
    text: [
      `Vocabulary complexity report`,
      ``,
      `Flesch Reading Ease: ${result.flesch} (${result.fleschLabel}, ${result.fleschAudience})`,
      `Flesch-Kincaid Grade Level: ${result.fleschKincaid}`,
      `Gunning Fog Index: ${result.fog}`,
      `LIX: ${result.lix}`,
      ``,
      `Words: ${result.words} · Sentences: ${result.sentences} · Unique words: ${result.uniqueWords}`,
      `Words per sentence: ${result.wordsPerSentence} · Syllables per word: ${result.syllablesPerWord}`,
      `Three-syllable words: ${result.complexWordPercent}% · Words over six letters: ${result.longWordPercent}%`,
      `Type-token ratio: ${result.typeTokenRatio} · Root TTR: ${result.rootTypeTokenRatio}`,
      ``,
      `Hardest words: ${result.hardestWords.map((entry) => entry.word).join(", ") || "none"}`,
    ].join("\n"),
  };
}
