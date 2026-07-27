/**
 * Achromatopsia (monochromacy) palette simulation.
 *
 * Achromatopsia is the complete absence of colour vision. Complete rod
 * monochromacy affects roughly 1 in 30,000 people, and a far larger group sees
 * the same flattening temporarily — greyscale printing, e-ink, sunlight on a
 * phone screen, and any interface rendered in a single ink.
 *
 * Three greyscale models are offered because they are genuinely different:
 *
 *  1. WCAG relative luminance. sRGB channels are linearised with the sRGB
 *     transfer function from IEC 61966-2-1, then combined with the Rec. 709
 *     coefficients 0.2126 R + 0.7152 G + 0.0722 B. This is the definition used
 *     by WCAG 2.x for contrast, so it is the one that matters for compliance.
 *  2. CSS grayscale() filter. The Filter Effects Module Level 1 matrix uses the
 *     same 0.2126 / 0.7152 / 0.0722 weights but applies them to the
 *     gamma-encoded values, which is why a CSS filter and a true luminance
 *     conversion do not match.
 *  3. Rec. 601 luma, 0.299 R + 0.587 G + 0.114 B on gamma-encoded values. This
 *     is what most legacy video and photo "desaturate" operations use.
 *
 * Contrast ratio is the WCAG 2.x formula (L1 + 0.05) / (L2 + 0.05), where L is
 * relative luminance and L1 is the lighter of the two colours. Note that this
 * formula already ignores hue, so a pair that passes in colour also passes in
 * greyscale — what achromatopsia removes is every difference that was carried
 * by hue alone.
 */

/** Rec. 709 / sRGB luminance coefficients (also used by the CSS grayscale filter). */
export const REC709 = { r: 0.2126, g: 0.7152, b: 0.0722 };
/** Rec. 601 luma coefficients, used by legacy video and most "desaturate" tools. */
export const REC601 = { r: 0.299, g: 0.587, b: 0.114 };
/** sRGB transfer function break point and constants (IEC 61966-2-1). */
export const SRGB_THRESHOLD = 0.04045;
export const SRGB_LINEAR_DIVISOR = 12.92;
export const SRGB_OFFSET = 0.055;
export const SRGB_GAMMA = 2.4;

/** WCAG 2.1 SC 1.4.11 — non-text contrast for UI components and graphics. */
export const CONTRAST_UI = 3;
/** WCAG 2.1 SC 1.4.3 — minimum contrast for body text. */
export const CONTRAST_TEXT = 4.5;
/** WCAG 2.1 SC 1.4.6 — enhanced contrast for body text. */
export const CONTRAST_TEXT_AAA = 7;
/** Below this ratio two greys read as the same tone in practice. */
export const CONTRAST_INDISTINGUISHABLE = 1.5;

export const GREY_MODELS = [
  {
    key: "luminance",
    label: "WCAG relative luminance",
    note: "Linearised sRGB with Rec. 709 weights — the definition WCAG contrast uses.",
  },
  {
    key: "css",
    label: "CSS grayscale() filter",
    note: "Rec. 709 weights applied to gamma-encoded values, as browsers do.",
  },
  {
    key: "rec601",
    label: "Rec. 601 luma",
    note: "0.299 / 0.587 / 0.114 on gamma-encoded values — legacy video and print proofs.",
  },
];

/** Default sample palette, stored as channel triples so no colour is hardcoded as a style. */
export const DEFAULT_PALETTE = [
  { name: "Primary", rgb: [20, 184, 166] },
  { name: "Accent", rgb: [34, 211, 238] },
  { name: "Warning", rgb: [245, 158, 11] },
  { name: "Danger", rgb: [239, 68, 68] },
  { name: "Ink", rgb: [15, 23, 42] },
  { name: "Paper", rgb: [255, 255, 255] },
];

const clamp255 = (value) => Math.min(255, Math.max(0, Math.round(value)));

/** Format a channel triple as a #rrggbb string. */
export function rgbToHex([r, g, b]) {
  return `#${[r, g, b].map((channel) => clamp255(channel).toString(16).padStart(2, "0")).join("")}`;
}

/**
 * Parse a colour string. Accepts #rgb, #rrggbb, #rrggbbaa and bare hex digits.
 * @returns {{ rgb:[number,number,number] }|{ error:string }}
 */
export function parseColor(input) {
  const raw = String(input ?? "").trim().replace(/^#/, "");
  if (!raw) return { error: "Enter a colour value." };
  if (!/^[0-9a-fA-F]+$/.test(raw)) return { error: `"${input}" is not a hex colour.` };
  if (raw.length === 3) {
    const [r, g, b] = raw.split("").map((c) => parseInt(c + c, 16));
    return { rgb: [r, g, b] };
  }
  if (raw.length === 6 || raw.length === 8) {
    return {
      rgb: [
        parseInt(raw.slice(0, 2), 16),
        parseInt(raw.slice(2, 4), 16),
        parseInt(raw.slice(4, 6), 16),
      ],
    };
  }
  return { error: `"${input}" must be 3, 6 or 8 hex digits.` };
}

/** Linearise one gamma-encoded sRGB channel (0-255) to 0-1 linear light. */
export function srgbChannelToLinear(channel) {
  const c = Math.min(255, Math.max(0, Number(channel) || 0)) / 255;
  return c <= SRGB_THRESHOLD
    ? c / SRGB_LINEAR_DIVISOR
    : Math.pow((c + SRGB_OFFSET) / (1 + SRGB_OFFSET), SRGB_GAMMA);
}

/** WCAG relative luminance of an sRGB triple, 0 (black) to 1 (white). */
export function relativeLuminance([r, g, b]) {
  return (
    REC709.r * srgbChannelToLinear(r) +
    REC709.g * srgbChannelToLinear(g) +
    REC709.b * srgbChannelToLinear(b)
  );
}

/** Encode a 0-1 linear value back to a gamma-encoded sRGB channel (0-255). */
export function linearToSrgbChannel(value) {
  const v = Math.min(1, Math.max(0, Number(value) || 0));
  const encoded =
    v <= SRGB_THRESHOLD / SRGB_LINEAR_DIVISOR
      ? v * SRGB_LINEAR_DIVISOR
      : (1 + SRGB_OFFSET) * Math.pow(v, 1 / SRGB_GAMMA) - SRGB_OFFSET;
  return clamp255(encoded * 255);
}

/**
 * WCAG 2.x contrast ratio between two sRGB triples. Always >= 1, never NaN.
 */
export function contrastRatio(rgbA, rgbB) {
  const la = relativeLuminance(rgbA);
  const lb = relativeLuminance(rgbB);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Convert one colour to grey under the chosen model.
 * @returns {{ rgb:[number,number,number], level:number }}
 */
export function toGrey(rgb, model = "luminance") {
  const [r, g, b] = rgb;
  if (model === "rec601") {
    const luma = clamp255(REC601.r * r + REC601.g * g + REC601.b * b);
    return { rgb: [luma, luma, luma], level: luma };
  }
  if (model === "css") {
    const luma = clamp255(REC709.r * r + REC709.g * g + REC709.b * b);
    return { rgb: [luma, luma, luma], level: luma };
  }
  const encoded = linearToSrgbChannel(relativeLuminance(rgb));
  return { rgb: [encoded, encoded, encoded], level: encoded };
}

/** Classify a contrast ratio against the WCAG thresholds. */
export function classifyContrast(ratio) {
  if (ratio < CONTRAST_INDISTINGUISHABLE) {
    return { level: "critical", label: "Reads as the same tone" };
  }
  if (ratio < CONTRAST_UI) {
    return { level: "fail", label: "Below 3:1 — fails for UI and graphics" };
  }
  if (ratio < CONTRAST_TEXT) {
    return { level: "warn", label: "Passes 3:1, fails 4.5:1 body text" };
  }
  if (ratio < CONTRAST_TEXT_AAA) {
    return { level: "pass", label: "Passes AA 4.5:1" };
  }
  return { level: "best", label: "Passes AAA 7:1" };
}

/**
 * Simulate the whole palette and score every pair.
 *
 * @param {object} input
 * @param {{name:string, value:string}[]} input.colors - hex values
 * @param {string} [input.model]
 * @returns {object} report or { error }
 */
export function simulatePalette({ colors = [], model = "luminance" } = {}) {
  const entries = colors.filter((item) => String(item?.value ?? "").trim() !== "");
  if (entries.length < 2) {
    return { error: "Add at least two colours — a palette needs a pair to compare." };
  }
  if (entries.length > 12) {
    return { error: "Compare at most 12 colours at a time." };
  }
  const usedModel = GREY_MODELS.some((item) => item.key === model) ? model : "luminance";

  const swatches = [];
  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index];
    const parsed = parseColor(entry.value);
    if (parsed.error) return { error: parsed.error };
    const grey = toGrey(parsed.rgb, usedModel);
    swatches.push({
      name: String(entry.name ?? "").trim() || `Colour ${index + 1}`,
      rgb: parsed.rgb,
      hex: rgbToHex(parsed.rgb),
      greyRgb: grey.rgb,
      greyHex: rgbToHex(grey.rgb),
      greyLevel: grey.level,
      luminance: relativeLuminance(parsed.rgb),
    });
  }

  const pairs = [];
  for (let i = 0; i < swatches.length; i += 1) {
    for (let j = i + 1; j < swatches.length; j += 1) {
      const greyRatio = contrastRatio(swatches[i].greyRgb, swatches[j].greyRgb);
      const colourRatio = contrastRatio(swatches[i].rgb, swatches[j].rgb);
      pairs.push({
        a: swatches[i].name,
        b: swatches[j].name,
        aHex: swatches[i].greyHex,
        bHex: swatches[j].greyHex,
        greyRatio,
        colourRatio,
        hueOnlyLoss: colourRatio < CONTRAST_UI && greyRatio < CONTRAST_INDISTINGUISHABLE,
        ...classifyContrast(greyRatio),
      });
    }
  }

  pairs.sort((left, right) => left.greyRatio - right.greyRatio);

  const worst = pairs[0];
  const belowUi = pairs.filter((pair) => pair.greyRatio < CONTRAST_UI).length;
  const belowText = pairs.filter((pair) => pair.greyRatio < CONTRAST_TEXT).length;
  const collisions = pairs.filter((pair) => pair.greyRatio < CONTRAST_INDISTINGUISHABLE).length;

  return {
    model: usedModel,
    modelLabel: GREY_MODELS.find((item) => item.key === usedModel).label,
    swatches,
    pairs,
    worst,
    belowUi,
    belowText,
    collisions,
    pairCount: pairs.length,
    summary:
      collisions > 0
        ? `${collisions} of ${pairs.length} pairs collapse into the same tone without colour.`
        : `All ${pairs.length} pairs stay separable at ${CONTRAST_INDISTINGUISHABLE}:1 or better.`,
  };
}
