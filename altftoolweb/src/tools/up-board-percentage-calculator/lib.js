/**
 * UP Board (Uttar Pradesh Madhyamik Shiksha Parishad, UPMSP, Prayagraj)
 * percentage and division rules.
 *
 * High School (Class 10): six subjects of 100 marks each — total 600.
 * Intermediate (Class 12): five subjects of 100 marks each — total 500.
 *
 * Pass standard: minimum 33% in each subject.
 * Divisions on the aggregate percentage:
 *   First Division  — 60% and above
 *   Second Division — 45% to below 60%
 *   Third Division  — 33% to below 45%
 * 75%+ is conventionally reported as First Division with Distinction (Honours).
 */

/** Marks per subject on the UPMSP marksheet. */
export const MAX_MARKS_PER_SUBJECT = 100;

/** Subject counts per level (UPMSP scheme of examination). */
export const LEVELS = {
  highschool: { id: "highschool", label: "High School (Class 10)", subjects: 6 },
  intermediate: { id: "intermediate", label: "Intermediate (Class 12)", subjects: 5 },
};

/** UPMSP pass standard: 33% in each subject. */
export const PASS_MARK_PERCENT = 33;

/** UPMSP divisions on the aggregate percentage. */
export const DIVISIONS = [
  { minPercent: 75, label: "First Division with Distinction" },
  { minPercent: 60, label: "First Division" },
  { minPercent: 45, label: "Second Division" },
  { minPercent: 33, label: "Third Division" },
];

/**
 * Compute the UP Board percentage and division.
 *
 * @param {object} input
 * @param {"highschool"|"intermediate"} input.level  Exam level.
 * @param {number[]} input.marks  Marks per subject (6 for High School, 5 for Intermediate).
 * @returns {object} result, or { error } for invalid input.
 */
export function computeUpBoardResult({ level, marks }) {
  const scheme = LEVELS[level];
  if (!scheme) return { error: "Choose High School or Intermediate." };

  if (!Array.isArray(marks) || marks.length !== scheme.subjects) {
    return {
      error: `${scheme.label} has ${scheme.subjects} subjects — enter marks for all of them.`,
    };
  }

  const parsed = [];
  for (let i = 0; i < marks.length; i += 1) {
    const value = Number(marks[i]);
    if (!Number.isFinite(value)) {
      return { error: `Enter subject ${i + 1} marks as a number.` };
    }
    if (value < 0 || value > MAX_MARKS_PER_SUBJECT) {
      return {
        error: `Subject ${i + 1} marks must be between 0 and ${MAX_MARKS_PER_SUBJECT}.`,
      };
    }
    parsed.push(value);
  }

  const totalObtained = parsed.reduce((sum, m) => sum + m, 0);
  const totalMax = scheme.subjects * MAX_MARKS_PER_SUBJECT;
  const percentage = (totalObtained / totalMax) * 100;
  // Round first, then decide the division from the same rounded value that is
  // actually displayed to the user, so the band never contradicts the headline.
  const roundedPercentage = Math.round(percentage * 100) / 100;

  const passMark = (PASS_MARK_PERCENT / 100) * MAX_MARKS_PER_SUBJECT;
  const failedSubjects = parsed.filter((m) => m < passMark).length;
  const passed = failedSubjects === 0;

  let division = "Fail";
  if (passed) {
    const band = DIVISIONS.find((d) => roundedPercentage >= d.minPercent);
    division = band ? band.label : "Fail";
  }

  return {
    percentage: roundedPercentage,
    totalObtained,
    totalMax,
    passed,
    failedSubjects,
    division,
    passMark,
    level: scheme.id,
    levelLabel: scheme.label,
  };
}
