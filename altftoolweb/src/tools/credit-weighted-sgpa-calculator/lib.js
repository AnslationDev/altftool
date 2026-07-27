/**
 * Credit weighted semester grade point average.
 *
 * A semester average is a weighted mean of grade points, with credits as the weights:
 *
 *     SGPA = sum(grade point x credit hours) / sum(credit hours)
 *
 * The numerator is what US registrars call quality points. Because the weights are the
 * credits, a four credit paper moves the average twice as far as a two credit one, and a
 * zero graded paper still occupies its credits in the denominator - which is why a single
 * failed core subject damages an SGPA far more than a poor grade in an elective.
 *
 * Two further quantities are derived, both exact:
 *
 *   pull       = credits x (grade point - SGPA) / total credits
 *                how many points this subject added to, or removed from, the average.
 *                The pulls of all subjects sum to zero by construction.
 *   sgpaWithout= (quality points - this subject's) / (credits - this subject's)
 *                what the average would have been had the subject not been taken.
 *
 * Pure module: no clock reads, no DOM, no randomness.
 */

/**
 * Grade schemes. The 10 point set is the UGC choice based credit system letter scale used
 * by most Indian universities; the 4 point set is the standard US letter scale with plus and
 * minus steps. "Points" lets a student type the grade point their own institution awarded.
 */
export const GRADE_SCHEMES = [
  {
    id: "ugc10",
    label: "10 point letter grades (UGC CBCS)",
    scaleMax: 10,
    passPoint: 4,
    grades: [
      { code: "O", point: 10, label: "Outstanding" },
      { code: "A+", point: 9, label: "Excellent" },
      { code: "A", point: 8, label: "Very good" },
      { code: "B+", point: 7, label: "Good" },
      { code: "B", point: 6, label: "Above average" },
      { code: "C", point: 5, label: "Average" },
      { code: "P", point: 4, label: "Pass" },
      { code: "F", point: 0, label: "Fail" },
      { code: "Ab", point: 0, label: "Absent" },
    ],
  },
  {
    id: "us4",
    label: "4 point letter grades (US style)",
    scaleMax: 4,
    passPoint: 1,
    grades: [
      { code: "A", point: 4.0, label: "Excellent" },
      { code: "A-", point: 3.7, label: "Very good" },
      { code: "B+", point: 3.3, label: "Good" },
      { code: "B", point: 3.0, label: "Good" },
      { code: "B-", point: 2.7, label: "Above average" },
      { code: "C+", point: 2.3, label: "Average" },
      { code: "C", point: 2.0, label: "Average" },
      { code: "C-", point: 1.7, label: "Below average" },
      { code: "D", point: 1.0, label: "Pass" },
      { code: "F", point: 0, label: "Fail" },
    ],
  },
  {
    id: "points",
    label: "Type the grade point directly",
    scaleMax: 10,
    passPoint: 4,
    grades: [],
  },
];

export const MAX_SUBJECTS = 20;

const toNumber = (value) => {
  if (value === "" || value === null || value === undefined) return NaN;
  const parsed = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(parsed) ? parsed : NaN;
};

const round2 = (value) => Math.round(value * 100) / 100;

export const schemeById = (id) => GRADE_SCHEMES.find((row) => row.id === id) || GRADE_SCHEMES[0];

/**
 * Compute the semester grade point average.
 *
 * @param {Array<{name?: string, grade?: string, point?: number|string, credits: number|string}>} subjects
 * @param {object} [options]
 * @param {string} [options.schemeId] "ugc10" (default), "us4" or "points".
 */
export function computeSgpa(subjects, { schemeId = "ugc10" } = {}) {
  const scheme = schemeById(schemeId);

  if (!Array.isArray(subjects) || subjects.length === 0) {
    return { error: "Add at least one subject." };
  }
  if (subjects.length > MAX_SUBJECTS) {
    return { error: `A semester is capped at ${MAX_SUBJECTS} subjects here.` };
  }

  const pointByCode = new Map(scheme.grades.map((row) => [row.code.toUpperCase(), row.point]));

  const parsed = [];
  let qualityPoints = 0;
  let credits = 0;
  let failedCredits = 0;

  for (let i = 0; i < subjects.length; i += 1) {
    const entry = subjects[i] || {};
    const credit = toNumber(entry.credits);
    if (Number.isNaN(credit)) return { error: `Subject ${i + 1}: enter the credit hours.` };
    if (credit < 0) return { error: `Subject ${i + 1}: credit hours cannot be negative.` };

    let point;
    let display;

    if (scheme.id === "points") {
      point = toNumber(entry.point);
      if (Number.isNaN(point)) return { error: `Subject ${i + 1}: enter the grade point awarded.` };
      if (point < 0 || point > scheme.scaleMax) {
        return { error: `Subject ${i + 1}: grade point must be between 0 and ${scheme.scaleMax}.` };
      }
      display = String(round2(point));
    } else {
      const code = String(entry.grade ?? "").trim().toUpperCase();
      if (!pointByCode.has(code)) {
        return {
          error: `Subject ${i + 1}: pick a grade from the ${scheme.label} scheme.`,
        };
      }
      point = pointByCode.get(code);
      display = scheme.grades.find((row) => row.code.toUpperCase() === code).code;
    }

    qualityPoints += point * credit;
    credits += credit;
    if (point < scheme.passPoint) failedCredits += credit;

    parsed.push({
      index: i + 1,
      name: String(entry.name ?? "").trim() || `Subject ${i + 1}`,
      grade: display,
      point: round2(point),
      credits: round2(credit),
      qualityPoints: round2(point * credit),
    });
  }

  if (credits <= 0) {
    return { error: "Total credit hours must be more than zero - an average needs a denominator." };
  }

  const sgpa = qualityPoints / credits;

  const rows = parsed.map((row) => ({
    ...row,
    // How far this subject moved the average away from where the rest of the semester sat.
    pull: round2((row.credits * (row.point - sgpa)) / credits),
    sgpaWithout:
      credits - row.credits > 0
        ? round2((qualityPoints - row.qualityPoints) / (credits - row.credits))
        : null,
  }));

  const dragged = rows.reduce((worst, row) => (row.pull < worst.pull ? row : worst), rows[0]);
  const lifted = rows.reduce((best, row) => (row.pull > best.pull ? row : best), rows[0]);

  return {
    sgpa: round2(sgpa),
    schemeId: scheme.id,
    schemeLabel: scheme.label,
    scaleMax: scheme.scaleMax,
    totalCredits: round2(credits),
    qualityPoints: round2(qualityPoints),
    subjects: rows.length,
    failedCredits: round2(failedCredits),
    hasFailure: failedCredits > 0,
    percentOfScale: round2((sgpa / scheme.scaleMax) * 100),
    biggestDrag: dragged.pull < 0 ? dragged.name : null,
    biggestLift: lifted.pull > 0 ? lifted.name : null,
    rows,
  };
}

/**
 * The SGPA if one more subject were added at a given grade point and credit load - useful
 * before choosing an elective, or when one paper's result is still awaited.
 *
 * @param {object} result Output of computeSgpa.
 * @param {number|string} point Grade point of the extra subject.
 * @param {number|string} credits Credit hours of the extra subject.
 */
export function sgpaWithExtraSubject(result, point, credits) {
  if (!result || result.error) return null;
  const extraPoint = toNumber(point);
  const extraCredits = toNumber(credits);
  if (Number.isNaN(extraPoint) || Number.isNaN(extraCredits)) return null;
  if (extraCredits < 0 || extraPoint < 0 || extraPoint > result.scaleMax) return null;

  const totalCredits = result.totalCredits + extraCredits;
  if (!(totalCredits > 0)) return null;

  return round2((result.qualityPoints + extraPoint * extraCredits) / totalCredits);
}
