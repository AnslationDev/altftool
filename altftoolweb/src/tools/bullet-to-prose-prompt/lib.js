/**
 * Bullet to Prose Prompt — pure logic.
 *
 *  1. Real measurement of the pasted notes: bullet count, word count per bullet,
 *     nesting depth, and the over-long bullets that will need splitting.
 *  2. Real length budgeting: expansion factor gives a target word count, which
 *     divides into sentences and paragraphs and converts to a reading time.
 *  3. Deterministic assembly of the rewrite prompt.
 *
 * No React, no DOM, no clocks.
 */

/** OpenAI's published rule of thumb for English: ~4 characters per token. */
export const CHARS_PER_TOKEN = 4;

/**
 * Silent reading speed for English non-fiction, 238 words per minute.
 * Brysbaert, M. (2019), Journal of Memory and Language.
 */
export const WORDS_PER_MINUTE = 238;

/**
 * Plain-language style guides (UK Government Digital Service, US plainlanguage.gov)
 * converge on an average sentence of roughly 15-20 words. 18 is the midpoint and
 * the default here; it is adjustable.
 */
export const DEFAULT_WORDS_PER_SENTENCE = 18;
export const MIN_WORDS_PER_SENTENCE = 8;
export const MAX_WORDS_PER_SENTENCE = 40;

/** A bullet longer than this is really two ideas and should be split. */
export const LONG_BULLET_WORDS = 30;

export const MIN_EXPANSION = 1;
export const MAX_EXPANSION = 10;
export const MAX_BULLETS = 200;

export const TONES = {
  neutral: "Neutral and factual, no salesmanship.",
  warm: "Warm and conversational, contractions allowed.",
  formal: "Formal and precise, suitable for a report or a regulator.",
  persuasive: "Persuasive but evidence-led — argue, do not hype.",
  academic: "Academic register, hedged claims, no rhetorical questions.",
};

export const POINTS_OF_VIEW = {
  first: "first person singular (I)",
  "first-plural": "first person plural (we)",
  third: "third person (the team, the company)",
  impersonal: "impersonal, no personal pronouns",
};

export const CONNECTOR_STYLES = {
  chronological: "Order the material as a sequence of events, using time connectives.",
  "cause-effect": "Link each point to the next by cause and effect, not by 'also' and 'additionally'.",
  "claim-evidence": "Lead each paragraph with the claim, then the evidence from the notes.",
  "general-specific": "Open each paragraph with the general point and narrow to the specific detail.",
};

function clean(text) {
  return String(text ?? "").trim();
}

function countWords(text) {
  return clean(text).split(/\s+/).filter(Boolean).length;
}

/**
 * Split pasted notes into bullets. Recognises -, *, •, – and "1." markers, and
 * treats any other non-empty line as a bullet too. Indentation is kept as a
 * nesting depth so the prompt can be told the notes are hierarchical.
 */
export function parseBullets(raw) {
  const bullets = [];
  for (const line of String(raw ?? "").split(/\r?\n/)) {
    if (!line.trim()) continue;
    const indent = (/^[\t ]*/.exec(line)?.[0] ?? "").replace(/\t/g, "  ").length;
    const text = line.replace(/^[\t ]*(?:[-*•–—]|\d+[.)])\s*/, "").trim();
    if (!text) continue;
    bullets.push({ text, words: countWords(text), depth: Math.floor(indent / 2) });
    if (bullets.length >= MAX_BULLETS) break;
  }
  return bullets;
}

/** Reading time in whole minutes at WORDS_PER_MINUTE, minimum 1 for any text. */
export function readingMinutes(words) {
  if (!(words > 0)) return 0;
  return Math.ceil(words / WORDS_PER_MINUTE);
}

/**
 * Turn a source word count into a prose budget.
 */
export function proseBudget({ sourceWords, expansion, wordsPerSentence, sentencesPerParagraph, overrideWords }) {
  const targetWords = overrideWords > 0 ? Math.round(overrideWords) : Math.round(sourceWords * expansion);
  const sentences = Math.max(1, Math.round(targetWords / wordsPerSentence));
  const paragraphs = Math.max(1, Math.ceil(sentences / sentencesPerParagraph));
  return { targetWords, sentences, paragraphs };
}

/**
 * @returns {{error: string} | object}
 */
export function buildBulletToProsePrompt({
  bullets = "",
  audience = "",
  tone = "neutral",
  pointOfView = "first-plural",
  connector = "claim-evidence",
  expansion = 2.5,
  wordsPerSentence = DEFAULT_WORDS_PER_SENTENCE,
  sentencesPerParagraph = 4,
  overrideWords = 0,
  keepOrder = true,
  keepTerms = "",
} = {}) {
  const factor = Number(expansion);
  const perSentence = Number(wordsPerSentence);
  const perParagraph = Math.round(Number(sentencesPerParagraph));
  const override = Number(overrideWords);

  if (![factor, perSentence, perParagraph, override].every(Number.isFinite)) {
    return { error: "Expansion, sentence length and paragraph size must all be numbers." };
  }
  if (factor < MIN_EXPANSION || factor > MAX_EXPANSION) {
    return { error: `Expansion factor should be between ${MIN_EXPANSION}x and ${MAX_EXPANSION}x.` };
  }
  if (perSentence < MIN_WORDS_PER_SENTENCE || perSentence > MAX_WORDS_PER_SENTENCE) {
    return { error: `Average sentence length should be between ${MIN_WORDS_PER_SENTENCE} and ${MAX_WORDS_PER_SENTENCE} words.` };
  }
  if (perParagraph < 1 || perParagraph > 10) {
    return { error: "Sentences per paragraph should be between 1 and 10." };
  }
  if (override < 0 || (override > 0 && (override < 50 || override > 5000))) {
    return { error: "A fixed target length must be between 50 and 5000 words, or 0 to use the expansion factor." };
  }

  const parsed = parseBullets(bullets);
  if (parsed.length === 0) {
    return { error: "Paste at least one bullet point — one idea per line." };
  }

  const sourceWords = parsed.reduce((sum, bullet) => sum + bullet.words, 0);
  if (sourceWords === 0) return { error: "The bullets contain no words to expand." };

  const budget = proseBudget({
    sourceWords,
    expansion: factor,
    wordsPerSentence: perSentence,
    sentencesPerParagraph: perParagraph,
    overrideWords: override,
  });

  const longBullets = parsed.filter((bullet) => bullet.words > LONG_BULLET_WORDS);
  const nested = parsed.some((bullet) => bullet.depth > 0);
  const avgWords = Math.round((sourceWords / parsed.length) * 10) / 10;
  const readMinutes = readingMinutes(budget.targetWords);

  const toneText = TONES[tone] ?? TONES.neutral;
  const povText = POINTS_OF_VIEW[pointOfView] ?? POINTS_OF_VIEW["first-plural"];
  const connectorText = CONNECTOR_STYLES[connector] ?? CONNECTOR_STYLES["claim-evidence"];

  const lines = [];
  lines.push("Rewrite the bullet points below as continuous prose. Do not return a list.");
  lines.push("");
  lines.push("TARGET");
  lines.push(`- Length: about ${budget.targetWords} words (${readMinutes}-minute read)`);
  lines.push(`- Shape: roughly ${budget.paragraphs} ${budget.paragraphs === 1 ? "paragraph" : "paragraphs"}, ${budget.sentences} sentences in total, averaging ${perSentence} words a sentence`);
  lines.push(`- Voice: ${povText}`);
  lines.push(`- Tone: ${toneText}`);
  if (clean(audience)) lines.push(`- Audience: ${clean(audience)}`);
  lines.push("");
  lines.push("RULES");
  lines.push(`- ${connectorText}`);
  lines.push(
    keepOrder
      ? "- Keep the bullets in the order given; the sequence carries meaning."
      : "- You may reorder the points if a different order reads better, but do not drop any.",
  );
  lines.push("- Every bullet must appear in the prose. Do not merge two bullets into one clause that loses either idea.");
  lines.push("- Add no facts, numbers, names or claims that are not in the notes. If a bullet is too thin to expand honestly, say so at the end rather than inventing detail.");
  lines.push("- Vary sentence length. Do not start consecutive sentences with the same word.");
  lines.push("- Ban these connective crutches: moreover, furthermore, additionally, in conclusion, it is important to note.");
  if (clean(keepTerms)) lines.push(`- Use these exact terms unchanged: ${clean(keepTerms)}`);
  if (nested) lines.push("- The notes are nested: indented lines are sub-points of the line above and should become subordinate clauses, not new sentences.");
  if (longBullets.length) {
    lines.push(
      `- ${longBullets.length} ${longBullets.length === 1 ? "bullet is" : "bullets are"} over ${LONG_BULLET_WORDS} words and contain more than one idea — split ${longBullets.length === 1 ? "it" : "them"} across sentences.`,
    );
  }
  lines.push("");
  lines.push("BULLETS");
  parsed.forEach((bullet, index) => {
    lines.push(`${index + 1}. ${"  ".repeat(bullet.depth)}${bullet.text}`);
  });
  lines.push("");
  lines.push("Return only the prose. After it, list any bullet you could not expand without inventing detail.");

  const prompt = lines.join("\n");

  return {
    prompt,
    bulletCount: parsed.length,
    sourceWords,
    avgWords,
    longBulletCount: longBullets.length,
    nested,
    targetWords: budget.targetWords,
    sentences: budget.sentences,
    paragraphs: budget.paragraphs,
    readMinutes,
    wordCount: prompt.split(/\s+/).filter(Boolean).length,
    tokenEstimate: Math.ceil(prompt.length / CHARS_PER_TOKEN),
  };
}
