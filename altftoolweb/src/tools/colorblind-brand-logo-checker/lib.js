/**
 * Colour vision deficiency simulation for logo and brand artwork.
 *
 * Dichromacy is simulated with the LMS-space method of Brettel, Viénot and
 * Mollon (1997) in the linearised form published by Viénot, Brettel and Mollon,
 * "Digital video colourmaps for checking the legibility of displays by
 * dichromats" (Color Research and Application, 1999). Linear sRGB is converted
 * to LMS cone responses, the missing cone response is replaced by a projection
 * onto the surviving pair, and the result is converted back.
 *
 * Anomalous trichromacy (protanomaly, deuteranomaly, tritanomaly) is
 * approximated by linearly blending the original colour with the dichromatic
 * result. That is an approximation, not a physiological model — a severity of
 * 1.0 is the only physically derived case.
 *
 * Achromatopsia uses WCAG relative luminance (Rec. 709 weights on linearised
 * sRGB), the same definition WCAG 2.x uses for contrast.
 *
 * Colour differences are reported as CIE76 delta-E in CIELAB under a D65 white
 * point. A delta-E of about 2.3 is the classic just-noticeable-difference
 * threshold, so any pair falling below it after simulation has effectively
 * merged.
 */

/** Linear sRGB to LMS cone response (Viénot, Brettel and Mollon 1999). */
export const RGB_TO_LMS = [
  [17.8824, 43.5161, 4.11935],
  [3.45565, 27.1554, 3.86714],
  [0.0299566, 0.184309, 1.46709],
];

/** Inverse of RGB_TO_LMS. */
export const LMS_TO_RGB = [
  [0.080944, -0.130504, 0.116721],
  [-0.0102485, 0.0540194, -0.113615],
  [-0.000365294, -0.00412163, 0.693513],
];

/** Dichromat projections in LMS space. */
export const DICHROMAT_MATRICES = {
  protanopia: [
    [0, 2.02344, -2.52581],
    [0, 1, 0],
    [0, 0, 1],
  ],
  deuteranopia: [
    [1, 0, 0],
    [0.494207, 0, 1.24827],
    [0, 0, 1],
  ],
  tritanopia: [
    [1, 0, 0],
    [0, 1, 0],
    [-0.395913, 0.801109, 0],
  ],
};

/** Rec. 709 luminance weights. */
export const REC709 = [0.2126, 0.7152, 0.0722];

/** sRGB transfer function constants (IEC 61966-2-1). */
export const SRGB_THRESHOLD = 0.04045;
export const SRGB_LINEAR_DIVISOR = 12.92;
export const SRGB_OFFSET = 0.055;
export const SRGB_GAMMA = 2.4;

/** sRGB (linear) to CIE XYZ, D65 white point. */
export const RGB_TO_XYZ = [
  [0.4124564, 0.3575761, 0.1804375],
  [0.2126729, 0.7151522, 0.072175],
  [0.0193339, 0.119192, 0.9503041],
];
/** CIE D65 reference white, normalised so Y = 1. */
export const D65 = [0.95047, 1.0, 1.08883];
/** CIE standard epsilon and kappa for the L* function. */
export const LAB_EPSILON = 216 / 24389;
export const LAB_KAPPA = 24389 / 27;
/** Classic just-noticeable-difference threshold for CIE76 delta-E. */
export const DELTA_E_JND = 2.3;
/** Below this delta-E two brand colours are effectively the same colour. */
export const DELTA_E_MERGED = 5;

export const CVD_TYPES = [
  {
    key: "protanopia",
    label: "Protanopia",
    family: "Red-blind",
    prevalence: "About 1% of men; long-wavelength (L) cones absent.",
  },
  {
    key: "deuteranopia",
    label: "Deuteranopia",
    family: "Green-blind",
    prevalence: "About 1% of men; medium-wavelength (M) cones absent. Deuteranomaly, the milder form, affects around 5%.",
  },
  {
    key: "tritanopia",
    label: "Tritanopia",
    family: "Blue-blind",
    prevalence: "Roughly 1 in 10,000 people, and unlike the red-green forms it affects men and women equally.",
  },
  {
    key: "achromatopsia",
    label: "Achromatopsia",
    family: "No colour vision",
    prevalence: "Complete rod monochromacy affects about 1 in 30,000 people, and matches any greyscale reproduction.",
  },
];

const clamp01 = (value) => Math.min(1, Math.max(0, value));
const clamp255 = (value) => Math.min(255, Math.max(0, Math.round(value)));

/** Linearise one gamma-encoded sRGB channel (0-255) to 0-1 linear light. */
export function srgbToLinear(channel) {
  const c = Math.min(255, Math.max(0, Number(channel) || 0)) / 255;
  return c <= SRGB_THRESHOLD
    ? c / SRGB_LINEAR_DIVISOR
    : Math.pow((c + SRGB_OFFSET) / (1 + SRGB_OFFSET), SRGB_GAMMA);
}

/** Encode a 0-1 linear value back to a gamma-encoded sRGB channel (0-255). */
export function linearToSrgb(value) {
  const v = clamp01(Number(value) || 0);
  const encoded =
    v <= SRGB_THRESHOLD / SRGB_LINEAR_DIVISOR
      ? v * SRGB_LINEAR_DIVISOR
      : (1 + SRGB_OFFSET) * Math.pow(v, 1 / SRGB_GAMMA) - SRGB_OFFSET;
  return clamp255(encoded * 255);
}

function applyMatrix(matrix, vector) {
  return matrix.map((row) => row[0] * vector[0] + row[1] * vector[1] + row[2] * vector[2]);
}

/** WCAG relative luminance of an sRGB triple. */
export function relativeLuminance([r, g, b]) {
  return REC709[0] * srgbToLinear(r) + REC709[1] * srgbToLinear(g) + REC709[2] * srgbToLinear(b);
}

/**
 * Simulate one sRGB colour under a colour vision deficiency.
 *
 * @param {[number,number,number]} rgb - 0-255 channels
 * @param {string} type - a CVD_TYPES key
 * @param {number} [severity] - 0 (normal vision) to 1 (full dichromacy)
 * @returns {[number,number,number]} simulated sRGB, never NaN
 */
export function simulateColorVision(rgb, type, severity = 1) {
  const source = [Number(rgb?.[0]) || 0, Number(rgb?.[1]) || 0, Number(rgb?.[2]) || 0];
  const strength = clamp01(Number(severity));
  if (strength === 0) return [clamp255(source[0]), clamp255(source[1]), clamp255(source[2])];

  let simulated;
  if (type === "achromatopsia") {
    const grey = linearToSrgb(relativeLuminance(source));
    simulated = [grey, grey, grey];
  } else {
    const matrix = DICHROMAT_MATRICES[type];
    if (!matrix) return [clamp255(source[0]), clamp255(source[1]), clamp255(source[2])];
    const linear = source.map(srgbToLinear);
    const lms = applyMatrix(RGB_TO_LMS, linear);
    const projected = applyMatrix(matrix, lms);
    const back = applyMatrix(LMS_TO_RGB, projected);
    simulated = back.map(linearToSrgb);
  }

  return [0, 1, 2].map((i) => clamp255(source[i] + (simulated[i] - source[i]) * strength));
}

/** Convert an sRGB triple to CIELAB under D65. */
export function rgbToLab(rgb) {
  const linear = [srgbToLinear(rgb[0]), srgbToLinear(rgb[1]), srgbToLinear(rgb[2])];
  const xyz = applyMatrix(RGB_TO_XYZ, linear);
  const f = xyz.map((value, index) => {
    const t = value / D65[index];
    return t > LAB_EPSILON ? Math.cbrt(t) : (LAB_KAPPA * t + 16) / 116;
  });
  return [116 * f[1] - 16, 500 * (f[0] - f[1]), 200 * (f[1] - f[2])];
}

/** CIE76 colour difference between two sRGB triples. Always finite and >= 0. */
export function deltaE76(rgbA, rgbB) {
  const a = rgbToLab(rgbA);
  const b = rgbToLab(rgbB);
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);
}

/** Format a channel triple as a #rrggbb string. */
export function rgbToHex([r, g, b]) {
  return `#${[r, g, b].map((c) => clamp255(c).toString(16).padStart(2, "0")).join("")}`;
}

/**
 * Apply a simulation to a whole RGBA buffer, leaving alpha untouched.
 * Results are memoised per unique colour, so a flat logo costs a handful of
 * matrix multiplications regardless of how many pixels it has.
 *
 * @param {ArrayLike<number>} data - RGBA bytes
 * @param {string} type
 * @param {number} [severity]
 * @returns {Uint8ClampedArray} a new buffer; the input is not modified
 */
export function simulateImageData(data, type, severity = 1) {
  const out = new Uint8ClampedArray(data.length);
  const cache = new Map();
  for (let i = 0; i + 3 < data.length; i += 4) {
    const key = (data[i] << 16) | (data[i + 1] << 8) | data[i + 2];
    let simulated = cache.get(key);
    if (!simulated) {
      simulated = simulateColorVision([data[i], data[i + 1], data[i + 2]], type, severity);
      cache.set(key, simulated);
    }
    out[i] = simulated[0];
    out[i + 1] = simulated[1];
    out[i + 2] = simulated[2];
    out[i + 3] = data[i + 3];
  }
  return out;
}

/**
 * Reduce raw RGBA pixel data to its most common colours.
 * Channels are bucketed to 4 bits each so near-identical antialiasing shades
 * collapse together; fully and mostly transparent pixels are ignored.
 *
 * @param {ArrayLike<number>} data - RGBA bytes
 * @param {object} [options]
 * @returns {{ rgb:[number,number,number], share:number }[]}
 */
export function dominantColors(data, { maxColors = 6, alphaCutoff = 128, step = 4 } = {}) {
  if (!data || typeof data.length !== "number" || data.length < 4) return [];
  const buckets = new Map();
  let counted = 0;
  const stride = Math.max(1, Math.trunc(step)) * 4;
  for (let i = 0; i + 3 < data.length; i += stride) {
    if (data[i + 3] < alphaCutoff) continue;
    const key =
      ((data[i] >> 4) << 8) | ((data[i + 1] >> 4) << 4) | (data[i + 2] >> 4);
    const bucket = buckets.get(key) || { r: 0, g: 0, b: 0, n: 0 };
    bucket.r += data[i];
    bucket.g += data[i + 1];
    bucket.b += data[i + 2];
    bucket.n += 1;
    buckets.set(key, bucket);
    counted += 1;
  }
  if (counted === 0) return [];
  return Array.from(buckets.values())
    .sort((a, b) => b.n - a.n)
    .slice(0, Math.max(1, Math.trunc(maxColors)))
    .map((bucket) => ({
      rgb: [
        clamp255(bucket.r / bucket.n),
        clamp255(bucket.g / bucket.n),
        clamp255(bucket.b / bucket.n),
      ],
      share: bucket.n / counted,
    }));
}

/**
 * Score how a set of logo colours holds up under one deficiency.
 *
 * @param {object} input
 * @param {{rgb:number[], share:number}[]} input.colors
 * @param {string} input.type
 * @param {number} [input.severity]
 * @returns {object} report or { error }
 */
export function analyseLogoColors({ colors = [], type = "deuteranopia", severity = 1 } = {}) {
  if (!Array.isArray(colors) || colors.length < 2) {
    return { error: "Need at least two distinct colours in the artwork to compare." };
  }
  if (!CVD_TYPES.some((item) => item.key === type)) {
    return { error: "Unknown colour vision type." };
  }
  const strength = clamp01(Number(severity));

  const swatches = colors.slice(0, 8).map((entry, index) => {
    const rgb = [clamp255(entry.rgb?.[0]), clamp255(entry.rgb?.[1]), clamp255(entry.rgb?.[2])];
    const simulated = simulateColorVision(rgb, type, strength);
    return {
      index,
      rgb,
      hex: rgbToHex(rgb),
      simulated,
      simulatedHex: rgbToHex(simulated),
      share: Number.isFinite(entry.share) ? entry.share : 0,
      shift: deltaE76(rgb, simulated),
    };
  });

  const pairs = [];
  for (let i = 0; i < swatches.length; i += 1) {
    for (let j = i + 1; j < swatches.length; j += 1) {
      const before = deltaE76(swatches[i].rgb, swatches[j].rgb);
      const after = deltaE76(swatches[i].simulated, swatches[j].simulated);
      const loss = before > 0 ? 1 - after / before : 0;
      let verdict = "Still clearly different";
      let level = "pass";
      if (after < DELTA_E_JND) {
        verdict = "Merges — below the just-noticeable difference";
        level = "critical";
      } else if (after < DELTA_E_MERGED) {
        verdict = "Barely separable";
        level = "fail";
      } else if (loss > 0.5) {
        verdict = "Difference more than halved";
        level = "warn";
      }
      pairs.push({
        a: swatches[i],
        b: swatches[j],
        before,
        after,
        loss,
        verdict,
        level,
      });
    }
  }

  pairs.sort((left, right) => left.after - right.after);
  const merged = pairs.filter((pair) => pair.after < DELTA_E_JND).length;
  const weakened = pairs.filter((pair) => pair.loss > 0.5).length;
  const maxShift = swatches.reduce((max, swatch) => Math.max(max, swatch.shift), 0);

  return {
    type,
    typeLabel: CVD_TYPES.find((item) => item.key === type).label,
    severity: strength,
    swatches,
    pairs,
    merged,
    weakened,
    maxShift,
    pairCount: pairs.length,
    summary:
      merged > 0
        ? `${merged} of ${pairs.length} colour pairs fall below a just-noticeable difference.`
        : `All ${pairs.length} colour pairs stay above the 2.3 delta-E threshold.`,
  };
}
