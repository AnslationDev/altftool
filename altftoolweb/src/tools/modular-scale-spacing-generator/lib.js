/**
 * Modular Spacing Scale Generator — pure generation module.
 * No React, no DOM, no clock reads.
 *
 * A modular scale takes a base value and multiplies it by a fixed ratio for
 * each step: value(n) = base x ratio^n. Steps below the base use negative n,
 * which divides instead.
 */

/**
 * Scale ratios, each named after the musical interval its frequency ratio
 * matches. Designers borrowed the intervals because the resulting sequence
 * keeps a constant proportional relationship between neighbouring steps.
 */
export const RATIOS = [
  { id: "minor-second", label: "Minor second", value: 16 / 15, note: "16:15 — very tight, many steps" },
  { id: "major-second", label: "Major second", value: 9 / 8, note: "9:8 — gentle, good for dense UI" },
  { id: "minor-third", label: "Minor third", value: 6 / 5, note: "6:5 — the common UI spacing choice" },
  { id: "major-third", label: "Major third", value: 5 / 4, note: "5:4 — clear separation between steps" },
  { id: "perfect-fourth", label: "Perfect fourth", value: 4 / 3, note: "4:3 — classic editorial rhythm" },
  { id: "augmented-fourth", label: "Augmented fourth", value: Math.SQRT2, note: "√2 — the ISO paper ratio" },
  { id: "perfect-fifth", label: "Perfect fifth", value: 3 / 2, note: "3:2 — big jumps, few steps needed" },
  { id: "golden", label: "Golden ratio", value: (1 + Math.sqrt(5)) / 2, note: "φ ≈ 1.618 — dramatic, sparse" },
];

/**
 * Grid sizes design systems snap to. A 4 or 8 point grid keeps spacing values
 * divisible so components line up when they are composed.
 */
export const SNAP_OPTIONS = [
  { id: "none", label: "No snapping", value: 0 },
  { id: "two", label: "2 pt grid", value: 2 },
  { id: "four", label: "4 pt grid", value: 4 },
  { id: "eight", label: "8 pt grid", value: 8 },
];

export const NAMING_SCHEMES = [
  { id: "tshirt", label: "T-shirt (xs, sm, md, lg)" },
  { id: "numeric", label: "Numeric (100, 200, 300)" },
  { id: "step", label: "Sequential (space-1, space-2)" },
];

/** Browsers default the root font size to 16 px, which is what rem is relative to. */
export const DEFAULT_ROOT_PX = 16;

export const MAX_STEPS_EACH_WAY = 12;
export const MAX_BASE_PX = 512;
export const MIN_RATIO = 1.01;
export const MAX_RATIO = 4;

/** T-shirt names going up from the base, and going down from it. */
const TSHIRT_UP = ["md", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl", "7xl", "8xl", "9xl", "10xl", "11xl", "12xl"];
const TSHIRT_DOWN = ["sm", "xs", "2xs", "3xs", "4xs", "5xs", "6xs", "7xs", "8xs", "9xs", "10xs", "11xs", "12xs"];

const round = (value, places) => {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
};

export function getRatio(ratioId) {
  return RATIOS.find((ratio) => ratio.id === ratioId) || null;
}

/** Snap a value to the nearest multiple of `grid`, never returning zero. */
export function snapToGrid(value, grid) {
  const v = Number(value);
  const g = Number(grid);
  if (!Number.isFinite(v)) return null;
  if (!Number.isFinite(g) || g <= 0) return v;
  const snapped = Math.round(v / g) * g;
  // A value that rounds down to nothing is useless as a spacing token.
  return snapped === 0 ? g : snapped;
}

function nameFor(index, scheme, minIndex, maxIndex) {
  if (scheme === "tshirt") {
    if (index >= 0) return TSHIRT_UP[Math.min(index, TSHIRT_UP.length - 1)];
    return TSHIRT_DOWN[Math.min(-index - 1, TSHIRT_DOWN.length - 1)];
  }
  if (scheme === "numeric") {
    return String((index - minIndex + 1) * 100);
  }
  return `space-${index - minIndex + 1}`;
}

/**
 * Build the scale.
 *
 * @param {object} input
 * @param {number} input.basePx      the value at step 0
 * @param {string} input.ratioId     which ratio from RATIOS
 * @param {number} input.customRatio used when ratioId is "custom"
 * @param {number} input.stepsUp     steps generated above the base
 * @param {number} input.stepsDown   steps generated below the base
 * @param {number} input.rootPx      root font size, for the rem column
 * @param {number} input.snap        grid to snap to, 0 for none
 * @param {string} input.naming      naming scheme id
 */
export function generateScale(input) {
  const {
    basePx,
    ratioId = "minor-third",
    customRatio,
    stepsUp,
    stepsDown,
    rootPx = DEFAULT_ROOT_PX,
    snap = 0,
    naming = "tshirt",
  } = input || {};

  const base = Number(basePx);
  const up = Number(stepsUp);
  const down = Number(stepsDown);
  const root = Number(rootPx);
  const grid = Number(snap);

  if ([base, up, down, root, grid].some((value) => !Number.isFinite(value))) {
    return { error: "Every field has to be a number." };
  }
  if (base <= 0) return { error: "Base spacing must be greater than zero." };
  if (base > MAX_BASE_PX) return { error: `A base above ${MAX_BASE_PX} px is larger than any spacing token needs to be.` };
  if (root <= 0) return { error: "Root font size must be greater than zero." };
  if (grid < 0) return { error: "Grid size cannot be negative." };
  if (!Number.isInteger(up) || !Number.isInteger(down)) {
    return { error: "Step counts must be whole numbers." };
  }
  if (up < 0 || down < 0) return { error: "Step counts cannot be negative." };
  if (up > MAX_STEPS_EACH_WAY || down > MAX_STEPS_EACH_WAY) {
    return { error: `Keep each direction to ${MAX_STEPS_EACH_WAY} steps or fewer — longer scales stop being memorable.` };
  }

  let ratio;
  let ratioLabel;
  if (ratioId === "custom") {
    ratio = Number(customRatio);
    ratioLabel = "Custom";
  } else {
    const preset = getRatio(ratioId);
    if (!preset) return { error: "Choose a valid scale ratio." };
    ratio = preset.value;
    ratioLabel = preset.label;
  }

  if (!Number.isFinite(ratio)) return { error: "The scale ratio has to be a number." };
  if (ratio < MIN_RATIO) return { error: `A ratio below ${MIN_RATIO} barely changes between steps — use at least ${MIN_RATIO}.` };
  if (ratio > MAX_RATIO) return { error: `A ratio above ${MAX_RATIO} grows too fast to be usable as spacing.` };

  const minIndex = -down;
  const maxIndex = up;
  const steps = [];
  let snappedCollisions = 0;

  for (let index = minIndex; index <= maxIndex; index += 1) {
    const rawPx = base * ratio ** index;
    const px = grid > 0 ? snapToGrid(rawPx, grid) : rawPx;
    const previous = steps[steps.length - 1];
    if (previous && px === previous.px) snappedCollisions += 1;

    steps.push({
      index,
      name: nameFor(index, naming, minIndex, maxIndex),
      rawPx,
      px,
      rem: px / root,
      snapped: grid > 0 && Math.abs(px - rawPx) > 1e-9,
      isBase: index === 0,
      growthPct: previous ? ((px - previous.px) / previous.px) * 100 : null,
    });
  }

  return {
    steps,
    base,
    ratio,
    ratioLabel,
    ratioId,
    rootPx: root,
    snap: grid,
    naming,
    stepCount: steps.length,
    smallestPx: steps[0].px,
    largestPx: steps[steps.length - 1].px,
    spanMultiple: steps[steps.length - 1].px / steps[0].px,
    snappedCollisions,
    warnings: snappedCollisions > 0
      ? [
          `${snappedCollisions} pair${snappedCollisions === 1 ? "" : "s"} of neighbouring steps snapped to the same value. Use a larger ratio or a finer grid.`,
        ]
      : [],
  };
}

const fmtPx = (value) => `${round(value, 2)}px`;
const fmtRem = (value) => `${round(value, 4)}rem`;

/** CSS custom properties on :root. */
export function toCss(result, prefix = "space") {
  if (!result || result.error) return "";
  const lines = [":root {"];
  result.steps.forEach((step) => {
    lines.push(`  --${prefix}-${step.name}: ${fmtRem(step.rem)}; /* ${fmtPx(step.px)} */`);
  });
  lines.push("}");
  return lines.join("\n");
}

/** Tailwind v4 @theme block, which reads plain custom properties. */
export function toTailwind(result, prefix = "space") {
  if (!result || result.error) return "";
  const lines = ["@theme {"];
  result.steps.forEach((step) => {
    lines.push(`  --spacing-${prefix}-${step.name}: ${fmtRem(step.rem)};`);
  });
  lines.push("}");
  return lines.join("\n");
}

/** SCSS map. */
export function toScss(result, prefix = "space") {
  if (!result || result.error) return "";
  const entries = result.steps.map((step) => `  "${step.name}": ${fmtRem(step.rem)},`);
  return [`$${prefix}: (`, ...entries, ");"].join("\n");
}

/** Design token JSON in the common W3C-style shape. */
export function toJson(result, prefix = "space") {
  if (!result || result.error) return "";
  const tokens = {};
  result.steps.forEach((step) => {
    tokens[step.name] = { $type: "dimension", $value: fmtRem(step.rem) };
  });
  return JSON.stringify({ [prefix]: tokens }, null, 2);
}

export const EXPORT_FORMATS = [
  { id: "css", label: "CSS custom properties", build: toCss },
  { id: "tailwind", label: "Tailwind @theme", build: toTailwind },
  { id: "scss", label: "SCSS map", build: toScss },
  { id: "json", label: "JSON design tokens", build: toJson },
];

export function buildExport(result, formatId, prefix) {
  const format = EXPORT_FORMATS.find((item) => item.id === formatId);
  if (!format) return "";
  return format.build(result, prefix);
}
