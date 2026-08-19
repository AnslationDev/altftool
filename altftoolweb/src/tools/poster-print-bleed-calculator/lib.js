/**
 * Poster print bleed, safe area, export resolution and legible text sizing.
 *
 * All internal maths is done in millimetres; inputs and outputs are converted
 * back to whichever unit the caller asked for.
 */

/** Exact definition of the international inch (ISO 31-1 / NIST): 1 in = 25.4 mm. */
export const MM_PER_INCH = 25.4;

/** PostScript / DTP point: 72 points to the inch. */
export const POINTS_PER_INCH = 72;

/** Metre to millimetre. */
export const MM_PER_METRE = 1000;

/** Foot to millimetre (12 international inches). */
export const MM_PER_FOOT = 12 * MM_PER_INCH;

/**
 * Arcminutes in one radian = 180 * 60 / PI. Used for the acuity floor below.
 */
export const ARCMIN_PER_RADIAN = 3437.746770784939;

/**
 * 20/20 (6/6) vision resolves detail subtending about 1 arcminute. A pixel that
 * subtends 1 arcminute is therefore the theoretical floor below which extra
 * resolution is invisible. At 12 in (305 mm) this works out to ~286 PPI, which
 * is why 300 PPI became the close-viewing print standard.
 */
export const ACUITY_ARCMIN_PER_PIXEL = 1;

/**
 * Trade resolution bands for large-format printing. Print shops quote these as
 * "PPI at final print size"; they sit above the acuity floor on purpose so the
 * file survives RIP resampling and closer-than-planned viewing.
 * `maxDistanceMm` is the upper edge of each band.
 */
export const RESOLUTION_BANDS = [
  { maxDistanceMm: 500, ppi: 300, label: "Hand-held / inspected close up" },
  { maxDistanceMm: 1500, ppi: 200, label: "Retail poster at eye level" },
  { maxDistanceMm: 3000, ppi: 150, label: "Wall poster, standee, roll-up" },
  { maxDistanceMm: 6000, ppi: 100, label: "Banner, stage backdrop" },
  { maxDistanceMm: 15000, ppi: 72, label: "Hoarding, building wrap" },
  { maxDistanceMm: Infinity, ppi: 40, label: "Billboard / long-range" },
];

/** Common bleed allowances, per edge, in millimetres. */
export const BLEED_PRESETS_MM = {
  none: 0,
  iso3: 3, // ISO / European commercial standard: 3 mm per edge
  us125: 3.175, // US standard 1/8 in per edge
  large5: 5, // large-format and mounted work: 5 mm per edge
  wide10: 10, // stretched canvas, foam-board wrap, pull-up cassette
};

/**
 * Signage legibility rules of thumb, expressed as inches of capital-letter
 * height required per foot of viewing distance. The 1 in per 10 ft figure is
 * the long-standing sign-industry rule for headline text read at a glance;
 * the smaller tiers are for text a viewer chooses to step in and read.
 */
export const LEGIBILITY_TIERS = [
  { id: "headline", label: "Headline (read at a glance)", inchPerFoot: 1 / 10 },
  { id: "subhead", label: "Sub-head / key message", inchPerFoot: 1 / 20 },
  { id: "body", label: "Body copy (viewer steps closer)", inchPerFoot: 1 / 40 },
  { id: "legal", label: "Legal / credits line", inchPerFoot: 1 / 60 },
];

/**
 * Cap height of most text typefaces is close to 0.70 of the em (point) size,
 * so point size = cap height / 0.70. Adjust for display faces with tall caps.
 */
export const CAP_HEIGHT_RATIO = 0.7;

/** Bytes per pixel for an uncompressed 8-bit-per-channel CMYK image. */
export const BYTES_PER_PIXEL_CMYK8 = 4;

/** Bytes per pixel for an uncompressed 8-bit-per-channel RGB image. */
export const BYTES_PER_PIXEL_RGB8 = 3;

const LENGTH_UNITS = {
  mm: 1,
  cm: 10,
  in: MM_PER_INCH,
};

const DISTANCE_UNITS = {
  m: MM_PER_METRE,
  cm: 10,
  ft: MM_PER_FOOT,
};

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Convert a length in `unit` to millimetres. Returns NaN for unknown units. */
export function toMm(value, unit) {
  const factor = LENGTH_UNITS[unit];
  if (!factor || !isNum(value)) return NaN;
  return value * factor;
}

/** Convert millimetres back to `unit`. */
export function fromMm(mm, unit) {
  const factor = LENGTH_UNITS[unit];
  if (!factor || !isNum(mm)) return NaN;
  return mm / factor;
}

/** Pick the trade resolution band for a viewing distance in millimetres. */
export function resolutionBandFor(distanceMm) {
  if (!isNum(distanceMm) || distanceMm <= 0) return null;
  return (
    RESOLUTION_BANDS.find((band) => distanceMm <= band.maxDistanceMm) ||
    RESOLUTION_BANDS[RESOLUTION_BANDS.length - 1]
  );
}

/**
 * Smallest PPI at which a viewer with 20/20 vision cannot see individual
 * pixels: one pixel subtending ACUITY_ARCMIN_PER_PIXEL arcminutes.
 */
export function acuityPpi(distanceMm) {
  if (!isNum(distanceMm) || distanceMm <= 0) return NaN;
  const distanceIn = distanceMm / MM_PER_INCH;
  const radiansPerPixel = ACUITY_ARCMIN_PER_PIXEL / ARCMIN_PER_RADIAN;
  // pixel size in inches = distance * angle  =>  ppi = 1 / pixel size
  return 1 / (distanceIn * radiansPerPixel);
}

/**
 * Cap height and point size needed for each legibility tier at a given
 * viewing distance.
 */
export function legibleTextSizes(distanceMm) {
  if (!isNum(distanceMm) || distanceMm <= 0) return [];
  const distanceFt = distanceMm / MM_PER_FOOT;
  return LEGIBILITY_TIERS.map((tier) => {
    const capHeightIn = distanceFt * tier.inchPerFoot;
    return {
      id: tier.id,
      label: tier.label,
      capHeightIn,
      capHeightMm: capHeightIn * MM_PER_INCH,
      fontSizePt: (capHeightIn / CAP_HEIGHT_RATIO) * POINTS_PER_INCH,
    };
  });
}

/**
 * Full poster setup calculation.
 *
 * @param {object} input
 * @param {number} input.trimWidth   finished (trimmed) width in `unit`
 * @param {number} input.trimHeight  finished (trimmed) height in `unit`
 * @param {string} input.unit        "mm" | "cm" | "in"
 * @param {number} input.bleed       bleed per edge in `unit`
 * @param {number} input.safeMargin  safe/quiet margin inside the trim, in `unit`
 * @param {number} input.viewingDistance
 * @param {string} input.distanceUnit "m" | "cm" | "ft"
 * @param {number} [input.ppiOverride] use this export PPI instead of the band
 * @returns {object} results, or { error } when the input cannot be used
 */
export function computePosterSetup({
  trimWidth,
  trimHeight,
  unit = "mm",
  bleed = 3,
  safeMargin = 10,
  viewingDistance,
  distanceUnit = "m",
  ppiOverride = null,
} = {}) {
  if (!LENGTH_UNITS[unit]) return { error: "Choose a size unit of mm, cm or in." };
  if (!DISTANCE_UNITS[distanceUnit]) {
    return { error: "Choose a viewing-distance unit of m, cm or ft." };
  }

  const values = [trimWidth, trimHeight, bleed, safeMargin, viewingDistance];
  if (values.some((value) => !isNum(value))) {
    return { error: "Enter a number in every field." };
  }
  if (trimWidth <= 0 || trimHeight <= 0) {
    return { error: "Finished poster width and height must be greater than zero." };
  }
  if (bleed < 0 || safeMargin < 0) {
    return { error: "Bleed and safe margin cannot be negative." };
  }
  if (viewingDistance <= 0) {
    return { error: "Viewing distance must be greater than zero." };
  }
  // A caller passes `null`/`undefined` to mean "no manual override, use the
  // auto band". Anything else (including a blank-field NaN, zero, or a
  // negative number) means the user asked for manual mode with a bad value
  // -- previously this was silently discarded and fell back to the auto
  // band with no indication the override was ignored.
  if (ppiOverride !== null && ppiOverride !== undefined && !(isNum(ppiOverride) && ppiOverride > 0)) {
    return { error: "Enter a manual PPI greater than zero, or switch back to automatic." };
  }

  const trimWmm = toMm(trimWidth, unit);
  const trimHmm = toMm(trimHeight, unit);
  const bleedMm = toMm(bleed, unit);
  const safeMm = toMm(safeMargin, unit);
  const distanceMm = viewingDistance * DISTANCE_UNITS[distanceUnit];

  const docWmm = trimWmm + bleedMm * 2;
  const docHmm = trimHmm + bleedMm * 2;

  if (docWmm > 20000 || docHmm > 20000) {
    return { error: "Keep each side under 20 m — beyond that a poster is printed in panels." };
  }
  if (safeMm * 2 >= Math.min(trimWmm, trimHmm)) {
    return { error: "Safe margin is too large — it leaves no live area inside the trim." };
  }

  const safeWmm = trimWmm - safeMm * 2;
  const safeHmm = trimHmm - safeMm * 2;

  const band = resolutionBandFor(distanceMm);
  const floorPpi = acuityPpi(distanceMm);
  let exportPpi = band ? band.ppi : 150;
  let ppiSource = band ? band.label : "Default";
  if (isNum(ppiOverride) && ppiOverride > 0) {
    exportPpi = ppiOverride;
    ppiSource = "Manual override";
  }
  if (exportPpi > 2400) {
    return { error: "Export resolution above 2400 PPI is not usable — lower it." };
  }

  const pixelW = Math.round((docWmm / MM_PER_INCH) * exportPpi);
  const pixelH = Math.round((docHmm / MM_PER_INCH) * exportPpi);
  const totalPixels = pixelW * pixelH;

  const megabytes = (bytesPerPixel) => (totalPixels * bytesPerPixel) / (1024 * 1024);

  return {
    unit,
    distanceUnit,
    trimWidth: fromMm(trimWmm, unit),
    trimHeight: fromMm(trimHmm, unit),
    docWidth: fromMm(docWmm, unit),
    docHeight: fromMm(docHmm, unit),
    safeWidth: fromMm(safeWmm, unit),
    safeHeight: fromMm(safeHmm, unit),
    bleedPerEdge: fromMm(bleedMm, unit),
    safeMargin: fromMm(safeMm, unit),
    trimWidthMm: trimWmm,
    trimHeightMm: trimHmm,
    docWidthMm: docWmm,
    docHeightMm: docHmm,
    safeWidthMm: safeWmm,
    safeHeightMm: safeHmm,
    bleedAreaShare: 1 - (trimWmm * trimHmm) / (docWmm * docHmm),
    liveAreaShare: (safeWmm * safeHmm) / (trimWmm * trimHmm),
    trimAreaSqM: (trimWmm / MM_PER_METRE) * (trimHmm / MM_PER_METRE),
    distanceMm,
    distanceM: distanceMm / MM_PER_METRE,
    distanceFt: distanceMm / MM_PER_FOOT,
    exportPpi,
    ppiSource,
    bandLabel: band ? band.label : "",
    acuityFloorPpi: floorPpi,
    pixelWidth: pixelW,
    pixelHeight: pixelH,
    megapixels: totalPixels / 1e6,
    fileSizeCmykMb: megabytes(BYTES_PER_PIXEL_CMYK8),
    fileSizeRgbMb: megabytes(BYTES_PER_PIXEL_RGB8),
    textSizes: legibleTextSizes(distanceMm),
  };
}
