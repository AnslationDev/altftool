/**
 * Bihar School Examination Board (BSEB, Patna) percentage and division rules.
 *
 * Matric (Class 10) and Intermediate (Class 12) results are both declared on
 * an aggregate of five compulsory subjects of 100 marks each — total 500.
 * (A sixth, optional subject exists but its marks are used only to substitute
 * a failed compulsory subject; it is not added to the 500-mark aggregate.)
 *
 * Pass standard: minimum 30% in each subject and 30% in the aggregate
 * (150 of 500).
 * Divisions on the aggregate:
 *   First Division  — 300+ of 500 (60%)
 *   Second Division — 225+ of 500 (45%)
 *   Third Division  — 150+ of 500 (30%)
 */

/** Marks per subject on the BSEB marksheet. */
export const MAX_MARKS_PER_SUBJECT = 100;

/** Compulsory subjects counted in the BSEB aggregate. */
export const COUNTED_SUBJECTS = 5;

/** Aggregate base: 5 x 100. */
export const TOTAL_MAX = COUNTED_SUBJECTS * MAX_MARKS_PER_SUBJECT;

/** BSEB pass standard: 30% per subject and in aggregate. */
export const PASS_MARK_PERCENT = 30;

/** BSEB divisions on the 500-mark aggregate. */
export const DIVISIONS = [
  { minPercent: 60, minMarks: 300, label: "First Division" },
  { minPercent: 45, minMarks: 225, label: "Second Division" },
  { minPercent: 30, minMarks: 150, label: "Third Division" },
];

export const LEVELS = {
  matric: { id: "matric", label: "Matric (Class 10)" },
  inter: { id: "inter", label: "Intermediate (Class 12)" },
};

/**
 * Compute the BSEB percentage, pass status and division.
 *
 * @param {object} input
 * @param {"matric"|"inter"} input.level  Exam level (same maths for both; kept for labelling).
 * @param {number[]} input.marks  Marks in the five compulsory subjects.
 * @returns {object} result, or { error } for invalid input.
 */
export function computeBsebResult({ level, marks }) {
  const scheme = LEVELS[level];
  if (!scheme) return { error: "Choose Matric or Intermediate." };

  if (!Array.isArray(marks) || marks.length !== COUNTED_SUBJECTS) {
    return { error: `Enter marks for all ${COUNTED_SUBJECTS} compulsory subjects.` };
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
  const percentage = (totalObtained / TOTAL_MAX) * 100;

  const passMark = (PASS_MARK_PERCENT / 100) * MAX_MARKS_PER_SUBJECT;
  const aggregatePassMark = (PASS_MARK_PERCENT / 100) * TOTAL_MAX;
  const failedSubjects = parsed.filter((m) => m < passMark).length;
  const aggregatePassed = totalObtained >= aggregatePassMark;
  const passed = failedSubjects === 0 && aggregatePassed;

  let division = "Fail";
  if (passed) {
    const band = DIVISIONS.find((d) => totalObtained >= d.minMarks);
    division = band ? band.label : "Fail";
  }

  return {
    percentage: Math.round(percentage * 100) / 100,
    totalObtained,
    totalMax: TOTAL_MAX,
    passed,
    failedSubjects,
    aggregatePassed,
    aggregatePassMark,
    division,
    passMark,
    level: scheme.id,
    levelLabel: scheme.label,
  };
}
