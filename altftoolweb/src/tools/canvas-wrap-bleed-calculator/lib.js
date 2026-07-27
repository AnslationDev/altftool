/**
 * Canvas Wrap Bleed Calculator — pure calculation module.
 * No React, no DOM, no clock reads.
 *
 * Geometry of a gallery wrap:
 *
 *   print width  = face width  + 2 x (bar depth + back tuck)
 *   print height = face height + 2 x (bar depth + back tuck)
 *
 * The "bar depth" strip is the part that becomes the visible side of the
 * canvas; the "back tuck" is the extra material stapled to the rear of the
 * stretcher bar. Anything inside the safe margin on the front face is what
 * survives with certainty once the canvas is stretched.
 */

/** International inch, fixed at exactly 25.4 mm. */
export const MM_PER_INCH = 25.4;

export const UNITS = ["mm", "cm", "in"];

/**
 * Stock stretcher bar depths sold by canvas printers, in inches.
 * 0.75" is the slim/"gallery thin" bar, 1.5" the standard gallery wrap,
 * 2" the deep museum profile.
 */
export const BAR_DEPTHS_IN = [0.75, 1.25, 1.5, 2];

/** Material stapled to the back of the bar. 1.5 in is the common trade default. */
export const DEFAULT_BACK_TUCK_IN = 1.5;

/** Keep-clear margin inside the front face, measured from the wrap fold line. */
export const DEFAULT_SAFE_MARGIN_IN = 0.5;

/** Largest face side this tool will accept — beyond this you are into billboard territory. */
export const MAX_FACE_MM = 3000;

/** Rolled canvas media is normally 1.52 m (60 in) wide at most. */
export const MAX_MEDIA_WIDTH_MM = 1524;

/** Resolution below which a canvas print starts to show pixel structure at arm's length. */
export const MIN_RECOMMENDED_DPI = 150;

/** Resolution canvas labs normally ask for. */
export const TARGET_DPI = 300;

export function toMillimetres(value, unit) {
  const v = Number(value);
  if (!Number.isFinite(v)) return null;
  if (unit === "mm") return v;
  if (unit === "cm") return v * 10;
  if (unit === "in") return v * MM_PER_INCH;
  return null;
}

export function fromMillimetres(valueMm, unit) {
  const v = Number(valueMm);
  if (!Number.isFinite(v)) return null;
  if (unit === "mm") return v;
  if (unit === "cm") return v / 10;
  if (unit === "in") return v / MM_PER_INCH;
  return null;
}

/**
 * Full canvas wrap geometry.
 *
 * @param {object} input
 * @param {number} input.faceWidth   visible front width, in `unit`
 * @param {number} input.faceHeight  visible front height, in `unit`
 * @param {string} input.unit        "mm" | "cm" | "in"
 * @param {number} input.barDepth    stretcher bar depth, in `unit`
 * @param {number} input.backTuck    material folded onto the back, in `unit`
 * @param {number} input.safeMargin  keep-clear band inside the face, in `unit`
 * @param {number} input.imagePixelWidth  optional source file width in pixels
 */
export function computeCanvasWrap(input) {
  const {
    faceWidth,
    faceHeight,
    unit = "cm",
    barDepth,
    backTuck,
    safeMargin,
    imagePixelWidth = 0,
  } = input || {};

  if (!UNITS.includes(unit)) return { error: "Choose a valid unit." };

  const values = {
    faceW: toMillimetres(faceWidth, unit),
    faceH: toMillimetres(faceHeight, unit),
    depth: toMillimetres(barDepth, unit),
    tuck: toMillimetres(backTuck, unit),
    safe: toMillimetres(safeMargin, unit),
  };

  if (Object.values(values).some((v) => v === null || !Number.isFinite(v))) {
    return { error: "Enter every measurement as a number." };
  }
  const { faceW, faceH, depth, tuck, safe } = values;

  if (faceW <= 0 || faceH <= 0) {
    return { error: "The visible face width and height must both be greater than zero." };
  }
  if (faceW > MAX_FACE_MM || faceH > MAX_FACE_MM) {
    return { error: `A face larger than ${MAX_FACE_MM / 10} cm per side is beyond normal stretcher bar stock.` };
  }
  if (depth < 0 || tuck < 0 || safe < 0) {
    return { error: "Bar depth, back tuck and safe margin cannot be negative." };
  }
  if (safe * 2 >= faceW || safe * 2 >= faceH) {
    return { error: "The safe margin is so wide it leaves no usable area on the front face." };
  }

  const bleedPerSide = depth + tuck;
  const printW = faceW + 2 * bleedPerSide;
  const printH = faceH + 2 * bleedPerSide;

  const faceArea = faceW * faceH;
  const printArea = printW * printH;
  const safeW = faceW - 2 * safe;
  const safeH = faceH - 2 * safe;
  const safeArea = safeW * safeH;

  // How much of the printed sheet is never seen from the front.
  const hiddenAreaPct = ((printArea - faceArea) / printArea) * 100;
  // Extra media consumed relative to a flat print of the same face size.
  const extraMaterialPct = ((printArea - faceArea) / faceArea) * 100;
  const safeSharePct = (safeArea / printArea) * 100;

  const pixels = Number(imagePixelWidth);
  const hasPixels = Number.isFinite(pixels) && pixels > 0;
  const printDpi = hasPixels ? pixels / (printW / MM_PER_INCH) : null;

  const requiredPixels = {
    widthPx: Math.ceil((printW / MM_PER_INCH) * TARGET_DPI),
    heightPx: Math.ceil((printH / MM_PER_INCH) * TARGET_DPI),
  };

  const warnings = [];
  if (printW > MAX_MEDIA_WIDTH_MM && printH > MAX_MEDIA_WIDTH_MM) {
    warnings.push(
      `Both printed sides exceed ${MAX_MEDIA_WIDTH_MM / 10} cm, which is wider than standard 60 inch roll canvas.`,
    );
  }
  if (depth > 0 && safe < depth * 0.25) {
    warnings.push("A safe margin smaller than a quarter of the bar depth risks detail landing on the rounded corner fold.");
  }
  if (tuck > 0 && tuck < 25.4) {
    warnings.push("Under 25 mm of back tuck leaves very little canvas to grip with stretching pliers.");
  }
  if (hasPixels && printDpi !== null && printDpi < MIN_RECOMMENDED_DPI) {
    warnings.push(`At ${Math.round(printDpi)} DPI the file is below the ${MIN_RECOMMENDED_DPI} DPI floor most canvas labs accept.`);
  }

  return {
    faceWmm: faceW,
    faceHmm: faceH,
    depthMm: depth,
    tuckMm: tuck,
    safeMm: safe,
    bleedPerSideMm: bleedPerSide,
    printWmm: printW,
    printHmm: printH,
    safeWmm: safeW,
    safeHmm: safeH,
    faceAreaMm2: faceArea,
    printAreaMm2: printArea,
    safeAreaMm2: safeArea,
    hiddenAreaPct,
    extraMaterialPct,
    safeSharePct,
    edgeToSafeMm: bleedPerSide + safe,
    printDpi,
    requiredPixels,
    warnings,
  };
}

/**
 * Stock bar depths expressed in the unit the user is working in, so the UI can
 * offer one-tap presets without doing its own conversion.
 */
export function barDepthPresets(unit) {
  return BAR_DEPTHS_IN.map((inches) => {
    const mmValue = inches * MM_PER_INCH;
    const converted = fromMillimetres(mmValue, unit);
    return {
      id: `bar-${inches}`,
      label: `${inches}" bar`,
      value: converted === null ? "" : String(Math.round(converted * 100) / 100),
    };
  });
}

/**
 * Percentages for drawing the wrap diagram: where the fold line and the safe
 * zone sit inside the full printed sheet. Kept out of the UI on purpose.
 */
export function wrapPreview(result) {
  if (!result || result.error) return null;
  const { printWmm, printHmm, bleedPerSideMm, edgeToSafeMm, tuckMm } = result;
  if (!(printWmm > 0) || !(printHmm > 0)) return null;
  // Bands from the sheet edge inwards: back tuck, then the visible side, then the face.
  return {
    aspectPct: (printHmm / printWmm) * 100,
    tuckInsetXPct: (tuckMm / printWmm) * 100,
    tuckInsetYPct: (tuckMm / printHmm) * 100,
    faceInsetXPct: (bleedPerSideMm / printWmm) * 100,
    faceInsetYPct: (bleedPerSideMm / printHmm) * 100,
    safeInsetXPct: (edgeToSafeMm / printWmm) * 100,
    safeInsetYPct: (edgeToSafeMm / printHmm) * 100,
  };
}
