/**
 * Employees' State Insurance (ESI) contribution maths.
 *
 * Statutory basis — Employees' State Insurance Act 1948 and the ESI (Central) Rules 1950:
 *  - Rule 51: employee's share 0.75% of wages, employer's share 3.25% of wages
 *    (rates in force since 1 July 2019).
 *  - Rule 50: coverage wage ceiling of Rs 21,000 a month in gross wages;
 *    Rs 25,000 a month for a person with disability employed under the
 *    notified schemes for disabled workers.
 *  - Rule 52: an employee whose AVERAGE DAILY WAGE is up to Rs 176 is exempt from
 *    paying the employee's share; the employer still pays its 3.25%.
 *  - Regulation 31 / ESIC practice: each share is rounded UP to the next rupee.
 *  - Contribution periods run 1 April - 30 September and 1 October - 31 March
 *    (6 months each). If wages cross the ceiling mid-period, contribution
 *    continues on the ACTUAL wages until that contribution period ends.
 *  - Contribution for a month is payable by the 15th of the following month.
 *
 * Note: contributions are computed on actual gross wages paid, not on wages
 * capped at the ceiling. The ceiling decides coverage, not the contribution base.
 */

/** Rule 51 contribution rates. */
export const EMPLOYEE_RATE = 0.0075;
export const EMPLOYER_RATE = 0.0325;

/** Rule 50 monthly gross-wage coverage ceilings. */
export const WAGE_CEILING = 21000;
export const WAGE_CEILING_DISABILITY = 25000;

/** Rule 52 average-daily-wage exemption from the employee's share. */
export const DAILY_WAGE_EXEMPTION = 176;

/** Months in one ESI contribution period (Apr-Sep, Oct-Mar). */
export const MONTHS_IN_CONTRIBUTION_PERIOD = 6;

/** Payment due date: 15th of the following month. */
export const PAYMENT_DUE_DAY = 15;

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);

/** ESIC rounds each share up to the next whole rupee. */
export function roundUpToRupee(amount) {
  if (!isFiniteNumber(amount) || amount <= 0) return 0;
  return Math.ceil(amount - 1e-9);
}

/**
 * ESI contribution for one wage month.
 *
 * @param {object} input
 * @param {number} input.monthlyWages          Gross wages paid for the month (ESI definition of wages).
 * @param {number} [input.payableDays]         Days for which wages were paid, used for the Rule 52 daily average.
 * @param {boolean} [input.personWithDisability] Applies the Rs 25,000 ceiling instead of Rs 21,000.
 * @param {boolean} [input.crossedCeilingMidPeriod] Employee was already covered and crossed the ceiling
 *                                              inside a contribution period, so contribution continues.
 */
export function computeEsiContribution({
  monthlyWages,
  payableDays = 26,
  personWithDisability = false,
  crossedCeilingMidPeriod = false,
}) {
  if (!isFiniteNumber(monthlyWages) || !isFiniteNumber(payableDays)) {
    return { error: "Enter valid numbers for wages and payable days." };
  }
  if (monthlyWages < 0) {
    return { error: "Monthly wages cannot be negative." };
  }
  if (monthlyWages === 0) {
    return { error: "Enter the gross wages paid for the month." };
  }
  if (payableDays < 1 || payableDays > 31) {
    return { error: "Payable days in a month must be between 1 and 31." };
  }

  const ceiling = personWithDisability ? WAGE_CEILING_DISABILITY : WAGE_CEILING;
  const withinCeiling = monthlyWages <= ceiling;
  const covered = withinCeiling || crossedCeilingMidPeriod;

  const averageDailyWage = monthlyWages / payableDays;

  if (!covered) {
    return {
      covered: false,
      ceiling,
      monthlyWages,
      averageDailyWage,
      employeeShare: 0,
      employerShare: 0,
      totalMonthly: 0,
      employeeExempt: false,
      employeePeriodTotal: 0,
      employerPeriodTotal: 0,
      totalPeriod: 0,
      annualTotal: 0,
      note: `Gross wages of ${monthlyWages} exceed the ESI coverage ceiling of ${ceiling} a month, so the employee is out of ESI from the start of the next contribution period.`,
    };
  }

  const employeeExempt = averageDailyWage <= DAILY_WAGE_EXEMPTION;
  const employeeShare = employeeExempt ? 0 : roundUpToRupee(monthlyWages * EMPLOYEE_RATE);
  const employerShare = roundUpToRupee(monthlyWages * EMPLOYER_RATE);
  const totalMonthly = employeeShare + employerShare;

  return {
    covered: true,
    ceiling,
    monthlyWages,
    averageDailyWage,
    employeeExempt,
    employeeShare,
    employerShare,
    totalMonthly,
    employeeCostShare: totalMonthly > 0 ? (employeeShare / totalMonthly) * 100 : 0,
    employeePeriodTotal: employeeShare * MONTHS_IN_CONTRIBUTION_PERIOD,
    employerPeriodTotal: employerShare * MONTHS_IN_CONTRIBUTION_PERIOD,
    totalPeriod: totalMonthly * MONTHS_IN_CONTRIBUTION_PERIOD,
    annualTotal: totalMonthly * 12,
    note: withinCeiling
      ? null
      : "Wages crossed the ceiling inside the contribution period, so contribution continues on actual wages until the period ends.",
  };
}
