/**
 * Osmania University CGPA <-> percentage conversion.
 *
 * Osmania's CBCS regulations state the equivalence between the cumulative grade point
 * average and marks as a linear rule with a half-point offset:
 *
 *     percentage of marks = (CGPA - 0.5) x 10          (equivalently CGPA x 10 - 5)
 *     CGPA                = (percentage / 10) + 0.5
 *
 * The offset exists because a letter grade is awarded over a band of marks and the grade
 * point sits above the middle of that band; half a grade point brings the average back to
 * the marks it actually represents.
 *
 * A few Osmania affiliated programmes and older non-CBCS schemes instead print a straight
 * scaling with no offset, so both conventions are exposed and the caller chooses. Never
 * mix them: at CGPA 8.0 they differ by five full marks (75% against 80%).
 *
 * Semester averages roll up by credit weight:
 *
 *     CGPA = sum(SGPA_i x credits_i) / sum(credits_i)
 *
 * Pure module: no clock reads, no DOM, no randomness.
 */

/** Offset in Osmania's CBCS equivalence. */
export const OU_OFFSET = 0.5;
/** Scale ceiling. */
export const OU_MAX_CGPA = 10;
/** Grade point 4 is the lowest passing grade in a course under CBCS. */
export const OU_MIN_PASS_POINT = 4;

/** The two conventions in circulation, keyed for the interface. */
export const OU_FORMULAS = [
  {
    id: "cbcs",
    label: "CBCS rule: (CGPA - 0.5) x 10",
    offset: OU_OFFSET,
    describe: (cgpa) => `(${cgpa} - ${OU_OFFSET}) x 10`,
  },
  {
    id: "direct",
    label: "Direct scaling: CGPA x 10",
    offset: 0,
    describe: (cgpa) => `${cgpa} x 10`,
  },
];

/**
 * Degree class bands as employers and recruitment boards commonly read an equivalent
 * percentage. Osmania prints the class on the transcript itself - this is the convention,
 * not a university rule.
 */
export const CLASS_BANDS = [
  { minPercent: 70, label: "First class with distinction" },
  { minPercent: 60, label: "First class" },
  { minPercent: 50, label: "Second class" },
  { minPercent: 40, label: "Pass class" },
  { minPercent: 0, label: "Below pass" },
];

/** Cut-offs that application forms most often set. */
export const COMMON_CUTOFFS = [50, 55, 60, 65, 70, 75];

const toNumber = (value) => {
  if (value === "" || value === null || value === undefined) return NaN;
  const parsed = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(parsed) ? parsed : NaN;
};

const round2 = (value) => Math.round(value * 100) / 100;

const formulaById = (id) => OU_FORMULAS.find((row) => row.id === id) || OU_FORMULAS[0];

/** Degree class label for an equivalent percentage. */
export function classForPercentage(percentage) {
  const band = CLASS_BANDS.find((row) => percentage >= row.minPercent);
  return band ? band.label : CLASS_BANDS[CLASS_BANDS.length - 1].label;
}

/**
 * Convert an Osmania CGPA or SGPA into the equivalent percentage of marks.
 *
 * @param {object} input
 * @param {number|string} input.cgpa Grade point average on the 10 point scale.
 * @param {string} [input.formula] "cbcs" (default) or "direct".
 */
export function ouCgpaToPercentage({ cgpa, formula = "cbcs" } = {}) {
  const value = toNumber(cgpa);
  if (Number.isNaN(value)) return { error: "Enter your CGPA as a number, for example 8.12." };
  if (value < 0) return { error: "A CGPA cannot be negative." };
  if (value > OU_MAX_CGPA) {
    return { error: `Osmania grades on a ${OU_MAX_CGPA} point scale, so the CGPA cannot exceed ${OU_MAX_CGPA}.` };
  }

  const rule = formulaById(formula);
  const raw = (value - rule.offset) * 10;
  // Below the offset the linear rule dips under zero, which is not a real mark.
  const percentage = round2(Math.max(0, raw));

  return {
    cgpa: round2(value),
    percentage,
    formulaId: rule.id,
    formulaLabel: rule.label,
    formula: rule.describe(round2(value)),
    degreeClass: classForPercentage(percentage),
    passing: value >= OU_MIN_PASS_POINT,
    clamped: raw < 0,
    // Difference the choice of convention makes, in marks.
    conventionGap: round2(Math.abs(OU_OFFSET * 10)),
    cutoffsCleared: COMMON_CUTOFFS.filter((cut) => percentage >= cut),
  };
}

/**
 * Reverse the equivalence: percentage of marks -> Osmania CGPA.
 *
 * @param {object} input
 * @param {number|string} input.percentage Percentage of marks, 0 to 100.
 * @param {string} [input.formula] "cbcs" (default) or "direct".
 */
export function ouPercentageToCgpa({ percentage, formula = "cbcs" } = {}) {
  const value = toNumber(percentage);
  if (Number.isNaN(value)) return { error: "Enter a percentage of marks, for example 65." };
  if (value < 0 || value > 100) return { error: "A percentage of marks must be between 0 and 100." };

  const rule = formulaById(formula);
  const raw = value / 10 + rule.offset;
  const cgpa = round2(Math.min(OU_MAX_CGPA, raw));

  return {
    percentage: round2(value),
    cgpa,
    formulaId: rule.id,
    formulaLabel: rule.label,
    formula:
      rule.offset === 0
        ? `${round2(value)} / 10`
        : `(${round2(value)} / 10) + ${rule.offset}`,
    degreeClass: classForPercentage(value),
    clamped: raw > OU_MAX_CGPA,
  };
}

/** The CGPA needed to reach each common cut-off under the chosen convention. */
export function cutoffTable(formula = "cbcs") {
  const rule = formulaById(formula);
  return COMMON_CUTOFFS.map((cut) => ({
    percentage: cut,
    cgpa: round2(Math.min(OU_MAX_CGPA, cut / 10 + rule.offset)),
  }));
}

/**
 * Roll semester SGPAs up into a CGPA, weighted by the credits registered in each semester.
 *
 * @param {Array<{sgpa: number|string, credits: number|string}>} semesters
 * @param {string} [formula] "cbcs" (default) or "direct".
 */
export function ouCgpaFromSemesters(semesters, formula = "cbcs") {
  if (!Array.isArray(semesters) || semesters.length === 0) {
    return { error: "Add at least one semester." };
  }

  const rule = formulaById(formula);
  let weighted = 0;
  let credits = 0;
  const rows = [];

  for (let i = 0; i < semesters.length; i += 1) {
    const sgpa = toNumber(semesters[i]?.sgpa);
    const credit = toNumber(semesters[i]?.credits);
    if (Number.isNaN(sgpa) || Number.isNaN(credit)) {
      return { error: `Semester ${i + 1} needs both an SGPA and a credit count.` };
    }
    if (sgpa < 0 || sgpa > OU_MAX_CGPA) {
      return { error: `Semester ${i + 1}: SGPA must be between 0 and ${OU_MAX_CGPA}.` };
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
    percentage: round2(Math.max(0, (cgpa - rule.offset) * 10)),
    degreeClass: classForPercentage(Math.max(0, (cgpa - rule.offset) * 10)),
    rows,
  };
}
