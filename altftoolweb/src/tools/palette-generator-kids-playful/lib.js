/**
 * Playful kids palette generator with automatic contrast repair.
 *
 * Pure module: no DOM, no React, no clock, no randomness. The same theme,
 * mode, hue shift and variation always produce the same palette.
 *
 * The interesting part is not the bright colours — it is that bright colours
 * usually fail as text. Every colour here is generated at full brightness for
 * fills, and then a second "text-safe" variant is produced by walking its
 * lightness one percent at a time until the WCAG 2.x contrast ratio against
 * the page ground reaches the chosen target. The walk is deterministic, so the
 * repaired value is reproducible.
 */

/** WCAG 2.x contrast thresholds (SC 1.4.3, 1.4.6, 1.4.11). */
export const WCAG = {
  AA_NORMAL: 4.5,
  AAA_NORMAL: 7,
  /** Large text: 24px regular or 18.66px bold and above. */
  AA_LARGE: 3,
  /** Non-text UI components and graphical objects. */
  UI_COMPONENT: 3,
};

/** Contrast targets the user can pick between. */
export const TARGETS = {
  aa: { id: "aa", label: "AA — 4.5:1 body text", ratio: WCAG.AA_NORMAL },
  aaa: { id: "aaa", label: "AAA — 7:1 body text", ratio: WCAG.AAA_NORMAL },
};

/** Highest variation index before the counter wraps. */
export const MAX_VARIATION = 5;

/** Lightness is walked in 1% steps; 100 steps covers the whole axis. */
const MAX_REPAIR_STEPS = 100;

/**
 * Themes. Each is five hues plus the saturation and lightness that make a
 * cheerful fill. Hues are spread far apart so the swatches stay tellable apart
 * even for a child looking at a printed worksheet.
 */
export const THEMES = {
  rainbow: {
    id: "rainbow",
    label: "Rainbow",
    note: "The classic six-crayon spread: red, orange, yellow, green, blue.",
    hues: [4, 32, 52, 140, 214],
    names: ["Cherry", "Tangerine", "Sunshine", "Grass", "Sky"],
    fill: { s: 84, l: 58 },
  },
  candyShop: {
    id: "candyShop",
    label: "Candy shop",
    note: "Sweet-shop pastels and bubblegum brights for younger age groups.",
    hues: [330, 350, 22, 168, 268],
    names: ["Bubblegum", "Strawberry", "Peach", "Mint", "Grape"],
    fill: { s: 76, l: 66 },
  },
  jungle: {
    id: "jungle",
    label: "Jungle",
    note: "Leafy greens with parrot brights — good for nature and animal themes.",
    hues: [96, 150, 178, 38, 8],
    names: ["Leaf", "Fern", "Lagoon", "Toucan", "Macaw"],
    fill: { s: 72, l: 52 },
  },
  ocean: {
    id: "ocean",
    label: "Ocean",
    note: "Cool blues and corals; the calmest of the bright sets.",
    hues: [196, 210, 174, 16, 44],
    names: ["Wave", "Deep", "Seaglass", "Coral", "Sandcastle"],
    fill: { s: 74, l: 56 },
  },
  crayonBox: {
    id: "crayonBox",
    label: "Crayon box",
    note: "Saturated primaries and secondaries that survive cheap CMYK printing.",
    hues: [356, 216, 50, 128, 288],
    names: ["Red", "Blue", "Yellow", "Green", "Purple"],
    fill: { s: 88, l: 50 },
  },
  birthday: {
    id: "birthday",
    label: "Birthday party",
    note: "Balloon and confetti colours for invitations and event pages.",
    hues: [340, 12, 46, 158, 250],
    names: ["Balloon", "Confetti", "Candle", "Streamer", "Party hat"],
    fill: { s: 80, l: 62 },
  },
};

/** Page grounds. Light mode is off-white; dark mode is a soft navy, not black. */
export const MODES = {
  light: {
    id: "light",
    label: "Light page",
    ground: { h: 44, s: 60, l: 97 },
    /** Text is walked darker on a light page. */
    direction: -1,
  },
  dark: {
    id: "dark",
    label: "Dark page",
    ground: { h: 234, s: 36, l: 13 },
    /** Text is walked lighter on a dark page. */
    direction: 1,
  },
};

/** The two extremes every label choice is measured against. */
const BLACK = { r: 0, g: 0, b: 0 };
const WHITE = { r: 255, g: 255, b: 255 };

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const mod360 = (value) => ((value % 360) + 360) % 360;
const round2 = (value) => Math.round(value * 100) / 100;

/** HSL (degrees, percent, percent) to sRGB 0-255, CSS Color Level 4 algorithm. */
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
    .map((v) =>
      clamp(Math.round(Number(v) || 0), 0, 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")
    .toUpperCase();
}

/** IEC 61966-2-1 sRGB transfer function used by the WCAG luminance formula. */
function toLinear(channel) {
  const c = clamp(Number(channel) || 0, 0, 255) / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** WCAG 2.x relative luminance. */
export function relativeLuminance({ r, g, b }) {
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/** WCAG 2.x contrast ratio, 1 to 21. */
export function contrastRatio(a, b) {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** WCAG grade for a ratio at normal body-text size. */
export function wcagLevel(ratio) {
  const value = Number(ratio);
  if (!Number.isFinite(value)) return "Fail";
  if (value >= WCAG.AAA_NORMAL) return "AAA";
  if (value >= WCAG.AA_NORMAL) return "AA";
  if (value >= WCAG.AA_LARGE) return "AA large text only";
  return "Fail";
}

/**
 * Walk a colour's lightness in 1% steps until it meets `target` against
 * `background`, keeping hue fixed. `direction` is -1 to darken, +1 to lighten.
 * Saturation is eased down as the colour approaches the extremes, because a
 * fully saturated hue at 5% lightness turns muddy.
 */
export function repairContrast({ h, s, l }, background, target, direction) {
  const hue = mod360(Number(h) || 0);
  const startS = clamp(Number(s) || 0, 0, 100);
  const startL = clamp(Number(l) || 0, 0, 100);
  const goal = Number(target);
  const dir = direction < 0 ? -1 : 1;

  if (!Number.isFinite(goal) || goal < 1) {
    return { error: "Contrast target must be a ratio of at least 1." };
  }

  let bestL = startL;
  let bestS = startS;
  let bestRatio = contrastRatio(hslToRgb(hue, startS, startL), background);
  let steps = 0;

  for (let i = 1; i <= MAX_REPAIR_STEPS; i += 1) {
    const nextL = clamp(startL + dir * i, 0, 100);
    // Below 25% and above 80% lightness, pull saturation back towards 70% of
    // its start so very dark or very pale text does not look dirty.
    const extremity = nextL < 25 ? (25 - nextL) / 25 : nextL > 80 ? (nextL - 80) / 20 : 0;
    const nextS = clamp(startS * (1 - 0.3 * extremity), 0, 100);
    const ratio = contrastRatio(hslToRgb(hue, nextS, nextL), background);
    steps = i;
    if (ratio > bestRatio) {
      bestRatio = ratio;
      bestL = nextL;
      bestS = nextS;
    }
    if (ratio >= goal) {
      bestRatio = ratio;
      bestL = nextL;
      bestS = nextS;
      break;
    }
    if (nextL === 0 || nextL === 100) break;
  }

  const rgb = hslToRgb(hue, bestS, bestL);
  return {
    hsl: { h: Math.round(hue), s: Math.round(bestS), l: Math.round(bestL) },
    rgb,
    hex: rgbToHex(rgb),
    ratio: round2(bestRatio),
    target: goal,
    achieved: bestRatio >= goal,
    steps,
    shifted: Math.round(Math.abs(bestL - startL)),
  };
}

/**
 * Build a playful palette with contrast-repaired text variants.
 */
export function generateKidsPalette({
  themeId = "rainbow",
  mode = "light",
  targetId = "aa",
  hueShift = 0,
  variation = 0,
} = {}) {
  const theme = THEMES[themeId];
  const modeSpec = MODES[mode];
  const target = TARGETS[targetId];
  if (!theme) return { error: "Choose one of the listed themes." };
  if (!modeSpec) return { error: "Page mode must be light or dark." };
  if (!target) return { error: "Contrast target must be AA or AAA." };

  const shift = Number(hueShift);
  const step = Number(variation);
  if (!Number.isFinite(shift)) return { error: "Hue rotation must be a number of degrees." };
  if (shift < -180 || shift > 180) return { error: "Keep hue rotation between -180 and 180 degrees." };
  if (!Number.isFinite(step) || step < 0) {
    return { error: "Variation must be zero or a positive whole number." };
  }

  const v = Math.round(step) % (MAX_VARIATION + 1);
  // Variations rotate the whole set by 7 degrees a step and breathe the fill
  // saturation and lightness slightly, keeping the theme recognisable.
  const hueNudge = v * 7;
  const satFactor = 1 + ((v % 3) - 1) * 0.06;
  const lightNudge = v % 2 === 0 ? -2 : 4;

  const groundRgb = hslToRgb(modeSpec.ground.h, modeSpec.ground.s, modeSpec.ground.l);
  const groundHex = rgbToHex(groundRgb);

  // Body ink: a near-neutral tinted with the theme's first hue, repaired to the
  // chosen target against the ground.
  const inkSeed = {
    h: mod360(theme.hues[0] + shift + hueNudge),
    s: 18,
    l: modeSpec.direction < 0 ? 40 : 70,
  };
  const ink = repairContrast(inkSeed, groundRgb, Math.max(target.ratio, WCAG.AAA_NORMAL), modeSpec.direction);

  const colours = theme.hues.map((hue, index) => {
    const h = mod360(hue + shift + hueNudge);
    const s = clamp(theme.fill.s * satFactor, 0, 100);
    const l = clamp(theme.fill.l + lightNudge, 0, 100);
    const fillRgb = hslToRgb(h, s, l);
    const fillHex = rgbToHex(fillRgb);

    // Which label colour reads best on this fill. A designer would reach for
    // the page colour, the body ink, or plain black or white, so all four are
    // scored and the strongest wins.
    const labelCandidates = [
      { name: "ink", hex: ink.hex, rgb: ink.rgb },
      { name: "page", hex: groundHex, rgb: groundRgb },
      { name: "black", hex: rgbToHex(BLACK), rgb: BLACK },
      { name: "white", hex: rgbToHex(WHITE), rgb: WHITE },
    ].map((candidate) => ({ ...candidate, ratio: round2(contrastRatio(candidate.rgb, fillRgb)) }));
    const labelOnFill = labelCandidates.reduce((best, candidate) =>
      candidate.ratio > best.ratio ? candidate : best,
    );

    // The same hue, repaired until it works as coloured type on the ground.
    const textSafe = repairContrast({ h, s, l }, groundRgb, target.ratio, modeSpec.direction);

    return {
      index,
      name: theme.names[index],
      hue: Math.round(h),
      fillHex,
      fillRgb,
      fillHsl: { h: Math.round(h), s: Math.round(s), l: Math.round(l) },
      fillOnGroundRatio: round2(contrastRatio(fillRgb, groundRgb)),
      fillUsableAsLargeText: contrastRatio(fillRgb, groundRgb) >= WCAG.AA_LARGE,
      fillUsableAsUiBorder: contrastRatio(fillRgb, groundRgb) >= WCAG.UI_COMPONENT,
      labelOnFill,
      labelOnFillLevel: wcagLevel(labelOnFill.ratio),
      textSafeHex: textSafe.hex,
      textSafeHsl: textSafe.hsl,
      textSafeRatio: textSafe.ratio,
      textSafeAchieved: textSafe.achieved,
      textSafeShift: textSafe.shifted,
    };
  });

  const readableFills = colours.filter((colour) => colour.labelOnFill.ratio >= target.ratio).length;
  const repairedTexts = colours.filter((colour) => colour.textSafeAchieved).length;

  return {
    themeId: theme.id,
    themeLabel: theme.label,
    note: theme.note,
    mode: modeSpec.id,
    modeLabel: modeSpec.label,
    targetId: target.id,
    targetLabel: target.label,
    targetRatio: target.ratio,
    variation: v,
    ground: { hex: groundHex, rgb: groundRgb, hsl: modeSpec.ground },
    ink: {
      hex: ink.hex,
      hsl: ink.hsl,
      ratio: ink.ratio,
      achieved: ink.achieved,
    },
    colours,
    readableFills,
    repairedTexts,
    totalColours: colours.length,
  };
}

const HASH = "#";

/** CSS custom properties: fills, contrast-repaired text tones, ground and ink. */
export function formatPaletteCss(palette) {
  if (!palette || palette.error) return "";
  const lines = [
    `  --kid-page: ${HASH}${palette.ground.hex};`,
    `  --kid-ink: ${HASH}${palette.ink.hex};`,
  ];
  palette.colours.forEach((colour) => {
    const key = colour.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    lines.push(`  --kid-${key}: ${HASH}${colour.fillHex};`);
    lines.push(`  --kid-${key}-text: ${HASH}${colour.textSafeHex};`);
  });
  return [
    `/* ${palette.themeLabel} — ${palette.modeLabel}, ${palette.targetLabel}, variation ${palette.variation} */`,
    ":root {",
    ...lines,
    "}",
  ].join("\n");
}

/** Plain-text summary with the contrast figures. */
export function formatPaletteText(palette) {
  if (!palette || palette.error) return "";
  return [
    `${palette.themeLabel} — ${palette.modeLabel}, target ${palette.targetRatio}:1, variation ${palette.variation}`,
    "",
    `Page   ${HASH}${palette.ground.hex}`,
    `Ink    ${HASH}${palette.ink.hex}  ${palette.ink.ratio}:1 on page`,
    "",
    "Colour        Fill      On page   Text-safe  Ratio",
    ...palette.colours.map(
      (c) =>
        `${c.name.padEnd(13)} ${HASH}${c.fillHex}   ${String(c.fillOnGroundRatio).padEnd(9)} ${HASH}${c.textSafeHex}    ${c.textSafeRatio}:1${c.textSafeAchieved ? "" : "  (best possible)"}`,
    ),
    "",
    `Fills that carry a readable label: ${palette.readableFills}/${palette.totalColours}`,
    `Hues repaired to ${palette.targetRatio}:1 as text: ${palette.repairedTexts}/${palette.totalColours}`,
  ].join("\n");
}
