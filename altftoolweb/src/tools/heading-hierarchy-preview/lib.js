/**
 * Heading hierarchy from a modular type scale.
 *
 * A modular scale multiplies a base size by a constant ratio for each step:
 *     size(step) = base * ratio^step
 * The ratios below are the classical musical intervals designers use for type
 * scales, from the minor second (1.067) to the golden ratio (1.618).
 *
 * Line height is not constant across a scale. Long body lines need generous
 * leading — WCAG 2.1 success criterion 1.4.12 (Text Spacing) requires that text
 * stays readable at a line height of at least 1.5 times the font size — while a
 * 60px display line needs far less. This module walks the leading down from the
 * body value by a fixed amount per doubling of size, with a floor of 1.05.
 *
 * Space around a heading follows the Gestalt proximity principle: a heading
 * belongs to the text below it, so the gap above is set larger than the gap below.
 */

/** Classical modular scale ratios. */
export const TYPE_SCALE_RATIOS = Object.freeze([
  { id: "minor-second", label: "Minor second", ratio: 1.067 },
  { id: "major-second", label: "Major second", ratio: 1.125 },
  { id: "minor-third", label: "Minor third", ratio: 1.2 },
  { id: "major-third", label: "Major third", ratio: 1.25 },
  { id: "perfect-fourth", label: "Perfect fourth", ratio: 1.333 },
  { id: "augmented-fourth", label: "Augmented fourth", ratio: 1.414 },
  { id: "perfect-fifth", label: "Perfect fifth", ratio: 1.5 },
  { id: "golden-ratio", label: "Golden ratio", ratio: 1.618 },
]);

/** WCAG 2.1 SC 1.4.12 Text Spacing: body text must remain readable at 1.5x line height. */
export const WCAG_MIN_BODY_LINE_HEIGHT = 1.5;
/** WCAG 2.1 SC 1.4.12 also requires paragraph spacing of at least 2x the font size. */
export const WCAG_MIN_PARAGRAPH_SPACING = 2;

/** Leading lost per doubling of font size, and the floor it may not pass. */
export const LINE_HEIGHT_DROP_PER_DOUBLING = 0.18;
export const MIN_LINE_HEIGHT = 1.05;

/** Space above and below a heading, as a multiple of that heading's own font size. */
export const SPACE_ABOVE_FACTOR = 0.75;
export const SPACE_BELOW_FACTOR = 0.35;

/** Above this size a display setting can safely carry one weight step less. */
export const OPTICAL_LIGHTEN_THRESHOLD_PX = 48;
export const WEIGHT_STEP = 100;
export const MIN_HEADING_WEIGHT = 400;
export const MAX_HEADING_WEIGHT = 900;

export const MIN_BASE_SIZE_PX = 8;
export const MAX_BASE_SIZE_PX = 120;
export const MIN_RATIO = 1.01;
export const MAX_RATIO = 2.5;
export const MIN_ROOT_SIZE_PX = 8;
export const MAX_ROOT_SIZE_PX = 32;

/** H1 sits six steps above the body size, H6 one step above. */
export const HEADING_LEVELS = Object.freeze([
  { tag: "h1", step: 6 },
  { tag: "h2", step: 5 },
  { tag: "h3", step: 4 },
  { tag: "h4", step: 3 },
  { tag: "h5", step: 2 },
  { tag: "h6", step: 1 },
]);

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const round = (value, places = 2) => {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
};

/** Size in px for a given step of a modular scale. */
export function scaleSizePx(baseSizePx, ratio, step) {
  if (!isFiniteNumber(baseSizePx) || !isFiniteNumber(ratio) || !isFiniteNumber(step)) return NaN;
  return baseSizePx * ratio ** step;
}

/** Recommended unitless line height for a size, walked down from the body value. */
export function lineHeightFor(sizePx, baseSizePx, bodyLineHeight) {
  if (!(sizePx > 0) || !(baseSizePx > 0) || !isFiniteNumber(bodyLineHeight)) return NaN;
  const doublings = Math.log2(sizePx / baseSizePx);
  return Math.max(MIN_LINE_HEIGHT, bodyLineHeight - LINE_HEIGHT_DROP_PER_DOUBLING * doublings);
}

/** Heading weight, lightened one step once the size is display-sized. */
export function weightFor(sizePx, headingWeight) {
  if (!isFiniteNumber(sizePx) || !isFiniteNumber(headingWeight)) return NaN;
  if (sizePx < OPTICAL_LIGHTEN_THRESHOLD_PX) return headingWeight;
  return clamp(headingWeight - WEIGHT_STEP, MIN_HEADING_WEIGHT, MAX_HEADING_WEIGHT);
}

/**
 * Build the whole H1-H6 hierarchy plus the body style it hangs off.
 *
 * @param {object} input
 * @param {number} input.baseSizePx      body font size in px
 * @param {number} input.ratio           modular scale ratio
 * @param {number} [input.rootSizePx]    html font size used to convert to rem
 * @param {number} [input.headingWeight] 400-900
 * @param {number} [input.bodyLineHeight] unitless
 * @returns {object} { levels, body, warnings } or { error }
 */
export function buildHeadingHierarchy({
  baseSizePx,
  ratio,
  rootSizePx = 16,
  headingWeight = 700,
  bodyLineHeight = WCAG_MIN_BODY_LINE_HEIGHT,
} = {}) {
  if (!isFiniteNumber(baseSizePx) || baseSizePx < MIN_BASE_SIZE_PX || baseSizePx > MAX_BASE_SIZE_PX) {
    return { error: `Base font size must be between ${MIN_BASE_SIZE_PX}px and ${MAX_BASE_SIZE_PX}px.` };
  }
  if (!isFiniteNumber(ratio) || ratio < MIN_RATIO || ratio > MAX_RATIO) {
    return { error: `Scale ratio must be between ${MIN_RATIO} and ${MAX_RATIO}.` };
  }
  if (!isFiniteNumber(rootSizePx) || rootSizePx < MIN_ROOT_SIZE_PX || rootSizePx > MAX_ROOT_SIZE_PX) {
    return { error: `Root font size must be between ${MIN_ROOT_SIZE_PX}px and ${MAX_ROOT_SIZE_PX}px.` };
  }
  if (
    !isFiniteNumber(headingWeight) ||
    headingWeight < MIN_HEADING_WEIGHT ||
    headingWeight > MAX_HEADING_WEIGHT
  ) {
    return { error: `Heading weight must be between ${MIN_HEADING_WEIGHT} and ${MAX_HEADING_WEIGHT}.` };
  }
  if (!isFiniteNumber(bodyLineHeight) || bodyLineHeight < 1 || bodyLineHeight > 3) {
    return { error: "Body line height must be between 1 and 3." };
  }

  const minSpaceAbovePx = baseSizePx * bodyLineHeight;

  const levels = HEADING_LEVELS.map(({ tag, step }) => {
    const sizePx = scaleSizePx(baseSizePx, ratio, step);
    const lineHeight = lineHeightFor(sizePx, baseSizePx, bodyLineHeight);
    const spaceAbovePx = Math.max(sizePx * SPACE_ABOVE_FACTOR, minSpaceAbovePx);
    const spaceBelowPx = sizePx * SPACE_BELOW_FACTOR;
    return {
      tag,
      step,
      sizePx: round(sizePx, 2),
      sizeRem: round(sizePx / rootSizePx, 3),
      lineHeight: round(lineHeight, 3),
      lineBoxPx: round(sizePx * lineHeight, 2),
      weight: weightFor(sizePx, headingWeight),
      spaceAbovePx: round(spaceAbovePx, 2),
      spaceAboveRem: round(spaceAbovePx / rootSizePx, 3),
      spaceBelowPx: round(spaceBelowPx, 2),
      spaceBelowRem: round(spaceBelowPx / rootSizePx, 3),
    };
  });

  const body = {
    tag: "body",
    step: 0,
    sizePx: round(baseSizePx, 2),
    sizeRem: round(baseSizePx / rootSizePx, 3),
    lineHeight: round(bodyLineHeight, 3),
    lineBoxPx: round(baseSizePx * bodyLineHeight, 2),
    weight: 400,
    spaceAbovePx: 0,
    spaceAboveRem: 0,
    spaceBelowPx: round(baseSizePx * WCAG_MIN_PARAGRAPH_SPACING - baseSizePx * bodyLineHeight, 2),
    spaceBelowRem: round(
      (baseSizePx * WCAG_MIN_PARAGRAPH_SPACING - baseSizePx * bodyLineHeight) / rootSizePx,
      3,
    ),
  };

  const warnings = [];
  if (bodyLineHeight < WCAG_MIN_BODY_LINE_HEIGHT) {
    warnings.push(
      `Body line height is below ${WCAG_MIN_BODY_LINE_HEIGHT}. WCAG 2.1 SC 1.4.12 requires text to stay readable when a reader raises it to ${WCAG_MIN_BODY_LINE_HEIGHT}.`,
    );
  }
  if (baseSizePx < 16) {
    warnings.push("Body text below 16px is hard work on phones — 16px is the usual practical floor.");
  }
  const h1 = levels[0];
  const h2 = levels[1];
  if (h1.sizePx - h2.sizePx < 2) {
    warnings.push("H1 and H2 are within 2px of each other — this ratio will not read as a hierarchy.");
  }
  if (h1.sizePx > 200) {
    warnings.push("H1 is over 200px. Consider a smaller ratio or setting the H1 size by hand.");
  }

  return { levels, body, warnings, ratio, baseSizePx, rootSizePx, headingWeight, bodyLineHeight };
}

/** Ready-to-paste CSS for the whole hierarchy. */
export function toCss(hierarchy, { unit = "rem" } = {}) {
  if (!hierarchy || hierarchy.error) return "";
  const value = (row, key) =>
    unit === "rem" ? `${row[`${key}Rem`]}rem` : `${row[`${key}Px`]}px`;

  const blocks = [
    [
      "body {",
      `  font-size: ${value(hierarchy.body, "size")};`,
      `  line-height: ${hierarchy.body.lineHeight};`,
      "}",
    ].join("\n"),
    [
      "p + p {",
      `  margin-top: ${value(hierarchy.body, "spaceBelow")};`,
      "}",
    ].join("\n"),
  ];

  hierarchy.levels.forEach((row) => {
    blocks.push(
      [
        `${row.tag} {`,
        `  font-size: ${value(row, "size")};`,
        `  line-height: ${row.lineHeight};`,
        `  font-weight: ${row.weight};`,
        `  margin-block-start: ${value(row, "spaceAbove")};`,
        `  margin-block-end: ${value(row, "spaceBelow")};`,
        "}",
      ].join("\n"),
    );
  });

  return blocks.join("\n\n");
}
