/**
 * Print bleed, trim, safe-margin and slug geometry.
 *
 * Everything is normalised to millimetres, then converted out to inches, points
 * and pixels, so mixed-unit jobs stay consistent.
 *
 * Rules implemented:
 *  - 1 inch = 25.4 mm exactly (international yard and pound agreement, 1959).
 *  - 1 PostScript/DTP point = 1/72 inch, which is what InDesign, Illustrator
 *    and PDF use for page dimensions.
 *  - Document (artboard) size = trim size + 2 x bleed, because bleed is added
 *    to every edge. Bleed is the artwork that runs past the cut line so a
 *    guillotine drifting by a fraction of a millimetre cannot leave a white sliver.
 *  - Safe area = trim size - 2 x safe margin. Anything inside it survives the
 *    same cutting tolerance.
 *  - Slug sits outside the bleed and holds crop marks, colour bars and job
 *    notes; it is trimmed off entirely.
 *  - Pixel dimensions = inches x DPI, rounded to whole pixels.
 *
 * Pure module: no DOM, no I/O, no clock reads.
 */

/** Millimetres in one inch — exact by definition since 1959. */
export const MM_PER_INCH = 25.4;

/** PostScript points per inch, the unit InDesign and PDF measure pages in. */
export const POINTS_PER_INCH = 72;

/** Units the calculator accepts for entered dimensions. */
export const UNITS = {
  mm: { id: "mm", label: "Millimetres", short: "mm", mmPer: 1 },
  cm: { id: "cm", label: "Centimetres", short: "cm", mmPer: 10 },
  in: { id: "in", label: "Inches", short: "in", mmPer: MM_PER_INCH },
};

/**
 * Common bleed allowances.
 * 3 mm is the standard for European/ISO commercial litho and digital print;
 * 1/8 inch (3.175 mm) is the equivalent North American standard; 5 mm is asked
 * for by some large-format and packaging printers where the cut tolerance is wider.
 */
export const BLEED_PRESETS = {
  iso3: { id: "iso3", label: "3 mm (ISO standard)", mm: 3 },
  us125: { id: "us125", label: "1/8 in / 3.175 mm (US standard)", mm: MM_PER_INCH / 8 },
  large5: { id: "large5", label: "5 mm (large format, packaging)", mm: 5 },
  none: { id: "none", label: "No bleed", mm: 0 },
};

/** Trim sizes, in millimetres. ISO 216 for the A series. */
export const SIZE_PRESETS = {
  a3: { id: "a3", label: "A3 (297 × 420 mm)", width: 297, height: 420 },
  a4: { id: "a4", label: "A4 (210 × 297 mm)", width: 210, height: 297 },
  a5: { id: "a5", label: "A5 (148 × 210 mm)", width: 148, height: 210 },
  a6: { id: "a6", label: "A6 postcard (105 × 148 mm)", width: 105, height: 148 },
  dl: { id: "dl", label: "DL flyer (99 × 210 mm)", width: 99, height: 210 },
  letter: { id: "letter", label: "US Letter (8.5 × 11 in)", width: 215.9, height: 279.4 },
  cardEu: { id: "cardEu", label: "Business card EU (85 × 55 mm)", width: 85, height: 55 },
  cardUs: { id: "cardUs", label: "Business card US (3.5 × 2 in)", width: 88.9, height: 50.8 },
  square: { id: "square", label: "Square (148 × 148 mm)", width: 148, height: 148 },
};

/** Resolution floor below which litho and digital print show visible softness. */
export const MIN_PRINT_DPI = 150;

/** Resolution normally specified for offset and digital sheet-fed print. */
export const STANDARD_PRINT_DPI = 300;

/** Guard rails on entered values, in millimetres. */
export const MAX_DIMENSION_MM = 5000;
export const MAX_BLEED_MM = 50;
export const MAX_DPI = 2400;

/** Convert a value in `unit` to millimetres. */
export function toMm(value, unit) {
  const spec = UNITS[unit];
  if (!spec) return NaN;
  return Number(value) * spec.mmPer;
}

/** Convert millimetres to `unit`. */
export function fromMm(mm, unit) {
  const spec = UNITS[unit];
  if (!spec) return NaN;
  return Number(mm) / spec.mmPer;
}

const round = (value, places) => {
  const factor = Math.pow(10, places);
  return Math.round(value * factor) / factor;
};

/** Express one box in every unit the print workflow uses. */
export function boxMetrics(widthMm, heightMm, dpi) {
  const widthIn = widthMm / MM_PER_INCH;
  const heightIn = heightMm / MM_PER_INCH;
  return {
    widthMm: round(widthMm, 2),
    heightMm: round(heightMm, 2),
    widthIn: round(widthIn, 3),
    heightIn: round(heightIn, 3),
    widthPt: round(widthIn * POINTS_PER_INCH, 1),
    heightPt: round(heightIn * POINTS_PER_INCH, 1),
    widthPx: Math.round(widthIn * dpi),
    heightPx: Math.round(heightIn * dpi),
  };
}

/**
 * Work out every box in a print job.
 *
 * @param {object} input
 * @param {number} input.trimWidth   Finished width, in `unit`.
 * @param {number} input.trimHeight  Finished height, in `unit`.
 * @param {string} input.unit        Key of UNITS.
 * @param {number} input.bleedMm     Bleed per edge, in millimetres.
 * @param {number} input.safeMarginMm Safe margin inside the trim, in millimetres.
 * @param {number} input.slugMm      Slug outside the bleed, in millimetres.
 * @param {number} input.dpi         Output resolution.
 */
export function computePrintBoxes({
  trimWidth,
  trimHeight,
  unit = "mm",
  bleedMm = 3,
  safeMarginMm = 5,
  slugMm = 0,
  dpi = STANDARD_PRINT_DPI,
} = {}) {
  if (!UNITS[unit]) return { error: "Choose millimetres, centimetres or inches." };

  const values = { trimWidth, trimHeight, bleedMm, safeMarginMm, slugMm, dpi };
  const badKey = Object.keys(values).find((key) => !Number.isFinite(Number(values[key])));
  if (badKey) return { error: "Every field must be a number." };

  const widthMm = toMm(trimWidth, unit);
  const heightMm = toMm(trimHeight, unit);
  const bleed = Number(bleedMm);
  const safeMargin = Number(safeMarginMm);
  const slug = Number(slugMm);
  const resolution = Number(dpi);

  if (!(widthMm > 0) || !(heightMm > 0)) {
    return { error: "Trim width and height must be greater than zero." };
  }
  if (widthMm > MAX_DIMENSION_MM || heightMm > MAX_DIMENSION_MM) {
    return { error: `Trim size must be under ${MAX_DIMENSION_MM / 1000} m on each side.` };
  }
  if (bleed < 0 || slug < 0 || safeMargin < 0) {
    return { error: "Bleed, safe margin and slug cannot be negative." };
  }
  if (bleed > MAX_BLEED_MM || slug > MAX_BLEED_MM) {
    return { error: `Bleed and slug must each be under ${MAX_BLEED_MM} mm.` };
  }
  if (safeMargin * 2 >= Math.min(widthMm, heightMm)) {
    return { error: "The safe margin is bigger than the piece — nothing would be left to design in." };
  }
  if (!(resolution > 0)) return { error: "Resolution must be greater than zero." };
  if (resolution > MAX_DPI) return { error: `Resolution must be under ${MAX_DPI} DPI.` };

  const trim = boxMetrics(widthMm, heightMm, resolution);
  const document = boxMetrics(widthMm + bleed * 2, heightMm + bleed * 2, resolution);
  const safe = boxMetrics(widthMm - safeMargin * 2, heightMm - safeMargin * 2, resolution);
  const slugBox = boxMetrics(
    widthMm + (bleed + slug) * 2,
    heightMm + (bleed + slug) * 2,
    resolution,
  );

  const warnings = [];
  if (resolution < MIN_PRINT_DPI) {
    warnings.push(
      `${resolution} DPI is below the ${MIN_PRINT_DPI} DPI floor for print — expect visible softness unless the piece is viewed from a distance.`,
    );
  }
  if (bleed === 0) {
    warnings.push(
      "With no bleed, any artwork touching the edge will show a white sliver if the cut drifts. Add at least 3 mm unless the printer says otherwise.",
    );
  }
  if (bleed > 0 && safeMargin > 0 && safeMargin < bleed) {
    warnings.push(
      "The safe margin is narrower than the bleed. Most printers want the safe margin to be at least as wide as the bleed.",
    );
  }
  const megapixels = (document.widthPx * document.heightPx) / 1e6;

  return {
    trim,
    document,
    safe,
    slug: slugBox,
    bleedMm: round(bleed, 3),
    safeMarginMm: round(safeMargin, 3),
    slugMm: round(slug, 3),
    dpi: resolution,
    // Where the trim box sits inside the artboard, for placing guides.
    trimOffsetMm: round(bleed, 3),
    trimOffsetPx: Math.round((bleed / MM_PER_INCH) * resolution),
    safeOffsetMm: round(bleed + safeMargin, 3),
    safeOffsetPx: Math.round(((bleed + safeMargin) / MM_PER_INCH) * resolution),
    documentMegapixels: round(megapixels, 2),
    // Uncompressed 8-bit CMYK is 4 bytes per pixel — the usual sanity check on
    // whether a flattened TIFF will be emailable.
    flatCmykMb: round((document.widthPx * document.heightPx * 4) / (1024 * 1024), 1),
    warnings,
  };
}
