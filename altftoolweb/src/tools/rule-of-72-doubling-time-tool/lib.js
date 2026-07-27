/**
 * Rule of 72 and exact doubling-time maths.
 *
 * The Rule of 72 is a mental-arithmetic shortcut: at a compound growth rate of
 * r percent per period, a quantity roughly doubles in 72 / r periods. It works
 * because the exact answer, ln(2) / ln(1 + r/100), is close to 69.31 / r for
 * small r, and 72 has many small divisors (2, 3, 4, 6, 8, 9, 12) which makes it
 * easier to divide in your head. 72 also happens to track the exact curve best
 * around 8 percent, the classic long-run equity assumption.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** Rule numerators. Each is "numerator / rate = periods to reach the multiple". */
// 100 * ln(2) = 69.3147 -> the exact numerator under CONTINUOUS compounding.
export const RULE_69_3 = 69.3;
// Rule of 70: the demographers' and economists' variant, easy to divide by 7.
export const RULE_70 = 70;
// Rule of 72: the classic shortcut; most accurate near 8% annual growth.
export const RULE_72 = 72;
// Rule of 114 approximates tripling (100 * ln(3) = 109.86, rounded up so that
// the shortcut stays accurate over the 6-10% band rather than at r -> 0).
export const RULE_114 = 114;
// Rule of 144 approximates quadrupling: two doublings, i.e. 2 x 72.
export const RULE_144 = 144;

/** Eckart-McHale second-order rule: (69.3 / r) x (200 / (200 - r)). */
export const EM_NUMERATOR = 69.3;
export const EM_SCALE = 200;

/** Practical input bounds. Outside these the shortcut is meaningless. */
export const MIN_RATE = 0.01;
export const MAX_RATE = 100;
export const MAX_COMPOUNDS_PER_YEAR = 365;

/** Compounding frequencies offered by the UI, in periods per year. */
export const COMPOUNDING_OPTIONS = [
  { value: 1, label: "Annually" },
  { value: 2, label: "Half-yearly" },
  { value: 4, label: "Quarterly" },
  { value: 12, label: "Monthly" },
  { value: 365, label: "Daily" },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Exact time (in years) for a quantity to reach `multiple` times its value.
 *
 *   periodic rate  i = rate / 100 / m
 *   periods        n = ln(multiple) / ln(1 + i)
 *   years          t = n / m
 *
 * With continuous compounding the limit is t = ln(multiple) / (rate / 100).
 */
export function exactTimeToMultiple(ratePercent, multiple, compoundsPerYear, continuous = false) {
  if (!isNum(ratePercent) || ratePercent <= 0) return null;
  if (!isNum(multiple) || multiple <= 1) return null;
  if (continuous) return Math.log(multiple) / (ratePercent / 100);
  if (!isNum(compoundsPerYear) || compoundsPerYear <= 0) return null;
  const i = ratePercent / 100 / compoundsPerYear;
  const growth = Math.log(1 + i);
  if (!(growth > 0)) return null;
  return Math.log(multiple) / growth / compoundsPerYear;
}

/** Convert a fractional number of years into whole years + whole months. */
export function splitYears(years) {
  if (!isNum(years) || years < 0) return { years: 0, months: 0 };
  const whole = Math.floor(years);
  let months = Math.round((years - whole) * 12);
  if (months === 12) return { years: whole + 1, months: 0 };
  return { years: whole, months };
}

/** Human label such as "9 years 1 month". */
export function formatDuration(years) {
  if (!isNum(years) || years < 0) return "—";
  const parts = splitYears(years);
  const y = parts.years === 1 ? "1 year" : `${parts.years} years`;
  if (parts.months === 0) return y;
  const m = parts.months === 1 ? "1 month" : `${parts.months} months`;
  return `${y} ${m}`;
}

/**
 * Main calculation.
 *
 * @param {object} input
 * @param {number} input.ratePercent      nominal growth / return, percent per year
 * @param {number} [input.compoundsPerYear] compounding periods per year (default 1)
 * @param {boolean} [input.continuous]     use continuous compounding instead
 * @param {number} [input.principal]       starting amount, for the milestone table
 * @param {number} [input.inflationPercent] annual inflation, for the real-return line
 * @returns {object} result, or { error } when the input cannot produce a number
 */
export function computeDoublingTime({
  ratePercent,
  compoundsPerYear = 1,
  continuous = false,
  principal = 0,
  inflationPercent = 0,
} = {}) {
  if (!isNum(ratePercent)) return { error: "Enter a growth rate as a number." };
  if (ratePercent <= 0) {
    return { error: "The rate of return must be above 0% — money never doubles at 0% or a loss." };
  }
  if (ratePercent < MIN_RATE) {
    return { error: `Use a rate of at least ${MIN_RATE}% per year.` };
  }
  if (ratePercent > MAX_RATE) {
    return { error: `Enter a rate of ${MAX_RATE}% per year or less.` };
  }
  if (!continuous) {
    if (!isNum(compoundsPerYear) || compoundsPerYear <= 0) {
      return { error: "Choose a valid compounding frequency." };
    }
    if (compoundsPerYear > MAX_COMPOUNDS_PER_YEAR) {
      return { error: `Compounding cannot happen more than ${MAX_COMPOUNDS_PER_YEAR} times a year.` };
    }
  }
  if (!isNum(principal) || principal < 0) {
    return { error: "The starting amount cannot be negative." };
  }
  if (!isNum(inflationPercent) || inflationPercent < 0 || inflationPercent > MAX_RATE) {
    return { error: `Inflation must be between 0% and ${MAX_RATE}%.` };
  }

  const rule72Years = RULE_72 / ratePercent;
  const rule70Years = RULE_70 / ratePercent;
  const rule693Years = RULE_69_3 / ratePercent;
  const rule114Years = RULE_114 / ratePercent;
  const rule144Years = RULE_144 / ratePercent;

  // Eckart-McHale: stays within ~0.05% of exact over 0-20%.
  const emYears =
    ratePercent < EM_SCALE
      ? (EM_NUMERATOR / ratePercent) * (EM_SCALE / (EM_SCALE - ratePercent))
      : null;

  const exactDouble = exactTimeToMultiple(ratePercent, 2, compoundsPerYear, continuous);
  const exactTriple = exactTimeToMultiple(ratePercent, 3, compoundsPerYear, continuous);
  const exactQuadruple = exactTimeToMultiple(ratePercent, 4, compoundsPerYear, continuous);
  const exactTenfold = exactTimeToMultiple(ratePercent, 10, compoundsPerYear, continuous);

  if (!isNum(exactDouble) || exactDouble <= 0) {
    return { error: "That combination of rate and compounding has no doubling time." };
  }

  const errorYears = rule72Years - exactDouble;
  const errorPercent = (errorYears / exactDouble) * 100;

  // Real (inflation-adjusted) return: Fisher equation, (1+nominal)/(1+inflation) - 1.
  const realRate = ((1 + ratePercent / 100) / (1 + inflationPercent / 100) - 1) * 100;
  const realDouble =
    realRate > 0 ? exactTimeToMultiple(realRate, 2, compoundsPerYear, continuous) : null;
  const realRule72 = realRate > 0 ? RULE_72 / realRate : null;

  // Milestone table: 2x, 4x, 8x, 16x, 32x (successive doublings).
  const milestones = [2, 4, 8, 16, 32].map((multiple) => {
    const t = exactTimeToMultiple(ratePercent, multiple, compoundsPerYear, continuous);
    return {
      multiple,
      years: t,
      shortcutYears: (RULE_72 * Math.log2(multiple)) / ratePercent,
      value: principal > 0 ? principal * multiple : null,
    };
  });

  return {
    ratePercent,
    compoundsPerYear: continuous ? null : compoundsPerYear,
    continuous,
    rule72Years,
    rule70Years,
    rule693Years,
    rule114Years,
    rule144Years,
    emYears,
    exactDouble,
    exactTriple,
    exactQuadruple,
    exactTenfold,
    errorYears,
    errorPercent,
    realRate,
    realDouble,
    realRule72,
    milestones,
    principal,
    doubledValue: principal > 0 ? principal * 2 : null,
  };
}

/**
 * Inverse question: what compound rate doubles money in `years` years?
 * From 2 = (1 + r)^t  ->  r = 2^(1/t) - 1 (annual compounding).
 * The Rule-of-72 shortcut answer is simply 72 / years.
 */
export function rateToDoubleIn(years) {
  if (!isNum(years) || years <= 0) {
    return { error: "Enter a target number of years greater than zero." };
  }
  if (years > 500) return { error: "Enter a horizon of 500 years or less." };
  const exactRate = (Math.pow(2, 1 / years) - 1) * 100;
  return {
    years,
    exactRate,
    shortcutRate: RULE_72 / years,
  };
}
