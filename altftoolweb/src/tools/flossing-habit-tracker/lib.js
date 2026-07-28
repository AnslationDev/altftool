/**
 * Flossing / interdental cleaning habit logic.
 *
 * Pure module — no React, no DOM, no clock reads. Every date is an ISO
 * "YYYY-MM-DD" string passed in, including "today", so results are reproducible.
 * Informational only: general oral-hygiene guidance, not personal dental advice.
 */

const MS_PER_DAY = 86400000;

/* Clean between the teeth once a day. A toothbrush reaches three of the five
   surfaces of each tooth; the two surfaces that touch the neighbouring teeth
   need floss, tape or an interdental brush. */
export const TARGET_SESSIONS_PER_DAY = 1;
export const BRUSH_REACHES_SURFACES = 3;
export const TOTAL_TOOTH_SURFACES = 5;

/* Gums that bleed when you start cleaning between the teeth usually settle
   within one to two weeks of doing it daily. Bleeding still present after two
   weeks of consistent daily cleaning is the point at which a dental check is
   the standard advice. */
export const BLEEDING_REVIEW_DAYS = 14;

/* Median time for a new daily behaviour to become automatic in the Lally et al.
   (2010) habit-formation study was 66 days, with a wide individual range. */
export const MEDIAN_AUTOMATICITY_DAYS = 66;

export const STREAK_MILESTONES = [3, 7, 14, 21, 30, 66, 90, 180, 365];

export const MAX_ENTRIES = 730;

/** How gum bleeding is scored in the log. */
export const BLEEDING_SCALE = [
  { value: 0, label: "None", detail: "No pink on the floss or in the sink." },
  { value: 1, label: "Slight", detail: "A trace of pink on the floss at one or two sites." },
  { value: 2, label: "Moderate", detail: "Clear bleeding at several sites, stops within a minute." },
  { value: 3, label: "Heavy", detail: "Bleeding at most sites, or it keeps going after you stop." },
];

/** Interdental tools, with the gap size each one suits. */
export const INTERDENTAL_TOOLS = [
  { id: "floss", label: "Dental floss or tape", suits: "Tight contacts where nothing else fits." },
  { id: "interdental-brush", label: "Interdental brush", suits: "Wider gaps; usually removes more plaque than floss where it fits." },
  { id: "floss-pick", label: "Floss pick or harp", suits: "Back teeth and limited dexterity — easier to reach, less wrap control." },
  { id: "water-flosser", label: "Water flosser", suits: "Braces, bridges and implants; use alongside, not instead of, a brush or floss." },
  { id: "soft-pick", label: "Rubber soft pick", suits: "Sensitive gums and travel; gentler but less thorough on tight contacts." },
];

const clean = (value) => (typeof value === "string" ? value.trim() : "");

export function parseIsoDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(clean(value));
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const probe = new Date(Date.UTC(year, month - 1, day));
  if (probe.getUTCFullYear() !== year || probe.getUTCMonth() !== month - 1 || probe.getUTCDate() !== day) {
    return null;
  }
  return { year, month, day, ms: probe.getTime() };
}

export function toIso(ms) {
  const date = new Date(ms);
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

/** Shift an ISO date by a whole number of days. */
export function shiftIso(isoDate, days) {
  const date = parseIsoDate(isoDate);
  if (!date || !Number.isInteger(days)) return null;
  return toIso(date.ms + days * MS_PER_DAY);
}

/** Whole days from the first date to the second. */
export function daysBetween(fromIso, toIsoDate) {
  const from = parseIsoDate(fromIso);
  const to = parseIsoDate(toIsoDate);
  if (!from || !to) return null;
  return Math.round((to.ms - from.ms) / MS_PER_DAY);
}

const mean = (values) => (values.length === 0 ? null : values.reduce((sum, v) => sum + v, 0) / values.length);

/**
 * Analyse a flossing log.
 *
 * @param {object} input
 * @param {Array<{date: string, done: boolean, bleeding: number, tool?: string, note?: string}>} input.entries
 * @param {string} input.today ISO date treated as "now"
 * @returns {{error: string}|object}
 */
export function analyseFlossingLog(input = {}) {
  const today = clean(input.today);
  const todayDate = parseIsoDate(today);
  if (!todayDate) {
    return { error: "Today's date must be a real date in YYYY-MM-DD form." };
  }

  const rawEntries = Array.isArray(input.entries) ? input.entries : [];
  if (rawEntries.length > MAX_ENTRIES) {
    return { error: `Keep the log to ${MAX_ENTRIES} days or fewer — that is two years of daily entries.` };
  }

  const byDate = new Map();
  for (const raw of rawEntries) {
    const dateIso = clean(raw && raw.date);
    const parsed = parseIsoDate(dateIso);
    if (!parsed) {
      return { error: `“${dateIso || "(blank)"}” is not a real date. Use YYYY-MM-DD.` };
    }
    if (parsed.ms > todayDate.ms) {
      return { error: `${dateIso} is in the future. You cannot log a day that has not happened yet.` };
    }
    if (byDate.has(dateIso)) {
      return { error: `${dateIso} appears twice in the log. Keep one entry per day.` };
    }
    const bleedingRaw = raw && raw.bleeding;
    const bleeding = bleedingRaw === "" || bleedingRaw === null || bleedingRaw === undefined ? 0 : Number(bleedingRaw);
    if (!Number.isFinite(bleeding) || !BLEEDING_SCALE.some((row) => row.value === bleeding)) {
      return { error: `Bleeding on ${dateIso} must be 0, 1, 2 or 3.` };
    }
    byDate.set(dateIso, {
      date: dateIso,
      ms: parsed.ms,
      done: Boolean(raw && raw.done),
      bleeding,
      tool: clean(raw && raw.tool),
      note: clean(raw && raw.note),
    });
  }

  const entries = [...byDate.values()].sort((a, b) => a.ms - b.ms);
  const doneEntries = entries.filter((entry) => entry.done);

  // Current streak: count back from today; if today is not logged yet, start from
  // yesterday so a streak is not declared broken before the day is over.
  const isDone = (isoDate) => {
    const entry = byDate.get(isoDate);
    return Boolean(entry && entry.done);
  };

  const todayLogged = byDate.has(today);
  const todayDone = isDone(today);
  let cursorMs = todayDone ? todayDate.ms : todayDate.ms - MS_PER_DAY;
  let currentStreak = 0;
  while (isDone(toIso(cursorMs))) {
    currentStreak += 1;
    cursorMs -= MS_PER_DAY;
  }
  const streakAtRisk = currentStreak > 0 && !todayDone;

  // Longest streak anywhere in the log.
  let longestStreak = 0;
  let running = 0;
  let previousMs = null;
  for (const entry of doneEntries) {
    if (previousMs !== null && entry.ms - previousMs === MS_PER_DAY) {
      running += 1;
    } else {
      running = 1;
    }
    if (running > longestStreak) longestStreak = running;
    previousMs = entry.ms;
  }

  const adherenceOver = (windowDays) => {
    const startMs = todayDate.ms - (windowDays - 1) * MS_PER_DAY;
    let hits = 0;
    for (let ms = startMs; ms <= todayDate.ms; ms += MS_PER_DAY) {
      if (isDone(toIso(ms))) hits += 1;
    }
    return { days: windowDays, hits, percent: Math.round((hits / windowDays) * 100) };
  };

  const last7 = adherenceOver(7);
  const last30 = adherenceOver(30);

  // Bleeding trend: mean score over the most recent 7 logged sessions versus the
  // 7 logged sessions before those.
  const bleedingSeries = doneEntries.map((entry) => entry.bleeding);
  const recent = bleedingSeries.slice(-7);
  const previous = bleedingSeries.slice(-14, -7);
  const recentMean = mean(recent);
  const previousMean = mean(previous);
  const bleedingChange = recentMean !== null && previousMean !== null ? recentMean - previousMean : null;

  // Persistence test: you have been cleaning most days for at least two weeks
  // (so the gums have had time to settle) AND the majority of the last seven
  // sessions still bled.
  const fourteenDaysAgoMs = todayDate.ms - (BLEEDING_REVIEW_DAYS - 1) * MS_PER_DAY;
  const recentWindow = doneEntries.filter((entry) => entry.ms >= fourteenDaysAgoMs);
  const recentBleedingDays = recent.filter((score) => score >= 1).length;
  const persistentBleeding =
    recentWindow.length >= BLEEDING_REVIEW_DAYS / 2 && recent.length >= 7 && recentBleedingDays >= 4;

  const nextMilestone = STREAK_MILESTONES.find((milestone) => milestone > currentStreak) || null;
  const daysToMilestone = nextMilestone === null ? null : nextMilestone - currentStreak;
  const automaticityPercent = Math.min(100, Math.round((currentStreak / MEDIAN_AUTOMATICITY_DAYS) * 100));

  const firstEntry = entries.length ? entries[0].date : null;
  const daysTracked = firstEntry === null ? 0 : (daysBetween(firstEntry, today) || 0) + 1;
  const sessionsLogged = doneEntries.length;
  const missedDays = Math.max(0, daysTracked - sessionsLogged);

  const warnings = [];
  if (persistentBleeding) {
    warnings.push(
      `Gums have bled on ${recentBleedingDays} of the last ${recent.length} sessions, after two weeks of cleaning. Bleeding that has not settled by then should be looked at by a dentist or hygienist.`,
    );
  }
  if (streakAtRisk) {
    warnings.push(`You have a ${currentStreak}-day streak but today is not logged yet.`);
  }
  if (last30.percent < 50 && daysTracked >= 14) {
    warnings.push(`You cleaned between the teeth on ${last30.hits} of the last 30 days. Anchoring it to an existing habit — straight after brushing at night — is the change that usually sticks.`);
  }
  if (recentMean !== null && recentMean >= 2.5) {
    warnings.push("Heavy bleeding at most sites is not a normal starting reaction. Get it checked rather than pushing through.");
  }

  return {
    today,
    entries,
    entryCount: entries.length,
    sessionsLogged,
    daysTracked,
    missedDays,
    todayLogged,
    todayDone,
    currentStreak,
    streakAtRisk,
    longestStreak,
    last7,
    last30,
    recentBleedingMean: recentMean,
    previousBleedingMean: previousMean,
    bleedingChange,
    recentBleedingDays,
    recentWindowSize: recentWindow.length,
    persistentBleeding,
    nextMilestone,
    daysToMilestone,
    automaticityPercent,
    warnings,
  };
}

/** Build the last N calendar days ending today, marked done / missed / unlogged. */
export function calendarStrip(analysis, days = 30) {
  if (!analysis || analysis.error) return [];
  const todayDate = parseIsoDate(analysis.today);
  if (!todayDate || !Number.isInteger(days) || days <= 0) return [];
  const byDate = new Map(analysis.entries.map((entry) => [entry.date, entry]));
  const strip = [];
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const iso = toIso(todayDate.ms - offset * MS_PER_DAY);
    const entry = byDate.get(iso);
    strip.push({
      date: iso,
      status: !entry ? "unlogged" : entry.done ? "done" : "missed",
      bleeding: entry ? entry.bleeding : null,
    });
  }
  return strip;
}
