/**
 * Anna University CGPA <-> percentage conversion, CGPA build-up from semester
 * credits, and degree classification.
 *
 * Anna University runs a 10-point relative-free grading scale. Both the
 * semester GPA and the cumulative CGPA are credit-weighted averages of grade
 * points:
 *
 *   GPA  = sum(credit_i * gradePoint_i) / sum(credit_i)      (one semester)
 *   CGPA = sum(credit_i * gradePoint_i) / sum(credit_i)      (all semesters)
 *
 * which is the same thing as weighting each semester GPA by the credits earned
 * in that semester.
 *
 * The percentage printed on a consolidated statement is then a straight linear
 * map of CGPA. Anna University regulations state the conversion as
 * Percentage = CGPA x 10; some older statements and some affiliated-college
 * transcripts show the deducted variants, which are included here so you can
 * reproduce whichever number your own document carries.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** The scale is out of 10 grade points. */
export const MAX_CGPA = 10;
export const MIN_CGPA = 0;

/**
 * Linear conversion rules, each of the form percentage = m * CGPA + c.
 * `id` is stable; `label` names the document the rule comes from.
 */
export const RULES = {
  standard: {
    id: "standard",
    label: "Anna University standard — Percentage = CGPA x 10",
    m: 10,
    c: 0,
    expression: "CGPA x 10",
    note: "The conversion stated in Anna University's UG and PG regulations, including R2017, R2019 and R2021.",
  },
  minusHalf: {
    id: "minusHalf",
    label: "Deducted variant — Percentage = (CGPA - 0.5) x 10",
    m: 10,
    c: -5,
    expression: "(CGPA - 0.5) x 10",
    note: "Seen on some older consolidated statements and on transcripts issued by a few affiliated colleges. Use it only if your own document quotes it.",
  },
  ugc: {
    id: "ugc",
    label: "UGC equivalence — Percentage = CGPA x 9.5",
    m: 9.5,
    c: 0,
    expression: "CGPA x 9.5",
    note: "The UGC's general CBCS equivalence, sometimes asked for on central-government and foreign-admission forms.",
  },
};

/**
 * Anna University letter grades and grade points, with the mark ranges from the
 * UG regulations. RA marks a re-appearance (arrear) and carries no grade point.
 */
export const GRADE_POINTS = [
  { letter: "O", point: 10, marks: "91 - 100", label: "Outstanding" },
  { letter: "A+", point: 9, marks: "81 - 90", label: "Excellent" },
  { letter: "A", point: 8, marks: "71 - 80", label: "Very good" },
  { letter: "B+", point: 7, marks: "61 - 70", label: "Good" },
  { letter: "B", point: 6, marks: "50 - 60", label: "Average" },
  { letter: "RA", point: 0, marks: "below 50", label: "Re-appearance" },
];

/**
 * Degree classification under Anna University UG regulations.
 * First Class with Distinction additionally requires passing every subject in
 * the first appearance within the normal programme duration, which this module
 * takes as a flag because it is not derivable from the CGPA alone.
 */
export const CLASSIFICATION_BANDS = [
  { id: "distinction", minCgpa: 8.5, label: "First Class with Distinction", requiresNoArrears: true },
  { id: "first", minCgpa: 7.0, label: "First Class", requiresNoArrears: false },
  { id: "second", minCgpa: 5.0, label: "Second Class", requiresNoArrears: false },
];

/** Below this CGPA the programme is not cleared. */
export const PASS_CGPA = 5.0;

const isNum = (v) => typeof v === "number" && Number.isFinite(v);
const round2 = (v) => Math.round(v * 100) / 100;

/**
 * CGPA -> percentage under one rule.
 *
 * @param {number} cgpa
 * @param {string} ruleId key of RULES
 * @returns {{ percent: number, rule: object } | { error: string }}
 */
export function cgpaToPercentage(cgpa, ruleId) {
  const rule = RULES[ruleId];
  if (!rule) return { error: "Choose a conversion rule." };
  if (!isNum(cgpa)) return { error: "Enter your CGPA as a number." };
  if (cgpa < MIN_CGPA || cgpa > MAX_CGPA) {
    return { error: `Anna University CGPA runs from ${MIN_CGPA} to ${MAX_CGPA}.` };
  }
  const raw = rule.m * cgpa + rule.c;
  // The deducted rule can go negative for a very low CGPA; a percentage cannot.
  const percent = Math.min(100, Math.max(0, raw));
  return { percent: round2(percent), rule, clamped: raw !== percent };
}

/**
 * Percentage -> CGPA, the inverse of the same linear rule.
 *
 * @param {number} percent
 * @param {string} ruleId
 * @returns {{ cgpa: number, rule: object } | { error: string }}
 */
export function percentageToCgpa(percent, ruleId) {
  const rule = RULES[ruleId];
  if (!rule) return { error: "Choose a conversion rule." };
  if (!isNum(percent)) return { error: "Enter the percentage as a number." };
  if (percent < 0 || percent > 100) return { error: "A percentage must be between 0 and 100." };
  if (rule.m === 0) return { error: "This rule cannot be reversed." };
  const raw = (percent - rule.c) / rule.m;
  if (raw < MIN_CGPA || raw > MAX_CGPA) {
    return { error: `That percentage maps outside the ${MIN_CGPA}-${MAX_CGPA} CGPA scale under this rule.` };
  }
  return { cgpa: round2(raw), rule };
}

/**
 * Credit-weighted CGPA from a list of semesters.
 *
 * @param {Array<{ credits: number, gpa: number }>} semesters
 * @returns {{ cgpa: number, totalCredits: number, totalPoints: number, counted: number } | { error: string }}
 */
export function cgpaFromSemesters(semesters) {
  if (!Array.isArray(semesters)) return { error: "Add at least one semester." };
  const rows = semesters.filter(
    (r) => r && isNum(r.credits) && isNum(r.gpa) && r.credits > 0,
  );
  if (rows.length === 0) return { error: "Enter credits and a GPA for at least one semester." };

  const bad = rows.find((r) => r.gpa < MIN_CGPA || r.gpa > MAX_CGPA);
  if (bad) return { error: `Every semester GPA must be between ${MIN_CGPA} and ${MAX_CGPA}.` };

  const totalCredits = rows.reduce((sum, r) => sum + r.credits, 0);
  if (totalCredits <= 0) return { error: "Total credits must be greater than zero." };
  const totalPoints = rows.reduce((sum, r) => sum + r.credits * r.gpa, 0);

  return {
    cgpa: round2(totalPoints / totalCredits),
    totalCredits: round2(totalCredits),
    totalPoints: round2(totalPoints),
    counted: rows.length,
  };
}

/**
 * Degree classification for a CGPA.
 *
 * @param {number} cgpa
 * @param {boolean} clearedInFirstAttempt whether every paper was passed at the
 *   first appearance within the normal duration
 * @returns {{ label: string, id: string } | { error: string }}
 */
export function classify(cgpa, clearedInFirstAttempt) {
  if (!isNum(cgpa) || cgpa < MIN_CGPA || cgpa > MAX_CGPA) {
    return { error: `Enter a CGPA between ${MIN_CGPA} and ${MAX_CGPA}.` };
  }
  if (cgpa < PASS_CGPA) {
    return { id: "notCleared", label: "Below the classification range" };
  }
  for (const band of CLASSIFICATION_BANDS) {
    if (cgpa + 1e-9 >= band.minCgpa) {
      if (band.requiresNoArrears && !clearedInFirstAttempt) continue;
      return { id: band.id, label: band.label };
    }
  }
  return { id: "second", label: "Second Class" };
}

/**
 * GPA needed across the remaining credits to finish on a target CGPA.
 *
 * From  target * (done + left) = current * done + x * left,
 *       x = (target * (done + left) - current * done) / left.
 *
 * @param {object} input
 * @param {number} input.currentCgpa
 * @param {number} input.completedCredits
 * @param {number} input.remainingCredits
 * @param {number} input.targetCgpa
 * @returns {{ requiredGpa: number, achievable: boolean } | { error: string }}
 */
export function requiredGpaForTarget({
  currentCgpa,
  completedCredits,
  remainingCredits,
  targetCgpa,
}) {
  if (!isNum(currentCgpa) || currentCgpa < MIN_CGPA || currentCgpa > MAX_CGPA) {
    return { error: `Current CGPA must be between ${MIN_CGPA} and ${MAX_CGPA}.` };
  }
  if (!isNum(targetCgpa) || targetCgpa < MIN_CGPA || targetCgpa > MAX_CGPA) {
    return { error: `Target CGPA must be between ${MIN_CGPA} and ${MAX_CGPA}.` };
  }
  if (!isNum(completedCredits) || completedCredits < 0) {
    return { error: "Credits already completed must be zero or more." };
  }
  if (!isNum(remainingCredits) || remainingCredits <= 0) {
    return { error: "Enter how many credits are still left — it must be more than zero." };
  }

  const total = completedCredits + remainingCredits;
  const required =
    (targetCgpa * total - currentCgpa * completedCredits) / remainingCredits;

  return {
    requiredGpa: round2(required),
    achievable: required <= MAX_CGPA + 1e-9 && required >= MIN_CGPA - 1e-9,
    totalCredits: round2(total),
  };
}

/**
 * The same CGPA under every rule, so a student can see which number an employer
 * or admission portal is likely to be quoting.
 *
 * @param {number} cgpa
 * @returns {Array<{ id: string, label: string, expression: string, percent: number }>}
 */
export function compareRules(cgpa) {
  return Object.values(RULES)
    .map((rule) => {
      const out = cgpaToPercentage(cgpa, rule.id);
      if (out.error) return null;
      return {
        id: rule.id,
        label: rule.label,
        expression: rule.expression,
        percent: out.percent,
      };
    })
    .filter(Boolean);
}
