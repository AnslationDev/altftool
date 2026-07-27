/**
 * Simple interest against compound interest on the same principal, rate and period.
 *
 * Formulas
 *  - Simple interest:   SI = P x r x t          Amount = P (1 + r t)
 *  - Compound interest: A  = P (1 + r/m)^(m t)  CI = A - P
 *    where r is the nominal annual rate as a decimal, t the years and m the compounding
 *    periods per year.
 *  - Effective annual rate: EAR = (1 + r/m)^m - 1. This is the rate that would produce the same
 *    growth with annual compounding, and it is what makes two loans quoting the same nominal
 *    rate cost different amounts.
 *  - Doubling period. Simple interest doubles the principal when r t = 1, so t = 1/r exactly.
 *    Compound interest doubles when (1 + EAR)^t = 2, so t = ln 2 / ln(1 + EAR).
 *  - Within the first compounding period compound interest is fractionally BEHIND simple
 *    interest, because (1 + r)^t < 1 + r t for 0 < t < 1. It overtakes at t = 1 and never
 *    looks back.
 */

/** Guard rails. */
export const MAX_YEARS = 100;
export const MAX_RATE_PCT = 100;

/** Compounding frequencies offered, as compounds per year. */
export const COMPOUNDING_OPTIONS = [
  { value: 1, label: "Annually" },
  { value: 2, label: "Half-yearly" },
  { value: 4, label: "Quarterly" },
  { value: 12, label: "Monthly" },
  { value: 365, label: "Daily" },
];

function isNum(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function round2(value) {
  return Math.round(value * 100) / 100;
}

/** Simple interest amount after t years. Exported so the schedule and the totals share it. */
export function simpleAmount(principal, rate, t) {
  return principal * (1 + rate * t);
}

/** Compound amount after t years at m compounds per year. */
export function compoundAmount(principal, rate, t, compoundsPerYear) {
  return principal * Math.pow(1 + rate / compoundsPerYear, compoundsPerYear * t);
}

/**
 * Compare the two methods.
 *
 * @param {object} input
 * @param {number} input.principal        Amount invested or borrowed.
 * @param {number} input.annualRatePct    Nominal annual rate, per cent.
 * @param {number} input.years            Term in years; decimals allowed.
 * @param {number} input.compoundsPerYear Compounds per year for the compound side.
 */
export function compareInterest({
  principal = 100000,
  annualRatePct = 10,
  years = 5,
  compoundsPerYear = 1,
}) {
  if (!isNum(principal) || principal <= 0) {
    return { error: "The principal must be greater than zero." };
  }
  if (!isNum(annualRatePct) || annualRatePct < 0 || annualRatePct > MAX_RATE_PCT) {
    return { error: `The annual rate must be between 0 and ${MAX_RATE_PCT} per cent.` };
  }
  if (!isNum(years) || years <= 0 || years > MAX_YEARS) {
    return { error: `The period must be more than 0 and at most ${MAX_YEARS} years.` };
  }
  if (!isNum(compoundsPerYear) || compoundsPerYear < 1) {
    return { error: "Choose a valid compounding frequency." };
  }

  const rate = annualRatePct / 100;
  const effectiveAnnualRate = Math.pow(1 + rate / compoundsPerYear, compoundsPerYear) - 1;

  const finalSimpleAmount = simpleAmount(principal, rate, years);
  const finalCompoundAmount = compoundAmount(principal, rate, years, compoundsPerYear);
  const finalSimpleInterest = finalSimpleAmount - principal;
  const finalCompoundInterest = finalCompoundAmount - principal;
  const difference = finalCompoundAmount - finalSimpleAmount;

  // Schedule at whole years, with a final row at the exact term when it is fractional.
  const wholeYears = Math.floor(years);
  const marks = [];
  for (let year = 0; year <= wholeYears; year += 1) marks.push(year);
  if (years > wholeYears) marks.push(years);

  const schedule = marks.map((t) => {
    const simple = simpleAmount(principal, rate, t);
    const compound = compoundAmount(principal, rate, t, compoundsPerYear);
    return {
      year: round2(t),
      simpleAmount: round2(simple),
      compoundAmount: round2(compound),
      simpleInterest: round2(simple - principal),
      compoundInterest: round2(compound - principal),
      gap: round2(compound - simple),
    };
  });

  const doublingSimple = rate > 0 ? 1 / rate : null;
  const doublingCompound =
    effectiveAnnualRate > 0 ? Math.log(2) / Math.log(1 + effectiveAnnualRate) : null;

  // How many times bigger is the compound interest than the simple interest?
  const interestMultiple =
    finalSimpleInterest > 0 ? round2(finalCompoundInterest / finalSimpleInterest) : null;

  return {
    principal: round2(principal),
    nominalRatePct: round2(annualRatePct),
    effectiveAnnualRatePct: round2(effectiveAnnualRate * 100),
    years: round2(years),
    compoundsPerYear,
    simpleAmount: round2(finalSimpleAmount),
    compoundAmount: round2(finalCompoundAmount),
    simpleInterest: round2(finalSimpleInterest),
    compoundInterest: round2(finalCompoundInterest),
    difference: round2(difference),
    interestMultiple,
    // True only inside the first compounding period, where simple interest is marginally ahead.
    simpleAheadAtEnd: difference < 0,
    doublingYearsSimple: doublingSimple === null ? null : round2(doublingSimple),
    doublingYearsCompound: doublingCompound === null ? null : round2(doublingCompound),
    schedule,
  };
}
