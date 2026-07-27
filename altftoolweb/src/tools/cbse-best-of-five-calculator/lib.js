/**
 * CBSE Class 12 "best of five" percentage.
 *
 * CBSE itself does not print an aggregate percentage or a division on the Class
 * 12 marksheet — it declares subject-wise marks and grades only. The percentage
 * students quote is therefore a convention, and the convention almost every
 * admitting institution in India uses is the best of five:
 *
 *     percentage = (compulsory language + the four highest scoring
 *                   of the remaining subjects) ÷ 500 × 100
 *
 * Two rules make it what it is:
 *   1. THE LANGUAGE IS COMPULSORY IN THE AGGREGATE. English (or the language
 *      offered in its place) is counted whatever it scores; it cannot be dropped
 *      in favour of a higher-scoring elective.
 *   2. THE SIXTH SUBJECT IS A SPARE. A candidate who offered a sixth or an
 *      additional subject may use it to displace a weaker main subject, which is
 *      exactly why students take one. Only the best four of everything except
 *      the language survive.
 *
 * What counts as an eligible subject differs by institution. Delhi University,
 * for instance, publishes lists of subjects that do and do not count towards the
 * aggregate, and applies a deduction when a subject outside the list is used.
 * Every subject entered here is treated as eligible unless you mark it
 * otherwise, so check the prospectus of the course you are applying to.
 *
 * Pass criteria are separate from the percentage: CBSE requires 33% in each
 * subject, and where a subject has both a theory and a practical component, 33%
 * in each of them as well as in the total.
 */

/** Subjects counted in the best-of-five aggregate. */
export const BEST_OF_COUNT = 5;

/** CBSE minimum passing percentage in each subject. */
export const CBSE_PASS_PERCENT = 33;

/** Standard maximum marks for a CBSE Class 12 subject. */
export const DEFAULT_SUBJECT_MAX = 100;

/** CBSE permits at most five main subjects plus a sixth and an additional one. */
export const MAX_SUBJECTS = 8;

const EPSILON = 1e-9;

function round(value, places = 2) {
  const factor = 10 ** places;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/**
 * Best-of-five aggregate for a CBSE Class 12 marksheet.
 *
 * @param {object} input
 * @param {Array<{name?: string, marks: number, maxMarks?: number, isLanguage?: boolean, eligible?: boolean}>} input.subjects
 * @param {number} [input.targetPercent] a percentage you are aiming at
 * @returns {object} result, or { error } when the marks cannot be scored
 */
export function computeBestOfFive({ subjects, targetPercent = null } = {}) {
  if (!Array.isArray(subjects) || subjects.length < BEST_OF_COUNT) {
    return {
      error: `Enter at least ${BEST_OF_COUNT} subjects — the aggregate is built from five of them.`,
    };
  }
  if (subjects.length > MAX_SUBJECTS) {
    return { error: `A CBSE candidate does not offer more than ${MAX_SUBJECTS} subjects.` };
  }

  const rows = [];
  for (let i = 0; i < subjects.length; i += 1) {
    const entry = subjects[i];
    const position = i + 1;
    const marks = Number(entry?.marks);
    const maxMarks = Number(entry?.maxMarks ?? DEFAULT_SUBJECT_MAX);
    const name = String(entry?.name || `Subject ${position}`).trim() || `Subject ${position}`;

    if (!Number.isFinite(marks) || !Number.isFinite(maxMarks)) {
      return { error: `${name}: marks and maximum marks must both be numbers.` };
    }
    if (maxMarks <= 0 || maxMarks > 200) {
      return { error: `${name}: maximum marks must be above 0 and at most 200.` };
    }
    if (marks < 0) {
      return { error: `${name}: marks cannot be negative.` };
    }
    if (marks > maxMarks) {
      return { error: `${name}: ${marks} marks is more than the maximum of ${maxMarks}.` };
    }

    rows.push({
      index: i,
      name,
      marks,
      maxMarks,
      percent: round((marks / maxMarks) * 100, 2),
      isLanguage: Boolean(entry?.isLanguage),
      eligible: entry?.eligible !== false,
      passed: (marks / maxMarks) * 100 + EPSILON >= CBSE_PASS_PERCENT,
    });
  }

  const languages = rows.filter((row) => row.isLanguage);
  if (languages.length === 0) {
    return {
      error: "Mark one subject as the compulsory language. It is counted in the aggregate whatever it scores.",
    };
  }
  if (languages.length > 1) {
    return {
      error: "Mark only one subject as the compulsory language. A second language is counted as an ordinary elective.",
    };
  }

  const language = languages[0];
  const others = rows.filter((row) => row !== language);
  const eligibleOthers = others.filter((row) => row.eligible);

  if (eligibleOthers.length < BEST_OF_COUNT - 1) {
    return {
      error: `Only ${eligibleOthers.length} eligible subject${eligibleOthers.length === 1 ? "" : "s"} besides the language. Four are needed to complete the best of five.`,
    };
  }

  // Sort by percentage, then by raw marks, then by the order entered, so the
  // selection is deterministic when two subjects tie.
  const ranked = [...eligibleOthers].sort(
    (a, b) => b.percent - a.percent || b.marks - a.marks || a.index - b.index,
  );
  const chosenOthers = ranked.slice(0, BEST_OF_COUNT - 1);
  const chosenSet = new Set(chosenOthers.map((row) => row.index));

  const selected = [language, ...chosenOthers];
  const excluded = others.filter((row) => !chosenSet.has(row.index));

  const totalMarks = selected.reduce((sum, row) => sum + row.marks, 0);
  const totalMax = selected.reduce((sum, row) => sum + row.maxMarks, 0);
  const percentage = round((totalMarks / totalMax) * 100, 2);

  // All-subject aggregate, for comparison with the best-of-five figure.
  const allMarks = rows.reduce((sum, row) => sum + row.marks, 0);
  const allMax = rows.reduce((sum, row) => sum + row.maxMarks, 0);
  const allSubjectPercent = round((allMarks / allMax) * 100, 2);
  const bestOfFiveAdvantage = round(percentage - allSubjectPercent, 2);

  // The subject that just missed the cut, and what it would have needed.
  const firstReserve = ranked[BEST_OF_COUNT - 1] || null;
  const weakestChosen = chosenOthers[chosenOthers.length - 1] || null;
  const marksToDisplace =
    firstReserve && weakestChosen
      ? round(Math.max(0, weakestChosen.marks + 1 - firstReserve.marks), 2)
      : null;

  const failedSubjects = rows.filter((row) => !row.passed);

  // Target check.
  let target = null;
  if (targetPercent !== null && targetPercent !== "") {
    const wanted = Number(targetPercent);
    if (!Number.isFinite(wanted) || wanted < 0 || wanted > 100) {
      return { error: "The target percentage must be between 0 and 100." };
    }
    const marksNeeded = round((wanted / 100) * totalMax, 2);
    target = {
      percent: wanted,
      marksNeeded,
      shortfall: round(Math.max(0, marksNeeded - totalMarks), 2),
      met: totalMarks + EPSILON >= marksNeeded,
      averagePerSubject: round(marksNeeded / BEST_OF_COUNT, 2),
    };
  }

  let verdict;
  if (failedSubjects.length > 0) {
    verdict = `${failedSubjects.map((row) => row.name).join(", ")} ${failedSubjects.length === 1 ? "is" : "are"} below the ${CBSE_PASS_PERCENT}% pass mark. A percentage means little until the pass criteria in every subject are met — check the theory and practical components separately.`;
  } else if (excluded.length === 0) {
    verdict = `All ${rows.length} subjects went into the aggregate, so this is simply your total percentage. Offering a sixth subject is what makes best-of-five worth anything: it lets a weak paper drop out.`;
  } else {
    verdict = `Dropping ${excluded.map((row) => row.name).join(" and ")} lifts the aggregate by ${bestOfFiveAdvantage} points over counting every subject. ${language.name} is counted at ${language.marks} because the language cannot be dropped.`;
  }

  return {
    rows,
    language,
    selected,
    excluded,
    totalMarks: round(totalMarks, 2),
    totalMax: round(totalMax, 2),
    percentage,
    allSubjectPercent,
    allSubjectMarks: round(allMarks, 2),
    allSubjectMax: round(allMax, 2),
    bestOfFiveAdvantage,
    firstReserve,
    weakestChosen,
    marksToDisplace,
    failedSubjects,
    allPassed: failedSubjects.length === 0,
    subjectCount: rows.length,
    target,
    verdict,
  };
}
