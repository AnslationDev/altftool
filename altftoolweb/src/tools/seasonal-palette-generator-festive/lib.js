/**
 * Seasonal campaign palette generator.
 * Pure module: no DOM, no React, no clock and no randomness — the same
 * season, hue shift and variation index always produce the same palette.
 *
 * Colours are defined in HSL relative to a season base hue, converted to sRGB
 * with the CSS Color Module HSL algorithm, then checked with the WCAG 2.x
 * relative-luminance contrast formula.
 */

/** WCAG 2.x minimum contrast ratios. */
export const WCAG = {
  AA_NORMAL: 4.5,
  AAA_NORMAL: 7,
  /** Large text is 18.66px bold or 24px regular and above. */
  AA_LARGE: 3,
  AAA_LARGE: 4.5,
  /** Non-text UI components and graphical objects. */
  UI_COMPONENT: 3,
};

/** Roles every generated palette fills, in render order. */
export const ROLE_ORDER = ["background", "surface", "primary", "accent", "highlight", "neutral"];

const ROLE_LABELS = {
  background: "Background",
  surface: "Surface / card",
  primary: "Primary",
  accent: "Accent",
  highlight: "Highlight",
  neutral: "Neutral text",
};

/**
 * Season definitions. Each role carries a hue offset from the season base hue
 * plus target saturation and lightness, so rotating the base hue keeps the
 * relationships between the swatches intact.
 */
export const SEASONS = {
  winterHoliday: {
    id: "winterHoliday",
    label: "Winter holiday",
    note: "Deep evergreen ground with a classic red and gold pairing.",
    baseHue: 355,
    roles: {
      background: { dh: 155, s: 38, l: 12 },
      surface: { dh: 155, s: 30, l: 20 },
      primary: { dh: 0, s: 72, l: 66 },
      accent: { dh: 50, s: 78, l: 55 },
      highlight: { dh: 30, s: 85, l: 62 },
      neutral: { dh: 155, s: 8, l: 93 },
    },
  },
  springSale: {
    id: "springSale",
    label: "Spring sale",
    note: "Light, fresh and airy — works well on white e-commerce pages.",
    baseHue: 100,
    roles: {
      background: { dh: 0, s: 30, l: 96 },
      surface: { dh: 40, s: 45, l: 89 },
      primary: { dh: -10, s: 55, l: 30 },
      accent: { dh: 230, s: 70, l: 46 },
      highlight: { dh: 140, s: 60, l: 52 },
      neutral: { dh: 0, s: 12, l: 20 },
    },
  },
  summerSale: {
    id: "summerSale",
    label: "Summer sale",
    note: "High-energy ocean and coral pairing for loud discount creatives.",
    baseHue: 195,
    roles: {
      background: { dh: 0, s: 65, l: 94 },
      surface: { dh: 20, s: 55, l: 84 },
      primary: { dh: -10, s: 80, l: 27 },
      accent: { dh: 165, s: 85, l: 42 },
      highlight: { dh: 255, s: 80, l: 21 },
      neutral: { dh: 0, s: 15, l: 18 },
    },
  },
  autumnHarvest: {
    id: "autumnHarvest",
    label: "Autumn harvest",
    note: "Warm earth tones for seasonal menus, markets and harvest offers.",
    baseHue: 28,
    roles: {
      background: { dh: 0, s: 35, l: 95 },
      surface: { dh: 12, s: 40, l: 87 },
      primary: { dh: -12, s: 68, l: 34 },
      accent: { dh: 42, s: 55, l: 32 },
      highlight: { dh: -20, s: 72, l: 38 },
      neutral: { dh: 10, s: 12, l: 17 },
    },
  },
  blackFriday: {
    id: "blackFriday",
    label: "Black Friday",
    note: "Near-black ground with neon accents for urgency-led sale banners.",
    baseHue: 0,
    roles: {
      background: { dh: 0, s: 0, l: 7 },
      surface: { dh: 0, s: 0, l: 14 },
      primary: { dh: 50, s: 95, l: 55 },
      accent: { dh: 340, s: 90, l: 60 },
      highlight: { dh: 160, s: 90, l: 52 },
      neutral: { dh: 0, s: 0, l: 96 },
    },
  },
  newYear: {
    id: "newYear",
    label: "New Year",
    note: "Midnight navy with metallic gold for countdown and launch creatives.",
    baseHue: 220,
    roles: {
      background: { dh: 0, s: 55, l: 11 },
      surface: { dh: -5, s: 45, l: 19 },
      primary: { dh: 185, s: 75, l: 58 },
      accent: { dh: 120, s: 70, l: 62 },
      highlight: { dh: 0, s: 60, l: 70 },
      neutral: { dh: 0, s: 10, l: 94 },
    },
  },
  valentine: {
    id: "valentine",
    label: "Valentine",
    note: "Rose-led palette for gifting, hampers and couple offers.",
    baseHue: 340,
    roles: {
      background: { dh: 0, s: 60, l: 97 },
      surface: { dh: 10, s: 55, l: 91 },
      primary: { dh: -5, s: 72, l: 40 },
      accent: { dh: 25, s: 80, l: 47 },
      highlight: { dh: 50, s: 70, l: 34 },
      neutral: { dh: 0, s: 12, l: 22 },
    },
  },
};

export const MAX_VARIATION = 11;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const round2 = (n) => Math.round(n * 100) / 100;
const mod360 = (h) => ((h % 360) + 360) % 360;

/** HSL (h in degrees, s and l in percent) to sRGB 0-255, per CSS Color Level 4. */
export function hslToRgb(h, s, l) {
  const hh = mod360(Number(h) || 0);
  const ss = clamp(Number(s) || 0, 0, 100) / 100;
  const ll = clamp(Number(l) || 0, 0, 100) / 100;
  const c = (1 - Math.abs(2 * ll - 1)) * ss;
  const hp = hh / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let rgb;
  if (hp < 1) rgb = [c, x, 0];
  else if (hp < 2) rgb = [x, c, 0];
  else if (hp < 3) rgb = [0, c, x];
  else if (hp < 4) rgb = [0, x, c];
  else if (hp < 5) rgb = [x, 0, c];
  else rgb = [c, 0, x];
  const m = ll - c / 2;
  const [r, g, b] = rgb.map((v) => Math.round((v + m) * 255));
  return { r, g, b };
}

/** sRGB 0-255 to a six-digit uppercase hex string with no leading hash. */
export function rgbToHex({ r, g, b }) {
  return [r, g, b]
    .map((v) => clamp(Math.round(Number(v) || 0), 0, 255).toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

/** IEC 61966-2-1 sRGB transfer function, used by the WCAG luminance formula. */
function toLinear(channel) {
  const c = clamp(Number(channel) || 0, 0, 255) / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** WCAG 2.x relative luminance. */
export function relativeLuminance({ r, g, b }) {
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/** WCAG 2.x contrast ratio, from 1 to 21. */
export function contrastRatio(a, b) {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** WCAG grade for a contrast ratio at normal body-text size. */
export function wcagLevel(ratio) {
  const value = Number(ratio);
  if (!Number.isFinite(value)) return "Fail";
  if (value >= WCAG.AAA_NORMAL) return "AAA";
  if (value >= WCAG.AA_NORMAL) return "AA";
  if (value >= WCAG.AA_LARGE) return "AA large text only";
  return "Fail";
}

/**
 * Build a seasonal palette.
 * `variation` is an integer that deterministically nudges hue, saturation and
 * lightness so a designer can step through alternatives without randomness.
 */
export function generateSeasonalPalette({ seasonId = "winterHoliday", hueShift = 0, variation = 0 } = {}) {
  const season = SEASONS[seasonId];
  if (!season) return { error: "Choose one of the listed seasons." };

  const shift = Number(hueShift);
  const step = Number(variation);
  if (!Number.isFinite(shift)) return { error: "Hue shift must be a number of degrees." };
  if (!Number.isFinite(step) || step < 0) return { error: "Variation must be zero or a positive whole number." };

  const v = Math.round(step) % (MAX_VARIATION + 1);
  const hueNudge = v * 9;
  // Cycle saturation down, level, then up so successive variations stay usable.
  const satFactor = 1 + ((v % 3) - 1) * 0.08;
  const lightNudge = v % 2 === 0 ? -2 : 3;

  const white = { r: 255, g: 255, b: 255 };
  const black = { r: 0, g: 0, b: 0 };

  const swatches = ROLE_ORDER.map((role) => {
    const spec = season.roles[role];
    const h = mod360(season.baseHue + spec.dh + shift + hueNudge);
    const s = clamp(spec.s * satFactor, 0, 100);
    // Backgrounds and neutrals keep their extreme lightness so the palette
    // never loses its light or dark ground.
    const isGround = role === "background" || role === "neutral";
    const l = clamp(spec.l + (isGround ? 0 : lightNudge), 0, 100);

    const rgb = hslToRgb(h, s, l);
    const onWhite = contrastRatio(rgb, white);
    const onBlack = contrastRatio(rgb, black);
    const bestText = onBlack >= onWhite ? "black" : "white";

    return {
      role,
      label: ROLE_LABELS[role],
      hex: rgbToHex(rgb),
      rgb,
      hsl: { h: Math.round(h), s: Math.round(s), l: Math.round(l) },
      contrastOnWhite: round2(onWhite),
      contrastOnBlack: round2(onBlack),
      bestText,
      bestTextRatio: round2(Math.max(onWhite, onBlack)),
    };
  });

  const byRole = Object.fromEntries(swatches.map((swatch) => [swatch.role, swatch]));

  // Every combination a campaign layout actually uses.
  const pairDefs = [
    ["neutral", "background", "Body text on background"],
    ["neutral", "surface", "Body text on card"],
    ["primary", "background", "Primary on background"],
    ["accent", "background", "Accent on background"],
    ["highlight", "surface", "Highlight on card"],
  ];

  const makePair = (fg, bg, label) => {
    const ratio = round2(contrastRatio(byRole[fg].rgb, byRole[bg].rgb));
    return {
      id: `${fg}-on-${bg}`,
      label,
      foreground: byRole[fg].hex,
      background: byRole[bg].hex,
      ratio,
      level: wcagLevel(ratio),
      passesBody: ratio >= WCAG.AA_NORMAL,
      passesLarge: ratio >= WCAG.AA_LARGE,
    };
  };

  const pairs = pairDefs.map(([fg, bg, label]) => makePair(fg, bg, label));

  // A button label is whichever of the two ground colours reads better on the
  // primary fill, which is the choice a designer would make by eye.
  const labelRole =
    contrastRatio(byRole.neutral.rgb, byRole.primary.rgb) >=
    contrastRatio(byRole.background.rgb, byRole.primary.rgb)
      ? "neutral"
      : "background";
  pairs.push(makePair(labelRole, "primary", `Button label (${ROLE_LABELS[labelRole].toLowerCase()}) on primary`));

  return {
    seasonId: season.id,
    seasonLabel: season.label,
    note: season.note,
    baseHue: mod360(season.baseHue + shift + hueNudge),
    variation: v,
    swatches,
    pairs,
    accessiblePairs: pairs.filter((pair) => pair.passesBody).length,
    totalPairs: pairs.length,
  };
}

const HASH = "#";

/** CSS custom properties for the palette. */
export function formatPaletteCss(palette) {
  if (!palette || palette.error) return "";
  const lines = palette.swatches.map(
    (swatch) => `  --season-${swatch.role}: ${HASH}${swatch.hex};`,
  );
  return [`/* ${palette.seasonLabel} — variation ${palette.variation} */`, ":root {", ...lines, "}"].join("\n");
}

/** Plain-text summary including the contrast audit. */
export function formatPaletteText(palette) {
  if (!palette || palette.error) return "";
  return [
    `${palette.seasonLabel} palette (variation ${palette.variation}, base hue ${Math.round(palette.baseHue)}°)`,
    "",
    ...palette.swatches.map(
      (s) => `${s.label.padEnd(16)} ${HASH}${s.hex}  hsl(${s.hsl.h} ${s.hsl.s}% ${s.hsl.l}%)`,
    ),
    "",
    "Contrast audit",
    ...palette.pairs.map((p) => `${p.label.padEnd(28)} ${p.ratio}:1  ${p.level}`),
  ].join("\n");
}
