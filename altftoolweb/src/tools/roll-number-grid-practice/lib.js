/**
 * Roll number grid practice — pure logic.
 *
 * OMR sheets encode the roll number as one column of 0–9 bubbles per digit.
 * Optical scanners follow two hard rules (common to NTA, SSC and board OMR
 * instructions): a column with no mark reads as blank, and a column with more
 * than one mark is rejected as invalid. This module generates practice roll
 * numbers deterministically from a seed and grades a filled grid against them.
 */

/** Digits available in each grid column. */
export const DIGIT_ROWS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

/** Printable bounds for the practice grid. */
export const MIN_DIGITS = 4;
export const MAX_DIGITS = 15;
/** Long numeric roll/application numbers (e.g. NTA) run 10–12 digits. */
export const DEFAULT_DIGITS = 10;

/** Per-column grading statuses. */
export const STATUS = {
  CORRECT: "correct",
  WRONG: "wrong",
  MISSING: "missing",
  MULTIPLE: "multiple",
};

/**
 * mulberry32 — tiny deterministic PRNG (public-domain algorithm by Tommy Ettinger).
 * Used so the same seed always yields the same practice roll number.
 */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generate a practice roll number.
 *
 * @param {object} input
 * @param {number} input.seed    Any finite number; same seed -> same digits.
 * @param {number} input.length  Number of digits (MIN_DIGITS..MAX_DIGITS).
 * @returns {{ digits: string }} or { error }.
 */
export function generateRollNumber({ seed, length = DEFAULT_DIGITS }) {
  const n = Number(length);
  const s = Number(seed);
  if (!Number.isFinite(s)) return { error: "Seed must be a number." };
  if (!Number.isInteger(n) || n < MIN_DIGITS || n > MAX_DIGITS) {
    return { error: `Digits must be a whole number between ${MIN_DIGITS} and ${MAX_DIGITS}.` };
  }
  const rand = mulberry32(Math.floor(s));
  let digits = "";
  for (let i = 0; i < n; i += 1) {
    digits += String(Math.floor(rand() * 10));
  }
  return { digits };
}

/**
 * Grade a filled grid against the target roll number.
 *
 * @param {object} input
 * @param {string} input.target  Digit string the candidate had to encode.
 * @param {Array<Array<number>>} input.marks  Per column, the digits bubbled.
 * @returns {object} column-wise report and totals, or { error }.
 */
export function evaluateGrid({ target, marks }) {
  if (typeof target !== "string" || !/^\d+$/.test(target)) {
    return { error: "Target roll number must be a string of digits." };
  }
  const markList = Array.isArray(marks) ? marks : [];

  const columns = [];
  let correct = 0;
  let wrong = 0;
  let missing = 0;
  let multiple = 0;

  for (let i = 0; i < target.length; i += 1) {
    const expected = Number(target[i]);
    const marked = Array.isArray(markList[i]) ? markList[i].map(Number) : [];
    let status;
    if (marked.length === 0) {
      status = STATUS.MISSING;
      missing += 1;
    } else if (marked.length > 1) {
      // Scanners reject columns carrying more than one mark.
      status = STATUS.MULTIPLE;
      multiple += 1;
    } else if (marked[0] === expected) {
      status = STATUS.CORRECT;
      correct += 1;
    } else {
      status = STATUS.WRONG;
      wrong += 1;
    }
    columns.push({ index: i, expected, marked, status });
  }

  const total = target.length;
  return {
    columns,
    correct,
    wrong,
    missing,
    multiple,
    total,
    allCorrect: correct === total,
    accuracyPercent: total === 0 ? 0 : Math.round((correct / total) * 100),
  };
}
