/**
 * Roof area calculator.
 *
 * A roof covers the same footprint however steep it is, so the sloped surface
 * is always the plan area multiplied by the SLOPE FACTOR:
 *
 *   slope factor = sqrt(run^2 + rise^2) / run
 *
 * With pitch written the trade way, as rise per 12 units of run, that becomes
 * sqrt(144 + rise^2) / 12. A 6-in-12 roof therefore has a slope factor of
 * sqrt(180)/12 = 1.1180, so 1,000 sqft of footprint is 1,118 sqft of roof.
 *
 * The HIP AND VALLEY FACTOR is the same idea along the 45-degree diagonal that
 * a hip rafter follows:
 *
 *   hip factor = sqrt(2 x run^2 + rise^2) / run
 *
 * which is 1.5 exactly for a 6-in-12 roof.
 */

/** Trade convention: pitch is quoted as rise per 12 units of horizontal run. */
export const STANDARD_RUN = 12;

export const DEGREES_PER_RADIAN = 180 / Math.PI;

/** 1 ft = 0.3048 m exactly, so 1 sqm = 10.7639 sqft. */
export const SQFT_PER_SQM = 1 / (0.3048 * 0.3048);

export const ROOF_TYPES = [
  {
    id: "gable",
    label: "Gable (two slopes, ridge between)",
    /** Both long eaves carry gutters. */
    gutterSides: 2,
  },
  {
    id: "hip",
    label: "Hip (four slopes, gutter all round)",
    gutterSides: 4,
  },
  {
    id: "shed",
    label: "Shed / mono-pitch (one slope)",
    gutterSides: 1,
  },
  {
    id: "flat",
    label: "Flat or near-flat terrace",
    gutterSides: 4,
  },
];

/**
 * Common pitches with the name roofers use for them.
 * A 2-in-12 roof is the usual lower limit for profiled metal sheeting; below
 * that a membrane or a proper flat-roof detail is needed.
 */
export const COMMON_PITCHES = [
  { label: "Flat terrace", riseIn12: 0 },
  { label: "2 in 12 — minimum for sheets", riseIn12: 2 },
  { label: "4 in 12 — low slope", riseIn12: 4 },
  { label: "6 in 12 — standard", riseIn12: 6 },
  { label: "9 in 12 — steep", riseIn12: 9 },
  { label: "12 in 12 — 45 degrees", riseIn12: 12 },
];

/** Roofing materials, with the area one unit actually covers after laps. */
export const MATERIAL_PRESETS = [
  { id: "gi", label: "GI / colour-coated sheet, 10 ft x 3 ft", coverageSqft: 27, wastage: 10 },
  { id: "cement", label: "Fibre-cement sheet, 6 ft", coverageSqft: 15, wastage: 10 },
  { id: "mangalore", label: "Mangalore clay tile", coverageSqft: 0.44, wastage: 8 },
  { id: "shingle", label: "Asphalt shingle bundle", coverageSqft: 33.3, wastage: 12 },
  { id: "polycarb", label: "Polycarbonate sheet, 8 ft x 4 ft", coverageSqft: 30, wastage: 8 },
];

export const MAX_SIDE_FT = 1000;
export const MAX_OVERHANG_FT = 20;
export const MAX_RISE_IN_12 = 36;
export const MAX_WASTAGE_PERCENT = 40;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const round2 = (value) => Math.round(value * 100) / 100;
const round4 = (value) => Math.round(value * 10000) / 10000;

/**
 * Convert whatever the user typed into rise per 12 units of run.
 * @param {number} value
 * @param {"ratio"|"degrees"|"percent"} mode
 * @returns {number} rise per 12 run, or NaN if the input cannot be used.
 */
export function toRiseIn12(value, mode) {
  if (!isNum(value) || value < 0) return NaN;
  if (mode === "degrees") {
    if (value >= 90) return NaN;
    return Math.tan(value / DEGREES_PER_RADIAN) * STANDARD_RUN;
  }
  if (mode === "percent") {
    return (value / 100) * STANDARD_RUN;
  }
  return value;
}

/** slope factor = sqrt(144 + rise^2) / 12 */
export function slopeFactor(riseIn12) {
  if (!isNum(riseIn12) || riseIn12 < 0) return NaN;
  return Math.sqrt(STANDARD_RUN * STANDARD_RUN + riseIn12 * riseIn12) / STANDARD_RUN;
}

/** hip and valley factor = sqrt(2 x 144 + rise^2) / 12 */
export function hipValleyFactor(riseIn12) {
  if (!isNum(riseIn12) || riseIn12 < 0) return NaN;
  return (
    Math.sqrt(2 * STANDARD_RUN * STANDARD_RUN + riseIn12 * riseIn12) / STANDARD_RUN
  );
}

/**
 * @param {object} input
 * @param {number} input.buildingLengthFt   Longer footprint side, feet.
 * @param {number} input.buildingWidthFt    Shorter footprint side, feet.
 * @param {number} [input.overhangFt]       Eaves/rake overhang on every side.
 * @param {number} input.pitchValue         Pitch, in the unit given by pitchMode.
 * @param {"ratio"|"degrees"|"percent"} [input.pitchMode]
 * @param {string} [input.roofType]         One of ROOF_TYPES ids.
 * @param {number} [input.coverageSqft]     Area one sheet/tile/bundle covers.
 * @param {number} [input.wastagePercent]
 * @param {number} [input.pricePerUnit]     Cost of one sheet/tile/bundle.
 * @returns {object} Take-off, or { error } for invalid input.
 */
export function calculateRoofArea({
  buildingLengthFt,
  buildingWidthFt,
  overhangFt = 0,
  pitchValue,
  pitchMode = "ratio",
  roofType = "gable",
  coverageSqft = 27,
  wastagePercent = 10,
  pricePerUnit = 0,
} = {}) {
  const isFlat = roofType === "flat";
  const raw = {
    buildingLengthFt,
    buildingWidthFt,
    overhangFt,
    // A flat roof forces riseIn12 to 0 below regardless of pitchValue, so an empty/invalid
    // pitch field must not block an otherwise-valid flat-roof calculation.
    ...(isFlat ? {} : { pitchValue }),
    coverageSqft,
    wastagePercent,
    pricePerUnit,
  };
  if (Object.values(raw).some((value) => !isNum(value))) {
    return { error: "Enter a valid number in every field." };
  }
  if (buildingLengthFt <= 0 || buildingWidthFt <= 0) {
    return { error: "Building length and width must be greater than zero." };
  }
  if (buildingLengthFt > MAX_SIDE_FT || buildingWidthFt > MAX_SIDE_FT) {
    return { error: `Sides longer than ${MAX_SIDE_FT} ft are outside the range of this tool.` };
  }
  if (overhangFt < 0) return { error: "Overhang cannot be negative." };
  if (overhangFt > MAX_OVERHANG_FT) {
    return { error: `An overhang above ${MAX_OVERHANG_FT} ft is not a normal eaves projection.` };
  }
  if (coverageSqft <= 0) return { error: "Coverage of one sheet must be greater than zero." };
  if (wastagePercent < 0) return { error: "Wastage cannot be negative." };
  if (wastagePercent > MAX_WASTAGE_PERCENT) {
    return { error: `Wastage above ${MAX_WASTAGE_PERCENT}% suggests a measurement error.` };
  }
  if (pricePerUnit < 0) return { error: "Price cannot be negative." };

  const riseIn12 = isFlat ? 0 : toRiseIn12(pitchValue, pitchMode);
  if (!isNum(riseIn12)) {
    return { error: "Pitch is not usable — a roof cannot be at or beyond 90 degrees." };
  }
  if (riseIn12 > MAX_RISE_IN_12) {
    return { error: `A pitch steeper than ${MAX_RISE_IN_12} in 12 is a wall, not a roof.` };
  }

  const type = ROOF_TYPES.find((item) => item.id === roofType) ?? ROOF_TYPES[0];

  // The roof covers the footprint plus the overhang on every side.
  const planLengthFt = buildingLengthFt + 2 * overhangFt;
  const planWidthFt = buildingWidthFt + 2 * overhangFt;
  const footprintSqft = buildingLengthFt * buildingWidthFt;
  const planAreaSqft = planLengthFt * planWidthFt;

  const sf = slopeFactor(riseIn12);
  const hvf = hipValleyFactor(riseIn12);
  const pitchAngleDeg = Math.atan(riseIn12 / STANDARD_RUN) * DEGREES_PER_RADIAN;
  const pitchPercent = (riseIn12 / STANDARD_RUN) * 100;

  const roofAreaSqft = planAreaSqft * sf;

  // Common rafter run is half the span for gable and hip; the whole span for a
  // shed roof, which slopes one way only.
  const spanFt = Math.min(planLengthFt, planWidthFt);
  const commonRunFt = roofType === "shed" ? spanFt : spanFt / 2;
  const commonRafterFt = commonRunFt * sf;
  const rafterRiseFt = commonRunFt * (riseIn12 / STANDARD_RUN);

  const longerFt = Math.max(planLengthFt, planWidthFt);
  // A hip roof at equal pitch all round has a ridge shortened by the span.
  const ridgeLengthFt =
    roofType === "hip" ? Math.max(0, longerFt - spanFt) : roofType === "gable" ? longerFt : 0;
  // Each of the four hip rafters runs the half-span diagonally.
  const hipRafterFt = roofType === "hip" ? (spanFt / 2) * hvf : 0;

  const gutterLengthFt =
    type.gutterSides === 4
      ? 2 * (planLengthFt + planWidthFt)
      : type.gutterSides === 2
        ? 2 * longerFt
        : longerFt;

  const areaWithWastageSqft = roofAreaSqft * (1 + wastagePercent / 100);
  const unitsRequired = Math.ceil(areaWithWastageSqft / coverageSqft);
  const materialCost = unitsRequired * pricePerUnit;

  return {
    roofTypeLabel: type.label,
    riseIn12: round2(riseIn12),
    pitchAngleDeg: round2(pitchAngleDeg),
    pitchPercent: round2(pitchPercent),
    slopeFactor: round4(sf),
    hipValleyFactor: round4(hvf),

    footprintSqft: round2(footprintSqft),
    planLengthFt: round2(planLengthFt),
    planWidthFt: round2(planWidthFt),
    planAreaSqft: round2(planAreaSqft),
    roofAreaSqft: round2(roofAreaSqft),
    roofAreaSqm: round2(roofAreaSqft / SQFT_PER_SQM),
    extraOverFootprintSqft: round2(roofAreaSqft - footprintSqft),

    commonRunFt: round2(commonRunFt),
    commonRafterFt: round2(commonRafterFt),
    rafterRiseFt: round2(rafterRiseFt),
    ridgeLengthFt: round2(ridgeLengthFt),
    hipRafterFt: round2(hipRafterFt),
    gutterLengthFt: round2(gutterLengthFt),

    areaWithWastageSqft: round2(areaWithWastageSqft),
    unitsRequired,
    coveragePerUnitSqft: round2(coverageSqft),
    materialCost: Math.round(materialCost),
  };
}
