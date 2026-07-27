/**
 * Indian wedding-card print planning: finished size -> flat artwork size,
 * document size with bleed, envelope and insert sizes, paper weight per
 * invitation and shipping weight for the full order.
 *
 * All maths runs in millimetres and grams.
 */

/** Exact international inch. */
export const MM_PER_INCH = 25.4;

/** ISO / Indian commercial print bleed: 3 mm per edge. */
export const DEFAULT_BLEED_MM = 3;

/** Safe (quiet) margin inside the trim for text and motifs on card work. */
export const DEFAULT_SAFE_MM = 5;

/**
 * Envelopes are ordered oversize so a card slides in without buckling.
 * Trade practice is about 6 mm of clearance on width and on height.
 */
export const ENVELOPE_CLEARANCE_MM = 6;

/**
 * An envelope blank is both faces plus the side, bottom and top flaps.
 * Measured against common wallet-style blanks this is close to 2.3 times
 * the finished face area; use it for a paper-weight estimate only.
 */
export const ENVELOPE_BLANK_FACTOR = 2.3;

/** Each insert steps down 6 mm on width and height so the stack fans neatly. */
export const INSERT_STEP_MM = 6;

/**
 * Sheet weight: grams = area in square metres x GSM. This is the definition
 * of GSM (grams per square metre), so it is exact.
 */
export const GRAMS_PER_SQM_PER_GSM = 1;

/**
 * Caliper (thickness) is GSM x bulk. Typical coated and uncoated card used for
 * Indian wedding stationery runs near a bulk of 1.0 cubic centimetre per gram,
 * i.e. roughly 1 micron of thickness per GSM (a 300 GSM board is ~0.30 mm).
 */
export const PAPER_BULK_MICRON_PER_GSM = 1.0;

/**
 * Air-courier volumetric divisor used by Indian domestic and international
 * express carriers: length x width x height in centimetres divided by 5000.
 */
export const VOLUMETRIC_DIVISOR_CM = 5000;

/** Trade sizes Indian wedding-card printers quote by name. */
export const CARD_SIZES = [
  { id: "5x7", label: '5 x 7 in - save the date / compact', widthMm: 127, heightMm: 177.8 },
  { id: "55x85", label: '5.5 x 8.5 in - slim folder', widthMm: 139.7, heightMm: 215.9 },
  { id: "a5", label: "A5 - 148 x 210 mm", widthMm: 148, heightMm: 210 },
  { id: "6x9", label: '6 x 9 in - most common folder', widthMm: 152.4, heightMm: 228.6 },
  { id: "7x9", label: '7 x 9 in - wide folder', widthMm: 177.8, heightMm: 228.6 },
  { id: "8x8", label: '8 x 8 in - square', widthMm: 203.2, heightMm: 203.2 },
  { id: "8x10", label: '8 x 10 in - premium folder', widthMm: 203.2, heightMm: 254 },
  { id: "a4", label: "A4 - 210 x 297 mm", widthMm: 210, heightMm: 297 },
  { id: "9x12", label: '9 x 12 in - royal / box card', widthMm: 228.6, heightMm: 304.8 },
];

/**
 * Fold styles. `panels` is how many finished-width panels sit side by side on
 * the flat sheet; `layers` is how many thicknesses the folded card has.
 */
export const FOLD_TYPES = [
  { id: "flat", label: "Flat single card (no fold)", panels: 1, layers: 1 },
  { id: "bifold", label: "Bi-fold (one centre fold)", panels: 2, layers: 2 },
  { id: "gatefold", label: "Gate fold (two flaps meet)", panels: 2, layers: 2 },
  { id: "trifold", label: "Tri-fold / roll fold", panels: 3, layers: 3 },
  { id: "quadfold", label: "Four-panel / cross fold", panels: 4, layers: 4 },
];

/** Which edge the panels repeat along. */
export const FOLD_AXES = [
  { id: "width", label: "Fold along the width (panels side by side)" },
  { id: "height", label: "Fold along the height (panels stacked)" },
];

/** Stock weights Indian card printers keep on the shelf, in GSM. */
export const STOCK_GUIDE = [
  { part: "Main card / folder", range: "250-350 GSM", typical: 300 },
  { part: "Insert cards", range: "150-250 GSM", typical: 250 },
  { part: "Envelope / cover", range: "120-180 GSM", typical: 120 },
  { part: "Vellum or butter-paper overlay", range: "90-120 GSM", typical: 100 },
];

const isNum = (v) => typeof v === "number" && Number.isFinite(v);

/** Convert a length in mm or in to millimetres. */
export function lengthToMm(value, unit) {
  if (!isNum(value)) return NaN;
  if (unit === "in") return value * MM_PER_INCH;
  if (unit === "cm") return value * 10;
  return value;
}

/** Weight in grams of one sheet of `widthMm` x `heightMm` at `gsm`. */
export function sheetWeightGrams(widthMm, heightMm, gsm) {
  if (!isNum(widthMm) || !isNum(heightMm) || !isNum(gsm)) return NaN;
  const areaSqm = (widthMm / 1000) * (heightMm / 1000);
  return areaSqm * gsm * GRAMS_PER_SQM_PER_GSM;
}

/** Caliper of a sheet in millimetres from its GSM. */
export function sheetThicknessMm(gsm) {
  if (!isNum(gsm) || gsm <= 0) return 0;
  return (gsm * PAPER_BULK_MICRON_PER_GSM) / 1000;
}

/**
 * Full wedding-card specification.
 *
 * @param {object} input
 * @param {number} input.width        finished (folded) width
 * @param {number} input.height       finished (folded) height
 * @param {string} input.unit         "mm" | "cm" | "in"
 * @param {string} input.foldId       id from FOLD_TYPES
 * @param {string} input.foldAxis     "width" | "height"
 * @param {number} input.bleedMm      bleed per edge, millimetres
 * @param {number} input.safeMm       safe margin inside trim, millimetres
 * @param {number} input.cardGsm      main card stock GSM
 * @param {number} input.insertCount  number of insert cards
 * @param {number} input.insertGsm    insert stock GSM
 * @param {number} input.envelopeGsm  envelope stock GSM
 * @param {number} input.quantity     invitations in the order
 * @returns {object} spec, or { error } if the input cannot be used
 */
export function computeWeddingCardSpec({
  width,
  height,
  unit = "mm",
  foldId = "bifold",
  foldAxis = "width",
  bleedMm = DEFAULT_BLEED_MM,
  safeMm = DEFAULT_SAFE_MM,
  cardGsm = 300,
  insertCount = 1,
  insertGsm = 250,
  envelopeGsm = 120,
  quantity = 200,
} = {}) {
  const fold = FOLD_TYPES.find((f) => f.id === foldId);
  if (!fold) return { error: "Choose one of the listed fold styles." };
  if (foldAxis !== "width" && foldAxis !== "height") {
    return { error: "Choose whether the card folds along its width or its height." };
  }
  if (!["mm", "cm", "in"].includes(unit)) {
    return { error: "Choose a size unit of mm, cm or in." };
  }

  const numbers = [
    width,
    height,
    bleedMm,
    safeMm,
    cardGsm,
    insertCount,
    insertGsm,
    envelopeGsm,
    quantity,
  ];
  if (numbers.some((value) => !isNum(value))) {
    return { error: "Enter a number in every field." };
  }

  const wMm = lengthToMm(width, unit);
  const hMm = lengthToMm(height, unit);

  if (wMm <= 0 || hMm <= 0) {
    return { error: "Finished card width and height must be greater than zero." };
  }
  if (wMm > 900 || hMm > 900) {
    return { error: "Finished card sides above 900 mm are outside normal card printing." };
  }
  if (bleedMm < 0 || safeMm < 0) return { error: "Bleed and safe margin cannot be negative." };
  if (safeMm * 2 >= Math.min(wMm, hMm)) {
    return { error: "Safe margin is too large - it leaves no printable area inside the card." };
  }
  if (cardGsm <= 0 || insertGsm <= 0 || envelopeGsm <= 0) {
    return { error: "Paper GSM values must be greater than zero." };
  }
  if (cardGsm > 800 || insertGsm > 800 || envelopeGsm > 800) {
    return { error: "GSM above 800 is board, not card stock - check the value." };
  }
  if (insertCount < 0 || insertCount > 10) {
    return { error: "Enter between 0 and 10 insert cards." };
  }
  if (quantity < 1 || quantity > 100000) {
    return { error: "Order quantity must be between 1 and 100000 invitations." };
  }

  const inserts = Math.round(insertCount);
  const qty = Math.round(quantity);

  // Flat (unfolded) artwork size.
  const flatWmm = foldAxis === "width" ? wMm * fold.panels : wMm;
  const flatHmm = foldAxis === "height" ? hMm * fold.panels : hMm;

  const docWmm = flatWmm + bleedMm * 2;
  const docHmm = flatHmm + bleedMm * 2;
  const safeWmm = wMm - safeMm * 2;
  const safeHmm = hMm - safeMm * 2;

  const envelopeWmm = wMm + ENVELOPE_CLEARANCE_MM;
  const envelopeHmm = hMm + ENVELOPE_CLEARANCE_MM;

  const insertSizes = [];
  for (let i = 0; i < inserts; i += 1) {
    const step = INSERT_STEP_MM * (i + 1);
    const iw = wMm - step;
    const ih = hMm - step;
    if (iw <= 0 || ih <= 0) {
      return { error: "Too many inserts for this card size - the smallest insert would vanish." };
    }
    insertSizes.push({ index: i + 1, widthMm: iw, heightMm: ih });
  }

  const cardWeight = sheetWeightGrams(flatWmm, flatHmm, cardGsm);
  const insertWeight = insertSizes.reduce(
    (sum, insert) => sum + sheetWeightGrams(insert.widthMm, insert.heightMm, insertGsm),
    0,
  );
  const envelopeWeight =
    sheetWeightGrams(envelopeWmm, envelopeHmm, envelopeGsm) * ENVELOPE_BLANK_FACTOR;
  const perInviteGrams = cardWeight + insertWeight + envelopeWeight;

  const stackPerInviteMm =
    sheetThicknessMm(cardGsm) * fold.layers +
    sheetThicknessMm(insertGsm) * inserts +
    sheetThicknessMm(envelopeGsm) * 2;

  const totalGrams = perInviteGrams * qty;
  const totalKg = totalGrams / 1000;
  const stackHeightMm = stackPerInviteMm * qty;

  // Shipping carton: the envelope footprint, stack height rounded up.
  const cartonLcm = envelopeWmm / 10;
  const cartonWcm = envelopeHmm / 10;
  const cartonHcm = Math.max(stackHeightMm / 10, 1);
  const volumetricKg = (cartonLcm * cartonWcm * cartonHcm) / VOLUMETRIC_DIVISOR_CM;
  const billableKg = Math.max(totalKg, volumetricKg);

  return {
    unit,
    foldLabel: fold.label,
    panels: fold.panels,
    layers: fold.layers,
    finishedWidthMm: wMm,
    finishedHeightMm: hMm,
    flatWidthMm: flatWmm,
    flatHeightMm: flatHmm,
    docWidthMm: docWmm,
    docHeightMm: docHmm,
    safeWidthMm: safeWmm,
    safeHeightMm: safeHmm,
    envelopeWidthMm: envelopeWmm,
    envelopeHeightMm: envelopeHmm,
    insertSizes,
    cardWeightG: cardWeight,
    insertWeightG: insertWeight,
    envelopeWeightG: envelopeWeight,
    perInviteGrams,
    quantity: qty,
    totalKg,
    stackPerInviteMm,
    stackHeightMm,
    volumetricKg,
    billableKg,
    cartonCm: { l: cartonLcm, w: cartonWcm, h: cartonHcm },
    aspectRatio: wMm / hMm,
  };
}
