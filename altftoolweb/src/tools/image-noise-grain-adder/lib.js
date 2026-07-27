/**
 * Film grain and noise synthesis for RGBA pixel buffers.
 *
 * The model
 * ---------
 * 1. Silver-halide grain is a random density fluctuation, and for a large number of grains per
 *    unit area it is well approximated by additive Gaussian noise. Gaussian samples are produced
 *    here with the Box–Muller transform: z = sqrt(-2 ln u1) * cos(2 pi u2), u1, u2 uniform in (0,1].
 * 2. Grain is most visible in the midtones and vanishes in clipped blacks and blown highlights,
 *    because density fluctuation is largest where the characteristic curve is steepest. That is
 *    modelled with the parabola w = 4L(1 - L), which peaks at L = 0.5 (mid grey) and reaches 0 at
 *    pure black and pure white. L is Rec. 709 relative luminance.
 * 3. Grain size is simulated by generating the noise field on a coarser lattice and sampling it
 *    with nearest-neighbour, so a size of 3 makes each grain a 3 x 3 pixel cluster.
 * 4. Colour negative film shows chromatic grain because the three dye layers are independent;
 *    black-and-white film and most digital luminance noise are monochromatic. The `monochrome`
 *    option switches between one shared noise sample per pixel and one per channel.
 * 5. Everything is driven by a seeded PRNG (mulberry32), so the same image plus the same settings
 *    always gives byte-identical output — no Math.random anywhere.
 *
 * All functions here are pure: they take and return plain typed arrays and never touch the DOM.
 */

/** Rec. ITU-R BT.709 luminance coefficients for linear-ish sRGB values. */
export const LUMA_R = 0.2126;
export const LUMA_G = 0.7152;
export const LUMA_B = 0.0722;

/** Largest grain cluster accepted, in pixels along one edge. */
export const MAX_GRAIN_SIZE = 8;

/** Intensity 100 maps to this standard deviation in 8-bit code values. */
export const MAX_NOISE_SIGMA = 48;

/**
 * Named looks. `intensity` is 0-100, `size` is the grain cluster edge in pixels, `monochrome`
 * follows whether the stock's grain is chromatic, and `midtoneBias` is how strongly the
 * 4L(1-L) midtone weighting is applied (0 = flat noise everywhere, 1 = full weighting).
 */
export const GRAIN_PRESETS = [
  { id: "clean", label: "Clean (no grain)", intensity: 0, size: 1, monochrome: true, midtoneBias: 1, shadowLift: 0 },
  { id: "kodak-portra-400", label: "Fine colour negative, ISO 400", intensity: 18, size: 1, monochrome: false, midtoneBias: 1, shadowLift: 0 },
  { id: "tri-x-400", label: "Classic black & white, ISO 400", intensity: 34, size: 2, monochrome: true, midtoneBias: 0.85, shadowLift: 0 },
  { id: "pushed-1600", label: "Pushed to ISO 1600", intensity: 52, size: 2, monochrome: true, midtoneBias: 0.7, shadowLift: 6 },
  { id: "super-8", label: "Super 8 cine", intensity: 44, size: 3, monochrome: false, midtoneBias: 0.8, shadowLift: 4 },
  { id: "vhs", label: "VHS / video noise", intensity: 30, size: 2, monochrome: false, midtoneBias: 0.35, shadowLift: 10 },
  { id: "digital-iso-6400", label: "Digital sensor, ISO 6400", intensity: 26, size: 1, monochrome: false, midtoneBias: 0.4, shadowLift: 8 },
  { id: "heavy", label: "Heavy cinematic texture", intensity: 70, size: 3, monochrome: true, midtoneBias: 0.9, shadowLift: 2 },
];

/**
 * Longest edge the filter will work at. Grain is applied per pixel in JavaScript, so a 24 MP
 * file would mean 96 million array writes; downscaling first keeps the preview interactive.
 */
export const MAX_WORKING_EDGE = 2000;

const isBadNumber = (value) => typeof value !== "number" || !Number.isFinite(value);
const clamp = (value, low, high) => (value < low ? low : value > high ? high : value);

/**
 * mulberry32 — a small, fast, well-distributed 32-bit PRNG. Deterministic for a given seed.
 * @param {number} seed
 * @returns {() => number} generator returning a float in [0, 1)
 */
export function createRandom(seed) {
  let state = (Number.isFinite(seed) ? Math.floor(seed) : 1) >>> 0;
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** One standard normal sample via Box–Muller. u1 is nudged off zero so the log stays finite. */
export function gaussian(random) {
  const u1 = Math.max(random(), Number.EPSILON);
  const u2 = random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

/** Rec. 709 relative luminance of an 8-bit sRGB triple, normalised to 0-1. */
export function luminance(r, g, b) {
  return (LUMA_R * r + LUMA_G * g + LUMA_B * b) / 255;
}

/** Midtone weighting: 1 at mid grey, 0 at clipped black and white. */
export function midtoneWeight(normalisedLuma, bias) {
  const parabola = 4 * normalisedLuma * (1 - normalisedLuma);
  return 1 - bias + bias * parabola;
}

/**
 * Build a coarse Gaussian noise field and return it plus its lattice dimensions.
 * Exported so the UI can show a grain preview without re-running the whole filter.
 */
export function buildNoiseField({ width, height, size = 1, channels = 1, seed = 1 }) {
  if (isBadNumber(width) || isBadNumber(height) || width < 1 || height < 1) {
    return { error: "Image width and height must both be at least 1 pixel." };
  }
  const cell = clamp(Math.round(size), 1, MAX_GRAIN_SIZE);
  const fieldWidth = Math.ceil(width / cell);
  const fieldHeight = Math.ceil(height / cell);
  const planes = channels === 3 ? 3 : 1;
  const field = new Float32Array(fieldWidth * fieldHeight * planes);
  const random = createRandom(seed);
  for (let index = 0; index < field.length; index += 1) {
    field[index] = gaussian(random);
  }
  return { field, fieldWidth, fieldHeight, cell, planes };
}

/**
 * Add film grain to an RGBA buffer.
 *
 * @param {Uint8ClampedArray|Uint8Array|Array<number>} pixels RGBA, length = width * height * 4.
 * @param {object} options
 * @param {number} options.width
 * @param {number} options.height
 * @param {number} [options.intensity]   0-100, mapped to a standard deviation in code values.
 * @param {number} [options.size]        Grain cluster edge in pixels, 1-8.
 * @param {boolean} [options.monochrome] One noise sample per pixel instead of one per channel.
 * @param {number} [options.midtoneBias] 0-1, how strongly grain is pushed towards the midtones.
 * @param {number} [options.shadowLift]  0-40 code values of flat lift, as digital noise floors do.
 * @param {number} [options.seed]        Any integer; the same seed gives the same grain.
 * @returns {{ pixels: Uint8ClampedArray, sigma: number, changedPixels: number }} or { error }
 */
export function applyGrain(pixels, options = {}) {
  const {
    width,
    height,
    intensity = 30,
    size = 1,
    monochrome = false,
    midtoneBias = 1,
    shadowLift = 0,
    seed = 1,
  } = options;

  if (!pixels || typeof pixels.length !== "number" || pixels.length === 0) {
    return { error: "No image data was supplied." };
  }
  if (isBadNumber(width) || isBadNumber(height) || width < 1 || height < 1) {
    return { error: "Image width and height must both be at least 1 pixel." };
  }
  if (pixels.length !== width * height * 4) {
    return {
      error: `Pixel buffer is ${pixels.length} bytes but ${width} x ${height} RGBA needs ${width * height * 4}.`,
    };
  }
  if (isBadNumber(intensity) || intensity < 0 || intensity > 100) {
    return { error: "Grain intensity must be between 0 and 100." };
  }
  if (isBadNumber(size) || size < 1 || size > MAX_GRAIN_SIZE) {
    return { error: `Grain size must be between 1 and ${MAX_GRAIN_SIZE} pixels.` };
  }
  if (isBadNumber(midtoneBias) || midtoneBias < 0 || midtoneBias > 1) {
    return { error: "Midtone bias must be between 0 and 1." };
  }
  if (isBadNumber(shadowLift) || shadowLift < 0 || shadowLift > 40) {
    return { error: "Shadow lift must be between 0 and 40 code values." };
  }

  const output = new Uint8ClampedArray(pixels.length);
  output.set(pixels);

  const sigma = (intensity / 100) * MAX_NOISE_SIGMA;
  if (sigma === 0 && shadowLift === 0) {
    return { pixels: output, sigma: 0, changedPixels: 0 };
  }

  const planes = monochrome ? 1 : 3;
  const noise = buildNoiseField({ width, height, size, channels: planes, seed });
  if (noise.error) return { error: noise.error };
  const { field, fieldWidth, cell } = noise;

  let changedPixels = 0;

  for (let y = 0; y < height; y += 1) {
    const fieldY = Math.floor(y / cell);
    for (let x = 0; x < width; x += 1) {
      const fieldX = Math.floor(x / cell);
      const fieldIndex = (fieldY * fieldWidth + fieldX) * planes;
      const pixelIndex = (y * width + x) * 4;

      const r = pixels[pixelIndex];
      const g = pixels[pixelIndex + 1];
      const b = pixels[pixelIndex + 2];
      const weight = midtoneWeight(luminance(r, g, b), midtoneBias);
      const amplitude = sigma * weight;

      let touched = false;
      for (let channel = 0; channel < 3; channel += 1) {
        const sample = field[fieldIndex + (planes === 1 ? 0 : channel)];
        const delta = sample * amplitude + shadowLift * (1 - luminance(r, g, b));
        if (delta !== 0) touched = true;
        output[pixelIndex + channel] = pixels[pixelIndex + channel] + delta;
      }
      // Alpha is never touched: grain is a density change, not a transparency change.
      output[pixelIndex + 3] = pixels[pixelIndex + 3];
      if (touched) changedPixels += 1;
    }
  }

  return { pixels: output, sigma: Math.round(sigma * 100) / 100, changedPixels };
}

/**
 * Scale a size down so its longest edge fits `maxEdge`, keeping the aspect ratio.
 * Never scales up. Returns whole pixels, minimum 1.
 */
export function fitWithin(width, height, maxEdge = MAX_WORKING_EDGE) {
  if (isBadNumber(width) || isBadNumber(height) || width < 1 || height < 1) {
    return { error: "Image width and height must both be at least 1 pixel." };
  }
  if (isBadNumber(maxEdge) || maxEdge < 1) {
    return { error: "Maximum edge must be at least 1 pixel." };
  }
  const longest = Math.max(width, height);
  if (longest <= maxEdge) {
    return { width: Math.round(width), height: Math.round(height), scale: 1, scaled: false };
  }
  const scale = maxEdge / longest;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
    scale,
    scaled: true,
  };
}

/**
 * A deterministic test image: a horizontal luminance ramp crossed with vertical colour bands,
 * so the midtone weighting and the chromatic/monochrome switch are both visible without an
 * upload. Pure — no canvas, no DOM.
 */
export function createSamplePixels(width = 480, height = 300) {
  if (isBadNumber(width) || isBadNumber(height) || width < 1 || height < 1) {
    return { error: "Sample width and height must both be at least 1 pixel." };
  }
  const w = Math.min(Math.round(width), MAX_WORKING_EDGE);
  const h = Math.min(Math.round(height), MAX_WORKING_EDGE);
  const pixels = new Uint8ClampedArray(w * h * 4);
  const bands = [
    [255, 255, 255],
    [235, 190, 120],
    [120, 170, 200],
    [200, 120, 140],
  ];
  for (let y = 0; y < h; y += 1) {
    const band = bands[Math.floor((y / h) * bands.length)] || bands[0];
    for (let x = 0; x < w; x += 1) {
      const ramp = x / Math.max(1, w - 1);
      const index = (y * w + x) * 4;
      pixels[index] = band[0] * ramp;
      pixels[index + 1] = band[1] * ramp;
      pixels[index + 2] = band[2] * ramp;
      pixels[index + 3] = 255;
    }
  }
  return { pixels, width: w, height: h };
}

/**
 * Describe what a settings combination will do, for the UI summary.
 * @returns {{ sigma: number, grainCells: number, description: string }} or { error }
 */
export function describeGrain({ width, height, intensity = 30, size = 1, monochrome = false }) {
  if (isBadNumber(width) || isBadNumber(height) || width < 1 || height < 1) {
    return { error: "Load an image first." };
  }
  if (isBadNumber(intensity) || intensity < 0 || intensity > 100) {
    return { error: "Grain intensity must be between 0 and 100." };
  }
  if (isBadNumber(size) || size < 1 || size > MAX_GRAIN_SIZE) {
    return { error: `Grain size must be between 1 and ${MAX_GRAIN_SIZE} pixels.` };
  }
  const cell = Math.round(size);
  const grainCells = Math.ceil(width / cell) * Math.ceil(height / cell);
  const sigma = Math.round(((intensity / 100) * MAX_NOISE_SIGMA) * 100) / 100;
  return {
    sigma,
    grainCells,
    megapixels: Math.round(((width * height) / 1000000) * 100) / 100,
    description:
      intensity === 0
        ? "No grain: the image is passed through untouched."
        : `${monochrome ? "Monochrome" : "Chromatic"} grain, standard deviation ${sigma} code values, in ${cell} x ${cell} pixel clusters.`,
  };
}
