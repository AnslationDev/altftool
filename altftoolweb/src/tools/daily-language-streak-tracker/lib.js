/**
 * Daily language study streak tracker.
 *
 * Definitions used throughout, stated once so the numbers are reproducible:
 *   - A study day "counts" when the minutes logged for that calendar date are
 *     greater than or equal to the daily goal.
 *   - A streak is a run of counting days with no gap. Rest days (freezes) let a
 *     run survive a fixed number of missed days before it breaks.
 *   - The streak length is the number of days that counted; frozen days are not
 *     added to the total.
 *   - Today is never treated as a miss. If today has not met the goal yet the
 *     streak stands but is flagged at risk.
 *
 * All dates are ISO "YYYY-MM-DD" and are advanced in UTC, so a daylight-saving
 * change can never shift a day. Nothing here reads the clock; "today" is an
 * argument.
 */

export const MILESTONES = [3, 7, 14, 21, 30, 50, 75, 100, 150, 200, 365];

export const MIN_GOAL_MINUTES = 1;
export const MAX_GOAL_MINUTES = 600;
export const MAX_SESSION_MINUTES = 1440;
export const MAX_LOGS = 2000;
export const MAX_FREEZES = 3;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 86400000;
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** Parse "YYYY-MM-DD" to a UTC timestamp, or NaN if it is not a real date. */
export function parseIsoDate(value) {
  if (typeof value !== "string" || !ISO_DATE.test(value)) return NaN;
  const [year, month, day] = value.split("-").map(Number);
  const stamp = Date.UTC(year, month - 1, day);
  const probe = new Date(stamp);
  if (probe.getUTCFullYear() !== year || probe.getUTCMonth() !== month - 1 || probe.getUTCDate() !== day) {
    return NaN;
  }
  return stamp;
}

export function isoFromStamp(stamp) {
  return new Date(stamp).toISOString().slice(0, 10);
}

export function weekdayOf(iso) {
  const stamp = parseIsoDate(iso);
  return Number.isNaN(stamp) ? "" : WEEKDAYS[new Date(stamp).getUTCDay()];
}

/* ------------------------------------------------------------------ */
/* Log entry handling                                                  */
/* ------------------------------------------------------------------ */

const cleanName = (value) => String(value == null ? "" : value).replace(/\s+/g, " ").trim();

/**
 * Validate one study log.
 * @returns {{log:{date:string,language:string,minutes:number}}|{error:string}}
 */
export function validateLog(raw, today) {
  if (!raw || typeof raw !== "object") return { error: "Log entry is missing." };

  const stamp = parseIsoDate(raw.date);
  if (Number.isNaN(stamp)) return { error: "Pick a valid study date." };

  const todayStamp = parseIsoDate(today);
  if (!Number.isNaN(todayStamp) && stamp > todayStamp) {
    return { error: "You cannot log study time for a future date." };
  }

  const language = cleanName(raw.language);
  if (!language) return { error: "Name the language you studied." };
  if (language.length > 40) return { error: "Keep the language name under 40 characters." };

  const minutes = Math.round(Number(raw.minutes));
  if (!Number.isFinite(minutes)) return { error: "Enter the minutes studied as a number." };
  if (minutes <= 0) return { error: "Minutes studied must be greater than zero." };
  if (minutes > MAX_SESSION_MINUTES) {
    return { error: `A single day cannot hold more than ${MAX_SESSION_MINUTES} minutes.` };
  }

  return { log: { date: raw.date, language, minutes } };
}

/**
 * Add a session. Two sessions on the same date in the same language are summed
 * rather than stored twice.
 * @returns {{logs:object[]}|{error:string}}
 */
export function addLog(logs, raw, today) {
  const list = Array.isArray(logs) ? logs : [];
  if (list.length >= MAX_LOGS) return { error: `Storing more than ${MAX_LOGS} sessions is not supported.` };

  const checked = validateLog(raw, today);
  if (checked.error) return checked;

  const key = (item) => `${item.date}|${item.language.toLowerCase()}`;
  const target = key(checked.log);
  let merged = false;

  const next = list.map((item) => {
    if (key(item) !== target) return item;
    merged = true;
    const total = Math.min(MAX_SESSION_MINUTES, item.minutes + checked.log.minutes);
    return { ...item, minutes: total };
  });

  return { logs: merged ? next : [...next, checked.log] };
}

/** Remove one date + language pair. */
export function removeLog(logs, date, language) {
  const target = `${date}|${cleanName(language).toLowerCase()}`;
  return (Array.isArray(logs) ? logs : []).filter(
    (item) => `${item.date}|${item.language.toLowerCase()}` !== target,
  );
}

/** Distinct language names present in the logs, alphabetical. */
export function languagesIn(logs) {
  const set = new Set((Array.isArray(logs) ? logs : []).map((item) => item.language));
  return [...set].sort((a, b) => a.localeCompare(b));
}

/* ------------------------------------------------------------------ */
/* Streak maths                                                        */
/* ------------------------------------------------------------------ */

function dailyTotals(logs, language, todayStamp) {
  const totals = new Map();
  for (const item of logs) {
    if (language && language !== "All" && item.language.toLowerCase() !== language.toLowerCase()) continue;
    if (Number.isFinite(todayStamp) && parseIsoDate(item.date) > todayStamp) continue;
    totals.set(item.date, (totals.get(item.date) || 0) + item.minutes);
  }
  return totals;
}

/**
 * Summarise the log book.
 *
 * @param {object} input
 * @param {object[]} input.logs
 * @param {number} input.goalMinutes  minutes needed for a day to count
 * @param {string} input.today        ISO date treated as "now"
 * @param {string} [input.language]   "All" or a language name
 * @param {number} [input.freezes]    missed days a streak may survive
 * @returns {object|{error:string}}
 */
export function summarise({ logs, goalMinutes, today, language = "All", freezes = 0 } = {}) {
  const list = Array.isArray(logs) ? logs : [];

  const todayStamp = parseIsoDate(today);
  if (Number.isNaN(todayStamp)) return { error: "Pick a valid date for today." };

  const goal = Math.round(Number(goalMinutes));
  if (!Number.isFinite(goal) || goal < MIN_GOAL_MINUTES || goal > MAX_GOAL_MINUTES) {
    return { error: `Set a daily goal between ${MIN_GOAL_MINUTES} and ${MAX_GOAL_MINUTES} minutes.` };
  }

  const allowance = Math.trunc(Number(freezes));
  if (!Number.isFinite(allowance) || allowance < 0 || allowance > MAX_FREEZES) {
    return { error: `Rest days allowed must be between 0 and ${MAX_FREEZES}.` };
  }

  const totals = dailyTotals(list, language, todayStamp);
  const dates = [...totals.keys()].sort();

  if (dates.length === 0) {
    return {
      goal,
      language,
      currentStreak: 0,
      longestStreak: 0,
      atRisk: false,
      todayMinutes: 0,
      todayMet: false,
      minutesToGoalToday: goal,
      totalMinutes: 0,
      daysStudied: 0,
      daysMetGoal: 0,
      adherence: 0,
      averageWhenStudied: 0,
      last7Minutes: 0,
      last30Minutes: 0,
      nextMilestone: MILESTONES[0],
      daysToMilestone: MILESTONES[0],
      recent: [],
      byLanguage: [],
      empty: true,
    };
  }

  const firstStamp = parseIsoDate(dates[0]);
  const met = (iso) => (totals.get(iso) || 0) >= goal;

  // Walk from the first logged day up to yesterday, then handle today.
  let run = 0;
  let longest = 0;
  let freezesLeft = allowance;

  for (let stamp = firstStamp; stamp < todayStamp; stamp += DAY_MS) {
    if (met(isoFromStamp(stamp))) {
      run += 1;
      if (run > longest) longest = run;
    } else if (run > 0 && freezesLeft > 0) {
      freezesLeft -= 1;
    } else {
      run = 0;
      freezesLeft = allowance;
    }
  }

  const todayIso = isoFromStamp(todayStamp);
  const todayMinutes = totals.get(todayIso) || 0;
  const todayMet = todayMinutes >= goal;
  if (todayMet) {
    run += 1;
    if (run > longest) longest = run;
  }

  const totalMinutes = [...totals.values()].reduce((sum, value) => sum + value, 0);
  const daysStudied = dates.length;
  const daysMetGoal = dates.filter(met).length;

  const windowMinutes = (days) => {
    let sum = 0;
    for (let index = 0; index < days; index += 1) {
      sum += totals.get(isoFromStamp(todayStamp - index * DAY_MS)) || 0;
    }
    return sum;
  };

  const spanDays = Math.max(1, Math.round((todayStamp - firstStamp) / DAY_MS) + 1);
  const nextMilestone = MILESTONES.find((value) => value > run) || null;

  const recent = [];
  for (let index = 13; index >= 0; index -= 1) {
    const iso = isoFromStamp(todayStamp - index * DAY_MS);
    const minutes = totals.get(iso) || 0;
    recent.push({ date: iso, weekday: weekdayOf(iso), minutes, met: minutes >= goal });
  }

  const perLanguage = new Map();
  for (const item of list) {
    if (language && language !== "All" && item.language.toLowerCase() !== language.toLowerCase()) continue;
    const entry = perLanguage.get(item.language) || { language: item.language, minutes: 0, days: new Set() };
    entry.minutes += item.minutes;
    entry.days.add(item.date);
    perLanguage.set(item.language, entry);
  }

  return {
    goal,
    language,
    currentStreak: run,
    longestStreak: longest,
    atRisk: !todayMet && run > 0,
    todayMinutes,
    todayMet,
    minutesToGoalToday: Math.max(0, goal - todayMinutes),
    totalMinutes,
    totalHours: Math.round((totalMinutes / 60) * 10) / 10,
    daysStudied,
    daysMetGoal,
    spanDays,
    adherence: Math.round((daysMetGoal / spanDays) * 1000) / 10,
    averageWhenStudied: Math.round(totalMinutes / daysStudied),
    last7Minutes: windowMinutes(7),
    last30Minutes: windowMinutes(30),
    freezesLeft,
    nextMilestone,
    daysToMilestone: nextMilestone === null ? 0 : nextMilestone - run,
    recent,
    byLanguage: [...perLanguage.values()]
      .map((entry) => ({ language: entry.language, minutes: entry.minutes, days: entry.days.size }))
      .sort((a, b) => b.minutes - a.minutes),
    empty: false,
  };
}
