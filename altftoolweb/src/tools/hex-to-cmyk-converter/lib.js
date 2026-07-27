/**
 * Hex to CMYK conversion with total ink coverage.
 * Pure module: no DOM, no React, no clock.
 *
 * The conversion is the standard device-independent (naive) formula used by
 * every quick converter:
 *   K = 1 - max(R', G', B')
 *   C = (1 - R' - K) / (1 - K)   (and likewise for M from G', Y from B')
 * with R' = R/255. When K = 1 the colour is pure black and C = M = Y = 0.
 * This ignores ICC profiles, GCR/UCR and dot gain, so it is a starting point
 * rather than a press-accurate separation.
 */

/**
 * Total area coverage (TAC / TIC) limits for common print conditions, as a
 * percentage sum of C + M + Y + K.
 *  - GRACoL 2006 coated #1 specifies 320%.
 *  - SWOP web offset coated #3 specifies 300%.
 *  - PSO uncoated (FOGRA47) specifies 300%.
 *  - ISOnewspaper26v4 for newsprint specifies 240%.
 */
export const INK_LIMITS = {
  gracol: { id: "gracol", label: "Coated sheetfed offset (GRACoL 2006 #1)", limit: 320 },
  swop: { id: "swop", label: "Coated web offset (SWOP #3)", limit: 300 },
  uncoated: { id: "uncoated", label: "Uncoated offset (PSO / FOGRA47)", limit: 300 },
  newsprint: { id: "newsprint", label: "Newsprint (ISOnewspaper26v4)", limit: 240 },
};

/** The naive formula can never exceed this sum. */
export const MAX_NAIVE_TIC = 300;

/** Registration black — all four plates at 100% — is 400% and must never be
 *  used for artwork, only for crop and registration marks. */
export const REGISTRATION_TIC = 400;

const clamp255 = (n) => Math.min(255, Math.max(0, n));
const round = (n) => Math.round(n);
const round2 = (n) => Math.round(n * 100) / 100;

/**
 * Parse a hex colour. Accepts 3, 4, 6 or 8 hex digits with or without a
 * leading hash. Alpha is parsed but ignored by the CMYK conversion because
 * ink has no alpha channel.
 */
export function parseHex(input) {
  if (typeof input !== "string") return { error: "Enter a hex colour." };
  const raw = input.trim().replace(/^#/, "");
  if (raw.length === 0) return { error: "Enter a hex colour." };
  if (!/^[0-9a-fA-F]+$/.test(raw)) {
    return { error: "Hex colours use only the characters 0-9 and A-F." };
  }
  if (![3, 4, 6, 8].includes(raw.length)) {
    return { error: "Use 3, 4, 6 or 8 hex digits, for example 1AB or 11AABB." };
  }

  const expand = (chunk) => parseInt(chunk.length === 1 ? chunk + chunk : chunk, 16);
  const step = raw.length <= 4 ? 1 : 2;
  const parts = [];
  for (let i = 0; i < raw.length; i += step) {
    parts.push(expand(raw.slice(i, i + step)));
  }

  const [r, g, b] = parts;
  const alpha = parts.length === 4 ? round2(parts[3] / 255) : 1;
  const normalised = [r, g, b]
    .map((value) => clamp255(value).toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();

  return { r: clamp255(r), g: clamp255(g), b: clamp255(b), alpha, hex: normalised, hadAlpha: parts.length === 4 };
}

/** RGB (0-255) to CMYK percentages. */
export function rgbToCmyk({ r, g, b }) {
  const rr = clamp255(Number(r)) / 255;
  const gg = clamp255(Number(g)) / 255;
  const bb = clamp255(Number(b)) / 255;
  if (![rr, gg, bb].every(Number.isFinite)) {
    return { c: 0, m: 0, y: 0, k: 0 };
  }
  const max = Math.max(rr, gg, bb);
  const k = 1 - max;
  if (max <= 0) {
    // Pure black: all colour comes from the black plate.
    return { c: 0, m: 0, y: 0, k: 100 };
  }
  return {
    c: ((max - rr) / max) * 100,
    m: ((max - gg) / max) * 100,
    y: ((max - bb) / max) * 100,
    k: k * 100,
  };
}

/** CMYK percentages back to RGB (0-255), the exact inverse of rgbToCmyk. */
export function cmykToRgb({ c, m, y, k }) {
  const cc = Math.min(100, Math.max(0, Number(c) || 0)) / 100;
  const mm = Math.min(100, Math.max(0, Number(m) || 0)) / 100;
  const yy = Math.min(100, Math.max(0, Number(y) || 0)) / 100;
  const kk = Math.min(100, Math.max(0, Number(k) || 0)) / 100;
  return {
    r: round(255 * (1 - cc) * (1 - kk)),
    g: round(255 * (1 - mm) * (1 - kk)),
    b: round(255 * (1 - yy) * (1 - kk)),
  };
}

/** RGB (0-255) to HSL, useful for describing the colour alongside the inks. */
export function rgbToHsl({ r, g, b }) {
  const rr = clamp255(Number(r)) / 255;
  const gg = clamp255(Number(g)) / 255;
  const bb = clamp255(Number(b)) / 255;
  const max = Math.max(rr, gg, bb);
  const min = Math.min(rr, gg, bb);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l: round(l * 100) };
  const s = d / (1 - Math.abs(2 * l - 1));
  let h;
  if (max === rr) h = ((gg - bb) / d) % 6;
  else if (max === gg) h = (bb - rr) / d + 2;
  else h = (rr - gg) / d + 4;
  h *= 60;
  if (h < 0) h += 360;
  return { h: round(h), s: round(s * 100), l: round(l * 100) };
}

/**
 * Full conversion result for one hex value.
 */
export function convertHexToCmyk(input, inkLimitId = "gracol") {
  const parsed = parseHex(input);
  if (parsed.error) return { error: parsed.error };

  const exact = rgbToCmyk(parsed);
  const c = round(exact.c);
  const m = round(exact.m);
  const y = round(exact.y);
  const k = round(exact.k);

  // Printers type whole percentages, so the coverage a press actually sees is
  // the sum of the rounded plate values.
  const tic = c + m + y + k;
  const ticExact = round2(exact.c + exact.m + exact.y + exact.k);

  const profile = INK_LIMITS[inkLimitId] || INK_LIMITS.gracol;
  const headroom = profile.limit - tic;

  return {
    hex: parsed.hex,
    r: parsed.r,
    g: parsed.g,
    b: parsed.b,
    alpha: parsed.alpha,
    hadAlpha: parsed.hadAlpha,
    hsl: rgbToHsl(parsed),
    c,
    m,
    y,
    k,
    exact: {
      c: round2(exact.c),
      m: round2(exact.m),
      y: round2(exact.y),
      k: round2(exact.k),
    },
    tic,
    ticExact,
    roundTrip: cmykToRgb({ c, m, y, k }),
    profileLabel: profile.label,
    profileLimit: profile.limit,
    headroom,
    withinLimit: headroom >= 0,
  };
}

/** Copy-friendly summary. */
export function formatConversionText(result) {
  if (!result || result.error) return "";
  const lines = [
    `Hex #${result.hex}`,
    `RGB ${result.r}, ${result.g}, ${result.b}`,
    `HSL ${result.hsl.h}°, ${result.hsl.s}%, ${result.hsl.l}%`,
    `CMYK ${result.c}, ${result.m}, ${result.y}, ${result.k}`,
    `Total ink coverage ${result.tic}%`,
    `${result.profileLabel} limit ${result.profileLimit}% — ${result.withinLimit ? `${result.headroom}% headroom` : `${Math.abs(result.headroom)}% over`}`,
  ];
  if (result.hadAlpha) lines.push("Alpha was ignored: ink has no alpha channel.");
  return lines.join("\n");
}
