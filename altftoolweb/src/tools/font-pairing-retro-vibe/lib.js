/**
 * Retro Vibe Font Pairing — seventies and eighties type pairs, palettes stored
 * as HSL triples, and WCAG contrast maths.
 * Pure module: no React, no DOM, no globals.
 */

/**
 * WCAG 2.1 success criterion 1.4.3 (Contrast Minimum) requires a contrast
 * ratio of at least 4.5:1 for normal text and 3:1 for large text. SC 1.4.6
 * (Contrast Enhanced) raises those to 7:1 and 4.5:1. SC 1.4.11 requires 3:1
 * for user-interface components and meaningful graphics.
 */
export const CONTRAST_AA_NORMAL = 4.5;
export const CONTRAST_AA_LARGE = 3;
export const CONTRAST_AAA_NORMAL = 7;
export const CONTRAST_AAA_LARGE = 4.5;
export const CONTRAST_UI = 3;

/**
 * WCAG defines "large text" as at least 18 point, or 14 point bold. At the
 * CSS reference of 96 px to the inch those are 24 px and 18.66 px.
 */
export const LARGE_TEXT_PX = 24;
export const LARGE_TEXT_BOLD_PX = 18.66;

/** sRGB relative-luminance coefficients and transfer curve, from WCAG 2.1. */
const LUMINANCE_COEFFICIENTS = { r: 0.2126, g: 0.7152, b: 0.0722 };
const SRGB_LINEAR_THRESHOLD = 0.04045;
const SRGB_LINEAR_DIVISOR = 12.92;
const SRGB_GAMMA_OFFSET = 0.055;
const SRGB_GAMMA_SCALE = 1.055;
const SRGB_GAMMA_EXPONENT = 2.4;
/** WCAG adds 0.05 to both luminances to model ambient screen flare. */
const CONTRAST_FLARE = 0.05;

export const RETRO_PAIRINGS = [
  {
    id: "seventies-groove",
    label: "Seventies groove",
    era: "1972 record sleeve",
    heading: {
      family: "Righteous",
      weight: 400,
      google: "Righteous",
      stack: "Righteous, Impact, sans-serif",
    },
    body: {
      family: "Karla",
      weight: 400,
      google: "Karla:ital,wght@0,400;0,700;1,400",
      stack: "Karla, Arial, sans-serif",
    },
    note: "Righteous has the tight, rounded counters of early-seventies lettering. It only has one weight, so build hierarchy with size and colour rather than bold.",
    palette: {
      background: { h: 35, s: 45, l: 92 },
      surface: { h: 30, s: 40, l: 85 },
      ink: { h: 20, s: 60, l: 18 },
      accent: { h: 18, s: 75, l: 38 },
      secondary: { h: 45, s: 70, l: 27 },
    },
  },
  {
    id: "disco-slab",
    label: "Disco slab",
    era: "1976 poster",
    heading: {
      family: "Alfa Slab One",
      weight: 400,
      google: "Alfa+Slab+One",
      stack: '"Alfa Slab One", Rockwell, Georgia, serif',
    },
    body: {
      family: "Nunito Sans",
      weight: 400,
      google: "Nunito+Sans:ital,wght@0,400;0,700;1,400",
      stack: '"Nunito Sans", system-ui, Arial, sans-serif',
    },
    note: "Alfa Slab One is very heavy with almost no internal white space — it needs generous line spacing and it will not survive being set below about 24px.",
    palette: {
      background: { h: 28, s: 35, l: 94 },
      surface: { h: 26, s: 32, l: 87 },
      ink: { h: 350, s: 40, l: 18 },
      accent: { h: 350, s: 65, l: 40 },
      secondary: { h: 200, s: 45, l: 34 },
    },
  },
  {
    id: "neon-nights",
    label: "Neon nights",
    era: "1984 club flyer",
    heading: {
      family: "Monoton",
      weight: 400,
      google: "Monoton",
      stack: "Monoton, Impact, sans-serif",
    },
    body: {
      family: "Rubik",
      weight: 400,
      google: "Rubik:ital,wght@0,400;0,600;1,400",
      stack: "Rubik, system-ui, Arial, sans-serif",
    },
    note: "Monoton is an inline face — the internal strokes fill in below roughly 40px and it turns into a smudge. Use it for one word, large, on a dark ground.",
    palette: {
      background: { h: 260, s: 45, l: 10 },
      surface: { h: 260, s: 40, l: 16 },
      ink: { h: 280, s: 25, l: 94 },
      accent: { h: 320, s: 90, l: 62 },
      secondary: { h: 180, s: 85, l: 58 },
    },
  },
  {
    id: "arcade-cabinet",
    label: "Arcade cabinet",
    era: "1983 coin-op",
    heading: {
      family: "Press Start 2P",
      weight: 400,
      google: "Press+Start+2P",
      stack: '"Press Start 2P", ui-monospace, monospace',
    },
    body: {
      family: "Space Mono",
      weight: 400,
      google: "Space+Mono:ital,wght@0,400;0,700;1,400",
      stack: '"Space Mono", ui-monospace, Menlo, monospace',
    },
    note: "Press Start 2P is a bitmap face on an 8px grid — set it only at multiples of 8px, or the pixels blur. It has no lowercase advantage: everything reads as caps.",
    palette: {
      background: { h: 230, s: 35, l: 12 },
      surface: { h: 230, s: 30, l: 18 },
      ink: { h: 0, s: 0, l: 96 },
      accent: { h: 50, s: 95, l: 58 },
      secondary: { h: 140, s: 70, l: 50 },
    },
  },
  {
    id: "synthwave",
    label: "Synthwave",
    era: "1986 title card",
    heading: {
      family: "Orbitron",
      weight: 700,
      google: "Orbitron:wght@500;700;900",
      stack: "Orbitron, Eurostile, sans-serif",
    },
    body: {
      family: "Titillium Web",
      weight: 400,
      google: "Titillium+Web:ital,wght@0,400;0,600;1,400",
      stack: '"Titillium Web", system-ui, Arial, sans-serif',
    },
    note: "Orbitron is square-shouldered and reads as machinery. Add 0.06em of tracking in caps or the flat sidebearings make words look glued together.",
    palette: {
      background: { h: 250, s: 50, l: 12 },
      surface: { h: 250, s: 45, l: 18 },
      ink: { h: 250, s: 20, l: 95 },
      accent: { h: 300, s: 85, l: 65 },
      secondary: { h: 190, s: 90, l: 58 },
    },
  },
  {
    id: "deco-revival",
    label: "Deco revival",
    era: "1970s deco reissue",
    heading: {
      family: "Poiret One",
      weight: 400,
      google: "Poiret+One",
      stack: '"Poiret One", "Century Gothic", sans-serif',
    },
    body: {
      family: "Josefin Sans",
      weight: 400,
      google: "Josefin+Sans:ital,wght@0,300;0,400;0,600;1,400",
      stack: '"Josefin Sans", system-ui, sans-serif',
    },
    note: "Both faces are thin with high waistlines, so the pair is elegant but low in contrast. Keep body text at 17px or larger and avoid mid-grey text colours.",
    palette: {
      background: { h: 40, s: 25, l: 94 },
      surface: { h: 40, s: 22, l: 88 },
      ink: { h: 210, s: 30, l: 15 },
      accent: { h: 42, s: 60, l: 30 },
      secondary: { h: 210, s: 35, l: 32 },
    },
  },
  {
    id: "surf-shop",
    label: "Surf shop",
    era: "1978 beach print",
    heading: {
      family: "Pacifico",
      weight: 400,
      google: "Pacifico",
      stack: "Pacifico, cursive",
    },
    body: {
      family: "Cabin",
      weight: 400,
      google: "Cabin:ital,wght@0,400;0,600;1,400",
      stack: "Cabin, system-ui, Arial, sans-serif",
    },
    note: "Pacifico is a brush script with a strong slope — never set it in all caps and never letterspace it, or the joins break.",
    palette: {
      background: { h: 190, s: 45, l: 93 },
      surface: { h: 190, s: 40, l: 86 },
      ink: { h: 205, s: 45, l: 16 },
      accent: { h: 8, s: 72, l: 42 },
      secondary: { h: 175, s: 55, l: 28 },
    },
  },
  {
    id: "airline-livery",
    label: "Airline livery",
    era: "1974 timetable",
    heading: {
      family: "Bebas Neue",
      weight: 400,
      google: "Bebas+Neue",
      stack: '"Bebas Neue", "Haettenschweiler", Impact, sans-serif',
    },
    body: {
      family: "Archivo",
      weight: 400,
      google: "Archivo:ital,wght@0,400;0,600;1,400",
      stack: "Archivo, system-ui, Arial, sans-serif",
    },
    note: "Bebas Neue is caps-only and very condensed, so it packs long words into narrow columns — ideal for schedules and price lists, useless for sentences.",
    palette: {
      background: { h: 35, s: 40, l: 93 },
      surface: { h: 35, s: 35, l: 86 },
      ink: { h: 215, s: 45, l: 18 },
      accent: { h: 355, s: 68, l: 40 },
      secondary: { h: 25, s: 78, l: 33 },
    },
  },
];

/** Roles a palette colour can play, in the order they are shown. */
export const PALETTE_ROLES = [
  { key: "background", label: "Background" },
  { key: "surface", label: "Surface / card" },
  { key: "ink", label: "Text" },
  { key: "accent", label: "Accent" },
  { key: "secondary", label: "Secondary" },
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function round(value, decimals) {
  if (!Number.isFinite(value)) return 0;
  const factor = 10 ** decimals;
  const result = Math.round(value * factor) / factor;
  return result === 0 ? 0 : result;
}

/**
 * HSL to sRGB, per the CSS Color Module definition.
 * h in degrees, s and l in percent. Returns channels as 0-255 integers.
 */
export function hslToRgb({ h, s, l }) {
  const hue = ((Number(h) % 360) + 360) % 360;
  const sat = clamp(Number(s), 0, 100) / 100;
  const light = clamp(Number(l), 0, 100) / 100;
  const c = (1 - Math.abs(2 * light - 1)) * sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = light - c / 2;
  let rgb;
  if (hue < 60) rgb = [c, x, 0];
  else if (hue < 120) rgb = [x, c, 0];
  else if (hue < 180) rgb = [0, c, x];
  else if (hue < 240) rgb = [0, x, c];
  else if (hue < 300) rgb = [x, 0, c];
  else rgb = [c, 0, x];
  return {
    r: Math.round((rgb[0] + m) * 255),
    g: Math.round((rgb[1] + m) * 255),
    b: Math.round((rgb[2] + m) * 255),
  };
}

const HEX_DIGITS = "0123456789abcdef";

/** Format an 0-255 channel as two hex digits without any literal colour code. */
function channelToHex(value) {
  const v = clamp(Math.round(value), 0, 255);
  return HEX_DIGITS[Math.floor(v / 16)] + HEX_DIGITS[v % 16];
}

/** CSS hex colour string for an rgb triple, e.g. hash plus six hex digits. */
export function rgbToHex({ r, g, b }) {
  return `#${channelToHex(r)}${channelToHex(g)}${channelToHex(b)}`;
}

/** CSS rgb() string for an rgb triple. */
export function rgbToCss({ r, g, b }) {
  return `rgb(${clamp(Math.round(r), 0, 255)} ${clamp(Math.round(g), 0, 255)} ${clamp(Math.round(b), 0, 255)})`;
}

/** WCAG 2.1 relative luminance of an sRGB colour. */
export function relativeLuminance({ r, g, b }) {
  const channel = (value) => {
    const c = clamp(Number(value), 0, 255) / 255;
    return c <= SRGB_LINEAR_THRESHOLD
      ? c / SRGB_LINEAR_DIVISOR
      : ((c + SRGB_GAMMA_OFFSET) / SRGB_GAMMA_SCALE) ** SRGB_GAMMA_EXPONENT;
  };
  return (
    LUMINANCE_COEFFICIENTS.r * channel(r) +
    LUMINANCE_COEFFICIENTS.g * channel(g) +
    LUMINANCE_COEFFICIENTS.b * channel(b)
  );
}

/** WCAG 2.1 contrast ratio between two sRGB colours. Always >= 1. */
export function contrastRatio(rgbA, rgbB) {
  const a = relativeLuminance(rgbA);
  const b = relativeLuminance(rgbB);
  const lighter = Math.max(a, b);
  const darker = Math.min(a, b);
  return (lighter + CONTRAST_FLARE) / (darker + CONTRAST_FLARE);
}

/** Pass/fail summary for a contrast ratio at a given text size. */
export function contrastVerdict(ratio, { sizePx = 16, bold = false } = {}) {
  if (!Number.isFinite(ratio) || ratio < 1) {
    return { level: "danger", label: "Not measurable", text: "Colours could not be compared." };
  }
  const isLarge = bold ? sizePx >= LARGE_TEXT_BOLD_PX : sizePx >= LARGE_TEXT_PX;
  const aa = isLarge ? CONTRAST_AA_LARGE : CONTRAST_AA_NORMAL;
  const aaa = isLarge ? CONTRAST_AAA_LARGE : CONTRAST_AAA_NORMAL;
  if (ratio >= aaa) {
    return {
      level: "ok",
      label: "AAA",
      text: `Passes WCAG AAA for ${isLarge ? "large" : "normal"} text (needs ${aaa}:1).`,
    };
  }
  if (ratio >= aa) {
    return {
      level: "ok",
      label: "AA",
      text: `Passes WCAG AA for ${isLarge ? "large" : "normal"} text (needs ${aa}:1), short of AAA at ${aaa}:1.`,
    };
  }
  if (ratio >= CONTRAST_UI) {
    return {
      level: "warn",
      label: "UI only",
      text: `Below the ${aa}:1 needed for ${isLarge ? "large" : "normal"} text. Fine for borders and icons, which need 3:1.`,
    };
  }
  return {
    level: "danger",
    label: "Fail",
    text: `Under 3:1 — fails every WCAG threshold, including the ${CONTRAST_UI}:1 for interface components.`,
  };
}

/** Shift a colour's lightness by a percentage-point delta, clamped to 0-100. */
export function shiftLightness(hsl, delta) {
  const amount = Number.isFinite(Number(delta)) ? Number(delta) : 0;
  return { ...hsl, l: clamp(hsl.l + amount, 0, 100) };
}

function describeColour(hsl) {
  const rgb = hslToRgb(hsl);
  return {
    hsl: { h: Math.round(hsl.h), s: Math.round(hsl.s), l: Math.round(hsl.l) },
    hslCss: `hsl(${Math.round(hsl.h)} ${Math.round(hsl.s)}% ${Math.round(hsl.l)}%)`,
    rgb,
    hex: rgbToHex(rgb),
    css: rgbToCss(rgb),
    luminance: round(relativeLuminance(rgb), 4),
  };
}

/**
 * Full retro kit calculation.
 * Returns { error } for any invalid input instead of a bad number.
 */
export function computeRetroKit({ pairingId, headingPx, bodyPx, inkShift, accentShift }) {
  const pairing = RETRO_PAIRINGS.find((item) => item.id === pairingId);
  if (!pairing) return { error: "Choose one of the listed pairings." };

  const heading = Number(headingPx);
  const body = Number(bodyPx);
  const inkDelta = Number(inkShift);
  const accentDelta = Number(accentShift);

  if (![heading, body, inkDelta, accentDelta].every((n) => Number.isFinite(n))) {
    return { error: "Enter a number in every field." };
  }
  if (body < 10 || body > 40) return { error: "Body size should be between 10px and 40px." };
  if (heading < 16 || heading > 200) {
    return { error: "Heading size should be between 16px and 200px." };
  }
  if (heading <= body) {
    return { error: "The heading must be larger than the body size or there is no hierarchy." };
  }
  if (inkDelta < -40 || inkDelta > 40 || accentDelta < -40 || accentDelta > 40) {
    return { error: "Lightness adjustments are limited to plus or minus 40 points." };
  }

  const palette = pairing.palette;
  const background = describeColour(palette.background);
  const surface = describeColour(palette.surface);
  const ink = describeColour(shiftLightness(palette.ink, inkDelta));
  const accent = describeColour(shiftLightness(palette.accent, accentDelta));
  const secondary = describeColour(palette.secondary);

  const bodyRatio = contrastRatio(ink.rgb, background.rgb);
  const headingRatio = contrastRatio(accent.rgb, background.rgb);
  const inkOnSurfaceRatio = contrastRatio(ink.rgb, surface.rgb);
  const buttonRatio = contrastRatio(background.rgb, accent.rgb);
  const secondaryRatio = contrastRatio(secondary.rgb, background.rgb);

  return {
    pairing,
    headingPx: heading,
    bodyPx: body,
    inkShift: inkDelta,
    accentShift: accentDelta,
    colours: [
      { role: "background", label: "Background", ...background },
      { role: "surface", label: "Surface / card", ...surface },
      { role: "ink", label: "Text", ...ink },
      { role: "accent", label: "Accent", ...accent },
      { role: "secondary", label: "Secondary", ...secondary },
    ],
    background,
    surface,
    ink,
    accent,
    secondary,
    checks: [
      {
        id: "body",
        label: "Body text on background",
        ratio: round(bodyRatio, 2),
        verdict: contrastVerdict(bodyRatio, { sizePx: body, bold: false }),
      },
      {
        id: "heading",
        label: "Accent heading on background",
        ratio: round(headingRatio, 2),
        verdict: contrastVerdict(headingRatio, { sizePx: heading, bold: true }),
      },
      {
        id: "surface",
        label: "Body text on surface",
        ratio: round(inkOnSurfaceRatio, 2),
        verdict: contrastVerdict(inkOnSurfaceRatio, { sizePx: body, bold: false }),
      },
      {
        id: "button",
        label: "Background text on an accent button",
        ratio: round(buttonRatio, 2),
        verdict: contrastVerdict(buttonRatio, { sizePx: body, bold: true }),
      },
      {
        id: "secondary",
        label: "Secondary colour on background",
        ratio: round(secondaryRatio, 2),
        verdict: contrastVerdict(secondaryRatio, { sizePx: body, bold: false }),
      },
    ],
    bodyRatio: round(bodyRatio, 2),
    bodyVerdict: contrastVerdict(bodyRatio, { sizePx: body, bold: false }),
  };
}

export function googleFontsHref(pairing) {
  if (!pairing) return "";
  const families = [pairing.heading.google, pairing.body.google]
    .filter(Boolean)
    .map((value) => `family=${value}`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

export function buildCss(result) {
  if (!result || result.error) return "";
  const { pairing } = result;
  return [
    `@import url("${googleFontsHref(pairing)}");`,
    "",
    ":root {",
    `  --font-display: ${pairing.heading.stack};`,
    `  --font-body: ${pairing.body.stack};`,
    ...result.colours.map((item) => `  --retro-${item.role}: ${item.hex};`),
    "}",
    "",
    "body {",
    "  background: var(--retro-background);",
    "  color: var(--retro-ink);",
    "  font-family: var(--font-body);",
    `  font-size: ${result.bodyPx}px;`,
    "  line-height: 1.6;",
    "}",
    "",
    "h1 {",
    "  font-family: var(--font-display);",
    `  font-weight: ${pairing.heading.weight};`,
    `  font-size: ${result.headingPx}px;`,
    "  line-height: 1.1;",
    "  color: var(--retro-accent);",
    "}",
    "",
    ".card { background: var(--retro-surface); }",
    ".button { background: var(--retro-accent); color: var(--retro-background); }",
  ].join("\n");
}

export function buildSummary(result) {
  if (!result || result.error) return "";
  return [
    "Retro Vibe Font Pairing",
    `${result.pairing.label} — ${result.pairing.era}`,
    `Display: ${result.pairing.heading.family} at ${result.headingPx}px`,
    `Body: ${result.pairing.body.family} at ${result.bodyPx}px`,
    "",
    "Palette:",
    ...result.colours.map((item) => `  ${item.label}: ${item.hex} / ${item.hslCss}`),
    "",
    "Contrast (WCAG 2.1):",
    ...result.checks.map(
      (check) => `  ${check.label}: ${check.ratio}:1 — ${check.verdict.label}`,
    ),
  ].join("\n");
}
