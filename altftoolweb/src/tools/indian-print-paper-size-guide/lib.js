/**
 * Paper size reference for Indian print work: ISO A/B/C, ISO raw RA and SRA,
 * North American cut sizes, the British trade sizes still ordered by name in
 * Indian paper markets, and digital press sheets.
 *
 * Dimensions are stored in millimetres, portrait (width <= height).
 */

/** Exact international inch. */
export const MM_PER_INCH = 25.4;

/** PostScript / PDF point: 72 to the inch. */
export const POINTS_PER_INCH = 72;

/** CSS reference pixel at 1x: 96 per inch (CSS Values and Units). */
export const CSS_PX_PER_INCH = 96;

/**
 * ISO 216 A, B and C series plus ISO 217 RA and SRA raw formats. A0 is one
 * square metre with a 1:sqrt(2) ratio; every later size halves the long edge
 * and the standard rounds each dimension down to a whole millimetre.
 */
export const PAPER_SIZES = [
  // ISO 216 A series
  { id: "a0", name: "A0", group: "ISO A series", w: 841, h: 1189 },
  { id: "a1", name: "A1", group: "ISO A series", w: 594, h: 841 },
  { id: "a2", name: "A2", group: "ISO A series", w: 420, h: 594 },
  { id: "a3", name: "A3", group: "ISO A series", w: 297, h: 420 },
  { id: "a4", name: "A4", group: "ISO A series", w: 210, h: 297 },
  { id: "a5", name: "A5", group: "ISO A series", w: 148, h: 210 },
  { id: "a6", name: "A6", group: "ISO A series", w: 105, h: 148 },
  { id: "a7", name: "A7", group: "ISO A series", w: 74, h: 105 },
  { id: "a8", name: "A8", group: "ISO A series", w: 52, h: 74 },
  // ISO 216 B series
  { id: "b0", name: "B0", group: "ISO B series", w: 1000, h: 1414 },
  { id: "b1", name: "B1", group: "ISO B series", w: 707, h: 1000 },
  { id: "b2", name: "B2", group: "ISO B series", w: 500, h: 707 },
  { id: "b3", name: "B3", group: "ISO B series", w: 353, h: 500 },
  { id: "b4", name: "B4", group: "ISO B series", w: 250, h: 353 },
  { id: "b5", name: "B5", group: "ISO B series", w: 176, h: 250 },
  { id: "b6", name: "B6", group: "ISO B series", w: 125, h: 176 },
  // ISO 269 C envelope series
  { id: "c4", name: "C4 envelope", group: "Envelopes", w: 229, h: 324 },
  { id: "c5", name: "C5 envelope", group: "Envelopes", w: 162, h: 229 },
  { id: "c6", name: "C6 envelope", group: "Envelopes", w: 114, h: 162 },
  { id: "dl", name: "DL envelope", group: "Envelopes", w: 110, h: 220 },
  // ISO 217 raw formats
  { id: "ra0", name: "RA0", group: "ISO raw (RA/SRA)", w: 860, h: 1220 },
  { id: "ra1", name: "RA1", group: "ISO raw (RA/SRA)", w: 610, h: 860 },
  { id: "ra2", name: "RA2", group: "ISO raw (RA/SRA)", w: 430, h: 610 },
  { id: "ra3", name: "RA3", group: "ISO raw (RA/SRA)", w: 305, h: 430 },
  { id: "sra0", name: "SRA0", group: "ISO raw (RA/SRA)", w: 900, h: 1280 },
  { id: "sra1", name: "SRA1", group: "ISO raw (RA/SRA)", w: 640, h: 900 },
  { id: "sra2", name: "SRA2", group: "ISO raw (RA/SRA)", w: 450, h: 640 },
  { id: "sra3", name: "SRA3", group: "ISO raw (RA/SRA)", w: 320, h: 450 },
  // North American cut sizes (defined in inches)
  { id: "letter", name: "Letter (8.5 x 11 in)", group: "North American", w: 215.9, h: 279.4 },
  { id: "legal", name: "Legal (8.5 x 14 in)", group: "North American", w: 215.9, h: 355.6 },
  {
    id: "halfletter",
    name: "Half Letter (5.5 x 8.5 in)",
    group: "North American",
    w: 139.7,
    h: 215.9,
  },
  {
    id: "executive",
    name: "Executive (7.25 x 10.5 in)",
    group: "North American",
    w: 184.15,
    h: 266.7,
  },
  { id: "tabloid", name: "Tabloid / Ledger (11 x 17 in)", group: "North American", w: 279.4, h: 431.8 },
  // Foolscap family - the sizes Indian offices and printer drivers call FS / F4
  {
    id: "foolscap-folio",
    name: "Foolscap folio (8 x 13 in)",
    group: "Foolscap & folio",
    w: 203.2,
    h: 330.2,
  },
  { id: "f4", name: "F4 / Folio (210 x 330 mm)", group: "Foolscap & folio", w: 210, h: 330 },
  {
    id: "foolscap-fs",
    name: "FS driver size (8.5 x 13 in)",
    group: "Foolscap & folio",
    w: 215.9,
    h: 330.2,
  },
  {
    id: "foolscap-sheet",
    name: "Foolscap sheet (13.5 x 17 in)",
    group: "Indian & British trade",
    w: 342.9,
    h: 431.8,
  },
  // British trade sheet sizes, still ordered by name in Indian paper markets
  { id: "crown", name: "Crown (15 x 20 in)", group: "Indian & British trade", w: 381, h: 508 },
  {
    id: "large-post",
    name: "Large Post (16.5 x 21 in)",
    group: "Indian & British trade",
    w: 419.1,
    h: 533.4,
  },
  { id: "demy", name: "Demy (17.5 x 22.5 in)", group: "Indian & British trade", w: 444.5, h: 571.5 },
  { id: "medium", name: "Medium (18 x 23 in)", group: "Indian & British trade", w: 457.2, h: 584.2 },
  { id: "royal", name: "Royal (20 x 25 in)", group: "Indian & British trade", w: 508, h: 635 },
  {
    id: "double-crown",
    name: "Double Crown (20 x 30 in)",
    group: "Indian & British trade",
    w: 508,
    h: 762,
  },
  { id: "imperial", name: "Imperial (22 x 30 in)", group: "Indian & British trade", w: 558.8, h: 762 },
  {
    id: "double-demy",
    name: "Double Demy (22.5 x 35 in)",
    group: "Indian & British trade",
    w: 571.5,
    h: 889,
  },
  {
    id: "trade-23x36",
    name: "Trade sheet 23 x 36 in",
    group: "Indian & British trade",
    w: 584.2,
    h: 914.4,
  },
  {
    id: "quad-crown",
    name: "Quad Crown (30 x 40 in)",
    group: "Indian & British trade",
    w: 762,
    h: 1016,
  },
  // Digital press sheets
  { id: "12x18", name: "12 x 18 in digital sheet", group: "Digital press", w: 304.8, h: 457.2 },
  {
    id: "13x19",
    name: "13 x 19 in (Super A3/B)",
    group: "Digital press",
    w: 330.2,
    h: 482.6,
  },
  { id: "biz-card-in", name: "Business card 3.5 x 2 in", group: "Small formats", w: 88.9, h: 50.8 },
  { id: "biz-card-mm", name: "Business card 90 x 54 mm", group: "Small formats", w: 54, h: 90 },
];

/** Distinct groups, in the order they appear above. */
export const PAPER_GROUPS = PAPER_SIZES.reduce((groups, size) => {
  if (!groups.includes(size.group)) groups.push(size.group);
  return groups;
}, []);

/**
 * Gripper edge: the strip an offset press clamps and cannot print. Typical
 * sheet-fed presses need 8-12 mm; 10 mm is a safe planning figure.
 */
export const DEFAULT_GRIPPER_MM = 10;

/** Knife gap between finished pieces when both carry bleed (2 x 3 mm). */
export const DEFAULT_GUTTER_MM = 6;

const isNum = (v) => typeof v === "number" && Number.isFinite(v);

/** Find a stored size by id. */
export function findSize(id) {
  return PAPER_SIZES.find((size) => size.id === id) || null;
}

/**
 * Express one paper size in every unit designers and printers use.
 * @param {number} wMm width in millimetres
 * @param {number} hMm height in millimetres
 * @param {number} dpi resolution for the pixel figures
 */
export function describeSize(wMm, hMm, dpi = 300) {
  if (!isNum(wMm) || !isNum(hMm) || wMm <= 0 || hMm <= 0) {
    return { error: "Width and height must both be greater than zero." };
  }
  if (!isNum(dpi) || dpi <= 0) {
    return { error: "Resolution must be greater than zero." };
  }
  if (dpi > 4800) {
    return { error: "Resolutions above 4800 DPI are not usable for artwork." };
  }
  const wIn = wMm / MM_PER_INCH;
  const hIn = hMm / MM_PER_INCH;
  return {
    mm: { w: wMm, h: hMm },
    cm: { w: wMm / 10, h: hMm / 10 },
    inch: { w: wIn, h: hIn },
    points: { w: wIn * POINTS_PER_INCH, h: hIn * POINTS_PER_INCH },
    pixels: { w: Math.round(wIn * dpi), h: Math.round(hIn * dpi) },
    cssPx: { w: Math.round(wIn * CSS_PX_PER_INCH), h: Math.round(hIn * CSS_PX_PER_INCH) },
    areaSqm: (wMm / 1000) * (hMm / 1000),
    aspectRatio: hMm / wMm,
    dpi,
  };
}

/**
 * Sheet weight in grams for a given GSM: area in square metres x GSM.
 */
export function sheetWeightGrams(wMm, hMm, gsm) {
  if (!isNum(wMm) || !isNum(hMm) || !isNum(gsm)) return NaN;
  return (wMm / 1000) * (hMm / 1000) * gsm;
}

function upsForOrientation(usableW, usableH, pieceW, pieceH, gutter) {
  if (pieceW <= 0 || pieceH <= 0) return { cols: 0, rows: 0, ups: 0 };
  const cols = Math.floor((usableW + gutter) / (pieceW + gutter));
  const rows = Math.floor((usableH + gutter) / (pieceH + gutter));
  return {
    cols: Math.max(0, cols),
    rows: Math.max(0, rows),
    ups: Math.max(0, cols) * Math.max(0, rows),
  };
}

/**
 * How many finished pieces fit on a press sheet, trying both piece
 * orientations and keeping the better one.
 *
 * @param {object} input
 * @param {number} input.sheetW  press sheet width, mm
 * @param {number} input.sheetH  press sheet height, mm
 * @param {number} input.pieceW  finished piece width, mm
 * @param {number} input.pieceH  finished piece height, mm
 * @param {number} input.gripper margin removed from every edge, mm
 * @param {number} input.gutter  knife gap between pieces, mm
 */
export function fitOnSheet({
  sheetW,
  sheetH,
  pieceW,
  pieceH,
  gripper = DEFAULT_GRIPPER_MM,
  gutter = DEFAULT_GUTTER_MM,
} = {}) {
  const values = [sheetW, sheetH, pieceW, pieceH, gripper, gutter];
  if (values.some((value) => !isNum(value))) {
    return { error: "Enter a number for every sheet and piece dimension." };
  }
  if (sheetW <= 0 || sheetH <= 0 || pieceW <= 0 || pieceH <= 0) {
    return { error: "Sheet and piece dimensions must be greater than zero." };
  }
  if (gripper < 0 || gutter < 0) {
    return { error: "Gripper margin and knife gap cannot be negative." };
  }
  const usableW = sheetW - gripper * 2;
  const usableH = sheetH - gripper * 2;
  if (usableW <= 0 || usableH <= 0) {
    return { error: "Gripper margin is larger than the sheet - lower it." };
  }

  const upright = upsForOrientation(usableW, usableH, pieceW, pieceH, gutter);
  const rotated = upsForOrientation(usableW, usableH, pieceH, pieceW, gutter);
  const best = rotated.ups > upright.ups ? { ...rotated, rotated: true } : { ...upright, rotated: false };

  if (best.ups === 0) {
    return {
      error: "The finished piece does not fit on this sheet, even rotated.",
    };
  }

  const sheetArea = sheetW * sheetH;
  const usedArea = best.ups * pieceW * pieceH;
  return {
    ups: best.ups,
    cols: best.cols,
    rows: best.rows,
    rotated: best.rotated,
    usableW,
    usableH,
    usedAreaShare: usedArea / sheetArea,
    wasteAreaShare: 1 - usedArea / sheetArea,
    sheetsFor1000: Math.ceil(1000 / best.ups),
  };
}
