/**
 * Variable pay / bonus tax maths for Indian salaried employees.
 *
 * Statutory basis (all figures are for FY 2025-26 / AY 2026-27):
 *  - Section 115BAC(1A) slabs as amended by the Finance Act 2025  -> NEW_REGIME_SLABS
 *  - Pre-115BAC ("old") slabs for a resident below 60 years        -> OLD_REGIME_SLABS
 *  - Section 16(ia) standard deduction: Rs 75,000 (new regime), Rs 50,000 (old regime)
 *  - Section 87A rebate: Rs 60,000 up to Rs 12,00,000 total income (new regime),
 *    Rs 12,500 up to Rs 5,00,000 total income (old regime), both with marginal relief
 *  - Surcharge on income tax with marginal relief, and
 *  - Health & Education Cess at 4% of (tax + surcharge), Section 2 of the Finance Act.
 *
 * A bonus is not taxed at a separate rate in India. It is simply added to salary
 * income, so the "tax on the bonus" is the INCREMENTAL liability:
 *      tax(salary + bonus) - tax(salary)
 * That is exactly what computeBonusTax() reports.
 */

/** Slabs are [upperLimitOfBand, rate]. Infinity closes the top band. */
export const NEW_REGIME_SLABS = [
  [400000, 0],
  [800000, 0.05],
  [1200000, 0.1],
  [1600000, 0.15],
  [2000000, 0.2],
  [2400000, 0.25],
  [Infinity, 0.3],
];

export const OLD_REGIME_SLABS = [
  [250000, 0],
  [500000, 0.05],
  [1000000, 0.2],
  [Infinity, 0.3],
];

/** Section 16(ia). */
export const STANDARD_DEDUCTION_NEW = 75000;
export const STANDARD_DEDUCTION_OLD = 50000;

/** Section 87A rebate ceilings. */
export const REBATE_87A_NEW = { incomeLimit: 1200000, maxRebate: 60000 };
export const REBATE_87A_OLD = { incomeLimit: 500000, maxRebate: 12500 };

/** Health and Education Cess, 4% of tax plus surcharge. */
export const CESS_RATE = 0.04;

/**
 * Surcharge bands keyed on TOTAL INCOME (income after deductions).
 * The 37% top band was withdrawn under Section 115BAC, so the new regime
 * is capped at 25%.
 */
export const SURCHARGE_BANDS = [
  { threshold: 5000000, rate: 0.1 },
  { threshold: 10000000, rate: 0.15 },
  { threshold: 20000000, rate: 0.25 },
  { threshold: 50000000, rate: 0.37 },
];
export const MAX_SURCHARGE_NEW_REGIME = 0.25;

/** Employer TDS on salary is spread over the remaining months of the year. */
export const MONTHS_IN_FINANCIAL_YEAR = 12;

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);

/** Progressive slab tax. Returns 0 for zero or negative income. */
export function slabTax(taxableIncome, slabs) {
  if (!isFiniteNumber(taxableIncome) || taxableIncome <= 0) return 0;
  let tax = 0;
  let lower = 0;
  for (const [upper, rate] of slabs) {
    if (taxableIncome <= lower) break;
    const band = Math.min(taxableIncome, upper) - lower;
    if (band > 0) tax += band * rate;
    lower = upper;
  }
  return tax;
}

/**
 * Section 87A rebate including marginal relief.
 * Marginal relief keeps the tax on income just above the rebate ceiling from
 * exceeding the amount by which the income crosses that ceiling.
 */
function applyRebate(totalIncome, baseTax, rebateRule) {
  if (totalIncome <= rebateRule.incomeLimit) {
    return { rebate: Math.min(baseTax, rebateRule.maxRebate), marginalRelief: 0 };
  }
  const excess = totalIncome - rebateRule.incomeLimit;
  if (baseTax > excess) {
    return { rebate: 0, marginalRelief: baseTax - excess };
  }
  return { rebate: 0, marginalRelief: 0 };
}

/**
 * Surcharge with marginal relief: (tax + surcharge) may not exceed the tax at
 * the threshold plus the income earned above that threshold.
 */
function applySurcharge(totalIncome, taxAfterRebate, slabs, capRate) {
  let band = null;
  for (const item of SURCHARGE_BANDS) {
    if (totalIncome > item.threshold) band = item;
  }
  if (!band) return { surcharge: 0, surchargeRate: 0 };

  const rate = Math.min(band.rate, capRate);
  let surcharge = taxAfterRebate * rate;

  const taxAtThreshold = slabTax(band.threshold, slabs);
  const ceiling = taxAtThreshold + (totalIncome - band.threshold);
  if (taxAfterRebate + surcharge > ceiling) {
    surcharge = Math.max(0, ceiling - taxAfterRebate);
  }
  return { surcharge, surchargeRate: rate };
}

/**
 * Full liability for a salaried individual.
 * @param {object} input
 * @param {number} input.grossSalary        Gross taxable salary for the year (incl. bonus if any).
 * @param {"new"|"old"} input.regime
 * @param {number} [input.chapterVIA]       80C/80D/NPS etc. Allowed only in the old regime.
 * @param {number} [input.otherExemptions]  HRA / LTA etc. Allowed only in the old regime.
 */
export function computeTaxLiability({
  grossSalary,
  regime = "new",
  chapterVIA = 0,
  otherExemptions = 0,
}) {
  if (!isFiniteNumber(grossSalary) || grossSalary < 0) {
    return { error: "Gross salary must be zero or a positive number." };
  }
  const isNew = regime === "new";
  const slabs = isNew ? NEW_REGIME_SLABS : OLD_REGIME_SLABS;
  const standardDeduction = isNew ? STANDARD_DEDUCTION_NEW : STANDARD_DEDUCTION_OLD;
  const deductions = isNew
    ? Math.min(standardDeduction, grossSalary)
    : Math.min(standardDeduction, grossSalary) + Math.max(0, chapterVIA) + Math.max(0, otherExemptions);

  const totalIncome = Math.max(0, grossSalary - deductions);
  const baseTax = slabTax(totalIncome, slabs);

  const { rebate, marginalRelief } = applyRebate(
    totalIncome,
    baseTax,
    isNew ? REBATE_87A_NEW : REBATE_87A_OLD,
  );
  const taxAfterRebate = Math.max(0, baseTax - rebate - marginalRelief);

  const { surcharge, surchargeRate } = applySurcharge(
    totalIncome,
    taxAfterRebate,
    slabs,
    isNew ? MAX_SURCHARGE_NEW_REGIME : 0.37,
  );

  const cess = (taxAfterRebate + surcharge) * CESS_RATE;
  const totalTax = taxAfterRebate + surcharge + cess;

  return {
    grossSalary,
    deductions,
    totalIncome,
    baseTax,
    rebate,
    marginalRelief,
    surcharge,
    surchargeRate,
    cess,
    totalTax,
  };
}

/** Highest slab rate that the given total income actually reaches. */
export function marginalSlabRate(totalIncome, slabs) {
  if (!isFiniteNumber(totalIncome) || totalIncome <= 0) return 0;
  let lower = 0;
  let rate = 0;
  for (const [upper, bandRate] of slabs) {
    if (totalIncome > lower) rate = bandRate;
    lower = upper;
  }
  return rate;
}

/**
 * Incremental tax created by a bonus / variable payout.
 *
 * @param {object} input
 * @param {number} input.fixedSalary        Annual gross taxable salary WITHOUT the bonus.
 * @param {number} input.bonus              Bonus or variable pay credited this year.
 * @param {"new"|"old"} input.regime
 * @param {number} [input.chapterVIA]       Old-regime deductions (80C, 80D, NPS...).
 * @param {number} [input.otherExemptions]  Old-regime exemptions (HRA, LTA...).
 * @param {number} [input.monthsRemaining]  Payroll months left in the year to recover the TDS.
 */
export function computeBonusTax({
  fixedSalary,
  bonus,
  regime = "new",
  chapterVIA = 0,
  otherExemptions = 0,
  monthsRemaining = 1,
}) {
  if (![fixedSalary, bonus, chapterVIA, otherExemptions, monthsRemaining].every(isFiniteNumber)) {
    return { error: "Enter valid numbers in every field." };
  }
  if (fixedSalary < 0 || bonus < 0) {
    return { error: "Salary and bonus cannot be negative." };
  }
  if (bonus <= 0) {
    return { error: "Enter a bonus or variable pay amount greater than zero." };
  }
  if (chapterVIA < 0 || otherExemptions < 0) {
    return { error: "Deductions cannot be negative." };
  }
  if (regime !== "new" && regime !== "old") {
    return { error: "Choose either the new or the old tax regime." };
  }
  if (monthsRemaining < 1 || monthsRemaining > MONTHS_IN_FINANCIAL_YEAR) {
    return { error: "Months left in the financial year must be between 1 and 12." };
  }

  const without = computeTaxLiability({ grossSalary: fixedSalary, regime, chapterVIA, otherExemptions });
  const withBonus = computeTaxLiability({
    grossSalary: fixedSalary + bonus,
    regime,
    chapterVIA,
    otherExemptions,
  });
  if (without.error) return without;
  if (withBonus.error) return withBonus;

  const taxOnBonus = Math.max(0, withBonus.totalTax - without.totalTax);
  const netBonus = bonus - taxOnBonus;
  const slabs = regime === "new" ? NEW_REGIME_SLABS : OLD_REGIME_SLABS;

  return {
    regime,
    bonus,
    fixedSalary,
    taxWithoutBonus: without.totalTax,
    taxWithBonus: withBonus.totalTax,
    taxOnBonus,
    netBonus,
    effectiveBonusRate: (taxOnBonus / bonus) * 100,
    marginalRate: marginalSlabRate(withBonus.totalIncome, slabs) * 100,
    totalIncomeWithBonus: withBonus.totalIncome,
    surchargeWithBonus: withBonus.surcharge,
    surchargeRate: withBonus.surchargeRate * 100,
    cessWithBonus: withBonus.cess,
    monthlyTdsImpact: taxOnBonus / Math.round(monthsRemaining),
    monthsRemaining: Math.round(monthsRemaining),
  };
}
