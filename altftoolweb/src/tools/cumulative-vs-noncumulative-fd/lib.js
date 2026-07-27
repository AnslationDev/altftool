/**
 * Cumulative (reinvestment) fixed deposit versus a non-cumulative deposit that
 * pays interest out monthly, quarterly, half-yearly or annually.
 *
 * Method and conventions:
 *  - Indian banks accrue term deposit interest QUARTERLY at the contracted rate.
 *    A cumulative deposit leaves that interest in the deposit, so it matures at
 *    P x (1 + r/4)^(4n).
 *  - A non-cumulative deposit pays the accrued interest out. Because the payout
 *    happens before the quarter ends, banks pay a DISCOUNTED amount for periods
 *    shorter than a quarter: the payout for a period covering (4/f) quarters is
 *    P x ((1 + r/4)^(4/f) - 1), where f is the number of payouts a year. For
 *    quarterly payouts (f = 4) that is exactly P x r/4; for monthly payouts it is
 *    slightly less than P x r/12, which is why a monthly-income deposit shows a
 *    lower headline monthly figure than simple division suggests.
 *  - The principal comes back unchanged at maturity on a non-cumulative deposit.
 *  - Interest on both is taxable. Section 194A TDS applies to the interest
 *    credited in a financial year, at 10% (20% without PAN) once the year's
 *    interest exceeds ₹50,000, or ₹1,00,000 for a resident senior citizen, under
 *    the thresholds raised by the Finance Act, 2025.
 */

/** Banks compound and accrue term-deposit interest four times a year. */
export const COMPOUNDS_PER_YEAR = 4;

/** Payout frequencies a non-cumulative deposit can use. */
export const PAYOUT_FREQUENCIES = [
  { value: 12, label: "Monthly" },
  { value: 4, label: "Quarterly" },
  { value: 2, label: "Half-yearly" },
  { value: 1, label: "Annually" },
];

/** Section 194A thresholds for FY 2025-26 (₹). */
export const TDS_THRESHOLD = 50000;
export const TDS_THRESHOLD_SENIOR = 100000;

/** Section 194A / 206AA deduction rates (%). */
export const TDS_RATE = 10;
export const TDS_RATE_NO_PAN = 20;

/** Search bounds used when solving for the break-even reinvestment rate (%). */
export const BREAKEVEN_RATE_MAX = 30;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Value of one rupee after `years` years at `annualRate` compounded quarterly. */
export function cumulativeFactor(annualRate, years) {
  if (!isNum(annualRate) || annualRate <= 0 || !isNum(years) || years <= 0) return 1;
  return Math.pow(1 + annualRate / 100 / COMPOUNDS_PER_YEAR, COMPOUNDS_PER_YEAR * years);
}

/**
 * Interest paid out once, for a period of (4/frequency) quarters.
 *
 * @param {number} principal
 * @param {number} annualRate
 * @param {number} frequency payouts a year (12, 4, 2 or 1)
 */
export function payoutPerPeriod(principal, annualRate, frequency) {
  if (!isNum(principal) || principal <= 0) return 0;
  if (!isNum(annualRate) || annualRate <= 0) return 0;
  if (!isNum(frequency) || frequency <= 0) return 0;
  const quarters = COMPOUNDS_PER_YEAR / frequency;
  return principal * (Math.pow(1 + annualRate / 100 / COMPOUNDS_PER_YEAR, quarters) - 1);
}

/**
 * Future value of a stream of equal payouts reinvested at `reinvestRate`,
 * compounded at the payout frequency.
 */
export function reinvestedValue(payout, reinvestRate, frequency, years) {
  if (!isNum(payout) || payout <= 0) return 0;
  const periods = Math.round(frequency * years);
  if (!Number.isFinite(periods) || periods <= 0) return 0;
  const j = isNum(reinvestRate) && reinvestRate > 0 ? reinvestRate / 100 / frequency : 0;
  if (j === 0) return payout * periods;
  return (payout * (Math.pow(1 + j, periods) - 1)) / j;
}

/**
 * Reinvestment rate at which the payout stream matches the cumulative deposit.
 * Solved by bisection because the future-value function is monotonic in the rate.
 *
 * @returns {number|null} the annual nominal rate, or null if unreachable
 */
export function breakEvenReinvestRate({ payout, target, frequency, years } = {}) {
  if (!isNum(payout) || payout <= 0 || !isNum(target) || target <= 0) return null;
  const atZero = reinvestedValue(payout, 0, frequency, years);
  if (atZero >= target) return 0;
  if (reinvestedValue(payout, BREAKEVEN_RATE_MAX, frequency, years) < target) return null;
  let low = 0;
  let high = BREAKEVEN_RATE_MAX;
  for (let i = 0; i < 80; i += 1) {
    const mid = (low + high) / 2;
    if (reinvestedValue(payout, mid, frequency, years) < target) low = mid;
    else high = mid;
  }
  return (low + high) / 2;
}

/**
 * TDS on one financial year's interest.
 */
export function tdsOnInterest(
  interest,
  { isSenior = false, panFurnished = true, formFiled = false } = {},
) {
  const threshold = isSenior ? TDS_THRESHOLD_SENIOR : TDS_THRESHOLD;
  if (!isNum(interest) || interest <= 0 || formFiled) {
    return { rate: 0, tds: 0, threshold, deducted: false };
  }
  if (interest <= threshold) return { rate: 0, tds: 0, threshold, deducted: false };
  const rate = panFurnished ? TDS_RATE : TDS_RATE_NO_PAN;
  return { rate, tds: (interest * rate) / 100, threshold, deducted: true };
}

/**
 * Compare the two deposit structures on the same principal, rate and tenure.
 *
 * @param {object} input
 * @param {number} input.principal
 * @param {number} input.annualRate
 * @param {number} input.years
 * @param {number} [input.frequency] payouts a year on the non-cumulative option
 * @param {number} [input.reinvestRate] rate at which payouts are reinvested
 * @param {number} [input.taxSlabPercent]
 * @param {boolean} [input.isSenior]
 * @param {boolean} [input.panFurnished]
 * @param {boolean} [input.formFiled]
 * @returns {object} result, or { error }
 */
export function compareFdStructures({
  principal,
  annualRate,
  years,
  frequency = 12,
  reinvestRate = 0,
  taxSlabPercent = 0,
  isSenior = false,
  panFurnished = true,
  formFiled = false,
} = {}) {
  if (!isNum(principal) || principal <= 0) {
    return { error: "Enter a deposit amount greater than zero." };
  }
  if (principal > 1e11) return { error: "Enter a deposit below ₹10,000 crore." };
  if (!isNum(annualRate) || annualRate <= 0) {
    return { error: "Enter an interest rate greater than zero." };
  }
  if (annualRate > 25) return { error: "Enter an interest rate of 25% or less." };
  if (!isNum(years) || years <= 0) return { error: "Enter a tenure greater than zero." };
  if (years > 10) return { error: "Banks accept term deposits of up to 10 years." };
  if (!PAYOUT_FREQUENCIES.some((item) => item.value === frequency)) {
    return { error: "Choose a monthly, quarterly, half-yearly or annual payout." };
  }
  if (!isNum(reinvestRate) || reinvestRate < 0 || reinvestRate > 25) {
    return { error: "Enter a reinvestment rate between 0% and 25%." };
  }
  const periods = frequency * years;
  if (Math.abs(periods - Math.round(periods)) > 1e-9) {
    return {
      error: "That tenure does not divide into whole payout periods — adjust the tenure or frequency.",
    };
  }
  const slab = isNum(taxSlabPercent) && taxSlabPercent >= 0 ? Math.min(taxSlabPercent, 50) : 0;

  const cumulativeMaturity = principal * cumulativeFactor(annualRate, years);
  const cumulativeInterest = cumulativeMaturity - principal;

  const payout = payoutPerPeriod(principal, annualRate, frequency);
  const annualIncome = payout * frequency;
  const totalPayouts = payout * Math.round(periods);
  const nonCumulativeTotal = principal + totalPayouts;

  const reinvested = reinvestedValue(payout, reinvestRate, frequency, years);
  const nonCumulativeWithReinvestment = principal + reinvested;

  const compoundingAdvantage = cumulativeInterest - totalPayouts;
  const advantageAfterReinvestment = cumulativeInterest - reinvested;

  const breakEven = breakEvenReinvestRate({
    payout,
    target: cumulativeInterest,
    frequency,
    years,
  });

  // TDS is tested on the interest credited in each financial year. On a
  // cumulative deposit that is the growth in balance; on a non-cumulative
  // deposit it is the payouts received in the year.
  const cumulativeYearInterest = [];
  for (let year = 1; year <= Math.ceil(years); year += 1) {
    const span = Math.min(1, years - (year - 1));
    const opening = principal * cumulativeFactor(annualRate, year - 1);
    const closing = principal * cumulativeFactor(annualRate, year - 1 + span);
    cumulativeYearInterest.push(closing - opening);
  }
  const cumulativeTds = cumulativeYearInterest.reduce(
    (sum, interest) => sum + tdsOnInterest(interest, { isSenior, panFurnished, formFiled }).tds,
    0,
  );
  const nonCumulativeTds = cumulativeYearInterest.reduce((sum, _value, index) => {
    const span = Math.min(1, years - index);
    const yearInterest = annualIncome * span;
    return sum + tdsOnInterest(yearInterest, { isSenior, panFurnished, formFiled }).tds;
  }, 0);

  const cumulativeTax = (cumulativeInterest * slab) / 100;
  const nonCumulativeTax = (totalPayouts * slab) / 100;

  return {
    principal,
    annualRate,
    years,
    frequency,
    frequencyLabel:
      PAYOUT_FREQUENCIES.find((item) => item.value === frequency)?.label ?? "Monthly",
    periods: Math.round(periods),
    cumulativeMaturity,
    cumulativeInterest,
    payout,
    annualIncome,
    totalPayouts,
    nonCumulativeTotal,
    reinvestRate,
    reinvested,
    nonCumulativeWithReinvestment,
    compoundingAdvantage,
    advantageAfterReinvestment,
    breakEvenReinvestRate: breakEven,
    effectiveAnnualYield:
      (Math.pow(1 + annualRate / 100 / COMPOUNDS_PER_YEAR, COMPOUNDS_PER_YEAR) - 1) * 100,
    simpleMonthlyGuess: (principal * annualRate) / 100 / 12,
    cumulativeTds,
    nonCumulativeTds,
    cumulativeTax,
    nonCumulativeTax,
    cumulativePostTax: cumulativeMaturity - cumulativeTax,
    nonCumulativePostTax: nonCumulativeTotal - nonCumulativeTax,
    taxSlabPercent: slab,
    tdsThreshold: isSenior ? TDS_THRESHOLD_SENIOR : TDS_THRESHOLD,
    betterForGrowth:
      nonCumulativeWithReinvestment > cumulativeMaturity ? "non-cumulative" : "cumulative",
  };
}
