/**
 * Gap-year eligibility rules for India's major entrance and recruitment exams.
 *
 * Each entry encodes the rule from the exam's own eligibility clause:
 *
 *  - NEET (UG): no limit on gap years and no upper age limit (NMC removed the
 *    upper age bar in 2022); the only age rule is 17 years by 31 December of
 *    the admission year. NTA asks for no gap document; some state counselling
 *    bodies or colleges ask for a gap affidavit at admission.
 *  - JEE (Main): candidates may appear in the year they pass Class 12 and the
 *    TWO following years (three consecutive years) — an effective maximum gap
 *    of 2 years. No age limit.
 *  - JEE (Advanced): a candidate should have appeared for Class 12 for the
 *    first time in the exam year or the year before — an effective maximum gap
 *    of 1 year — with at most two attempts in two consecutive years, and a
 *    date-of-birth floor (born on or after 1 October of examYear-25 for
 *    general, relaxed 5 years for SC/ST/PwD) per recent JAB brochures.
 *  - CUET (UG): no gap-year or age limit from NTA/UGC; individual
 *    universities may impose their own age criteria.
 *  - UPSC Civil Services: gap years are irrelevant; what binds is age (21-32
 *    for unreserved, with +3 OBC / +5 SC-ST relaxations) and attempt count.
 *  - SSC CGL and most staff recruitment: gap years irrelevant; post-wise age
 *    windows (commonly 18-27, 18-30 or 18-32) decide instead.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** Sanity bounds for year inputs. */
export const MIN_YEAR = 1980;
export const MAX_YEAR = 2100;
/** A gap larger than this is treated as an input mistake. */
export const MAX_PLAUSIBLE_GAP = 60;

/**
 * Rule table. `maxGapYears: null` means the exam imposes no gap limit.
 * `gapCounts` explains what the gap is measured from.
 */
export const EXAM_RULES = [
  {
    id: "neet-ug",
    label: "NEET (UG) — MBBS/BDS",
    maxGapYears: null,
    verdictBeyondCap: null,
    summary:
      "No limit on gap years and no cap on attempts. The only age rule is the minimum: 17 years completed by 31 December of the admission year; the upper age limit was removed in 2022.",
    proof: [
      "NTA asks for no gap-year document at registration.",
      "Some state counselling bodies and private colleges ask for a gap affidavit (self-declaration on stamp paper stating how the gap was spent) at admission.",
    ],
    caveat:
      "Codes of conduct for admission documents vary by state quota — check the counselling brochure you will actually sit.",
  },
  {
    id: "jee-main",
    label: "JEE (Main) — NITs, IIITs, GFTIs",
    maxGapYears: 2,
    summary:
      "You can appear in the year you passed Class 12 and the two following years — three consecutive years in all, so a maximum gap of 2 years after passing. There is no age limit.",
    proof: [
      "Class 12 passing-year entry in the application is the check; no separate gap certificate is asked for.",
      "Admitting institutes verify the year of passing from the Class 12 marksheet at counselling.",
    ],
    caveat:
      "NITs/IIITs also require 75% in boards or top-20 percentile for admission (65% for SC/ST), independent of the gap.",
  },
  {
    id: "jee-advanced",
    label: "JEE (Advanced) — IITs",
    maxGapYears: 1,
    summary:
      "You should have appeared in Class 12 for the first time in the exam year or the year before — a maximum gap of 1 year — with at most two attempts in two consecutive years. Recent brochures also set a date-of-birth floor: born on or after 1 October of (exam year minus 25), relaxed by 5 years for SC, ST and PwD.",
    proof: [
      "Class 12 first-appearance year declared in the JEE (Main) / Advanced application.",
      "The Class 12 certificate is checked at IIT admission; a wrong first-appearance year cancels the candidature.",
    ],
    caveat:
      "Candidates admitted to an IIT earlier (accepted a seat) are not eligible again, whatever the gap.",
  },
  {
    id: "cuet-ug",
    label: "CUET (UG) — central universities",
    maxGapYears: null,
    summary:
      "NTA imposes no gap-year or age limit for CUET (UG) — whenever you passed Class 12, you can sit. Individual universities may add their own age or year-of-passing criteria for specific programmes.",
    proof: [
      "No gap document at registration; the Class 12 marksheet is verified by the admitting university.",
    ],
    caveat: "Check the specific university's admission bulletin for programme-level age rules.",
  },
  {
    id: "upsc-cse",
    label: "UPSC Civil Services",
    maxGapYears: null,
    summary:
      "Gap years are irrelevant to UPSC — eligibility turns on age (21 to 32 years on 1 August of the exam year for unreserved, +3 years OBC, +5 years SC/ST) and attempts (6 for unreserved, 9 for OBC, unlimited for SC/ST within the age window), plus any graduation.",
    proof: [
      "No gap-year document at any stage; the degree certificate and age proof (matriculation certificate) are what document verification checks.",
    ],
    caveat: "A long gap only matters indirectly, by consuming the age window.",
  },
  {
    id: "ssc-cgl",
    label: "SSC CGL and similar staff recruitment",
    maxGapYears: null,
    summary:
      "No gap-year rule — eligibility is by post-wise age windows (commonly 18-27, 18-30 or 18-32 on the crucial date, with category relaxations) and the qualifying degree. What you did in the gap is never asked in the form.",
    proof: [
      "No gap document; educational certificates and age proof are verified after selection.",
    ],
    caveat: "Some interview-stage posts ask about the gap informally; an honest one-line account suffices.",
  },
];

const EXAM_INDEX = new Map(EXAM_RULES.map((rule) => [rule.id, rule]));

/**
 * Assess a candidate's gap against one exam's rule.
 *
 * @param {object} input
 * @param {string} input.examId       One of EXAM_RULES ids.
 * @param {number|string} input.passYear   Year Class 12 was passed (first appearance for JEE Advanced).
 * @param {number|string} input.attemptYear Year of the intended attempt/admission.
 * @returns {object} verdict, or { error }.
 */
export function assessGapEligibility({ examId, passYear, attemptYear } = {}) {
  const rule = EXAM_INDEX.get(examId);
  if (!rule) return { error: "Pick one of the listed exams." };

  const passed = Number(passYear);
  const attempt = Number(attemptYear);
  if (!Number.isInteger(passed) || passed < MIN_YEAR || passed > MAX_YEAR) {
    return { error: `Enter the Class 12 passing year as a whole number between ${MIN_YEAR} and ${MAX_YEAR}.` };
  }
  if (!Number.isInteger(attempt) || attempt < MIN_YEAR || attempt > MAX_YEAR) {
    return { error: `Enter the attempt year as a whole number between ${MIN_YEAR} and ${MAX_YEAR}.` };
  }
  if (attempt < passed) {
    return { error: "The attempt year cannot be before the Class 12 passing year." };
  }

  const gapYears = attempt - passed;
  if (gapYears > MAX_PLAUSIBLE_GAP) {
    return { error: `A gap of more than ${MAX_PLAUSIBLE_GAP} years looks like a typo — check both years.` };
  }

  const hasCap = Number.isInteger(rule.maxGapYears);
  const withinCap = hasCap ? gapYears <= rule.maxGapYears : true;
  const lastEligibleYear = hasCap ? passed + rule.maxGapYears : null;

  return {
    exam: rule,
    gapYears,
    hasCap,
    maxGapYears: hasCap ? rule.maxGapYears : null,
    allowed: withinCap,
    lastEligibleYear,
    yearsOver: hasCap && !withinCap ? gapYears - rule.maxGapYears : 0,
    summary: rule.summary,
    proof: rule.proof,
    caveat: rule.caveat,
  };
}
