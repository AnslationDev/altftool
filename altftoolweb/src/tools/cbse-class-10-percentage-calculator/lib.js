/**
 * CBSE Class 10 percentage maths.
 *
 * A CBSE Class 10 marksheet carries five main subjects (two languages,
 * Mathematics, Science, Social Science), each out of 100 (80 board + 20
 * internal assessment for most subjects), with an optional sixth skill subject
 * and a seventh additional subject. CBSE itself declares only subject marks and
 * positional grades — it does not print a percentage — so the near-universal
 * convention (also used by CBSE for its own recruitment screening) is:
 *
 *     percentage = average of the best five subjects
 *
 * The pass standard is 33% in each subject (Examination Bye-laws), and if a
 * student fails one of Science, Mathematics or Social Science but passed the
 * skill subject, the skill subject replaces the failed one in the result
 * computation — which best-of-five handles naturally.
 *
 * Subject letter grades A1–E on the marksheet are POSITIONAL (rank based, in
 * roughly equal eighths of passed candidates), so a mark-to-grade mapping is
 * only indicative; the bands below are the conventional ones shown for
 * orientation, not a CBSE guarantee.
 *
 * Pure module: no clock reads, no DOM, no randomness.
 */

/** Best-of-N convention for the headline CBSE percentage. */
export const BEST_OF_COUNT = 5;

/** CBSE Examination Bye-laws pass standard per subject. */
export const PASS_PERCENT = 33;

/** Default maximum marks per subject on the Class 10 marksheet. */
export const DEFAULT_MAX_MARKS = 100;

/** Sanity ceiling on subjects entered. */
export const MAX_SUBJECTS = 10;

/**
 * Indicative mark bands for the A1–E letters. CBSE assigns these positionally
 * (by rank), so this table is orientation only.
 */
export const INDICATIVE_GRADE_BANDS = [
  { grade: "A1", min: 91 },
  { grade: "A2", min: 81 },
  { grade: "B1", min: 71 },
  { grade: "B2", min: 61 },
  { grade: "C1", min: 51 },
  { grade: "C2", min: 41 },
  { grade: "D", min: PASS_PERCENT },
  { grade: "E (fail)", min: 0 },
];

const round2 = (value) => Math.round(value * 100) / 100;

const toNumber = (value) => {
  if (value === "" || value === null || value === undefined) return NaN;
  const parsed = Number(String(value).trim());
  return Number.isFinite(parsed) ? parsed : NaN;
};

/** Indicative letter for a subject percentage (orientation only). */
export function indicativeGrade(percent) {
  const band = INDICATIVE_GRADE_BANDS.find((row) => percent >= row.min);
  return band ? band.grade : "E (fail)";
}

/**
 * Compute the CBSE Class 10 percentage.
 *
 * @param {object} input
 * @param {Array<{name?: string, marks: number|string, max?: number|string}>} input.subjects
 * @returns {object} { bestOfFivePercent, overallPercent, rows, ... } or { error }
 */
export function computeCbsePercentage({ subjects }) {
  if (!Array.isArray(subjects) || subjects.length === 0) {
    return { error: "Add at least one subject with its marks." };
  }
  if (subjects.length > MAX_SUBJECTS) {
    return { error: `More than ${MAX_SUBJECTS} subjects is not supported.` };
  }

  const rows = [];
  let totalMarks = 0;
  let totalMax = 0;

  for (let i = 0; i < subjects.length; i += 1) {
    const entry = subjects[i] || {};
    const name = String(entry.name ?? "").trim() || `Subject ${i + 1}`;
    const marks = toNumber(entry.marks);
    const max =
      entry.max === "" || entry.max === null || entry.max === undefined
        ? DEFAULT_MAX_MARKS
        : toNumber(entry.max);

    if (Number.isNaN(marks)) return { error: `${name}: enter the marks obtained.` };
    if (Number.isNaN(max)) return { error: `${name}: enter the maximum marks.` };
    if (max <= 0) return { error: `${name}: maximum marks must be more than zero.` };
    if (marks < 0) return { error: `${name}: marks cannot be negative.` };
    if (marks > max) return { error: `${name}: marks (${marks}) exceed the maximum (${max}).` };

    const percent = round2((marks / max) * 100);
    rows.push({
      index: i + 1,
      name,
      marks: round2(marks),
      max: round2(max),
      percent,
      passed: percent >= PASS_PERCENT,
      indicativeGrade: indicativeGrade(percent),
    });
    totalMarks += marks;
    totalMax += max;
  }

  // Best five by subject percentage (handles unequal maximum marks fairly).
  const sorted = [...rows].sort((a, b) => b.percent - a.percent);
  const bestRows = sorted.slice(0, Math.min(BEST_OF_COUNT, sorted.length));
  const bestIndices = new Set(bestRows.map((row) => row.index));
  const bestPercent = round2(
    bestRows.reduce((sum, row) => sum + row.percent, 0) / bestRows.length,
  );

  const failedSubjects = rows.filter((row) => !row.passed).map((row) => row.name);

  return {
    bestOfFivePercent: bestPercent,
    bestCount: bestRows.length,
    usedBestOf: rows.length > BEST_OF_COUNT,
    overallPercent: round2((totalMarks / totalMax) * 100),
    totalMarks: round2(totalMarks),
    totalMax: round2(totalMax),
    failedSubjects,
    allPassed: failedSubjects.length === 0,
    rows: rows.map((row) => ({ ...row, inBestFive: bestIndices.has(row.index) })),
  };
}
