/**
 * Tokens → words conversion.
 *
 * Baseline: OpenAI's tokenizer documentation states 1 token ≈ ¾ of a word
 * (≈ 4 characters) for common English text. Other content types tokenize
 * more heavily, so fewer words come out of the same token budget; the preset
 * factors below scale the English baseline by typical observed ratios for
 * technical prose, code and non-English text. They are heuristics, not exact —
 * exact counts depend on the model's tokenizer.
 */

/** OpenAI rule of thumb: 1 token ≈ 0.75 English words. */
export const WORDS_PER_TOKEN_ENGLISH = 0.75;

/** OpenAI rule of thumb: 1 token ≈ 4 characters, used for the character figure. */
export const CHARS_PER_TOKEN = 4;

/** Content-type presets (words produced per token). */
export const CONTENT_PRESETS = [
  {
    id: "english-prose",
    label: "Plain English prose",
    wordsPerToken: WORDS_PER_TOKEN_ENGLISH, // the documented ~¾-word baseline
    note: "General articles, emails and essays.",
  },
  {
    id: "technical",
    label: "Technical / jargon-heavy writing",
    wordsPerToken: 0.6, // ~1.6–1.7 tokens per word observed for technical vocabulary
    note: "Documentation, scientific or legal text with uncommon terms.",
  },
  {
    id: "european",
    label: "Non-English European language",
    wordsPerToken: 0.55, // European languages typically tokenize ~1.5–2× heavier than English
    note: "German, French, Spanish and similar Latin-script languages.",
  },
  {
    id: "code",
    label: "Source code / JSON",
    wordsPerToken: 0.4, // punctuation and identifiers commonly cost 2–3 tokens per 'word'
    note: "Code, config and markup tokenize far heavier than prose.",
  },
];

/** Words-per-page conventions: 12pt Times New Roman, 1-inch margins. */
export const PAGE_PRESETS = [
  { id: "single", label: "Single-spaced page (~500 words)", wordsPerPage: 500 },
  { id: "double", label: "Double-spaced page (~250 words)", wordsPerPage: 250 },
];

/**
 * Average adult silent reading speed for non-fiction: ~238 words per minute
 * (Brysbaert, 2019 meta-analysis, Journal of Memory and Language).
 */
export const READING_WPM = 238;

/** Sanity bounds. */
export const MAX_TOKENS = 1e9; // far beyond any current context window
export const MIN_WORDS_PER_TOKEN = 0.05;
export const MAX_WORDS_PER_TOKEN = 2;

/**
 * Convert a token budget into words, pages and reading time.
 *
 * @param {object} input
 * @param {number} input.tokens        Token budget.
 * @param {number} input.wordsPerToken Words produced per token (preset or custom).
 * @param {number} input.wordsPerPage  Page convention (500 single / 250 double spaced).
 * @returns {object} { words, pages, chars, readingMinutes } or { error }.
 */
export function convertTokensToWords({ tokens, wordsPerToken, wordsPerPage }) {
  const t = Number(tokens);
  const wpt = Number(wordsPerToken);
  const wpp = Number(wordsPerPage);

  if (!Number.isFinite(t)) return { error: "Enter the token budget as a number." };
  if (t <= 0) return { error: "The token budget must be greater than zero." };
  if (t > MAX_TOKENS) return { error: "That token budget is beyond any realistic context window." };
  if (!Number.isFinite(wpt) || wpt < MIN_WORDS_PER_TOKEN || wpt > MAX_WORDS_PER_TOKEN) {
    return {
      error: `Words per token must be between ${MIN_WORDS_PER_TOKEN} and ${MAX_WORDS_PER_TOKEN}.`,
    };
  }
  if (!Number.isFinite(wpp) || wpp <= 0) {
    return { error: "Choose a words-per-page convention." };
  }

  const words = Math.round(t * wpt);
  const pages = words / wpp;
  const chars = Math.round(t * CHARS_PER_TOKEN);
  const readingMinutes = words / READING_WPM;

  return {
    tokens: t,
    wordsPerToken: wpt,
    words,
    pages,
    wordsPerPage: wpp,
    chars,
    readingMinutes,
  };
}
