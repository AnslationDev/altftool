/**
 * Button box geometry and target-size conformance.
 *
 * Pure functions only: no DOM, no React, no Date.now().
 */

/**
 * WCAG 2.2 SC 2.5.8 Target Size (Minimum), Level AA: a pointer target must be
 * at least 24 by 24 CSS pixels, unless one of the exceptions applies - the most
 * useful being the spacing exception, modelled below.
 */
export const WCAG_AA_MIN_TARGET_PX = 24;

/**
 * WCAG 2.1 SC 2.5.5 Target Size, Level AAA: at least 44 by 44 CSS pixels,
 * except for inline targets, essential presentation and equivalents.
 */
export const WCAG_AAA_MIN_TARGET_PX = 44;

/** Apple Human Interface Guidelines: minimum 44 by 44 pt tap target. */
export const APPLE_HIG_MIN_PT = 44;

/** Material Design: minimum 48 by 48 dp touch target. */
export const MATERIAL_MIN_DP = 48;

/** Material Design: at least 8 dp between adjacent touch targets. */
export const MATERIAL_MIN_GAP_DP = 8;

/**
 * Rough average glyph advance width for a humanist UI sans at regular weight,
 * as a fraction of the font size. Real width depends on the typeface and the
 * exact string, so this is exposed as an input rather than baked in - measure
 * your own label if the width matters.
 */
export const AVERAGE_GLYPH_WIDTH_EM = 0.52;

export const STANDARDS = Object.freeze([
  {
    id: "wcag-aa",
    name: "WCAG 2.2 SC 2.5.8 (AA)",
    min: WCAG_AA_MIN_TARGET_PX,
    unit: "CSS px",
    note: "24 x 24, or the spacing exception.",
    allowsSpacingException: true,
  },
  {
    id: "wcag-aaa",
    name: "WCAG 2.1 SC 2.5.5 (AAA)",
    min: WCAG_AAA_MIN_TARGET_PX,
    unit: "CSS px",
    note: "44 x 44 for any non-inline target.",
    allowsSpacingException: false,
  },
  {
    id: "apple",
    name: "Apple HIG",
    min: APPLE_HIG_MIN_PT,
    unit: "pt",
    note: "44 x 44 pt minimum tap target.",
    allowsSpacingException: false,
  },
  {
    id: "material",
    name: "Material Design",
    min: MATERIAL_MIN_DP,
    unit: "dp",
    note: "48 x 48 dp touch target, 8 dp apart.",
    allowsSpacingException: false,
  },
]);

/** Round to two decimals without producing -0 or floating-point noise. */
function round2(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * The rendered box of a text button.
 *
 * Height is the content box (line-height x font-size) plus padding and border
 * on both edges - the CSS border-box height with the default box model.
 *
 * @param {object} input
 * @returns {object} box, or { error }.
 */
export function computeButtonBox({
  fontSizePx = 16,
  lineHeight = 1.25,
  paddingYPx = 10,
  paddingXPx = 16,
  borderPx = 1,
  labelChars = 4,
  glyphWidthEm = AVERAGE_GLYPH_WIDTH_EM,
  iconPx = 0,
  iconGapPx = 8,
} = {}) {
  const values = {
    fontSizePx: Number(fontSizePx),
    lineHeight: Number(lineHeight),
    paddingYPx: Number(paddingYPx),
    paddingXPx: Number(paddingXPx),
    borderPx: Number(borderPx),
    labelChars: Number(labelChars),
    glyphWidthEm: Number(glyphWidthEm),
    iconPx: Number(iconPx),
    iconGapPx: Number(iconGapPx),
  };
  if (Object.values(values).some((value) => !Number.isFinite(value))) {
    return { error: "Enter a number in every field." };
  }
  if (values.fontSizePx <= 0) return { error: "Font size must be greater than zero." };
  if (values.fontSizePx > 200) return { error: "Font size is capped at 200px." };
  if (values.lineHeight <= 0) return { error: "Line height must be greater than zero." };
  if (values.lineHeight > 4) return { error: "A unitless line height above 4 is not a button." };
  if (values.paddingYPx < 0 || values.paddingXPx < 0) return { error: "Padding cannot be negative." };
  if (values.borderPx < 0) return { error: "Border width cannot be negative." };
  if (values.labelChars < 0) return { error: "Label length cannot be negative." };
  if (values.glyphWidthEm <= 0 || values.glyphWidthEm > 2) {
    return { error: "Average glyph width should be between 0 and 2 em." };
  }
  if (values.iconPx < 0 || values.iconGapPx < 0) return { error: "Icon size and gap cannot be negative." };

  const textHeight = values.lineHeight * values.fontSizePx;
  const contentHeight = Math.max(textHeight, values.iconPx);
  const height = contentHeight + 2 * values.paddingYPx + 2 * values.borderPx;

  const labelWidth = values.labelChars * values.fontSizePx * values.glyphWidthEm;
  const iconWidth = values.iconPx > 0 ? values.iconPx + (values.labelChars > 0 ? values.iconGapPx : 0) : 0;
  const width = labelWidth + iconWidth + 2 * values.paddingXPx + 2 * values.borderPx;

  return {
    ...values,
    textHeight: round2(textHeight),
    contentHeight: round2(contentHeight),
    labelWidth: round2(labelWidth),
    iconWidth: round2(iconWidth),
    height: round2(height),
    width: round2(width),
    smallestSide: round2(Math.min(height, width)),
    isIconOnly: values.labelChars === 0 && values.iconPx > 0,
  };
}

/**
 * Vertical padding needed to reach a target height.
 * @returns {number} pixels per edge; 0 when the box is already tall enough.
 */
export function requiredPaddingY(targetHeightPx, contentHeightPx, borderPx) {
  const needed = (targetHeightPx - contentHeightPx - 2 * borderPx) / 2;
  return needed > 0 ? round2(needed) : 0;
}

/**
 * Horizontal padding needed to reach a target width.
 * @returns {number} pixels per edge; 0 when the box is already wide enough.
 */
export function requiredPaddingX(targetWidthPx, contentWidthPx, borderPx) {
  const needed = (targetWidthPx - contentWidthPx - 2 * borderPx) / 2;
  return needed > 0 ? round2(needed) : 0;
}

/**
 * WCAG 2.2 SC 2.5.8 spacing exception.
 *
 * An undersized target still conforms if a 24 CSS pixel diameter circle centred
 * on its bounding box does not intersect the circle of an adjacent target. For
 * two equal targets in a row, the centres are (size + gap) apart and the two
 * radii add up to 24, so the test reduces to size + gap >= 24.
 *
 * @returns {{ passes: boolean, centreDistance: number, shortfall: number }}
 */
export function checkSpacingException(sizePx, gapPx, threshold = WCAG_AA_MIN_TARGET_PX) {
  const size = Number(sizePx);
  const gap = Number(gapPx);
  if (!Number.isFinite(size) || !Number.isFinite(gap) || size < 0 || gap < 0) {
    return { passes: false, centreDistance: 0, shortfall: threshold };
  }
  const centreDistance = size + gap;
  return {
    passes: centreDistance >= threshold,
    centreDistance: round2(centreDistance),
    shortfall: centreDistance >= threshold ? 0 : round2(threshold - centreDistance),
  };
}

/**
 * Evaluate a button box against every target-size standard.
 *
 * @param {object} input
 * @param {object} input.box - the result of computeButtonBox.
 * @param {number} [input.gapXPx] - horizontal gap to the next target.
 * @param {number} [input.gapYPx] - vertical gap to the next target.
 * @returns {object} report, or { error }.
 */
export function evaluateButtonSpec({ box, gapXPx = 8, gapYPx = 8 } = {}) {
  if (!box || box.error) return { error: box?.error || "Compute the button box first." };
  const gapX = Number(gapXPx);
  const gapY = Number(gapYPx);
  if (!Number.isFinite(gapX) || !Number.isFinite(gapY) || gapX < 0 || gapY < 0) {
    return { error: "Gaps between targets cannot be negative." };
  }

  const rows = STANDARDS.map((standard) => {
    const meetsHeight = box.height >= standard.min;
    const meetsWidth = box.width >= standard.min;
    const meets = meetsHeight && meetsWidth;
    const spacingX = checkSpacingException(box.width, gapX, standard.min);
    const spacingY = checkSpacingException(box.height, gapY, standard.min);
    const spacingSaves = standard.allowsSpacingException && !meets && spacingX.passes && spacingY.passes;
    return {
      id: standard.id,
      name: standard.name,
      min: standard.min,
      unit: standard.unit,
      note: standard.note,
      meetsHeight,
      meetsWidth,
      meets,
      spacingSaves,
      passes: meets || spacingSaves,
      heightShortfall: meetsHeight ? 0 : round2(standard.min - box.height),
      widthShortfall: meetsWidth ? 0 : round2(standard.min - box.width),
      neededPaddingY: requiredPaddingY(standard.min, box.contentHeight, box.borderPx),
      neededPaddingX: requiredPaddingX(standard.min, box.labelWidth + box.iconWidth, box.borderPx),
    };
  });

  const passCount = rows.filter((row) => row.passes).length;
  const strictest = rows.reduce((worst, row) => (row.min > worst.min ? row : worst), rows[0]);

  const issues = [];
  const failing = rows.filter((row) => !row.passes);
  if (failing.length > 0) {
    issues.push({
      level: failing.some((row) => row.id === "wcag-aa") ? "error" : "warning",
      message: `Misses ${failing.map((row) => row.name).join(", ")}. The box is ${box.height}px tall by ${box.width}px wide.`,
    });
  }
  const aa = rows.find((row) => row.id === "wcag-aa");
  if (aa && !aa.meets && aa.spacingSaves) {
    issues.push({
      level: "info",
      message: `Under ${WCAG_AA_MIN_TARGET_PX}px but conforming through the SC 2.5.8 spacing exception: centres are ${round2(box.width + gapX)}px apart horizontally and ${round2(box.height + gapY)}px vertically, both at or above ${WCAG_AA_MIN_TARGET_PX}px.`,
    });
  }
  if (gapX < MATERIAL_MIN_GAP_DP || gapY < MATERIAL_MIN_GAP_DP) {
    issues.push({
      level: "warning",
      message: `Material Design asks for at least ${MATERIAL_MIN_GAP_DP}dp between touch targets; this layout has ${Math.min(gapX, gapY)}.`,
    });
  }
  if (box.isIconOnly && box.height !== box.width) {
    issues.push({
      level: "info",
      message: "An icon-only button is normally square. Match the horizontal padding to the vertical padding.",
    });
  }
  if (box.fontSizePx < 14) {
    issues.push({
      level: "warning",
      message: `A ${box.fontSizePx}px button label is small for a primary action; 14 to 16px is the usual floor for interface text.`,
    });
  }
  if (passCount === rows.length) {
    issues.push({ level: "info", message: "The box clears every standard checked, including the 48dp Material target." });
  }

  const status = issues.some((issue) => issue.level === "error")
    ? "error"
    : issues.some((issue) => issue.level === "warning")
      ? "warning"
      : "ok";

  return {
    rows,
    passCount,
    total: rows.length,
    strictest,
    gapX,
    gapY,
    // Padding that would clear the strictest standard on both axes.
    recommendedPaddingY: requiredPaddingY(strictest.min, box.contentHeight, box.borderPx),
    recommendedPaddingX: requiredPaddingX(strictest.min, box.labelWidth + box.iconWidth, box.borderPx),
    issues,
    status,
  };
}

/** A CSS rule for the button box. */
export function toCss(box, report, selector = ".button") {
  if (!box || box.error || !report || report.error) return "";
  const lines = [
    `${selector} {`,
    `  box-sizing: border-box;`,
    `  min-height: ${round2(Math.max(box.height, report.strictest.min))}px;`,
    `  min-width: ${round2(Math.max(box.width, report.strictest.min))}px;`,
    `  padding: ${box.paddingYPx}px ${box.paddingXPx}px;`,
    `  font-size: ${box.fontSizePx}px;`,
    `  line-height: ${box.lineHeight};`,
    `  border-width: ${box.borderPx}px;`,
    `  border-style: solid;`,
    `}`,
    ``,
    `${selector} + ${selector} {`,
    `  margin-inline-start: ${report.gapX}px;`,
    `}`,
  ];
  return lines.join("\n");
}
