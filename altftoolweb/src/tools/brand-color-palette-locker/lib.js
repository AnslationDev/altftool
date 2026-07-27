/**
 * Brand Colour Palette Locker — colour conversion, tint/shade ramps, contrast
 * and print ink coverage. Pure module: no React, no DOM, no clock.
 *
 * Every hex string in this file is DATA (a colour value), never a style.
 */

/** Default brand seeds, replaced by whatever the user locks in. */
export const DEFAULT_SEEDS = [
  { id: "primary", role: "Primary", hex: "#14B8A6" },
  { id: "secondary", role: "Secondary", hex: "#22D3EE" },
  { id: "accent", role: "Accent", hex: "#F59E0B" },
];

/** Starting value for a newly added swatch (a neutral slate). */
export const NEW_SEED_HEX = "#64748B";

/** Ramp stops, following the convention used by most design-token systems. */
export const RAMP_STOPS = [
  { key: 50, mix: 0.92, kind: "tint" },
  { key: 100, mix: 0.84, kind: "tint" },
  { key: 200, mix: 0.68, kind: "tint" },
  { key: 300, mix: 0.5, kind: "tint" },
  { key: 400, mix: 0.26, kind: "tint" },
  { key: 500, mix: 0, kind: "base" },
  { key: 600, mix: 0.14, kind: "shade" },
  { key: 700, mix: 0.3, kind: "shade" },
  { key: 800, mix: 0.46, kind: "shade" },
  { key: 900, mix: 0.62, kind: "shade" },
];

/** WCAG 2.2 contrast thresholds. */
export const AA_NORMAL = 4.5;
export const AA_LARGE = 3;
export const AAA_NORMAL = 7;

/**
 * Total Area Coverage limits used by commercial printers: sheet-fed coated
 * work is normally kept at or below 300%, and web offset on uncoated stock
 * nearer 240%-260%. Above the limit ink does not dry and offsets onto the
 * next sheet.
 */
export const TAC_LIMIT_COATED = 300;
export const TAC_LIMIT_UNCOATED = 260;

const clamp255 = (value) => Math.min(255, Math.max(0, Math.round(value)));
const isByte = (value) => Number.isFinite(value) && value >= 0 && value <= 255;

/** Parse #rgb, #rrggbb (with or without the hash) into channel values. */
export function hexToRgb(hex) {
  if (typeof hex !== "string") return { error: "Enter a hex colour such as #14B8A6." };
  const raw = hex.trim().replace(/^#/, "");
  if (!/^[0-9a-fA-F]{3}$/.test(raw) && !/^[0-9a-fA-F]{6}$/.test(raw)) {
    return { error: `"${hex}" is not a valid hex colour. Use three or six hex digits, such as #14B8A6.` };
  }
  const full = raw.length === 3 ? raw.split("").map((c) => c + c).join("") : raw;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

export function rgbToHex({ r, g, b }) {
  if (![r, g, b].every(isByte)) return { error: "Each channel must be between 0 and 255." };
  const part = (value) => clamp255(value).toString(16).padStart(2, "0");
  return { hex: `#${part(r)}${part(g)}${part(b)}`.toUpperCase() };
}

/** sRGB to HSL. Hue in degrees, saturation and lightness as percentages. */
export function rgbToHsl({ r, g, b }) {
  if (![r, g, b].every(isByte)) return { error: "Each channel must be between 0 and 255." };
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;

  if (d === 0) return { h: 0, s: 0, l: Math.round(l * 1000) / 10 };

  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else h = ((rn - gn) / d + 4) / 6;

  return {
    h: Math.round(h * 3600) / 10,
    s: Math.round(s * 1000) / 10,
    l: Math.round(l * 1000) / 10,
  };
}

/**
 * sRGB to CMYK using the standard naive conversion. Real separations depend on
 * an ICC profile and the press, so treat these as a starting point and let the
 * printer do the final conversion.
 */
export function rgbToCmyk({ r, g, b }) {
  if (![r, g, b].every(isByte)) return { error: "Each channel must be between 0 and 255." };
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const k = 1 - Math.max(rn, gn, bn);

  if (k === 1) return { c: 0, m: 0, y: 0, k: 100, tac: 100 };

  const c = (1 - rn - k) / (1 - k);
  const m = (1 - gn - k) / (1 - k);
  const y = (1 - bn - k) / (1 - k);
  const round = (value) => Math.round(Math.max(0, Math.min(1, value)) * 1000) / 10;

  const out = { c: round(c), m: round(m), y: round(y), k: round(k) };
  return { ...out, tac: Math.round((out.c + out.m + out.y + out.k) * 10) / 10 };
}

/** WCAG relative luminance of an sRGB colour. */
export function relativeLuminance({ r, g, b }) {
  if (![r, g, b].every(isByte)) return { error: "Each channel must be between 0 and 255." };
  const channel = (value) => {
    const v = value / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return { luminance: 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b) };
}

/** WCAG contrast ratio between two colours, from 1 to 21. */
export function contrastRatio(hexA, hexB) {
  const a = hexToRgb(hexA);
  if (a.error) return a;
  const b = hexToRgb(hexB);
  if (b.error) return b;
  const la = relativeLuminance(a).luminance;
  const lb = relativeLuminance(b).luminance;
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return { ratio: Math.round(((lighter + 0.05) / (darker + 0.05)) * 100) / 100 };
}

export const WHITE = "#FFFFFF";
export const BLACK = "#000000";

/** Which of white or black text is more readable on this background? */
export function bestTextOn(hex) {
  const onWhite = contrastRatio(hex, WHITE);
  if (onWhite.error) return onWhite;
  const onBlack = contrastRatio(hex, BLACK);
  if (onBlack.error) return onBlack;
  const useWhite = onWhite.ratio >= onBlack.ratio;
  const ratio = useWhite ? onWhite.ratio : onBlack.ratio;
  return {
    text: useWhite ? WHITE : BLACK,
    ratio,
    passesNormal: ratio >= AA_NORMAL,
    passesLarge: ratio >= AA_LARGE,
    passesAaa: ratio >= AAA_NORMAL,
  };
}

/** Mix toward white (tint) or toward black (shade) by a 0-1 amount. */
export function mixColor(hex, amount, toward = "white") {
  const rgb = hexToRgb(hex);
  if (rgb.error) return rgb;
  if (!Number.isFinite(amount) || amount < 0 || amount > 1) {
    return { error: "Mix amount must be between 0 and 1." };
  }
  const target = toward === "black" ? 0 : 255;
  const blend = (channel) => channel + (target - channel) * amount;
  return rgbToHex({ r: blend(rgb.r), g: blend(rgb.g), b: blend(rgb.b) });
}

/** Full 50-900 ramp for one brand colour, with contrast and CMYK per stop. */
export function buildRamp(hex) {
  const base = hexToRgb(hex);
  if (base.error) return base;

  const stops = [];
  for (const stop of RAMP_STOPS) {
    let stopHex = hex.trim().toUpperCase();
    if (!stopHex.startsWith("#")) stopHex = `#${stopHex}`;
    if (stop.kind !== "base") {
      const mixed = mixColor(hex, stop.mix, stop.kind === "tint" ? "white" : "black");
      if (mixed.error) return mixed;
      stopHex = mixed.hex;
    } else {
      const normalised = rgbToHex(base);
      if (normalised.error) return normalised;
      stopHex = normalised.hex;
    }

    const rgb = hexToRgb(stopHex);
    const text = bestTextOn(stopHex);
    if (text.error) return text;
    stops.push({
      key: stop.key,
      kind: stop.kind,
      hex: stopHex,
      rgb,
      hsl: rgbToHsl(rgb),
      cmyk: rgbToCmyk(rgb),
      text,
    });
  }
  return { stops };
}

/** Report for one locked brand colour. */
export function analyseColor({ hex, role = "Brand", stock = "coated" }) {
  const rgb = hexToRgb(hex);
  if (rgb.error) return rgb;
  const normalised = rgbToHex(rgb);
  if (normalised.error) return normalised;

  const cmyk = rgbToCmyk(rgb);
  const tacLimit = stock === "uncoated" ? TAC_LIMIT_UNCOATED : TAC_LIMIT_COATED;
  const ramp = buildRamp(normalised.hex);
  if (ramp.error) return ramp;

  return {
    role,
    hex: normalised.hex,
    rgb,
    hsl: rgbToHsl(rgb),
    cmyk,
    tacLimit,
    tacOverLimit: cmyk.tac > tacLimit,
    onWhite: contrastRatio(normalised.hex, WHITE).ratio,
    onBlack: contrastRatio(normalised.hex, BLACK).ratio,
    bestText: bestTextOn(normalised.hex),
    ramp: ramp.stops,
  };
}

/** Analyse the whole locked palette and cross-check the seeds against each other. */
export function buildPaletteReport({ seeds, stock = "coated" }) {
  if (!Array.isArray(seeds) || seeds.length === 0) {
    return { error: "Lock at least one brand colour." };
  }
  if (seeds.length > 8) return { error: "Keep a brand palette to eight core colours or fewer." };

  const colors = [];
  for (const seed of seeds) {
    const result = analyseColor({ hex: seed.hex, role: seed.role, stock });
    if (result.error) return { error: `${seed.role || "Colour"}: ${result.error}` };
    colors.push({ ...result, id: seed.id });
  }

  const pairs = [];
  for (let i = 0; i < colors.length; i += 1) {
    for (let j = i + 1; j < colors.length; j += 1) {
      const ratio = contrastRatio(colors[i].hex, colors[j].hex);
      if (ratio.error) return ratio;
      pairs.push({
        a: colors[i].role,
        b: colors[j].role,
        aHex: colors[i].hex,
        bHex: colors[j].hex,
        ratio: ratio.ratio,
        usableForText: ratio.ratio >= AA_NORMAL,
        distinguishable: ratio.ratio >= 1.5,
      });
    }
  }

  return {
    colors,
    pairs,
    overInkLimit: colors.filter((color) => color.tacOverLimit).length,
    lowContrastPairs: pairs.filter((pair) => !pair.distinguishable).length,
  };
}

/** CSS custom properties for the whole palette. */
export function buildCssTokens({ seeds, stock = "coated" }) {
  const report = buildPaletteReport({ seeds, stock });
  if (report.error) return report;

  const lines = [":root {"];
  for (const color of report.colors) {
    const slug = String(color.role || "brand")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    for (const stop of color.ramp) {
      lines.push(`  --${slug}-${stop.key}: ${stop.hex.toLowerCase()};`);
    }
  }
  lines.push("}");
  return { css: lines.join("\n") };
}
