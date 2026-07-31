/**
 * Kerala DHSE (Directorate of Higher Secondary Education) Plus Two maths.
 *
 * Kerala reports higher secondary results as letter grades, not as a
 * percentage, so students have to reconstruct the percentage themselves for
 * application forms. The reconstruction is a plain aggregate:
 *
 *   Percentage = (total marks obtained ÷ total maximum marks) × 100
 *
 * A subject on the combined higher secondary certificate carries 200 marks —
 * 100 from the first year and 100 from the second — and six subjects therefore
 * make a grand total of 1200. Counting the Plus Two year alone gives 100 marks
 * per subject and a grand total of 600. Both are supported here because
 * different forms ask for different things.
 *
 * GRADES
 * Kerala uses a nine-point letter scale applied to the subject percentage:
 *   A+ 90-100, A 80-89, B+ 70-79, B 60-69, C+ 50-59, C 40-49,
 *   D+ 30-39, D 20-29, E below 20
 * with grade points running 9 down to 1 in the same order. The GPA is the
 * mean of the subject grade points.
 *
 * PASS RULE
 * The minimum for a pass is grade D+ — that is 30% — in each subject. Kerala
 * additionally requires that minimum to be met by the theory component on its
 * own, separately from the continuous evaluation marks, so a subject total
 * that scrapes past 30% can still be a fail if the theory part did not.
 * This module only checks the subject total against the pass mark — it has
 * no theory/CE split, so it cannot detect a theory-only shortfall. Students
 * should still confirm the theory-component pass against their grade card.
 */

/** Kerala nine-point grade scale, highest band first. */
export const KERALA_GRADES = [
  { code: "A+", point: 9, min: 90, max: 100, label: "Outstanding" },
  { code: "A", point: 8, min: 80, max: 89.99, label: "Excellent" },
  { code: "B+", point: 7, min: 70, max: 79.99, label: "Very good" },
  { code: "B", point: 6, min: 60, max: 69.99, label: "Good" },
  { code: "C+", point: 5, min: 50, max: 59.99, label: "Above average" },
  { code: "C", point: 4, min: 40, max: 49.99, label: "Average" },
  { code: "D+", point: 3, min: 30, max: 39.99, label: "Pass" },
  { code: "D", point: 2, min: 20, max: 29.99, label: "Below pass" },
  { code: "E", point: 1, min: 0, max: 19.99, label: "Needs improvement" },
];

/** Minimum subject percentage for a pass — grade D+. */
export const KERALA_PASS_PERCENT = 30;

/** The lowest grade point that still counts as a pass. */
export const KERALA_PASS_POINT = 3;

/** Highest grade point on the scale. */
export const KERALA_MAX_POINT = 9;

/** The two marksheet totals Kerala students are asked for. */
export const KERALA_SCOPES = [
  {
    value: "combined",
    label: "Both years (Plus One + Plus Two)",
    subjectMax: 200,
    subjectCount: 6,
    grandTotal: 1200,
    note: "The higher secondary certificate total: 200 marks a subject across the two years, 1200 in all.",
  },
  {
    value: "plusTwo",
    label: "Plus Two year only",
    subjectMax: 100,
    subjectCount: 6,
    grandTotal: 600,
    note: "The second year alone: 100 marks a subject, 600 in all.",
  },
];

/** No higher secondary subject is marked out of more than this. */
export const MAX_SUBJECT_MAX = 200;

function round(value, places = 2) {
  const factor = 10 ** places;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/**
 * Letter grade for a subject percentage on the Kerala nine-point scale.
 * @param {number} percentage subject percentage, 0 to 100
 * @returns {object|null} grade record, or null when the input is unusable
 */
export function gradeForPercentage(percentage) {
  const value = Number(percentage);
  if (!Number.isFinite(value) || value < 0 || value > 100) return null;
  return KERALA_GRADES.find((grade) => value >= grade.min) || KERALA_GRADES[8];
}

/**
 * Letter grade for raw marks out of a given maximum.
 * @param {number|string} marks
 * @param {number|string} max
 * @returns {object|null} grade record, or null when the input is unusable
 */
export function gradeForMarks(marks, max) {
  const value = Number(marks);
  const ceiling = Number(max);
  if (!Number.isFinite(value) || !Number.isFinite(ceiling) || ceiling <= 0) return null;
  if (value < 0 || value > ceiling) return null;
  return gradeForPercentage((value / ceiling) * 100);
}

/**
 * Percentage, grades and GPA for a Kerala higher secondary marksheet.
 *
 * @param {object} input
 * @param {string} [input.scope="combined"] "combined" or "plusTwo"
 * @param {Array<{name?: string, marks: number|string, max: number|string}>} input.subjects
 * @returns {object} result, or { error } when the marksheet cannot be scored
 */
export function computeKeralaResult({ scope = "combined", subjects }) {
  const scopeRecord = KERALA_SCOPES.find((item) => item.value === scope);
  if (!scopeRecord) {
    return { error: "Choose either the combined two-year total or the Plus Two year alone." };
  }
  if (!Array.isArray(subjects) || subjects.length === 0) {
    return { error: "Add at least one subject with its marks." };
  }

  let totalObtained = 0;
  let totalMax = 0;
  let pointSum = 0;
  const rows = [];
  const belowPass = [];

  for (let i = 0; i < subjects.length; i += 1) {
    const subject = subjects[i];
    const position = i + 1;
    const label = subject?.name?.trim() || `Subject ${position}`;

    if (subject?.marks === "" || subject?.marks === null || subject?.marks === undefined) {
      return { error: `Enter the marks scored in ${label}.` };
    }
    const marks = Number(subject.marks);
    const max = Number(subject?.max);

    if (!Number.isFinite(marks) || !Number.isFinite(max)) {
      return { error: `${label} needs a numeric mark and a numeric maximum.` };
    }
    if (max <= 0) {
      return { error: `${label} has a maximum of ${max}. The maximum must be greater than zero.` };
    }
    if (max > scopeRecord.subjectMax) {
      return {
        error: `${label} has a maximum of ${max}. For ${scopeRecord.label}, a subject does not exceed ${scopeRecord.subjectMax} marks.`,
      };
    }
    if (marks < 0) {
      return { error: `${label} cannot have negative marks.` };
    }
    if (marks > max) {
      return { error: `${label} shows ${marks} out of ${max}, which is above the maximum.` };
    }

    const subjectPercent = (marks / max) * 100;
    const grade = gradeForPercentage(subjectPercent);
    const passed = subjectPercent >= KERALA_PASS_PERCENT;
    if (!passed) belowPass.push(label);

    totalObtained += marks;
    totalMax += max;
    pointSum += grade.point;

    rows.push({
      name: label,
      marks,
      max,
      percent: round(subjectPercent, 2),
      grade: grade.code,
      gradeLabel: grade.label,
      point: grade.point,
      passed,
      shortfall: passed ? 0 : round((KERALA_PASS_PERCENT / 100) * max - marks, 2),
    });
  }

  if (totalMax <= 0) {
    return { error: "The total maximum came to zero, so a percentage cannot be formed." };
  }

  const percentage = (totalObtained / totalMax) * 100;
  const gpa = pointSum / rows.length;
  const overallGrade = gradeForPercentage(round(percentage, 2));

  return {
    scope: scopeRecord.value,
    scopeLabel: scopeRecord.label,
    totalObtained: round(totalObtained, 2),
    totalMax: round(totalMax, 2),
    expectedTotal: scopeRecord.grandTotal,
    percentage: round(percentage, 2),
    gpa: round(gpa, 2),
    totalGradePoints: pointSum,
    maxGradePoints: rows.length * KERALA_MAX_POINT,
    overallGrade: overallGrade.code,
    overallGradeLabel: overallGrade.label,
    passed: belowPass.length === 0,
    belowPass,
    belowPassCount: belowPass.length,
    subjectCount: rows.length,
    allA: rows.every((row) => row.grade === "A+"),
    rows,
  };
}

/**
 * Marks a remaining subject must score for the aggregate to reach a target
 * percentage.
 *
 * @param {object} input
 * @param {number|string} input.obtainedSoFar
 * @param {number|string} input.maxSoFar maximum of the subjects already scored
 * @param {number|string} input.remainingMax maximum of the subject(s) still to come
 * @param {number|string} input.targetPercent
 * @returns {object} { needed, achievable } or { error }
 */
export function marksNeededInRemaining({
  obtainedSoFar,
  maxSoFar,
  remainingMax,
  targetPercent,
}) {
  const obtained = Number(obtainedSoFar);
  const done = Number(maxSoFar);
  const left = Number(remainingMax);
  const target = Number(targetPercent);

  if (![obtained, done, left, target].every((value) => Number.isFinite(value))) {
    return { error: "Every field must be a number." };
  }
  if (done < 0 || left < 0) return { error: "Maximum marks cannot be negative." };
  if (done + left <= 0) return { error: "The overall maximum must be greater than zero." };
  if (obtained < 0 || obtained > done) {
    return { error: "Marks obtained must sit between zero and the maximum already scored." };
  }
  if (target < 0 || target > 100) return { error: "A target percentage must be between 0 and 100." };

  const requiredTotal = (target / 100) * (done + left);
  const needed = requiredTotal - obtained;

  return {
    requiredTotal: round(requiredTotal, 2),
    needed: round(Math.max(0, needed), 2),
    alreadyReached: needed <= 0,
    achievable: needed <= left,
    remainingMax: round(left, 2),
  };
}
