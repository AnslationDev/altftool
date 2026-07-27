/**
 * Karnataka II PUC (Pre-University, class 12) percentage and division maths.
 *
 * The Karnataka School Examination and Assessment Board (KSEAB, formerly the
 * Department of Pre-University Education) marks II PUC on six subjects of 100
 * marks each — two languages and four optional subjects — giving a grand total
 * of 600. The result percentage is the plain aggregate:
 *
 *   Percentage = (total marks obtained ÷ total maximum marks) × 100
 *
 * Two separate conditions decide a PASS:
 *   1. at least 35% in every individual subject, and
 *   2. at least 35% in the aggregate.
 * Failing even one subject means the candidate is referred for that subject
 * however high the aggregate is, which is why a subject-by-subject check
 * matters more than the headline percentage.
 *
 * The class awarded on the aggregate follows the board's published bands:
 *   Distinction 85% and above, First class 60–84.99%, Second class 50–59.99%,
 *   Pass class 35–49.99%, below 35% is a fail.
 *
 * Science and computer subjects are marked out of 100 split as theory plus
 * practical (commonly 70 + 30); the split does not change the percentage, so
 * this module works on the subject total and lets you set any maximum.
 */

/** Minimum percentage required in each subject and in the aggregate. */
export const PUC_PASS_PERCENT = 35;

/** Standard II PUC structure: 2 languages + 4 optionals, 100 marks each. */
export const PUC_SUBJECT_COUNT = 6;
export const PUC_DEFAULT_SUBJECT_MAX = 100;
export const PUC_DEFAULT_GRAND_TOTAL = PUC_SUBJECT_COUNT * PUC_DEFAULT_SUBJECT_MAX;

/** No PUC subject is marked out of more than this; anything higher is a typo. */
export const PUC_MAX_SUBJECT_MAX = 200;

/** Aggregate bands published by the board, highest first. */
export const PUC_DIVISIONS = [
  { min: 85, name: "Distinction", note: "85% and above" },
  { min: 60, name: "First class", note: "60% to 84.99%" },
  { min: 50, name: "Second class", note: "50% to 59.99%" },
  { min: PUC_PASS_PERCENT, name: "Pass class", note: "35% to 49.99%" },
  { min: 0, name: "Fail", note: "Below 35%" },
];

function round(value, places = 2) {
  const factor = 10 ** places;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/**
 * The division band a given aggregate percentage falls in.
 * @param {number} percentage
 * @returns {object} division record; the Fail band for anything below 35
 */
export function divisionForPercentage(percentage) {
  if (!Number.isFinite(percentage)) return PUC_DIVISIONS[PUC_DIVISIONS.length - 1];
  const match = PUC_DIVISIONS.find((band) => percentage >= band.min);
  return match || PUC_DIVISIONS[PUC_DIVISIONS.length - 1];
}

/**
 * Aggregate percentage, division and pass status for a II PUC marksheet.
 *
 * @param {object} input
 * @param {Array<{name?: string, marks: number|string, max: number|string, optional?: boolean}>} input.subjects
 * @returns {object} full result, or { error } when the marksheet cannot be scored
 */
export function computePucResult({ subjects }) {
  if (!Array.isArray(subjects) || subjects.length === 0) {
    return { error: "Add at least one subject with its marks." };
  }

  let totalObtained = 0;
  let totalMax = 0;
  let optionalObtained = 0;
  let optionalMax = 0;
  const rows = [];
  const failedSubjects = [];

  for (let i = 0; i < subjects.length; i += 1) {
    const subject = subjects[i];
    const position = i + 1;
    const label = subject?.name?.trim() || `Subject ${position}`;
    const marks = Number(subject?.marks);
    const max = Number(subject?.max);

    if (subject?.marks === "" || subject?.marks === null || subject?.marks === undefined) {
      return { error: `Enter the marks scored in ${label}.` };
    }
    if (!Number.isFinite(marks) || !Number.isFinite(max)) {
      return { error: `${label} needs a numeric mark and a numeric maximum.` };
    }
    if (max <= 0) {
      return { error: `${label} has a maximum of ${max}. The maximum must be greater than zero.` };
    }
    if (max > PUC_MAX_SUBJECT_MAX) {
      return {
        error: `${label} has a maximum of ${max}. No PUC subject is marked out of more than ${PUC_MAX_SUBJECT_MAX}.`,
      };
    }
    if (marks < 0) {
      return { error: `${label} cannot have negative marks.` };
    }
    if (marks > max) {
      return { error: `${label} shows ${marks} out of ${max}, which is above the maximum.` };
    }

    const subjectPercent = (marks / max) * 100;
    const passed = subjectPercent >= PUC_PASS_PERCENT;
    if (!passed) failedSubjects.push(label);

    totalObtained += marks;
    totalMax += max;
    if (subject?.optional) {
      optionalObtained += marks;
      optionalMax += max;
    }

    rows.push({
      name: label,
      marks,
      max,
      percent: round(subjectPercent, 2),
      passed,
      shortfall: passed ? 0 : round((PUC_PASS_PERCENT / 100) * max - marks, 2),
      optional: Boolean(subject?.optional),
    });
  }

  if (totalMax <= 0) {
    return { error: "The total maximum marks came to zero, so a percentage cannot be formed." };
  }

  const percentage = (totalObtained / totalMax) * 100;
  const aggregatePassed = percentage >= PUC_PASS_PERCENT;
  const division = divisionForPercentage(round(percentage, 2));

  return {
    totalObtained: round(totalObtained, 2),
    totalMax: round(totalMax, 2),
    percentage: round(percentage, 2),
    division: aggregatePassed && failedSubjects.length === 0 ? division.name : "Fail",
    divisionNote: division.note,
    bandOnAggregate: division.name,
    passed: aggregatePassed && failedSubjects.length === 0,
    aggregatePassed,
    failedSubjects,
    failedCount: failedSubjects.length,
    subjectCount: rows.length,
    averagePerSubject: round(totalObtained / rows.length, 2),
    optionalPercentage: optionalMax > 0 ? round((optionalObtained / optionalMax) * 100, 2) : null,
    optionalObtained: round(optionalObtained, 2),
    optionalMax: round(optionalMax, 2),
    marksToPassAggregate: aggregatePassed
      ? 0
      : round((PUC_PASS_PERCENT / 100) * totalMax - totalObtained, 2),
    rows,
  };
}

/**
 * Extra marks needed on the aggregate to reach a target percentage.
 * @param {object} input
 * @param {number|string} input.totalObtained
 * @param {number|string} input.totalMax
 * @param {number|string} input.targetPercent
 * @returns {object} { needed, reachable } or { error }
 */
export function marksNeededForTarget({ totalObtained, totalMax, targetPercent }) {
  const obtained = Number(totalObtained);
  const max = Number(totalMax);
  const target = Number(targetPercent);

  if (!Number.isFinite(obtained) || !Number.isFinite(max) || !Number.isFinite(target)) {
    return { error: "Marks, maximum and target percentage must all be numbers." };
  }
  if (max <= 0) return { error: "The maximum marks must be greater than zero." };
  if (target < 0 || target > 100) return { error: "A target percentage must be between 0 and 100." };
  if (obtained < 0 || obtained > max) {
    return { error: "Marks obtained must sit between zero and the maximum." };
  }

  const requiredTotal = (target / 100) * max;
  const needed = requiredTotal - obtained;
  return {
    requiredTotal: round(requiredTotal, 2),
    needed: round(Math.max(0, needed), 2),
    alreadyReached: needed <= 0,
    reachable: requiredTotal <= max,
  };
}
