/**
 * Quarterly TDS and TCS compliance calendar for an Indian financial year.
 *
 * Statements (Rule 31A of the Income-tax Rules, 1962):
 *   Form 24Q  salary TDS
 *   Form 26Q  TDS on payments to residents other than salary
 *   Form 27Q  TDS on payments to non-residents
 *   Due 31 July, 31 October, 31 January and 31 May for Q1 to Q4.
 *
 * TCS statement (Rule 31AA):
 *   Form 27EQ due 15 July, 15 October, 15 January and 15 May.
 *
 * Certificates:
 *   Form 16  annual salary certificate, due by 15 June following the year (Rule 31).
 *   Form 16A within 15 days of the statement due date, so 15 August,
 *            15 November, 15 February and 15 June.
 *   Form 27D within 15 days of the Form 27EQ due date, so 30 July, 30 October,
 *            30 January and 30 May.
 *
 * Deposit of tax (Rule 30): by the 7th of the following month, except tax
 * deducted in March which is payable by 30 April.
 *
 * Consequences of missing a statement:
 *   Section 234E — Rs 200 for every day of delay, never more than the tax.
 *   Section 271H — penalty of Rs 10,000 to Rs 1,00,000, which is not levied if
 *     the statement is filed within one year of the due date and the tax,
 *     interest and fee have been paid.
 *   Section 201(1A) — interest at 1% a month for late deduction and 1.5% a
 *     month for tax deducted but deposited late, counted for a month or part.
 */

/** Late filing fee under section 234E, per day. */
export const LATE_FEE_PER_DAY = 200;

/** Penalty band under section 271H. */
export const PENALTY_271H_MIN = 10000;
export const PENALTY_271H_MAX = 100000;

/** Interest under section 201(1A), per month or part of a month. */
export const INTEREST_LATE_DEDUCTION_PCT = 1;
export const INTEREST_LATE_DEPOSIT_PCT = 1.5;

/** Statements filed every quarter. */
export const STATEMENT_FORMS = [
  { id: "24Q", label: "Form 24Q", what: "TDS on salary" },
  { id: "26Q", label: "Form 26Q", what: "TDS on payments to residents other than salary" },
  { id: "27Q", label: "Form 27Q", what: "TDS on payments to non-residents" },
  { id: "27EQ", label: "Form 27EQ", what: "TCS collected" },
];

/**
 * Quarter definitions. `dueOffsetYear` is 0 when the deadline falls in the same
 * calendar year the financial year starts in, and 1 when it falls in the next.
 */
export const QUARTERS = [
  {
    id: "Q1",
    label: "Q1 — April to June",
    startMonth: 4,
    endMonth: 6,
    startOffsetYear: 0,
    tdsStatement: { month: 7, day: 31, offsetYear: 0 },
    tcsStatement: { month: 7, day: 15, offsetYear: 0 },
    form16a: { month: 8, day: 15, offsetYear: 0 },
    form27d: { month: 7, day: 30, offsetYear: 0 },
  },
  {
    id: "Q2",
    label: "Q2 — July to September",
    startMonth: 7,
    endMonth: 9,
    startOffsetYear: 0,
    tdsStatement: { month: 10, day: 31, offsetYear: 0 },
    tcsStatement: { month: 10, day: 15, offsetYear: 0 },
    form16a: { month: 11, day: 15, offsetYear: 0 },
    form27d: { month: 10, day: 30, offsetYear: 0 },
  },
  {
    id: "Q3",
    label: "Q3 — October to December",
    startMonth: 10,
    endMonth: 12,
    startOffsetYear: 0,
    tdsStatement: { month: 1, day: 31, offsetYear: 1 },
    tcsStatement: { month: 1, day: 15, offsetYear: 1 },
    form16a: { month: 2, day: 15, offsetYear: 1 },
    form27d: { month: 1, day: 30, offsetYear: 1 },
  },
  {
    id: "Q4",
    label: "Q4 — January to March",
    startMonth: 1,
    endMonth: 3,
    startOffsetYear: 1,
    tdsStatement: { month: 5, day: 31, offsetYear: 1 },
    tcsStatement: { month: 5, day: 15, offsetYear: 1 },
    form16a: { month: 6, day: 15, offsetYear: 1 },
    form27d: { month: 5, day: 30, offsetYear: 1 },
  },
];

/** Form 16 for the year is due on 15 June following the financial year. */
export const FORM_16_DUE = { month: 6, day: 15, offsetYear: 1 };

const pad = (value) => String(value).padStart(2, "0");
const round2 = (value) => Math.round(value * 100) / 100;

const isIsoDate = (value) =>
  typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);

function isoFrom(fyStartYear, spec) {
  return `${fyStartYear + spec.offsetYear}-${pad(spec.month)}-${pad(spec.day)}`;
}

/** Label such as "FY 2025-26" for a financial year starting in the given year. */
export function financialYearLabel(fyStartYear) {
  if (!Number.isInteger(fyStartYear)) return "";
  return `FY ${fyStartYear}-${pad((fyStartYear + 1) % 100)}`;
}

/**
 * Whole days from one ISO date to another. Positive means `target` is ahead.
 * Pure — the current date is always supplied by the caller.
 */
export function daysBetween(fromIso, targetIso) {
  if (!isIsoDate(fromIso) || !isIsoDate(targetIso)) return null;
  const from = Date.UTC(
    Number(fromIso.slice(0, 4)),
    Number(fromIso.slice(5, 7)) - 1,
    Number(fromIso.slice(8, 10)),
  );
  const target = Date.UTC(
    Number(targetIso.slice(0, 4)),
    Number(targetIso.slice(5, 7)) - 1,
    Number(targetIso.slice(8, 10)),
  );
  return Math.round((target - from) / 86400000);
}

/** Classify a deadline relative to a reference date. */
export function deadlineStatus(dueIso, todayIso) {
  const days = daysBetween(todayIso, dueIso);
  if (days === null) return { days: null, status: "unknown" };
  if (days < 0) return { days, status: "overdue" };
  if (days === 0) return { days, status: "due-today" };
  if (days <= 15) return { days, status: "due-soon" };
  return { days, status: "upcoming" };
}

/**
 * Full quarterly calendar for a financial year.
 *
 * @param {number} fyStartYear Calendar year the financial year begins in (2025 = FY 2025-26).
 * @param {string} todayIso    Reference date, so the function stays pure.
 * @returns {object} calendar, or { error } when the input is unusable.
 */
export function buildTdsCalendar(fyStartYear, todayIso) {
  if (!Number.isInteger(fyStartYear)) {
    return { error: "Choose a financial year." };
  }
  if (fyStartYear < 2000 || fyStartYear > 2100) {
    return { error: "Enter a financial year between 2000-01 and 2100-01." };
  }
  if (!isIsoDate(todayIso)) {
    return { error: "Enter today's date as YYYY-MM-DD." };
  }

  const quarters = QUARTERS.map((quarter) => {
    const tdsDue = isoFrom(fyStartYear, quarter.tdsStatement);
    const tcsDue = isoFrom(fyStartYear, quarter.tcsStatement);
    const form16aDue = isoFrom(fyStartYear, quarter.form16a);
    const form27dDue = isoFrom(fyStartYear, quarter.form27d);
    const periodStart = `${fyStartYear + quarter.startOffsetYear}-${pad(quarter.startMonth)}-01`;
    const endYear = fyStartYear + quarter.startOffsetYear;
    const periodEnd = `${endYear}-${pad(quarter.endMonth)}-${pad(
      new Date(Date.UTC(endYear, quarter.endMonth, 0)).getUTCDate(),
    )}`;

    return {
      id: quarter.id,
      label: quarter.label,
      periodStart,
      periodEnd,
      tdsStatementDue: tdsDue,
      tcsStatementDue: tcsDue,
      form16aDue,
      form27dDue,
      tdsStatus: deadlineStatus(tdsDue, todayIso),
      tcsStatus: deadlineStatus(tcsDue, todayIso),
    };
  });

  const form16Due = isoFrom(fyStartYear, FORM_16_DUE);

  // The next TDS statement deadline that has not yet passed.
  const upcoming = quarters
    .map((quarter) => ({ id: quarter.id, due: quarter.tdsStatementDue }))
    .filter((entry) => daysBetween(todayIso, entry.due) >= 0)
    .sort((a, b) => (a.due < b.due ? -1 : 1))[0];

  return {
    fyStartYear,
    fyLabel: financialYearLabel(fyStartYear),
    todayIso,
    quarters,
    form16Due,
    form16Status: deadlineStatus(form16Due, todayIso),
    nextDeadline: upcoming
      ? {
          quarter: upcoming.id,
          due: upcoming.due,
          days: daysBetween(todayIso, upcoming.due),
        }
      : null,
  };
}

/**
 * Monthly TDS deposit due dates for a financial year.
 * Rule 30 — the 7th of the following month, but 30 April for March deductions.
 */
export function depositDueDates(fyStartYear) {
  if (!Number.isInteger(fyStartYear) || fyStartYear < 2000 || fyStartYear > 2100) {
    return { error: "Choose a financial year." };
  }
  const months = [
    ["April", 4, 0],
    ["May", 5, 0],
    ["June", 6, 0],
    ["July", 7, 0],
    ["August", 8, 0],
    ["September", 9, 0],
    ["October", 10, 0],
    ["November", 11, 0],
    ["December", 12, 0],
    ["January", 1, 1],
    ["February", 2, 1],
    ["March", 3, 1],
  ];
  return {
    rows: months.map(([name, month, offset]) => {
      if (month === 3) {
        // March is the statutory exception.
        return { month: name, due: `${fyStartYear + offset}-04-30` };
      }
      const dueMonth = month === 12 ? 1 : month + 1;
      const dueOffset = month === 12 ? offset + 1 : offset;
      return { month: name, due: `${fyStartYear + dueOffset}-${pad(dueMonth)}-07` };
    }),
  };
}

/**
 * Section 234E late filing fee for a delayed statement.
 * Rs 200 for each day of delay, capped at the tax deducted or collected.
 */
export function lateFilingFee(daysLate, taxAmount) {
  if (!Number.isFinite(daysLate) || !Number.isFinite(taxAmount)) {
    return { error: "Enter the days of delay and the tax amount as numbers." };
  }
  if (daysLate < 0) return { error: "Days of delay cannot be negative." };
  if (taxAmount < 0) return { error: "Tax amount cannot be negative." };
  const days = Math.floor(daysLate);
  const raw = days * LATE_FEE_PER_DAY;
  return {
    daysLate: days,
    rawFee: raw,
    fee: round2(Math.min(raw, taxAmount)),
    capped: raw > taxAmount,
  };
}

/**
 * Interest under section 201(1A). Counted for every month or part of a month.
 * @param {number} taxAmount Tax involved (Rs).
 * @param {number} months Months or part months of delay.
 * @param {"late-deduction"|"late-deposit"} kind Which limb applies.
 */
export function interest201(taxAmount, months, kind = "late-deposit") {
  if (!Number.isFinite(taxAmount) || !Number.isFinite(months)) {
    return { error: "Enter the tax amount and months of delay as numbers." };
  }
  if (taxAmount < 0) return { error: "Tax amount cannot be negative." };
  if (months < 0) return { error: "Months of delay cannot be negative." };
  const rate =
    kind === "late-deduction" ? INTEREST_LATE_DEDUCTION_PCT : INTEREST_LATE_DEPOSIT_PCT;
  const wholeMonths = Math.ceil(months);
  return {
    rate,
    months: wholeMonths,
    interest: round2((taxAmount * rate * wholeMonths) / 100),
  };
}
