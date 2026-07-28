/**
 * Proportionate (pro-rata) rent calculator.
 *
 * When a tenancy starts or ends mid-month, the part month has to be apportioned.
 * There is no single statutory formula, so leases use one of three conventions
 * and the difference between them on the same dates is real money:
 *
 *   1. Actual days in that month (the usual Indian and UK practice):
 *        amount = monthlyRent x occupiedDays / daysInThatCalendarMonth
 *      A day in February costs more than a day in March, because February is
 *      shorter and the monthly rent is the same.
 *
 *   2. 30-day month convention (common in US leases and in accounting):
 *        amount = monthlyRent x occupiedDays / 30
 *      Simple, but 31 days of occupation bills 31/30 of a month.
 *
 *   3. 365-day year convention (used where rent is expressed annually):
 *        amount = monthlyRent x 12 / daysInThatYear x occupiedDays
 *      Every day costs the same across the year; 366 is used in a leap year.
 *
 * The convention applies only to part months. A calendar month occupied from its
 * first day to its last always bills the full monthly rent, whatever its length —
 * a tenant in occupation for the whole of February owes one month's rent, not
 * 28/30ths of one. Applying a 30-day divisor to a full month is a common
 * spreadsheet error and is deliberately not reproduced here.
 *
 * Both the start and the end date are counted as occupied days, which is the
 * standard reading of a tenancy running "from X to Y inclusive". All dates are
 * arguments, so the module is pure and produces the same output every time.
 */

const ISO_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Longest span the calculator will itemise, in whole months. */
export const MAX_SPAN_MONTHS = 60;

export const METHODS = [
  {
    id: "actual-days",
    label: "Actual days in the month",
    formula: "rent x days occupied / days in that calendar month",
    note: "Most common in Indian and UK tenancies. A February day costs more than a March day.",
  },
  {
    id: "thirty-day",
    label: "30-day month",
    formula: "rent x days occupied / 30",
    note: "Common in US leases and in accounting. Bills 31/30 of a month for a full 31-day month.",
  },
  {
    id: "annual-365",
    label: "365-day year (366 in a leap year)",
    formula: "rent x 12 / days in the year x days occupied",
    note: "Every day of the year costs the same. Used where the rent is quoted annually.",
  },
];

const METHOD_BY_ID = new Map(METHODS.map((item) => [item.id, item]));

const MONTH_NAMES = [
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

const round2 = (value) => Math.round(value * 100) / 100;

const parseIso = (iso) => {
  if (!ISO_PATTERN.test(String(iso))) return null;
  const [year, month, day] = String(iso).split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return { year, month: month - 1, day, date };
};

/** Days in a given month, leap years included. */
export function daysInMonth(year, monthIndex) {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

/** 366 in a leap year, otherwise 365. */
export function daysInYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 366 : 365;
}

/**
 * @param {object} input
 * @param {number} input.monthlyRent Full monthly rent under the lease.
 * @param {string} input.startDate   First occupied day, ISO yyyy-mm-dd.
 * @param {string} input.endDate     Last occupied day, ISO yyyy-mm-dd (inclusive).
 * @param {string} input.method      One of METHODS[].id.
 * @param {number} input.monthlyMaintenance Non-apportioned charges, apportioned the same way.
 * @returns {object} month rows and totals, or { error }.
 */
export function computeProRataRent({
  monthlyRent = 0,
  startDate = "",
  endDate = "",
  method = "actual-days",
  monthlyMaintenance = 0,
} = {}) {
  if (!Number.isFinite(monthlyRent) || !Number.isFinite(monthlyMaintenance)) {
    return { error: "Enter a valid number for the rent and any maintenance charge." };
  }
  if (monthlyRent <= 0) return { error: "Monthly rent must be greater than zero." };
  if (monthlyMaintenance < 0) return { error: "Maintenance charges cannot be negative." };

  const chosen = METHOD_BY_ID.get(method);
  if (!chosen) return { error: "Choose one of the apportionment methods." };

  const start = parseIso(startDate);
  if (!start) return { error: "Enter a real start date." };
  const end = parseIso(endDate);
  if (!end) return { error: "Enter a real end date." };

  if (end.date.getTime() < start.date.getTime()) {
    return { error: "The end date cannot fall before the start date." };
  }

  const totalDays = Math.round((end.date.getTime() - start.date.getTime()) / 86400000) + 1;
  if (totalDays > MAX_SPAN_MONTHS * 31) {
    return { error: `Enter a period of ${MAX_SPAN_MONTHS} months or less.` };
  }

  const rows = [];
  let cursorYear = start.year;
  let cursorMonth = start.month;

  while (
    cursorYear < end.year ||
    (cursorYear === end.year && cursorMonth <= end.month)
  ) {
    const monthDays = daysInMonth(cursorYear, cursorMonth);
    const firstDay = cursorYear === start.year && cursorMonth === start.month ? start.day : 1;
    const lastDay = cursorYear === end.year && cursorMonth === end.month ? end.day : monthDays;
    const occupiedDays = lastDay - firstDay + 1;
    const isFullMonth = occupiedDays === monthDays;

    let divisor;
    if (chosen.id === "actual-days") divisor = monthDays;
    else if (chosen.id === "thirty-day") divisor = 30;
    else divisor = daysInYear(cursorYear) / 12;

    // A whole calendar month always bills the whole monthly rent.
    const rentAmount = isFullMonth ? monthlyRent : (monthlyRent / divisor) * occupiedDays;
    const maintenanceAmount = isFullMonth
      ? monthlyMaintenance
      : (monthlyMaintenance / divisor) * occupiedDays;

    rows.push({
      key: `${cursorYear}-${String(cursorMonth + 1).padStart(2, "0")}`,
      label: `${MONTH_NAMES[cursorMonth]} ${cursorYear}`,
      monthDays,
      firstDay,
      lastDay,
      occupiedDays,
      isFullMonth,
      dailyRate: round2(rentAmount / occupiedDays),
      rentAmount: round2(rentAmount),
      maintenanceAmount: round2(maintenanceAmount),
      // Built from the already-rounded parts so the on-screen column adds up.
      total: round2(round2(rentAmount) + round2(maintenanceAmount)),
    });

    cursorMonth += 1;
    if (cursorMonth > 11) {
      cursorMonth = 0;
      cursorYear += 1;
    }
  }

  const totalRent = rows.reduce((sum, row) => sum + row.rentAmount, 0);
  const totalMaintenance = rows.reduce((sum, row) => sum + row.maintenanceAmount, 0);
  const partMonths = rows.filter((row) => !row.isFullMonth);
  const fullMonths = rows.filter((row) => row.isFullMonth);

  return {
    rows,
    totalRent: round2(totalRent),
    totalMaintenance: round2(totalMaintenance),
    totalPayable: round2(totalRent + totalMaintenance),
    totalDays,
    fullMonthCount: fullMonths.length,
    partMonthCount: partMonths.length,
    firstPartMonth: partMonths[0] || null,
    lastPartMonth: partMonths.length > 1 ? partMonths[partMonths.length - 1] : null,
    averageDailyRate: round2(totalRent / totalDays),
    methodLabel: chosen.label,
    methodFormula: chosen.formula,
    methodNote: chosen.note,
  };
}

/** The same period priced by every method, so the conventions can be compared. */
export function compareMethods(input = {}) {
  const rows = [];
  for (const item of METHODS) {
    const result = computeProRataRent({ ...input, method: item.id });
    if (result.error) return result;
    rows.push({
      id: item.id,
      label: item.label,
      totalRent: result.totalRent,
      totalPayable: result.totalPayable,
    });
  }
  return rows;
}
