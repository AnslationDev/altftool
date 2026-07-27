/**
 * SIP Goal Reverse Calculator — pure maths.
 *
 * Reverses the standard future-value-of-an-annuity formula used by every Indian AMC
 * SIP calculator, solving for the instalment P instead of the maturity value:
 *
 *   FV = P x SUM(k = 1..n) [ (1 + g)^floor((k-1)/12) x (1 + i)^(n - k + 1) ]
 *
 * where i is the monthly rate, n the number of instalments, g the annual step-up rate.
 * The exponent (n - k + 1) means each instalment is invested at the START of its month
 * (an "annuity due"), which is how a SIP mandate actually debits.
 */

/** Calendar months in a year — converts a nominal annual rate to a monthly rate. */
export const MONTHS_PER_YEAR = 12;

/**
 * Indian AMCs quote SIP returns as a nominal annual rate and divide by 12 for the
 * monthly rate (i = annual / 12 / 100), the same convention as an EMI schedule.
 */
export const RATE_DIVISOR = 1200;

/** Upper sanity bound on an assumed annual return; long-run Indian equity is ~11-13%. */
export const MAX_ANNUAL_RETURN = 30;

/** Upper bound on an annual SIP step-up; most step-up mandates are 5-15%. */
export const MAX_STEP_UP_RATE = 50;

/** Upper bound on the assumed inflation used to restate a goal in future rupees. */
export const MAX_INFLATION_RATE = 20;

/** Longest horizon accepted: 50 years of instalments. */
export const MAX_MONTHS = 600;

/** Most AMCs accept a minimum monthly SIP instalment of Rs 100 (some Rs 500). */
export const COMMON_MIN_SIP = 100;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Parses a YYYY-MM-DD string into calendar parts. Returns null if unusable. */
export function parseIsoDate(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return { year, month, day };
}

/**
 * Whole calendar months from startISO to targetISO. A target day earlier in the
 * month than the start day does not yet complete that month, so it is dropped.
 */
export function monthsBetween(startISO, targetISO) {
  const start = parseIsoDate(startISO);
  const target = parseIsoDate(targetISO);
  if (!start || !target) return null;
  let months =
    (target.year - start.year) * MONTHS_PER_YEAR + (target.month - start.month);
  if (target.day < start.day) months -= 1;
  return months;
}

/**
 * Future-value factor for a step-up SIP whose first instalment is Re 1.
 * monthlyRate and stepUpRate are fractions (0.01 = 1%).
 */
export function sipFutureValueFactor({ months, monthlyRate, stepUpRate }) {
  if (!isNum(months) || months < 1) return 0;
  let factor = 0;
  for (let k = 1; k <= months; k += 1) {
    const yearIndex = Math.floor((k - 1) / MONTHS_PER_YEAR);
    const stepUp = Math.pow(1 + stepUpRate, yearIndex);
    const growth = Math.pow(1 + monthlyRate, months - k + 1);
    factor += stepUp * growth;
  }
  return factor;
}

/** Sum of all instalments actually paid, for a first instalment of Re 1. */
export function sipContributionFactor({ months, stepUpRate }) {
  if (!isNum(months) || months < 1) return 0;
  let total = 0;
  for (let k = 1; k <= months; k += 1) {
    total += Math.pow(1 + stepUpRate, Math.floor((k - 1) / MONTHS_PER_YEAR));
  }
  return total;
}

/**
 * Solves for the monthly SIP needed to hit a target by a target date.
 *
 * @param {object} input
 * @param {number} input.targetAmount   Goal value in rupees.
 * @param {string} input.startDate      YYYY-MM-DD, first instalment.
 * @param {string} input.targetDate     YYYY-MM-DD, when the money is needed.
 * @param {number} input.annualReturn   Expected return, percent per year.
 * @param {number} [input.existingCorpus] Money already invested for this goal.
 * @param {number} [input.stepUpRate]   Annual SIP increase, percent per year.
 * @param {number} [input.inflationRate] If > 0, the target is restated in future rupees.
 * @returns {object} result, or { error } for unusable input.
 */
export function computeGoalSip({
  targetAmount,
  startDate,
  targetDate,
  annualReturn,
  existingCorpus = 0,
  stepUpRate = 0,
  inflationRate = 0,
} = {}) {
  const numbers = [targetAmount, annualReturn, existingCorpus, stepUpRate, inflationRate];
  if (numbers.some((value) => !isNum(value))) {
    return { error: "Enter valid numbers in every field." };
  }
  if (targetAmount <= 0) return { error: "Target amount must be greater than zero." };
  if (existingCorpus < 0) return { error: "Existing investment cannot be negative." };
  if (annualReturn < 0 || annualReturn > MAX_ANNUAL_RETURN) {
    return { error: `Expected return should be between 0% and ${MAX_ANNUAL_RETURN}% per year.` };
  }
  if (stepUpRate < 0 || stepUpRate > MAX_STEP_UP_RATE) {
    return { error: `Annual step-up should be between 0% and ${MAX_STEP_UP_RATE}%.` };
  }
  if (inflationRate < 0 || inflationRate > MAX_INFLATION_RATE) {
    return { error: `Inflation should be between 0% and ${MAX_INFLATION_RATE}% per year.` };
  }

  const months = monthsBetween(startDate, targetDate);
  if (months === null) return { error: "Enter both dates in YYYY-MM-DD form." };
  if (months < 1) return { error: "The target date must be at least one month after the start date." };
  if (months > MAX_MONTHS) {
    return { error: `Horizon is capped at ${MAX_MONTHS / MONTHS_PER_YEAR} years.` };
  }

  const years = months / MONTHS_PER_YEAR;
  const monthlyRate = annualReturn / RATE_DIVISOR;
  const stepUp = stepUpRate / 100;

  // Restate the goal in the rupees of the target date if an inflation rate is given.
  const futureTarget = targetAmount * Math.pow(1 + inflationRate / 100, years);

  // Money already invested keeps compounding on its own until the target date.
  const existingAtMaturity = existingCorpus * Math.pow(1 + monthlyRate, months);
  const gapToFund = futureTarget - existingAtMaturity;

  const fvFactor = sipFutureValueFactor({ months, monthlyRate, stepUpRate: stepUp });
  const contribFactor = sipContributionFactor({ months, stepUpRate: stepUp });

  if (gapToFund <= 0) {
    return {
      months,
      years,
      futureTarget,
      existingAtMaturity,
      gapToFund: 0,
      monthlySip: 0,
      firstYearSip: 0,
      finalYearSip: 0,
      totalInvested: existingCorpus,
      wealthGained: existingAtMaturity - existingCorpus,
      projectedValue: existingAtMaturity,
      alreadyFunded: true,
      belowCommonMinimum: false,
      schedule: buildSchedule({ months, monthlyRate, stepUp, sip: 0, existingCorpus }),
    };
  }

  if (fvFactor <= 0) return { error: "Could not solve for an instalment with these inputs." };

  const monthlySip = gapToFund / fvFactor;
  const finalYearSip =
    monthlySip * Math.pow(1 + stepUp, Math.floor((months - 1) / MONTHS_PER_YEAR));
  const totalInvested = monthlySip * contribFactor + existingCorpus;
  const projectedValue = existingAtMaturity + monthlySip * fvFactor;

  return {
    months,
    years,
    futureTarget,
    existingAtMaturity,
    gapToFund,
    monthlySip,
    firstYearSip: monthlySip,
    finalYearSip,
    totalInvested,
    wealthGained: projectedValue - totalInvested,
    projectedValue,
    alreadyFunded: false,
    belowCommonMinimum: monthlySip < COMMON_MIN_SIP,
    schedule: buildSchedule({ months, monthlyRate, stepUp, sip: monthlySip, existingCorpus }),
  };
}

/**
 * Year-end balances, contributions and growth. The balance recursion
 * balance = (balance + instalment) * (1 + i) is the month-by-month equivalent
 * of the closed-form factor above, so the last row equals projectedValue.
 */
export function buildSchedule({ months, monthlyRate, stepUp, sip, existingCorpus }) {
  const rows = [];
  let balance = existingCorpus;
  let invested = existingCorpus;
  let yearInvested = 0;
  let yearStartBalance = balance;

  for (let k = 1; k <= months; k += 1) {
    const instalment = sip * Math.pow(1 + stepUp, Math.floor((k - 1) / MONTHS_PER_YEAR));
    balance = (balance + instalment) * (1 + monthlyRate);
    invested += instalment;
    yearInvested += instalment;

    if (k % MONTHS_PER_YEAR === 0 || k === months) {
      rows.push({
        year: Math.ceil(k / MONTHS_PER_YEAR),
        monthlyInstalment: instalment,
        invested: yearInvested,
        growth: balance - yearStartBalance - yearInvested,
        totalInvested: invested,
        balance,
      });
      yearInvested = 0;
      yearStartBalance = balance;
    }
  }

  return rows;
}
