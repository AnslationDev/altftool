/**
 * Color Blindness Simulator — pure colour maths.
 *
 * The simulation is the Viénot–Brettel–Mollon dichromacy model. For each
 * pixel:
 *
 *   1. Undo the sRGB transfer function to get linear RGB
 *      (c/12.92 below 0.04045, else ((c+0.055)/1.055)^2.4).
 *   2. Convert linear RGB to LMS — the response of the long, medium and
 *      short-wavelength cones — with the Smith–Pokorny style 3×3 matrix.
 *   3. Replace the missing cone's response with the plane that a dichromat
 *      cannot distinguish: protanopia drops L, deuteranopia drops M,
 *      tritanopia drops S.
 *   4. Convert back to linear RGB and re-apply the sRGB transfer function.
 *
 * Severity interpolates the deficiency matrix against the identity matrix, so
 * 0 leaves the colour untouched, 0.5 approximates the anomalous-trichromat
 * forms (protanomaly, deuteranomaly, tritanomaly) and 1 is full dichromacy.
 *
 * Achromatopsia is not a matrix in LMS space — it collapses everything to
 * luminance using the Rec. 709 weights 0.2126 R + 0.7152 G + 0.0722 B, the
 * same coefficients WCAG uses for relative luminance.
 */

export { getCVDMatrix, applyCVDFilter, simulateRgb } from "./utils/cvdEngine";

/**
 * The five modes the simulator offers, with the share of the population
 * affected. Figures are the widely cited prevalences among people of
 * Northern European descent; red-green deficiency affects roughly 8% of men
 * and 0.5% of women, and the split below is of that group.
 */
export const CVD_TYPES = [
  { id: "normal", label: "Normal vision", note: "Unfiltered reference" },
  { id: "protanopia", label: "Protanopia", note: "No L (red) cones — about 1% of men" },
  { id: "deuteranopia", label: "Deuteranopia", note: "No M (green) cones — about 1% of men" },
  { id: "tritanopia", label: "Tritanopia", note: "No S (blue) cones — under 0.01%, and equally common in women" },
  { id: "achromatopsia", label: "Achromatopsia", note: "No colour at all — roughly 1 in 30,000" },
];

/** Severity 0 = unaffected, 1 = full dichromacy. */
export const MIN_SEVERITY = 0;
export const MAX_SEVERITY = 1;

/**
 * Severity that approximates the anomalous-trichromat forms — deuteranomaly,
 * protanomaly and tritanomaly — where the cone is shifted rather than absent.
 */
export const ANOMALOUS_SEVERITY = 0.5;
