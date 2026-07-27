/**
 * University of Kerala grade point <-> percentage conversion.
 *
 * Kerala's choice based credit and semester system reports a grade point average whose
 * ceiling depends on which regulation your programme was admitted under. The mapping to
 * marks is a proportion of the scale, not a fixed formula:
 *
 *     percentage of marks = (CGPA / scale maximum) x 100
 *
 * On the current 10 point scale that reduces to the familiar CGPA x 10, which is why an
 * SGPA of 7.6 is read as 76%. On a 5 point mark list the same 7.6 would be impossible and
 * a 3.8 means 76% instead - so the scale printed on your own mark list is the single most
 * important input here, and getting it wrong doubles or halves the answer.
 *
 * Two further calculations are included, both exact:
 *
 *   CGPA from semester SGPAs   CGPA = sum(SGPA_i x credits_i) / sum(credits_i)
 *   SGPA still required        required = (target x totalCredits - current x doneCredits)
 *                                         / remainingCredits
 *
 * Pure module: no clock reads, no DOM, no randomness.
 */

/** Grade point ceilings that appear on Kerala mark lists across regulations. */
export const SCALE_OPTIONS = [
  { id: "10", max: 10, label: "Out of 10 (current CBCS / CBCSS)" },
  { id: "6", max: 6, label: "Out of 6" },
  { id: "5", max: 5, label: "Out of 5" },
  { id: "4", max: 4, label: "Out of 4" },
];

export const DEFAULT_SCALE = 10;

/**
 * Letter grade bands on the 10 point scale. Each band spans ten marks and its grade point
 * is a tenth of the band mid-point, which is what makes the straight x10 mapping consistent.
 * The pass floor is 35 marks on most programmes and 40 on several science and professional
 * ones - check the regulation your syllabus was framed under.
 */
export const KERALA_GRADE_BANDS = [
  { grade: "O", point: 10, minMarks: 95, maxMarks: 100, label: "Outstanding" },
  { grade: "A+", point: 9, minMarks: 85, maxMarks: 95, label: "Excellent" },
  { grade: "A", point: 8, minMarks: 75, maxMarks: 85, label: "Very good" },
  { grade: "B+", point: 7, minMarks: 65, maxMarks: 75, label: "Good" },
  { grade: "B", point: 6, minMarks: 55, maxMarks: 65, label: "Above average" },
  { grade: "C", point: 5, minMarks: 45, maxMarks: 55, label: "Average" },
  { grade: "P", point: 4, minMarks: 35, maxMarks: 45, label: "Pass" },
  { grade: "F", point: 0, minMarks: 0, maxMarks: 35, label: "Fail" },
];

/** Lowest passing grade point on the 10 point scale. */
export const KERALA_MIN_PASS_POINT = 4;

const toNumber = (value) => {
  if (value === "" || value === null || value === undefined) return NaN;
  const parsed = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(parsed) ? parsed : NaN;
};

const round2 = (value) => Math.round(value * 100) / 100;

const readScale = (scaleMax) => {
  const value = toNumber(scaleMax ?? DEFAULT_SCALE);
  if (Number.isNaN(value) || value <= 0) return null;
  return value;
};

/** Letter grade for a percentage of marks on the 10 point scale. */
export function gradeForPercentage(percentage) {
  const value = toNumber(percentage);
  if (Number.isNaN(value) || value < 0 || value > 100) return null;
  return KERALA_GRADE_BANDS.find((row) => value >= row.minMarks) || null;
}

/**
 * Convert a Kerala CGPA or SGPA into the equivalent percentage of marks.
 *
 * @param {object} input
 * @param {number|string} input.cgpa Grade point average as printed on the mark list.
 * @param {number|string} [input.scaleMax] Ceiling of that scale, 10 by default.
 */
export function keralaGpaToPercentage({ cgpa, scaleMax = DEFAULT_SCALE } = {}) {
  const value = toNumber(cgpa);
  const max = readScale(scaleMax);
  if (max === null) return { error: "Pick the grade point scale printed on your mark list." };
  if (Number.isNaN(value)) return { error: "Enter the CGPA or SGPA as a number, for example 7.6." };
  if (value < 0) return { error: "A grade point average cannot be negative." };
  if (value > max) {
    return { error: `On a ${max} point scale the average cannot exceed ${max}. Check which scale your mark list uses.` };
  }

  const percentage = round2((value / max) * 100);
  const band = gradeForPercentage(percentage);

  return {
    gpa: round2(value),
    scaleMax: max,
    percentage,
    grade: band ? band.grade : "F",
    gradeLabel: band ? band.label : "Fail",
    passing: max === 10 ? value >= KERALA_MIN_PASS_POINT : percentage >= 40,
    formula: `(${round2(value)} / ${max}) x 100`,
  };
}

/**
 * Reverse the mapping: percentage of marks -> grade point average on the chosen scale.
 *
 * @param {object} input
 * @param {number|string} input.percentage Percentage of marks, 0 to 100.
 * @param {number|string} [input.scaleMax] Ceiling of the scale, 10 by default.
 */
export function keralaPercentageToGpa({ percentage, scaleMax = DEFAULT_SCALE } = {}) {
  const value = toNumber(percentage);
  const max = readScale(scaleMax);
  if (max === null) return { error: "Pick the grade point scale printed on your mark list." };
  if (Number.isNaN(value)) return { error: "Enter a percentage of marks, for example 76." };
  if (value < 0 || value > 100) return { error: "A percentage of marks must be between 0 and 100." };

  const band = gradeForPercentage(value);
  return {
    percentage: round2(value),
    gpa: round2((value / 100) * max),
    scaleMax: max,
    grade: band ? band.grade : "F",
    gradeLabel: band ? band.label : "Fail",
    formula: `(${round2(value)} / 100) x ${max}`,
  };
}

/**
 * Credit weighted CGPA from a list of semester SGPAs.
 *
 * @param {Array<{sgpa: number|string, credits: number|string}>} semesters
 * @param {number|string} [scaleMax] Ceiling of the scale, 10 by default.
 */
export function keralaCgpaFromSemesters(semesters, scaleMax = DEFAULT_SCALE) {
  const max = readScale(scaleMax);
  if (max === null) return { error: "Pick the grade point scale printed on your mark list." };
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
    if (sgpa < 0 || sgpa > max) {
      return { error: `Semester ${i + 1}: SGPA must be between 0 and ${max}.` };
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
    scaleMax: max,
    totalCredits: round2(credits),
    weightedPoints: round2(weighted),
    percentage: round2((cgpa / max) * 100),
    rows,
  };
}

/**
 * The average SGPA the remaining credits must carry to land on a target CGPA.
 *
 * Total grade points needed = target x (done + remaining) credits.
 * Points already banked     = current CGPA x done credits.
 *
 * @param {object} input
 * @param {number|string} input.currentCgpa CGPA so far.
 * @param {number|string} input.creditsDone Credits already completed.
 * @param {number|string} input.creditsRemaining Credits still to be taken.
 * @param {number|string} input.targetCgpa CGPA you want at the end.
 * @param {number|string} [input.scaleMax] Ceiling of the scale, 10 by default.
 */
export function requiredSgpaForTarget({
  currentCgpa,
  creditsDone,
  creditsRemaining,
  targetCgpa,
  scaleMax = DEFAULT_SCALE,
} = {}) {
  const max = readScale(scaleMax);
  if (max === null) return { error: "Pick the grade point scale printed on your mark list." };

  const current = toNumber(currentCgpa);
  const done = toNumber(creditsDone);
  const remaining = toNumber(creditsRemaining);
  const target = toNumber(targetCgpa);

  if ([current, done, remaining, target].some(Number.isNaN)) {
    return { error: "Fill every field with a number." };
  }
  if (done < 0 || remaining < 0) return { error: "Credit counts cannot be negative." };
  if (current < 0 || current > max) return { error: `Current CGPA must be between 0 and ${max}.` };
  if (target < 0 || target > max) return { error: `Target CGPA must be between 0 and ${max}.` };
  if (!(remaining > 0)) {
    return { error: "There must be at least one credit left for the target to be reachable." };
  }

  const totalCredits = done + remaining;
  const pointsNeeded = target * totalCredits;
  const pointsBanked = current * done;
  const required = (pointsNeeded - pointsBanked) / remaining;

  return {
    requiredSgpa: round2(Math.max(0, required)),
    rawRequired: round2(required),
    scaleMax: max,
    totalCredits: round2(totalCredits),
    achievable: required <= max,
    alreadyAchieved: required <= 0,
    requiredPercentage: round2(Math.min(100, Math.max(0, (required / max) * 100))),
    // Best possible final CGPA if every remaining credit scores the maximum grade point.
    bestPossibleCgpa: round2((pointsBanked + max * remaining) / totalCredits),
  };
}
