/**
 * West Bengal board percentage maths — WBBSE Madhyamik (class 10) and
 * WBCHSE Higher Secondary (class 12).
 *
 * MADHYAMIK (WBBSE)
 * Seven subjects of 100 marks each — First Language, Second Language,
 * Mathematics, Physical Science, Life Science, History and Geography — make a
 * grand total of 700. Every subject counts, so:
 *
 *   Percentage = (total of all subjects ÷ 700) × 100
 *
 * WBBSE reports a letter grade per subject on published mark bands, with
 * grade D (below 25) being the fail band. 25 marks is therefore the subject
 * pass mark.
 *
 * HIGHER SECONDARY (WBCHSE)
 * The HS marksheet total is built on five subjects out of 500, not on every
 * paper written. The two compulsory language papers always count; among the
 * elective subjects only the best three count, which is why a candidate takes
 * a fourth "optional elective" as insurance:
 *
 *   Total = both languages + best three electives, out of 500
 *
 * The HS subject pass requirement is 30% of the subject, applied to the
 * theory and practical components as the council's regulation specifies.
 *
 * This module keeps both boards' rules explicit and never assumes a maximum:
 * each subject carries its own maximum so semester-system marksheets and
 * part-marks papers both work.
 */

/** Madhyamik: pass mark out of 100 in a subject (grade D is below this). */
export const MADHYAMIK_PASS_MARK = 25;

/** Madhyamik: seven subjects of 100 marks. */
export const MADHYAMIK_SUBJECT_COUNT = 7;
export const MADHYAMIK_GRAND_TOTAL = 700;

/** Higher Secondary: subject pass requirement, as a percentage of the subject. */
export const HS_PASS_PERCENT = 30;

/** Higher Secondary: number of subjects that make up the 500-mark total. */
export const HS_COUNTED_SUBJECTS = 5;
export const HS_GRAND_TOTAL = 500;

/** No West Bengal board subject paper is marked out of more than this. */
export const MAX_SUBJECT_MAX = 200;

/** WBBSE Madhyamik letter grades, highest band first. */
export const MADHYAMIK_GRADES = [
  { code: "AA", min: 90, max: 100, label: "Outstanding" },
  { code: "A+", min: 80, max: 89, label: "Excellent" },
  { code: "A", min: 60, max: 79, label: "Very good" },
  { code: "B+", min: 45, max: 59, label: "Good" },
  { code: "B", min: 35, max: 44, label: "Above average" },
  { code: "C", min: 25, max: 34, label: "Pass" },
  { code: "D", min: 0, max: 24, label: "Fail" },
];

/** Division bands used on aggregate percentages for both boards. */
export const DIVISION_BANDS = [
  { min: 80, name: "Distinction", note: "80% and above" },
  { min: 60, name: "First division", note: "60% to 79.99%" },
  { min: 45, name: "Second division", note: "45% to 59.99%" },
  { min: 30, name: "Third division", note: "30% to 44.99%" },
];

/** The two supported examinations. */
export const WB_EXAMS = [
  {
    value: "madhyamik",
    label: "Madhyamik (WBBSE, class 10)",
    grandTotal: MADHYAMIK_GRAND_TOTAL,
    countsAllSubjects: true,
    passPercent: MADHYAMIK_PASS_MARK,
    note: "All seven subjects count towards the 700-mark total. A subject below 25 is grade D and is not cleared.",
  },
  {
    value: "hs",
    label: "Higher Secondary (WBCHSE, class 12)",
    grandTotal: HS_GRAND_TOTAL,
    countsAllSubjects: false,
    passPercent: HS_PASS_PERCENT,
    note: "Both languages count, plus the best three electives — five subjects out of 500. The weakest elective is dropped.",
  },
];

function round(value, places = 2) {
  const factor = 10 ** places;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/**
 * Madhyamik letter grade for a subject mark.
 * @param {number|string} marks
 * @param {number|string} [max=100] the subject maximum, used to normalise
 * @returns {object|null} grade record, or null for unusable input
 */
export function madhyamikGrade(marks, max = 100) {
  const value = Number(marks);
  const ceiling = Number(max);
  if (!Number.isFinite(value) || !Number.isFinite(ceiling) || ceiling <= 0) return null;
  if (value < 0 || value > ceiling) return null;
  const outOfHundred = (value / ceiling) * 100;
  return MADHYAMIK_GRADES.find((grade) => outOfHundred >= grade.min) || MADHYAMIK_GRADES[6];
}

/**
 * Division band for an aggregate percentage.
 * @param {number} percentage
 * @returns {object} band record; a below-30 aggregate returns the fail band
 */
export function divisionForPercentage(percentage) {
  if (!Number.isFinite(percentage)) {
    return { min: 0, name: "Not classified", note: "Below 30%" };
  }
  return (
    DIVISION_BANDS.find((band) => percentage >= band.min) || {
      min: 0,
      name: "Not classified",
      note: "Below 30%",
    }
  );
}

/**
 * Validate and normalise one subject row.
 * @returns {object} { ok: true, row } or { ok: false, error }
 */
function readSubject(subject, position) {
  const label = subject?.name?.trim() || `Subject ${position}`;
  if (subject?.marks === "" || subject?.marks === null || subject?.marks === undefined) {
    return { ok: false, error: `Enter the marks scored in ${label}.` };
  }
  const marks = Number(subject.marks);
  const max = Number(subject?.max);
  if (!Number.isFinite(marks) || !Number.isFinite(max)) {
    return { ok: false, error: `${label} needs a numeric mark and a numeric maximum.` };
  }
  if (max <= 0) {
    return { ok: false, error: `${label} has a maximum of ${max}. It must be greater than zero.` };
  }
  if (max > MAX_SUBJECT_MAX) {
    return {
      ok: false,
      error: `${label} has a maximum of ${max}. West Bengal board papers do not exceed ${MAX_SUBJECT_MAX} marks.`,
    };
  }
  if (marks < 0) {
    return { ok: false, error: `${label} cannot have negative marks.` };
  }
  if (marks > max) {
    return { ok: false, error: `${label} shows ${marks} out of ${max}, which is above the maximum.` };
  }
  return {
    ok: true,
    row: {
      name: label,
      marks,
      max,
      percent: (marks / max) * 100,
      compulsory: Boolean(subject?.compulsory),
    },
  };
}

/**
 * Percentage, division and pass status for a West Bengal board marksheet.
 *
 * @param {object} input
 * @param {string} input.exam "madhyamik" or "hs"
 * @param {Array<{name?: string, marks: number|string, max: number|string, compulsory?: boolean}>} input.subjects
 * @returns {object} result, or { error } when the marksheet cannot be scored
 */
export function computeWbResult({ exam = "madhyamik", subjects }) {
  const examRecord = WB_EXAMS.find((item) => item.value === exam);
  if (!examRecord) {
    return { error: "Choose either Madhyamik or Higher Secondary." };
  }
  if (!Array.isArray(subjects) || subjects.length === 0) {
    return { error: "Add at least one subject with its marks." };
  }

  const parsed = [];
  for (let i = 0; i < subjects.length; i += 1) {
    const read = readSubject(subjects[i], i + 1);
    if (!read.ok) return { error: read.error };
    parsed.push(read.row);
  }

  // Decide which subjects enter the total.
  let counted;
  let dropped = [];
  if (examRecord.countsAllSubjects) {
    counted = parsed;
  } else {
    const compulsory = parsed.filter((row) => row.compulsory);
    const electives = parsed
      .filter((row) => !row.compulsory)
      .sort((a, b) => b.marks - a.marks || b.percent - a.percent);
    const slots = Math.max(0, HS_COUNTED_SUBJECTS - compulsory.length);
    const keptElectives = electives.slice(0, slots);
    dropped = electives.slice(slots);
    counted = [...compulsory, ...keptElectives];
  }

  if (counted.length === 0) {
    return { error: "No subject was left to count. Mark the language papers as compulsory." };
  }

  const totalObtained = counted.reduce((sum, row) => sum + row.marks, 0);
  const totalMax = counted.reduce((sum, row) => sum + row.max, 0);
  if (totalMax <= 0) {
    return { error: "The counted subjects add up to a maximum of zero, so no percentage exists." };
  }

  const percentage = (totalObtained / totalMax) * 100;
  const failed = parsed.filter((row) => row.percent < examRecord.passPercent);
  const division = divisionForPercentage(round(percentage, 2));

  const rows = parsed.map((row) => {
    const isCounted = counted.includes(row);
    return {
      name: row.name,
      marks: row.marks,
      max: row.max,
      percent: round(row.percent, 2),
      counted: isCounted,
      compulsory: row.compulsory,
      grade: exam === "madhyamik" ? madhyamikGrade(row.marks, row.max) : null,
      passed: row.percent >= examRecord.passPercent,
      shortfall:
        row.percent >= examRecord.passPercent
          ? 0
          : round((examRecord.passPercent / 100) * row.max - row.marks, 2),
    };
  });

  return {
    exam: examRecord.value,
    examLabel: examRecord.label,
    totalObtained: round(totalObtained, 2),
    totalMax: round(totalMax, 2),
    percentage: round(percentage, 2),
    countedSubjects: counted.length,
    droppedSubjects: dropped.map((row) => row.name),
    division: failed.length === 0 ? division.name : "Not classified — a subject is below the pass mark",
    divisionOnAggregate: division.name,
    divisionNote: division.note,
    passed: failed.length === 0 && percentage >= examRecord.passPercent,
    failedSubjects: failed.map((row) => row.name),
    failedCount: failed.length,
    passPercent: examRecord.passPercent,
    averagePerSubject: round(totalObtained / counted.length, 2),
    rows,
  };
}
