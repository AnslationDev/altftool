/**
 * Indian percentage / 10-point CGPA → US 4.0 GPA conversion.
 *
 * Two documented methods are computed side by side:
 *
 * 1. Division-based (the approach used by credential evaluators such as WES):
 *    Indian universities award degree "divisions", and evaluators map the
 *    division — not the raw mark — onto US letter grades:
 *      First Division  (>= 60%)      -> A -> 4.0
 *      Second Division (50-59.99%)   -> B -> 3.0
 *      Third Division  (40-49.99%)   -> C -> 2.0
 *      Below pass      (< 40%)       -> F -> 0.0
 *    This is why a 65% Indian first-division degree evaluates far higher in
 *    the US than a naive percentage comparison suggests.
 *
 * 2. Linear scaling (used informally by some universities' own forms):
 *      GPA = percentage / 100 * 4
 *
 * CGPA input uses the CBSE multiplication factor: percentage = CGPA × 9.5
 * (CBSE circular for converting Class X grade points, now widely applied to
 * 10-point university CGPAs as an approximation).
 */

/** Division cut-offs per standard Indian university classification. */
export const FIRST_DIVISION_MIN = 60; // First Division floor
export const SECOND_DIVISION_MIN = 50; // Second Division floor
export const THIRD_DIVISION_MIN = 40; // Third Division floor / typical pass mark

/** WES-style division → US grade point mapping. */
export const DIVISION_BANDS = [
  { min: FIRST_DIVISION_MIN, division: "First Division", letter: "A", gpa: 4.0 },
  { min: SECOND_DIVISION_MIN, division: "Second Division", letter: "B", gpa: 3.0 },
  { min: THIRD_DIVISION_MIN, division: "Third Division", letter: "C", gpa: 2.0 },
  { min: 0, division: "Below pass mark", letter: "F", gpa: 0.0 },
];

/** CBSE factor: percentage = CGPA (10-point) × 9.5. */
export const CBSE_CGPA_FACTOR = 9.5;

/** US GPA scale ceiling. */
export const US_GPA_MAX = 4.0;

const round2 = (value) => Math.round(value * 100) / 100;

/**
 * Convert an Indian score to a US 4.0 GPA.
 *
 * @param {object} input
 * @param {"percentage"|"cgpa10"} input.mode  Input scale.
 * @param {number} input.value                Percentage (0-100) or CGPA (0-10).
 */
export function convertToUsGpa({ mode, value }) {
  const raw = Number(value);
  if (!Number.isFinite(raw)) return { error: "Enter your percentage or CGPA as a number." };

  let percentage;
  if (mode === "percentage") {
    if (raw < 0 || raw > 100) return { error: "Percentage must be between 0 and 100." };
    percentage = raw;
  } else if (mode === "cgpa10") {
    if (raw < 0 || raw > 10) return { error: "CGPA on the 10-point scale must be between 0 and 10." };
    // CBSE conversion, capped at 100% (CGPA 10 × 9.5 = 95, so the cap is a safeguard).
    percentage = Math.min(100, raw * CBSE_CGPA_FACTOR);
  } else {
    return { error: "Choose whether you are entering a percentage or a CGPA." };
  }

  const band = DIVISION_BANDS.find((b) => percentage >= b.min) ?? DIVISION_BANDS[DIVISION_BANDS.length - 1];
  const linearGpa = round2((percentage / 100) * US_GPA_MAX);

  return {
    percentage: round2(percentage),
    division: band.division,
    letter: band.letter,
    divisionGpa: band.gpa,
    linearGpa,
    usedCgpaConversion: mode === "cgpa10",
  };
}
