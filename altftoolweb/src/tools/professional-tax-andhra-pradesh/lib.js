/**
 * Andhra Pradesh professional tax (PT) maths.
 *
 * Statutory basis — the Andhra Pradesh Tax on Professions, Trades, Callings and
 * Employments Act, 1987, Schedule Entry 1 (salary and wage earners):
 *   - Monthly salary up to Rs 15,000   -> Nil
 *   - Rs 15,001 to Rs 20,000           -> Rs 150 a month
 *   - Above Rs 20,000                  -> Rs 200 a month
 *
 * Compliance under the same Act:
 *   - An employer must apply for a certificate of REGISTRATION within 30 days of
 *     becoming liable to deduct tax.
 *   - A person carrying on a profession or trade on their own account must apply
 *     for a certificate of ENROLMENT within 30 days of becoming liable.
 *   - Tax deducted for a month is payable by the 10th of the following month.
 *
 * Article 276(2) of the Constitution caps professional tax at Rs 2,500 a year,
 * so the top salary slab of Rs 2,400 a year sits just under that ceiling.
 */

/** `upTo` is inclusive. */
export const PT_SLABS = [
  { upTo: 15000, monthlyTax: 0, label: "Up to Rs 15,000" },
  { upTo: 20000, monthlyTax: 150, label: "Rs 15,001 to Rs 20,000" },
  { upTo: Infinity, monthlyTax: 200, label: "Above Rs 20,000" },
];

/** Monthly salary at or below which no PT is payable. */
export const EXEMPTION_LIMIT = 15000;

/** Highest annual liability under the salary schedule: 12 x Rs 200. */
export const ANNUAL_MAXIMUM = 2400;

/** Constitutional annual ceiling on professional tax, Article 276(2). */
export const ANNUAL_PT_CEILING = 2500;

/** Days within which registration or enrolment must be applied for. */
export const REGISTRATION_WINDOW_DAYS = 30;

/** Employers deposit the month's deduction by the 10th of the following month. */
export const MONTHLY_DUE_DAY = 10;

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);

/** The slab a monthly salary falls into. */
export function findSlab(monthlySalary) {
  return PT_SLABS.find((slab) => monthlySalary <= slab.upTo) ?? PT_SLABS[PT_SLABS.length - 1];
}

/** Twelve monthly deductions. */
export function annualTaxFor(monthlyTax) {
  return monthlyTax * 12;
}

/**
 * AP PT for a single salaried employee.
 *
 * @param {object} input
 * @param {number} input.monthlySalary    Monthly salary or wage.
 * @param {number} [input.monthsEmployed] Months of employment in Andhra Pradesh this year (1-12).
 */
export function computeAndhraPradeshPt({ monthlySalary, monthsEmployed = 12 }) {
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
    monthlySalary,
    months,
    slabLabel: slab.label,
    monthlyTax,
    annualTax: monthlyTax * months,
    fullYearTax: annualTaxFor(monthlyTax),
    liable: monthlyTax > 0,
    /** PT paid is deductible from salary income under Section 16(iii), old regime only. */
    section16Deduction: monthlyTax * months,
  };
}

/**
 * Employer's consolidated monthly deposit from a head count per slab.
 *
 * @param {object} input
 * @param {number[]} input.bandCounts Head count for each entry of PT_SLABS, in the same order.
 */
export function computeEmployerLiability({ bandCounts }) {
  if (!Array.isArray(bandCounts) || bandCounts.length !== PT_SLABS.length) {
    return { error: `Provide a head count for each of the ${PT_SLABS.length} salary bands.` };
  }
  if (!bandCounts.every(isFiniteNumber)) {
    return { error: "Head counts must be numbers." };
  }
  if (bandCounts.some((count) => count < 0)) {
    return { error: "Head counts cannot be negative." };
  }
  if (bandCounts.some((count) => count > 1000000)) {
    return { error: "Head count per band must be 1000000 or fewer." };
  }

  const lines = PT_SLABS.map((slab, index) => {
    const headCount = Math.round(bandCounts[index]);
    return {
      label: slab.label,
      monthlyTax: slab.monthlyTax,
      headCount,
      monthlyAmount: slab.monthlyTax * headCount,
    };
  });

  const totalHeadCount = lines.reduce((sum, line) => sum + line.headCount, 0);
  if (totalHeadCount === 0) {
    return { error: "Enter at least one employee across the salary bands." };
  }

  const monthlyTotal = lines.reduce((sum, line) => sum + line.monthlyAmount, 0);

  return {
    lines,
    totalHeadCount,
    monthlyTotal,
    annualTotal: monthlyTotal * 12,
    payingHeadCount: lines.reduce(
      (sum, line) => sum + (line.monthlyTax > 0 ? line.headCount : 0),
      0,
    ),
    averagePerEmployee: monthlyTotal / totalHeadCount,
  };
}
