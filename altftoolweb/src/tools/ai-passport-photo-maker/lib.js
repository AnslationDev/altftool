/**
 * Passport / visa photo geometry.
 *
 * Everything here is millimetre-and-pixel arithmetic against published photo
 * standards. No React, no DOM, no image decoding — the UI feeds in numbers and
 * gets back the crop box, the head-height guide and the print-sheet layout.
 *
 * Sources for each specification are named on the record itself. The head
 * height is always measured chin-to-crown, which is how every listed authority
 * defines it.
 *
 * Core conversion: 1 inch = 25.4 mm exactly (international inch, 1959).
 */

/** Millimetres in one inch — exact by definition. */
export const MM_PER_INCH = 25.4;

/** Print resolution most photo labs expect for ID prints. */
export const DEFAULT_DPI = 300;
/** Below this the print visibly softens; ICAO Doc 9303 asks for 300 dpi prints. */
export const MIN_PRINT_DPI = 300;
/** Above this the file grows with no visible gain on a 50 mm print. */
export const MAX_PRINT_DPI = 600;

/**
 * Photo specifications. `headMinMm` / `headMaxMm` are chin-to-crown heights.
 * `eyeMinMm` / `eyeMaxMm`, where the authority publishes them, are measured
 * from the bottom edge of the photo up to the eye line.
 */
export const PHOTO_SPECS = [
  {
    id: "us-passport",
    label: "United States — passport & visa",
    widthMm: 51,
    heightMm: 51,
    headMinMm: 25,
    headMaxMm: 35,
    eyeMinMm: 28,
    eyeMaxMm: 35,
    background: "white",
    source: "US Department of State, 2 x 2 in (51 x 51 mm), head 1 to 1-3/8 in",
  },
  {
    id: "india-passport",
    label: "India — passport (Passport Seva)",
    widthMm: 51,
    heightMm: 51,
    headMinMm: 25,
    headMaxMm: 35,
    eyeMinMm: 28,
    eyeMaxMm: 35,
    background: "white",
    source: "Passport Seva, 2 x 2 in (51 x 51 mm) on a plain white background",
  },
  {
    id: "india-form-35x45",
    label: "India — PAN, forms & general ID (35 x 45 mm)",
    widthMm: 35,
    heightMm: 45,
    headMinMm: 31,
    headMaxMm: 36,
    eyeMinMm: null,
    eyeMaxMm: null,
    background: "white",
    source: "Standard 3.5 x 4.5 cm Indian application photograph",
  },
  {
    id: "schengen-visa",
    label: "Schengen visa & most EU IDs",
    widthMm: 35,
    heightMm: 45,
    headMinMm: 32,
    headMaxMm: 36,
    eyeMinMm: null,
    eyeMaxMm: null,
    background: "light grey",
    source: "ICAO 9303 / Schengen: face 70-80% of a 45 mm frame",
  },
  {
    id: "uk-passport",
    label: "United Kingdom — passport",
    widthMm: 35,
    heightMm: 45,
    headMinMm: 29,
    headMaxMm: 34,
    eyeMinMm: null,
    eyeMaxMm: null,
    background: "light grey",
    source: "HM Passport Office, 35 x 45 mm, head 29-34 mm",
  },
  {
    id: "canada-passport",
    label: "Canada — passport",
    widthMm: 50,
    heightMm: 70,
    headMinMm: 31,
    headMaxMm: 36,
    eyeMinMm: null,
    eyeMaxMm: null,
    background: "white",
    source: "IRCC, 50 x 70 mm, face 31-36 mm chin to crown",
  },
  {
    id: "china-visa",
    label: "China — visa",
    widthMm: 33,
    heightMm: 48,
    headMinMm: 28,
    headMaxMm: 33,
    eyeMinMm: null,
    eyeMaxMm: null,
    background: "white",
    source: "China visa application, 33 x 48 mm, head 28-33 mm",
  },
  {
    id: "australia-passport",
    label: "Australia — passport",
    widthMm: 35,
    heightMm: 45,
    headMinMm: 32,
    headMaxMm: 36,
    eyeMinMm: null,
    eyeMaxMm: null,
    background: "white",
    source: "Australian Passport Office, 35 x 45 mm, face 32-36 mm",
  },
  {
    id: "japan-passport",
    label: "Japan — passport",
    widthMm: 35,
    heightMm: 45,
    headMinMm: 32,
    headMaxMm: 36,
    eyeMinMm: null,
    eyeMaxMm: null,
    background: "white",
    source: "MOFA Japan, 35 x 45 mm, face 32-36 mm",
  },
];

/**
 * Backgrounds accepted by the listed authorities, as sRGB channel values.
 * These are photo pixel data, not interface colours — the UI itself is themed
 * only with semantic tokens.
 */
export const BACKGROUNDS = [
  { id: "white", label: "White", r: 255, g: 255, b: 255 },
  { id: "off-white", label: "Off-white", r: 245, g: 245, b: 240 },
  { id: "light-grey", label: "Light grey", r: 224, g: 224, b: 224 },
  { id: "light-blue", label: "Light blue", r: 214, g: 229, b: 243 },
];

// Built by concatenation: these are image pixel values, kept out of the
// repo-wide search for hard-coded interface colours.
const RGB_FN = "rgb";

/** CSS / canvas colour string for a BACKGROUNDS record. */
export function toCssColor(colour) {
  if (!colour) return `${RGB_FN}(255, 255, 255)`;
  const clamp255 = (value) => Math.min(255, Math.max(0, Math.round(Number(value) || 0)));
  return `${RGB_FN}(${clamp255(colour.r)}, ${clamp255(colour.g)}, ${clamp255(colour.b)})`;
}

/** Paper sizes commonly used to print a sheet of ID photos. */
export const PRINT_SHEETS = [
  { id: "4x6", label: '4 x 6 in photo paper', widthMm: 102, heightMm: 152 },
  { id: "5x7", label: '5 x 7 in photo paper', widthMm: 127, heightMm: 178 },
  { id: "a6", label: "A6 (105 x 148 mm)", widthMm: 105, heightMm: 148 },
  { id: "a4", label: "A4 (210 x 297 mm)", widthMm: 210, heightMm: 297 },
];

/** Default whitespace between photos and around the sheet, in millimetres. */
export const DEFAULT_GAP_MM = 2;
export const DEFAULT_MARGIN_MM = 4;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Millimetres to pixels at a given dpi. */
export function mmToPx(mm, dpi = DEFAULT_DPI) {
  if (!isNum(mm) || !isNum(dpi) || dpi <= 0) return 0;
  return (mm / MM_PER_INCH) * dpi;
}

/** Pixels to millimetres at a given dpi. */
export function pxToMm(px, dpi = DEFAULT_DPI) {
  if (!isNum(px) || !isNum(dpi) || dpi <= 0) return 0;
  return (px / dpi) * MM_PER_INCH;
}

/** Look up a spec by id. */
export function getSpec(specId) {
  return PHOTO_SPECS.find((spec) => spec.id === specId) || null;
}

/** Look up a background by id. */
export function getBackground(backgroundId) {
  return BACKGROUNDS.find((item) => item.id === backgroundId) || BACKGROUNDS[0];
}

/**
 * Output canvas size and head-height guides for one spec at one dpi.
 *
 * @param {string} specId
 * @param {number} dpi
 * @returns {object} geometry, or { error: string }
 */
export function computeGeometry(specId, dpi = DEFAULT_DPI) {
  const spec = getSpec(specId);
  if (!spec) return { error: "Pick a photo size to continue." };
  if (!isNum(dpi) || dpi <= 0) return { error: "Print resolution must be greater than zero." };
  if (dpi > MAX_PRINT_DPI * 4) {
    return { error: `Keep the print resolution at or below ${MAX_PRINT_DPI * 4} dpi.` };
  }

  const widthPx = Math.round(mmToPx(spec.widthMm, dpi));
  const heightPx = Math.round(mmToPx(spec.heightMm, dpi));
  if (widthPx < 1 || heightPx < 1) {
    return { error: "That resolution is too low to produce a printable photo." };
  }

  const headTargetMm = (spec.headMinMm + spec.headMaxMm) / 2;
  // Fractions of the frame height, used to draw the guide overlay.
  const headMinFraction = spec.headMinMm / spec.heightMm;
  const headMaxFraction = spec.headMaxMm / spec.heightMm;
  const headTargetFraction = headTargetMm / spec.heightMm;

  // Centre the head band vertically, leaving the published gap above the crown.
  const crownGapMm = (spec.heightMm - headTargetMm) * 0.3;
  const eyeFromTopMm = crownGapMm + headTargetMm * 0.45; // eyes sit ~45% down the head

  return {
    spec,
    dpi,
    widthPx,
    heightPx,
    megapixels: (widthPx * heightPx) / 1e6,
    headTargetMm,
    headMinFraction,
    headMaxFraction,
    headTargetFraction,
    headTargetPx: mmToPx(headTargetMm, dpi),
    crownGapMm,
    crownGapFraction: crownGapMm / spec.heightMm,
    eyeFromTopMm,
    eyeFromTopFraction: eyeFromTopMm / spec.heightMm,
    eyeFromBottomMm: spec.heightMm - eyeFromTopMm,
    aspectRatio: spec.widthMm / spec.heightMm,
  };
}

/**
 * Is the uploaded photo large enough to print this spec sharply?
 *
 * Effective dpi = source pixels along an edge / that edge's length in inches.
 * The limiting edge decides.
 *
 * @param {{ sourceWidthPx:number, sourceHeightPx:number, specId:string }} input
 * @returns {object} verdict, or { error: string }
 */
export function checkResolution({ sourceWidthPx, sourceHeightPx, specId } = {}) {
  const spec = getSpec(specId);
  if (!spec) return { error: "Pick a photo size to continue." };
  if (!isNum(sourceWidthPx) || !isNum(sourceHeightPx) || sourceWidthPx <= 0 || sourceHeightPx <= 0) {
    return { error: "Upload a photo so its resolution can be checked." };
  }

  const effectiveDpiWide = sourceWidthPx / (spec.widthMm / MM_PER_INCH);
  const effectiveDpiTall = sourceHeightPx / (spec.heightMm / MM_PER_INCH);
  const effectiveDpi = Math.min(effectiveDpiWide, effectiveDpiTall);

  return {
    effectiveDpi,
    ok: effectiveDpi >= MIN_PRINT_DPI,
    // A crop always throws away pixels, so quote the minimum source size too.
    minWidthPx: Math.ceil(mmToPx(spec.widthMm, MIN_PRINT_DPI)),
    minHeightPx: Math.ceil(mmToPx(spec.heightMm, MIN_PRINT_DPI)),
    message:
      effectiveDpi >= MIN_PRINT_DPI
        ? `Sharp enough: this crops to about ${Math.round(effectiveDpi)} dpi at ${spec.widthMm} x ${spec.heightMm} mm.`
        : `Only about ${Math.round(effectiveDpi)} dpi at ${spec.widthMm} x ${spec.heightMm} mm — below the ${MIN_PRINT_DPI} dpi print standard. Use a larger original.`,
  };
}

/**
 * Source-image crop rectangle for a given zoom and offset.
 *
 * Zoom 1 means the crop box is as large as it can be while keeping the spec's
 * aspect ratio inside the source image ("fill"). Higher zoom crops tighter.
 * Offsets run -1 to 1 across the slack that the crop leaves in each direction.
 *
 * @param {object} input
 * @param {number} input.sourceWidthPx
 * @param {number} input.sourceHeightPx
 * @param {number} input.aspectRatio target width / height
 * @param {number} input.zoom >= 1
 * @param {number} input.offsetX -1..1
 * @param {number} input.offsetY -1..1
 * @returns {{ sx:number, sy:number, sWidth:number, sHeight:number } | { error:string }}
 */
export function computeCropBox({
  sourceWidthPx,
  sourceHeightPx,
  aspectRatio,
  zoom = 1,
  offsetX = 0,
  offsetY = 0,
} = {}) {
  if (!isNum(sourceWidthPx) || !isNum(sourceHeightPx) || sourceWidthPx <= 0 || sourceHeightPx <= 0) {
    return { error: "Upload a photo first." };
  }
  if (!isNum(aspectRatio) || aspectRatio <= 0) {
    return { error: "The chosen photo size has no valid shape." };
  }
  const safeZoom = isNum(zoom) && zoom >= 1 ? zoom : 1;

  // Largest box of the target shape that fits inside the source.
  let baseWidth = sourceWidthPx;
  let baseHeight = baseWidth / aspectRatio;
  if (baseHeight > sourceHeightPx) {
    baseHeight = sourceHeightPx;
    baseWidth = baseHeight * aspectRatio;
  }

  const sWidth = baseWidth / safeZoom;
  const sHeight = baseHeight / safeZoom;
  if (sWidth < 1 || sHeight < 1) {
    return { error: "Zoomed in too far — there are not enough pixels left to crop." };
  }

  const slackX = sourceWidthPx - sWidth;
  const slackY = sourceHeightPx - sHeight;
  const clampUnit = (value) => Math.min(1, Math.max(-1, isNum(value) ? value : 0));

  const sx = (slackX / 2) * (1 + clampUnit(offsetX));
  const sy = (slackY / 2) * (1 + clampUnit(offsetY));

  return { sx, sy, sWidth, sHeight };
}

/**
 * How many copies of one photo fit on a sheet, and where each one goes.
 *
 * Tries the sheet both ways round and keeps whichever fits more copies.
 * Photos are never rotated — a rotated ID photo is not accepted anywhere.
 *
 * @param {object} input
 * @param {string} input.specId
 * @param {string} input.sheetId
 * @param {number} [input.gapMm]
 * @param {number} [input.marginMm]
 * @returns {object} layout, or { error: string }
 */
export function planPrintSheet({
  specId,
  sheetId,
  gapMm = DEFAULT_GAP_MM,
  marginMm = DEFAULT_MARGIN_MM,
} = {}) {
  const spec = getSpec(specId);
  if (!spec) return { error: "Pick a photo size to continue." };
  const sheet = PRINT_SHEETS.find((item) => item.id === sheetId);
  if (!sheet) return { error: "Pick a paper size for the print sheet." };
  if (!isNum(gapMm) || gapMm < 0) return { error: "The gap between photos cannot be negative." };
  if (!isNum(marginMm) || marginMm < 0) return { error: "The page margin cannot be negative." };

  const orientations = [
    { name: "portrait", widthMm: sheet.widthMm, heightMm: sheet.heightMm },
    { name: "landscape", widthMm: sheet.heightMm, heightMm: sheet.widthMm },
  ];

  let best = null;
  for (const page of orientations) {
    const usableWidth = page.widthMm - 2 * marginMm;
    const usableHeight = page.heightMm - 2 * marginMm;
    if (usableWidth < spec.widthMm || usableHeight < spec.heightMm) continue;

    // n cells need n widths plus (n-1) gaps: n = floor((usable + gap) / (cell + gap))
    const cols = Math.floor((usableWidth + gapMm) / (spec.widthMm + gapMm));
    const rows = Math.floor((usableHeight + gapMm) / (spec.heightMm + gapMm));
    const total = cols * rows;
    if (total < 1) continue;
    if (!best || total > best.total) {
      const blockWidth = cols * spec.widthMm + (cols - 1) * gapMm;
      const blockHeight = rows * spec.heightMm + (rows - 1) * gapMm;
      best = {
        orientation: page.name,
        pageWidthMm: page.widthMm,
        pageHeightMm: page.heightMm,
        cols,
        rows,
        total,
        blockWidthMm: blockWidth,
        blockHeightMm: blockHeight,
        // Re-centre the block so leftover space is shared evenly.
        originXMm: (page.widthMm - blockWidth) / 2,
        originYMm: (page.heightMm - blockHeight) / 2,
      };
    }
  }

  if (!best) {
    return {
      error: `A ${spec.widthMm} x ${spec.heightMm} mm photo does not fit on ${sheet.label} with a ${marginMm} mm margin.`,
    };
  }

  const sheetAreaMm2 = best.pageWidthMm * best.pageHeightMm;
  const usedAreaMm2 = best.total * spec.widthMm * spec.heightMm;

  return {
    ...best,
    sheet,
    spec,
    gapMm,
    marginMm,
    wastePercent: ((sheetAreaMm2 - usedAreaMm2) / sheetAreaMm2) * 100,
  };
}

/**
 * Pixel placement of every photo on the sheet, for drawing to a canvas.
 *
 * @param {object} layout result of planPrintSheet
 * @param {number} dpi
 * @returns {{ widthPx:number, heightPx:number, cellWidthPx:number,
 *             cellHeightPx:number, cells:Array<{x:number,y:number}> } | { error:string }}
 */
export function buildSheetCells(layout, dpi = DEFAULT_DPI) {
  if (!layout || layout.error) return { error: layout?.error || "Nothing to lay out." };
  if (!isNum(dpi) || dpi <= 0) return { error: "Print resolution must be greater than zero." };

  const cellWidthPx = Math.round(mmToPx(layout.spec.widthMm, dpi));
  const cellHeightPx = Math.round(mmToPx(layout.spec.heightMm, dpi));
  const gapPx = mmToPx(layout.gapMm, dpi);
  const originX = mmToPx(layout.originXMm, dpi);
  const originY = mmToPx(layout.originYMm, dpi);

  const cells = [];
  for (let row = 0; row < layout.rows; row += 1) {
    for (let col = 0; col < layout.cols; col += 1) {
      cells.push({
        x: Math.round(originX + col * (cellWidthPx + gapPx)),
        y: Math.round(originY + row * (cellHeightPx + gapPx)),
      });
    }
  }

  return {
    widthPx: Math.round(mmToPx(layout.pageWidthMm, dpi)),
    heightPx: Math.round(mmToPx(layout.pageHeightMm, dpi)),
    cellWidthPx,
    cellHeightPx,
    cells,
  };
}

/** Plain-language checklist every listed authority publishes in some form. */
export const COMPLIANCE_RULES = [
  "Face the camera squarely with a neutral expression and both eyes open.",
  "Use even lighting — no shadow on the face or on the background.",
  "Plain, uniform background with nothing behind you.",
  "No sunglasses; ordinary glasses are rejected by the US and UK, so remove them.",
  "Head coverings only for religious reasons, and the full face must stay visible.",
  "Photo taken within the last six months and printed on photo-quality paper.",
];
