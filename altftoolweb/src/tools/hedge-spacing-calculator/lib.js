/**
 * Hedge spacing / plant count estimator.
 *
 * Rule implemented: a row of evenly spaced plants spanning a run of length L at
 * spacing s has n = round(L / s) gaps and n + 1 plants, so the spacing actually
 * used on site is L / n. A staggered double row doubles the plant count and
 * offsets the second row by half a spacing.
 */

export const CM_PER_INCH = 2.54;
export const M_PER_FT = 0.3048;
export const LITRES_PER_M3 = 1000;

/**
 * Nursery planting distances for common hedging species, in centimetres, with
 * the height they are normally kept at. Closer spacing thickens the hedge
 * faster; wider spacing costs less and suits species that spread.
 */
export const HEDGE_SPECIES = [
  { id: "box", label: "Box (Buxus sempervirens)", minCm: 20, maxCm: 25, keptHeightM: "0.3–1.2" },
  { id: "mehendi", label: "Mehendi / henna (Lawsonia inermis)", minCm: 20, maxCm: 30, keptHeightM: "0.6–1.5" },
  { id: "duranta", label: "Duranta golden dewdrop", minCm: 30, maxCm: 45, keptHeightM: "0.6–1.8" },
  { id: "privet", label: "Privet (Ligustrum ovalifolium)", minCm: 30, maxCm: 45, keptHeightM: "1.0–3.0" },
  { id: "beech", label: "Beech (Fagus sylvatica)", minCm: 30, maxCm: 45, keptHeightM: "1.2–4.0" },
  { id: "hornbeam", label: "Hornbeam (Carpinus betulus)", minCm: 30, maxCm: 45, keptHeightM: "1.2–4.0" },
  { id: "hawthorn", label: "Hawthorn (Crataegus monogyna)", minCm: 25, maxCm: 33, keptHeightM: "1.2–3.0" },
  { id: "yew", label: "Yew (Taxus baccata)", minCm: 45, maxCm: 60, keptHeightM: "1.0–5.0" },
  { id: "laurel", label: "Cherry laurel (Prunus laurocerasus)", minCm: 60, maxCm: 90, keptHeightM: "1.5–4.0" },
  { id: "thuja", label: "Thuja / arborvitae", minCm: 60, maxCm: 75, keptHeightM: "2.0–5.0" },
  { id: "leylandii", label: "Leylandii", minCm: 60, maxCm: 90, keptHeightM: "2.0–6.0" },
  { id: "bougainvillea", label: "Bougainvillea screen", minCm: 90, maxCm: 120, keptHeightM: "1.5–3.0" },
];

/** Offset between the two lines of a staggered double row. */
export const DEFAULT_ROW_GAP_CM = 40;

/** Nurseries advise ordering a few spares against transplant losses. */
export const DEFAULT_SPARE_PCT = 5;

/** Compost worked into each planting hole or trench, litres per plant. */
export const COMPOST_LITRES_PER_PLANT = 5;

/** Mulch strip laid along the row after planting. */
export const MULCH_STRIP_WIDTH_M = 0.6;
export const MULCH_DEPTH_M = 0.075;

export const MAX_LENGTH_M = 5000;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * @returns {{error:string}|object}
 */
export function computeHedge({
  length = 10,
  unit = "metric",
  spacing = 33,
  rows = 1,
  rowGap = DEFAULT_ROW_GAP_CM,
  pricePerPlant = 0,
  sparePct = DEFAULT_SPARE_PCT,
} = {}) {
  if (unit !== "metric" && unit !== "imperial") {
    return { error: "Choose either metric (metres and cm) or imperial (feet and inches)." };
  }
  if (rows !== 1 && rows !== 2) {
    return { error: "A hedge is planted as either a single row or a staggered double row." };
  }
  if (![length, spacing, rowGap, pricePerPlant, sparePct].every(isNum)) {
    return { error: "Enter a valid number in every field." };
  }
  if (!(length > 0)) return { error: "Hedge length must be greater than zero." };
  if (!(spacing > 0)) return { error: "Plant spacing must be greater than zero." };
  if (rows === 2 && !(rowGap > 0)) return { error: "Row gap must be greater than zero for a double row." };
  if (pricePerPlant < 0) return { error: "Price per plant cannot be negative." };
  if (sparePct < 0 || sparePct > 100) return { error: "Spares should be between 0% and 100%." };

  const isMetric = unit === "metric";
  const lengthM = isMetric ? length : length * M_PER_FT;
  const spacingM = isMetric ? spacing / 100 : (spacing * CM_PER_INCH) / 100;
  const rowGapM = isMetric ? rowGap / 100 : (rowGap * CM_PER_INCH) / 100;

  if (lengthM > MAX_LENGTH_M) {
    return { error: `A run over ${MAX_LENGTH_M.toLocaleString("en-US")} m is a field boundary, not a garden hedge.` };
  }
  if (spacingM > 5) return { error: "Spacing wider than 5 m makes a line of trees, not a hedge." };

  const spacingExceedsLength = spacingM > lengthM;
  const gaps = Math.max(1, Math.round(lengthM / spacingM));
  const plantsPerRow = gaps + 1;
  const actualSpacingM = lengthM / gaps;

  const totalPlants = plantsPerRow * rows;
  const plantsWithSpares = Math.ceil(totalPlants * (1 + sparePct / 100));
  const plantsPerMetre = lengthM > 0 ? totalPlants / lengthM : 0;

  const cost = plantsWithSpares * pricePerPlant;
  const compostLitres = plantsWithSpares * COMPOST_LITRES_PER_PLANT;

  const bedWidthM = rows === 2 ? rowGapM + MULCH_STRIP_WIDTH_M : MULCH_STRIP_WIDTH_M;
  const mulchM3 = lengthM * bedWidthM * MULCH_DEPTH_M;

  const toLength = (metres) => (isMetric ? metres : metres / M_PER_FT);
  const toSmall = (metres) => (isMetric ? metres * 100 : (metres * 100) / CM_PER_INCH);

  return {
    unit,
    lengthUnit: isMetric ? "m" : "ft",
    smallUnit: isMetric ? "cm" : "in",
    length: toLength(lengthM),
    rows,
    gaps,
    plantsPerRow,
    totalPlants,
    plantsWithSpares,
    spares: plantsWithSpares - totalPlants,
    requestedSpacing: toSmall(spacingM),
    actualSpacing: toSmall(actualSpacingM),
    plantsPerMetre,
    plantsPerLengthUnit: isMetric ? plantsPerMetre : plantsPerMetre * M_PER_FT,
    cost,
    compostLitres,
    bedWidth: toLength(bedWidthM),
    mulchM3,
    mulchLitres: mulchM3 * LITRES_PER_M3,
    spacingExceedsLength,
  };
}
