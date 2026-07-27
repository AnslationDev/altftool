/**
 * Karnataka professional tax (PT) maths.
 *
 * Statutory basis — Karnataka Tax on Professions, Trades, Callings and
 * Employments Act, 1976, as amended by the Karnataka Taxation Laws (Amendment)
 * Act 2023 with effect from 1 April 2023:
 *   - Monthly salary or wage LESS THAN Rs 25,000  -> Nil
 *   - Monthly salary of Rs 25,000 or more         -> Rs 200 a month
 * The amendment replaced the earlier Rs 15,000 / Rs 15,000-plus structure and
 * removed the old Rs 150 intermediate slab, so Karnataka now has just two bands
 * and a maximum of Rs 2,400 a year.
 *
 * Article 276(2) of the Constitution caps professional tax at Rs 2,500 a year,
 * so the Karnataka annual maximum of Rs 2,400 sits just under that ceiling.
 *
 * Exemptions notified under the Act include senior citizens who have attained
 * 60 years of age and persons with a permanent physical disability including
 * blindness.
 */

/** `from` is inclusive; a salary is in the band when from <= salary <= upTo. */
export const PT_SLABS = [
  { from: 0, upTo: 24999.99, monthlyTax: 0, label: "Below Rs 25,000" },
  { from: 25000, upTo: Infinity, monthlyTax: 200, label: "Rs 25,000 and above" },
];

/** Monthly salary at or above which PT becomes payable. */
export const EXEMPTION_THRESHOLD = 25000;

/** Flat monthly tax once the threshold is crossed. */
export const MONTHLY_TAX = 200;

/** Karnataka annual maximum: 12 x Rs 200. */
export const ANNUAL_MAXIMUM = 2400;

/** Constitutional annual ceiling on professional tax, Article 276(2). */
export const ANNUAL_PT_CEILING = 2500;

/** Age at which the senior-citizen exemption applies in Karnataka. */
export const SENIOR_CITIZEN_AGE = 60;

/** Employers deposit the month's PT by the 20th of the following month. */
export const MONTHLY_DUE_DAY = 20;

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);

/** The slab a monthly salary falls into. */
export function findSlab(monthlySalary) {
  return monthlySalary >= EXEMPTION_THRESHOLD ? PT_SLABS[1] : PT_SLABS[0];
}

/** Twelve monthly deductions. */
export function annualTaxFor(monthlyTax) {
  return monthlyTax * 12;
}

/**
 * Karnataka PT for one employee.
 *
 * @param {object} input
 * @param {number} input.monthlySalary   Monthly salary or wage.
 * @param {number} [input.monthsEmployed] Months of employment in Karnataka this year (1-12).
 * @param {boolean} [input.exempt]       Notified exemption (60+ senior citizen, permanent
 *                                       physical disability including blindness).
 */
export function computeKarnatakaPt({ monthlySalary, monthsEmployed = 12, exempt = false }) {
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

  if (exempt) {
    return {
      monthlySalary,
      months,
      slabLabel: "Exempt",
      monthlyTax: 0,
      annualTax: 0,
      liable: false,
      exemptReason:
        "A notified exemption applies, so no professional tax is deducted regardless of salary.",
      shortfallToThreshold: 0,
    };
  }

  const slab = findSlab(monthlySalary);
  const monthlyTax = slab.monthlyTax;
  const annualTax = monthlyTax * months;

  return {
    monthlySalary,
    months,
    slabLabel: slab.label,
    monthlyTax,
    annualTax,
    liable: monthlyTax > 0,
    exemptReason: null,
    /** How much more monthly salary would make this employee liable. */
    shortfallToThreshold: monthlyTax > 0 ? 0 : EXEMPTION_THRESHOLD - monthlySalary,
    /** PT paid is deductible from salary income under Section 16(iii), old regime only. */
    section16Deduction: annualTax,
  };
}
