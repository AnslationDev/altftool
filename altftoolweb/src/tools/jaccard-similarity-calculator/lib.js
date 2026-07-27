/**
 * Jaccard Similarity Calculator
 *
 * Set-overlap measures between the token sets of two texts. All four are
 * standard published coefficients:
 *
 *   Jaccard index (Jaccard, 1901)         J = |A n B| / |A u B|
 *   Jaccard distance                       = 1 - J
 *   Dice-Sorensen coefficient (1945/1948)  = 2|A n B| / (|A| + |B|)
 *   Overlap coefficient (Szymkiewicz-Simpson) = |A n B| / min(|A|, |B|)
 *   Otsuka-Ochiai cosine on sets           = |A n B| / sqrt(|A| . |B|)
 *
 * Dice and Jaccard are monotonic transforms of each other:
 * Dice = 2J / (1 + J), which is a useful cross-check on any implementation.
 *
 * These operate on SETS, so a repeated token counts once. That is the
 * definition, not a simplification, and it is why the token counts shown are
 * unique-token counts.
 */

/** Longest character n-gram (shingle) this tool will build. */
export const MAX_NGRAM = 12;

/** How many sample tokens each result list carries back to the UI. */
export const SAMPLE_LIMIT = 60;

/** Guard against pathological input sizes in the browser. */
export const MAX_INPUT_CHARS = 200000;

export const TOKEN_MODES = [
  {
    id: "word",
    label: "Words",
    hint: "Split on whitespace. The usual choice for comparing sentences or documents.",
  },
  {
    id: "character",
    label: "Characters",
    hint: "Every distinct character becomes a token. Useful for short strings and codes.",
  },
  {
    id: "ngram",
    label: "Character n-grams (shingles)",
    hint: "Sliding windows of n characters. The standard way to catch near-duplicate text.",
  },
  {
    id: "line",
    label: "Lines",
    hint: "One token per non-empty line. Good for comparing lists, configs or CSV columns.",
  },
];

/** Unicode-aware punctuation and symbol stripping, keeping letters and digits. */
const PUNCTUATION_PATTERN = /[^\p{L}\p{N}\s]/gu;

/**
 * Turn a string into an array of tokens.
 *
 * @param {string} text
 * @param {object} options
 * @param {string} options.mode a TOKEN_MODES id
 * @param {number} options.ngramSize window size when mode is "ngram"
 * @param {boolean} options.caseSensitive
 * @param {boolean} options.stripPunctuation
 * @returns {string[]}
 */
export function tokenize(text, { mode = "word", ngramSize = 3, caseSensitive = false, stripPunctuation = true } = {}) {
  let working = String(text ?? "");
  if (!caseSensitive) working = working.toLowerCase();
  if (stripPunctuation) working = working.replace(PUNCTUATION_PATTERN, " ");

  if (mode === "line") {
    return working
      .split(/\r\n?|\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  }

  if (mode === "word") {
    return working.split(/\s+/).filter(Boolean);
  }

  if (mode === "character") {
    return Array.from(working.replace(/\s+/g, "")).filter(Boolean);
  }

  // Character n-grams: whitespace is collapsed to a single space first so that
  // formatting differences do not create spurious shingles.
  const flat = working.replace(/\s+/g, " ").trim();
  const chars = Array.from(flat);
  const size = Math.max(1, Math.min(MAX_NGRAM, Math.floor(ngramSize)));
  if (chars.length === 0) return [];
  // A string shorter than the window yields one shingle: the string itself.
  if (chars.length < size) return [flat];

  const grams = [];
  for (let i = 0; i + size <= chars.length; i += 1) {
    grams.push(chars.slice(i, i + size).join(""));
  }
  return grams;
}

/**
 * Compare two texts as token sets.
 *
 * @param {object} input
 * @param {string} input.textA
 * @param {string} input.textB
 * @param {string} input.mode
 * @param {number} input.ngramSize
 * @param {boolean} input.caseSensitive
 * @param {boolean} input.stripPunctuation
 * @returns {object|{error:string}}
 */
export function jaccardSimilarity({
  textA = "",
  textB = "",
  mode = "word",
  ngramSize = 3,
  caseSensitive = false,
  stripPunctuation = true,
} = {}) {
  if (typeof textA !== "string" || typeof textB !== "string") {
    return { error: "Both inputs must be text." };
  }
  if (!TOKEN_MODES.some((item) => item.id === mode)) {
    return { error: "Pick one of the supported tokenisation modes." };
  }
  if (textA.length > MAX_INPUT_CHARS || textB.length > MAX_INPUT_CHARS) {
    return { error: `Each text must be under ${MAX_INPUT_CHARS.toLocaleString("en-IN")} characters.` };
  }

  const size = Number(ngramSize);
  if (mode === "ngram") {
    if (!Number.isInteger(size) || size < 1 || size > MAX_NGRAM) {
      return { error: `The n-gram window must be a whole number from 1 to ${MAX_NGRAM}.` };
    }
  }

  const options = { mode, ngramSize: size, caseSensitive, stripPunctuation };
  const tokensA = tokenize(textA, options);
  const tokensB = tokenize(textB, options);

  const setA = new Set(tokensA);
  const setB = new Set(tokensB);

  if (setA.size === 0 && setB.size === 0) {
    return { error: "Both texts are empty after tokenising, so there is nothing to compare." };
  }

  const shared = [];
  const onlyA = [];
  for (const token of setA) {
    if (setB.has(token)) shared.push(token);
    else onlyA.push(token);
  }
  const onlyB = [];
  for (const token of setB) {
    if (!setA.has(token)) onlyB.push(token);
  }

  const intersectionSize = shared.length;
  const unionSize = setA.size + setB.size - intersectionSize;

  // unionSize is guaranteed above zero because at least one set is non-empty.
  const jaccard = intersectionSize / unionSize;
  const distance = 1 - jaccard;

  const diceDenominator = setA.size + setB.size;
  const dice = diceDenominator > 0 ? (2 * intersectionSize) / diceDenominator : null;

  const minSize = Math.min(setA.size, setB.size);
  const overlap = minSize > 0 ? intersectionSize / minSize : null;

  const cosineDenominator = Math.sqrt(setA.size * setB.size);
  const cosine = cosineDenominator > 0 ? intersectionSize / cosineDenominator : null;

  const warnings = [];
  if (setA.size === 0 || setB.size === 0) {
    warnings.push(
      "One text produced no tokens, so the overlap is zero and the overlap and cosine coefficients are undefined.",
    );
  }
  if (tokensA.length !== setA.size || tokensB.length !== setB.size) {
    warnings.push(
      "These coefficients compare sets, so repeated tokens were counted once. Unique token counts are shown above.",
    );
  }

  const bySize = (a, b) => b.length - a.length || a.localeCompare(b);

  return {
    jaccard,
    distance,
    dice,
    overlap,
    cosine,
    intersectionSize,
    unionSize,
    uniqueA: setA.size,
    uniqueB: setB.size,
    totalA: tokensA.length,
    totalB: tokensB.length,
    shared: shared.sort(bySize).slice(0, SAMPLE_LIMIT),
    onlyA: onlyA.sort(bySize).slice(0, SAMPLE_LIMIT),
    onlyB: onlyB.sort(bySize).slice(0, SAMPLE_LIMIT),
    truncated:
      shared.length > SAMPLE_LIMIT || onlyA.length > SAMPLE_LIMIT || onlyB.length > SAMPLE_LIMIT,
    mode,
    warnings,
  };
}
