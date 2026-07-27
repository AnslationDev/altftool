/**
 * Poster Frame Size Matcher — pure calculation module.
 * No React, no DOM, no clock reads. Same input always gives the same output.
 */

/** International inch, fixed at exactly 25.4 mm since the 1959 international yard agreement. */
export const MM_PER_INCH = 25.4;

/** Anything larger than this per side is outside normal off-the-shelf framing stock. */
export const MAX_SIDE_MM = 5000;

/** A mount border wider than this exceeds the rebate of virtually all stock frames. */
export const MAX_MAT_MM = 200;

/** Two ratios closer than this are treated as the same shape (rounding in retail sizes). */
export const RATIO_MATCH_TOLERANCE_PCT = 0.75;

export const UNITS = ["mm", "cm", "in", "px"];

/**
 * ISO 216 A-series trimmed sizes, in millimetres, portrait orientation.
 * Source: ISO 216 — every A size shares the 1 : sqrt(2) ratio (about 1 : 1.4142).
 */
export const A_SERIES_MM = [
  { id: "a5", label: "A5", w: 148, h: 210 },
  { id: "a4", label: "A4", w: 210, h: 297 },
  { id: "a3", label: "A3", w: 297, h: 420 },
  { id: "a2", label: "A2", w: 420, h: 594 },
  { id: "a1", label: "A1", w: 594, h: 841 },
  { id: "a0", label: "A0", w: 841, h: 1189 },
];

/** Common off-the-shelf imperial frame openings, in inches (portrait). */
export const IMPERIAL_INCHES = [
  [4, 6],
  [5, 7],
  [6, 8],
  [8, 10],
  [11, 14],
  [12, 16],
  [16, 20],
  [18, 24],
  [20, 30],
  [24, 36],
];

/** Common off-the-shelf metric frame openings, in centimetres (portrait). */
export const METRIC_CM = [
  [10, 15],
  [13, 18],
  [20, 25],
  [24, 30],
  [30, 40],
  [40, 50],
  [50, 70],
  [60, 80],
  [70, 100],
];

const roundTo = (value, places) => {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
};

function buildFrameList() {
  const list = A_SERIES_MM.map((size) => ({
    id: `iso-${size.id}`,
    system: "ISO A-series",
    label: size.label,
    sizeLabel: `${size.w} × ${size.h} mm`,
    w: size.w,
    h: size.h,
  }));

  IMPERIAL_INCHES.forEach(([wIn, hIn]) => {
    list.push({
      id: `in-${wIn}x${hIn}`,
      system: "Imperial",
      label: `${wIn}" × ${hIn}"`,
      sizeLabel: `${roundTo(wIn * MM_PER_INCH, 1)} × ${roundTo(hIn * MM_PER_INCH, 1)} mm`,
      w: wIn * MM_PER_INCH,
      h: hIn * MM_PER_INCH,
    });
  });

  METRIC_CM.forEach(([wCm, hCm]) => {
    list.push({
      id: `cm-${wCm}x${hCm}`,
      system: "Metric",
      label: `${wCm} × ${hCm} cm`,
      sizeLabel: `${wCm * 10} × ${hCm * 10} mm`,
      w: wCm * 10,
      h: hCm * 10,
    });
  });

  return list;
}

/** Every stock frame this tool knows about, stored portrait, sizes in millimetres. */
export const FRAME_SIZES = buildFrameList();

/**
 * Convert a length to millimetres.
 * Pixels need a print resolution; every other unit is a fixed conversion.
 */
export function toMillimetres(value, unit, dpi) {
  const v = Number(value);
  if (!Number.isFinite(v) || v <= 0) return null;
  if (unit === "mm") return v;
  if (unit === "cm") return v * 10;
  if (unit === "in") return v * MM_PER_INCH;
  if (unit === "px") {
    const d = Number(dpi);
    if (!Number.isFinite(d) || d <= 0) return null;
    return (v / d) * MM_PER_INCH;
  }
  return null;
}

/** Largest denominator accepted when naming a ratio like 3 : 2 or 16 : 9. */
export const MAX_RATIO_TERM = 40;

/** A whole-number ratio is only used if it is this close to the real ratio. */
export const RATIO_SNAP_TOLERANCE = 0.001; // 0.1% relative error

/**
 * Name a width : height pair as the simplest whole-number ratio that is within
 * 0.1% of the real value (so 3000x2000 reads as "3 : 2"). Shapes with no clean
 * whole-number form — the ISO A-series 1 : sqrt(2) among them — fall back to a
 * decimal form instead of an invented approximation.
 */
export function simplifyRatio(width, height) {
  const w = Number(width);
  const h = Number(height);
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return null;

  const target = w / h;
  let best = null;
  for (let q = 1; q <= MAX_RATIO_TERM; q += 1) {
    const p = Math.round(target * q);
    if (p < 1 || p > MAX_RATIO_TERM) continue;
    const err = Math.abs(p / q - target) / target;
    if (best === null || err < best.err) best = { p, q, err };
    if (err === 0) break;
  }

  if (best && best.err <= RATIO_SNAP_TOLERANCE) {
    return { w: best.p, h: best.q, label: `${best.p} : ${best.q}`, exact: true };
  }

  const label =
    target >= 1
      ? `${roundTo(target, 2)} : 1`
      : `1 : ${roundTo(h / w, 2)}`;
  return { w: roundTo(target, 4), h: 1, label, exact: false };
}

/**
 * Match a piece of artwork against every stock frame size.
 *
 * fit  = whole artwork sits inside the frame, unprinted area becomes mount board.
 * fill = artwork is enlarged to cover the frame, the overhang is trimmed off.
 */
export function matchFrames(input) {
  const {
    width,
    height,
    unit = "cm",
    dpi = 300,
    matBorderMm = 0,
  } = input || {};

  const w = Number(width);
  const h = Number(height);
  const d = Number(dpi);
  const mat = Number(matBorderMm);

  if (!Number.isFinite(w) || !Number.isFinite(h)) {
    return { error: "Enter the artwork width and height as numbers." };
  }
  if (w <= 0 || h <= 0) {
    return { error: "Artwork width and height must both be greater than zero." };
  }
  if (!UNITS.includes(unit)) {
    return { error: "Choose a valid unit for the artwork size." };
  }
  if (unit === "px" && (!Number.isFinite(d) || d <= 0)) {
    return { error: "Enter a print resolution above 0 DPI so pixels can be converted to a physical size." };
  }
  if (!Number.isFinite(mat) || mat < 0) {
    return { error: "Mount border cannot be negative." };
  }
  if (mat > MAX_MAT_MM) {
    return { error: `A mount border wider than ${MAX_MAT_MM} mm is larger than the rebate of stock frames.` };
  }

  const artW = toMillimetres(w, unit, d) ?? 0;
  const artH = toMillimetres(h, unit, d) ?? 0;
  if (!Number.isFinite(artW) || !Number.isFinite(artH) || artW <= 0 || artH <= 0) {
    return { error: "That size could not be converted — check the unit and the DPI value." };
  }
  if (artW > MAX_SIDE_MM || artH > MAX_SIDE_MM) {
    return { error: `Artwork over ${MAX_SIDE_MM / 1000} m on a side is outside standard framing stock.` };
  }

  const aspect = artW / artH;
  const isLandscape = artW > artH;
  const orientation = artW > artH ? "Landscape" : artW < artH ? "Portrait" : "Square";

  const frames = FRAME_SIZES.map((frame) => {
    // Rotate the stock frame to match how the artwork is oriented.
    const fw = isLandscape ? frame.h : frame.w;
    const fh = isLandscape ? frame.w : frame.h;
    const frameAspect = fw / fh;
    const ratioDiffPct = (Math.abs(aspect - frameAspect) / frameAspect) * 100;

    const availW = fw - 2 * mat;
    const availH = fh - 2 * mat;

    let fit = null;
    if (availW > 0 && availH > 0) {
      const scale = Math.min(availW / artW, availH / artH);
      const printedW = artW * scale;
      const printedH = artH * scale;
      fit = {
        scale,
        scalePct: scale * 100,
        printedWmm: printedW,
        printedHmm: printedH,
        borderSideMm: (fw - printedW) / 2,
        borderTopMm: (fh - printedH) / 2,
        effectiveDpi: unit === "px" && d > 0 ? d / scale : null,
      };
    }

    const fillScale = Math.max(fw / artW, fh / artH);
    const coveredW = artW * fillScale;
    const coveredH = artH * fillScale;
    const fill = {
      scale: fillScale,
      scalePct: fillScale * 100,
      cropPct: (1 - (fw * fh) / (coveredW * coveredH)) * 100,
      trimWidthMm: coveredW - fw,
      trimHeightMm: coveredH - fh,
      effectiveDpi: unit === "px" && d > 0 ? d / fillScale : null,
    };

    return {
      id: frame.id,
      system: frame.system,
      label: frame.label,
      sizeLabel: frame.sizeLabel,
      frameWmm: fw,
      frameHmm: fh,
      frameRatio: frameAspect,
      ratioDiffPct,
      exactRatio: ratioDiffPct <= RATIO_MATCH_TOLERANCE_PCT,
      fitsWithMat: fit !== null,
      fit,
      fill,
    };
  });

  frames.sort((a, b) => {
    if (Math.abs(a.ratioDiffPct - b.ratioDiffPct) > 0.01) {
      return a.ratioDiffPct - b.ratioDiffPct;
    }
    const aScale = a.fit ? Math.abs(a.fit.scalePct - 100) : Number.POSITIVE_INFINITY;
    const bScale = b.fit ? Math.abs(b.fit.scalePct - 100) : Number.POSITIVE_INFINITY;
    return aScale - bScale;
  });

  const best = frames[0] || null;

  return {
    artWidthMm: artW,
    artHeightMm: artH,
    aspect,
    orientation,
    ratio: simplifyRatio(artW, artH),
    matBorderMm: mat,
    exactMatchCount: frames.filter((f) => f.exactRatio).length,
    best,
    frames,
  };
}

/**
 * Percentages for drawing a frame preview: how much of the frame opening the
 * artwork covers when fitted, and how far it overhangs when filled.
 * Kept here so the UI holds no geometry of its own.
 */
export function previewGeometry(frame) {
  if (!frame || !frame.fit) return null;
  const { frameWmm, frameHmm, fit, fill } = frame;
  if (!(frameWmm > 0) || !(frameHmm > 0)) return null;
  return {
    fitWidthPct: (fit.printedWmm / frameWmm) * 100,
    fitHeightPct: (fit.printedHmm / frameHmm) * 100,
    fillWidthPct: ((frameWmm + fill.trimWidthMm) / frameWmm) * 100,
    fillHeightPct: ((frameHmm + fill.trimHeightMm) / frameHmm) * 100,
    aspectPct: (frameHmm / frameWmm) * 100,
  };
}

/**
 * Pixels needed to print a physical width at a target resolution.
 * Used to tell someone whether their file is big enough for the frame they picked.
 */
export function pixelsForPrint(widthMm, heightMm, targetDpi) {
  const w = Number(widthMm);
  const h = Number(heightMm);
  const dpi = Number(targetDpi);
  if (!Number.isFinite(w) || !Number.isFinite(h) || !Number.isFinite(dpi)) return null;
  if (w <= 0 || h <= 0 || dpi <= 0) return null;
  return {
    widthPx: Math.ceil((w / MM_PER_INCH) * dpi),
    heightPx: Math.ceil((h / MM_PER_INCH) * dpi),
  };
}
