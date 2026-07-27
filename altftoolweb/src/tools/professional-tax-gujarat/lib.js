/**
 * Gujarat professional tax (PT) maths.
 *
 * Statutory basis — the Gujarat Panchayats, Municipal Corporations and State Tax
 * on Professions, Trades, Callings and Employments Act, 1976. The state
 * government's notification effective 1 April 2022 collapsed the earlier
 * four-slab table into two bands for salary and wage earners:
 *   - Monthly salary up to Rs 12,000  -> Nil
 *   - Above Rs 12,000                 -> Rs 200 a month
 * A full year on the taxable band therefore costs Rs 2,400, inside the Rs 2,500
 * annual ceiling that Article 276(2) of the Constitution imposes.
 *
 * Professional tax actually paid is deductible from salary income under
 * Section 16(iii) of the Income-tax Act, but the deduction is available only to
 * taxpayers on the old regime, not under Section 115BAC.
 */

/** `upTo` is inclusive. */
export const PT_SLABS = [
  { upTo: 12000, monthlyTax: 0, label: "Up to Rs 12,000" },
  { upTo: Infinity, monthlyTax: 200, label: "Above Rs 12,000" },
];

/** Monthly salary at or below which no PT is payable. */
export const EXEMPTION_LIMIT = 12000;

/** Flat monthly tax once the limit is crossed. */
export const MONTHLY_TAX = 200;

/** Gujarat annual maximum: 12 x Rs 200. */
export const ANNUAL_MAXIMUM = 2400;

/** Constitutional annual ceiling on professional tax, Article 276(2). */
export const ANNUAL_PT_CEILING = 2500;

/** Health and education cess loaded on income tax, 4%. */
export const CESS_RATE = 0.04;

/** Employers deposit the month's PT by the 15th of the following month. */
export const MONTHLY_DUE_DAY = 15;

/** Old-regime marginal slab rates a salaried taxpayer can sit on. */
export const MARGINAL_RATES = [0, 0.05, 0.2, 0.3];

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
 * Gujarat PT for one employee, plus the income-tax relief the payment buys
 * a taxpayer on the old regime.
 *
 * @param {object} input
 * @param {number} input.monthlySalary    Monthly salary or wage.
 * @param {number} [input.monthsEmployed] Months of employment in Gujarat this year (1-12).
 * @param {number} [input.marginalRate]   Old-regime marginal slab rate as a fraction, e.g. 0.2.
 * @param {boolean} [input.exempt]        Notified exemption (senior citizen above 65,
 *                                        40%+ disability, and other notified categories).
 */
export function computeGujaratPt({
  monthlySalary,
  monthsEmployed = 12,
  marginalRate = 0,
  exempt = false,
}) {
  if (![monthlySalary, monthsEmployed, marginalRate].every(isFiniteNumber)) {
    return { error: "Enter valid numbers in every field." };
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
  if (marginalRate < 0 || marginalRate > 0.3) {
    return { error: "Choose a marginal slab rate between 0% and 30%." };
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
      shortfallToLimit: 0,
      taxSaving: 0,
      netCost: 0,
    };
  }

  const slab = findSlab(monthlySalary);
  const monthlyTax = slab.monthlyTax;
  const annualTax = monthlyTax * months;

  // Section 16(iii): the PT paid reduces taxable salary, so the real cost is the
  // PT less the income tax (plus 4% cess) it saves on the old regime.
  const taxSaving = annualTax * marginalRate * (1 + CESS_RATE);

  return {
    monthlySalary,
    months,
    slabLabel: slab.label,
    monthlyTax,
    annualTax,
    fullYearTax: monthlyTax * 12,
    liable: monthlyTax > 0,
    exemptReason: null,
    /** How much more monthly salary would make this employee liable. */
    shortfallToLimit: monthlyTax > 0 ? 0 : EXEMPTION_LIMIT - monthlySalary + 1,
    marginalRate,
    taxSaving,
    netCost: annualTax - taxSaving,
  };
}
