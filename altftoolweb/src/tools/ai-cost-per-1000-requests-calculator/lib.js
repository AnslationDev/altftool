/**
 * Cost per 1,000 LLM requests — pure logic.
 *
 * Vendors quote dollars per million tokens; engineers reason in requests. The
 * bridge is one line:
 *
 *   costPerRequest = (inputTokens * inputRate + outputTokens * outputRate) / 1e6
 *   costPer1000    = costPerRequest * 1000
 *
 * Two adjustments keep the figure honest in production:
 *
 *   PROMPT CACHING. A share of the input tokens is served from cache at a
 *   discounted rate, so input cost splits into fresh and cached halves.
 *
 *   RETRIES. Timeouts, rate limits, refusals and schema-validation failures all
 *   cause a request to be sent again, and the failed attempt is still billed.
 *   A 5% retry rate multiplies the whole bill by 1.05.
 *
 * Worked check: 1,200 input and 350 output tokens at $0.15 and $0.60 per
 * million costs 0.00018 + 0.00021 = $0.00039 per request, so $0.39 per 1,000
 * requests and $390 per million.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** Vendor prices are quoted per 1,000,000 tokens. */
export const TOKENS_PER_PRICE_UNIT = 1_000_000;

/** The unit this tool reports in. */
export const REQUEST_BLOCK = 1000;

/** Sanity ceilings. */
export const MAX_TOKENS_PER_REQUEST = 20_000_000;
export const MAX_RETRY_PERCENT = 200;
export const MAX_REQUESTS_PER_MONTH = 10_000_000_000;

/**
 * Representative price points by capability tier, in USD per 1M tokens, used
 * for the side-by-side comparison. These are illustrative bands, not a quote
 * for any specific model — override them with the rates on your own invoice.
 */
export const PRICE_TIERS = [
  { id: "frontier", label: "Frontier", input: 15, output: 75, cached: 1.5 },
  { id: "flagship", label: "Flagship", input: 3, output: 15, cached: 0.3 },
  { id: "mid", label: "Mid", input: 1, output: 5, cached: 0.1 },
  { id: "small", label: "Small / fast", input: 0.15, output: 0.6, cached: 0.015 },
  { id: "nano", label: "Nano", input: 0.05, output: 0.2, cached: 0.005 },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Cost of a single request for one set of rates.
 * Returns a number; callers validate their inputs first.
 */
export function requestCost({
  inputTokens,
  outputTokens,
  inputPerMTok,
  outputPerMTok,
  cachedInputPerMTok,
  cacheHitPercent,
  retryPercent,
}) {
  const hit = cacheHitPercent / 100;
  const per = (tokens, rate) => (tokens / TOKENS_PER_PRICE_UNIT) * rate;
  const freshInput = per(inputTokens * (1 - hit), inputPerMTok);
  const cachedInput = per(inputTokens * hit, cachedInputPerMTok);
  const output = per(outputTokens, outputPerMTok);
  const attemptMultiplier = 1 + retryPercent / 100;
  return {
    freshInput: freshInput * attemptMultiplier,
    cachedInput: cachedInput * attemptMultiplier,
    output: output * attemptMultiplier,
    total: (freshInput + cachedInput + output) * attemptMultiplier,
    attemptMultiplier,
  };
}

/**
 * Full cost-per-1000 breakdown plus a comparison across price tiers.
 *
 * @returns {object} costs, or { error }
 */
export function computeCostPerThousand({
  inputTokens = 0,
  outputTokens = 0,
  inputPerMTok = 0,
  outputPerMTok = 0,
  cachedInputPerMTok = 0,
  cacheHitPercent = 0,
  retryPercent = 0,
  requestsPerMonth = 0,
} = {}) {
  const values = [
    inputTokens,
    outputTokens,
    inputPerMTok,
    outputPerMTok,
    cachedInputPerMTok,
    cacheHitPercent,
    retryPercent,
    requestsPerMonth,
  ];
  if (values.some((value) => !isNum(value))) return { error: "Every field must be a number." };
  if (values.some((value) => value < 0)) {
    return { error: "Token counts, rates and volumes cannot be negative." };
  }
  if (inputTokens > MAX_TOKENS_PER_REQUEST || outputTokens > MAX_TOKENS_PER_REQUEST) {
    return { error: "Token counts per request look unrealistically large." };
  }
  if (cacheHitPercent > 100) return { error: "Cache hit rate cannot exceed 100%." };
  if (retryPercent > MAX_RETRY_PERCENT) {
    return { error: `A retry rate above ${MAX_RETRY_PERCENT}% is not a pricing problem — fix the pipeline first.` };
  }
  if (requestsPerMonth > MAX_REQUESTS_PER_MONTH) {
    return { error: "Enter a monthly request volume below 10 billion." };
  }
  if (inputTokens + outputTokens === 0) {
    return { error: "Enter the input and output token size of a typical request." };
  }

  const profile = {
    inputTokens,
    outputTokens,
    inputPerMTok,
    outputPerMTok,
    cachedInputPerMTok,
    cacheHitPercent,
    retryPercent,
  };

  const cost = requestCost(profile);
  const costPer1000 = cost.total * REQUEST_BLOCK;

  const comparison = PRICE_TIERS.map((tier) => {
    const tierCost = requestCost({
      ...profile,
      inputPerMTok: tier.input,
      outputPerMTok: tier.output,
      cachedInputPerMTok: tier.cached,
    });
    return {
      id: tier.id,
      label: tier.label,
      input: tier.input,
      output: tier.output,
      costPerRequest: tierCost.total,
      costPer1000: tierCost.total * REQUEST_BLOCK,
      monthlyCost: tierCost.total * requestsPerMonth,
    };
  });

  const billedTokensPerRequest = (inputTokens + outputTokens) * cost.attemptMultiplier;

  return {
    costPerRequest: cost.total,
    costPer1000,
    costPer10k: cost.total * 10_000,
    costPer100k: cost.total * 100_000,
    costPerMillion: cost.total * 1_000_000,
    freshInputCost: cost.freshInput,
    cachedInputCost: cost.cachedInput,
    outputCost: cost.output,
    attemptMultiplier: cost.attemptMultiplier,
    billedTokensPerRequest,
    billedTokensPer1000: billedTokensPerRequest * REQUEST_BLOCK,
    monthlyCost: cost.total * requestsPerMonth,
    annualCost: cost.total * requestsPerMonth * 12,
    outputShare: cost.total > 0 ? (cost.output / cost.total) * 100 : 0,
    retryCostPer1000: costPer1000 * (1 - 1 / cost.attemptMultiplier),
    comparison,
  };
}
