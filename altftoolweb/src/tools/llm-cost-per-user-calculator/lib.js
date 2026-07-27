/**
 * LLM cost per active user — pure logic.
 *
 * The figure people actually need is cost per monthly active user (MAU), which
 * is built bottom-up from four multipliers:
 *
 *   cost/user/month = sessions per user x cost per session
 *   cost per session = (prompt tokens x input rate + output tokens x output rate) / 1e6
 *
 * The part almost every spreadsheet gets wrong is CONVERSATION HISTORY. A chat
 * API is stateless: on every turn the client resends the system prompt and the
 * entire transcript so far. So prompt tokens grow linearly with turn number and
 * the session total grows QUADRATICALLY, not linearly.
 *
 * For a session of n turns where each user message is `u` tokens, each reply is
 * `a` tokens and a system prompt of `s` tokens is always present:
 *
 *   prompt tokens on turn k = s + k*u + (k-1)*a
 *   total prompt tokens      = n*s + u * n(n+1)/2 + a * n(n-1)/2
 *   total output tokens      = n*a
 *
 * Worked check, n = 3, s = 500, u = 100, a = 300:
 *   turn 1 = 600, turn 2 = 1000, turn 3 = 1400  ->  3000
 *   formula = 1500 + 100*6 + 300*3               ->  3000
 *
 * With history trimmed off (each turn sent standalone) the total is simply
 * n*(s + u), which is why the two modes can differ by an order of magnitude on
 * long conversations.
 *
 * Prompt caching is modelled as a share of prompt tokens billed at a discounted
 * cached rate, because providers price cache reads well below fresh input.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** Token prices are quoted per 1,000,000 tokens. */
export const TOKENS_PER_PRICE_UNIT = 1_000_000;

/** Guard rails so a stray keystroke cannot produce a meaningless projection. */
export const MAX_TURNS_PER_SESSION = 500;
export const MAX_ACTIVE_USERS = 1_000_000_000;
export const MAX_TOKENS_PER_MESSAGE = 2_000_000;

/** Typical published list prices, USD per 1M tokens, for the pricing presets. */
export const PRICE_PRESETS = [
  { id: "frontier", label: "Frontier tier (~$3 in / $15 out)", input: 3, output: 15, cached: 0.3 },
  { id: "mid", label: "Mid tier (~$1 in / $5 out)", input: 1, output: 5, cached: 0.1 },
  { id: "small", label: "Small / fast tier (~$0.15 in / $0.60 out)", input: 0.15, output: 0.6, cached: 0.015 },
  { id: "nano", label: "Nano tier (~$0.05 in / $0.20 out)", input: 0.05, output: 0.2, cached: 0.005 },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Prompt and output tokens consumed by one full conversation.
 *
 * @param {number} turns          Assistant replies in the session.
 * @param {number} systemTokens   System prompt resent on every turn.
 * @param {number} userTokens     Tokens in each user message.
 * @param {number} replyTokens    Tokens in each assistant reply.
 * @param {boolean} resendHistory True if the whole transcript is resent each turn.
 */
export function sessionTokens(turns, systemTokens, userTokens, replyTokens, resendHistory) {
  if (!isNum(turns) || turns <= 0) return { promptTokens: 0, outputTokens: 0 };
  const n = turns;
  const promptTokens = resendHistory
    ? n * systemTokens + userTokens * ((n * (n + 1)) / 2) + replyTokens * ((n * (n - 1)) / 2)
    : n * (systemTokens + userTokens);
  return { promptTokens, outputTokens: n * replyTokens };
}

/**
 * Full cost-per-user model.
 *
 * @returns {object} per-session, per-user and fleet costs, or { error }
 */
export function computeCostPerUser({
  activeUsers = 0,
  sessionsPerUser = 0,
  turnsPerSession = 0,
  systemTokens: systemPromptTokens = 0,
  userTokens = 0,
  replyTokens = 0,
  resendHistory = true,
  cacheHitPercent = 0,
  inputPerMTok = 0,
  outputPerMTok = 0,
  cachedInputPerMTok = 0,
  pricePerUser = 0,
} = {}) {
  const values = [
    activeUsers,
    sessionsPerUser,
    turnsPerSession,
    systemPromptTokens,
    userTokens,
    replyTokens,
    cacheHitPercent,
    inputPerMTok,
    outputPerMTok,
    cachedInputPerMTok,
    pricePerUser,
  ];
  if (values.some((value) => !isNum(value))) {
    return { error: "Every field must be a number." };
  }
  if (values.some((value) => value < 0)) {
    return { error: "Volumes, token counts and prices cannot be negative." };
  }
  if (turnsPerSession < 1) {
    return { error: "A session needs at least one message exchange." };
  }
  if (turnsPerSession > MAX_TURNS_PER_SESSION) {
    return { error: `Keep messages per session at or below ${MAX_TURNS_PER_SESSION}.` };
  }
  if (activeUsers > MAX_ACTIVE_USERS) {
    return { error: "Enter an active-user count below 1 billion." };
  }
  if (
    systemPromptTokens > MAX_TOKENS_PER_MESSAGE ||
    userTokens > MAX_TOKENS_PER_MESSAGE ||
    replyTokens > MAX_TOKENS_PER_MESSAGE
  ) {
    return { error: "Token counts per message look unrealistically large." };
  }
  if (cacheHitPercent > 100) {
    return { error: "Cache hit rate cannot exceed 100%." };
  }
  if (systemPromptTokens + userTokens + replyTokens === 0) {
    return { error: "Enter the token size of a typical message to price anything." };
  }

  const { promptTokens, outputTokens } = sessionTokens(
    turnsPerSession,
    systemPromptTokens,
    userTokens,
    replyTokens,
    Boolean(resendHistory),
  );

  const cachedShare = cacheHitPercent / 100;
  const cachedPromptTokens = promptTokens * cachedShare;
  const freshPromptTokens = promptTokens - cachedPromptTokens;

  const per = (tokens, rate) => (tokens / TOKENS_PER_PRICE_UNIT) * rate;

  const freshInputCost = per(freshPromptTokens, inputPerMTok);
  const cachedInputCost = per(cachedPromptTokens, cachedInputPerMTok);
  const outputCost = per(outputTokens, outputPerMTok);
  const costPerSession = freshInputCost + cachedInputCost + outputCost;

  const costPerUser = costPerSession * sessionsPerUser;
  const costPerMessage = costPerSession / turnsPerSession;
  const totalMonthlyCost = costPerUser * activeUsers;

  // Margin against a flat per-seat price, when one is supplied.
  const hasPrice = pricePerUser > 0;
  const grossMarginPercent = hasPrice ? ((pricePerUser - costPerUser) / pricePerUser) * 100 : null;
  const marginPerUser = hasPrice ? pricePerUser - costPerUser : null;
  // Sessions a user can run before their own subscription is used up.
  const breakEvenSessions =
    hasPrice && costPerSession > 0 ? pricePerUser / costPerSession : null;

  const tokensPerUser = (promptTokens + outputTokens) * sessionsPerUser;

  return {
    promptTokensPerSession: promptTokens,
    outputTokensPerSession: outputTokens,
    tokensPerSession: promptTokens + outputTokens,
    tokensPerUser,
    tokensPerMonth: tokensPerUser * activeUsers,
    freshInputCost,
    cachedInputCost,
    outputCost,
    costPerMessage,
    costPerSession,
    costPerUser,
    costPerUserPerYear: costPerUser * 12,
    totalMonthlyCost,
    totalAnnualCost: totalMonthlyCost * 12,
    outputShare: costPerSession > 0 ? (outputCost / costPerSession) * 100 : 0,
    grossMarginPercent,
    marginPerUser,
    breakEvenSessions,
  };
}
