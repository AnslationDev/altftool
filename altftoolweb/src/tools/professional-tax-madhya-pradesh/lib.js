/**
 * Madhya Pradesh professional tax (Vritti Kar).
 *
 * Source of the rule: the Madhya Pradesh Vritti Kar Adhiniyam, 1995 (Schedule I,
 * entry for salary and wage earners), which charges tax on ANNUAL gross salary /
 * wages in four bands. Article 276(2) of the Constitution of India caps
 * profession tax at Rs 2,500 per person per year, which is why the top band stops
 * at Rs 2,500.
 *
 * Pure module: no React, no DOM, no clocks. Dates are passed in as arguments.
 */

/** Constitutional ceiling on profession tax per person per year - Art. 276(2). */
export const ANNUAL_PT_CEILING = 2500;

/**
 * MP slabs on annual gross salary/wages.
 * `annualTax` is the statutory yearly liability for the band.
 * upTo = null means "and above".
 */
export const MP_PT_SLABS = [
  { upTo: 225000, annualTax: 0, label: "Up to Rs 2,25,000" },
  { upTo: 300000, annualTax: 1500, label: "Rs 2,25,001 to Rs 3,00,000" },
  { upTo: 400000, annualTax: 2000, label: "Rs 3,00,001 to Rs 4,00,000" },
  { upTo: null, annualTax: 2500, label: "Above Rs 4,00,000" },
];

/** Indian financial year runs April to March. */
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

/**
 * Employers in MP deduct the tax every month and deposit it with the Commercial
 * Tax Department by the 10th day of the following month. Enrolled (self-employed)
 * persons pay the whole year in a single instalment.
 */
export const EMPLOYER_DEPOSIT_DAY = 10;

/** Highest marginal income-tax rate accepted for the "net cost" view. */
const MAX_MARGINAL_RATE = 42.744;

/** Find the slab that applies to an annual gross salary. */
export function findMpSlab(annualSalary) {
  return (
    MP_PT_SLABS.find((slab) => slab.upTo === null || annualSalary <= slab.upTo) ||
    MP_PT_SLABS[MP_PT_SLABS.length - 1]
  );
}

/**
 * Split an annual liability into 12 monthly deductions the way MP payroll does:
 * an equal rounded-down amount for the first 11 months and the remainder in the
 * 12th month, so the year still totals exactly the slab amount.
 * Rs 2,500 => 208 x 11 + 212. Rs 2,000 => 166 x 11 + 174. Rs 1,500 => 125 x 12.
 */
export function splitMonthly(annualTax) {
  if (!(annualTax > 0)) return { regularMonth: 0, finalMonth: 0 };
  const regularMonth = Math.floor(annualTax / 12);
  const finalMonth = annualTax - regularMonth * 11;
  return { regularMonth, finalMonth };
}

/**
 * @param {object} input
 * @param {number} input.monthlyGross  monthly gross salary in rupees (ignored when annualGross is given)
 * @param {number} [input.annualGross] annual gross salary; when omitted it is monthlyGross x monthsWorked... see below
 * @param {number} [input.monthsWorked=12] months of employment in the financial year (1-12)
 * @param {number} [input.marginalTaxRate=0] marginal income-tax rate (%) used only to show
 *        the net cost after the section 16(iii) deduction (old regime).
 * @returns {object} breakdown or { error }
 */
export function computeMpProfessionalTax({
  monthlyGross,
  annualGross,
  monthsWorked = 12,
  marginalTaxRate = 0,
} = {}) {
  const monthly = Number(monthlyGross);
  const months = Number(monthsWorked);
  const relief = Number(marginalTaxRate);

  if (!Number.isFinite(monthly) || !Number.isFinite(months) || !Number.isFinite(relief)) {
    return { error: "Enter valid numbers for salary, months worked and tax rate." };
  }
  if (monthly < 0) return { error: "Monthly gross salary cannot be negative." };
  if (monthly > 100000000) {
    return { error: "Monthly gross salary looks unrealistic. Enter an amount under Rs 10 crore." };
  }
  if (!(months >= 1) || months > 12) {
    return { error: "Months worked in the financial year must be between 1 and 12." };
  }
  if (relief < 0 || relief > MAX_MARGINAL_RATE) {
    return { error: `Marginal tax rate must be between 0% and ${MAX_MARGINAL_RATE}%.` };
  }

  const wholeMonths = Math.floor(months);
  // The slab is decided by annual gross salary, i.e. the full-year rate of pay,
  // not by the part-year earnings of a mid-year joiner.
  const annual = Number.isFinite(Number(annualGross)) && Number(annualGross) > 0
    ? Number(annualGross)
    : monthly * 12;

  const slab = findMpSlab(annual);
  const annualTax = Math.min(slab.annualTax, ANNUAL_PT_CEILING);
  const { regularMonth, finalMonth } = splitMonthly(annualTax);

  // A part-year count is the remaining months of the FY for a mid-year joiner, not
  // the opening months of the year, so the schedule always runs up to and includes
  // March — otherwise a joiner working fewer than 12 months would never reach the
  // higher final-month instalment that reconciles the annual total.
  const startIndex = 12 - wholeMonths;
  const schedule = FY_MONTHS.slice(startIndex).map((month, offset) => {
    const index = startIndex + offset;
    const isLastMonthOfYear = index === 11;
    const amount = annualTax === 0 ? 0 : isLastMonthOfYear ? finalMonth : regularMonth;
    const nextMonth = FY_MONTHS[(index + 1) % 12];
    return {
      month,
      amount,
      depositBy: `${EMPLOYER_DEPOSIT_DAY} ${nextMonth}`,
    };
  });

  const payableForPeriod = schedule.reduce((sum, row) => sum + row.amount, 0);
  const incomeTaxSaved = (payableForPeriod * relief) / 100;

  return {
    annualGross: annual,
    monthlyGross: monthly,
    monthsWorked: wholeMonths,
    slabLabel: slab.label,
    annualTax,
    regularMonthlyDeduction: regularMonth,
    finalMonthDeduction: finalMonth,
    payableForPeriod,
    incomeTaxSaved,
    netCostAfterRelief: payableForPeriod - incomeTaxSaved,
    isExempt: annualTax === 0,
    schedule,
  };
}
