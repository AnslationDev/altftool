/**
 * GGSIPU (Guru Gobind Singh Indraprastha University, Delhi) CGPA to percentage
 * conversion.
 *
 * GGSIPU awards results on a 10-point CGPA scale and converts the CGPA to an
 * equivalent percentage of marks with the linear formula it notified for its
 * degree programmes (the same conversion AICTE prescribes for a 10-point scale):
 *
 *     Percentage = (CGPA − 0.75) × 10
 *
 * The inverse, used to go from a percentage back to the CGPA that would have
 * produced it, is:
 *
 *     CGPA = Percentage / 10 + 0.75
 *
 * Pure module: no clock reads, no DOM, no randomness.
 */

/** Subtracted from CGPA before scaling — GGSIPU / AICTE 10-point conversion formula. */
export const CGPA_OFFSET = 0.75;

/** Multiplier from (CGPA − offset) to percentage — GGSIPU / AICTE conversion formula. */
export const SCALE_FACTOR = 10;

/** CGPA is reported on a 10-point scale at GGSIPU. */
export const CGPA_MAX = 10;

/**
 * Division bands commonly applied to the equivalent percentage of Indian
 * university degrees (GGSIPU ordinances use the same conventional cut-offs).
 */
export const DIVISION_BANDS = [
  { min: 75, label: "First division with distinction" },
  { min: 60, label: "First division" },
  { min: 50, label: "Second division" },
  { min: 40, label: "Third division / pass" },
  { min: 0, label: "Below pass standard" },
];

const round2 = (value) => Math.round(value * 100) / 100;

const toNumber = (value) => {
  if (value === "" || value === null || value === undefined) return NaN;
  const parsed = Number(String(value).trim());
  return Number.isFinite(parsed) ? parsed : NaN;
};

/** Division label for an equivalent percentage. */
export function divisionFor(percentage) {
  const band = DIVISION_BANDS.find((row) => percentage >= row.min);
  return band ? band.label : DIVISION_BANDS[DIVISION_BANDS.length - 1].label;
}

/**
 * Convert a GGSIPU CGPA to its equivalent percentage.
 *
 * @param {object} input
 * @param {number|string} input.cgpa CGPA on the 10-point scale.
 * @returns {object} { percentage, division, ... } or { error }
 */
export function cgpaToPercentage({ cgpa }) {
  const value = toNumber(cgpa);
  if (Number.isNaN(value)) return { error: "Enter your CGPA as a number." };
  if (value < 0) return { error: "CGPA cannot be negative." };
  if (value > CGPA_MAX) {
    return { error: `CGPA cannot exceed ${CGPA_MAX} on the GGSIPU 10-point scale.` };
  }

  const raw = (value - CGPA_OFFSET) * SCALE_FACTOR;
  // Below a CGPA of 0.75 the formula goes negative; the equivalent percentage floors at 0.
  const percentage = round2(Math.max(0, raw));

  return {
    cgpa: round2(value),
    percentage,
    flooredAtZero: raw < 0,
    division: divisionFor(percentage),
    formula: `(${round2(value)} − ${CGPA_OFFSET}) × ${SCALE_FACTOR}`,
  };
}

/**
 * Convert a percentage back to the GGSIPU CGPA that yields it.
 *
 * @param {object} input
 * @param {number|string} input.percentage Equivalent percentage, 0 – 100.
 * @returns {object} { cgpa, ... } or { error }
 */
export function percentageToCgpa({ percentage }) {
  const value = toNumber(percentage);
  if (Number.isNaN(value)) return { error: "Enter the percentage as a number." };
  if (value < 0) return { error: "Percentage cannot be negative." };
  if (value > 100) return { error: "Percentage cannot exceed 100." };

  const cgpa = round2(value / SCALE_FACTOR + CGPA_OFFSET);
  if (cgpa > CGPA_MAX) {
    return {
      error: `A percentage of ${round2(value)} maps to a CGPA above ${CGPA_MAX}, which the GGSIPU scale cannot award. The formula only covers percentages up to ${round2((CGPA_MAX - CGPA_OFFSET) * SCALE_FACTOR)}.`,
    };
  }

  return {
    percentage: round2(value),
    cgpa,
    division: divisionFor(round2(value)),
    formula: `${round2(value)} ÷ ${SCALE_FACTOR} + ${CGPA_OFFSET}`,
  };
}
