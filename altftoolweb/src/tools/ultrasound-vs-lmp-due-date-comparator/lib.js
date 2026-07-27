/**
 * Ultrasound versus last-menstrual-period dating.
 *
 * LMP due date (Naegele's rule): last period + 280 days, shifted by
 * (cycle length - 28) days when the cycle is not 28 days, because ovulation is
 * assumed to be 14 days before the next period rather than on day 14.
 *
 * Ultrasound due date: the scan reports a gestational age on the scan day, so
 * the due date is scan date + (280 - gestational age in days).
 *
 * Whether the scan should replace the LMP date follows the ACOG / SMFM /AIUM
 * "Methods for Estimating the Due Date" thresholds, which widen as pregnancy
 * advances because ultrasound biometry loses precision:
 *
 *   up to 8w6d      redate if the gap is more than 5 days
 *   9w0d - 15w6d    more than 7 days
 *   16w0d - 21w6d   more than 10 days
 *   22w0d - 27w6d   more than 14 days
 *   28w0d onwards   more than 21 days
 *
 * All dates are "YYYY-MM-DD" strings handled in UTC; nothing reads the clock.
 */

export const MS_PER_DAY = 86400000;
export const DAYS_FROM_LMP = 280;
export const STANDARD_CYCLE_DAYS = 28;

export const MIN_CYCLE_DAYS = 20;
export const MAX_CYCLE_DAYS = 45;
export const MIN_SCAN_WEEKS = 4;
export const MAX_SCAN_WEEKS = 42;

/** ACOG redating thresholds, keyed to gestational age by LMP at the scan. */
export const REDATING_THRESHOLDS = [
  { maxGaDays: 62, days: 5, label: "up to 8w6d" }, // 8w6d = 62 days
  { maxGaDays: 111, days: 7, label: "9w0d to 15w6d" }, // 15w6d = 111 days
  { maxGaDays: 153, days: 10, label: "16w0d to 21w6d" }, // 21w6d = 153 days
  { maxGaDays: 195, days: 14, label: "22w0d to 27w6d" }, // 27w6d = 195 days
  { maxGaDays: Infinity, days: 21, label: "28w0d onwards" },
];

const ISO_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Parse "YYYY-MM-DD" to a UTC timestamp, or null. */
export function parseISODate(value) {
  if (typeof value !== "string") return null;
  const match = ISO_PATTERN.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1900 || year > 2100) return null;
  const timestamp = Date.UTC(year, month - 1, day);
  const check = new Date(timestamp);
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    return null;
  }
  return timestamp;
}

/** Format a UTC timestamp as "YYYY-MM-DD". */
export function toISODate(timestamp) {
  if (!Number.isFinite(timestamp)) return "";
  const date = new Date(timestamp);
  return `${String(date.getUTCFullYear()).padStart(4, "0")}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

export function addDays(timestamp, days) {
  if (!Number.isFinite(timestamp) || !Number.isFinite(days)) return NaN;
  return timestamp + Math.round(days) * MS_PER_DAY;
}

export function daysBetween(from, to) {
  if (!Number.isFinite(from) || !Number.isFinite(to)) return NaN;
  return Math.round((to - from) / MS_PER_DAY);
}

/** Format a day count as "12w 4d". */
export function formatWeeksDays(totalDays) {
  if (!Number.isFinite(totalDays)) return "—";
  const sign = totalDays < 0 ? "-" : "";
  const abs = Math.abs(Math.round(totalDays));
  return `${sign}${Math.floor(abs / 7)}w ${abs % 7}d`;
}

/** The ACOG threshold that applies at a given gestational age in days. */
export function thresholdForGestationalAge(gaDays) {
  if (!Number.isFinite(gaDays)) return null;
  return REDATING_THRESHOLDS.find((band) => gaDays <= band.maxGaDays) || null;
}

/**
 * Compare LMP dating with ultrasound dating.
 *
 * @param {object} input
 * @param {string} input.lmpDate "YYYY-MM-DD" first day of the last period.
 * @param {number} [input.cycleLength] Usual cycle length in days.
 * @param {string} input.scanDate "YYYY-MM-DD" date of the ultrasound.
 * @param {number} input.scanWeeks Gestational weeks reported by the scan.
 * @param {number} input.scanDays Extra days reported by the scan (0-6).
 * @returns {object} results or { error }
 */
export function compareDueDates({
  lmpDate,
  cycleLength = STANDARD_CYCLE_DAYS,
  scanDate,
  scanWeeks,
  scanDays = 0,
} = {}) {
  const lmp = parseISODate(lmpDate);
  if (lmp === null) return { error: "Enter a valid last-period date as YYYY-MM-DD." };

  const scan = parseISODate(scanDate);
  if (scan === null) return { error: "Enter a valid scan date as YYYY-MM-DD." };

  const cycle = Number(cycleLength);
  if (!Number.isFinite(cycle) || cycle < MIN_CYCLE_DAYS || cycle > MAX_CYCLE_DAYS) {
    return { error: `Cycle length should be between ${MIN_CYCLE_DAYS} and ${MAX_CYCLE_DAYS} days.` };
  }

  const weeks = Number(scanWeeks);
  const extraDays = Number(scanDays);
  if (!Number.isFinite(weeks) || weeks < MIN_SCAN_WEEKS || weeks > MAX_SCAN_WEEKS) {
    return {
      error: `Scan gestational age should be between ${MIN_SCAN_WEEKS} and ${MAX_SCAN_WEEKS} weeks.`,
    };
  }
  if (!Number.isFinite(extraDays) || extraDays < 0 || extraDays > 6) {
    return { error: "Scan days should be between 0 and 6." };
  }

  if (scan < lmp) return { error: "The scan date cannot be before the last-period date." };

  const cycleShift = Math.round(cycle) - STANDARD_CYCLE_DAYS;
  const lmpEdd = addDays(lmp, DAYS_FROM_LMP + cycleShift);
  const gaByLmpAtScan = daysBetween(lmp, scan) - cycleShift;

  if (gaByLmpAtScan < 0) {
    return { error: "With that cycle length the scan happens before conception is possible." };
  }
  if (gaByLmpAtScan > 322) {
    return { error: "The scan date is more than 46 weeks after the last period — check the dates." };
  }

  const gaByScan = Math.round(weeks) * 7 + Math.round(extraDays);
  const scanEdd = addDays(scan, DAYS_FROM_LMP - gaByScan);

  // Positive when the LMP due date is later than the scan due date.
  const differenceDays = daysBetween(scanEdd, lmpEdd);
  const magnitude = Math.abs(differenceDays);

  const threshold = thresholdForGestationalAge(gaByLmpAtScan);
  const shouldRedate = threshold ? magnitude > threshold.days : false;
  const recommendedEdd = shouldRedate ? scanEdd : lmpEdd;
  const recommendedSource = shouldRedate ? "ultrasound" : "last menstrual period";

  return {
    lmp,
    scan,
    cycleLength: Math.round(cycle),
    cycleShift,
    lmpEdd,
    scanEdd,
    gaByLmpAtScan,
    gaByScan,
    ageDifferenceDays: gaByScan - gaByLmpAtScan,
    ageDifferenceMagnitude: Math.abs(gaByScan - gaByLmpAtScan),
    cycleShiftMagnitude: Math.abs(cycleShift),
    differenceDays,
    magnitude,
    threshold,
    shouldRedate,
    recommendedEdd,
    recommendedSource,
    scanIsAhead: gaByScan > gaByLmpAtScan,
  };
}
