/**
 * JNTU (Jawaharlal Nehru Technological University — Hyderabad, Kakinada and
 * Anantapur) SGPA / CGPA maths.
 *
 * JNTU uses an absolute 10-point scale under the choice-based credit system:
 *
 *   SGPA = Σ (credit_i × gradePoint_i) / Σ credit_i        (one semester)
 *   CGPA = Σ (credit_i × gradePoint_i) / Σ credit_i        (all courses so far)
 *
 * The letters attached to those points changed with the regulations. R13 used
 * S, A, B, C, D, E for 10, 9, 8, 7, 6 and 5; R15 onwards (R16, R18, R20, R22)
 * use O, A+, A, B+, B and C for the same six point values. The mark bands and
 * the arithmetic did not change — only the letter printed on the memo.
 *
 * The equivalent percentage published by JNTU is
 *   Percentage = (CGPA − 0.75) × 10
 * so a CGPA of 7.75 is quoted as 70%.
 *
 * A course is passed at 40% of the total marks (subject to the separate
 * minimum in the end-semester examination laid down by the regulation). A
 * failed course scores 0 grade points, earns none of its credits, and stays in
 * the SGPA denominator until it is cleared.
 */

/** Mark bands and grade points, common to every JNTU regulation. */
const BANDS = [
  { min: 90, points: 10, band: "90 – 100", label: "Outstanding" },
  { min: 80, points: 9, band: "80 – 89", label: "Excellent" },
  { min: 70, points: 8, band: "70 – 79", label: "Very good" },
  { min: 60, points: 7, band: "60 – 69", label: "Good" },
  { min: 50, points: 6, band: "50 – 59", label: "Average" },
  { min: 40, points: 5, band: "40 – 49", label: "Pass" },
  { min: 0, points: 0, band: "Below 40", label: "Fail" },
];

/** Letter set per regulation family. Same points, different printed letters. */
export const JNTU_REGULATIONS = {
  "R13": { name: "R13", letters: ["S", "A", "B", "C", "D", "E", "F"] },
  "R16+": { name: "R16 / R18 / R20 / R22", letters: ["O", "A+", "A", "B+", "B", "C", "F"] },
};

/** JNTU's published CGPA → percentage offset. */
export const JNTU_PERCENTAGE_OFFSET = 0.75;

/** Marks percentage needed to pass a JNTU course. */
export const PASS_MARK_PERCENT = 40;

/** Lowest grade point that earns the credits of a course. */
export const MIN_PASSING_POINT = 5;

/** Top of the grade point scale. */
export const MAX_GRADE_POINT = 10;

/** No single JNTU course carries more credits than this. */
export const MAX_COURSE_CREDITS = 20;

/**
 * CGPA thresholds JNTU uses when awarding the class of the degree.
 * Distinction normally also requires that no course was failed.
 */
export const CLASS_BANDS = [
  { min: 7.75, name: "First Class with Distinction" },
  { min: 6.75, name: "First Class" },
  { min: 5.75, name: "Second Class" },
  { min: 5.0, name: "Pass Class" },
  { min: 0, name: "Not eligible for a class" },
];

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
 * Full grade scale for a regulation, letters included.
 * @param {string} regulation key of JNTU_REGULATIONS
 * @returns {Array<object>} grade records
 */
export function gradeScale(regulation = "R16+") {
  const set = JNTU_REGULATIONS[regulation] || JNTU_REGULATIONS["R16+"];
  return BANDS.map((entry, index) => ({
    code: set.letters[index],
    points: entry.points,
    band: entry.band,
    label: entry.label,
    min: entry.min,
  }));
}

/**
 * Grade for a mark out of 100 under a regulation.
 * @param {number} marks
 * @param {string} regulation
 * @returns {object|null}
 */
export function gradeForMarks(marks, regulation = "R16+") {
  if (typeof marks !== "number" || !Number.isFinite(marks)) return null;
  if (marks < 0 || marks > 100) return null;
  const scale = gradeScale(regulation);
  return scale.find((grade) => marks >= grade.min) || scale[scale.length - 1];
}

/**
 * JNTU percentage equivalent of a CGPA.
 * @param {number} cgpa
 * @returns {number|null}
 */
export function percentageFromCgpa(cgpa) {
  if (typeof cgpa !== "number" || !Number.isFinite(cgpa)) return null;
  if (cgpa < 0 || cgpa > MAX_GRADE_POINT) return null;
  return round(Math.max(0, (cgpa - JNTU_PERCENTAGE_OFFSET) * 10), 2);
}

/**
 * Class of degree for a CGPA.
 * @param {number} cgpa
 * @param {boolean} anyFailure true when at least one course was ever failed
 * @returns {string}
 */
export function classAwarded(cgpa, anyFailure = false) {
  if (typeof cgpa !== "number" || !Number.isFinite(cgpa)) return CLASS_BANDS[CLASS_BANDS.length - 1].name;
  const band = CLASS_BANDS.find((entry) => cgpa >= entry.min) || CLASS_BANDS[CLASS_BANDS.length - 1];
  if (band.min === 7.75 && anyFailure) {
    return "First Class (distinction usually withheld after a failed course)";
  }
  return band.name;
}

/**
 * Semester grade point average.
 * @param {object} input
 * @param {Array<{name?: string, credits: number, points: number}>} input.courses
 * @param {string} [input.regulation]
 * @returns {object} result, or { error }
 */
export function computeSgpa({ courses, regulation = "R16+" }) {
  if (!Array.isArray(courses) || courses.length === 0) {
    return { error: "Add at least one course with its credits and grade." };
  }

  let totalCredits = 0;
  let creditPoints = 0;
  let earnedCredits = 0;
  let backlogs = 0;
  const rows = [];
  const scale = gradeScale(regulation);

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
        error: `Course ${position} has ${credits} credits — no JNTU course exceeds ${MAX_COURSE_CREDITS}.`,
      };
    }
    if (points < 0 || points > MAX_GRADE_POINT) {
      return { error: `Course ${position} has a grade point outside the 0 – ${MAX_GRADE_POINT} scale.` };
    }

    totalCredits += credits;
    creditPoints += credits * points;
    if (points >= MIN_PASSING_POINT) earnedCredits += credits;
    else backlogs += 1;

    const letter = scale.find((grade) => grade.points === points);
    rows.push({
      name: courses[i]?.name || `Course ${position}`,
      credits,
      points,
      code: letter ? letter.code : String(points),
      creditPoints: credits * points,
    });
  }

  if (totalCredits <= 0) {
    return { error: "Total credits are zero. Enter the credit value of at least one course." };
  }

  const sgpa = creditPoints / totalCredits;
  const rounded = round(sgpa, 2);

  return {
    sgpa: rounded,
    totalCredits: round(totalCredits, 2),
    creditPoints: round(creditPoints, 2),
    earnedCredits: round(earnedCredits, 2),
    lostCredits: round(totalCredits - earnedCredits, 2),
    backlogs,
    courseCount: courses.length,
    percentage: percentageFromCgpa(rounded),
    classAwarded: classAwarded(rounded, backlogs > 0),
    rows,
  };
}

/**
 * CGPA from previously completed credits plus the current semester.
 * @param {number} priorCgpa      CGPA over the credits already completed.
 * @param {number} priorCredits   Credits already completed.
 * @param {number} semesterSgpa   SGPA of the new semester.
 * @param {number} semesterCredits Credits carried by the new semester.
 * @returns {object} { cgpa, totalCredits, percentage } or { error }
 */
export function rollIntoCgpa(priorCgpa, priorCredits, semesterSgpa, semesterCredits) {
  const values = [priorCgpa, priorCredits, semesterSgpa, semesterCredits];
  if (values.some((value) => typeof value !== "number" || !Number.isFinite(value))) {
    return { error: "Enter valid numbers for the earlier CGPA, credits and the new semester." };
  }
  if (priorCgpa < 0 || priorCgpa > MAX_GRADE_POINT || semesterSgpa < 0 || semesterSgpa > MAX_GRADE_POINT) {
    return { error: `Grade point averages must be between 0 and ${MAX_GRADE_POINT}.` };
  }
  if (priorCredits < 0 || semesterCredits < 0) {
    return { error: "Credits cannot be negative." };
  }
  const totalCredits = priorCredits + semesterCredits;
  if (totalCredits <= 0) {
    return { error: "Total credits are zero, so a CGPA cannot be formed." };
  }

  const cgpa = round((priorCgpa * priorCredits + semesterSgpa * semesterCredits) / totalCredits, 2);
  return {
    cgpa,
    totalCredits: round(totalCredits, 2),
    percentage: percentageFromCgpa(cgpa),
    classAwarded: classAwarded(cgpa, false),
  };
}
