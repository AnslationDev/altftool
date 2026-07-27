/**
 * AI Tone Rewrite Prompt Builder.
 *
 * Measures the source text with the published Flesch readability formulas,
 * then assembles a rewrite instruction that names the target tone, the target
 * readability band and the things the model must not change.
 */

/**
 * Flesch Reading Ease (Flesch, 1948):
 *   206.835 − 1.015 × (words / sentences) − 84.6 × (syllables / words)
 */
export const FRE_CONSTANT = 206.835;
export const FRE_SENTENCE_WEIGHT = 1.015;
export const FRE_SYLLABLE_WEIGHT = 84.6;

/**
 * Flesch–Kincaid Grade Level (Kincaid et al., 1975, US Navy report 8-75):
 *   0.39 × (words / sentences) + 11.8 × (syllables / words) − 15.59
 */
export const FK_SENTENCE_WEIGHT = 0.39;
export const FK_SYLLABLE_WEIGHT = 11.8;
export const FK_CONSTANT = 15.59;

/** The standard Flesch Reading Ease interpretation bands. */
export const READING_BANDS = [
  { id: "very-easy", label: "Very easy", min: 90, max: 100, school: "5th grade", note: "Short sentences, everyday words." },
  { id: "easy", label: "Easy", min: 80, max: 90, school: "6th grade", note: "Conversational English." },
  { id: "fairly-easy", label: "Fairly easy", min: 70, max: 80, school: "7th grade", note: "Comfortable for most consumer copy." },
  { id: "plain", label: "Plain English", min: 60, max: 70, school: "8th–9th grade", note: "The usual target for public-facing writing." },
  { id: "fairly-difficult", label: "Fairly difficult", min: 50, max: 60, school: "10th–12th grade", note: "Trade and B2B writing." },
  { id: "difficult", label: "Difficult", min: 30, max: 50, school: "College", note: "Academic and technical prose." },
  { id: "very-difficult", label: "Very difficult", min: 0, max: 30, school: "College graduate", note: "Legal and specialist text." },
];

export const TONES = [
  { id: "professional", label: "Professional", directive: "measured and businesslike, no slang, no exclamation marks, first person plural where a subject is needed" },
  { id: "friendly", label: "Friendly", directive: "warm and conversational, contractions allowed, second person, no forced jokes" },
  { id: "confident", label: "Confident", directive: "declarative and unhedged, active voice throughout, no 'we believe' or 'it seems'" },
  { id: "empathetic", label: "Empathetic", directive: "acknowledge the reader's situation before offering anything, no minimising language, no blame" },
  { id: "direct", label: "Direct and concise", directive: "shortest wording that keeps the meaning, one idea per sentence, cut every qualifier" },
  { id: "persuasive", label: "Persuasive", directive: "lead with the benefit to the reader, support each claim with a stated reason, one clear call to action" },
  { id: "academic", label: "Academic", directive: "formal register, no contractions, claims attributed, hedging only where evidence is genuinely uncertain" },
  { id: "plain-legal", label: "Plain legal", directive: "keep the legal effect exactly, replace archaic terms with ordinary words, one obligation per sentence" },
  { id: "playful", label: "Playful", directive: "light and informal, one image or aside per paragraph at most, never at the reader's expense" },
  { id: "neutral", label: "Neutral and factual", directive: "no evaluative adjectives, no persuasion, statements verifiable from the source text only" },
  { id: "urgent", label: "Urgent", directive: "front-load the deadline and the consequence, imperative verbs, no more than one sentence of context" },
  { id: "apologetic", label: "Apologetic", directive: "apologise once and specifically, state what went wrong, what is being done, and what the reader gets" },
];

export const PRESERVE_RULES = [
  { id: "facts", label: "All facts, names, dates and numbers", rule: "Do not add, remove or alter any fact, name, date, figure or currency amount." },
  { id: "length", label: "Roughly the same length", rule: "Keep the rewrite within 10% of the original word count." },
  { id: "structure", label: "Paragraph and heading structure", rule: "Keep the same number of paragraphs and the same headings in the same order." },
  { id: "terms", label: "Domain terminology", rule: "Keep specialist and product terms exactly as written; do not substitute synonyms for them." },
  { id: "quotes", label: "Quotations verbatim", rule: "Reproduce anything inside quotation marks character for character." },
  { id: "spelling", label: "British spelling", rule: "Use British spelling and punctuation conventions throughout." },
  { id: "markdown", label: "Markdown formatting", rule: "Preserve Markdown syntax — lists, links, emphasis and code spans — unchanged." },
];

/** About four characters per token for ordinary English prose. */
export const AVERAGE_CHARS_PER_TOKEN = 4;

function splitSentences(text) {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => /[A-Za-z0-9]/.test(sentence));
}

function splitWords(text) {
  return text.match(/[A-Za-z0-9'’-]+/g) || [];
}

/**
 * Syllable estimate for one English word. This is the widely used vowel-group
 * heuristic — strip a silent final e/ed/es, then count runs of vowels — and is
 * an approximation, not a dictionary lookup.
 */
export function countSyllables(word) {
  const clean = String(word || "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");
  if (clean.length === 0) return 0;
  if (clean.length <= 3) return 1;
  const trimmed = clean
    .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "")
    .replace(/^y/, "");
  const groups = trimmed.match(/[aeiouy]+/g);
  return groups ? groups.length : 1;
}

/**
 * Flesch Reading Ease and Flesch–Kincaid Grade Level for a passage.
 * @returns {{error:string}|object}
 */
export function analyseReadability(text) {
  if (typeof text !== "string" || text.trim().length === 0) {
    return { error: "Paste the text you want rewritten." };
  }
  const sentences = splitSentences(text);
  const words = splitWords(text);
  if (words.length < 10 || sentences.length < 1) {
    return { error: "Paste at least one full sentence of about 10 words to score it." };
  }
  const syllables = words.reduce((sum, word) => sum + countSyllables(word), 0);
  const wordsPerSentence = words.length / sentences.length;
  const syllablesPerWord = syllables / words.length;

  const readingEase =
    FRE_CONSTANT - FRE_SENTENCE_WEIGHT * wordsPerSentence - FRE_SYLLABLE_WEIGHT * syllablesPerWord;
  const gradeLevel =
    FK_SENTENCE_WEIGHT * wordsPerSentence + FK_SYLLABLE_WEIGHT * syllablesPerWord - FK_CONSTANT;

  return {
    words: words.length,
    sentences: sentences.length,
    syllables,
    wordsPerSentence,
    syllablesPerWord,
    readingEase,
    gradeLevel,
    band: bandForScore(readingEase),
    characters: text.length,
  };
}

/** The Flesch band a score falls into; scores outside 0-100 clamp to the ends. */
export function bandForScore(score) {
  if (!Number.isFinite(score)) return READING_BANDS[READING_BANDS.length - 1];
  if (score >= 90) return READING_BANDS[0];
  const found = READING_BANDS.find((band) => score >= band.min && score < band.max);
  return found || READING_BANDS[READING_BANDS.length - 1];
}

export function getBand(bandId) {
  return READING_BANDS.find((band) => band.id === bandId) || null;
}

export function getTone(toneId) {
  return TONES.find((tone) => tone.id === toneId) || null;
}

/** Distance in Flesch points from the current score to the target band. */
export function gapToTarget(readingEase, band) {
  if (!band || !Number.isFinite(readingEase)) return { error: "Choose a target reading level." };
  if (readingEase >= band.min && readingEase <= band.max) {
    return { inBand: true, direction: "none", points: 0 };
  }
  if (readingEase < band.min) {
    return { inBand: false, direction: "simpler", points: band.min - readingEase };
  }
  return { inBand: false, direction: "denser", points: readingEase - band.max };
}

export function measureText(text) {
  if (typeof text !== "string" || text.trim().length === 0) {
    return { characters: 0, words: 0, approxTokens: 0 };
  }
  const characters = text.length;
  const words = splitWords(text).length;
  return {
    characters,
    words,
    approxTokens: Math.max(1, Math.ceil(characters / AVERAGE_CHARS_PER_TOKEN)),
  };
}

/**
 * Assemble the rewrite prompt.
 * @returns {{error:string}|{text:string, ...}}
 */
export function buildRewritePrompt({
  sourceText,
  toneId,
  bandId,
  audience,
  extraInstruction,
  preserveIds,
} = {}) {
  const analysis = analyseReadability(sourceText);
  if (analysis.error) return { error: analysis.error };
  const tone = getTone(toneId);
  if (!tone) return { error: "Choose a target tone." };
  const band = getBand(bandId);
  if (!band) return { error: "Choose a target reading level." };

  const gap = gapToTarget(analysis.readingEase, band);
  const chosen = Array.isArray(preserveIds) ? preserveIds : [];
  const rules = PRESERVE_RULES.filter((rule) => chosen.includes(rule.id));
  const reader = typeof audience === "string" && audience.trim() ? audience.trim() : "a general adult reader";
  const extra = typeof extraInstruction === "string" ? extraInstruction.trim() : "";

  const direction = gap.inBand
    ? "The source already sits in the target band, so hold the reading level steady while you change the tone."
    : gap.direction === "simpler"
      ? `The source is harder than the target by about ${Math.round(gap.points)} Flesch points, so shorten sentences and swap long words for shorter ones.`
      : `The source is easier than the target by about ${Math.round(gap.points)} Flesch points, so you may combine sentences and use more precise, longer terms.`;

  const lines = [
    "Rewrite the text below. Change the tone and reading level only — do not change what it says.",
    "",
    `TARGET TONE: ${tone.label} — ${tone.directive}.`,
    `TARGET READING LEVEL: Flesch Reading Ease ${band.min}–${band.max} (${band.label}, about ${band.school} reading level). ${band.note}`,
    `READER: ${reader}.`,
    "",
    "SOURCE MEASUREMENTS (already calculated, do not recompute):",
    `- Flesch Reading Ease: ${analysis.readingEase.toFixed(1)} (${analysis.band.label})`,
    `- Flesch–Kincaid Grade Level: ${analysis.gradeLevel.toFixed(1)}`,
    `- ${analysis.words} words in ${analysis.sentences} ${analysis.sentences === 1 ? "sentence" : "sentences"}, ${analysis.wordsPerSentence.toFixed(1)} words per sentence`,
    `- ${analysis.syllablesPerWord.toFixed(2)} syllables per word`,
    `- ${direction}`,
    "",
    "RULES:",
  ];

  const ruleLines = rules.map((rule) => `- ${rule.rule}`);
  if (ruleLines.length === 0) ruleLines.push("- Keep the meaning of every sentence intact.");
  ruleLines.push("- Do not add new claims, examples or statistics that are not in the source.");
  ruleLines.push("- If a sentence cannot be simplified without losing accuracy, leave it and say so at the end.");
  if (extra) ruleLines.push(`- ${extra}`);
  lines.push(...ruleLines);

  lines.push(
    "",
    "OUTPUT:",
    "1. The rewritten text.",
    "2. A one-line note on anything you could not change without altering meaning.",
    "",
    "TEXT TO REWRITE:",
    "\"\"\"",
    String(sourceText).trim(),
    "\"\"\"",
  );

  const text = lines.join("\n");
  return {
    text,
    analysis,
    band,
    tone,
    gap,
    appliedRules: rules.map((rule) => rule.label),
    ...measureText(text),
  };
}
