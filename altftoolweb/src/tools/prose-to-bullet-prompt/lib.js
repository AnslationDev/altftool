/**
 * Prose to Bullet Prompt — pure logic.
 *
 *  1. Real text measurement: words, sentences, paragraphs, syllables, and the
 *     Flesch Reading Ease and Flesch-Kincaid Grade Level scores computed from
 *     their published formulas.
 *  2. Real compression budgeting: target length, bullet count and words per
 *     bullet, plus a grouping rule once the list gets long.
 *  3. Deterministic assembly of the rewrite prompt.
 *
 * No React, no DOM, no clocks.
 */

/** OpenAI's published rule of thumb for English: ~4 characters per token. */
export const CHARS_PER_TOKEN = 4;

/**
 * Flesch Reading Ease (Flesch, 1948):
 *   206.835 − 1.015 × (words / sentences) − 84.6 × (syllables / words)
 * Higher is easier; 60-70 is "plain English".
 */
export const FRE_BASE = 206.835;
export const FRE_SENTENCE_WEIGHT = 1.015;
export const FRE_SYLLABLE_WEIGHT = 84.6;

/**
 * Flesch-Kincaid Grade Level (Kincaid et al., 1975):
 *   0.39 × (words / sentences) + 11.8 × (syllables / words) − 15.59
 * Result is a US school grade.
 */
export const FK_SENTENCE_WEIGHT = 0.39;
export const FK_SYLLABLE_WEIGHT = 11.8;
export const FK_CONSTANT = 15.59;

/**
 * Miller, G. A. (1956), "The magical number seven, plus or minus two".
 * Used only as the point at which a flat list should be grouped under headings.
 */
export const GROUPING_THRESHOLD = 7;

export const MIN_COMPRESSION_PCT = 5;
export const MAX_COMPRESSION_PCT = 90;
export const MIN_WORDS_PER_BULLET = 3;
export const MAX_WORDS_PER_BULLET = 40;
export const MAX_BULLETS = 60;

export const BULLET_STYLES = {
  "noun-phrase": "Noun phrases, no leading verb, no full stop. Best for feature lists and specs.",
  "verb-first": "Start every bullet with a strong verb in the same tense. Best for actions and achievements.",
  "claim-number": "Lead with the claim, then the supporting number in the same bullet. Best for reporting results.",
  "question-answer": "Each bullet is a short question followed by a one-line answer. Best for FAQs and briefing notes.",
};

export const ORDERINGS = {
  source: "Keep the original order of the prose.",
  importance: "Reorder by importance, most decision-relevant first.",
  chronological: "Reorder into chronological order.",
  grouped: "Group related points under short headings.",
};

function clean(text) {
  return String(text ?? "").trim();
}

/**
 * Syllable estimate for one English word: count vowel groups, then drop a
 * trailing silent "e" unless the word ends in a consonant + "le". Heuristic,
 * not a dictionary lookup, so treat the readability scores as estimates.
 */
export function countSyllables(word) {
  const w = String(word ?? "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");
  if (!w) return 0;
  const groups = w.match(/[aeiouy]+/g);
  let count = groups ? groups.length : 0;
  if (w.length > 2 && w.endsWith("e") && !/[^aeiouy]le$/.test(w)) count -= 1;
  return Math.max(1, count);
}

/** Words, sentences, paragraphs and syllables in a block of prose. */
export function measureProse(text) {
  const source = String(text ?? "");
  const words = source.split(/\s+/).filter((token) => /[a-zA-Z0-9]/.test(token));
  const paragraphs = source.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);
  // A sentence ends at . ! ? or a newline. Abbreviations will inflate the count.
  const sentences = source
    .split(/(?<=[.!?])\s+|\n+/)
    .map((part) => part.trim())
    .filter((part) => /[a-zA-Z0-9]/.test(part));
  const syllables = words.reduce((sum, word) => sum + countSyllables(word), 0);
  return {
    wordCount: words.length,
    sentenceCount: sentences.length,
    paragraphCount: paragraphs.length,
    syllableCount: syllables,
  };
}

/**
 * Flesch Reading Ease and Flesch-Kincaid Grade Level.
 * Returns nulls rather than NaN when there is nothing to measure.
 */
export function readability({ wordCount, sentenceCount, syllableCount }) {
  if (!(wordCount > 0) || !(sentenceCount > 0)) return { ease: null, grade: null, band: null };
  const wordsPerSentence = wordCount / sentenceCount;
  const syllablesPerWord = syllableCount / wordCount;
  const ease =
    FRE_BASE - FRE_SENTENCE_WEIGHT * wordsPerSentence - FRE_SYLLABLE_WEIGHT * syllablesPerWord;
  const grade =
    FK_SENTENCE_WEIGHT * wordsPerSentence + FK_SYLLABLE_WEIGHT * syllablesPerWord - FK_CONSTANT;

  let band = "Very difficult";
  if (ease >= 90) band = "Very easy";
  else if (ease >= 80) band = "Easy";
  else if (ease >= 70) band = "Fairly easy";
  else if (ease >= 60) band = "Plain English";
  else if (ease >= 50) band = "Fairly difficult";
  else if (ease >= 30) band = "Difficult";

  return {
    ease: Math.round(ease * 10) / 10,
    grade: Math.round(grade * 10) / 10,
    band,
    wordsPerSentence: Math.round(wordsPerSentence * 10) / 10,
    syllablesPerWord: Math.round(syllablesPerWord * 100) / 100,
  };
}

/** Compression target, bullet count and words per bullet. */
export function bulletBudget({ wordCount, compressionPct, wordsPerBullet }) {
  const targetWords = Math.max(1, Math.round((wordCount * compressionPct) / 100));
  const uncappedBulletCount = Math.max(1, Math.ceil(targetWords / wordsPerBullet));
  const bulletCount = Math.min(MAX_BULLETS, uncappedBulletCount);
  const actualWordsPerBullet = Math.round((targetWords / bulletCount) * 10) / 10;
  // The MAX_BULLETS cap can force more words into each bullet than the tool's
  // own MIN/MAX_WORDS_PER_BULLET input range allows — flag that so callers can
  // warn rather than silently hand out an out-of-range figure.
  const bulletCountCapped = uncappedBulletCount > MAX_BULLETS;
  const wordsPerBulletOverMax = actualWordsPerBullet > MAX_WORDS_PER_BULLET;
  return {
    targetWords,
    bulletCount,
    actualWordsPerBullet,
    bulletCountCapped,
    wordsPerBulletOverMax,
  };
}

/**
 * @returns {{error: string} | object}
 */
export function buildProseToBulletPrompt({
  prose = "",
  style = "noun-phrase",
  ordering = "source",
  compressionPct = 40,
  wordsPerBullet = 12,
  audience = "",
  mustKeep = "",
  allowSubBullets = true,
} = {}) {
  const compression = Number(compressionPct);
  const perBullet = Number(wordsPerBullet);

  if (![compression, perBullet].every(Number.isFinite)) {
    return { error: "Compression and words per bullet must be numbers." };
  }
  if (compression < MIN_COMPRESSION_PCT || compression > MAX_COMPRESSION_PCT) {
    return { error: `Compression should be between ${MIN_COMPRESSION_PCT}% and ${MAX_COMPRESSION_PCT}% of the original.` };
  }
  if (perBullet < MIN_WORDS_PER_BULLET || perBullet > MAX_WORDS_PER_BULLET) {
    return { error: `Words per bullet should be between ${MIN_WORDS_PER_BULLET} and ${MAX_WORDS_PER_BULLET}.` };
  }

  const stats = measureProse(prose);
  if (stats.wordCount === 0) return { error: "Paste some prose to convert." };
  if (stats.sentenceCount === 0) return { error: "No complete sentences found — check the text you pasted." };

  const scores = readability(stats);
  const budget = bulletBudget({
    wordCount: stats.wordCount,
    compressionPct: compression,
    wordsPerBullet: perBullet,
  });

  // Grouping under headings re-orders points into clusters, which directly
  // contradicts an explicit "keep the original order" choice. Only offer the
  // grouping instruction when the user hasn't asked for source order.
  const needsGrouping = budget.bulletCount > GROUPING_THRESHOLD && ordering !== "source";
  const styleText = BULLET_STYLES[style] ?? BULLET_STYLES["noun-phrase"];
  const orderText = ORDERINGS[ordering] ?? ORDERINGS.source;

  const lines = [];
  lines.push("Rewrite the prose below as a bullet list. Do not return paragraphs.");
  lines.push("");
  lines.push("SOURCE MEASUREMENTS");
  lines.push(`- ${stats.wordCount} words, ${stats.sentenceCount} sentences, ${stats.paragraphCount} ${stats.paragraphCount === 1 ? "paragraph" : "paragraphs"}`);
  lines.push(`- Average ${scores.wordsPerSentence} words a sentence`);
  lines.push(`- Flesch Reading Ease ${scores.ease} (${scores.band}), Flesch-Kincaid grade ${scores.grade}`);
  lines.push("");
  lines.push("TARGET");
  lines.push(`- About ${budget.bulletCount} bullets`);
  lines.push(`- About ${budget.targetWords} words in total (${compression}% of the original), averaging ${budget.actualWordsPerBullet} words a bullet`);
  if (budget.wordsPerBulletOverMax) {
    lines.push(
      `- Note: hitting ${MAX_BULLETS} bullets forced the average above the usual ${MAX_WORDS_PER_BULLET}-word guideline — favor a lower compression % or a higher words-per-bullet setting next time.`,
    );
  }
  lines.push(`- Style: ${styleText}`);
  lines.push(`- Order: ${orderText}`);
  if (clean(audience)) lines.push(`- Audience: ${clean(audience)}`);
  lines.push("");
  lines.push("RULES");
  lines.push("- Keep every fact, number, name and date that appears in the source. Losing one is a failure.");
  lines.push("- Cut hedging, throat-clearing and repeated context. Cut adjectives that carry no information.");
  lines.push("- Make every bullet grammatically parallel with the others.");
  lines.push("- No bullet may be a full paragraph in disguise — if it needs a semicolon, split it.");
  lines.push("- Do not add anything that is not in the source, including summaries of implications.");
  if (allowSubBullets) lines.push("- Sub-bullets are allowed, one level deep, for supporting detail only.");
  else lines.push("- Use a single flat level. No sub-bullets.");
  if (needsGrouping) {
    lines.push(
      `- ${budget.bulletCount} bullets is past the ${GROUPING_THRESHOLD}-item point where a flat list stops being scannable — group them under 2 to 4 short headings.`,
    );
  }
  if (clean(mustKeep)) lines.push(`- These must survive verbatim: ${clean(mustKeep)}`);
  lines.push("");
  lines.push("PROSE");
  lines.push(clean(prose));
  lines.push("");
  lines.push("Return only the bullet list, then one line stating anything you had to drop to hit the target length.");

  const prompt = lines.join("\n");

  return {
    prompt,
    ...stats,
    ...scores,
    targetWords: budget.targetWords,
    bulletCount: budget.bulletCount,
    actualWordsPerBullet: budget.actualWordsPerBullet,
    bulletCountCapped: budget.bulletCountCapped,
    wordsPerBulletOverMax: budget.wordsPerBulletOverMax,
    needsGrouping,
    promptWordCount: prompt.split(/\s+/).filter(Boolean).length,
    tokenEstimate: Math.ceil(prompt.length / CHARS_PER_TOKEN),
  };
}
