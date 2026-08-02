/**
 * CRT scan line / shadow mask overlay generator.
 * Pure module: no DOM, no React, no clock, no randomness.
 *
 * The overlay is a repeating stripe pattern described by two numbers:
 *   period    — distance from the start of one line to the start of the next
 *   thickness — how much of that period the drawn line occupies
 * Coverage is thickness / period, and because the line is drawn with an alpha
 * value the average light lost over the whole overlay is coverage x opacity.
 */

/**
 * Active picture lines in the classic broadcast and PC standards, used to work
 * out a period that matches a real CRT at a given output height.
 *  - NTSC 525-line systems carry 486 active lines (SMPTE 170M).
 *  - PAL/SECAM 625-line systems carry 576 active lines (ITU-R BT.470).
 *  - VGA 640x480 and CGA 320x200 are the PC modes people usually mean.
 */
export const CRT_STANDARDS = {
  ntsc: { id: "ntsc", label: "NTSC 525i (486 active lines)", activeLines: 486 },
  pal: { id: "pal", label: "PAL 625i (576 active lines)", activeLines: 576 },
  vga: { id: "vga", label: "VGA 640×480", activeLines: 480 },
  cga: { id: "cga", label: "CGA 320×200", activeLines: 200 },
};

export const STYLES = {
  horizontal: { id: "horizontal", label: "Horizontal scan lines", axis: "vertical" },
  vertical: { id: "vertical", label: "Aperture grille (vertical)", axis: "horizontal" },
  triad: { id: "triad", label: "RGB shadow mask triads", axis: "horizontal" },
  interlace: { id: "interlace", label: "Interlaced field lines", axis: "vertical" },
};

export const TONES = {
  dark: { id: "dark", label: "Dark lines (dim the image)", color: "black" },
  light: { id: "light", label: "Light lines (bloom the image)", color: "white" },
};

export const MIN_SIZE = 16;
export const MAX_SIZE = 8192;
export const MIN_PERIOD = 2;
export const MAX_PERIOD = 200;

/**
 * A stripe pattern whose period falls below about 4 CSS pixels will alias into
 * moiré on most displays once the overlay is scaled, so it is flagged.
 */
export const ALIASING_PERIOD_PX = 4;

/** Second field of an interlaced pair is drawn fainter than the first. */
export const INTERLACE_SECOND_FIELD_FACTOR = 0.45;

/** RGB mask stripe colours, given as CSS colour keywords. */
export const TRIAD_COLORS = ["red", "lime", "blue"];

const round2 = (n) => Math.round(n * 100) / 100;
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

/**
 * Period in pixels that reproduces a CRT standard at a given output height.
 * The raw height/activeLines ratio is clamped to the period range computeOverlay
 * actually accepts (MIN_PERIOD-MAX_PERIOD): below MIN_PERIOD the stripes would be
 * thinner than the overlay engine can draw without moiré/validation failure, so
 * the period is floored there instead of producing a value the tool would reject.
 */
export function periodForStandard(height, standardId) {
  const h = Number(height);
  const standard = CRT_STANDARDS[standardId];
  if (!standard) return { error: "Choose one of the listed CRT standards." };
  if (!Number.isFinite(h) || h < MIN_SIZE) {
    return { error: `Output height must be at least ${MIN_SIZE} pixels.` };
  }
  const rawPeriod = h / standard.activeLines;
  const period = clamp(round2(rawPeriod), MIN_PERIOD, MAX_PERIOD);
  return { period, rawPeriod: round2(rawPeriod), activeLines: standard.activeLines };
}

/**
 * Work out the overlay geometry and its optical effect.
 */
export function computeOverlay({
  width = 1920,
  height = 1080,
  style = "horizontal",
  period = 4,
  thickness = 2,
  opacity = 0.35,
  tone = "dark",
} = {}) {
  const w = Number(width);
  const h = Number(height);
  const p = Number(period);
  const t = Number(thickness);
  const a = Number(opacity);

  if (![w, h, p, t, a].every(Number.isFinite)) {
    return { error: "Enter valid numbers for size, period, thickness and opacity." };
  }
  if (w < MIN_SIZE || w > MAX_SIZE || h < MIN_SIZE || h > MAX_SIZE) {
    return { error: `Width and height must be between ${MIN_SIZE} and ${MAX_SIZE} pixels.` };
  }
  if (p < MIN_PERIOD || p > MAX_PERIOD) {
    return { error: `Line period must be between ${MIN_PERIOD} and ${MAX_PERIOD} pixels.` };
  }
  if (a < 0 || a > 1) {
    return { error: "Opacity must be between 0 and 1." };
  }

  const styleSpec = STYLES[style] || STYLES.horizontal;
  const toneSpec = TONES[tone] || TONES.dark;
  const isTriad = styleSpec.id === "triad";

  if (!isTriad && (t < 0.5 || t >= p)) {
    return { error: "Line thickness must be at least 0.5 px and smaller than the period." };
  }

  // The triad mask tints the whole period in three equal stripes.
  const effectiveThickness = isTriad ? p : t;
  const coverage = clamp(effectiveThickness / p, 0, 1);

  const axisLength = styleSpec.axis === "vertical" ? h : w;
  const repeats = styleSpec.id === "interlace" ? p * 2 : p;
  const lineCount = Math.floor(axisLength / repeats) * (styleSpec.id === "interlace" ? 2 : 1);

  // Average alpha over the whole overlay. Interlace adds a fainter second field.
  let averageAlpha = coverage * a;
  if (styleSpec.id === "interlace") {
    averageAlpha = (coverage * a + coverage * a * INTERLACE_SECOND_FIELD_FACTOR) / 2;
  }

  const brightnessChange = toneSpec.id === "dark" ? -averageAlpha * 100 : averageAlpha * 100;

  return {
    width: Math.round(w),
    height: Math.round(h),
    style: styleSpec.id,
    styleLabel: styleSpec.label,
    axis: styleSpec.axis,
    tone: toneSpec.id,
    toneLabel: toneSpec.label,
    toneColor: toneSpec.color,
    period: round2(p),
    thickness: round2(effectiveThickness),
    gap: round2(Math.max(0, p - effectiveThickness)),
    opacity: round2(a),
    coveragePercent: round2(coverage * 100),
    averageAlphaPercent: round2(averageAlpha * 100),
    brightnessChangePercent: round2(brightnessChange),
    lineCount,
    linesPerThousandPx: round2((1000 / repeats) * (styleSpec.id === "interlace" ? 2 : 1)),
    aliasingRisk: p < ALIASING_PERIOD_PX,
    isTriad,
  };
}

const attr = (n) => round2(n);

/** Build the overlay as a self-contained transparent SVG string. */
export function buildOverlaySvg(spec) {
  if (!spec || spec.error) return "";
  const { width, height, period, thickness, opacity, toneColor, style } = spec;
  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    "<defs>",
  ];

  if (style === "vertical") {
    parts.push(
      `<pattern id="scan" patternUnits="userSpaceOnUse" width="${attr(period)}" height="1">`,
      `<rect x="0" y="0" width="${attr(thickness)}" height="1" fill="${toneColor}" opacity="${opacity}" />`,
      "</pattern>",
    );
  } else if (style === "triad") {
    const stripe = period / 3;
    parts.push(`<pattern id="scan" patternUnits="userSpaceOnUse" width="${attr(period)}" height="1">`);
    TRIAD_COLORS.forEach((color, index) => {
      parts.push(
        `<rect x="${attr(stripe * index)}" y="0" width="${attr(stripe)}" height="1" fill="${color}" opacity="${opacity}" />`,
      );
    });
    parts.push("</pattern>");
  } else if (style === "interlace") {
    parts.push(
      `<pattern id="scan" patternUnits="userSpaceOnUse" width="1" height="${attr(period * 2)}">`,
      `<rect x="0" y="0" width="1" height="${attr(thickness)}" fill="${toneColor}" opacity="${opacity}" />`,
      `<rect x="0" y="${attr(period)}" width="1" height="${attr(thickness)}" fill="${toneColor}" opacity="${round2(opacity * INTERLACE_SECOND_FIELD_FACTOR)}" />`,
      "</pattern>",
    );
  } else {
    parts.push(
      `<pattern id="scan" patternUnits="userSpaceOnUse" width="1" height="${attr(period)}">`,
      `<rect x="0" y="0" width="1" height="${attr(thickness)}" fill="${toneColor}" opacity="${opacity}" />`,
      "</pattern>",
    );
  }

  parts.push("</defs>");
  parts.push(`<rect x="0" y="0" width="${width}" height="${height}" fill="url(#scan)" />`);
  parts.push("</svg>");
  return parts.join("\n");
}

/**
 * A pure-CSS version of the same overlay, using colour keywords and hard stops
 * so no rgba() values are needed. Apply it to an ::after layer over the image.
 */
export function buildOverlayCss(spec) {
  if (!spec || spec.error) return "";
  const { period, thickness, opacity, toneColor, style } = spec;
  const direction = style === "vertical" || style === "triad" ? "to right" : "to bottom";

  let gradient;
  if (style === "triad") {
    const stripe = round2(period / 3);
    gradient = `repeating-linear-gradient(${direction}, ${TRIAD_COLORS[0]} 0 ${stripe}px, ${TRIAD_COLORS[1]} ${stripe}px ${round2(stripe * 2)}px, ${TRIAD_COLORS[2]} ${round2(stripe * 2)}px ${round2(period)}px)`;
  } else if (style === "interlace") {
    // color-mix keeps the fainter second field without needing an rgba() value.
    const faint = `color-mix(in srgb, ${toneColor} ${round2(INTERLACE_SECOND_FIELD_FACTOR * 100)}%, transparent)`;
    gradient = `repeating-linear-gradient(${direction}, ${toneColor} 0 ${round2(thickness)}px, transparent ${round2(thickness)}px ${round2(period)}px, ${faint} ${round2(period)}px ${round2(period + thickness)}px, transparent ${round2(period + thickness)}px ${round2(period * 2)}px)`;
  } else {
    gradient = `repeating-linear-gradient(${direction}, ${toneColor} 0 ${round2(thickness)}px, transparent ${round2(thickness)}px ${round2(period)}px)`;
  }

  return [
    ".crt-overlay {",
    "  position: relative;",
    "}",
    ".crt-overlay::after {",
    '  content: "";',
    "  position: absolute;",
    "  inset: 0;",
    "  pointer-events: none;",
    `  background-image: ${gradient};`,
    `  opacity: ${opacity};`,
    style === "triad" ? "  mix-blend-mode: multiply;" : "  mix-blend-mode: normal;",
    "}",
    "@media (prefers-reduced-motion: reduce) {",
    "  .crt-overlay::after { animation: none; }",
    "}",
  ].join("\n");
}

/** Copy-friendly summary of the overlay settings and its optical effect. */
export function formatOverlayText(spec) {
  if (!spec || spec.error) return "";
  return [
    `${spec.styleLabel} — ${spec.width} × ${spec.height} px`,
    `Period ${spec.period} px · line ${spec.thickness} px · gap ${spec.gap} px`,
    `Opacity ${spec.opacity} · ${spec.toneLabel}`,
    `Coverage ${spec.coveragePercent}% of the surface`,
    `Average alpha ${spec.averageAlphaPercent}% (perceived brightness change ${spec.brightnessChangePercent}%)`,
    `${spec.lineCount} lines across the ${spec.axis} axis · ${spec.linesPerThousandPx} lines per 1000 px`,
    spec.aliasingRisk
      ? `Warning: a ${spec.period} px period is below the ${ALIASING_PERIOD_PX} px moiré threshold.`
      : "Period is above the moiré threshold.",
  ].join("\n");
}
