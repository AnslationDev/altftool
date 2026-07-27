/**
 * Rent escalation projection.
 *
 * Rent rises in steps, not continuously: the agreed percentage is applied once per
 * renewal cycle, so the rent in cycle k is
 *      rent_k = startingRent x (1 + escalation/100)^k
 * and the outgo over a horizon is the sum of that rent across every month in the
 * horizon. Value in today's money uses the standard present-value deflator
 *      real = nominal / (1 + inflation/100)^(months/12).
 */

/** Most Indian residential agreements renew every 11 or 12 months. */
export const COMMON_CYCLE_MONTHS = [11, 12, 24, 36];

/** Escalations outside this range are almost certainly a typing mistake. */
export const MIN_ESCALATION_PERCENT = -50;
export const MAX_ESCALATION_PERCENT = 100;

/** Longest horizon this planner will project. */
export const MAX_HORIZON_YEARS = 30;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Monthly rent that applies in a given zero-based renewal cycle. */
export function rentInCycle({ startingRent, escalationPercent, cycleIndex }) {
  if (!isNum(startingRent) || !isNum(escalationPercent) || !isNum(cycleIndex)) return 0;
  if (cycleIndex < 0) return startingRent;
  return startingRent * Math.pow(1 + escalationPercent / 100, cycleIndex);
}

/**
 * Month-by-month projection for one scenario.
 * Returns nominal total, inflation-adjusted total and one row per renewal cycle.
 */
export function projectScenario({
  startingRent,
  escalationPercent,
  cycleMonths,
  horizonMonths,
  inflationPercent = 0,
}) {
  const rows = [];
  let nominalTotal = 0;
  let realTotal = 0;
  let cumulative = 0;

  const cycleCount = Math.ceil(horizonMonths / cycleMonths);
  for (let cycleIndex = 0; cycleIndex < cycleCount; cycleIndex += 1) {
    const firstMonth = cycleIndex * cycleMonths;
    const lastMonthExclusive = Math.min(firstMonth + cycleMonths, horizonMonths);
    const monthsInCycle = lastMonthExclusive - firstMonth;
    if (monthsInCycle <= 0) break;

    const monthlyRent = rentInCycle({ startingRent, escalationPercent, cycleIndex });
    const cycleTotal = monthlyRent * monthsInCycle;
    nominalTotal += cycleTotal;
    cumulative += cycleTotal;

    for (let month = firstMonth; month < lastMonthExclusive; month += 1) {
      realTotal += monthlyRent / Math.pow(1 + inflationPercent / 100, month / 12);
    }

    rows.push({
      cycle: cycleIndex + 1,
      firstMonth: firstMonth + 1,
      lastMonth: lastMonthExclusive,
      monthsInCycle,
      monthlyRent,
      cycleTotal,
      cumulative,
      increaseOverStart: monthlyRent - startingRent,
    });
  }

  return { rows, nominalTotal, realTotal };
}

/**
 * Compare an agreed escalation against a second scenario over the same horizon.
 * Returns { error } for input that cannot produce a meaningful projection.
 */
export function planRentIncrements({
  startingRent,
  escalationPercent,
  cycleMonths = 12,
  horizonYears,
  inflationPercent = 0,
  altStartingRent,
  altEscalationPercent,
}) {
  const numbers = [
    startingRent,
    escalationPercent,
    cycleMonths,
    horizonYears,
    inflationPercent,
    altStartingRent,
    altEscalationPercent,
  ];
  if (numbers.some((value) => !isNum(value))) {
    return { error: "Enter a valid number in every field." };
  }
  if (startingRent <= 0) return { error: "Current monthly rent must be greater than zero." };
  if (altStartingRent <= 0) {
    return { error: "The comparison scenario needs a starting rent greater than zero." };
  }
  if (
    escalationPercent < MIN_ESCALATION_PERCENT ||
    escalationPercent > MAX_ESCALATION_PERCENT ||
    altEscalationPercent < MIN_ESCALATION_PERCENT ||
    altEscalationPercent > MAX_ESCALATION_PERCENT
  ) {
    return {
      error: `Escalation should be between ${MIN_ESCALATION_PERCENT}% and ${MAX_ESCALATION_PERCENT}% per renewal.`,
    };
  }
  if (!Number.isInteger(cycleMonths) || cycleMonths < 1 || cycleMonths > 120) {
    return { error: "Renewal cycle should be a whole number of months between 1 and 120." };
  }
  if (horizonYears <= 0 || horizonYears > MAX_HORIZON_YEARS) {
    return { error: `Projection horizon should be between 1 and ${MAX_HORIZON_YEARS} years.` };
  }
  if (inflationPercent < -20 || inflationPercent > 50) {
    return { error: "Inflation should be between -20% and 50% per year." };
  }

  const horizonMonths = Math.round(horizonYears * 12);

  const main = projectScenario({
    startingRent,
    escalationPercent,
    cycleMonths,
    horizonMonths,
    inflationPercent,
  });
  const alt = projectScenario({
    startingRent: altStartingRent,
    escalationPercent: altEscalationPercent,
    cycleMonths,
    horizonMonths,
    inflationPercent,
  });

  const finalRow = main.rows[main.rows.length - 1];
  const finalMonthlyRent = finalRow ? finalRow.monthlyRent : startingRent;

  // First cycle in which the comparison scenario becomes the dearer monthly rent.
  let crossoverCycle = 0;
  for (let i = 0; i < main.rows.length; i += 1) {
    const here = main.rows[i];
    const there = alt.rows[i];
    if (!there) break;
    if (there.monthlyRent > here.monthlyRent) {
      crossoverCycle = here.cycle;
      break;
    }
  }

  const difference = alt.nominalTotal - main.nominalTotal;

  return {
    rows: main.rows,
    altRows: alt.rows,
    horizonMonths,
    nominalTotal: main.nominalTotal,
    realTotal: main.realTotal,
    inflationDrag: main.nominalTotal - main.realTotal,
    altNominalTotal: alt.nominalTotal,
    difference,
    cheaperScenario: difference > 0 ? "main" : difference < 0 ? "alt" : "tie",
    crossoverCycle,
    finalMonthlyRent,
    finalIncreasePercent: startingRent > 0 ? (finalMonthlyRent / startingRent - 1) * 100 : 0,
    averageMonthlyRent: horizonMonths > 0 ? main.nominalTotal / horizonMonths : 0,
    startingRent,
  };
}
