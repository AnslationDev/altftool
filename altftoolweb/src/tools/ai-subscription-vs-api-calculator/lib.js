/**
 * Flat AI subscription versus pay-per-token API — pure logic.
 *
 * A seat-based AI plan is a fixed cost; an API bill is linear in usage. The
 * two cross at exactly one point:
 *
 *   costPerMessage   = (inputTokens * inputRate + outputTokens * outputRate) / 1e6
 *   breakEvenMessages = planPricePerSeat / costPerMessage
 *
 * Below that many messages a month the API is cheaper; above it the flat plan
 * is. Expressing the same thing as a percentage is often more useful:
 *
 *   utilisation % = (messages x costPerMessage) / planPrice x 100
 *
 * At 100% you are getting exactly your money's worth from the subscription.
 *
 * Worked check: a $20 seat, 800 input and 400 output tokens per message at
 * $3 and $15 per million costs $0.0084 a message, so the plan pays for itself
 * at 20 / 0.0084 = 2,381 messages a month, about 108 on each of 22 working
 * days. At 300 messages a month you are using 12.6% of the plan's value and
 * the API would cost $2.52.
 *
 * Prompt caching is modelled as a share of input tokens billed at a cheaper
 * cached rate, since that materially moves the break-even point.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** Token prices are quoted per 1,000,000 tokens. */
export const TOKENS_PER_PRICE_UNIT = 1_000_000;

/** Working days in an average month, used to express the break-even per day. */
export const DEFAULT_WORKING_DAYS = 22;

/** Sanity ceilings. */
export const MAX_SEATS = 1_000_000;
export const MAX_MESSAGES_PER_MONTH = 10_000_000;
export const MAX_TOKENS_PER_MESSAGE = 2_000_000;

/** Common consumer/pro plan price points, offered as one-tap examples. */
export const PLAN_PRESETS = [
  { id: "free-tier", label: "$0 free tier", price: 0 },
  { id: "pro-20", label: "$20 pro seat", price: 20 },
  { id: "team-30", label: "$30 team seat", price: 30 },
  { id: "max-100", label: "$100 power seat", price: 100 },
  { id: "max-200", label: "$200 power seat", price: 200 },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Compare a flat per-seat plan against metered API usage.
 *
 * @returns {object} comparison, or { error }
 */
export function comparePlanAndApi({
  planPricePerSeat = 0,
  seats = 1,
  messagesPerMonth = 0,
  inputTokens = 0,
  outputTokens = 0,
  inputPerMTok = 0,
  outputPerMTok = 0,
  cachedInputPerMTok = 0,
  cacheHitPercent = 0,
  workingDaysPerMonth = DEFAULT_WORKING_DAYS,
} = {}) {
  const values = [
    planPricePerSeat,
    seats,
    messagesPerMonth,
    inputTokens,
    outputTokens,
    inputPerMTok,
    outputPerMTok,
    cachedInputPerMTok,
    cacheHitPercent,
    workingDaysPerMonth,
  ];
  if (values.some((value) => !isNum(value))) return { error: "Every field must be a number." };
  if (values.some((value) => value < 0)) {
    return { error: "Prices, seats, token counts and volumes cannot be negative." };
  }
  if (seats < 1) return { error: "Enter at least one seat." };
  if (seats > MAX_SEATS) return { error: "Enter a seat count below 1,000,000." };
  if (messagesPerMonth > MAX_MESSAGES_PER_MONTH) {
    return { error: "Enter fewer than 10 million messages per user per month." };
  }
  if (inputTokens > MAX_TOKENS_PER_MESSAGE || outputTokens > MAX_TOKENS_PER_MESSAGE) {
    return { error: "Token counts per message look unrealistically large." };
  }
  if (cacheHitPercent > 100) return { error: "Cache hit rate cannot exceed 100%." };
  if (inputTokens + outputTokens === 0) {
    return { error: "Enter the input and output token size of a typical message." };
  }

  const hit = cacheHitPercent / 100;
  const freshInputTokens = inputTokens * (1 - hit);
  const cachedTokens = inputTokens * hit;

  const per = (tokens, rate) => (tokens / TOKENS_PER_PRICE_UNIT) * rate;

  const inputCost = per(freshInputTokens, inputPerMTok) + per(cachedTokens, cachedInputPerMTok);
  const outputCost = per(outputTokens, outputPerMTok);
  const costPerMessage = inputCost + outputCost;

  const apiCostPerSeat = costPerMessage * messagesPerMonth;
  const apiCostTotal = apiCostPerSeat * seats;
  const planCostTotal = planPricePerSeat * seats;

  // Division guards: a zero per-message cost or a free plan has no crossover.
  const breakEvenMessages =
    costPerMessage > 0 && planPricePerSeat > 0 ? planPricePerSeat / costPerMessage : null;
  const breakEvenPerDay =
    breakEvenMessages !== null && workingDaysPerMonth > 0
      ? breakEvenMessages / workingDaysPerMonth
      : null;
  const utilisationPercent =
    planPricePerSeat > 0 ? (apiCostPerSeat / planPricePerSeat) * 100 : null;

  const monthlyDifference = planCostTotal - apiCostTotal;
  const cheaper =
    monthlyDifference > 0 ? "api" : monthlyDifference < 0 ? "plan" : "equal";

  // How much headroom is left before the plan becomes the better deal.
  const messagesUntilBreakEven =
    breakEvenMessages !== null ? Math.max(0, breakEvenMessages - messagesPerMonth) : null;

  return {
    costPerMessage,
    inputCostPerMessage: inputCost,
    outputCostPerMessage: outputCost,
    apiCostPerSeat,
    apiCostTotal,
    planCostTotal,
    monthlyDifference,
    annualDifference: monthlyDifference * 12,
    cheaper,
    breakEvenMessages,
    breakEvenPerDay,
    messagesUntilBreakEven,
    utilisationPercent,
    tokensPerMonthPerSeat: (inputTokens + outputTokens) * messagesPerMonth,
    effectivePlanCostPerMessage:
      messagesPerMonth > 0 ? planPricePerSeat / messagesPerMonth : null,
  };
}
