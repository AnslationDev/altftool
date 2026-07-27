/**
 * SPPU (Savitribai Phule Pune University) SGPA / CGPA maths.
 *
 * SPPU runs the UGC credit and grading system on a 10-point letter scale.
 * Each course is awarded a letter grade with a fixed grade point, and the
 * semester average is the credit-weighted mean of those points:
 *
 *   SGPA = Σ (credit_i × gradePoint_i) / Σ credit_i
 *   CGPA = Σ (SGPA_s × creditsOfSemester_s) / Σ creditsOfSemester_s
 *
 * Because the CGPA is itself credit-weighted, a heavy final-year semester
 * moves the CGPA more than a light first-year one — averaging the SGPAs
 * directly (the mistake most students make) gives a different number unless
 * every semester happens to carry identical credits.
 *
 * A grade of F or AB carries 0 points and earns none of the course credits,
 * but the credits stay in the denominator until the course is cleared.
 *
 * Note on percentages: SPPU converts CGPA to a percentage using a piecewise
 * table printed in its credit-system ordinance rather than one single
 * multiplier, and the table differs between patterns and faculties. This
 * module therefore reports credit points, earned credits and the equivalent
 * letter grade, and deliberately does not guess at a percentage.
 */

/** SPPU 10-point letter grades and their grade points. */
export const SPPU_GRADES = [
  { code: "O", points: 10, label: "Outstanding" },
  { code: "A+", points: 9, label: "Excellent" },
  { code: "A", points: 8, label: "Very good" },
  { code: "B+", points: 7, label: "Good" },
  { code: "B", points: 6, label: "Above average" },
  { code: "C", points: 5, label: "Average" },
  { code: "P", points: 4, label: "Pass" },
  { code: "F", points: 0, label: "Fail" },
  { code: "AB", points: 0, label: "Absent" },
];

/** Lowest grade point that still earns the credits of a course. */
export const MIN_PASSING_POINT = 4;

/** Top of the SPPU grade point scale. */
export const MAX_GRADE_POINT = 10;

/** No single SPPU course carries more credits than this; higher values are typos. */
export const MAX_COURSE_CREDITS = 20;

/** Practical ceiling on the credits a single semester can carry. */
export const MAX_SEMESTER_CREDITS = 60;

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
 * Highest letter grade whose point value an average has reached.
 * @param {number} points
 * @returns {object} grade record
 */
export function equivalentGrade(points) {
  if (typeof points !== "number" || !Number.isFinite(points)) return SPPU_GRADES[7];
  const match = SPPU_GRADES.find((grade) => grade.points > 0 && points >= grade.points);
  return match || SPPU_GRADES[7];
}

/**
 * Semester grade point average for a list of SPPU courses.
 * @param {object} input
 * @param {Array<{name?: string, credits: number, points: number}>} input.courses
 * @returns {object} result, or { error }
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
    const credits = Number(courses[i]?.credits);
    const points = Number(courses[i]?.points);
    const position = i + 1;

    if (!Number.isFinite(credits) || !Number.isFinite(points)) {
      return { error: `Course ${position} needs a numeric credit value and a grade.` };
    }
    if (credits < 0) {
      return { error: `Course ${position} has negative credits.` };
    }
    if (credits > MAX_COURSE_CREDITS) {
      return {
        error: `Course ${position} has ${credits} credits — no SPPU course exceeds ${MAX_COURSE_CREDITS}.`,
      };
    }
    if (points < 0 || points > MAX_GRADE_POINT) {
      return { error: `Course ${position} has a grade point outside the 0 – ${MAX_GRADE_POINT} scale.` };
    }

    totalCredits += credits;
    creditPoints += credits * points;
    if (points >= MIN_PASSING_POINT) earnedCredits += credits;
    else backlogs += 1;

    rows.push({
      name: courses[i]?.name || `Course ${position}`,
      credits,
      points,
      creditPoints: credits * points,
      passed: points >= MIN_PASSING_POINT,
    });
  }

  if (totalCredits <= 0) {
    return { error: "Total credits are zero. Enter the credit value of at least one course." };
  }
  if (totalCredits > MAX_SEMESTER_CREDITS) {
    return {
      error: `Total credits come to ${round(totalCredits, 2)}, above the ${MAX_SEMESTER_CREDITS}-credit ceiling for one semester. Check the credit column.`,
    };
  }

  const sgpa = creditPoints / totalCredits;

  return {
    sgpa: round(sgpa, 2),
    totalCredits: round(totalCredits, 2),
    creditPoints: round(creditPoints, 2),
    earnedCredits: round(earnedCredits, 2),
    lostCredits: round(totalCredits - earnedCredits, 2),
    backlogs,
    courseCount: courses.length,
    equivalentGrade: equivalentGrade(sgpa),
    rows,
  };
}

/**
 * Cumulative grade point average across semesters, weighted by each
 * semester's credit load.
 * @param {Array<{label?: string, sgpa: number, credits: number}>} semesters
 * @returns {object} result, or { error }
 */
export function computeCgpa(semesters) {
  if (!Array.isArray(semesters) || semesters.length === 0) {
    return { error: "Add at least one semester to compute a CGPA." };
  }

  let totalCredits = 0;
  let weighted = 0;
  let simpleSum = 0;
  const rows = [];

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
    if (credits < 0) return { error: `Semester ${position} has negative credits.` };
    if (credits > MAX_SEMESTER_CREDITS) {
      return {
        error: `Semester ${position} shows ${credits} credits, above the ${MAX_SEMESTER_CREDITS}-credit ceiling for one semester.`,
      };
    }

    totalCredits += credits;
    weighted += sgpa * credits;
    simpleSum += sgpa;
    rows.push({
      label: semesters[i]?.label || `Semester ${position}`,
      sgpa,
      credits,
      creditPoints: round(sgpa * credits, 2),
    });
  }

  if (totalCredits <= 0) {
    return { error: "Total semester credits are zero, so a CGPA cannot be formed." };
  }

  const cgpa = weighted / totalCredits;
  const plainAverage = simpleSum / semesters.length;

  return {
    cgpa: round(cgpa, 2),
    plainAverage: round(plainAverage, 2),
    weightingGap: round(cgpa - plainAverage, 2),
    totalCredits: round(totalCredits, 2),
    creditPoints: round(weighted, 2),
    semesterCount: semesters.length,
    equivalentGrade: equivalentGrade(cgpa),
    rows,
  };
}

/**
 * SGPA a student must score in the remaining credits to reach a target CGPA.
 * @param {number} currentCgpa       CGPA so far.
 * @param {number} completedCredits  Credits already completed.
 * @param {number} remainingCredits  Credits still to be attempted.
 * @param {number} targetCgpa        CGPA the student wants at the end.
 * @returns {object} { requiredSgpa, achievable } or { error }
 */
export function sgpaNeededForTarget(currentCgpa, completedCredits, remainingCredits, targetCgpa) {
  const values = [currentCgpa, completedCredits, remainingCredits, targetCgpa];
  if (values.some((value) => typeof value !== "number" || !Number.isFinite(value))) {
    return { error: "Enter valid numbers for the current CGPA, credits and target." };
  }
  if (currentCgpa < 0 || currentCgpa > MAX_GRADE_POINT || targetCgpa < 0 || targetCgpa > MAX_GRADE_POINT) {
    return { error: `CGPA values must be between 0 and ${MAX_GRADE_POINT}.` };
  }
  if (completedCredits < 0 || remainingCredits <= 0) {
    return { error: "Remaining credits must be greater than zero." };
  }

  const required =
    (targetCgpa * (completedCredits + remainingCredits) - currentCgpa * completedCredits) /
    remainingCredits;

  return {
    requiredSgpa: round(required, 2),
    achievable: required <= MAX_GRADE_POINT,
    alreadyThere: required <= 0,
  };
}
