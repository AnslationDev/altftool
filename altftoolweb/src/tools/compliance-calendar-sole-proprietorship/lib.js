/**
 * Compliance calendar for an Indian sole proprietorship.
 *
 * Every due date below is the statutory date in the relevant rule. The CBIC and
 * the CBDT extend individual dates almost every year by notification, so treat
 * the output as the baseline calendar and check the portal before a deadline.
 *
 * GST (CGST Act, 2017 and the CGST Rules, 2017)
 *   GSTR-1  monthly filer  : 11th of the following month           (Rule 59)
 *   GSTR-1  QRMP quarterly : 13th of the month after the quarter
 *   GSTR-3B monthly filer  : 20th of the following month           (Rule 61)
 *   GSTR-3B QRMP quarterly : 22nd for the Group X states / UTs,
 *                            24th for the Group Y states / UTs
 *   PMT-06  QRMP payment   : 25th of the following month, for the
 *                            first two months of each quarter
 *   CMP-08  composition    : 18th of the month after the quarter
 *   GSTR-4  composition    : 30 June following the end of the financial year
 *   GSTR-9  annual return  : 31 December following the financial year;
 *                            mandatory above Rs 2 crore turnover
 *
 * Income tax (Income-tax Act, 1961)
 *   Advance tax instalments: 15 June (15%), 15 September (45%),
 *                            15 December (75%), 15 March (100%) - section 211.
 *                            A presumptive assessee under section 44AD pays the
 *                            whole amount in one instalment by 15 March.
 *   TDS deposit            : 7th of the following month; for March, 30 April
 *                            (Rule 30)
 *   TDS return 26Q / 24Q   : 31 July, 31 October, 31 January, 31 May (Rule 31A)
 *   Tax audit report 3CB-3CD: 30 September following the financial year
 *   ITR-3 / ITR-4          : 31 July where no audit applies,
 *                            31 October where a tax audit applies (section 139(1))
 *
 * Labour
 *   EPF ECR and payment    : 15th of the following month
 *   ESI contribution       : 15th of the following month
 *   Professional tax       : state-specific; most states collect monthly or
 *                            annually, so it is listed without a fixed date.
 *
 * Informational only. This is not tax or legal advice; a chartered accountant
 * should confirm which of these actually apply to your registrations.
 */

export const MS_PER_DAY = 86400000;

/** The Indian financial year runs 1 April to 31 March. */
export const FY_START_MONTH_INDEX = 3; // April, zero-based

/** Turnover above which the GSTR-9 annual return is mandatory (rupees). */
export const GSTR9_MANDATORY_TURNOVER = 20000000; // Rs 2 crore

/** QRMP GSTR-3B falls on the 22nd for group X states and the 24th for group Y. */
export const QRMP_GROUP_X_DAY = 22;
export const QRMP_GROUP_Y_DAY = 24;

export const QRMP_GROUPS = [
  {
    id: "x",
    label: "Group X — due 22nd",
    states:
      "Chhattisgarh, Madhya Pradesh, Gujarat, Maharashtra, Karnataka, Goa, Kerala, Tamil Nadu, Telangana, Andhra Pradesh, Daman & Diu, Dadra & Nagar Haveli, Puducherry, Andaman & Nicobar, Lakshadweep",
  },
  {
    id: "y",
    label: "Group Y — due 24th",
    states:
      "Himachal Pradesh, Punjab, Uttarakhand, Haryana, Rajasthan, Uttar Pradesh, Bihar, Sikkim, Arunachal Pradesh, Nagaland, Manipur, Mizoram, Tripura, Meghalaya, Assam, West Bengal, Jharkhand, Odisha, Jammu & Kashmir, Ladakh, Chandigarh, Delhi",
  },
];

export const GST_SCHEMES = [
  { id: "none", label: "Not registered under GST" },
  { id: "monthly", label: "Regular — monthly GSTR-1 and GSTR-3B" },
  { id: "qrmp", label: "Regular — QRMP (quarterly returns, monthly tax)" },
  { id: "composition", label: "Composition scheme" },
];

// GST came into force on 1 July 2017, three months into FY 2017-18, so that
// year cannot be built as a normal full-year GST calendar (it would generate
// GSTR-1/GSTR-3B due dates for April-June 2017, before GST existed). 2018 is
// the first full post-GST financial year, so it is the earliest one offered.
export const MIN_FY_START_YEAR = 2018;
export const MAX_FY_START_YEAR = 2035;

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

/** Format a UTC timestamp as YYYY-MM-DD. */
export function toIsoDate(ms) {
  return new Date(ms).toISOString().slice(0, 10);
}

/** Parse YYYY-MM-DD to a UTC midnight timestamp, or NaN. */
export function parseIsoDate(value) {
  if (typeof value !== "string") return NaN;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return NaN;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const ms = Date.UTC(year, month - 1, day);
  const check = new Date(ms);
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    return NaN;
  }
  return ms;
}

/** The twelve tax periods of a financial year, oldest first. */
export function financialYearMonths(fyStartYear) {
  const months = [];
  for (let offset = 0; offset < 12; offset += 1) {
    const absolute = FY_START_MONTH_INDEX + offset;
    months.push({
      year: fyStartYear + Math.floor(absolute / 12),
      monthIndex: absolute % 12,
      label: `${MONTH_NAMES[absolute % 12]} ${fyStartYear + Math.floor(absolute / 12)}`,
    });
  }
  return months;
}

/** Due date that falls on `day` of the month after a given tax period. */
function dayOfNextMonth({ year, monthIndex }, day) {
  return Date.UTC(year, monthIndex + 1, day);
}

/**
 * Build the filing calendar.
 *
 * @param {object} input
 * @param {number} input.fyStartYear  e.g. 2025 for FY 2025-26
 * @param {string} input.gstScheme    one of GST_SCHEMES ids
 * @param {string} input.qrmpGroup    "x" or "y", used only for QRMP GSTR-3B
 * @param {boolean} input.deductsTds  the proprietor deducts TDS
 * @param {boolean} input.hasEmployees EPF / ESI registered
 * @param {boolean} input.taxAudit    a tax audit under section 44AB applies
 * @param {boolean} input.presumptive taxed under section 44AD / 44ADA
 * @param {number}  input.turnover    annual turnover in rupees
 * @param {string}  input.today       reference date, YYYY-MM-DD
 * @returns {object} items, counts and the next due filing — or { error }
 */
export function buildComplianceCalendar({
  fyStartYear = 2025,
  gstScheme = "monthly",
  qrmpGroup = "x",
  deductsTds = false,
  hasEmployees = false,
  taxAudit = false,
  presumptive = true,
  turnover = 5000000,
  today,
} = {}) {
  const startYear = Number(fyStartYear);
  if (!Number.isInteger(startYear)) {
    return { error: "Financial year must be a whole year, for example 2025 for FY 2025-26." };
  }
  if (startYear < MIN_FY_START_YEAR || startYear > MAX_FY_START_YEAR) {
    return {
      error: `Choose a financial year starting between ${MIN_FY_START_YEAR} and ${MAX_FY_START_YEAR}.`,
    };
  }

  if (!GST_SCHEMES.some((item) => item.id === gstScheme)) {
    return { error: "Choose how you are registered under GST." };
  }
  if (gstScheme === "qrmp" && !QRMP_GROUPS.some((item) => item.id === qrmpGroup)) {
    return { error: "Choose the state group that decides your QRMP GSTR-3B date." };
  }

  const turnoverValue = Number(turnover);
  if (!Number.isFinite(turnoverValue) || turnoverValue < 0) {
    return { error: "Turnover must be zero or more." };
  }

  const todayMs = parseIsoDate(today);
  if (Number.isNaN(todayMs)) return { error: "Enter today's date as a real calendar date." };

  const months = financialYearMonths(startYear);
  const endYear = startYear + 1;
  const fyLabel = `FY ${startYear}-${String(endYear).slice(2)}`;
  const items = [];

  const push = (dateMs, title, form, authority, note) => {
    items.push({
      id: `${form}-${toIsoDate(dateMs)}`,
      date: toIsoDate(dateMs),
      dateMs,
      title,
      form,
      authority,
      note: note ?? "",
    });
  };

  // ---- GST ---------------------------------------------------------------
  if (gstScheme === "monthly") {
    months.forEach((period) => {
      push(
        dayOfNextMonth(period, 11),
        `GSTR-1 for ${period.label}`,
        "GSTR-1",
        "GST",
        "Outward supplies. Due the 11th of the following month.",
      );
      push(
        dayOfNextMonth(period, 20),
        `GSTR-3B and tax payment for ${period.label}`,
        "GSTR-3B",
        "GST",
        "Summary return plus cash payment. Due the 20th of the following month.",
      );
    });
  }

  if (gstScheme === "qrmp") {
    const threeBDay = qrmpGroup === "y" ? QRMP_GROUP_Y_DAY : QRMP_GROUP_X_DAY;
    months.forEach((period, index) => {
      const positionInQuarter = index % 3; // 0, 1 = payment months; 2 = quarter end
      if (positionInQuarter === 2) {
        push(
          dayOfNextMonth(period, 13),
          `Quarterly GSTR-1 for the quarter ending ${period.label}`,
          "GSTR-1 (Q)",
          "GST",
          "Quarterly outward supplies. Due the 13th of the month after the quarter.",
        );
        push(
          dayOfNextMonth(period, threeBDay),
          `Quarterly GSTR-3B for the quarter ending ${period.label}`,
          "GSTR-3B (Q)",
          "GST",
          `Quarterly summary return. Due the ${threeBDay}th for your state group.`,
        );
      } else {
        push(
          dayOfNextMonth(period, 25),
          `PMT-06 tax payment for ${period.label}`,
          "PMT-06",
          "GST",
          "Monthly tax deposit under QRMP. Due the 25th of the following month.",
        );
      }
    });
  }

  if (gstScheme === "composition") {
    months.forEach((period, index) => {
      if (index % 3 !== 2) return;
      push(
        dayOfNextMonth(period, 18),
        `CMP-08 statement and payment for the quarter ending ${period.label}`,
        "CMP-08",
        "GST",
        "Quarterly self-assessed tax. Due the 18th of the month after the quarter.",
      );
    });
    push(
      Date.UTC(endYear, 5, 30),
      `GSTR-4 annual return for ${fyLabel}`,
      "GSTR-4",
      "GST",
      "Annual return for composition taxpayers. Due 30 June following the financial year.",
    );
  }

  const gstRegistered = gstScheme !== "none";
  if (gstRegistered && gstScheme !== "composition" && turnoverValue > GSTR9_MANDATORY_TURNOVER) {
    push(
      Date.UTC(endYear, 11, 31),
      `GSTR-9 annual return for ${fyLabel}`,
      "GSTR-9",
      "GST",
      "Mandatory above Rs 2 crore turnover. Due 31 December following the financial year.",
    );
  }

  // ---- Income tax --------------------------------------------------------
  if (presumptive) {
    push(
      Date.UTC(endYear, 2, 15),
      `Advance tax — full liability in one instalment (section 44AD)`,
      "Advance tax",
      "Income tax",
      "A presumptive assessee pays 100% of advance tax by 15 March.",
    );
  } else {
    [
      [startYear, 5, 15, "15% of advance tax"],
      [startYear, 8, 15, "45% of advance tax, cumulative"],
      [startYear, 11, 15, "75% of advance tax, cumulative"],
      [endYear, 2, 15, "100% of advance tax, cumulative"],
    ].forEach(([year, monthIndex, day, note]) => {
      push(
        Date.UTC(year, monthIndex, day),
        `Advance tax instalment — ${note}`,
        "Advance tax",
        "Income tax",
        "Section 211 instalment. Interest under sections 234B and 234C applies on a shortfall.",
      );
    });
  }

  if (deductsTds) {
    months.forEach((period) => {
      const isMarch = period.monthIndex === 2;
      const dueMs = isMarch
        ? Date.UTC(endYear, 3, 30) // 30 April for March deductions
        : dayOfNextMonth(period, 7);
      push(
        dueMs,
        `Deposit TDS deducted in ${period.label}`,
        "TDS challan",
        "Income tax",
        isMarch
          ? "March deductions get until 30 April; every other month is the 7th."
          : "Rule 30 — deposit by the 7th of the following month.",
      );
    });
    [
      [startYear, 6, 31, "Quarter 1 (Apr-Jun)"],
      [startYear, 9, 31, "Quarter 2 (Jul-Sep)"],
      [endYear, 0, 31, "Quarter 3 (Oct-Dec)"],
      [endYear, 4, 31, "Quarter 4 (Jan-Mar)"],
    ].forEach(([year, monthIndex, day, quarter]) => {
      push(
        Date.UTC(year, monthIndex, day),
        `TDS return for ${quarter}`,
        "26Q / 24Q",
        "Income tax",
        "Rule 31A quarterly statement. Form 16A follows 15 days later.",
      );
    });
  }

  if (taxAudit) {
    push(
      Date.UTC(endYear, 8, 30),
      `Tax audit report for ${fyLabel}`,
      "3CB-3CD",
      "Income tax",
      "Section 44AB audit report, due 30 September following the financial year.",
    );
  }

  push(
    taxAudit ? Date.UTC(endYear, 9, 31) : Date.UTC(endYear, 6, 31),
    `Income tax return for ${fyLabel}`,
    taxAudit ? "ITR-3 (audit)" : presumptive ? "ITR-4" : "ITR-3",
    "Income tax",
    taxAudit
      ? "Section 139(1) due date where a tax audit applies: 31 October."
      : "Section 139(1) due date where no audit applies: 31 July.",
  );

  push(
    Date.UTC(endYear, 11, 31),
    `Last date to file a belated or revised return for ${fyLabel}`,
    "Belated ITR",
    "Income tax",
    "Sections 139(4) and 139(5) — 31 December of the assessment year. After that only an updated return under section 139(8A) is possible, with additional tax.",
  );

  // ---- Labour ------------------------------------------------------------
  if (hasEmployees) {
    months.forEach((period) => {
      push(
        dayOfNextMonth(period, 15),
        `EPF ECR filing and payment for ${period.label}`,
        "EPF ECR",
        "Labour",
        "Contribution due by the 15th of the following month.",
      );
      push(
        dayOfNextMonth(period, 15),
        `ESI contribution for ${period.label}`,
        "ESI",
        "Labour",
        "Contribution due by the 15th of the following month.",
      );
    });
  }

  items.sort((a, b) => a.dateMs - b.dateMs || a.form.localeCompare(b.form));

  const withStatus = items.map((item) => {
    const daysAway = Math.round((item.dateMs - todayMs) / MS_PER_DAY);
    return { ...item, daysAway, overdue: daysAway < 0 };
  });

  const upcoming = withStatus.filter((item) => !item.overdue);
  const nextDue = upcoming.length > 0 ? upcoming[0] : null;

  const byAuthority = withStatus.reduce((acc, item) => {
    acc[item.authority] = (acc[item.authority] ?? 0) + 1;
    return acc;
  }, {});

  return {
    fyLabel,
    fyStart: toIsoDate(Date.UTC(startYear, FY_START_MONTH_INDEX, 1)),
    fyEnd: toIsoDate(Date.UTC(endYear, 2, 31)),
    items: withStatus,
    totalItems: withStatus.length,
    overdueCount: withStatus.filter((item) => item.overdue).length,
    upcomingCount: upcoming.length,
    next30Count: upcoming.filter((item) => item.daysAway <= 30).length,
    byAuthority,
    nextDue,
  };
}
