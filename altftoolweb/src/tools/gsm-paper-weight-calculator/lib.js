/**
 * Paper weight maths: GSM to sheet, ream and parcel weight, US pound basis
 * weight conversion, caliper and stack height.
 */

/** Exact international inch. */
export const MM_PER_INCH = 25.4;

/** Exact avoirdupois pound in grams (international yard and pound agreement). */
export const GRAMS_PER_POUND = 453.59237;

/** A ream is 500 sheets by the modern definition used by mills and merchants. */
export const SHEETS_PER_REAM = 500;

/**
 * GSM is defined as grams per square metre, so sheet weight in grams is
 * exactly area in square metres multiplied by GSM. Nothing is approximated.
 */
export const GRAMS_PER_SQM_PER_GSM = 1;

/**
 * US basis weight is the weight in pounds of 500 sheets cut to that grade's
 * basis size. Converting to GSM is therefore:
 *
 *   GSM = lb x GRAMS_PER_POUND / (500 x basis sheet area in square metres)
 *
 * The `gsmPerLb` figures below are that constant worked out for each grade.
 * Checking them against the published equivalences: 20 lb Bond = 75 GSM,
 * 80 lb Text = 118 GSM, 100 lb Cover = 270 GSM, 110 lb Index = 199 GSM.
 */
export const BASIS_GRADES = [
  { id: "bond", label: "Bond / Writing", basisIn: [17, 22] },
  { id: "text", label: "Text / Book / Offset", basisIn: [25, 38] },
  { id: "cover", label: "Cover", basisIn: [20, 26] },
  { id: "index", label: "Index", basisIn: [25.5, 30.5] },
  { id: "bristol", label: "Bristol", basisIn: [22.5, 28.5] },
  { id: "tag", label: "Tag", basisIn: [24, 36] },
].map((grade) => {
  const areaSqm =
    ((grade.basisIn[0] * MM_PER_INCH) / 1000) * ((grade.basisIn[1] * MM_PER_INCH) / 1000);
  return {
    ...grade,
    basisAreaSqm: areaSqm,
    gsmPerLb: GRAMS_PER_POUND / (SHEETS_PER_REAM * areaSqm),
  };
});

/**
 * Caliper (thickness) equals GSM multiplied by bulk. Typical values, in cubic
 * centimetres per gram, for the stocks a commercial printer keeps:
 *  - gloss and matt coated art papers compress to roughly 0.8
 *  - uncoated offset and copier paper sits near 1.25
 *  - bulky and textured boards run 1.4 and above
 * Thickness in microns = GSM x bulk; divide by 1000 for millimetres.
 */
export const PAPER_BULKS = [
  { id: "coated", label: "Coated art / gloss", bulk: 0.8 },
  { id: "uncoated", label: "Uncoated offset / copier", bulk: 1.25 },
  { id: "board", label: "Bulky board / textured", bulk: 1.45 },
  { id: "newsprint", label: "Newsprint", bulk: 1.6 },
];

/**
 * Air-courier volumetric divisor used by Indian domestic and international
 * express carriers: centimetres cubed divided by 5000 gives kilograms.
 */
export const VOLUMETRIC_DIVISOR_CM = 5000;

/** Sheet sizes people weigh most often, in millimetres (ISO 216 / ISO 217). */
export const SHEET_PRESETS = [
  { id: "a4", label: "A4 (210 x 297 mm)", w: 210, h: 297 },
  { id: "a3", label: "A3 (297 x 420 mm)", w: 297, h: 420 },
  { id: "a5", label: "A5 (148 x 210 mm)", w: 148, h: 210 },
  { id: "sra3", label: "SRA3 (320 x 450 mm)", w: 320, h: 450 },
  { id: "letter", label: "Letter (215.9 x 279.4 mm)", w: 215.9, h: 279.4 },
  { id: "13x19", label: "13 x 19 in (330.2 x 482.6 mm)", w: 330.2, h: 482.6 },
  { id: "20x30", label: "Double Crown 20 x 30 in", w: 508, h: 762 },
  { id: "23x36", label: "Trade sheet 23 x 36 in", w: 584.2, h: 914.4 },
];

/** Common stock weights with what they are normally used for. */
export const GSM_REFERENCE = [
  { gsm: 45, use: "Newsprint" },
  { gsm: 70, use: "Economy copier / notebook paper" },
  { gsm: 80, use: "Standard office copier paper" },
  { gsm: 100, use: "Premium letterhead" },
  { gsm: 130, use: "Magazine text, flyers" },
  { gsm: 170, use: "Posters, heavy flyers" },
  { gsm: 250, use: "Light card, folders" },
  { gsm: 300, use: "Business cards, wedding folders" },
  { gsm: 350, use: "Premium business cards, tags" },
];

const isNum = (v) => typeof v === "number" && Number.isFinite(v);

/** Convert a length in mm, cm or in to millimetres. */
export function lengthToMm(value, unit) {
  if (!isNum(value)) return NaN;
  if (unit === "in") return value * MM_PER_INCH;
  if (unit === "cm") return value * 10;
  return value;
}

/** Look up a basis grade by id. */
export function findGrade(id) {
  return BASIS_GRADES.find((grade) => grade.id === id) || null;
}

/** US pound basis weight to GSM. */
export function basisWeightToGsm(pounds, gradeId) {
  const grade = findGrade(gradeId);
  if (!grade) return { error: "Choose one of the listed US paper grades." };
  if (!isNum(pounds)) return { error: "Enter a number for the basis weight." };
  if (pounds <= 0) return { error: "Basis weight must be greater than zero." };
  if (pounds > 1000) return { error: "Basis weights above 1000 lb are not real paper." };
  return { gsm: pounds * grade.gsmPerLb, grade };
}

/** GSM back to US pound basis weight for a grade. */
export function gsmToBasisWeight(gsm, gradeId) {
  const grade = findGrade(gradeId);
  if (!grade) return { error: "Choose one of the listed US paper grades." };
  if (!isNum(gsm)) return { error: "Enter a number for the GSM." };
  if (gsm <= 0) return { error: "GSM must be greater than zero." };
  return { pounds: gsm / grade.gsmPerLb, grade };
}

/** Sheet weight in grams. */
export function sheetWeightGrams(widthMm, heightMm, gsm) {
  if (!isNum(widthMm) || !isNum(heightMm) || !isNum(gsm)) return NaN;
  return (widthMm / 1000) * (heightMm / 1000) * gsm * GRAMS_PER_SQM_PER_GSM;
}

/** Caliper of one sheet in millimetres, from GSM and bulk. */
export function caliperMm(gsm, bulk) {
  if (!isNum(gsm) || !isNum(bulk) || gsm <= 0 || bulk <= 0) return NaN;
  return (gsm * bulk) / 1000;
}

/**
 * Full job weight calculation.
 *
 * @param {object} input
 * @param {number} input.width      sheet width in `unit`
 * @param {number} input.height     sheet height in `unit`
 * @param {string} input.unit       "mm" | "cm" | "in"
 * @param {number} input.gsm        paper weight in grams per square metre
 * @param {number} input.sheets     number of sheets in the job
 * @param {string} input.bulkId     id from PAPER_BULKS
 * @param {number} input.packagingG packaging weight in grams (wrap, carton)
 * @returns {object} result, or { error } when input cannot be used
 */
export function computePaperJob({
  width,
  height,
  unit = "mm",
  gsm,
  sheets = 500,
  bulkId = "uncoated",
  packagingG = 0,
} = {}) {
  if (!["mm", "cm", "in"].includes(unit)) {
    return { error: "Choose a size unit of mm, cm or in." };
  }
  const bulkEntry = PAPER_BULKS.find((entry) => entry.id === bulkId);
  if (!bulkEntry) return { error: "Choose one of the listed paper types." };

  if ([width, height, gsm, sheets, packagingG].some((value) => !isNum(value))) {
    return { error: "Enter a number in every field." };
  }

  const wMm = lengthToMm(width, unit);
  const hMm = lengthToMm(height, unit);

  if (wMm <= 0 || hMm <= 0) {
    return { error: "Sheet width and height must be greater than zero." };
  }
  if (wMm > 5000 || hMm > 5000) {
    return { error: "Sheet sides above 5 m are reel widths, not cut sheets." };
  }
  if (gsm <= 0) return { error: "GSM must be greater than zero." };
  if (gsm > 1000) return { error: "Above 1000 GSM the stock is board measured in microns." };
  if (sheets < 1) return { error: "Enter at least one sheet." };
  if (sheets > 10000000) return { error: "Keep the run under 10 million sheets." };
  if (packagingG < 0) return { error: "Packaging weight cannot be negative." };

  const sheetCount = Math.round(sheets);
  const areaSqm = (wMm / 1000) * (hMm / 1000);
  const perSheetG = areaSqm * gsm;
  const reamKg = (perSheetG * SHEETS_PER_REAM) / 1000;
  const paperG = perSheetG * sheetCount;
  const totalG = paperG + packagingG;
  const caliper = caliperMm(gsm, bulkEntry.bulk);
  const stackMm = caliper * sheetCount;

  const cartonLcm = wMm / 10;
  const cartonWcm = hMm / 10;
  const cartonHcm = Math.max(stackMm / 10, 0.1);
  const volumetricKg = (cartonLcm * cartonWcm * cartonHcm) / VOLUMETRIC_DIVISOR_CM;

  const basisEquivalents = BASIS_GRADES.map((grade) => ({
    id: grade.id,
    label: grade.label,
    pounds: gsm / grade.gsmPerLb,
  }));

  return {
    areaSqm,
    perSheetG,
    perSheetKg: perSheetG / 1000,
    reamKg,
    sheetCount,
    paperG,
    paperKg: paperG / 1000,
    totalG,
    totalKg: totalG / 1000,
    packagingG,
    caliperMm: caliper,
    caliperMicron: caliper * 1000,
    stackMm,
    stackCm: stackMm / 10,
    bulkLabel: bulkEntry.label,
    bulk: bulkEntry.bulk,
    volumetricKg,
    billableKg: Math.max(totalG / 1000, volumetricKg),
    sheetsPerKg: perSheetG > 0 ? 1000 / perSheetG : NaN,
    basisEquivalents,
  };
}
