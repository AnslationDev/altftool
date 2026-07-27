/**
 * Clinical interface palette generator.
 *
 * Pure module: no DOM, no React, no clock, no randomness.
 *
 * Two checks run on every generated palette:
 *  1. WCAG 2.x contrast, using the relative-luminance formula on sRGB.
 *  2. Separation of the status colours under red-green colour vision
 *     deficiency, using the Viénot, Brettel & Mollon (1999) dichromat
 *     simulation matrices applied to linear RGB, then measuring CIE76 colour
 *     difference in CIELAB with a D65 white point.
 *
 * Red-green deficiency is the case that matters for a red/amber/green clinical
 * status set: protanopia and deuteranopia together account for the large
 * majority of colour vision deficiency, which affects roughly 8% of men and
 * 0.5% of women of Northern European descent. Tritanopia is not simulated here
 * because published linear-RGB matrices for it are far less consistent, and it
 * is rarer by two orders of magnitude.
 */

/** WCAG 2.x contrast thresholds (SC 1.4.3, 1.4.6, 1.4.11). */
export const WCAG = {
  AA_NORMAL: 4.5,
  AAA_NORMAL: 7,
  /** Large text: 24px regular or 18.66px bold and above. */
  AA_LARGE: 3,
  /** Non-text UI components and graphical objects. */
  UI_COMPONENT: 3,
};

/**
 * CIE76 colour difference of about 2.3 is the classic just-noticeable
 * difference for two large patches shown side by side. Status chips in a
 * clinical list are small, separated in space and often seen in poor ward
 * lighting, so this tool uses a much larger practical target. This is a design
 * heuristic, not a published standard.
 */
export const MIN_STATUS_DELTA_E = 20;

/**
 * Lightness separation in CIELAB L*. If two status colours also differ in
 * lightness, they stay tellable apart in greyscale print and for anyone whose
 * hue discrimination is unreliable. Also a design heuristic.
 */
export const MIN_STATUS_DELTA_L = 12;

/** Highest variation index before the counter wraps. */
export const MAX_VARIATION = 4;

/** Base hue families used for the calm, non-alarming part of the interface. */
export const BASES = {
  clinicalBlue: {
    id: "clinicalBlue",
    label: "Clinical blue",
    note: "The default of most hospital software; reads as institutional and neutral.",
    hue: 210,
    chroma: 34,
  },
  calmTeal: {
    id: "calmTeal",
    label: "Calm teal",
    note: "Softer than blue, common in wellness and outpatient products.",
    hue: 184,
    chroma: 30,
  },
  neutralSlate: {
    id: "neutralSlate",
    label: "Neutral slate",
    note: "Almost achromatic, so clinical status colours carry all the meaning.",
    hue: 218,
    chroma: 12,
  },
  sageGreen: {
    id: "sageGreen",
    label: "Sage green",
    note: "Quiet green base; keep the healthy-status green distinct from it.",
    hue: 158,
    chroma: 22,
  },
};

/** Light and dark interface grounds. */
export const MODES = {
  light: {
    id: "light",
    label: "Light interface",
    background: { s: 0.28, l: 98 },
    surface: { s: 0.34, l: 100 },
    raised: { s: 0.5, l: 96 },
    border: { s: 0.5, l: 88 },
    controlBorder: { s: 0.7, l: 58 },
    ink: { s: 0.55, l: 18 },
    mutedInk: { s: 0.45, l: 42 },
    primary: { s: 1, l: 38 },
    /** On a light ground, status colours are darkened to carry text. */
    statusDirection: -1,
    statusLightBump: 0,
    statusSatAdjust: 0,
    /** Soft chip fill lightness. */
    statusSoftL: 94,
  },
  dark: {
    id: "dark",
    label: "Dark interface",
    background: { s: 0.7, l: 10 },
    surface: { s: 0.65, l: 14 },
    raised: { s: 0.6, l: 19 },
    border: { s: 0.6, l: 28 },
    controlBorder: { s: 0.6, l: 52 },
    ink: { s: 0.25, l: 95 },
    mutedInk: { s: 0.35, l: 70 },
    primary: { s: 0.9, l: 66 },
    /** On a dark ground, status colours are lightened. */
    statusDirection: 1,
    statusLightBump: 14,
    statusSatAdjust: 6,
    statusSoftL: 20,
  },
};

/**
 * Clinical status set. Hues follow the convention clinicians already read:
 * red for critical, amber for abnormal, green for within range, blue for
 * informational, violet for awaiting result. Hue is fixed — only lightness and
 * saturation are tuned per mode — because changing a status hue would change
 * its meaning.
 */
export const STATUS_ORDER = ["critical", "warning", "normal", "info", "pending"];

/**
 * `darkOffset` is an extra lightness nudge used only on dark grounds. Pastel
 * status colours on a dark surface collapse towards each other once the
 * red-green axis is removed, so the set is deliberately spread further apart
 * in lightness there. The offsets below were chosen by searching for the
 * combination that maximises the worst-case CIE76 separation under simulated
 * protanopia and deuteranopia while keeping every colour at or above 4.5:1
 * against the card surface.
 */
const STATUS_SPECS = {
  critical: { label: "Critical", hue: 358, sat: 72, lightBase: 46, darkOffset: 4, note: "Act now: red alerts and out-of-range highs." },
  warning: { label: "Abnormal", hue: 34, sat: 84, lightBase: 46, darkOffset: -4, note: "Borderline or trending the wrong way." },
  normal: { label: "Within range", hue: 148, sat: 62, lightBase: 40, darkOffset: 18, note: "Result is inside the reference interval." },
  info: { label: "Informational", hue: 214, sat: 66, lightBase: 46, darkOffset: 0, note: "Notes, guidance and non-clinical messages." },
  // Deliberately near-neutral. A saturated violet sits close to the
  // informational blue once the red-green axis is removed, so "awaiting" is
  // given a slate tone instead — the convention most clinical systems use.
  pending: { label: "Awaiting result", hue: 262, sat: 16, lightBase: 44, darkOffset: 12, note: "Sample taken, result not yet back." },
};

/** Viénot, Brettel & Mollon (1999) dichromat matrices, applied to linear RGB. */
export const DICHROMAT_MATRICES = {
  protanopia: [
    [0.11238, 0.88762, 0.0],
    [0.11238, 0.88762, 0.0],
    [0.00401, -0.00401, 1.0],
  ],
  deuteranopia: [
    [0.29275, 0.70725, 0.0],
    [0.29275, 0.70725, 0.0],
    [-0.02234, 0.02234, 1.0],
  ],
};

export const DICHROMAT_LABELS = {
  protanopia: "Protanopia (no L-cone)",
  deuteranopia: "Deuteranopia (no M-cone)",
};

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

/** IEC 61966-2-1 sRGB electro-optical transfer function. */
function toLinear(channel) {
  const c = clamp(Number(channel) || 0, 0, 255) / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** Inverse of toLinear, back to sRGB 0-255. */
function fromLinear(value) {
  const v = clamp(Number(value) || 0, 0, 1);
  const encoded = v <= 0.0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - 0.055;
  return Math.round(clamp(encoded, 0, 1) * 255);
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

/** CIE 1931 XYZ tristimulus values of the D65 white point, Y scaled to 1. */
const D65 = { x: 0.95047, y: 1.0, z: 1.08883 };
/** CIE standard: epsilon = 216/24389, kappa = 24389/27. */
const LAB_EPSILON = 216 / 24389;
const LAB_KAPPA = 24389 / 27;

/** sRGB 0-255 to CIELAB (D65). */
export function rgbToLab({ r, g, b }) {
  const rl = toLinear(r);
  const gl = toLinear(g);
  const bl = toLinear(b);
  // sRGB D65 primaries, IEC 61966-2-1.
  const x = 0.4124564 * rl + 0.3575761 * gl + 0.1804375 * bl;
  const y = 0.2126729 * rl + 0.7151522 * gl + 0.072175 * bl;
  const z = 0.0193339 * rl + 0.119192 * gl + 0.9503041 * bl;
  const f = (t) => (t > LAB_EPSILON ? Math.cbrt(t) : (LAB_KAPPA * t + 16) / 116);
  const fx = f(x / D65.x);
  const fy = f(y / D65.y);
  const fz = f(z / D65.z);
  return { L: 116 * fy - 16, a: 500 * (fx - fy), b: 200 * (fy - fz) };
}

/** CIE76 colour difference: the Euclidean distance in CIELAB. */
export function deltaE76(a, b) {
  const la = rgbToLab(a);
  const lb = rgbToLab(b);
  return Math.sqrt((la.L - lb.L) ** 2 + (la.a - lb.a) ** 2 + (la.b - lb.b) ** 2);
}

/** Absolute difference in CIELAB lightness. */
export function deltaLightness(a, b) {
  return Math.abs(rgbToLab(a).L - rgbToLab(b).L);
}

/** Simulate how a dichromat sees an sRGB colour. */
export function simulateDichromacy(rgb, type) {
  const matrix = DICHROMAT_MATRICES[type];
  if (!matrix) return { ...rgb };
  const v = [toLinear(rgb.r), toLinear(rgb.g), toLinear(rgb.b)];
  const out = matrix.map((row) => row[0] * v[0] + row[1] * v[1] + row[2] * v[2]);
  return { r: fromLinear(out[0]), g: fromLinear(out[1]), b: fromLinear(out[2]) };
}

/** Lightness is walked in 1% steps; 100 steps covers the whole axis. */
const MAX_REPAIR_STEPS = 100;

/**
 * Walk a colour's lightness, hue held fixed, until it meets `target` against
 * `background`. `direction` is -1 to darken, +1 to lighten. Returns the
 * original colour untouched if it already passes, so a status colour is only
 * moved when it has to be.
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

/**
 * Build a clinical palette with status colours and a colour-blindness audit.
 */
export function generateMedicalPalette({
  baseId = "clinicalBlue",
  mode = "light",
  statusIntensity = 0,
  variation = 0,
} = {}) {
  const base = BASES[baseId];
  const modeSpec = MODES[mode];
  if (!base) return { error: "Choose one of the listed base hues." };
  if (!modeSpec) return { error: "Interface mode must be light or dark." };

  const intensity = Number(statusIntensity);
  const step = Number(variation);
  if (!Number.isFinite(intensity)) return { error: "Status intensity must be a number." };
  if (intensity < -20 || intensity > 20) {
    return { error: "Keep status intensity between -20 and 20." };
  }
  if (!Number.isFinite(step) || step < 0) {
    return { error: "Variation must be zero or a positive whole number." };
  }

  const v = Math.round(step) % (MAX_VARIATION + 1);
  // Variations rotate the calm base hue only. Status hues never move, because
  // their meaning is conventional.
  const hueNudge = v * 6;
  const baseHue = mod360(base.hue + hueNudge);

  const neutral = (spec) => {
    const rgb = hslToRgb(baseHue, clamp(base.chroma * spec.s, 0, 100), spec.l);
    return { hex: rgbToHex(rgb), rgb, hsl: { h: baseHue, s: Math.round(base.chroma * spec.s), l: spec.l } };
  };

  const surfaces = {
    background: { role: "background", label: "App background", ...neutral(modeSpec.background) },
    surface: { role: "surface", label: "Card surface", ...neutral(modeSpec.surface) },
    raised: { role: "raised", label: "Raised / table row", ...neutral(modeSpec.raised) },
    border: { role: "border", label: "Divider (decorative)", ...neutral(modeSpec.border) },
    controlBorder: { role: "controlBorder", label: "Input and control border", ...neutral(modeSpec.controlBorder) },
    ink: { role: "ink", label: "Body text", ...neutral(modeSpec.ink) },
    mutedInk: { role: "mutedInk", label: "Secondary text", ...neutral(modeSpec.mutedInk) },
    primary: { role: "primary", label: "Primary action", ...neutral(modeSpec.primary) },
  };

  const surfaceRgb = surfaces.surface.rgb;

  // Low-chroma bases can leave the primary action colour short of 4.5:1 on the
  // card, so it is walked to the body-text threshold before anything else uses
  // it. Interactive text has to clear the same bar as body copy.
  const repairedPrimary = repairToTarget(
    surfaces.primary.hsl,
    surfaceRgb,
    WCAG.AA_NORMAL,
    modeSpec.statusDirection,
  );
  surfaces.primary = {
    ...surfaces.primary,
    hex: repairedPrimary.hex,
    rgb: repairedPrimary.rgb,
    hsl: repairedPrimary.hsl,
  };

  // Same treatment for the control border, held to the 3:1 that SC 1.4.11 asks
  // of any boundary a user needs in order to find an input.
  const repairedControlBorder = repairToTarget(
    surfaces.controlBorder.hsl,
    surfaceRgb,
    WCAG.UI_COMPONENT,
    modeSpec.statusDirection,
  );
  surfaces.controlBorder = {
    ...surfaces.controlBorder,
    hex: repairedControlBorder.hex,
    rgb: repairedControlBorder.rgb,
    hsl: repairedControlBorder.hsl,
  };

  const statuses = STATUS_ORDER.map((id) => {
    const spec = STATUS_SPECS[id];
    // Lightness moves with the mode, the per-status dark offset and the
    // intensity slider. Hue never moves: its meaning is conventional.
    const darkOffset = modeSpec.statusDirection < 0 ? 0 : spec.darkOffset;
    const lightness = clamp(
      spec.lightBase + modeSpec.statusLightBump + darkOffset + intensity,
      5,
      95,
    );
    const saturation = clamp(spec.sat + modeSpec.statusSatAdjust, 0, 100);
    const rgb = hslToRgb(spec.hue, saturation, lightness);
    const onSurface = round2(contrastRatio(rgb, surfaceRgb));
    // A soft chip fill: same hue, pulled towards the ground.
    const softRgb = hslToRgb(spec.hue, clamp(saturation * 0.65, 0, 100), modeSpec.statusSoftL);

    // Amber and mid green rarely clear 4.5:1 as words on a white card, so a
    // separate text tone of the same hue is walked until it does. The vivid
    // value stays available for dots, bars and chart series.
    const text = repairToTarget(
      { h: spec.hue, s: saturation, l: lightness },
      surfaceRgb,
      WCAG.AA_NORMAL,
      modeSpec.statusDirection,
    );
    const textOnSoft = round2(contrastRatio(text.rgb, softRgb));

    return {
      id,
      label: spec.label,
      note: spec.note,
      hue: spec.hue,
      hex: rgbToHex(rgb),
      rgb,
      hsl: { h: spec.hue, s: Math.round(saturation), l: Math.round(lightness) },
      softHex: rgbToHex(softRgb),
      softRgb,
      textHex: text.hex,
      textRatio: text.ratio,
      textMoved: text.moved,
      textAchieved: text.achieved,
      lab: { L: round1(rgbToLab(rgb).L) },
      onSurfaceRatio: onSurface,
      onSurfaceLevel: wcagLevel(onSurface),
      textOnSoftRatio: textOnSoft,
      usableAsText: onSurface >= WCAG.AA_NORMAL,
      usableAsIndicator: onSurface >= WCAG.UI_COMPONENT,
    };
  });

  // Every unordered pair of status colours, measured under normal vision and
  // under each simulated dichromacy.
  const cvdTypes = Object.keys(DICHROMAT_MATRICES);
  const pairs = [];
  for (let i = 0; i < statuses.length; i += 1) {
    for (let j = i + 1; j < statuses.length; j += 1) {
      const a = statuses[i];
      const b = statuses[j];
      const normalDeltaE = round1(deltaE76(a.rgb, b.rgb));
      const deltaL = round1(deltaLightness(a.rgb, b.rgb));
      const simulated = cvdTypes.map((type) => {
        const sa = simulateDichromacy(a.rgb, type);
        const sb = simulateDichromacy(b.rgb, type);
        return { type, label: DICHROMAT_LABELS[type], deltaE: round1(deltaE76(sa, sb)) };
      });
      const worst = simulated.reduce((low, item) => (item.deltaE < low.deltaE ? item : low));
      pairs.push({
        id: `${a.id}-${b.id}`,
        aId: a.id,
        bId: b.id,
        label: `${a.label} vs ${b.label}`,
        normalDeltaE,
        deltaL,
        simulated,
        worstDeltaE: worst.deltaE,
        worstType: worst.label,
        safe: worst.deltaE >= MIN_STATUS_DELTA_E,
        lightnessSafe: deltaL >= MIN_STATUS_DELTA_L,
      });
    }
  }

  const contrastPairs = [
    ["ink", "surface", "Body text on card", WCAG.AA_NORMAL],
    ["ink", "background", "Body text on app background", WCAG.AA_NORMAL],
    ["mutedInk", "surface", "Secondary text on card", WCAG.AA_NORMAL],
    ["primary", "surface", "Primary link on card", WCAG.AA_NORMAL],
    // SC 1.4.11 applies to borders that identify a control, not to purely
    // decorative dividers, so only the control border is held to 3:1.
    ["controlBorder", "surface", "Input border on card", WCAG.UI_COMPONENT],
  ].map(([fg, bg, label, threshold]) => {
    const ratio = round2(contrastRatio(surfaces[fg].rgb, surfaces[bg].rgb));
    return {
      id: `${fg}-on-${bg}`,
      label,
      ratio,
      threshold,
      level: wcagLevel(ratio),
      passes: ratio >= threshold,
    };
  });

  return {
    baseId: base.id,
    baseLabel: base.label,
    baseNote: base.note,
    mode: modeSpec.id,
    modeLabel: modeSpec.label,
    variation: v,
    statusIntensity: intensity,
    baseHue,
    surfaces: Object.values(surfaces),
    surfaceMap: surfaces,
    statuses,
    contrastPairs,
    passingContrastPairs: contrastPairs.filter((pair) => pair.passes).length,
    totalContrastPairs: contrastPairs.length,
    statusPairs: pairs,
    safeStatusPairs: pairs.filter((pair) => pair.safe).length,
    totalStatusPairs: pairs.length,
    statusesReadableAsText: statuses.filter((status) => status.usableAsText).length,
    statusTextTonesFixed: statuses.filter((status) => status.textMoved > 0).length,
    minStatusDeltaE: MIN_STATUS_DELTA_E,
    minStatusDeltaL: MIN_STATUS_DELTA_L,
  };
}

const HASH = "#";

/** CSS custom properties for surfaces and statuses. */
export function formatPaletteCss(palette) {
  if (!palette || palette.error) return "";
  const kebab = (value) => value.replace(/([A-Z])/g, "-$1").toLowerCase();
  const lines = [
    ...palette.surfaces.map((item) => `  --med-${kebab(item.role)}: ${HASH}${item.hex};`),
    ...palette.statuses.flatMap((status) => [
      `  --med-${status.id}: ${HASH}${status.hex};`,
      `  --med-${status.id}-text: ${HASH}${status.textHex};`,
      `  --med-${status.id}-soft: ${HASH}${status.softHex};`,
    ]),
  ];
  return [
    `/* ${palette.baseLabel} — ${palette.modeLabel}, variation ${palette.variation} */`,
    ":root {",
    ...lines,
    "}",
  ].join("\n");
}

/** Plain-text summary with both audits. */
export function formatPaletteText(palette) {
  if (!palette || palette.error) return "";
  return [
    `${palette.baseLabel} — ${palette.modeLabel}, variation ${palette.variation}`,
    "",
    "Surfaces",
    ...palette.surfaces.map((item) => `${item.label.padEnd(22)} ${HASH}${item.hex}`),
    "",
    "Status colours",
    ...palette.statuses.map(
      (s) =>
        `${s.label.padEnd(16)} dot ${HASH}${s.hex} (${s.onSurfaceRatio}:1)  text ${HASH}${s.textHex} (${s.textRatio}:1)  soft ${HASH}${s.softHex}`,
    ),
    "",
    "Interface contrast",
    ...palette.contrastPairs.map(
      (p) => `${p.label.padEnd(32)} ${p.ratio}:1  needs ${p.threshold}:1  ${p.passes ? "pass" : "fail"}`,
    ),
    "",
    `Colour-blindness separation (CIE76, target ${palette.minStatusDeltaE})`,
    ...palette.statusPairs.map(
      (p) =>
        `${p.label.padEnd(34)} normal ${String(p.normalDeltaE).padEnd(6)} worst ${String(p.worstDeltaE).padEnd(6)} ${p.safe ? "ok" : "too close"}`,
    ),
    "",
    `Status pairs still separable under red-green CVD: ${palette.safeStatusPairs}/${palette.totalStatusPairs}`,
  ].join("\n");
}
