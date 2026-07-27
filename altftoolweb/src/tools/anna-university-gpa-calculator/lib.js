/**
 * Anna University (Chennai) semester GPA.
 *
 * Anna University's UG regulations (Regulation 2017 and Regulation 2021 use the
 * same letter scale) award each course a letter grade with a grade point on a
 * 10-point scale, and define the semester GPA as the credit weighted mean:
 *
 *     GPA = Σ (Ci × GPi) / Σ Ci
 *
 * taken over the courses registered in that semester, where Ci is the credit of
 * course i and GPi the grade point earned. The fail grade U (and absence, AB)
 * carries 0 grade points; when the course is later cleared, the new grade
 * replaces it in the cumulative average.
 *
 * Pure module: no clock reads, no DOM, no randomness.
 */

/**
 * Anna University letter grades, grade points and end-of-course mark bands
 * (UG Regulations 2017/2021 — pass mark is 50 overall, so U covers 0–49).
 */
export const ANNA_GRADES = [
  { code: "O", point: 10, band: "91 – 100", label: "Outstanding" },
  { code: "A+", point: 9, band: "81 – 90", label: "Excellent" },
  { code: "A", point: 8, band: "71 – 80", label: "Good" },
  { code: "B+", point: 7, band: "61 – 70", label: "Fair" },
  { code: "B", point: 6, band: "56 – 60", label: "Average" },
  { code: "C", point: 5, band: "50 – 55", label: "Satisfactory" },
  { code: "U", point: 0, band: "0 – 49", label: "Fail (reappearance)" },
  { code: "AB", point: 0, band: "Absent", label: "Absent" },
];

/** Grade point scale maximum at Anna University. */
export const SCALE_MAX = 10;

/** Sanity ceiling on courses in one semester. */
export const MAX_COURSES = 15;

/** Sanity ceiling on credits for a single course. */
export const MAX_CREDITS_PER_COURSE = 30;

const round2 = (value) => Math.round(value * 100) / 100;

const toNumber = (value) => {
  if (value === "" || value === null || value === undefined) return NaN;
  const parsed = Number(String(value).trim());
  return Number.isFinite(parsed) ? parsed : NaN;
};

export const gradeByCode = (code) =>
  ANNA_GRADES.find((row) => row.code === String(code ?? "").trim().toUpperCase()) || null;

/**
 * Compute the Anna University semester GPA.
 *
 * @param {object} input
 * @param {Array<{name?: string, grade: string, credits: number|string}>} input.courses
 * @returns {object} { gpa, totalCredits, arrearCredits, rows, ... } or { error }
 */
export function computeAnnaGpa({ courses }) {
  if (!Array.isArray(courses) || courses.length === 0) {
    return { error: "Add at least one course." };
  }
  if (courses.length > MAX_COURSES) {
    return { error: `A semester is capped at ${MAX_COURSES} courses here.` };
  }

  const rows = [];
  let creditPoints = 0; // Σ Ci × GPi
  let totalCredits = 0; // Σ Ci
  let arrearCredits = 0; // credits carrying U or AB

  for (let i = 0; i < courses.length; i += 1) {
    const entry = courses[i] || {};
    const name = String(entry.name ?? "").trim() || `Course ${i + 1}`;

    const grade = gradeByCode(entry.grade);
    if (!grade) {
      return { error: `${name}: pick the letter grade awarded (O, A+, A, B+, B, C, U or AB).` };
    }

    const credits = toNumber(entry.credits);
    if (Number.isNaN(credits)) return { error: `${name}: enter the course credits.` };
    if (credits <= 0) return { error: `${name}: credits must be more than zero.` };
    if (credits > MAX_CREDITS_PER_COURSE) {
      return { error: `${name}: ${credits} credits is beyond the ${MAX_CREDITS_PER_COURSE}-credit limit.` };
    }

    creditPoints += grade.point * credits;
    totalCredits += credits;
    if (grade.point === 0) arrearCredits += credits;

    rows.push({
      index: i + 1,
      name,
      grade: grade.code,
      point: grade.point,
      credits: round2(credits),
      creditPoints: round2(grade.point * credits),
      isArrear: grade.point === 0,
    });
  }

  if (totalCredits <= 0) {
    return { error: "Total credits must be more than zero." };
  }

  const gpa = creditPoints / totalCredits;

  return {
    gpa: round2(gpa),
    totalCredits: round2(totalCredits),
    creditPoints: round2(creditPoints),
    arrearCredits: round2(arrearCredits),
    hasArrear: arrearCredits > 0,
    courses: rows.length,
    scaleMax: SCALE_MAX,
    rows,
  };
}
