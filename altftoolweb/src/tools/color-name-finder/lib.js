/**
 * Colour name finder — nearest CSS colour keyword and plain-English term.
 * Pure module: no DOM, no React, no clock.
 *
 * Distance is measured with CIEDE2000 in CIE L*a*b* (D65) rather than a plain
 * RGB distance, because equal RGB steps are not equal perceptual steps.
 */

/**
 * The CSS Color Module Level 4 named colours, packed as "name,r,g,b".
 * Duplicate British spellings (grey/gray) and the aliases aqua/cyan and
 * fuchsia/magenta are represented once each.
 */
const CSS_COLOR_DATA = [
  "aliceblue,240,248,255",
  "antiquewhite,250,235,215",
  "aqua,0,255,255",
  "aquamarine,127,255,212",
  "azure,240,255,255",
  "beige,245,245,220",
  "bisque,255,228,196",
  "black,0,0,0",
  "blanchedalmond,255,235,205",
  "blue,0,0,255",
  "blueviolet,138,43,226",
  "brown,165,42,42",
  "burlywood,222,184,135",
  "cadetblue,95,158,160",
  "chartreuse,127,255,0",
  "chocolate,210,105,30",
  "coral,255,127,80",
  "cornflowerblue,100,149,237",
  "cornsilk,255,248,220",
  "crimson,220,20,60",
  "darkblue,0,0,139",
  "darkcyan,0,139,139",
  "darkgoldenrod,184,134,11",
  "darkgray,169,169,169",
  "darkgreen,0,100,0",
  "darkkhaki,189,183,107",
  "darkmagenta,139,0,139",
  "darkolivegreen,85,107,47",
  "darkorange,255,140,0",
  "darkorchid,153,50,204",
  "darkred,139,0,0",
  "darksalmon,233,150,122",
  "darkseagreen,143,188,143",
  "darkslateblue,72,61,139",
  "darkslategray,47,79,79",
  "darkturquoise,0,206,209",
  "darkviolet,148,0,211",
  "deeppink,255,20,147",
  "deepskyblue,0,191,255",
  "dimgray,105,105,105",
  "dodgerblue,30,144,255",
  "firebrick,178,34,34",
  "floralwhite,255,250,240",
  "forestgreen,34,139,34",
  "gainsboro,220,220,220",
  "ghostwhite,248,248,255",
  "gold,255,215,0",
  "goldenrod,218,165,32",
  "gray,128,128,128",
  "green,0,128,0",
  "greenyellow,173,255,47",
  "honeydew,240,255,240",
  "hotpink,255,105,180",
  "indianred,205,92,92",
  "indigo,75,0,130",
  "ivory,255,255,240",
  "khaki,240,230,140",
  "lavender,230,230,250",
  "lavenderblush,255,240,245",
  "lawngreen,124,252,0",
  "lemonchiffon,255,250,205",
  "lightblue,173,216,230",
  "lightcoral,240,128,128",
  "lightcyan,224,255,255",
  "lightgoldenrodyellow,250,250,210",
  "lightgray,211,211,211",
  "lightgreen,144,238,144",
  "lightpink,255,182,193",
  "lightsalmon,255,160,122",
  "lightseagreen,32,178,170",
  "lightskyblue,135,206,250",
  "lightslategray,119,136,153",
  "lightsteelblue,176,196,222",
  "lightyellow,255,255,224",
  "lime,0,255,0",
  "limegreen,50,205,50",
  "linen,250,240,230",
  "magenta,255,0,255",
  "maroon,128,0,0",
  "mediumaquamarine,102,205,170",
  "mediumblue,0,0,205",
  "mediumorchid,186,85,211",
  "mediumpurple,147,112,219",
  "mediumseagreen,60,179,113",
  "mediumslateblue,123,104,238",
  "mediumspringgreen,0,250,154",
  "mediumturquoise,72,209,204",
  "mediumvioletred,199,21,133",
  "midnightblue,25,25,112",
  "mintcream,245,255,250",
  "mistyrose,255,228,225",
  "moccasin,255,228,181",
  "navajowhite,255,222,173",
  "navy,0,0,128",
  "oldlace,253,245,230",
  "olive,128,128,0",
  "olivedrab,107,142,35",
  "orange,255,165,0",
  "orangered,255,69,0",
  "orchid,218,112,214",
  "palegoldenrod,238,232,170",
  "palegreen,152,251,152",
  "paleturquoise,175,238,238",
  "palevioletred,219,112,147",
  "papayawhip,255,239,213",
  "peachpuff,255,218,185",
  "peru,205,133,63",
  "pink,255,192,203",
  "plum,221,160,221",
  "powderblue,176,224,230",
  "purple,128,0,128",
  "rebeccapurple,102,51,153",
  "red,255,0,0",
  "rosybrown,188,143,143",
  "royalblue,65,105,225",
  "saddlebrown,139,69,19",
  "salmon,250,128,114",
  "sandybrown,244,164,96",
  "seagreen,46,139,87",
  "seashell,255,245,238",
  "sienna,160,82,45",
  "silver,192,192,192",
  "skyblue,135,206,235",
  "slateblue,106,90,205",
  "slategray,112,128,144",
  "snow,255,250,250",
  "springgreen,0,255,127",
  "steelblue,70,130,180",
  "tan,210,180,140",
  "teal,0,128,128",
  "thistle,216,191,216",
  "tomato,255,99,71",
  "turquoise,64,224,208",
  "violet,238,130,238",
  "wheat,245,222,179",
  "white,255,255,255",
  "whitesmoke,245,245,245",
  "yellow,255,255,0",
  "yellowgreen,154,205,50",
];

export const CSS_COLORS = CSS_COLOR_DATA.map((row) => {
  const [name, r, g, b] = row.split(",");
  return { name, r: Number(r), g: Number(g), b: Number(b) };
});

/**
 * The eleven basic colour terms identified by Berlin and Kay, with a
 * representative sRGB value for each.
 */
export const BASIC_TERMS = [
  { name: "black", r: 0, g: 0, b: 0 },
  { name: "white", r: 255, g: 255, b: 255 },
  { name: "grey", r: 128, g: 128, b: 128 },
  { name: "red", r: 255, g: 0, b: 0 },
  { name: "green", r: 0, g: 128, b: 0 },
  { name: "yellow", r: 255, g: 255, b: 0 },
  { name: "blue", r: 0, g: 0, b: 255 },
  { name: "brown", r: 165, g: 42, b: 42 },
  { name: "orange", r: 255, g: 165, b: 0 },
  { name: "pink", r: 255, g: 192, b: 203 },
  { name: "purple", r: 128, g: 0, b: 128 },
];

/**
 * Above this HSL saturation a colour reads as chromatic, so the achromatic
 * basic terms (black, white, grey) are excluded from the basic-term match.
 * Without this, CIEDE2000's lightness weighting can pull a mid-lightness
 * saturated colour towards grey.
 */
export const CHROMATIC_SATURATION_FLOOR = 15;

const ACHROMATIC_TERMS = ["black", "white", "grey"];

/** Hue sectors in degrees for the descriptive name. */
export const HUE_FAMILIES = [
  { max: 14, name: "red" },
  { max: 44, name: "orange" },
  { max: 65, name: "yellow" },
  { max: 95, name: "yellow-green" },
  { max: 155, name: "green" },
  { max: 185, name: "teal" },
  { max: 200, name: "cyan" },
  { max: 240, name: "blue" },
  { max: 275, name: "indigo" },
  { max: 315, name: "purple" },
  { max: 345, name: "pink" },
  { max: 360, name: "red" },
];

/** CIE standard illuminant D65 tristimulus values for a 2° observer. */
const D65 = { x: 0.95047, y: 1.0, z: 1.08883 };

/** CIE L*a*b* uses the break point (6/29)^3 in its transfer function. */
const LAB_EPSILON = (6 / 29) ** 3;
const LAB_KAPPA = 3 * (6 / 29) ** 2;

const clamp255 = (n) => Math.min(255, Math.max(0, n));
const round2 = (n) => Math.round(n * 100) / 100;
const deg = (rad) => (rad * 180) / Math.PI;
const rad = (d) => (d * Math.PI) / 180;

/** sRGB channel (0-1) to linear light. IEC 61966-2-1 transfer function. */
export function srgbToLinear(channel) {
  const c = Math.min(1, Math.max(0, Number(channel) || 0));
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** WCAG 2.x relative luminance of an sRGB colour. */
export function relativeLuminance({ r, g, b }) {
  const rl = srgbToLinear(clamp255(Number(r) || 0) / 255);
  const gl = srgbToLinear(clamp255(Number(g) || 0) / 255);
  const bl = srgbToLinear(clamp255(Number(b) || 0) / 255);
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

/** WCAG contrast ratio between two sRGB colours, from 1 to 21. */
export function contrastRatio(a, b) {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const light = Math.max(la, lb);
  const dark = Math.min(la, lb);
  return (light + 0.05) / (dark + 0.05);
}

/** sRGB (0-255) to CIE L*a*b* under D65. */
export function rgbToLab({ r, g, b }) {
  const rl = srgbToLinear(clamp255(Number(r) || 0) / 255);
  const gl = srgbToLinear(clamp255(Number(g) || 0) / 255);
  const bl = srgbToLinear(clamp255(Number(b) || 0) / 255);

  // sRGB D65 primaries matrix.
  const x = (0.4124564 * rl + 0.3575761 * gl + 0.1804375 * bl) / D65.x;
  const y = (0.2126729 * rl + 0.7151522 * gl + 0.072175 * bl) / D65.y;
  const z = (0.0193339 * rl + 0.119192 * gl + 0.9503041 * bl) / D65.z;

  const f = (t) => (t > LAB_EPSILON ? Math.cbrt(t) : t / LAB_KAPPA + 4 / 29);
  const fx = f(x);
  const fy = f(y);
  const fz = f(z);

  return { L: 116 * fy - 16, a: 500 * (fx - fy), b: 200 * (fy - fz) };
}

/** CIEDE2000 colour difference (CIE 142-2001), kL = kC = kH = 1. */
export function deltaE2000(lab1, lab2) {
  const { L: L1, a: a1, b: b1 } = lab1;
  const { L: L2, a: a2, b: b2 } = lab2;

  const C1 = Math.hypot(a1, b1);
  const C2 = Math.hypot(a2, b2);
  const Cbar = (C1 + C2) / 2;
  const Cbar7 = Cbar ** 7;
  const G = 0.5 * (1 - Math.sqrt(Cbar7 / (Cbar7 + 25 ** 7)));

  const a1p = (1 + G) * a1;
  const a2p = (1 + G) * a2;
  const C1p = Math.hypot(a1p, b1);
  const C2p = Math.hypot(a2p, b2);

  const hp = (a, b) => {
    if (a === 0 && b === 0) return 0;
    const angle = deg(Math.atan2(b, a));
    return angle >= 0 ? angle : angle + 360;
  };
  const h1p = hp(a1p, b1);
  const h2p = hp(a2p, b2);

  const dLp = L2 - L1;
  const dCp = C2p - C1p;

  let dhp;
  if (C1p * C2p === 0) dhp = 0;
  else if (Math.abs(h2p - h1p) <= 180) dhp = h2p - h1p;
  else if (h2p - h1p > 180) dhp = h2p - h1p - 360;
  else dhp = h2p - h1p + 360;
  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(rad(dhp) / 2);

  const Lbarp = (L1 + L2) / 2;
  const Cbarp = (C1p + C2p) / 2;

  let hbarp;
  if (C1p * C2p === 0) hbarp = h1p + h2p;
  else if (Math.abs(h1p - h2p) <= 180) hbarp = (h1p + h2p) / 2;
  else if (h1p + h2p < 360) hbarp = (h1p + h2p + 360) / 2;
  else hbarp = (h1p + h2p - 360) / 2;

  const T =
    1 -
    0.17 * Math.cos(rad(hbarp - 30)) +
    0.24 * Math.cos(rad(2 * hbarp)) +
    0.32 * Math.cos(rad(3 * hbarp + 6)) -
    0.2 * Math.cos(rad(4 * hbarp - 63));

  const dTheta = 30 * Math.exp(-(((hbarp - 275) / 25) ** 2));
  const Cbarp7 = Cbarp ** 7;
  const RC = 2 * Math.sqrt(Cbarp7 / (Cbarp7 + 25 ** 7));
  const SL = 1 + (0.015 * (Lbarp - 50) ** 2) / Math.sqrt(20 + (Lbarp - 50) ** 2);
  const SC = 1 + 0.045 * Cbarp;
  const SH = 1 + 0.015 * Cbarp * T;
  const RT = -Math.sin(rad(2 * dTheta)) * RC;

  const termL = dLp / SL;
  const termC = dCp / SC;
  const termH = dHp / SH;

  const value = Math.sqrt(termL ** 2 + termC ** 2 + termH ** 2 + RT * termC * termH);
  return Number.isFinite(value) ? value : 0;
}

/** Parse a 3, 4, 6 or 8 digit hex colour with or without a leading hash. */
export function parseHex(input) {
  if (typeof input !== "string") return { error: "Enter a hex colour." };
  const raw = input.trim().replace(/^#/, "");
  if (!raw) return { error: "Enter a hex colour." };
  if (!/^[0-9a-fA-F]+$/.test(raw)) {
    return { error: "Hex colours use only the characters 0-9 and A-F." };
  }
  if (![3, 4, 6, 8].includes(raw.length)) {
    return { error: "Use 3, 4, 6 or 8 hex digits, for example 1AB or 11AABB." };
  }
  const step = raw.length <= 4 ? 1 : 2;
  const parts = [];
  for (let i = 0; i < raw.length; i += step) {
    const chunk = raw.slice(i, i + step);
    parts.push(parseInt(chunk.length === 1 ? chunk + chunk : chunk, 16));
  }
  const [r, g, b] = parts;
  const hex = [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase();
  return { r, g, b, hex };
}

/** sRGB (0-255) to HSL with hue in degrees and s/l as percentages. */
export function rgbToHsl({ r, g, b }) {
  const rr = clamp255(Number(r) || 0) / 255;
  const gg = clamp255(Number(g) || 0) / 255;
  const bb = clamp255(Number(b) || 0) / 255;
  const max = Math.max(rr, gg, bb);
  const min = Math.min(rr, gg, bb);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l: l * 100 };
  const s = d / (1 - Math.abs(2 * l - 1));
  let h;
  if (max === rr) h = ((gg - bb) / d) % 6;
  else if (max === gg) h = (bb - rr) / d + 2;
  else h = (rr - gg) / d + 4;
  h *= 60;
  if (h < 0) h += 360;
  return { h, s: s * 100, l: l * 100 };
}

/** Plain-English description built from hue, saturation and lightness. */
export function describeColor(hsl) {
  const { h, s, l } = hsl;
  if (l >= 97) return "near white";
  if (l <= 3) return "near black";
  if (s < 8) {
    if (l >= 85) return "off white";
    if (l >= 65) return "light grey";
    if (l >= 35) return "mid grey";
    return "charcoal grey";
  }

  let family = HUE_FAMILIES.find((sector) => h <= sector.max)?.name || "red";
  // English has no "dark orange" — a darkened orange or yellow is called brown.
  if ((family === "orange" || family === "yellow") && l < 42) family = "brown";
  // A lightened red is called pink, not "light red".
  if (family === "red" && l >= 75) family = "pink";

  let lightness = "";
  if (l < 18) lightness = "very dark";
  else if (l < 34) lightness = "dark";
  else if (l < 45) lightness = "deep";
  else if (l < 62) lightness = "";
  else if (l < 76) lightness = "light";
  else if (l < 88) lightness = "pale";
  else lightness = "very pale";

  let saturation = "";
  if (s < 22) saturation = "muted";
  else if (s < 45) saturation = "soft";
  else if (s < 72) saturation = "";
  // A very light tint never reads as vivid however high its HSL saturation is.
  else saturation = l >= 82 ? "" : "vivid";

  return [lightness, saturation, family].filter(Boolean).join(" ");
}

/**
 * Find the nearest names for a hex colour.
 * `limit` controls how many CSS keywords are returned.
 */
export function findColorNames(input, limit = 5) {
  const parsed = parseHex(input);
  if (parsed.error) return { error: parsed.error };
  if (!Number.isFinite(Number(limit)) || Number(limit) < 1) {
    return { error: "Ask for at least one nearby name." };
  }

  const lab = rgbToLab(parsed);
  const hsl = rgbToHsl(parsed);

  const rank = (table) =>
    table
      .map((entry) => ({
        name: entry.name,
        r: entry.r,
        g: entry.g,
        b: entry.b,
        hex: [entry.r, entry.g, entry.b]
          .map((v) => v.toString(16).padStart(2, "0"))
          .join("")
          .toUpperCase(),
        deltaE: round2(deltaE2000(lab, rgbToLab(entry))),
      }))
      .sort((a, b) => a.deltaE - b.deltaE);

  const cssMatches = rank(CSS_COLORS).slice(0, Math.min(Math.round(Number(limit)), CSS_COLORS.length));
  // Very dark and very light colours still read as black or white in ordinary
  // speech, however saturated they measure, so keep those terms available.
  const chromatic = hsl.s >= CHROMATIC_SATURATION_FLOOR && hsl.l > 12 && hsl.l < 88;
  const basicPool = chromatic
    ? BASIC_TERMS.filter((term) => !ACHROMATIC_TERMS.includes(term.name))
    : BASIC_TERMS;
  const basicMatch = rank(basicPool)[0];

  const white = { r: 255, g: 255, b: 255 };
  const black = { r: 0, g: 0, b: 0 };
  const onWhite = contrastRatio(parsed, white);
  const onBlack = contrastRatio(parsed, black);

  return {
    hex: parsed.hex,
    r: parsed.r,
    g: parsed.g,
    b: parsed.b,
    hsl: { h: Math.round(hsl.h), s: Math.round(hsl.s), l: Math.round(hsl.l) },
    lab: { L: round2(lab.L), a: round2(lab.a), b: round2(lab.b) },
    description: describeColor(hsl),
    basicTerm: basicMatch.name,
    basicDeltaE: basicMatch.deltaE,
    matches: cssMatches,
    exactMatch: cssMatches[0] && cssMatches[0].deltaE === 0 ? cssMatches[0].name : null,
    contrastOnWhite: round2(onWhite),
    contrastOnBlack: round2(onBlack),
    betterTextColor: onBlack >= onWhite ? "black" : "white",
  };
}

/** Copy-friendly summary. */
export function formatNamesText(result) {
  if (!result || result.error) return "";
  return [
    `#${result.hex} — ${result.description}`,
    `Basic colour term: ${result.basicTerm}`,
    `Closest CSS names: ${result.matches.map((m) => `${m.name} (ΔE ${m.deltaE})`).join(", ")}`,
    `RGB ${result.r}, ${result.g}, ${result.b}`,
    `HSL ${result.hsl.h}°, ${result.hsl.s}%, ${result.hsl.l}%`,
    `Lab ${result.lab.L}, ${result.lab.a}, ${result.lab.b}`,
    `Contrast on white ${result.contrastOnWhite}:1 · on black ${result.contrastOnBlack}:1`,
  ].join("\n");
}
