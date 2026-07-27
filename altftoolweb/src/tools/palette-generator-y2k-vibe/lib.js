/**
 * Y2K Palette Generator — pure colour engine.
 *
 * Builds a Y2K / cyber-chrome palette from a text seed: a metallic chrome ramp,
 * bubblegum and lilac primaries, aqua and lime accents, matching gradients, and
 * WCAG contrast readings for every text pairing. No React, no DOM, no randomness
 * beyond the seeded PRNG, so the same seed always returns the same palette.
 */

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const round1 = (value) => Math.round(value * 10) / 10;

/* ---------------------------------------------------------------------------
 * Colour conversion and WCAG contrast
 * ------------------------------------------------------------------------ */

/** HSL -> sRGB channels 0-255 (CSS Color 3 conversion). */
export function hslToRgb(h, s, l) {
  const hue = ((Number(h) % 360) + 360) % 360;
  const sat = clamp(Number(s), 0, 100) / 100;
  const lig = clamp(Number(l), 0, 100) / 100;
  const c = (1 - Math.abs(2 * lig - 1)) * sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = lig - c / 2;
  let rgb;
  if (hue < 60) rgb = [c, x, 0];
  else if (hue < 120) rgb = [x, c, 0];
  else if (hue < 180) rgb = [0, c, x];
  else if (hue < 240) rgb = [0, x, c];
  else if (hue < 300) rgb = [x, 0, c];
  else rgb = [c, 0, x];
  return rgb.map((channel) => clamp(Math.round((channel + m) * 255), 0, 255));
}

/** HSL -> #RRGGBB. */
export function hslToHex(h, s, l) {
  return `#${hslToRgb(h, s, l)
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")}`;
}

/** WCAG 2.1 relative luminance of an sRGB triple, 0-1. */
export function relativeLuminance([r, g, b]) {
  const channel = (value) => {
    const v = clamp(value, 0, 255) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** WCAG 2.1 contrast ratio between two sRGB triples, 1 to 21. */
export function contrastRatio(rgbA, rgbB) {
  const a = relativeLuminance(rgbA);
  const b = relativeLuminance(rgbB);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/** WCAG 2.1 SC 1.4.3 minimum for normal text. */
export const AA_NORMAL = 4.5;
/** WCAG 2.1 SC 1.4.3 minimum for large text (18pt, or 14pt bold, and above). */
export const AA_LARGE = 3;
/** WCAG 2.1 SC 1.4.11 minimum for UI components and graphical objects. */
export const AA_UI = 3;

/** Contrast of an HSL colour against an HSL background. */
export function contrastBetweenHsl(a, b) {
  return contrastRatio(hslToRgb(...a), hslToRgb(...b));
}

/* ---------------------------------------------------------------------------
 * Seeded randomness
 * ------------------------------------------------------------------------ */

/** FNV-1a 32-bit hash so a text seed maps to a stable number. */
export function hashSeed(text) {
  let hash = 2166136261;
  const source = String(text ?? "");
  for (let i = 0; i < source.length; i += 1) {
    hash ^= source.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** mulberry32 PRNG. */
export function makeRandom(seed) {
  let state = seed >>> 0;
  return function random() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------------------------------------------------------------------------
 * The Y2K recipe
 *
 * Hue windows are taken from the recurring colours of late-1990s / early-2000s
 * digital design: bubblegum magenta, lilac, aqua "ice", acid lime, and the
 * near-neutral blue-grey used for brushed chrome.
 * ------------------------------------------------------------------------ */

export const HUE_WINDOWS = {
  bubblegum: [318, 338],
  lilac: [262, 282],
  aqua: [182, 196],
  lime: [74, 92],
  chrome: [206, 224],
};

/** Lightness stops of the chrome ramp, light to dark — a brushed-metal sweep. */
export const CHROME_STOPS = [94, 80, 64, 46, 28];
/** Chrome is nearly neutral: saturation stays in this band. */
export const CHROME_SATURATION = [7, 16];

export const MODES = [
  { id: "bright", label: "Bright (white-lilac base)" },
  { id: "dark", label: "Dark (deep violet base)" },
];

/** Intensity slides saturation and lightness of the accents. */
export const MIN_INTENSITY = 0;
export const MAX_INTENSITY = 100;

const pick = (random, [min, max]) => min + random() * (max - min);

/**
 * Generate the Y2K palette.
 *
 * @param {object} input
 * @param {string} input.seed any text; the same seed always gives the same palette
 * @param {string} input.mode "bright" or "dark"
 * @param {number} input.intensity 0-100, how hot the accents run
 * @returns {object} palette, or { error } for unusable input
 */
export function generateY2kPalette({ seed = "y2k", mode = "bright", intensity = 60 } = {}) {
  const cleanSeed = String(seed ?? "").trim();
  if (!cleanSeed) return { error: "Enter a seed word or phrase to generate a palette." };
  if (cleanSeed.length > 64) return { error: "Keep the seed under 64 characters." };
  if (!MODES.some((item) => item.id === mode)) return { error: "Pick either the bright or the dark base." };
  const level = Number(intensity);
  if (!Number.isFinite(level) || level < MIN_INTENSITY || level > MAX_INTENSITY) {
    return { error: `Intensity must be between ${MIN_INTENSITY} and ${MAX_INTENSITY}.` };
  }

  const random = makeRandom(hashSeed(`${cleanSeed}|${mode}`));
  const heat = level / 100;

  // Accent hues, each jittered inside its window.
  const bubblegumH = pick(random, HUE_WINDOWS.bubblegum);
  const lilacH = pick(random, HUE_WINDOWS.lilac);
  const aquaH = pick(random, HUE_WINDOWS.aqua);
  const limeH = pick(random, HUE_WINDOWS.lime);
  const chromeH = pick(random, HUE_WINDOWS.chrome);
  const chromeS = pick(random, CHROME_SATURATION);

  const isDark = mode === "dark";
  // Saturation rises and lightness shifts with intensity.
  const accentS = 68 + heat * 24;
  const accentL = isDark ? 58 + heat * 10 : 54 + heat * 6;

  const background = isDark ? [chromeH + 46, 38, 9 + heat * 3] : [lilacH, 46, 96 - heat * 2];
  const surface = isDark ? [chromeH + 44, 32, 15 + heat * 3] : [lilacH, 40, 99];

  const roles = [
    {
      key: "bubblegum",
      name: "Bubblegum",
      use: "Primary — buttons, logo, the colour people remember",
      hsl: [bubblegumH, accentS, accentL],
    },
    {
      key: "lilac",
      name: "Cyber lilac",
      use: "Secondary — hover states, badges, secondary fills",
      hsl: [lilacH, accentS - 8, accentL + 4],
    },
    {
      key: "aqua",
      name: "Ice aqua",
      use: "Accent — links, highlights, glow edges",
      hsl: [aquaH, accentS + 4, accentL + 6],
    },
    {
      key: "lime",
      name: "Acid lime",
      use: "Alert accent — use sparingly, it shouts",
      hsl: [limeH, accentS + 6, accentL + 2],
    },
    {
      key: "chrome",
      name: "Brushed chrome",
      use: "Neutral — panels, rules, metallic edges",
      hsl: [chromeH, chromeS, isDark ? 62 : 64],
    },
    {
      key: "background",
      name: "Base",
      use: "Page background",
      hsl: background,
    },
    {
      key: "surface",
      name: "Surface",
      use: "Cards and panels above the base",
      hsl: surface,
    },
  ].map((role) => ({
    ...role,
    hsl: [((role.hsl[0] % 360) + 360) % 360, clamp(role.hsl[1], 0, 100), clamp(role.hsl[2], 0, 100)],
  }));

  const withHex = roles.map((role) => ({
    ...role,
    hex: hslToHex(...role.hsl),
    rgb: hslToRgb(...role.hsl),
    hslText: `hsl(${Math.round(role.hsl[0])} ${Math.round(role.hsl[1])}% ${Math.round(role.hsl[2])}%)`,
  }));

  const byKey = Object.fromEntries(withHex.map((role) => [role.key, role]));

  // Chrome ramp: one hue, one saturation, five fixed lightness stops.
  const chromeRamp = CHROME_STOPS.map((lightness, index) => ({
    key: `chrome-${index + 1}`,
    step: (index + 1) * 100,
    hsl: [chromeH, chromeS, lightness],
    hex: hslToHex(chromeH, chromeS, lightness),
  }));

  // Text colours picked for contrast, not taste: the ramp end that wins on the base.
  const lightInk = [chromeH, 18, 97];
  const darkInk = [chromeH, 32, 12];
  const baseRgb = hslToRgb(...byKey.background.hsl);
  const inkHsl = contrastRatio(hslToRgb(...lightInk), baseRgb) >= contrastRatio(hslToRgb(...darkInk), baseRgb)
    ? lightInk
    : darkInk;
  const ink = {
    key: "ink",
    name: "Text",
    use: "Body text on the base",
    hsl: inkHsl,
    hex: hslToHex(...inkHsl),
    rgb: hslToRgb(...inkHsl),
    hslText: `hsl(${Math.round(inkHsl[0])} ${Math.round(inkHsl[1])}% ${Math.round(inkHsl[2])}%)`,
  };

  const gradients = [
    {
      id: "chrome-sweep",
      name: "Chrome sweep",
      stops: [chromeRamp[0].hex, chromeRamp[2].hex, chromeRamp[1].hex, chromeRamp[3].hex],
      angle: 135,
    },
    {
      id: "bubblegum-lilac",
      name: "Bubblegum to lilac",
      stops: [byKey.bubblegum.hex, byKey.lilac.hex],
      angle: 120,
    },
    {
      id: "holographic",
      name: "Holographic",
      stops: [byKey.aqua.hex, byKey.lilac.hex, byKey.bubblegum.hex, byKey.lime.hex],
      angle: 100,
    },
  ].map((gradient) => ({
    ...gradient,
    css: `linear-gradient(${gradient.angle}deg, ${gradient.stops.join(", ")})`,
  }));

  const checks = [
    { id: "ink-base", label: "Body text on base", fg: ink, bg: byKey.background, min: AA_NORMAL },
    { id: "ink-surface", label: "Body text on surface", fg: ink, bg: byKey.surface, min: AA_NORMAL },
    { id: "bubblegum-base", label: "Bubblegum text on base", fg: byKey.bubblegum, bg: byKey.background, min: AA_NORMAL },
    { id: "aqua-base", label: "Aqua text on base", fg: byKey.aqua, bg: byKey.background, min: AA_NORMAL },
    { id: "lime-base", label: "Lime as a UI shape on base", fg: byKey.lime, bg: byKey.background, min: AA_UI },
    { id: "chrome-base", label: "Chrome rule on base", fg: byKey.chrome, bg: byKey.background, min: AA_UI },
  ].map((check) => {
    const ratio = contrastRatio(check.fg.rgb ?? hslToRgb(...check.fg.hsl), check.bg.rgb ?? hslToRgb(...check.bg.hsl));
    return {
      id: check.id,
      label: check.label,
      ratio: round1(ratio),
      min: check.min,
      passes: ratio >= check.min,
      // 4.5:1 for body copy, 3:1 for large/bold text and UI shapes, below that decoration only.
      largeTextOk: ratio >= AA_LARGE,
      verdict: ratio >= AA_NORMAL ? "Body text" : ratio >= AA_LARGE ? "Large text and UI only" : "Decoration only",
      fgHex: check.fg.hex,
      bgHex: check.bg.hex,
    };
  });

  const failing = checks.filter((check) => !check.passes);

  const cssVariables = [
    ":root {",
    ...withHex.map((role) => `  --y2k-${role.key}: ${role.hex};`),
    `  --y2k-ink: ${ink.hex};`,
    ...chromeRamp.map((step) => `  --y2k-${step.key}: ${step.hex};`),
    ...gradients.map((gradient) => `  --y2k-gradient-${gradient.id}: ${gradient.css};`),
    "}",
  ].join("\n");

  const tailwindTheme = [
    "@theme {",
    ...withHex.map((role) => `  --color-y2k-${role.key}: ${role.hex};`),
    `  --color-y2k-ink: ${ink.hex};`,
    ...chromeRamp.map((step) => `  --color-y2k-chrome-${step.step}: ${step.hex};`),
    "}",
  ].join("\n");

  const json = JSON.stringify(
    {
      seed: cleanSeed,
      mode,
      intensity: level,
      roles: Object.fromEntries(withHex.map((role) => [role.key, role.hex])),
      ink: ink.hex,
      chromeRamp: chromeRamp.map((step) => step.hex),
      gradients: Object.fromEntries(gradients.map((gradient) => [gradient.id, gradient.css])),
    },
    null,
    2,
  );

  return {
    seed: cleanSeed,
    mode,
    intensity: level,
    roles: withHex,
    ink,
    chromeRamp,
    gradients,
    checks,
    failing,
    accessible: failing.length === 0,
    cssVariables,
    tailwindTheme,
    json,
    summary: withHex.map((role) => `${role.name}: ${role.hex}`).join("\n"),
  };
}
