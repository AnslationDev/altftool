/**
 * Weighted final merit for selection exams that combine a written stage with an
 * interview or personality test.
 *
 * Two combination rules are used in practice, and both reduce to the same
 * weighted sum:
 *
 *  1. AGGREGATE OF RAW MARKS (UPSC Civil Services). Final merit is simply the
 *     Mains written total plus the Personality Test total. The written stage is
 *     1750 marks and the Personality Test is 275 marks, so the final merit is
 *     out of 2025 and the interview is 275 / 2025 = 13.58% of it.
 *
 *  2. NORMALISED WEIGHTAGE (IBPS and SBI). Each stage is converted to a fixed
 *     share of 100 before being added. IBPS PO combines the Mains score out of
 *     225 (200 objective + 25 descriptive) at 80% weight with the interview out
 *     of 100 at 20% weight. SBI PO combines Mains out of 250 at 75% weight with
 *     the Phase III group exercise and interview out of 50 at 25% weight.
 *
 * Both are expressed here as:
 *
 *   merit = (written / writtenMax) × writtenWeight
 *         + (interview / interviewMax) × interviewWeight
 *
 * Setting the weights equal to the maximums reproduces rule 1 exactly.
 *
 * The exchange rate between the two stages follows from the derivatives:
 *   one interview mark is worth (interviewWeight/interviewMax) ÷
 *   (writtenWeight/writtenMax) written marks in the final merit.
 *
 * Minimum qualifying marks in the interview, reservation rules and tie-breaking
 * are set separately by each body and are not modelled here. Confirm the scheme
 * in the notification for your recruitment year.
 */

/** Published weightage schemes. */
export const WEIGHTAGE_PRESETS = [
  {
    key: "upsc-cse",
    label: "UPSC Civil Services",
    writtenLabel: "Mains written total",
    interviewLabel: "Personality Test",
    writtenMax: 1750,
    interviewMax: 275,
    writtenWeight: 1750,
    interviewWeight: 275,
    note: "Final merit is the straight aggregate of Mains 1750 and the Personality Test 275, out of 2025.",
  },
  {
    key: "ibps-po",
    label: "IBPS PO",
    writtenLabel: "Mains score",
    interviewLabel: "Interview",
    writtenMax: 225,
    interviewMax: 100,
    writtenWeight: 80,
    interviewWeight: 20,
    note: "Mains (200 objective + 25 descriptive) carries 80% weight and the interview 20%.",
  },
  {
    key: "sbi-po",
    label: "SBI PO",
    writtenLabel: "Mains score",
    interviewLabel: "Group exercise + interview",
    writtenMax: 250,
    interviewMax: 50,
    writtenWeight: 75,
    interviewWeight: 25,
    note: "Mains out of 250 is scaled to 75 and Phase III out of 50 is scaled to 25.",
  },
];

/**
 * Compute a weighted final merit and everything that follows from it.
 *
 * @param {object} input
 * @param {number} input.writtenScore    marks scored in the written stage
 * @param {number} input.writtenMax      maximum marks in the written stage
 * @param {number} input.writtenWeight   share of the final merit it carries
 * @param {number} input.interviewScore  marks scored in the interview
 * @param {number} input.interviewMax    maximum interview marks
 * @param {number} input.interviewWeight share of the final merit it carries
 * @param {number} input.rivalWrittenScore   a comparison candidate's written marks
 * @param {number} input.rivalInterviewScore the same candidate's interview marks
 * @returns {object} merit breakdown, or { error }
 */
export function computeMerit({
  writtenScore = 0,
  writtenMax = 1750,
  writtenWeight = 1750,
  interviewScore = 0,
  interviewMax = 275,
  interviewWeight = 275,
  rivalWrittenScore = 0,
  rivalInterviewScore = 0,
} = {}) {
  const values = [
    writtenScore,
    writtenMax,
    writtenWeight,
    interviewScore,
    interviewMax,
    interviewWeight,
    rivalWrittenScore,
    rivalInterviewScore,
  ];
  if (values.some((value) => typeof value !== "number" || !Number.isFinite(value))) {
    return { error: "Enter a valid number in every field." };
  }
  if (writtenMax <= 0 || interviewMax <= 0) {
    return { error: "Maximum marks for both stages must be greater than zero." };
  }
  if (writtenWeight < 0 || interviewWeight < 0) {
    return { error: "Weights cannot be negative." };
  }
  if (writtenWeight + interviewWeight <= 0) {
    return { error: "At least one stage must carry some weight." };
  }
  if (writtenScore < 0 || interviewScore < 0 || rivalWrittenScore < 0 || rivalInterviewScore < 0) {
    return { error: "Marks cannot be negative." };
  }
  if (writtenScore > writtenMax || rivalWrittenScore > writtenMax) {
    return { error: `Written marks cannot exceed the maximum of ${writtenMax}.` };
  }
  if (interviewScore > interviewMax || rivalInterviewScore > interviewMax) {
    return { error: `Interview marks cannot exceed the maximum of ${interviewMax}.` };
  }

  const totalWeight = writtenWeight + interviewWeight;
  const writtenPerMark = writtenWeight / writtenMax;
  const interviewPerMark = interviewWeight / interviewMax;

  const writtenPoints = writtenScore * writtenPerMark;
  const interviewPoints = interviewScore * interviewPerMark;
  const merit = writtenPoints + interviewPoints;

  const rivalMerit = rivalWrittenScore * writtenPerMark + rivalInterviewScore * interviewPerMark;

  // Everything the interview can still do: 0 marks versus a full interview.
  const meritIfInterviewZero = writtenPoints;
  const meritIfInterviewFull = writtenPoints + interviewWeight;
  const interviewSwing = interviewWeight;

  // How many written marks one interview mark is worth in the final merit.
  const writtenMarksPerInterviewMark = writtenPerMark > 0 ? interviewPerMark / writtenPerMark : null;
  // ...and the whole interview expressed in written marks.
  const interviewSwingInWrittenMarks = writtenPerMark > 0 ? interviewWeight / writtenPerMark : null;

  // Interview marks needed to match the comparison candidate.
  const gapToRival = rivalMerit - merit;
  let interviewNeededToMatchRival = null;
  let matchRivalReachable = false;
  if (interviewPerMark > 0) {
    const required = (rivalMerit - writtenPoints) / interviewPerMark;
    interviewNeededToMatchRival = required;
    matchRivalReachable = required >= 0 && required <= interviewMax;
  }

  return {
    writtenScore,
    writtenMax,
    writtenWeight,
    interviewScore,
    interviewMax,
    interviewWeight,
    totalWeight,
    writtenPoints,
    interviewPoints,
    merit,
    meritPercent: (merit / totalWeight) * 100,
    writtenPercent: (writtenScore / writtenMax) * 100,
    interviewPercent: (interviewScore / interviewMax) * 100,
    interviewShareOfMaxPercent: (interviewWeight / totalWeight) * 100,
    writtenShareOfMaxPercent: (writtenWeight / totalWeight) * 100,
    interviewShareOfYourMeritPercent: merit > 0 ? (interviewPoints / merit) * 100 : 0,
    meritIfInterviewZero,
    meritIfInterviewFull,
    interviewSwing,
    interviewSwingInWrittenMarks,
    writtenMarksPerInterviewMark,
    rivalWrittenScore,
    rivalInterviewScore,
    rivalMerit,
    gapToRival,
    aheadOfRival: merit > rivalMerit,
    levelWithRival: merit === rivalMerit,
    interviewNeededToMatchRival,
    matchRivalReachable,
  };
}

/**
 * Merit at a series of interview scores, holding the written score fixed.
 * Useful for seeing the whole range an interview can produce.
 */
export function buildInterviewLadder(input, fractions = [0, 0.4, 0.5, 0.6, 0.7, 0.8, 1]) {
  const base = computeMerit(input);
  if (base.error) return [];
  return fractions
    .filter((fraction) => fraction >= 0 && fraction <= 1)
    .map((fraction) => {
      const interviewScore = base.interviewMax * fraction;
      const row = computeMerit({ ...input, interviewScore });
      return {
        fraction,
        interviewScore,
        merit: row.merit,
        meritPercent: row.meritPercent,
        deltaFromCurrent: row.merit - base.merit,
      };
    });
}
