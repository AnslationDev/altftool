/**
 * Monitor Gamma Test Pattern — tone response maths.
 *
 * Pure module. The core idea: a 1-pixel black/white dither averages to 50% of
 * peak *light*, so the solid grey patch that visually matches it tells you the
 * display's electro-optical transfer function.
 */

/** sRGB transfer function constants (IEC 61966-2-1). */
export const SRGB = {
  encodedThreshold: 0.04045,
  linearThreshold: 0.0031308,
  slope: 12.92,
  alpha: 0.055,
  gamma: 2.4,
};

/** 8-bit code range. */
export const CODE_MAX = 255;

/** Light level a 1:1 black/white dither averages to, as a fraction of peak. */
export const DITHER_MEAN_LINEAR = 0.5;

/** Reference tone curves people usually calibrate to. */
export const REFERENCE_CURVES = [
  { id: "srgb", label: "sRGB (piecewise, ~2.2 overall)", gamma: null },
  { id: "g22", label: "Pure gamma 2.2 (sRGB display default)", gamma: 2.2 },
  { id: "g24", label: "Gamma 2.4 — BT.1886, dim grading suite", gamma: 2.4 },
  { id: "g18", label: "Gamma 1.8 — legacy Mac / prepress", gamma: 1.8 },
];

export const LIMITS = {
  minGamma: 1,
  maxGamma: 4,
  minSteps: 2,
  maxSteps: 64,
  minBitDepth: 2,
  maxBitDepth: 12,
};

/** Decode a 0-1 sRGB-encoded value to linear light. */
export function srgbToLinear(value) {
  const v = Number(value);
  if (!Number.isFinite(v)) return 0;
  const c = Math.min(1, Math.max(0, v));
  return c <= SRGB.encodedThreshold
    ? c / SRGB.slope
    : Math.pow((c + SRGB.alpha) / (1 + SRGB.alpha), SRGB.gamma);
}

/** Encode 0-1 linear light back through the sRGB transfer function. */
export function linearToSrgb(value) {
  const v = Number(value);
  if (!Number.isFinite(v)) return 0;
  const c = Math.min(1, Math.max(0, v));
  return c <= SRGB.linearThreshold
    ? c * SRGB.slope
    : (1 + SRGB.alpha) * Math.pow(c, 1 / SRGB.gamma) - SRGB.alpha;
}

/** Light output of an 8-bit code on a display with a pure power-law gamma. */
export function codeToLinear(code, gamma) {
  const c = Math.min(CODE_MAX, Math.max(0, Number(code) || 0)) / CODE_MAX;
  const g = Number(gamma);
  if (!Number.isFinite(g) || g <= 0) return srgbToLinear(c);
  return Math.pow(c, g);
}

/**
 * The 8-bit grey that matches a 50%-light dither on a display with the given
 * power-law gamma: V = 255 x 0.5^(1/gamma).
 * Pass gamma = null to use the sRGB transfer function instead.
 */
export function gammaMatchCode(gamma) {
  const g = Number(gamma);
  if (!Number.isFinite(g) || g <= 0) return linearToSrgb(DITHER_MEAN_LINEAR) * CODE_MAX;
  return CODE_MAX * Math.pow(DITHER_MEAN_LINEAR, 1 / g);
}

/**
 * Inverse: the gamma implied by the patch value that visually matched.
 * gamma = ln(0.5) / ln(V / 255).
 */
export function estimateGammaFromMatch(code) {
  const value = Number(code);
  if (!Number.isFinite(value) || value <= 0 || value >= CODE_MAX) {
    return { error: "The matching patch must be between 1 and 254." };
  }
  const gamma = Math.log(DITHER_MEAN_LINEAR) / Math.log(value / CODE_MAX);
  if (!Number.isFinite(gamma) || gamma <= 0) {
    return { error: "That patch value does not describe a usable gamma." };
  }
  const srgbCode = linearToSrgb(DITHER_MEAN_LINEAR) * CODE_MAX;
  return {
    code: value,
    gamma,
    srgbMatchCode: srgbCode,
    gamma22MatchCode: gammaMatchCode(2.2),
    offsetFromSrgbCodes: value - srgbCode,
    offsetFromGamma22: gamma - 2.2,
    verdict:
      Math.abs(gamma - 2.2) <= 0.1
        ? "Close to the sRGB / gamma 2.2 target."
        : gamma < 2.2
          ? "Lower than 2.2 — midtones read washed out and flat."
          : "Higher than 2.2 — midtones read crushed and contrasty.",
  };
}

/** CSS lightness percentage for an 8-bit grey (hsl lightness maps 1:1 for greys). */
export function greyLightnessPercent(code) {
  const c = Math.min(CODE_MAX, Math.max(0, Number(code) || 0));
  return (c / CODE_MAX) * 100;
}

/**
 * Step wedge: evenly spaced 8-bit codes with the light each one produces.
 * Neighbouring patches should look evenly separated; a clumped end means the
 * tone curve is off.
 */
export function buildStepWedge(steps, gamma) {
  const count = Math.round(Number(steps));
  if (!Number.isFinite(count) || count < LIMITS.minSteps || count > LIMITS.maxSteps) {
    return { error: `Step count must be between ${LIMITS.minSteps} and ${LIMITS.maxSteps}.` };
  }
  const patches = [];
  for (let i = 0; i < count; i += 1) {
    const code = Math.round((i * CODE_MAX) / (count - 1));
    patches.push({
      index: i,
      code,
      percent: (code / CODE_MAX) * 100,
      linearLight: codeToLinear(code, gamma) * 100,
      lightness: greyLightnessPercent(code),
    });
  }
  return { patches, count };
}

/**
 * Quantise an 8-bit code to a lower panel bit depth.
 * A 6-bit + FRC panel showing a smooth 8-bit ramp collapses 256 levels to 64.
 */
export function quantiseCode(code, bitDepth) {
  const bits = Math.round(Number(bitDepth));
  const c = Math.min(CODE_MAX, Math.max(0, Number(code) || 0));
  if (!Number.isFinite(bits) || bits < LIMITS.minBitDepth || bits > LIMITS.maxBitDepth) return c;
  const levels = Math.pow(2, bits) - 1;
  return (Math.round((c / CODE_MAX) * levels) / levels) * CODE_MAX;
}

/**
 * Banding ramp: the visible steps a ramp collapses to at a given panel depth,
 * plus the code distance between neighbouring levels.
 */
export function buildBandingRamp(bitDepth) {
  const bits = Math.round(Number(bitDepth));
  if (!Number.isFinite(bits) || bits < LIMITS.minBitDepth || bits > LIMITS.maxBitDepth) {
    return { error: `Panel bit depth must be between ${LIMITS.minBitDepth} and ${LIMITS.maxBitDepth} bits.` };
  }
  const levels = Math.pow(2, bits);
  const stops = [];
  for (let i = 0; i < levels; i += 1) {
    const code = (i / (levels - 1)) * CODE_MAX;
    stops.push({
      index: i,
      code,
      lightness: greyLightnessPercent(code),
      startPercent: (i / levels) * 100,
      endPercent: ((i + 1) / levels) * 100,
    });
  }
  return {
    bitDepth: bits,
    levels,
    codeStep: CODE_MAX / (levels - 1),
    stops,
  };
}

/** Near-black patches for shadow-crush checks (codes chosen to bracket the toe). */
export const NEAR_BLACK_CODES = [0, 1, 2, 3, 4, 6, 8, 12, 16, 20];

/** Near-white patches for highlight-clipping checks. */
export const NEAR_WHITE_CODES = [235, 239, 243, 247, 250, 252, 253, 254, 255];

/** Wrap a code list with the values a UI needs to draw and label it. */
export function buildClippingPatches(codes) {
  return codes.map((code) => ({
    code,
    lightness: greyLightnessPercent(code),
    linearSrgb: srgbToLinear(code / CODE_MAX) * 100,
  }));
}

/**
 * Everything a single run of the tool needs.
 *
 * @param {object} input
 * @param {number} input.matchCode  the 8-bit patch that matched the dither.
 * @param {number} input.steps      step-wedge patch count.
 * @param {number} input.bitDepth   panel bit depth for the banding ramp.
 */
export function analyseDisplay({ matchCode, steps, bitDepth } = {}) {
  const gamma = estimateGammaFromMatch(matchCode);
  if (gamma.error) return gamma;

  const wedge = buildStepWedge(steps, gamma.gamma);
  if (wedge.error) return wedge;

  const ramp = buildBandingRamp(bitDepth);
  if (ramp.error) return ramp;

  return {
    ...gamma,
    wedge: wedge.patches,
    ramp,
    nearBlack: buildClippingPatches(NEAR_BLACK_CODES),
    nearWhite: buildClippingPatches(NEAR_WHITE_CODES),
  };
}
