/**
 * Gujarat Technological University (GTU) performance index <-> percentage conversion.
 *
 * GTU does not print an SGPA and a CGPA. It prints two indices on the same 10 point scale:
 *
 *   SPI - Semester Performance Index, the credit weighted grade point average of one semester
 *   CPI - Cumulative Performance Index, the credit weighted average of every semester so far
 *
 * and after the final semester the cumulative figure is reported as the CGPA. All three are
 * computed the same way:
 *
 *     SPI = sum(grade point x course credits) / sum(course credits)
 *     CPI = sum(SPI x semester credits) / sum(semester credits)
 *
 * GTU's credit system, applied from the 2009 admission batch, states the marks equivalence
 * of the cumulative index with a half point deduction:
 *
 *     percentage of marks = (CPI - 0.5) x 10
 *
 * A straight ten times reading appears on statements from some institutes and older
 * schemes, and it is five marks higher at every index value, so the two are offered as
 * separate options rather than blended.
 *
 * Pure module: no clock reads, no DOM, no randomness.
 */

/** Scale ceiling for SPI, CPI and CGPA. */
export const GTU_MAX_INDEX = 10;
/** Grade DD, worth 4 points, is the lowest passing grade in a subject. */
export const GTU_MIN_PASS_POINT = 4;

/** GTU's two letter grade codes and their grade points. */
export const GTU_GRADES = [
  { code: "AA", point: 10, label: "Excellent" },
  { code: "AB", point: 9, label: "Very good" },
  { code: "BB", point: 8, label: "Good" },
  { code: "BC", point: 7, label: "Above average" },
  { code: "CC", point: 6, label: "Average" },
  { code: "CD", point: 5, label: "Below average" },
  { code: "DD", point: 4, label: "Pass" },
  { code: "FF", point: 0, label: "Fail / to be repeated" },
];

/** Conversion conventions, keyed for the interface. */
export const GTU_REGULATIONS = [
  {
    id: "credit2009",
    offset: 0.5,
    label: "GTU credit system, 2009 batch onwards: (CPI - 0.5) x 10",
  },
  {
    id: "direct",
    offset: 0,
    label: "Straight scaling used on some statements: CPI x 10",
  },
];

const toNumber = (value) => {
  if (value === "" || value === null || value === undefined) return NaN;
  const parsed = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(parsed) ? parsed : NaN;
};

const round2 = (value) => Math.round(value * 100) / 100;

const regulationById = (id) =>
  GTU_REGULATIONS.find((row) => row.id === id) || GTU_REGULATIONS[0];

/**
 * Convert an SPI, CPI or CGPA into the equivalent percentage of marks.
 *
 * @param {object} input
 * @param {number|string} input.index SPI, CPI or CGPA on the 10 point scale.
 * @param {string} [input.regulation] "credit2009" (default) or "direct".
 */
export function gtuIndexToPercentage({ index, regulation = "credit2009" } = {}) {
  const value = toNumber(index);
  if (Number.isNaN(value)) return { error: "Enter the SPI, CPI or CGPA as a number, for example 8.24." };
  if (value < 0) return { error: "A performance index cannot be negative." };
  if (value > GTU_MAX_INDEX) {
    return { error: `GTU indices run on a ${GTU_MAX_INDEX} point scale, so the value cannot exceed ${GTU_MAX_INDEX}.` };
  }

  const rule = regulationById(regulation);
  const raw = (value - rule.offset) * 10;
  // Under the offset the straight line dips below zero, which is not a real mark.
  const percentage = round2(Math.max(0, raw));

  return {
    index: round2(value),
    percentage,
    regulationId: rule.id,
    regulationLabel: rule.label,
    formula: rule.offset ? `(${round2(value)} - ${rule.offset}) x 10` : `${round2(value)} x 10`,
    passing: value >= GTU_MIN_PASS_POINT,
    clamped: raw < 0,
    // How far the other convention would read the same index.
    alternatePercentage: round2(
      Math.max(0, (value - (rule.offset === 0 ? 0.5 : 0)) * 10),
    ),
  };
}

/**
 * Reverse the equivalence: percentage of marks -> performance index.
 *
 * @param {object} input
 * @param {number|string} input.percentage Percentage of marks, 0 to 100.
 * @param {string} [input.regulation] "credit2009" (default) or "direct".
 */
export function gtuPercentageToIndex({ percentage, regulation = "credit2009" } = {}) {
  const value = toNumber(percentage);
  if (Number.isNaN(value)) return { error: "Enter a percentage of marks, for example 70." };
  if (value < 0 || value > 100) return { error: "A percentage of marks must be between 0 and 100." };

  const rule = regulationById(regulation);
  const raw = value / 10 + rule.offset;

  return {
    percentage: round2(value),
    index: round2(Math.min(GTU_MAX_INDEX, raw)),
    regulationId: rule.id,
    regulationLabel: rule.label,
    formula: rule.offset ? `(${round2(value)} / 10) + ${rule.offset}` : `${round2(value)} / 10`,
    clamped: raw > GTU_MAX_INDEX,
  };
}

/**
 * SPI for one semester from the letter grade and credits of each subject.
 *
 * @param {Array<{code: string, credits: number|string}>} subjects
 */
export function gtuSpiFromGrades(subjects) {
  if (!Array.isArray(subjects) || subjects.length === 0) {
    return { error: "Add at least one subject." };
  }

  const pointByCode = new Map(GTU_GRADES.map((row) => [row.code, row.point]));

  let weighted = 0;
  let credits = 0;
  let backlogCredits = 0;
  const rows = [];

  for (let i = 0; i < subjects.length; i += 1) {
    const code = String(subjects[i]?.code ?? "").trim().toUpperCase();
    const credit = toNumber(subjects[i]?.credits);

    if (!pointByCode.has(code)) {
      return { error: `Subject ${i + 1}: pick a GTU grade (AA, AB, BB, BC, CC, CD, DD or FF).` };
    }
    if (Number.isNaN(credit)) return { error: `Subject ${i + 1}: enter the credit value.` };
    if (credit < 0) return { error: `Subject ${i + 1}: credits cannot be negative.` };

    const point = pointByCode.get(code);
    weighted += point * credit;
    credits += credit;
    if (point < GTU_MIN_PASS_POINT) backlogCredits += credit;

    rows.push({ subject: i + 1, code, point, credits: credit, gradePoints: round2(point * credit) });
  }

  if (credits <= 0) return { error: "Total credits must be more than zero." };

  const spi = round2(weighted / credits);
  return {
    spi,
    totalCredits: round2(credits),
    totalGradePoints: round2(weighted),
    backlogCredits: round2(backlogCredits),
    hasBacklog: backlogCredits > 0,
    rows,
  };
}

/**
 * CPI from a list of semester SPIs, weighted by the credits registered in each semester.
 *
 * @param {Array<{spi: number|string, credits: number|string}>} semesters
 * @param {string} [regulation] "credit2009" (default) or "direct".
 */
export function gtuCpiFromSemesters(semesters, regulation = "credit2009") {
  if (!Array.isArray(semesters) || semesters.length === 0) {
    return { error: "Add at least one semester." };
  }

  const rule = regulationById(regulation);
  let weighted = 0;
  let credits = 0;
  const rows = [];

  for (let i = 0; i < semesters.length; i += 1) {
    const spi = toNumber(semesters[i]?.spi);
    const credit = toNumber(semesters[i]?.credits);
    if (Number.isNaN(spi) || Number.isNaN(credit)) {
      return { error: `Semester ${i + 1} needs both an SPI and a credit count.` };
    }
    if (spi < 0 || spi > GTU_MAX_INDEX) {
      return { error: `Semester ${i + 1}: SPI must be between 0 and ${GTU_MAX_INDEX}.` };
    }
    if (credit < 0) return { error: `Semester ${i + 1}: credits cannot be negative.` };

    weighted += spi * credit;
    credits += credit;
    rows.push({ semester: i + 1, spi: round2(spi), credits: credit });
  }

  if (credits <= 0) return { error: "Total credits must be more than zero." };

  const cpi = round2(weighted / credits);
  return {
    cpi,
    totalCredits: round2(credits),
    weightedPoints: round2(weighted),
    percentage: round2(Math.max(0, (cpi - rule.offset) * 10)),
    regulationLabel: rule.label,
    rows,
  };
}
