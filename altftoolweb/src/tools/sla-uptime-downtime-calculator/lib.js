/**
 * SLA uptime / downtime budget calculator.
 *
 * The downtime allowance for an availability target is simply
 *   allowed downtime = (1 - uptime% / 100) x length of the period.
 * This is the same arithmetic used in every SLA ("three nines", "four nines"
 * etc.) and in SRE error-budget planning (Google SRE Book, ch. 4).
 */

/** Seconds in one civil day. */
export const SECONDS_PER_DAY = 24 * 60 * 60;

/**
 * Average length of a Gregorian calendar year in days (365.2425 — the
 * Gregorian calendar's 400-year mean, which is why a "monthly" SLA window is
 * 30.436875 days rather than a flat 30). Using the mean keeps the daily,
 * monthly, quarterly and yearly figures mutually consistent.
 */
export const DAYS_PER_YEAR = 365.2425;
export const DAYS_PER_MONTH = DAYS_PER_YEAR / 12; // 30.436875
export const DAYS_PER_QUARTER = DAYS_PER_YEAR / 4; // 91.310625
export const DAYS_PER_WEEK = 7;

/** Periods reported by the calculator, in display order. */
export const PERIODS = [
  { id: "day", label: "Per day", days: 1 },
  { id: "week", label: "Per week", days: DAYS_PER_WEEK },
  { id: "month", label: "Per month", days: DAYS_PER_MONTH },
  { id: "quarter", label: "Per quarter", days: DAYS_PER_QUARTER },
  { id: "year", label: "Per year", days: DAYS_PER_YEAR },
];

/** Common SLA tiers ("the nines") offered as one-click presets. */
export const UPTIME_PRESETS = [
  { label: "99% (two nines)", value: "99" },
  { label: "99.5%", value: "99.5" },
  { label: "99.9% (three nines)", value: "99.9" },
  { label: "99.95%", value: "99.95" },
  { label: "99.99% (four nines)", value: "99.99" },
  { label: "99.999% (five nines)", value: "99.999" },
];

/**
 * Break a duration in seconds into human-readable parts.
 * Returns e.g. { text: "8h 45m 57s", days: 0, hours: 8, minutes: 45, seconds: 56.9 }.
 */
export function formatDuration(totalSeconds) {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return { text: "—" };
  if (totalSeconds === 0) return { text: "0s", days: 0, hours: 0, minutes: 0, seconds: 0 };
  const days = Math.floor(totalSeconds / SECONDS_PER_DAY);
  let rest = totalSeconds - days * SECONDS_PER_DAY;
  const hours = Math.floor(rest / 3600);
  rest -= hours * 3600;
  const minutes = Math.floor(rest / 60);
  const seconds = rest - minutes * 60;
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  // Show sub-minute precision only when the budget is small enough to need it.
  if (seconds > 0 || parts.length === 0) {
    const rounded = totalSeconds < 600 ? Math.round(seconds * 10) / 10 : Math.round(seconds);
    if (rounded > 0 || parts.length === 0) parts.push(`${rounded}s`);
  }
  return { text: parts.join(" "), days, hours, minutes, seconds };
}

/**
 * Convert an uptime percentage into the allowed downtime for each period.
 *
 * @param {object} input
 * @param {number|string} input.uptimePercent  Availability target, 0–100.
 * @returns {{ uptimePercent:number, downtimeFraction:number,
 *             periods: Array<{id,label,days,downtimeSeconds,formatted}> } | {error:string}}
 */
export function computeDowntimeBudget({ uptimePercent }) {
  const uptime = Number(uptimePercent);
  if (uptimePercent === "" || uptimePercent === null || uptimePercent === undefined || !Number.isFinite(uptime)) {
    return { error: "Enter an uptime percentage, for example 99.9." };
  }
  if (uptime < 0) return { error: "Uptime cannot be negative." };
  if (uptime > 100) return { error: "Uptime cannot exceed 100%." };

  const downtimeFraction = (100 - uptime) / 100;
  const periods = PERIODS.map((period) => {
    const downtimeSeconds = downtimeFraction * period.days * SECONDS_PER_DAY;
    return {
      ...period,
      downtimeSeconds,
      formatted: formatDuration(downtimeSeconds).text,
    };
  });

  return { uptimePercent: uptime, downtimeFraction, periods };
}

/**
 * Inverse calculation: given actual downtime over a period, what uptime
 * percentage was achieved?  uptime% = 100 x (1 - downtime / period).
 *
 * @param {object} input
 * @param {number|string} input.downtimeMinutes  Total downtime in minutes.
 * @param {string} input.periodId                One of PERIODS ids.
 * @returns {{ uptimePercent:number, downtimeSeconds:number, periodLabel:string } | {error:string}}
 */
export function computeUptimeFromDowntime({ downtimeMinutes, periodId }) {
  const minutes = Number(downtimeMinutes);
  if (downtimeMinutes === "" || downtimeMinutes === null || downtimeMinutes === undefined || !Number.isFinite(minutes)) {
    return { error: "Enter the downtime in minutes." };
  }
  if (minutes < 0) return { error: "Downtime cannot be negative." };
  const period = PERIODS.find((p) => p.id === periodId);
  if (!period) return { error: "Choose a valid period." };
  const periodSeconds = period.days * SECONDS_PER_DAY;
  const downtimeSeconds = minutes * 60;
  if (downtimeSeconds > periodSeconds) {
    return { error: `Downtime is longer than the whole ${period.label.replace("Per ", "")} — check the figure.` };
  }
  const uptimePercent = 100 * (1 - downtimeSeconds / periodSeconds);
  return { uptimePercent, downtimeSeconds, periodLabel: period.label };
}
