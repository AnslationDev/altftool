/**
 * Hoodie print placement.
 *
 * A hoodie is not a t-shirt with a hood. Two features move the boundaries:
 *
 *  - The KANGAROO POCKET. Its top edge is sewn across the front panel, and a
 *    flat platen cannot print over that seam. The front print therefore has to
 *    finish above it, which is why hoodie chest prints are so much shorter than
 *    the same design on a tee.
 *
 *  - The HOOD SEAM. The neckline sits higher and is bulkier, so the top of a
 *    front or back print is dropped further than the 3 inches used on a tee.
 *
 *  front usable height = bodyLength - neckDrop - (pocketTopFromHem + pocketClearance)
 *  back  usable height = bodyLength - neckDrop - hemMargin
 *  usable width        = chestWidth - 2 x sideMargin
 *
 * Everything is then capped by the press platen, the artwork is fitted inside
 * preserving its aspect ratio, and offsets are reported so they can be measured
 * on the real garment.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/**
 * Flat measurements in inches for a typical unisex heavy-blend pullover hoodie
 * (the widely copied Gildan 18500 style chart). chestWidth is measured flat, so
 * it is half the chest circumference.
 */
export const HOODIE_SIZES = [
  { key: "S", label: "Adult S", chestWidth: 20, bodyLength: 26 },
  { key: "M", label: "Adult M", chestWidth: 22, bodyLength: 27 },
  { key: "L", label: "Adult L", chestWidth: 24, bodyLength: 28 },
  { key: "XL", label: "Adult XL", chestWidth: 26, bodyLength: 29 },
  { key: "2XL", label: "Adult 2XL", chestWidth: 28, bodyLength: 30 },
  { key: "3XL", label: "Adult 3XL", chestWidth: 30, bodyLength: 31 },
];

/** Common press platen sizes, in inches. */
export const PLATEN_SIZES = [
  { key: "none", label: "No platen limit (screen print / hand press)", width: Infinity, height: Infinity },
  { key: "10x12", label: "10 x 12 in", width: 10, height: 12 },
  { key: "12x14", label: "12 x 14 in", width: 12, height: 14 },
  { key: "14x16", label: "14 x 16 in (standard adult)", width: 14, height: 16 },
  { key: "16x20", label: "16 x 20 in (oversize)", width: 16, height: 20 },
];

export const PANELS = [
  { key: "front", label: "Front (above the pocket)" },
  { key: "back", label: "Back (full)" },
];

/** Defaults in inches — decorator conventions, all adjustable. */
export const DEFAULT_SIDE_MARGIN = 1;
/** Hoodie necklines are bulkier than a tee, so prints start lower. */
export const DEFAULT_NECK_DROP = 3.5;
/** Measured from the bottom hem up to the top stitch of the pouch pocket. */
export const DEFAULT_POCKET_TOP_FROM_HEM = 10;
/** Keep the print clear of the pocket seam. */
export const DEFAULT_POCKET_CLEARANCE = 1;
/** Clear space above the waistband on a back print. */
export const DEFAULT_HEM_MARGIN = 3;

export const DEFAULT_DPI = 300;
export const MIN_ACCEPTABLE_DPI = 150;

/**
 * Standard placements, in inches from a named landmark. These are widely used
 * decorator conventions rather than a published standard — confirm with your
 * printer, and note that hood and pocket prints need a special small platen.
 */
export const PLACEMENTS = [
  {
    key: "leftChest",
    label: "Left chest",
    landmark: "Shoulder seam",
    topOffset: 3,
    maxWidth: 4,
    note: "Centre of the design sits roughly 4 in from the centre front, on the wearer's left.",
  },
  {
    key: "centreChest",
    label: "Centre chest above the pocket",
    landmark: "Hood / neck seam",
    topOffset: null,
    maxWidth: null,
    note: "Must finish above the pocket seam — this is the shortest print area on the garment.",
  },
  {
    key: "fullBack",
    label: "Full back",
    landmark: "Hood / neck seam at centre back",
    topOffset: null,
    maxWidth: null,
    note: "The tallest area on a hoodie because there is no pocket in the way.",
  },
  {
    key: "backYoke",
    label: "Back yoke strip",
    landmark: "Hood seam at centre back",
    topOffset: 1.5,
    maxWidth: 4,
    note: "Small strip prints sit just under the hood seam.",
  },
  {
    key: "sleeve",
    label: "Sleeve",
    landmark: "Shoulder seam",
    topOffset: 1.5,
    maxWidth: 3.5,
    note: "Long sleeves take a taller print than a tee, but cuff ribbing limits the bottom.",
  },
  {
    key: "hood",
    label: "Hood (one side)",
    landmark: "Hood front edge",
    topOffset: 2,
    maxWidth: 4,
    note: "Needs a small platen and a printer willing to do it — many decorators decline hood prints.",
  },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const round2 = (value) => Math.round(value * 100) / 100;

export function findSize(sizeKey) {
  return HOODIE_SIZES.find((size) => size.key === sizeKey) ?? null;
}

export function findPlaten(platenKey) {
  return PLATEN_SIZES.find((platen) => platen.key === platenKey) ?? null;
}

export function computeHoodieArea({
  sizeKey,
  panel = "front",
  platenKey = "14x16",
  sideMargin = DEFAULT_SIDE_MARGIN,
  neckDrop = DEFAULT_NECK_DROP,
  pocketTopFromHem = DEFAULT_POCKET_TOP_FROM_HEM,
  pocketClearance = DEFAULT_POCKET_CLEARANCE,
  hemMargin = DEFAULT_HEM_MARGIN,
  designRatioWidth = 1,
  designRatioHeight = 1,
  dpi = DEFAULT_DPI,
}) {
  const size = findSize(sizeKey);
  const platen = findPlaten(platenKey);
  if (!size) return { error: "Choose a hoodie size." };
  if (!platen) return { error: "Choose a platen option." };
  if (!PANELS.some((item) => item.key === panel)) {
    return { error: "Choose the front or the back panel." };
  }

  const scalars = {
    sideMargin,
    neckDrop,
    pocketTopFromHem,
    pocketClearance,
    hemMargin,
    designRatioWidth,
    designRatioHeight,
    dpi,
  };
  for (const [key, value] of Object.entries(scalars)) {
    if (!isNum(value)) return { error: `Enter a number for ${key}.` };
    if (value < 0) return { error: "Margins, drops and ratios cannot be negative." };
  }
  if (designRatioWidth <= 0 || designRatioHeight <= 0) {
    return { error: "Design width and height ratios must be greater than zero." };
  }
  if (dpi < 72 || dpi > 1200) return { error: "Resolution should be between 72 and 1200 DPI." };

  const bottomReserved =
    panel === "front" ? pocketTopFromHem + pocketClearance : hemMargin;

  const usableWidth = size.chestWidth - 2 * sideMargin;
  const usableHeight = size.bodyLength - neckDrop - bottomReserved;

  if (usableWidth <= 0) {
    return { error: "Side margins are wider than the garment — reduce them." };
  }
  if (usableHeight <= 0) {
    return panel === "front"
      ? {
          error:
            "The pocket sits too high for these clearances — measure the pocket seam on the real garment or move to a left-chest print.",
        }
      : { error: "The neck drop and hem margin leave no height — reduce them." };
  }

  const maxWidth = Math.min(platen.width, usableWidth);
  const maxHeight = Math.min(platen.height, usableHeight);

  const scale = Math.min(maxWidth / designRatioWidth, maxHeight / designRatioHeight);
  const designWidth = designRatioWidth * scale;
  const designHeight = designRatioHeight * scale;

  return {
    size,
    platen,
    panel,
    neckDrop,
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
    topOffset: round2(neckDrop),
    leftOffset: round2((size.chestWidth - designWidth) / 2),
    gapAbovePocket:
      panel === "front" ? round2(size.bodyLength - neckDrop - designHeight - pocketTopFromHem) : null,
    widthLimitedBy: platen.width <= usableWidth ? "platen" : "garment",
    heightLimitedBy: platen.height <= usableHeight ? "platen" : "garment",
  };
}

/** The same calculation across every hoodie size. */
export function buildSizeRun(options) {
  const rows = [];
  for (const size of HOODIE_SIZES) {
    const row = computeHoodieArea({ ...options, sizeKey: size.key });
    rows.push(row.error ? { size, error: row.error } : row);
  }
  return { rows };
}

/** Placements resolved against the calculated area. */
export function resolvePlacements(area) {
  if (!area || area.error) return { error: "Calculate a print area first." };
  return {
    rows: PLACEMENTS.map((placement) => ({
      key: placement.key,
      label: placement.label,
      landmark: placement.landmark,
      topOffset: placement.topOffset === null ? area.neckDrop : placement.topOffset,
      maxWidth: placement.maxWidth === null ? area.maxWidth : placement.maxWidth,
      note: placement.note,
    })),
  };
}

/** Preview geometry as percentages of the flat panel. */
export function buildPreviewGeometry(area) {
  if (!area || area.error) return { error: "Calculate a print area first." };
  const { size } = area;
  return {
    panelAspectRatio: size.chestWidth / size.bodyLength,
    safeTopPercent: (area.neckDrop / size.bodyLength) * 100,
    safeWidthPercent: (area.usableWidth / size.chestWidth) * 100,
    safeHeightPercent: (area.usableHeight / size.bodyLength) * 100,
    designWidthPercent: (area.designWidth / size.chestWidth) * 100,
    designHeightPercent: (area.designHeight / size.bodyLength) * 100,
    bottomReservedPercent: (area.bottomReserved / size.bodyLength) * 100,
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
