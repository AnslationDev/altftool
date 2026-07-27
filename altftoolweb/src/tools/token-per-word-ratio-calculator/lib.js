/**
 * Tokens-per-word ratio for LLM budgeting.
 *
 * Heuristic source: OpenAI's tokenizer documentation ("What are tokens and how
 * to count them") states that for common English text 1 token ≈ 4 characters
 * ≈ ¾ of a word — i.e. roughly 1.33 tokens per word. Real BPE tokenizers
 * (tiktoken cl100k/o200k, Anthropic's tokenizer) vary by content: code,
 * rare words and non-English scripts tokenize heavier. This tool estimates
 * from characters when no real count is supplied, and computes the exact
 * ratio when the user pastes a token count from a provider's tokenizer.
 */

/** OpenAI rule of thumb: 1 token ≈ 4 characters of common English text. */
export const CHARS_PER_TOKEN_ENGLISH = 4;

/** OpenAI rule of thumb: 1 token ≈ ¾ of an English word → ~1.33 tokens/word. */
export const BASELINE_TOKENS_PER_WORD = 4 / 3;

/**
 * Interpretation bands for the ratio, relative to plain-English behaviour of
 * modern BPE tokenizers. Boundaries are conventional descriptions, not standards.
 */
export const RATIO_BANDS = [
  { max: 1.2, label: "Compact", note: "Simple, common English vocabulary — tokenizes efficiently." },
  { max: 1.5, label: "Typical English", note: "In line with the ~1.33 tokens/word rule of thumb." },
  { max: 2.0, label: "Expanded", note: "Technical terms, markup or unusual vocabulary inflate the token count." },
  { max: Infinity, label: "Heavy", note: "Typical of source code, dense punctuation or non-Latin scripts." },
];

/** Classify a tokens-per-word ratio into a plain-language band. */
export function bandForRatio(ratio) {
  const n = Number(ratio);
  if (!Number.isFinite(n) || n <= 0) return RATIO_BANDS[1];
  return RATIO_BANDS.find((b) => n <= b.max) ?? RATIO_BANDS[RATIO_BANDS.length - 1];
}

/** Count words the way word processors do: runs of non-whitespace. */
export function countWords(text) {
  if (typeof text !== "string") return 0;
  const trimmed = text.trim();
  if (trimmed === "") return 0;
  return trimmed.split(/\s+/).length;
}

/** Estimate tokens from character count using the 4-chars-per-token heuristic. */
export function estimateTokensFromChars(charCount) {
  const n = Number(charCount);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.ceil(n / CHARS_PER_TOKEN_ENGLISH);
}

/**
 * Compute the tokens-per-word ratio for a text sample.
 *
 * @param {object} input
 * @param {string} input.text            The sample text.
 * @param {number|null} [input.actualTokens]  Real token count from a provider tokenizer, if known.
 * @returns {object} { words, chars, tokens, tokensEstimated, ratio, band,
 *                     tokensPer1000Words, charsPerToken, vsBaselinePercent } or { error }.
 */
export function computeTokenWordRatio({ text, actualTokens = null }) {
  if (typeof text !== "string" || text.trim() === "") {
    return { error: "Paste a text sample to analyse." };
  }

  const words = countWords(text);
  const chars = text.length;

  let tokens;
  let tokensEstimated;
  if (actualTokens === null || actualTokens === undefined || actualTokens === "") {
    tokens = estimateTokensFromChars(chars);
    tokensEstimated = true;
  } else {
    const n = Number(actualTokens);
    if (!Number.isFinite(n) || n <= 0 || !Number.isInteger(n)) {
      return { error: "The actual token count must be a positive whole number." };
    }
    tokens = n;
    tokensEstimated = false;
  }

  if (words === 0) {
    return { error: "The sample contains no words — paste at least one word." };
  }
  if (tokens === 0) {
    return { error: "Token count came out as zero — paste a longer sample." };
  }

  const ratio = tokens / words;
  const band = bandForRatio(ratio);

  return {
    words,
    chars,
    tokens,
    tokensEstimated,
    ratio,
    band: band.label,
    bandNote: band.note,
    tokensPer1000Words: ratio * 1000,
    charsPerToken: chars / tokens,
    // Positive = heavier than the ~1.33 tokens/word English baseline.
    vsBaselinePercent: ((ratio - BASELINE_TOKENS_PER_WORD) / BASELINE_TOKENS_PER_WORD) * 100,
  };
}
