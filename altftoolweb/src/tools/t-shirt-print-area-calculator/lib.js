/**
 * Printable area on a t-shirt.
 *
 * Two separate limits decide how big a print can be, and the smaller one wins:
 *
 *  1. The GARMENT. A flat-measured tee gives a usable width of
 *       chestWidth - 2 x sideMargin
 *     and a usable height of
 *       bodyLength - collarDrop - hemMargin
 *     Side and hem margins keep the print off the seams, where ink cracks and
 *     the platen cannot lie flat.
 *
 *  2. The PLATEN. A direct-to-garment or screen press can only print inside its
 *     platen, so the area is capped at the platen's width and height.
 *
 * A design is then fitted inside that box preserving its aspect ratio (a
 * "contain" fit), and the pixel size needed is simply inches x DPI.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/**
 * Flat measurements in inches for a typical unisex heavy-cotton tee
 * (the widely copied Gildan 5000 style chart). chestWidth is measured flat,
 * one inch below the armhole, so it is half the chest circumference.
 */
export const GARMENT_SIZES = [
  { key: "YS", label: "Youth S", chestWidth: 16, bodyLength: 22, youth: true },
  { key: "YM", label: "Youth M", chestWidth: 17, bodyLength: 24, youth: true },
  { key: "YL", label: "Youth L", chestWidth: 18, bodyLength: 26, youth: true },
  { key: "S", label: "Adult S", chestWidth: 18, bodyLength: 28, youth: false },
  { key: "M", label: "Adult M", chestWidth: 20, bodyLength: 29, youth: false },
  { key: "L", label: "Adult L", chestWidth: 22, bodyLength: 30, youth: false },
  { key: "XL", label: "Adult XL", chestWidth: 24, bodyLength: 31, youth: false },
  { key: "2XL", label: "Adult 2XL", chestWidth: 26, bodyLength: 32, youth: false },
  { key: "3XL", label: "Adult 3XL", chestWidth: 28, bodyLength: 33, youth: false },
];

/** Common press platen sizes, in inches. */
export const PLATEN_SIZES = [
  { key: "10x12", label: "10 x 12 in (youth / small platen)", width: 10, height: 12 },
  { key: "12x14", label: "12 x 14 in", width: 12, height: 14 },
  { key: "14x16", label: "14 x 16 in (standard adult)", width: 14, height: 16 },
  { key: "16x20", label: "16 x 20 in (oversize)", width: 16, height: 20 },
  { key: "16x24", label: "16 x 24 in (jumbo)", width: 16, height: 24 },
];

/** Default clearances, in inches — decorator convention, adjustable. */
export const DEFAULT_SIDE_MARGIN = 1;
export const DEFAULT_HEM_MARGIN = 3;
/** Top of a full-front print sits this far below the collar seam. */
export const COLLAR_DROP_ADULT = 3;
export const COLLAR_DROP_YOUTH = 2;

/** Print resolution a direct-to-garment printer expects. */
export const DEFAULT_DPI = 300;

/**
 * Standard placements, expressed as offsets in inches from a named landmark.
 * These are widely used decorator conventions rather than a published standard,
 * so treat them as starting points and confirm with your printer.
 */
export const PLACEMENTS = [
  {
    key: "fullFront",
    label: "Full front",
    landmark: "Collar seam at centre front",
    topOffset: null, // taken from collarDrop
    maxWidth: null, // taken from the calculated area
    note: "Centred left to right. Drop the top edge further for a lower, more modern look.",
  },
  {
    key: "leftChest",
    label: "Left chest",
    landmark: "Shoulder seam",
    topOffset: 3,
    maxWidth: 4,
    note: "Design centre sits roughly 3.5-4 in from the centre front line, on the wearer's left.",
  },
  {
    key: "fullBack",
    label: "Full back",
    landmark: "Collar seam at centre back",
    topOffset: 3,
    maxWidth: null,
    note: "Often dropped to 4 in on larger sizes so the print is not hidden by the shoulders.",
  },
  {
    key: "backYoke",
    label: "Back yoke / neck label",
    landmark: "Collar seam at centre back",
    topOffset: 1,
    maxWidth: 4,
    note: "Small strip prints sit right under the collar seam.",
  },
  {
    key: "sleeve",
    label: "Sleeve",
    landmark: "Shoulder seam",
    topOffset: 1.5,
    maxWidth: 3.5,
    note: "Keep clear of the sleeve hem; short sleeves rarely take more than 3.5 in of width.",
  },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const round2 = (value) => Math.round(value * 100) / 100;

export function findSize(sizeKey) {
  return GARMENT_SIZES.find((size) => size.key === sizeKey) ?? null;
}

export function findPlaten(platenKey) {
  return PLATEN_SIZES.find((platen) => platen.key === platenKey) ?? null;
}

/**
 * @returns printable area for one size, the fitted design and its pixel size.
 */
export function computePrintArea({
  sizeKey,
  platenKey,
  sideMargin = DEFAULT_SIDE_MARGIN,
  hemMargin = DEFAULT_HEM_MARGIN,
  collarDrop,
  designRatioWidth = 1,
  designRatioHeight = 1,
  dpi = DEFAULT_DPI,
}) {
  const size = findSize(sizeKey);
  const platen = findPlaten(platenKey);
  if (!size) return { error: "Choose a garment size." };
  if (!platen) return { error: "Choose a platen size." };

  const drop = isNum(collarDrop) ? collarDrop : size.youth ? COLLAR_DROP_YOUTH : COLLAR_DROP_ADULT;

  const scalars = { sideMargin, hemMargin, drop, designRatioWidth, designRatioHeight, dpi };
  for (const [key, value] of Object.entries(scalars)) {
    if (!isNum(value)) return { error: `Enter a number for ${key}.` };
    if (value < 0) return { error: "Margins, offsets and ratios cannot be negative." };
  }
  if (designRatioWidth <= 0 || designRatioHeight <= 0) {
    return { error: "Design width and height ratios must be greater than zero." };
  }
  if (dpi < 72 || dpi > 1200) return { error: "Resolution should be between 72 and 1200 DPI." };

  const garmentWidth = size.chestWidth - 2 * sideMargin;
  const garmentHeight = size.bodyLength - drop - hemMargin;

  if (garmentWidth <= 0) {
    return { error: "Side margins are wider than the garment — reduce them." };
  }
  if (garmentHeight <= 0) {
    return { error: "The collar drop and hem margin leave no height — reduce them." };
  }

  const maxWidth = Math.min(platen.width, garmentWidth);
  const maxHeight = Math.min(platen.height, garmentHeight);

  // Contain fit: scale the design ratio until it just touches the box.
  const scale = Math.min(maxWidth / designRatioWidth, maxHeight / designRatioHeight);
  const designWidth = designRatioWidth * scale;
  const designHeight = designRatioHeight * scale;

  return {
    size,
    platen,
    collarDrop: drop,
    sideMargin,
    hemMargin,
    garmentWidth: round2(garmentWidth),
    garmentHeight: round2(garmentHeight),
    maxWidth: round2(maxWidth),
    maxHeight: round2(maxHeight),
    maxAreaSqIn: round2(maxWidth * maxHeight),
    widthLimitedBy: platen.width <= garmentWidth ? "platen" : "garment",
    heightLimitedBy: platen.height <= garmentHeight ? "platen" : "garment",
    designWidth: round2(designWidth),
    designHeight: round2(designHeight),
    designAreaSqIn: round2(designWidth * designHeight),
    pixelWidth: Math.round(designWidth * dpi),
    pixelHeight: Math.round(designHeight * dpi),
    dpi: Math.round(dpi),
    topEdgeBelowCollar: round2(drop),
    bottomEdgeAboveHem: round2(size.bodyLength - drop - designHeight),
  };
}

/** The same calculation across every size, for a size-run sheet. */
export function buildSizeRun(options) {
  const rows = [];
  for (const size of GARMENT_SIZES) {
    const row = computePrintArea({ ...options, sizeKey: size.key });
    if (row.error) return { error: row.error };
    rows.push(row);
  }
  return { rows };
}

/**
 * Placement offsets for one garment, resolved against the calculated area.
 */
export function resolvePlacements(area) {
  if (!area || area.error) return { error: "Calculate a print area first." };
  return {
    rows: PLACEMENTS.map((placement) => ({
      key: placement.key,
      label: placement.label,
      landmark: placement.landmark,
      topOffset: placement.topOffset === null ? area.collarDrop : placement.topOffset,
      maxWidth: placement.maxWidth === null ? area.maxWidth : placement.maxWidth,
      note: placement.note,
    })),
  };
}

/**
 * Geometry for a to-scale preview, expressed as percentages of the garment
 * rectangle so a view can position boxes without doing arithmetic of its own.
 */
export function buildPreviewGeometry(area) {
  if (!area || area.error) return { error: "Calculate a print area first." };
  const { size } = area;
  return {
    garmentAspectRatio: size.chestWidth / size.bodyLength,
    printWidthPercent: (area.designWidth / size.chestWidth) * 100,
    printHeightPercent: (area.designHeight / size.bodyLength) * 100,
    printTopPercent: (area.collarDrop / size.bodyLength) * 100,
    maxWidthPercent: (area.maxWidth / size.chestWidth) * 100,
    maxHeightPercent: (area.maxHeight / size.bodyLength) * 100,
  };
}

/**
 * Whether an image at a given pixel size is sharp enough for the printed size.
 * effectiveDpi = pixels / inches; below about 150 DPI a garment print looks soft.
 */
export const MIN_ACCEPTABLE_DPI = 150;

export function checkResolution({ pixelWidth, pixelHeight, printWidth, printHeight }) {
  const values = { pixelWidth, pixelHeight, printWidth, printHeight };
  for (const [key, value] of Object.entries(values)) {
    if (!isNum(value)) return { error: `Enter a number for ${key}.` };
    if (value <= 0) return { error: "Pixel sizes and print sizes must be greater than zero." };
  }
  const dpiAcross = pixelWidth / printWidth;
  const dpiDown = pixelHeight / printHeight;
  const effectiveDpi = Math.min(dpiAcross, dpiDown);
  return {
    dpiAcross: round2(dpiAcross),
    dpiDown: round2(dpiDown),
    effectiveDpi: round2(effectiveDpi),
    goodEnough: effectiveDpi >= MIN_ACCEPTABLE_DPI,
    idealEnough: effectiveDpi >= DEFAULT_DPI,
  };
}
