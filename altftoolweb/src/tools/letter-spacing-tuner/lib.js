/**
 * Optical letter-spacing (tracking) model.
 *
 * Type designers space a face optically: small text needs to be opened up so the
 * counters stay legible, display text needs to be tightened so words hold together.
 * The industry shorthand for that curve is an exponential decay of tracking against
 * rendered font size:
 *
 *     tracking(em) = A + B * e^(C * fontSizePx)
 *
 * The coefficients below are the widely published fit of Adobe's optical-tracking
 * behaviour (tracking approaches roughly -0.022em for large display sizes and rises
 * above +0.01em under ~11px). Everything else in this module is a documented,
 * additive correction on top of that base curve.
 */

/** Coefficients of the optical tracking curve, tracking in em, size in CSS px. */
export const TRACKING_CURVE = Object.freeze({ A: -0.0223, B: 0.185, C: -0.1745 });

/** Practical rendering bounds. Below 4px glyphs are not resolvable; above 400px the curve is flat. */
export const MIN_FONT_SIZE_PX = 4;
export const MAX_FONT_SIZE_PX = 400;

/**
 * Capitals carry no ascender/descender interlock, so caps-only settings need to be
 * opened up. 60/1000 em is the long-standing editorial default for all-caps text;
 * small caps sit at roughly half of that because they are drawn on a shorter body.
 */
export const CASE_ADJUST_EM = Object.freeze({
  normal: 0,
  uppercase: 0.06,
  "small-caps": 0.03,
});

/** Reference weight for the base curve: the curve is fitted to a regular (400) weight. */
export const WEIGHT_REFERENCE = 400;
/** Heavier strokes eat their own sidebearings, so tracking tightens as weight rises. */
export const WEIGHT_ADJUST_EM_PER_100 = -0.004;
export const MIN_FONT_WEIGHT = 100;
export const MAX_FONT_WEIGHT = 1000;

/**
 * Light type on a dark ground blooms (halation), visually closing the gaps, so
 * reversed text is normally opened by about 5/1000 em to match the positive setting.
 */
export const CONTRAST_ADJUST_EM = Object.freeze({
  "dark-on-light": 0,
  "light-on-dark": 0.005,
});

/** Sane typographic bounds. Past these the setting stops reading as words. */
export const MIN_TRACKING_EM = -0.08;
export const MAX_TRACKING_EM = 0.4;

/** Photoshop / InDesign express tracking in thousandths of an em. */
export const EM_TO_THOUSANDTHS = 1000;

/** Default preview ladder used by the size scale table. */
export const DEFAULT_SCALE_SIZES = Object.freeze([12, 14, 16, 20, 24, 32, 48, 64, 96]);

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Base optical tracking in em for a rendered size in CSS pixels.
 * Returns null when the size is outside the supported range.
 */
export function baseTrackingEm(fontSizePx) {
  if (!isFiniteNumber(fontSizePx)) return null;
  if (fontSizePx < MIN_FONT_SIZE_PX || fontSizePx > MAX_FONT_SIZE_PX) return null;
  const { A, B, C } = TRACKING_CURVE;
  return A + B * Math.exp(C * fontSizePx);
}

/**
 * Full tracking recommendation for one size.
 *
 * @param {object} input
 * @param {number} input.fontSizePx      rendered size in CSS pixels
 * @param {string} [input.textCase]      "normal" | "uppercase" | "small-caps"
 * @param {number} [input.fontWeight]    100-1000
 * @param {string} [input.contrast]      "dark-on-light" | "light-on-dark"
 * @param {number} [input.nudgeThousandths] manual correction in 1/1000 em
 * @returns {object} tracking breakdown, or { error } for unusable input
 */
export function computeTracking({
  fontSizePx,
  textCase = "normal",
  fontWeight = WEIGHT_REFERENCE,
  contrast = "dark-on-light",
  nudgeThousandths = 0,
} = {}) {
  if (!isFiniteNumber(fontSizePx)) {
    return { error: "Enter a font size in pixels." };
  }
  if (fontSizePx < MIN_FONT_SIZE_PX || fontSizePx > MAX_FONT_SIZE_PX) {
    return {
      error: `Font size must be between ${MIN_FONT_SIZE_PX}px and ${MAX_FONT_SIZE_PX}px.`,
    };
  }
  if (!isFiniteNumber(fontWeight) || fontWeight < MIN_FONT_WEIGHT || fontWeight > MAX_FONT_WEIGHT) {
    return {
      error: `Font weight must be between ${MIN_FONT_WEIGHT} and ${MAX_FONT_WEIGHT}.`,
    };
  }
  if (!isFiniteNumber(nudgeThousandths) || Math.abs(nudgeThousandths) > 1000) {
    return { error: "Manual nudge must be between -1000 and 1000 thousandths of an em." };
  }
  if (!Object.prototype.hasOwnProperty.call(CASE_ADJUST_EM, textCase)) {
    return { error: "Choose a valid text case." };
  }
  if (!Object.prototype.hasOwnProperty.call(CONTRAST_ADJUST_EM, contrast)) {
    return { error: "Choose a valid contrast setting." };
  }

  const base = baseTrackingEm(fontSizePx);
  const caseAdjustEm = CASE_ADJUST_EM[textCase];
  const weightAdjustEm = ((fontWeight - WEIGHT_REFERENCE) / 100) * WEIGHT_ADJUST_EM_PER_100;
  const contrastAdjustEm = CONTRAST_ADJUST_EM[contrast];
  const nudgeEm = nudgeThousandths / EM_TO_THOUSANDTHS;

  const rawEm = base + caseAdjustEm + weightAdjustEm + contrastAdjustEm + nudgeEm;
  const trackingEm = clamp(rawEm, MIN_TRACKING_EM, MAX_TRACKING_EM);

  return {
    fontSizePx,
    baseEm: base,
    caseAdjustEm,
    weightAdjustEm,
    contrastAdjustEm,
    nudgeEm,
    rawEm,
    trackingEm,
    trackingPx: trackingEm * fontSizePx,
    trackingThousandths: Math.round(trackingEm * EM_TO_THOUSANDTHS),
    clamped: rawEm !== trackingEm,
    label: describeTracking(trackingEm),
  };
}

/** Plain-language band for a tracking value in em. */
export function describeTracking(trackingEm) {
  if (!isFiniteNumber(trackingEm)) return "Unknown";
  if (trackingEm <= -0.02) return "Tight";
  if (trackingEm < -0.005) return "Slightly tight";
  if (trackingEm <= 0.005) return "Neutral";
  if (trackingEm <= 0.05) return "Slightly open";
  return "Open";
}

/**
 * Format a tracking value as a CSS-ready em string, e.g. "-0.011em".
 * Trailing zeros are trimmed so the output is paste-ready.
 */
export function formatEm(trackingEm, decimals = 3) {
  if (!isFiniteNumber(trackingEm)) return "0em";
  const fixed = trackingEm.toFixed(decimals);
  const trimmed = fixed.replace(/\.?0+$/, "");
  return `${trimmed === "" || trimmed === "-0" ? "0" : trimmed}em`;
}

/** A single CSS declaration for the computed tracking. */
export function toCssDeclaration(result) {
  if (!result || result.error) return "";
  return `letter-spacing: ${formatEm(result.trackingEm)};`;
}

/** A ready-to-paste rule including the size it was tuned for. */
export function toCssRule(result, selector = ".display") {
  if (!result || result.error) return "";
  return [
    `${selector} {`,
    `  font-size: ${result.fontSizePx}px;`,
    `  letter-spacing: ${formatEm(result.trackingEm)};`,
    `}`,
  ].join("\n");
}

/**
 * Tracking for a ladder of sizes using one set of style options.
 * Sizes outside the supported range are skipped rather than returned as errors.
 */
export function buildTrackingScale({
  sizes = DEFAULT_SCALE_SIZES,
  textCase = "normal",
  fontWeight = WEIGHT_REFERENCE,
  contrast = "dark-on-light",
  nudgeThousandths = 0,
} = {}) {
  if (!Array.isArray(sizes)) return [];
  return sizes
    .map((fontSizePx) =>
      computeTracking({ fontSizePx, textCase, fontWeight, contrast, nudgeThousandths }),
    )
    .filter((row) => !row.error);
}
