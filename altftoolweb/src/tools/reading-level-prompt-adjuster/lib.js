/**
 * Reading Level Prompt Adjuster — measures the Flesch-Kincaid grade level of a
 * piece of text and builds an AI rewrite prompt that targets a chosen grade
 * band with concrete, checkable sentence-length and vocabulary rules.
 *
 * Formulas (Kincaid, Fishburne, Rogers & Chissom, 1975):
 *   Flesch-Kincaid Grade  = 0.39 * (words/sentences) + 11.8 * (syllables/words) - 15.59
 *   Flesch Reading Ease   = 206.835 - 1.015 * (words/sentences) - 84.6 * (syllables/words)
 */

/** Flesch-Kincaid Grade Level coefficients (Kincaid et al., 1975). */
export const FK_SENTENCE_WEIGHT = 0.39;
export const FK_SYLLABLE_WEIGHT = 11.8;
export const FK_CONSTANT = 15.59;

/** Flesch Reading Ease coefficients (Flesch, 1948). */
export const FRE_BASE = 206.835;
export const FRE_SENTENCE_WEIGHT = 1.015;
export const FRE_SYLLABLE_WEIGHT = 84.6;

/**
 * Target bands. maxWordsPerSentence follows from the FK formula: at each
 * band's typical syllables-per-word density, an average sentence at this
 * length lands inside the band's grade range.
 * (e.g. grades 4-5 at ~1.35 syl/word: 0.39*11 + 11.8*1.35 - 15.59 ≈ 4.6)
 */
export const GRADE_BANDS = [
  { id: "g2-3", label: "Grades 2-3 (age 7-9)", fkTarget: "2-3", maxWordsPerSentence: 8, sylPerWord: 1.25 },
  { id: "g4-5", label: "Grades 4-5 (age 9-11)", fkTarget: "4-5", maxWordsPerSentence: 11, sylPerWord: 1.35 },
  { id: "g6-8", label: "Grades 6-8 (age 11-14)", fkTarget: "6-8", maxWordsPerSentence: 15, sylPerWord: 1.45 },
  { id: "g9-12", label: "Grades 9-12 (age 14-18)", fkTarget: "9-12", maxWordsPerSentence: 20, sylPerWord: 1.55 },
  { id: "college", label: "College / professional", fkTarget: "13+", maxWordsPerSentence: 25, sylPerWord: 1.65 },
];

export const MIN_WORDS_FOR_SCORE = 10; // FK on fewer than ~10 words is statistically meaningless
export const MAX_TEXT_CHARS = 20000;

/**
 * Heuristic English syllable counter: counts vowel groups, drops a silent
 * trailing "e" (but keeps "-le" as in "table"), minimum one syllable.
 * Standard approximation used by readability tools; exact syllabification
 * needs a dictionary.
 */
export function countSyllables(rawWord) {
  const word = typeof rawWord === "string" ? rawWord.toLowerCase().replace(/[^a-z]/g, "") : "";
  if (word.length === 0) return 0;
  if (word.length <= 2) return 1;
  let trimmed = word;
  if (/[^aeiou]e$/.test(trimmed) && !/le$/.test(trimmed)) {
    trimmed = trimmed.slice(0, -1);
  }
  const groups = trimmed.match(/[aeiouy]+/g);
  return Math.max(1, groups ? groups.length : 1);
}

/** Split text into words (letter/number runs, apostrophes allowed). */
export function extractWords(text) {
  if (typeof text !== "string") return [];
  return text.match(/[A-Za-z0-9']+/g) ?? [];
}

/** Count sentences: runs ending in . ! ? … or a final unterminated run. */
export function countSentences(text) {
  if (typeof text !== "string") return 0;
  const matches = text.match(/[.!?…]+/g);
  const terminated = matches ? matches.length : 0;
  // A trailing fragment without terminal punctuation still counts as a sentence.
  const tail = text.replace(/[.!?…]+[\s)"'\]]*$/g, "").trim();
  const endsClean = /[.!?…]\s*$/.test(text.trim());
  if (terminated === 0) return tail.length > 0 ? 1 : 0;
  return endsClean ? terminated : terminated + (tail.split(/[.!?…]/).pop().trim().length > 0 ? 1 : 0);
}

/**
 * Analyse text: word, sentence and syllable counts plus Flesch-Kincaid grade
 * and Flesch Reading Ease. Returns { error } when the sample is too short.
 */
export function analyzeText(text) {
  if (typeof text !== "string" || text.trim().length === 0) {
    return { error: "Paste the text or prompt you want to adjust." };
  }
  if (text.length > MAX_TEXT_CHARS) {
    return { error: `Keep the text under ${MAX_TEXT_CHARS.toLocaleString("en-US")} characters.` };
  }
  const words = extractWords(text);
  const sentences = countSentences(text);
  if (words.length < MIN_WORDS_FOR_SCORE) {
    return { error: `Need at least ${MIN_WORDS_FOR_SCORE} words to score readability reliably.` };
  }
  if (sentences === 0) {
    return { error: "Could not find any sentences in the text." };
  }
  const syllables = words.reduce((sum, word) => sum + countSyllables(word), 0);
  const wordsPerSentence = words.length / sentences;
  const syllablesPerWord = syllables / words.length;

  const fkRaw =
    FK_SENTENCE_WEIGHT * wordsPerSentence + FK_SYLLABLE_WEIGHT * syllablesPerWord - FK_CONSTANT;
  const fre =
    FRE_BASE - FRE_SENTENCE_WEIGHT * wordsPerSentence - FRE_SYLLABLE_WEIGHT * syllablesPerWord;

  return {
    wordCount: words.length,
    sentenceCount: sentences,
    syllableCount: syllables,
    wordsPerSentence,
    syllablesPerWord,
    fkGrade: Math.max(0, fkRaw), // grade below 0 is reported as 0
    fkGradeRaw: fkRaw,
    readingEase: Math.min(100, Math.max(0, fre)),
  };
}

/**
 * Build the rewrite prompt targeting `bandId`, embedding the measured stats.
 *
 * @param {object} input
 * @param {string} input.text     The text or prompt to rewrite.
 * @param {string} input.bandId   Id from GRADE_BANDS.
 * @param {boolean} [input.keepTerms] Keep essential technical terms (defined on first use).
 * @returns {object} { prompt, analysis, band } or { error }.
 */
export function buildReadingLevelPrompt({ text, bandId, keepTerms = true }) {
  const band = GRADE_BANDS.find((option) => option.id === bandId);
  if (!band) return { error: "Choose a target reading level." };

  const analysis = analyzeText(text);
  if (analysis.error) return { error: analysis.error };

  const lines = [];
  lines.push(
    `Rewrite the text below so it reads at a Flesch-Kincaid grade level of ${band.fkTarget} (${band.label}), without changing its meaning, facts or instructions.`,
  );
  lines.push("");
  lines.push(
    `The text currently measures grade ${analysis.fkGrade.toFixed(1)} (average ${analysis.wordsPerSentence.toFixed(1)} words per sentence, ${analysis.syllablesPerWord.toFixed(2)} syllables per word).`,
  );
  lines.push("");
  lines.push("Rewrite rules:");
  lines.push(`- Keep the average sentence under ${band.maxWordsPerSentence} words; split any longer sentence.`);
  lines.push("- Prefer short, common words over multi-syllable ones (e.g. \"use\" not \"utilise\", \"help\" not \"facilitate\").");
  lines.push("- One idea per sentence; use active voice with a clear actor.");
  if (band.id === "g2-3" || band.id === "g4-5") {
    lines.push("- Replace abstract nouns with concrete examples a child of this age knows.");
  }
  if (keepTerms) {
    lines.push("- Keep technical terms that are essential, but define each one in plain words the first time it appears.");
  } else {
    lines.push("- Replace every technical term with an everyday equivalent, even if slightly less precise.");
  }
  lines.push("- Keep lists as lists; keep the original order of points.");
  lines.push("- Do not add new information, opinions or examples that change the content.");
  lines.push("");
  lines.push("Return only the rewritten text. Text to rewrite:");
  lines.push('"""');
  lines.push(text.trim());
  lines.push('"""');

  return {
    prompt: lines.join("\n"),
    analysis,
    band: band.label,
    fkTarget: band.fkTarget,
  };
}
