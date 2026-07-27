/**
 * Visvesvaraya Technological University (VTU) CGPA <-> percentage conversion.
 *
 * VTU's Choice Based Credit System computes:
 *   SGPA  = sum(credit_i * gradePoint_i) / sum(credit_i)   over one semester
 *   CGPA  = sum(credit_j * SGPA_j) / sum(credit_j)         over all semesters
 *
 * The percentage equivalent is a linear map of CGPA, and which map applies
 * depends on the scheme printed on your grade card. Under the 2015, 2017 and
 * 2018 CBCS schemes VTU's stated equivalence deducts 0.75 before multiplying;
 * grade cards under the 2021 and 2022 schemes quote the plain multiply. Both
 * are provided here rather than one being assumed.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

export const MAX_CGPA = 10;
export const MIN_CGPA = 0;

/** Linear rules of the form percentage = m * CGPA + c. */
export const RULES = {
  scheme2018: {
    id: "scheme2018",
    label: "2015 / 2017 / 2018 CBCS scheme — (CGPA - 0.75) x 10",
    m: 10,
    c: -7.5,
    expression: "(CGPA - 0.75) x 10",
    note: "The equivalence VTU states for the CBCS schemes introduced from 2015 onwards.",
  },
  scheme2022: {
    id: "scheme2022",
    label: "2021 / 2022 scheme — CGPA x 10",
    m: 10,
    c: 0,
    expression: "CGPA x 10",
    note: "Used on grade cards issued under the newer schemes, where no deduction is applied.",
  },
  ugc: {
    id: "ugc",
    label: "UGC equivalence — CGPA x 9.5",
    m: 9.5,
    c: 0,
    expression: "CGPA x 9.5",
    note: "The UGC's general CBCS equivalence, asked for by some central-government and overseas application forms.",
  },
};

/**
 * VTU letter grades, mark bands and grade points under the CBCS schemes.
 * F carries no grade point and the credits are not earned until cleared.
 */
export const GRADE_POINTS = [
  { letter: "O", point: 10, marks: "90 - 100", label: "Outstanding" },
  { letter: "A+", point: 9, marks: "80 - 89", label: "Excellent" },
  { letter: "A", point: 8, marks: "70 - 79", label: "Very good" },
  { letter: "B+", point: 7, marks: "60 - 69", label: "Good" },
  { letter: "B", point: 6, marks: "55 - 59", label: "Above average" },
  { letter: "C", point: 5, marks: "50 - 54", label: "Average" },
  { letter: "P", point: 4, marks: "40 - 49", label: "Pass" },
  { letter: "F", point: 0, marks: "below 40", label: "Fail" },
];

/**
 * Class awarded on the converted percentage. These are the bands VTU grade
 * cards and most Karnataka employers use; the exact wording can vary by
 * programme, so treat them as the common convention.
 */
export const CLASS_BANDS = [
  { id: "fcd", min: 70, label: "First Class with Distinction" },
  { id: "fc", min: 60, label: "First Class" },
  { id: "sc", min: 50, label: "Second Class" },
  { id: "pass", min: 40, label: "Pass Class" },
];

/** Percentage cutoffs companies most often set for VTU campus eligibility. */
export const ELIGIBILITY_CUTOFFS = [50, 55, 60, 65, 70, 75];

const isNum = (v) => typeof v === "number" && Number.isFinite(v);
const round2 = (v) => Math.round(v * 100) / 100;

/**
 * CGPA -> percentage under one scheme rule.
 *
 * @param {number} cgpa
 * @param {string} ruleId
 * @returns {{ percent: number, rule: object, clamped: boolean } | { error: string }}
 */
export function cgpaToPercentage(cgpa, ruleId) {
  const rule = RULES[ruleId];
  if (!rule) return { error: "Choose the scheme printed on your grade card." };
  if (!isNum(cgpa)) return { error: "Enter your CGPA as a number." };
  if (cgpa < MIN_CGPA || cgpa > MAX_CGPA) {
    return { error: `VTU CGPA runs from ${MIN_CGPA} to ${MAX_CGPA}.` };
  }
  const raw = rule.m * cgpa + rule.c;
  const percent = Math.min(100, Math.max(0, raw));
  return { percent: round2(percent), rule, clamped: raw !== percent };
}

/**
 * Percentage -> CGPA under the same rule.
 *
 * @param {number} percent
 * @param {string} ruleId
 * @returns {{ cgpa: number } | { error: string }}
 */
export function percentageToCgpa(percent, ruleId) {
  const rule = RULES[ruleId];
  if (!rule) return { error: "Choose the scheme printed on your grade card." };
  if (!isNum(percent)) return { error: "Enter the percentage as a number." };
  if (percent < 0 || percent > 100) return { error: "A percentage must be between 0 and 100." };
  const raw = (percent - rule.c) / rule.m;
  if (raw < MIN_CGPA || raw > MAX_CGPA) {
    return { error: `That percentage falls outside the ${MIN_CGPA}-${MAX_CGPA} CGPA scale for this scheme.` };
  }
  return { cgpa: round2(raw) };
}

/**
 * SGPA from a semester's subjects.
 *
 * @param {Array<{ credits: number, point: number }>} subjects
 * @returns {{ sgpa: number, totalCredits: number, totalPoints: number, counted: number } | { error: string }}
 */
export function sgpaFromSubjects(subjects) {
  if (!Array.isArray(subjects)) return { error: "Add at least one subject." };
  const rows = subjects.filter(
    (r) => r && isNum(r.credits) && isNum(r.point) && r.credits > 0,
  );
  if (rows.length === 0) return { error: "Enter credits and a grade point for at least one subject." };
  const bad = rows.find((r) => r.point < 0 || r.point > MAX_CGPA);
  if (bad) return { error: `Grade points run from 0 to ${MAX_CGPA}.` };

  const totalCredits = rows.reduce((s, r) => s + r.credits, 0);
  if (totalCredits <= 0) return { error: "Total credits must be greater than zero." };
  const totalPoints = rows.reduce((s, r) => s + r.credits * r.point, 0);

  return {
    sgpa: round2(totalPoints / totalCredits),
    totalCredits: round2(totalCredits),
    totalPoints: round2(totalPoints),
    counted: rows.length,
  };
}

/**
 * CGPA from semester SGPAs weighted by each semester's credits.
 *
 * @param {Array<{ credits: number, sgpa: number }>} semesters
 * @returns {{ cgpa: number, totalCredits: number } | { error: string }}
 */
export function cgpaFromSemesters(semesters) {
  if (!Array.isArray(semesters)) return { error: "Add at least one semester." };
  const rows = semesters.filter(
    (r) => r && isNum(r.credits) && isNum(r.sgpa) && r.credits > 0,
  );
  if (rows.length === 0) return { error: "Enter credits and an SGPA for at least one semester." };
  const bad = rows.find((r) => r.sgpa < MIN_CGPA || r.sgpa > MAX_CGPA);
  if (bad) return { error: `Every SGPA must be between ${MIN_CGPA} and ${MAX_CGPA}.` };

  const totalCredits = rows.reduce((s, r) => s + r.credits, 0);
  const totalPoints = rows.reduce((s, r) => s + r.credits * r.sgpa, 0);
  return { cgpa: round2(totalPoints / totalCredits), totalCredits: round2(totalCredits) };
}

/**
 * Class awarded for a converted percentage.
 *
 * @param {number} percent
 * @returns {{ id: string, label: string } | { error: string }}
 */
export function classForPercentage(percent) {
  if (!isNum(percent) || percent < 0 || percent > 100) {
    return { error: "Enter a percentage between 0 and 100." };
  }
  for (const band of CLASS_BANDS) {
    if (percent + 1e-9 >= band.min) return { id: band.id, label: band.label };
  }
  return { id: "none", label: "Below the pass class" };
}

/**
 * The CGPA needed to reach each common placement cutoff under the chosen rule,
 * with how far the student currently is from it.
 *
 * @param {number} currentCgpa
 * @param {string} ruleId
 * @returns {Array<{ percent: number, cgpaNeeded: number, met: boolean, gap: number }>}
 */
export function eligibilityLadder(currentCgpa, ruleId) {
  const rule = RULES[ruleId];
  if (!rule || !isNum(currentCgpa)) return [];
  return ELIGIBILITY_CUTOFFS.map((percent) => {
    const cgpaNeeded = (percent - rule.c) / rule.m;
    if (!Number.isFinite(cgpaNeeded) || cgpaNeeded > MAX_CGPA) return null;
    const met = currentCgpa + 1e-9 >= cgpaNeeded;
    return {
      percent,
      cgpaNeeded: round2(Math.max(MIN_CGPA, cgpaNeeded)),
      met,
      gap: met ? 0 : round2(cgpaNeeded - currentCgpa),
    };
  }).filter(Boolean);
}

/**
 * The same CGPA under every rule, for comparing scheme to scheme.
 *
 * @param {number} cgpa
 * @returns {Array<{ id: string, expression: string, label: string, percent: number }>}
 */
export function compareRules(cgpa) {
  return Object.values(RULES)
    .map((rule) => {
      const out = cgpaToPercentage(cgpa, rule.id);
      if (out.error) return null;
      return { id: rule.id, expression: rule.expression, label: rule.label, percent: out.percent };
    })
    .filter(Boolean);
}
