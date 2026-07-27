/**
 * Aura colour generator.
 *
 * The aura reading itself is for fun, but the colour work underneath is real:
 * the tool takes the raw RGBA pixels of a photo, converts each sampled pixel to
 * HSL, and picks the dominant hue from a saturation-weighted circular
 * histogram. Weighting by saturation matters because grey pixels — skin
 * shadows, walls, white shirts — have a hue value that is numerically defined
 * but visually meaningless, so an unweighted average drifts towards whatever
 * noise the sensor produced.
 *
 * Colour conversions follow the standard sRGB <-> HSL formulas; the palette
 * uses classic colour-wheel relationships (analogous ±30°, triadic ±120°,
 * complementary +180°).
 *
 * Pure module: no React, no DOM, no clock reads. Feed it a pixel array or a
 * text seed and the same input always produces the same aura.
 */

/** Hue bands on the colour wheel, each with its own playful reading.
 * `from` is inclusive, `to` exclusive, degrees clockwise from red at 0. */
export const AURA_BANDS = [
  {
    id: "red",
    name: "Ember Red",
    from: 345,
    to: 15,
    traits: ["driven", "direct", "physical"],
    reading: "You run hot. Decisions land fast, and you would rather fix a thing than discuss it.",
  },
  {
    id: "orange",
    name: "Amber Orange",
    from: 15,
    to: 45,
    traits: ["sociable", "adventurous", "warm"],
    reading: "The room warms up when you walk in. You collect people the way other folk collect hobbies.",
  },
  {
    id: "yellow",
    name: "Solar Yellow",
    from: 45,
    to: 70,
    traits: ["curious", "optimistic", "playful"],
    reading: "Relentlessly curious. You start six things on a good day and finish two, and the two are excellent.",
  },
  {
    id: "green",
    name: "Verdant Green",
    from: 70,
    to: 160,
    traits: ["steady", "nurturing", "patient"],
    reading: "The steady one. People bring you their tangled problems because you untangle them without fuss.",
  },
  {
    id: "teal",
    name: "Tidal Teal",
    from: 160,
    to: 195,
    traits: ["clear-headed", "focused", "calm"],
    reading: "Cool water. You think before you speak and it shows in how rarely you have to walk something back.",
  },
  {
    id: "blue",
    name: "Deep Blue",
    from: 195,
    to: 250,
    traits: ["reflective", "honest", "loyal"],
    reading: "Deep and quiet. You notice more than you say, and the people who know you rely on that.",
  },
  {
    id: "indigo",
    name: "Indigo",
    from: 250,
    to: 290,
    traits: ["intuitive", "imaginative", "private"],
    reading: "Half here, half somewhere better. Your instincts land right often enough to be unsettling.",
  },
  {
    id: "magenta",
    name: "Rose Magenta",
    from: 290,
    to: 345,
    traits: ["expressive", "affectionate", "bold"],
    reading: "Unapologetically expressive. You would rather be too much than forgettable.",
  },
];

/** Below this saturation the photo has no meaningful hue at all. */
export const GREY_SATURATION_THRESHOLD = 0.08;

/** The reading given when a photo is essentially colourless. */
export const GREY_AURA = {
  id: "silver",
  name: "Silver",
  traits: ["neutral", "observant", "unreadable"],
  reading: "Almost no colour came through. Either the light was flat or you are genuinely hard to read.",
};

/** Intensity bands, from the saturation of the dominant hue. */
export const INTENSITY_BANDS = [
  { id: "faint", label: "Faint", max: 0.25 },
  { id: "soft", label: "Soft", max: 0.45 },
  { id: "clear", label: "Clear", max: 0.65 },
  { id: "vivid", label: "Vivid", max: 0.85 },
  { id: "blazing", label: "Blazing", max: 1.01 },
];

/** Hue histogram resolution, in degrees per bucket. 36 buckets of 10 degrees
 * is fine enough to separate the bands above without splitting a single subject
 * across neighbouring buckets. */
export const HUE_BUCKET_DEGREES = 10;

/** Sample at most this many pixels; more adds nothing to a hue histogram and
 * makes a large photo feel slow. */
export const MAX_SAMPLES = 20000;

/** Pixels this transparent are skipped — a cut-out background is not aura. */
export const MIN_ALPHA = 32;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const clamp01 = (value) => Math.min(1, Math.max(0, value));

/** sRGB (0-255) to HSL, hue in degrees, saturation and lightness in 0-1. */
export function rgbToHsl(r, g, b) {
  const red = clamp01(r / 255);
  const green = clamp01(g / 255);
  const blue = clamp01(b / 255);
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;
  const delta = max - min;

  if (delta === 0) return { h: 0, s: 0, l: lightness };

  const saturation = delta / (1 - Math.abs(2 * lightness - 1));
  let hue;
  if (max === red) hue = 60 * (((green - blue) / delta) % 6);
  else if (max === green) hue = 60 * ((blue - red) / delta + 2);
  else hue = 60 * ((red - green) / delta + 4);
  if (hue < 0) hue += 360;

  return { h: hue, s: clamp01(saturation), l: lightness };
}

/** HSL back to sRGB (0-255, rounded). */
export function hslToRgb(h, s, l) {
  const hue = ((h % 360) + 360) % 360;
  const sat = clamp01(s);
  const light = clamp01(l);
  const c = (1 - Math.abs(2 * light - 1)) * sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = light - c / 2;
  let rgb;
  if (hue < 60) rgb = [c, x, 0];
  else if (hue < 120) rgb = [x, c, 0];
  else if (hue < 180) rgb = [0, c, x];
  else if (hue < 240) rgb = [0, x, c];
  else if (hue < 300) rgb = [x, 0, c];
  else rgb = [c, 0, x];
  return {
    r: Math.round((rgb[0] + m) * 255),
    g: Math.round((rgb[1] + m) * 255),
    b: Math.round((rgb[2] + m) * 255),
  };
}

/** CSS colour string for an HSL triple. Aura swatches are content, not part of
 * the interface theme, so they carry literal colour values. */
export function toCssHsl({ h, s, l }) {
  const hue = Number.isFinite(h) ? ((h % 360) + 360) % 360 : 0;
  return `hsl(${hue.toFixed(1)} ${(clamp01(s) * 100).toFixed(1)}% ${(clamp01(l) * 100).toFixed(1)}%)`;
}

/** The band a hue falls into, handling the red band that wraps past 360. */
export function bandForHue(hue) {
  if (!isNum(hue)) return null;
  const h = ((hue % 360) + 360) % 360;
  for (const band of AURA_BANDS) {
    if (band.from > band.to) {
      if (h >= band.from || h < band.to) return band;
    } else if (h >= band.from && h < band.to) {
      return band;
    }
  }
  return AURA_BANDS[0];
}

function intensityFor(saturation) {
  return INTENSITY_BANDS.find((band) => saturation < band.max) || INTENSITY_BANDS[INTENSITY_BANDS.length - 1];
}

/**
 * Dominant hue of an RGBA pixel buffer, by saturation-weighted histogram.
 *
 * @param {{ pixels: Uint8ClampedArray|number[], maxSamples?: number }} input
 * @returns {object} statistics, or { error: string }
 */
export function analyzePixels({ pixels, maxSamples = MAX_SAMPLES } = {}) {
  if (!pixels || typeof pixels.length !== "number") {
    return { error: "There is no image data to read." };
  }
  if (pixels.length < 4 || pixels.length % 4 !== 0) {
    return { error: "That image data is not a valid RGBA buffer." };
  }

  const pixelCount = pixels.length / 4;
  const limit = Math.max(1, Math.floor(maxSamples));
  const step = Math.max(1, Math.ceil(pixelCount / limit));

  const buckets = new Array(Math.ceil(360 / HUE_BUCKET_DEGREES)).fill(0);
  let sampled = 0;
  let opaque = 0;
  let sumR = 0;
  let sumG = 0;
  let sumB = 0;
  let sumS = 0;
  let sumL = 0;

  for (let index = 0; index < pixelCount; index += step) {
    const offset = index * 4;
    const alpha = pixels[offset + 3];
    sampled += 1;
    if (alpha < MIN_ALPHA) continue;
    opaque += 1;
    const r = pixels[offset];
    const g = pixels[offset + 1];
    const b = pixels[offset + 2];
    sumR += r;
    sumG += g;
    sumB += b;
    const { h, s, l } = rgbToHsl(r, g, b);
    sumS += s;
    sumL += l;
    // Weight by saturation: grey pixels have a hue but no colour.
    buckets[Math.floor(h / HUE_BUCKET_DEGREES) % buckets.length] += s;
  }

  if (opaque === 0) {
    return { error: "Every pixel sampled was transparent — there is no colour to read." };
  }

  const totalWeight = buckets.reduce((sum, value) => sum + value, 0);
  const meanSaturation = sumS / opaque;
  const meanLightness = sumL / opaque;

  let dominantIndex = 0;
  let secondIndex = 0;
  for (let i = 0; i < buckets.length; i += 1) {
    if (buckets[i] > buckets[dominantIndex]) dominantIndex = i;
  }
  for (let i = 0; i < buckets.length; i += 1) {
    // Ignore the two buckets either side of the winner, or the "second" hue is
    // just the same colour one notch over.
    const distance = Math.min(
      Math.abs(i - dominantIndex),
      buckets.length - Math.abs(i - dominantIndex),
    );
    if (distance >= 3 && buckets[i] > buckets[secondIndex]) secondIndex = i;
  }

  const dominantHue = (dominantIndex + 0.5) * HUE_BUCKET_DEGREES;
  const secondaryHue = (secondIndex + 0.5) * HUE_BUCKET_DEGREES;

  return {
    sampled,
    opaque,
    step,
    averageRgb: {
      r: Math.round(sumR / opaque),
      g: Math.round(sumG / opaque),
      b: Math.round(sumB / opaque),
    },
    dominantHue,
    secondaryHue,
    dominantShare: totalWeight > 0 ? buckets[dominantIndex] / totalWeight : 0,
    meanSaturation,
    meanLightness,
    isGrey: meanSaturation < GREY_SATURATION_THRESHOLD,
  };
}

/**
 * Five colour-wheel companions to a hue: the hue itself, both analogous
 * neighbours (±30°), one triadic (+120°) and the complement (+180°).
 *
 * @param {number} hue degrees
 * @param {number} saturation 0-1
 * @param {number} lightness 0-1
 * @returns {Array<{ role:string, hue:number, css:string }>}
 */
export function buildPalette(hue, saturation, lightness) {
  if (!isNum(hue)) return [];
  const s = clamp01(isNum(saturation) ? saturation : 0.6);
  const l = clamp01(isNum(lightness) ? lightness : 0.5);
  const roles = [
    { role: "Core", offset: 0, s, l },
    { role: "Analogous −30°", offset: -30, s, l: clamp01(l + 0.08) },
    { role: "Analogous +30°", offset: 30, s, l: clamp01(l - 0.08) },
    { role: "Triadic +120°", offset: 120, s: clamp01(s * 0.85), l },
    { role: "Complement +180°", offset: 180, s, l: clamp01(l * 0.9) },
  ];
  return roles.map((entry) => {
    const h = ((hue + entry.offset) % 360 + 360) % 360;
    return { role: entry.role, hue: h, css: toCssHsl({ h, s: entry.s, l: entry.l }) };
  });
}

/**
 * Turn pixel statistics into an aura reading.
 *
 * @param {{ pixels:Uint8ClampedArray|number[], maxSamples?:number }} input
 * @returns {object} reading, or { error: string }
 */
export function auraFromPixels(input) {
  const stats = analyzePixels(input);
  if (stats.error) return { error: stats.error };
  return buildReading({
    hue: stats.dominantHue,
    secondaryHue: stats.secondaryHue,
    saturation: stats.meanSaturation,
    lightness: stats.meanLightness,
    isGrey: stats.isGrey,
    stats,
    source: "photo",
  });
}

/**
 * FNV-1a 32-bit hash — a small, well-defined, non-cryptographic hash used here
 * only to turn a name into a repeatable hue.
 *
 * @param {string} text
 * @returns {number} unsigned 32-bit integer
 */
export function fnv1a(text) {
  const source = String(text ?? "");
  let hash = 0x811c9dc5; // FNV offset basis
  for (let i = 0; i < source.length; i += 1) {
    hash ^= source.charCodeAt(i);
    // hash *= 16777619, done with shifts to stay inside 32 bits.
    hash = (hash + (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24)) >>> 0;
  }
  return hash >>> 0;
}

/**
 * Aura from a name or any other text seed, for people with no photo to hand.
 *
 * @param {string} seed
 * @returns {object} reading, or { error: string }
 */
export function auraFromSeed(seed) {
  const text = String(seed ?? "").trim();
  if (!text) return { error: "Type a name — an empty seed has no aura." };
  const hash = fnv1a(text.toLowerCase());
  const hue = hash % 360;
  // Two more independent slices of the same hash, kept inside pleasant ranges.
  const saturation = 0.45 + ((hash >>> 9) % 46) / 100; // 0.45 - 0.90
  const lightness = 0.40 + ((hash >>> 18) % 26) / 100; // 0.40 - 0.65
  return buildReading({
    hue,
    secondaryHue: (hue + 150 + ((hash >>> 5) % 60)) % 360,
    saturation,
    lightness,
    isGrey: false,
    stats: null,
    source: "name",
    seed: text,
  });
}

function buildReading({ hue, secondaryHue, saturation, lightness, isGrey, stats, source, seed }) {
  if (!isNum(hue)) return { error: "No usable colour could be read." };
  const band = isGrey ? GREY_AURA : bandForHue(hue);
  const secondaryBand = isGrey ? null : bandForHue(secondaryHue);
  const intensity = intensityFor(clamp01(saturation));

  const displaySaturation = isGrey ? 0.12 : clamp01(Math.max(0.35, saturation));
  const displayLightness = clamp01(Math.min(0.72, Math.max(0.32, lightness)));

  return {
    source,
    seed: seed || null,
    hue,
    secondaryHue,
    saturation,
    lightness,
    isGrey,
    band,
    secondaryBand: secondaryBand && secondaryBand.id !== band.id ? secondaryBand : null,
    intensity,
    css: toCssHsl({ h: hue, s: displaySaturation, l: displayLightness }),
    rgb: hslToRgb(hue, displaySaturation, displayLightness),
    palette: buildPalette(hue, displaySaturation, displayLightness),
    traits: band.traits,
    reading: band.reading,
    stats,
  };
}
