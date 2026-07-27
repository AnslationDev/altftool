/**
 * Cyberpunk Palette Generator — pure colour engine.
 *
 * Neon on near-black is the easy part; keeping it readable is not. This module
 * generates the palette and then *tunes* it: every colour that has to carry text
 * has its lightness walked up until it meets the WCAG 2.1 contrast minimum
 * against the base, and the adjustment is reported rather than hidden.
 */

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const round1 = (value) => Math.round(value * 10) / 10;

/* ---------------------------------------------------------------------------
 * Colour conversion and WCAG contrast
 * ------------------------------------------------------------------------ */

/** HSL -> sRGB 0-255 (CSS Color 3). */
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

export function hslToHex(h, s, l) {
  return `#${hslToRgb(h, s, l)
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")}`;
}

/** WCAG 2.1 relative luminance, 0-1. */
export function relativeLuminance([r, g, b]) {
  const channel = (value) => {
    const v = clamp(value, 0, 255) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** WCAG 2.1 contrast ratio, 1 to 21. */
export function contrastRatio(rgbA, rgbB) {
  const a = relativeLuminance(rgbA);
  const b = relativeLuminance(rgbB);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/** WCAG 2.1 SC 1.4.3 — normal text. */
export const AA_NORMAL = 4.5;
/** WCAG 2.1 SC 1.4.3 — large text (18pt / 14pt bold and above). */
export const AA_LARGE = 3;
/** WCAG 2.1 SC 1.4.11 — UI components and graphical objects. */
export const AA_UI = 3;
/** WCAG 2.1 SC 1.4.6 — enhanced (AAA) contrast for normal text. */
export const AAA_NORMAL = 7;

/**
 * Raise a colour's lightness one point at a time until it meets a contrast
 * target against the background. Terminates at 100% lightness and reports
 * whether the target was actually reached.
 */
export function lightenUntilContrast(hsl, backgroundRgb, target) {
  const [h, s] = hsl;
  const start = hsl[2];
  let lightness = start;
  let best = { lightness, ratio: contrastRatio(hslToRgb(h, s, lightness), backgroundRgb) };
  while (lightness <= 100) {
    const ratio = contrastRatio(hslToRgb(h, s, lightness), backgroundRgb);
    if (ratio > best.ratio) best = { lightness, ratio };
    if (ratio >= target) {
      return {
        hsl: [h, s, lightness],
        hex: hslToHex(h, s, lightness),
        ratio: round1(ratio),
        lightnessShift: lightness - start,
        adjusted: lightness !== start,
        achieved: true,
      };
    }
    lightness += 1;
  }
  return {
    hsl: [h, s, best.lightness],
    hex: hslToHex(h, s, best.lightness),
    ratio: round1(best.ratio),
    lightnessShift: best.lightness - start,
    adjusted: best.lightness !== start,
    achieved: false,
  };
}

/**
 * The dimmest version of a colour that still passes a target — used for muted
 * text, where the goal is "quiet but still legible" rather than "as bright as
 * possible".
 */
export function dimmestPassing(hsl, backgroundRgb, target) {
  const [h, s] = hsl;
  let lightness = 100;
  let result = lightenUntilContrast([h, s, 0], backgroundRgb, target);
  if (!result.achieved) return result;
  // Walk down from the found value while the target still holds.
  lightness = result.hsl[2];
  while (lightness > 0) {
    const candidate = lightness - 1;
    if (contrastRatio(hslToRgb(h, s, candidate), backgroundRgb) < target) break;
    lightness = candidate;
  }
  const ratio = contrastRatio(hslToRgb(h, s, lightness), backgroundRgb);
  return {
    hsl: [h, s, lightness],
    hex: hslToHex(h, s, lightness),
    ratio: round1(ratio),
    lightnessShift: lightness - hsl[2],
    adjusted: lightness !== hsl[2],
    achieved: true,
  };
}

/* ---------------------------------------------------------------------------
 * Seeded randomness
 * ------------------------------------------------------------------------ */

export function hashSeed(text) {
  let hash = 2166136261;
  const source = String(text ?? "");
  for (let i = 0; i < source.length; i += 1) {
    hash ^= source.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

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
 * The cyberpunk recipe
 * ------------------------------------------------------------------------ */

/** Neon pairs: a lead hue and the complementary-ish hue that sits opposite it. */
export const NEON_PAIRS = [
  { id: "cyan-magenta", label: "Cyan and magenta", lead: [178, 190], counter: [300, 320] },
  { id: "magenta-lime", label: "Magenta and lime", lead: [304, 322], counter: [78, 96] },
  { id: "violet-amber", label: "Violet and amber", lead: [258, 276], counter: [36, 48] },
  { id: "acid-teal", label: "Acid green and teal", lead: [96, 112], counter: [172, 188] },
];

/** Base hue windows — the dark is never neutral black, it carries a tint. */
export const BASE_HUE = [220, 268];

/** Elevation ramp: lightness of base plus three raised surfaces. */
export const ELEVATION_STOPS = [6, 10, 14, 19];

/** Semantic status hues, standard traffic-light assignments. */
export const STATUS_HUES = { success: 148, warning: 42, danger: 356, info: 205 };

/** How saturated the neons run at each grit level. */
export const MIN_GRIT = 0;
export const MAX_GRIT = 100;

export const TEXT_TARGETS = [
  { id: "aa", label: "AA — 4.5:1 body text", value: AA_NORMAL },
  { id: "aaa", label: "AAA — 7:1 body text", value: AAA_NORMAL },
];

const pick = (random, [min, max]) => min + random() * (max - min);

/**
 * Generate the cyberpunk palette.
 *
 * @param {object} input
 * @param {string} input.seed any text
 * @param {string} input.pairId one of NEON_PAIRS
 * @param {number} input.grit 0-100; higher means more saturated neon and a colder base
 * @param {string} input.textTarget "aa" or "aaa" — the contrast bar text colours must clear
 * @returns {object} palette, or { error }
 */
export function generateCyberpunkPalette({
  seed = "neon-alley",
  pairId = NEON_PAIRS[0].id,
  grit = 60,
  textTarget = "aa",
} = {}) {
  const cleanSeed = String(seed ?? "").trim();
  if (!cleanSeed) return { error: "Enter a seed word or phrase to generate a palette." };
  if (cleanSeed.length > 64) return { error: "Keep the seed under 64 characters." };
  const pair = NEON_PAIRS.find((item) => item.id === pairId);
  if (!pair) return { error: "Pick one of the neon pairs." };
  const level = Number(grit);
  if (!Number.isFinite(level) || level < MIN_GRIT || level > MAX_GRIT) {
    return { error: `Grit must be between ${MIN_GRIT} and ${MAX_GRIT}.` };
  }
  const target = TEXT_TARGETS.find((item) => item.id === textTarget);
  if (!target) return { error: "Pick either the AA or the AAA text target." };

  const random = makeRandom(hashSeed(`${cleanSeed}|${pair.id}`));
  const heat = level / 100;

  const baseHue = pick(random, BASE_HUE);
  const leadHue = pick(random, pair.lead);
  const counterHue = pick(random, pair.counter);
  const neonSaturation = 74 + heat * 22;
  const baseSaturation = 22 + heat * 24;

  const surfaces = ELEVATION_STOPS.map((lightness, index) => {
    const hsl = [baseHue, baseSaturation - index * 2, lightness];
    return {
      key: index === 0 ? "base" : `surface-${index}`,
      name: index === 0 ? "Base" : `Surface ${index}`,
      use:
        index === 0
          ? "Page background — the deepest layer"
          : `Elevation ${index}: ${index === 1 ? "cards" : index === 2 ? "raised panels, menus" : "modals and popovers"}`,
      hsl,
      hex: hslToHex(...hsl),
      rgb: hslToRgb(...hsl),
    };
  });
  const baseRgb = surfaces[0].rgb;

  // Text: near-white tinted with the base hue, then dimmed to the quietest value
  // that still clears the chosen target.
  const inkStart = [baseHue, 14, 98];
  const inkFit = lightenUntilContrast(inkStart, baseRgb, target.value);
  const mutedFit = dimmestPassing([baseHue, 18, 40], baseRgb, target.value);

  // Neons are tuned to at least the large-text bar so they can be used as
  // headings and UI, and reported honestly if they cannot reach the text bar.
  const rawNeons = [
    {
      key: "neon-primary",
      name: "Primary neon",
      use: "Buttons, active states, the signature glow",
      hsl: [leadHue, neonSaturation, 54],
    },
    {
      key: "neon-secondary",
      name: "Counter neon",
      use: "Secondary actions, highlights, the opposing sign",
      hsl: [counterHue, neonSaturation - 4, 56],
    },
    {
      key: "success",
      name: "Success",
      use: "Confirmations and healthy states",
      hsl: [STATUS_HUES.success, 62 + heat * 16, 46],
    },
    {
      key: "warning",
      name: "Warning",
      use: "Caution states and degraded systems",
      hsl: [STATUS_HUES.warning, 78 + heat * 14, 52],
    },
    {
      key: "danger",
      name: "Danger",
      use: "Errors, destructive actions, alarms",
      hsl: [STATUS_HUES.danger, 70 + heat * 18, 52],
    },
    {
      key: "info",
      name: "Info",
      use: "Neutral notices and system messages",
      hsl: [STATUS_HUES.info, 68 + heat * 14, 52],
    },
  ];

  const neons = rawNeons.map((role) => {
    const hsl = [((role.hsl[0] % 360) + 360) % 360, clamp(role.hsl[1], 0, 100), clamp(role.hsl[2], 0, 100)];
    const asIs = contrastRatio(hslToRgb(...hsl), baseRgb);
    const uiFit = lightenUntilContrast(hsl, baseRgb, AA_UI);
    const textFit = lightenUntilContrast(hsl, baseRgb, target.value);
    return {
      ...role,
      hsl,
      hex: hslToHex(...hsl),
      rgb: hslToRgb(...hsl),
      ratio: round1(asIs),
      uiHex: uiFit.hex,
      uiRatio: uiFit.ratio,
      uiAdjusted: uiFit.adjusted,
      textHex: textFit.hex,
      textRatio: textFit.ratio,
      textAdjusted: textFit.adjusted,
      textAchieved: textFit.achieved,
      lightnessShift: textFit.lightnessShift,
    };
  });

  const ink = {
    key: "ink",
    name: "Text",
    use: "Body copy on the base",
    hsl: inkFit.hsl,
    hex: inkFit.hex,
    rgb: hslToRgb(...inkFit.hsl),
    ratio: inkFit.ratio,
  };
  const mutedInk = {
    key: "muted",
    name: "Muted text",
    use: "Captions and secondary copy — the quietest value that still passes",
    hsl: mutedFit.hsl,
    hex: mutedFit.hex,
    rgb: hslToRgb(...mutedFit.hsl),
    ratio: mutedFit.ratio,
  };

  // Glow shadows: the neon at 40% and 25% alpha, expressed as 8-digit hex so the
  // snippet stays copy-paste ready.
  const glows = neons.slice(0, 2).map((neon) => ({
    key: `${neon.key}-glow`,
    name: `${neon.name} glow`,
    css: `0 0 12px ${neon.uiHex}66, 0 0 32px ${neon.uiHex}40`,
  }));

  const checks = [
    { id: "ink-base", label: "Body text on base", ratio: ink.ratio, min: target.value },
    { id: "muted-base", label: "Muted text on base", ratio: mutedInk.ratio, min: target.value },
    ...neons.map((neon) => ({
      id: `${neon.key}-base`,
      label: `${neon.name} as text on base`,
      ratio: neon.ratio,
      min: target.value,
    })),
    ...neons.slice(0, 2).map((neon) => ({
      id: `${neon.key}-ui`,
      label: `${neon.name} tuned for UI`,
      ratio: neon.uiRatio,
      min: AA_UI,
    })),
  ].map((check) => ({
    ...check,
    ratio: round1(check.ratio),
    passes: check.ratio >= check.min,
    verdict:
      check.ratio >= AAA_NORMAL
        ? "Body text (AAA)"
        : check.ratio >= AA_NORMAL
          ? "Body text (AA)"
          : check.ratio >= AA_LARGE
            ? "Large text and UI only"
            : "Decoration only",
  }));

  const adjustments = neons.filter((neon) => neon.textAdjusted);
  const unreachable = neons.filter((neon) => !neon.textAchieved);

  const cssVariables = [
    ":root {",
    ...surfaces.map((surface) => `  --cp-${surface.key}: ${surface.hex};`),
    `  --cp-ink: ${ink.hex};`,
    `  --cp-muted: ${mutedInk.hex};`,
    ...neons.map((neon) => `  --cp-${neon.key}: ${neon.uiHex};`),
    ...neons.map((neon) => `  --cp-${neon.key}-text: ${neon.textHex};`),
    ...glows.map((glow) => `  --cp-${glow.key}: ${glow.css};`),
    "}",
  ].join("\n");

  const tailwindTheme = [
    "@theme {",
    ...surfaces.map((surface) => `  --color-cp-${surface.key}: ${surface.hex};`),
    `  --color-cp-ink: ${ink.hex};`,
    `  --color-cp-muted: ${mutedInk.hex};`,
    ...neons.map((neon) => `  --color-cp-${neon.key}: ${neon.uiHex};`),
    "}",
  ].join("\n");

  const json = JSON.stringify(
    {
      seed: cleanSeed,
      pair: pair.id,
      grit: level,
      textTarget: target.id,
      surfaces: Object.fromEntries(surfaces.map((surface) => [surface.key, surface.hex])),
      ink: ink.hex,
      muted: mutedInk.hex,
      neons: Object.fromEntries(neons.map((neon) => [neon.key, { ui: neon.uiHex, text: neon.textHex }])),
      glows: Object.fromEntries(glows.map((glow) => [glow.key, glow.css])),
    },
    null,
    2,
  );

  return {
    seed: cleanSeed,
    pair,
    grit: level,
    target,
    surfaces,
    ink,
    mutedInk,
    neons,
    glows,
    checks,
    adjustments,
    unreachable,
    accessible: checks.every((check) => check.passes || check.id.endsWith("-base")),
    cssVariables,
    tailwindTheme,
    json,
    summary: surfaces
      .map((surface) => `${surface.name}: ${surface.hex}`)
      .concat([`Text: ${ink.hex}`, `Muted: ${mutedInk.hex}`])
      .concat(neons.map((neon) => `${neon.name}: ${neon.uiHex}`))
      .join("\n"),
  };
}
