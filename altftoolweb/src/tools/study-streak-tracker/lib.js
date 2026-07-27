/**
 * Study streak tracking with a Duolingo-style "streak freeze" recovery rule.
 *
 * A day counts as MET when hours studied >= the daily goal. A missed day does
 * not break an active streak if a freeze is available: at most
 * `freezesPer7Days` freezes may be consumed in any rolling 7-day window
 * (the current day and the 6 before it). A frozen day preserves the streak but
 * does not increment it — the same semantics as Duolingo's streak freeze,
 * which protects a streak without adding to it. A miss with no freeze
 * available resets the streak to zero. Freezes are never spent to protect a
 * zero streak.
 */

/** Rolling window, in days, over which freezes are rationed. */
export const FREEZE_WINDOW_DAYS = 7;

/** Sensible bounds for the recovery rule. */
export const MIN_FREEZES = 0;
export const MAX_FREEZES = 3;

/** Upper bound on hours in a day — used to reject impossible logs. */
export const MAX_HOURS_PER_DAY = 24;

/** Practical cap on how many days can be analysed at once. */
export const MAX_DAYS = 366;

const round1 = (v) => Math.round(v * 10) / 10;

/**
 * Parse a comma/space separated list of daily hours into numbers.
 * Returns { hours } or { error }.
 */
export function parseDailyHours(text) {
  if (typeof text !== "string" || text.trim() === "") {
    return { error: "Enter at least one day of study hours." };
  }
  const parts = text
    .split(/[\s,;]+/)
    .map((p) => p.trim())
    .filter((p) => p !== "");
  if (parts.length === 0) return { error: "Enter at least one day of study hours." };
  if (parts.length > MAX_DAYS) {
    return { error: `This tool analyses up to ${MAX_DAYS} days at a time.` };
  }
  const hours = [];
  for (const part of parts) {
    const value = Number(part);
    if (!Number.isFinite(value)) {
      return { error: `"${part}" is not a number of hours.` };
    }
    if (value < 0) return { error: "Hours cannot be negative." };
    if (value > MAX_HOURS_PER_DAY) {
      return { error: `A day cannot have more than ${MAX_HOURS_PER_DAY} study hours.` };
    }
    hours.push(value);
  }
  return { hours };
}

/**
 * Walk the daily log and compute streaks.
 *
 * @param {object} input
 * @param {number[]} input.dailyHours       Hours per day, oldest first.
 * @param {number|string} input.goalHours   Daily goal in hours (> 0).
 * @param {number|string} input.freezesPer7Days  Freezes allowed per rolling 7 days.
 * @returns {object} streak stats, or { error }.
 */
export function computeStreaks({ dailyHours, goalHours, freezesPer7Days }) {
  const goal = Number(goalHours);
  const freezeAllowance = Number(freezesPer7Days);

  if (!Array.isArray(dailyHours) || dailyHours.length === 0) {
    return { error: "Enter at least one day of study hours." };
  }
  if (!Number.isFinite(goal) || goal <= 0) {
    return { error: "Daily goal must be more than zero hours." };
  }
  if (goal > MAX_HOURS_PER_DAY) {
    return { error: `Daily goal cannot exceed ${MAX_HOURS_PER_DAY} hours.` };
  }
  if (
    !Number.isFinite(freezeAllowance) ||
    freezeAllowance < MIN_FREEZES ||
    freezeAllowance > MAX_FREEZES ||
    !Number.isInteger(freezeAllowance)
  ) {
    return {
      error: `Freezes per ${FREEZE_WINDOW_DAYS} days must be a whole number from ${MIN_FREEZES} to ${MAX_FREEZES}.`,
    };
  }
  for (const h of dailyHours) {
    if (!Number.isFinite(h) || h < 0 || h > MAX_HOURS_PER_DAY) {
      return { error: `Each day must be between 0 and ${MAX_HOURS_PER_DAY} hours.` };
    }
  }

  let streak = 0;
  let longest = 0;
  let freezesUsed = 0;
  const freezeIndices = [];
  const dayStatus = [];

  for (let i = 0; i < dailyHours.length; i += 1) {
    const met = dailyHours[i] >= goal;
    if (met) {
      streak += 1;
      dayStatus.push("met");
    } else {
      const usedInWindow = freezeIndices.filter(
        (idx) => idx >= i - (FREEZE_WINDOW_DAYS - 1),
      ).length;
      if (streak > 0 && usedInWindow < freezeAllowance) {
        // Freeze: streak preserved, not incremented.
        freezeIndices.push(i);
        freezesUsed += 1;
        dayStatus.push("frozen");
      } else {
        streak = 0;
        dayStatus.push("missed");
      }
    }
    if (streak > longest) longest = streak;
  }

  const daysMet = dayStatus.filter((s) => s === "met").length;
  const totalHours = dailyHours.reduce((s, h) => s + h, 0);

  return {
    currentStreak: streak,
    longestStreak: longest,
    dayStatus,
    daysMet,
    daysLogged: dailyHours.length,
    freezesUsed,
    totalHours: round1(totalHours),
    averageHours: round1(totalHours / dailyHours.length),
    // Share of logged days on which the goal was actually met.
    adherencePercent: round1((daysMet / dailyHours.length) * 100),
  };
}
