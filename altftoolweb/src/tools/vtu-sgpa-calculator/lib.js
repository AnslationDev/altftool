/**
 * VTU (Visvesvaraya Technological University, Belagavi) SGPA from internal and
 * external marks.
 *
 * Under the VTU 2021/2022 B.E. scheme each course is assessed out of 100:
 * Continuous Internal Evaluation (CIE) for 50 marks, and the Semester End
 * Examination (SEE) conducted for 100 marks then reduced to 50. The combined
 * total decides an absolute letter grade on the UGC-style 10-point scale, and
 *
 *     SGPA = Σ (Ci × Gi) / Σ Ci
 *
 * where Ci is the course credit and Gi the grade point earned.
 *
 * Passing standard (VTU 2021/2022 scheme regulations):
 *   - CIE:   at least 40% of the CIE maximum (20 of 50) to be eligible for SEE
 *   - SEE:   at least 35% of the SEE maximum (35 of 100), independently
 *   - Total: at least 40% of CIE + SEE together (40 of 100)
 * A course that misses any of these carries grade F with 0 grade points, and
 * its credits stay in the SGPA denominator.
 *
 * Pure module: no clock reads, no DOM, no randomness.
 */

/** CIE is conducted for 50 marks under the 2021/2022 VTU scheme. */
export const CIE_MAX = 50;

/** SEE question paper is set for 100 marks... */
export const SEE_MAX = 100;

/** ...and reduced to 50 before being added to CIE. */
export const SEE_SCALED_MAX = 50;

/** Minimum CIE percentage to be eligible for SEE — 40% (20 of 50). */
export const CIE_MIN_PERCENT = 40;

/** Minimum SEE percentage considered independently — 35% (35 of 100). */
export const SEE_MIN_PERCENT = 35;

/** Minimum of CIE + scaled SEE together — 40% (40 of 100). */
export const TOTAL_MIN_PERCENT = 40;

/**
 * Absolute grading bands on the combined total out of 100
 * (VTU 2021/2022 scheme, UGC-style letters).
 */
export const GRADE_BANDS = [
  { code: "O", point: 10, min: 90, label: "Outstanding" },
  { code: "A+", point: 9, min: 80, label: "Excellent" },
  { code: "A", point: 8, min: 70, label: "Very good" },
  { code: "B+", point: 7, min: 60, label: "Good" },
  { code: "B", point: 6, min: 55, label: "Above average" },
  { code: "C", point: 5, min: 50, label: "Average" },
  { code: "P", point: 4, min: 40, label: "Pass" },
  { code: "F", point: 0, min: 0, label: "Fail" },
];

/** Sanity ceiling on subjects in one semester. */
export const MAX_SUBJECTS = 15;

/** Sanity ceiling on credits for a single course. */
export const MAX_CREDITS_PER_COURSE = 30;

const round2 = (value) => Math.round(value * 100) / 100;

const toNumber = (value) => {
  if (value === "" || value === null || value === undefined) return NaN;
  const parsed = Number(String(value).trim());
  return Number.isFinite(parsed) ? parsed : NaN;
};

/**
 * Scale SEE marks (out of 100) to their 50-mark contribution.
 * Half marks are rounded up, the convention VTU result sheets follow.
 */
export function scaleSee(seeMarks) {
  return Math.round((seeMarks / SEE_MAX) * SEE_SCALED_MAX);
}

/** Letter grade for a combined total out of 100 (assumes the course was passed). */
export function gradeForTotal(total) {
  return GRADE_BANDS.find((band) => total >= band.min) || GRADE_BANDS[GRADE_BANDS.length - 1];
}

/**
 * Analyse one VTU course.
 *
 * @param {object} input
 * @param {string} [input.name]
 * @param {number|string} input.cie CIE marks out of 50.
 * @param {number|string} input.see SEE marks out of 100 (before scaling).
 * @param {number|string} input.credits Course credits.
 * @returns {object} per-course result, or { error }
 */
export function analyseCourse({ name = "Course", cie, see, credits }) {
  const cieMarks = toNumber(cie);
  const seeMarks = toNumber(see);
  const credit = toNumber(credits);

  if (Number.isNaN(cieMarks)) return { error: `${name}: enter the CIE (internal) marks out of ${CIE_MAX}.` };
  if (Number.isNaN(seeMarks)) return { error: `${name}: enter the SEE (external) marks out of ${SEE_MAX}.` };
  if (Number.isNaN(credit)) return { error: `${name}: enter the course credits.` };
  if (cieMarks < 0 || seeMarks < 0) return { error: `${name}: marks cannot be negative.` };
  if (cieMarks > CIE_MAX) return { error: `${name}: CIE marks cannot exceed ${CIE_MAX}.` };
  if (seeMarks > SEE_MAX) return { error: `${name}: SEE marks cannot exceed ${SEE_MAX}.` };
  if (credit <= 0) return { error: `${name}: credits must be more than zero.` };
  if (credit > MAX_CREDITS_PER_COURSE) {
    return { error: `${name}: ${credit} credits is beyond the ${MAX_CREDITS_PER_COURSE}-credit limit.` };
  }

  const scaledSee = scaleSee(seeMarks);
  const total = cieMarks + scaledSee;

  const failReasons = [];
  if ((cieMarks / CIE_MAX) * 100 < CIE_MIN_PERCENT) {
    failReasons.push(`CIE below ${CIE_MIN_PERCENT}% (${(CIE_MIN_PERCENT / 100) * CIE_MAX} of ${CIE_MAX})`);
  }
  if ((seeMarks / SEE_MAX) * 100 < SEE_MIN_PERCENT) {
    failReasons.push(`SEE below ${SEE_MIN_PERCENT}% (${(SEE_MIN_PERCENT / 100) * SEE_MAX} of ${SEE_MAX})`);
  }
  if (total < TOTAL_MIN_PERCENT) {
    failReasons.push(`total below ${TOTAL_MIN_PERCENT} of 100`);
  }

  const passed = failReasons.length === 0;
  const grade = passed ? gradeForTotal(total) : GRADE_BANDS[GRADE_BANDS.length - 1];

  return {
    name,
    cie: round2(cieMarks),
    see: round2(seeMarks),
    scaledSee,
    total: round2(total),
    credits: round2(credit),
    passed,
    failReasons,
    grade: grade.code,
    point: grade.point,
    creditPoints: round2(grade.point * credit),
  };
}

/**
 * Compute the VTU SGPA for a semester.
 *
 * @param {object} input
 * @param {Array<{name?: string, cie: number|string, see: number|string, credits: number|string}>} input.subjects
 * @returns {object} { sgpa, rows, ... } or { error }
 */
export function computeVtuSgpa({ subjects }) {
  if (!Array.isArray(subjects) || subjects.length === 0) {
    return { error: "Add at least one course with its marks and credits." };
  }
  if (subjects.length > MAX_SUBJECTS) {
    return { error: `A semester is capped at ${MAX_SUBJECTS} courses here.` };
  }

  const rows = [];
  let creditPoints = 0;
  let totalCredits = 0;
  let failedCourses = 0;

  for (let i = 0; i < subjects.length; i += 1) {
    const row = analyseCourse({
      name: String(subjects[i]?.name ?? "").trim() || `Course ${i + 1}`,
      cie: subjects[i]?.cie,
      see: subjects[i]?.see,
      credits: subjects[i]?.credits,
    });
    if (row.error) return { error: row.error };
    rows.push({ ...row, index: i + 1 });
    creditPoints += row.point * row.credits;
    totalCredits += row.credits;
    if (!row.passed) failedCourses += 1;
  }

  if (totalCredits <= 0) return { error: "Total credits must be more than zero." };

  return {
    sgpa: round2(creditPoints / totalCredits),
    totalCredits: round2(totalCredits),
    creditPoints: round2(creditPoints),
    failedCourses,
    hasFailure: failedCourses > 0,
    courses: rows.length,
    rows,
  };
}
