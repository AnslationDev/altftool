/**
 * Attendance register layout builder.
 *
 * Statutory basis (India):
 *  - "Ease of Compliance to Maintain Registers under various Labour Laws Rules, 2017"
 *    (Ministry of Labour and Employment, notified 21 February 2017) replaced 56 registers
 *    prescribed under 9 central labour laws with 5 combined registers. Form D of those
 *    rules is the Attendance Register: establishment details, then one row per employee
 *    with a column for every day of the wage month plus totals.
 *  - The same rules require every register to be preserved for 3 years after the date of
 *    the last entry made in it.
 *  - Form D consolidates, among others, Form V (Muster Roll) under rule 26(5) of the
 *    Minimum Wages (Central) Rules, 1950 and Form XVI (Muster Roll) under rule 78(1)(a)(i)
 *    of the Contract Labour (Regulation and Abolition) Central Rules, 1971.
 *
 * Everything here is pure: no Date.now(), no DOM, no React.
 */

/** Form D keeps one column per calendar day; the longest month has 31. */
export const MAX_DAY_COLUMNS = 31;

/** Registers must be preserved for three years after the last entry (2017 Rules). */
export const REGISTER_RETENTION_YEARS = 3;

/** Non-leap month lengths, January first. */
const MONTH_LENGTHS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

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

/** Index 0 is Sunday, matching getUTCDay(). */
export const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const WEEKDAY_SHORT = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

/**
 * Marking codes used on the register. "P/A" presence marking plus the leave codes is the
 * conventional Indian payroll shorthand; the statute prescribes the columns, not the letters,
 * so the legend is printed on the sheet to keep the register self-explanatory to an inspector.
 */
export const ATTENDANCE_CODES = [
  ["P", "Present for the full shift"],
  ["A", "Absent - no wages for the day"],
  ["HD", "Half day worked"],
  ["WO", "Weekly off"],
  ["PH", "Paid / national or festival holiday"],
  ["CL", "Casual leave"],
  ["SL", "Sick leave"],
  ["EL", "Earned / privilege leave"],
  ["LWP", "Leave without pay"],
  ["OD", "On duty away from the establishment"],
];

/** Sensible ceiling so a pasted document cannot generate a million-row table. */
export const MAX_EMPLOYEES = 200;

/** Gregorian leap rule: divisible by 4, except centuries not divisible by 400. */
export function isLeapYear(year) {
  if (!Number.isInteger(year)) return false;
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/** month is 1-12. Returns 0 for an out-of-range month. */
export function daysInMonth(year, month) {
  if (!Number.isInteger(year) || !Number.isInteger(month)) return 0;
  if (month < 1 || month > 12) return 0;
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  return MONTH_LENGTHS[month - 1];
}

/** 0 = Sunday. Uses Date.UTC purely as a calendar function - no clock is read. */
export function weekdayIndex(year, month, day) {
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

/**
 * Split a pasted list of employees into rows.
 * Accepts "code, name" or "code | name" or just "name" per line.
 */
export function parseEmployeeList(raw) {
  if (typeof raw !== "string") return [];
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const parts = line.split(/\s*[|,;\t]\s*/).filter(Boolean);
      if (parts.length >= 2) {
        return { code: parts[0], name: parts.slice(1).join(" ") };
      }
      return { code: String(index + 1), name: parts[0] || line };
    });
}

/** Parse "2, 15, 26" into a sorted, de-duplicated list of day numbers. */
export function parseHolidayDays(raw, totalDays) {
  if (typeof raw !== "string" || !raw.trim()) return { days: [], invalid: [] };
  const invalid = [];
  const days = [];
  for (const token of raw.split(/[\s,;]+/).filter(Boolean)) {
    const value = Number(token);
    if (!Number.isInteger(value) || value < 1 || value > totalDays) {
      invalid.push(token);
    } else if (!days.includes(value)) {
      days.push(value);
    }
  }
  days.sort((a, b) => a - b);
  return { days, invalid };
}

/**
 * Build the register layout.
 *
 * @param {object} input
 * @param {string} input.establishment  Name of the establishment (Form D header).
 * @param {string} [input.address]      Address / LIN shown under the name.
 * @param {number} input.year           Four digit calendar year.
 * @param {number} input.month          1-12.
 * @param {string} input.employees      Newline separated "code, name" list.
 * @param {number|null} input.weeklyOffDay  0-6 (Sunday..Saturday), or null for none.
 * @param {string} [input.holidays]     Comma separated day numbers that are paid holidays.
 * @param {boolean} [input.includeOvertime] Add the overtime-hours total column.
 * @returns {object} layout, or { error } for unusable input.
 */
export function buildAttendanceRegister({
  establishment,
  address = "",
  year,
  month,
  employees,
  weeklyOffDay = 0,
  holidays = "",
  includeOvertime = true,
} = {}) {
  const name = typeof establishment === "string" ? establishment.trim() : "";
  if (!name) return { error: "Enter the name of the establishment for the register header." };

  const y = Number(year);
  const m = Number(month);
  if (!Number.isInteger(y) || y < 1900 || y > 2200) {
    return { error: "Enter a four digit year between 1900 and 2200." };
  }
  if (!Number.isInteger(m) || m < 1 || m > 12) {
    return { error: "Choose a month between January and December." };
  }

  const totalDays = daysInMonth(y, m);
  if (totalDays <= 0) return { error: "That month does not exist." };

  const rows = parseEmployeeList(employees);
  if (rows.length === 0) {
    return { error: "Add at least one employee - one per line, as \"code, name\"." };
  }
  if (rows.length > MAX_EMPLOYEES) {
    return { error: `This layout is capped at ${MAX_EMPLOYEES} employees per sheet.` };
  }

  const offDay =
    weeklyOffDay === null || weeklyOffDay === "" || weeklyOffDay === undefined
      ? null
      : Number(weeklyOffDay);
  if (offDay !== null && (!Number.isInteger(offDay) || offDay < 0 || offDay > 6)) {
    return { error: "Weekly off must be a day of the week." };
  }

  const { days: holidayDays, invalid } = parseHolidayDays(holidays, totalDays);
  if (invalid.length > 0) {
    return {
      error: `Holiday days must be numbers between 1 and ${totalDays}. Check: ${invalid.join(", ")}`,
    };
  }

  const dayColumns = [];
  let weeklyOffCount = 0;
  let holidayCount = 0;

  for (let day = 1; day <= totalDays; day += 1) {
    const wd = weekdayIndex(y, m, day);
    const isWeeklyOff = offDay !== null && wd === offDay;
    const isHoliday = holidayDays.includes(day);
    if (isWeeklyOff) weeklyOffCount += 1;
    // A paid holiday that lands on the weekly off is not counted twice.
    if (isHoliday && !isWeeklyOff) holidayCount += 1;
    dayColumns.push({
      day,
      weekday: WEEKDAY_SHORT[wd],
      weekdayFull: WEEKDAY_NAMES[wd],
      isWeeklyOff,
      isHoliday,
      defaultMark: isWeeklyOff ? "WO" : isHoliday ? "PH" : "",
    });
  }

  const workingDays = totalDays - weeklyOffCount - holidayCount;

  const totalColumns =
    2 + // serial number + employee code
    1 + // name
    totalDays +
    2 + // days worked + days absent
    (includeOvertime ? 1 : 0);

  return {
    establishment: name,
    address: typeof address === "string" ? address.trim() : "",
    year: y,
    month: m,
    monthLabel: `${MONTH_NAMES[m - 1]} ${y}`,
    totalDays,
    dayColumns,
    rows: rows.map((row, index) => ({ sl: index + 1, code: row.code, name: row.name })),
    employeeCount: rows.length,
    weeklyOffDay: offDay,
    weeklyOffLabel: offDay === null ? "None" : WEEKDAY_NAMES[offDay],
    weeklyOffCount,
    holidayDays,
    holidayCount,
    workingDays,
    includeOvertime,
    totalColumns,
    legend: ATTENDANCE_CODES,
    retentionYears: REGISTER_RETENTION_YEARS,
  };
}

/** Flatten a built register into CSV text that opens straight into a spreadsheet. */
export function registerToCsv(register) {
  if (!register || register.error) return "";
  const escape = (cell) => {
    const value = String(cell ?? "");
    return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
  };

  const lines = [];
  lines.push([`Attendance Register (Form D) - ${register.establishment}`].map(escape).join(","));
  if (register.address) lines.push([register.address].map(escape).join(","));
  lines.push([`Wage month: ${register.monthLabel}`].map(escape).join(","));
  lines.push("");

  const header = ["Sl. No.", "Employee code", "Name of employee"];
  for (const column of register.dayColumns) header.push(`${column.day} ${column.weekday}`);
  header.push("Days worked", "Days absent");
  if (register.includeOvertime) header.push("Overtime hours");
  lines.push(header.map(escape).join(","));

  for (const row of register.rows) {
    const cells = [row.sl, row.code, row.name];
    for (const column of register.dayColumns) cells.push(column.defaultMark);
    cells.push("", "");
    if (register.includeOvertime) cells.push("");
    lines.push(cells.map(escape).join(","));
  }

  lines.push("");
  lines.push(["Legend"].map(escape).join(","));
  for (const [code, meaning] of register.legend) {
    lines.push([code, meaning].map(escape).join(","));
  }
  return lines.join("\n");
}
