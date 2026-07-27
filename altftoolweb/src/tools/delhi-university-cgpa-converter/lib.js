/**
 * University of Delhi CGPA <-> percentage conversion.
 *
 * DU follows the UGC's Choice Based Credit System. Its notified equivalence is
 * the UGC multiplier:
 *
 *   Final percentage of marks = CGPA across all semesters x 9.5
 *
 * The 9.5 comes from the UGC's CBCS grading template, where the top grade point
 * of 10 maps to the mid-point of the 90-100 mark band and every step of one
 * grade point is worth roughly 9.5 marks.
 *
 * CGPA itself is the credit-weighted mean of semester grade point averages:
 *
 *   CGPA = sum(credit_i * SGPA_i) / sum(credit_i)
 *
 * Averaging the six SGPAs without credits gives a slightly different answer
 * whenever the semesters carry unequal credits, so both are offered and the
 * difference is shown.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

export const MAX_CGPA = 10;
export const MIN_CGPA = 0;

/** The UGC CBCS multiplier used in DU's own conversion notification. */
export const UGC_MULTIPLIER = 9.5;

/** Linear rules of the form percentage = m * CGPA + c. */
export const RULES = {
  ugc: {
    id: "ugc",
    label: "DU notified rule — CGPA x 9.5",
    m: UGC_MULTIPLIER,
    c: 0,
    expression: "CGPA x 9.5",
    note: "The UGC CBCS equivalence that DU's conversion notification adopts, applied to the CGPA across all semesters of the programme.",
  },
  timesTen: {
    id: "timesTen",
    label: "Plain multiply — CGPA x 10",
    m: 10,
    c: 0,
    expression: "CGPA x 10",
    note: "A rough equivalence some employers accept. It reads about half a percentage point higher per CGPA point than the notified rule, so do not substitute it on an official form.",
  },
};

/**
 * UGC CBCS letter grades and grade points, the scale DU marksheets use.
 * Ab marks an absence and carries no grade point.
 */
export const GRADE_POINTS = [
  { letter: "O", point: 10, label: "Outstanding" },
  { letter: "A+", point: 9, label: "Excellent" },
  { letter: "A", point: 8, label: "Very good" },
  { letter: "B+", point: 7, label: "Good" },
  { letter: "B", point: 6, label: "Above average" },
  { letter: "C", point: 5, label: "Average" },
  { letter: "P", point: 4, label: "Pass" },
  { letter: "F", point: 0, label: "Fail" },
  { letter: "Ab", point: 0, label: "Absent" },
];

/**
 * Percentage thresholds a DU graduate most often has to clear, with the source
 * of each so the number can be checked.
 */
export const ELIGIBILITY_THRESHOLDS = [
  {
    id: "netGeneral",
    percent: 55,
    label: "UGC NET / Assistant Professor eligibility — general category",
    source: "UGC NET requires at least 55% in the master's degree for unreserved candidates.",
  },
  {
    id: "netReserved",
    percent: 50,
    label: "UGC NET — SC / ST / OBC-NCL / PwD / third gender",
    source: "A 5 percentage point relaxation applies to reserved-category candidates.",
  },
  {
    id: "pgTypical",
    percent: 50,
    label: "Common minimum for postgraduate admission",
    source: "Many DU postgraduate programmes set 50% in the qualifying degree as the floor.",
  },
  {
    id: "firstClass",
    percent: 60,
    label: "First Class / First Division",
    source: "The conventional First Division threshold used by employers and scholarship schemes.",
  },
  {
    id: "distinction",
    percent: 75,
    label: "Distinction",
    source: "The conventional Distinction threshold; some schemes set it at 70%.",
  },
];

const isNum = (v) => typeof v === "number" && Number.isFinite(v);
const round2 = (v) => Math.round(v * 100) / 100;

/**
 * CGPA -> percentage.
 *
 * @param {number} cgpa
 * @param {string} ruleId
 * @returns {{ percent: number, rule: object } | { error: string }}
 */
export function cgpaToPercentage(cgpa, ruleId) {
  const rule = RULES[ruleId];
  if (!rule) return { error: "Choose a conversion rule." };
  if (!isNum(cgpa)) return { error: "Enter your CGPA as a number." };
  if (cgpa < MIN_CGPA || cgpa > MAX_CGPA) {
    return { error: `DU CGPA runs from ${MIN_CGPA} to ${MAX_CGPA}.` };
  }
  const raw = rule.m * cgpa + rule.c;
  const percent = Math.min(100, Math.max(0, raw));
  return { percent: round2(percent), rule, clamped: raw !== percent };
}

/**
 * Percentage -> CGPA.
 *
 * @param {number} percent
 * @param {string} ruleId
 * @returns {{ cgpa: number } | { error: string }}
 */
export function percentageToCgpa(percent, ruleId) {
  const rule = RULES[ruleId];
  if (!rule) return { error: "Choose a conversion rule." };
  if (!isNum(percent)) return { error: "Enter the percentage as a number." };
  if (percent < 0 || percent > 100) return { error: "A percentage must be between 0 and 100." };
  const raw = (percent - rule.c) / rule.m;
  if (raw > MAX_CGPA) {
    return { error: `Under ${rule.expression} the highest reachable percentage is ${round2(rule.m * MAX_CGPA + rule.c)}%.` };
  }
  return { cgpa: round2(Math.max(MIN_CGPA, raw)) };
}

/**
 * CGPA from semester SGPAs, both credit-weighted and as a plain mean, so the
 * gap between the two methods is visible.
 *
 * @param {Array<{ credits: number, sgpa: number }>} semesters
 * @returns {object | { error: string }}
 */
export function cgpaFromSemesters(semesters) {
  if (!Array.isArray(semesters)) return { error: "Add at least one semester." };
  const rows = semesters.filter((r) => r && isNum(r.credits) && isNum(r.sgpa) && r.credits > 0);
  if (rows.length === 0) return { error: "Enter credits and an SGPA for at least one semester." };
  const bad = rows.find((r) => r.sgpa < MIN_CGPA || r.sgpa > MAX_CGPA);
  if (bad) return { error: `Every SGPA must be between ${MIN_CGPA} and ${MAX_CGPA}.` };

  const totalCredits = rows.reduce((s, r) => s + r.credits, 0);
  const weighted = rows.reduce((s, r) => s + r.credits * r.sgpa, 0) / totalCredits;
  const simple = rows.reduce((s, r) => s + r.sgpa, 0) / rows.length;

  return {
    weightedCgpa: round2(weighted),
    simpleAverageCgpa: round2(simple),
    difference: round2(weighted - simple),
    totalCredits: round2(totalCredits),
    counted: rows.length,
  };
}

/**
 * Which eligibility thresholds a CGPA clears, and the CGPA each one needs.
 *
 * @param {number} cgpa
 * @param {string} ruleId
 * @returns {Array<object>}
 */
export function eligibilityCheck(cgpa, ruleId) {
  const converted = cgpaToPercentage(cgpa, ruleId);
  if (converted.error) return [];
  const rule = RULES[ruleId];
  return ELIGIBILITY_THRESHOLDS.map((threshold) => {
    const cgpaNeeded = (threshold.percent - rule.c) / rule.m;
    const met = converted.percent + 1e-9 >= threshold.percent;
    return {
      ...threshold,
      cgpaNeeded: round2(cgpaNeeded),
      met,
      gapPercent: met ? 0 : round2(threshold.percent - converted.percent),
    };
  });
}

/**
 * SGPA needed in the semesters still to come to finish on a target CGPA.
 *
 * From target * (done + left) = current * done + x * left.
 *
 * @param {object} input
 * @param {number} input.currentCgpa
 * @param {number} input.completedCredits
 * @param {number} input.remainingCredits
 * @param {number} input.targetCgpa
 * @returns {{ requiredSgpa: number, achievable: boolean } | { error: string }}
 */
export function requiredSgpaForTarget({
  currentCgpa,
  completedCredits,
  remainingCredits,
  targetCgpa,
}) {
  if (!isNum(currentCgpa) || currentCgpa < MIN_CGPA || currentCgpa > MAX_CGPA) {
    return { error: `Current CGPA must be between ${MIN_CGPA} and ${MAX_CGPA}.` };
  }
  if (!isNum(targetCgpa) || targetCgpa < MIN_CGPA || targetCgpa > MAX_CGPA) {
    return { error: `Target CGPA must be between ${MIN_CGPA} and ${MAX_CGPA}.` };
  }
  if (!isNum(completedCredits) || completedCredits < 0) {
    return { error: "Credits completed must be zero or more." };
  }
  if (!isNum(remainingCredits) || remainingCredits <= 0) {
    return { error: "Credits still to go must be more than zero." };
  }
  const required =
    (targetCgpa * (completedCredits + remainingCredits) - currentCgpa * completedCredits) /
    remainingCredits;
  return {
    requiredSgpa: round2(required),
    achievable: required <= MAX_CGPA + 1e-9 && required >= MIN_CGPA - 1e-9,
  };
}
