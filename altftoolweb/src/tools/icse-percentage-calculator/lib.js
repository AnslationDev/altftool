/**
 * ICSE / ISC percentage maths (CISCE — Council for the Indian School
 * Certificate Examinations).
 *
 * CISCE computes the headline percentage with English compulsory plus the best
 * of the remaining subjects:
 *
 *   ICSE (Class 10): average of English + best 4 other subjects  (5 subjects)
 *   ISC  (Class 12): average of English + best 3 other subjects  (4 subjects)
 *
 * Each subject is marked out of 100. Pass marks per subject (lowered by CISCE
 * with effect from the 2019 examinations):
 *
 *   ICSE: 33%      ISC: 35%
 *
 * Pure module: no clock reads, no DOM, no randomness.
 */

/** Per-board rules: how many non-English subjects count, and the pass mark. */
export const BOARD_RULES = {
  icse: {
    id: "icse",
    label: "ICSE (Class 10)",
    // CISCE: English + best 4 others make the ICSE aggregate.
    bestOthers: 4,
    // CISCE lowered the ICSE pass mark from 35% to 33% from the 2019 exams.
    passPercent: 33,
  },
  isc: {
    id: "isc",
    label: "ISC (Class 12)",
    // CISCE: English + best 3 others make the ISC aggregate.
    bestOthers: 3,
    // CISCE lowered the ISC pass mark from 40% to 35% from the 2019 exams.
    passPercent: 35,
  },
};

/** Every subject is marked out of 100. */
export const SUBJECT_MAX = 100;

/** Sanity ceiling on non-English subjects entered. */
export const MAX_OTHER_SUBJECTS = 10;

const round2 = (value) => Math.round(value * 100) / 100;

const toNumber = (value) => {
  if (value === "" || value === null || value === undefined) return NaN;
  const parsed = Number(String(value).trim());
  return Number.isFinite(parsed) ? parsed : NaN;
};

/**
 * Compute the ICSE or ISC percentage.
 *
 * @param {object} input
 * @param {"icse"|"isc"} input.board
 * @param {number|string} input.english English marks out of 100.
 * @param {Array<{name?: string, marks: number|string}>} input.others Non-English subjects.
 * @returns {object} { percent, counted, rows, ... } or { error }
 */
export function computeCiscePercentage({ board, english, others }) {
  const rules = BOARD_RULES[board];
  if (!rules) return { error: "Pick ICSE or ISC." };

  const englishMarks = toNumber(english);
  if (Number.isNaN(englishMarks)) return { error: "Enter your English marks out of 100." };
  if (englishMarks < 0) return { error: "English marks cannot be negative." };
  if (englishMarks > SUBJECT_MAX) return { error: `English marks cannot exceed ${SUBJECT_MAX}.` };

  if (!Array.isArray(others) || others.length === 0) {
    return { error: "Add your other subjects." };
  }
  if (others.length > MAX_OTHER_SUBJECTS) {
    return { error: `More than ${MAX_OTHER_SUBJECTS} other subjects is not supported.` };
  }
  if (others.length < rules.bestOthers) {
    return {
      error: `${rules.label} percentage needs English plus at least ${rules.bestOthers} other subjects — add ${rules.bestOthers - others.length} more.`,
    };
  }

  const rows = [];
  for (let i = 0; i < others.length; i += 1) {
    const entry = others[i] || {};
    const name = String(entry.name ?? "").trim() || `Subject ${i + 1}`;
    const marks = toNumber(entry.marks);
    if (Number.isNaN(marks)) return { error: `${name}: enter the marks out of ${SUBJECT_MAX}.` };
    if (marks < 0) return { error: `${name}: marks cannot be negative.` };
    if (marks > SUBJECT_MAX) return { error: `${name}: marks cannot exceed ${SUBJECT_MAX}.` };
    rows.push({
      index: i + 1,
      name,
      marks: round2(marks),
      passed: (marks / SUBJECT_MAX) * 100 >= rules.passPercent,
    });
  }

  // Best N non-English subjects by marks.
  const sorted = [...rows].sort((a, b) => b.marks - a.marks);
  const bestIndices = new Set(sorted.slice(0, rules.bestOthers).map((row) => row.index));

  const countedRows = rows.filter((row) => bestIndices.has(row.index));
  const countedTotal = englishMarks + countedRows.reduce((sum, row) => sum + row.marks, 0);
  const countedSubjects = 1 + countedRows.length;
  const percent = round2(countedTotal / countedSubjects);

  const englishPassed = (englishMarks / SUBJECT_MAX) * 100 >= rules.passPercent;
  const failedSubjects = [
    ...(englishPassed ? [] : ["English"]),
    ...rows.filter((row) => !row.passed).map((row) => row.name),
  ];

  return {
    board: rules.id,
    boardLabel: rules.label,
    percent,
    countedSubjects,
    countedTotal: round2(countedTotal),
    passPercent: rules.passPercent,
    english: round2(englishMarks),
    englishPassed,
    failedSubjects,
    allPassed: failedSubjects.length === 0,
    rows: rows.map((row) => ({ ...row, counted: bestIndices.has(row.index) })),
  };
}
