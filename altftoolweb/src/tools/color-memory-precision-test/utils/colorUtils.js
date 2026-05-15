/**
 * Converts HEX to RGB
 */
export const hexToRgb = (hex) => {
  if (!hex) return { r: 0, g: 0, b: 0 };
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
};

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
 * Generates a random color based on difficulty
 */
export const generateRandomColor = (difficulty) => {
  let h, s, l;

  if (difficulty === "easy") {
    // Highly saturated, distinct colors
    h = Math.floor(Math.random() * 360);
    s = 70 + Math.floor(Math.random() * 30);
    l = 40 + Math.floor(Math.random() * 20);
  } else if (difficulty === "medium") {
    // Normal range
    h = Math.floor(Math.random() * 360);
    s = 40 + Math.floor(Math.random() * 60);
    l = 30 + Math.floor(Math.random() * 40);
  } else {
    // Hard: Subtle, grayish or very dark/light tones
    h = Math.floor(Math.random() * 360);
    s = 10 + Math.floor(Math.random() * 80);
    l = 15 + Math.floor(Math.random() * 70);
  }

  const { r, g, b } = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
};

/**
 * Calculates accuracy percentage between two colors
 */
export const calculateAccuracy = (hex1, hex2) => {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);

  // Euclidean distance in RGB space (normalized to 0-1)
  const distance = Math.sqrt(
    Math.pow(rgb1.r - rgb2.r, 2) +
    Math.pow(rgb1.g - rgb2.g, 2) +
    Math.pow(rgb1.b - rgb2.b, 2)
  );

  const maxDistance = Math.sqrt(Math.pow(255, 2) * 3);
  const rgbAccuracy = Math.max(0, 100 - (distance / maxDistance) * 100);

  // Also consider HSL for better perception matching
  const hsl1 = rgbToHsl(rgb1.r, rgb1.g, rgb1.b);
  const hsl2 = rgbToHsl(rgb2.r, rgb2.g, rgb2.b);

  const hDiff = Math.min(Math.abs(hsl1.h - hsl2.h), 360 - Math.abs(hsl1.h - hsl2.h)) / 180;
  const sDiff = Math.abs(hsl1.s - hsl2.s) / 100;
  const lDiff = Math.abs(hsl1.l - hsl2.l) / 100;

  const hslAccuracy = 100 - (hDiff * 0.5 + sDiff * 0.25 + lDiff * 0.25) * 100;

  // Average them for a more "fair" score
  const finalAccuracy = (rgbAccuracy * 0.4 + hslAccuracy * 0.6);

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
  if (score >= 99) return { label: "Perfect", color: "text-emerald-400" };
  if (score >= 95) return { label: "Elite", color: "text-emerald-400" };
  if (score >= 90) return { label: "Master", color: "text-green-400" };
  if (score >= 80) return { label: "Expert", color: "text-blue-400" };
  if (score >= 60) return { label: "Adept", color: "text-yellow-400" };
  if (score >= 40) return { label: "Novice", color: "text-orange-400" };
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
