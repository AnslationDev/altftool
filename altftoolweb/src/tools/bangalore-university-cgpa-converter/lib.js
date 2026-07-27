/**
 * Bangalore University CGPA <-> percentage conversion.
 *
 * Bangalore University's CBCS grade cards carry the linear equivalence
 *
 *     percentage of marks = (CGPA - 0.75) x 10
 *     CGPA                = (percentage / 10) + 0.75
 *
 * The three quarter point deduction is there because a letter grade is awarded over a band
 * of marks and its grade point is pegged near the top of that band; without the deduction a
 * straight x10 reading would credit a student with marks nobody scored.
 *
 * Three different offsets are in circulation across Indian universities - 0.75, 0.5 and
 * none at all - and they disagree by up to 7.5 marks on the same CGPA. `compareFormulas`
 * shows all three side by side so a student can identify which one matches the percentage
 * already printed on a transcript.
 *
 * Pure module: no clock reads, no DOM, no randomness.
 */

/** Bangalore University's published offset. */
export const BU_OFFSET = 0.75;
/** CBCS scale ceiling. */
export const BU_MAX_CGPA = 10;
/** Grade point 4 is the lowest passing grade in a paper. */
export const BU_MIN_PASS_POINT = 4;

/** Offsets used by different universities, for the comparison panel. */
export const OFFSET_VARIANTS = [
  { id: "bu", offset: 0.75, label: "(CGPA - 0.75) x 10", note: "Bangalore University, VTU, RGPV" },
  { id: "half", offset: 0.5, label: "(CGPA - 0.5) x 10", note: "Osmania and several CBCS schemes" },
  { id: "direct", offset: 0, label: "CGPA x 10", note: "Kerala CBCSS and many autonomous colleges" },
];

/**
 * Degree class thresholds as employers, scholarship boards and postgraduate admissions
 * commonly read an equivalent percentage. The class awarded is printed on the university's
 * own statement of marks - these are the conventional reading, not a university rule.
 */
export const CLASS_BANDS = [
  { minPercent: 70, label: "Distinction" },
  { minPercent: 60, label: "First class" },
  { minPercent: 50, label: "Second class" },
  { minPercent: 40, label: "Pass class" },
  { minPercent: 0, label: "Below pass" },
];

const toNumber = (value) => {
  if (value === "" || value === null || value === undefined) return NaN;
  const parsed = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(parsed) ? parsed : NaN;
};

const round2 = (value) => Math.round(value * 100) / 100;

/** Class label for an equivalent percentage. */
export function classForPercentage(percentage) {
  const band = CLASS_BANDS.find((row) => percentage >= row.minPercent);
  return band ? band.label : CLASS_BANDS[CLASS_BANDS.length - 1].label;
}

/**
 * Convert a Bangalore University CGPA or SGPA into an equivalent percentage of marks.
 *
 * @param {object} input
 * @param {number|string} input.cgpa Grade point average on the 10 point scale.
 */
export function buCgpaToPercentage({ cgpa } = {}) {
  const value = toNumber(cgpa);
  if (Number.isNaN(value)) return { error: "Enter your CGPA as a number, for example 7.42." };
  if (value < 0) return { error: "A CGPA cannot be negative." };
  if (value > BU_MAX_CGPA) {
    return { error: `Bangalore University grades on a ${BU_MAX_CGPA} point scale, so the CGPA cannot exceed ${BU_MAX_CGPA}.` };
  }

  const raw = (value - BU_OFFSET) * 10;
  // Under CGPA 0.75 the straight line dips below zero, which is not a real mark.
  const percentage = round2(Math.max(0, raw));

  return {
    cgpa: round2(value),
    percentage,
    marksOutOf600: Math.round(percentage * 6),
    degreeClass: classForPercentage(percentage),
    passing: value >= BU_MIN_PASS_POINT,
    clamped: raw < 0,
    formula: `(${round2(value)} - ${BU_OFFSET}) x 10`,
  };
}

/**
 * Reverse the equivalence: percentage of marks -> Bangalore University CGPA.
 *
 * @param {object} input
 * @param {number|string} input.percentage Percentage of marks, 0 to 100.
 */
export function buPercentageToCgpa({ percentage } = {}) {
  const value = toNumber(percentage);
  if (Number.isNaN(value)) return { error: "Enter a percentage of marks, for example 65." };
  if (value < 0 || value > 100) return { error: "A percentage of marks must be between 0 and 100." };

  const raw = value / 10 + BU_OFFSET;
  return {
    percentage: round2(value),
    cgpa: round2(Math.min(BU_MAX_CGPA, raw)),
    clamped: raw > BU_MAX_CGPA,
    degreeClass: classForPercentage(value),
    formula: `(${round2(value)} / 10) + ${BU_OFFSET}`,
  };
}

/**
 * The same CGPA read under each offset in circulation, so a student can spot which rule
 * produced the percentage already printed on their marks card.
 *
 * @param {number|string} cgpa
 */
export function compareFormulas(cgpa) {
  const value = toNumber(cgpa);
  if (Number.isNaN(value) || value < 0 || value > BU_MAX_CGPA) return [];
  return OFFSET_VARIANTS.map((variant) => ({
    id: variant.id,
    label: variant.label,
    note: variant.note,
    percentage: round2(Math.max(0, (value - variant.offset) * 10)),
  }));
}

/** The CGPA each class threshold needs under the Bangalore University rule. */
export function classThresholdTable() {
  return CLASS_BANDS.filter((band) => band.minPercent > 0).map((band) => ({
    label: band.label,
    percentage: band.minPercent,
    cgpa: round2(band.minPercent / 10 + BU_OFFSET),
  }));
}

/**
 * Credit weighted CGPA from a list of semester SGPAs.
 *
 * @param {Array<{sgpa: number|string, credits: number|string}>} semesters
 */
export function buCgpaFromSemesters(semesters) {
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
    if (sgpa < 0 || sgpa > BU_MAX_CGPA) {
      return { error: `Semester ${i + 1}: SGPA must be between 0 and ${BU_MAX_CGPA}.` };
    }
    if (credit < 0) return { error: `Semester ${i + 1}: credits cannot be negative.` };

    weighted += sgpa * credit;
    credits += credit;
    rows.push({ semester: i + 1, sgpa: round2(sgpa), credits: credit });
  }

  if (credits <= 0) return { error: "Total credits must be more than zero." };

  const cgpa = round2(weighted / credits);
  const percentage = round2(Math.max(0, (cgpa - BU_OFFSET) * 10));

  return {
    cgpa,
    totalCredits: round2(credits),
    weightedPoints: round2(weighted),
    percentage,
    degreeClass: classForPercentage(percentage),
    rows,
  };
}
