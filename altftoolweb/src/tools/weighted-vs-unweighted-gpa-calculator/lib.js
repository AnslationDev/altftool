/**
 * Weighted vs unweighted high-school GPA.
 *
 * Unweighted GPA uses the standard US 4.0 letter scale:
 *   A/A+ = 4.0, A- = 3.7, B+ = 3.3, B = 3.0, B- = 2.7, C+ = 2.3, C = 2.0,
 *   C- = 1.7, D+ = 1.3, D = 1.0, D- = 0.7, F = 0.0.
 *
 * Weighted GPA follows the most common US high-school convention:
 *   Honors courses add +0.5 and AP/IB (college-level) courses add +1.0 to the
 *   grade points of a PASSING grade, capping the scale at 5.0. An F earns no
 *   bonus — schools do not reward failing a harder class.
 *
 * Both averages are credit-weighted: GPA = Σ(points × credits) / Σ credits.
 */

/** Standard US 4.0 letter → grade point mapping. */
export const GRADE_POINTS = {
  "A+": 4.0,
  A: 4.0,
  "A-": 3.7,
  "B+": 3.3,
  B: 3.0,
  "B-": 2.7,
  "C+": 2.3,
  C: 2.0,
  "C-": 1.7,
  "D+": 1.3,
  D: 1.0,
  "D-": 0.7,
  F: 0.0,
};

/** Rigor bonus per course type — common US high-school weighting convention. */
export const COURSE_TYPES = [
  { id: "regular", label: "Regular", bonus: 0 },
  { id: "honors", label: "Honors", bonus: 0.5 },
  { id: "ap-ib", label: "AP / IB / Dual enrollment", bonus: 1.0 },
];

export const GRADE_OPTIONS = Object.keys(GRADE_POINTS);

/** Maximum plausible credits for one course (guards typos like 100). */
export const MAX_CREDITS_PER_COURSE = 20;

const round2 = (value) => Math.round(value * 100) / 100;

/**
 * Compute credit-weighted unweighted and weighted GPAs.
 *
 * @param {object} input
 * @param {Array<{grade:string, credits:number, type:string}>} input.courses
 */
export function computeGpas({ courses }) {
  if (!Array.isArray(courses) || courses.length === 0) {
    return { error: "Add at least one course." };
  }

  let totalCredits = 0;
  let unweightedPoints = 0;
  let weightedPoints = 0;
  const perCourse = [];

  for (let i = 0; i < courses.length; i += 1) {
    const { grade, credits, type } = courses[i];
    const base = GRADE_POINTS[grade];
    if (base === undefined) {
      return { error: `Course ${i + 1}: choose a letter grade.` };
    }
    const courseType = COURSE_TYPES.find((t) => t.id === type);
    if (!courseType) {
      return { error: `Course ${i + 1}: choose a course type.` };
    }
    const cr = Number(credits);
    if (!Number.isFinite(cr) || cr <= 0) {
      return { error: `Course ${i + 1}: credits must be a positive number.` };
    }
    if (cr > MAX_CREDITS_PER_COURSE) {
      return { error: `Course ${i + 1}: credits above ${MAX_CREDITS_PER_COURSE} look like a typo.` };
    }

    // No rigor bonus on a failing grade.
    const weighted = base > 0 ? base + courseType.bonus : 0;

    totalCredits += cr;
    unweightedPoints += base * cr;
    weightedPoints += weighted * cr;
    perCourse.push({ index: i, base, weighted, credits: cr });
  }

  // totalCredits > 0 is guaranteed because every course passed the cr > 0 check.
  const unweightedGpa = round2(unweightedPoints / totalCredits);
  const weightedGpa = round2(weightedPoints / totalCredits);
  return {
    unweightedGpa,
    weightedGpa,
    // Derived from the already-rounded GPAs (not the raw fraction) so the displayed
    // boost always exactly equals weightedGpa - unweightedGpa.
    boost: round2(weightedGpa - unweightedGpa),
    totalCredits: round2(totalCredits),
    courseCount: courses.length,
    perCourse,
  };
}
