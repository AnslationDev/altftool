/**
 * Calendar <-> fiscal quarter conversion for any fiscal year start month.
 *
 * Conventions encoded
 *  - A fiscal year is 12 consecutive months starting on the 1st of a chosen month.
 *  - Fiscal quarters are the four consecutive 3-month blocks from that start month.
 *  - Two year-labelling conventions exist in the wild:
 *      "start": the year is named after the calendar year the fiscal year STARTS in.
 *               India names FY 2025-26 for the year running 1 Apr 2025 to 31 Mar 2026
 *               (Income-tax Act s.2(9) "assessment year" follows the same April year).
 *      "end":   the year is named after the calendar year the fiscal year ENDS in.
 *               The US federal fiscal year running 1 Oct 2025 to 30 Sep 2026 is FY2026
 *               (31 USC 1102 fixes the 1 October start).
 *  - When the fiscal year starts in January the two conventions coincide and the label
 *    is a single year, identical to the calendar year.
 */

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Common fiscal year presets, with their customary labelling convention. */
export const FISCAL_PRESETS = [
  { id: "calendar", label: "Calendar year (Jan–Dec)", startMonth: 1, convention: "start" },
  { id: "india", label: "India / UK govt (Apr–Mar)", startMonth: 4, convention: "start" },
  { id: "us-federal", label: "US federal (Oct–Sep)", startMonth: 10, convention: "end" },
  { id: "australia", label: "Australia (Jul–Jun)", startMonth: 7, convention: "end" },
  { id: "japan", label: "Japan (Apr–Mar)", startMonth: 4, convention: "start" },
  { id: "us-retail", label: "Many US corporates (Feb–Jan)", startMonth: 2, convention: "end" },
];

export const CONVENTIONS = [
  { id: "start", label: "Name by starting year (India style: FY 2025-26)" },
  { id: "end", label: "Name by ending year (US style: FY2026)" },
];

const QUARTERS_PER_YEAR = 4;
const MONTHS_PER_QUARTER = 3;
const MONTHS_PER_YEAR = 12;
const MS_PER_DAY = 86400000;

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Parse ISO yyyy-mm-dd into a UTC-midnight Date, or null. */
export function parseIsoDate(value) {
  if (typeof value !== "string") return null;
  const match = DATE_PATTERN.exec(value.trim());
  if (!match) return null;
  const [, y, m, d] = match.map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  if (
    date.getUTCFullYear() !== y ||
    date.getUTCMonth() !== m - 1 ||
    date.getUTCDate() !== d
  ) {
    return null;
  }
  return date;
}

export function formatIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

/** Calendar quarter (1-4) of a 1-based month. */
export function calendarQuarterOf(month) {
  return Math.floor((month - 1) / MONTHS_PER_QUARTER) + 1;
}

/** Build the fiscal year label for a fiscal year starting in `startYear`. */
export function fiscalYearLabel(startYear, fyStartMonth, convention) {
  if (fyStartMonth === 1) return `FY${startYear}`;
  if (convention === "end") return `FY${startYear + 1}`;
  return `FY ${startYear}-${String((startYear + 1) % 100).padStart(2, "0")}`;
}

function isValidMonth(month) {
  return Number.isInteger(month) && month >= 1 && month <= MONTHS_PER_YEAR;
}

/**
 * Date -> calendar and fiscal period.
 *
 * @param {object} input
 * @param {string} input.date          ISO yyyy-mm-dd.
 * @param {number} input.fyStartMonth  1-12, the month the fiscal year begins.
 * @param {string} input.convention    "start" | "end" year labelling.
 */
export function dateToFiscal({ date, fyStartMonth = 4, convention = "start" }) {
  const parsed = parseIsoDate(date);
  if (!parsed) return { error: "Enter a valid date in yyyy-mm-dd form." };
  if (!isValidMonth(fyStartMonth)) {
    return { error: "Fiscal year start month must be between 1 and 12." };
  }
  if (convention !== "start" && convention !== "end") {
    return { error: "Choose a year-labelling convention." };
  }

  const year = parsed.getUTCFullYear();
  const month = parsed.getUTCMonth() + 1;

  const calendarQuarter = calendarQuarterOf(month);

  // Months elapsed since the fiscal year began (0-11).
  const monthsSinceStart = (month - fyStartMonth + MONTHS_PER_YEAR) % MONTHS_PER_YEAR;
  const fiscalQuarter = Math.floor(monthsSinceStart / MONTHS_PER_QUARTER) + 1;
  const fyStartYear = month >= fyStartMonth ? year : year - 1;

  // Quarter boundaries.
  const quarterStartMonthIndex = fyStartMonth - 1 + (fiscalQuarter - 1) * MONTHS_PER_QUARTER;
  const quarterStart = new Date(Date.UTC(fyStartYear, quarterStartMonthIndex, 1));
  const quarterEnd = new Date(Date.UTC(fyStartYear, quarterStartMonthIndex + MONTHS_PER_QUARTER, 0));
  const fyStart = new Date(Date.UTC(fyStartYear, fyStartMonth - 1, 1));
  const fyEnd = new Date(Date.UTC(fyStartYear + 1, fyStartMonth - 1, 0));

  const dayOfQuarter = Math.round((parsed.getTime() - quarterStart.getTime()) / MS_PER_DAY) + 1;
  const daysInQuarter = Math.round((quarterEnd.getTime() - quarterStart.getTime()) / MS_PER_DAY) + 1;
  const dayOfFiscalYear = Math.round((parsed.getTime() - fyStart.getTime()) / MS_PER_DAY) + 1;
  const daysInFiscalYear = Math.round((fyEnd.getTime() - fyStart.getTime()) / MS_PER_DAY) + 1;

  return {
    date: formatIsoDate(parsed),
    calendarYear: year,
    calendarQuarter,
    calendarLabel: `Q${calendarQuarter} ${year}`,
    fiscalQuarter,
    fiscalYearStartYear: fyStartYear,
    fiscalYearEndYear: fyStartMonth === 1 ? fyStartYear : fyStartYear + 1,
    fiscalYearLabel: fiscalYearLabel(fyStartYear, fyStartMonth, convention),
    fiscalLabel: `Q${fiscalQuarter} ${fiscalYearLabel(fyStartYear, fyStartMonth, convention)}`,
    quarterStart: formatIsoDate(quarterStart),
    quarterEnd: formatIsoDate(quarterEnd),
    fiscalYearStart: formatIsoDate(fyStart),
    fiscalYearEnd: formatIsoDate(fyEnd),
    dayOfQuarter,
    daysInQuarter,
    daysLeftInQuarter: daysInQuarter - dayOfQuarter,
    dayOfFiscalYear,
    daysInFiscalYear,
    progressPctQuarter: Math.round((dayOfQuarter / daysInQuarter) * 1000) / 10,
    progressPctYear: Math.round((dayOfFiscalYear / daysInFiscalYear) * 1000) / 10,
  };
}

/**
 * Fiscal quarter -> calendar date range.
 *
 * @param {object} input
 * @param {number} input.labelYear     The year as written in the label (meaning depends on
 *                                     the convention).
 * @param {number} input.quarter       1-4.
 * @param {number} input.fyStartMonth  1-12.
 * @param {string} input.convention    "start" | "end".
 */
export function fiscalToRange({ labelYear, quarter, fyStartMonth = 4, convention = "start" }) {
  const year = Number(labelYear);
  const q = Number(quarter);
  if (!Number.isInteger(year) || year < 1900 || year > 3000) {
    return { error: "Enter a fiscal year between 1900 and 3000." };
  }
  if (!Number.isInteger(q) || q < 1 || q > QUARTERS_PER_YEAR) {
    return { error: "Quarter must be 1, 2, 3 or 4." };
  }
  if (!isValidMonth(fyStartMonth)) {
    return { error: "Fiscal year start month must be between 1 and 12." };
  }
  if (convention !== "start" && convention !== "end") {
    return { error: "Choose a year-labelling convention." };
  }

  // Resolve the calendar year the fiscal year starts in.
  const fyStartYear = fyStartMonth === 1 || convention === "start" ? year : year - 1;

  const quarterStartMonthIndex = fyStartMonth - 1 + (q - 1) * MONTHS_PER_QUARTER;
  const start = new Date(Date.UTC(fyStartYear, quarterStartMonthIndex, 1));
  const end = new Date(Date.UTC(fyStartYear, quarterStartMonthIndex + MONTHS_PER_QUARTER, 0));
  const days = Math.round((end.getTime() - start.getTime()) / MS_PER_DAY) + 1;

  const months = [0, 1, 2].map((offset) => {
    const d = new Date(Date.UTC(fyStartYear, quarterStartMonthIndex + offset, 1));
    return `${MONTH_NAMES[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  });

  return {
    fiscalLabel: `Q${q} ${fiscalYearLabel(fyStartYear, fyStartMonth, convention)}`,
    fyStartYear,
    start: formatIsoDate(start),
    end: formatIsoDate(end),
    days,
    months,
  };
}
