/**
 * University of Mumbai CGPA <-> percentage conversion.
 *
 * Under the Choice Based Credit and Grading System (CBCGS) Mumbai University
 * used an unusual affine map rather than a plain multiply:
 *
 *   Percentage = 7.1 x CGPA + 11
 *
 * The slope of 7.1 and the intercept of 11 exist because the CBCGS grade bands
 * are not evenly spaced against marks — grade point 10 starts at 80 marks, not
 * 90 — so a straight multiply would have overstated the marks a top grade
 * represents.
 *
 * The university repealed that formula with effect from 1 January 2026. Under
 * the current position the percentage is computed from the raw marks actually
 * scored across all semesters, and a conversion certificate is issued on
 * request. Both routes are supported here: the affine formula for grade cards
 * that carry it, and a marks-based aggregate for everyone after the repeal.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

export const MAX_CGPA = 10;
export const MIN_CGPA = 0;

/** The CBCGS formula's own coefficients, kept named so the map is readable. */
export const CBCGS_SLOPE = 7.1;
export const CBCGS_INTERCEPT = 11;

/** The date from which the CBCGS formula no longer applies. */
export const CBCGS_REPEAL_DATE = "1 January 2026";

/** Linear rules of the form percentage = m * CGPA + c. */
export const RULES = {
  cbcgs: {
    id: "cbcgs",
    label: `CBCGS formula — 7.1 x CGPA + 11 (repealed ${CBCGS_REPEAL_DATE})`,
    m: CBCGS_SLOPE,
    c: CBCGS_INTERCEPT,
    expression: "7.1 x CGPA + 11",
    note: `The conversion Mumbai University applied under CBCGS. It was repealed with effect from ${CBCGS_REPEAL_DATE}, so use it to reproduce a figure already printed on an older grade card rather than to generate a new one.`,
  },
  timesTen: {
    id: "timesTen",
    label: "Plain multiply — CGPA x 10",
    m: 10,
    c: 0,
    expression: "CGPA x 10",
    note: "The rough equivalence many employers accept when no formula is stated. It flatters a CBCGS CGPA, so do not use it where the grade card says otherwise.",
  },
  ugc: {
    id: "ugc",
    label: "UGC equivalence — CGPA x 9.5",
    m: 9.5,
    c: 0,
    expression: "CGPA x 9.5",
    note: "The UGC's general CBCS equivalence, sometimes required on central-government and overseas application forms.",
  },
};

/**
 * CBCGS grade points and their mark bands, as printed on Mumbai University
 * CBCGS mark sheets. Note that grade point 10 begins at 80 marks, which is why
 * the conversion formula is not a plain multiply.
 */
export const GRADE_POINTS = [
  { letter: "O", point: 10, marks: "80 - 100", label: "Outstanding" },
  { letter: "A", point: 9, marks: "70 - 79.99", label: "Excellent" },
  { letter: "B", point: 8, marks: "60 - 69.99", label: "Very good" },
  { letter: "C", point: 7, marks: "55 - 59.99", label: "Good" },
  { letter: "D", point: 6, marks: "50 - 54.99", label: "Above average" },
  { letter: "E", point: 5, marks: "45 - 49.99", label: "Average" },
  { letter: "P", point: 4, marks: "40 - 44.99", label: "Pass" },
  { letter: "F", point: 0, marks: "below 40", label: "Fail" },
];

/** Degree class bands on the converted percentage, the convention Maharashtra
 * employers and admission offices generally apply. */
export const CLASS_BANDS = [
  { id: "distinction", min: 70, label: "First Class with Distinction" },
  { id: "first", min: 60, label: "First Class" },
  { id: "higherSecond", min: 55, label: "Higher Second Class" },
  { id: "second", min: 50, label: "Second Class" },
  { id: "pass", min: 40, label: "Pass Class" },
];

const isNum = (v) => typeof v === "number" && Number.isFinite(v);
const round2 = (v) => Math.round(v * 100) / 100;

/**
 * CGPA -> percentage under one rule.
 *
 * @param {number} cgpa
 * @param {string} ruleId
 * @returns {{ percent: number, rule: object, clamped: boolean } | { error: string }}
 */
export function cgpaToPercentage(cgpa, ruleId) {
  const rule = RULES[ruleId];
  if (!rule) return { error: "Choose a conversion rule." };
  if (!isNum(cgpa)) return { error: "Enter your CGPA as a number." };
  if (cgpa < MIN_CGPA || cgpa > MAX_CGPA) {
    return { error: `Mumbai University CGPA runs from ${MIN_CGPA} to ${MAX_CGPA}.` };
  }
  const raw = rule.m * cgpa + rule.c;
  const percent = Math.min(100, Math.max(0, raw));
  return { percent: round2(percent), rule, clamped: raw !== percent };
}

/**
 * Percentage -> CGPA, inverting the same rule.
 *
 * @param {number} percent
 * @param {string} ruleId
 * @returns {{ cgpa: number } | { error: string }}
 */
export function percentageToCgpa(percent, ruleId) {
  const rule = RULES[ruleId];
  if (!rule) return { error: "Choose a conversion rule." };
  if (!isNum(percent)) return { error: "Enter the percentage as a number." };
  if (percent < 0 || percent > 100) return { error: "A percentage must be between 0 and 100." };
  const raw = (percent - rule.c) / rule.m;
  if (raw < MIN_CGPA || raw > MAX_CGPA) {
    return {
      error:
        rule.id === "cbcgs"
          ? `The CBCGS formula only spans ${CBCGS_INTERCEPT}% to ${round2(CBCGS_SLOPE * MAX_CGPA + CBCGS_INTERCEPT)}%, so that percentage has no CGPA under it.`
          : `That percentage falls outside the ${MIN_CGPA}-${MAX_CGPA} CGPA scale.`,
    };
  }
  return { cgpa: round2(raw) };
}

/**
 * Aggregate percentage straight from raw marks, which is how the university
 * computes it after the CBCGS formula was repealed.
 *
 *   percentage = 100 * sum(marks obtained) / sum(marks out of)
 *
 * @param {Array<{ obtained: number, max: number }>} semesters
 * @returns {{ percent: number, totalObtained: number, totalMax: number, counted: number } | { error: string }}
 */
export function aggregatePercentageFromMarks(semesters) {
  if (!Array.isArray(semesters)) return { error: "Add at least one semester." };
  const rows = semesters.filter((r) => r && isNum(r.obtained) && isNum(r.max) && r.max > 0);
  if (rows.length === 0) {
    return { error: "Enter marks obtained and marks out of for at least one semester." };
  }
  const bad = rows.find((r) => r.obtained < 0 || r.obtained > r.max);
  if (bad) return { error: "Marks obtained cannot be negative or above the marks out of." };

  const totalObtained = rows.reduce((s, r) => s + r.obtained, 0);
  const totalMax = rows.reduce((s, r) => s + r.max, 0);
  if (totalMax <= 0) return { error: "Total marks out of must be greater than zero." };

  return {
    percent: round2((totalObtained / totalMax) * 100),
    totalObtained: round2(totalObtained),
    totalMax: round2(totalMax),
    counted: rows.length,
  };
}

/**
 * CGPA from a list of courses, weighting each grade point by its credits.
 *
 * @param {Array<{ credits: number, point: number }>} courses
 * @returns {{ cgpa: number, totalCredits: number, totalPoints: number, counted: number } | { error: string }}
 */
export function cgpaFromCourses(courses) {
  if (!Array.isArray(courses)) return { error: "Add at least one course." };
  const rows = courses.filter((r) => r && isNum(r.credits) && isNum(r.point) && r.credits > 0);
  if (rows.length === 0) return { error: "Enter credits and a grade point for at least one course." };
  const bad = rows.find((r) => r.point < 0 || r.point > MAX_CGPA);
  if (bad) return { error: `Grade points run from 0 to ${MAX_CGPA}.` };

  const totalCredits = rows.reduce((s, r) => s + r.credits, 0);
  const totalPoints = rows.reduce((s, r) => s + r.credits * r.point, 0);
  return {
    cgpa: round2(totalPoints / totalCredits),
    totalCredits: round2(totalCredits),
    totalPoints: round2(totalPoints),
    counted: rows.length,
  };
}

/**
 * Degree class for a percentage.
 *
 * @param {number} percent
 * @returns {{ id: string, label: string } | { error: string }}
 */
export function classForPercentage(percent) {
  if (!isNum(percent) || percent < 0 || percent > 100) {
    return { error: "Enter a percentage between 0 and 100." };
  }
  for (const band of CLASS_BANDS) {
    if (percent + 1e-9 >= band.min) return { id: band.id, label: band.label };
  }
  return { id: "none", label: "Below the pass class" };
}

/**
 * The same CGPA under every rule, showing how much the choice of formula moves
 * the number.
 *
 * @param {number} cgpa
 * @returns {Array<{ id: string, expression: string, percent: number }>}
 */
export function compareRules(cgpa) {
  return Object.values(RULES)
    .map((rule) => {
      const out = cgpaToPercentage(cgpa, rule.id);
      if (out.error) return null;
      return { id: rule.id, expression: rule.expression, percent: out.percent };
    })
    .filter(Boolean);
}
