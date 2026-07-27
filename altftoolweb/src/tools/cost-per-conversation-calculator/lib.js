/**
 * Cost Per Conversation Calculator — pure token and cost arithmetic.
 *
 * The important detail most estimates miss: a chat API is stateless, so every
 * turn resends the system prompt plus the whole transcript so far. With
 *   s = system + retrieved context tokens sent every turn
 *   u = user message tokens
 *   a = assistant reply tokens
 *   n = turns
 * the input billed on turn k is s + (k-1)(u + a) + u, so across n turns:
 *   total input  = n*s + n*u + (u + a) * n(n-1)/2
 *   total output = n*a
 * The quadratic term is why long conversations cost far more than turns x tokens.
 *
 * Prices are per million tokens, as the model APIs publish them. Prompt caching
 * is modelled as a share of input tokens billed at a lower cached rate.
 */

/** Model APIs quote prices per million tokens. */
export const TOKENS_PER_PRICE_UNIT = 1_000_000;
/** Minutes in an hour, for converting agent handle time to money. */
export const MINUTES_PER_HOUR = 60;

/**
 * @param {object} input
 * @param {number} input.turns              assistant replies in a conversation
 * @param {number} input.systemTokens       system prompt + retrieved context resent each turn
 * @param {number} input.userTokens         tokens in one user message
 * @param {number} input.assistantTokens    tokens in one assistant reply
 * @param {number} input.inputPricePerM     price per million input tokens
 * @param {number} input.outputPricePerM    price per million output tokens
 * @param {number} input.cachedPricePerM    price per million cached input tokens
 * @param {number} input.cacheHitPct        share of input tokens served from cache (0-100)
 * @param {number} input.escalationPct      share of conversations handed to a human (0-100)
 * @param {number} input.agentMinutes       agent minutes spent on an escalated conversation
 * @param {number} input.agentHourlyCost    fully loaded agent cost per hour
 * @param {number} input.humanOnlyMinutes   minutes the same conversation takes with no AI
 * @param {number} input.conversationsPerMonth volume for the monthly view
 */
export function computeConversationCost({
  turns,
  systemTokens,
  userTokens,
  assistantTokens,
  inputPricePerM,
  outputPricePerM,
  cachedPricePerM = 0,
  cacheHitPct = 0,
  escalationPct = 0,
  agentMinutes = 0,
  agentHourlyCost = 0,
  humanOnlyMinutes = 0,
  conversationsPerMonth = 0,
} = {}) {
  const values = {
    turns,
    systemTokens,
    userTokens,
    assistantTokens,
    inputPricePerM,
    outputPricePerM,
    cachedPricePerM,
    cacheHitPct,
    escalationPct,
    agentMinutes,
    agentHourlyCost,
    humanOnlyMinutes,
    conversationsPerMonth,
  };
  if (Object.values(values).some((value) => !Number.isFinite(value))) {
    return { error: "Enter a number in every field." };
  }
  if (turns < 1) return { error: "A conversation needs at least one turn." };
  if (turns > 200) return { error: "Keep turns per conversation at 200 or below." };
  if (
    [systemTokens, userTokens, assistantTokens, inputPricePerM, outputPricePerM, cachedPricePerM, agentMinutes, agentHourlyCost, humanOnlyMinutes, conversationsPerMonth].some(
      (value) => value < 0,
    )
  ) {
    return { error: "Tokens, prices, minutes and volumes cannot be negative." };
  }
  if (cacheHitPct < 0 || cacheHitPct > 100) return { error: "Cache hit rate must be between 0% and 100%." };
  if (escalationPct < 0 || escalationPct > 100) {
    return { error: "Escalation rate must be between 0% and 100%." };
  }

  const n = Math.floor(turns);
  // Context resent on every turn: the quadratic term.
  const historyTokens = (userTokens + assistantTokens) * ((n * (n - 1)) / 2);
  const totalInputTokens = n * systemTokens + n * userTokens + historyTokens;
  const totalOutputTokens = n * assistantTokens;

  const cacheShare = cacheHitPct / 100;
  const cachedInputTokens = totalInputTokens * cacheShare;
  const freshInputTokens = totalInputTokens - cachedInputTokens;

  const inputCost =
    (freshInputTokens * inputPricePerM + cachedInputTokens * cachedPricePerM) / TOKENS_PER_PRICE_UNIT;
  const outputCost = (totalOutputTokens * outputPricePerM) / TOKENS_PER_PRICE_UNIT;
  const aiCost = inputCost + outputCost;

  const escalationShare = escalationPct / 100;
  const agentCostPerEscalation = (agentMinutes / MINUTES_PER_HOUR) * agentHourlyCost;
  const expectedHumanCost = escalationShare * agentCostPerEscalation;
  const totalPerConversation = aiCost + expectedHumanCost;

  const humanOnlyCost = (humanOnlyMinutes / MINUTES_PER_HOUR) * agentHourlyCost;
  const savingPerConversation = humanOnlyCost - totalPerConversation;
  const savingPct = humanOnlyCost > 0 ? (savingPerConversation / humanOnlyCost) * 100 : null;

  const monthlyAiCost = aiCost * conversationsPerMonth;
  const monthlyTotalCost = totalPerConversation * conversationsPerMonth;
  const monthlyHumanOnlyCost = humanOnlyCost * conversationsPerMonth;

  // Turns at which the AI-only cost would equal the human-only cost, holding
  // token sizes fixed. Solved by walking turns rather than inverting the
  // quadratic, so the number returned is a real, billable turn count.
  let breakEvenTurns = null;
  if (humanOnlyCost > 0 && (inputPricePerM > 0 || outputPricePerM > 0)) {
    for (let k = 1; k <= 500; k += 1) {
      const history = (userTokens + assistantTokens) * ((k * (k - 1)) / 2);
      const input = k * systemTokens + k * userTokens + history;
      const cached = input * cacheShare;
      const cost =
        ((input - cached) * inputPricePerM + cached * cachedPricePerM + k * assistantTokens * outputPricePerM) /
        TOKENS_PER_PRICE_UNIT;
      if (cost >= humanOnlyCost) {
        breakEvenTurns = k;
        break;
      }
    }
  }

  const notes = [];
  if (n > 1) {
    const linearInput = n * (systemTokens + userTokens);
    const overhead = totalInputTokens - linearInput;
    if (overhead > 0) {
      notes.push(
        `${Math.round(overhead).toLocaleString("en-US")} of the ${Math.round(totalInputTokens).toLocaleString("en-US")} input tokens are transcript resent on later turns — ${Math.round((overhead / totalInputTokens) * 100)}% of your input bill.`,
      );
    }
  }
  if (cacheHitPct > 0) {
    notes.push(
      `Caching ${cacheHitPct}% of input tokens saves ${((cachedInputTokens * (inputPricePerM - cachedPricePerM)) / TOKENS_PER_PRICE_UNIT).toFixed(4)} per conversation at these rates.`,
    );
  }
  if (expectedHumanCost > aiCost && escalationPct > 0) {
    notes.push(
      `Human escalation is ${(expectedHumanCost / (aiCost || 1)).toFixed(1)}x the model cost — a one-point drop in the ${escalationPct}% escalation rate is worth more than any prompt tuning.`,
    );
  }

  return {
    totalInputTokens: Math.round(totalInputTokens),
    totalOutputTokens: Math.round(totalOutputTokens),
    historyTokens: Math.round(historyTokens),
    cachedInputTokens: Math.round(cachedInputTokens),
    inputCost,
    outputCost,
    aiCost,
    agentCostPerEscalation,
    expectedHumanCost,
    totalPerConversation,
    humanOnlyCost,
    savingPerConversation,
    savingPct: savingPct === null ? null : Math.round(savingPct * 10) / 10,
    monthlyAiCost,
    monthlyTotalCost,
    monthlyHumanOnlyCost,
    monthlySaving: monthlyHumanOnlyCost - monthlyTotalCost,
    breakEvenTurns,
    notes,
  };
}
