/**
 * Chatbot Analytics Metric Planner — defines the standard launch metrics for a
 * support chatbot and projects deflection volume and cost savings.
 *
 * Metric definitions follow their standard contact-centre formulations:
 * - Containment rate = conversations fully resolved by the bot (no human
 *   handoff) ÷ total bot conversations × 100.
 * - Escalation rate = 100 − containment rate (every conversation either stays
 *   contained or escalates).
 * - Deflection = contacts that would otherwise have reached a human channel
 *   but were resolved by the bot; the projection below assumes each contained
 *   conversation deflects one human contact — an upper bound, since some bot
 *   conversations would never have become tickets.
 * - CSAT = satisfied survey responses ÷ total survey responses × 100.
 * - Savings = deflected contacts × your own cost per human contact. No
 *   industry cost figure is assumed; you supply the number your finance team
 *   uses.
 */

export const MONTHS_PER_YEAR = 12;

/** Standard metric set to instrument BEFORE launch, with formulas and pitfalls. */
export const METRIC_DEFINITIONS = [
  {
    id: "containment",
    label: "Containment rate",
    formula: "bot-resolved conversations ÷ total bot conversations × 100",
    pitfall:
      "Counting abandoned conversations as 'contained' inflates the number — require an explicit resolution signal (confirmed answer, completed task) or a no-return window.",
  },
  {
    id: "escalation",
    label: "Escalation rate",
    formula: "100 − containment rate",
    pitfall:
      "A very low escalation rate is not automatically good — check it is not driven by the bot refusing or hiding the human handoff.",
  },
  {
    id: "deflection",
    label: "Deflection volume",
    formula: "contained conversations that would otherwise have become human contacts",
    pitfall:
      "Not every bot chat replaces a ticket; validate the assumption against pre-launch contact volume, or your savings math overstates.",
  },
  {
    id: "csat",
    label: "Bot CSAT",
    formula: "satisfied survey responses ÷ total survey responses × 100",
    pitfall:
      "Survey response bias is severe on bots — report response rate next to CSAT, and compare against your human-channel CSAT, not against 100.",
  },
  {
    id: "goal-completion",
    label: "Goal / task completion rate",
    formula: "conversations reaching the flow's defined success step ÷ conversations entering the flow × 100",
    pitfall:
      "Define the success step per flow before launch; retrofitting it later makes trend lines incomparable.",
  },
  {
    id: "fallback",
    label: "Fallback / no-match rate",
    formula: "bot turns hitting the fallback intent ÷ total bot turns × 100",
    pitfall:
      "Track per-intent, not just globally — a healthy average can hide one broken flow doing all the damage.",
  },
];

/**
 * Project deflection and savings from launch assumptions.
 *
 * @param {object} input
 * @param {number} input.monthlyConversations   Expected bot conversations per month.
 * @param {number} input.expectedContainmentPct Expected containment rate, 0–100.
 * @param {number} input.costPerHumanContact    Fully loaded cost of one human-handled contact.
 * @returns {object} projections or { error }.
 */
export function computeMetricPlan({
  monthlyConversations,
  expectedContainmentPct,
  costPerHumanContact,
}) {
  const conversations = Number(monthlyConversations);
  if (!Number.isFinite(conversations) || conversations <= 0) {
    return { error: "Monthly conversations must be a number greater than zero." };
  }
  const containment = Number(expectedContainmentPct);
  if (!Number.isFinite(containment) || containment < 0 || containment > 100) {
    return { error: "Expected containment must be a percentage between 0 and 100." };
  }
  const cost = Number(costPerHumanContact);
  if (!Number.isFinite(cost) || cost < 0) {
    return { error: "Cost per human contact cannot be negative. Use 0 to skip the savings projection." };
  }

  const deflectedPerMonth = (conversations * containment) / 100;
  const escalatedPerMonth = conversations - deflectedPerMonth;
  const monthlySavings = deflectedPerMonth * cost;

  return {
    monthlyConversations: conversations,
    containmentPct: containment,
    escalationRatePct: 100 - containment,
    deflectedPerMonth,
    escalatedPerMonth,
    monthlySavings,
    annualSavings: monthlySavings * MONTHS_PER_YEAR,
    costPerHumanContact: cost,
  };
}
