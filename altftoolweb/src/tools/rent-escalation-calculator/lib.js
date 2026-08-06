/**
 * Rent escalation projection.
 *
 * Model
 *  A lease fixes a base monthly rent and raises it by a fixed percentage every N months.
 *  Rent for month m (1-indexed) is therefore
 *      rent(m) = base * (1 + e) ^ floor((m - 1) / N)
 *  which is compounding, not simple addition: a 5% clause applied three times gives 15.7625%
 *  over the base, not 15%.
 *
 *  Indian leases commonly escalate 5% every 11 months, because an eleven-month agreement avoids
 *  compulsory registration under section 17(1)(d) of the Registration Act, 1908, which applies to
 *  leases of one year and above. An 11-month cycle therefore compounds slightly faster than once a
 *  year, and the effective annual rate is
 *      (1 + e) ^ (12 / N) - 1
 */

/** Longest lease this tool will project, in months. */
export const MAX_TERM_MONTHS = 240;
/** Longest gap between escalations, in months. */
export const MAX_ESCALATION_INTERVAL = 120;
/** Escalation is capped to keep the projection meaningful rather than astronomical. */
export const MIN_ESCALATION_PERCENT = -50;
export const MAX_ESCALATION_PERCENT = 100;
/** Months in a year, used to annualise an interval that is not twelve months. */
export const MONTHS_PER_YEAR = 12;
/**
 * Section 17(1)(d) of the Registration Act, 1908 makes a lease of immovable property from year to
 * year, or for a term exceeding one year, compulsorily registrable. This is why 11-month cycles
 * are so common.
 */
export const REGISTRATION_FREE_TERM_MONTHS = 11;

function isNum(value) {
  return typeof value === "number" && Number.isFinite(value);
}

/**
 * Project rent across a lease term.
 *
 * @param {object} input
 * @param {number} input.baseMonthlyRent       Rent for the first month.
 * @param {number} input.escalationPercent     Increase applied at each escalation, in percent.
 * @param {number} input.escalationEveryMonths Months between escalations.
 * @param {number} input.termMonths            Total length of the lease in months.
 */
export function projectRentEscalation({
  baseMonthlyRent,
  escalationPercent,
  escalationEveryMonths,
  termMonths,
}) {
  if (!isNum(baseMonthlyRent) || baseMonthlyRent <= 0) {
    return { error: "Base monthly rent must be greater than zero." };
  }
  if (!isNum(escalationPercent)) {
    return { error: "Enter the escalation as a number, for example 5 for five percent." };
  }
  if (escalationPercent < MIN_ESCALATION_PERCENT || escalationPercent > MAX_ESCALATION_PERCENT) {
    return {
      error: `Escalation should be between ${MIN_ESCALATION_PERCENT}% and ${MAX_ESCALATION_PERCENT}% per step.`,
    };
  }
  if (
    !isNum(escalationEveryMonths) ||
    !Number.isInteger(escalationEveryMonths) ||
    escalationEveryMonths < 1 ||
    escalationEveryMonths > MAX_ESCALATION_INTERVAL
  ) {
    return {
      error: `Escalation interval must be a whole number of months between 1 and ${MAX_ESCALATION_INTERVAL}.`,
    };
  }
  if (
    !isNum(termMonths) ||
    !Number.isInteger(termMonths) ||
    termMonths < 1 ||
    termMonths > MAX_TERM_MONTHS
  ) {
    return { error: `Lease term must be a whole number of months between 1 and ${MAX_TERM_MONTHS}.` };
  }

  const factor = 1 + escalationPercent / 100;
  const periods = [];
  let totalRent = 0;
  let monthCursor = 1;
  let stepIndex = 0;

  while (monthCursor <= termMonths) {
    const monthsInStep = Math.min(escalationEveryMonths, termMonths - monthCursor + 1);
    const rent = baseMonthlyRent * Math.pow(factor, stepIndex);
    const stepTotal = rent * monthsInStep;
    totalRent += stepTotal;

    periods.push({
      step: stepIndex + 1,
      fromMonth: monthCursor,
      toMonth: monthCursor + monthsInStep - 1,
      monthsInStep,
      monthlyRent: rent,
      stepTotal,
      increaseOverBase: rent - baseMonthlyRent,
      increaseOverBasePercent: (rent / baseMonthlyRent - 1) * 100,
    });

    monthCursor += monthsInStep;
    stepIndex += 1;
  }

  const finalMonthlyRent = periods[periods.length - 1].monthlyRent;
  const flatTotal = baseMonthlyRent * termMonths;
  const escalationCost = totalRent - flatTotal;

  const escalationCount = periods.length - 1;

  // Annualise an interval that is not twelve months long. Only meaningful once the lease term is
  // long enough for at least one escalation step to actually fire — otherwise the clause never
  // takes effect during this lease, so an annualised rate here would contradict the 0 escalations
  // / 0% total increase shown alongside it.
  const effectiveAnnualRate =
    escalationCount > 0 && factor > 0
      ? (Math.pow(factor, MONTHS_PER_YEAR / escalationEveryMonths) - 1) * 100
      : 0;

  const result = {
    periods,
    escalationCount,
    termMonths,
    baseMonthlyRent,
    finalMonthlyRent,
    totalRent,
    flatTotal,
    escalationCost,
    escalationCostPercent: (escalationCost / flatTotal) * 100,
    averageMonthlyRent: totalRent / termMonths,
    totalIncrease: finalMonthlyRent - baseMonthlyRent,
    totalIncreasePercent: (finalMonthlyRent / baseMonthlyRent - 1) * 100,
    effectiveAnnualRate,
    escalationPercent,
    escalationEveryMonths,
  };

  if (!Number.isFinite(result.totalRent) || !Number.isFinite(result.finalMonthlyRent)) {
    return { error: "Those inputs compound past what can be shown — reduce the term or the escalation." };
  }

  return result;
}
