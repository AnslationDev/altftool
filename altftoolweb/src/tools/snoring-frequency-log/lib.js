/**
 * Snoring frequency log — pure aggregation helpers.
 * No React, no DOM, no Date.now(): every date arrives as a "YYYY-MM-DD" string.
 */

/**
 * 0-3 loudness scale. This mirrors the way a sleep diary / snoring severity
 * scale grades intensity: silent, audible only nearby, audible through a closed
 * door, audible in an adjacent room. It is a subjective scale, not a decibel
 * measurement.
 */
export const SEVERITY_LEVELS = [
  { value: 0, short: "None", label: "No snoring reported" },
  { value: 1, short: "Soft", label: "Soft — only heard by someone in the same bed" },
  { value: 2, short: "Loud", label: "Loud — audible through a closed bedroom door" },
  { value: 3, short: "Very loud", label: "Very loud — heard from another room or wakes a partner" },
];

/** Positions tracked because supine (back) sleep worsens snoring for most people. */
export const SLEEP_POSITIONS = ["Back", "Side", "Stomach", "Mixed"];

/** Common, self-reportable snoring aggravators used in sleep-hygiene diaries. */
export const SNORING_TRIGGERS = [
  "Alcohol in the evening",
  "Late heavy meal",
  "Nasal congestion",
  "Seasonal allergy",
  "Under 6 hours in bed",
  "Sedative or antihistamine",
  "Dry or dusty room",
  "Slept without nasal strip / device",
];

/** Severity 2 and above is counted as a "significant" snoring night. */
export const SIGNIFICANT_SEVERITY = 2;

/**
 * Witnessed breathing pauses is one of the eight STOP-BANG obstructive sleep
 * apnoea screening items (Chung et al., Anesthesiology 2008). Even a single
 * logged pause is worth raising with a clinician, so the threshold is 1.
 */
export const RED_FLAG_PAUSE_NIGHTS = 1;

/** A trigger needs this many logged nights before its average means anything. */
export const MIN_NIGHTS_FOR_TRIGGER_SIGNAL = 3;

/** Severity difference (0-3 scale) treated as a meaningful trigger effect. */
export const TRIGGER_EFFECT_THRESHOLD = 0.5;

const MS_PER_DAY = 86400000;
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

const round = (value, places = 2) => {
  if (!Number.isFinite(value)) return 0;
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
};

const mean = (values) =>
  values.length === 0 ? null : round(values.reduce((sum, v) => sum + v, 0) / values.length);

/** Parse "YYYY-MM-DD" into a UTC timestamp, or null if it is not a real date. */
export function parseIsoDate(value) {
  const match = DATE_RE.exec(String(value || "").trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const ms = Date.UTC(year, month - 1, day);
  const check = new Date(ms);
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
    return null;
  }
  return ms;
}

const toIsoDate = (ms) => new Date(ms).toISOString().slice(0, 10);

/**
 * ISO-8601 week of a date (weeks start Monday; week 1 contains the first
 * Thursday of the year). Returns { year, week, key, weekStart }.
 */
export function isoWeekOf(dateString) {
  const ms = parseIsoDate(dateString);
  if (ms === null) return null;
  const dayNumber = new Date(ms).getUTCDay() || 7; // Monday = 1 ... Sunday = 7
  const thursdayMs = ms + (4 - dayNumber) * MS_PER_DAY;
  const isoYear = new Date(thursdayMs).getUTCFullYear();
  const jan1Ms = Date.UTC(isoYear, 0, 1);
  const week = Math.floor((thursdayMs - jan1Ms) / MS_PER_DAY / 7) + 1;
  const weekStart = toIsoDate(ms - (dayNumber - 1) * MS_PER_DAY);
  return {
    year: isoYear,
    week,
    key: `${isoYear}-W${String(week).padStart(2, "0")}`,
    weekStart,
  };
}

function statsFor(nights) {
  const severities = nights.map((n) => n.severity);
  const durations = nights.map((n) => n.hours).filter((h) => Number.isFinite(h) && h > 0);
  const snoringNights = nights.filter((n) => n.severity >= 1).length;
  const significantNights = nights.filter((n) => n.severity >= SIGNIFICANT_SEVERITY).length;
  const pauseNights = nights.filter((n) => n.pauses).length;
  const total = nights.length;
  return {
    nights: total,
    snoringNights,
    quietNights: total - snoringNights,
    significantNights,
    pauseNights,
    snoringRate: total > 0 ? round((snoringNights / total) * 100, 1) : 0,
    significantRate: total > 0 ? round((significantNights / total) * 100, 1) : 0,
    avgSeverity: mean(severities) ?? 0,
    peakSeverity: total > 0 ? Math.max(...severities) : 0,
    avgHours: durations.length > 0 ? mean(durations) : null,
  };
}

/**
 * Normalise and validate one raw night.
 * Returns { ok: true, night } or { ok: false, reason }.
 */
export function normaliseNight(raw, index = 0) {
  const label = `Night ${index + 1}`;
  if (!raw || typeof raw !== "object") return { ok: false, reason: `${label}: missing data.` };

  const ms = parseIsoDate(raw.date);
  if (ms === null) return { ok: false, reason: `${label}: enter a real date as YYYY-MM-DD.` };

  const severity = Number(raw.severity);
  if (!Number.isFinite(severity) || !Number.isInteger(severity) || severity < 0 || severity > 3) {
    return { ok: false, reason: `${label}: severity must be 0, 1, 2 or 3.` };
  }

  let hours = null;
  if (raw.hours !== "" && raw.hours !== null && raw.hours !== undefined) {
    const parsed = Number(raw.hours);
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 24) {
      return { ok: false, reason: `${label}: hours in bed must be between 0 and 24.` };
    }
    hours = parsed;
  }

  const position = SLEEP_POSITIONS.includes(raw.position) ? raw.position : "Mixed";
  const triggers = Array.isArray(raw.triggers)
    ? raw.triggers.filter((t) => SNORING_TRIGGERS.includes(t))
    : [];

  return {
    ok: true,
    night: {
      date: toIsoDate(ms),
      ms,
      severity,
      hours,
      position,
      triggers,
      pauses: Boolean(raw.pauses),
    },
  };
}

/**
 * Aggregate a snoring log.
 * @param {Array} rawNights list of { date, severity, hours, position, triggers[], pauses }
 * @returns {object} summary, or { error } when the log cannot be summarised.
 */
export function summariseSnoringLog(rawNights) {
  if (!Array.isArray(rawNights) || rawNights.length === 0) {
    return { error: "Add at least one night to the log." };
  }

  const nights = [];
  const seenDates = new Set();
  for (let i = 0; i < rawNights.length; i += 1) {
    const result = normaliseNight(rawNights[i], i);
    if (!result.ok) return { error: result.reason };
    if (seenDates.has(result.night.date)) {
      return { error: `Two entries share the date ${result.night.date}. Keep one night per date.` };
    }
    seenDates.add(result.night.date);
    nights.push(result.night);
  }

  nights.sort((a, b) => a.ms - b.ms);
  const overall = statsFor(nights);

  // Weekly buckets (ISO weeks, Monday start).
  const weekMap = new Map();
  for (const night of nights) {
    const iso = isoWeekOf(night.date);
    if (!weekMap.has(iso.key)) weekMap.set(iso.key, { ...iso, nights: [] });
    weekMap.get(iso.key).nights.push(night);
  }
  const weeks = [...weekMap.values()]
    .sort((a, b) => (a.weekStart < b.weekStart ? -1 : 1))
    .map((bucket) => ({
      key: bucket.key,
      week: bucket.week,
      year: bucket.year,
      weekStart: bucket.weekStart,
      ...statsFor(bucket.nights),
    }));

  // Position breakdown.
  const positions = SLEEP_POSITIONS.map((position) => {
    const subset = nights.filter((n) => n.position === position);
    return {
      position,
      nights: subset.length,
      avgSeverity: subset.length > 0 ? mean(subset.map((n) => n.severity)) : null,
      share: overall.nights > 0 ? round((subset.length / overall.nights) * 100, 1) : 0,
    };
  }).filter((row) => row.nights > 0);

  // Trigger impact: mean severity on nights with the trigger vs nights without.
  const triggers = SNORING_TRIGGERS.map((trigger) => {
    const withT = nights.filter((n) => n.triggers.includes(trigger));
    const withoutT = nights.filter((n) => !n.triggers.includes(trigger));
    const avgWith = withT.length > 0 ? mean(withT.map((n) => n.severity)) : null;
    const avgWithout = withoutT.length > 0 ? mean(withoutT.map((n) => n.severity)) : null;
    const comparable =
      withT.length >= MIN_NIGHTS_FOR_TRIGGER_SIGNAL && withoutT.length >= MIN_NIGHTS_FOR_TRIGGER_SIGNAL;
    return {
      trigger,
      nightsWith: withT.length,
      nightsWithout: withoutT.length,
      avgWith,
      avgWithout,
      delta: avgWith !== null && avgWithout !== null ? round(avgWith - avgWithout) : null,
      comparable,
    };
  }).filter((row) => row.nightsWith > 0);

  triggers.sort((a, b) => (b.delta ?? -99) - (a.delta ?? -99));

  const topTrigger =
    triggers.find((row) => row.comparable && row.delta !== null && row.delta >= TRIGGER_EFFECT_THRESHOLD) || null;

  const worstPosition = positions.reduce(
    (worst, row) => (worst === null || (row.avgSeverity ?? 0) > (worst.avgSeverity ?? 0) ? row : worst),
    null,
  );

  const notes = [];
  if (overall.pauseNights >= RED_FLAG_PAUSE_NIGHTS) {
    notes.push(
      `Breathing pauses were witnessed on ${overall.pauseNights} of ${overall.nights} nights. Witnessed pauses are one of the eight STOP-BANG sleep-apnoea screening items — worth showing to a doctor.`,
    );
  }
  if (overall.significantRate >= 50) {
    notes.push(
      `Loud snoring (level ${SIGNIFICANT_SEVERITY}+) on ${overall.significantRate}% of nights. Habitual snoring is usually defined as snoring on most nights of the week.`,
    );
  }
  if (topTrigger) {
    notes.push(
      `${topTrigger.trigger} nights average ${topTrigger.avgWith} vs ${topTrigger.avgWithout} without it (+${topTrigger.delta}). Try removing it for a week and re-logging.`,
    );
  }
  if (worstPosition && worstPosition.position === "Back" && positions.length > 1) {
    notes.push(
      `Back-sleeping nights average ${worstPosition.avgSeverity} on the 0-3 scale — the highest position in this log.`,
    );
  }
  if (overall.nights < 7) {
    notes.push(`Only ${overall.nights} night(s) logged. A full 7-14 nights gives a far steadier weekly rate.`);
  }

  return {
    overall,
    weeks,
    positions,
    triggers,
    topTrigger,
    worstPosition,
    notes,
    firstDate: nights[0].date,
    lastDate: nights[nights.length - 1].date,
  };
}

/** Shift an ISO date string by whole days. Pure — the base date is an argument. */
export function shiftIsoDate(dateString, days) {
  const ms = parseIsoDate(dateString);
  if (ms === null) return null;
  return toIsoDate(ms + Math.trunc(days) * MS_PER_DAY);
}
