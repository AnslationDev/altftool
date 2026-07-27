/**
 * Belated and Updated Return Deadline Tracker — pure date logic.
 *
 * Every date below comes from the Income-tax Act, 1961 (India):
 *  - section 139(1)  : original due date for furnishing the return
 *  - section 139(4)  : belated return
 *  - section 139(5)  : revised return
 *  - section 139(8A) : updated return (ITR-U)
 *  - section 140B    : additional income-tax payable with an updated return
 *  - section 234F    : fee for late filing
 *  - section 234A    : interest for late filing
 *
 * The module models the *statutory* dates only. CBDT can and does extend
 * individual due dates by circular; the UI surfaces that caveat.
 */

/* ------------------------------------------------------------------ *
 * Statutory constants
 * ------------------------------------------------------------------ */

/** Section 139(1) Explanation 2(c) — non-audit taxpayers: 31 July of the assessment year. */
export const DUE_NON_AUDIT = { month: 7, day: 31 };

/**
 * Section 139(1) Explanation 2(a) — taxpayers whose accounts must be audited.
 * The Finance Act 2020 moved this date from 30 September to 31 October,
 * first applying to assessment year 2020-21.
 */
export const DUE_AUDIT_FROM_AY_2020 = { month: 10, day: 31 };
export const DUE_AUDIT_BEFORE_AY_2020 = { month: 9, day: 30 };
export const AUDIT_DATE_CHANGE_AY = 2020;

/** Section 139(1) Explanation 2(aa) — cases needing a section 92E report: 30 November. */
export const DUE_TRANSFER_PRICING = { month: 11, day: 30 };

/**
 * Section 139(4)/139(5) — belated and revised returns.
 * The Finance Act 2021 shortened the window from "end of the assessment year"
 * (31 March) to "three months before the end of the assessment year"
 * (31 December of the assessment year), first applying to AY 2021-22.
 */
export const BELATED_CUTOFF_FROM_AY_2021 = { month: 12, day: 31, yearOffset: 0 };
export const BELATED_CUTOFF_BEFORE_AY_2021 = { month: 3, day: 31, yearOffset: 1 };
export const BELATED_DATE_CHANGE_AY = 2021;

/** Section 139(8A) was inserted by the Finance Act 2022 and first applies to AY 2020-21. */
export const ITR_U_FIRST_ASSESSMENT_YEAR = 2020;

/**
 * Section 139(8A) — an updated return may be furnished within 48 months from the
 * end of the relevant assessment year (raised from 24 months by the Finance Act 2025).
 */
export const ITR_U_WINDOW_MONTHS = 48;

/**
 * Section 140B — additional income-tax on the aggregate of tax and interest due,
 * graded by how late the updated return is filed (measured from the END of the
 * relevant assessment year). Slabs as amended by the Finance Act 2025.
 */
export const ADDITIONAL_TAX_SLABS = [
  { fromMonth: 0, toMonth: 12, percent: 25 },
  { fromMonth: 12, toMonth: 24, percent: 50 },
  { fromMonth: 24, toMonth: 36, percent: 60 },
  { fromMonth: 36, toMonth: 48, percent: 70 },
];

/** Section 234F — fee for filing after the section 139(1) due date. */
export const LATE_FEE_STANDARD = 5000;
export const LATE_FEE_SMALL_INCOME = 1000;
export const LATE_FEE_INCOME_THRESHOLD = 500000;

/** Section 234A — simple interest per month or part of a month on unpaid self-assessment tax. */
export const INTEREST_234A_MONTHLY_PERCENT = 1;

export const TAXPAYER_CATEGORIES = [
  {
    id: "non-audit",
    label: "Individual / HUF, no audit",
    hint: "Salary, pension, capital gains, small business without tax audit",
  },
  {
    id: "audit",
    label: "Accounts require tax audit (44AB)",
    hint: "Business or profession crossing the audit thresholds, companies, most firms",
  },
  {
    id: "transfer-pricing",
    label: "Section 92E report applies",
    hint: "International or specified domestic transactions requiring Form 3CEB",
  },
];

/** Provisos to section 139(8A) — situations where an updated return cannot be filed. */
export const ITR_U_RESTRICTIONS = [
  "It cannot be a return of loss, and it cannot reduce the total income already reported.",
  "It cannot decrease your tax liability or create or increase a refund.",
  "It cannot be filed for a year in which a search, survey or requisition action was taken, or where proceedings are pending for that year.",
  "Only one updated return can be furnished for a given assessment year.",
  "Any tax, interest, late fee and the section 140B additional tax must be paid before the return is filed.",
];

/* ------------------------------------------------------------------ *
 * Date helpers (UTC-only, so results never shift with the viewer's zone)
 * ------------------------------------------------------------------ */

const MS_PER_DAY = 86400000;

const pad2 = (value) => String(value).padStart(2, "0");

/** Build an ISO calendar date string. Month is 1-based. */
export function isoDate(year, month, day) {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

/** Parse "YYYY-MM-DD" to a UTC timestamp, or NaN when malformed. */
export function toTimestamp(iso) {
  if (typeof iso !== "string") return NaN;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!match) return NaN;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return NaN;
  const stamp = Date.UTC(year, month - 1, day);
  const check = new Date(stamp);
  if (check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) return NaN;
  return stamp;
}

/** Whole days from `fromIso` to `toIso`. Negative when `toIso` is earlier. */
export function daysBetween(fromIso, toIso) {
  const a = toTimestamp(fromIso);
  const b = toTimestamp(toIso);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  return Math.round((b - a) / MS_PER_DAY);
}

/** Add whole months to an ISO date, clamping the day to the target month's length. */
export function addMonths(iso, months) {
  const stamp = toTimestamp(iso);
  if (!Number.isFinite(stamp)) return null;
  const date = new Date(stamp);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const target = new Date(Date.UTC(year, month + months, 1));
  const lastDay = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();
  return isoDate(target.getUTCFullYear(), target.getUTCMonth() + 1, Math.min(day, lastDay));
}

/* ------------------------------------------------------------------ *
 * Assessment year parsing
 * ------------------------------------------------------------------ */

export const MIN_ASSESSMENT_YEAR = 2015;
export const MAX_ASSESSMENT_YEAR = 2040;

/**
 * Accepts "2025-26", "2025-2026", "2025 26" or 2025 and returns the
 * assessment-year start year plus display labels.
 */
export function parseAssessmentYear(input) {
  const raw = String(input ?? "").trim();
  if (!raw) return { error: "Choose an assessment year." };

  const match = /^(\d{4})(?:\s*[-/]\s*(\d{2,4}))?$/.exec(raw);
  if (!match) {
    return { error: "Use an assessment year like 2025-26." };
  }
  const startYear = Number(match[1]);
  if (!Number.isInteger(startYear)) {
    return { error: "Use an assessment year like 2025-26." };
  }
  if (startYear < MIN_ASSESSMENT_YEAR || startYear > MAX_ASSESSMENT_YEAR) {
    return {
      error: `Assessment year must be between ${MIN_ASSESSMENT_YEAR}-${String(
        MIN_ASSESSMENT_YEAR + 1,
      ).slice(2)} and ${MAX_ASSESSMENT_YEAR}-${String(MAX_ASSESSMENT_YEAR + 1).slice(2)}.`,
    };
  }
  if (match[2]) {
    const tailRaw = match[2];
    const tail = tailRaw.length === 2 ? Number(String(startYear).slice(0, 2) + tailRaw) : Number(tailRaw);
    if (tail !== startYear + 1) {
      return { error: "An assessment year spans two consecutive years, for example 2025-26." };
    }
  }

  return {
    startYear,
    endYear: startYear + 1,
    assessmentYear: `${startYear}-${String(startYear + 1).slice(2)}`,
    financialYear: `${startYear - 1}-${String(startYear).slice(2)}`,
  };
}

/** Convenience list for a dropdown, newest first. */
export function listAssessmentYears(fromYear = 2019, toYear = 2027) {
  const years = [];
  const lo = Math.max(MIN_ASSESSMENT_YEAR, Math.min(fromYear, toYear));
  const hi = Math.min(MAX_ASSESSMENT_YEAR, Math.max(fromYear, toYear));
  for (let year = hi; year >= lo; year -= 1) {
    years.push({
      value: `${year}-${String(year + 1).slice(2)}`,
      startYear: year,
      financialYear: `${year - 1}-${String(year).slice(2)}`,
    });
  }
  return years;
}

/* ------------------------------------------------------------------ *
 * Core computation
 * ------------------------------------------------------------------ */

function originalDueDate(startYear, category) {
  if (category === "transfer-pricing") {
    return {
      date: isoDate(startYear, DUE_TRANSFER_PRICING.month, DUE_TRANSFER_PRICING.day),
      basis: "Section 139(1) Explanation 2(aa) — 30 November of the assessment year",
    };
  }
  if (category === "audit") {
    const rule =
      startYear >= AUDIT_DATE_CHANGE_AY ? DUE_AUDIT_FROM_AY_2020 : DUE_AUDIT_BEFORE_AY_2020;
    return {
      date: isoDate(startYear, rule.month, rule.day),
      basis:
        startYear >= AUDIT_DATE_CHANGE_AY
          ? "Section 139(1) Explanation 2(a) — 31 October of the assessment year"
          : "Section 139(1) Explanation 2(a) — 30 September (pre AY 2020-21 date)",
    };
  }
  return {
    date: isoDate(startYear, DUE_NON_AUDIT.month, DUE_NON_AUDIT.day),
    basis: "Section 139(1) Explanation 2(c) — 31 July of the assessment year",
  };
}

function belatedCutoff(startYear) {
  const rule =
    startYear >= BELATED_DATE_CHANGE_AY
      ? BELATED_CUTOFF_FROM_AY_2021
      : BELATED_CUTOFF_BEFORE_AY_2021;
  return {
    date: isoDate(startYear + rule.yearOffset, rule.month, rule.day),
    basis:
      startYear >= BELATED_DATE_CHANGE_AY
        ? "Sections 139(4) and 139(5) — 31 December of the assessment year"
        : "Sections 139(4) and 139(5) — end of the assessment year (pre AY 2021-22 rule)",
  };
}

/** End of the relevant assessment year: the clock for section 139(8A) starts here. */
function endOfAssessmentYear(startYear) {
  return isoDate(startYear + 1, 3, 31);
}

/**
 * Section 140B slab windows. The 25% slab opens the day after the section
 * 139(4)/139(5) window shuts and runs to 12 months after the end of the
 * assessment year; later slabs are measured purely from the end of the
 * assessment year.
 */
function buildAdditionalTaxWindows(startYear, belatedCutoffIso) {
  const anchor = endOfAssessmentYear(startYear);
  return ADDITIONAL_TAX_SLABS.map((slab) => {
    const closeIso = addMonths(anchor, slab.toMonth);
    const from =
      slab.fromMonth === 0 ? addDay(belatedCutoffIso) : addDay(addMonths(anchor, slab.fromMonth));
    return {
      percent: slab.percent,
      from,
      to: closeIso,
      label:
        slab.fromMonth === 0
          ? "Filed within 12 months of the end of the assessment year"
          : `Filed between ${slab.fromMonth} and ${slab.toMonth} months after the end of the assessment year`,
    };
  });
}

function addDay(iso) {
  const stamp = toTimestamp(iso);
  if (!Number.isFinite(stamp)) return null;
  const next = new Date(stamp + MS_PER_DAY);
  return isoDate(next.getUTCFullYear(), next.getUTCMonth() + 1, next.getUTCDate());
}

/**
 * Full timeline for one assessment year.
 *
 * @param {object} args
 * @param {string|number} args.assessmentYear e.g. "2025-26"
 * @param {string} args.category one of TAXPAYER_CATEGORIES ids
 * @param {string} args.asOfDate ISO "YYYY-MM-DD" — the day you are standing on
 */
export function getReturnDeadlines({ assessmentYear, category = "non-audit", asOfDate } = {}) {
  const parsed = parseAssessmentYear(assessmentYear);
  if (parsed.error) return { error: parsed.error };

  const knownCategory = TAXPAYER_CATEGORIES.some((item) => item.id === category);
  if (!knownCategory) {
    return { error: "Choose a taxpayer category." };
  }

  const today = String(asOfDate ?? "").trim();
  if (!Number.isFinite(toTimestamp(today))) {
    return { error: "Enter a valid reference date in YYYY-MM-DD form." };
  }

  const { startYear } = parsed;
  const original = originalDueDate(startYear, category);
  const belated = belatedCutoff(startYear);
  const ayEnd = endOfAssessmentYear(startYear);

  const itrUAvailableForYear = startYear >= ITR_U_FIRST_ASSESSMENT_YEAR;
  const itrUDeadline = itrUAvailableForYear ? addMonths(ayEnd, ITR_U_WINDOW_MONTHS) : null;
  const windows = itrUAvailableForYear
    ? buildAdditionalTaxWindows(startYear, belated.date)
    : [];

  const daysToOriginal = daysBetween(today, original.date);
  const daysToBelated = daysBetween(today, belated.date);
  const daysToItrU = itrUDeadline ? daysBetween(today, itrUDeadline) : null;

  const activeWindow =
    windows.find((window) => {
      const afterStart = daysBetween(window.from, today) >= 0;
      const beforeEnd = daysBetween(today, window.to) >= 0;
      return afterStart && beforeEnd;
    }) ?? null;

  let phase;
  let phaseHeadline;
  let phaseDetail;
  let primaryDeadline;
  let primaryDaysLeft;

  if (daysToOriginal >= 0) {
    phase = "original";
    phaseHeadline = "Original return window is open";
    phaseDetail =
      "File under section 139(1) and you owe no section 234F fee and no section 234A interest.";
    primaryDeadline = original.date;
    primaryDaysLeft = daysToOriginal;
  } else if (daysToBelated >= 0) {
    phase = "belated";
    phaseHeadline = "Belated and revised window is open";
    phaseDetail = `A belated return under section 139(4) or a revised return under section 139(5) is still possible. A section 234F fee of up to ${LATE_FEE_STANDARD.toLocaleString(
      "en-IN",
    )} rupees applies, plus ${INTEREST_234A_MONTHLY_PERCENT}% a month interest under section 234A on unpaid tax.`;
    primaryDeadline = belated.date;
    primaryDaysLeft = daysToBelated;
  } else if (itrUDeadline && daysToItrU >= 0) {
    phase = "updated";
    phaseHeadline = "Only an updated return (ITR-U) is left";
    phaseDetail = activeWindow
      ? `Filing now attracts ${activeWindow.percent}% additional tax under section 140B on top of the tax and interest due.`
      : "The updated return window under section 139(8A) is open.";
    primaryDeadline = itrUDeadline;
    primaryDaysLeft = daysToItrU;
  } else {
    phase = "closed";
    phaseHeadline = "Every filing window for this year has closed";
    phaseDetail = itrUAvailableForYear
      ? "The 48-month updated-return window has expired. Only proceedings initiated by the department can now bring this year back on the table."
      : "Section 139(8A) does not cover assessment years before 2020-21, so no updated return is possible.";
    primaryDeadline = itrUDeadline ?? belated.date;
    primaryDaysLeft = itrUDeadline ? daysToItrU : daysToBelated;
  }

  const timeline = [
    {
      key: "original",
      milestone: "Original return due date",
      date: original.date,
      section: "139(1)",
      basis: original.basis,
      daysFromToday: daysToOriginal,
      past: daysToOriginal < 0,
    },
    {
      key: "belated",
      milestone: "Last date for a belated or revised return",
      date: belated.date,
      section: "139(4) / 139(5)",
      basis: belated.basis,
      daysFromToday: daysToBelated,
      past: daysToBelated < 0,
    },
  ];

  if (itrUAvailableForYear) {
    windows.forEach((window) => {
      const days = daysBetween(today, window.to);
      timeline.push({
        key: `itru-${window.percent}`,
        milestone: `ITR-U filed by this date costs ${window.percent}% additional tax`,
        date: window.to,
        section: "139(8A) / 140B",
        basis: window.label,
        daysFromToday: days,
        past: days < 0,
      });
    });
  }

  return {
    assessmentYear: parsed.assessmentYear,
    financialYear: parsed.financialYear,
    previousYearEnd: isoDate(startYear, 3, 31),
    assessmentYearEnd: ayEnd,
    category,
    asOfDate: today,
    originalDueDate: original.date,
    originalDueBasis: original.basis,
    belatedDeadline: belated.date,
    belatedBasis: belated.basis,
    revisedDeadline: belated.date,
    itrU: {
      available: itrUAvailableForYear,
      deadline: itrUDeadline,
      windowMonths: ITR_U_WINDOW_MONTHS,
      windows,
      activePercent: activeWindow ? activeWindow.percent : null,
      daysLeft: daysToItrU,
      restrictions: ITR_U_RESTRICTIONS,
    },
    phase,
    phaseHeadline,
    phaseDetail,
    primaryDeadline,
    primaryDaysLeft,
    timeline,
  };
}
