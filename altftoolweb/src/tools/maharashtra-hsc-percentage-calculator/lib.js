/**
 * Maharashtra HSC (Std XII) percentage rules — Maharashtra State Board of
 * Secondary and Higher Secondary Education (MSBSHSE), Pune.
 *
 * The HSC examination is taken in six subjects of 100 marks each (English is
 * compulsory), so the marksheet percentage is computed on a base of 600.
 * A candidate may offer one ADDITIONAL (seventh) subject; in that case the
 * board counts English plus the best-scoring five of the remaining subjects,
 * still on a base of 600.
 * Environment Education and Health & Physical Education carry letter grades
 * only and are never included in the percentage.
 */

/** Marks per subject on the MSBSHSE HSC marksheet. */
export const MAX_MARKS_PER_SUBJECT = 100;

/** Subjects counted towards the percentage (English + 5 others), base 600. */
export const COUNTED_SUBJECTS = 6;

/** MSBSHSE pass standard: minimum 35% (35 of 100) in every subject. */
export const PASS_MARK_PERCENT = 35;

/**
 * MSBSHSE result classes, applied to the aggregate percentage.
 * Distinction 75%+, First Class 60%+, Second Class 45%+, Pass Class 35%+.
 */
export const RESULT_CLASSES = [
  { minPercent: 75, label: "Distinction" },
  { minPercent: 60, label: "First Class" },
  { minPercent: 45, label: "Second Class" },
  { minPercent: 35, label: "Pass Class" },
];

/**
 * Compute the Maharashtra HSC percentage and result class.
 *
 * @param {object} input
 * @param {number} input.englishMarks  Marks in compulsory English (0-100).
 * @param {number[]} input.otherMarks  Marks in the other subjects (5 entries,
 *                                     or 6 when an additional subject is offered).
 * @returns {object} result, or { error } for invalid input.
 */
export function computeHscResult({ englishMarks, otherMarks }) {
  const english = Number(englishMarks);
  if (!Number.isFinite(english)) {
    return { error: "Enter your English marks as a number." };
  }
  if (english < 0 || english > MAX_MARKS_PER_SUBJECT) {
    return { error: `English marks must be between 0 and ${MAX_MARKS_PER_SUBJECT}.` };
  }

  if (!Array.isArray(otherMarks) || otherMarks.length < COUNTED_SUBJECTS - 1) {
    return { error: "Enter marks for at least five subjects besides English." };
  }
  if (otherMarks.length > COUNTED_SUBJECTS) {
    return { error: "At most one additional (seventh) subject can be offered." };
  }

  const others = [];
  for (let i = 0; i < otherMarks.length; i += 1) {
    const value = Number(otherMarks[i]);
    if (!Number.isFinite(value)) {
      return { error: `Enter subject ${i + 2} marks as a number.` };
    }
    if (value < 0 || value > MAX_MARKS_PER_SUBJECT) {
      return {
        error: `Subject ${i + 2} marks must be between 0 and ${MAX_MARKS_PER_SUBJECT}.`,
      };
    }
    others.push(value);
  }

  // Board rule with an additional subject: English + best five of the rest.
  const sorted = [...others].sort((a, b) => b - a);
  const counted = sorted.slice(0, COUNTED_SUBJECTS - 1);
  const droppedMarks = others.length === COUNTED_SUBJECTS ? sorted[COUNTED_SUBJECTS - 1] : null;

  const totalObtained = counted.reduce((sum, m) => sum + m, english);
  const totalMax = COUNTED_SUBJECTS * MAX_MARKS_PER_SUBJECT;
  const percentage = (totalObtained / totalMax) * 100;

  const passMark = (PASS_MARK_PERCENT / 100) * MAX_MARKS_PER_SUBJECT;
  // Pass check applies to every subject actually offered, including the additional one.
  const failedSubjects =
    (english < passMark ? 1 : 0) + others.filter((m) => m < passMark).length;
  const passed = failedSubjects === 0;

  let resultClass = "Fail";
  if (passed) {
    const band = RESULT_CLASSES.find((c) => percentage >= c.minPercent);
    resultClass = band ? band.label : "Fail";
  }

  return {
    percentage: Math.round(percentage * 100) / 100,
    totalObtained,
    totalMax,
    countedMarks: [english, ...counted],
    droppedMarks,
    passed,
    failedSubjects,
    resultClass,
    passMark,
  };
}
