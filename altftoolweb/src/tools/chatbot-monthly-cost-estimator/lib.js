/**
 * Support chatbot monthly cost estimator — pure logic.
 *
 * A retrieval-augmented support bot bills three things on every turn:
 *   1. the system prompt (persona, policy, tool definitions) — resent every turn
 *   2. the retrieved knowledge-base context — freshly injected every turn
 *   3. the conversation transcript so far — resent every turn on a stateless API
 *
 * For a conversation of n turns, with system prompt s, retrieved context r,
 * user message u and reply a (all in tokens):
 *
 *   prompt tokens on turn k = s + r + k*u + (k-1)*a
 *   total prompt tokens     = n*(s + r) + u * n(n+1)/2 + a * n(n-1)/2
 *   total output tokens     = n*a
 *
 * With history trimmed (each turn standalone) the prompt total collapses to
 * n*(s + r + u).
 *
 * Worked check, n = 4, s = 800, r = 2000, u = 60, a = 220:
 *   turn 1 = 2860, turn 2 = 3140, turn 3 = 3420, turn 4 = 3700  ->  13,120
 *   formula = 4*2800 + 60*10 + 220*6 = 11,200 + 600 + 1,320     ->  13,120
 *
 * Cost is then the usual per-million-token arithmetic, with a share of prompt
 * tokens billed at the discounted cached rate when prompt caching is in play.
 *
 * The savings side compares the token bill against the fully loaded cost of a
 * human handling the same contacts, scaled by the deflection (containment)
 * rate — the share of conversations the bot resolves without escalation.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** Token prices are quoted per 1,000,000 tokens. */
export const TOKENS_PER_PRICE_UNIT = 1_000_000;

/** Sanity ceilings. */
export const MAX_TURNS = 200;
export const MAX_CONVERSATIONS_PER_MONTH = 500_000_000;
export const MAX_TOKENS_PER_FIELD = 2_000_000;

/** Common support-bot shapes, used as one-tap presets. */
export const BOT_PRESETS = [
  {
    id: "faq",
    label: "Simple FAQ bot",
    systemTokens: 400,
    ragTokens: 800,
    userTokens: 40,
    replyTokens: 120,
    turns: 2,
  },
  {
    id: "rag-support",
    label: "RAG support agent",
    systemTokens: 800,
    ragTokens: 2000,
    userTokens: 60,
    replyTokens: 220,
    turns: 4,
  },
  {
    id: "tooling",
    label: "Tool-calling assistant",
    systemTokens: 2500,
    ragTokens: 3000,
    userTokens: 80,
    replyTokens: 350,
    turns: 6,
  },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Prompt and output tokens for one conversation.
 *
 * @param {object} args
 * @param {number} args.turns
 * @param {number} args.systemTokens  Resent every turn.
 * @param {number} args.ragTokens     Retrieved context injected every turn.
 * @param {number} args.userTokens    Tokens per user message.
 * @param {number} args.replyTokens   Tokens per bot reply.
 * @param {boolean} args.resendHistory
 */
export function conversationTokens({
  turns,
  systemTokens,
  ragTokens,
  userTokens,
  replyTokens,
  resendHistory,
}) {
  if (!isNum(turns) || turns <= 0) return { promptTokens: 0, outputTokens: 0 };
  const n = turns;
  const fixedPerTurn = systemTokens + ragTokens;
  const promptTokens = resendHistory
    ? n * fixedPerTurn + userTokens * ((n * (n + 1)) / 2) + replyTokens * ((n * (n - 1)) / 2)
    : n * (fixedPerTurn + userTokens);
  return { promptTokens, outputTokens: n * replyTokens };
}

/**
 * Monthly chatbot cost plus the deflection savings comparison.
 *
 * @returns {object} cost breakdown, or { error }
 */
export function computeChatbotCost({
  conversationsPerMonth = 0,
  turns = 0,
  systemTokens = 0,
  ragTokens = 0,
  userTokens = 0,
  replyTokens = 0,
  resendHistory = true,
  cacheHitPercent = 0,
  inputPerMTok = 0,
  outputPerMTok = 0,
  cachedInputPerMTok = 0,
  embeddingCostPerConversation = 0,
  deflectionPercent = 0,
  humanCostPerConversation = 0,
} = {}) {
  const values = [
    conversationsPerMonth,
    turns,
    systemTokens,
    ragTokens,
    userTokens,
    replyTokens,
    cacheHitPercent,
    inputPerMTok,
    outputPerMTok,
    cachedInputPerMTok,
    embeddingCostPerConversation,
    deflectionPercent,
    humanCostPerConversation,
  ];
  if (values.some((value) => !isNum(value))) return { error: "Every field must be a number." };
  if (values.some((value) => value < 0)) {
    return { error: "Volumes, token counts and costs cannot be negative." };
  }
  if (turns < 1) return { error: "A conversation needs at least one turn." };
  if (turns > MAX_TURNS) return { error: `Keep turns per conversation at or below ${MAX_TURNS}.` };
  if (conversationsPerMonth > MAX_CONVERSATIONS_PER_MONTH) {
    return { error: "Enter a monthly conversation volume below 500 million." };
  }
  if (cacheHitPercent > 100) return { error: "Cache hit rate cannot exceed 100%." };
  if (deflectionPercent > 100) return { error: "Deflection rate cannot exceed 100%." };
  if ([systemTokens, ragTokens, userTokens, replyTokens].some((v) => v > MAX_TOKENS_PER_FIELD)) {
    return { error: "Token counts per turn look unrealistically large." };
  }
  if (systemTokens + ragTokens + userTokens + replyTokens === 0) {
    return { error: "Enter the token sizes of a typical turn to price anything." };
  }

  const { promptTokens, outputTokens } = conversationTokens({
    turns,
    systemTokens,
    ragTokens,
    userTokens,
    replyTokens,
    resendHistory: Boolean(resendHistory),
  });

  const cachedPromptTokens = promptTokens * (cacheHitPercent / 100);
  const freshPromptTokens = promptTokens - cachedPromptTokens;

  const per = (tokens, rate) => (tokens / TOKENS_PER_PRICE_UNIT) * rate;

  const freshInputCost = per(freshPromptTokens, inputPerMTok);
  const cachedInputCost = per(cachedPromptTokens, cachedInputPerMTok);
  const outputCost = per(outputTokens, outputPerMTok);
  const llmCostPerConversation = freshInputCost + cachedInputCost + outputCost;
  const costPerConversation = llmCostPerConversation + embeddingCostPerConversation;

  const monthlyCost = costPerConversation * conversationsPerMonth;
  const costPerTurn = costPerConversation / turns;

  const deflected = conversationsPerMonth * (deflectionPercent / 100);
  const escalated = conversationsPerMonth - deflected;
  const humanCostAvoided = deflected * humanCostPerConversation;
  const netSaving = humanCostAvoided - monthlyCost;
  // ROI as a percentage of what the bot costs to run.
  const roiPercent = monthlyCost > 0 ? (netSaving / monthlyCost) * 100 : null;
  // Deflection rate at which the bot exactly pays for itself.
  const breakEvenDeflectionPercent =
    humanCostPerConversation > 0 && conversationsPerMonth > 0
      ? (monthlyCost / (conversationsPerMonth * humanCostPerConversation)) * 100
      : null;

  return {
    promptTokensPerConversation: promptTokens,
    outputTokensPerConversation: outputTokens,
    tokensPerConversation: promptTokens + outputTokens,
    tokensPerMonth: (promptTokens + outputTokens) * conversationsPerMonth,
    freshInputCost,
    cachedInputCost,
    outputCost,
    llmCostPerConversation,
    costPerConversation,
    costPerTurn,
    monthlyCost,
    annualCost: monthlyCost * 12,
    deflected,
    escalated,
    humanCostAvoided,
    netSaving,
    roiPercent,
    breakEvenDeflectionPercent,
    outputShare: costPerConversation > 0 ? (outputCost / costPerConversation) * 100 : 0,
  };
}
