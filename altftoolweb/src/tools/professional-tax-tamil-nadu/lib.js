/**
 * Tamil Nadu professional tax (PT) maths.
 *
 * Statutory basis — the Tamil Nadu Municipal Laws (Second Amendment) Act 1998
 * and the Tamil Nadu Professional Tax Rules 1999. Unlike most states, Tamil Nadu
 * levies professional tax through the LOCAL BODY (corporation, municipality or
 * town panchayat) and charges it on HALF-YEARLY income, not monthly salary.
 *
 * Slabs below are the Greater Chennai Corporation schedule, which the other
 * corporations and municipalities in the state broadly mirror:
 *   - Half-yearly income up to Rs 21,000       -> Nil
 *   - Rs 21,001 to Rs 30,000                   -> Rs 135
 *   - Rs 30,001 to Rs 45,000                   -> Rs 315
 *   - Rs 45,001 to Rs 60,000                   -> Rs 690
 *   - Rs 60,001 to Rs 75,000                   -> Rs 1,025
 *   - Above Rs 75,000                          -> Rs 1,250
 *
 * Two half-years run 1 April to 30 September and 1 October to 31 March, so the
 * top band totals Rs 2,500 a year — exactly the ceiling that Article 276(2) of
 * the Constitution places on professional tax.
 */

/** `upTo` is inclusive; the amount is charged for the whole half-year. */
export const PT_SLABS = [
  { upTo: 21000, halfYearlyTax: 0, label: "Up to Rs 21,000" },
  { upTo: 30000, halfYearlyTax: 135, label: "Rs 21,001 to Rs 30,000" },
  { upTo: 45000, halfYearlyTax: 315, label: "Rs 30,001 to Rs 45,000" },
  { upTo: 60000, halfYearlyTax: 690, label: "Rs 45,001 to Rs 60,000" },
  { upTo: 75000, halfYearlyTax: 1025, label: "Rs 60,001 to Rs 75,000" },
  { upTo: Infinity, halfYearlyTax: 1250, label: "Above Rs 75,000" },
];

/** Months in one Tamil Nadu half-year. */
export const MONTHS_IN_HALF_YEAR = 6;

/** Half-yearly income at or below which no PT is payable. */
export const EXEMPTION_LIMIT_HALF_YEARLY = 21000;

/** Two half-years of Rs 1,250 = the Rs 2,500 constitutional ceiling. */
export const ANNUAL_MAXIMUM = 2500;

/** The two half-yearly assessment periods. */
export const HALF_YEARS = [
  { key: "first", label: "1 April to 30 September", payBy: "30 September" },
  { key: "second", label: "1 October to 31 March", payBy: "31 March" },
];

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);

/** The slab a half-yearly income falls into. */
export function findSlab(halfYearlyIncome) {
  return PT_SLABS.find((slab) => halfYearlyIncome <= slab.upTo) ?? PT_SLABS[PT_SLABS.length - 1];
}

/** Two half-yearly charges make the year. */
export function annualTaxFor(halfYearlyTax) {
  return halfYearlyTax * 2;
}

/**
 * Tamil Nadu PT for one employee.
 *
 * @param {object} input
 * @param {number} input.income         Either a monthly salary or a half-yearly income.
 * @param {"monthly"|"halfYearly"} [input.basis] How to read `income`. Default "monthly".
 */
export function computeTamilNaduPt({ income, basis = "monthly" }) {
  if (!isFiniteNumber(income)) {
    return { error: "Enter a valid income figure." };
  }
  if (income < 0) {
    return { error: "Income cannot be negative." };
  }
  if (income === 0) {
    return { error: "Enter the salary to calculate professional tax." };
  }
  if (basis !== "monthly" && basis !== "halfYearly") {
    return { error: "Choose whether the figure entered is monthly or half-yearly." };
  }

  const halfYearlyIncome = basis === "monthly" ? income * MONTHS_IN_HALF_YEAR : income;
  const monthlySalary = basis === "monthly" ? income : income / MONTHS_IN_HALF_YEAR;

  const slab = findSlab(halfYearlyIncome);
  const halfYearlyTax = slab.halfYearlyTax;

  return {
    basis,
    monthlySalary,
    halfYearlyIncome,
    slabLabel: slab.label,
    halfYearlyTax,
    annualTax: halfYearlyTax * 2,
    /** What the deduction works out to per month if payroll spreads it. */
    effectiveMonthly: halfYearlyTax / MONTHS_IN_HALF_YEAR,
    liable: halfYearlyTax > 0,
    /** Extra half-yearly income needed to reach the next band, or null at the top. */
    toNextSlab: slab.upTo === Infinity ? null : slab.upTo - halfYearlyIncome + 1,
    /** PT paid is deductible from salary income under Section 16(iii), old regime only. */
    section16Deduction: halfYearlyTax * 2,
  };
}
