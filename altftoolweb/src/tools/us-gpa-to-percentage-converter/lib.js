/**
 * US 4.0-scale GPA → approximate percentage.
 *
 * Two documented readings are produced:
 *
 * 1. Linear: percentage = GPA / 4 × 100. This is the formula many Indian and
 *    other national application forms specify when they ask US-educated
 *    applicants for a percentage.
 *
 * 2. Letter-grade band: US registrars map letter grades to grade points and
 *    to percentage bands. The bands below are the most common US secondary /
 *    undergraduate scale (also used by College Board guidance):
 *      A+ 97-100 = 4.0, A 93-96 = 4.0, A- 90-92 = 3.7, B+ 87-89 = 3.3,
 *      B 83-86 = 3.0, B- 80-82 = 2.7, C+ 77-79 = 2.3, C 73-76 = 2.0,
 *      C- 70-72 = 1.7, D+ 67-69 = 1.3, D 63-66 = 1.0, D- 60-62 = 0.7,
 *      F below 60 = 0.0.
 *    The GPA is matched to the letter with the nearest grade points and the
 *    band's percentage range is reported.
 */

export const US_GPA_MAX = 4.0;

/** Common US letter grade ↔ grade point ↔ percentage band table. */
export const LETTER_BANDS = [
  { letter: "A+", points: 4.0, pctMin: 97, pctMax: 100 },
  { letter: "A", points: 4.0, pctMin: 93, pctMax: 96 },
  { letter: "A-", points: 3.7, pctMin: 90, pctMax: 92 },
  { letter: "B+", points: 3.3, pctMin: 87, pctMax: 89 },
  { letter: "B", points: 3.0, pctMin: 83, pctMax: 86 },
  { letter: "B-", points: 2.7, pctMin: 80, pctMax: 82 },
  { letter: "C+", points: 2.3, pctMin: 77, pctMax: 79 },
  { letter: "C", points: 2.0, pctMin: 73, pctMax: 76 },
  { letter: "C-", points: 1.7, pctMin: 70, pctMax: 72 },
  { letter: "D+", points: 1.3, pctMin: 67, pctMax: 69 },
  { letter: "D", points: 1.0, pctMin: 63, pctMax: 66 },
  { letter: "D-", points: 0.7, pctMin: 60, pctMax: 62 },
  { letter: "F", points: 0.0, pctMin: 0, pctMax: 59 },
];

const round1 = (value) => Math.round(value * 10) / 10;

/**
 * Convert a 4.0-scale GPA to percentage readings.
 *
 * @param {object} input
 * @param {number} input.gpa  Cumulative GPA on the 4.0 scale (0-4).
 */
export function convertGpaToPercentage({ gpa }) {
  const value = Number(gpa);
  if (!Number.isFinite(value)) return { error: "Enter your GPA as a number." };
  if (value < 0) return { error: "GPA cannot be negative." };
  if (value > US_GPA_MAX) {
    return {
      error:
        "Above 4.0 is a weighted GPA. Convert your unweighted (4.0-scale) GPA — weighted scales have no standard percentage mapping.",
    };
  }

  const linearPercentage = round1((value / US_GPA_MAX) * 100);

  // Nearest letter by grade-point distance; on a tie, the higher letter wins
  // because the table is ordered best-first and we keep the first minimum.
  let nearest = LETTER_BANDS[0];
  let bestDistance = Math.abs(value - nearest.points);
  for (const band of LETTER_BANDS) {
    const distance = Math.abs(value - band.points);
    if (distance < bestDistance) {
      nearest = band;
      bestDistance = distance;
    }
  }

  return {
    gpa: value,
    linearPercentage,
    letter: nearest.letter,
    letterPoints: nearest.points,
    bandMin: nearest.pctMin,
    bandMax: nearest.pctMax,
  };
}
