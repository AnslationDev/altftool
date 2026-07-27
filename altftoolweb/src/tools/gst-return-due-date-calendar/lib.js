/**
 * GST return due dates for an Indian financial year.
 *
 * Statutory sources for each date:
 *  - GSTR-1 monthly: 11th of the succeeding month (Rule 59, as notified).
 *  - GSTR-1 quarterly under QRMP: 13th of the month succeeding the quarter.
 *  - Invoice Furnishing Facility (optional, first two months of a QRMP quarter): 13th.
 *  - GSTR-3B monthly: 20th of the succeeding month, section 39 read with Rule 61.
 *  - GSTR-3B quarterly under QRMP: 22nd for the State group X and 24th for the group Y,
 *    Notification No. 29/2021-Central Tax.
 *  - PMT-06 tax payment for the first two months of a QRMP quarter: 25th of the next month.
 *  - CMP-08 quarterly statement by a composition taxpayer: 18th of the month after the quarter.
 *  - GSTR-4 annual return by a composition taxpayer: 30 June following the financial year
 *    (it was 30 April up to FY 2023-24, before Rule 62 was amended).
 *  - GSTR-5 by a non-resident taxable person: 13th of the succeeding month.
 *  - GSTR-5A by an OIDAR supplier: 20th of the succeeding month.
 *  - GSTR-6 by an Input Service Distributor: 13th of the succeeding month.
 *  - GSTR-7 (TDS) and GSTR-8 (TCS): 10th of the succeeding month.
 *  - GSTR-9 annual return and GSTR-9C reconciliation: 31 December following the year.
 *
 * CBDT-style extensions are notified by the CBIC from time to time; this calendar shows the
 * ordinary statutory dates.
 */

export const DUE_DAYS = {
  GSTR1_MONTHLY: 11,
  GSTR1_QUARTERLY: 13,
  IFF: 13,
  GSTR3B_MONTHLY: 20,
  GSTR3B_QRMP_GROUP_X: 22,
  GSTR3B_QRMP_GROUP_Y: 24,
  PMT06: 25,
  CMP08: 18,
  GSTR5: 13,
  GSTR5A: 20,
  GSTR6: 13,
  GSTR7: 10,
  GSTR8: 10,
};

/** Notification 29/2021-CT, group X — quarterly GSTR-3B due on the 22nd. */
export const QRMP_GROUP_X_STATES = [
  "Andhra Pradesh",
  "Andaman and Nicobar Islands",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Goa",
  "Gujarat",
  "Karnataka",
  "Kerala",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Puducherry",
  "Tamil Nadu",
  "Telangana",
];

/** Group Y — quarterly GSTR-3B due on the 24th. */
export const QRMP_GROUP_Y_STATES = [
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Delhi",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Ladakh",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

export const PROFILES = [
  { id: "monthly", label: "Regular taxpayer filing monthly" },
  { id: "qrmp", label: "Regular taxpayer under QRMP (quarterly returns, monthly tax)" },
  { id: "composition", label: "Composition taxpayer" },
  { id: "tds-tcs", label: "TDS deductor or e-commerce operator collecting TCS" },
  { id: "isd", label: "Input Service Distributor" },
  { id: "nonresident", label: "Non-resident taxable person or OIDAR supplier" },
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

/** Earliest and latest financial-year start the calendar will build. */
export const MIN_FY_START = 2017;
export const MAX_FY_START = 2099;

const pad = (value) => String(value).padStart(2, "0");
const iso = (year, month, day) => `${year}-${pad(month)}-${pad(day)}`;

/** Calendar month and year for the nth month of a financial year starting in April. */
export function financialYearMonth(startYear, index) {
  const month = ((3 + index) % 12) + 1;
  const year = startYear + Math.floor((3 + index) / 12);
  return { year, month, name: MONTH_NAMES[month - 1] };
}

/** The month in which a return for a given period is due — always the following month. */
function followingMonth(year, month) {
  return month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
}

/** QRMP quarters of a financial year, as index ranges into the 12 months. */
export const QRMP_QUARTERS = [
  { label: "Apr – Jun", months: [0, 1, 2] },
  { label: "Jul – Sep", months: [3, 4, 5] },
  { label: "Oct – Dec", months: [6, 7, 8] },
  { label: "Jan – Mar", months: [9, 10, 11] },
];

export function qrmpDueDay(state) {
  if (QRMP_GROUP_X_STATES.includes(state)) return DUE_DAYS.GSTR3B_QRMP_GROUP_X;
  if (QRMP_GROUP_Y_STATES.includes(state)) return DUE_DAYS.GSTR3B_QRMP_GROUP_Y;
  return null;
}

export const ALL_QRMP_STATES = [...QRMP_GROUP_X_STATES, ...QRMP_GROUP_Y_STATES].sort((a, b) =>
  a.localeCompare(b),
);

/**
 * Build the full due-date list for a financial year.
 *
 * @param {object} input
 * @param {number} input.startYear   Financial year start, e.g. 2025 for FY 2025-26.
 * @param {string} input.profile     One of PROFILES[].id
 * @param {string} [input.state]     Needed only for the QRMP profile.
 * @returns {object} { financialYear, rows } or { error }.
 */
export function buildReturnCalendar({ startYear, profile, state }) {
  const year = Number(startYear);
  if (!Number.isInteger(year)) return { error: "Enter the financial year as a four-digit year." };
  if (year < MIN_FY_START || year > MAX_FY_START) {
    return { error: `GST began in July 2017, so choose a year between ${MIN_FY_START} and ${MAX_FY_START}.` };
  }
  if (!PROFILES.some((entry) => entry.id === profile)) {
    return { error: "Choose the kind of taxpayer you are." };
  }

  const rows = [];
  const push = (form, period, dueYear, dueMonth, dueDay, note) => {
    rows.push({
      form,
      period,
      dueDate: iso(dueYear, dueMonth, dueDay),
      note,
    });
  };

  if (profile === "monthly") {
    for (let index = 0; index < 12; index += 1) {
      const { year: py, month: pm, name } = financialYearMonth(year, index);
      const due = followingMonth(py, pm);
      push("GSTR-1", `${name} ${py}`, due.year, due.month, DUE_DAYS.GSTR1_MONTHLY, "Outward supplies");
      push("GSTR-3B", `${name} ${py}`, due.year, due.month, DUE_DAYS.GSTR3B_MONTHLY, "Summary return and tax payment");
    }
  }

  if (profile === "qrmp") {
    const day = qrmpDueDay(state);
    if (!day) return { error: "Choose your state so the 22nd or 24th QRMP due date can be applied." };

    QRMP_QUARTERS.forEach((quarter) => {
      quarter.months.forEach((index, position) => {
        const { year: py, month: pm, name } = financialYearMonth(year, index);
        const due = followingMonth(py, pm);
        if (position < 2) {
          push("IFF (optional)", `${name} ${py}`, due.year, due.month, DUE_DAYS.IFF, "Upload B2B invoices for the month");
          push("PMT-06", `${name} ${py}`, due.year, due.month, DUE_DAYS.PMT06, "Monthly tax payment challan");
        }
      });
      const lastIndex = quarter.months[2];
      const { year: qy, month: qm } = financialYearMonth(year, lastIndex);
      const due = followingMonth(qy, qm);
      push("GSTR-1", `${quarter.label} quarter`, due.year, due.month, DUE_DAYS.GSTR1_QUARTERLY, "Quarterly outward supplies");
      push("GSTR-3B", `${quarter.label} quarter`, due.year, due.month, day, `Quarterly summary return, ${day === DUE_DAYS.GSTR3B_QRMP_GROUP_X ? "group X state" : "group Y state"}`);
    });
  }

  if (profile === "composition") {
    QRMP_QUARTERS.forEach((quarter) => {
      const lastIndex = quarter.months[2];
      const { year: qy, month: qm } = financialYearMonth(year, lastIndex);
      const due = followingMonth(qy, qm);
      push("CMP-08", `${quarter.label} quarter`, due.year, due.month, DUE_DAYS.CMP08, "Quarterly statement and payment of the composition levy");
    });
    push("GSTR-4", `FY ${year}-${String(year + 1).slice(2)}`, year + 1, 6, 30, "Annual return by a composition taxpayer");
  }

  if (profile === "tds-tcs") {
    for (let index = 0; index < 12; index += 1) {
      const { year: py, month: pm, name } = financialYearMonth(year, index);
      const due = followingMonth(py, pm);
      push("GSTR-7", `${name} ${py}`, due.year, due.month, DUE_DAYS.GSTR7, "Return by a tax deductor");
      push("GSTR-8", `${name} ${py}`, due.year, due.month, DUE_DAYS.GSTR8, "Statement by an e-commerce operator collecting TCS");
    }
  }

  if (profile === "isd") {
    for (let index = 0; index < 12; index += 1) {
      const { year: py, month: pm, name } = financialYearMonth(year, index);
      const due = followingMonth(py, pm);
      push("GSTR-6", `${name} ${py}`, due.year, due.month, DUE_DAYS.GSTR6, "Distribution of input tax credit");
    }
  }

  if (profile === "nonresident") {
    for (let index = 0; index < 12; index += 1) {
      const { year: py, month: pm, name } = financialYearMonth(year, index);
      const due = followingMonth(py, pm);
      push("GSTR-5", `${name} ${py}`, due.year, due.month, DUE_DAYS.GSTR5, "Return by a non-resident taxable person");
      push("GSTR-5A", `${name} ${py}`, due.year, due.month, DUE_DAYS.GSTR5A, "Return by an OIDAR service supplier");
    }
  }

  if (profile === "monthly" || profile === "qrmp") {
    push("GSTR-9", `FY ${year}-${String(year + 1).slice(2)}`, year + 1, 12, 31, "Annual return");
    push(
      "GSTR-9C",
      `FY ${year}-${String(year + 1).slice(2)}`,
      year + 1,
      12,
      31,
      "Self-certified reconciliation statement, turnover above Rs 5 crore",
    );
  }

  rows.sort((a, b) => (a.dueDate < b.dueDate ? -1 : a.dueDate > b.dueDate ? 1 : 0));

  return {
    financialYear: `${year}-${String(year + 1).slice(2)}`,
    startYear: year,
    profile,
    state: profile === "qrmp" ? state : null,
    rows,
    totalFilings: rows.length,
  };
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function parseIso(value) {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) return null;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) {
    return null;
  }
  return date;
}

/**
 * The first due date on or after `today`, and how many days away it is.
 * `today` is an argument so the function stays pure.
 */
export function nextDueFilings(rows, today, limit = 3) {
  const now = parseIso(today);
  if (!now || !Array.isArray(rows)) return [];
  return rows
    .filter((row) => row.dueDate >= today)
    .slice(0, limit)
    .map((row) => {
      const due = parseIso(row.dueDate);
      return {
        ...row,
        daysAway: due ? Math.round((due.getTime() - now.getTime()) / MS_PER_DAY) : null,
      };
    });
}
