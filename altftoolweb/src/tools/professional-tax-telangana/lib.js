/**
 * Telangana professional tax (PT) maths.
 *
 * Statutory basis — the Telangana Tax on Professions, Trades, Callings and
 * Employments Act, 1987 (continued in Telangana on state reorganisation),
 * Schedule to the Act:
 *
 * Entry 1, salary and wage earners (deducted monthly by the employer):
 *   - Monthly salary up to Rs 15,000        -> Nil
 *   - Rs 15,001 to Rs 20,000                -> Rs 150 a month
 *   - Above Rs 20,000                       -> Rs 200 a month
 *
 * Entry 2 onwards, self-employed professionals such as legal practitioners,
 * medical practitioners, chartered accountants, engineers, architects, tax
 * consultants and management consultants, who ENROL rather than being deducted:
 *   - Standing in the profession under 5 years   -> Nil
 *   - Standing of 5 years or more                -> Rs 2,500 a year
 *
 * Article 276(2) of the Constitution caps professional tax at Rs 2,500 per
 * person per year, which is why the enrolment tax sits exactly at that figure.
 */

/** Entry 1 salary slabs. `upTo` is inclusive. */
export const PT_SLABS = [
  { upTo: 15000, monthlyTax: 0, label: "Up to Rs 15,000" },
  { upTo: 20000, monthlyTax: 150, label: "Rs 15,001 to Rs 20,000" },
  { upTo: Infinity, monthlyTax: 200, label: "Above Rs 20,000" },
];

/** Monthly salary at or below which a salaried person pays nothing. */
export const SALARY_EXEMPTION_LIMIT = 15000;

/** Entry 2 enrolment tax for self-employed professionals. */
export const ENROLMENT_TAX = 2500;
export const ENROLMENT_STANDING_YEARS = 5;

/** Constitutional annual ceiling on professional tax, Article 276(2). */
export const ANNUAL_PT_CEILING = 2500;

/** Employers deposit the month's deduction by the 10th of the following month. */
export const MONTHLY_DUE_DAY = 10;

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);

/** The salary slab a monthly salary falls into. */
export function findSlab(monthlySalary) {
  return PT_SLABS.find((slab) => monthlySalary <= slab.upTo) ?? PT_SLABS[PT_SLABS.length - 1];
}

/** Twelve monthly deductions. */
export function annualTaxFor(monthlyTax) {
  return monthlyTax * 12;
}

/**
 * Telangana PT for a salaried employee.
 *
 * @param {object} input
 * @param {number} input.monthlySalary    Monthly salary or wage.
 * @param {number} [input.monthsEmployed] Months of employment in Telangana this year (1-12).
 */
export function computeSalariedPt({ monthlySalary, monthsEmployed = 12 }) {
  if (!isFiniteNumber(monthlySalary) || !isFiniteNumber(monthsEmployed)) {
    return { error: "Enter valid numbers for salary and months employed." };
  }
  if (monthlySalary < 0) {
    return { error: "Monthly salary cannot be negative." };
  }
  if (monthlySalary === 0) {
    return { error: "Enter the monthly salary to calculate professional tax." };
  }
  if (monthsEmployed < 1 || monthsEmployed > 12) {
    return { error: "Months employed must be between 1 and 12." };
  }

  const months = Math.round(monthsEmployed);
  const slab = findSlab(monthlySalary);
  const monthlyTax = slab.monthlyTax;

  return {
    kind: "salaried",
    monthlySalary,
    months,
    slabLabel: slab.label,
    monthlyTax,
    annualTax: monthlyTax * months,
    fullYearTax: monthlyTax * 12,
    liable: monthlyTax > 0,
    /** PT paid is deductible from salary income under Section 16(iii), old regime only. */
    section16Deduction: monthlyTax * months,
  };
}

/**
 * Telangana enrolment tax for a self-employed professional.
 *
 * @param {object} input
 * @param {number} input.yearsOfStanding Completed years in the profession.
 */
export function computeSelfEmployedPt({ yearsOfStanding }) {
  if (!isFiniteNumber(yearsOfStanding)) {
    return { error: "Enter the number of years you have been in the profession." };
  }
  if (yearsOfStanding < 0) {
    return { error: "Years in the profession cannot be negative." };
  }
  if (yearsOfStanding > 80) {
    return { error: "Enter a realistic number of years in the profession (0 to 80)." };
  }

  const liable = yearsOfStanding >= ENROLMENT_STANDING_YEARS;

  return {
    kind: "selfEmployed",
    yearsOfStanding,
    liable,
    annualTax: liable ? ENROLMENT_TAX : 0,
    monthlyEquivalent: liable ? ENROLMENT_TAX / 12 : 0,
    slabLabel: liable
      ? `${ENROLMENT_STANDING_YEARS} years or more in the profession`
      : `Under ${ENROLMENT_STANDING_YEARS} years in the profession`,
    yearsToLiability: liable ? 0 : ENROLMENT_STANDING_YEARS - yearsOfStanding,
  };
}
