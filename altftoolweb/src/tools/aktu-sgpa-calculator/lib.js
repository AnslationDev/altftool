/**
 * AKTU (Dr. A.P.J. Abdul Kalam Technical University, Lucknow) SGPA / CGPA maths.
 *
 * AKTU follows the UGC choice-based credit system on a 10-point absolute scale.
 * Every course carries a credit weight and every letter grade carries a grade
 * point; the semester result is the credit-weighted mean of those points:
 *
 *   SGPA = Σ (credit_i × gradePoint_i) / Σ credit_i
 *   CGPA = Σ (SGPA_s × semesterCredits_s) / Σ semesterCredits_s
 *
 * AKTU's own equivalence circular converts the final CGPA to a percentage as
 *   Percentage = (CGPA − 0.75) × 10
 * which is why a 7.5 CGPA is quoted as 67.5% on AKTU transcripts.
 *
 * A grade point of 0 (F / carry-over) means the credits of that course are NOT
 * earned, so the course still sits in the SGPA denominator but adds nothing to
 * the numerator and adds one backlog.
 *
 * The mark bands below are the bands AKTU publishes for its absolute grading
 * scheme; individual affiliated colleges occasionally print slightly different
 * boundaries, so they are shown as guidance while the grade POINTS (10, 9, 8,
 * 7, 6, 5, 4, 0) are the values that actually drive the arithmetic.
 */

/** AKTU 10-point absolute grading scale. */
export const AKTU_GRADES = [
  { code: "A++", points: 10, band: "90 – 100", label: "Outstanding" },
  { code: "A+", points: 9, band: "80 – 89", label: "Excellent" },
  { code: "A", points: 8, band: "70 – 79", label: "Very good" },
  { code: "B+", points: 7, band: "60 – 69", label: "Good" },
  { code: "B", points: 6, band: "50 – 59", label: "Above average" },
  { code: "C", points: 5, band: "45 – 49", label: "Average" },
  { code: "D", points: 4, band: "40 – 44", label: "Pass" },
  { code: "F", points: 0, band: "Below 40", label: "Fail / carry over" },
];

/** AKTU's published CGPA → percentage offset. */
export const AKTU_PERCENTAGE_OFFSET = 0.75;

/** Lowest grade point that still earns the credits of a course. */
export const MIN_PASSING_POINT = 4;

/** No single AKTU course carries more credits than this; anything higher is a typo. */
export const MAX_COURSE_CREDITS = 20;

/** Highest grade point on the scale. */
export const MAX_GRADE_POINT = 10;

/**
 * Letter grade for a mark out of 100, using the AKTU absolute bands above.
 * @param {number} marks
 * @returns {object|null} grade record, or null when the input is not a mark
 */
export function gradeForMarks(marks) {
  if (typeof marks !== "number" || !Number.isFinite(marks)) return null;
  if (marks < 0 || marks > 100) return null;
  if (marks >= 90) return AKTU_GRADES[0];
  if (marks >= 80) return AKTU_GRADES[1];
  if (marks >= 70) return AKTU_GRADES[2];
  if (marks >= 60) return AKTU_GRADES[3];
  if (marks >= 50) return AKTU_GRADES[4];
  if (marks >= 45) return AKTU_GRADES[5];
  if (marks >= 40) return AKTU_GRADES[6];
  return AKTU_GRADES[7];
}

/**
 * Round half-up to `places` decimals. The toPrecision step removes the binary
 * float drift that would otherwise turn an exact 7.875 into 7.874999999999999
 * and round it down to 7.87.
 */
function round(value, places = 2) {
  const factor = 10 ** places;
  return Math.round(Number((value * factor).toPrecision(12))) / factor;
}

/**
 * AKTU percentage equivalent of a CGPA (or of an SGPA, for a single semester).
 * @param {number} cgpa
 * @returns {number|null} percentage, floored at 0, or null for invalid input
 */
export function percentageFromCgpa(cgpa) {
  if (typeof cgpa !== "number" || !Number.isFinite(cgpa)) return null;
  if (cgpa < 0 || cgpa > MAX_GRADE_POINT) return null;
  return round(Math.max(0, (cgpa - AKTU_PERCENTAGE_OFFSET) * 10), 2);
}

/**
 * Semester grade point average for a list of AKTU courses.
 * @param {object} input
 * @param {Array<{name?: string, credits: number, points: number}>} input.courses
 * @returns {object} result object, or { error } when the input cannot be scored
 */
export function computeSgpa({ courses }) {
  if (!Array.isArray(courses) || courses.length === 0) {
    return { error: "Add at least one course with its credits and grade." };
  }

  let totalCredits = 0;
  let creditPoints = 0;
  let earnedCredits = 0;
  let backlogs = 0;
  const rows = [];

  for (let i = 0; i < courses.length; i += 1) {
    const course = courses[i];
    const credits = Number(course?.credits);
    const points = Number(course?.points);
    const position = i + 1;

    if (!Number.isFinite(credits) || !Number.isFinite(points)) {
      return { error: `Course ${position} needs a numeric credit value and a grade.` };
    }
    if (credits < 0) {
      return { error: `Course ${position} has negative credits. Credits cannot be below zero.` };
    }
    if (credits > MAX_COURSE_CREDITS) {
      return {
        error: `Course ${position} has ${credits} credits. AKTU courses do not exceed ${MAX_COURSE_CREDITS} credits.`,
      };
    }
    if (points < 0 || points > MAX_GRADE_POINT) {
      return { error: `Course ${position} has a grade point outside the 0 – ${MAX_GRADE_POINT} scale.` };
    }

    totalCredits += credits;
    creditPoints += credits * points;
    if (points >= MIN_PASSING_POINT) {
      earnedCredits += credits;
    } else {
      backlogs += 1;
    }
    rows.push({ name: course?.name || `Course ${position}`, credits, points, creditPoints: credits * points });
  }

  if (totalCredits <= 0) {
    return { error: "Total credits are zero. Enter the credit value of at least one course." };
  }

  const sgpa = creditPoints / totalCredits;

  return {
    sgpa: round(sgpa, 2),
    exactSgpa: sgpa,
    totalCredits: round(totalCredits, 2),
    creditPoints: round(creditPoints, 2),
    earnedCredits: round(earnedCredits, 2),
    lostCredits: round(totalCredits - earnedCredits, 2),
    backlogs,
    courseCount: courses.length,
    percentage: percentageFromCgpa(round(sgpa, 2)),
    equivalentGrade: equivalentGrade(sgpa),
    rows,
  };
}

/**
 * The letter grade a given average sits at — the highest grade whose point
 * value the average has reached.
 * @param {number} points
 * @returns {object} grade record
 */
export function equivalentGrade(points) {
  if (typeof points !== "number" || !Number.isFinite(points)) return AKTU_GRADES[7];
  const match = AKTU_GRADES.find((grade) => points >= grade.points);
  return match || AKTU_GRADES[7];
}

/**
 * CGPA from a list of completed semesters.
 * @param {Array<{sgpa: number, credits: number}>} semesters
 * @returns {object} { cgpa, totalCredits, percentage } or { error }
 */
export function computeCgpa(semesters) {
  if (!Array.isArray(semesters) || semesters.length === 0) {
    return { error: "Add at least one semester to compute a CGPA." };
  }

  let totalCredits = 0;
  let weighted = 0;

  for (let i = 0; i < semesters.length; i += 1) {
    const sgpa = Number(semesters[i]?.sgpa);
    const credits = Number(semesters[i]?.credits);
    const position = i + 1;

    if (!Number.isFinite(sgpa) || !Number.isFinite(credits)) {
      return { error: `Semester ${position} needs both an SGPA and a credit total.` };
    }
    if (sgpa < 0 || sgpa > MAX_GRADE_POINT) {
      return { error: `Semester ${position} SGPA must be between 0 and ${MAX_GRADE_POINT}.` };
    }
    if (credits < 0) {
      return { error: `Semester ${position} has negative credits.` };
    }
    totalCredits += credits;
    weighted += sgpa * credits;
  }

  if (totalCredits <= 0) {
    return { error: "Total semester credits are zero, so a CGPA cannot be formed." };
  }

  const cgpa = round(weighted / totalCredits, 2);
  return {
    cgpa,
    totalCredits: round(totalCredits, 2),
    creditPoints: round(weighted, 2),
    percentage: percentageFromCgpa(cgpa),
    equivalentGrade: equivalentGrade(cgpa),
    semesterCount: semesters.length,
  };
}
