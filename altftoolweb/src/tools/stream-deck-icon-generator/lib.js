/**
 * Control-surface (Stream Deck style) key icon generator.
 *
 * Facts encoded here:
 *  - A control-surface key bitmap is square. The native key bitmap on the common hardware is
 *    72 x 72 px, so a 144 px export is the 2x version and stays sharp when the software scales
 *    it. Larger exports (288 px) are 4x and useful as a master you can down-sample.
 *  - Colour maths follows WCAG 2.x: channels are converted from sRGB to linear light, relative
 *    luminance L = 0.2126R + 0.7152G + 0.0722B, and contrast ratio = (Llighter + 0.05) /
 *    (Ldarker + 0.05). The AA threshold for large text is 3:1 and for normal text 4.5:1.
 *  - Colours are handled in HSL so the palette can be generated arithmetically rather than
 *    stored as fixed literals.
 *
 * Pure module: no DOM, no React, no clock.
 */

/** Export sizes. `scale` is the multiple of the 72 px native key bitmap. */
export const KEY_SIZES = [
  { px: 72, scale: 1, label: "72 px — native key bitmap" },
  { px: 144, scale: 2, label: "144 px — 2x export (recommended)" },
  { px: 288, scale: 4, label: "288 px — 4x master" },
];

export const ICON_STYLES = {
  solid: { label: "Solid fill" },
  gradient: { label: "Vertical gradient" },
  outline: { label: "Dark with coloured ring" },
  band: { label: "Dark with coloured label band" },
};

export const LABEL_POSITIONS = {
  bottom: { label: "Label under the glyph" },
  none: { label: "Glyph only" },
  only: { label: "Label only, no glyph" },
};

/** Preset hues, spaced around the wheel so a deck built from them stays legible. */
export const HUE_PRESETS = [
  { name: "Teal", hue: 174 },
  { name: "Cyan", hue: 190 },
  { name: "Blue", hue: 217 },
  { name: "Violet", hue: 262 },
  { name: "Magenta", hue: 322 },
  { name: "Red", hue: 0 },
  { name: "Orange", hue: 28 },
  { name: "Amber", hue: 45 },
  { name: "Green", hue: 142 },
  { name: "Slate", hue: 215 },
];

/** WCAG 2.x AA thresholds. */
export const AA_LARGE_TEXT_RATIO = 3;
export const AA_NORMAL_TEXT_RATIO = 4.5;

const MAX_LABEL_CHARS = 12;
const MAX_GLYPH_CHARS = 3;
/** Below this width, a key label stops being readable on a physical 72 px key. */
const READABLE_LABEL_CHARS = 9;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/** HSL (h in degrees, s and l as percentages) to sRGB channels in the 0-1 range. */
export function hslToRgb(h, s, l) {
  const hue = ((h % 360) + 360) % 360;
  const sat = clamp(s, 0, 100) / 100;
  const lum = clamp(l, 0, 100) / 100;
  const c = (1 - Math.abs(2 * lum - 1)) * sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = lum - c / 2;
  let rgb;
  if (hue < 60) rgb = [c, x, 0];
  else if (hue < 120) rgb = [x, c, 0];
  else if (hue < 180) rgb = [0, c, x];
  else if (hue < 240) rgb = [0, x, c];
  else if (hue < 300) rgb = [x, 0, c];
  else rgb = [c, 0, x];
  return rgb.map((channel) => channel + m);
}

/** WCAG relative luminance from sRGB channels expressed 0-1. */
export function relativeLuminance([r, g, b]) {
  const linear = [r, g, b].map((channel) => {
    const value = clamp(channel, 0, 1);
    return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

/** WCAG contrast ratio between two sRGB colours expressed 0-1 per channel. Always >= 1. */
export function contrastRatio(rgbA, rgbB) {
  const a = relativeLuminance(rgbA);
  const b = relativeLuminance(rgbB);
  const lighter = Math.max(a, b);
  const darker = Math.min(a, b);
  return (lighter + 0.05) / (darker + 0.05);
}

export function hsl(h, s, l) {
  const hue = Math.round(((h % 360) + 360) % 360);
  return `hsl(${hue} ${Math.round(clamp(s, 0, 100))}% ${Math.round(clamp(l, 0, 100))}%)`;
}

export function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Initials from a label: first letter of up to two words, uppercased. */
export function initialsFrom(label) {
  const words = String(label ?? "")
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
  if (words.length === 0) return "";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

/**
 * Build the key icon as an SVG string.
 * Pure: same inputs always produce the same SVG.
 *
 * @returns {{error: string} | {svg: string, dataUri: string, size: number, background: string,
 *   accent: string, textColor: string, contrast: number, meetsAa: boolean, warnings: string[]}}
 */
export function buildKeyIcon(input = {}) {
  const size = Number(input.size);
  if (!Number.isFinite(size) || size < 16 || size > 1024) {
    return { error: "Icon size must be a whole number of pixels between 16 and 1024." };
  }

  const style = ICON_STYLES[String(input.style ?? "").trim()] ? String(input.style).trim() : "solid";
  const labelPosition = LABEL_POSITIONS[String(input.labelPosition ?? "").trim()]
    ? String(input.labelPosition).trim()
    : "bottom";

  const hue = Number(input.hue);
  const saturation = Number(input.saturation);
  const lightness = Number(input.lightness);
  if (![hue, saturation, lightness].every(Number.isFinite)) {
    return { error: "Hue, saturation and lightness must all be numbers." };
  }
  if (saturation < 0 || saturation > 100 || lightness < 0 || lightness > 100) {
    return { error: "Saturation and lightness are percentages between 0 and 100." };
  }

  const radiusPercent = Number.isFinite(Number(input.radiusPercent)) ? clamp(Number(input.radiusPercent), 0, 50) : 16;

  const label = String(input.label ?? "").replace(/\s+/g, " ").trim();
  const rawGlyph = String(input.glyph ?? "").trim();
  const glyph = (rawGlyph || initialsFrom(label)).slice(0, MAX_GLYPH_CHARS);

  if (labelPosition === "only" && !label) {
    return { error: "Label-only icons need a label. Type one, or switch to a glyph style." };
  }
  if (labelPosition !== "only" && !glyph && !label) {
    return { error: "Enter a label or a glyph so the key has something on it." };
  }
  if (label.length > MAX_LABEL_CHARS * 3) {
    return { error: `Labels longer than ${MAX_LABEL_CHARS * 3} characters will not fit on any key. Shorten it.` };
  }

  // Palette derived arithmetically from the chosen hue.
  const isDarkStyle = style === "outline" || style === "band";
  const surfaceLightness = isDarkStyle ? 12 : lightness;
  const surfaceSaturation = isDarkStyle ? Math.min(saturation, 30) : saturation;
  const background = hsl(hue, surfaceSaturation, surfaceLightness);
  const accent = hsl(hue, saturation, lightness);
  const gradientTop = hsl(hue, saturation, clamp(lightness + 12, 0, 100));
  const gradientBottom = hsl(hue, saturation, clamp(lightness - 12, 0, 100));

  // Choose the readable foreground by measuring both candidates against the surface.
  const surfaceRgb = hslToRgb(hue, surfaceSaturation, surfaceLightness);
  const whiteRatio = contrastRatio(surfaceRgb, [1, 1, 1]);
  const blackRatio = contrastRatio(surfaceRgb, [0, 0, 0]);
  const useWhite = whiteRatio >= blackRatio;
  const textColor = useWhite ? hsl(0, 0, 100) : hsl(hue, 20, 8);
  const contrast = useWhite ? whiteRatio : blackRatio;

  const radius = (radiusPercent / 100) * size;
  const glyphSize = labelPosition === "bottom" && label ? size * 0.38 : size * 0.5;
  const glyphY = labelPosition === "bottom" && label ? size * 0.46 : size * 0.58;
  const labelSize = size * (label.length > READABLE_LABEL_CHARS ? 0.13 : 0.155);
  const labelY = labelPosition === "only" ? size * 0.56 : size * 0.82;

  const defs =
    style === "gradient"
      ? `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${gradientTop}"/><stop offset="1" stop-color="${gradientBottom}"/></linearGradient></defs>`
      : "";
  const fill = style === "gradient" ? "url(#g)" : background;

  const layers = [
    `<rect x="0" y="0" width="${size}" height="${size}" rx="${radius.toFixed(2)}" fill="${fill}"/>`,
  ];
  if (style === "outline") {
    const inset = size * 0.06;
    layers.push(
      `<rect x="${inset.toFixed(2)}" y="${inset.toFixed(2)}" width="${(size - inset * 2).toFixed(2)}" height="${(size - inset * 2).toFixed(2)}" rx="${Math.max(0, radius - inset).toFixed(2)}" fill="none" stroke="${accent}" stroke-width="${(size * 0.045).toFixed(2)}"/>`,
    );
  }
  if (style === "band") {
    const bandHeight = size * 0.26;
    layers.push(
      `<rect x="0" y="${(size - bandHeight).toFixed(2)}" width="${size}" height="${bandHeight.toFixed(2)}" fill="${accent}"/>`,
    );
  }
  if (labelPosition !== "only" && glyph) {
    layers.push(
      `<text x="${(size / 2).toFixed(2)}" y="${glyphY.toFixed(2)}" font-family="Inter, Segoe UI, Helvetica, Arial, sans-serif" font-size="${glyphSize.toFixed(2)}" font-weight="700" text-anchor="middle" dominant-baseline="middle" fill="${textColor}">${escapeXml(glyph)}</text>`,
    );
  }
  if (labelPosition !== "none" && label) {
    const labelFill = style === "band" ? hsl(hue, 20, 8) : textColor;
    layers.push(
      `<text x="${(size / 2).toFixed(2)}" y="${labelY.toFixed(2)}" font-family="Inter, Segoe UI, Helvetica, Arial, sans-serif" font-size="${labelSize.toFixed(2)}" font-weight="600" letter-spacing="${(size * 0.004).toFixed(2)}" text-anchor="middle" dominant-baseline="middle" fill="${labelFill}">${escapeXml(label)}</text>`,
    );
  }

  const title = escapeXml(label || glyph || "key icon");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="${title}">${defs}${layers.join("")}</svg>`;

  const warnings = [];
  if (label.length > MAX_LABEL_CHARS) {
    warnings.push(
      `Labels over ${MAX_LABEL_CHARS} characters get squeezed on a 72 px key. "${label}" is ${label.length} characters — shorten it or use a glyph.`,
    );
  }
  if (contrast < AA_LARGE_TEXT_RATIO) {
    warnings.push(
      `Contrast is ${contrast.toFixed(2)}:1, below the WCAG AA large-text threshold of ${AA_LARGE_TEXT_RATIO}:1. Move lightness further from the middle of the range.`,
    );
  }
  if (size < 144) {
    warnings.push("Export at 144 px or larger so the icon stays sharp when the software scales it.");
  }
  if (radiusPercent > 30) {
    warnings.push("A corner radius above 30% eats into the usable area — most key art sits between 8% and 20%.");
  }

  return {
    svg,
    dataUri: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
    size,
    background,
    accent,
    textColor,
    contrast,
    meetsAa: contrast >= AA_LARGE_TEXT_RATIO,
    meetsAaNormal: contrast >= AA_NORMAL_TEXT_RATIO,
    glyph,
    label,
    warnings,
  };
}
