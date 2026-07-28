/**
 * Pre-writing stroke practice sheets.
 *
 * The stroke order below is the developmental sequence used in visual-motor
 * integration assessment (vertical line, horizontal line, circle, cross,
 * diagonals, square, oblique cross, triangle). The ages are the commonly cited
 * typical mastery ages for that sequence and are guidance, not a diagnosis.
 *
 * No React, no DOM — millimetre geometry plus a shape table.
 */

/** ISO 216 A4 is 210 x 297 mm. US Letter is 8.5 x 11 in = 215.9 x 279.4 mm. */
export const PAGE_SIZES = {
  a4: { id: "a4", label: "A4 (210 x 297 mm)", widthMm: 210, heightMm: 297 },
  letter: { id: "letter", label: "US Letter (216 x 279 mm)", widthMm: 215.9, heightMm: 279.4 },
};

/** Shape paths are drawn in a 100 x 100 unit box and scaled to the cell size. */
export const SHAPE_VIEWBOX = 100;

/**
 * Typical mastery ages, in months, for the standard pre-writing sequence.
 * A child is normally able to copy each form at roughly this age; individual
 * variation of several months either way is expected.
 */
export const PREWRITING_STROKES = [
  {
    id: "vertical",
    name: "Vertical line",
    typicalAgeMonths: 24,
    cue: "Start at the top, pull straight down.",
    paths: ["M50 8 L50 92"],
  },
  {
    id: "horizontal",
    name: "Horizontal line",
    typicalAgeMonths: 30,
    cue: "Start at the left, drag across to the right.",
    paths: ["M8 50 L92 50"],
  },
  {
    id: "circle",
    name: "Circle",
    typicalAgeMonths: 36,
    cue: "Start at the top and travel anticlockwise all the way round.",
    paths: ["M50 8 A42 42 0 1 0 50.01 8 Z"],
  },
  {
    id: "cross",
    name: "Plus cross",
    typicalAgeMonths: 48,
    cue: "Down first, then across through the middle.",
    paths: ["M50 8 L50 92", "M8 50 L92 50"],
  },
  {
    id: "right-diagonal",
    name: "Right diagonal /",
    typicalAgeMonths: 54,
    cue: "Start top right, pull down to the bottom left.",
    paths: ["M92 8 L8 92"],
  },
  {
    id: "square",
    name: "Square",
    typicalAgeMonths: 54,
    cue: "Four corners, stop and turn at each one.",
    paths: ["M10 10 H90 V90 H10 Z"],
  },
  {
    id: "left-diagonal",
    name: "Left diagonal \\",
    typicalAgeMonths: 60,
    cue: "Start top left, pull down to the bottom right.",
    paths: ["M8 8 L92 92"],
  },
  {
    id: "oblique-cross",
    name: "Oblique cross X",
    typicalAgeMonths: 60,
    cue: "Two diagonals crossing in the middle.",
    paths: ["M8 8 L92 92", "M92 8 L8 92"],
  },
  {
    id: "triangle",
    name: "Triangle",
    typicalAgeMonths: 66,
    cue: "Up the hill, down the hill, then straight along the bottom.",
    paths: ["M50 8 L92 92 L8 92 Z"],
  },
  {
    id: "zigzag",
    name: "Zigzag",
    typicalAgeMonths: 60,
    cue: "Sharp points, no rounding at the turns.",
    paths: ["M6 84 L28 16 L50 84 L72 16 L94 84"],
  },
  {
    id: "wave",
    name: "Wave",
    typicalAgeMonths: 60,
    cue: "One smooth movement, no stopping at the crests.",
    paths: ["M6 50 Q21 12 36 50 T66 50 T96 50"],
  },
  {
    id: "loops",
    name: "Continuous loops",
    typicalAgeMonths: 66,
    cue: "Keep the pencil down and the loops the same height.",
    paths: ["M6 86 C14 10 34 10 40 86 C46 10 66 10 72 86 C78 20 90 34 94 62"],
  },
  {
    id: "spiral",
    name: "Spiral",
    typicalAgeMonths: 66,
    cue: "Wind inwards slowly without touching the previous ring.",
    paths: [
      "M50 50 m0 -6 a6 6 0 1 1 -6 6 a12 12 0 1 0 12 -12 a20 20 0 1 1 -20 20 a30 30 0 1 0 30 -30 a42 42 0 1 1 -42 42",
    ],
  },
];

/**
 * Pencil grasp development. The stages and age bands follow the widely used
 * progression from primitive whole-hand grasps to a mature dynamic tripod.
 * Ranges overlap because children move through them at different rates.
 */
export const GRASP_STAGES = [
  {
    id: "palmar-supinate",
    name: "Palmar supinate grasp",
    minMonths: 12,
    maxMonths: 18,
    detail: "Whole fist round the crayon, wrist and shoulder do the moving. Expect scribbles, not shapes.",
  },
  {
    id: "digital-pronate",
    name: "Digital pronate grasp",
    minMonths: 19,
    maxMonths: 36,
    detail: "Fingers point down the pencil with the wrist turned over; movement still comes from the arm.",
  },
  {
    id: "static-tripod",
    name: "Static tripod / quadrupod grasp",
    minMonths: 37,
    maxMonths: 54,
    detail: "Three or four fingers hold the pencil correctly but move as one unit; the hand still travels as a block.",
  },
  {
    id: "dynamic-tripod",
    name: "Dynamic tripod grasp",
    minMonths: 55,
    maxMonths: 999,
    detail: "Thumb, index and middle finger move the pencil independently while the ring and little fingers stabilise. This is the mature grasp.",
  },
];

/** How far a stroke may sit from the child's age and still count as current work. */
export const EMERGING_WINDOW_MONTHS = 6;

export const MIN_AGE_MONTHS = 18;
export const MAX_AGE_MONTHS = 120;

export const MIN_CELL_MM = 15;
export const MAX_CELL_MM = 60;

export const MIN_REPEATS = 1;
export const MAX_REPEATS = 24;

export const MIN_MARGIN_MM = 5;
export const MAX_MARGIN_MM = 40;

/** Gap between practice boxes, as a fraction of the box size. */
export const CELL_GAP_RATIO = 0.25;

/** Height reserved above each stroke's boxes for its name and verbal cue. */
export const BAND_LABEL_HEIGHT_MM = 9;

const round2 = (value) => Math.round(value * 100) / 100;

/** The grasp stage a child of this age is typically working in. */
export function graspStageForAge(ageMonths) {
  if (!Number.isFinite(ageMonths) || ageMonths <= 0) return null;
  return (
    GRASP_STAGES.find((stage) => ageMonths >= stage.minMonths && ageMonths <= stage.maxMonths) ||
    GRASP_STAGES[GRASP_STAGES.length - 1]
  );
}

/**
 * Sort every stroke into mastered / emerging / ahead for a given age.
 * "Emerging" is the six-month window around the typical mastery age — the
 * strokes worth practising now.
 */
export function classifyStrokes(ageMonths) {
  if (!Number.isFinite(ageMonths)) return { mastered: [], emerging: [], ahead: [] };
  const mastered = [];
  const emerging = [];
  const ahead = [];
  for (const stroke of PREWRITING_STROKES) {
    if (stroke.typicalAgeMonths <= ageMonths - EMERGING_WINDOW_MONTHS) mastered.push(stroke);
    else if (stroke.typicalAgeMonths <= ageMonths + EMERGING_WINDOW_MONTHS) emerging.push(stroke);
    else ahead.push(stroke);
  }
  return { mastered, emerging, ahead };
}

/**
 * Lay out a practice sheet.
 *
 * @returns {object} { error } for invalid input, otherwise the page-by-page
 *   layout with exact millimetre box sizes.
 */
export function buildPracticeSheet({
  strokeIds = ["vertical", "horizontal", "circle"],
  pageSize = "a4",
  cellMm = 30,
  repeats = 6,
  marginMm = 15,
  ageMonths = 48,
} = {}) {
  const page = PAGE_SIZES[pageSize];
  if (!page) return { error: "Choose either A4 or US Letter paper." };
  if (!Array.isArray(strokeIds) || strokeIds.length === 0) {
    return { error: "Pick at least one stroke pattern to practise." };
  }

  const values = [cellMm, repeats, marginMm, ageMonths];
  if (values.some((value) => !Number.isFinite(value))) {
    return { error: "Enter a number in every field." };
  }
  if (cellMm < MIN_CELL_MM || cellMm > MAX_CELL_MM) {
    return { error: `Box size must be between ${MIN_CELL_MM} mm and ${MAX_CELL_MM} mm.` };
  }
  if (!Number.isInteger(repeats) || repeats < MIN_REPEATS || repeats > MAX_REPEATS) {
    return { error: `Repeats per stroke must be a whole number between ${MIN_REPEATS} and ${MAX_REPEATS}.` };
  }
  if (marginMm < MIN_MARGIN_MM || marginMm > MAX_MARGIN_MM) {
    return { error: `Page margin must be between ${MIN_MARGIN_MM} mm and ${MAX_MARGIN_MM} mm.` };
  }
  if (ageMonths < MIN_AGE_MONTHS || ageMonths > MAX_AGE_MONTHS) {
    return { error: `Age must be between ${MIN_AGE_MONTHS} and ${MAX_AGE_MONTHS} months.` };
  }

  const strokes = strokeIds
    .map((id) => PREWRITING_STROKES.find((stroke) => stroke.id === id))
    .filter(Boolean);
  if (strokes.length === 0) return { error: "None of the selected stroke patterns are recognised." };

  const usableWidthMm = page.widthMm - marginMm * 2;
  const usableHeightMm = page.heightMm - marginMm * 2;
  if (usableWidthMm <= 0 || usableHeightMm <= 0) {
    return { error: "Margins leave no printable area on this paper size." };
  }

  const gapMm = cellMm * CELL_GAP_RATIO;
  // n boxes need n widths plus (n-1) gaps.
  const cellsPerRow = Math.floor((usableWidthMm + gapMm) / (cellMm + gapMm));
  if (cellsPerRow < 1) {
    return { error: "One practice box is wider than the printable area. Reduce the box size or the margin." };
  }

  const bands = strokes.map((stroke) => {
    const rowCount = Math.ceil(repeats / cellsPerRow);
    const heightMm = BAND_LABEL_HEIGHT_MM + rowCount * cellMm + (rowCount - 1) * gapMm;
    return {
      ...stroke,
      rowCount,
      repeats,
      heightMm: round2(heightMm),
      rows: Array.from({ length: rowCount }, (unusedRow, rowIndex) => {
        const remaining = repeats - rowIndex * cellsPerRow;
        const count = remaining > cellsPerRow ? cellsPerRow : remaining;
        return {
          rowIndex,
          cells: Array.from({ length: count }, (unusedCell, cellIndex) => ({
            cellIndex,
            // The first box of the first row is the solid model; the rest are
            // faint outlines for the child to trace over.
            solid: rowIndex === 0 && cellIndex === 0,
          })),
        };
      }),
    };
  });

  const tallest = bands.reduce((max, band) => (band.heightMm > max ? band.heightMm : max), 0);
  if (tallest > usableHeightMm) {
    return { error: "One stroke needs more rows than the page can hold. Reduce the repeats or the box size." };
  }

  const pages = [];
  let current = [];
  let used = 0;
  for (const band of bands) {
    const needed = current.length === 0 ? band.heightMm : gapMm + band.heightMm;
    if (used + needed > usableHeightMm && current.length > 0) {
      pages.push(current);
      current = [band];
      used = band.heightMm;
    } else {
      current.push(band);
      used += needed;
    }
  }
  if (current.length > 0) pages.push(current);

  return {
    page: { ...page },
    marginMm,
    ageMonths,
    graspStage: graspStageForAge(ageMonths),
    classification: classifyStrokes(ageMonths),
    usableWidthMm: round2(usableWidthMm),
    usableHeightMm: round2(usableHeightMm),
    cellMm,
    gapMm: round2(gapMm),
    cellsPerRow,
    repeats,
    strokeCount: bands.length,
    totalBoxes: bands.length * repeats,
    /** Every path drawn once per box — a rough count of pencil strokes on the sheet. */
    totalPenStrokes: bands.reduce((sum, band) => sum + band.paths.length * repeats, 0),
    bandsPerPage: pages.length > 0 ? pages[0].length : 0,
    pageCount: pages.length,
    pages,
  };
}
