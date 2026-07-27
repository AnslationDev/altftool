/**
 * Leave with wages register (India, Factories Act 1948 Chapter VIII).
 *
 * Statutory basis of every constant and rule used below:
 *  - s.79(1): a worker who has worked 240 days or more in a calendar year is allowed leave
 *    with wages in the following year at one day for every 20 days worked (adult) and one day
 *    for every 15 days worked (a child / young person).
 *  - s.79(1) Explanation: a fraction of leave of half a day or more counts as one full day;
 *    a fraction of less than half a day is omitted.
 *  - s.79(2): a worker whose service starts other than on 1 January earns leave on the same
 *    scale if he has worked two-thirds of the total days in the remainder of that calendar year.
 *  - s.79(5): untaken leave is carried forward to the next calendar year, capped at 30 days for
 *    an adult and 40 days for a child; leave that the employer refused is carried forward
 *    over and above that cap.
 *  - s.80: leave wages are paid at the rate of the worker's average daily wages.
 *  - Rule 94 / Form 15 of the state Factories Rules: the register of leave with wages records
 *    entitlement, leave availed with dates and the balance remaining.
 */

/** s.79(1)(i) — one day of leave for every 20 days worked by an adult. */
export const ADULT_LEAVE_DIVISOR = 20;

/** s.79(1)(ii) — one day of leave for every 15 days worked by a child / young person. */
export const YOUNG_LEAVE_DIVISOR = 15;

/** s.79(1) — days of work in the calendar year needed to qualify for leave. */
export const QUALIFYING_DAYS = 240;

/** s.79(5) — carry-forward ceiling for an adult worker. */
export const MAX_CARRY_FORWARD_ADULT = 30;

/** s.79(5) — carry-forward ceiling for a child / young person. */
export const MAX_CARRY_FORWARD_YOUNG = 40;

/** s.79(2) — mid-year joiners qualify on two-thirds of the remaining days of the year. */
export const MID_YEAR_QUALIFYING_FRACTION = 2 / 3;

export const WORKER_TYPES = [
  { value: "adult", label: "Adult worker (18 and above)", divisor: ADULT_LEAVE_DIVISOR, carryCap: MAX_CARRY_FORWARD_ADULT },
  { value: "young", label: "Child / young person (under 18)", divisor: YOUNG_LEAVE_DIVISOR, carryCap: MAX_CARRY_FORWARD_YOUNG },
];

const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * s.79(1) Explanation — half a day or more rounds up to a full day, less than half is dropped.
 */
export function roundLeaveDays(rawDays) {
  if (!isFiniteNumber(rawDays) || rawDays <= 0) return 0;
  const whole = Math.floor(rawDays);
  return rawDays - whole >= 0.5 ? whole + 1 : whole;
}

/**
 * Leave earned for a calendar year.
 * Returns { error } for unusable input, otherwise
 * { qualifies, divisor, rawDays, earnedDays, qualifyingThreshold, reason }.
 */
export function computeLeaveEntitlement({
  daysWorked,
  workerType = "adult",
  joinedMidYear = false,
  daysInRemainder = 0,
}) {
  if (!isFiniteNumber(daysWorked) || daysWorked < 0) {
    return { error: "Days actually worked must be zero or more." };
  }
  if (daysWorked > 366) {
    return { error: "A calendar year cannot contain more than 366 worked days." };
  }
  const type = WORKER_TYPES.find((item) => item.value === workerType);
  if (!type) return { error: "Choose whether the worker is an adult or a young person." };

  let threshold = QUALIFYING_DAYS;
  let reason = `${QUALIFYING_DAYS} days of work in the calendar year (s.79(1))`;

  if (joinedMidYear) {
    if (!isFiniteNumber(daysInRemainder) || daysInRemainder <= 0 || daysInRemainder > 366) {
      return { error: "Enter the number of calendar days left in the year when the worker joined (1-366)." };
    }
    threshold = daysInRemainder * MID_YEAR_QUALIFYING_FRACTION;
    reason = `two-thirds of the ${Math.round(daysInRemainder)} days left in the year, i.e. ${round2(threshold)} days (s.79(2))`;
    if (daysWorked > daysInRemainder) {
      return { error: "Days worked cannot be more than the days left in the year after joining." };
    }
  }

  const qualifies = daysWorked >= threshold;
  const rawDays = daysWorked / type.divisor;

  return {
    qualifies,
    divisor: type.divisor,
    carryCap: type.carryCap,
    rawDays: round2(rawDays),
    earnedDays: qualifies ? roundLeaveDays(rawDays) : 0,
    qualifyingThreshold: round2(threshold),
    reason,
  };
}

/**
 * Full register: opening balance (capped carry forward) + leave earned - leave availed.
 *
 * availed: [{ from: "YYYY-MM-DD", to: "YYYY-MM-DD", days, remark }]
 * Returns { error } or { entitlement, openingBalance, cappedFrom, rows, totals }.
 */
export function buildLeaveRegister({
  daysWorked,
  workerType = "adult",
  joinedMidYear = false,
  daysInRemainder = 0,
  broughtForward = 0,
  refusedLeaveCarried = 0,
  averageDailyWage = 0,
  availed = [],
}) {
  const entitlement = computeLeaveEntitlement({ daysWorked, workerType, joinedMidYear, daysInRemainder });
  if (entitlement.error) return { error: entitlement.error };

  if (!isFiniteNumber(broughtForward) || broughtForward < 0 || broughtForward > 365) {
    return { error: "Leave brought forward must be between 0 and 365 days." };
  }
  if (!isFiniteNumber(refusedLeaveCarried) || refusedLeaveCarried < 0 || refusedLeaveCarried > 365) {
    return { error: "Refused leave carried over must be between 0 and 365 days." };
  }
  if (!isFiniteNumber(averageDailyWage) || averageDailyWage < 0) {
    return { error: "Average daily wage cannot be negative." };
  }
  if (!Array.isArray(availed)) {
    return { error: "The leave availed list is not readable." };
  }

  const cappedCarry = Math.min(broughtForward, entitlement.carryCap);
  const openingBalance = cappedCarry + refusedLeaveCarried;
  const warnings = [];

  if (broughtForward > entitlement.carryCap) {
    warnings.push(
      `Only ${entitlement.carryCap} days can be carried forward under s.79(5); ${round2(broughtForward - entitlement.carryCap)} day(s) lapse unless the employer refused that leave.`,
    );
  }
  if (!entitlement.qualifies) {
    warnings.push(
      `No leave is earned for this year: the worker needs ${entitlement.qualifyingThreshold} days of work but has ${round2(daysWorked)}.`,
    );
  }

  const credit = openingBalance + entitlement.earnedDays;
  const rows = [];
  let balance = credit;
  let totalAvailed = 0;

  for (let index = 0; index < availed.length; index += 1) {
    const item = availed[index] || {};
    const days = Number(item.days);
    if (!Number.isFinite(days) || days <= 0) {
      return { error: `Leave row ${index + 1}: days availed must be greater than zero.` };
    }
    if (days > 365) {
      return { error: `Leave row ${index + 1}: days availed cannot exceed 365.` };
    }
    const from = typeof item.from === "string" ? item.from.trim() : "";
    const to = typeof item.to === "string" ? item.to.trim() : "";
    if (from && to && to < from) {
      return { error: `Leave row ${index + 1}: the end date is before the start date.` };
    }

    balance = round2(balance - days);
    totalAvailed = round2(totalAvailed + days);
    rows.push({
      serial: index + 1,
      from,
      to,
      days: round2(days),
      remark: typeof item.remark === "string" ? item.remark.trim() : "",
      balanceAfter: balance,
      overdrawn: balance < 0,
    });
  }

  if (balance < 0) {
    warnings.push(
      `Leave availed exceeds the credit by ${round2(Math.abs(balance))} day(s) — record the excess as leave without pay or another leave type.`,
    );
  }

  const closingBalance = round2(balance);
  const carryToNextYear = Math.min(Math.max(closingBalance, 0), entitlement.carryCap);
  const lapsing = round2(Math.max(closingBalance, 0) - carryToNextYear);

  return {
    entitlement,
    openingBalance: round2(openingBalance),
    cappedFrom: round2(broughtForward),
    earnedDays: entitlement.earnedDays,
    totalCredit: round2(credit),
    rows,
    warnings,
    totals: {
      availed: totalAvailed,
      closingBalance,
      carryToNextYear: round2(carryToNextYear),
      lapsing,
      encashmentValue: round2(Math.max(closingBalance, 0) * averageDailyWage),
    },
  };
}

const csvCell = (value) => {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

/** The register as CSV in the Form 15 column order. */
export function registerToCsv(result, meta = {}) {
  if (!result || result.error) return "";
  const lines = [
    "Register of Leave with Wages (Factories Act 1948, Chapter VIII)",
    `Establishment,${csvCell(meta.employer || "")}`,
    `Worker,${csvCell(meta.worker || "")}`,
    `Calendar year,${csvCell(meta.year || "")}`,
    "",
    `Days worked,${result.entitlement.rawDays * result.entitlement.divisor}`,
    `Leave earned this year (days),${result.earnedDays}`,
    `Leave brought forward (days),${result.openingBalance}`,
    `Total credit (days),${result.totalCredit}`,
    "",
    ["S. No.", "Leave from", "Leave to", "Days", "Balance after", "Remark"].map(csvCell).join(","),
    ...result.rows.map((row) =>
      [row.serial, row.from, row.to, row.days, row.balanceAfter, row.remark].map(csvCell).join(","),
    ),
    "",
    `Total leave availed (days),${result.totals.availed}`,
    `Closing balance (days),${result.totals.closingBalance}`,
    `Carried to next year (days),${result.totals.carryToNextYear}`,
  ];
  return lines.join("\n");
}
