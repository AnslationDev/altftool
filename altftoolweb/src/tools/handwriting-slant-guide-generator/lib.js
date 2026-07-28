/**
 * Slant guide underlay geometry.
 *
 * A slant guide is a sheet of parallel lines at a fixed angle, slipped under
 * the page you write on so every ascender and downstroke can be matched to the
 * same slope. All output is in millimetres against a real paper size.
 */

/** ISO 216 A4 is 210 x 297 mm. US Letter is 8.5 x 11 in = 215.9 x 279.4 mm. */
export const PAGE_SIZES = {
  a4: { id: "a4", label: "A4 (210 x 297 mm)", widthMm: 210, heightMm: 297 },
  letter: { id: "letter", label: "US Letter (216 x 279 mm)", widthMm: 215.9, heightMm: 279.4 },
};

/**
 * Slant angles are measured from the baseline, the convention used in
 * penmanship manuals. 90 degrees is upright; smaller numbers lean further to
 * the right.
 */
export const SLANT_PRESETS = [
  { id: "upright", label: "Upright print / manuscript", angleDeg: 90, note: "Ball-and-stick print letters sit square to the baseline." },
  { id: "italic", label: "Chancery italic", angleDeg: 85, note: "Classic italic hands lean only about 5 degrees off vertical." },
  { id: "modern-italic", label: "Steeper italic", angleDeg: 80, note: "A 10-degree lean, common in modern italic teaching hands." },
  { id: "school-cursive", label: "School cursive", angleDeg: 70, note: "Typical taught slope for joined school handwriting." },
  { id: "business", label: "Business / Palmer-style cursive", angleDeg: 60, note: "A faster commercial hand with a pronounced lean." },
  { id: "copperplate", label: "Copperplate / Engrosser's script", angleDeg: 55, note: "The standard 55-degree slant of English roundhand." },
  { id: "spencerian", label: "Spencerian", angleDeg: 52, note: "Spencerian sets its main slant at 52 degrees." },
];

/** Below 30 degrees the letters lie almost flat; above 90 they lean backwards. */
export const MIN_ANGLE_DEG = 30;
export const MAX_ANGLE_DEG = 90;

export const MIN_SPACING_MM = 3;
export const MAX_SPACING_MM = 40;

export const MIN_X_HEIGHT_MM = 3;
export const MAX_X_HEIGHT_MM = 40;

export const MIN_MARGIN_MM = 5;
export const MAX_MARGIN_MM = 40;

const DEG_TO_RAD = Math.PI / 180;

const round2 = (value) => Math.round(value * 100) / 100;

/**
 * Horizontal drift of a slanted line over a given rise.
 * A line at angle a from the baseline moves rise / tan(a) sideways as it climbs
 * `rise`. At 90 degrees tan is infinite, so the drift is exactly zero.
 */
export function slantRun(riseMm, angleDeg) {
  if (!(riseMm >= 0) || !Number.isFinite(angleDeg)) return NaN;
  if (angleDeg >= 90) return 0;
  const t = Math.tan(angleDeg * DEG_TO_RAD);
  if (!(t > 0)) return NaN;
  return riseMm / t;
}

/** The same slant expressed as degrees off vertical, how nib guides often quote it. */
export function degreesFromVertical(angleDeg) {
  return round2(90 - angleDeg);
}

/**
 * Build a complete slant underlay.
 *
 * @returns {object} { error } for invalid input, otherwise the full geometry:
 *   ruled writing rows plus the slant lines that cross them.
 */
export function buildSlantGuide({
  pageSize = "a4",
  angleDeg = 55,
  spacingMm = 10,
  xHeightMm = 6,
  ascenderMm = 5,
  descenderMm = 5,
  rowGapMm = 6,
  marginMm = 15,
  showXHeightLines = true,
} = {}) {
  const page = PAGE_SIZES[pageSize];
  if (!page) return { error: "Choose either A4 or US Letter paper." };

  const values = [angleDeg, spacingMm, xHeightMm, ascenderMm, descenderMm, rowGapMm, marginMm];
  if (values.some((value) => !Number.isFinite(value))) {
    return { error: "Enter a number in every field." };
  }
  if (angleDeg < MIN_ANGLE_DEG || angleDeg > MAX_ANGLE_DEG) {
    return { error: `Slant angle must be between ${MIN_ANGLE_DEG} and ${MAX_ANGLE_DEG} degrees from the baseline.` };
  }
  if (spacingMm < MIN_SPACING_MM || spacingMm > MAX_SPACING_MM) {
    return { error: `Spacing between slant lines must be between ${MIN_SPACING_MM} mm and ${MAX_SPACING_MM} mm.` };
  }
  if (xHeightMm < MIN_X_HEIGHT_MM || xHeightMm > MAX_X_HEIGHT_MM) {
    return { error: `x-height must be between ${MIN_X_HEIGHT_MM} mm and ${MAX_X_HEIGHT_MM} mm.` };
  }
  if (ascenderMm < 0 || descenderMm < 0 || rowGapMm < 0) {
    return { error: "Ascender, descender and row gap cannot be negative." };
  }
  if (marginMm < MIN_MARGIN_MM || marginMm > MAX_MARGIN_MM) {
    return { error: `Page margin must be between ${MIN_MARGIN_MM} mm and ${MAX_MARGIN_MM} mm.` };
  }

  const usableWidthMm = page.widthMm - marginMm * 2;
  const usableHeightMm = page.heightMm - marginMm * 2;
  if (usableWidthMm <= 0 || usableHeightMm <= 0) {
    return { error: "Margins leave no printable area on this paper size." };
  }

  const lineHeightMm = ascenderMm + xHeightMm + descenderMm;
  if (lineHeightMm <= 0) return { error: "The writing line has no height. Increase the x-height." };
  if (lineHeightMm > usableHeightMm) {
    return { error: "One writing line is taller than the printable area. Reduce the x-height or the ascender." };
  }

  // n rows need n heights plus (n-1) gaps.
  const rowCount = Math.floor((usableHeightMm + rowGapMm) / (lineHeightMm + rowGapMm));
  const blockHeightMm = rowCount * lineHeightMm + (rowCount - 1) * rowGapMm;

  const rows = [];
  for (let index = 0; index < rowCount; index += 1) {
    const top = index * (lineHeightMm + rowGapMm);
    rows.push({
      index,
      topMm: round2(top),
      ascenderMm: round2(top),
      waistMm: round2(top + ascenderMm),
      baselineMm: round2(top + ascenderMm + xHeightMm),
      descenderMm: round2(top + lineHeightMm),
    });
  }

  const driftMm = slantRun(blockHeightMm, angleDeg);
  if (!Number.isFinite(driftMm)) return { error: "That slant angle cannot be drawn. Pick an angle above 30 degrees." };

  // Slant lines run bottom-left to top-right. A line whose foot sits at x drifts
  // to x + drift at the top, so feet must start drift millimetres left of the
  // block to cover the top-left corner.
  const firstFootMm = -Math.ceil(driftMm / spacingMm) * spacingMm;
  const slantLines = [];
  for (let foot = firstFootMm; foot <= usableWidthMm + 1e-9; foot += spacingMm) {
    const head = foot + driftMm;
    // Keep only the lines that actually cross the writing block.
    if (head < 0 || foot > usableWidthMm) continue;
    slantLines.push({
      xBottomMm: round2(foot),
      xTopMm: round2(head),
      yBottomMm: round2(blockHeightMm),
      yTopMm: 0,
    });
  }

  return {
    page: { ...page },
    marginMm,
    angleDeg,
    angleFromVerticalDeg: degreesFromVertical(angleDeg),
    spacingMm,
    xHeightMm,
    ascenderMm,
    descenderMm,
    rowGapMm,
    showXHeightLines,
    usableWidthMm: round2(usableWidthMm),
    usableHeightMm: round2(usableHeightMm),
    lineHeightMm: round2(lineHeightMm),
    /** Ratio of ascender height to x-height — italic manuals aim for about 1.5 to 2. */
    ascenderRatio: round2(ascenderMm / xHeightMm),
    rowCount,
    blockHeightMm: round2(blockHeightMm),
    driftMm: round2(driftMm),
    /** Sideways travel of a slanted stroke over one x-height, the practical cue for a writer. */
    driftPerXHeightMm: round2(slantRun(xHeightMm, angleDeg)),
    slantLineCount: slantLines.length,
    slantLines,
    rows,
  };
}
