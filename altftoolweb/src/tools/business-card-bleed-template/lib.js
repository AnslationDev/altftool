/**
 * Press-ready business card template geometry and SVG output.
 *
 * The SVG is emitted with physical dimensions (width="101mm") and a viewBox in
 * the same units, so one SVG user unit equals one millimetre and the file opens
 * at true size in Illustrator, Affinity Designer and Inkscape.
 *
 * Rules implemented:
 *  - 1 inch = 25.4 mm exactly, and 1 PostScript point = 1/72 inch.
 *  - Bleed box = trim + 2 x bleed. Standard bleed is 3 mm (ISO/European) or
 *    1/8 inch = 3.175 mm (North American).
 *  - Safe box = trim - 2 x safe margin; 3 mm is the usual minimum and 4-5 mm is
 *    what most trade printers recommend for a card, because a guillotine cutting
 *    a stack of cards drifts more than a single sheet does.
 *  - Crop marks sit OUTSIDE the bleed box, never on top of the artwork, which is
 *    what PDF/X requires. They are offset from the trim line by the bleed
 *    distance and drawn `markLength` long, the convention used by every
 *    imposition tool.
 *  - Ganging: how many bleed boxes tile onto a parent sheet is
 *    floor(sheetWidth / boxWidth) x floor(sheetHeight / boxHeight), taking the
 *    better of the two rotations.
 *
 * Pure module: no DOM, no I/O, no clock reads.
 */

/** Millimetres in one inch — exact by definition. */
export const MM_PER_INCH = 25.4;

/** PostScript points per inch. */
export const POINTS_PER_INCH = 72;

/** Standard business card trim sizes, in millimetres. */
export const CARD_PRESETS = {
  eu: { id: "eu", label: "Europe / India / UK — 85 × 55 mm", width: 85, height: 55 },
  us: { id: "us", label: "United States — 3.5 × 2 in (88.9 × 50.8 mm)", width: 88.9, height: 50.8 },
  iso: {
    id: "iso",
    label: "ISO 7810 ID-1 credit card — 85.6 × 53.98 mm",
    width: 85.6,
    height: 53.98,
  },
  jp: { id: "jp", label: "Japan — 91 × 55 mm", width: 91, height: 55 },
  oceania: { id: "oceania", label: "Australia / New Zealand — 90 × 55 mm", width: 90, height: 55 },
  square: { id: "square", label: "Square — 55 × 55 mm", width: 55, height: 55 },
  slim: { id: "slim", label: "Slim / mini — 85 × 40 mm", width: 85, height: 40 },
};

/** Bleed allowances offered as presets, in millimetres. */
export const BLEED_PRESETS = {
  iso3: { id: "iso3", label: "3 mm (ISO standard)", mm: 3 },
  us125: { id: "us125", label: "1/8 in / 3.175 mm (US standard)", mm: MM_PER_INCH / 8 },
  heavy5: { id: "heavy5", label: "5 mm (thick or textured stock)", mm: 5 },
};

/** Parent sheets a card job is commonly ganged up on, in millimetres. */
export const PARENT_SHEETS = {
  a4: { id: "a4", label: "A4 (210 × 297 mm)", width: 210, height: 297 },
  a3: { id: "a3", label: "A3 (297 × 420 mm)", width: 297, height: 420 },
  sra3: { id: "sra3", label: "SRA3 (320 × 450 mm)", width: 320, height: 450 },
  letter: { id: "letter", label: "US Letter (8.5 × 11 in)", width: 215.9, height: 279.4 },
};

/** Default crop-mark length, in millimetres — the usual imposition setting. */
export const DEFAULT_MARK_LENGTH_MM = 5;

/** Guide colours. Named SVG colours keep the template free of brand palette. */
export const GUIDE_COLOURS = {
  page: "white",
  bleed: "black",
  trim: "magenta",
  safe: "cyan",
  marks: "black",
  label: "black",
};

/** Guard rails. */
export const MAX_CARD_MM = 300;
export const MAX_BLEED_MM = 20;
export const MAX_MARK_LENGTH_MM = 20;

const round = (value, places) => {
  const factor = Math.pow(10, places);
  return Math.round(value * factor) / factor;
};

/** Express a box in millimetres, inches, points and pixels. */
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
 * How many boxWidth x boxHeight rectangles fit on a sheet, trying both rotations.
 * Returns the better rotation and its column/row counts.
 */
export function ganging(boxWidth, boxHeight, sheetWidth, sheetHeight) {
  if (!(boxWidth > 0) || !(boxHeight > 0) || !(sheetWidth > 0) || !(sheetHeight > 0)) {
    return { perSheet: 0, columns: 0, rows: 0, rotated: false };
  }
  const upright = {
    columns: Math.floor(sheetWidth / boxWidth),
    rows: Math.floor(sheetHeight / boxHeight),
  };
  const turned = {
    columns: Math.floor(sheetWidth / boxHeight),
    rows: Math.floor(sheetHeight / boxWidth),
  };
  const uprightTotal = upright.columns * upright.rows;
  const turnedTotal = turned.columns * turned.rows;
  if (turnedTotal > uprightTotal) {
    return { perSheet: turnedTotal, columns: turned.columns, rows: turned.rows, rotated: true };
  }
  return { perSheet: uprightTotal, columns: upright.columns, rows: upright.rows, rotated: false };
}

/** Escape the characters that are markup-significant in XML text nodes. */
export function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Build a business card template.
 *
 * @param {object} input
 * @param {number} input.trimWidthMm   Finished width in millimetres.
 * @param {number} input.trimHeightMm  Finished height in millimetres.
 * @param {number} input.bleedMm       Bleed per edge.
 * @param {number} input.safeMm        Safe margin inside the trim.
 * @param {boolean} input.landscape    Swap width and height.
 * @param {boolean} input.showCropMarks Draw crop marks outside the bleed.
 * @param {number} input.markLengthMm  Crop-mark length.
 * @param {boolean} input.showLabels   Print box names in the mark area.
 * @param {string} input.sheet         Key of PARENT_SHEETS for the ganging count.
 * @param {number} input.dpi           Resolution used for the pixel figures.
 */
export function buildCardTemplate({
  trimWidthMm = 85,
  trimHeightMm = 55,
  bleedMm = 3,
  safeMm = 4,
  landscape = true,
  showCropMarks = true,
  markLengthMm = DEFAULT_MARK_LENGTH_MM,
  showLabels = false,
  sheet = "a4",
  dpi = 300,
} = {}) {
  const values = { trimWidthMm, trimHeightMm, bleedMm, safeMm, markLengthMm, dpi };
  const badKey = Object.keys(values).find((key) => !Number.isFinite(Number(values[key])));
  if (badKey) return { error: "Every measurement must be a number." };
  if (!PARENT_SHEETS[sheet]) return { error: "Choose one of the listed parent sheets." };

  const rawWidth = Number(trimWidthMm);
  const rawHeight = Number(trimHeightMm);
  const bleed = Number(bleedMm);
  const safe = Number(safeMm);
  const markLength = Number(markLengthMm);
  const resolution = Number(dpi);

  if (!(rawWidth > 0) || !(rawHeight > 0)) {
    return { error: "Card width and height must be greater than zero." };
  }
  if (rawWidth > MAX_CARD_MM || rawHeight > MAX_CARD_MM) {
    return { error: `A card side must be under ${MAX_CARD_MM} mm.` };
  }
  if (bleed < 0 || safe < 0 || markLength < 0) {
    return { error: "Bleed, safe margin and crop-mark length cannot be negative." };
  }
  if (bleed > MAX_BLEED_MM) return { error: `Bleed must be under ${MAX_BLEED_MM} mm.` };
  if (markLength > MAX_MARK_LENGTH_MM) {
    return { error: `Crop marks must be under ${MAX_MARK_LENGTH_MM} mm long.` };
  }
  if (safe * 2 >= Math.min(rawWidth, rawHeight)) {
    return { error: "The safe margin leaves no usable area on the card." };
  }
  if (!(resolution > 0) || resolution > 2400) {
    return { error: "Resolution must be between 1 and 2400 DPI." };
  }

  // Presets are stored landscape; portrait simply swaps the two sides.
  const trimW = landscape ? Math.max(rawWidth, rawHeight) : Math.min(rawWidth, rawHeight);
  const trimH = landscape ? Math.min(rawWidth, rawHeight) : Math.max(rawWidth, rawHeight);

  const bleedW = trimW + bleed * 2;
  const bleedH = trimH + bleed * 2;
  const safeW = trimW - safe * 2;
  const safeH = trimH - safe * 2;

  // The canvas has to hold the bleed box plus room for the marks around it.
  const markSpace = showCropMarks ? bleed + markLength : 0;
  const canvasW = trimW + markSpace * 2;
  const canvasH = trimH + markSpace * 2;

  const trimX = markSpace;
  const trimY = markSpace;
  const bleedX = trimX - bleed;
  const bleedY = trimY - bleed;
  const safeX = trimX + safe;
  const safeY = trimY + safe;

  const fmt = (value) => round(value, 3);
  const thin = 0.2; // 0.2 mm hairline, about 0.57 pt — the usual guide weight
  const parts = [];

  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${fmt(canvasW)}mm" height="${fmt(
      canvasH,
    )}mm" viewBox="0 0 ${fmt(canvasW)} ${fmt(canvasH)}" role="img" aria-label="Business card template ${fmt(
      trimW,
    )} by ${fmt(trimH)} millimetres with ${fmt(bleed)} millimetre bleed">`,
  );
  parts.push(
    `<rect x="0" y="0" width="${fmt(canvasW)}" height="${fmt(canvasH)}" fill="${GUIDE_COLOURS.page}"/>`,
  );

  // Bleed box: the outer edge of the artwork.
  parts.push(
    `<rect x="${fmt(bleedX)}" y="${fmt(bleedY)}" width="${fmt(bleedW)}" height="${fmt(
      bleedH,
    )}" fill="none" stroke="${GUIDE_COLOURS.bleed}" stroke-width="${thin}"/>`,
  );
  // Trim box: where the guillotine cuts.
  parts.push(
    `<rect x="${fmt(trimX)}" y="${fmt(trimY)}" width="${fmt(trimW)}" height="${fmt(
      trimH,
    )}" fill="none" stroke="${GUIDE_COLOURS.trim}" stroke-width="${thin}"/>`,
  );
  // Safe box: keep type inside this.
  if (safeW > 0 && safeH > 0) {
    parts.push(
      `<rect x="${fmt(safeX)}" y="${fmt(safeY)}" width="${fmt(safeW)}" height="${fmt(
        safeH,
      )}" fill="none" stroke="${GUIDE_COLOURS.safe}" stroke-width="${thin}" stroke-dasharray="2 2"/>`,
    );
  }

  if (showCropMarks && markLength > 0) {
    const line = (x1, y1, x2, y2) =>
      `<line x1="${fmt(x1)}" y1="${fmt(y1)}" x2="${fmt(x2)}" y2="${fmt(
        y2,
      )}" stroke="${GUIDE_COLOURS.marks}" stroke-width="${thin}"/>`;
    const left = trimX;
    const right = trimX + trimW;
    const top = trimY;
    const bottom = trimY + trimH;
    const gap = bleed; // marks start at the bleed edge, never over the artwork
    [
      [left, top],
      [right, top],
      [left, bottom],
      [right, bottom],
    ].forEach(([x, y]) => {
      const horizontalDir = x === left ? -1 : 1;
      const verticalDir = y === top ? -1 : 1;
      parts.push(
        line(x + horizontalDir * gap, y, x + horizontalDir * (gap + markLength), y),
      );
      parts.push(line(x, y + verticalDir * gap, x, y + verticalDir * (gap + markLength)));
    });
  }

  if (showLabels && markSpace > 1) {
    const labelSize = Math.max(1.6, Math.min(3, markSpace * 0.4));
    parts.push(
      `<text x="${fmt(trimX)}" y="${fmt(Math.max(labelSize, bleedY - 0.8))}" fill="${
        GUIDE_COLOURS.label
      }" font-family="Helvetica, Arial, sans-serif" font-size="${fmt(labelSize)}">${escapeXml(
        `Trim ${fmt(trimW)} × ${fmt(trimH)} mm · bleed ${fmt(bleed)} mm · safe ${fmt(safe)} mm`,
      )}</text>`,
    );
  }

  parts.push("</svg>");

  const parent = PARENT_SHEETS[sheet];
  const gang = ganging(bleedW, bleedH, parent.width, parent.height);

  return {
    svg: parts.join(""),
    trim: boxMetrics(trimW, trimH, resolution),
    bleedBox: boxMetrics(bleedW, bleedH, resolution),
    safeBox: boxMetrics(Math.max(0, safeW), Math.max(0, safeH), resolution),
    canvas: boxMetrics(canvasW, canvasH, resolution),
    bleedMm: round(bleed, 3),
    safeMm: round(safe, 3),
    markLengthMm: round(markLength, 3),
    dpi: resolution,
    orientation: landscape ? "Landscape" : "Portrait",
    sheetLabel: parent.label,
    perSheet: gang.perSheet,
    gangColumns: gang.columns,
    gangRows: gang.rows,
    gangRotated: gang.rotated,
    warnings: buildWarnings(bleed, safe, resolution),
  };
}

function buildWarnings(bleed, safe, dpi) {
  const warnings = [];
  if (bleed <= 0) {
    warnings.push(
      "With no bleed, any background colour reaching the edge will show a white sliver after cutting.",
    );
  }
  if (safe > 0 && safe < 3) {
    warnings.push(
      "A safe margin under 3 mm is tight for cards — stacks of card stock drift more under the guillotine than single sheets.",
    );
  }
  if (dpi < 300) {
    warnings.push(
      `${dpi} DPI is below the 300 DPI normally specified for cards; small type will look soft.`,
    );
  }
  return warnings;
}
