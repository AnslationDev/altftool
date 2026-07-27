/**
 * Bicycle frame size from height and cycling inseam.
 *
 * Two independent methods are reported so they can be cross-checked:
 *   1. The classic inseam-multiplier formulas used by bike fitters — seat tube
 *      length is a fixed fraction of the rider's inseam, with a different
 *      fraction for road, mountain and hybrid geometry.
 *   2. The height-band size chart that manufacturers publish, which is what a
 *      shop will quote you.
 * Inseam is measured barefoot, back against a wall, with a book pulled firmly
 * up into the crotch: floor to the top of the book.
 */

export const CM_PER_INCH = 2.54;

/**
 * Road seat tube length as a fraction of inseam. The centre-to-top figure of
 * 0.67 and centre-to-centre figure of 0.65 are the long-standing road fit
 * multipliers popularised by Greg LeMond's fit method.
 */
export const ROAD_CT_FACTOR = 0.67;
export const ROAD_CC_FACTOR = 0.65;

/**
 * Mountain bike frames are quoted in inches. The standard multiplier gives the
 * frame size in inches directly from inseam in centimetres.
 */
export const MTB_INCH_FACTOR = 0.226;

/** Hybrid and city frames sit slightly below road C-C for extra standover. */
export const HYBRID_FACTOR = 0.63;

/** LeMond saddle height: bottom-bracket centre to saddle top = inseam x 0.883. */
export const LEMOND_SADDLE_FACTOR = 0.883;

/** Recommended standover clearance below the rider's inseam, in cm. */
export const STANDOVER_CLEARANCE_CM = {
  road: [2.5, 5],
  mtb: [5, 10],
  hybrid: [2.5, 5],
};

/** Cycling inseam averages roughly 45-47% of standing height. */
export const INSEAM_HEIGHT_RATIO = 0.46;

export const BIKE_TYPES = {
  road: "Road / gravel",
  mtb: "Mountain",
  hybrid: "Hybrid / city",
};

/**
 * Manufacturer-style height bands. `minHeight` is inclusive, `maxHeight`
 * exclusive. Road and hybrid sizes are seat tube centimetres; mountain sizes
 * are frame inches.
 */
export const HEIGHT_CHARTS = {
  road: [
    { minHeight: 145, maxHeight: 152, size: "47-48 cm", letter: "XXS" },
    { minHeight: 152, maxHeight: 160, size: "49-50 cm", letter: "XS" },
    { minHeight: 160, maxHeight: 168, size: "51-53 cm", letter: "S" },
    { minHeight: 168, maxHeight: 175, size: "54-55 cm", letter: "M" },
    { minHeight: 175, maxHeight: 183, size: "56-57 cm", letter: "L" },
    { minHeight: 183, maxHeight: 190, size: "58-59 cm", letter: "XL" },
    { minHeight: 190, maxHeight: 200, size: "60-62 cm", letter: "XXL" },
  ],
  mtb: [
    { minHeight: 145, maxHeight: 158, size: '13-14"', letter: "XS" },
    { minHeight: 158, maxHeight: 168, size: '15-16"', letter: "S" },
    { minHeight: 168, maxHeight: 178, size: '17-18"', letter: "M" },
    { minHeight: 178, maxHeight: 185, size: '19-20"', letter: "L" },
    { minHeight: 185, maxHeight: 193, size: '21-22"', letter: "XL" },
    { minHeight: 193, maxHeight: 205, size: '23" and up', letter: "XXL" },
  ],
  hybrid: [
    { minHeight: 145, maxHeight: 158, size: "42-44 cm", letter: "XS" },
    { minHeight: 158, maxHeight: 165, size: "45-47 cm", letter: "S" },
    { minHeight: 165, maxHeight: 172, size: "48-50 cm", letter: "M" },
    { minHeight: 172, maxHeight: 180, size: "51-53 cm", letter: "L" },
    { minHeight: 180, maxHeight: 188, size: "54-57 cm", letter: "XL" },
    { minHeight: 188, maxHeight: 200, size: "58-61 cm", letter: "XXL" },
  ],
};

const MIN_HEIGHT_CM = 120;
const MAX_HEIGHT_CM = 230;
const MIN_INSEAM_CM = 50;
const MAX_INSEAM_CM = 110;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Height band entry for a bike type, or null when the rider is off the chart. */
export function chartSizeFor(bikeType, heightCm) {
  const chart = HEIGHT_CHARTS[bikeType];
  if (!chart || !isNum(heightCm)) return null;
  return chart.find((band) => heightCm >= band.minHeight && heightCm < band.maxHeight) ?? null;
}

/** Seat tube length in cm from inseam, for each bike type. */
export function frameFromInseam(bikeType, inseamCm) {
  if (!isNum(inseamCm) || inseamCm <= 0) return null;
  if (bikeType === "mtb") return inseamCm * MTB_INCH_FACTOR * CM_PER_INCH;
  if (bikeType === "hybrid") return inseamCm * HYBRID_FACTOR;
  return inseamCm * ROAD_CT_FACTOR;
}

export function computeFrameSize({ heightCm, inseamCm, bikeType = "road" } = {}) {
  if (!isNum(heightCm)) return { error: "Enter your height in centimetres." };
  if (heightCm < MIN_HEIGHT_CM || heightCm > MAX_HEIGHT_CM) {
    return { error: `Height must be between ${MIN_HEIGHT_CM} and ${MAX_HEIGHT_CM} cm.` };
  }
  if (!BIKE_TYPES[bikeType]) return { error: "Pick road, mountain or hybrid." };

  if (isNum(inseamCm) && inseamCm <= 0) return { error: "Inseam must be greater than zero." };
  const inseamGiven = isNum(inseamCm) && inseamCm > 0;
  const inseam = inseamGiven ? inseamCm : heightCm * INSEAM_HEIGHT_RATIO;
  if (inseamGiven && (inseam < MIN_INSEAM_CM || inseam > MAX_INSEAM_CM)) {
    return { error: `Inseam must be between ${MIN_INSEAM_CM} and ${MAX_INSEAM_CM} cm.` };
  }
  // A cycling inseam is 35-65% of standing height for essentially every adult.
  const ratio = inseam / heightCm;
  if (ratio < 0.35 || ratio > 0.65) {
    return { error: "Inseam and height do not look consistent — inseam is normally 44-48% of your height." };
  }

  const roadCt = inseam * ROAD_CT_FACTOR;
  const roadCc = inseam * ROAD_CC_FACTOR;
  const mtbInches = inseam * MTB_INCH_FACTOR;
  const hybridCm = inseam * HYBRID_FACTOR;

  const recommendedCm = frameFromInseam(bikeType, inseam);
  const [minClear, maxClear] = STANDOVER_CLEARANCE_CM[bikeType];

  return {
    bikeType,
    bikeTypeLabel: BIKE_TYPES[bikeType],
    heightCm,
    inseamCm: inseam,
    inseamEstimated: !inseamGiven,
    recommendedCm,
    recommendedInches: recommendedCm / CM_PER_INCH,
    roadCt,
    roadCc,
    mtbInches,
    mtbCm: mtbInches * CM_PER_INCH,
    hybridCm,
    saddleHeightCm: inseam * LEMOND_SADDLE_FACTOR,
    standoverMaxCm: inseam - minClear,
    standoverIdealCm: inseam - maxClear,
    clearanceRange: [minClear, maxClear],
    chart: chartSizeFor(bikeType, heightCm),
    allCharts: Object.keys(BIKE_TYPES).map((key) => ({
      key,
      label: BIKE_TYPES[key],
      band: chartSizeFor(key, heightCm),
    })),
  };
}
