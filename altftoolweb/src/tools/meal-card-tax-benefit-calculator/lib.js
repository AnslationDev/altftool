/**
 * Food coupon / meal card perquisite exemption.
 *
 * Source of the rule: Rule 3(7)(iii) of the Income-tax Rules, 1962 read with
 * Section 17(2) of the Income-tax Act, 1961. Free food and non-alcoholic
 * beverages provided by an employer during working hours through paid,
 * non-transferable vouchers usable only at eating joints is a perquisite that
 * is exempt up to Rs 50 per meal. Anything credited above that limit is a
 * taxable perquisite added to salary income.
 *
 * All amounts are in Indian rupees. All functions here are pure.
 */

/** Rule 3(7)(iii), Income-tax Rules 1962 — exempt value per meal. */
export const EXEMPT_PER_MEAL_INR = 50;

/**
 * Employers conventionally treat one working day as two meals (a lunch plus a
 * tea/snack break), which is what produces the widely quoted Rs 100 per day
 * ceiling. The rule itself caps the value per meal, not per day.
 */
export const MEALS_PER_WORKING_DAY_DEFAULT = 2;

/** Calendar limit — no month can have more than 31 working days. */
export const MAX_WORKING_DAYS_PER_MONTH = 31;

/** Health and Education Cess on income tax — 4% (Finance Act, Section 2). */
export const HEALTH_AND_EDUCATION_CESS_PCT = 4;

/** Surcharge slabs on income tax for individuals (Finance Act, Schedule I). */
export const SURCHARGE_RATES_PCT = [0, 10, 15, 25, 37];

/**
 * Finance Act 2023: under the default regime of Section 115BAC (the "new"
 * regime), the highest 37% surcharge slab (income above Rs 5 crore) is capped
 * at 25%. The old regime still charges the full 37%.
 */
export const NEW_REGIME_MAX_SURCHARGE_PCT = 25;

/**
 * Marginal slab rates an individual can face. The Old regime (Section
 * 115BAC opt-out, with exemptions/deductions) only has 5/20/30% non-zero
 * brackets; the New regime (default Section 115BAC) has a finer 5/10/15/
 * 20/25/30% ladder. The two must stay regime-specific — offering 10/15/25%
 * under the Old regime computes tax savings against a bracket that regime
 * cannot produce.
 */
export const OLD_SLAB_RATES_PCT = [5, 20, 30];
export const NEW_SLAB_RATES_PCT = [5, 10, 15, 20, 25, 30];

export const REGIMES = [
  { id: "old", label: "Old regime (with exemptions)" },
  { id: "new", label: "New regime — Section 115BAC" },
];

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Effective marginal tax rate as a fraction, including surcharge and cess.
 * Example: 30% slab, no surcharge, 4% cess -> 0.30 * 1.00 * 1.04 = 0.312.
 *
 * The surcharge is regime-aware: under the new (115BAC) regime the highest
 * 37% surcharge slab is capped at NEW_REGIME_MAX_SURCHARGE_PCT (25%) per the
 * Finance Act 2023, so a caller passing surchargePct=37 with regime="new"
 * gets the capped 25% actually charged, not the uncapped input value.
 */
export function effectiveTaxRate({ slabRatePct, surchargePct = 0, regime = "old" }) {
  const cappedSurchargePct =
    regime === "new" ? Math.min(surchargePct, NEW_REGIME_MAX_SURCHARGE_PCT) : surchargePct;
  const slab = slabRatePct / 100;
  const surcharge = 1 + cappedSurchargePct / 100;
  const cess = 1 + HEALTH_AND_EDUCATION_CESS_PCT / 100;
  return slab * surcharge * cess;
}

/**
 * Monthly amount that can be credited to a meal card without any tax.
 * = Rs 50 x meals per working day x working days in the month.
 */
export function monthlyExemptCeiling({ workingDaysPerMonth, mealsPerWorkingDay }) {
  return EXEMPT_PER_MEAL_INR * mealsPerWorkingDay * workingDaysPerMonth;
}

/**
 * Yearly tax saved by taking part of salary as meal card credit instead of cash.
 *
 * @param {object} input
 * @param {number} input.monthlyCredit      Amount loaded on the card each month.
 * @param {number} input.workingDaysPerMonth Paid working days in a typical month.
 * @param {number} input.mealsPerWorkingDay  Meals claimed per working day.
 * @param {number} input.eligibleMonths       Months the benefit is received (1-12).
 * @param {number} input.slabRatePct          Marginal income tax slab rate, %.
 * @param {number} input.surchargePct         Surcharge rate, %.
 * @param {string} input.regime               "old" or "new".
 * @returns {object} breakdown, or { error } for invalid input.
 */
export function computeMealCardBenefit({
  monthlyCredit,
  workingDaysPerMonth,
  mealsPerWorkingDay = MEALS_PER_WORKING_DAY_DEFAULT,
  eligibleMonths = 12,
  slabRatePct,
  surchargePct = 0,
  regime = "old",
}) {
  const values = [
    monthlyCredit,
    workingDaysPerMonth,
    mealsPerWorkingDay,
    eligibleMonths,
    slabRatePct,
    surchargePct,
  ];
  if (!values.every(isFiniteNumber)) {
    return { error: "Enter valid numbers in every field." };
  }
  if (monthlyCredit < 0) {
    return { error: "The monthly meal card credit cannot be negative." };
  }
  if (workingDaysPerMonth < 0 || workingDaysPerMonth > MAX_WORKING_DAYS_PER_MONTH) {
    return { error: `Working days per month must be between 0 and ${MAX_WORKING_DAYS_PER_MONTH}.` };
  }
  if (mealsPerWorkingDay < 0 || mealsPerWorkingDay > 3) {
    return { error: "Meals per working day should be between 0 and 3." };
  }
  if (!Number.isInteger(eligibleMonths) || eligibleMonths <= 0 || eligibleMonths > 12) {
    return { error: "Eligible months must be a whole number between 1 and 12." };
  }
  if (slabRatePct < 0 || slabRatePct > 50) {
    return { error: "The slab rate should be between 0% and 50%." };
  }
  if (surchargePct < 0 || surchargePct > 40) {
    return { error: "Surcharge should be between 0% and 40%." };
  }

  // A whole number of months, so the headline annual totals below always
  // agree with buildMonthlyRows()'s one-row-per-month table: with a
  // fractional value (e.g. 6.5, which the "months" input does not itself
  // block) the two used to disagree because the totals here scaled by the
  // exact fraction while the row loop below produced Math.ceil(eligibleMonths)
  // full-credit rows.
  const months = Math.round(eligibleMonths);

  const exemptionAllowed = regime === "old";
  const monthlyCeiling = exemptionAllowed
    ? monthlyExemptCeiling({ workingDaysPerMonth, mealsPerWorkingDay })
    : 0;
  const annualCredit = monthlyCredit * months;
  const annualCeiling = exemptionAllowed ? monthlyCeiling * months : 0;

  const exemptAmount = Math.min(annualCredit, annualCeiling);
  const taxableAmount = annualCredit - exemptAmount;
  const unusedHeadroom = Math.max(0, annualCeiling - annualCredit);

  const rate = effectiveTaxRate({ slabRatePct, surchargePct, regime });
  const taxSaved = exemptAmount * rate;
  const taxOnExcess = taxableAmount * rate;

  return {
    exemptionAllowed,
    regime,
    exemptPerMeal: EXEMPT_PER_MEAL_INR,
    monthlyCeiling,
    annualCredit,
    annualCeiling,
    exemptAmount,
    taxableAmount,
    unusedHeadroom,
    effectiveTaxRatePct: rate * 100,
    taxSaved,
    taxSavedPerMonth: taxSaved / months,
    taxOnExcess,
    eligibleMonths: months,
  };
}

/**
 * Month-by-month view: how much of a month's credit is exempt and how much is
 * added back as a taxable perquisite. `monthCount` months are returned.
 */
export function buildMonthlyRows({
  monthlyCredit,
  workingDaysPerMonth,
  mealsPerWorkingDay = MEALS_PER_WORKING_DAY_DEFAULT,
  eligibleMonths = 12,
  slabRatePct,
  surchargePct = 0,
  regime = "old",
}) {
  const result = computeMealCardBenefit({
    monthlyCredit,
    workingDaysPerMonth,
    mealsPerWorkingDay,
    eligibleMonths,
    slabRatePct,
    surchargePct,
    regime,
  });
  if (result.error) return result;

  const ceiling = result.exemptionAllowed ? result.monthlyCeiling : 0;
  const exemptPerMonth = Math.min(monthlyCredit, ceiling);
  const taxablePerMonth = monthlyCredit - exemptPerMonth;
  const rate = result.effectiveTaxRatePct / 100;

  const rows = [];
  for (let index = 0; index < result.eligibleMonths; index += 1) {
    rows.push({
      month: index + 1,
      credit: monthlyCredit,
      exempt: exemptPerMonth,
      taxable: taxablePerMonth,
      taxSaved: exemptPerMonth * rate,
    });
  }
  return { ...result, rows };
}
