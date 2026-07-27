/**
 * Print size / resolution maths.
 *
 * Printing is a straight division:
 *
 *   print dimension (inches) = pixel dimension / pixels-per-inch
 *   required pixels          = print dimension (inches) x pixels-per-inch
 *   megapixels               = width px * height px / 1,000,000
 *
 * The PPI you actually need depends on how close the print will be viewed.
 * Human visual acuity resolves detail about one arcminute apart, so the
 * smallest useful dot spacing at a viewing distance d is d x tan(1 arcminute),
 * which gives
 *
 *   required PPI = 1 / (d * tan(1/60 degree)) = 3437.75 / d      (d in inches)
 *
 * At a 12-inch reading distance that is about 286 PPI — which is where the
 * familiar 300 PPI print standard comes from.
 *
 * Pure module: no React, no DOM, no clock.
 */

/** Exact by definition: 1 inch = 25.4 mm. */
export const MM_PER_INCH = 25.4;
export const CM_PER_INCH = 2.54;

/**
 * 1 / tan(1 arcminute) = 3437.75. One arcminute is the classic Snellen 20/20
 * acuity limit, so this constant converts a viewing distance in inches into
 * the PPI beyond which extra resolution is invisible.
 */
export const ARCMINUTE_PPI_CONSTANT = 1 / Math.tan(Math.PI / (180 * 60));

export const MAX_PIXELS_PER_SIDE = 500000;
export const MIN_PPI = 10;
export const MAX_PPI = 2400;

/** Common print-quality targets, from gallery work down to billboards. */
export const QUALITY_LEVELS = [
  { ppi: 360, label: "360 PPI — maximum detail on Epson pigment printers" },
  { ppi: 300, label: "300 PPI — fine art and gallery standard" },
  { ppi: 240, label: "240 PPI — excellent, common lab default" },
  { ppi: 200, label: "200 PPI — good for prints held at arm's length" },
  { ppi: 150, label: "150 PPI — posters viewed from a metre or more" },
  { ppi: 100, label: "100 PPI — large display prints, several metres away" },
  { ppi: 72, label: "72 PPI — banners and billboards" },
];

/** Sensors and files people usually start from. */
export const RESOLUTION_PRESETS = [
  { label: "12 MP — 4240 × 2832", width: 4240, height: 2832 },
  { label: "20 MP — 5472 × 3648", width: 5472, height: 3648 },
  { label: "24 MP — 6000 × 4000", width: 6000, height: 4000 },
  { label: "33 MP — 7008 × 4672", width: 7008, height: 4672 },
  { label: "45 MP — 8256 × 5504", width: 8256, height: 5504 },
  { label: "61 MP — 9504 × 6336", width: 9504, height: 6336 },
  { label: "102 MP — 11648 × 8736", width: 11648, height: 8736 },
];

const isFiniteNumber = (value) => Number.isFinite(value);

/** Inches -> centimetres. */
export function inchesToCm(inches) {
  return inches * CM_PER_INCH;
}

/** The PPI at which extra resolution stops being visible at a given distance. */
export function ppiForViewingDistance(inches) {
  const d = Number(inches);
  if (!isFiniteNumber(d) || d <= 0) return null;
  return ARCMINUTE_PPI_CONSTANT / d;
}

/** Greatest common divisor, for a tidy aspect-ratio label. */
function gcd(a, b) {
  let x = Math.round(Math.abs(a));
  let y = Math.round(Math.abs(b));
  while (y > 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

/** "6000 × 4000" -> "3:2". */
export function aspectLabel(width, height) {
  if (!(width > 0) || !(height > 0)) return "—";
  const g = gcd(width, height);
  const w = Math.round(width / g);
  const h = Math.round(height / g);
  // Anything sillier than 50:37 is more confusing than a decimal.
  if (w > 50 || h > 50) return `${(width / height).toFixed(2)}:1`;
  return `${w}:${h}`;
}

/**
 * Largest print an image supports at a given PPI.
 *
 * @returns {object} either { error } or the full breakdown.
 */
export function computePrintSize({ pixelWidth, pixelHeight, ppi }) {
  const w = Number(pixelWidth);
  const h = Number(pixelHeight);
  const density = Number(ppi);

  if (![w, h, density].every(isFiniteNumber)) {
    return { error: "Enter a number in every field." };
  }
  if (w <= 0 || h <= 0) return { error: "Pixel width and height must both be greater than zero." };
  if (w > MAX_PIXELS_PER_SIDE || h > MAX_PIXELS_PER_SIDE) {
    return { error: `Pixel dimensions above ${MAX_PIXELS_PER_SIDE} are out of range.` };
  }
  if (density <= 0) return { error: "PPI must be greater than zero." };
  if (density < MIN_PPI || density > MAX_PPI) {
    return { error: `PPI must be between ${MIN_PPI} and ${MAX_PPI}.` };
  }

  const widthInches = w / density;
  const heightInches = h / density;

  return {
    pixelWidth: w,
    pixelHeight: h,
    ppi: density,
    megapixels: (w * h) / 1e6,
    aspect: aspectLabel(w, h),
    widthInches,
    heightInches,
    widthCm: inchesToCm(widthInches),
    heightCm: inchesToCm(heightInches),
    diagonalInches: Math.sqrt(widthInches ** 2 + heightInches ** 2),
    /** Closest distance at which this PPI still looks sharp to 20/20 vision. */
    comfortableViewingInches: ARCMINUTE_PPI_CONSTANT / density,
    sizesByQuality: QUALITY_LEVELS.map((level) => ({
      ppi: level.ppi,
      label: level.label,
      widthInches: w / level.ppi,
      heightInches: h / level.ppi,
      widthCm: inchesToCm(w / level.ppi),
      heightCm: inchesToCm(h / level.ppi),
    })),
  };
}

/**
 * The reverse question: how many pixels does a target print size need?
 *
 * @returns {object} either { error } or the requirement, plus whether the
 *          image you have is enough.
 */
export function requiredResolution({ widthInches, heightInches, ppi, havePixelWidth, havePixelHeight }) {
  const w = Number(widthInches);
  const h = Number(heightInches);
  const density = Number(ppi);

  if (![w, h, density].every(isFiniteNumber)) {
    return { error: "Enter a number in every field." };
  }
  if (w <= 0 || h <= 0) return { error: "Print width and height must both be greater than zero." };
  if (w > 2400 || h > 2400) return { error: "Print dimensions above 2400 inches are out of range." };
  if (density < MIN_PPI || density > MAX_PPI) {
    return { error: `PPI must be between ${MIN_PPI} and ${MAX_PPI}.` };
  }

  const needWidth = w * density;
  const needHeight = h * density;
  const needMegapixels = (needWidth * needHeight) / 1e6;

  const haveW = Number(havePixelWidth);
  const haveH = Number(havePixelHeight);
  const haveEnough =
    isFiniteNumber(haveW) && isFiniteNumber(haveH) && haveW > 0 && haveH > 0
      ? haveW >= needWidth && haveH >= needHeight
      : null;

  const shortfallStops =
    haveEnough === null
      ? null
      : Math.log2((needWidth * needHeight) / (haveW * haveH));

  return {
    needWidth,
    needHeight,
    needMegapixels,
    haveEnough,
    /** Actual PPI you would get printing the image you have at this size. */
    actualPpi:
      isFiniteNumber(haveW) && haveW > 0 ? haveW / w : null,
    upscaleFactor: shortfallStops === null ? null : Math.pow(2, shortfallStops / 2),
  };
}
