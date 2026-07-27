/**
 * AI Spend Alert Planner — pure projection and alert-threshold maths.
 *
 * Projection uses a linear run rate, the same method cloud billing consoles use
 * for their forecast figure:
 *   daily burn      = spend to date / days elapsed
 *   projected month = daily burn x days in month
 * A threshold at T percent of budget is crossed on
 *   day = (T/100 x budget) / daily burn
 * Dates are supplied by the caller, so the maths is deterministic.
 */

/** Alert levels most finance teams use on a monthly cloud or AI budget. */
export const DEFAULT_THRESHOLDS = [50, 75, 90, 100];
/** A day costing more than this multiple of the average is treated as a spike. */
export const SPIKE_MULTIPLE = 1.5;
/** Projected spend above this share of budget is "on track to overrun". */
export const OVERRUN_TRIGGER_PCT = 100;

export const SEVERITY = {
  ok: { id: "ok", label: "On track", action: "No action — keep the weekly review in the calendar." },
  watch: {
    id: "watch",
    label: "Watch",
    action: "Note it in the weekly finance stand-up and check which team moved.",
  },
  act: {
    id: "act",
    label: "Act this week",
    action: "Identify the top workload by spend and cut or downgrade the model behind it.",
  },
  breach: {
    id: "breach",
    label: "Budget breach projected",
    action: "Apply hard limits now: cap keys, switch batch jobs to a cheaper model, pause non-essential agents.",
  },
};

/** Suggested response per threshold level. */
const THRESHOLD_ACTIONS = [
  { upTo: 50, action: "Log it. No response needed unless it arrived unusually early in the month." },
  { upTo: 75, action: "Review which project or key is driving the run rate and confirm it is expected." },
  { upTo: 90, action: "Freeze new experiments on shared keys and move batch work to a cheaper model." },
  {
    upTo: Infinity,
    action: "Hard cap: apply per-key spend limits, require named approval for further spend.",
  },
];

const round2 = (value) => Math.round(value * 100) / 100;

function actionForThreshold(threshold) {
  return (THRESHOLD_ACTIONS.find((item) => threshold <= item.upTo) || THRESHOLD_ACTIONS.at(-1)).action;
}

/**
 * @param {object} input
 * @param {number} input.monthlyBudget    budget for the month
 * @param {number} input.spendToDate      spend so far this month
 * @param {number} input.dayOfMonth       today's day number (1-31), supplied by the caller
 * @param {number} input.daysInMonth      days in the month, supplied by the caller
 * @param {number} input.largestDaySpend  the single biggest day so far (0 if unknown)
 * @param {number[]} input.thresholds     alert levels in percent of budget
 * @param {string[]} input.owners         people who receive the alerts, in escalation order
 */
export function planSpendAlerts({
  monthlyBudget,
  spendToDate,
  dayOfMonth,
  daysInMonth,
  largestDaySpend = 0,
  thresholds = DEFAULT_THRESHOLDS,
  owners = [],
} = {}) {
  const numbers = { monthlyBudget, spendToDate, dayOfMonth, daysInMonth, largestDaySpend };
  if (Object.values(numbers).some((value) => !Number.isFinite(value))) {
    return { error: "Enter a number for the budget, spend so far and the dates." };
  }
  if (monthlyBudget <= 0) return { error: "The monthly budget must be greater than zero." };
  if (spendToDate < 0) return { error: "Spend so far cannot be negative." };
  if (largestDaySpend < 0) return { error: "The biggest single day cannot be negative." };
  if (daysInMonth < 28 || daysInMonth > 31) return { error: "Days in the month must be between 28 and 31." };
  if (dayOfMonth < 1 || dayOfMonth > daysInMonth) {
    return { error: `Today's day number must be between 1 and ${daysInMonth}.` };
  }
  if (largestDaySpend > spendToDate) {
    return { error: "The biggest single day cannot exceed the total spent so far." };
  }

  const cleanThresholds = [...new Set(thresholds.filter((value) => Number.isFinite(value) && value > 0 && value <= 500))]
    .sort((a, b) => a - b);
  if (cleanThresholds.length === 0) {
    return { error: "Add at least one alert threshold between 1% and 500% of budget." };
  }

  const dailyBurn = spendToDate / dayOfMonth;
  const projectedMonth = dailyBurn * daysInMonth;
  const projectedPct = (projectedMonth / monthlyBudget) * 100;
  const usedPct = (spendToDate / monthlyBudget) * 100;
  const daysRemaining = daysInMonth - dayOfMonth;
  const budgetRemaining = monthlyBudget - spendToDate;
  const safeDailyRemaining = daysRemaining > 0 ? budgetRemaining / daysRemaining : null;
  const projectedOverrun = projectedMonth - monthlyBudget;

  const rows = cleanThresholds.map((threshold, index) => {
    const amount = (threshold / 100) * monthlyBudget;
    const crossed = spendToDate >= amount;
    const rawDay = dailyBurn > 0 ? amount / dailyBurn : null;
    const projectedDay = rawDay === null ? null : Math.ceil(rawDay);
    return {
      threshold,
      amount: round2(amount),
      crossed,
      projectedDay,
      withinMonth: projectedDay !== null && projectedDay <= daysInMonth,
      owner: owners.length ? owners[Math.min(index, owners.length - 1)] : "unassigned",
      action: actionForThreshold(threshold),
    };
  });

  let severity = SEVERITY.ok;
  if (projectedPct >= OVERRUN_TRIGGER_PCT) severity = SEVERITY.breach;
  else if (projectedPct >= 90 || usedPct >= 75) severity = SEVERITY.act;
  else if (projectedPct >= 75 || usedPct >= 50) severity = SEVERITY.watch;

  const spikeDetected = dailyBurn > 0 && largestDaySpend > dailyBurn * SPIKE_MULTIPLE;

  const notes = [];
  notes.push(
    `At ${round2(dailyBurn)} a day the month lands at ${round2(projectedMonth)}, which is ${Math.round(projectedPct)}% of budget.`,
  );
  if (safeDailyRemaining !== null) {
    notes.push(
      safeDailyRemaining >= 0
        ? `To finish on budget, keep the remaining ${daysRemaining} day${daysRemaining === 1 ? "" : "s"} under ${round2(safeDailyRemaining)} a day.`
        : `The budget is already exhausted — you are ${round2(-budgetRemaining)} over with ${daysRemaining} day${daysRemaining === 1 ? "" : "s"} left.`,
    );
  } else {
    notes.push("This is the last day of the month, so the projection is effectively the final figure.");
  }
  if (spikeDetected) {
    notes.push(
      `One day cost ${round2(largestDaySpend)}, over ${SPIKE_MULTIPLE}x the ${round2(dailyBurn)} daily average — add a daily spike alert, not just a monthly one.`,
    );
  }
  if (owners.length === 0) {
    notes.push("No owners are set. An alert with no named owner is a notification nobody acts on.");
  }

  const planLines = [];
  planLines.push("AI spend alert plan");
  planLines.push("");
  planLines.push(`Monthly budget: ${round2(monthlyBudget)}`);
  planLines.push(`Spend to day ${dayOfMonth} of ${daysInMonth}: ${round2(spendToDate)} (${Math.round(usedPct)}% of budget)`);
  planLines.push(`Run rate: ${round2(dailyBurn)} per day`);
  planLines.push(`Projected month end: ${round2(projectedMonth)} (${Math.round(projectedPct)}%)`);
  planLines.push(`Status: ${severity.label} — ${severity.action}`);
  planLines.push("");
  planLines.push("Thresholds:");
  rows.forEach((row) => {
    const when = row.crossed
      ? "already crossed"
      : row.withinMonth
        ? `projected day ${row.projectedDay}`
        : "not projected this month";
    planLines.push(`  ${row.threshold}% = ${round2(row.amount)} — ${when} — owner: ${row.owner}`);
    planLines.push(`      ${row.action}`);
  });
  if (spikeDetected) {
    planLines.push("");
    planLines.push(`Daily spike alert: any day above ${round2(dailyBurn * SPIKE_MULTIPLE)}.`);
  }

  return {
    dailyBurn: round2(dailyBurn),
    projectedMonth: round2(projectedMonth),
    projectedPct: Math.round(projectedPct * 10) / 10,
    usedPct: Math.round(usedPct * 10) / 10,
    budgetRemaining: round2(budgetRemaining),
    daysRemaining,
    safeDailyRemaining: safeDailyRemaining === null ? null : round2(safeDailyRemaining),
    projectedOverrun: round2(projectedOverrun),
    severity,
    spikeDetected,
    spikeThreshold: round2(dailyBurn * SPIKE_MULTIPLE),
    rows,
    notes,
    planText: planLines.join("\n"),
  };
}
