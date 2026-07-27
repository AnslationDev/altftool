/**
 * RGPV (Rajiv Gandhi Proudyogiki Vishwavidyalaya, Bhopal) CGPA <-> percentage conversion.
 *
 * RGPV runs a credit based grading system on a 10 point scale and publishes a single
 * linear equivalence between the cumulative grade point average and marks:
 *
 *     percentage of marks = (CGPA - 0.75) x 10
 *
 * The 0.75 offset exists because each letter grade covers a band of marks and the grade
 * point sits at the top of that band; subtracting three quarters of a grade point brings
 * the grade average back to the middle of the marks band it represents. The inverse is
 * therefore CGPA = (percentage / 10) + 0.75.
 *
 * A semester grade point average (SGPA) is converted with exactly the same expression -
 * the formula does not care whether the average covers one semester or the whole degree.
 *
 * Everything here is pure: no clock reads, no DOM, no randomness.
 */

/** RGPV's published offset in the CGPA-to-marks equivalence. */
export const RGPV_OFFSET = 0.75;
/** The grading scale is a 10 point scale. */
export const RGPV_MAX_CGPA = 10;
/** Grade point 4 (grade D) is the lowest passing grade in a subject. */
export const RGPV_MIN_PASS_GRADE_POINT = 4;

/**
 * RGPV credit based grading scheme: marks band -> letter grade -> grade point.
 * Bands are inclusive of `minMarks`. Confirm against the ordinance printed on your
 * own mark sheet, since RGPV has revised band edges between scheme years.
 */
export const RGPV_GRADE_SCALE = [
  { grade: "A+", point: 10, minMarks: 90, maxMarks: 100, label: "Outstanding" },
  { grade: "A", point: 9, minMarks: 80, maxMarks: 89, label: "Excellent" },
  { grade: "B+", point: 8, minMarks: 70, maxMarks: 79, label: "Very good" },
  { grade: "B", point: 7, minMarks: 60, maxMarks: 69, label: "Good" },
  { grade: "C+", point: 6, minMarks: 50, maxMarks: 59, label: "Average" },
  { grade: "C", point: 5, minMarks: 45, maxMarks: 49, label: "Below average" },
  { grade: "D", point: 4, minMarks: 40, maxMarks: 44, label: "Pass" },
  { grade: "F", point: 0, minMarks: 0, maxMarks: 39, label: "Fail" },
];

/**
 * Degree class bands used across Indian universities and by most employers and
 * recruitment boards when they read an equivalent percentage. RGPV prints the actual
 * division on the transcript - this is the conventional reading, not a university rule.
 */
export const DIVISION_BANDS = [
  { minPercent: 75, label: "First division with distinction" },
  { minPercent: 60, label: "First division" },
  { minPercent: 45, label: "Second division" },
  { minPercent: 40, label: "Pass / third division" },
  { minPercent: 0, label: "Below pass" },
];

const toNumber = (value) => {
  if (value === "" || value === null || value === undefined) return NaN;
  const parsed = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(parsed) ? parsed : NaN;
};

const round2 = (value) => Math.round(value * 100) / 100;

/** Letter grade whose marks band contains `marks`, or null if marks are out of range. */
export function gradeForMarks(marks) {
  const value = toNumber(marks);
  if (Number.isNaN(value) || value < 0 || value > 100) return null;
  return RGPV_GRADE_SCALE.find((row) => value >= row.minMarks) || null;
}

/** Division label for an equivalent percentage. */
export function divisionForPercentage(percentage) {
  const band = DIVISION_BANDS.find((row) => percentage >= row.minPercent);
  return band ? band.label : DIVISION_BANDS[DIVISION_BANDS.length - 1].label;
}

/**
 * Convert an RGPV CGPA (or SGPA) into the equivalent percentage of marks.
 *
 * @param {object} input
 * @param {number|string} input.cgpa Grade point average on the 10 point scale.
 */
export function rgpvCgpaToPercentage({ cgpa } = {}) {
  const value = toNumber(cgpa);
  if (Number.isNaN(value)) return { error: "Enter your CGPA as a number, for example 7.84." };
  if (value < 0) return { error: "A CGPA cannot be negative." };
  if (value > RGPV_MAX_CGPA) {
    return { error: `RGPV grades on a ${RGPV_MAX_CGPA} point scale, so the CGPA cannot exceed ${RGPV_MAX_CGPA}.` };
  }

  const raw = (value - RGPV_OFFSET) * 10;
  // Below CGPA 0.75 the linear equivalence dips under zero, which is not a real mark.
  const percentage = round2(Math.max(0, raw));
  const equivalentGrade = RGPV_GRADE_SCALE.find((row) => value >= row.point) || null;

  return {
    cgpa: round2(value),
    percentage,
    marksOutOf1000: Math.round(percentage * 10),
    division: divisionForPercentage(percentage),
    passing: value >= RGPV_MIN_PASS_GRADE_POINT,
    clamped: raw < 0,
    nearestGrade: equivalentGrade ? equivalentGrade.grade : "F",
    formula: `(${round2(value)} - ${RGPV_OFFSET}) x 10`,
  };
}

/**
 * Reverse the equivalence: percentage of marks -> RGPV CGPA.
 *
 * @param {object} input
 * @param {number|string} input.percentage Percentage of marks, 0 to 100.
 */
export function rgpvPercentageToCgpa({ percentage } = {}) {
  const value = toNumber(percentage);
  if (Number.isNaN(value)) return { error: "Enter a percentage, for example 72.5." };
  if (value < 0 || value > 100) return { error: "A percentage of marks must be between 0 and 100." };

  const raw = value / 10 + RGPV_OFFSET;
  const cgpa = round2(Math.min(RGPV_MAX_CGPA, raw));

  return {
    percentage: round2(value),
    cgpa,
    clamped: raw > RGPV_MAX_CGPA,
    division: divisionForPercentage(value),
    formula: `(${round2(value)} / 10) + ${RGPV_OFFSET}`,
  };
}

/**
 * Combine semester SGPAs into a CGPA. RGPV weights each semester by the credits earned
 * in it, so a light semester moves the cumulative average less than a heavy one:
 *
 *     CGPA = sum(SGPA_i x credits_i) / sum(credits_i)
 *
 * @param {Array<{sgpa: number|string, credits: number|string}>} semesters
 */
export function rgpvCgpaFromSemesters(semesters) {
  if (!Array.isArray(semesters) || semesters.length === 0) {
    return { error: "Add at least one semester." };
  }

  let weighted = 0;
  let credits = 0;
  const rows = [];

  for (let i = 0; i < semesters.length; i += 1) {
    const sgpa = toNumber(semesters[i]?.sgpa);
    const credit = toNumber(semesters[i]?.credits);
    if (Number.isNaN(sgpa) || Number.isNaN(credit)) {
      return { error: `Semester ${i + 1} needs both an SGPA and a credit count.` };
    }
    if (sgpa < 0 || sgpa > RGPV_MAX_CGPA) {
      return { error: `Semester ${i + 1}: SGPA must be between 0 and ${RGPV_MAX_CGPA}.` };
    }
    if (credit < 0) return { error: `Semester ${i + 1}: credits cannot be negative.` };

    weighted += sgpa * credit;
    credits += credit;
    rows.push({ semester: i + 1, sgpa: round2(sgpa), credits: credit });
  }

  if (credits <= 0) return { error: "Total credits must be more than zero." };

  const cgpa = round2(weighted / credits);
  return {
    cgpa,
    totalCredits: round2(credits),
    weightedPoints: round2(weighted),
    percentage: round2(Math.max(0, (cgpa - RGPV_OFFSET) * 10)),
    rows,
  };
}
