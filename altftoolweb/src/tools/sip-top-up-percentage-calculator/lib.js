/**
 * Step-up (top-up) SIP maths.
 *
 * A top-up SIP is an ordinary systematic investment plan whose instalment is
 * raised by a fixed percentage once every twelve instalments. Every AMC in India
 * offers this as a "step-up" or "top-up" facility on the SIP mandate.
 *
 * Convention used here, which is the one behind the standard SIP calculators
 * published by AMFI and the fund houses:
 *   - the quoted expected return is a NOMINAL annual rate, so the periodic rate
 *     is i = annualReturn / 12 / 100;
 *   - the instalment is debited at the START of each month, i.e. the series is
 *     an annuity-due, so each instalment earns a full month of return;
 *   - the step-up is applied at the start of month 13, 25, 37 and so on.
 *
 * Nothing in this module reads the clock; the projection horizon is passed in.
 */

/** Instalments between two step-ups. The facility is annual at every AMC. */
export const STEP_UP_INTERVAL_MONTHS = 12;

/** Longest horizon the projection will run, in months (50 years). */
export const MAX_HORIZON_MONTHS = 600;

/** Ceiling on the expected return so absurd inputs cannot be projected. */
export const MAX_ANNUAL_RETURN_PERCENT = 40;

/** Ceiling on the annual top-up so the instalment cannot explode. */
export const MAX_TOP_UP_PERCENT = 100;

/** Upper sanity bound on any rupee amount accepted. */
const MAX_AMOUNT = 1e9;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Run a top-up SIP month by month.
 *
 * @param {number} monthlySip first-year instalment in rupees
 * @param {number} monthlyRate periodic return as a decimal (0.01 for 1% a month)
 * @param {number} months number of instalments
 * @param {number} topUpFactor multiplier applied every 12 months (1.1 for 10%)
 * @returns {{ balance: number, invested: number, yearly: Array }}
 */
function runSip(monthlySip, monthlyRate, months, topUpFactor) {
  let balance = 0;
  let invested = 0;
  let instalment = monthlySip;
  const yearly = [];
  let yearInvested = 0;
  let yearOpening = 0;

  for (let month = 1; month <= months; month += 1) {
    if (month > 1 && (month - 1) % STEP_UP_INTERVAL_MONTHS === 0) {
      instalment *= topUpFactor;
    }
    balance = (balance + instalment) * (1 + monthlyRate);
    invested += instalment;
    yearInvested += instalment;

    if (month % STEP_UP_INTERVAL_MONTHS === 0 || month === months) {
      yearly.push({
        year: Math.ceil(month / STEP_UP_INTERVAL_MONTHS),
        monthlySip: instalment,
        invested: yearInvested,
        totalInvested: invested,
        opening: yearOpening,
        gain: balance - yearOpening - yearInvested,
        closing: balance,
      });
      yearOpening = balance;
      yearInvested = 0;
    }
  }

  return { balance, invested, yearly };
}

/**
 * Months needed for a top-up SIP to reach a target corpus.
 *
 * @returns {number|null} instalment count, or null if not reached within
 *   MAX_HORIZON_MONTHS
 */
export function monthsToTarget(monthlySip, monthlyRate, topUpFactor, targetCorpus) {
  if (!(monthlySip > 0) || !(targetCorpus > 0)) return null;
  let balance = 0;
  let instalment = monthlySip;
  for (let month = 1; month <= MAX_HORIZON_MONTHS; month += 1) {
    if (month > 1 && (month - 1) % STEP_UP_INTERVAL_MONTHS === 0) {
      instalment *= topUpFactor;
    }
    balance = (balance + instalment) * (1 + monthlyRate);
    if (balance >= targetCorpus) return month;
  }
  return null;
}

/**
 * Full top-up SIP projection, with the flat SIP as the comparison baseline.
 *
 * @param {object} input
 * @param {number} input.monthlySip first-year monthly instalment, rupees
 * @param {number} input.annualReturnPercent expected nominal return, % a year
 * @param {number} input.years investment horizon in years
 * @param {number} input.annualTopUpPercent yearly increase in the instalment, %
 * @param {number} [input.targetCorpus] optional goal amount in rupees
 * @returns {object} projection, or { error } when the input is unusable
 */
export function computeTopUpSip({
  monthlySip,
  annualReturnPercent,
  years,
  annualTopUpPercent,
  targetCorpus = 0,
} = {}) {
  const numbers = [monthlySip, annualReturnPercent, years, annualTopUpPercent, targetCorpus];
  if (!numbers.every(isNum)) {
    return { error: "Enter a valid number in every field." };
  }
  if (monthlySip <= 0) {
    return { error: "Enter a monthly SIP amount greater than zero." };
  }
  if (monthlySip > MAX_AMOUNT || targetCorpus > MAX_AMOUNT * 100) {
    return { error: "Enter smaller amounts — this projection is capped at Rs 100 crore a month." };
  }
  if (annualReturnPercent < 0 || annualReturnPercent > MAX_ANNUAL_RETURN_PERCENT) {
    return { error: `Expected return should be between 0% and ${MAX_ANNUAL_RETURN_PERCENT}% a year.` };
  }
  if (annualTopUpPercent < 0 || annualTopUpPercent > MAX_TOP_UP_PERCENT) {
    return { error: `Annual top-up should be between 0% and ${MAX_TOP_UP_PERCENT}%.` };
  }
  if (targetCorpus < 0) {
    return { error: "The goal amount cannot be negative." };
  }
  if (years <= 0 || years * STEP_UP_INTERVAL_MONTHS > MAX_HORIZON_MONTHS) {
    return { error: "Investment period should be between 1 month and 50 years." };
  }

  const months = Math.max(1, Math.round(years * STEP_UP_INTERVAL_MONTHS));
  const monthlyRate = annualReturnPercent / 12 / 100;
  const topUpFactor = 1 + annualTopUpPercent / 100;

  const stepUp = runSip(monthlySip, monthlyRate, months, topUpFactor);
  const flat = runSip(monthlySip, monthlyRate, months, 1);

  const finalInstalment = stepUp.yearly.length
    ? stepUp.yearly[stepUp.yearly.length - 1].monthlySip
    : monthlySip;

  const goalMonthsStepUp = targetCorpus > 0
    ? monthsToTarget(monthlySip, monthlyRate, topUpFactor, targetCorpus)
    : null;
  const goalMonthsFlat = targetCorpus > 0
    ? monthsToTarget(monthlySip, monthlyRate, 1, targetCorpus)
    : null;

  return {
    months,
    years: months / STEP_UP_INTERVAL_MONTHS,
    monthlySip,
    annualReturnPercent,
    annualTopUpPercent,
    monthlyRate,
    finalInstalment,
    stepUpCorpus: stepUp.balance,
    stepUpInvested: stepUp.invested,
    stepUpGain: stepUp.balance - stepUp.invested,
    flatCorpus: flat.balance,
    flatInvested: flat.invested,
    flatGain: flat.balance - flat.invested,
    extraCorpus: stepUp.balance - flat.balance,
    extraInvested: stepUp.invested - flat.invested,
    /** Rupees of extra corpus per rupee of extra money invested. */
    corpusPerExtraRupee:
      stepUp.invested - flat.invested > 0
        ? (stepUp.balance - flat.balance) / (stepUp.invested - flat.invested)
        : 0,
    corpusUpliftPercent: flat.balance > 0 ? ((stepUp.balance - flat.balance) / flat.balance) * 100 : 0,
    targetCorpus,
    goalMonthsStepUp,
    goalMonthsFlat,
    goalMonthsSaved:
      goalMonthsStepUp !== null && goalMonthsFlat !== null ? goalMonthsFlat - goalMonthsStepUp : null,
    yearly: stepUp.yearly,
  };
}

/**
 * Format a month count as "8 yr 4 mo" style parts.
 * @param {number} totalMonths
 */
export function splitMonths(totalMonths) {
  if (!isNum(totalMonths) || totalMonths < 0) return { years: 0, months: 0 };
  const whole = Math.round(totalMonths);
  return { years: Math.floor(whole / 12), months: whole % 12 };
}
