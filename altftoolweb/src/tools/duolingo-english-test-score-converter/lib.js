/**
 * Duolingo English Test (DET) score converter.
 *
 * Rules and tables:
 *  - DET overall scores run 10–160 and are reported in 5-point increments
 *    (Duolingo English Test official score scale).
 *  - DET-to-IELTS mapping follows the concordance Duolingo publishes on its
 *    score comparison page (englishtest.duolingo.com), e.g. 105–110 ≈ IELTS
 *    6.5 and 115–120 ≈ IELTS 7.0.
 *  - CEFR alignment follows Duolingo's published mapping: A1 10–55, A2 60–85,
 *    B1 90–115, B2 120–140, C1 145–160 (C2 is not reported).
 *  - The TOEFL comparison shown is DERIVED: the DET score is first mapped to
 *    an IELTS band via Duolingo's concordance, then to the TOEFL iBT total
 *    range for that band from the ETS TOEFL–IELTS linking table.
 */

export const DET_MIN = 10;
export const DET_MAX = 160;
export const DET_STEP = 5; // DET reports overall scores in 5-point increments

/**
 * Duolingo-published DET-to-IELTS concordance.
 * Entries: [minimum DET score, IELTS band, label]; scanned top-down.
 * DET below 55 falls under the lowest published IELTS comparison.
 */
export const DET_TO_IELTS = [
  [155, 9, "9.0"],
  [145, 8.5, "8.5"],
  [135, 8, "8.0"],
  [125, 7.5, "7.5"],
  [115, 7, "7.0"],
  [105, 6.5, "6.5"],
  [95, 6, "6.0"],
  [85, 5.5, "5.5"],
  [75, 5, "5.0"],
  [65, 4.5, "4.5"],
  [55, 4, "4.0"],
  [DET_MIN, null, "Below 4.0"],
];

/** Duolingo-published CEFR alignment. Entries: [minimum DET score, level]. */
export const DET_TO_CEFR = [
  [145, "C1"],
  [120, "B2"],
  [90, "B1"],
  [60, "A2"],
  [DET_MIN, "A1"],
];

/**
 * ETS TOEFL–IELTS linking table, keyed by IELTS band, used to DERIVE the
 * TOEFL range for a DET score via its IELTS equivalent.
 */
export const IELTS_TO_TOEFL_RANGE = {
  9: "118–120",
  8.5: "115–117",
  8: "110–114",
  7.5: "102–109",
  7: "94–101",
  6.5: "79–93",
  6: "60–78",
  5.5: "46–59",
  5: "35–45",
  4.5: "32–34",
  4: "31 or below",
};

/**
 * Convert a DET overall score to IELTS, CEFR and derived TOEFL equivalents.
 * @returns {object} result or { error }.
 */
export function convertDetScore({ score }) {
  const n = Number(score);
  if (!Number.isInteger(n) || n < DET_MIN || n > DET_MAX) {
    return { error: `DET score must be a whole number between ${DET_MIN} and ${DET_MAX}.` };
  }
  if (n % DET_STEP !== 0) {
    return { error: `DET scores are reported in ${DET_STEP}-point increments (e.g. 115, 120).` };
  }

  let ieltsBand = null;
  let ieltsLabel = "Below 4.0";
  for (const [min, band, label] of DET_TO_IELTS) {
    if (n >= min) {
      ieltsBand = band;
      ieltsLabel = label;
      break;
    }
  }

  let cefr = "A1";
  for (const [min, level] of DET_TO_CEFR) {
    if (n >= min) {
      cefr = level;
      break;
    }
  }

  const toeflRange =
    ieltsBand === null ? "Below the ETS linking range" : IELTS_TO_TOEFL_RANGE[ieltsBand];

  return {
    score: n,
    ieltsBand,
    ieltsLabel,
    cefr,
    toeflRange,
    toeflDerived: true, // TOEFL comparison is derived via the IELTS band
  };
}
