/**
 * Roof rainwater harvesting estimator.
 *
 * The whole calculation rests on one identity: 1 mm of rain falling on 1 square
 * metre is exactly 1 litre. So
 *
 *   harvest (litres) = plan roof area (m^2) x rainfall (mm) x runoff coefficient
 *
 * Two details decide whether the answer is right.
 *
 * 1. PLAN area, not sloped area. Rain falls vertically, so a pitched roof
 *    catches only what its horizontal shadow covers. Using the sloped surface
 *    over-states the yield by the slope factor.
 * 2. FIRST FLUSH. The opening millimetre or two of every storm carries dust,
 *    leaves and bird droppings off the roof and is diverted to waste before the
 *    tank. Indian rainwater harvesting guidance commonly diverts about one
 *    litre per square metre of roof, which is one millimetre of rainfall.
 */

/** 1 mm of rain on 1 m^2 = 1 litre, by definition of the millimetre depth. */
export const LITRES_PER_MM_PER_SQM = 1;

/** 1 ft = 0.3048 m exactly, so 1 sqm = 10.7639 sqft. */
export const SQFT_PER_SQM = 1 / (0.3048 * 0.3048);

/**
 * Runoff coefficients — the share of rain landing on a surface that actually
 * reaches the downpipe after wetting, splashing and evaporation losses. Values
 * follow the ranges published in Central Ground Water Board rainwater
 * harvesting guidance for rooftop catchments.
 */
export const ROOF_SURFACES = [
  { id: "gi", label: "GI or colour-coated metal sheet", coefficient: 0.9 },
  { id: "rcc", label: "RCC terrace, plastered", coefficient: 0.85 },
  { id: "tile", label: "Clay or Mangalore tile", coefficient: 0.75 },
  { id: "asbestos", label: "Fibre-cement / asbestos sheet", coefficient: 0.8 },
  { id: "gravel", label: "Gravel-covered or green roof", coefficient: 0.6 },
  { id: "paved", label: "Paved courtyard or driveway", coefficient: 0.6 },
];

/**
 * First-flush diversion depths in millimetres of rainfall. Published guidance
 * ranges from about 0.2 mm (20 litres per 100 sqm) for a clean metal roof up to
 * 2 mm for a dusty terrace at the start of the season.
 */
export const FIRST_FLUSH_PRESETS = [
  { id: "none", label: "No diverter fitted", mm: 0 },
  { id: "light", label: "Light — clean metal roof", mm: 0.5 },
  { id: "standard", label: "Standard — 1 litre per sqm", mm: 1 },
  { id: "heavy", label: "Heavy — dusty terrace, first rains", mm: 2 },
];

export const MAX_AREA_SQM = 100_000;
export const MAX_RAINFALL_MM = 12_000;
export const MAX_RAINY_DAYS = 366;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const round1 = (value) => Math.round(value * 10) / 10;
const round2 = (value) => Math.round(value * 100) / 100;

/** Convert an area to square metres. Unit is "sqm" or "sqft". */
export function toSquareMetres(value, unit) {
  if (!isNum(value)) return NaN;
  return unit === "sqft" ? value / SQFT_PER_SQM : value;
}

/**
 * Litres harvested from one rainfall event.
 * @returns {number} Litres, never below zero, or NaN for unusable input.
 */
export function harvestLitres(areaSqm, effectiveRainfallMm, coefficient) {
  if (!isNum(areaSqm) || !isNum(effectiveRainfallMm) || !isNum(coefficient)) return NaN;
  if (areaSqm <= 0 || coefficient <= 0) return NaN;
  return Math.max(0, areaSqm * effectiveRainfallMm * coefficient * LITRES_PER_MM_PER_SQM);
}

/**
 * @param {object} input
 * @param {number} input.roofArea            Plan (horizontal) roof area.
 * @param {"sqm"|"sqft"} [input.areaUnit]
 * @param {string} [input.surfaceId]         One of ROOF_SURFACES ids.
 * @param {number} [input.coefficientOverride] Use instead of the preset, 0-1.
 * @param {number} input.eventRainfallMm     Rain in one storm.
 * @param {number} input.annualRainfallMm    Rain across the year.
 * @param {number} input.rainyDays           Days per year with measurable rain.
 * @param {number} [input.firstFlushMm]      Depth diverted at the start of each event.
 * @param {number} [input.tankLitres]        Storage you have or plan.
 * @param {number} [input.dailyDemandLitres] Household use the tank must cover.
 * @param {number} [input.costPer1000Litres] Tanker or municipal rate.
 * @returns {object} Yield figures, or { error } for invalid input.
 */
export function estimateRoofHarvest({
  roofArea,
  areaUnit = "sqft",
  surfaceId = "rcc",
  coefficientOverride,
  eventRainfallMm,
  annualRainfallMm,
  rainyDays,
  firstFlushMm = 1,
  tankLitres = 0,
  dailyDemandLitres = 0,
  costPer1000Litres = 0,
} = {}) {
  const raw = {
    roofArea,
    eventRainfallMm,
    annualRainfallMm,
    rainyDays,
    firstFlushMm,
    tankLitres,
    dailyDemandLitres,
    costPer1000Litres,
  };
  if (Object.values(raw).some((value) => !isNum(value))) {
    return { error: "Enter a valid number in every field." };
  }

  const surface = ROOF_SURFACES.find((item) => item.id === surfaceId) ?? ROOF_SURFACES[1];
  const coefficient = isNum(coefficientOverride) ? coefficientOverride : surface.coefficient;
  if (coefficient <= 0 || coefficient > 1) {
    return { error: "Runoff coefficient must be between 0 and 1." };
  }

  const areaSqm = toSquareMetres(roofArea, areaUnit);
  if (!isNum(areaSqm) || areaSqm <= 0) return { error: "Roof area must be greater than zero." };
  if (areaSqm > MAX_AREA_SQM) {
    return { error: "A catchment that large needs a hydrologist, not a quick estimate." };
  }
  if (eventRainfallMm <= 0) return { error: "Rainfall in the event must be greater than zero." };
  if (eventRainfallMm > MAX_RAINFALL_MM || annualRainfallMm > MAX_RAINFALL_MM) {
    return { error: `Rainfall above ${MAX_RAINFALL_MM} mm is outside the range of this tool.` };
  }
  if (annualRainfallMm <= 0) return { error: "Annual rainfall must be greater than zero." };
  if (rainyDays < 1 || rainyDays > MAX_RAINY_DAYS) {
    return { error: "Rainy days per year must be between 1 and 366." };
  }
  if (firstFlushMm < 0) return { error: "First-flush depth cannot be negative." };
  if (firstFlushMm >= eventRainfallMm) {
    return { error: "The first-flush diverter would swallow the whole storm — reduce it." };
  }
  if (tankLitres < 0) return { error: "Tank capacity cannot be negative." };
  if (dailyDemandLitres < 0) return { error: "Daily demand cannot be negative." };
  if (costPer1000Litres < 0) return { error: "Water cost cannot be negative." };

  const days = Math.floor(rainyDays);
  const firstFlushAnnualMm = firstFlushMm * days;
  if (firstFlushAnnualMm >= annualRainfallMm) {
    return {
      error: "First flush across the year exceeds the annual rainfall — check the rainy-day count.",
    };
  }

  const areaSqft = areaSqm * SQFT_PER_SQM;

  // Single storm.
  const eventEffectiveMm = eventRainfallMm - firstFlushMm;
  const eventLitres = harvestLitres(areaSqm, eventEffectiveMm, coefficient);
  const eventGrossLitres = harvestLitres(areaSqm, eventRainfallMm, coefficient);
  const firstFlushLitres = eventGrossLitres - eventLitres;

  // Whole year.
  const annualEffectiveMm = annualRainfallMm - firstFlushAnnualMm;
  const annualLitres = harvestLitres(areaSqm, annualEffectiveMm, coefficient);
  const annualGrossLitres = harvestLitres(areaSqm, annualRainfallMm, coefficient);
  const annualLostLitres = annualGrossLitres - annualLitres;
  const litresPerSqmYear = annualLitres / areaSqm;

  // Storage behaviour for the single storm.
  const overflowLitres = tankLitres > 0 ? Math.max(0, eventLitres - tankLitres) : 0;
  const capturedLitres = tankLitres > 0 ? Math.min(eventLitres, tankLitres) : eventLitres;
  const tankFillPercent = tankLitres > 0 ? Math.min(100, (eventLitres / tankLitres) * 100) : NaN;
  const daysOfSupply = dailyDemandLitres > 0 ? capturedLitres / dailyDemandLitres : NaN;
  const annualDaysCovered = dailyDemandLitres > 0 ? annualLitres / dailyDemandLitres : NaN;
  const annualDemandLitres = dailyDemandLitres * 365;
  const demandMetPercent =
    annualDemandLitres > 0 ? Math.min(100, (annualLitres / annualDemandLitres) * 100) : NaN;

  // Money.
  const annualSaving = (annualLitres / 1000) * costPer1000Litres;
  // Only the water that actually stays in the tank displaces bought water.
  const eventSaving = (capturedLitres / 1000) * costPer1000Litres;

  return {
    surfaceLabel: surface.label,
    coefficient: round2(coefficient),
    areaSqm: round2(areaSqm),
    areaSqft: round2(areaSqft),

    eventRainfallMm: round2(eventRainfallMm),
    firstFlushMm: round2(firstFlushMm),
    eventEffectiveMm: round2(eventEffectiveMm),
    eventLitres: Math.round(eventLitres),
    eventGrossLitres: Math.round(eventGrossLitres),
    firstFlushLitres: Math.round(firstFlushLitres),

    annualRainfallMm: round1(annualRainfallMm),
    rainyDays: days,
    annualEffectiveMm: round1(annualEffectiveMm),
    annualLitres: Math.round(annualLitres),
    annualGrossLitres: Math.round(annualGrossLitres),
    annualLostLitres: Math.round(annualLostLitres),
    annualKilolitres: round1(annualLitres / 1000),
    litresPerSqmYear: round1(litresPerSqmYear),

    tankLitres: Math.round(tankLitres),
    capturedLitres: Math.round(capturedLitres),
    overflowLitres: Math.round(overflowLitres),
    tankFillPercent: Number.isFinite(tankFillPercent) ? round1(tankFillPercent) : NaN,
    daysOfSupply: Number.isFinite(daysOfSupply) ? round1(daysOfSupply) : NaN,
    annualDaysCovered: Number.isFinite(annualDaysCovered) ? round1(annualDaysCovered) : NaN,
    demandMetPercent: Number.isFinite(demandMetPercent) ? round1(demandMetPercent) : NaN,

    eventSaving: Math.round(eventSaving),
    annualSaving: Math.round(annualSaving),
  };
}
