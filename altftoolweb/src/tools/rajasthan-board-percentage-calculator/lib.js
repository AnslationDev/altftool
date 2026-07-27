/**
 * RBSE (Board of Secondary Education, Rajasthan — BSER Ajmer) percentage,
 * division and pass maths.
 *
 * RBSE marks every subject out of 100 and reports a plain aggregate:
 *
 *   Percentage = (total marks obtained ÷ total maximum marks) × 100
 *
 * Class 10 (Secondary) is normally six subjects, so the grand total is 600.
 * Class 12 (Senior Secondary) is normally five subjects — one compulsory
 * language plus four optional subjects — so the grand total is 500. No subject
 * is dropped from the RBSE total; all of them count.
 *
 * PASS RULE
 * A candidate needs 33% in every subject. 33 marks out of 100 is therefore the
 * subject minimum, and one subject below it means the candidate is not passed
 * however high the aggregate is. Subjects that carry a practical component are
 * marked as theory plus practical; where a circular requires the theory part to
 * clear 33% on its own, that check is separate from the subject total, so this
 * module reports both the subject total and, when a split is supplied, the
 * theory percentage.
 *
 * DIVISION RULE
 * RBSE classifies the aggregate as First division from 60%, Second division
 * from 48%, Third division from 36%, and simply "pass" between 33% and 36%.
 * Below 33% the candidate is not passed.
 */

/** Minimum percentage required in a subject and in the aggregate. */
export const RBSE_PASS_PERCENT = 33;

/** No RBSE subject paper is marked out of more than this. */
export const MAX_SUBJECT_MAX = 200;

/** Standard structures. */
export const RBSE_CLASSES = [
  {
    value: "class10",
    label: "Class 10 (Secondary)",
    subjectCount: 6,
    grandTotal: 600,
    note: "Six subjects of 100 marks each. All of them count towards the 600-mark total.",
  },
  {
    value: "class12",
    label: "Class 12 (Senior Secondary)",
    subjectCount: 5,
    grandTotal: 500,
    note: "One compulsory language plus four optional subjects, 100 marks each, out of 500.",
  },
];

/** RBSE division bands on the aggregate, highest first. */
export const RBSE_DIVISIONS = [
  { min: 60, name: "First division", note: "60% and above" },
  { min: 48, name: "Second division", note: "48% to 59.99%" },
  { min: 36, name: "Third division", note: "36% to 47.99%" },
  { min: RBSE_PASS_PERCENT, name: "Pass", note: "33% to 35.99%" },
  { min: 0, name: "Not passed", note: "Below 33%" },
];

function round(value, places = 2) {
  const factor = 10 ** places;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/**
 * Division band for an aggregate percentage.
 * @param {number} percentage
 * @returns {object} band record
 */
export function divisionForPercentage(percentage) {
  if (!Number.isFinite(percentage)) return RBSE_DIVISIONS[RBSE_DIVISIONS.length - 1];
  return (
    RBSE_DIVISIONS.find((band) => percentage >= band.min) ||
    RBSE_DIVISIONS[RBSE_DIVISIONS.length - 1]
  );
}

/**
 * Percentage, division and pass status for an RBSE marksheet.
 *
 * @param {object} input
 * @param {string} [input.level="class12"] "class10" or "class12"
 * @param {Array<{name?: string, marks: number|string, max: number|string, theoryMarks?: number|string, theoryMax?: number|string}>} input.subjects
 * @returns {object} result, or { error } when the marksheet cannot be scored
 */
export function computeRbseResult({ level = "class12", subjects }) {
  const levelRecord = RBSE_CLASSES.find((item) => item.value === level);
  if (!levelRecord) {
    return { error: "Choose either class 10 or class 12." };
  }
  if (!Array.isArray(subjects) || subjects.length === 0) {
    return { error: "Add at least one subject with its marks." };
  }

  let totalObtained = 0;
  let totalMax = 0;
  const rows = [];
  const failedSubjects = [];

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
    if (max > MAX_SUBJECT_MAX) {
      return {
        error: `${label} has a maximum of ${max}. RBSE papers do not exceed ${MAX_SUBJECT_MAX} marks.`,
      };
    }
    if (marks < 0) {
      return { error: `${label} cannot have negative marks.` };
    }
    if (marks > max) {
      return { error: `${label} shows ${marks} out of ${max}, which is above the maximum.` };
    }

    const subjectPercent = (marks / max) * 100;
    const passed = subjectPercent >= RBSE_PASS_PERCENT;
    if (!passed) failedSubjects.push(label);

    totalObtained += marks;
    totalMax += max;

    rows.push({
      name: label,
      marks,
      max,
      percent: round(subjectPercent, 2),
      passed,
      shortfall: passed ? 0 : round((RBSE_PASS_PERCENT / 100) * max - marks, 2),
    });
  }

  if (totalMax <= 0) {
    return { error: "The total maximum came to zero, so a percentage cannot be formed." };
  }

  const percentage = (totalObtained / totalMax) * 100;
  const rounded = round(percentage, 2);
  const aggregatePassed = percentage >= RBSE_PASS_PERCENT;
  const band = divisionForPercentage(rounded);
  const passed = aggregatePassed && failedSubjects.length === 0;

  return {
    level: levelRecord.value,
    levelLabel: levelRecord.label,
    totalObtained: round(totalObtained, 2),
    totalMax: round(totalMax, 2),
    expectedTotal: levelRecord.grandTotal,
    percentage: rounded,
    division: passed ? band.name : "Not passed",
    bandOnAggregate: band.name,
    divisionNote: band.note,
    passed,
    aggregatePassed,
    failedSubjects,
    failedCount: failedSubjects.length,
    subjectCount: rows.length,
    averagePerSubject: round(totalObtained / rows.length, 2),
    marksToPassAggregate: aggregatePassed
      ? 0
      : round((RBSE_PASS_PERCENT / 100) * totalMax - totalObtained, 2),
    rows,
  };
}

/**
 * Marks still needed to move up to the next division band.
 *
 * @param {object} input
 * @param {number|string} input.totalObtained
 * @param {number|string} input.totalMax
 * @returns {object} { nextDivision, needed } or { error }, and
 *          { atTop: true } when the aggregate is already in First division
 */
export function marksForNextDivision({ totalObtained, totalMax }) {
  const obtained = Number(totalObtained);
  const max = Number(totalMax);
  if (!Number.isFinite(obtained) || !Number.isFinite(max)) {
    return { error: "Marks obtained and total maximum must both be numbers." };
  }
  if (max <= 0) return { error: "The total maximum must be greater than zero." };
  if (obtained < 0 || obtained > max) {
    return { error: "Marks obtained must sit between zero and the total maximum." };
  }

  const percentage = (obtained / max) * 100;
  // Bands above the current one, lowest first, excluding the terminal "Not passed" band.
  const higher = RBSE_DIVISIONS.filter((band) => band.min > percentage && band.name !== "Not passed")
    .slice()
    .sort((a, b) => a.min - b.min);

  if (higher.length === 0) {
    return { atTop: true, percentage: round(percentage, 2), nextDivision: null, needed: 0 };
  }

  const next = higher[0];
  const requiredTotal = (next.min / 100) * max;
  return {
    atTop: false,
    percentage: round(percentage, 2),
    nextDivision: next.name,
    nextDivisionAt: next.min,
    requiredTotal: round(requiredTotal, 2),
    needed: round(requiredTotal - obtained, 2),
  };
}
