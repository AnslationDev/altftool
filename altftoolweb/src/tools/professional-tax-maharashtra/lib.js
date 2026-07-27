/**
 * Maharashtra professional tax (PT) maths.
 *
 * Statutory basis — Maharashtra State Tax on Professions, Trades, Callings and
 * Employments Act, 1975, Schedule I Entry 1, as amended with effect from
 * 1 April 2023:
 *   - Monthly salary or wage up to Rs 7,500              -> Nil
 *   - Rs 7,501 to Rs 10,000                              -> Rs 175 a month
 *   - Above Rs 10,000                                    -> Rs 200 a month,
 *     except February where Rs 300 is deducted so the year totals Rs 2,500.
 *   - Women drawing a monthly salary up to Rs 25,000 are exempt
 *     (exemption limit raised from Rs 10,000 by the 2023 amendment).
 *
 * Article 276(2) of the Constitution caps professional tax at Rs 2,500 per
 * person per year, which is why the top slab is 11 x 200 + 300.
 */

/** Slab boundaries are on MONTHLY salary; `upTo` is inclusive. */
export const PT_SLABS = [
  { upTo: 7500, monthlyTax: 0, label: "Up to Rs 7,500" },
  { upTo: 10000, monthlyTax: 175, label: "Rs 7,501 to Rs 10,000" },
  { upTo: Infinity, monthlyTax: 200, label: "Above Rs 10,000" },
];

/** February carries the balancing deduction in the top slab. */
export const FEBRUARY_TAX_TOP_SLAB = 300;
export const TOP_SLAB_MONTHLY_TAX = 200;

/** Women drawing up to this monthly salary pay no PT (from 1 April 2023). */
export const WOMEN_EXEMPTION_LIMIT = 25000;

/** Constitutional annual ceiling on professional tax, Article 276(2). */
export const ANNUAL_PT_CEILING = 2500;

/** Employers deposit PT by the last day of the following month. */
export const MONTHLY_DUE_DAY_DESCRIPTION = "last day of the following month";

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);

/** The slab a monthly salary falls into. */
export function findSlab(monthlySalary) {
  return PT_SLABS.find((slab) => monthlySalary <= slab.upTo) ?? PT_SLABS[PT_SLABS.length - 1];
}

/** Only the top slab carries the balancing February deduction. */
export function februaryTaxFor(monthlyTax) {
  return monthlyTax === TOP_SLAB_MONTHLY_TAX ? FEBRUARY_TAX_TOP_SLAB : monthlyTax;
}

/** Eleven ordinary months plus February. */
export function annualTaxFor(monthlyTax) {
  return monthlyTax * 11 + februaryTaxFor(monthlyTax);
}

/**
 * Maharashtra PT for one employee.
 *
 * @param {object} input
 * @param {number} input.monthlySalary  Monthly salary or wage.
 * @param {"male"|"female"} [input.gender] Women below the exemption limit pay nil.
 * @param {boolean} [input.exempt]      Notified exemption (40%+ disability, parent of a child
 *                                      with disability, ex-serviceman, senior citizen above 65).
 */
export function computeMaharashtraPt({ monthlySalary, gender = "male", exempt = false }) {
  if (!isFiniteNumber(monthlySalary)) {
    return { error: "Enter a valid monthly salary." };
  }
  if (monthlySalary < 0) {
    return { error: "Monthly salary cannot be negative." };
  }
  if (monthlySalary === 0) {
    return { error: "Enter the monthly salary to calculate professional tax." };
  }
  if (gender !== "male" && gender !== "female") {
    return { error: "Select male or female to apply the correct exemption." };
  }

  if (exempt) {
    return {
      monthlySalary,
      exemptReason: "Notified exemption claimed, so no professional tax is deducted.",
      regularMonthlyTax: 0,
      februaryTax: 0,
      annualTax: 0,
      slabLabel: "Exempt",
      womenExemption: false,
      annualSalary: monthlySalary * 12,
    };
  }

  const womenExemption = gender === "female" && monthlySalary <= WOMEN_EXEMPTION_LIMIT;
  if (womenExemption) {
    return {
      monthlySalary,
      exemptReason: `Women earning up to Rs ${WOMEN_EXEMPTION_LIMIT.toLocaleString("en-IN")} a month are exempt in Maharashtra.`,
      regularMonthlyTax: 0,
      februaryTax: 0,
      annualTax: 0,
      slabLabel: "Exempt (women's limit)",
      womenExemption: true,
      annualSalary: monthlySalary * 12,
    };
  }

  const slab = findSlab(monthlySalary);
  const regularMonthlyTax = slab.monthlyTax;
  const isTopSlab = regularMonthlyTax === TOP_SLAB_MONTHLY_TAX;
  const februaryTax = februaryTaxFor(regularMonthlyTax);
  const annualTax = annualTaxFor(regularMonthlyTax);

  return {
    monthlySalary,
    annualSalary: monthlySalary * 12,
    slabLabel: slab.label,
    regularMonthlyTax,
    februaryTax,
    annualTax,
    hasFebruaryTopUp: isTopSlab,
    womenExemption: false,
    exemptReason: null,
    // PT paid is deductible from salary income under Section 16(iii) of the
    // Income-tax Act, but only for taxpayers on the old regime.
    section16Deduction: annualTax,
  };
}
