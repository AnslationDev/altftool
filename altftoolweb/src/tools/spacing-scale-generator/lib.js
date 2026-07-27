/**
 * Spacing scale generation.
 *
 * Produces a token list from a base step, a scale type and an alignment grid,
 * plus ready-to-paste CSS custom properties and a Tailwind theme block.
 *
 * Pure functions only: no DOM, no React, no Date.now().
 */

/**
 * The CSS default root font size in every desktop and mobile browser is 16px,
 * so 1rem = 16px unless the user has changed it. Spacing is emitted in rem so
 * the scale grows with that preference.
 */
export const DEFAULT_ROOT_PX = 16;

/**
 * Alignment grids in common use. 8 is Material Design's layout grid, with 4
 * reserved for the inside of smaller components; 2 and 1 exist for hairline
 * adjustments. Snapping to a grid is what stops a modular scale producing
 * values like 10.67px that render with inconsistent subpixel gaps.
 */
export const GRID_OPTIONS = Object.freeze([1, 2, 4, 8]);

/**
 * The classic typographic ratios, reused for spacing so type and space share
 * one rhythm.
 */
export const RATIOS = Object.freeze([
  { id: "minor-second", name: "Minor second", label: "Minor second (1.067)", value: 1.067 },
  { id: "major-second", name: "Major second", label: "Major second (1.125)", value: 1.125 },
  { id: "minor-third", name: "Minor third", label: "Minor third (1.2)", value: 1.2 },
  { id: "major-third", name: "Major third", label: "Major third (1.25)", value: 1.25 },
  { id: "perfect-fourth", name: "Perfect fourth", label: "Perfect fourth (1.333)", value: 1.333 },
  { id: "augmented-fourth", name: "Augmented fourth", label: "Augmented fourth (1.414)", value: 1.414 },
  { id: "perfect-fifth", name: "Perfect fifth", label: "Perfect fifth (1.5)", value: 1.5 },
  { id: "golden", name: "Golden ratio", label: "Golden ratio (1.618)", value: 1.618 },
]);

export const SCALE_TYPES = Object.freeze([
  { id: "linear", name: "Linear", description: "Every step is the base added again: 4, 8, 12, 16." },
  { id: "geometric", name: "Modular", description: "Every step multiplies the previous one by the ratio." },
]);

export const NAMING_SCHEMES = Object.freeze([
  { id: "tshirt", name: "T-shirt (xs, sm, md, lg)" },
  { id: "numeric", name: "Numeric (space-1, space-2)" },
  { id: "hundred", name: "Hundreds (space-100, space-200)" },
]);

/** T-shirt sizes above and below the base, extended with a numeric prefix. */
const SMALLER = ["sm", "xs", "2xs", "3xs", "4xs", "5xs"];
const LARGER = ["lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl", "7xl", "8xl"];

/** Maximum number of steps the generator will emit. */
export const MAX_STEPS = 24;

function tshirtName(offset) {
  if (offset === 0) return "md";
  if (offset < 0) {
    const index = -offset - 1;
    return index < SMALLER.length ? SMALLER[index] : `${index + 1}xs`;
  }
  const index = offset - 1;
  return index < LARGER.length ? LARGER[index] : `${index + 1}xl`;
}

/** Snap a value to the nearest multiple of the grid, never below one grid unit. */
export function snapToGrid(value, grid) {
  if (!(grid > 0)) return value;
  return Math.max(grid, Math.round(value / grid) * grid);
}

/** Trim trailing zeros from a fixed-decimal string: 1.500 -> 1.5, 2.000 -> 2. */
export function trimNumber(value, decimals = 4) {
  if (!Number.isFinite(value)) return "0";
  const fixed = value.toFixed(decimals);
  return fixed.replace(/\.?0+$/, "") || "0";
}

/**
 * Generate the spacing scale.
 *
 * @param {object} input
 * @param {number} input.basePx      - the size of the base step in pixels.
 * @param {number} input.stepsBelow  - how many steps smaller than the base.
 * @param {number} input.stepsAbove  - how many steps larger than the base.
 * @param {"linear"|"geometric"} input.type
 * @param {number} [input.ratio]     - multiplier for a modular scale.
 * @param {number} [input.gridPx]    - alignment grid; 1 disables snapping.
 * @param {number} [input.rootPx]    - root font size used for the rem column.
 * @param {"tshirt"|"numeric"|"hundred"} [input.naming]
 * @param {string} [input.prefix]    - custom property prefix.
 * @returns {object} scale, or { error }.
 */
export function generateSpacingScale({
  basePx = 16,
  stepsBelow = 2,
  stepsAbove = 6,
  type = "linear",
  ratio = 1.5,
  gridPx = 4,
  rootPx = DEFAULT_ROOT_PX,
  naming = "tshirt",
  prefix = "space",
} = {}) {
  const base = Number(basePx);
  const below = Math.floor(Number(stepsBelow));
  const above = Math.floor(Number(stepsAbove));
  const grid = Number(gridPx);
  const root = Number(rootPx);
  const multiplier = Number(ratio);

  if (![base, below, above, grid, root, multiplier].every((value) => Number.isFinite(value))) {
    return { error: "Enter a number in every field." };
  }
  if (!SCALE_TYPES.some((entry) => entry.id === type)) {
    return { error: "Scale type must be linear or geometric." };
  }
  if (base <= 0) return { error: "Base step must be greater than zero pixels." };
  if (base > 512) return { error: "Base step is capped at 512px - that is a layout size, not a spacing step." };
  if (below < 0 || above < 0) return { error: "Step counts cannot be negative." };
  const total = below + above + 1;
  if (total < 2) return { error: "A scale needs at least two steps." };
  if (total > MAX_STEPS) return { error: `Keep the scale to ${MAX_STEPS} steps or fewer.` };
  if (!(grid > 0)) return { error: "Grid must be at least 1px. Use 1 to turn snapping off." };
  if (!(root > 0)) return { error: "Root font size must be greater than zero." };
  if (type === "geometric") {
    if (multiplier <= 1) return { error: "A modular ratio must be greater than 1, otherwise every step is the same size." };
    if (multiplier > 4) return { error: "A ratio above 4 doubles twice per step and is not usable as a spacing scale." };
  }
  const rows = [];
  for (let offset = -below; offset <= above; offset += 1) {
    // Linear: the base repeated. Modular: the base multiplied by the ratio.
    const raw = type === "linear" ? base * (offset + below + 1) : base * multiplier ** offset;
    const px = snapToGrid(raw, grid);
    const index = offset + below;
    const name =
      naming === "numeric"
        ? `${prefix}-${index + 1}`
        : naming === "hundred"
          ? `${prefix}-${(index + 1) * 100}`
          : `${prefix}-${tshirtName(type === "linear" ? index - below : offset)}`;
    rows.push({
      index,
      offset,
      name,
      rawPx: raw,
      px,
      snapped: Math.abs(raw - px) > 0.001,
      rem: px / root,
      remLabel: `${trimNumber(px / root)}rem`,
      pxLabel: `${trimNumber(px, 2)}px`,
    });
  }

  const seen = new Map();
  for (const row of rows) {
    seen.set(row.px, (seen.get(row.px) || 0) + 1);
  }
  const collapsed = [...seen.entries()].filter(([, count]) => count > 1);

  const smallest = rows[0];
  const largest = rows[rows.length - 1];

  const issues = [];
  if (collapsed.length > 0) {
    issues.push({
      level: "error",
      message: `${collapsed.map(([px, count]) => `${count} steps both land on ${px}px`).join("; ")}. Lower the grid, raise the ratio, or drop a step.`,
    });
  }
  const heavilySnapped = rows.filter((row) => row.rawPx > 0 && Math.abs(row.rawPx - row.px) / row.rawPx > 0.15);
  if (heavilySnapped.length > 0) {
    issues.push({
      level: "warning",
      message: `${heavilySnapped.map((row) => row.name).join(", ")} moved more than 15% to reach the ${grid}px grid, so the scale no longer follows its own ratio there.`,
    });
  }
  if (grid > 1 && base % grid !== 0) {
    issues.push({
      level: "warning",
      message: `The ${base}px base is not a multiple of the ${grid}px grid, so even the base step gets snapped.`,
    });
  }
  if (largest.px / smallest.px > 64) {
    issues.push({
      level: "info",
      message: `The scale spans ${trimNumber(largest.px / smallest.px, 1)}x from smallest to largest. That is usually two scales - one for component padding, one for section rhythm.`,
    });
  }
  if (rows.some((row) => row.px < 2)) {
    issues.push({
      level: "warning",
      message: "A step under 2px is smaller than a hairline border and will not read as spacing.",
    });
  }

  const status = issues.some((issue) => issue.level === "error")
    ? "error"
    : issues.some((issue) => issue.level === "warning")
      ? "warning"
      : "ok";

  return {
    rows,
    // Alias kept so callers can read either name.
    steps: rows,
    total: rows.length,
    base,
    grid,
    root,
    type,
    ratio: multiplier,
    smallestPx: smallest.px,
    largestPx: largest.px,
    spanFactor: largest.px / smallest.px,
    snappedCount: rows.filter((row) => row.snapped).length,
    issues,
    status,
  };
}

/** CSS custom properties for the scale, ready to paste into :root. */
export function toCssVariables(scale) {
  if (!scale || scale.error || !Array.isArray(scale.rows)) return "";
  const lines = scale.rows.map((row) => `  --${row.name}: ${row.remLabel}; /* ${row.pxLabel} */`);
  return [":root {", ...lines, "}"].join("\n");
}

/** A Tailwind v4 @theme block for the scale. */
export function toTailwindTheme(scale) {
  if (!scale || scale.error || !Array.isArray(scale.rows)) return "";
  const lines = scale.rows.map((row) => `  --spacing-${row.name.replace(/^.*?-/, "")}: ${row.remLabel};`);
  return ["@theme {", ...lines, "}"].join("\n");
}

/** A plain JSON token object, for design-token pipelines. */
export function toJsonTokens(scale) {
  if (!scale || scale.error || !Array.isArray(scale.rows)) return "";
  const object = {};
  for (const row of scale.rows) {
    object[row.name] = { value: row.remLabel, px: row.px };
  }
  return JSON.stringify(object, null, 2);
}
