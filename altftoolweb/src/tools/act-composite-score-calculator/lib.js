/**
 * ACT Composite score calculator.
 *
 * Rules per ACT, Inc. score reporting documentation:
 *  - Each section is reported on a 1–36 scale.
 *  - The Composite is the average of the section scale scores, rounded to the
 *    nearest whole number: fractions of one-half or more round UP, fractions
 *    below one-half round DOWN.
 *  - Classic ACT (through early 2025): Composite averages English, Math,
 *    Reading and Science.
 *  - Enhanced ACT (rolled out from April 2025 online testing): Composite
 *    averages English, Math and Reading only; Science is an optional section
 *    reported separately on 1–36 and no longer feeds the Composite.
 *  - ACT also reports a STEM score: the rounded average of Math and Science.
 */

/** ACT scale score bounds (ACT technical manual). */
export const MIN_SCALE = 1;
export const MAX_SCALE = 36;

export const FORMATS = [
  {
    id: "enhanced",
    label: "Enhanced ACT (April 2025 onwards) — English, Math, Reading",
    compositeSections: ["english", "math", "reading"],
  },
  {
    id: "classic",
    label: "Classic ACT — English, Math, Reading, Science",
    compositeSections: ["english", "math", "reading", "science"],
  },
];

/** ACT rounding: fractions of .5 or more round up, below .5 round down. */
export function roundHalfUp(value) {
  if (!Number.isFinite(value)) return Number.NaN;
  return Math.floor(value + 0.5);
}

function validateSection(name, value, { optional = false } = {}) {
  if (optional && (value === null || value === undefined || Number.isNaN(value))) return null;
  const n = Number(value);
  if (!Number.isInteger(n) || n < MIN_SCALE || n > MAX_SCALE) {
    return { error: `${name} must be a whole number between ${MIN_SCALE} and ${MAX_SCALE}.` };
  }
  return n;
}

/**
 * Compute the ACT Composite (and STEM score where Science is available).
 *
 * @param {object} input
 * @param {string} input.formatId  "classic" or "enhanced".
 * @param {number} input.english   English scale score 1–36.
 * @param {number} input.math      Math scale score 1–36.
 * @param {number} input.reading   Reading scale score 1–36.
 * @param {number} [input.science] Science scale score 1–36 (optional on enhanced).
 * @returns {object} result or { error }.
 */
export function computeActComposite({ formatId = "enhanced", english, math, reading, science }) {
  const format = FORMATS.find((f) => f.id === formatId);
  if (!format) return { error: "Choose an ACT format." };

  const e = validateSection("English", english);
  if (e && e.error) return e;
  const m = validateSection("Math", math);
  if (m && m.error) return m;
  const r = validateSection("Reading", reading);
  if (r && r.error) return r;

  const scienceOptional = formatId === "enhanced";
  const s = validateSection("Science", science, { optional: scienceOptional });
  if (s && s.error) return s;

  const values = { english: e, math: m, reading: r, science: s };
  const compositeParts = format.compositeSections.map((k) => values[k]);
  const sum = compositeParts.reduce((acc, v) => acc + v, 0);
  const average = sum / compositeParts.length;
  const composite = roundHalfUp(average);

  // STEM score = rounded average of Math and Science (ACT score report).
  const stem = s === null ? null : roundHalfUp((m + s) / 2);

  return {
    format,
    composite,
    average,
    sum,
    sectionsCounted: compositeParts.length,
    stem,
    english: e,
    math: m,
    reading: r,
    science: s,
  };
}
