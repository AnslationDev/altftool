/**
 * Face-based pain scale tracker (Wong-Baker style, 0-10 in steps of two)
 *
 * Six faces spaced evenly across a 0-10 range, the format introduced by Donna
 * Wong and Connie Baker in 1988 for children old enough to point but too young
 * to reason about a number line. The person choosing the face is the person in
 * pain — a carer should not choose it for them.
 *
 * Severity wording follows the standard 0-10 numeric rating scale bands used in
 * pain assessment: 0 none, 1-3 mild, 4-6 moderate, 7-10 severe.
 *
 * The face descriptions here are written for this page. Informational only:
 * this is a way of recording what someone reports, not a measurement of tissue
 * damage, and it does not replace assessment by a clinician.
 */

export const PAIN_MIN = 0;
export const PAIN_MAX = 10;

/** The six points on the face scale. */
export const PAIN_LEVELS = [
  { value: 0, label: "No pain", detail: "Comfortable, nothing hurts" },
  { value: 2, label: "Hurts a little", detail: "Just a small ache, easy to ignore" },
  { value: 4, label: "Hurts a bit more", detail: "Noticeable, but you can still play or work" },
  { value: 6, label: "Hurts even more", detail: "Hard to ignore, gets in the way of things" },
  { value: 8, label: "Hurts a lot", detail: "Difficult to do anything else" },
  { value: 10, label: "Hurts as much as you can imagine", detail: "The worst pain you can think of" },
];

export const PAIN_VALUES = PAIN_LEVELS.map((level) => level.value);

/** Standard 0-10 numeric rating scale severity bands. */
export const SEVERITY_BANDS = [
  { min: 0, max: 0, label: "None" },
  { min: 1, max: 3, label: "Mild" },
  { min: 4, max: 6, label: "Moderate" },
  { min: 7, max: PAIN_MAX, label: "Severe" },
];

/** Scores at or above this are counted as "high pain" in the summary. */
export const HIGH_PAIN_THRESHOLD = 6;

export function levelInfo(value) {
  return PAIN_LEVELS.find((level) => level.value === Number(value)) || null;
}

export function severityForLevel(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return SEVERITY_BANDS.find((band) => n >= band.min && n <= band.max) || null;
}

/**
 * Describe a single reading.
 *
 * @param {number} value One of the six face values, 0 to 10 in steps of two.
 * @returns {object} Description, or { error } when the value is off the scale.
 */
export function describeLevel(value) {
  const n = Number(value);
  if (!Number.isInteger(n) || !PAIN_VALUES.includes(n)) {
    return { error: `Pick one of the six faces: ${PAIN_VALUES.join(", ")}.` };
  }
  const info = levelInfo(n);
  const band = severityForLevel(n);
  return {
    value: n,
    label: info.label,
    detail: info.detail,
    severity: band ? band.label : "",
    isHigh: n >= HIGH_PAIN_THRESHOLD,
  };
}

/**
 * Summarise a log of dated readings. Pure: every timestamp arrives as an
 * argument, so the same log always produces the same summary.
 *
 * @param {Array<{at: string, level: number, note?: string}>} entries
 *   `at` is an ISO-like sortable timestamp string, `level` one of PAIN_VALUES.
 * @returns {object} Summary, or { error } when an entry is malformed.
 */
export function summarisePainLog(entries) {
  if (!Array.isArray(entries)) {
    return { error: "The pain log must be a list of dated readings." };
  }
  if (entries.length === 0) {
    return {
      count: 0,
      sorted: [],
      average: null,
      highest: null,
      lowest: null,
      latest: null,
      previous: null,
      change: null,
      direction: "none",
      highPainCount: 0,
      highPainShare: null,
      distribution: PAIN_LEVELS.map((level) => ({ ...level, count: 0, share: 0 })),
    };
  }

  for (const entry of entries) {
    if (!entry || typeof entry.at !== "string" || entry.at.length === 0) {
      return { error: "Every reading needs a date and time." };
    }
    const n = Number(entry.level);
    if (!Number.isInteger(n) || !PAIN_VALUES.includes(n)) {
      return { error: `Every reading must use one of the six faces: ${PAIN_VALUES.join(", ")}.` };
    }
  }

  const sorted = [...entries].sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : 0));
  const levels = sorted.map((entry) => Number(entry.level));
  const sum = levels.reduce((acc, value) => acc + value, 0);
  const latest = sorted[sorted.length - 1];
  const previous = sorted.length > 1 ? sorted[sorted.length - 2] : null;
  const change = previous ? Number(latest.level) - Number(previous.level) : null;
  const highPainCount = levels.filter((value) => value >= HIGH_PAIN_THRESHOLD).length;

  const distribution = PAIN_LEVELS.map((level) => {
    const count = levels.filter((value) => value === level.value).length;
    return { ...level, count, share: (count / sorted.length) * 100 };
  });

  return {
    count: sorted.length,
    sorted,
    average: sum / sorted.length,
    highest: sorted.reduce((a, b) => (Number(b.level) > Number(a.level) ? b : a), sorted[0]),
    lowest: sorted.reduce((a, b) => (Number(b.level) < Number(a.level) ? b : a), sorted[0]),
    latest,
    previous,
    change,
    direction: change === null ? "none" : change < 0 ? "down" : change > 0 ? "up" : "unchanged",
    highPainCount,
    highPainShare: (highPainCount / sorted.length) * 100,
    highPainThreshold: HIGH_PAIN_THRESHOLD,
    distribution,
  };
}
