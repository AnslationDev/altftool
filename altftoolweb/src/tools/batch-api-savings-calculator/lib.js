/**
 * Batch API savings calculator — pure logic.
 *
 * Every major LLM vendor sells the same tokens twice: at a synchronous rate for
 * requests you need answered now, and at a discounted asynchronous rate for
 * jobs you are willing to have completed within a service window. The batch
 * discount applies to BOTH the input and the output rate, so the saving is a
 * flat percentage of the whole job:
 *
 *   costPerRequest = (inputTokens * inputRate + outputTokens * outputRate) / 1e6
 *   batchCost      = costPerRequest * (1 - discount)
 *
 * When only part of a workload can wait, the bill is a blend:
 *
 *   blended = realtimeRequests * costPerRequest + batchedRequests * batchCost
 *
 * Worked check: 1,000,000 requests of 1,500 input and 300 output tokens at
 * $3/$15 per million costs $0.009 each, so $9,000 synchronous. At a 50%
 * discount with 80% of the volume batched the bill is
 * 200,000 x 0.009 + 800,000 x 0.0045 = $1,800 + $3,600 = $5,400 — a 40% saving,
 * against a 50% saving if everything could be batched.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** Token prices are quoted per 1,000,000 tokens. */
export const TOKENS_PER_PRICE_UNIT = 1_000_000;

/**
 * The published batch discount is 50% off both input and output tokens on the
 * OpenAI Batch API, the Anthropic Message Batches API and Gemini batch mode.
 */
export const DEFAULT_BATCH_DISCOUNT_PERCENT = 50;

/** All three vendors quote a 24-hour completion window for batch jobs. */
export const BATCH_WINDOW_HOURS = 24;

/** Sanity ceilings. */
export const MAX_REQUESTS = 1_000_000_000;
export const MAX_TOKENS_PER_REQUEST = 20_000_000;

/** Workloads that are usually safe to batch, offered as one-tap examples. */
export const BATCH_WORKLOADS = [
  { id: "classify", label: "Bulk classification", inputTokens: 600, outputTokens: 10, batchablePercent: 100 },
  { id: "summarise", label: "Document summarisation", inputTokens: 6000, outputTokens: 400, batchablePercent: 100 },
  { id: "enrich", label: "Catalogue enrichment", inputTokens: 1500, outputTokens: 300, batchablePercent: 80 },
  { id: "evals", label: "Nightly eval suite", inputTokens: 2500, outputTokens: 600, batchablePercent: 100 },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Compare synchronous and batch pricing for a bulk job.
 *
 * @returns {object} cost comparison, or { error }
 */
export function computeBatchSavings({
  requests = 0,
  inputTokens = 0,
  outputTokens = 0,
  inputPerMTok = 0,
  outputPerMTok = 0,
  discountPercent = DEFAULT_BATCH_DISCOUNT_PERCENT,
  batchablePercent = 100,
  jobsPerMonth = 1,
} = {}) {
  const values = [
    requests,
    inputTokens,
    outputTokens,
    inputPerMTok,
    outputPerMTok,
    discountPercent,
    batchablePercent,
    jobsPerMonth,
  ];
  if (values.some((value) => !isNum(value))) return { error: "Every field must be a number." };
  if (values.some((value) => value < 0)) {
    return { error: "Request counts, token counts and rates cannot be negative." };
  }
  if (requests > MAX_REQUESTS) return { error: "Enter a request count below 1 billion." };
  if (inputTokens > MAX_TOKENS_PER_REQUEST || outputTokens > MAX_TOKENS_PER_REQUEST) {
    return { error: "Token counts per request look unrealistically large." };
  }
  if (discountPercent > 100) return { error: "A batch discount cannot exceed 100%." };
  if (batchablePercent > 100) return { error: "The batchable share cannot exceed 100%." };
  if (requests === 0) return { error: "Enter how many requests are in the job." };
  if (inputTokens + outputTokens === 0) {
    return { error: "Enter the input and output token size of a typical request." };
  }

  const inputCost = (inputTokens / TOKENS_PER_PRICE_UNIT) * inputPerMTok;
  const outputCost = (outputTokens / TOKENS_PER_PRICE_UNIT) * outputPerMTok;
  const realtimeCostPerRequest = inputCost + outputCost;

  const discount = discountPercent / 100;
  const batchCostPerRequest = realtimeCostPerRequest * (1 - discount);

  const batchedRequests = requests * (batchablePercent / 100);
  const realtimeRequests = requests - batchedRequests;

  const allRealtimeCost = realtimeCostPerRequest * requests;
  const allBatchCost = batchCostPerRequest * requests;
  const blendedCost = realtimeRequests * realtimeCostPerRequest + batchedRequests * batchCostPerRequest;

  const savings = allRealtimeCost - blendedCost;
  const maxSavings = allRealtimeCost - allBatchCost;
  const savingsPercent = allRealtimeCost > 0 ? (savings / allRealtimeCost) * 100 : 0;

  const totalTokens = (inputTokens + outputTokens) * requests;

  return {
    realtimeCostPerRequest,
    batchCostPerRequest,
    effectiveInputRate: inputPerMTok * (1 - discount),
    effectiveOutputRate: outputPerMTok * (1 - discount),
    batchedRequests,
    realtimeRequests,
    allRealtimeCost,
    allBatchCost,
    blendedCost,
    savings,
    maxSavings,
    savingsPercent,
    monthlySavings: savings * jobsPerMonth,
    monthlyBlendedCost: blendedCost * jobsPerMonth,
    monthlyRealtimeCost: allRealtimeCost * jobsPerMonth,
    annualSavings: savings * jobsPerMonth * 12,
    totalTokens,
    savingsPer1kRequests: (savings / requests) * 1000,
    windowHours: BATCH_WINDOW_HOURS,
  };
}
