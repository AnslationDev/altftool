/**
 * Emotional Color Mapping & Palette Generation Engine
 */

export const MOODS = {
  Happy: {
    primary: [45, 60],
    saturation: [70, 90],
    lightness: [50, 70],
    description: "Joyful, energetic, and optimistic.",
    intensity: 0.8,
  },
  Calm: {
    primary: [180, 220],
    saturation: [30, 50],
    lightness: [70, 85],
    description: "Peaceful, serene, and tranquil.",
    intensity: 0.3,
  },
  Sad: {
    primary: [200, 240],
    saturation: [10, 30],
    lightness: [30, 50],
    description: "Melancholic, reflective, and quiet.",
    intensity: 0.4,
  },
  Romantic: {
    primary: [330, 350],
    saturation: [50, 70],
    lightness: [60, 80],
    description: "Loving, soft, and affectionate.",
    intensity: 0.6,
  },
  Energetic: {
    primary: [10, 30],
    saturation: [80, 100],
    lightness: [45, 60],
    description: "Vibrant, active, and powerful.",
    intensity: 0.9,
  },
  Focused: {
    primary: [210, 230],
    saturation: [20, 40],
    lightness: [20, 40],
    description: "Concentrated, professional, and clear.",
    intensity: 0.5,
  },
  Dreamy: {
    primary: [260, 300],
    saturation: [40, 60],
    lightness: [70, 90],
    description: "Whimsical, ethereal, and imaginative.",
    intensity: 0.5,
  },
  Lonely: {
    primary: [190, 210],
    saturation: [5, 20],
    lightness: [40, 60],
    description: "Isolated, cool, and introspective.",
    intensity: 0.3,
  },
  Creative: {
    primary: [280, 320],
    saturation: [60, 90],
    lightness: [50, 70],
    description: "Artistic, bold, and unconventional.",
    intensity: 0.8,
  },
  Angry: {
    primary: [0, 15],
    saturation: [70, 100],
    lightness: [30, 50],
    description: "Intense, passionate, and aggressive.",
    intensity: 1.0,
  },
  Relaxed: {
    primary: [100, 140],
    saturation: [20, 40],
    lightness: [65, 80],
    description: "Comfortable, steady, and at ease.",
    intensity: 0.2,
  },
  Nostalgic: {
    primary: [30, 50],
    saturation: [20, 40],
    lightness: [40, 60],
    description: "Sentimental, warm, and historical.",
    intensity: 0.4,
  },
  Luxury: {
    primary: [260, 280],
    saturation: [10, 30],
    lightness: [10, 25],
    description: "Sophisticated, elegant, and expensive.",
    intensity: 0.7,
  },
  Nature: {
    primary: [80, 140],
    saturation: [40, 60],
    lightness: [35, 55],
    description: "Organic, fresh, and grounded.",
    intensity: 0.5,
  },
  Futuristic: {
    primary: [180, 200],
    saturation: [80, 100],
    lightness: [40, 60],
    description: "Technological, clean, and forward-thinking.",
    intensity: 0.9,
  },
  Cozy: {
    primary: [20, 40],
    saturation: [40, 60],
    lightness: [30, 50],
    description: "Warm, safe, and intimate.",
    intensity: 0.4,
  },
  Dark: {
    primary: [0, 360],
    saturation: [0, 20],
    lightness: [5, 15],
    description: "Mysterious, deep, and shadowy.",
    intensity: 0.6,
  },
  Peaceful: {
    primary: [190, 230],
    saturation: [10, 30],
    lightness: [80, 95],
    description: "Quiet, harmonic, and still.",
    intensity: 0.1,
  },
  Confident: {
    primary: [200, 220],
    saturation: [60, 80],
    lightness: [30, 50],
    description: "Bold, reliable, and assertive.",
    intensity: 0.8,
  },
  Emotional: {
    primary: [320, 360],
    saturation: [40, 70],
    lightness: [40, 60],
    description: "Sincere, deep, and expressive.",
    intensity: 0.7,
  },
};

export const PALETTE_MODES = {
  "Soft Pastel": { s: [20, 40], l: [80, 95] },
  Vibrant: { s: [80, 100], l: [45, 65] },
  "Dark Mode": { s: [10, 30], l: [10, 25] },
  Minimal: { s: [0, 15], l: [20, 80] },
  Cinematic: { s: [40, 60], l: [30, 50] },
  Neon: { s: [90, 100], l: [50, 70] },
  Earthy: { s: [30, 50], l: [30, 50] },
  Retro: { s: [40, 60], l: [50, 70] },
  Cyberpunk: { s: [80, 100], l: [40, 60] },
};

export const COLOR_ROLES = [
  "Primary",
  "Secondary",
  "Accent",
  "Background",
  "Text",
  "Decor 1",
  "Decor 2",
  "Decor 3",
];

export const hslToHex = (h, s, l) => {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
};

export const hslToRgb = (h, s, l) => {
  s /= 100;
  l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return {
    r: Math.round(255 * f(0)),
    g: Math.round(255 * f(8)),
    b: Math.round(255 * f(4)),
  };
};

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

export const generatePalette = (moodName, modeName = "Vibrant", currentPalette = [], lockedArray = []) => {
  const mood = MOODS[moodName] || MOODS.Happy;
  const mode = PALETTE_MODES[modeName] || PALETTE_MODES.Vibrant;
  const palette = [];
  const colorCount = 8;

  for (let i = 0; i < colorCount; i++) {
    if (lockedArray[i] && currentPalette[i]) {
      palette.push(currentPalette[i]);
      continue;
    }

    let h, s, l;

    if (i === 0) {
      h = rand(mood.primary[0], mood.primary[1]);
      s = rand(mode.s[0], mode.s[1]);
      l = rand(mode.l[0], mode.l[1]);
    } else if (i === 1) {
      h = (rand(mood.primary[0], mood.primary[1]) + 30) % 360;
      s = Math.round(rand(mode.s[0], mode.s[1]) * 0.8);
      l = rand(mode.l[0], mode.l[1]);
    } else if (i === 2) {
      h = (rand(mood.primary[0], mood.primary[1]) + 180) % 360;
      s = rand(80, 100);
      l = rand(50, 70);
    } else if (i === 3) {
      h = rand(mood.primary[0], mood.primary[1]);
      s = rand(5, 15);
      l = modeName.includes("Dark") ? rand(5, 15) : rand(90, 98);
    } else if (i === 4) {
      h = rand(mood.primary[0], mood.primary[1]);
      s = rand(5, 15);
      l = modeName.includes("Dark") ? rand(85, 95) : rand(5, 15);
    } else {
      h = (rand(mood.primary[0], mood.primary[1]) + rand(-30, 30) + 360) % 360;
      s = rand(mode.s[0], mode.s[1]);
      l = rand(mode.l[0], mode.l[1]);
    }

    const hex = hslToHex(h, s, l);
    const rgb = hslToRgb(h, s, l);

    palette.push({
      hex,
      rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
      hsl: `hsl(${h}, ${s}%, ${l}%)`,
      h,
      s,
      l,
      r: rgb.r,
      g: rgb.g,
      b: rgb.b,
    });
  }

  return palette;
};

export const parseMood = (text) => {
  const lowerText = text.toLowerCase();
  for (const mood in MOODS) {
    if (lowerText.includes(mood.toLowerCase())) return mood;
  }
  const keywords = {
    stressed: "Calm", relaxed: "Relaxed", tired: "Calm",
    excited: "Energetic", angry: "Angry", love: "Romantic",
    smart: "Focused", tech: "Futuristic", old: "Nostalgic",
    rich: "Luxury", nature: "Nature", dark: "Dark",
    night: "Dark", peace: "Peaceful", bored: "Creative",
    lonely: "Lonely", happy: "Happy", sad: "Sad",
    cozy: "Cozy", dream: "Dreamy", future: "Futuristic",
    forest: "Nature", ocean: "Calm", fire: "Energetic",
    rain: "Sad", sun: "Happy", moon: "Dreamy",
  };
  for (const kw in keywords) {
    if (lowerText.includes(kw)) return keywords[kw];
  }
  return "Happy";
};

/**
 * WCAG contrast ratio calculation
 */
export const getLuminance = (r, g, b) => {
  const sRGB = [r, g, b].map((c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
};

export const getContrastRatio = (color1, color2) => {
  const l1 = getLuminance(color1.r, color1.g, color1.b);
  const l2 = getLuminance(color2.r, color2.g, color2.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return ((lighter + 0.05) / (darker + 0.05)).toFixed(2);
};