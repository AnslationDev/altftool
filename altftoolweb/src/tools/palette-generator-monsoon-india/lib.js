/**
 * Monsoon palette generator with a scrim-opacity solver.
 *
 * Pure module: no DOM, no React, no clock, no randomness.
 *
 * Monsoon campaign artwork is almost always type over a photograph, and a
 * photograph is the one background a designer cannot control. So besides the
 * usual palette and WCAG 2.x contrast audit, this module solves the practical
 * question: how opaque does the scrim behind the headline have to be before the
 * text clears 4.5:1?
 *
 * The solver composites the scrim over an assumed mean photo tone with the
 * standard source-over formula, out = a*scrim + (1-a)*photo, stepping alpha in
 * 1% increments and returning the first value that meets the target.
 */

/** WCAG 2.x thresholds (SC 1.4.3, 1.4.6, 1.4.11). */
export const WCAG = {
  AA_NORMAL: 4.5,
  AAA_NORMAL: 7,
  /** Large text: 24px regular or 18.66px bold and above. */
  AA_LARGE: 3,
  /** Non-text UI components and graphical objects. */
  UI_COMPONENT: 3,
};

/** Alpha is searched in 1% steps from 0 to 100. */
const ALPHA_STEPS = 100;

/** Highest variation index before the counter wraps. */
export const MAX_VARIATION = 5;

/** Roles in render order. */
export const ROLE_ORDER = ["sky", "rain", "water", "foliage", "earth", "paper"];

const ROLE_LABELS = {
  sky: "Sky / background",
  rain: "Rain slate",
  water: "Water teal",
  foliage: "Wet green",
  earth: "Wet earth",
  paper: "Paper / text",
};

/**
 * Monsoon moods. Each is six roles defined in HSL. The hue band deliberately
 * sits between roughly 150 and 230 degrees — the slate, teal and wet-green
 * range — with a single warm earth note to stop the set going cold.
 */
export const MOODS = {
  firstRain: {
    id: "firstRain",
    label: "First rain",
    note: "The relief shower: brighter sky, fresh green, everything still lit.",
    roles: {
      sky: { h: 205, s: 26, l: 88 },
      rain: { h: 212, s: 20, l: 58 },
      water: { h: 186, s: 50, l: 34 },
      foliage: { h: 148, s: 44, l: 32 },
      earth: { h: 28, s: 34, l: 38 },
      paper: { h: 205, s: 18, l: 15 },
    },
  },
  overcast: {
    id: "overcast",
    label: "Overcast afternoon",
    note: "Flat grey light with the colour drained out; good for quiet layouts.",
    roles: {
      sky: { h: 210, s: 14, l: 82 },
      rain: { h: 214, s: 12, l: 52 },
      water: { h: 194, s: 26, l: 38 },
      foliage: { h: 158, s: 24, l: 32 },
      earth: { h: 32, s: 20, l: 36 },
      paper: { h: 214, s: 16, l: 14 },
    },
  },
  deepMonsoon: {
    id: "deepMonsoon",
    label: "Deep monsoon",
    note: "Saturated, heavy and green — the peak-season look.",
    roles: {
      sky: { h: 200, s: 30, l: 78 },
      rain: { h: 208, s: 26, l: 44 },
      water: { h: 182, s: 62, l: 32 },
      foliage: { h: 142, s: 56, l: 26 },
      earth: { h: 24, s: 44, l: 32 },
      paper: { h: 200, s: 22, l: 12 },
    },
  },
  petrichor: {
    id: "petrichor",
    label: "Petrichor earth",
    note: "Warmer: soaked soil and terracotta against a cool sky.",
    roles: {
      sky: { h: 198, s: 20, l: 84 },
      rain: { h: 206, s: 16, l: 54 },
      water: { h: 178, s: 34, l: 36 },
      foliage: { h: 132, s: 34, l: 30 },
      earth: { h: 18, s: 52, l: 36 },
      paper: { h: 20, s: 24, l: 13 },
    },
  },
  stormNight: {
    id: "stormNight",
    label: "Storm night",
    note: "Dark ground with a single lit teal; built for dark-mode creatives.",
    roles: {
      sky: { h: 220, s: 34, l: 12 },
      rain: { h: 216, s: 24, l: 24 },
      water: { h: 184, s: 66, l: 58 },
      foliage: { h: 152, s: 40, l: 48 },
      earth: { h: 30, s: 44, l: 52 },
      paper: { h: 205, s: 16, l: 94 },
    },
  },
};

/** Scrim colours a designer would actually reach for. */
export const SCRIMS = {
  black: { id: "black", label: "Black scrim", hsl: null },
  paper: { id: "paper", label: "Palette paper colour", hsl: "paper" },
  sky: { id: "sky", label: "Palette sky colour", hsl: "sky" },
};

/**
 * Assumed mean tone of the photo area behind the headline, as HSL lightness.
 * A photo is not one flat colour, so these are stand-ins for the average tone
 * of the region the text sits on — measure your own crop if you can.
 */
export const PHOTO_TONES = [
  { id: "bright", label: "Bright overcast sky", lightness: 78 },
  { id: "mid", label: "Mid-tone wet street", lightness: 48 },
  { id: "dark", label: "Dark foliage or night", lightness: 22 },
];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const mod360 = (value) => ((value % 360) + 360) % 360;
const round2 = (value) => Math.round(value * 100) / 100;

/** HSL to sRGB 0-255, CSS Color Level 4 algorithm. */
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

/** IEC 61966-2-1 sRGB transfer function. */
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

/** WCAG grade at normal body-text size. */
export function wcagLevel(ratio) {
  const value = Number(ratio);
  if (!Number.isFinite(value)) return "Fail";
  if (value >= WCAG.AAA_NORMAL) return "AAA";
  if (value >= WCAG.AA_NORMAL) return "AA";
  if (value >= WCAG.AA_LARGE) return "AA large text only";
  return "Fail";
}

/** Standard source-over compositing of `over` at `alpha` on top of `base`. */
export function compositeOver(over, base, alpha) {
  const a = clamp(Number(alpha) || 0, 0, 1);
  return {
    r: Math.round(a * over.r + (1 - a) * base.r),
    g: Math.round(a * over.g + (1 - a) * base.g),
    b: Math.round(a * over.b + (1 - a) * base.b),
  };
}

/**
 * Smallest scrim opacity, as a whole percentage, at which `text` reaches
 * `target` contrast over `photo` once `scrim` is composited on top.
 * Returns { achievable: false } when no opacity from 0 to 100 gets there —
 * which happens when the text colour is close to the scrim colour.
 */
export function solveScrimOpacity({ text, photo, scrim, target }) {
  const goal = Number(target);
  if (!Number.isFinite(goal) || goal < 1) {
    return { error: "Contrast target must be a ratio of at least 1." };
  }
  let bestRatio = 0;
  let bestAlpha = 0;
  for (let i = 0; i <= ALPHA_STEPS; i += 1) {
    const alpha = i / ALPHA_STEPS;
    const composited = compositeOver(scrim, photo, alpha);
    const ratio = contrastRatio(text, composited);
    if (ratio > bestRatio) {
      bestRatio = ratio;
      bestAlpha = i;
    }
    if (ratio >= goal) {
      return {
        achievable: true,
        opacity: i,
        ratio: round2(ratio),
        compositedHex: rgbToHex(composited),
        target: goal,
      };
    }
  }
  const composited = compositeOver(scrim, photo, bestAlpha / ALPHA_STEPS);
  return {
    achievable: false,
    opacity: bestAlpha,
    ratio: round2(bestRatio),
    compositedHex: rgbToHex(composited),
    target: goal,
  };
}

const BLACK = { r: 0, g: 0, b: 0 };

/**
 * Build the monsoon palette, its contrast audit and the scrim table.
 */
export function generateMonsoonPalette({
  moodId = "deepMonsoon",
  hueShift = 0,
  variation = 0,
  scrimId = "black",
  textRole = "paper",
} = {}) {
  const mood = MOODS[moodId];
  const scrimSpec = SCRIMS[scrimId];
  if (!mood) return { error: "Choose one of the listed monsoon moods." };
  if (!scrimSpec) return { error: "Choose one of the listed scrim colours." };
  if (textRole !== "paper" && textRole !== "white") {
    return { error: "Overlay text must be the palette paper colour or plain white." };
  }

  const shift = Number(hueShift);
  const step = Number(variation);
  if (!Number.isFinite(shift)) return { error: "Hue rotation must be a number of degrees." };
  if (shift < -60 || shift > 60) {
    return { error: "Monsoon hues only stay believable within 60 degrees of rotation." };
  }
  if (!Number.isFinite(step) || step < 0) {
    return { error: "Variation must be zero or a positive whole number." };
  }

  const v = Math.round(step) % (MAX_VARIATION + 1);
  // Variations nudge hue by 3 degrees a step and breathe saturation and
  // lightness, keeping the mood recognisable.
  const hueNudge = v * 3;
  const satFactor = 1 + ((v % 3) - 1) * 0.09;
  const lightNudge = v % 2 === 0 ? -2 : 3;

  const swatches = ROLE_ORDER.map((role) => {
    const spec = mood.roles[role];
    const h = mod360(spec.h + shift + hueNudge);
    const s = clamp(spec.s * satFactor, 0, 100);
    // The paper colour holds its lightness so text never drifts out of reach.
    const l = clamp(role === "paper" ? spec.l : spec.l + lightNudge, 0, 100);
    const rgb = hslToRgb(h, s, l);
    return {
      role,
      label: ROLE_LABELS[role],
      hex: rgbToHex(rgb),
      rgb,
      hsl: { h: Math.round(h), s: Math.round(s), l: Math.round(l) },
    };
  });

  const byRole = Object.fromEntries(swatches.map((swatch) => [swatch.role, swatch]));

  const white = { r: 255, g: 255, b: 255 };

  // On a dark teal or a wet green, a designer sets the caption in whichever of
  // the two ground tones reads better, so the audit measures that choice
  // rather than forcing the dark paper colour onto a dark fill.
  const bestLabelOn = (bgRgb) => {
    const candidates = [
      { name: "paper", hex: byRole.paper.hex, rgb: byRole.paper.rgb },
      { name: "white", hex: rgbToHex(white), rgb: white },
      { name: "black", hex: rgbToHex(BLACK), rgb: BLACK },
    ].map((candidate) => ({ ...candidate, ratio: round2(contrastRatio(candidate.rgb, bgRgb)) }));
    return candidates.reduce((best, candidate) => (candidate.ratio > best.ratio ? candidate : best));
  };

  swatches.forEach((swatch) => {
    swatch.bestLabel = bestLabelOn(swatch.rgb);
  });

  const pairDefs = [
    ["paper", "sky", "Paper text on sky", WCAG.AA_NORMAL],
    ["label", "water", "Best label on water teal", WCAG.AA_NORMAL],
    ["label", "foliage", "Best label on wet green", WCAG.AA_NORMAL],
    ["label", "earth", "Best label on wet earth", WCAG.AA_NORMAL],
    ["water", "sky", "Teal display type on sky", WCAG.AA_LARGE],
    ["foliage", "sky", "Green rule or icon on sky", WCAG.UI_COMPONENT],
  ];

  const pairs = pairDefs.map(([fg, bg, label, threshold]) => {
    const foreground = fg === "label" ? byRole[bg].bestLabel : byRole[fg];
    const ratio = round2(contrastRatio(foreground.rgb, byRole[bg].rgb));
    return {
      id: `${fg}-on-${bg}`,
      label: fg === "label" ? `${label} (${byRole[bg].bestLabel.name})` : label,
      ratio,
      threshold,
      level: wcagLevel(ratio),
      passes: ratio >= threshold,
    };
  });

  const textRgb = textRole === "white" ? white : byRole.paper.rgb;
  const textHex = rgbToHex(textRgb);
  const scrimRgb = scrimSpec.hsl ? byRole[scrimSpec.hsl].rgb : BLACK;
  const scrimHex = rgbToHex(scrimRgb);

  const scrimRows = PHOTO_TONES.map((tone) => {
    // A neutral grey stands in for the mean tone of the photo region.
    const photoRgb = hslToRgb(0, 0, tone.lightness);
    const bare = round2(contrastRatio(textRgb, photoRgb));
    const aa = solveScrimOpacity({ text: textRgb, photo: photoRgb, scrim: scrimRgb, target: WCAG.AA_NORMAL });
    const aaa = solveScrimOpacity({ text: textRgb, photo: photoRgb, scrim: scrimRgb, target: WCAG.AAA_NORMAL });
    const large = solveScrimOpacity({ text: textRgb, photo: photoRgb, scrim: scrimRgb, target: WCAG.AA_LARGE });
    return {
      id: tone.id,
      label: tone.label,
      photoHex: rgbToHex(photoRgb),
      bareRatio: bare,
      bareLevel: wcagLevel(bare),
      large,
      aa,
      aaa,
    };
  });

  const solvedAtAa = scrimRows.filter((row) => row.aa.achievable).length;

  return {
    moodId: mood.id,
    moodLabel: mood.label,
    note: mood.note,
    variation: v,
    swatches,
    byRole,
    pairs,
    passingPairs: pairs.filter((pair) => pair.passes).length,
    totalPairs: pairs.length,
    textRole,
    textHex,
    scrimId: scrimSpec.id,
    scrimLabel: scrimSpec.label,
    scrimHex,
    scrimRows,
    solvedAtAa,
    totalScrimRows: scrimRows.length,
  };
}

const HASH = "#";

/** CSS custom properties, including a ready-made scrim gradient. */
export function formatPaletteCss(palette) {
  if (!palette || palette.error) return "";
  const midRow = palette.scrimRows.find((row) => row.id === "mid") ?? palette.scrimRows[0];
  const alpha = (midRow.aa.achievable ? midRow.aa.opacity : 100) / 100;
  return [
    `/* ${palette.moodLabel} — variation ${palette.variation} */`,
    ":root {",
    ...palette.swatches.map((swatch) => `  --monsoon-${swatch.role}: ${HASH}${swatch.hex};`),
    `  --monsoon-scrim: ${HASH}${palette.scrimHex};`,
    `  --monsoon-scrim-alpha: ${alpha};`,
    "}",
    "",
    "/* Scrim for headline text over a mid-tone photo */",
    ".monsoon-scrim {",
    "  background-color: color-mix(in srgb, var(--monsoon-scrim) calc(var(--monsoon-scrim-alpha) * 100%), transparent);",
    "}",
  ].join("\n");
}

/** Plain-text summary with both the palette audit and the scrim table. */
export function formatPaletteText(palette) {
  if (!palette || palette.error) return "";
  const show = (solved) => (solved.achievable ? `${solved.opacity}% (${solved.ratio}:1)` : "not reachable");
  return [
    `${palette.moodLabel} — variation ${palette.variation}`,
    "",
    ...palette.swatches.map(
      (s) => `${s.label.padEnd(22)} ${HASH}${s.hex}  hsl(${s.hsl.h} ${s.hsl.s}% ${s.hsl.l}%)`,
    ),
    "",
    "Contrast audit",
    ...palette.pairs.map(
      (p) => `${p.label.padEnd(28)} ${p.ratio}:1  needs ${p.threshold}:1  ${p.passes ? "pass" : "fail"}`,
    ),
    "",
    `Scrim solver — ${palette.textRole === "white" ? "white" : "paper"} text (${HASH}${palette.textHex}) with a ${palette.scrimLabel.toLowerCase()} (${HASH}${palette.scrimHex})`,
    "Photo tone                 No scrim   Large 3:1     Body 4.5:1    AAA 7:1",
    ...palette.scrimRows.map(
      (row) =>
        `${row.label.padEnd(26)} ${String(`${row.bareRatio}:1`).padEnd(10)} ${show(row.large).padEnd(13)} ${show(row.aa).padEnd(13)} ${show(row.aaa)}`,
    ),
  ].join("\n");
}
