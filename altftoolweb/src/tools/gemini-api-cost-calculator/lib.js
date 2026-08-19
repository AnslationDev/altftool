/**
 * Gemini API cost calculator — pure logic.
 *
 * Google bills the Gemini API per million tokens, separately for prompt
 * (input) tokens and generated (output) tokens:
 *
 *   cost = (inputTokens / 1e6) * inputRate + (outputTokens / 1e6) * outputRate
 *
 * Three billing rules make a naive multiplication wrong, and all three are
 * modelled here:
 *
 *   1. LONG-CONTEXT TIER. On Gemini 2.5 Pro the published price steps up once
 *      a single prompt exceeds 200,000 tokens. The higher rate applies to the
 *      WHOLE request, not just the tokens above the threshold, and it raises
 *      the output rate too.
 *   2. CONTEXT CACHING. Tokens served from an explicit context cache are
 *      billed at a fraction of the normal input rate (Google publishes the
 *      cached rate at one quarter of the standard input rate), plus a separate
 *      storage charge per million tokens per hour that the cache is alive.
 *   3. NON-TEXT INPUT IS STILL TOKENS. Images and audio are converted to
 *      tokens before billing, so they land on the input rate.
 *
 * PRICES ARE DEFAULTS, NOT CONSTANTS OF NATURE. Every rate below is exposed as
 * an editable input in the UI because vendor list prices change; the maths is
 * what this module guarantees.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** Vendor pricing is quoted per 1,000,000 tokens. */
export const TOKENS_PER_PRICE_UNIT = 1_000_000;

/**
 * Gemini tokenises an image whose longest side is 384px or less as a single
 * 258-token tile; larger images are cropped into 768x768 tiles that each cost
 * the same 258 tokens. Source: Google Gemini API "token counting" docs.
 */
export const IMAGE_TOKENS_PER_TILE = 258;

/**
 * Gemini bills audio at a flat 32 tokens per second of source audio.
 * Source: Google Gemini API multimodal token accounting.
 */
export const AUDIO_TOKENS_PER_SECOND = 32;

/** Google's published context-cache discount: cached input costs 25% of standard input. */
export const CACHE_DISCOUNT_FACTOR = 0.25;

/** Sanity ceiling so a mistyped token count cannot produce a nonsense bill. */
export const MAX_TOKENS_PER_REQUEST = 20_000_000;
/** Sanity ceiling on monthly request volume. */
export const MAX_REQUESTS_PER_MONTH = 1_000_000_000;

/**
 * Published Google AI paid-tier list prices in USD per 1M tokens.
 * `longContextThreshold` is the prompt size (in tokens) above which the higher
 * tier applies; null means the model has a single flat tier.
 * Treat these as starting points and confirm against Google's pricing page.
 */
/**
 * Base published rates. `cachedInputPerMTok`/`longCachedInputPerMTok` are
 * intentionally omitted here and derived below from `inputPerMTok` /
 * `longInputPerMTok` via CACHE_DISCOUNT_FACTOR, so the constant stays
 * load-bearing instead of being duplicated by hand.
 */
const GEMINI_MODEL_BASE_RATES = [
  {
    id: "gemini-2.5-pro",
    label: "Gemini 2.5 Pro",
    longContextThreshold: 200_000,
    inputPerMTok: 1.25,
    longInputPerMTok: 2.5,
    outputPerMTok: 10,
    longOutputPerMTok: 15,
    audioInputPerMTok: 1.25,
    cacheStoragePerMTokHour: 4.5,
  },
  {
    id: "gemini-2.5-flash",
    label: "Gemini 2.5 Flash",
    longContextThreshold: null,
    inputPerMTok: 0.3,
    longInputPerMTok: 0.3,
    outputPerMTok: 2.5,
    longOutputPerMTok: 2.5,
    audioInputPerMTok: 1,
    cacheStoragePerMTokHour: 1,
  },
  {
    id: "gemini-2.5-flash-lite",
    label: "Gemini 2.5 Flash-Lite",
    longContextThreshold: null,
    inputPerMTok: 0.1,
    longInputPerMTok: 0.1,
    outputPerMTok: 0.4,
    longOutputPerMTok: 0.4,
    audioInputPerMTok: 0.3,
    cacheStoragePerMTokHour: 1,
  },
  {
    id: "gemini-2.0-flash",
    label: "Gemini 2.0 Flash",
    longContextThreshold: null,
    inputPerMTok: 0.1,
    longInputPerMTok: 0.1,
    outputPerMTok: 0.4,
    longOutputPerMTok: 0.4,
    audioInputPerMTok: 0.7,
    cacheStoragePerMTokHour: 1,
  },
  {
    id: "gemini-2.0-flash-lite",
    label: "Gemini 2.0 Flash-Lite",
    longContextThreshold: null,
    inputPerMTok: 0.075,
    longInputPerMTok: 0.075,
    outputPerMTok: 0.3,
    longOutputPerMTok: 0.3,
    audioInputPerMTok: 0.075,
    cacheStoragePerMTokHour: 1,
  },
];

export const GEMINI_MODELS = GEMINI_MODEL_BASE_RATES.map((model) => ({
  ...model,
  cachedInputPerMTok: model.inputPerMTok * CACHE_DISCOUNT_FACTOR,
  longCachedInputPerMTok: model.longInputPerMTok * CACHE_DISCOUNT_FACTOR,
}));

export function getGeminiModel(id) {
  return GEMINI_MODELS.find((model) => model.id === id) || GEMINI_MODELS[0];
}

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Convert an image count into billed prompt tokens. */
export function imageTokens(images, tilesPerImage) {
  if (!isNum(images) || !isNum(tilesPerImage)) return 0;
  if (images <= 0 || tilesPerImage <= 0) return 0;
  return images * tilesPerImage * IMAGE_TOKENS_PER_TILE;
}

/** Convert seconds of audio into billed prompt tokens. */
export function audioTokens(seconds) {
  if (!isNum(seconds) || seconds <= 0) return 0;
  return seconds * AUDIO_TOKENS_PER_SECOND;
}

/**
 * Cost of one Gemini request plus the monthly projection.
 *
 * @param {object} args
 * @param {object} args.pricing     Rates per 1M tokens (see GEMINI_MODELS shape).
 * @param {number} args.textTokens  Uncached text prompt tokens per request.
 * @param {number} args.cachedTokens Prompt tokens served from an explicit cache.
 * @param {number} args.images      Images per request.
 * @param {number} args.tilesPerImage 768px tiles per image (1 for a small image).
 * @param {number} args.audioSeconds Seconds of audio per request.
 * @param {number} args.outputTokens Generated tokens per request.
 * @param {number} args.requestsPerMonth Requests billed in a month.
 * @param {number} args.cacheStorageHours Hours the context cache is kept alive per month.
 * @returns {object} cost breakdown, or { error }
 */
export function computeGeminiCost({
  pricing,
  textTokens = 0,
  cachedTokens = 0,
  images = 0,
  tilesPerImage = 1,
  audioSeconds = 0,
  outputTokens = 0,
  requestsPerMonth = 0,
  cacheStorageHours = 0,
} = {}) {
  if (!pricing || typeof pricing !== "object") {
    return { error: "Choose a model or enter your own per-million-token rates." };
  }

  const numbers = [
    textTokens,
    cachedTokens,
    images,
    tilesPerImage,
    audioSeconds,
    outputTokens,
    requestsPerMonth,
    cacheStorageHours,
  ];
  if (numbers.some((value) => !isNum(value))) {
    return { error: "Every field must be a number." };
  }
  if (numbers.some((value) => value < 0)) {
    return { error: "Token counts, volumes and rates cannot be negative." };
  }

  const rateKeys = [
    "inputPerMTok",
    "longInputPerMTok",
    "outputPerMTok",
    "longOutputPerMTok",
    "cachedInputPerMTok",
    "longCachedInputPerMTok",
    "audioInputPerMTok",
    "cacheStoragePerMTokHour",
  ];
  if (rateKeys.some((key) => !isNum(pricing[key]) || pricing[key] < 0)) {
    return { error: "Per-million-token rates must be zero or a positive number." };
  }

  if (images > 0 && tilesPerImage <= 0) {
    return { error: "Tiles per image must be at least 1 when images are counted." };
  }

  const imgTokens = imageTokens(images, tilesPerImage);
  const audTokens = audioTokens(audioSeconds);
  const promptTokens = textTokens + cachedTokens + imgTokens + audTokens;

  if (promptTokens > MAX_TOKENS_PER_REQUEST) {
    return { error: "That prompt is larger than any Gemini context window — check the token counts." };
  }
  if (outputTokens > MAX_TOKENS_PER_REQUEST) {
    return { error: "Output tokens per request look unrealistically large." };
  }
  if (requestsPerMonth > MAX_REQUESTS_PER_MONTH) {
    return { error: "Enter a monthly request volume below 1 billion." };
  }
  if (promptTokens === 0 && outputTokens === 0) {
    return { error: "Enter at least some input or output tokens to price a request." };
  }

  const threshold = isNum(pricing.longContextThreshold) ? pricing.longContextThreshold : null;
  // The long-context price applies to the whole request once the prompt crosses
  // the threshold — it is a tier switch, not a marginal rate.
  const isLongContext = threshold !== null && threshold > 0 && promptTokens > threshold;

  const inputRate = isLongContext ? pricing.longInputPerMTok : pricing.inputPerMTok;
  const outputRate = isLongContext ? pricing.longOutputPerMTok : pricing.outputPerMTok;
  const cachedRate = isLongContext ? pricing.longCachedInputPerMTok : pricing.cachedInputPerMTok;
  const audioRate = pricing.audioInputPerMTok;

  const per = (tokens, rate) => (tokens / TOKENS_PER_PRICE_UNIT) * rate;

  const textCost = per(textTokens, inputRate);
  const imageCost = per(imgTokens, inputRate);
  const audioCost = per(audTokens, audioRate);
  const cachedCost = per(cachedTokens, cachedRate);
  const outputCost = per(outputTokens, outputRate);

  const costPerRequest = textCost + imageCost + audioCost + cachedCost + outputCost;

  const storageRate = isNum(pricing.cacheStoragePerMTokHour) ? pricing.cacheStoragePerMTokHour : 0;
  const cacheStorageCost =
    (cachedTokens / TOKENS_PER_PRICE_UNIT) * storageRate * cacheStorageHours;

  const usageCostPerMonth = costPerRequest * requestsPerMonth;
  const monthlyCost = usageCostPerMonth + cacheStorageCost;

  // What the same traffic would cost with no cache, for the savings figure.
  const uncachedPerRequest =
    textCost + imageCost + audioCost + per(cachedTokens, inputRate) + outputCost;
  const cacheSavingPerMonth = Math.max(
    0,
    uncachedPerRequest * requestsPerMonth - usageCostPerMonth - cacheStorageCost,
  );

  return {
    promptTokens,
    imageTokens: imgTokens,
    audioTokens: audTokens,
    totalTokensPerRequest: promptTokens + outputTokens,
    isLongContext,
    threshold,
    inputRate,
    outputRate,
    cachedRate,
    textCost,
    imageCost,
    audioCost,
    cachedCost,
    outputCost,
    costPerRequest,
    costPer1kRequests: costPerRequest * 1000,
    usageCostPerMonth,
    cacheStorageCost,
    monthlyCost,
    annualCost: monthlyCost * 12,
    cacheSavingPerMonth,
    outputShare: costPerRequest > 0 ? (outputCost / costPerRequest) * 100 : 0,
  };
}
