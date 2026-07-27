/**
 * Semester ↔ quarter credit conversion.
 *
 * US registrar standard: a semester runs ~15 weeks and a quarter ~10 weeks,
 * so 1 semester credit = 1.5 quarter credits (equivalently, quarter credits
 * × 2/3 = semester credits). This is the ratio published by university
 * transfer-credit offices nationwide.
 *
 * Typical full-degree totals under each system (for context display):
 * a US bachelor's requires ~120 semester credits or ~180 quarter credits.
 */

/** 1 semester credit = 1.5 quarter credits (15-week vs 10-week term ratio). */
export const QUARTER_PER_SEMESTER = 1.5;

/** Typical US bachelor's degree totals under each system. */
export const BACHELOR_SEMESTER_CREDITS = 120;
export const BACHELOR_QUARTER_CREDITS = 180;

/** Guard against absurd input — no transcript carries this many credits. */
export const MAX_CREDITS = 1000;

const round2 = (value) => Math.round(value * 100) / 100;

/**
 * Convert credits between the two systems.
 *
 * @param {object} input
 * @param {number} input.credits              Credit value to convert.
 * @param {"sem-to-qtr"|"qtr-to-sem"} input.direction
 */
export function convertCredits({ credits, direction }) {
  const value = Number(credits);
  if (!Number.isFinite(value)) return { error: "Enter the number of credits to convert." };
  if (value < 0) return { error: "Credits cannot be negative." };
  if (value > MAX_CREDITS) {
    return { error: `Credits above ${MAX_CREDITS} look like a typo.` };
  }

  if (direction === "sem-to-qtr") {
    const converted = round2(value * QUARTER_PER_SEMESTER);
    return {
      input: value,
      converted,
      fromLabel: "semester credits",
      toLabel: "quarter credits",
      degreeShare: round2((value / BACHELOR_SEMESTER_CREDITS) * 100),
    };
  }
  if (direction === "qtr-to-sem") {
    const converted = round2(value / QUARTER_PER_SEMESTER);
    return {
      input: value,
      converted,
      fromLabel: "quarter credits",
      toLabel: "semester credits",
      degreeShare: round2((value / BACHELOR_QUARTER_CREDITS) * 100),
    };
  }
  return { error: "Choose a conversion direction." };
}
