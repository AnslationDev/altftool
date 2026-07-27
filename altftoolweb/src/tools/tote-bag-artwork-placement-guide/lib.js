/**
 * Tote bag artwork placement.
 *
 * A tote has three things a t-shirt does not, and each eats into the print area:
 *
 *  1. HANDLES. The webbing is stitched onto the front panel a few inches down
 *     from the top edge. Artwork has to start below the lowest stitch or the
 *     platen cannot sit flat and the print distorts over the seam.
 *
 *  2. A GUSSET. On a box-bottom bag with gusset depth G, roughly the lowest G/2
 *     of the flat front panel folds under to form the base, so anything printed
 *     there ends up on the bottom of the bag rather than the front.
 *
 *  3. SIDE SEAMS. Same rule as any garment — keep clear or the ink cracks.
 *
 *  usableWidth  = bagWidth - 2 x sideMargin
 *  topReserved  = handleStitchDrop + clearanceBelowHandles
 *  bottomReserved = bottomClearance + gussetDepth / 2
 *  usableHeight = bagHeight - topReserved - bottomReserved
 *
 * Artwork is then fitted inside that box preserving its aspect ratio and
 * centred, and the offsets are reported from the bag's top and left edges so
 * they can be measured with a ruler on the actual blank.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/**
 * Flat front-panel dimensions in inches for common cotton tote blanks.
 * gussetDepth is the finished base depth; 0 means a flat, unstructured bag.
 */
export const TOTE_SIZES = [
  { key: "mini", label: "Mini tote", width: 10, height: 10, gussetDepth: 0 },
  { key: "small", label: "Small tote", width: 13, height: 14, gussetDepth: 0 },
  { key: "classic", label: "Classic shopper", width: 15, height: 16, gussetDepth: 3 },
  { key: "large", label: "Large shopper", width: 16, height: 17, gussetDepth: 4 },
  { key: "boat", label: "Boat tote / jumbo", width: 18, height: 15, gussetDepth: 6 },
  { key: "gusset-deep", label: "Deep grocery tote", width: 14, height: 16, gussetDepth: 8 },
];

/** Common press platen sizes, in inches. */
export const PLATEN_SIZES = [
  { key: "none", label: "No platen limit (screen print / hand press)", width: Infinity, height: Infinity },
  { key: "10x12", label: "10 x 12 in", width: 10, height: 12 },
  { key: "12x14", label: "12 x 14 in", width: 12, height: 14 },
  { key: "14x16", label: "14 x 16 in", width: 14, height: 16 },
];

/** Defaults in inches — decorator conventions, all adjustable. */
export const DEFAULT_SIDE_MARGIN = 1;
export const DEFAULT_HANDLE_STITCH_DROP = 3;
export const DEFAULT_CLEARANCE_BELOW_HANDLES = 1;
export const DEFAULT_BOTTOM_CLEARANCE = 2;

/** Half the gusset wraps under the base on a box-bottom bag. */
export const GUSSET_WRAP_FRACTION = 0.5;

export const DEFAULT_DPI = 300;
export const MIN_ACCEPTABLE_DPI = 150;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const round2 = (value) => Math.round(value * 100) / 100;

export function findTote(sizeKey) {
  return TOTE_SIZES.find((size) => size.key === sizeKey) ?? null;
}

export function findPlaten(platenKey) {
  return PLATEN_SIZES.find((platen) => platen.key === platenKey) ?? null;
}

export function computeTotePlacement({
  sizeKey,
  platenKey = "none",
  sideMargin = DEFAULT_SIDE_MARGIN,
  handleStitchDrop = DEFAULT_HANDLE_STITCH_DROP,
  clearanceBelowHandles = DEFAULT_CLEARANCE_BELOW_HANDLES,
  bottomClearance = DEFAULT_BOTTOM_CLEARANCE,
  designRatioWidth = 1,
  designRatioHeight = 1,
  dpi = DEFAULT_DPI,
  verticalAlign = "center",
}) {
  const tote = findTote(sizeKey);
  const platen = findPlaten(platenKey);
  if (!tote) return { error: "Choose a tote size." };
  if (!platen) return { error: "Choose a platen option." };

  const scalars = {
    sideMargin,
    handleStitchDrop,
    clearanceBelowHandles,
    bottomClearance,
    designRatioWidth,
    designRatioHeight,
    dpi,
  };
  for (const [key, value] of Object.entries(scalars)) {
    if (!isNum(value)) return { error: `Enter a number for ${key}.` };
    if (value < 0) return { error: "Margins, clearances and ratios cannot be negative." };
  }
  if (designRatioWidth <= 0 || designRatioHeight <= 0) {
    return { error: "Design width and height ratios must be greater than zero." };
  }
  if (dpi < 72 || dpi > 1200) return { error: "Resolution should be between 72 and 1200 DPI." };
  if (!["top", "center"].includes(verticalAlign)) {
    return { error: "Vertical alignment must be top or center." };
  }

  const gussetWrap = tote.gussetDepth * GUSSET_WRAP_FRACTION;
  const topReserved = handleStitchDrop + clearanceBelowHandles;
  const bottomReserved = bottomClearance + gussetWrap;

  const usableWidth = tote.width - 2 * sideMargin;
  const usableHeight = tote.height - topReserved - bottomReserved;

  if (usableWidth <= 0) {
    return { error: "Side margins are wider than the bag — reduce them." };
  }
  if (usableHeight <= 0) {
    return {
      error:
        "Handle and base clearances leave no height on this bag — reduce them or pick a taller tote.",
    };
  }

  const maxWidth = Math.min(platen.width, usableWidth);
  const maxHeight = Math.min(platen.height, usableHeight);

  const scale = Math.min(maxWidth / designRatioWidth, maxHeight / designRatioHeight);
  const designWidth = designRatioWidth * scale;
  const designHeight = designRatioHeight * scale;

  const leftOffset = (tote.width - designWidth) / 2;
  const topOffset =
    verticalAlign === "top" ? topReserved : topReserved + (usableHeight - designHeight) / 2;

  return {
    tote,
    platen,
    gussetWrap: round2(gussetWrap),
    topReserved: round2(topReserved),
    bottomReserved: round2(bottomReserved),
    usableWidth: round2(usableWidth),
    usableHeight: round2(usableHeight),
    maxWidth: round2(maxWidth),
    maxHeight: round2(maxHeight),
    maxAreaSqIn: round2(maxWidth * maxHeight),
    designWidth: round2(designWidth),
    designHeight: round2(designHeight),
    pixelWidth: Math.round(designWidth * dpi),
    pixelHeight: Math.round(designHeight * dpi),
    dpi: Math.round(dpi),
    leftOffset: round2(leftOffset),
    topOffset: round2(topOffset),
    bottomOffset: round2(tote.height - topOffset - designHeight),
    widthLimitedBy: platen.width <= usableWidth ? "platen" : "bag",
    heightLimitedBy: platen.height <= usableHeight ? "platen" : "bag",
    verticalAlign,
  };
}

/** The same calculation across every tote size, for a comparison sheet. */
export function buildToteRun(options) {
  const rows = [];
  for (const tote of TOTE_SIZES) {
    const row = computeTotePlacement({ ...options, sizeKey: tote.key });
    if (row.error) {
      rows.push({ tote, error: row.error });
      continue;
    }
    rows.push(row);
  }
  return { rows };
}

/**
 * Preview geometry as percentages of the flat front panel, so a view can draw
 * boxes without doing arithmetic of its own.
 */
export function buildPreviewGeometry(placement) {
  if (!placement || placement.error) return { error: "Calculate a placement first." };
  const { tote } = placement;
  return {
    panelAspectRatio: tote.width / tote.height,
    safeTopPercent: (placement.topReserved / tote.height) * 100,
    safeHeightPercent: (placement.usableHeight / tote.height) * 100,
    safeWidthPercent: (placement.usableWidth / tote.width) * 100,
    designTopPercent: (placement.topOffset / tote.height) * 100,
    designWidthPercent: (placement.designWidth / tote.width) * 100,
    designHeightPercent: (placement.designHeight / tote.height) * 100,
    gussetPercent: (placement.gussetWrap / tote.height) * 100,
  };
}

/** Effective DPI of an existing artwork file at the fitted print size. */
export function checkResolution({ pixelWidth, pixelHeight, printWidth, printHeight }) {
  const values = { pixelWidth, pixelHeight, printWidth, printHeight };
  for (const [key, value] of Object.entries(values)) {
    if (!isNum(value)) return { error: `Enter a number for ${key}.` };
    if (value <= 0) return { error: "Pixel sizes and print sizes must be greater than zero." };
  }
  const effectiveDpi = Math.min(pixelWidth / printWidth, pixelHeight / printHeight);
  return {
    effectiveDpi: round2(effectiveDpi),
    goodEnough: effectiveDpi >= MIN_ACCEPTABLE_DPI,
    idealEnough: effectiveDpi >= DEFAULT_DPI,
  };
}
