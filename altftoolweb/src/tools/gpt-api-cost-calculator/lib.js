/**
 * OpenAI GPT API cost estimation.
 *
 * Billing model (OpenAI API pricing page, platform.openai.com/pricing):
 *  - Usage is billed per token, quoted in USD per 1 million tokens, with separate
 *    input and output rates per model.
 *  - Cached input: input tokens served from OpenAI's automatic prompt cache bill at
 *    a discounted "cached input" rate (typically 10–50% of the input rate,
 *    model-dependent).
 *  - Batch API: asynchronous batch requests bill at 50% of the standard rates.
 *
 * The preset rates below are OpenAI's published prices as of early 2026. OpenAI
 * changes prices with model releases — every preset is editable in the UI, and the
 * SEO copy tells users to verify against the live pricing page.
 *
 * All maths here is pure arithmetic on the supplied rates.
 */

export const TOKENS_PER_MILLION = 1_000_000;

/** OpenAI Batch API discount — 50% of standard price (OpenAI Batch API docs). */
export const BATCH_DISCOUNT = 0.5;

/** Simple 30-day month convention used for monthly projections. */
export const DAYS_PER_MONTH = 30;

/**
 * Preset rates, USD per 1M tokens: { input, cachedInput, output }.
 * Source: OpenAI pricing page (verify before invoicing anyone).
 */
export const GPT_MODELS = [
  { id: "gpt-5.1", label: "GPT-5.1", input: 1.25, cachedInput: 0.125, output: 10.0 },
  { id: "gpt-5", label: "GPT-5", input: 1.25, cachedInput: 0.125, output: 10.0 },
  { id: "gpt-5-mini", label: "GPT-5 mini", input: 0.25, cachedInput: 0.025, output: 2.0 },
  { id: "gpt-5-nano", label: "GPT-5 nano", input: 0.05, cachedInput: 0.005, output: 0.4 },
  { id: "gpt-4.1", label: "GPT-4.1", input: 2.0, cachedInput: 0.5, output: 8.0 },
  { id: "gpt-4.1-mini", label: "GPT-4.1 mini", input: 0.4, cachedInput: 0.1, output: 1.6 },
  { id: "gpt-4o", label: "GPT-4o", input: 2.5, cachedInput: 1.25, output: 10.0 },
  { id: "gpt-4o-mini", label: "GPT-4o mini", input: 0.15, cachedInput: 0.075, output: 0.6 },
  { id: "o3", label: "o3", input: 2.0, cachedInput: 0.5, output: 8.0 },
  { id: "o4-mini", label: "o4-mini", input: 1.1, cachedInput: 0.275, output: 4.4 },
  { id: "custom", label: "Custom rates…", input: 1.0, cachedInput: 0.1, output: 4.0 },
];

/**
 * Estimate GPT API spend.
 *
 * @param {object} input
 * @param {number} input.requestsPerDay        Requests per day.
 * @param {number} input.inputTokens           Average input (prompt) tokens per request.
 * @param {number} input.outputTokens          Average output (completion) tokens per request.
 * @param {number} input.inputRate             USD per 1M input tokens.
 * @param {number} input.cachedInputRate       USD per 1M cached input tokens.
 * @param {number} input.outputRate            USD per 1M output tokens.
 * @param {number} [input.cachedShare]         Fraction of input tokens served from cache, 0–1.
 * @param {boolean} [input.useBatch]           Apply the 50% Batch API discount.
 * @returns {object} costs, or { error }.
 */
export function computeGptCost({
  requestsPerDay,
  inputTokens,
  outputTokens,
  inputRate,
  cachedInputRate,
  outputRate,
  cachedShare = 0,
  useBatch = false,
}) {
  const reqs = Number(requestsPerDay);
  const inTok = Number(inputTokens);
  const outTok = Number(outputTokens);
  const rIn = Number(inputRate);
  const rCached = Number(cachedInputRate);
  const rOut = Number(outputRate);
  const cached = Number(cachedShare);

  if (!Number.isFinite(reqs) || reqs < 0) return { error: "Requests per day must be zero or more." };
  if (!Number.isFinite(inTok) || inTok < 0) return { error: "Average input tokens must be zero or more." };
  if (!Number.isFinite(outTok) || outTok < 0) return { error: "Average output tokens must be zero or more." };
  if (!Number.isFinite(rIn) || rIn < 0) return { error: "The input rate must be zero or more (USD per 1M tokens)." };
  if (!Number.isFinite(rCached) || rCached < 0) return { error: "The cached-input rate must be zero or more." };
  if (!Number.isFinite(rOut) || rOut < 0) return { error: "The output rate must be zero or more." };
  if (!Number.isFinite(cached) || cached < 0 || cached > 100) {
    return { error: "Cached-input share must be between 0 and 100 percent." };
  }
  // The UI field is labeled "Cached input share (%)" and always sends a
  // 0-100 percentage (validated above), so always convert from percent.
  const cachedFraction = cached / 100;

  const discount = useBatch ? BATCH_DISCOUNT : 1;

  // Cost of one request, USD.
  const freshInputCost = (inTok * (1 - cachedFraction) * rIn) / TOKENS_PER_MILLION;
  const cachedInputCost = (inTok * cachedFraction * rCached) / TOKENS_PER_MILLION;
  const outputCost = (outTok * rOut) / TOKENS_PER_MILLION;
  const costPerRequest = (freshInputCost + cachedInputCost + outputCost) * discount;

  const dailyCost = costPerRequest * reqs;
  const monthlyCost = dailyCost * DAYS_PER_MONTH;
  const monthlyRequests = reqs * DAYS_PER_MONTH;
  const monthlyTokens = (inTok + outTok) * monthlyRequests;

  const inputShareOfCost =
    costPerRequest > 0 ? ((freshInputCost + cachedInputCost) * discount) / costPerRequest : 0;

  return {
    costPerRequest,
    costPer1kRequests: costPerRequest * 1000,
    dailyCost,
    monthlyCost,
    yearlyCost: dailyCost * 365,
    monthlyRequests,
    monthlyTokens,
    inputShareOfCost,
    outputShareOfCost: costPerRequest > 0 ? 1 - inputShareOfCost : 0,
    cachedFraction,
    batchApplied: useBatch,
    cacheSavingsPerMonth:
      ((inTok * cachedFraction * (rIn - rCached)) / TOKENS_PER_MILLION) * discount * monthlyRequests,
  };
}
