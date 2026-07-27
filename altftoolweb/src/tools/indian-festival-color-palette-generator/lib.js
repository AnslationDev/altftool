/**
 * Indian festival palette generator.
 * Pure module: no DOM, no React, no clock, no randomness.
 *
 * Swatches are stored in HSL, converted to sRGB with the CSS Color Module HSL
 * algorithm, and audited with the WCAG 2.x relative-luminance contrast formula.
 * Tint and shade ramps are produced by mixing the hero colour toward white or
 * black in sRGB, which is how design systems generally build a colour scale.
 */

/** WCAG 2.x thresholds. */
export const AA_NORMAL = 4.5;
export const AAA_NORMAL = 7;
/** Large text is 24px regular or 18.66px bold and above. */
export const AA_LARGE = 3;

/** Ramp steps, in the naming convention design tokens usually follow. */
export const RAMP_STEPS = [
  { step: 50, mix: 0.92, toward: "white" },
  { step: 100, mix: 0.82, toward: "white" },
  { step: 200, mix: 0.64, toward: "white" },
  { step: 300, mix: 0.44, toward: "white" },
  { step: 400, mix: 0.22, toward: "white" },
  { step: 500, mix: 0, toward: "white" },
  { step: 600, mix: 0.18, toward: "black" },
  { step: 700, mix: 0.34, toward: "black" },
  { step: 800, mix: 0.5, toward: "black" },
  { step: 900, mix: 0.66, toward: "black" },
];

/**
 * Festival palettes. Colour associations are drawn from the materials the
 * festivals actually use — marigold garlands, clay diyas, gulal powders,
 * kasavu gold-bordered cotton, turmeric and sugarcane — rather than from any
 * single prescriptive rule. Regional practice varies widely.
 */
export const FESTIVALS = {
  diwali: {
    id: "diwali",
    label: "Diwali",
    note: "Night-sky ground lit by clay diyas, marigold garlands and vermilion.",
    roles: {
      ground: { name: "Night indigo", h: 245, s: 45, l: 11 },
      surface: { name: "Deep aubergine", h: 285, s: 32, l: 19 },
      primary: { name: "Marigold (genda)", h: 40, s: 92, l: 55 },
      secondary: { name: "Vermilion (sindoor)", h: 8, s: 80, l: 55 },
      accent: { name: "Diya amber", h: 28, s: 88, l: 62 },
      neutral: { name: "Moonlight cream", h: 42, s: 30, l: 95 },
    },
  },
  holi: {
    id: "holi",
    label: "Holi",
    note: "Gulal powder brights on a white ground — high chroma, low ceremony.",
    roles: {
      ground: { name: "Powder white", h: 40, s: 25, l: 97 },
      surface: { name: "Soft blush", h: 330, s: 60, l: 92 },
      primary: { name: "Gulal magenta", h: 328, s: 78, l: 40 },
      secondary: { name: "Haldi saffron", h: 36, s: 90, l: 33 },
      accent: { name: "Neel blue", h: 205, s: 85, l: 34 },
      neutral: { name: "Ink charcoal", h: 250, s: 14, l: 17 },
    },
  },
  onam: {
    id: "onam",
    label: "Onam",
    note: "Kasavu off-white and gold zari with pookalam greens and reds.",
    roles: {
      ground: { name: "Kasavu ivory", h: 44, s: 38, l: 96 },
      surface: { name: "Zari gold wash", h: 42, s: 55, l: 88 },
      primary: { name: "Zari gold", h: 40, s: 70, l: 32 },
      secondary: { name: "Pookalam green", h: 138, s: 55, l: 26 },
      accent: { name: "Chethi red", h: 4, s: 72, l: 40 },
      neutral: { name: "Palm shadow", h: 120, s: 12, l: 16 },
    },
  },
  pongal: {
    id: "pongal",
    label: "Pongal",
    note: "Turmeric, sugarcane green and terracotta against kolam white.",
    roles: {
      ground: { name: "Kolam white", h: 48, s: 30, l: 97 },
      surface: { name: "Rice cream", h: 46, s: 45, l: 90 },
      primary: { name: "Turmeric (manjal)", h: 44, s: 85, l: 30 },
      secondary: { name: "Sugarcane green", h: 96, s: 45, l: 27 },
      accent: { name: "Terracotta pot", h: 18, s: 62, l: 38 },
      neutral: { name: "Charred clay", h: 20, s: 16, l: 16 },
    },
  },
  durgaPuja: {
    id: "durgaPuja",
    label: "Durga Puja",
    note: "Alta red and lal-paar white with pandal gold and shiuli orange.",
    roles: {
      ground: { name: "Lal-paar white", h: 20, s: 30, l: 97 },
      surface: { name: "Shankha shell", h: 24, s: 45, l: 91 },
      primary: { name: "Alta red", h: 356, s: 74, l: 36 },
      secondary: { name: "Pandal gold", h: 40, s: 72, l: 30 },
      accent: { name: "Shiuli orange", h: 24, s: 78, l: 33 },
      neutral: { name: "Kajal black", h: 0, s: 6, l: 14 },
    },
  },
  navratri: {
    id: "navratri",
    label: "Navratri and Garba",
    note: "Mirror-work brights: nine nights, nine colours, maximum saturation.",
    roles: {
      ground: { name: "Chaniya indigo", h: 258, s: 48, l: 14 },
      surface: { name: "Bandhani plum", h: 300, s: 38, l: 22 },
      primary: { name: "Garba orange", h: 24, s: 92, l: 58 },
      secondary: { name: "Mirror-work teal", h: 176, s: 72, l: 55 },
      accent: { name: "Bandhani pink", h: 332, s: 85, l: 72 },
      neutral: { name: "Mirror silver", h: 210, s: 16, l: 95 },
    },
  },
  eid: {
    id: "eid",
    label: "Eid",
    note: "Crescent-night green and gold with a soft cream ground.",
    roles: {
      ground: { name: "Crescent night", h: 165, s: 42, l: 12 },
      surface: { name: "Deep jade", h: 162, s: 34, l: 20 },
      primary: { name: "Lantern gold", h: 44, s: 82, l: 58 },
      secondary: { name: "Mint jade", h: 150, s: 55, l: 62 },
      accent: { name: "Rose sherbet", h: 348, s: 68, l: 74 },
      neutral: { name: "Sehri cream", h: 44, s: 32, l: 95 },
    },
  },
  baisakhi: {
    id: "baisakhi",
    label: "Baisakhi",
    note: "Mustard fields, spring turquoise and phulkari pink.",
    roles: {
      ground: { name: "Wheat cream", h: 44, s: 42, l: 96 },
      surface: { name: "Mustard field", h: 48, s: 62, l: 86 },
      primary: { name: "Sarson yellow", h: 46, s: 88, l: 29 },
      secondary: { name: "Phulkari pink", h: 336, s: 72, l: 38 },
      accent: { name: "Spring turquoise", h: 182, s: 72, l: 27 },
      neutral: { name: "Furrow brown", h: 26, s: 20, l: 16 },
    },
  },
  ganeshChaturthi: {
    id: "ganeshChaturthi",
    label: "Ganesh Chaturthi",
    note: "Saffron and modak gold over a deep pandal red.",
    roles: {
      ground: { name: "Pandal maroon", h: 352, s: 44, l: 13 },
      surface: { name: "Kumkum red", h: 356, s: 40, l: 22 },
      primary: { name: "Saffron (kesari)", h: 32, s: 92, l: 58 },
      secondary: { name: "Modak gold", h: 44, s: 85, l: 62 },
      accent: { name: "Durva green", h: 128, s: 52, l: 58 },
      neutral: { name: "Rangoli white", h: 36, s: 28, l: 96 },
    },
  },
};

export const ROLE_ORDER = ["ground", "surface", "primary", "secondary", "accent", "neutral"];

export const TONES = {
  classic: { id: "classic", label: "Classic", groundShift: 0, surfaceShift: 0 },
  softer: { id: "softer", label: "Softer ground", groundShift: 8, surfaceShift: 6 },
  deeper: { id: "deeper", label: "Deeper ground", groundShift: -7, surfaceShift: -5 },
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const round2 = (n) => Math.round(n * 100) / 100;
const mod360 = (h) => ((h % 360) + 360) % 360;

/** HSL (degrees, percent, percent) to sRGB 0-255, per CSS Color Level 4. */
export function hslToRgb(h, s, l) {
  const hh = mod360(Number(h) || 0);
  const ss = clamp(Number(s) || 0, 0, 100) / 100;
  const ll = clamp(Number(l) || 0, 0, 100) / 100;
  const c = (1 - Math.abs(2 * ll - 1)) * ss;
  const hp = hh / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let base;
  if (hp < 1) base = [c, x, 0];
  else if (hp < 2) base = [x, c, 0];
  else if (hp < 3) base = [0, c, x];
  else if (hp < 4) base = [0, x, c];
  else if (hp < 5) base = [x, 0, c];
  else base = [c, 0, x];
  const m = ll - c / 2;
  const [r, g, b] = base.map((v) => Math.round((v + m) * 255));
  return { r, g, b };
}

/** sRGB to a six-digit uppercase hex string with no leading hash. */
export function rgbToHex({ r, g, b }) {
  return [r, g, b]
    .map((v) => clamp(Math.round(Number(v) || 0), 0, 255).toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

/** Mix two sRGB colours by weight (0 = all of `a`, 1 = all of `b`). */
export function mixRgb(a, b, weight) {
  const w = clamp(Number(weight) || 0, 0, 1);
  return {
    r: Math.round(a.r + (b.r - a.r) * w),
    g: Math.round(a.g + (b.g - a.g) * w),
    b: Math.round(a.b + (b.b - a.b) * w),
  };
}

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

/** WCAG grade for body text at a given ratio. */
export function wcagGrade(ratio) {
  const value = Number(ratio);
  if (!Number.isFinite(value)) return "Fail";
  if (value >= AAA_NORMAL) return "AAA";
  if (value >= AA_NORMAL) return "AA";
  if (value >= AA_LARGE) return "AA large text only";
  return "Fail";
}

const WHITE = { r: 255, g: 255, b: 255 };
const BLACK = { r: 0, g: 0, b: 0 };

/** Build the 50-900 tint and shade ramp for a hero colour. */
export function buildRamp(rgb) {
  return RAMP_STEPS.map(({ step, mix, toward }) => {
    const target = toward === "white" ? WHITE : BLACK;
    const value = mix === 0 ? rgb : mixRgb(rgb, target, mix);
    const onWhite = contrastRatio(value, WHITE);
    const onBlack = contrastRatio(value, BLACK);
    return {
      step,
      hex: rgbToHex(value),
      rgb: value,
      bestText: onBlack >= onWhite ? "black" : "white",
      bestTextRatio: round2(Math.max(onWhite, onBlack)),
    };
  });
}

/**
 * Generate a festival palette with a hero ramp and a contrast audit.
 */
export function generateFestivalPalette({ festivalId = "diwali", hueShift = 0, tone = "classic" } = {}) {
  const festival = FESTIVALS[festivalId];
  if (!festival) return { error: "Choose one of the listed festivals." };

  const shift = Number(hueShift);
  if (!Number.isFinite(shift)) return { error: "Hue shift must be a number of degrees." };
  if (shift < -180 || shift > 180) {
    return { error: "Keep the hue shift between -180 and 180 degrees." };
  }

  const toneSpec = TONES[tone] || TONES.classic;

  const swatches = ROLE_ORDER.map((role) => {
    const spec = festival.roles[role];
    let l = spec.l;
    if (role === "ground") l = clamp(l + toneSpec.groundShift, 0, 100);
    if (role === "surface") l = clamp(l + toneSpec.surfaceShift, 0, 100);

    const h = mod360(spec.h + shift);
    const rgb = hslToRgb(h, spec.s, l);
    const onWhite = contrastRatio(rgb, WHITE);
    const onBlack = contrastRatio(rgb, BLACK);

    return {
      role,
      name: spec.name,
      hex: rgbToHex(rgb),
      rgb,
      hsl: { h: Math.round(h), s: Math.round(spec.s), l: Math.round(l) },
      contrastOnWhite: round2(onWhite),
      contrastOnBlack: round2(onBlack),
      bestText: onBlack >= onWhite ? "black" : "white",
    };
  });

  const byRole = Object.fromEntries(swatches.map((swatch) => [swatch.role, swatch]));

  const pairDefs = [
    ["neutral", "ground", "Body text on ground"],
    ["neutral", "surface", "Body text on surface"],
    ["primary", "ground", "Primary on ground"],
    ["secondary", "ground", "Secondary on ground"],
    ["accent", "surface", "Accent on surface"],
  ];

  const pairs = pairDefs.map(([fg, bg, label]) => {
    const ratio = round2(contrastRatio(byRole[fg].rgb, byRole[bg].rgb));
    return {
      id: `${fg}-on-${bg}`,
      label,
      ratio,
      grade: wcagGrade(ratio),
      passesBody: ratio >= AA_NORMAL,
      passesLarge: ratio >= AA_LARGE,
    };
  });

  // Button label: whichever ground reads better on the primary fill.
  const labelRole =
    contrastRatio(byRole.neutral.rgb, byRole.primary.rgb) >=
    contrastRatio(byRole.ground.rgb, byRole.primary.rgb)
      ? "neutral"
      : "ground";
  const buttonRatio = round2(contrastRatio(byRole[labelRole].rgb, byRole.primary.rgb));
  pairs.push({
    id: `${labelRole}-on-primary`,
    label: `Button label (${labelRole}) on primary`,
    ratio: buttonRatio,
    grade: wcagGrade(buttonRatio),
    passesBody: buttonRatio >= AA_NORMAL,
    passesLarge: buttonRatio >= AA_LARGE,
  });

  return {
    festivalId: festival.id,
    festivalLabel: festival.label,
    note: festival.note,
    toneLabel: toneSpec.label,
    hueShift: shift,
    swatches,
    ramp: buildRamp(byRole.primary.rgb),
    pairs,
    accessiblePairs: pairs.filter((pair) => pair.passesBody).length,
    totalPairs: pairs.length,
    gradient: { from: byRole.primary.hex, to: byRole.accent.hex },
  };
}

const HASH = "#";

/** CSS custom properties plus a ready-made gradient. */
export function formatFestivalCss(palette) {
  if (!palette || palette.error) return "";
  const lines = palette.swatches.map((s) => `  --festival-${s.role}: ${HASH}${s.hex};`);
  const ramp = palette.ramp.map((r) => `  --festival-primary-${r.step}: ${HASH}${r.hex};`);
  return [
    `/* ${palette.festivalLabel} — ${palette.toneLabel} */`,
    ":root {",
    ...lines,
    ...ramp,
    `  --festival-gradient: linear-gradient(135deg, ${HASH}${palette.gradient.from}, ${HASH}${palette.gradient.to});`,
    "}",
  ].join("\n");
}

/** Plain-text summary including the contrast audit. */
export function formatFestivalText(palette) {
  if (!palette || palette.error) return "";
  return [
    `${palette.festivalLabel} palette — ${palette.toneLabel}`,
    palette.note,
    "",
    ...palette.swatches.map(
      (s) => `${s.role.padEnd(10)} ${s.name.padEnd(20)} ${HASH}${s.hex}`,
    ),
    "",
    "Primary ramp",
    ...palette.ramp.map((r) => `  ${String(r.step).padStart(3)}  ${HASH}${r.hex}`),
    "",
    "Contrast audit",
    ...palette.pairs.map((p) => `${p.label.padEnd(34)} ${p.ratio}:1  ${p.grade}`),
  ].join("\n");
}
