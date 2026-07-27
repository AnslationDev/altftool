/**
 * Indian financial year and assessment year from any date.
 *
 * THE RULE
 *   The financial year — the "previous year" defined in section 3 of the
 *   Income-tax Act, 1961 — runs from 1 April to 31 March. A date on or after
 *   1 April belongs to the financial year starting in that calendar year; a
 *   date in January, February or March belongs to the financial year that
 *   started the previous April.
 *
 *   The assessment year, defined in section 2(9), is the period of twelve
 *   months commencing on the 1st day of April immediately following the
 *   previous year. Income earned in FY 2024-25 is therefore assessed in
 *   AY 2025-26 — the assessment year is always the financial year plus one.
 *
 * QUARTERS
 *   Q1 April-June, Q2 July-September, Q3 October-December, Q4 January-March.
 *   Indian company reporting and TDS returns follow this, not the calendar year.
 *
 * STATUTORY DATES derived for the year (all "on or before"):
 *   Advance tax instalments, section 211: 15 June (15% of liability),
 *     15 September (45% cumulative), 15 December (75%), 15 March (100%).
 *   Return of income, section 139(1): 31 July of the assessment year for a
 *     taxpayer whose accounts need no audit; 31 October where audit under the
 *     Act applies; 30 November where a transfer-pricing report in Form 3CEB is
 *     required.
 *   Belated return under 139(4) and revised return under 139(5): 31 December of
 *     the assessment year.
 *   Updated return (ITR-U) under 139(8A): within 48 months from the end of the
 *     relevant assessment year, the window as extended by the Finance Act 2025.
 *
 * The CBDT extends these dates by circular in some years. Treat the figures
 * here as the statutory position, not a guarantee for a specific year.
 *
 * Every function is pure — the date is always an argument, never Date.now().
 */

/** The financial year begins on 1 April. */
export const FY_START_MONTH = 4;
export const FY_START_DAY = 1;

/** Sensible bounds so a typo cannot produce a nonsense year. */
export const MIN_YEAR = 1900;
export const MAX_YEAR = 2200;

/** ITR-U window in months from the end of the assessment year (Finance Act 2025). */
export const UPDATED_RETURN_WINDOW_MONTHS = 48;

export const QUARTERS = [
  { id: "Q1", label: "Q1", months: [4, 5, 6], span: "April to June" },
  { id: "Q2", label: "Q2", months: [7, 8, 9], span: "July to September" },
  { id: "Q3", label: "Q3", months: [10, 11, 12], span: "October to December" },
  { id: "Q4", label: "Q4", months: [1, 2, 3], span: "January to March" },
];

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

const MS_PER_DAY = 86400000;

const pad = (value, size = 2) => String(value).padStart(size, "0");

/** Build an ISO date string without touching the local timezone. */
export function toIso(year, month, day) {
  return `${pad(year, 4)}-${pad(month)}-${pad(day)}`;
}

/** Days in a month, honouring the Gregorian leap rule. */
export function daysInMonth(year, month) {
  if (month === 2) {
    const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    return leap ? 29 : 28;
  }
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

/** Parse "YYYY-MM-DD" strictly. Returns { error } for anything else. */
export function parseIsoDate(value) {
  if (typeof value !== "string") return { error: "Pick a date." };
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return { error: "Use a date in YYYY-MM-DD form." };

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (year < MIN_YEAR || year > MAX_YEAR) {
    return { error: `Pick a year between ${MIN_YEAR} and ${MAX_YEAR}.` };
  }
  if (month < 1 || month > 12) return { error: "Month must be between 01 and 12." };
  if (day < 1 || day > daysInMonth(year, month)) {
    return { error: `${MONTH_NAMES[month - 1]} ${year} has ${daysInMonth(year, month)} days.` };
  }
  return { year, month, day };
}

/** Whole days from one calendar date to another, both parsed and valid. */
function daysBetween(a, b) {
  return Math.round((Date.UTC(b.year, b.month - 1, b.day) - Date.UTC(a.year, a.month - 1, a.day)) / MS_PER_DAY);
}

/** "2024-25" from a starting year of 2024. */
export function yearLabel(startYear) {
  return `${startYear}-${pad((startYear + 1) % 100)}`;
}

function readable({ year, month, day }) {
  return `${day} ${MONTH_NAMES[month - 1]} ${year}`;
}

/**
 * Map a date to its financial year, assessment year, quarter and due dates.
 *
 * @param {string} isoDate "YYYY-MM-DD"
 * @returns {object} the mapping, or { error }
 */
export function financialYearFor(isoDate) {
  const parsed = parseIsoDate(isoDate);
  if (parsed.error) return { error: parsed.error };

  const { year, month, day } = parsed;

  // On or after 1 April the financial year starts this calendar year.
  const fyStartYear = month >= FY_START_MONTH ? year : year - 1;
  if (fyStartYear < MIN_YEAR || fyStartYear + 2 > MAX_YEAR) {
    return { error: `Dates near ${MIN_YEAR} and ${MAX_YEAR} fall outside the supported range.` };
  }
  const ayStartYear = fyStartYear + 1;

  const fyStart = { year: fyStartYear, month: 4, day: 1 };
  const fyEnd = { year: fyStartYear + 1, month: 3, day: 31 };
  const ayStart = { year: ayStartYear, month: 4, day: 1 };
  const ayEnd = { year: ayStartYear + 1, month: 3, day: 31 };

  const quarter = QUARTERS.find((q) => q.months.includes(month));
  const daysInFy = daysBetween(fyStart, fyEnd) + 1;
  const dayOfFy = daysBetween(fyStart, parsed) + 1;

  // Advance tax instalments fall inside the financial year itself.
  const advanceTax = [
    { id: "q1", label: "First instalment — 15% of the estimated liability", date: { year: fyStartYear, month: 6, day: 15 } },
    { id: "q2", label: "Second instalment — 45% cumulative", date: { year: fyStartYear, month: 9, day: 15 } },
    { id: "q3", label: "Third instalment — 75% cumulative", date: { year: fyStartYear, month: 12, day: 15 } },
    { id: "q4", label: "Fourth instalment — 100% cumulative", date: { year: fyStartYear + 1, month: 3, day: 15 } },
  ];

  // Filing dates fall in the assessment year.
  const filing = [
    { id: "itr-normal", label: "Return under section 139(1), no audit required", date: { year: ayStartYear, month: 7, day: 31 } },
    { id: "itr-audit", label: "Return where a tax audit applies", date: { year: ayStartYear, month: 10, day: 31 } },
    { id: "itr-tp", label: "Return where a transfer-pricing report in Form 3CEB is required", date: { year: ayStartYear, month: 11, day: 30 } },
    { id: "itr-belated", label: "Belated return under 139(4) or revised return under 139(5)", date: { year: ayStartYear, month: 12, day: 31 } },
    {
      id: "itr-updated",
      label: `Updated return under 139(8A), ${UPDATED_RETURN_WINDOW_MONTHS} months from the end of the assessment year`,
      date: { year: ayStartYear + 1 + UPDATED_RETURN_WINDOW_MONTHS / 12, month: 3, day: 31 },
    },
  ];

  const decorate = (entry) => ({
    ...entry,
    iso: toIso(entry.date.year, entry.date.month, entry.date.day),
    readable: readable(entry.date),
    daysFromInput: daysBetween(parsed, entry.date),
  });

  return {
    input: { ...parsed, iso: toIso(year, month, day), readable: readable(parsed) },
    fyStartYear,
    fyLabel: yearLabel(fyStartYear),
    fyStart: { ...fyStart, iso: toIso(fyStart.year, fyStart.month, fyStart.day), readable: readable(fyStart) },
    fyEnd: { ...fyEnd, iso: toIso(fyEnd.year, fyEnd.month, fyEnd.day), readable: readable(fyEnd) },
    ayStartYear,
    ayLabel: yearLabel(ayStartYear),
    ayStart: { ...ayStart, iso: toIso(ayStart.year, ayStart.month, ayStart.day), readable: readable(ayStart) },
    ayEnd: { ...ayEnd, iso: toIso(ayEnd.year, ayEnd.month, ayEnd.day), readable: readable(ayEnd) },
    quarter: quarter.id,
    quarterSpan: quarter.span,
    monthName: MONTH_NAMES[month - 1],
    daysInFy,
    dayOfFy,
    daysRemainingInFy: daysInFy - dayOfFy,
    fyElapsedPct: Math.round((dayOfFy / daysInFy) * 10000) / 100,
    isLeapFy: daysInFy === 366,
    advanceTax: advanceTax.map(decorate),
    filing: filing.map(decorate),
  };
}

/** Reverse lookup: the date span of a financial year given its starting year. */
export function spanForFinancialYear(fyStartYear) {
  if (!Number.isInteger(fyStartYear)) return { error: "Enter the starting year as a whole number." };
  if (fyStartYear < MIN_YEAR || fyStartYear + 2 > MAX_YEAR) {
    return { error: `Starting year must be between ${MIN_YEAR} and ${MAX_YEAR - 2}.` };
  }
  return {
    fyLabel: yearLabel(fyStartYear),
    ayLabel: yearLabel(fyStartYear + 1),
    fyStartIso: toIso(fyStartYear, 4, 1),
    fyEndIso: toIso(fyStartYear + 1, 3, 31),
    ayStartIso: toIso(fyStartYear + 1, 4, 1),
    ayEndIso: toIso(fyStartYear + 2, 3, 31),
  };
}
