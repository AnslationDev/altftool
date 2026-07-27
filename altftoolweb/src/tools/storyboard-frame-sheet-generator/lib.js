/**
 * Storyboard Frame Sheet Generator — pure layout module.
 * No React, no DOM, no clock reads. All internal geometry is in millimetres.
 */

/** International inch, fixed at exactly 25.4 mm. */
export const MM_PER_INCH = 25.4;

/**
 * Paper sizes, portrait, in millimetres.
 * A-series from ISO 216; Letter and Tabloid from their exact inch dimensions.
 */
export const PAPER_SIZES = [
  { id: "a4", label: "A4 (210 × 297 mm)", width: 210, height: 297 },
  { id: "a3", label: "A3 (297 × 420 mm)", width: 297, height: 420 },
  { id: "letter", label: "US Letter (8.5 × 11 in)", width: 8.5 * MM_PER_INCH, height: 11 * MM_PER_INCH },
  { id: "tabloid", label: "Tabloid (11 × 17 in)", width: 11 * MM_PER_INCH, height: 17 * MM_PER_INCH },
];

/**
 * Shooting aspect ratios, stored as width divided by height.
 * 2.39:1 is the modern anamorphic scope standard (SMPTE), 1.85:1 the common
 * flat theatrical ratio, 1.66:1 European widescreen.
 */
export const ASPECT_RATIOS = [
  { id: "16-9", label: "16:9 — HD and UHD", value: 16 / 9 },
  { id: "185", label: "1.85:1 — flat theatrical", value: 1.85 },
  { id: "239", label: "2.39:1 — anamorphic scope", value: 2.39 },
  { id: "4-3", label: "4:3 — Academy / classic TV", value: 4 / 3 },
  { id: "1-1", label: "1:1 — square social", value: 1 },
  { id: "9-16", label: "9:16 — vertical short form", value: 9 / 16 },
  { id: "2-1", label: "2:1 — Univisium", value: 2 },
];

export const NOTES_POSITIONS = [
  { id: "below", label: "Notes under each frame" },
  { id: "right", label: "Notes beside each frame" },
  { id: "none", label: "Frames only" },
];

export const ORIENTATIONS = [
  { id: "portrait", label: "Portrait" },
  { id: "landscape", label: "Landscape" },
];

/**
 * Most consumer inkjet and laser printers cannot image closer than about
 * 6.35 mm (0.25 in) to the paper edge, so a margin under this may be clipped.
 */
export const MIN_SAFE_MARGIN_MM = 6.35;

export const MAX_COLUMNS = 6;
export const MAX_ROWS = 8;
export const MIN_FRAME_WIDTH_MM = 25;

const round = (value, places) => {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
};

/**
 * Strict numeric parse. An empty or blank field is not zero — it is missing —
 * so it returns null rather than silently laying the sheet out with a value
 * the user never typed.
 */
export function toFiniteNumber(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === "string" && value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function getPaper(paperId) {
  return PAPER_SIZES.find((paper) => paper.id === paperId) || null;
}

export function getAspect(aspectId) {
  return ASPECT_RATIOS.find((ratio) => ratio.id === aspectId) || null;
}

/**
 * Lay out one storyboard sheet and report whether it fits the page.
 *
 * @param {object} input
 * @param {string} input.paperId
 * @param {string} input.orientation  "portrait" | "landscape"
 * @param {number} input.marginMm     page margin on all four edges
 * @param {number} input.columns      frames across
 * @param {number} input.rows         frames down
 * @param {number} input.gutterMm     gap between cells
 * @param {string} input.aspectId     shooting ratio, or "custom"
 * @param {number} input.customAspect width divided by height, when custom
 * @param {string} input.notesPosition "below" | "right" | "none"
 * @param {number} input.notesShare   fraction of the cell given to notes
 * @param {number} input.headerMm     height reserved at the top of the page
 * @param {number} input.labelMm      height reserved under each frame for its number
 * @param {number} input.totalFrames  how many frames the whole board needs
 */
export function computeSheet(input) {
  const {
    paperId = "a4",
    orientation = "portrait",
    marginMm,
    columns,
    rows,
    gutterMm,
    aspectId = "16-9",
    customAspect,
    notesPosition = "below",
    notesShare,
    headerMm,
    labelMm,
    totalFrames,
  } = input || {};

  const paper = getPaper(paperId);
  if (!paper) return { error: "Choose a valid paper size." };
  if (!ORIENTATIONS.some((item) => item.id === orientation)) {
    return { error: "Choose portrait or landscape." };
  }
  if (!NOTES_POSITIONS.some((item) => item.id === notesPosition)) {
    return { error: "Choose where the notes area goes." };
  }

  const margin = toFiniteNumber(marginMm);
  const cols = toFiniteNumber(columns);
  const rowCount = toFiniteNumber(rows);
  const gutter = toFiniteNumber(gutterMm);
  const share = toFiniteNumber(notesShare);
  const header = toFiniteNumber(headerMm);
  const label = toFiniteNumber(labelMm);
  const frames = toFiniteNumber(totalFrames);

  if ([margin, cols, rowCount, gutter, share, header, label, frames].some((v) => v === null)) {
    return { error: "Fill in every field with a number." };
  }
  if (margin < 0 || gutter < 0 || header < 0 || label < 0) {
    return { error: "Margins, gutters, header and label heights cannot be negative." };
  }
  if (!Number.isInteger(cols) || cols < 1 || cols > MAX_COLUMNS) {
    return { error: `Frames across must be a whole number from 1 to ${MAX_COLUMNS}.` };
  }
  if (!Number.isInteger(rowCount) || rowCount < 1 || rowCount > MAX_ROWS) {
    return { error: `Frames down must be a whole number from 1 to ${MAX_ROWS}.` };
  }
  if (!Number.isInteger(frames) || frames < 1) {
    return { error: "Total frame count must be a whole number of at least 1." };
  }
  if (share < 0 || share >= 1) {
    return { error: "The notes share must be between 0 and just under 1." };
  }

  let aspect;
  let aspectLabel;
  if (aspectId === "custom") {
    aspect = toFiniteNumber(customAspect);
    aspectLabel = "Custom";
  } else {
    const preset = getAspect(aspectId);
    if (!preset) return { error: "Choose a valid shooting ratio." };
    aspect = preset.value;
    aspectLabel = preset.label;
  }
  if (!Number.isFinite(aspect) || aspect <= 0) {
    return { error: "The shooting ratio must be greater than zero." };
  }

  const pageWidth = orientation === "landscape" ? paper.height : paper.width;
  const pageHeight = orientation === "landscape" ? paper.width : paper.height;

  const usableWidth = pageWidth - margin * 2;
  const usableHeight = pageHeight - margin * 2 - header;
  if (usableWidth <= 0) return { error: "The side margins leave no width on the page." };
  if (usableHeight <= 0) return { error: "The margins and header leave no height on the page." };

  const cellWidth = (usableWidth - gutter * (cols - 1)) / cols;
  if (cellWidth <= 0) return { error: "The gutters are wider than the space available across the page." };

  // Split the cell between the frame and its notes area.
  const innerGutter = notesPosition === "none" ? 0 : Math.min(gutter, cellWidth / 4);
  let frameWidth;
  let notesWidth;
  let notesHeight;

  if (notesPosition === "right") {
    const available = cellWidth - innerGutter;
    frameWidth = available * (1 - share);
    notesWidth = available * share;
    notesHeight = 0;
  } else {
    frameWidth = cellWidth;
    notesWidth = 0;
    notesHeight = 0;
  }

  if (frameWidth < MIN_FRAME_WIDTH_MM) {
    return {
      error: `That layout leaves each frame only ${round(frameWidth, 1)} mm wide — under the ${MIN_FRAME_WIDTH_MM} mm needed to draw in. Use fewer columns or a smaller notes share.`,
    };
  }

  const frameHeight = frameWidth / aspect;
  if (notesPosition === "below") {
    // The notes block below takes its share of the combined frame-plus-notes height.
    notesHeight = (frameHeight / (1 - share)) * share;
    notesWidth = frameWidth;
  }

  const cellHeight = frameHeight + notesHeight + label;
  const requiredHeight = rowCount * cellHeight + gutter * (rowCount - 1);
  const fits = requiredHeight <= usableHeight;

  // Largest row count that still fits: r*cellHeight + gutter*(r-1) <= usableHeight
  const maxRowsThatFit = Math.max(
    0,
    Math.floor((usableHeight + gutter) / (cellHeight + gutter)),
  );

  const framesPerPage = cols * rowCount;
  const pages = Math.ceil(frames / framesPerPage);
  const blanksOnLastPage = pages * framesPerPage - frames;

  // Rectangles for drawing, positioned from the top-left of the page.
  const cells = [];
  for (let row = 0; row < rowCount; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const x = margin + col * (cellWidth + gutter);
      const y = margin + header + row * (cellHeight + gutter);
      cells.push({
        index: row * cols + col,
        row,
        col,
        frame: { x, y, width: frameWidth, height: frameHeight },
        notes:
          notesPosition === "right"
            ? { x: x + frameWidth + innerGutter, y, width: notesWidth, height: frameHeight }
            : notesPosition === "below"
              ? { x, y: y + frameHeight, width: notesWidth, height: notesHeight }
              : null,
        label: { x, y: y + frameHeight + notesHeight, width: cellWidth, height: label },
      });
    }
  }

  const warnings = [];
  if (!fits) {
    warnings.push(
      `${rowCount} rows need ${round(requiredHeight, 1)} mm but only ${round(usableHeight, 1)} mm is available. ${maxRowsThatFit} row${maxRowsThatFit === 1 ? "" : "s"} would fit.`,
    );
  }
  if (margin < MIN_SAFE_MARGIN_MM) {
    warnings.push(
      `A ${round(margin, 1)} mm margin is inside the ${MIN_SAFE_MARGIN_MM} mm non-printable edge on most desktop printers, so the outer frames may be clipped.`,
    );
  }
  if (blanksOnLastPage > 0) {
    warnings.push(
      `${blanksOnLastPage} blank cell${blanksOnLastPage === 1 ? "" : "s"} on the last page. ${framesPerPage} frames fit per sheet.`,
    );
  }

  return {
    paper,
    aspect,
    aspectLabel,
    orientation,
    notesPosition,
    pageWidth,
    pageHeight,
    margin,
    header,
    gutter,
    label,
    usableWidth,
    usableHeight,
    cellWidth,
    cellHeight,
    frameWidth,
    frameHeight,
    notesWidth,
    notesHeight,
    innerGutter,
    requiredHeight,
    fits,
    maxRowsThatFit,
    columns: cols,
    rows: rowCount,
    framesPerPage,
    totalFrames: frames,
    pages,
    blanksOnLastPage,
    frameAreaCm2: (frameWidth / 10) * (frameHeight / 10),
    cells,
    warnings,
  };
}

/** Frame size expressed in inches, for anyone working from an imperial ruler. */
export function frameSizeInInches(result) {
  if (!result || result.error) return null;
  return {
    width: result.frameWidth / MM_PER_INCH,
    height: result.frameHeight / MM_PER_INCH,
  };
}
