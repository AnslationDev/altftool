/**
 * Savitribai Phule Pune University (SPPU) CGPA <-> percentage conversion, plus
 * a marks-to-grade-point path for students working from a marks-based sheet.
 *
 * SPPU's credit system computes
 *   SGPA / CGPA = sum(credit_i * gradePoint_i) / sum(credit_i)
 *
 * and converts to a percentage with a linear rule. Under the credit system for
 * engineering the university's stated equivalence deducts 0.75 before
 * multiplying by 10 (SPPU circular 322 of 2020); several other faculties quote
 * a plain multiply. Both are offered rather than one being assumed, because the
 * two differ by a flat 7.5 percentage points and that is enough to move a
 * candidate across a placement cutoff.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

export const MAX_CGPA = 10;
export const MIN_CGPA = 0;

/** Linear rules of the form percentage = m * CGPA + c. */
export const RULES = {
  circular322: {
    id: "circular322",
    label: "Credit system (engineering) — (CGPA - 0.75) x 10",
    m: 10,
    c: -7.5,
    expression: "(CGPA - 0.75) x 10",
    note: "The equivalence SPPU states for the credit system in circular 322 of 2020, most commonly applied to engineering programmes.",
  },
  timesTen: {
    id: "timesTen",
    label: "Plain multiply — CGPA x 10",
    m: 10,
    c: 0,
    expression: "CGPA x 10",
    note: "Quoted for several non-engineering faculties and accepted by many employers when no formula is printed on the sheet.",
  },
  ugc: {
    id: "ugc",
    label: "UGC equivalence — CGPA x 9.5",
    m: 9.5,
    c: 0,
    expression: "CGPA x 9.5",
    note: "The UGC's general CBCS equivalence, sometimes demanded by central-government and overseas application forms.",
  },
};

/**
 * The 10-point letter scale used on SPPU credit-system mark sheets, with the
 * mark band each grade covers. Boundaries can differ by faculty and pattern, so
 * check the legend printed on your own sheet before relying on the mapping.
 */
export const GRADE_SCALE = [
  { letter: "O", point: 10, min: 90, max: 100, label: "Outstanding" },
  { letter: "A+", point: 9, min: 80, max: 89.99, label: "Excellent" },
  { letter: "A", point: 8, min: 70, max: 79.99, label: "Very good" },
  { letter: "B+", point: 7, min: 60, max: 69.99, label: "Good" },
  { letter: "B", point: 6, min: 55, max: 59.99, label: "Above average" },
  { letter: "C", point: 5, min: 50, max: 54.99, label: "Average" },
  { letter: "P", point: 4, min: 40, max: 49.99, label: "Pass" },
  { letter: "F", point: 0, min: 0, max: 39.99, label: "Fail" },
];

/** Degree class bands on the converted percentage, the Maharashtra convention. */
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
 * CGPA -> percentage.
 *
 * @param {number} cgpa
 * @param {string} ruleId
 * @returns {{ percent: number, rule: object, clamped: boolean } | { error: string }}
 */
export function cgpaToPercentage(cgpa, ruleId) {
  const rule = RULES[ruleId];
  if (!rule) return { error: "Choose the rule your faculty uses." };
  if (!isNum(cgpa)) return { error: "Enter your CGPA as a number." };
  if (cgpa < MIN_CGPA || cgpa > MAX_CGPA) {
    return { error: `SPPU CGPA runs from ${MIN_CGPA} to ${MAX_CGPA}.` };
  }
  const raw = rule.m * cgpa + rule.c;
  const percent = Math.min(100, Math.max(0, raw));
  return { percent: round2(percent), rule, clamped: raw !== percent };
}

/**
 * Percentage -> CGPA.
 *
 * @param {number} percent
 * @param {string} ruleId
 * @returns {{ cgpa: number } | { error: string }}
 */
export function percentageToCgpa(percent, ruleId) {
  const rule = RULES[ruleId];
  if (!rule) return { error: "Choose the rule your faculty uses." };
  if (!isNum(percent)) return { error: "Enter the percentage as a number." };
  if (percent < 0 || percent > 100) return { error: "A percentage must be between 0 and 100." };
  const raw = (percent - rule.c) / rule.m;
  if (raw < MIN_CGPA || raw > MAX_CGPA) {
    return { error: `That percentage falls outside the ${MIN_CGPA}-${MAX_CGPA} CGPA scale under this rule.` };
  }
  return { cgpa: round2(raw) };
}

/**
 * Marks out of 100 -> letter grade and grade point.
 *
 * @param {number} marks
 * @returns {{ letter: string, point: number, label: string } | { error: string }}
 */
export function gradeForMarks(marks) {
  if (!isNum(marks)) return { error: "Enter marks as a number." };
  if (marks < 0 || marks > 100) return { error: "Marks must be between 0 and 100." };
  for (const band of GRADE_SCALE) {
    if (marks + 1e-9 >= band.min) {
      return { letter: band.letter, point: band.point, label: band.label };
    }
  }
  const fail = GRADE_SCALE[GRADE_SCALE.length - 1];
  return { letter: fail.letter, point: fail.point, label: fail.label };
}

/**
 * CGPA from courses given as marks out of 100, converting each to a grade point
 * first and then taking the credit-weighted mean.
 *
 * @param {Array<{ credits: number, marks: number }>} courses
 * @returns {object | { error: string }}
 */
export function cgpaFromMarks(courses) {
  if (!Array.isArray(courses)) return { error: "Add at least one course." };
  const usable = courses.filter((r) => r && isNum(r.credits) && isNum(r.marks) && r.credits > 0);
  if (usable.length === 0) return { error: "Enter credits and marks for at least one course." };
  const outOfRange = usable.find((r) => r.marks < 0 || r.marks > 100);
  if (outOfRange) return { error: "Marks must be between 0 and 100 for every course." };

  const rows = usable.map((r) => {
    const grade = gradeForMarks(r.marks);
    return { credits: r.credits, marks: r.marks, ...grade };
  });

  const totalCredits = rows.reduce((s, r) => s + r.credits, 0);
  const totalPoints = rows.reduce((s, r) => s + r.credits * r.point, 0);
  const failedCredits = rows
    .filter((r) => r.point === 0)
    .reduce((s, r) => s + r.credits, 0);

  return {
    rows,
    cgpa: round2(totalPoints / totalCredits),
    totalCredits: round2(totalCredits),
    totalPoints: round2(totalPoints),
    failedCredits: round2(failedCredits),
    /** Straight average of the marks themselves, for comparison with the grade route. */
    averageMarks: round2(
      rows.reduce((s, r) => s + r.credits * r.marks, 0) / totalCredits,
    ),
  };
}

/**
 * CGPA from semester SGPAs weighted by credits.
 *
 * @param {Array<{ credits: number, sgpa: number }>} semesters
 * @returns {{ cgpa: number, totalCredits: number } | { error: string }}
 */
export function cgpaFromSemesters(semesters) {
  if (!Array.isArray(semesters)) return { error: "Add at least one semester." };
  const rows = semesters.filter((r) => r && isNum(r.credits) && isNum(r.sgpa) && r.credits > 0);
  if (rows.length === 0) return { error: "Enter credits and an SGPA for at least one semester." };
  const bad = rows.find((r) => r.sgpa < MIN_CGPA || r.sgpa > MAX_CGPA);
  if (bad) return { error: `Every SGPA must be between ${MIN_CGPA} and ${MAX_CGPA}.` };
  const totalCredits = rows.reduce((s, r) => s + r.credits, 0);
  const totalPoints = rows.reduce((s, r) => s + r.credits * r.sgpa, 0);
  return { cgpa: round2(totalPoints / totalCredits), totalCredits: round2(totalCredits) };
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
 * The same CGPA under every rule.
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
