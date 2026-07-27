/**
 * University of Calicut (CBCSS) grade point <-> percentage conversion.
 *
 * Calicut's Choice Based Credit and Semester System grades every course on a 10 point
 * scale in which each letter grade covers a ten mark band and the grade point is the
 * mid-point of that band divided by ten:
 *
 *     A+  covers 85 to below 95  ->  grade point 9   (mid-point 90 = 9 x 10)
 *     A   covers 75 to below 85  ->  grade point 8   (mid-point 80 = 8 x 10)
 *
 * Because the scale is built that way, the equivalent percentage of marks is a straight
 * scaling of the average with no offset:
 *
 *     percentage of marks = CGPA x 10        and       CGPA = percentage / 10
 *
 * Semester and cumulative averages are credit weighted:
 *
 *     SGPA = sum(grade point x credit) / sum(credit)
 *     CGPA = sum(SGPA x semester credits) / sum(semester credits)
 *
 * Pure module: no clock reads, no DOM, no randomness.
 */

/** The CBCSS scale ceiling. */
export const CALICUT_MAX_GPA = 10;
/** Calicut scales grade points straight to marks - no subtraction, unlike RGPV or VTU. */
export const CALICUT_PERCENT_PER_POINT = 10;
/** Grade point 4 (letter P) is the lowest pass grade in a course. */
export const CALICUT_MIN_PASS_POINT = 4;

/**
 * Course level grade bands. `minMarks` is inclusive, the band runs up to the next band's
 * floor. The pass band floor is 35 for most programmes; some science and professional
 * programmes set it at 40, so `passFloorNote` is surfaced in the interface.
 */
export const CALICUT_GRADE_BANDS = [
  { grade: "O", point: 10, minMarks: 95, maxMarks: 100, label: "Outstanding" },
  { grade: "A+", point: 9, minMarks: 85, maxMarks: 95, label: "Excellent" },
  { grade: "A", point: 8, minMarks: 75, maxMarks: 85, label: "Very good" },
  { grade: "B+", point: 7, minMarks: 65, maxMarks: 75, label: "Good" },
  { grade: "B", point: 6, minMarks: 55, maxMarks: 65, label: "Above average" },
  { grade: "C", point: 5, minMarks: 45, maxMarks: 55, label: "Average" },
  { grade: "P", point: 4, minMarks: 35, maxMarks: 45, label: "Pass" },
  { grade: "F", point: 0, minMarks: 0, maxMarks: 35, label: "Fail" },
];

/** The overall letter grade printed against an SGPA or CGPA. */
export const CALICUT_OVERALL_GRADES = [
  { grade: "O", min: 9.0, label: "Outstanding" },
  { grade: "A+", min: 8.0, label: "Excellent" },
  { grade: "A", min: 7.0, label: "Very good" },
  { grade: "B+", min: 6.0, label: "Good" },
  { grade: "B", min: 5.0, label: "Above average" },
  { grade: "C", min: 4.0, label: "Average" },
  { grade: "P", min: 3.5, label: "Pass" },
  { grade: "F", min: 0, label: "Fail" },
];

/** Letter grades a student can select for a course, highest first. */
export const CALICUT_LETTER_POINTS = CALICUT_GRADE_BANDS.map((row) => ({
  grade: row.grade,
  point: row.point,
}));

const toNumber = (value) => {
  if (value === "" || value === null || value === undefined) return NaN;
  const parsed = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(parsed) ? parsed : NaN;
};

const round2 = (value) => Math.round(value * 100) / 100;

/** Overall letter grade for a grade point average. */
export function overallGradeFor(gpa) {
  const band = CALICUT_OVERALL_GRADES.find((row) => gpa >= row.min);
  return band || CALICUT_OVERALL_GRADES[CALICUT_OVERALL_GRADES.length - 1];
}

/** Course grade band containing a percentage of marks, or null when out of range. */
export function bandForMarks(marks) {
  const value = toNumber(marks);
  if (Number.isNaN(value) || value < 0 || value > 100) return null;
  return CALICUT_GRADE_BANDS.find((row) => value >= row.minMarks) || null;
}

/**
 * Convert a Calicut CGPA or SGPA into the equivalent percentage of marks.
 *
 * @param {object} input
 * @param {number|string} input.cgpa Grade point average on the 10 point CBCSS scale.
 */
export function calicutGpaToPercentage({ cgpa } = {}) {
  const value = toNumber(cgpa);
  if (Number.isNaN(value)) return { error: "Enter the CGPA or SGPA as a number, for example 7.6." };
  if (value < 0) return { error: "A grade point average cannot be negative." };
  if (value > CALICUT_MAX_GPA) {
    return { error: `CBCSS uses a ${CALICUT_MAX_GPA} point scale, so the average cannot exceed ${CALICUT_MAX_GPA}.` };
  }

  const percentage = round2(value * CALICUT_PERCENT_PER_POINT);
  const overall = overallGradeFor(value);

  return {
    gpa: round2(value),
    percentage,
    grade: overall.grade,
    gradeLabel: overall.label,
    passing: value >= CALICUT_MIN_PASS_POINT,
    formula: `${round2(value)} x ${CALICUT_PERCENT_PER_POINT}`,
  };
}

/**
 * Reverse the equivalence: percentage of marks -> CBCSS grade point average.
 *
 * @param {object} input
 * @param {number|string} input.percentage Percentage of marks, 0 to 100.
 */
export function calicutPercentageToGpa({ percentage } = {}) {
  const value = toNumber(percentage);
  if (Number.isNaN(value)) return { error: "Enter a percentage of marks, for example 76." };
  if (value < 0 || value > 100) return { error: "A percentage of marks must be between 0 and 100." };

  const gpa = round2(value / CALICUT_PERCENT_PER_POINT);
  const overall = overallGradeFor(gpa);

  return {
    percentage: round2(value),
    gpa,
    grade: overall.grade,
    gradeLabel: overall.label,
    formula: `${round2(value)} / ${CALICUT_PERCENT_PER_POINT}`,
  };
}

/**
 * Credit weighted grade point average from a list of course letter grades.
 *
 * @param {Array<{grade: string, credits: number|string}>} courses
 */
export function calicutGpaFromGrades(courses) {
  if (!Array.isArray(courses) || courses.length === 0) {
    return { error: "Add at least one course." };
  }

  const pointByGrade = new Map(CALICUT_LETTER_POINTS.map((row) => [row.grade, row.point]));

  let weighted = 0;
  let credits = 0;
  let failedCredits = 0;
  const rows = [];

  for (let i = 0; i < courses.length; i += 1) {
    const grade = String(courses[i]?.grade ?? "").trim().toUpperCase();
    const credit = toNumber(courses[i]?.credits);

    if (!pointByGrade.has(grade)) {
      return { error: `Course ${i + 1}: pick a CBCSS grade (O, A+, A, B+, B, C, P or F).` };
    }
    if (Number.isNaN(credit)) return { error: `Course ${i + 1}: enter the credit value.` };
    if (credit < 0) return { error: `Course ${i + 1}: credits cannot be negative.` };

    const point = pointByGrade.get(grade);
    weighted += point * credit;
    credits += credit;
    if (point < CALICUT_MIN_PASS_POINT) failedCredits += credit;

    rows.push({ course: i + 1, grade, point, credits: credit, gradePoints: round2(point * credit) });
  }

  if (credits <= 0) return { error: "Total credits must be more than zero." };

  const gpa = round2(weighted / credits);
  const overall = overallGradeFor(gpa);

  return {
    gpa,
    percentage: round2(gpa * CALICUT_PERCENT_PER_POINT),
    totalCredits: round2(credits),
    totalGradePoints: round2(weighted),
    failedCredits: round2(failedCredits),
    grade: overall.grade,
    gradeLabel: overall.label,
    rows,
  };
}
