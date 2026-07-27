/**
 * GGSIPU (Guru Gobind Singh Indraprastha University, Delhi) SGPA / CGPA maths.
 *
 * IPU follows the UGC choice-based credit system on a 10-point letter scale.
 * The semester result is the credit-weighted mean of grade points:
 *
 *   SGPA = Σ (credit_i × gradePoint_i) / Σ credit_i
 *   CGPA = Σ (SGPA_s × creditsOfSemester_s) / Σ creditsOfSemester_s
 *
 * Two consequences of the weighting are worth stating plainly, because they
 * are what most hand calculations get wrong:
 *
 *   1. Raising ONE course by one grade point lifts the SGPA by exactly
 *      (that course's credits ÷ total credits). A 4-credit paper in a
 *      24-credit semester is worth 0.167 SGPA per grade step; a 1-credit
 *      paper is worth 0.042. That ratio is what makes some papers worth
 *      re-evaluation and others not.
 *   2. CGPA is weighted by semester credits, so averaging SGPAs directly is
 *      only correct when every semester carries identical credits.
 *
 * A grade of F carries 0 points and earns none of the course credits, but the
 * credits remain in the denominator until the paper is cleared.
 *
 * On marks bands: the marks-to-letter boundaries at IPU are set by the
 * university's scheme for each programme and its schools do not all use one
 * table, so this module works from GRADE POINTS, which are common across the
 * scale, rather than guessing at a marks boundary.
 */

/** GGSIPU 10-point letter grades and their grade points. */
export const IPU_GRADES = [
  { code: "O", points: 10, label: "Outstanding" },
  { code: "A+", points: 9, label: "Excellent" },
  { code: "A", points: 8, label: "Very good" },
  { code: "B+", points: 7, label: "Good" },
  { code: "B", points: 6, label: "Above average" },
  { code: "C", points: 5, label: "Average" },
  { code: "P", points: 4, label: "Pass" },
  { code: "F", points: 0, label: "Fail" },
];

/** Lowest grade point that earns the credits of a paper. */
export const MIN_PASSING_POINT = 4;

/** Top of the grade point scale. */
export const MAX_GRADE_POINT = 10;

/** No single IPU paper carries more credits than this. */
export const MAX_COURSE_CREDITS = 20;

/** Practical ceiling on the credits one semester can carry. */
export const MAX_SEMESTER_CREDITS = 50;

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
  if (typeof points !== "number" || !Number.isFinite(points)) return IPU_GRADES[7];
  const match = IPU_GRADES.find((grade) => grade.points > 0 && points >= grade.points);
  return match || IPU_GRADES[7];
}

/**
 * Semester grade point average for a list of IPU papers.
 * @param {object} input
 * @param {Array<{name?: string, credits: number, points: number}>} input.courses
 * @returns {object} result, or { error }
 */
export function computeSgpa({ courses }) {
  if (!Array.isArray(courses) || courses.length === 0) {
    return { error: "Add at least one paper with its credits and grade." };
  }

  let totalCredits = 0;
  let creditPoints = 0;
  let earnedCredits = 0;
  let backlogs = 0;
  const entries = [];

  for (let i = 0; i < courses.length; i += 1) {
    const credits = Number(courses[i]?.credits);
    const points = Number(courses[i]?.points);
    const position = i + 1;

    if (!Number.isFinite(credits) || !Number.isFinite(points)) {
      return { error: `Paper ${position} needs a numeric credit value and a grade.` };
    }
    if (credits < 0) return { error: `Paper ${position} has negative credits.` };
    if (credits > MAX_COURSE_CREDITS) {
      return {
        error: `Paper ${position} has ${credits} credits — no IPU paper exceeds ${MAX_COURSE_CREDITS}.`,
      };
    }
    if (points < 0 || points > MAX_GRADE_POINT) {
      return { error: `Paper ${position} has a grade point outside the 0 – ${MAX_GRADE_POINT} scale.` };
    }

    totalCredits += credits;
    creditPoints += credits * points;
    if (points >= MIN_PASSING_POINT) earnedCredits += credits;
    else backlogs += 1;

    const grade = IPU_GRADES.find((entry) => entry.points === points);
    entries.push({
      name: courses[i]?.name || `Paper ${position}`,
      credits,
      points,
      code: grade ? grade.code : String(points),
      creditPoints: credits * points,
      passed: points >= MIN_PASSING_POINT,
    });
  }

  if (totalCredits <= 0) {
    return { error: "Total credits are zero. Enter the credit value of at least one paper." };
  }
  if (totalCredits > MAX_SEMESTER_CREDITS) {
    return {
      error: `Total credits come to ${round(totalCredits, 2)}, above the ${MAX_SEMESTER_CREDITS}-credit ceiling for one semester. Check the credit column.`,
    };
  }

  const sgpa = round(creditPoints / totalCredits, 2);

  const rows = entries.map((entry) => ({
    ...entry,
    /** SGPA gained per extra grade point on this paper alone. */
    sgpaPerGradeStep: round(entry.credits / totalCredits, 3),
    /** SGPA it would reach if this one paper were pushed to a perfect 10. */
    sgpaIfPerfect: round((creditPoints + entry.credits * (MAX_GRADE_POINT - entry.points)) / totalCredits, 2),
  }));

  return {
    sgpa,
    totalCredits: round(totalCredits, 2),
    creditPoints: round(creditPoints, 2),
    earnedCredits: round(earnedCredits, 2),
    lostCredits: round(totalCredits - earnedCredits, 2),
    backlogs,
    courseCount: courses.length,
    equivalentGrade: equivalentGrade(sgpa),
    /** The paper where one extra grade point buys the most SGPA. */
    biggestLever: rows.reduce(
      (best, row) =>
        row.points < MAX_GRADE_POINT && (!best || row.sgpaIfPerfect > best.sgpaIfPerfect) ? row : best,
      null,
    ),
    rows,
  };
}

/**
 * CGPA from previously completed credits plus this semester.
 * @param {number} priorCgpa       CGPA over the credits already completed.
 * @param {number} priorCredits    Credits already completed.
 * @param {number} semesterSgpa    SGPA of the new semester.
 * @param {number} semesterCredits Credits carried by the new semester.
 * @returns {object} { cgpa, totalCredits, change } or { error }
 */
export function rollIntoCgpa(priorCgpa, priorCredits, semesterSgpa, semesterCredits) {
  const values = [priorCgpa, priorCredits, semesterSgpa, semesterCredits];
  if (values.some((value) => typeof value !== "number" || !Number.isFinite(value))) {
    return { error: "Enter valid numbers for the earlier CGPA, credits and this semester." };
  }
  if (priorCgpa < 0 || priorCgpa > MAX_GRADE_POINT || semesterSgpa < 0 || semesterSgpa > MAX_GRADE_POINT) {
    return { error: `Grade point averages must be between 0 and ${MAX_GRADE_POINT}.` };
  }
  if (priorCredits < 0 || semesterCredits < 0) return { error: "Credits cannot be negative." };

  const totalCredits = priorCredits + semesterCredits;
  if (totalCredits <= 0) {
    return { error: "Total credits are zero, so a CGPA cannot be formed." };
  }

  const cgpa = round((priorCgpa * priorCredits + semesterSgpa * semesterCredits) / totalCredits, 2);
  return {
    cgpa,
    totalCredits: round(totalCredits, 2),
    change: round(cgpa - priorCgpa, 2),
    equivalentGrade: equivalentGrade(cgpa),
  };
}

/**
 * SGPA the remaining credits must average to reach a target CGPA.
 * @param {number} currentCgpa
 * @param {number} completedCredits
 * @param {number} remainingCredits
 * @param {number} targetCgpa
 * @returns {object} { requiredSgpa, achievable, alreadyThere } or { error }
 */
export function sgpaNeededForTarget(currentCgpa, completedCredits, remainingCredits, targetCgpa) {
  const values = [currentCgpa, completedCredits, remainingCredits, targetCgpa];
  if (values.some((value) => typeof value !== "number" || !Number.isFinite(value))) {
    return { error: "Enter valid numbers for the current CGPA, credits and target." };
  }
  if (currentCgpa < 0 || currentCgpa > MAX_GRADE_POINT || targetCgpa < 0 || targetCgpa > MAX_GRADE_POINT) {
    return { error: `CGPA values must be between 0 and ${MAX_GRADE_POINT}.` };
  }
  if (completedCredits < 0) return { error: "Completed credits cannot be negative." };
  if (remainingCredits <= 0) return { error: "Remaining credits must be greater than zero." };

  const required =
    (targetCgpa * (completedCredits + remainingCredits) - currentCgpa * completedCredits) /
    remainingCredits;

  return {
    requiredSgpa: round(required, 2),
    achievable: required <= MAX_GRADE_POINT,
    alreadyThere: required <= 0,
  };
}
