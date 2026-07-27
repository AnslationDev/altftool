/**
 * IELTS band score calculator.
 *
 * Rules per ielts.org ("How IELTS is scored"):
 *  - Each of the four skills (Listening, Reading, Writing, Speaking) is scored
 *    on bands 0–9 in half-band steps.
 *  - The Overall Band Score is the MEAN of the four skill bands, rounded to the
 *    nearest whole or half band; averages ending in .25 round UP to the next
 *    half band and averages ending in .75 round UP to the next whole band.
 *  - Listening and Reading each have 40 questions worth 1 mark; the raw score
 *    out of 40 maps to a band via the indicative conversion tables that IELTS
 *    publishes (Listening, Academic Reading and General Training Reading each
 *    have their own table).
 *
 * Each table below lists [minimum raw score, band] pairs in descending order,
 * from the indicative conversions published on ielts.org and partner sites
 * (British Council / IDP).
 */

export const MIN_BAND = 0;
export const MAX_BAND = 9;
export const RAW_MAX = 40;

/** Listening: indicative raw-to-band conversion (40 questions). */
export const LISTENING_TABLE = [
  [39, 9],
  [37, 8.5],
  [35, 8],
  [32, 7.5],
  [30, 7],
  [26, 6.5],
  [23, 6],
  [18, 5.5],
  [16, 5],
  [13, 4.5],
  [10, 4],
  [8, 3.5],
  [6, 3],
  [4, 2.5],
];

/** Academic Reading: indicative raw-to-band conversion (40 questions). */
export const ACADEMIC_READING_TABLE = [
  [39, 9],
  [37, 8.5],
  [35, 8],
  [33, 7.5],
  [30, 7],
  [27, 6.5],
  [23, 6],
  [19, 5.5],
  [15, 5],
  [13, 4.5],
  [10, 4],
  [8, 3.5],
  [6, 3],
  [4, 2.5],
];

/** General Training Reading: indicative raw-to-band conversion (40 questions). */
export const GENERAL_READING_TABLE = [
  [40, 9],
  [39, 8.5],
  [37, 8],
  [36, 7.5],
  [34, 7],
  [32, 6.5],
  [30, 6],
  [27, 5.5],
  [23, 5],
  [19, 4.5],
  [15, 4],
  [12, 3.5],
  [9, 3],
  [6, 2.5],
];

export const RAW_TABLES = {
  listening: LISTENING_TABLE,
  "reading-academic": ACADEMIC_READING_TABLE,
  "reading-general": GENERAL_READING_TABLE,
};

/** True when a value is a valid IELTS band (0–9 in half steps). */
export function isValidBand(value) {
  const n = Number(value);
  return Number.isFinite(n) && n >= MIN_BAND && n <= MAX_BAND && Number.isInteger(n * 2);
}

/**
 * Convert a raw score out of 40 into a band using an indicative table.
 * @returns {{ band: number }} or { error } when input is invalid or below the
 * published conversion range.
 */
export function rawToBand({ skill, raw }) {
  const table = RAW_TABLES[skill];
  if (!table) return { error: "Unknown skill for raw score conversion." };
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 0 || n > RAW_MAX) {
    return { error: `Raw score must be a whole number between 0 and ${RAW_MAX}.` };
  }
  for (const [minRaw, band] of table) {
    if (n >= minRaw) return { band };
  }
  return {
    error:
      "Raw score is below the published conversion range — enter the band from your score report directly.",
  };
}

/**
 * IELTS overall rounding: mean of the four bands to the nearest half band,
 * with .25 and .75 rounding up (Math.round on doubled value implements this).
 */
export function roundOverall(mean) {
  if (!Number.isFinite(mean)) return Number.NaN;
  return Math.round(mean * 2) / 2;
}

/**
 * Compute the IELTS Overall Band Score from four skill bands.
 * @returns {object} result or { error }.
 */
export function computeOverallBand({ listening, reading, writing, speaking }) {
  const skills = [
    ["Listening", listening],
    ["Reading", reading],
    ["Writing", writing],
    ["Speaking", speaking],
  ];
  for (const [name, value] of skills) {
    if (!isValidBand(value)) {
      return { error: `${name} band must be between 0 and 9 in half-band steps (e.g. 6.5).` };
    }
  }
  const bands = skills.map(([, v]) => Number(v));
  const sum = bands.reduce((acc, v) => acc + v, 0);
  const mean = sum / bands.length;
  const overall = roundOverall(mean);
  return {
    overall,
    mean,
    sum,
    listening: bands[0],
    reading: bands[1],
    writing: bands[2],
    speaking: bands[3],
    roundedUp: overall > mean,
    roundedDown: overall < mean,
  };
}
