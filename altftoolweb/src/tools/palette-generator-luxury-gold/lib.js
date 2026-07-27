/**
 * Luxury gold palette generator.
 *
 * Pure module: no DOM, no React, no clock, no randomness. The same metal,
 * ground, hue shift and variation index always produce the same palette.
 *
 * Colour maths:
 *  - HSL to sRGB uses the CSS Color Module Level 4 algorithm.
 *  - Contrast uses the WCAG 2.x relative-luminance formula on sRGB.
 *  - CMYK is the standard naive GCR-free conversion used by design tools when
 *    no ICC profile is supplied; it is a starting build for a printer, not a
 *    colour-managed separation.
 */

/** WCAG 2.x minimum contrast ratios. */
export const WCAG = {
  /** Body text, WCAG 2.x SC 1.4.3. */
  AA_NORMAL: 4.5,
  /** Enhanced body text, SC 1.4.6. */
  AAA_NORMAL: 7,
  /** Large text: 24px regular or 18.66px bold and above. */
  AA_LARGE: 3,
  AAA_LARGE: 4.5,
  /** Non-text UI components and graphical objects, SC 1.4.11. */
  UI_COMPONENT: 3,
};

/**
 * Total area coverage limits for offset litho. SWOP and FOGRA press guidance
 * puts coated sheetfed around 300% and uncoated around 260%; going over makes
 * ink set-off and blocking likely.
 */
export const TAC_LIMIT_COATED = 300;
export const TAC_LIMIT_UNCOATED = 260;

/**
 * A single 100% black plate prints as a washed dark grey over large areas, so
 * pre-press desks build a "rich black" by adding chromatic ink underneath.
 * A common safe build is 60C 40M 40Y 100K, which is 240% coverage.
 */
export const RICH_BLACK_BUILD = { c: 60, m: 40, y: 40, k: 100 };

/** Highest variation index the generator accepts before it wraps. */
export const MAX_VARIATION = 5;

/** Roles in render order. */
export const ROLE_ORDER = ["ground", "surface", "gold", "goldLight", "champagne", "ink"];

const ROLE_LABELS = {
  ground: "Ground (page)",
  surface: "Surface (card)",
  gold: "Gold (primary)",
  goldLight: "Gold light (highlight)",
  champagne: "Champagne (secondary)",
  ink: "Ink (body text)",
};

/**
 * Metal definitions. Hue, saturation and lightness are chosen so the mid gold
 * sits in the 3:1-plus band against a dark ground, which is the WCAG threshold
 * for large display type and for interface borders.
 */
export const METALS = {
  classicGold: {
    id: "classicGold",
    label: "Classic 24ct gold",
    note: "Warm yellow gold, the tone most hot-foil stamping dies are matched to.",
    gold: { h: 45, s: 66, l: 52 },
    goldLight: { h: 49, s: 82, l: 71 },
    champagne: { h: 44, s: 40, l: 84 },
  },
  champagneGold: {
    id: "champagneGold",
    label: "Champagne gold",
    note: "Softer and paler; reads as understated luxury rather than opulence.",
    gold: { h: 41, s: 42, l: 61 },
    goldLight: { h: 43, s: 52, l: 78 },
    champagne: { h: 40, s: 26, l: 88 },
  },
  roseGold: {
    id: "roseGold",
    label: "Rose gold",
    note: "Copper-leaning gold for beauty, jewellery and lifestyle packaging.",
    gold: { h: 18, s: 52, l: 60 },
    goldLight: { h: 22, s: 64, l: 75 },
    champagne: { h: 20, s: 34, l: 87 },
  },
  antiqueBrass: {
    id: "antiqueBrass",
    label: "Antique brass",
    note: "Aged, greened gold for heritage marks and spirits labels.",
    gold: { h: 38, s: 44, l: 45 },
    goldLight: { h: 42, s: 52, l: 62 },
    champagne: { h: 40, s: 24, l: 80 },
  },
  whiteGold: {
    id: "whiteGold",
    label: "White gold / platinum",
    note: "Near-neutral metal; pair with a cool ground so it does not read grey.",
    gold: { h: 45, s: 10, l: 68 },
    goldLight: { h: 45, s: 8, l: 82 },
    champagne: { h: 210, s: 8, l: 90 },
  },
};

/** Dark grounds. Ink is deliberately off-white so large areas do not glare. */
export const GROUNDS = {
  obsidian: {
    id: "obsidian",
    label: "Obsidian black",
    ground: { h: 40, s: 4, l: 7 },
    surface: { h: 40, s: 5, l: 13 },
    ink: { h: 40, s: 6, l: 94 },
  },
  charcoal: {
    id: "charcoal",
    label: "Charcoal grey",
    ground: { h: 220, s: 7, l: 13 },
    surface: { h: 220, s: 8, l: 19 },
    ink: { h: 220, s: 8, l: 95 },
  },
  midnightNavy: {
    id: "midnightNavy",
    label: "Midnight navy",
    ground: { h: 223, s: 44, l: 11 },
    surface: { h: 223, s: 38, l: 18 },
    ink: { h: 223, s: 14, l: 95 },
  },
  espresso: {
    id: "espresso",
    label: "Espresso brown",
    ground: { h: 24, s: 32, l: 10 },
    surface: { h: 24, s: 26, l: 17 },
    ink: { h: 30, s: 16, l: 95 },
  },
  britishRacing: {
    id: "britishRacing",
    label: "Deep forest green",
    ground: { h: 156, s: 36, l: 9 },
    surface: { h: 156, s: 30, l: 15 },
    ink: { h: 150, s: 10, l: 95 },
  },
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const mod360 = (value) => ((value % 360) + 360) % 360;
const round2 = (value) => Math.round(value * 100) / 100;

/** HSL (h in degrees, s and l in percent) to sRGB 0-255. */
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

/** sRGB 0-255 to a six-digit uppercase hex string, no leading hash. */
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

/** IEC 61966-2-1 sRGB transfer function used by the WCAG luminance formula. */
function toLinear(channel) {
  const c = clamp(Number(channel) || 0, 0, 255) / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** WCAG 2.x relative luminance, 0 (black) to 1 (white). */
export function relativeLuminance({ r, g, b }) {
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/** WCAG 2.x contrast ratio, 1 to 21. */
export function contrastRatio(a, b) {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** WCAG grade of a ratio at normal body-text size. */
export function wcagLevel(ratio) {
  const value = Number(ratio);
  if (!Number.isFinite(value)) return "Fail";
  if (value >= WCAG.AAA_NORMAL) return "AAA";
  if (value >= WCAG.AA_NORMAL) return "AA";
  if (value >= WCAG.AA_LARGE) return "AA large text only";
  return "Fail";
}

/**
 * sRGB to a naive CMYK build in percent. This is the uncalibrated conversion
 * every layout app falls back to without an ICC profile: it gives a printer a
 * sane starting point, not a colour-managed separation.
 */
export function rgbToCmyk({ r, g, b }) {
  const rr = clamp(Number(r) || 0, 0, 255) / 255;
  const gg = clamp(Number(g) || 0, 0, 255) / 255;
  const bb = clamp(Number(b) || 0, 0, 255) / 255;
  const k = 1 - Math.max(rr, gg, bb);
  if (k >= 1) return { c: 0, m: 0, y: 0, k: 100 };
  const c = (1 - rr - k) / (1 - k);
  const m = (1 - gg - k) / (1 - k);
  const y = (1 - bb - k) / (1 - k);
  return {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100),
  };
}

/** Total area coverage of a CMYK build, in percent. */
export function totalAreaCoverage({ c, m, y, k }) {
  return (Number(c) || 0) + (Number(m) || 0) + (Number(y) || 0) + (Number(k) || 0);
}

/**
 * Build a luxury palette.
 * `hueShift` rotates every metal hue; `variation` deterministically steps the
 * saturation and lightness so a designer can page through alternatives.
 */
export function generateLuxuryPalette({
  metalId = "classicGold",
  groundId = "obsidian",
  hueShift = 0,
  variation = 0,
  paperStock = "coated",
} = {}) {
  const metal = METALS[metalId];
  const ground = GROUNDS[groundId];
  if (!metal) return { error: "Choose one of the listed metal tones." };
  if (!ground) return { error: "Choose one of the listed dark grounds." };
  if (paperStock !== "coated" && paperStock !== "uncoated") {
    return { error: "Paper stock must be coated or uncoated." };
  }

  const shift = Number(hueShift);
  const step = Number(variation);
  if (!Number.isFinite(shift)) return { error: "Hue rotation must be a number of degrees." };
  if (shift < -180 || shift > 180) return { error: "Keep hue rotation between -180 and 180 degrees." };
  if (!Number.isFinite(step) || step < 0) {
    return { error: "Variation must be zero or a positive whole number." };
  }

  const v = Math.round(step) % (MAX_VARIATION + 1);
  // Variations walk hue by 4 degrees, saturation by +/-7% and lightness by
  // +/-3% so the family stays recognisably the same metal.
  const hueNudge = v * 4;
  const satFactor = 1 + ((v % 3) - 1) * 0.07;
  const lightNudge = v % 2 === 0 ? -3 : 3;

  const metalRoles = { gold: metal.gold, goldLight: metal.goldLight, champagne: metal.champagne };
  const groundRoles = { ground: ground.ground, surface: ground.surface, ink: ground.ink };

  const tacLimit = paperStock === "coated" ? TAC_LIMIT_COATED : TAC_LIMIT_UNCOATED;

  const swatches = ROLE_ORDER.map((role) => {
    const isMetal = Boolean(metalRoles[role]);
    const spec = isMetal ? metalRoles[role] : groundRoles[role];
    const h = mod360(spec.h + (isMetal ? shift + hueNudge : 0));
    const s = clamp(isMetal ? spec.s * satFactor : spec.s, 0, 100);
    // Grounds and ink hold their lightness so the palette never loses its
    // dark base or its readable text tone.
    const l = clamp(isMetal ? spec.l + lightNudge : spec.l, 0, 100);

    const rgb = hslToRgb(h, s, l);
    const cmyk = rgbToCmyk(rgb);
    const tac = totalAreaCoverage(cmyk);

    return {
      role,
      label: ROLE_LABELS[role],
      isMetal,
      hex: rgbToHex(rgb),
      rgb,
      hsl: { h: Math.round(h), s: Math.round(s), l: Math.round(l) },
      cmyk,
      tac,
      tacOverLimit: tac > tacLimit,
      luminance: round2(relativeLuminance(rgb) * 100),
    };
  });

  const byRole = Object.fromEntries(swatches.map((swatch) => [swatch.role, swatch]));

  const pairDefs = [
    ["ink", "ground", "Body text on page", WCAG.AA_NORMAL],
    ["ink", "surface", "Body text on card", WCAG.AA_NORMAL],
    ["gold", "ground", "Gold display type on page", WCAG.AA_LARGE],
    ["gold", "surface", "Gold rule or border on card", WCAG.UI_COMPONENT],
    ["goldLight", "ground", "Gold highlight on page", WCAG.AA_NORMAL],
    ["champagne", "surface", "Champagne caption on card", WCAG.AA_NORMAL],
    ["ground", "gold", "Dark label on a gold button", WCAG.AA_NORMAL],
  ];

  const pairs = pairDefs.map(([fg, bg, label, threshold]) => {
    const ratio = round2(contrastRatio(byRole[fg].rgb, byRole[bg].rgb));
    return {
      id: `${fg}-on-${bg}`,
      label,
      foreground: byRole[fg].hex,
      background: byRole[bg].hex,
      ratio,
      level: wcagLevel(ratio),
      threshold,
      passes: ratio >= threshold,
    };
  });

  // Foil is a laid-down metal leaf, not an ink, so no CMYK build reproduces
  // its specular flip. The screen swatch is a matte stand-in.
  const foilNotes = swatches
    .filter((swatch) => swatch.isMetal)
    .map((swatch) => ({
      role: swatch.role,
      label: swatch.label,
      cmyk: swatch.cmyk,
      tac: swatch.tac,
      tacOverLimit: swatch.tacOverLimit,
      advice: swatch.tacOverLimit
        ? `Over the ${tacLimit}% ink limit for ${paperStock} stock — ask the printer to reduce coverage or specify foil instead.`
        : "Within the ink limit as a flat CMYK build; specify hot foil if you want the metallic flip.",
    }));

  const richBlackTac = totalAreaCoverage(RICH_BLACK_BUILD);

  return {
    metalId: metal.id,
    metalLabel: metal.label,
    metalNote: metal.note,
    groundId: ground.id,
    groundLabel: ground.label,
    paperStock,
    tacLimit,
    variation: v,
    baseHue: mod360(metal.gold.h + shift + hueNudge),
    swatches,
    pairs,
    passingPairs: pairs.filter((pair) => pair.passes).length,
    totalPairs: pairs.length,
    foilNotes,
    richBlack: { ...RICH_BLACK_BUILD, tac: richBlackTac },
  };
}

const HASH = "#";

/**
 * A five-stop linear gradient that simulates a foil sheen on screen: the metal
 * is banded dark, light, mid, light, dark, which is how a rolled foil catches
 * light across a flat area.
 */
export function buildFoilGradient(palette) {
  if (!palette || palette.error) return "";
  const gold = palette.swatches.find((swatch) => swatch.role === "gold");
  const light = palette.swatches.find((swatch) => swatch.role === "goldLight");
  const champagne = palette.swatches.find((swatch) => swatch.role === "champagne");
  if (!gold || !light || !champagne) return "";
  const deep = rgbToHex(hslToRgb(gold.hsl.h, gold.hsl.s, clamp(gold.hsl.l - 18, 0, 100)));
  return `linear-gradient(100deg, ${HASH}${deep} 0%, ${HASH}${light.hex} 22%, ${HASH}${gold.hex} 48%, ${HASH}${champagne.hex} 68%, ${HASH}${deep} 100%)`;
}

/** CSS custom properties for the palette. */
export function formatPaletteCss(palette) {
  if (!palette || palette.error) return "";
  const lines = palette.swatches.map(
    (swatch) => `  --lux-${swatch.role.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${HASH}${swatch.hex};`,
  );
  return [
    `/* ${palette.metalLabel} on ${palette.groundLabel} — variation ${palette.variation} */`,
    ":root {",
    ...lines,
    `  --lux-foil: ${buildFoilGradient(palette)};`,
    "}",
  ].join("\n");
}

/** Plain-text summary with the contrast audit and the print builds. */
export function formatPaletteText(palette) {
  if (!palette || palette.error) return "";
  return [
    `${palette.metalLabel} on ${palette.groundLabel} — variation ${palette.variation}`,
    "",
    ...palette.swatches.map(
      (s) =>
        `${s.label.padEnd(24)} ${HASH}${s.hex}  CMYK ${s.cmyk.c}/${s.cmyk.m}/${s.cmyk.y}/${s.cmyk.k}  TAC ${s.tac}%`,
    ),
    "",
    "Contrast audit (WCAG 2.x)",
    ...palette.pairs.map(
      (p) => `${p.label.padEnd(32)} ${p.ratio}:1  needs ${p.threshold}:1  ${p.passes ? "pass" : "fail"}`,
    ),
    "",
    `Ink limit used: ${palette.tacLimit}% (${palette.paperStock} stock)`,
    `Rich black build: ${palette.richBlack.c}C ${palette.richBlack.m}M ${palette.richBlack.y}Y ${palette.richBlack.k}K (${palette.richBlack.tac}% coverage)`,
  ].join("\n");
}
