/**
 * West Bengal professional tax (PT) maths.
 *
 * Statutory basis — West Bengal State Tax on Professions, Trades, Callings and
 * Employments Act, 1979, Schedule Entry 1 (salary and wage earners), as amended
 * with effect from 1 April 2023 when the exemption limit was raised to
 * Rs 10,000 a month:
 *   - Up to Rs 10,000            -> Nil
 *   - Rs 10,001 to Rs 15,000     -> Rs 110 a month
 *   - Rs 15,001 to Rs 25,000     -> Rs 130 a month
 *   - Rs 25,001 to Rs 40,000     -> Rs 150 a month
 *   - Above Rs 40,000            -> Rs 200 a month
 *
 * The top slab totals Rs 2,400 a year, inside the Rs 2,500 annual ceiling that
 * Article 276(2) of the Constitution places on professional tax.
 *
 * Deposit: the employer deducts the tax from each month's salary and pays it to
 * the state within 21 days of the end of that month.
 */

/** `upTo` is inclusive and slabs are ordered from lowest to highest. */
export const PT_SLABS = [
  { upTo: 10000, monthlyTax: 0, label: "Up to Rs 10,000" },
  { upTo: 15000, monthlyTax: 110, label: "Rs 10,001 to Rs 15,000" },
  { upTo: 25000, monthlyTax: 130, label: "Rs 15,001 to Rs 25,000" },
  { upTo: 40000, monthlyTax: 150, label: "Rs 25,001 to Rs 40,000" },
  { upTo: Infinity, monthlyTax: 200, label: "Above Rs 40,000" },
];

/** Monthly salary at or below which no PT is payable. */
export const EXEMPTION_LIMIT = 10000;

/** Highest annual liability under the West Bengal schedule: 12 x Rs 200. */
export const ANNUAL_MAXIMUM = 2400;

/** Constitutional annual ceiling on professional tax, Article 276(2). */
export const ANNUAL_PT_CEILING = 2500;

/** The employer must deposit a month's PT within 21 days of that month ending. */
export const DEPOSIT_DAYS_AFTER_MONTH_END = 21;

/** The Indian financial year runs April to March. */
export const FY_MONTHS = [
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
  "January",
  "February",
  "March",
];

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
 * West Bengal PT for one employee, plus the employer's total when several
 * employees share the same salary band.
 *
 * @param {object} input
 * @param {number} input.monthlySalary  Monthly gross salary or wage.
 * @param {number} [input.employees]    Head count on that salary (default 1).
 */
export function computeWestBengalPt({ monthlySalary, employees = 1 }) {
  if (!isFiniteNumber(monthlySalary) || !isFiniteNumber(employees)) {
    return { error: "Enter valid numbers for salary and head count." };
  }
  if (monthlySalary < 0) {
    return { error: "Monthly salary cannot be negative." };
  }
  if (monthlySalary === 0) {
    return { error: "Enter the monthly salary to calculate professional tax." };
  }
  if (employees < 1 || employees > 100000) {
    return { error: "Head count must be between 1 and 100000." };
  }

  const headCount = Math.round(employees);
  const slab = findSlab(monthlySalary);
  const monthlyTax = slab.monthlyTax;

  return {
    monthlySalary,
    headCount,
    slabLabel: slab.label,
    monthlyTax,
    annualTax: monthlyTax * 12,
    employerMonthlyDeposit: monthlyTax * headCount,
    employerAnnualDeposit: monthlyTax * headCount * 12,
    liable: monthlyTax > 0,
    /** PT paid is deductible from salary income under Section 16(iii), old regime only. */
    section16Deduction: monthlyTax * 12,
  };
}

/**
 * Month-by-month deposit calendar for a financial year.
 * Pure: the year is supplied, never read from the clock.
 *
 * @param {object} input
 * @param {number} input.monthlyDeposit       Amount the employer deducts each month.
 * @param {number} input.financialYearStart   Calendar year in which the April falls, e.g. 2025.
 */
export function buildDepositSchedule({ monthlyDeposit, financialYearStart }) {
  if (!isFiniteNumber(monthlyDeposit) || monthlyDeposit < 0) {
    return { error: "Monthly deposit must be zero or a positive number." };
  }
  if (!isFiniteNumber(financialYearStart) || financialYearStart < 1979 || financialYearStart > 2100) {
    return { error: "Enter a financial year between 1979 and 2100." };
  }

  const startYear = Math.round(financialYearStart);
  // Calendar month numbers, 0 = January. April is 3, so the FY starts at absolute month
  // startYear * 12 + 3 and each following entry is one month later.
  const firstAbsoluteMonth = startYear * 12 + 3;
  const CALENDAR_MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const describe = (absoluteMonth) =>
    `${CALENDAR_MONTHS[absoluteMonth % 12]} ${Math.floor(absoluteMonth / 12)}`;

  const rows = FY_MONTHS.map((_monthName, index) => {
    const wageMonth = firstAbsoluteMonth + index;
    return {
      wageMonth: describe(wageMonth),
      dueDate: `${DEPOSIT_DAYS_AFTER_MONTH_END} ${describe(wageMonth + 1)}`,
      amount: monthlyDeposit,
    };
  });

  return {
    financialYear: `${startYear}-${String((startYear + 1) % 100).padStart(2, "0")}`,
    rows,
    total: monthlyDeposit * 12,
  };
}
