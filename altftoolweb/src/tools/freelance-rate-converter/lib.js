/**
 * Freelance contract rate converter — pure logic.
 *
 * Hourly, daily, weekly, monthly and annual rates are not interchangeable
 * constants; they are the same money divided by different amounts of billable
 * capacity. Everything here routes through one anchor figure:
 *
 *   billableHoursPerYear = hoursPerDay x utilisation x daysPerWeek x workingWeeksPerYear
 *
 * Utilisation matters because unbilled time — pitching, admin, invoicing,
 * learning — is real but unpaid. Industry surveys of independent consultants
 * put realistic utilisation in the 60-80% band; a freelancer who assumes 100%
 * quotes a rate that cannot pay for the year.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Calendar weeks in a year. Used as the ceiling on working weeks. */
export const WEEKS_PER_YEAR = 52;
/** Months per year, used to split annual figures. */
export const MONTHS_PER_YEAR = 12;

/** Sanity ceilings so an impossible schedule cannot produce a plausible number. */
export const LIMITS = {
  maxHoursPerDay: 24,
  maxDaysPerWeek: 7,
  maxWeeksPerYear: WEEKS_PER_YEAR,
  maxProjectHours: 100000,
};

/** The bases a rate can be quoted on. */
export const RATE_BASES = {
  hourly: { id: "hourly", label: "Per hour" },
  daily: { id: "daily", label: "Per day" },
  weekly: { id: "weekly", label: "Per week" },
  monthly: { id: "monthly", label: "Per month" },
  annual: { id: "annual", label: "Per year" },
  project: { id: "project", label: "Fixed project fee" },
};

/** Typical utilisation presets, expressed as the share of scheduled hours that
 * are actually billable to a client. */
export const UTILISATION_PRESETS = [
  { id: "full", label: "100% — every scheduled hour is billable", percent: 100 },
  { id: "high", label: "80% — light admin, steady pipeline", percent: 80 },
  { id: "typical", label: "70% — typical independent consultant", percent: 70 },
  { id: "low", label: "60% — heavy pitching and unpaid overheads", percent: 60 },
];

/**
 * Turn a working pattern into billable capacity.
 *
 * @param {object} input
 * @param {number} input.hoursPerDay scheduled hours in a working day
 * @param {number} input.daysPerWeek working days in a week
 * @param {number} input.weeksPerYear weeks actually worked (52 minus leave)
 * @param {number} input.utilisationPercent share of scheduled hours that are billable
 * @returns {object} capacity figures, or { error }
 */
export function buildCapacity({ hoursPerDay, daysPerWeek, weeksPerYear, utilisationPercent }) {
  if (![hoursPerDay, daysPerWeek, weeksPerYear, utilisationPercent].every(isNum)) {
    return { error: "Enter your working pattern as numbers." };
  }
  if (hoursPerDay <= 0 || hoursPerDay > LIMITS.maxHoursPerDay) {
    return { error: `Hours a day must be between 0 and ${LIMITS.maxHoursPerDay}.` };
  }
  if (daysPerWeek <= 0 || daysPerWeek > LIMITS.maxDaysPerWeek) {
    return { error: `Days a week must be between 0 and ${LIMITS.maxDaysPerWeek}.` };
  }
  if (weeksPerYear <= 0 || weeksPerYear > LIMITS.maxWeeksPerYear) {
    return { error: `Working weeks must be between 0 and ${LIMITS.maxWeeksPerYear}.` };
  }
  if (utilisationPercent <= 0 || utilisationPercent > 100) {
    return { error: "Utilisation must be above 0% and no more than 100%." };
  }

  const utilisation = utilisationPercent / 100;
  const billableHoursPerDay = hoursPerDay * utilisation;
  const billableHoursPerWeek = billableHoursPerDay * daysPerWeek;
  const billableDaysPerYear = daysPerWeek * weeksPerYear;
  const billableHoursPerYear = billableHoursPerDay * billableDaysPerYear;

  if (!(billableHoursPerYear > 0)) {
    return { error: "That working pattern leaves no billable hours in the year." };
  }

  return {
    hoursPerDay,
    daysPerWeek,
    weeksPerYear,
    utilisationPercent,
    billableHoursPerDay,
    billableHoursPerWeek,
    billableDaysPerYear,
    billableHoursPerYear,
    billableHoursPerMonth: billableHoursPerYear / MONTHS_PER_YEAR,
    billableDaysPerMonth: billableDaysPerYear / MONTHS_PER_YEAR,
    unbilledHoursPerYear: hoursPerDay * billableDaysPerYear - billableHoursPerYear,
  };
}

/**
 * Convert one quoted rate into every other basis.
 *
 * @param {object} input
 * @param {number} input.amount the rate as quoted
 * @param {string} input.basis key of RATE_BASES
 * @param {object} input.capacity result of buildCapacity
 * @param {number} [input.projectHours] hours the fixed project is expected to take
 * @returns {object} rates on every basis, or { error }
 */
export function convertRate({ amount, basis, capacity, projectHours = 0 }) {
  if (!capacity || capacity.error) return { error: capacity?.error ?? "Set a working pattern first." };
  if (!RATE_BASES[basis]) return { error: "Choose the basis your rate is quoted on." };
  if (!isNum(amount) || amount <= 0) return { error: "The rate must be greater than zero." };

  const {
    billableHoursPerDay,
    billableHoursPerWeek,
    billableHoursPerYear,
    billableHoursPerMonth,
  } = capacity;

  let hourly;
  if (basis === "hourly") hourly = amount;
  else if (basis === "daily") hourly = amount / billableHoursPerDay;
  else if (basis === "weekly") hourly = amount / billableHoursPerWeek;
  else if (basis === "monthly") hourly = amount / billableHoursPerMonth;
  else if (basis === "annual") hourly = amount / billableHoursPerYear;
  else {
    if (!isNum(projectHours) || projectHours <= 0) {
      return { error: "Enter how many hours the fixed-fee project will take." };
    }
    if (projectHours > LIMITS.maxProjectHours) {
      return { error: `Project hours must be under ${LIMITS.maxProjectHours}.` };
    }
    hourly = amount / projectHours;
  }

  if (!Number.isFinite(hourly) || hourly <= 0) {
    return { error: "That combination does not produce a usable hourly rate." };
  }

  const rates = {
    hourly,
    daily: hourly * billableHoursPerDay,
    weekly: hourly * billableHoursPerWeek,
    monthly: hourly * billableHoursPerMonth,
    annual: hourly * billableHoursPerYear,
  };

  return {
    ...rates,
    project: isNum(projectHours) && projectHours > 0 ? hourly * projectHours : null,
    projectHours: isNum(projectHours) && projectHours > 0 ? projectHours : null,
    /** What the hour is worth once unbilled time is spread across it. */
    perScheduledHour: rates.annual / (capacity.hoursPerDay * capacity.billableDaysPerYear),
  };
}

/**
 * Turn gross annual billings into take-home, after business costs and tax.
 * Tax is applied to profit (revenue minus deductible costs), which is how
 * self-employment is assessed in most jurisdictions.
 *
 * @param {object} input
 * @param {number} input.annualRevenue gross billings
 * @param {number} input.annualCosts deductible business costs for the year
 * @param {number} input.taxPercent combined income tax and social contributions on profit
 * @param {number} input.billableHoursPerYear used to express the net rate per hour
 * @returns {object} take-home figures, or { error }
 */
export function netTakeHome({ annualRevenue, annualCosts, taxPercent, billableHoursPerYear }) {
  if (!isNum(annualRevenue) || annualRevenue <= 0) {
    return { error: "Annual billings must be greater than zero." };
  }
  if (!isNum(annualCosts) || annualCosts < 0) return { error: "Business costs cannot be negative." };
  if (!isNum(taxPercent) || taxPercent < 0 || taxPercent >= 100) {
    return { error: "The tax rate must be between 0% and 99%." };
  }
  if (!isNum(billableHoursPerYear) || billableHoursPerYear <= 0) {
    return { error: "There are no billable hours to divide the take-home across." };
  }

  const profitBeforeTax = annualRevenue - annualCosts;
  const tax = profitBeforeTax > 0 ? profitBeforeTax * (taxPercent / 100) : 0;
  const netAnnual = profitBeforeTax - tax;

  return {
    profitBeforeTax,
    tax,
    netAnnual,
    netMonthly: netAnnual / MONTHS_PER_YEAR,
    netHourly: netAnnual / billableHoursPerYear,
    /** Share of every billed pound that survives costs and tax. */
    keepRatePercent: (netAnnual / annualRevenue) * 100,
  };
}

/**
 * The hourly rate a freelancer needs to match a salaried package, once unpaid
 * leave, business costs and the missing employer contribution are added back.
 *
 * @param {object} input
 * @param {number} input.salary the employed gross salary being replaced
 * @param {number} input.employerOnCostPercent employer pension/social cost a
 *   freelancer must now fund themselves
 * @param {number} input.annualCosts freelance business costs
 * @param {number} input.billableHoursPerYear
 * @returns {{ requiredAnnual: number, requiredHourly: number } | { error: string }}
 */
export function salaryEquivalentRate({ salary, employerOnCostPercent, annualCosts, billableHoursPerYear }) {
  if (!isNum(salary) || salary <= 0) return { error: "Enter the salary you are replacing." };
  if (!isNum(employerOnCostPercent) || employerOnCostPercent < 0 || employerOnCostPercent > 100) {
    return { error: "Employer on-costs must be between 0% and 100%." };
  }
  if (!isNum(annualCosts) || annualCosts < 0) return { error: "Business costs cannot be negative." };
  if (!isNum(billableHoursPerYear) || billableHoursPerYear <= 0) {
    return { error: "There are no billable hours to spread the target across." };
  }
  const requiredAnnual = salary * (1 + employerOnCostPercent / 100) + annualCosts;
  return { requiredAnnual, requiredHourly: requiredAnnual / billableHoursPerYear };
}
