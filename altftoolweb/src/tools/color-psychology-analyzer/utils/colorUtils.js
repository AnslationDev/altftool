import { colorMeanings, grayScaleMeaning } from "./colorData";

/**
 * Converts HEX to RGB
 */
export const hexToRgb = (hex) => {
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
    const hex = n.toString(16);
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
 * Gets color meaning based on HSL
 */
export const getColorMeaning = (h, s, l) => {
  if (s < 10 || l < 15 || l > 90) {
    return grayScaleMeaning;
  }
  return colorMeanings.find(m => h >= m.hueRange[0] && h <= m.hueRange[1]) || colorMeanings[0];
};

/**
 * Calculates Contrast Ratio
 */
export const getContrastRatio = (rgb1, rgb2) => {
  const getLuminance = (r, g, b) => {
    const a = [r, g, b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b) + 0.05;
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b) + 0.05;
  return l1 > l2 ? l1 / l2 : l2 / l1;
};

/**
 * Generates Harmony Palettes
 */
export const generateHarmonies = (h, s, l) => {
  const rotate = (hue, amount) => (hue + amount + 360) % 360;

  const toHex = (h, s, l) => {
    const { r, g, b } = hslToRgb(h, s, l);
    return rgbToHex(r, g, b);
  };

  return {
    complementary: [
      { name: "Base", hex: toHex(h, s, l) },
      { name: "Complement", hex: toHex(rotate(h, 180), s, l) }
    ],
    analogous: [
      { name: "Cool", hex: toHex(rotate(h, -30), s, l) },
      { name: "Base", hex: toHex(h, s, l) },
      { name: "Warm", hex: toHex(rotate(h, 30), s, l) }
    ],
    triadic: [
      { name: "Primary", hex: toHex(h, s, l) },
      { name: "Secondary", hex: toHex(rotate(h, 120), s, l) },
      { name: "Tertiary", hex: toHex(rotate(h, 240), s, l) }
    ],
    monochromatic: [
      { name: "Deep", hex: toHex(h, s, Math.max(10, l - 30)) },
      { name: "Base", hex: toHex(h, s, l) },
      { name: "Light", hex: toHex(h, s, Math.min(90, l + 30)) }
    ]
  };
};

/**
 * Generates Gradient Suggestions
 */
export const generateGradients = (h, s, l) => {
  const rotate = (hue, amount) => (hue + amount + 360) % 360;
  const toHex = (h, s, l) => {
    const { r, g, b } = hslToRgb(h, s, l);
    return rgbToHex(r, g, b);
  };

  return [
    { name: "Vibrant Flow", colors: [toHex(h, s, l), toHex(rotate(h, 40), s, l)] },
    { name: "Soft Deep", colors: [toHex(h, s, l), toHex(h, s, Math.max(10, l - 20))] },
    { name: "Neon Glow", colors: [toHex(h, 100, 50), toHex(rotate(h, 60), 100, 50)] }
  ];
};
