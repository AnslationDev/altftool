/**
 * Dot and line grid background generator.
 * Pure module: no DOM, no React, no clock, no randomness.
 *
 * Every pattern is a lattice with a single cell size, so the surface covered by
 * ink has a closed form:
 *   dots       coverage = pi * r^2 / cell^2                 (one dot per cell)
 *   iso dots   coverage = 2 * pi * r^2 / (cell^2 * sqrt(3)) (two dots per tile)
 *   lines      coverage = 1 - ((cell - w) / cell)^2         (two line families)
 *   crosses    coverage = (2 * arm * w - w^2) / cell^2      (overlap counted once)
 * Graph paper is the line formula applied twice, once for the minor grid and
 * once for the major grid, minus the overlap.
 */

/** A triangular lattice packs rows sqrt(3)/2 of a cell apart. */
export const ISO_ROW_FACTOR = Math.sqrt(3) / 2;

export const MIN_CELL = 2;
export const MAX_CELL = 400;
export const MIN_OPACITY = 0;
export const MAX_OPACITY = 1;

/**
 * Design systems usually run on a 4 or 8 point spacing scale, so a grid whose
 * cell is a multiple of 8 lines up with the rest of the layout.
 */
export const BASE_UNIT = 8;

export const PATTERNS = {
  dots: { id: "dots", label: "Dot grid", usesRadius: true },
  isoDots: { id: "isoDots", label: "Isometric dot grid", usesRadius: true },
  lines: { id: "lines", label: "Square line grid", usesRadius: false },
  graph: { id: "graph", label: "Graph paper (minor + major)", usesRadius: false },
  crosses: { id: "crosses", label: "Cross / plus marks", usesRadius: false },
};

export const TONES = {
  dark: { id: "dark", label: "Dark ink on a light page", color: "black" },
  light: { id: "light", label: "Light ink on a dark page", color: "white" },
};

const round2 = (n) => Math.round(n * 100) / 100;
const round3 = (n) => Math.round(n * 1000) / 1000;
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

/** Coverage of one line family pair at width w on period cell. */
function lineCoverage(cell, w) {
  const clear = Math.max(0, cell - w);
  return 1 - (clear / cell) ** 2;
}

/**
 * Geometry and ink coverage for the chosen grid.
 */
export function computeGrid({
  pattern = "dots",
  cell = 24,
  dotRadius = 1,
  lineWidth = 1,
  majorEvery = 5,
  majorWidth = 1.5,
  crossArm = 4,
  opacity = 0.18,
  tone = "dark",
} = {}) {
  const spec = PATTERNS[pattern];
  if (!spec) return { error: "Choose one of the listed grid patterns." };

  const c = Number(cell);
  const r = Number(dotRadius);
  const w = Number(lineWidth);
  const every = Number(majorEvery);
  const mw = Number(majorWidth);
  const arm = Number(crossArm);
  const a = Number(opacity);

  if (![c, r, w, every, mw, arm, a].every(Number.isFinite)) {
    return { error: "Enter valid numbers for every field." };
  }
  if (c < MIN_CELL || c > MAX_CELL) {
    return { error: `Cell size must be between ${MIN_CELL} and ${MAX_CELL} pixels.` };
  }
  if (a < MIN_OPACITY || a > MAX_OPACITY) {
    return { error: "Opacity must be between 0 and 1." };
  }

  if (spec.usesRadius) {
    if (r <= 0) return { error: "Dot radius must be greater than zero." };
    if (r * 2 >= c) return { error: "Dot diameter must be smaller than the cell size." };
  } else {
    if (w <= 0) return { error: "Line width must be greater than zero." };
    if (w >= c) return { error: "Line width must be smaller than the cell size." };
  }
  if (spec.id === "graph") {
    if (every < 2 || every > 50) return { error: "A major line every 2 to 50 cells is the usable range." };
    if (mw <= 0 || mw >= c) return { error: "Major line width must be greater than zero and smaller than the cell." };
  }
  if (spec.id === "crosses") {
    if (arm <= w) return { error: "Cross arm length must be longer than the line width." };
    if (arm >= c) return { error: "Cross arm length must be smaller than the cell size." };
  }

  const toneSpec = TONES[tone] || TONES.dark;

  let coverage;
  let tileWidth = c;
  let tileHeight = c;
  let marksPerTile = 1;

  if (spec.id === "dots") {
    coverage = (Math.PI * r * r) / (c * c);
  } else if (spec.id === "isoDots") {
    tileHeight = c * ISO_ROW_FACTOR * 2;
    marksPerTile = 2;
    coverage = (2 * Math.PI * r * r) / (c * tileHeight);
  } else if (spec.id === "lines") {
    coverage = lineCoverage(c, w);
  } else if (spec.id === "crosses") {
    // A plus is two bars of length `arm` crossing at the centre; the shared
    // square in the middle is counted once.
    coverage = (2 * arm * w - w * w) / (c * c);
  } else {
    // Graph paper: minor grid everywhere, major grid on a coarser period.
    const majorPeriod = c * every;
    const minor = lineCoverage(c, w);
    const major = lineCoverage(majorPeriod, mw);
    // Major lines sit on top of minor ones, so subtract the shared area.
    coverage = clamp(minor + major - minor * major, 0, 1);
    tileWidth = majorPeriod;
    tileHeight = majorPeriod;
    marksPerTile = every * every;
  }

  coverage = clamp(coverage, 0, 1);
  const averageAlpha = coverage * a;

  const marksPerThousandSquarePx =
    tileWidth > 0 && tileHeight > 0 ? (marksPerTile * 1_000_000) / (tileWidth * tileHeight) : 0;

  return {
    pattern: spec.id,
    patternLabel: spec.label,
    cell: round2(c),
    dotRadius: round2(r),
    lineWidth: round2(w),
    majorEvery: Math.round(every),
    majorWidth: round2(mw),
    crossArm: round2(arm),
    opacity: round2(a),
    tone: toneSpec.id,
    toneLabel: toneSpec.label,
    toneColor: toneSpec.color,
    tileWidth: round2(tileWidth),
    tileHeight: round2(tileHeight),
    coveragePercent: round3(coverage * 100),
    averageAlphaPercent: round3(averageAlpha * 100),
    marksPerThousandSquarePx: Math.round(marksPerThousandSquarePx),
    onBaseUnit: Math.abs(c / BASE_UNIT - Math.round(c / BASE_UNIT)) < 1e-9,
    baseUnit: BASE_UNIT,
    usesRadius: spec.usesRadius,
  };
}

/** color-mix keeps the alpha inline without needing an rgba() value. */
function inkColor(spec) {
  const percent = round2(spec.opacity * 100);
  return `color-mix(in srgb, ${spec.toneColor} ${percent}%, transparent)`;
}

/**
 * Build the grid as a self-contained SVG tile that repeats seamlessly.
 * Colour is expressed as fill plus fill-opacity presentation attributes so the
 * file opens correctly in vector editors, which do not parse color-mix().
 */
export function buildGridSvg(spec, { width = 0, height = 0 } = {}) {
  if (!spec || spec.error) return "";
  const ink = `fill="${spec.toneColor}" fill-opacity="${spec.opacity}"`;
  const w = Number(width) > 0 ? Math.round(Number(width)) : spec.tileWidth;
  const h = Number(height) > 0 ? Math.round(Number(height)) : spec.tileHeight;
  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`,
    "<defs>",
    `<pattern id="grid" patternUnits="userSpaceOnUse" width="${spec.tileWidth}" height="${spec.tileHeight}">`,
  ];

  if (spec.pattern === "dots") {
    parts.push(`<circle cx="${round2(spec.cell / 2)}" cy="${round2(spec.cell / 2)}" r="${spec.dotRadius}" ${ink} />`);
  } else if (spec.pattern === "isoDots") {
    const rowGap = round2(spec.tileHeight / 2);
    parts.push(`<circle cx="${round2(spec.cell / 4)}" cy="${round2(rowGap / 2)}" r="${spec.dotRadius}" ${ink} />`);
    parts.push(
      `<circle cx="${round2((spec.cell * 3) / 4)}" cy="${round2(rowGap + rowGap / 2)}" r="${spec.dotRadius}" ${ink} />`,
    );
  } else if (spec.pattern === "lines") {
    parts.push(`<rect x="0" y="0" width="${spec.cell}" height="${spec.lineWidth}" ${ink} />`);
    parts.push(`<rect x="0" y="0" width="${spec.lineWidth}" height="${spec.cell}" ${ink} />`);
  } else if (spec.pattern === "crosses") {
    const mid = round2(spec.cell / 2);
    const half = round2(spec.crossArm / 2);
    const halfW = round2(spec.lineWidth / 2);
    parts.push(`<rect x="${round2(mid - half)}" y="${round2(mid - halfW)}" width="${spec.crossArm}" height="${spec.lineWidth}" ${ink} />`);
    parts.push(`<rect x="${round2(mid - halfW)}" y="${round2(mid - half)}" width="${spec.lineWidth}" height="${spec.crossArm}" ${ink} />`);
  } else {
    const major = spec.tileWidth;
    for (let i = 0; i < spec.majorEvery; i += 1) {
      const offset = round2(i * spec.cell);
      parts.push(`<rect x="0" y="${offset}" width="${major}" height="${spec.lineWidth}" ${ink} />`);
      parts.push(`<rect x="${offset}" y="0" width="${spec.lineWidth}" height="${major}" ${ink} />`);
    }
    parts.push(`<rect x="0" y="0" width="${major}" height="${spec.majorWidth}" ${ink} />`);
    parts.push(`<rect x="0" y="0" width="${spec.majorWidth}" height="${major}" ${ink} />`);
  }

  parts.push("</pattern>", "</defs>");
  parts.push(`<rect x="0" y="0" width="${w}" height="${h}" fill="url(#grid)" />`);
  parts.push("</svg>");
  return parts.join("\n");
}

/** Pure-CSS version using gradients — no image request needed. */
export function buildGridCss(spec) {
  if (!spec || spec.error) return "";
  const ink = inkColor(spec);
  const c = spec.cell;
  let image;
  let size;
  let position = "";

  if (spec.pattern === "dots") {
    image = `radial-gradient(circle at center, ${ink} ${spec.dotRadius}px, transparent ${round2(spec.dotRadius + 0.5)}px)`;
    size = `${c}px ${c}px`;
  } else if (spec.pattern === "isoDots") {
    const rowGap = round2(spec.tileHeight / 2);
    image = [
      `radial-gradient(circle at center, ${ink} ${spec.dotRadius}px, transparent ${round2(spec.dotRadius + 0.5)}px)`,
      `radial-gradient(circle at center, ${ink} ${spec.dotRadius}px, transparent ${round2(spec.dotRadius + 0.5)}px)`,
    ].join(",\n    ");
    size = `${c}px ${round2(rowGap * 2)}px, ${c}px ${round2(rowGap * 2)}px`;
    position = `  background-position: 0 0, ${round2(c / 2)}px ${rowGap}px;`;
  } else if (spec.pattern === "lines") {
    image = [
      `linear-gradient(to bottom, ${ink} 0 ${spec.lineWidth}px, transparent ${spec.lineWidth}px ${c}px)`,
      `linear-gradient(to right, ${ink} 0 ${spec.lineWidth}px, transparent ${spec.lineWidth}px ${c}px)`,
    ].join(",\n    ");
    size = `${c}px ${c}px`;
  } else if (spec.pattern === "crosses") {
    const half = round2(spec.crossArm / 2);
    const mid = round2(c / 2);
    image = [
      `linear-gradient(to right, transparent 0 ${round2(mid - half)}px, ${ink} ${round2(mid - half)}px ${round2(mid + half)}px, transparent ${round2(mid + half)}px 100%)`,
      `linear-gradient(to bottom, transparent 0 ${round2(mid - half)}px, ${ink} ${round2(mid - half)}px ${round2(mid + half)}px, transparent ${round2(mid + half)}px 100%)`,
    ].join(",\n    ");
    size = `${c}px ${spec.lineWidth}px, ${spec.lineWidth}px ${c}px`;
    position = `  background-position: 0 ${round2(mid - spec.lineWidth / 2)}px, ${round2(mid - spec.lineWidth / 2)}px 0;`;
  } else {
    const major = round2(c * spec.majorEvery);
    image = [
      `linear-gradient(to bottom, ${ink} 0 ${spec.majorWidth}px, transparent ${spec.majorWidth}px ${major}px)`,
      `linear-gradient(to right, ${ink} 0 ${spec.majorWidth}px, transparent ${spec.majorWidth}px ${major}px)`,
      `linear-gradient(to bottom, ${ink} 0 ${spec.lineWidth}px, transparent ${spec.lineWidth}px ${c}px)`,
      `linear-gradient(to right, ${ink} 0 ${spec.lineWidth}px, transparent ${spec.lineWidth}px ${c}px)`,
    ].join(",\n    ");
    size = `${major}px ${major}px, ${major}px ${major}px, ${c}px ${c}px, ${c}px ${c}px`;
  }

  return [
    ".grid-bg {",
    `  background-image:\n    ${image};`,
    `  background-size: ${size};`,
    position,
    "  background-repeat: repeat;",
    "}",
  ]
    .filter(Boolean)
    .join("\n");
}

/** Copy-friendly summary of the grid. */
export function formatGridText(spec) {
  if (!spec || spec.error) return "";
  const lines = [
    `${spec.patternLabel} — ${spec.cell} px cell`,
    spec.usesRadius ? `Dot radius ${spec.dotRadius} px` : `Line width ${spec.lineWidth} px`,
  ];
  if (spec.pattern === "graph") {
    lines.push(`Major line every ${spec.majorEvery} cells at ${spec.majorWidth} px`);
  }
  if (spec.pattern === "crosses") {
    lines.push(`Cross arm ${spec.crossArm} px`);
  }
  lines.push(
    `Opacity ${spec.opacity} · ${spec.toneLabel}`,
    `Tile ${spec.tileWidth} × ${spec.tileHeight} px`,
    `Ink coverage ${spec.coveragePercent}% · average alpha ${spec.averageAlphaPercent}%`,
    `About ${spec.marksPerThousandSquarePx} marks per 1000 × 1000 px`,
    spec.onBaseUnit
      ? `Cell is a multiple of the ${spec.baseUnit} px base unit.`
      : `Cell is not a multiple of the ${spec.baseUnit} px base unit — layout may not line up.`,
  );
  return lines.join("\n");
}
