/**
 * MCA / ROC filing calendar and per-form additional-fee calculator.
 *
 * Everything here is pure: same input -> same output, no Date.now(). Every
 * "today" is passed in as `asOnDate`. All date maths runs in UTC so a viewer in
 * IST and a viewer in UTC-8 see the same due dates.
 *
 * RULE SOURCES (each constant below repeats its own citation).
 * Statutory due dates
 *  - Companies Act 2013 s.2(41) - a company's financial year ends on 31 March;
 *    a company incorporated on or after 1 January of a year closes its first
 *    financial year on 31 March of the following year.
 *  - Companies Act 2013 s.96(1) - first AGM within 9 months of the close of the
 *    first financial year; every later AGM within 6 months of the close of the
 *    financial year and not more than 15 months after the previous AGM. A One
 *    Person Company is excluded from s.96 altogether.
 *  - Companies Act 2013 s.137(1) - AOC-4 within 30 days of the AGM; first
 *    proviso - an OPC files within 180 days of the close of the financial year.
 *  - Companies Act 2013 s.92(4) - MGT-7 within 60 days of the AGM; proviso -
 *    where no AGM is held, 60 days from the date the AGM should have been held.
 *    MGT-7A is the OPC / small-company form (Companies (Management and
 *    Administration) Amendment Rules 2021, G.S.R. 159(E), 5 March 2021).
 *  - Companies Act 2013 s.139(1) proviso and rule 4(2) of the Companies (Audit
 *    and Auditors) Rules 2014 - ADT-1 within 15 days of the meeting at which the
 *    auditor was appointed.
 *  - Rule 12A of the Companies (Appointment and Qualification of Directors)
 *    Rules 2014, as SUBSTITUTED by G.S.R. 943(E) dated 31 December 2025 with
 *    effect from 31 March 2026 - DIR-3 KYC Web is now triennial, due on or
 *    before 30 June, not annual by 30 September.
 *  - LLP Act 2008 s.35(1) and rule 25(1) of the LLP Rules 2009 - Form 11 within
 *    60 days of the close of the financial year.
 *  - LLP Act 2008 s.34(3) and rule 24(4) of the LLP Rules 2009 - Form 8 within
 *    30 days from the end of six months of the financial year.
 *  - LLP Act 2008 s.2(1)(l) - an LLP financial year runs 1 April to 31 March;
 *    proviso - an LLP incorporated after 30 September of a year may close its
 *    first financial year on 31 March of the year next following.
 *
 * Fee sources
 *  - Companies (Registration Offices and Fees) Rules 2014, Table of Fees
 *    (rule 12) - normal filing fee by nominal share capital, and the general
 *    table of additional fee (1x / 2x / 4x / 6x / 10x / 12x).
 *  - Note to that Table inserted by the Companies (Registration Offices and
 *    Fees) Second Amendment Rules 2018 (7 May 2018, in force 1 July 2018) -
 *    AOC-4 and MGT-7 carry a flat Rs 100 per day of delay, with no cap, instead
 *    of the multiplier slabs.
 *  - Companies (Registration Offices and Fees) Amendment Rules 2026,
 *    G.S.R. 300(E) dated 21 April 2026 - DIR-3 KYC Web: nil within time,
 *    Rs 5,000 if filed after the due date or to reactivate a DIN, Rs 500 for a
 *    later filing that only updates KYC particulars.
 *  - LLP Rules 2009, Annexure A, as substituted by the LLP (Amendment) Rules
 *    2022 notified 11 February 2022 with effect from 1 April 2022 - LLP normal
 *    fee by contribution, and the Form 8 / Form 11 additional-fee slabs which
 *    differ for a small LLP and any other LLP.
 *  - LLP Act 2008 s.2(1)(ta) (inserted by the LLP (Amendment) Act 2021, in
 *    force 1 April 2022) - small LLP definition.
 *
 * FEE RULES AS READ ON 29 JULY 2026. The latest fee amendment reflected here is
 * the Companies (Registration Offices and Fees) Amendment Rules 2026,
 * G.S.R. 300(E) dated 21 April 2026. LLP fees are on the 11 February 2022
 * amendment, in force 1 April 2022.
 */

const MS_PER_DAY = 86_400_000;

/** Date the fee tables above were read from source. */
export const FEE_RULES_READ_ON = "2026-07-29";
/** Most recent fee amendment reflected in this tool. */
export const LATEST_FEE_AMENDMENT =
  "Companies (Registration Offices and Fees) Amendment Rules, 2026 - G.S.R. 300(E) dated 21 April 2026";
/** Most recent LLP fee amendment reflected in this tool. */
export const LATEST_LLP_FEE_AMENDMENT =
  "LLP (Amendment) Rules, 2022 - notified 11 February 2022, in force 1 April 2022";

/* ------------------------------------------------------------------ */
/* Statutory periods                                                    */
/* ------------------------------------------------------------------ */

/** s.96(1) first proviso - first AGM within 9 months of the first FY close. */
export const FIRST_AGM_MONTHS = 9;
/** s.96(1) - every later AGM within 6 months of the FY close. */
export const SUBSEQUENT_AGM_MONTHS = 6;
/** s.96(1) - never more than 15 months between two AGMs. */
export const MAX_MONTHS_BETWEEN_AGMS = 15;
/** s.137(1) - AOC-4 within 30 days of the AGM. */
export const AOC4_DAYS_AFTER_AGM = 30;
/** s.137(1) first proviso - OPC files AOC-4 within 180 days of the FY close. */
export const AOC4_OPC_DAYS_AFTER_FY_END = 180;
/** s.92(4) - annual return within 60 days of the AGM (or the deemed AGM date). */
export const MGT7_DAYS_AFTER_AGM = 60;
/** s.139(1) proviso + rule 4(2) - ADT-1 within 15 days of the meeting. */
export const ADT1_DAYS_AFTER_MEETING = 15;
/** LLP s.35(1) + rule 25(1) - Form 11 within 60 days of the FY close. */
export const LLP_FORM11_DAYS_AFTER_FY_END = 60;
/** LLP s.34(3) + rule 24(4) - Form 8 within 30 days of the 6-month point. */
export const LLP_FORM8_MONTHS_AFTER_FY_END = 6;
export const LLP_FORM8_DAYS_AFTER_HALF_YEAR = 30;

/* ------------------------------------------------------------------ */
/* Fee tables                                                           */
/* ------------------------------------------------------------------ */

/**
 * Companies (Registration Offices and Fees) Rules 2014, Table of Fees, item I -
 * normal fee for filing a document by a company having share capital, by
 * nominal share capital. A company without share capital pays Rs 200.
 */
export const COMPANY_NORMAL_FEE_SLABS = [
  { belowCapital: 100_000, fee: 200, label: "Less than Rs 1,00,000" },
  { belowCapital: 500_000, fee: 300, label: "Rs 1,00,000 to under Rs 5,00,000" },
  { belowCapital: 2_500_000, fee: 400, label: "Rs 5,00,000 to under Rs 25,00,000" },
  { belowCapital: 10_000_000, fee: 500, label: "Rs 25,00,000 to under Rs 1,00,00,000" },
  { belowCapital: Infinity, fee: 600, label: "Rs 1,00,00,000 or more" },
];

/**
 * Companies (Registration Offices and Fees) Rules 2014 - general Table of
 * additional fee for a document filed after its due date. The "up to 15 days"
 * slab is available only for filings under sections 93, 139 and 157, which is
 * why ADT-1 (s.139) can land in it.
 */
export const COMPANY_ADDITIONAL_FEE_SLABS = [
  { throughDays: 15, times: 1, label: "Up to 15 days" },
  { throughDays: 30, times: 2, label: "More than 15 and up to 30 days" },
  { throughDays: 60, times: 4, label: "More than 30 and up to 60 days" },
  { throughDays: 90, times: 6, label: "More than 60 and up to 90 days" },
  { throughDays: 180, times: 10, label: "More than 90 and up to 180 days" },
  { throughDays: Infinity, times: 12, label: "Beyond 180 days" },
];

/**
 * Flat per-day additional fee for AOC-4 and MGT-7 / MGT-7A. Inserted by the
 * Companies (Registration Offices and Fees) Second Amendment Rules 2018
 * (7 May 2018), in force 1 July 2018. There is no cap on this amount.
 */
export const ANNUAL_FILING_FEE_PER_DAY = 100;

/**
 * DIR-3 KYC Web fees under the Companies (Registration Offices and Fees)
 * Amendment Rules 2026, G.S.R. 300(E) dated 21 April 2026.
 */
export const DIR3_KYC_LATE_FEE = 5_000;
export const DIR3_KYC_UPDATE_FEE = 500;

/**
 * Rule 12A as substituted by G.S.R. 943(E) dated 31 December 2025 (in force
 * 31 March 2026) makes DIR-3 KYC Web triennial, due on or before 30 June. MCA's
 * own worked example: a DIN holder whose KYC is current through FY 2025-26 next
 * files by 30 June 2028; the cycle then repeats every third financial year.
 */
export const DIR3_KYC_ANCHOR_DUE = "2028-06-30";
export const DIR3_KYC_CYCLE_YEARS = 3;
/** Rule 12A(2) - a change of mobile, e-mail or address is filed in 30 days. */
export const DIR3_KYC_CHANGE_DAYS = 30;

/**
 * LLP Rules 2009, Annexure A (substituted 11 February 2022, in force
 * 1 April 2022) - normal filing fee for Form 8 / Form 11 by total contribution.
 */
export const LLP_NORMAL_FEE_SLABS = [
  { throughContribution: 100_000, fee: 50, label: "Up to Rs 1,00,000" },
  { throughContribution: 500_000, fee: 100, label: "Above Rs 1,00,000 up to Rs 5,00,000" },
  { throughContribution: 1_000_000, fee: 150, label: "Above Rs 5,00,000 up to Rs 10,00,000" },
  { throughContribution: 2_500_000, fee: 200, label: "Above Rs 10,00,000 up to Rs 25,00,000" },
  { throughContribution: 10_000_000, fee: 400, label: "Above Rs 25,00,000 up to Rs 1,00,00,000" },
  { throughContribution: Infinity, fee: 600, label: "Above Rs 1,00,00,000" },
];

/**
 * LLP Rules 2009, Annexure A - additional fee on a late Form 8 or Form 11. A
 * small LLP pays half the multiple that any other LLP pays in every slab after
 * the first.
 */
export const LLP_ADDITIONAL_FEE_SLABS = [
  { throughDays: 15, small: 1, other: 1, label: "Up to 15 days" },
  { throughDays: 30, small: 2, other: 4, label: "More than 15 and up to 30 days" },
  { throughDays: 60, small: 4, other: 8, label: "More than 30 and up to 60 days" },
  { throughDays: 90, small: 6, other: 12, label: "More than 60 and up to 90 days" },
  { throughDays: 180, small: 10, other: 20, label: "More than 90 and up to 180 days" },
  { throughDays: 360, small: 15, other: 30, label: "More than 180 and up to 360 days" },
];
/** Beyond 360 days the multiple freezes and a per-day amount runs on top. */
export const LLP_BEYOND_360 = {
  small: { times: 15, perDay: 10 },
  other: { times: 30, perDay: 20 },
};
export const LLP_LONG_DELAY_DAYS = 360;

/** LLP Act s.2(1)(ta) - a small LLP must clear BOTH of these ceilings. */
export const SMALL_LLP_CONTRIBUTION_CAP = 2_500_000;
export const SMALL_LLP_TURNOVER_CAP = 4_000_000;

export const ENTITY_TYPES = [
  { id: "private", label: "Private limited company" },
  { id: "opc", label: "One Person Company (OPC)" },
  { id: "llp", label: "Limited Liability Partnership (LLP)" },
];

/* ------------------------------------------------------------------ */
/* Date helpers (UTC only)                                              */
/* ------------------------------------------------------------------ */

const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Parse "YYYY-MM-DD" into a UTC timestamp, or null if it is not a real date. */
export function parseISO(value) {
  if (typeof value !== "string") return null;
  const m = ISO_RE.exec(value.trim());
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (year < 1900 || year > 2200) return null;
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const ts = Date.UTC(year, month - 1, day);
  const back = new Date(ts);
  if (back.getUTCFullYear() !== year) return null;
  if (back.getUTCMonth() !== month - 1) return null;
  if (back.getUTCDate() !== day) return null;
  return ts;
}

/** Timestamp back to "YYYY-MM-DD". */
export function toISO(ts) {
  const d = new Date(ts);
  const y = String(d.getUTCFullYear()).padStart(4, "0");
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(ts, days) {
  return ts + days * MS_PER_DAY;
}

/** Add calendar months, clamping to the last day of the target month. */
function addMonths(ts, months) {
  const d = new Date(ts);
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth();
  const day = d.getUTCDate();
  const targetMonthIndex = month + months;
  const targetYear = year + Math.floor(targetMonthIndex / 12);
  const targetMonth = ((targetMonthIndex % 12) + 12) % 12;
  const lastDay = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
  return Date.UTC(targetYear, targetMonth, Math.min(day, lastDay));
}

function daysBetween(fromTs, toTs) {
  return Math.round((toTs - fromTs) / MS_PER_DAY);
}

/** Format an ISO date as "30 Sep 2026" without touching the local timezone. */
export function formatIndianDate(iso) {
  const ts = parseISO(iso);
  if (ts === null) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(ts));
}

/* ------------------------------------------------------------------ */
/* Derived statutory dates                                              */
/* ------------------------------------------------------------------ */

/**
 * Companies Act 2013 s.2(41): a company incorporated on or after 1 January of a
 * year closes its first financial year on 31 March of the following year. That
 * collapses to "31 March of the calendar year after the year of incorporation"
 * for every incorporation date, which is what this returns. The LLP Act
 * s.2(1)(l) proviso is a "may", so an LLP incorporated after 30 September can
 * instead run its first year to 31 March of the year after that.
 */
export function firstFinancialYearEnd(incorporationISO) {
  const ts = parseISO(incorporationISO);
  if (ts === null) return null;
  const year = new Date(ts).getUTCFullYear();
  return toISO(Date.UTC(year + 1, 2, 31));
}

/**
 * Last permissible AGM date under s.96(1). Returns { error } for bad input.
 * `previousAgmISO` is optional and only bites for a non-first AGM.
 */
export function agmLastDate({
  financialYearEnd,
  isFirstFinancialYear,
  previousAgmDate = "",
}) {
  const fyEnd = parseISO(financialYearEnd);
  if (fyEnd === null) {
    return { error: "Enter the financial year end as a real calendar date." };
  }
  if (isFirstFinancialYear) {
    return {
      dueDate: toISO(addMonths(fyEnd, FIRST_AGM_MONTHS)),
      basis: `Section 96(1) first proviso — 9 months from the close of the first financial year (${formatIndianDate(financialYearEnd)}).`,
      boundBy: "first-agm-9-months",
    };
  }
  const sixMonth = addMonths(fyEnd, SUBSEQUENT_AGM_MONTHS);
  const prev = previousAgmDate ? parseISO(previousAgmDate) : null;
  if (previousAgmDate && prev === null) {
    return { error: "Enter the previous AGM date as a real calendar date, or leave it blank." };
  }
  if (prev !== null && prev > fyEnd) {
    return {
      error:
        "The previous AGM date falls after this financial year end. The previous AGM relates to an earlier year, so it must be the earlier date.",
    };
  }
  if (prev === null) {
    return {
      dueDate: toISO(sixMonth),
      basis: `Section 96(1) — 6 months from the close of the financial year (${formatIndianDate(financialYearEnd)}).`,
      boundBy: "six-months",
    };
  }
  const fifteenMonthCap = addMonths(prev, MAX_MONTHS_BETWEEN_AGMS);
  if (fifteenMonthCap < sixMonth) {
    return {
      dueDate: toISO(fifteenMonthCap),
      basis: `Section 96(1) — the 15-month gap from the previous AGM on ${formatIndianDate(previousAgmDate)} expires before the 6-month date of ${formatIndianDate(toISO(sixMonth))}, so the earlier date governs.`,
      boundBy: "fifteen-month-gap",
    };
  }
  return {
    dueDate: toISO(sixMonth),
    basis: `Section 96(1) — 6 months from the close of the financial year; the 15-month gap from ${formatIndianDate(previousAgmDate)} only runs to ${formatIndianDate(toISO(fifteenMonthCap))}, which is later, so the 6-month date governs.`,
    boundBy: "six-months",
  };
}

/* ------------------------------------------------------------------ */
/* Fee engines - one per form family, because they genuinely differ     */
/* ------------------------------------------------------------------ */

/** Normal fee for a company e-form, by nominal share capital. */
export function companyNormalFee(paidUpCapital) {
  const capital = Number(paidUpCapital);
  if (!Number.isFinite(capital) || capital < 0) return null;
  const slab = COMPANY_NORMAL_FEE_SLABS.find((s) => capital < s.belowCapital);
  return { fee: slab.fee, slabLabel: slab.label };
}

/** Normal fee for LLP Form 8 / Form 11, by total contribution. */
export function llpNormalFee(contribution) {
  const amount = Number(contribution);
  if (!Number.isFinite(amount) || amount < 0) return null;
  const slab = LLP_NORMAL_FEE_SLABS.find((s) => amount <= s.throughContribution);
  return { fee: slab.fee, slabLabel: slab.label };
}

/** LLP Act s.2(1)(ta) - both ceilings must be met. */
export function isSmallLlp(contribution, turnover) {
  const c = Number(contribution);
  const t = Number(turnover);
  if (!Number.isFinite(c) || !Number.isFinite(t)) return null;
  return c <= SMALL_LLP_CONTRIBUTION_CAP && t <= SMALL_LLP_TURNOVER_CAP;
}

/** AOC-4 / MGT-7 / MGT-7A: flat Rs 100 a day, uncapped, from 1 July 2018. */
export function annualFilingAdditionalFee(daysLate) {
  const days = Math.max(0, Math.trunc(Number(daysLate) || 0));
  return {
    additionalFee: days * ANNUAL_FILING_FEE_PER_DAY,
    rule: `Rs ${ANNUAL_FILING_FEE_PER_DAY} per day of delay with no cap — note to the Table of Fees inserted by the Companies (Registration Offices and Fees) Second Amendment Rules, 2018, in force 1 July 2018.`,
    workingOut: days
      ? `${days} day${days === 1 ? "" : "s"} x Rs ${ANNUAL_FILING_FEE_PER_DAY}`
      : "Filed within time — no additional fee.",
  };
}

/** ADT-1 and other ordinary e-forms: the general multiplier slabs. */
export function slabAdditionalFee(daysLate, normalFee) {
  const days = Math.max(0, Math.trunc(Number(daysLate) || 0));
  const base = Number(normalFee);
  if (!Number.isFinite(base) || base < 0) return null;
  if (days === 0) {
    return {
      additionalFee: 0,
      multiple: 0,
      rule: "General Table of additional fee, Companies (Registration Offices and Fees) Rules, 2014.",
      workingOut: "Filed within time — no additional fee.",
    };
  }
  const slab = COMPANY_ADDITIONAL_FEE_SLABS.find((s) => days <= s.throughDays);
  return {
    additionalFee: slab.times * base,
    multiple: slab.times,
    rule: `General Table of additional fee, Companies (Registration Offices and Fees) Rules, 2014 — ${slab.label} means ${slab.times} time${slab.times === 1 ? "" : "s"} the normal fee. The "up to 15 days" slab is available because ADT-1 is filed under section 139.`,
    workingOut: `${days} day${days === 1 ? "" : "s"} late → ${slab.label} → ${slab.times}x Rs ${base}`,
  };
}

/** LLP Form 8 / Form 11: slabs that differ for a small LLP. */
export function llpAdditionalFee(daysLate, normalFee, smallLlp) {
  const days = Math.max(0, Math.trunc(Number(daysLate) || 0));
  const base = Number(normalFee);
  if (!Number.isFinite(base) || base < 0) return null;
  const key = smallLlp ? "small" : "other";
  const kindLabel = smallLlp ? "small LLP" : "LLP other than a small LLP";
  if (days === 0) {
    return {
      additionalFee: 0,
      multiple: 0,
      rule: `LLP Rules, 2009 Annexure A as substituted with effect from 1 April 2022 — additional fee slabs for a ${kindLabel}.`,
      workingOut: "Filed within time — no additional fee.",
    };
  }
  if (days > LLP_LONG_DELAY_DAYS) {
    const { times, perDay } = LLP_BEYOND_360[key];
    const extraDays = days - LLP_LONG_DELAY_DAYS;
    return {
      additionalFee: times * base + extraDays * perDay,
      multiple: times,
      rule: `LLP Rules, 2009 Annexure A (1 April 2022) — beyond 360 days a ${kindLabel} pays ${times} times the normal fee plus Rs ${perDay} for every day past 360.`,
      workingOut: `${times}x Rs ${base} + ${extraDays} day${extraDays === 1 ? "" : "s"} past 360 x Rs ${perDay}`,
    };
  }
  const slab = LLP_ADDITIONAL_FEE_SLABS.find((s) => days <= s.throughDays);
  const times = slab[key];
  return {
    additionalFee: times * base,
    multiple: times,
    rule: `LLP Rules, 2009 Annexure A (1 April 2022) — ${slab.label} means ${times} time${times === 1 ? "" : "s"} the normal fee for a ${kindLabel}.`,
    workingOut: `${days} day${days === 1 ? "" : "s"} late → ${slab.label} → ${times}x Rs ${base}`,
  };
}

/* ------------------------------------------------------------------ */
/* Row assembly                                                         */
/* ------------------------------------------------------------------ */

function statusFor(dueTs, filedTs, asOnTs) {
  if (filedTs !== null) {
    if (filedTs <= dueTs) {
      return { status: "filed-on-time", label: "Filed on time", daysLate: 0 };
    }
    return {
      status: "filed-late",
      label: "Filed late",
      daysLate: daysBetween(dueTs, filedTs),
    };
  }
  if (asOnTs <= dueTs) {
    return {
      status: "upcoming",
      label: asOnTs === dueTs ? "Due today" : "Not yet due",
      daysLate: 0,
    };
  }
  return {
    status: "overdue",
    label: "Overdue",
    daysLate: daysBetween(dueTs, asOnTs),
  };
}

/**
 * Next routine DIR-3 KYC Web date on or after `asOnDate`, stepping the
 * three-year cycle forward from the 30 June 2028 anchor.
 */
export function nextDir3KycDueDate(asOnDate) {
  const asOnTs = parseISO(asOnDate);
  if (asOnTs === null) return null;
  let dueTs = parseISO(DIR3_KYC_ANCHOR_DUE);
  let guard = 0;
  while (dueTs < asOnTs && guard < 60) {
    dueTs = addMonths(dueTs, DIR3_KYC_CYCLE_YEARS * 12);
    guard += 1;
  }
  return toISO(dueTs);
}

/* ------------------------------------------------------------------ */
/* Main entry point                                                     */
/* ------------------------------------------------------------------ */

/**
 * Build the full ROC calendar with per-form additional fees.
 *
 * @returns {{error: string}|object}
 */
export function buildRocFilingPlan(input = {}) {
  const {
    entityType = "private",
    incorporationDate = "",
    financialYearEnd = "",
    agmHeldDate = "",
    previousAgmDate = "",
    paidUpCapital = 0,
    contribution = 0,
    turnover = 0,
    filings = {},
    asOnDate = "",
    dinKycPending = false,
  } = input;

  if (!ENTITY_TYPES.some((t) => t.id === entityType)) {
    return { error: "Choose one of: private limited company, OPC or LLP." };
  }

  const incTs = parseISO(incorporationDate);
  if (incTs === null) {
    return { error: "Enter the date of incorporation as a real calendar date between 1900 and 2200." };
  }
  const fyTs = parseISO(financialYearEnd);
  if (fyTs === null) {
    return { error: "Enter the financial year end as a real calendar date between 1900 and 2200." };
  }
  const asOnTs = parseISO(asOnDate);
  if (asOnTs === null) {
    return { error: "Enter the date you want the additional fee accrued to as a real calendar date." };
  }
  if (fyTs <= incTs) {
    return { error: "The financial year end must fall after the date of incorporation." };
  }

  const firstFyEnd = firstFinancialYearEnd(incorporationDate);
  const firstFyTs = parseISO(firstFyEnd);
  if (fyTs < firstFyTs) {
    return {
      error: `Section 2(41) closes the first financial year of a company incorporated on ${formatIndianDate(incorporationDate)} no earlier than ${formatIndianDate(firstFyEnd)}. Pick that year end or a later one.`,
    };
  }
  if (daysBetween(fyTs, asOnTs) > 366 * 25) {
    return { error: "The accrual date is more than 25 years after the financial year end. Check the dates." };
  }

  const isLlp = entityType === "llp";
  const isOpc = entityType === "opc";
  const isFirstFinancialYear = fyTs === firstFyTs;

  const capital = Number(paidUpCapital);
  const contributionAmount = Number(contribution);
  const turnoverAmount = Number(turnover);

  if (!isLlp && (!Number.isFinite(capital) || capital < 0)) {
    return { error: "Paid-up share capital cannot be negative or blank. Enter 0 for a company without share capital." };
  }
  if (isLlp && (!Number.isFinite(contributionAmount) || contributionAmount < 0)) {
    return { error: "Total contribution cannot be negative or blank. Enter 0 if there is none." };
  }
  if (isLlp && (!Number.isFinite(turnoverAmount) || turnoverAmount < 0)) {
    return { error: "Turnover cannot be negative. Enter 0 if the LLP had none." };
  }
  if (!isLlp && capital > 1e13) {
    return { error: "That paid-up capital is above Rs 1,00,00,000 crore. Check the figure." };
  }
  if (isLlp && (contributionAmount > 1e13 || turnoverAmount > 1e13)) {
    return { error: "That contribution or turnover is above Rs 1,00,00,000 crore. Check the figure." };
  }

  const notes = [];
  const fyEndDate = new Date(fyTs);
  if (fyEndDate.getUTCMonth() !== 2 || fyEndDate.getUTCDate() !== 31) {
    notes.push(
      isLlp
        ? "LLP Act section 2(1)(l) runs the financial year from 1 April to 31 March. The year end you entered is not 31 March, so the dates below follow your date rather than the statutory one."
        : "Companies Act 2013 section 2(41) requires a 31 March year end unless the Tribunal has allowed a different period. The year end you entered is not 31 March, so the dates below follow your date.",
    );
  }
  if (isFirstFinancialYear) {
    notes.push(
      `This is the first financial year: it closes on ${formatIndianDate(firstFyEnd)} under section 2(41), because the company was incorporated in ${new Date(incTs).getUTCFullYear()}.`,
    );
  }
  if (isLlp && new Date(incTs).getUTCMonth() > 8 && isFirstFinancialYear) {
    notes.push(
      "The LLP was incorporated after 30 September, so the proviso to LLP Act section 2(1)(l) also allows the first financial year to close on 31 March of the year after the one shown.",
    );
  }

  /* ---- AGM ---- */
  let agm = null;
  let agmEffectiveISO = null;
  if (isLlp) {
    agm = {
      required: false,
      note: "An LLP holds no AGM. Form 11 and Form 8 both run from the close of the financial year.",
    };
  } else if (isOpc) {
    const deemed = toISO(addMonths(fyTs, SUBSEQUENT_AGM_MONTHS));
    agmEffectiveISO = deemed;
    agm = {
      required: false,
      lastDate: deemed,
      basis:
        "Section 96(1) excludes a One Person Company from holding an AGM. Section 92(4) still runs the annual return from the date the AGM should have been held, which MCA takes as six months from the year end.",
      note: "No AGM is held. The date shown is the deemed AGM date used for MGT-7A.",
    };
  } else {
    const computed = agmLastDate({
      financialYearEnd,
      isFirstFinancialYear,
      previousAgmDate,
    });
    if (computed.error) return { error: computed.error };
    const heldTs = agmHeldDate ? parseISO(agmHeldDate) : null;
    if (agmHeldDate && heldTs === null) {
      return { error: "Enter the AGM date actually held as a real calendar date, or leave it blank." };
    }
    if (heldTs !== null && heldTs <= fyTs) {
      return { error: "The AGM cannot be held on or before the financial year end it reports on." };
    }
    agmEffectiveISO = heldTs !== null ? agmHeldDate : computed.dueDate;
    agm = {
      required: true,
      lastDate: computed.dueDate,
      basis: computed.basis,
      boundBy: computed.boundBy,
      heldDate: heldTs !== null ? agmHeldDate : null,
      heldLate: heldTs !== null && heldTs > parseISO(computed.dueDate),
      daysLate:
        heldTs !== null && heldTs > parseISO(computed.dueDate)
          ? daysBetween(parseISO(computed.dueDate), heldTs)
          : 0,
      note:
        heldTs !== null
          ? "AOC-4, MGT-7 and ADT-1 below run from the AGM you actually held, which is what sections 137, 92 and 139 measure from."
          : "No AGM date was entered, so AOC-4, MGT-7 and ADT-1 below run from the last permissible AGM date.",
    };
  }

  /* ---- Form rows ---- */
  const specs = [];

  if (isLlp) {
    const small = isSmallLlp(contributionAmount, turnoverAmount);
    const normal = llpNormalFee(contributionAmount);
    specs.push({
      key: "form11",
      form: "Form 11",
      title: "Annual Return of an LLP",
      dueTs: addDays(fyTs, LLP_FORM11_DAYS_AFTER_FY_END),
      dueBasis: `LLP Act 2008 section 35(1) with rule 25(1) of the LLP Rules, 2009 — within 60 days of the close of the financial year (${formatIndianDate(financialYearEnd)}).`,
      engine: "llp",
      normal,
      small,
    });
    specs.push({
      key: "form8",
      form: "Form 8",
      title: "Statement of Account and Solvency",
      dueTs: addDays(
        addMonths(fyTs, LLP_FORM8_MONTHS_AFTER_FY_END),
        LLP_FORM8_DAYS_AFTER_HALF_YEAR,
      ),
      dueBasis: `LLP Act 2008 section 34(3) with rule 24(4) of the LLP Rules, 2009 — within 30 days from the end of six months of the financial year, i.e. 30 days after ${formatIndianDate(toISO(addMonths(fyTs, LLP_FORM8_MONTHS_AFTER_FY_END)))}.`,
      engine: "llp",
      normal,
      small,
    });
  } else {
    const normal = companyNormalFee(capital);
    const agmTs = parseISO(agmEffectiveISO);
    specs.push({
      key: "adt1",
      form: "ADT-1",
      title: "Notice of auditor appointment",
      dueTs: addDays(agmTs, ADT1_DAYS_AFTER_MEETING),
      dueBasis: `Section 139(1) proviso with rule 4(2) of the Companies (Audit and Auditors) Rules, 2014 — within 15 days of the meeting at which the auditor was appointed, taken here as ${formatIndianDate(agmEffectiveISO)}.`,
      engine: "slab",
      normal,
    });
    specs.push({
      key: "aoc4",
      form: isOpc ? "AOC-4 (OPC)" : "AOC-4",
      title: "Filing of financial statements",
      dueTs: isOpc
        ? addDays(fyTs, AOC4_OPC_DAYS_AFTER_FY_END)
        : addDays(agmTs, AOC4_DAYS_AFTER_AGM),
      dueBasis: isOpc
        ? `First proviso to section 137(1) — an OPC files within 180 days of the close of the financial year (${formatIndianDate(financialYearEnd)}).`
        : `Section 137(1) — within 30 days of the AGM held or last permissible on ${formatIndianDate(agmEffectiveISO)}.`,
      engine: "perDay",
      normal,
    });
    specs.push({
      key: "mgt7",
      form: isOpc ? "MGT-7A" : "MGT-7",
      title: "Annual return",
      dueTs: addDays(agmTs, MGT7_DAYS_AFTER_AGM),
      dueBasis: isOpc
        ? `Proviso to section 92(4) with rule 11(1) of the Companies (Management and Administration) Rules, 2014 — 60 days from the date the AGM should have been held, i.e. from ${formatIndianDate(agmEffectiveISO)}. MGT-7A is the OPC and small-company form notified by G.S.R. 159(E) dated 5 March 2021.`
        : `Section 92(4) — within 60 days of the AGM held or last permissible on ${formatIndianDate(agmEffectiveISO)}. A small company or OPC uses MGT-7A instead of MGT-7.`,
      engine: "perDay",
      normal,
    });
  }

  const rows = specs.map((spec) => {
    const filedISO = typeof filings[spec.key] === "string" ? filings[spec.key].trim() : "";
    const filedTs = filedISO ? parseISO(filedISO) : null;
    if (filedISO && filedTs === null) {
      return { key: spec.key, error: `The filing date entered for ${spec.form} is not a real calendar date.` };
    }
    const state = statusFor(spec.dueTs, filedTs, asOnTs);
    const normalFee = spec.normal ? spec.normal.fee : 0;
    let fee;
    if (spec.engine === "perDay") {
      fee = annualFilingAdditionalFee(state.daysLate);
    } else if (spec.engine === "llp") {
      fee = llpAdditionalFee(state.daysLate, normalFee, spec.small);
    } else {
      fee = slabAdditionalFee(state.daysLate, normalFee);
    }
    if (!fee) {
      return { key: spec.key, error: `The fee inputs for ${spec.form} are not a usable amount.` };
    }
    return {
      key: spec.key,
      form: spec.form,
      title: spec.title,
      dueDate: toISO(spec.dueTs),
      dueBasis: spec.dueBasis,
      filedDate: filedTs === null ? null : filedISO,
      status: state.status,
      statusLabel: state.label,
      daysLate: state.daysLate,
      accruedTo: filedTs === null && state.status === "overdue" ? asOnDate : filedISO || null,
      normalFee,
      normalFeeSlab: spec.normal ? spec.normal.slabLabel : null,
      additionalFee: fee.additionalFee,
      totalFee: normalFee + fee.additionalFee,
      feeRule: fee.rule,
      feeWorkingOut: fee.workingOut,
    };
  });

  const rowError = rows.find((r) => r.error);
  if (rowError) return { error: rowError.error };
  rows.sort((a, b) => (a.dueDate < b.dueDate ? -1 : a.dueDate > b.dueDate ? 1 : 0));

  /* ---- DIR-3 KYC Web ---- */
  const kycDue = nextDir3KycDueDate(asOnDate);
  const dir3Kyc = {
    form: "DIR-3 KYC Web",
    title: "Director / designated partner KYC",
    dueDate: dinKycPending ? null : kycDue,
    dueBasis: dinKycPending
      ? "Rule 12A of the Companies (Appointment and Qualification of Directors) Rules, 2014 as substituted by G.S.R. 943(E) dated 31 December 2025, in force 31 March 2026. The DIN is out of KYC or deactivated, so the fee is payable on filing rather than on a future date."
      : `Rule 12A as substituted by G.S.R. 943(E) dated 31 December 2025, in force 31 March 2026 — DIR-3 KYC Web is triennial, filed on or before 30 June following every third consecutive financial year. A DIN holder whose KYC is current through FY 2025-26 next files by 30 June 2028, and the cycle repeats every ${DIR3_KYC_CYCLE_YEARS} years from there.`,
    status: dinKycPending ? "overdue" : "upcoming",
    statusLabel: dinKycPending ? "Fee payable on filing" : "Not yet due",
    normalFee: 0,
    additionalFee: dinKycPending ? DIR3_KYC_LATE_FEE : 0,
    totalFee: dinKycPending ? DIR3_KYC_LATE_FEE : 0,
    feeRule: `Companies (Registration Offices and Fees) Amendment Rules, 2026, G.S.R. 300(E) dated 21 April 2026 — nil if filed within the timeline, Rs ${DIR3_KYC_LATE_FEE.toLocaleString("en-IN")} if filed after the due date or to reactivate a DIN, and Rs ${DIR3_KYC_UPDATE_FEE} for a later filing that only updates KYC particulars. This is a flat amount, not a per-day charge.`,
    feeWorkingOut: dinKycPending
      ? `Flat Rs ${DIR3_KYC_LATE_FEE.toLocaleString("en-IN")} per DIN`
      : "Within the triennial cycle — nil.",
    changeRule: `Rule 12A(2) — a change of mobile number, e-mail address or residential address is filed within ${DIR3_KYC_CHANGE_DAYS} days of the change, outside the triennial cycle.`,
  };

  const totalAdditionalFee =
    rows.reduce((sum, r) => sum + r.additionalFee, 0) + dir3Kyc.additionalFee;
  const totalPayable = rows.reduce((sum, r) => sum + r.totalFee, 0) + dir3Kyc.totalFee;
  const lateCount = rows.filter((r) => r.daysLate > 0).length + (dinKycPending ? 1 : 0);

  return {
    entityType,
    entityLabel: ENTITY_TYPES.find((t) => t.id === entityType).label,
    incorporationDate,
    financialYearEnd,
    firstFinancialYearEnd: firstFyEnd,
    isFirstFinancialYear,
    asOnDate,
    agm,
    rows,
    dir3Kyc,
    smallLlp: isLlp ? isSmallLlp(contributionAmount, turnoverAmount) : null,
    smallLlpBasis: isLlp
      ? `LLP Act section 2(1)(ta) — a small LLP has contribution up to Rs ${SMALL_LLP_CONTRIBUTION_CAP.toLocaleString("en-IN")} and turnover up to Rs ${SMALL_LLP_TURNOVER_CAP.toLocaleString("en-IN")}. Both tests must pass.`
      : null,
    notes,
    totals: {
      additionalFee: totalAdditionalFee,
      totalPayable,
      lateCount,
      formCount: rows.length + 1,
    },
    stamp: {
      readOn: FEE_RULES_READ_ON,
      companyFeeAmendment: LATEST_FEE_AMENDMENT,
      llpFeeAmendment: LATEST_LLP_FEE_AMENDMENT,
      dayCount:
        "Periods are counted excluding the starting day, per section 9 of the General Clauses Act, 1897. A 30 September AGM therefore puts AOC-4 on 30 October and MGT-7 on 29 November.",
    },
  };
}
