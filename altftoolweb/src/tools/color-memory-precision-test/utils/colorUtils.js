/**
 * Strictly parses a hex colour, accepting both the 3-digit shorthand (#abc)
 * and the 6-digit form (#aabbcc). Returns null for anything else, so callers
 * can tell a genuine black apart from an unparseable string.
 */
export const parseHex = (hex) => {
  const text = String(hex ?? "").trim();
  const short = /^#?([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(text);
  const full = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(text);
  if (short) {
    // #abc means #aabbcc — each digit is doubled, per the CSS Color spec.
    return {
      r: parseInt(short[1] + short[1], 16),
      g: parseInt(short[2] + short[2], 16),
      b: parseInt(short[3] + short[3], 16),
    };
  }
  if (full) {
    return {
      r: parseInt(full[1], 16),
      g: parseInt(full[2], 16),
      b: parseInt(full[3], 16),
    };
  }
  return null;
};

/**
 * Converts HEX to RGB. Unparseable input falls back to black rather than
 * producing NaN channels; use `parseHex` when you need to detect bad input.
 */
export const hexToRgb = (hex) => parseHex(hex) ?? { r: 0, g: 0, b: 0 };

/**
 * Converts RGB to HEX
 */
export const rgbToHex = (r, g, b) => {
  const toHex = (n) => {
    const val = Math.max(0, Math.min(255, Math.round(n)));
    const hex = val.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

/**
 * Converts RGB to HSL
 */
export const rgbToHsl = (r, g, b) => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
};

/**
 * Converts HSL to RGB
 */
export const hslToRgb = (h, s, l) => {
  s /= 100;
  l /= 100;
  h /= 360;
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
};

/**
 * Saturation and lightness ranges per difficulty, as [start, span] in HSL
 * percent. Hue is always the full 0-359 circle.
 *
 *  easy   — 70-99% saturation, 40-59% lightness: vivid, well-separated hues.
 *  medium — 40-99% saturation, 30-69% lightness: everyday UI colours.
 *  hard   — 10-89% saturation, 15-84% lightness: includes near-greys and
 *           near-blacks/whites, where memory for hue collapses fastest.
 */
export const DIFFICULTY_BANDS = {
  easy: { s: [70, 30], l: [40, 20] },
  medium: { s: [40, 60], l: [30, 40] },
  hard: { s: [10, 80], l: [15, 70] },
};

/**
 * Generates a random color based on difficulty.
 * `rng` defaults to Math.random; pass a seeded generator to make the result
 * reproducible in tests.
 */
export const generateRandomColor = (difficulty, rng = Math.random) => {
  const band = DIFFICULTY_BANDS[difficulty] ?? DIFFICULTY_BANDS.medium;
  const h = Math.floor(rng() * 360);
  const s = band.s[0] + Math.floor(rng() * band.s[1]);
  const l = band.l[0] + Math.floor(rng() * band.l[1]);

  const { r, g, b } = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
};

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

/**
 * Calculates accuracy percentage between two colors
 */
export const calculateAccuracy = (hex1, hex2) => {
  const rgb1 = parseHex(hex1);
  const rgb2 = parseHex(hex2);
  if (!rgb1 || !rgb2) {
    return { error: "Both colours must be hex values such as #14B8A6." };
  }

  // Euclidean distance in RGB space (normalized to 0-1)
  const distance = Math.sqrt(
    Math.pow(rgb1.r - rgb2.r, 2) +
    Math.pow(rgb1.g - rgb2.g, 2) +
    Math.pow(rgb1.b - rgb2.b, 2)
  );

  const rgbAccuracy = Math.max(0, 100 - (distance / MAX_RGB_DISTANCE) * 100);

  // Also consider HSL for better perception matching
  const hsl1 = rgbToHsl(rgb1.r, rgb1.g, rgb1.b);
  const hsl2 = rgbToHsl(rgb2.r, rgb2.g, rgb2.b);

  const hDiff = Math.min(Math.abs(hsl1.h - hsl2.h), 360 - Math.abs(hsl1.h - hsl2.h)) / 180;
  const sDiff = Math.abs(hsl1.s - hsl2.s) / 100;
  const lDiff = Math.abs(hsl1.l - hsl2.l) / 100;

  const hslAccuracy = 100 - (hDiff * HUE_WEIGHT + sDiff * SATURATION_WEIGHT + lDiff * LIGHTNESS_WEIGHT) * 100;

  // Average them for a more "fair" score
  const finalAccuracy = (rgbAccuracy * RGB_WEIGHT + hslAccuracy * HSL_WEIGHT);

  return {
    percentage: Math.round(finalAccuracy * 10) / 10,
    rgbDiff: {
      r: Math.abs(rgb1.r - rgb2.r),
      g: Math.abs(rgb1.g - rgb2.g),
      b: Math.abs(rgb1.b - rgb2.b)
    },
    hslDiff: {
      h: Math.min(Math.abs(hsl1.h - hsl2.h), 360 - Math.abs(hsl1.h - hsl2.h)),
      s: Math.abs(hsl1.s - hsl2.s),
      l: Math.abs(hsl1.l - hsl2.l)
    }
  };
};

/**
 * Get precision rating based on score
 */
export const getPrecisionRating = (score) => {
  const [perfect, elite, master, expert, adept, novice] = RATING_BANDS;
  if (score >= perfect) return { label: "Perfect", color: "text-emerald-400" };
  if (score >= elite) return { label: "Elite", color: "text-emerald-400" };
  if (score >= master) return { label: "Master", color: "text-green-400" };
  if (score >= expert) return { label: "Expert", color: "text-blue-400" };
  if (score >= adept) return { label: "Adept", color: "text-yellow-400" };
  if (score >= novice) return { label: "Novice", color: "text-orange-400" };
  return { label: "Amateur", color: "text-red-400" };
};
/**
 * Returns white or black based on background HEX color
 */
export const getContrastColor = (hex) => {
  const { r, g, b } = hexToRgb(hex);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "text-black" : "text-white";
};
