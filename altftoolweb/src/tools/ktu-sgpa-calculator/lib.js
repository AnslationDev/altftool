/**
 * KTU (APJ Abdul Kalam Technological University, Kerala) SGPA / CGPA maths.
 *
 * KTU is unusual among Indian technical universities in using HALF points
 * between the top grades: S is 10, A+ is 9, A is 8.5, B+ is 8, B is 7.5, C+ is
 * 7, C is 6.5, D is 6 and P is 5.5. Because the steps are 0.5 rather than 1,
 * one grade slipped costs half as much as it would on an AKTU-style scale, and
 * SGPAs cluster more tightly.
 *
 *   SGPA = Σ (credit_i × gradePoint_i) / Σ credit_i          (one semester)
 *   CGPA = Σ (SGPA_s × creditsOfSemester_s) / Σ credits_s    (all semesters)
 *
 * F (failed), FE (ineligible, usually for attendance) and I (incomplete) all
 * carry 0 points. Their credits stay in the SGPA denominator but are not
 * earned until the course is cleared.
 *
 * KTU publishes an equivalence of percentage = (CGPA − 0.5) × 10 for students
 * who need a percentage figure. It is an equivalence for form-filling, not a
 * re-marking, so quote it as such and check it against your own regulation.
 *
 * The grade points below are the 2019 B.Tech scheme. Older schemes and some
 * PG programmes use different letters, so read the point column, not the
 * letter, if your grade card disagrees.
 */

/** KTU 2019 scheme grades: letter, grade point and indicative mark band. */
export const KTU_GRADES = [
  { code: "S", points: 10, band: "90 – 100", label: "Outstanding" },
  { code: "A+", points: 9, band: "85 – 89", label: "Excellent" },
  { code: "A", points: 8.5, band: "80 – 84", label: "Very good" },
  { code: "B+", points: 8, band: "75 – 79", label: "Good" },
  { code: "B", points: 7.5, band: "70 – 74", label: "Above average" },
  { code: "C+", points: 7, band: "65 – 69", label: "Average" },
  { code: "C", points: 6.5, band: "60 – 64", label: "Satisfactory" },
  { code: "D", points: 6, band: "55 – 59", label: "Pass" },
  { code: "P", points: 5.5, band: "50 – 54", label: "Minimum pass" },
  { code: "F", points: 0, band: "Below 50", label: "Failed" },
  { code: "FE", points: 0, band: "—", label: "Ineligible (attendance)" },
  { code: "I", points: 0, band: "—", label: "Incomplete" },
];

/** KTU's published CGPA → percentage offset. */
export const KTU_PERCENTAGE_OFFSET = 0.5;

/** Lowest grade point that earns the credits of a course (grade P). */
export const MIN_PASSING_POINT = 5.5;

/** Minimum CGPA commonly required for the award of the degree. */
export const MIN_DEGREE_CGPA = 5.0;

/** Top of the KTU grade point scale. */
export const MAX_GRADE_POINT = 10;

/** No single KTU course carries more credits than this. */
export const MAX_COURSE_CREDITS = 20;

/** Practical ceiling on the credits one semester can carry. */
export const MAX_SEMESTER_CREDITS = 40;

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
 * KTU percentage equivalent of a CGPA.
 * @param {number} cgpa
 * @returns {number|null}
 */
export function percentageFromCgpa(cgpa) {
  if (typeof cgpa !== "number" || !Number.isFinite(cgpa)) return null;
  if (cgpa < 0 || cgpa > MAX_GRADE_POINT) return null;
  return round(Math.max(0, (cgpa - KTU_PERCENTAGE_OFFSET) * 10), 2);
}

/**
 * Highest letter grade whose point value an average has reached.
 * @param {number} points
 * @returns {object} grade record
 */
export function equivalentGrade(points) {
  if (typeof points !== "number" || !Number.isFinite(points)) return KTU_GRADES[9];
  const match = KTU_GRADES.find((grade) => grade.points > 0 && points >= grade.points);
  return match || KTU_GRADES[9];
}

/**
 * Semester grade point average for a list of KTU courses.
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
  let failedCourses = 0;
  const rows = [];
  const distribution = new Map();

  for (let i = 0; i < courses.length; i += 1) {
    const credits = Number(courses[i]?.credits);
    const points = Number(courses[i]?.points);
    const position = i + 1;

    if (!Number.isFinite(credits) || !Number.isFinite(points)) {
      return { error: `Course ${position} needs a numeric credit value and a grade.` };
    }
    if (credits < 0) return { error: `Course ${position} has negative credits.` };
    if (credits > MAX_COURSE_CREDITS) {
      return {
        error: `Course ${position} has ${credits} credits — no KTU course exceeds ${MAX_COURSE_CREDITS}.`,
      };
    }
    if (points < 0 || points > MAX_GRADE_POINT) {
      return { error: `Course ${position} has a grade point outside the 0 – ${MAX_GRADE_POINT} scale.` };
    }

    totalCredits += credits;
    creditPoints += credits * points;
    if (points >= MIN_PASSING_POINT) earnedCredits += credits;
    else failedCourses += 1;

    const grade = KTU_GRADES.find((entry) => entry.points === points) || { code: String(points) };
    distribution.set(grade.code, (distribution.get(grade.code) || 0) + credits);

    rows.push({
      name: courses[i]?.name || `Course ${position}`,
      credits,
      points,
      code: grade.code,
      creditPoints: credits * points,
      passed: points >= MIN_PASSING_POINT,
    });
  }

  if (totalCredits <= 0) {
    return { error: "Total credits are zero. Enter the credit value of at least one course." };
  }
  if (totalCredits > MAX_SEMESTER_CREDITS) {
    return {
      error: `Total credits come to ${round(totalCredits, 2)}, above the ${MAX_SEMESTER_CREDITS}-credit ceiling for one KTU semester. Check the credit column.`,
    };
  }

  const sgpa = round(creditPoints / totalCredits, 2);

  return {
    sgpa,
    totalCredits: round(totalCredits, 2),
    creditPoints: round(creditPoints, 2),
    earnedCredits: round(earnedCredits, 2),
    lostCredits: round(totalCredits - earnedCredits, 2),
    failedCourses,
    courseCount: courses.length,
    percentage: percentageFromCgpa(sgpa),
    equivalentGrade: equivalentGrade(sgpa),
    distribution: Array.from(distribution.entries())
      .map(([code, credits]) => ({
        code,
        credits: round(credits, 2),
        share: round((credits / totalCredits) * 100, 1),
      }))
      .sort((a, b) => b.credits - a.credits),
    rows,
  };
}

/**
 * CGPA across semesters, weighted by each semester's credit load.
 * @param {Array<{label?: string, sgpa: number, credits: number}>} semesters
 * @returns {object} result, or { error }
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
    if (credits < 0) return { error: `Semester ${position} has negative credits.` };
    if (credits > MAX_SEMESTER_CREDITS) {
      return {
        error: `Semester ${position} shows ${credits} credits, above the ${MAX_SEMESTER_CREDITS}-credit ceiling.`,
      };
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
    meetsDegreeMinimum: cgpa >= MIN_DEGREE_CGPA,
  };
}
