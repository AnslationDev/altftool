/**
 * Fintech palette generator: one brand hue in, a matched light theme and dark
 * theme out, with money-semantic colours and a contrast audit of both.
 *
 * Pure module: no DOM, no React, no clock, no randomness.
 *
 * Two documented rules do the heavy lifting:
 *  - Dark surfaces are built by compositing a translucent brand tint over the
 *    darkest surface at Material Design 3's published elevation opacities
 *    (level 1 = 5%, 2 = 8%, 3 = 11%, 4 = 12%, 5 = 14%). Compositing uses the
 *    standard source-over formula, out = a*over + (1-a)*base.
 *  - Contrast uses the WCAG 2.x relative-luminance formula on sRGB.
 */

/** WCAG 2.x thresholds (SC 1.4.3, 1.4.6, 1.4.11). */
export const WCAG = {
  AA_NORMAL: 4.5,
  AAA_NORMAL: 7,
  /** Large text: 24px regular or 18.66px bold and above. */
  AA_LARGE: 3,
  /** Non-text UI components and graphical objects. */
  UI_COMPONENT: 3,
};

/**
 * Material Design 3 dark-theme surface tint opacities by elevation level.
 * Level 0 is the untinted surface.
 */
export const ELEVATION_OPACITY = [0, 0.05, 0.08, 0.11, 0.12, 0.14];

export const ELEVATION_LABELS = [
  "Level 0 — page",
  "Level 1 — card",
  "Level 2 — raised card",
  "Level 3 — sheet",
  "Level 4 — nav bar",
  "Level 5 — dialog",
];

/**
 * Tonal ramp lightness stops, in the 50-900 convention most design systems
 * use. Chosen so 500 is the mid brand tone, 600-700 carry text on light, and
 * 200-300 carry text on dark.
 */
export const RAMP_STOPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
const RAMP_LIGHTNESS = [96, 91, 82, 71, 60, 50, 42, 33, 25, 17];
/** Saturation is pulled back at both ends so tints do not look neon. */
const RAMP_SAT_FACTOR = [0.55, 0.7, 0.85, 0.95, 1, 1, 0.98, 0.95, 0.9, 0.82];

/**
 * Brand hue families that read as trustworthy in financial products. These are
 * generic design starting points, not any company's brand colours.
 */
export const BRANDS = {
  trustBlue: {
    id: "trustBlue",
    label: "Trust blue",
    hue: 218,
    sat: 72,
    note: "The default of retail banking; conservative and widely understood.",
  },
  deepIndigo: {
    id: "deepIndigo",
    label: "Deep indigo",
    hue: 248,
    sat: 62,
    note: "Reads modern and premium; strong on dark backgrounds.",
  },
  bankTeal: {
    id: "bankTeal",
    label: "Bank teal",
    hue: 186,
    sat: 68,
    note: "Calmer than blue and less crowded in the Indian app market.",
  },
  ledgerGreen: {
    id: "ledgerGreen",
    label: "Ledger green",
    hue: 152,
    sat: 58,
    note: "Careful: keep it well away from the credit colour or amounts blur.",
  },
  royalViolet: {
    id: "royalViolet",
    label: "Royal violet",
    hue: 272,
    sat: 56,
    note: "Distinctive for consumer wallets and rewards products.",
  },
};

/**
 * Money and transaction semantics. Hue is fixed because users read these by
 * convention; only lightness is tuned per theme.
 */
export const MONEY_ORDER = ["credit", "debit", "pending", "failed", "saved"];

const MONEY_SPECS = {
  credit: { label: "Credit / money in", hue: 148, sat: 66, lightLight: 34, lightDark: 62 },
  debit: { label: "Debit / money out", hue: 8, sat: 68, lightLight: 42, lightDark: 66 },
  pending: { label: "Pending", hue: 36, sat: 82, lightLight: 36, lightDark: 66 },
  failed: { label: "Failed / declined", hue: 348, sat: 60, lightLight: 32, lightDark: 60 },
  saved: { label: "Saved / rewards", hue: 268, sat: 46, lightLight: 42, lightDark: 68 },
};

/** Highest variation index before the counter wraps. */
export const MAX_VARIATION = 4;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const mod360 = (value) => ((value % 360) + 360) % 360;
const round1 = (value) => Math.round(value * 10) / 10;
const round2 = (value) => Math.round(value * 100) / 100;

/** HSL to sRGB 0-255, CSS Color Level 4 algorithm. */
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

/** sRGB 0-255 to a six-digit uppercase hex string with no leading hash. */
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

/** IEC 61966-2-1 sRGB transfer function. */
function toLinear(channel) {
  const c = clamp(Number(channel) || 0, 0, 255) / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** WCAG 2.x relative luminance. */
export function relativeLuminance({ r, g, b }) {
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/** WCAG 2.x contrast ratio, 1 to 21. */
export function contrastRatio(a, b) {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** WCAG grade at normal body-text size. */
export function wcagLevel(ratio) {
  const value = Number(ratio);
  if (!Number.isFinite(value)) return "Fail";
  if (value >= WCAG.AAA_NORMAL) return "AAA";
  if (value >= WCAG.AA_NORMAL) return "AA";
  if (value >= WCAG.AA_LARGE) return "AA large text only";
  return "Fail";
}

/** Standard source-over compositing of `over` at `alpha` on top of `base`. */
export function compositeOver(over, base, alpha) {
  const a = clamp(Number(alpha) || 0, 0, 1);
  return {
    r: Math.round(a * over.r + (1 - a) * base.r),
    g: Math.round(a * over.g + (1 - a) * base.g),
    b: Math.round(a * over.b + (1 - a) * base.b),
  };
}

/** Lightness is walked in 1% steps; 100 steps covers the whole axis. */
const MAX_REPAIR_STEPS = 100;

/**
 * Walk a colour's lightness, hue fixed, until it clears `target` against
 * `background`. Returns it untouched when it already passes.
 */
export function repairToTarget({ h, s, l }, background, target, direction) {
  const hue = mod360(h);
  const sat = clamp(s, 0, 100);
  const dir = direction < 0 ? -1 : 1;
  let bestL = clamp(l, 0, 100);
  let bestRatio = contrastRatio(hslToRgb(hue, sat, bestL), background);

  for (let i = 1; i <= MAX_REPAIR_STEPS && bestRatio < target; i += 1) {
    const nextL = clamp(l + dir * i, 0, 100);
    const ratio = contrastRatio(hslToRgb(hue, sat, nextL), background);
    if (ratio > bestRatio) {
      bestRatio = ratio;
      bestL = nextL;
    }
    if (nextL === 0 || nextL === 100) break;
  }

  const rgb = hslToRgb(hue, sat, bestL);
  return {
    rgb,
    hex: rgbToHex(rgb),
    hsl: { h: Math.round(hue), s: Math.round(sat), l: Math.round(bestL) },
    ratio: round2(bestRatio),
    achieved: bestRatio >= target,
    moved: Math.round(Math.abs(bestL - l)),
  };
}

/** Build the 50-900 tonal ramp for a hue. */
export function buildRamp(hue, saturation) {
  return RAMP_STOPS.map((stop, index) => {
    const s = clamp(saturation * RAMP_SAT_FACTOR[index], 0, 100);
    const l = RAMP_LIGHTNESS[index];
    const rgb = hslToRgb(hue, s, l);
    return { stop, hex: rgbToHex(rgb), rgb, hsl: { h: Math.round(hue), s: Math.round(s), l } };
  });
}

const WHITE = { r: 255, g: 255, b: 255 };
const NEAR_BLACK_L = 8;

/**
 * Generate the paired light and dark theme.
 */
export function generateFintechPalette({
  brandId = "trustBlue",
  hueShift = 0,
  variation = 0,
  darkGroundLightness = 8,
} = {}) {
  const brand = BRANDS[brandId];
  if (!brand) return { error: "Choose one of the listed brand hues." };

  const shift = Number(hueShift);
  const step = Number(variation);
  const groundL = Number(darkGroundLightness);
  if (!Number.isFinite(shift)) return { error: "Hue rotation must be a number of degrees." };
  if (shift < -180 || shift > 180) return { error: "Keep hue rotation between -180 and 180 degrees." };
  if (!Number.isFinite(step) || step < 0) {
    return { error: "Variation must be zero or a positive whole number." };
  }
  if (!Number.isFinite(groundL)) return { error: "Dark ground lightness must be a number." };
  if (groundL < 4 || groundL > 16) {
    return { error: "Dark ground lightness works between 4% and 16% — below that banding shows." };
  }

  const v = Math.round(step) % (MAX_VARIATION + 1);
  // Variations rotate the brand hue by 5 degrees a step and breathe saturation.
  const hueNudge = v * 5;
  const satFactor = 1 + ((v % 3) - 1) * 0.08;
  const hue = mod360(brand.hue + shift + hueNudge);
  const sat = clamp(brand.sat * satFactor, 0, 100);

  const ramp = buildRamp(hue, sat);
  const rampAt = (stop) => ramp[RAMP_STOPS.indexOf(stop)];

  // Light theme surfaces.
  const lightSurface = WHITE;
  const lightBackground = hslToRgb(hue, clamp(sat * 0.14, 0, 100), 98);
  const lightInk = hslToRgb(hue, clamp(sat * 0.22, 0, 100), 14);
  const lightMutedInk = repairToTarget(
    { h: hue, s: clamp(sat * 0.16, 0, 100), l: 45 },
    lightSurface,
    WCAG.AA_NORMAL,
    -1,
  );
  const lightPrimary = repairToTarget(rampAt(600).hsl, lightSurface, WCAG.AA_NORMAL, -1);
  const lightBorder = repairToTarget(
    { h: hue, s: clamp(sat * 0.2, 0, 100), l: 60 },
    lightSurface,
    WCAG.UI_COMPONENT,
    -1,
  );

  // Dark theme: one ground, then Material 3 tint overlays for each elevation.
  const darkGround = hslToRgb(hue, clamp(sat * 0.3, 0, 100), groundL);
  const tint = rampAt(400).rgb;
  const darkElevations = ELEVATION_OPACITY.map((opacity, level) => {
    const rgb = compositeOver(tint, darkGround, opacity);
    return {
      level,
      label: ELEVATION_LABELS[level],
      opacity: Math.round(opacity * 100),
      hex: rgbToHex(rgb),
      rgb,
    };
  });
  const darkSurface = darkElevations[1].rgb;
  const darkInk = hslToRgb(hue, clamp(sat * 0.1, 0, 100), 96);
  const darkMutedInk = repairToTarget(
    { h: hue, s: clamp(sat * 0.14, 0, 100), l: 70 },
    darkSurface,
    WCAG.AA_NORMAL,
    1,
  );
  const darkPrimary = repairToTarget(rampAt(300).hsl, darkSurface, WCAG.AA_NORMAL, 1);
  const darkBorder = repairToTarget(
    { h: hue, s: clamp(sat * 0.24, 0, 100), l: 40 },
    darkSurface,
    WCAG.UI_COMPONENT,
    1,
  );

  // The label colour on a filled primary button, picked by measurement.
  const onLightPrimary =
    contrastRatio(WHITE, lightPrimary.rgb) >= contrastRatio(lightInk, lightPrimary.rgb)
      ? { rgb: WHITE, hex: rgbToHex(WHITE), name: "white" }
      : { rgb: lightInk, hex: rgbToHex(lightInk), name: "ink" };
  const darkButtonInk = hslToRgb(hue, clamp(sat * 0.4, 0, 100), NEAR_BLACK_L);
  const onDarkPrimary =
    contrastRatio(darkButtonInk, darkPrimary.rgb) >= contrastRatio(darkInk, darkPrimary.rgb)
      ? { rgb: darkButtonInk, hex: rgbToHex(darkButtonInk), name: "near-black" }
      : { rgb: darkInk, hex: rgbToHex(darkInk), name: "ink" };

  const money = MONEY_ORDER.map((id) => {
    const spec = MONEY_SPECS[id];
    const light = repairToTarget(
      { h: spec.hue, s: spec.sat, l: spec.lightLight },
      lightSurface,
      WCAG.AA_NORMAL,
      -1,
    );
    const dark = repairToTarget(
      { h: spec.hue, s: clamp(spec.sat - 8, 0, 100), l: spec.lightDark },
      darkSurface,
      WCAG.AA_NORMAL,
      1,
    );
    return {
      id,
      label: spec.label,
      lightHex: light.hex,
      lightRgb: light.rgb,
      lightRatio: light.ratio,
      darkHex: dark.hex,
      darkRgb: dark.rgb,
      darkRatio: dark.ratio,
      passesBoth: light.achieved && dark.achieved,
    };
  });

  const creditColour = money.find((item) => item.id === "credit");
  const debitColour = money.find((item) => item.id === "debit");
  // Credit and debit are the pair users misread most often. If they differ in
  // luminance as well as hue, the amount still reads for someone with a
  // red-green deficiency or on a monochrome screen.
  const creditDebitLightGap = round1(
    Math.abs(relativeLuminance(creditColour.lightRgb) - relativeLuminance(debitColour.lightRgb)) * 100,
  );
  const creditDebitDarkGap = round1(
    Math.abs(relativeLuminance(creditColour.darkRgb) - relativeLuminance(debitColour.darkRgb)) * 100,
  );

  const themes = [
    {
      id: "light",
      label: "Light theme",
      background: { label: "App background", hex: rgbToHex(lightBackground), rgb: lightBackground },
      surface: { label: "Card surface", hex: rgbToHex(lightSurface), rgb: lightSurface },
      ink: { label: "Body text", hex: rgbToHex(lightInk), rgb: lightInk },
      mutedInk: { label: "Secondary text", hex: lightMutedInk.hex, rgb: lightMutedInk.rgb },
      primary: { label: "Primary action", hex: lightPrimary.hex, rgb: lightPrimary.rgb },
      onPrimary: { label: "Label on primary", hex: onLightPrimary.hex, rgb: onLightPrimary.rgb },
      border: { label: "Input border", hex: lightBorder.hex, rgb: lightBorder.rgb },
    },
    {
      id: "dark",
      label: "Dark theme",
      background: { label: "App background", hex: darkElevations[0].hex, rgb: darkElevations[0].rgb },
      surface: { label: "Card surface", hex: darkElevations[1].hex, rgb: darkSurface },
      ink: { label: "Body text", hex: rgbToHex(darkInk), rgb: darkInk },
      mutedInk: { label: "Secondary text", hex: darkMutedInk.hex, rgb: darkMutedInk.rgb },
      primary: { label: "Primary action", hex: darkPrimary.hex, rgb: darkPrimary.rgb },
      onPrimary: { label: "Label on primary", hex: onDarkPrimary.hex, rgb: onDarkPrimary.rgb },
      border: { label: "Input border", hex: darkBorder.hex, rgb: darkBorder.rgb },
    },
  ];

  const auditDefs = [
    ["ink", "surface", "Body text on card", WCAG.AA_NORMAL],
    ["mutedInk", "surface", "Secondary text on card", WCAG.AA_NORMAL],
    ["primary", "surface", "Primary link on card", WCAG.AA_NORMAL],
    ["onPrimary", "primary", "Label on primary button", WCAG.AA_NORMAL],
    ["border", "surface", "Input border on card", WCAG.UI_COMPONENT],
    ["ink", "background", "Body text on app background", WCAG.AA_NORMAL],
  ];

  const audits = themes.map((theme) => {
    const rows = auditDefs.map(([fg, bg, label, threshold]) => {
      const ratio = round2(contrastRatio(theme[fg].rgb, theme[bg].rgb));
      return {
        id: `${theme.id}-${fg}-${bg}`,
        label,
        ratio,
        threshold,
        level: wcagLevel(ratio),
        passes: ratio >= threshold,
      };
    });
    return {
      themeId: theme.id,
      themeLabel: theme.label,
      rows,
      passing: rows.filter((row) => row.passes).length,
      total: rows.length,
    };
  });

  const totalPassing = audits.reduce((sum, audit) => sum + audit.passing, 0);
  const totalChecks = audits.reduce((sum, audit) => sum + audit.total, 0);

  return {
    brandId: brand.id,
    brandLabel: brand.label,
    brandNote: brand.note,
    variation: v,
    hue: Math.round(hue),
    saturation: Math.round(sat),
    darkGroundLightness: groundL,
    ramp,
    themes,
    darkElevations,
    money,
    audits,
    totalPassing,
    totalChecks,
    moneyPassingBoth: money.filter((item) => item.passesBoth).length,
    totalMoney: money.length,
    creditDebitLightGap,
    creditDebitDarkGap,
  };
}

const HASH = "#";

/** CSS custom properties for both themes plus the ramp. */
export function formatPaletteCss(palette) {
  if (!palette || palette.error) return "";
  const kebab = (value) => value.replace(/([A-Z])/g, "-$1").toLowerCase();
  const themeVars = (theme) =>
    ["background", "surface", "ink", "mutedInk", "primary", "onPrimary", "border"].map(
      (key) => `    --fin-${kebab(key)}: ${HASH}${theme[key].hex};`,
    );
  const light = palette.themes[0];
  const dark = palette.themes[1];
  return [
    `/* ${palette.brandLabel} — hue ${palette.hue}, variation ${palette.variation} */`,
    ":root {",
    ...palette.ramp.map((tone) => `  --fin-brand-${tone.stop}: ${HASH}${tone.hex};`),
    ...palette.money.map((item) => `  --fin-${item.id}: ${HASH}${item.lightHex};`),
    "",
    ...themeVars(light).map((line) => line.slice(2)),
    "}",
    "",
    "@media (prefers-color-scheme: dark) {",
    "  :root {",
    ...themeVars(dark),
    ...palette.money.map((item) => `    --fin-${item.id}: ${HASH}${item.darkHex};`),
    ...palette.darkElevations.map(
      (level) => `    --fin-elevation-${level.level}: ${HASH}${level.hex};`,
    ),
    "  }",
    "}",
  ].join("\n");
}

/** Plain-text summary with both audits. */
export function formatPaletteText(palette) {
  if (!palette || palette.error) return "";
  const themeBlock = (theme) =>
    ["background", "surface", "ink", "mutedInk", "primary", "onPrimary", "border"].map(
      (key) => `  ${theme[key].label.padEnd(22)} ${HASH}${theme[key].hex}`,
    );
  return [
    `${palette.brandLabel} — hue ${palette.hue}, saturation ${palette.saturation}%, variation ${palette.variation}`,
    "",
    "Brand ramp",
    ...palette.ramp.map((tone) => `  ${String(tone.stop).padEnd(5)} ${HASH}${tone.hex}`),
    "",
    ...palette.themes.flatMap((theme) => [theme.label, ...themeBlock(theme), ""]),
    "Dark elevation overlays (Material 3 surface tint)",
    ...palette.darkElevations.map(
      (level) => `  ${level.label.padEnd(24)} ${HASH}${level.hex}  tint ${level.opacity}%`,
    ),
    "",
    "Money semantics",
    ...palette.money.map(
      (item) =>
        `  ${item.label.padEnd(22)} light ${HASH}${item.lightHex} (${item.lightRatio}:1)  dark ${HASH}${item.darkHex} (${item.darkRatio}:1)`,
    ),
    "",
    ...palette.audits.flatMap((audit) => [
      `${audit.themeLabel} contrast — ${audit.passing}/${audit.total} pass`,
      ...audit.rows.map(
        (row) =>
          `  ${row.label.padEnd(32)} ${row.ratio}:1  needs ${row.threshold}:1  ${row.passes ? "pass" : "fail"}`,
      ),
      "",
    ]),
    `Credit vs debit luminance gap: ${palette.creditDebitLightGap} points light, ${palette.creditDebitDarkGap} points dark`,
  ].join("\n");
}
