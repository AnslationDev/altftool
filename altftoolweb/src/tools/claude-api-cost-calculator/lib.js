/**
 * Anthropic Claude API cost estimation.
 *
 * Billing model (Anthropic pricing docs, platform.claude.com/docs/en/pricing):
 *  - Per-token billing quoted in USD per 1 million tokens, separate input and
 *    output rates per model.
 *  - Prompt caching: cache READS bill at ~0.1x the base input rate; cache WRITES
 *    bill at 1.25x for the default 5-minute TTL and 2x for the 1-hour TTL.
 *  - Message Batches API: 50% of standard prices.
 *
 * Preset rates below are Anthropic's published first-party API prices (mid-2026):
 * Opus-tier $5/$25, Sonnet-tier $3/$15 (Claude Sonnet 5 is on an introductory
 * $2/$10 rate through 2026-08-31, then reverts to $3/$15), Haiku 4.5 $1/$5.
 * Prices change with model releases, so every preset is editable in the UI —
 * keep the claude-sonnet-5 preset and the seo.js FAQ pricing answer in sync
 * with this comment when the intro period ends.
 *
 * Pure arithmetic on the supplied rates.
 */

export const TOKENS_PER_MILLION = 1_000_000;

/** Cache reads cost ~0.1x the base input price (Anthropic prompt-caching docs). */
export const CACHE_READ_MULTIPLIER = 0.1;

/** Cache write premium: 1.25x input for the 5-minute TTL, 2x for the 1-hour TTL. */
export const CACHE_WRITE_MULTIPLIERS = { "5m": 1.25, "1h": 2 };

/** Message Batches API bills at 50% of standard prices. */
export const BATCH_DISCOUNT = 0.5;

/** Simple 30-day month convention used for monthly projections. */
export const DAYS_PER_MONTH = 30;

/**
 * Preset rates, USD per 1M tokens: { input, output }.
 * Source: Anthropic pricing page (first-party API; Bedrock/Vertex differ).
 */
export const CLAUDE_MODELS = [
  { id: "claude-opus-5", label: "Claude Opus 5", input: 5.0, output: 25.0 },
  { id: "claude-opus-4-8", label: "Claude Opus 4.8", input: 5.0, output: 25.0 },
  { id: "claude-sonnet-5", label: "Claude Sonnet 5", input: 2.0, output: 10.0 },
  { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6", input: 3.0, output: 15.0 },
  { id: "claude-haiku-4-5", label: "Claude Haiku 4.5", input: 1.0, output: 5.0 },
  { id: "custom", label: "Custom rates…", input: 3.0, output: 15.0 },
];

/**
 * Estimate Claude API spend.
 *
 * Input tokens are split three ways: fresh (billed at 1x input rate),
 * cache reads (0.1x) and cache writes (1.25x or 2x depending on TTL).
 *
 * @param {object} input
 * @param {number} input.requestsPerDay     Requests per day.
 * @param {number} input.inputTokens        Average input tokens per request.
 * @param {number} input.outputTokens       Average output tokens per request.
 * @param {number} input.inputRate          USD per 1M input tokens.
 * @param {number} input.outputRate         USD per 1M output tokens.
 * @param {number} [input.cacheReadShare]   % of input tokens served from cache.
 * @param {number} [input.cacheWriteShare]  % of input tokens written to cache.
 * @param {"5m"|"1h"} [input.cacheTtl]      Cache TTL, sets the write premium.
 * @param {boolean} [input.useBatch]        Apply the 50% batch discount.
 * @returns {object} costs, or { error }.
 */
export function computeClaudeCost({
  requestsPerDay,
  inputTokens,
  outputTokens,
  inputRate,
  outputRate,
  cacheReadShare = 0,
  cacheWriteShare = 0,
  cacheTtl = "5m",
  useBatch = false,
}) {
  const reqs = Number(requestsPerDay);
  const inTok = Number(inputTokens);
  const outTok = Number(outputTokens);
  const rIn = Number(inputRate);
  const rOut = Number(outputRate);
  const readPct = Number(cacheReadShare);
  const writePct = Number(cacheWriteShare);

  if (!Number.isFinite(reqs) || reqs < 0) return { error: "Requests per day must be zero or more." };
  if (!Number.isFinite(inTok) || inTok < 0) return { error: "Average input tokens must be zero or more." };
  if (!Number.isFinite(outTok) || outTok < 0) return { error: "Average output tokens must be zero or more." };
  if (!Number.isFinite(rIn) || rIn < 0) return { error: "The input rate must be zero or more (USD per 1M tokens)." };
  if (!Number.isFinite(rOut) || rOut < 0) return { error: "The output rate must be zero or more." };
  if (!Number.isFinite(readPct) || readPct < 0 || readPct > 100) {
    return { error: "Cache-read share must be between 0 and 100 percent." };
  }
  if (!Number.isFinite(writePct) || writePct < 0 || writePct > 100) {
    return { error: "Cache-write share must be between 0 and 100 percent." };
  }
  if (readPct + writePct > 100) {
    return { error: "Cache-read plus cache-write share cannot exceed 100% of input tokens." };
  }
  const writeMultiplier = CACHE_WRITE_MULTIPLIERS[cacheTtl];
  if (!writeMultiplier) return { error: "Choose a cache TTL of 5 minutes or 1 hour." };

  const readFraction = readPct / 100;
  const writeFraction = writePct / 100;
  const freshFraction = 1 - readFraction - writeFraction;
  const discount = useBatch ? BATCH_DISCOUNT : 1;

  // Per-request input cost, USD.
  const freshCost = (inTok * freshFraction * rIn) / TOKENS_PER_MILLION;
  const readCost = (inTok * readFraction * rIn * CACHE_READ_MULTIPLIER) / TOKENS_PER_MILLION;
  const writeCost = (inTok * writeFraction * rIn * writeMultiplier) / TOKENS_PER_MILLION;
  const outputCost = (outTok * rOut) / TOKENS_PER_MILLION;

  const costPerRequest = (freshCost + readCost + writeCost + outputCost) * discount;
  const uncachedPerRequest = ((inTok * rIn) / TOKENS_PER_MILLION + outputCost) * discount;

  const dailyCost = costPerRequest * reqs;
  const monthlyRequests = reqs * DAYS_PER_MONTH;
  const monthlyCost = dailyCost * DAYS_PER_MONTH;

  const inputCostPerRequest = (freshCost + readCost + writeCost) * discount;

  return {
    costPerRequest,
    costPer1kRequests: costPerRequest * 1000,
    dailyCost,
    monthlyCost,
    yearlyCost: dailyCost * 365,
    monthlyRequests,
    monthlyTokens: (inTok + outTok) * monthlyRequests,
    inputShareOfCost: costPerRequest > 0 ? inputCostPerRequest / costPerRequest : 0,
    outputShareOfCost:
      costPerRequest > 0 ? (outputCost * discount) / costPerRequest : 0,
    cacheSavingsPerMonth: (uncachedPerRequest - costPerRequest) * monthlyRequests,
    writeMultiplier,
    batchApplied: useBatch,
  };
}
