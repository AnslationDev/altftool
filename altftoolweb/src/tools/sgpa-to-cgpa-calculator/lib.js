/**
 * Semester grade point averages -> cumulative grade point average.
 *
 * A CGPA is not the average of the SGPAs. It is the average of the grade points, and each
 * semester contributes as many grade points as it carries credits:
 *
 *     CGPA = sum(SGPA_i x credits_i) / sum(credits_i)
 *
 * Averaging the SGPAs directly only gives the same answer when every semester carries the
 * same credit load. Where it differs it always flatters the lighter semesters, which is why
 * a strong 14 credit semester and a weak 26 credit semester look better under a plain mean
 * than they should. Both figures are returned here so the gap is visible.
 *
 * The running CGPA after each semester uses the same expression over the semesters so far,
 * which is what a transcript prints in its cumulative column.
 *
 * Conversion to marks depends on the university's own published rule; three offsets are in
 * general use and they disagree by up to 7.5 marks on the same average, so the offset is an
 * input rather than a hidden constant.
 *
 * Pure module: no clock reads, no DOM, no randomness.
 */

/** Grade point ceilings in common use. */
export const SCALE_OPTIONS = [
  { id: "10", max: 10, label: "10 point scale (most Indian universities)" },
  { id: "4", max: 4, label: "4 point scale (US style GPA)" },
];

export const DEFAULT_SCALE = 10;
export const MAX_SEMESTERS = 16;

/** Published percentage conversions, selected by the student to match their own university. */
export const CONVERSION_RULES = [
  { id: "direct", offset: 0, label: "CGPA x 10", note: "Kerala CBCSS, Anna University, many autonomous colleges" },
  { id: "half", offset: 0.5, label: "(CGPA - 0.5) x 10", note: "Osmania, GTU credit system" },
  { id: "threequarter", offset: 0.75, label: "(CGPA - 0.75) x 10", note: "VTU, RGPV, Bangalore University" },
];

const toNumber = (value) => {
  if (value === "" || value === null || value === undefined) return NaN;
  const parsed = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(parsed) ? parsed : NaN;
};

const round2 = (value) => Math.round(value * 100) / 100;

const ruleById = (id) => CONVERSION_RULES.find((row) => row.id === id) || CONVERSION_RULES[0];

/**
 * Combine semester SGPAs into a CGPA.
 *
 * @param {Array<{sgpa: number|string, credits: number|string}>} semesters
 * @param {object} [options]
 * @param {number|string} [options.scaleMax] Ceiling of the grade point scale, 10 by default.
 */
export function computeCgpa(semesters, { scaleMax = DEFAULT_SCALE } = {}) {
  const max = toNumber(scaleMax);
  if (Number.isNaN(max) || max <= 0) return { error: "Pick a valid grade point scale." };

  if (!Array.isArray(semesters) || semesters.length === 0) {
    return { error: "Add at least one semester." };
  }
  if (semesters.length > MAX_SEMESTERS) {
    return { error: `A degree programme is capped at ${MAX_SEMESTERS} semesters here.` };
  }

  let weighted = 0;
  let credits = 0;
  let sgpaSum = 0;
  const running = [];

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
    sgpaSum += sgpa;

    running.push({
      semester: i + 1,
      sgpa: round2(sgpa),
      credits: round2(credit),
      gradePoints: round2(sgpa * credit),
      cumulativeCredits: round2(credits),
      cumulativeCgpa: credits > 0 ? round2(weighted / credits) : null,
    });
  }

  if (credits <= 0) {
    return { error: "Total credits must be more than zero - a CGPA cannot be divided by nothing." };
  }

  const cgpa = round2(weighted / credits);
  const simpleAverage = round2(sgpaSum / semesters.length);
  const best = running.reduce((top, row) => (row.sgpa > top.sgpa ? row : top), running[0]);
  const worst = running.reduce((low, row) => (row.sgpa < low.sgpa ? row : low), running[0]);

  return {
    cgpa,
    scaleMax: max,
    simpleAverage,
    // Positive when the plain mean of the SGPAs overstates the true CGPA.
    averagingGap: round2(simpleAverage - cgpa),
    semesters: semesters.length,
    totalCredits: round2(credits),
    totalGradePoints: round2(weighted),
    averageCreditsPerSemester: round2(credits / semesters.length),
    bestSemester: best.semester,
    bestSgpa: best.sgpa,
    weakestSemester: worst.semester,
    weakestSgpa: worst.sgpa,
    running,
  };
}

/**
 * Convert a CGPA into an equivalent percentage under a chosen published rule.
 *
 * @param {object} input
 * @param {number|string} input.cgpa
 * @param {string} [input.rule] "direct" (default), "half" or "threequarter".
 * @param {number|string} [input.scaleMax] Ceiling of the scale, 10 by default.
 */
export function cgpaToPercentage({ cgpa, rule = "direct", scaleMax = DEFAULT_SCALE } = {}) {
  const value = toNumber(cgpa);
  const max = toNumber(scaleMax);
  if (Number.isNaN(max) || max <= 0) return { error: "Pick a valid grade point scale." };
  if (Number.isNaN(value)) return { error: "Enter a CGPA to convert." };
  if (value < 0 || value > max) return { error: `A CGPA must be between 0 and ${max}.` };

  const chosen = ruleById(rule);
  // Offsets are expressed on the 10 point scale, so scale them if a different ceiling is used.
  const offset = chosen.offset * (max / 10);
  const percentage = round2(Math.max(0, ((value - offset) / max) * 100));

  return {
    cgpa: round2(value),
    percentage,
    ruleId: chosen.id,
    ruleLabel: chosen.label,
    note: chosen.note,
    formula:
      offset === 0
        ? `(${round2(value)} / ${max}) x 100`
        : `((${round2(value)} - ${round2(offset)}) / ${max}) x 100`,
  };
}

/** The same CGPA read under every rule, so a printed percentage can be matched to its source. */
export function compareRules(cgpa, scaleMax = DEFAULT_SCALE) {
  const value = toNumber(cgpa);
  const max = toNumber(scaleMax);
  if (Number.isNaN(value) || Number.isNaN(max) || max <= 0 || value < 0 || value > max) return [];
  return CONVERSION_RULES.map((entry) => {
    const converted = cgpaToPercentage({ cgpa: value, rule: entry.id, scaleMax: max });
    return {
      id: entry.id,
      label: entry.label,
      note: entry.note,
      percentage: converted.error ? null : converted.percentage,
    };
  });
}
