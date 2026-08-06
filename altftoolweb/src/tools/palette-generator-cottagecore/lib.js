/**
 * Cottagecore Palette Generator — pure colour engine.
 *
 * Builds a soft botanical palette: cream paper, sage and moss greens, a berry
 * or clay accent and a honey warm, all held under a saturation ceiling so the
 * result stays muted rather than candy-bright. Includes a tint ramp for the
 * lead green, WCAG contrast readings and copy-ready exports.
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

export const AA_NORMAL = 4.5;
export const AA_LARGE = 3;

/**
 * Walk a colour's lightness down one percentage point at a time until it meets a
 * contrast target against a background. Pastels on cream often start below 3:1;
 * this returns the nearest usable version instead of failing silently.
 *
 * @returns {{hsl:number[],hex:string,ratio:number,adjusted:boolean,achieved:boolean}}
 */
export function darkenUntilContrast(hsl, backgroundRgb, target) {
  const [h, s] = hsl;
  let lightness = hsl[2];
  let best = { lightness, ratio: contrastRatio(hslToRgb(h, s, lightness), backgroundRgb) };
  while (lightness >= 0) {
    const ratio = contrastRatio(hslToRgb(h, s, lightness), backgroundRgb);
    if (ratio > best.ratio) best = { lightness, ratio };
    if (ratio >= target) {
      return {
        hsl: [h, s, lightness],
        hex: hslToHex(h, s, lightness),
        ratio: Math.round(ratio * 10) / 10,
        adjusted: lightness !== hsl[2],
        achieved: true,
      };
    }
    lightness -= 1;
  }
  return {
    hsl: [h, s, best.lightness],
    hex: hslToHex(h, s, best.lightness),
    ratio: Math.round(best.ratio * 10) / 10,
    adjusted: best.lightness !== hsl[2],
    achieved: false,
  };
}

/** Whichever candidate reads better on a background — used to pick button label colour. */
export function bestTextOn(backgroundRgb, candidates) {
  let winner = candidates[0];
  let winnerRatio = contrastRatio(candidates[0].rgb, backgroundRgb);
  for (const candidate of candidates.slice(1)) {
    const ratio = contrastRatio(candidate.rgb, backgroundRgb);
    if (ratio > winnerRatio) {
      winner = candidate;
      winnerRatio = ratio;
    }
  }
  return { ...winner, ratio: Math.round(winnerRatio * 10) / 10, passes: winnerRatio >= AA_NORMAL };
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
 * The cottagecore recipe
 *
 * Hue windows named after the plant or dye they come from. Cottagecore reads as
 * "faded" because saturation stays low — the ceiling below is what keeps a sage
 * from turning into a mint and a berry from turning into a fuchsia.
 * ------------------------------------------------------------------------ */

export const HUE_WINDOWS = {
  cream: [36, 48],
  sage: [92, 120],
  moss: [96, 132],
  berry: [330, 356],
  clay: [8, 24],
  honey: [34, 46],
};

/** Saturation ceiling at softness 0 and at softness 100. */
export const SATURATION_CEILING = { min: 22, max: 52 };

/** Seasons shift the hue centre and the overall lightness. */
export const SEASONS = [
  { id: "spring", label: "Spring — young green, elderflower", hueShift: 4, lightShift: 4 },
  { id: "summer", label: "Summer — meadow, wild berry", hueShift: -2, lightShift: 2 },
  { id: "autumn", label: "Autumn — dried grass, rosehip", hueShift: -10, lightShift: -4 },
  { id: "winter", label: "Winter — bare stem, preserved fruit", hueShift: -14, lightShift: -8 },
];

export const MIN_SOFTNESS = 0;
export const MAX_SOFTNESS = 100;

/** Lightness stops for the sage tint ramp, palest to deepest. */
export const TINT_STOPS = [94, 86, 74, 58, 42, 28];

const pick = (random, [min, max]) => min + random() * (max - min);

/**
 * Generate the cottagecore palette.
 *
 * @param {object} input
 * @param {string} input.seed any text
 * @param {string} input.season one of SEASONS
 * @param {number} input.softness 0-100; higher means a lower saturation ceiling
 * @returns {object} palette, or { error }
 */
export function generateCottagecorePalette({ seed = "elderflower", season = "spring", softness = 60 } = {}) {
  const cleanSeed = String(seed ?? "").trim();
  if (!cleanSeed) return { error: "Enter a seed word or phrase to generate a palette." };
  if (cleanSeed.length > 64) return { error: "Keep the seed under 64 characters." };
  const seasonSpec = SEASONS.find((item) => item.id === season);
  if (!seasonSpec) return { error: "Pick one of the four seasons." };
  const soft = Number(softness);
  if (!Number.isFinite(soft) || soft < MIN_SOFTNESS || soft > MAX_SOFTNESS) {
    return { error: `Softness must be between ${MIN_SOFTNESS} and ${MAX_SOFTNESS}.` };
  }

  const random = makeRandom(hashSeed(`${cleanSeed}|${season}`));

  // Softness lowers the saturation ceiling: 0 -> 52%, 100 -> 22%.
  const ceiling = SATURATION_CEILING.max - (soft / 100) * (SATURATION_CEILING.max - SATURATION_CEILING.min);
  const sat = (share) => clamp(ceiling * share, 4, ceiling);

  const hue = (window) => pick(random, window) + seasonSpec.hueShift;
  const light = (value) => clamp(value + seasonSpec.lightShift, 6, 98);

  const roles = [
    {
      key: "cream",
      name: "Cream paper",
      use: "Page background — the warm off-white everything sits on",
      hsl: [hue(HUE_WINDOWS.cream), sat(0.34), light(95)],
    },
    {
      key: "linen",
      name: "Linen",
      use: "Cards and panels a shade above the background",
      hsl: [hue(HUE_WINDOWS.cream), sat(0.24), light(90)],
    },
    {
      key: "sage",
      name: "Sage",
      use: "Primary — buttons, headings, the lead colour",
      hsl: [hue(HUE_WINDOWS.sage), sat(0.62), light(58)],
    },
    {
      key: "moss",
      name: "Moss",
      use: "Deep green for text on cream and for footers",
      hsl: [hue(HUE_WINDOWS.moss), sat(0.78), light(26)],
    },
    {
      key: "berry",
      name: "Wild berry",
      use: "Accent — links, tags, a single call to action",
      hsl: [hue(HUE_WINDOWS.berry), sat(0.86), light(42)],
    },
    {
      key: "clay",
      name: "Clay rose",
      use: "Secondary accent — illustration fills, quiet highlights",
      hsl: [hue(HUE_WINDOWS.clay), sat(0.7), light(66)],
    },
    {
      key: "honey",
      name: "Honey",
      use: "Warm accent — badges, seasonal notes",
      hsl: [hue(HUE_WINDOWS.honey), sat(0.9), light(62)],
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

  // Ink is a very dark version of the moss hue — a warm near-black, never pure black.
  const inkHsl = [byKey.moss.hsl[0], clamp(ceiling * 0.5, 6, 30), 13];
  const ink = {
    key: "ink",
    name: "Ink",
    use: "Body text",
    hsl: inkHsl,
    hex: hslToHex(...inkHsl),
    rgb: hslToRgb(...inkHsl),
    hslText: `hsl(${Math.round(inkHsl[0])} ${Math.round(inkHsl[1])}% ${Math.round(inkHsl[2])}%)`,
  };

  const tintRamp = TINT_STOPS.map((lightness, index) => ({
    key: `sage-${(index + 1) * 100}`,
    step: (index + 1) * 100,
    hsl: [byKey.sage.hsl[0], byKey.sage.hsl[1], lightness],
    hex: hslToHex(byKey.sage.hsl[0], byKey.sage.hsl[1], lightness),
  }));

  // Label colour for each solid fill: whichever of ink or cream reads better on it.
  const buttonPairs = ["sage", "moss", "berry", "clay", "honey"].map((key) => {
    const best = bestTextOn(byKey[key].rgb, [ink, byKey.cream]);
    return {
      key,
      name: byKey[key].name,
      fillHex: byKey[key].hex,
      labelName: best.name,
      labelHex: best.hex,
      ratio: best.ratio,
      passes: best.passes,
    };
  });

  // Darkened variants that clear 3:1 against the cream background, for borders,
  // icons and any other non-text UI shape.
  const uiSafe = ["sage", "berry", "clay", "honey"].map((key) => {
    const adjusted = darkenUntilContrast(byKey[key].hsl, byKey.cream.rgb, AA_LARGE);
    return { key, name: byKey[key].name, originalHex: byKey[key].hex, ...adjusted };
  });

  // The Contrast table checks the pairings the app actually renders, not
  // fixed raw-colour pairs: the sage button label is whichever of ink/cream
  // bestTextOn picked, and clay/honey are checked at their UI-safe (darkened)
  // value, since that's what borders/icons/badges actually use on cream.
  const sageButtonLabel = bestTextOn(byKey.sage.rgb, [ink, byKey.cream]);
  const uiSafeByKey = Object.fromEntries(uiSafe.map((item) => [item.key, item]));
  const clayUiSafeRgb = hslToRgb(...uiSafeByKey.clay.hsl);
  const honeyUiSafeRgb = hslToRgb(...uiSafeByKey.honey.hsl);

  const checks = [
    { id: "ink-cream", label: "Ink on cream", fg: ink, bg: byKey.cream, min: AA_NORMAL },
    { id: "moss-cream", label: "Moss text on cream", fg: byKey.moss, bg: byKey.cream, min: AA_NORMAL },
    { id: "berry-cream", label: "Berry link on cream", fg: byKey.berry, bg: byKey.cream, min: AA_NORMAL },
    {
      id: "sage-button-label",
      label: "Button label on sage",
      fg: { rgb: sageButtonLabel.rgb },
      bg: byKey.sage,
      min: AA_NORMAL,
    },
    { id: "cream-moss", label: "Cream text on moss footer", fg: byKey.cream, bg: byKey.moss, min: AA_NORMAL },
    {
      id: "clay-ui-safe",
      label: "UI-safe clay on cream",
      fg: { rgb: clayUiSafeRgb },
      bg: byKey.cream,
      min: AA_LARGE,
    },
    {
      id: "honey-ui-safe",
      label: "UI-safe honey on cream",
      fg: { rgb: honeyUiSafeRgb },
      bg: byKey.cream,
      min: AA_LARGE,
    },
  ].map((check) => {
    const ratio = contrastRatio(check.fg.rgb, check.bg.rgb);
    return {
      id: check.id,
      label: check.label,
      ratio: round1(ratio),
      min: check.min,
      passes: ratio >= check.min,
      verdict: ratio >= AA_NORMAL ? "Body text" : ratio >= AA_LARGE ? "Large text and UI only" : "Decoration only",
    };
  });

  const failing = checks.filter((check) => !check.passes);

  // "Muted" is measurable: the mean saturation of the five colour roles.
  const chromaRoles = ["sage", "moss", "berry", "clay", "honey"];
  const meanSaturation =
    chromaRoles.reduce((sum, key) => sum + byKey[key].hsl[1], 0) / chromaRoles.length;
  const softnessScore = round1(clamp(100 - meanSaturation * 1.6, 0, 100));

  const cssVariables = [
    ":root {",
    ...withHex.map((role) => `  --cottage-${role.key}: ${role.hex};`),
    `  --cottage-ink: ${ink.hex};`,
    ...tintRamp.map((step) => `  --cottage-${step.key}: ${step.hex};`),
    "}",
  ].join("\n");

  const tailwindTheme = [
    "@theme {",
    ...withHex.map((role) => `  --color-cottage-${role.key}: ${role.hex};`),
    `  --color-cottage-ink: ${ink.hex};`,
    ...tintRamp.map((step) => `  --color-cottage-${step.key}: ${step.hex};`),
    "}",
  ].join("\n");

  const json = JSON.stringify(
    {
      seed: cleanSeed,
      season,
      softness: soft,
      saturationCeiling: round1(ceiling),
      roles: Object.fromEntries(withHex.map((role) => [role.key, role.hex])),
      ink: ink.hex,
      sageRamp: tintRamp.map((step) => step.hex),
    },
    null,
    2,
  );

  return {
    seed: cleanSeed,
    season: seasonSpec,
    softness: soft,
    saturationCeiling: round1(ceiling),
    meanSaturation: round1(meanSaturation),
    softnessScore,
    roles: withHex,
    ink,
    tintRamp,
    buttonPairs,
    uiSafe,
    checks,
    failing,
    accessible: failing.length === 0,
    cssVariables,
    tailwindTheme,
    json,
    summary: withHex
      .concat([ink])
      .map((role) => `${role.name}: ${role.hex}`)
      .join("\n"),
  };
}
