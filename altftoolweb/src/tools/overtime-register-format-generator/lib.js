/**
 * Overtime register builder (India).
 *
 * Statutory basis of every constant used below:
 *  - Factories Act 1948, s.59(1): a worker who works overtime is entitled to wages
 *    at TWICE the ordinary rate of wages for the overtime hours.
 *  - Factories Act 1948, s.54: ordinary work must not exceed 9 hours in a day.
 *  - Factories Act 1948, s.51: ordinary work must not exceed 48 hours in a week.
 *  - Factories Act 1948, s.64(4)(iv): total hours of work in any day (ordinary + overtime)
 *    must not exceed 10.
 *  - Factories Act 1948, s.64(4)(v): total overtime hours must not exceed 50 in any one quarter.
 *  - Minimum Wages (Central) Rules 1950, r.25(2): the employer keeps a register of overtime
 *    in Form IV, recording overtime hours worked, the overtime wages due and the date on
 *    which those wages were paid.
 *  - Minimum Wages (Central) Rules 1950, r.20 / common wage practice: the daily wage is derived
 *    by dividing the monthly wage by the number of paid days in the wage period (26 is the
 *    usual divisor where the weekly day of rest is paid separately).
 */

/** Factories Act 1948 s.59(1) — overtime is paid at twice the ordinary rate. */
export const OVERTIME_RATE_MULTIPLIER = 2;

/** Factories Act 1948 s.54 — ordinary daily hours ceiling. */
export const MAX_ORDINARY_DAILY_HOURS = 9;

/** Factories Act 1948 s.51 — ordinary weekly hours ceiling. */
export const MAX_ORDINARY_WEEKLY_HOURS = 48;

/** Factories Act 1948 s.64(4)(iv) — ordinary + overtime hours in one day. */
export const MAX_DAILY_TOTAL_HOURS = 10;

/** Factories Act 1948 s.64(4)(v) — overtime ceiling per calendar quarter. */
export const MAX_QUARTERLY_OVERTIME_HOURS = 50;

/** Usual divisor for converting a monthly wage into a daily wage. */
export const DEFAULT_WAGE_DAYS_PER_MONTH = 26;

/** Normal working hours a full day's wage buys. */
export const DEFAULT_NORMAL_DAILY_HOURS = 8;

/** Column order of the printed register (Form IV of the Minimum Wages (Central) Rules 1950). */
export const REGISTER_COLUMNS = [
  "S. No.",
  "Date",
  "Normal hours",
  "Overtime hours",
  "Total hours",
  "Ordinary rate / hour",
  "Overtime rate / hour",
  "Overtime wages",
  "Date of payment",
];

const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Ordinary hourly rate = monthly wage / (paid days in the wage period x normal daily hours).
 * Returns null when any input cannot produce a real rate.
 */
export function computeHourlyRate({ monthlyWage, wageDays, normalDailyHours }) {
  if (!isFiniteNumber(monthlyWage) || monthlyWage <= 0) return null;
  if (!isFiniteNumber(wageDays) || wageDays <= 0) return null;
  if (!isFiniteNumber(normalDailyHours) || normalDailyHours <= 0) return null;
  const divisor = wageDays * normalDailyHours;
  if (!(divisor > 0)) return null;
  return monthlyWage / divisor;
}

/** ISO date string (YYYY-MM-DD) -> calendar quarter key such as "2026-Q3". Null when unparseable. */
export function quarterKey(isoDate) {
  if (typeof isoDate !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (!(month >= 1 && month <= 12)) return null;
  return `${year}-Q${Math.ceil(month / 3)}`;
}

/**
 * Build the register.
 *
 * entries: [{ date: "YYYY-MM-DD", normalHours, overtimeHours, paymentDate }]
 * Returns { error } for unusable input, otherwise
 * { hourlyRate, overtimeRate, rows, totals, warnings }.
 */
export function buildOvertimeRegister({
  monthlyWage,
  wageDays = DEFAULT_WAGE_DAYS_PER_MONTH,
  normalDailyHours = DEFAULT_NORMAL_DAILY_HOURS,
  overtimeMultiplier = OVERTIME_RATE_MULTIPLIER,
  entries = [],
}) {
  if (!isFiniteNumber(monthlyWage) || monthlyWage <= 0) {
    return { error: "Enter the monthly wage as a number greater than zero." };
  }
  if (!isFiniteNumber(wageDays) || wageDays <= 0 || wageDays > 31) {
    return { error: "Paid days in the wage period must be between 1 and 31." };
  }
  if (!isFiniteNumber(normalDailyHours) || normalDailyHours <= 0 || normalDailyHours > 12) {
    return { error: "Normal daily hours must be between 1 and 12." };
  }
  if (!isFiniteNumber(overtimeMultiplier) || overtimeMultiplier < 1 || overtimeMultiplier > 3) {
    return { error: "The overtime multiplier must be between 1 and 3 (the statutory rate is 2)." };
  }
  if (!Array.isArray(entries) || entries.length === 0) {
    return { error: "Add at least one dated row to the register." };
  }

  const hourlyRate = computeHourlyRate({ monthlyWage, wageDays, normalDailyHours });
  if (hourlyRate === null) {
    return { error: "The wage and hours entered do not produce a usable hourly rate." };
  }
  const overtimeRate = hourlyRate * overtimeMultiplier;

  const rows = [];
  const warnings = [];
  const quarterHours = new Map();
  let totalNormal = 0;
  let totalOvertime = 0;
  let totalOvertimeWages = 0;

  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index] || {};
    const normalHours = Number(entry.normalHours);
    const overtimeHours = Number(entry.overtimeHours);
    const date = typeof entry.date === "string" ? entry.date.trim() : "";

    if (!date) return { error: `Row ${index + 1}: pick a date for the worked day.` };
    if (!quarterKey(date)) return { error: `Row ${index + 1}: the date must be a real calendar date.` };
    if (!Number.isFinite(normalHours) || normalHours < 0 || normalHours > 24) {
      return { error: `Row ${index + 1}: normal hours must be between 0 and 24.` };
    }
    if (!Number.isFinite(overtimeHours) || overtimeHours < 0 || overtimeHours > 24) {
      return { error: `Row ${index + 1}: overtime hours must be between 0 and 24.` };
    }

    const totalHours = normalHours + overtimeHours;
    if (totalHours > 24) {
      return { error: `Row ${index + 1}: normal and overtime hours add up to more than 24 hours.` };
    }

    const wages = overtimeHours * overtimeRate;
    totalNormal += normalHours;
    totalOvertime += overtimeHours;
    totalOvertimeWages += wages;

    const key = quarterKey(date);
    quarterHours.set(key, (quarterHours.get(key) || 0) + overtimeHours);

    if (normalHours > MAX_ORDINARY_DAILY_HOURS) {
      warnings.push(
        `${date}: ${round2(normalHours)} ordinary hours exceeds the 9-hour daily limit in s.54 of the Factories Act 1948.`,
      );
    }
    if (totalHours > MAX_DAILY_TOTAL_HOURS) {
      warnings.push(
        `${date}: ${round2(totalHours)} total hours exceeds the 10-hour daily cap in s.64(4)(iv).`,
      );
    }

    rows.push({
      serial: index + 1,
      date,
      normalHours: round2(normalHours),
      overtimeHours: round2(overtimeHours),
      totalHours: round2(totalHours),
      hourlyRate: round2(hourlyRate),
      overtimeRate: round2(overtimeRate),
      overtimeWages: round2(wages),
      paymentDate: typeof entry.paymentDate === "string" ? entry.paymentDate.trim() : "",
      quarter: key,
    });
  }

  const quarters = [...quarterHours.entries()]
    .map(([quarter, hours]) => ({ quarter, hours: round2(hours) }))
    .sort((a, b) => a.quarter.localeCompare(b.quarter));

  for (const item of quarters) {
    if (item.hours > MAX_QUARTERLY_OVERTIME_HOURS) {
      warnings.push(
        `${item.quarter}: ${item.hours} overtime hours exceeds the 50-hour quarterly ceiling in s.64(4)(v).`,
      );
    }
  }

  const unpaid = rows.filter((row) => !row.paymentDate).length;
  if (unpaid > 0) {
    warnings.push(
      `${unpaid} row(s) have no payment date — Form IV requires the date the overtime wages were paid.`,
    );
  }

  return {
    hourlyRate: round2(hourlyRate),
    overtimeRate: round2(overtimeRate),
    rows,
    quarters,
    warnings,
    totals: {
      days: rows.length,
      normalHours: round2(totalNormal),
      overtimeHours: round2(totalOvertime),
      totalHours: round2(totalNormal + totalOvertime),
      overtimeWages: round2(totalOvertimeWages),
      averageOvertimePerDay: rows.length > 0 ? round2(totalOvertime / rows.length) : 0,
    },
  };
}

const csvCell = (value) => {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

/** Register as CSV, ready for a spreadsheet or a printed muster. */
export function registerToCsv(result, meta = {}) {
  if (!result || result.error || !Array.isArray(result.rows)) return "";
  const header = [
    `Register of Overtime (Form IV, Minimum Wages (Central) Rules 1950)`,
    `Establishment,${csvCell(meta.employer || "")}`,
    `Worker,${csvCell(meta.worker || "")}`,
    `Designation,${csvCell(meta.designation || "")}`,
    `Wage period,${csvCell(meta.wagePeriod || "")}`,
    "",
  ];
  const body = [
    REGISTER_COLUMNS.map(csvCell).join(","),
    ...result.rows.map((row) =>
      [
        row.serial,
        row.date,
        row.normalHours,
        row.overtimeHours,
        row.totalHours,
        row.hourlyRate,
        row.overtimeRate,
        row.overtimeWages,
        row.paymentDate,
      ]
        .map(csvCell)
        .join(","),
    ),
    [
      "",
      "Total",
      result.totals.normalHours,
      result.totals.overtimeHours,
      result.totals.totalHours,
      "",
      "",
      result.totals.overtimeWages,
      "",
    ]
      .map(csvCell)
      .join(","),
  ];
  return [...header, ...body].join("\n");
}
