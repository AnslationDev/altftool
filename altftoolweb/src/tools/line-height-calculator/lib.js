/**
 * Line height calculator.
 * Pure module: no DOM, no React, no clock, no randomness.
 *
 * Line height is driven by two things a designer already knows: the font size
 * and how wide the column is. The column width is first converted to characters
 * per line, then leading is adjusted away from the role's base ratio:
 *
 *   cpl   = measure / (fontSize * averageCharacterWidthRatio)
 *   ratio = base + (cpl - IDEAL_CPL) * CPL_COEFFICIENT
 *                - (fontSize - REFERENCE_SIZE) * SIZE_COEFFICIENT
 *
 * The direction of both adjustments follows long-standing typographic
 * practice: longer lines need more leading so the eye finds the next line, and
 * larger type needs proportionally less because the gap grows with the size.
 */

/**
 * Bringhurst's Elements of Typographic Style gives 45-75 characters as the
 * satisfactory range for a single-column page, with 66 as the widely quoted
 * ideal. These are the anchors for the measure assessment.
 */
export const MIN_COMFORTABLE_CPL = 45;
export const IDEAL_CPL = 66;
export const MAX_COMFORTABLE_CPL = 75;

/** Adjustment applied per character of measure away from the ideal. */
export const CPL_COEFFICIENT = 0.006;

/** Browser default body size; adjustments are measured relative to it. */
export const REFERENCE_SIZE_PX = 16;

/** Adjustment applied per pixel of font size above the reference size. */
export const SIZE_COEFFICIENT = 0.012;

/**
 * WCAG 2.x SC 1.4.8 Visual Presentation (AAA) asks for line spacing of at
 * least 1.5 within paragraphs and paragraph spacing of at least 1.5 times the
 * line spacing. SC 1.4.12 Text Spacing (AA) requires content to stay usable
 * when a reader forces a line height of 1.5.
 */
export const WCAG_MIN_BODY_RATIO = 1.5;
export const WCAG_PARAGRAPH_SPACING_FACTOR = 1.5;

/**
 * A rough average glyph advance as a fraction of the font size. Around 0.5 is
 * typical for a humanist sans at default width; condensed faces run nearer
 * 0.42 and wide slab faces nearer 0.58. Adjustable because it is face-specific.
 */
export const DEFAULT_CHAR_WIDTH_RATIO = 0.5;
export const MIN_CHAR_WIDTH_RATIO = 0.3;
export const MAX_CHAR_WIDTH_RATIO = 0.9;

export const MIN_FONT_SIZE = 6;
export const MAX_FONT_SIZE = 200;
export const MIN_MEASURE = 40;
export const MAX_MEASURE = 4000;

export const ROLES = {
  body: { id: "body", label: "Body copy", base: 1.5, min: 1.4, max: 1.9 },
  ui: { id: "ui", label: "Interface text and labels", base: 1.4, min: 1.2, max: 1.6 },
  caption: { id: "caption", label: "Captions and footnotes", base: 1.45, min: 1.3, max: 1.7 },
  heading: { id: "heading", label: "Headings", base: 1.2, min: 1.0, max: 1.4 },
  display: { id: "display", label: "Display and hero type", base: 1.05, min: 0.9, max: 1.2 },
};

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const round2 = (n) => Math.round(n * 100) / 100;
const round1 = (n) => Math.round(n * 10) / 10;

/** Snap a pixel value to the nearest multiple of a baseline unit. */
export function snapToGrid(px, unit) {
  const value = Number(px);
  const step = Number(unit);
  if (!Number.isFinite(value)) return 0;
  if (!Number.isFinite(step) || step <= 0) return value;
  return Math.round(value / step) * step;
}

/**
 * Recommend a line height for a font size and column width.
 */
export function computeLineHeight({
  fontSize = 16,
  measure = 640,
  role = "body",
  charWidthRatio = DEFAULT_CHAR_WIDTH_RATIO,
  baselineUnit = 4,
} = {}) {
  const size = Number(fontSize);
  const width = Number(measure);
  const ratioWidth = Number(charWidthRatio);
  const unit = Number(baselineUnit);

  if (![size, width, ratioWidth, unit].every(Number.isFinite)) {
    return { error: "Enter valid numbers for font size, measure, character width and baseline." };
  }
  if (size < MIN_FONT_SIZE || size > MAX_FONT_SIZE) {
    return { error: `Font size must be between ${MIN_FONT_SIZE} and ${MAX_FONT_SIZE} pixels.` };
  }
  if (width < MIN_MEASURE || width > MAX_MEASURE) {
    return { error: `Measure must be between ${MIN_MEASURE} and ${MAX_MEASURE} pixels.` };
  }
  if (ratioWidth < MIN_CHAR_WIDTH_RATIO || ratioWidth > MAX_CHAR_WIDTH_RATIO) {
    return {
      error: `Average character width should be between ${MIN_CHAR_WIDTH_RATIO} and ${MAX_CHAR_WIDTH_RATIO} of the font size.`,
    };
  }
  if (unit <= 0 || unit > 48) {
    return { error: "Baseline unit must be greater than 0 and no more than 48 pixels." };
  }

  const roleSpec = ROLES[role] || ROLES.body;

  const averageAdvance = size * ratioWidth;
  const cpl = width / averageAdvance;

  const raw =
    roleSpec.base +
    (cpl - IDEAL_CPL) * CPL_COEFFICIENT -
    (size - REFERENCE_SIZE_PX) * SIZE_COEFFICIENT;
  const ratio = round2(clamp(raw, roleSpec.min, roleSpec.max));
  const clamped = raw < roleSpec.min || raw > roleSpec.max;

  const lineHeightPx = round2(size * ratio);
  const snappedPx = snapToGrid(lineHeightPx, unit);
  const snappedRatio = round2(snappedPx / size);

  // Comfortable measure range for this size, from the CPL band.
  const minMeasure = Math.round(MIN_COMFORTABLE_CPL * averageAdvance);
  const idealMeasure = Math.round(IDEAL_CPL * averageAdvance);
  const maxMeasure = Math.round(MAX_COMFORTABLE_CPL * averageAdvance);

  let measureVerdict;
  if (cpl < MIN_COMFORTABLE_CPL) measureVerdict = "too narrow";
  else if (cpl > MAX_COMFORTABLE_CPL) measureVerdict = "too wide";
  else measureVerdict = "comfortable";

  const isBodyRole = roleSpec.id === "body" || roleSpec.id === "caption";
  const meetsWcagSpacing = !isBodyRole || ratio >= WCAG_MIN_BODY_RATIO;

  return {
    role: roleSpec.id,
    roleLabel: roleSpec.label,
    fontSize: round2(size),
    measure: Math.round(width),
    charWidthRatio: round2(ratioWidth),
    baselineUnit: round2(unit),
    cpl: round1(cpl),
    measureVerdict,
    minMeasure,
    idealMeasure,
    maxMeasure,
    ratio,
    clamped,
    lineHeightPx,
    snappedPx: round2(snappedPx),
    snappedRatio,
    linesPerBaselineUnit: round2(snappedPx / unit),
    paragraphSpacingPx: round2(lineHeightPx * WCAG_PARAGRAPH_SPACING_FACTOR),
    isBodyRole,
    // The 45-75 character band describes running text. A headline is a single
    // line chosen for impact, so the verdict is advisory there.
    measureBandApplies: roleSpec.id !== "heading" && roleSpec.id !== "display",
    meetsWcagSpacing,
    wcagMinRatio: WCAG_MIN_BODY_RATIO,
  };
}

/** CSS declaration block for the recommendation. */
export function formatLineHeightCss(result) {
  if (!result || result.error) return "";
  return [
    ".text-block {",
    `  font-size: ${result.fontSize}px;`,
    `  line-height: ${result.ratio};`,
    `  max-width: ${result.idealMeasure}px;`,
    "}",
    ".text-block p + p {",
    `  margin-top: ${result.paragraphSpacingPx}px;`,
    "}",
    "/* Baseline-grid variant */",
    ".text-block--grid {",
    `  line-height: ${result.snappedPx}px; /* ${result.snappedRatio} at ${result.fontSize}px */`,
    "}",
  ].join("\n");
}

/** Copy-friendly summary. */
export function formatLineHeightText(result) {
  if (!result || result.error) return "";
  return [
    `${result.roleLabel} at ${result.fontSize}px over a ${result.measure}px measure`,
    `Recommended line height: ${result.ratio} (${result.lineHeightPx}px)`,
    `Snapped to a ${result.baselineUnit}px baseline: ${result.snappedPx}px (${result.snappedRatio})`,
    `Characters per line: ${result.cpl} — ${result.measureVerdict}`,
    `Comfortable measure at this size: ${result.minMeasure}-${result.maxMeasure}px (ideal ${result.idealMeasure}px)`,
    `Paragraph spacing: ${result.paragraphSpacingPx}px`,
    result.isBodyRole
      ? result.meetsWcagSpacing
        ? `Meets the WCAG 1.4.8 line spacing minimum of ${result.wcagMinRatio}.`
        : `Below the WCAG 1.4.8 line spacing minimum of ${result.wcagMinRatio} for body text.`
      : "WCAG 1.4.8 line spacing applies to blocks of body text, not headings.",
  ].join("\n");
}
