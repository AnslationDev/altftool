/**
 * Words → tokens estimation.
 *
 * Baseline: OpenAI's tokenizer documentation — for common English text
 * 1 token ≈ ¾ of a word, i.e. ≈ 4/3 tokens per word (and ≈ 4 characters per
 * token). Heavier content types (technical vocabulary, non-English languages,
 * source code) split into more tokens per word; the preset factors below are
 * heuristics scaled from that baseline, not exact tokenizer output.
 */

/** OpenAI rule of thumb: ~4/3 tokens per English word. */
export const TOKENS_PER_WORD_ENGLISH = 4 / 3;

/** OpenAI rule of thumb: 1 token ≈ 4 characters, used for the character figure. */
export const CHARS_PER_TOKEN = 4;

/** Content-type presets (tokens consumed per word). */
export const CONTENT_PRESETS = [
  {
    id: "english-prose",
    label: "Plain English prose",
    tokensPerWord: TOKENS_PER_WORD_ENGLISH, // documented ~1.33 baseline
    note: "General articles, emails and essays.",
  },
  {
    id: "technical",
    label: "Technical / jargon-heavy writing",
    tokensPerWord: 1.67, // uncommon terms split into sub-word tokens (~0.6 words/token)
    note: "Documentation, scientific or legal text with uncommon terms.",
  },
  {
    id: "european",
    label: "Non-English European language",
    tokensPerWord: 1.8, // European languages typically tokenize ~1.5–2× heavier than English
    note: "German, French, Spanish and similar Latin-script languages.",
  },
  {
    id: "code",
    label: "Source code / JSON",
    tokensPerWord: 2.5, // identifiers and punctuation commonly cost 2–3 tokens per 'word'
    note: "Code, config and markup tokenize far heavier than prose.",
  },
];

/**
 * Default safety margin for budgeting. A 10% buffer is a common operational
 * convention to absorb tokenizer variance in character-based estimates.
 */
export const DEFAULT_MARGIN_PERCENT = 10;

/** Sanity bounds. */
export const MAX_WORDS = 1e8;
export const MIN_TOKENS_PER_WORD = 0.5;
export const MAX_TOKENS_PER_WORD = 5;
export const MAX_MARGIN_PERCENT = 100;

/**
 * Estimate tokens from a word count.
 *
 * @param {object} input
 * @param {number} input.words          Planned word count.
 * @param {number} input.tokensPerWord  Tokens per word (preset or custom).
 * @param {number} input.marginPercent  Safety margin percentage for the budget figure.
 * @returns {object} { tokens, budgetTokens, chars, tokensPer1000Words } or { error }.
 */
export function estimateTokensFromWords({ words, tokensPerWord, marginPercent }) {
  const w = Number(words);
  const tpw = Number(tokensPerWord);
  const margin = Number(marginPercent);

  if (!Number.isFinite(w)) return { error: "Enter the word count as a number." };
  if (w <= 0) return { error: "The word count must be greater than zero." };
  if (w > MAX_WORDS) return { error: "That word count is unrealistically large — check the number." };
  if (!Number.isFinite(tpw) || tpw < MIN_TOKENS_PER_WORD || tpw > MAX_TOKENS_PER_WORD) {
    return {
      error: `Tokens per word must be between ${MIN_TOKENS_PER_WORD} and ${MAX_TOKENS_PER_WORD}.`,
    };
  }
  if (!Number.isFinite(margin) || margin < 0 || margin > MAX_MARGIN_PERCENT) {
    return { error: `The safety margin must be between 0 and ${MAX_MARGIN_PERCENT} percent.` };
  }

  const tokens = Math.ceil(w * tpw);
  const budgetTokens = Math.ceil(tokens * (1 + margin / 100));

  return {
    words: w,
    tokensPerWord: tpw,
    tokens,
    marginPercent: margin,
    budgetTokens,
    chars: tokens * CHARS_PER_TOKEN,
    tokensPer1000Words: tpw * 1000,
  };
}
