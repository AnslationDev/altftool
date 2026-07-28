/**
 * Tailwind Color Generator — a full 50-950 scale from one base colour.
 *
 * WHY OKLCH AND NOT HSL
 *   HSL lightness is not perceptual: hsl(60 100% 50%) (yellow) looks far brighter than
 *   hsl(240 100% 50%) (blue) even though both claim 50% lightness. A scale built by
 *   stepping HSL lightness therefore looks lumpy. OKLab, published by Björn Ottosson in
 *   December 2020, is a perceptual space whose L really does track apparent lightness,
 *   and OKLCH is its cylindrical form (lightness, chroma, hue). Tailwind CSS v4 ships its
 *   own default palette in oklch() for the same reason, so a generated scale sits beside
 *   the built-in colours without looking out of place.
 *
 * THE CONVERSION CHAIN (all matrices are Ottosson's published values)
 *   sRGB  --inverse transfer-->  linear RGB  --M1-->  LMS  --cube root-->  L'M'S'
 *         --M2-->  OKLab  --polar-->  OKLCH        and the exact inverse coming back.
 *   The sRGB transfer function is the IEC 61966-2-1 piecewise curve:
 *       linear = c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ^ 2.4
 *
 * HOW THE SCALE IS BUILT
 *   1. The base colour is converted to OKLCH, giving lightness L, chroma C and hue H.
 *   2. The hue is held constant across all eleven steps — that is what makes them read
 *      as one colour.
 *   3. Each step takes its lightness from TARGET_LIGHTNESS below.
 *   4. Chroma is scaled by CHROMA_CURVE, normalised so the anchor step keeps the base
 *      colour's chroma exactly. The curve peaks around 500-600 and tapers at both ends,
 *      because very light and very dark colours cannot hold much chroma without looking
 *      muddy.
 *   5. If a step falls outside the sRGB gamut, chroma is reduced by binary search until
 *      it just fits — the standard chroma-clipping approach, which preserves hue and
 *      lightness and only gives up saturation.
 *
 *   TARGET_LIGHTNESS and CHROMA_CURVE are this tool's own curves, chosen so the spacing
 *   matches the visual rhythm of Tailwind's default ramps. They are not published
 *   Tailwind constants.
 *
 * CONTRAST
 *   WCAG 2.1 relative luminance (§ definition of relative luminance):
 *       Y = 0.2126 R + 0.7152 G + 0.0722 B, on linearised channels
 *   Contrast ratio = (Y_lighter + 0.05) / (Y_darker + 0.05), from 1:1 to 21:1.
 *   AA needs 4.5:1 for normal text and 3:1 for large text; AAA needs 7:1.
 *
 * Pure module: a colour string in, numbers and CSS strings out. No DOM, no clock.
 */

/** The eleven steps of a Tailwind colour ramp. */
export const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

/** Target OKLCH lightness for each step. This tool's own curve. */
export const TARGET_LIGHTNESS = {
  50: 0.971,
  100: 0.936,
  200: 0.885,
  300: 0.809,
  400: 0.712,
  500: 0.637,
  600: 0.577,
  700: 0.505,
  800: 0.443,
  900: 0.396,
  950: 0.279,
};

/** Relative chroma for each step, normalised at the anchor. This tool's own curve. */
export const CHROMA_CURVE = {
  50: 0.07,
  100: 0.14,
  200: 0.28,
  300: 0.48,
  400: 0.75,
  500: 1.0,
  600: 1.02,
  700: 0.94,
  800: 0.82,
  900: 0.72,
  950: 0.5,
};

/**
 * The colour the tool opens with: Tailwind v3's blue-500, the most recognisable value
 * in the framework, so the generated ramp is immediately familiar.
 */
export const DEFAULT_BASE_COLOR = "#3b82f6";

/** WCAG 2.1 contrast thresholds. */
export const WCAG_AA_NORMAL = 4.5;
export const WCAG_AA_LARGE = 3;
export const WCAG_AAA_NORMAL = 7;

/** Ottosson's linear-sRGB to LMS matrix. */
const M1 = [
  [0.4122214708, 0.5363325363, 0.0514459929],
  [0.2119034982, 0.6806995451, 0.1073969566],
  [0.0883024619, 0.2817188376, 0.6299787005],
];

/** Ottosson's L'M'S' to OKLab matrix. */
const M2 = [
  [0.2104542553, 0.793617785, -0.0040720468],
  [1.9779984951, -2.428592205, 0.4505937099],
  [0.0259040371, 0.7827717662, -0.808675766],
];

/** OKLab to L'M'S'. */
const M2_INV = [
  [1, 0.3963377774, 0.2158037573],
  [1, -0.1055613458, -0.0638541728],
  [1, -0.0894841775, -1.291485548],
];

/** LMS to linear sRGB. */
const M1_INV = [
  [4.0767416621, -3.3077115913, 0.2309699292],
  [-1.2684380046, 2.6097574011, -0.3413193965],
  [-0.0041960863, -0.7034186147, 1.707614701],
];

/** IEC 61966-2-1 sRGB transfer function, encoded value 0-1 to linear light. */
export function srgbToLinear(channel) {
  return channel <= 0.04045 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
}

/** The inverse: linear light to an encoded sRGB value 0-1. */
export function linearToSrgb(channel) {
  return channel <= 0.0031308 ? channel * 12.92 : 1.055 * Math.pow(channel, 1 / 2.4) - 0.055;
}

/** Parse "#rgb", "#rrggbb", "#rrggbbaa" or "rgb(r g b)" into channels 0-255. */
export function parseColor(input) {
  if (typeof input !== "string") return null;
  const text = input.trim().toLowerCase();

  const hexMatch = /^#?([0-9a-f]{3,8})$/.exec(text);
  if (hexMatch) {
    const hex = hexMatch[1];
    if (hex.length === 3 || hex.length === 4) {
      return {
        r: parseInt(hex[0] + hex[0], 16),
        g: parseInt(hex[1] + hex[1], 16),
        b: parseInt(hex[2] + hex[2], 16),
      };
    }
    if (hex.length === 6 || hex.length === 8) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
      };
    }
    return null;
  }

  const rgbMatch = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/.exec(text);
  if (rgbMatch) {
    const channels = [rgbMatch[1], rgbMatch[2], rgbMatch[3]].map(Number);
    if (channels.some((c) => !Number.isFinite(c) || c < 0 || c > 255)) return null;
    return { r: channels[0], g: channels[1], b: channels[2] };
  }

  return null;
}

/** Render channels 0-255 as "#rrggbb". */
export function rgbToHex({ r, g, b }) {
  const to = (v) =>
    Math.max(0, Math.min(255, Math.round(v)))
      .toString(16)
      .padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

/** sRGB 0-255 to OKLab. */
export function rgbToOklab({ r, g, b }) {
  const lr = srgbToLinear(r / 255);
  const lg = srgbToLinear(g / 255);
  const lb = srgbToLinear(b / 255);
  const l = Math.cbrt(M1[0][0] * lr + M1[0][1] * lg + M1[0][2] * lb);
  const m = Math.cbrt(M1[1][0] * lr + M1[1][1] * lg + M1[1][2] * lb);
  const s = Math.cbrt(M1[2][0] * lr + M1[2][1] * lg + M1[2][2] * lb);
  return {
    L: M2[0][0] * l + M2[0][1] * m + M2[0][2] * s,
    a: M2[1][0] * l + M2[1][1] * m + M2[1][2] * s,
    b: M2[2][0] * l + M2[2][1] * m + M2[2][2] * s,
  };
}

/** OKLab to linear-light sRGB, before clipping — channels may fall outside 0-1. */
function oklabToLinearRgb({ L, a, b }) {
  const l_ = M2_INV[0][0] * L + M2_INV[0][1] * a + M2_INV[0][2] * b;
  const m_ = M2_INV[1][0] * L + M2_INV[1][1] * a + M2_INV[1][2] * b;
  const s_ = M2_INV[2][0] * L + M2_INV[2][1] * a + M2_INV[2][2] * b;
  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;
  return {
    r: M1_INV[0][0] * l + M1_INV[0][1] * m + M1_INV[0][2] * s,
    g: M1_INV[1][0] * l + M1_INV[1][1] * m + M1_INV[1][2] * s,
    b: M1_INV[2][0] * l + M1_INV[2][1] * m + M1_INV[2][2] * s,
  };
}

/** OKLCH (L 0-1, C, H degrees) to sRGB 0-255, plus whether it needed clipping. */
export function oklchToRgb({ L, C, H }) {
  const radians = (H * Math.PI) / 180;
  const lab = { L, a: C * Math.cos(radians), b: C * Math.sin(radians) };
  const linear = oklabToLinearRgb(lab);
  const inGamut =
    linear.r >= -1e-4 &&
    linear.r <= 1 + 1e-4 &&
    linear.g >= -1e-4 &&
    linear.g <= 1 + 1e-4 &&
    linear.b >= -1e-4 &&
    linear.b <= 1 + 1e-4;
  return {
    r: Math.max(0, Math.min(1, linearToSrgb(Math.max(0, Math.min(1, linear.r))))) * 255,
    g: Math.max(0, Math.min(1, linearToSrgb(Math.max(0, Math.min(1, linear.g))))) * 255,
    b: Math.max(0, Math.min(1, linearToSrgb(Math.max(0, Math.min(1, linear.b))))) * 255,
    inGamut,
  };
}

/** sRGB 0-255 to OKLCH. */
export function rgbToOklch(rgb) {
  const lab = rgbToOklab(rgb);
  const C = Math.sqrt(lab.a * lab.a + lab.b * lab.b);
  let H = (Math.atan2(lab.b, lab.a) * 180) / Math.PI;
  if (H < 0) H += 360;
  // A neutral grey has no meaningful hue; report 0 rather than atan2 noise.
  if (C < 1e-6) H = 0;
  return { L: lab.L, C, H };
}

/** How many binary-search halvings the gamut clipper uses. 2^-20 is well below 1/255. */
export const GAMUT_SEARCH_STEPS = 20;

/**
 * Reduce chroma until the colour fits inside sRGB, keeping lightness and hue.
 * @returns {{L:number, C:number, H:number, clipped:boolean}}
 */
export function clampToGamut({ L, C, H }) {
  if (oklchToRgb({ L, C, H }).inGamut) return { L, C, H, clipped: false };
  let low = 0;
  let high = C;
  for (let i = 0; i < GAMUT_SEARCH_STEPS; i += 1) {
    const mid = (low + high) / 2;
    if (oklchToRgb({ L, C: mid, H }).inGamut) low = mid;
    else high = mid;
  }
  return { L, C: low, H, clipped: true };
}

/** WCAG 2.1 relative luminance of an sRGB colour. */
export function relativeLuminance({ r, g, b }) {
  const lr = srgbToLinear(r / 255);
  const lg = srgbToLinear(g / 255);
  const lb = srgbToLinear(b / 255);
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}

/** WCAG 2.1 contrast ratio between two sRGB colours, from 1 to 21. */
export function contrastRatio(a, b) {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

const WHITE = { r: 255, g: 255, b: 255 };
const BLACK = { r: 0, g: 0, b: 0 };

/** Format an OKLCH triple as a CSS oklch() value. */
export function formatOklch({ L, C, H }) {
  return `oklch(${L.toFixed(3)} ${C.toFixed(3)} ${H.toFixed(1)})`;
}

/**
 * Build the whole scale.
 *
 * @param {object} input
 * @param {string} input.color   base colour as hex or rgb()
 * @param {number} [input.anchor] which step keeps the base chroma, default 500
 * @param {string} [input.name]  the colour's name in the generated CSS, default "brand"
 * @returns {object} { name, base, anchor, steps: [...] } or { error }
 */
export function generateScale(input = {}) {
  const rgb = parseColor(input.color);
  if (!rgb)
    return { error: "Enter a colour as a hex value like #3b82f6, or as rgb(59 130 246)." };

  const anchor = input.anchor === undefined ? 500 : Number(input.anchor);
  if (!STEPS.includes(anchor))
    return { error: `The anchor step must be one of ${STEPS.join(", ")}.` };

  const rawName = typeof input.name === "string" ? input.name.trim() : "";
  const name = /^[a-z][a-z0-9-]*$/.test(rawName) ? rawName : "brand";

  const base = rgbToOklch(rgb);
  const chromaScale = base.C / CHROMA_CURVE[anchor];

  const steps = STEPS.map((step) => {
    const target = {
      L: TARGET_LIGHTNESS[step],
      C: CHROMA_CURVE[step] * chromaScale,
      H: base.H,
    };
    const fitted = clampToGamut(target);
    const out = oklchToRgb(fitted);
    const colour = { r: out.r, g: out.g, b: out.b };
    const onWhite = contrastRatio(colour, WHITE);
    const onBlack = contrastRatio(colour, BLACK);
    const bestText = onWhite >= onBlack ? "white" : "black";
    const bestRatio = Math.max(onWhite, onBlack);
    return {
      step,
      hex: rgbToHex(colour),
      rgb: {
        r: Math.round(colour.r),
        g: Math.round(colour.g),
        b: Math.round(colour.b),
      },
      oklch: formatOklch(fitted),
      L: fitted.L,
      C: fitted.C,
      H: fitted.H,
      clipped: fitted.clipped,
      contrastWhite: onWhite,
      contrastBlack: onBlack,
      textColor: bestText,
      textContrast: bestRatio,
      passesAA: bestRatio >= WCAG_AA_NORMAL,
      passesAALarge: bestRatio >= WCAG_AA_LARGE,
      passesAAA: bestRatio >= WCAG_AAA_NORMAL,
      isAnchor: step === anchor,
    };
  });

  return {
    name,
    anchor,
    baseHex: rgbToHex(rgb),
    baseOklch: formatOklch(base),
    baseL: base.L,
    baseC: base.C,
    baseH: base.H,
    clippedSteps: steps.filter((s) => s.clipped).length,
    steps,
  };
}

/** Tailwind v4 @theme block, which is how v4 registers custom colours. */
export function toThemeCss(scale, { useOklch = true } = {}) {
  if (!scale || scale.error) return "";
  const lines = ["@theme {"];
  for (const step of scale.steps) {
    lines.push(`  --color-${scale.name}-${step.step}: ${useOklch ? step.oklch : step.hex};`);
  }
  lines.push("}");
  return lines.join("\n");
}

/** Plain custom properties, for projects not on Tailwind v4. */
export function toCssVariables(scale, { useOklch = false } = {}) {
  if (!scale || scale.error) return "";
  const lines = [":root {"];
  for (const step of scale.steps) {
    lines.push(`  --${scale.name}-${step.step}: ${useOklch ? step.oklch : step.hex};`);
  }
  lines.push("}");
  return lines.join("\n");
}

/** A tailwind.config.js colour object, for Tailwind v3. */
export function toTailwindConfig(scale) {
  if (!scale || scale.error) return "";
  const entries = scale.steps.map((s) => `        ${s.step}: "${s.hex}",`);
  return [
    "module.exports = {",
    "  theme: {",
    "    extend: {",
    "      colors: {",
    `        ${scale.name}: {`,
    ...entries.map((line) => `  ${line}`),
    "        },",
    "      },",
    "    },",
    "  },",
    "};",
  ].join("\n");
}

/** The scale as JSON, step to hex. */
export function toJson(scale) {
  if (!scale || scale.error) return "";
  const object = {};
  for (const step of scale.steps) object[step.step] = step.hex;
  return JSON.stringify({ [scale.name]: object }, null, 2);
}

/** The named output formats the UI offers. */
export const OUTPUT_FORMATS = [
  { id: "theme-oklch", label: "Tailwind v4 @theme (oklch)" },
  { id: "theme-hex", label: "Tailwind v4 @theme (hex)" },
  { id: "css-vars", label: "CSS custom properties" },
  { id: "config", label: "tailwind.config.js (v3)" },
  { id: "json", label: "JSON" },
];

/** Render the scale in one of OUTPUT_FORMATS. */
export function renderScale(scale, formatId) {
  switch (formatId) {
    case "theme-oklch":
      return toThemeCss(scale, { useOklch: true });
    case "theme-hex":
      return toThemeCss(scale, { useOklch: false });
    case "css-vars":
      return toCssVariables(scale, { useOklch: false });
    case "config":
      return toTailwindConfig(scale);
    case "json":
      return toJson(scale);
    default:
      return toThemeCss(scale, { useOklch: true });
  }
}
