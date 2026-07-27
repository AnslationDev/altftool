/**
 * Color Memory Precision Test — pure logic.
 *
 * The test shows a colour, hides it, and asks you to recreate it from memory.
 * Scoring has to answer "how close is close?", which is a perceptual question,
 * so the accuracy figure blends two measures:
 *
 *   RGB accuracy (weight 0.40)
 *     100 − (euclidean distance between the two RGB triples ÷ the maximum
 *     possible distance) × 100. The maximum is √(255² × 3) = 441.67, the
 *     distance from black to white, so identical colours score 100 and the
 *     black/white extreme scores 0.
 *
 *   HSL accuracy (weight 0.60)
 *     100 − (0.50 × hue error + 0.25 × saturation error + 0.25 × lightness
 *     error) × 100, each error normalised to 0-1. Hue is compared the short
 *     way round the circle, so 350° and 10° are 20° apart, not 340°.
 *
 * HSL carries the larger weight because raw RGB distance does not match what
 * people notice: a 30-point shift in blue is far less visible than the same
 * shift in green, whereas a hue rotation is obvious in any channel.
 *
 * Everything here is deterministic. `generateRandomColor` takes an optional
 * `rng` argument so a seeded generator produces a repeatable colour.
 */

export {
  parseHex,
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  generateRandomColor,
  calculateAccuracy,
  getPrecisionRating,
  getContrastColor,
  DIFFICULTY_BANDS,
} from "./utils/colorUtils";

/** Weights blended into the final accuracy percentage. */
export const RGB_WEIGHT = 0.4;
export const HSL_WEIGHT = 0.6;

/** Within HSL accuracy: hue matters twice as much as saturation or lightness. */
export const HUE_WEIGHT = 0.5;
export const SATURATION_WEIGHT = 0.25;
export const LIGHTNESS_WEIGHT = 0.25;

/**
 * Greatest possible euclidean distance in RGB space — black to white,
 * √(255² × 3) ≈ 441.67. Used to normalise the RGB half of the score.
 */
export const MAX_RGB_DISTANCE = Math.sqrt(255 * 255 * 3);

/**
 * Score bands shown after each round.
 * Perfect 99+, Elite 95+, Master 90+, Expert 80+, Adept 60+, Novice 40+,
 * Amateur below 40.
 */
export const RATING_BANDS = [99, 95, 90, 80, 60, 40];
