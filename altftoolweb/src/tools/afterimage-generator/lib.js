/**
 * Afterimage Generator — colour maths for negative (complementary) afterimages.
 *
 * A negative afterimage is the complement of the colour you adapted to: stare at
 * a saturated patch, look at white, and the fatigued cone/opponent channels
 * report the opposite colour. This module supplies the two complements people
 * actually use, plus WCAG luminance and contrast so a stimulus can be judged
 * strong enough, plus a documented decay model for the reveal animation.
 *
 * COLOUR MODELS
 *   sRGB inverse  : c' = 255 - c per channel. This is the "photographic negative"
 *                   used on classic afterimage cards (the green-and-black flag
 *                   that reappears in red, white and blue).
 *   Hue rotation  : hue + 180 degrees in HSL, saturation and lightness kept.
 *                   Matches what a designer means by "complementary colour".
 *
 * DECAY MODEL (display only — these are the tool's animation parameters, not a
 * measured physiological constant):
 *   build-up   strength(t) = 1 - exp(-t / ADAPTATION_TAU_SECONDS)
 *   fade       strength(t) = strength0 * exp(-t / DECAY_TAU_SECONDS)
 *
 * Pure module: no React, no DOM, no clock reads. Elapsed time is an argument.
 */

/** Time constant of the build-up curve, in seconds. */
export const ADAPTATION_TAU_SECONDS = 8;

/** Time constant of the fade curve, in seconds. */
export const DECAY_TAU_SECONDS = 6;

/** Strength below which the modelled afterimage is treated as gone. */
export const VISIBILITY_THRESHOLD = 0.1;

/** Staring longer than this adds almost nothing: 1 - exp(-60/8) = 99.9%. */
export const MAX_STARE_SECONDS = 60;

/** WCAG 2.1 relative-luminance channel coefficients (ITU-R BT.709 primaries). */
export const LUMINANCE_COEFFICIENTS = { r: 0.2126, g: 0.7152, b: 0.0722 };

/** sRGB transfer-function constants from the WCAG 2.1 definition of luminance. */
const SRGB_LINEAR_CUTOFF = 0.03928;
const SRGB_LINEAR_DIVISOR = 12.92;
const SRGB_GAMMA_OFFSET = 0.055;
const SRGB_GAMMA_EXPONENT = 2.4;

/** Stimulus swatch hex/name pairs; afterimage labels are computed below. */
const SWATCH_HEXES = [
  { hex: "#ff0000", name: "Red" },
  { hex: "#00a651", name: "Green" },
  { hex: "#0047ab", name: "Blue" },
  { hex: "#ffd400", name: "Yellow" },
  { hex: "#ff6f00", name: "Orange" },
  { hex: "#8a2be2", name: "Violet" },
  { hex: "#00ced1", name: "Turquoise" },
  { hex: "#ff1493", name: "Magenta" },
];

/** Neutral field the afterimage is projected onto. */
export const REVEAL_FIELD_HEX = "#ffffff";

/** Named hue sectors, used to describe a complement in words. */
const HUE_NAMES = [
  [0, "red"], [12, "vermilion"], [25, "orange"], [50, "yellow"],
  [70, "chartreuse"], [100, "green"], [150, "spring green"], [172, "cyan"],
  [190, "azure"], [220, "blue"], [255, "violet"], [280, "magenta"],
  [320, "rose"], [350, "red"],
];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Parse #rgb / #rrggbb into channel values 0-255.
 * @returns {{ r:number, g:number, b:number } | { error:string }}
 */
export function parseHex(input) {
  if (typeof input !== "string") return { error: "Enter a colour as a hex code." };
  const value = input.trim().replace(/^#/, "");
  if (!/^([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value)) {
    return { error: "That is not a valid hex colour — use 3 or 6 hex digits." };
  }
  const full =
    value.length === 3 ? value.split("").map((char) => char + char).join("") : value;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

/** Channel values 0-255 back to a lower-case #rrggbb string. */
export function toHex({ r, g, b }) {
  const part = (value) =>
    clamp(Math.round(isNum(value) ? value : 0), 0, 255).toString(16).padStart(2, "0");
  return `#${part(r)}${part(g)}${part(b)}`;
}

/** sRGB -> HSL, hue in degrees, saturation and lightness as 0-1. */
export function rgbToHsl({ r, g, b }) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const lightness = (max + min) / 2;
  const chroma = max - min;
  if (chroma === 0) return { h: 0, s: 0, l: lightness };
  const saturation = chroma / (1 - Math.abs(2 * lightness - 1));
  let hue;
  if (max === rn) hue = ((gn - bn) / chroma) % 6;
  else if (max === gn) hue = (bn - rn) / chroma + 2;
  else hue = (rn - gn) / chroma + 4;
  hue *= 60;
  if (hue < 0) hue += 360;
  return { h: hue, s: saturation, l: lightness };
}

/** HSL -> sRGB, inverse of rgbToHsl. */
export function hslToRgb({ h, s, l }) {
  const hue = ((h % 360) + 360) % 360;
  const chroma = (1 - Math.abs(2 * l - 1)) * clamp(s, 0, 1);
  const x = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = l - chroma / 2;
  let rgb;
  if (hue < 60) rgb = [chroma, x, 0];
  else if (hue < 120) rgb = [x, chroma, 0];
  else if (hue < 180) rgb = [0, chroma, x];
  else if (hue < 240) rgb = [0, x, chroma];
  else if (hue < 300) rgb = [x, 0, chroma];
  else rgb = [chroma, 0, x];
  return {
    r: Math.round((rgb[0] + m) * 255),
    g: Math.round((rgb[1] + m) * 255),
    b: Math.round((rgb[2] + m) * 255),
  };
}

/** WCAG 2.1 relative luminance, 0 (black) to 1 (white). */
export function relativeLuminance({ r, g, b }) {
  const linear = (channel) => {
    const c = clamp(channel, 0, 255) / 255;
    return c <= SRGB_LINEAR_CUTOFF
      ? c / SRGB_LINEAR_DIVISOR
      : ((c + SRGB_GAMMA_OFFSET) / (1 + SRGB_GAMMA_OFFSET)) ** SRGB_GAMMA_EXPONENT;
  };
  return (
    LUMINANCE_COEFFICIENTS.r * linear(r) +
    LUMINANCE_COEFFICIENTS.g * linear(g) +
    LUMINANCE_COEFFICIENTS.b * linear(b)
  );
}

/** WCAG contrast ratio between two colours, 1:1 to 21:1. */
export function contrastRatio(rgbA, rgbB) {
  const a = relativeLuminance(rgbA);
  const b = relativeLuminance(rgbB);
  const lighter = Math.max(a, b);
  const darker = Math.min(a, b);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Name the hue sector a colour falls in. */
export function hueName(hue) {
  if (!isNum(hue)) return "grey";
  const normalised = ((hue % 360) + 360) % 360;
  let name = "red";
  for (const [start, label] of HUE_NAMES) {
    if (normalised >= start) name = label;
  }
  return name;
}

/**
 * Name of the sRGB-inverse complement for a stimulus hex. Computed rather
 * than hand-written so a preset's advertised afterimage can never drift from
 * what predictAfterimage actually reports once that swatch is selected (the
 * default complement model shown is the sRGB inverse).
 */
function inverseAfterimageName(hex) {
  const rgb = parseHex(hex);
  if (rgb.error) return "";
  const inverse = { r: 255 - rgb.r, g: 255 - rgb.g, b: 255 - rgb.b };
  const name = hueName(rgbToHsl(inverse).h);
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/**
 * Stimulus swatches with a strong, nameable complement.
 * Kept here as data so the UI holds no colour literals of its own.
 */
export const STIMULUS_SWATCHES = SWATCH_HEXES.map((swatch) => ({
  ...swatch,
  afterimage: inverseAfterimageName(swatch.hex),
}));

/**
 * Which opponent channel carries most of the stimulus, from the classic
 * opponent axes: red-green = R - G, blue-yellow = B - (R + G) / 2.
 */
export function opponentBalance({ r, g, b }) {
  const redGreen = r - g;
  const blueYellow = b - (r + g) / 2;
  const dominant =
    Math.abs(redGreen) >= Math.abs(blueYellow) ? "red–green" : "blue–yellow";
  return {
    redGreen,
    blueYellow,
    dominantAxis: dominant,
    dominantPole:
      dominant === "red–green"
        ? redGreen >= 0
          ? "red side (afterimage leans green)"
          : "green side (afterimage leans red)"
        : blueYellow >= 0
          ? "blue side (afterimage leans yellow)"
          : "yellow side (afterimage leans blue)",
  };
}

/**
 * Everything the viewer needs for one stimulus colour and one staring time.
 *
 * @param {object} input
 * @param {string} input.hex stimulus colour
 * @param {number} input.stareSeconds how long the fixation lasted
 * @returns {object} result, or { error }
 */
export function predictAfterimage({ hex, stareSeconds }) {
  const rgb = parseHex(hex);
  if (rgb.error) return { error: rgb.error };
  if (!isNum(stareSeconds) || stareSeconds < 0) {
    return { error: "Staring time must be zero or more seconds." };
  }
  const seconds = Math.min(stareSeconds, MAX_STARE_SECONDS);

  const inverse = { r: 255 - rgb.r, g: 255 - rgb.g, b: 255 - rgb.b };
  const hsl = rgbToHsl(rgb);
  const rotated = hslToRgb({ h: hsl.h + 180, s: hsl.s, l: hsl.l });

  const strength = 1 - Math.exp(-seconds / ADAPTATION_TAU_SECONDS);
  const visibleSeconds =
    strength > VISIBILITY_THRESHOLD
      ? DECAY_TAU_SECONDS * Math.log(strength / VISIBILITY_THRESHOLD)
      : 0;

  const white = parseHex(REVEAL_FIELD_HEX);
  return {
    stimulusHex: toHex(rgb),
    inverseHex: toHex(inverse),
    rotatedHex: toHex(rotated),
    stimulusHue: hsl.h,
    stimulusSaturation: hsl.s,
    stimulusLightness: hsl.l,
    inverseHueName: hueName(rgbToHsl(inverse).h),
    rotatedHueName: hueName(hsl.h + 180),
    luminance: relativeLuminance(rgb),
    contrastWithWhite: contrastRatio(rgb, white),
    opponent: opponentBalance(rgb),
    stareSeconds: seconds,
    strength,
    strengthPercent: strength * 100,
    visibleSeconds,
    /** A washed-out stimulus adapts the cones far less. */
    weakStimulus: hsl.s < 0.35 || hsl.l < 0.15 || hsl.l > 0.9,
  };
}

/**
 * Strength remaining a given number of seconds after the reveal, for animating
 * the fade. Same exponential decay, evaluated at an arbitrary point.
 *
 * @returns {number} 0-1
 */
export function fadeAt(startStrength, secondsSinceReveal) {
  if (!isNum(startStrength) || startStrength <= 0) return 0;
  if (!isNum(secondsSinceReveal) || secondsSinceReveal <= 0) {
    return clamp(startStrength, 0, 1);
  }
  const value = startStrength * Math.exp(-secondsSinceReveal / DECAY_TAU_SECONDS);
  return value < VISIBILITY_THRESHOLD / 10 ? 0 : clamp(value, 0, 1);
}
