/**
 * Corporate Trust Palette Generator — pure colour engine.
 *
 * Produces a blue-led product palette in the shape design systems actually use:
 * a 10-step primary scale, a tinted neutral scale, and success / warning /
 * danger / info statuses — then works out, for light mode and dark mode
 * separately, which step of each scale is legal for text and which for UI,
 * using the WCAG 2.1 contrast formula.
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
/** WCAG 2.1 SC 1.4.3 — large text. */
export const AA_LARGE = 3;
/** WCAG 2.1 SC 1.4.11 — UI components and graphical objects. */
export const AA_UI = 3;
/** WCAG 2.1 SC 1.4.6 — AAA normal text. */
export const AAA_NORMAL = 7;

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
 * Scale shape
 * ------------------------------------------------------------------------ */

/** Step names, matching the 50-900 convention used by most design systems. */
export const SCALE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

/** Lightness of each step. The curve is steeper in the middle, flatter at the ends. */
export const SCALE_LIGHTNESS = [97, 93, 86, 76, 65, 54, 45, 36, 27, 18];

/**
 * Saturation multiplier per step: the extremes are muted so the 50 does not look
 * like a wash of neon and the 900 does not turn into a saturated ink.
 */
export const SCALE_SATURATION_FACTOR = [0.5, 0.62, 0.76, 0.9, 0.98, 1, 0.98, 0.92, 0.85, 0.78];

/** Blue families that read as institutional rather than playful. */
export const BLUE_FAMILIES = [
  { id: "azure", label: "Azure — software and SaaS", hue: [204, 214] },
  { id: "navy", label: "Navy — banking and insurance", hue: [218, 228] },
  { id: "indigo", label: "Indigo — enterprise and security", hue: [230, 244] },
  { id: "teal-blue", label: "Teal blue — health and public sector", hue: [188, 198] },
];

/** Status hues. Standard assignments; hue is fixed so the meaning stays legible. */
export const STATUS_FAMILIES = [
  { key: "success", label: "Success", hue: 146, saturation: 58 },
  { key: "warning", label: "Warning", hue: 38, saturation: 88 },
  { key: "danger", label: "Danger", hue: 356, saturation: 68 },
  { key: "info", label: "Info", hue: 200, saturation: 72 },
];

/** How much of the brand hue bleeds into the greys. */
export const MIN_NEUTRAL_TINT = 0;
export const MAX_NEUTRAL_TINT = 20;

export const CONTRAST_TARGETS = [
  { id: "aa", label: "AA — 4.5:1 body text", value: AA_NORMAL },
  { id: "aaa", label: "AAA — 7:1 body text", value: AAA_NORMAL },
];

const pick = (random, [min, max]) => min + random() * (max - min);

/** Build a 10-step scale from one hue and a base saturation. */
export function buildScale(hue, baseSaturation) {
  return SCALE_STEPS.map((step, index) => {
    const saturation = clamp(baseSaturation * SCALE_SATURATION_FACTOR[index], 0, 100);
    const lightness = SCALE_LIGHTNESS[index];
    const hsl = [((hue % 360) + 360) % 360, saturation, lightness];
    return {
      step,
      hsl,
      hex: hslToHex(...hsl),
      rgb: hslToRgb(...hsl),
    };
  });
}

/**
 * The lightest step of a scale that still meets a contrast target against a
 * background — the conventional way to answer "which step can I put text in?".
 * Scans from the pale end so the answer is the least heavy option that works.
 */
export function firstPassingStep(scale, backgroundRgb, target, fromDarkEnd = false) {
  const ordered = fromDarkEnd ? [...scale].reverse() : scale;
  for (const entry of ordered) {
    const ratio = contrastRatio(entry.rgb, backgroundRgb);
    if (ratio >= target) {
      return { step: entry.step, hex: entry.hex, ratio: round1(ratio), found: true };
    }
  }
  // Nothing qualifies: report the best available so the caller can say so.
  let best = scale[0];
  let bestRatio = contrastRatio(scale[0].rgb, backgroundRgb);
  for (const entry of scale.slice(1)) {
    const ratio = contrastRatio(entry.rgb, backgroundRgb);
    if (ratio > bestRatio) {
      best = entry;
      bestRatio = ratio;
    }
  }
  return { step: best.step, hex: best.hex, ratio: round1(bestRatio), found: false };
}

/**
 * Generate the corporate palette.
 *
 * @param {object} input
 * @param {string} input.seed any text
 * @param {string} input.family one of BLUE_FAMILIES
 * @param {number} input.saturation 30-90, how confident the brand blue is
 * @param {number} input.neutralTint 0-20, how much brand hue bleeds into the greys
 * @param {string} input.target "aa" or "aaa"
 * @returns {object} palette, or { error }
 */
export function generateCorporatePalette({
  seed = "meridian",
  family = "azure",
  saturation = 68,
  neutralTint = 8,
  target = "aa",
} = {}) {
  const cleanSeed = String(seed ?? "").trim();
  if (!cleanSeed) return { error: "Enter a seed word or phrase to generate a palette." };
  if (cleanSeed.length > 64) return { error: "Keep the seed under 64 characters." };
  const familySpec = BLUE_FAMILIES.find((item) => item.id === family);
  if (!familySpec) return { error: "Pick one of the blue families." };
  const sat = Number(saturation);
  if (!Number.isFinite(sat) || sat < 30 || sat > 90) {
    return { error: "Brand saturation should be between 30 and 90." };
  }
  const tint = Number(neutralTint);
  if (!Number.isFinite(tint) || tint < MIN_NEUTRAL_TINT || tint > MAX_NEUTRAL_TINT) {
    return { error: `Neutral tint must be between ${MIN_NEUTRAL_TINT} and ${MAX_NEUTRAL_TINT}.` };
  }
  const targetSpec = CONTRAST_TARGETS.find((item) => item.id === target);
  if (!targetSpec) return { error: "Pick either the AA or the AAA contrast target." };

  const random = makeRandom(hashSeed(`${cleanSeed}|${familySpec.id}`));
  const brandHue = pick(random, familySpec.hue);

  const primary = buildScale(brandHue, sat);
  const neutral = buildScale(brandHue, tint);
  const statuses = STATUS_FAMILIES.map((status) => ({
    ...status,
    scale: buildScale(status.hue, status.saturation),
  }));

  // Surfaces: light mode uses the palest neutrals, dark mode the deepest.
  const light = {
    id: "light",
    label: "Light mode",
    background: neutral[0],
    surface: { step: "white", hex: hslToHex(brandHue, 0, 100), rgb: hslToRgb(brandHue, 0, 100) },
    border: neutral[2],
  };
  const dark = {
    id: "dark",
    label: "Dark mode",
    background: neutral[9],
    surface: neutral[8],
    border: neutral[7],
  };

  const analyse = (scale, mode) => {
    const bg = mode.surface.rgb;
    const text = firstPassingStep(scale, bg, targetSpec.value, mode.id === "light");
    const ui = firstPassingStep(scale, bg, AA_UI, mode.id === "light");
    return { text, ui };
  };

  const primaryUsage = {
    light: analyse(primary, light),
    dark: analyse(primary, dark),
  };

  const statusUsage = statuses.map((status) => ({
    key: status.key,
    label: status.label,
    light: analyse(status.scale, light),
    dark: analyse(status.scale, dark),
  }));

  // Text colours per mode, taken from the neutral scale.
  const bodyLight = firstPassingStep(neutral, light.surface.rgb, targetSpec.value, true);
  const mutedLight = firstPassingStep(neutral, light.surface.rgb, AA_NORMAL, true);
  const bodyDark = firstPassingStep(neutral, dark.surface.rgb, targetSpec.value, false);
  const mutedDark = firstPassingStep(neutral, dark.surface.rgb, AA_NORMAL, false);

  // Button check: white label on the primary step chosen for UI in light mode.
  const buttonFill = primary.find((entry) => entry.step === primaryUsage.light.ui.step) ?? primary[5];
  const whiteRgb = hslToRgb(brandHue, 0, 100);
  const buttonRatio = round1(contrastRatio(whiteRgb, buttonFill.rgb));

  const checks = [
    {
      id: "body-light",
      label: "Body text on white",
      ratio: bodyLight.ratio,
      min: targetSpec.value,
    },
    { id: "body-dark", label: "Body text on the dark surface", ratio: bodyDark.ratio, min: targetSpec.value },
    {
      id: "primary-light",
      label: `Primary ${primaryUsage.light.text.step} as text on white`,
      ratio: primaryUsage.light.text.ratio,
      min: targetSpec.value,
    },
    {
      id: "primary-dark",
      label: `Primary ${primaryUsage.dark.text.step} as text on dark`,
      ratio: primaryUsage.dark.text.ratio,
      min: targetSpec.value,
    },
    { id: "button-label", label: "White label on the primary button", ratio: buttonRatio, min: AA_NORMAL },
    ...statusUsage.map((status) => ({
      id: `${status.key}-light`,
      label: `${status.label} ${status.light.text.step} as text on white`,
      ratio: status.light.text.ratio,
      min: targetSpec.value,
    })),
  ].map((check) => ({
    ...check,
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

  const notes = [];
  if (!primaryUsage.light.text.found) {
    notes.push(
      `No step of the primary scale reaches ${targetSpec.value}:1 on white — the closest is ${primaryUsage.light.text.step} at ${primaryUsage.light.text.ratio}:1.`,
    );
  } else {
    notes.push(
      `Use primary ${primaryUsage.light.text.step} for text on white (${primaryUsage.light.text.ratio}:1) and ${primaryUsage.dark.text.step} on the dark surface (${primaryUsage.dark.text.ratio}:1).`,
    );
  }
  if (buttonRatio < AA_NORMAL) {
    notes.push(
      `A white label on primary ${buttonFill.step} is only ${buttonRatio}:1 — use a darker step for filled buttons, or dark text on the fill.`,
    );
  }
  if (tint === 0) {
    notes.push("The neutrals are pure grey; a few points of brand tint usually makes a UI feel more deliberate.");
  }

  const tokens = {
    light: {
      background: light.background.hex,
      surface: light.surface.hex,
      border: light.border.hex,
      text: bodyLight.hex,
      muted: mutedLight.hex,
      primary: primaryUsage.light.ui.hex,
      primaryText: primaryUsage.light.text.hex,
      ...Object.fromEntries(statusUsage.map((status) => [status.key, status.light.ui.hex])),
    },
    dark: {
      background: dark.background.hex,
      surface: dark.surface.hex,
      border: dark.border.hex,
      text: bodyDark.hex,
      muted: mutedDark.hex,
      primary: primaryUsage.dark.ui.hex,
      primaryText: primaryUsage.dark.text.hex,
      ...Object.fromEntries(statusUsage.map((status) => [status.key, status.dark.ui.hex])),
    },
  };

  const cssVariables = [
    ":root {",
    ...primary.map((entry) => `  --brand-${entry.step}: ${entry.hex};`),
    ...neutral.map((entry) => `  --neutral-${entry.step}: ${entry.hex};`),
    ...Object.entries(tokens.light).map(([key, value]) => `  --ui-${key}: ${value};`),
    "}",
    "",
    '[data-theme="dark"] {',
    ...Object.entries(tokens.dark).map(([key, value]) => `  --ui-${key}: ${value};`),
    "}",
  ].join("\n");

  const tailwindTheme = [
    "@theme {",
    ...primary.map((entry) => `  --color-brand-${entry.step}: ${entry.hex};`),
    ...neutral.map((entry) => `  --color-neutral-${entry.step}: ${entry.hex};`),
    ...statuses.map((status) => `  --color-${status.key}: ${status.scale[5].hex};`),
    "}",
  ].join("\n");

  const json = JSON.stringify(
    {
      seed: cleanSeed,
      family: familySpec.id,
      hue: Math.round(brandHue),
      saturation: sat,
      neutralTint: tint,
      target: targetSpec.id,
      primary: Object.fromEntries(primary.map((entry) => [entry.step, entry.hex])),
      neutral: Object.fromEntries(neutral.map((entry) => [entry.step, entry.hex])),
      status: Object.fromEntries(
        statuses.map((status) => [status.key, Object.fromEntries(status.scale.map((entry) => [entry.step, entry.hex]))]),
      ),
      tokens,
    },
    null,
    2,
  );

  return {
    seed: cleanSeed,
    family: familySpec,
    hue: Math.round(brandHue),
    saturation: sat,
    neutralTint: tint,
    target: targetSpec,
    primary,
    neutral,
    statuses,
    statusUsage,
    primaryUsage,
    modes: { light, dark },
    body: { light: bodyLight, dark: bodyDark },
    muted: { light: mutedLight, dark: mutedDark },
    button: { fillStep: buttonFill.step, fillHex: buttonFill.hex, ratio: buttonRatio, passes: buttonRatio >= AA_NORMAL },
    tokens,
    checks,
    notes,
    cssVariables,
    tailwindTheme,
    json,
    summary: primary
      .map((entry) => `brand-${entry.step}: ${entry.hex}`)
      .concat(neutral.map((entry) => `neutral-${entry.step}: ${entry.hex}`))
      .join("\n"),
  };
}
