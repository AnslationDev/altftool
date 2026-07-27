/**
 * Cost Per Support Ticket AI Calculator — pure arithmetic.
 *
 * Labour uses the standard contact-centre cost-per-contact method: handle time
 * is divided by occupancy, because an agent paid for an hour is only handling
 * contacts for the occupied share of it.
 *   agent cost per ticket = (AHT minutes / 60) / occupancy x fully loaded hourly cost
 *
 * The AI side charges every ticket for the attempt, and charges escalated
 * tickets an extra handoff cost (the summary generation and the context the
 * agent has to re-read).
 *   blended total = T*aiPerAttempt + (T - contained)*(handoff + agentPerTicket) + platform fee
 *
 * Break-even containment is that equation solved against the no-AI baseline
 * (T x agentPerTicket):
 *   c* = 1 - (agentPerTicket - aiPerAttempt - fee/T) / (agentPerTicket + handoff)
 */

export const MINUTES_PER_HOUR = 60;
/** Occupancy below this is unusually low for a support queue and worth flagging. */
export const LOW_OCCUPANCY_PCT = 60;

/**
 * @param {object} input
 * @param {number} input.ticketsPerMonth      total inbound tickets
 * @param {number} input.containmentPct       share fully resolved by AI, no human (0-100)
 * @param {number} input.aiCostPerAttempt     model cost of one AI attempt
 * @param {number} input.handoffCost          extra AI cost when a ticket escalates
 * @param {number} input.ahtMinutes           agent average handle time in minutes
 * @param {number} input.agentHourlyCost      fully loaded agent cost per hour
 * @param {number} input.occupancyPct         share of paid time spent handling tickets (1-100)
 * @param {number} input.platformMonthlyFee   fixed monthly platform or licence fee
 * @param {number} input.reopenPct            share of AI-contained tickets that come back (0-100)
 */
export function computeTicketCost({
  ticketsPerMonth,
  containmentPct,
  aiCostPerAttempt,
  handoffCost = 0,
  ahtMinutes,
  agentHourlyCost,
  occupancyPct,
  platformMonthlyFee = 0,
  reopenPct = 0,
} = {}) {
  const values = {
    ticketsPerMonth,
    containmentPct,
    aiCostPerAttempt,
    handoffCost,
    ahtMinutes,
    agentHourlyCost,
    occupancyPct,
    platformMonthlyFee,
    reopenPct,
  };
  if (Object.values(values).some((value) => !Number.isFinite(value))) {
    return { error: "Enter a number in every field." };
  }
  if (ticketsPerMonth < 1) return { error: "Enter at least one ticket a month." };
  if (containmentPct < 0 || containmentPct > 100) {
    return { error: "Containment must be between 0% and 100%." };
  }
  if (reopenPct < 0 || reopenPct > 100) return { error: "Reopen rate must be between 0% and 100%." };
  if (occupancyPct <= 0 || occupancyPct > 100) {
    return { error: "Occupancy must be above 0% and no more than 100%." };
  }
  if ([aiCostPerAttempt, handoffCost, ahtMinutes, agentHourlyCost, platformMonthlyFee].some((value) => value < 0)) {
    return { error: "Costs and handle time cannot be negative." };
  }

  const occupancy = occupancyPct / 100;
  const agentCostPerTicket = (ahtMinutes / MINUTES_PER_HOUR / occupancy) * agentHourlyCost;

  const containment = containmentPct / 100;
  const reopenShare = reopenPct / 100;
  const containedRaw = ticketsPerMonth * containment;
  // Reopened tickets were "contained" but come back to a human anyway.
  const reopened = containedRaw * reopenShare;
  const containedNet = containedRaw - reopened;
  const escalated = ticketsPerMonth - containedNet;
  const effectiveContainment = ticketsPerMonth > 0 ? containedNet / ticketsPerMonth : 0;

  const aiSpend = ticketsPerMonth * aiCostPerAttempt + escalated * handoffCost;
  const agentSpend = escalated * agentCostPerTicket;
  const totalSpend = aiSpend + agentSpend + platformMonthlyFee;
  const blendedPerTicket = totalSpend / ticketsPerMonth;

  const baselineSpend = ticketsPerMonth * agentCostPerTicket;
  const baselinePerTicket = agentCostPerTicket;
  const monthlySaving = baselineSpend - totalSpend;
  const savingPct = baselineSpend > 0 ? (monthlySaving / baselineSpend) * 100 : null;

  const feePerTicket = platformMonthlyFee / ticketsPerMonth;
  const denominator = agentCostPerTicket + handoffCost;
  let breakEvenContainmentPct = null;
  if (denominator > 0) {
    const raw = 1 - (agentCostPerTicket - aiCostPerAttempt - feePerTicket) / denominator;
    if (Number.isFinite(raw)) breakEvenContainmentPct = Math.round(raw * 1000) / 10;
  }

  const agentMinutesSaved = containedNet * ahtMinutes;
  const agentHoursSaved = agentMinutesSaved / MINUTES_PER_HOUR;

  const notes = [];
  if (occupancyPct < LOW_OCCUPANCY_PCT) {
    notes.push(
      `Occupancy of ${occupancyPct}% means each ticket carries a lot of paid idle time; the agent cost per ticket is ${(1 / occupancy).toFixed(2)}x the raw handle-time cost.`,
    );
  }
  if (reopenPct > 0) {
    notes.push(
      `Reopens pull real containment down from ${containmentPct}% to ${Math.round(effectiveContainment * 1000) / 10}% — a reopened ticket costs the AI attempt and the full agent handle.`,
    );
  }
  if (breakEvenContainmentPct !== null) {
    notes.push(
      breakEvenContainmentPct <= 0
        ? "The AI attempt costs less than the fixed fee saving, so the deployment pays for itself even at zero containment."
        : `Break-even is ${breakEvenContainmentPct}% containment; you are at ${Math.round(effectiveContainment * 1000) / 10}%.`,
    );
  }
  if (monthlySaving < 0) {
    notes.push("At this containment rate the AI layer costs more than handling everything by hand.");
  }

  return {
    agentCostPerTicket,
    containedNet,
    reopened,
    escalated,
    effectiveContainmentPct: Math.round(effectiveContainment * 1000) / 10,
    aiSpend,
    agentSpend,
    platformMonthlyFee,
    totalSpend,
    blendedPerTicket,
    baselineSpend,
    baselinePerTicket,
    monthlySaving,
    annualSaving: monthlySaving * 12,
    savingPct: savingPct === null ? null : Math.round(savingPct * 10) / 10,
    breakEvenContainmentPct,
    agentHoursSaved,
    notes,
  };
}
