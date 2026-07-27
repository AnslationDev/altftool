/**
 * Monthly pay for a driver — monthly wage plus overtime, night duty, outstation
 * halts and rest-day working, less the statutory deductions that apply when the
 * driver is on the books of an establishment.
 *
 * Ordinary rate of wages
 *   hourly = monthly wage / (duty days per month * duty hours per day)
 *   daily  = monthly wage / duty days per month
 *
 * Overtime
 *   Section 26 of the Motor Transport Workers Act, 1961 requires wages for
 *   overtime at twice the ordinary rate of wages, and the same doubling appears
 *   in Section 59 of the Factories Act, 1948 and in the Minimum Wages (Central)
 *   Rules, 1950. Two times is therefore the default multiplier here, and it is
 *   the statutory floor — a contract may pay more but not less.
 *
 * The tool is a pay worksheet, not legal advice; state minimum wage
 * notifications differ and should be checked for the driver's own state.
 */

/** Statutory overtime multiplier: twice the ordinary rate of wages. */
export const STATUTORY_OVERTIME_MULTIPLIER = 2;

/**
 * Normal working hours under the Motor Transport Workers Act, 1961 (Section 13):
 * 8 hours in a day and 48 hours in a week, with a weekly rest day.
 */
export const NORMAL_HOURS_PER_DAY = 8;
export const NORMAL_HOURS_PER_WEEK = 48;

/** Average weeks in a calendar month, used to convert a monthly total to a weekly one. */
export const AVERAGE_WEEKS_PER_MONTH = 365.25 / 12 / 7;

/** EPF: 12% each from employee and employer on a statutory wage ceiling of Rs 15,000 a month. */
export const EPF_EMPLOYEE_RATE = 0.12;
export const EPF_EMPLOYER_RATE = 0.12;
export const EPF_WAGE_CEILING = 15000;
/** EPF administrative charges, 0.5% of PF wages, borne by the employer. */
export const EPF_ADMIN_RATE = 0.005;

/** ESI: applies while gross monthly wages are up to Rs 21,000. */
export const ESI_WAGE_CEILING = 21000;
export const ESI_EMPLOYEE_RATE = 0.0075;
export const ESI_EMPLOYER_RATE = 0.0325;

const MAX_MONTHLY_WAGE = 10000000;

/**
 * @returns {{error:string}|object} full monthly pay breakdown
 */
export function computeDriverPay({
  monthlyWage,
  dutyDaysPerMonth = 26,
  dutyHoursPerDay = 8,
  overtimeHours = 0,
  overtimeMultiplier = STATUTORY_OVERTIME_MULTIPLIER,
  nightDuties = 0,
  nightAllowancePerDuty = 0,
  outstationDays = 0,
  outstationRatePerDay = 0,
  restDaysWorked = 0,
  restDayMultiplier = STATUTORY_OVERTIME_MULTIPLIER,
  otherAllowances = 0,
  advanceDeducted = 0,
  applyEpf = false,
  capEpfAtCeiling = true,
  applyEsi = false,
}) {
  const numbers = [
    monthlyWage,
    dutyDaysPerMonth,
    dutyHoursPerDay,
    overtimeHours,
    overtimeMultiplier,
    nightDuties,
    nightAllowancePerDuty,
    outstationDays,
    outstationRatePerDay,
    restDaysWorked,
    restDayMultiplier,
    otherAllowances,
    advanceDeducted,
  ];
  if (numbers.some((n) => typeof n !== "number" || !Number.isFinite(n))) {
    return { error: "Enter a valid number in every field." };
  }
  if (monthlyWage <= 0) return { error: "Monthly wage must be greater than zero." };
  if (monthlyWage > MAX_MONTHLY_WAGE) return { error: "Monthly wage is outside the supported range." };
  if (dutyDaysPerMonth <= 0 || dutyDaysPerMonth > 31) {
    return { error: "Duty days per month must be between 1 and 31." };
  }
  if (dutyHoursPerDay <= 0 || dutyHoursPerDay > 16) {
    return { error: "Duty hours per day must be between 1 and 16." };
  }
  if (overtimeHours < 0 || overtimeHours > 300) {
    return { error: "Overtime hours must be between 0 and 300 in a month." };
  }
  if (overtimeMultiplier < 1 || overtimeMultiplier > 4) {
    return { error: "Overtime multiplier must be between 1 and 4 times the ordinary rate." };
  }
  if (restDayMultiplier < 1 || restDayMultiplier > 4) {
    return { error: "Rest-day multiplier must be between 1 and 4 times the ordinary rate." };
  }
  if (nightDuties < 0 || nightDuties > 31 || outstationDays < 0 || outstationDays > 31) {
    return { error: "Night duties and outstation days must each be between 0 and 31." };
  }
  if (restDaysWorked < 0 || restDaysWorked > 10) {
    return { error: "Rest days worked must be between 0 and 10 in a month." };
  }
  if (
    nightAllowancePerDuty < 0 ||
    outstationRatePerDay < 0 ||
    otherAllowances < 0 ||
    advanceDeducted < 0
  ) {
    return { error: "Allowances, rates and advances cannot be negative." };
  }

  const contractedHours = dutyDaysPerMonth * dutyHoursPerDay;
  const hourlyRate = monthlyWage / contractedHours;
  const dailyRate = monthlyWage / dutyDaysPerMonth;

  const overtimePay = overtimeHours * hourlyRate * overtimeMultiplier;
  const nightPay = nightDuties * nightAllowancePerDuty;
  const outstationPay = outstationDays * outstationRatePerDay;
  const restDayPay = restDaysWorked * dailyRate * restDayMultiplier;

  const gross =
    monthlyWage + overtimePay + nightPay + outstationPay + restDayPay + otherAllowances;

  const epfWages = capEpfAtCeiling ? Math.min(monthlyWage, EPF_WAGE_CEILING) : monthlyWage;
  const epfEmployee = applyEpf ? epfWages * EPF_EMPLOYEE_RATE : 0;
  const epfEmployer = applyEpf ? epfWages * EPF_EMPLOYER_RATE : 0;
  const epfAdmin = applyEpf ? epfWages * EPF_ADMIN_RATE : 0;

  const esiEligible = applyEsi && gross <= ESI_WAGE_CEILING;
  const esiEmployee = esiEligible ? gross * ESI_EMPLOYEE_RATE : 0;
  const esiEmployer = esiEligible ? gross * ESI_EMPLOYER_RATE : 0;

  const totalDeductions = epfEmployee + esiEmployee + advanceDeducted;
  const netPay = gross - totalDeductions;
  const employerCost = gross + epfEmployer + epfAdmin + esiEmployer;

  const totalHours = contractedHours + overtimeHours + restDaysWorked * dutyHoursPerDay;
  const weeklyHours = totalHours / AVERAGE_WEEKS_PER_MONTH;

  return {
    hourlyRate,
    dailyRate,
    overtimePay,
    nightPay,
    outstationPay,
    restDayPay,
    otherAllowances,
    gross,
    epfWages,
    epfEmployee,
    epfEmployer,
    epfAdmin,
    epfEmployerTotal: epfEmployer + epfAdmin,
    esiApplied: esiEligible,
    esiOverCeiling: applyEsi && gross > ESI_WAGE_CEILING,
    esiEmployee,
    esiEmployer,
    advanceDeducted,
    totalDeductions,
    netPay,
    employerCost,
    contractedHours,
    totalHours,
    weeklyHours,
    overWeeklyLimit: weeklyHours > NORMAL_HOURS_PER_WEEK,
    effectiveCostPerHour: totalHours > 0 ? employerCost / totalHours : 0,
  };
}
