/**
 * Indian payroll statutory due dates for a given wage month.
 *
 * Rule sources used below:
 *  - EPF contribution / ECR: Para 38(1) of the Employees' Provident Funds
 *    Scheme, 1952 — remit within 15 days of the close of the wage month.
 *  - ESI contribution: Regulation 31 of the Employees' State Insurance
 *    (General) Regulations, 1950 — pay within 15 days of the last day of the
 *    calendar month in which the contribution falls due.
 *  - TDS on salary: Rule 30 of the Income-tax Rules, 1962 — deposit by the 7th
 *    of the following month, except tax deducted in March which is due by
 *    30 April.
 *  - Quarterly TDS statement Form 24Q: Rule 31A — 31 July, 31 October,
 *    31 January and 31 May for Q1 to Q4 respectively.
 *  - Form 16: Rule 31(3) — issue by 15 June following the financial year.
 *  - Payment of Bonus Act, 1965 Section 19 — pay within 8 months of the close
 *    of the accounting year.
 *  - Professional tax: each state's own Act and Rules (see PT_STATES).
 *
 * Every function here is pure. Dates are handled in UTC so the output does not
 * change with the viewer's timezone, and any "today" must be passed in.
 */

const MS_PER_DAY = 86_400_000;

export const MONTH_NAMES = [
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

/** EPF and ESI contributions are both due on the 15th of the following month. */
export const EPF_DUE_DAY = 15;
export const ESI_DUE_DAY = 15;
/** TDS on salary: 7th of the following month, 30 April for March deductions. */
export const TDS_DUE_DAY = 7;
export const TDS_MARCH_DUE_MONTH = 4;
export const TDS_MARCH_DUE_DAY = 30;

/** Interest and damages rates for late deposits. */
export const EPF_INTEREST_PCT_PA = 12; // Section 7Q, EPF & MP Act 1952
export const ESI_INTEREST_PCT_PA = 12; // Regulation 31A, ESI (General) Regulations 1950
export const TDS_INTEREST_PCT_PER_MONTH = 1.5; // Section 201(1A)(ii), Income-tax Act 1961
/** Section 14B damages, graded by the length of the default (Para 32A). */
export const EPF_DAMAGES_SLABS = [
  { maxMonths: 2, pctPa: 5 },
  { maxMonths: 4, pctPa: 10 },
  { maxMonths: 6, pctPa: 15 },
  { maxMonths: Infinity, pctPa: 25 },
];

/**
 * Professional tax deposit rules by state. `kind` is "monthly" (pay by
 * `dueDay` of the month following the wage month), "monthly-last-day" (pay by
 * the last day of the following month) or "half-yearly".
 */
export const PT_STATES = [
  {
    id: "MH",
    name: "Maharashtra",
    kind: "monthly-last-day",
    act: "Maharashtra State Tax on Professions, Trades, Callings and Employments Act, 1975",
    note: "Monthly PTRC filers (previous-year liability at or above Rs 50,000) pay by the last day of the following month. Smaller employers file and pay annually by 31 March.",
  },
  {
    id: "KA",
    name: "Karnataka",
    kind: "monthly",
    dueDay: 20,
    act: "Karnataka Tax on Professions, Trades, Callings and Employments Act, 1976",
    note: "Employers remit the deduction with the monthly statement in Form 5A by the 20th.",
  },
  {
    id: "WB",
    name: "West Bengal",
    kind: "monthly",
    dueDay: 21,
    act: "West Bengal State Tax on Professions, Trades, Callings and Employments Act, 1979",
    note: "Monthly e-payment by the 21st; the annual employer return in Form III is filed after the year ends.",
  },
  {
    id: "TN",
    name: "Tamil Nadu",
    kind: "half-yearly",
    act: "Tamil Nadu Municipal Laws (Second Amendment) Act, 1998",
    note: "Levied by the local body on half-yearly income, payable for the April-September and October-March halves.",
  },
  {
    id: "TG",
    name: "Telangana",
    kind: "monthly",
    dueDay: 10,
    act: "Telangana Tax on Professions, Trades, Callings and Employments Act, 1987",
    note: "Monthly return and payment in Form V by the 10th.",
  },
  {
    id: "AP",
    name: "Andhra Pradesh",
    kind: "monthly",
    dueDay: 10,
    act: "Andhra Pradesh Tax on Professions, Trades, Callings and Employments Act, 1987",
    note: "Monthly return and payment in Form V by the 10th.",
  },
  {
    id: "GJ",
    name: "Gujarat",
    kind: "monthly",
    dueDay: 15,
    act: "Gujarat State Tax on Professions, Trades, Callings and Employments Act, 1976",
    note: "Employers registered with the local authority remit by the 15th.",
  },
  {
    id: "MP",
    name: "Madhya Pradesh",
    kind: "monthly",
    dueDay: 10,
    act: "Madhya Pradesh Vritti Kar Adhiniyam, 1995",
    note: "Monthly deposit by the 10th of the following month.",
  },
  {
    id: "OD",
    name: "Odisha",
    kind: "monthly",
    dueDay: 15,
    act: "Odisha State Tax on Professions, Trades, Callings and Employments Act, 2000",
    note: "Monthly deposit by the 15th of the following month.",
  },
  {
    id: "NONE",
    name: "No professional tax (Delhi, Haryana, UP, and others)",
    kind: "none",
    act: "—",
    note: "Several states and union territories do not levy professional tax, so only PF, ESI and TDS apply.",
  },
];

export const PT_STATE_IDS = PT_STATES.map((state) => state.id);

const utcDate = (year, month, day) => new Date(Date.UTC(year, month - 1, day));

const daysInMonth = (year, month) => new Date(Date.UTC(year, month, 0)).getUTCDate();

const toISO = (date) => date.toISOString().slice(0, 10);

const isWeekend = (date) => {
  const day = date.getUTCDay();
  return day === 0 || day === 6;
};

const parseISO = (value) => {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime())
      ? null
      : utcDate(value.getUTCFullYear(), value.getUTCMonth() + 1, value.getUTCDate());
  }
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > daysInMonth(year, month)) return null;
  return utcDate(year, month, day);
};

/** The month immediately after the wage month, rolling the year over. */
const nextMonth = (year, month) =>
  month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };

/** Financial year (April-March) that contains the given wage month. */
export function financialYearOf(year, month) {
  const startYear = month >= 4 ? year : year - 1;
  return { startYear, endYear: startYear + 1, label: `${startYear}-${String((startYear + 1) % 100).padStart(2, "0")}` };
}

function decorate(item, referenceDate) {
  const date = parseISO(item.dueDate);
  const weekend = isWeekend(date);
  let daysRemaining = null;
  let status = "unknown";
  if (referenceDate) {
    daysRemaining = Math.round((date.getTime() - referenceDate.getTime()) / MS_PER_DAY);
    if (daysRemaining < 0) status = "overdue";
    else if (daysRemaining === 0) status = "due-today";
    else if (daysRemaining <= 3) status = "due-soon";
    else status = "upcoming";
  }
  return {
    ...item,
    dueDateLabel: `${date.getUTCDate()} ${MONTH_NAMES[date.getUTCMonth()]} ${date.getUTCFullYear()}`,
    weekend,
    daysRemaining,
    status,
  };
}

/** Professional tax due date for a wage month, given the state rule. */
export function professionalTaxDueDate({ year, month, state }) {
  const rule = PT_STATES.find((entry) => entry.id === state);
  if (!rule || rule.kind === "none") return null;

  if (rule.kind === "half-yearly") {
    // April-September half is payable by 30 September; October-March by 31 March.
    if (month >= 4 && month <= 9) {
      return { dueDate: toISO(utcDate(year, 9, 30)), period: `April-September ${year}` };
    }
    const endYear = month >= 10 ? year + 1 : year;
    const startYear = month >= 10 ? year : year - 1;
    return { dueDate: toISO(utcDate(endYear, 3, 31)), period: `October ${startYear} - March ${endYear}` };
  }

  const next = nextMonth(year, month);
  if (rule.kind === "monthly-last-day") {
    return { dueDate: toISO(utcDate(next.year, next.month, daysInMonth(next.year, next.month))) };
  }
  const day = Math.min(rule.dueDay, daysInMonth(next.year, next.month));
  return { dueDate: toISO(utcDate(next.year, next.month, day)) };
}

/**
 * Statutory deadlines that follow a single wage month.
 *
 * @param {object} input
 * @param {number} input.year   Wage month's calendar year, e.g. 2026.
 * @param {number} input.month  Wage month 1-12.
 * @param {string} input.state  Professional tax state id from PT_STATES.
 * @param {string|Date} [input.referenceDate] "Today", for days-remaining.
 * @returns {object} { wageMonthLabel, financialYear, items } or { error }.
 */
export function buildMonthlyDueDates({ year, month, state = "MH", referenceDate = null }) {
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    return { error: "Choose a wage month year between 2000 and 2100." };
  }
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    return { error: "Choose a wage month between January and December." };
  }
  const reference = referenceDate ? parseISO(referenceDate) : null;
  if (referenceDate && !reference) {
    return { error: "The reference date must be a valid calendar date." };
  }

  const next = nextMonth(year, month);
  const nextMonthDays = daysInMonth(next.year, next.month);
  const items = [];

  items.push({
    id: "tds",
    label: "TDS on salary — deposit challan",
    authority: "Income Tax Department",
    dueDate:
      month === 3
        ? toISO(utcDate(year, TDS_MARCH_DUE_MONTH, TDS_MARCH_DUE_DAY))
        : toISO(utcDate(next.year, next.month, Math.min(TDS_DUE_DAY, nextMonthDays))),
    rule: "Rule 30, Income-tax Rules 1962",
    note:
      month === 3
        ? "Tax deducted in March may be deposited up to 30 April."
        : "Deposit by the 7th of the month following deduction.",
  });

  items.push({
    id: "epf",
    label: "EPF — ECR upload and contribution payment",
    authority: "EPFO",
    dueDate: toISO(utcDate(next.year, next.month, Math.min(EPF_DUE_DAY, nextMonthDays))),
    rule: "Para 38(1), EPF Scheme 1952",
    note: "Employee 12% plus employer 12% with EPS and admin charges, remitted through the ECR.",
  });

  items.push({
    id: "esi",
    label: "ESI — contribution payment",
    authority: "ESIC",
    dueDate: toISO(utcDate(next.year, next.month, Math.min(ESI_DUE_DAY, nextMonthDays))),
    rule: "Regulation 31, ESI (General) Regulations 1950",
    note: "Employee 0.75% and employer 3.25% of wages for covered employees.",
  });

  const ptRule = PT_STATES.find((entry) => entry.id === state);
  const pt = professionalTaxDueDate({ year, month, state });
  if (pt && ptRule) {
    items.push({
      id: "pt",
      label: `Professional tax — ${ptRule.name}${pt.period ? ` (${pt.period})` : ""}`,
      authority: `${ptRule.name} professional tax authority`,
      dueDate: pt.dueDate,
      rule: ptRule.act,
      note: ptRule.note,
    });
  }

  const decorated = items
    .map((item) => decorate(item, reference))
    .sort((a, b) => (a.dueDate < b.dueDate ? -1 : a.dueDate > b.dueDate ? 1 : 0));

  return {
    wageMonthLabel: `${MONTH_NAMES[month - 1]} ${year}`,
    financialYear: financialYearOf(year, month).label,
    ptStateName: ptRule ? ptRule.name : "—",
    ptNote: ptRule ? ptRule.note : "",
    items: decorated,
    nextDue: decorated.find((item) => item.status === "upcoming" || item.status === "due-soon" || item.status === "due-today") || null,
  };
}

/**
 * Quarterly and annual deadlines for the financial year that contains the wage
 * month. `startYear` is the April year, so 2026 means FY 2026-27.
 */
export function buildAnnualDueDates({ startYear, referenceDate = null }) {
  if (!Number.isInteger(startYear) || startYear < 2000 || startYear > 2100) {
    return { error: "Choose a financial year between 2000 and 2100." };
  }
  const reference = referenceDate ? parseISO(referenceDate) : null;
  if (referenceDate && !reference) {
    return { error: "The reference date must be a valid calendar date." };
  }
  const endYear = startYear + 1;

  const items = [
    {
      id: "24q-q1",
      label: "Form 24Q — Q1 salary TDS statement (Apr-Jun)",
      authority: "Income Tax Department",
      dueDate: toISO(utcDate(startYear, 7, 31)),
      rule: "Rule 31A, Income-tax Rules 1962",
      note: "Late filing attracts Rs 200 per day under Section 234E.",
    },
    {
      id: "24q-q2",
      label: "Form 24Q — Q2 salary TDS statement (Jul-Sep)",
      authority: "Income Tax Department",
      dueDate: toISO(utcDate(startYear, 10, 31)),
      rule: "Rule 31A, Income-tax Rules 1962",
      note: "The ESI contribution period April-September also closes on 30 September.",
    },
    {
      id: "bonus",
      label: "Statutory bonus payment for the previous accounting year",
      authority: "Labour department",
      dueDate: toISO(utcDate(startYear, 11, 30)),
      rule: "Section 19, Payment of Bonus Act 1965",
      note: "Payable within 8 months of the close of the accounting year ended 31 March.",
    },
    {
      id: "24q-q3",
      label: "Form 24Q — Q3 salary TDS statement (Oct-Dec)",
      authority: "Income Tax Department",
      dueDate: toISO(utcDate(endYear, 1, 31)),
      rule: "Rule 31A, Income-tax Rules 1962",
      note: "Collect employee investment proofs before finalising Q4 TDS.",
    },
    {
      id: "24q-q4",
      label: "Form 24Q — Q4 salary TDS statement (Jan-Mar)",
      authority: "Income Tax Department",
      dueDate: toISO(utcDate(endYear, 5, 31)),
      rule: "Rule 31A, Income-tax Rules 1962",
      note: "Annexure II with the full-year salary detail is filed with this quarter.",
    },
    {
      id: "form16",
      label: "Form 16 issued to employees",
      authority: "Income Tax Department",
      dueDate: toISO(utcDate(endYear, 6, 15)),
      rule: "Rule 31(3), Income-tax Rules 1962",
      note: "Generate Part A from TRACES after the Q4 statement is processed.",
    },
  ];

  const decorated = items
    .map((item) => decorate(item, reference))
    .sort((a, b) => (a.dueDate < b.dueDate ? -1 : a.dueDate > b.dueDate ? 1 : 0));

  return {
    financialYear: `${startYear}-${String(endYear % 100).padStart(2, "0")}`,
    items: decorated,
  };
}

/** Damages rate under Section 14B for a default of the given length. */
export function epfDamagesRate(monthsLate) {
  const slab = EPF_DAMAGES_SLABS.find((entry) => monthsLate < entry.maxMonths);
  return slab ? slab.pctPa : EPF_DAMAGES_SLABS[EPF_DAMAGES_SLABS.length - 1].pctPa;
}

/**
 * Cost of depositing late.
 *
 * EPF and ESI carry simple interest at 12% a year for the days of delay; EPF
 * also carries graded damages under Section 14B. TDS carries 1.5% for every
 * month or part of a month, counted on calendar months, so a one-day delay that
 * crosses into the next month already costs two months of interest.
 *
 * @returns {object} { days, interest, damages, total } or { error }.
 */
export function computeDelayCost({ scheme, amount, dueDate, paidDate }) {
  if (!["epf", "esi", "tds"].includes(scheme)) {
    return { error: "Choose EPF, ESI or TDS." };
  }
  if (typeof amount !== "number" || !Number.isFinite(amount) || amount < 0) {
    return { error: "Enter a contribution amount of zero or more." };
  }
  const due = parseISO(dueDate);
  const paid = parseISO(paidDate);
  if (!due || !paid) return { error: "Enter valid due and payment dates." };

  const days = Math.max(0, Math.round((paid.getTime() - due.getTime()) / MS_PER_DAY));
  if (days === 0) {
    return { days: 0, monthsOrPart: 0, interest: 0, damages: 0, damagesRatePct: 0, total: 0 };
  }

  if (scheme === "tds") {
    const monthsOrPart =
      (paid.getUTCFullYear() - due.getUTCFullYear()) * 12 +
      (paid.getUTCMonth() - due.getUTCMonth()) +
      1;
    const interest = (amount * TDS_INTEREST_PCT_PER_MONTH * Math.max(1, monthsOrPart)) / 100;
    return {
      days,
      monthsOrPart: Math.max(1, monthsOrPart),
      interest,
      damages: 0,
      damagesRatePct: 0,
      total: interest,
    };
  }

  const ratePa = scheme === "epf" ? EPF_INTEREST_PCT_PA : ESI_INTEREST_PCT_PA;
  const interest = (amount * ratePa * days) / (100 * 365);
  if (scheme === "esi") {
    return { days, monthsOrPart: 0, interest, damages: 0, damagesRatePct: 0, total: interest };
  }

  const monthsLate = days / 30;
  const damagesRatePct = epfDamagesRate(monthsLate);
  const damages = (amount * damagesRatePct * days) / (100 * 365);
  return { days, monthsOrPart: 0, interest, damages, damagesRatePct, total: interest + damages };
}
