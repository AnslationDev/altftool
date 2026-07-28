/**
 * Run streak maths.
 *
 * A streak is counted in CALENDAR DAYS: consecutive days on which at least one
 * qualifying run was recorded. The United States Running Streak Association
 * defines an official running streak as running at least one mile (1.609344 km)
 * within each calendar day, so that is the default qualifying distance here.
 * A day with a shorter run - or no run - ends the streak.
 */

/** Exact mile: the USRSA minimum qualifying distance for a streak day. */
export const MIN_STREAK_KM = 1.609344;
export const MS_PER_DAY = 86400000;
/** Window used for the consistency percentage. */
export const CONSISTENCY_WINDOW_DAYS = 30;

/**
 * Streak milestones runners commonly aim at.
 * The USRSA only lists a streak once it reaches one year (365 days); the shorter
 * numbers below are ordinary training landmarks, not official categories.
 */
export const STREAK_MILESTONES = [7, 30, 50, 100, 200, 365, 500, 1000];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Parse YYYY-MM-DD as a UTC timestamp; null when the string is not a real date. */
export function parseIsoDate(iso) {
  if (typeof iso !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!match) return null;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const ts = Date.UTC(year, month - 1, day);
  const back = new Date(ts);
  if (back.getUTCFullYear() !== year || back.getUTCMonth() !== month - 1 || back.getUTCDate() !== day) {
    return null;
  }
  return ts;
}

/** YYYY-MM-DD string for a UTC timestamp. */
export function isoFromTs(ts) {
  return new Date(ts).toISOString().slice(0, 10);
}

/** Shift an ISO date by whole days. */
export function shiftIso(iso, days) {
  const ts = parseIsoDate(iso);
  if (ts === null || !isNum(days)) return null;
  return isoFromTs(ts + Math.round(days) * MS_PER_DAY);
}

/** Whole days between two ISO dates (to - from). */
export function daysBetween(fromIso, toIso) {
  const a = parseIsoDate(fromIso);
  const b = parseIsoDate(toIso);
  if (a === null || b === null) return null;
  return Math.round((b - a) / MS_PER_DAY);
}

/**
 * Collapse a list of {dateIso, km} entries into one total per calendar day.
 * Returns { byDay: Map<iso, km>, error? }.
 */
export function totalsByDay(entries) {
  const byDay = new Map();
  const list = Array.isArray(entries) ? entries : [];
  for (const entry of list) {
    const ts = parseIsoDate(entry?.dateIso);
    if (ts === null) return { error: "Every logged run needs a valid date." };
    const km = Number(entry?.km);
    if (!isNum(km)) return { error: "Every logged run needs a distance in kilometres." };
    if (km < 0) return { error: "Distance cannot be negative." };
    const key = isoFromTs(ts);
    byDay.set(key, (byDay.get(key) ?? 0) + km);
  }
  return { byDay };
}

/** Next milestone above the current streak, or null once past the last one. */
export function nextMilestone(currentStreak) {
  if (!isNum(currentStreak)) return null;
  const target = STREAK_MILESTONES.find((value) => value > currentStreak);
  return target ?? null;
}

/**
 * Full streak report.
 *
 * currentStreak - counted back from today if today qualifies, otherwise from
 *   yesterday (the day is not over, so a streak is only broken once a whole
 *   calendar day has passed with no qualifying run).
 * longestStreak - the longest run of consecutive qualifying days ever logged.
 * consistency  - qualifying days inside the last 30 calendar days / 30.
 *
 * @param {{entries:Array<{dateIso:string,km:number}>, todayIso:string, minKm?:number}} input
 */
export function computeStreak({ entries, todayIso, minKm = MIN_STREAK_KM } = {}) {
  const todayTs = parseIsoDate(todayIso);
  if (todayTs === null) return { error: "Today's date is not a valid YYYY-MM-DD date." };
  if (!isNum(minKm) || minKm < 0) {
    return { error: "The qualifying distance must be zero or more kilometres." };
  }

  const totals = totalsByDay(entries);
  if (totals.error) return { error: totals.error };
  const { byDay } = totals;

  const qualifying = new Set();
  let totalKm = 0;
  let loggedDays = 0;
  byDay.forEach((km, iso) => {
    totalKm += km;
    if (km > 0) loggedDays += 1;
    if (km >= minKm) qualifying.add(iso);
  });

  const sorted = Array.from(qualifying).sort();
  const qualifyingDays = sorted.length;

  if (qualifyingDays === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      streakAlive: false,
      atRisk: false,
      ranToday: false,
      qualifyingDays: 0,
      loggedDays,
      totalKm,
      avgKmPerQualifyingDay: 0,
      firstDateIso: null,
      lastDateIso: null,
      longestGapDays: 0,
      last30Days: 0,
      consistencyPct: 0,
      nextMilestone: STREAK_MILESTONES[0],
      daysToMilestone: STREAK_MILESTONES[0],
      streakStartIso: null,
      minKm,
    };
  }

  // Longest run of consecutive qualifying days, and the longest gap between them.
  let longestStreak = 1;
  let running = 1;
  let longestGapDays = 0;
  for (let i = 1; i < sorted.length; i += 1) {
    const gap = daysBetween(sorted[i - 1], sorted[i]);
    if (gap === 1) {
      running += 1;
      if (running > longestStreak) longestStreak = running;
    } else {
      running = 1;
      if (gap - 1 > longestGapDays) longestGapDays = gap - 1;
    }
  }

  const todayKey = isoFromTs(todayTs);
  const yesterdayKey = isoFromTs(todayTs - MS_PER_DAY);
  const ranToday = qualifying.has(todayKey);

  let anchor = null;
  if (ranToday) anchor = todayKey;
  else if (qualifying.has(yesterdayKey)) anchor = yesterdayKey;

  let currentStreak = 0;
  let streakStartIso = null;
  if (anchor) {
    let cursor = anchor;
    while (qualifying.has(cursor)) {
      currentStreak += 1;
      streakStartIso = cursor;
      cursor = shiftIso(cursor, -1);
    }
  }

  // Consistency over the trailing 30 calendar days, today included.
  const windowStartTs = todayTs - (CONSISTENCY_WINDOW_DAYS - 1) * MS_PER_DAY;
  let last30Days = 0;
  qualifying.forEach((iso) => {
    const ts = parseIsoDate(iso);
    if (ts !== null && ts >= windowStartTs && ts <= todayTs) last30Days += 1;
  });

  const milestone = nextMilestone(currentStreak);

  return {
    currentStreak,
    longestStreak,
    streakAlive: currentStreak > 0,
    atRisk: currentStreak > 0 && !ranToday,
    ranToday,
    qualifyingDays,
    loggedDays,
    totalKm,
    avgKmPerQualifyingDay: totalKm / qualifyingDays,
    firstDateIso: sorted[0],
    lastDateIso: sorted[sorted.length - 1],
    longestGapDays,
    last30Days,
    consistencyPct: (last30Days / CONSISTENCY_WINDOW_DAYS) * 100,
    nextMilestone: milestone,
    daysToMilestone: milestone === null ? null : milestone - currentStreak,
    streakStartIso,
    minKm,
  };
}

/**
 * Trailing calendar strip for a heat map: one cell per day, oldest first.
 * @param {{entries:Array, todayIso:string, days?:number, minKm?:number}} input
 */
export function buildCalendar({ entries, todayIso, days = CONSISTENCY_WINDOW_DAYS, minKm = MIN_STREAK_KM } = {}) {
  const todayTs = parseIsoDate(todayIso);
  if (todayTs === null || !isNum(days) || days <= 0) return [];
  const totals = totalsByDay(entries);
  if (totals.error) return [];

  const cells = [];
  const span = Math.min(Math.round(days), 400);
  for (let offset = span - 1; offset >= 0; offset -= 1) {
    const iso = isoFromTs(todayTs - offset * MS_PER_DAY);
    const km = totals.byDay.get(iso) ?? 0;
    cells.push({ dateIso: iso, km, qualifies: km >= minKm, logged: km > 0 });
  }
  return cells;
}
