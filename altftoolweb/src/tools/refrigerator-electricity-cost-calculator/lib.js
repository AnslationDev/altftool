/**
 * Refrigerator running cost.
 *
 * Every BEE-labelled refrigerator prints an annual energy consumption in kWh per year,
 * measured under a standard laboratory test. That number multiplied by your tariff is
 * the running cost, so the label figure is always the preferred input.
 *
 * When the label is not to hand, the estimate mode reconstructs it from gross volume
 * and star rating. Specific consumption per litre is calibrated against published label
 * values for 3-star models, and each extra star is taken as roughly a 20% reduction,
 * which is the approximate spacing of BEE's star bands. Treat that path as an estimate,
 * not a specification.
 *
 * A laboratory figure is measured at a controlled ambient temperature. A real Indian
 * kitchen in May is warmer than the test, and the compressor runs longer for it, so the
 * result is adjusted by a per-degree sensitivity you can edit.
 */

/** Ambient temperature the BEE / IS test is run at for tropical-climate appliances. */
export const TEST_AMBIENT_C = 32;

/**
 * How much annual consumption rises per degree of average ambient above the test
 * condition. Field and laboratory studies put this in the 2–6% range depending on the
 * cabinet and its insulation; 4% is the mid-point default and is editable.
 */
export const DEFAULT_AMBIENT_SENSITIVITY_PERCENT_PER_C = 4;

/** Guard rails on the ambient correction so an extreme entry cannot distort the result. */
export const MIN_AMBIENT_FACTOR = 0.5;
export const MAX_AMBIENT_FACTOR = 2;

/**
 * Specific consumption in kWh per litre per year for a 3-star reference model,
 * calibrated against published BEE label figures (a 250 L 3-star frost-free is
 * labelled near 260 kWh/year; a 190 L 3-star direct-cool near 155 kWh/year).
 */
export const FRIDGE_TYPES = [
  { value: "frost-free", label: "Frost free (double / multi door)", kwhPerLitrePerYear: 1.05 },
  { value: "direct-cool", label: "Direct cool (single door)", kwhPerLitrePerYear: 0.8 },
];

/** BEE star bands are spaced roughly 20% apart in rated annual consumption. */
export const STAR_STEP_FACTOR = 0.8;
export const REFERENCE_STARS = 3;

/** Door-opening and loading allowances. These are usage allowances, not label values. */
export const USAGE_PATTERNS = [
  { value: "light", label: "Light — opened a few times a day, lightly stocked", factor: 0.95 },
  { value: "normal", label: "Normal — ordinary family use", factor: 1 },
  { value: "heavy", label: "Heavy — opened constantly, packed full, hot food put in", factor: 1.1 },
];

/**
 * CO2 intensity of the Indian grid. CEA's CO2 Baseline Database puts the weighted
 * average close to 0.71–0.73 kg CO2 per kWh; 0.716 is used here.
 */
export const GRID_CO2_KG_PER_KWH = 0.716;

export const DAYS_PER_YEAR = 365;

/** Rated annual consumption for a given type, volume and star rating. */
export function estimateLabelKwh({ typeValue, litres, stars }) {
  const type = FRIDGE_TYPES.find((item) => item.value === typeValue);
  if (!type) return NaN;
  return litres * type.kwhPerLitrePerYear * Math.pow(STAR_STEP_FACTOR, stars - REFERENCE_STARS);
}

/**
 * @returns {{error:string}|object} yearly, monthly and daily fridge running cost
 */
export function computeFridgeCost({
  mode = "label",
  labelKwhPerYear = 250,
  fridgeType = "frost-free",
  litres = 250,
  stars = 3,
  averageAmbientC = TEST_AMBIENT_C,
  ambientSensitivityPercentPerC = DEFAULT_AMBIENT_SENSITIVITY_PERCENT_PER_C,
  usagePattern = "normal",
  tariffPerKwh,
}) {
  const numbers = [
    labelKwhPerYear,
    litres,
    stars,
    averageAmbientC,
    ambientSensitivityPercentPerC,
    tariffPerKwh,
  ];
  if (numbers.some((v) => typeof v !== "number" || !Number.isFinite(v))) {
    return { error: "Enter a valid number in every field." };
  }
  if (mode !== "label" && mode !== "estimate") {
    return { error: "Choose either the label figure or the estimate method." };
  }

  const usage = USAGE_PATTERNS.find((item) => item.value === usagePattern);
  if (!usage) return { error: "Choose a usage pattern from the list." };

  if (tariffPerKwh < 0 || tariffPerKwh > 100) {
    return { error: "Enter the tariff in rupees per unit (0 to 100)." };
  }
  if (averageAmbientC < 15 || averageAmbientC > 50) {
    return { error: "Average kitchen temperature must be between 15 °C and 50 °C." };
  }
  if (ambientSensitivityPercentPerC < 0 || ambientSensitivityPercentPerC > 15) {
    return { error: "Ambient sensitivity should be between 0% and 15% per °C." };
  }

  let ratedKwhPerYear;
  if (mode === "label") {
    if (labelKwhPerYear <= 0) {
      return { error: "Annual energy consumption must be greater than zero." };
    }
    if (labelKwhPerYear > 5000) {
      return { error: "Annual energy consumption must be 5,000 kWh or less." };
    }
    ratedKwhPerYear = labelKwhPerYear;
  } else {
    const type = FRIDGE_TYPES.find((item) => item.value === fridgeType);
    if (!type) return { error: "Choose a refrigerator type from the list." };
    if (litres <= 0 || litres > 1000) {
      return { error: "Capacity must be between 1 and 1,000 litres." };
    }
    if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
      return { error: "Star rating must be a whole number from 1 to 5." };
    }
    ratedKwhPerYear = estimateLabelKwh({ typeValue: fridgeType, litres, stars });
  }

  const rawAmbientFactor =
    1 + (ambientSensitivityPercentPerC / 100) * (averageAmbientC - TEST_AMBIENT_C);
  const ambientFactor = Math.min(MAX_AMBIENT_FACTOR, Math.max(MIN_AMBIENT_FACTOR, rawAmbientFactor));

  const actualKwhPerYear = ratedKwhPerYear * ambientFactor * usage.factor;
  const kwhPerDay = actualKwhPerYear / DAYS_PER_YEAR;
  const kwhPerMonth = actualKwhPerYear / 12;

  // What the same size and type would use as a 5-star model, for an upgrade comparison.
  const fiveStarRatedKwh =
    mode === "estimate"
      ? estimateLabelKwh({ typeValue: fridgeType, litres, stars: 5 })
      : ratedKwhPerYear * Math.pow(STAR_STEP_FACTOR, 5 - REFERENCE_STARS);
  const fiveStarActualKwh = fiveStarRatedKwh * ambientFactor * usage.factor;

  return {
    ratedKwhPerYear,
    ambientFactor,
    ambientFactorClamped: rawAmbientFactor !== ambientFactor,
    usageFactor: usage.factor,
    actualKwhPerYear,
    kwhPerMonth,
    kwhPerDay,
    costPerYear: actualKwhPerYear * tariffPerKwh,
    costPerMonth: kwhPerMonth * tariffPerKwh,
    costPerDay: kwhPerDay * tariffPerKwh,
    averageWatts: (actualKwhPerYear * 1000) / (DAYS_PER_YEAR * 24),
    co2KgPerYear: actualKwhPerYear * GRID_CO2_KG_PER_KWH,
    fiveStarKwhPerYear: fiveStarActualKwh,
    fiveStarCostPerYear: fiveStarActualKwh * tariffPerKwh,
    upgradeSavingPerYear: Math.max(0, (actualKwhPerYear - fiveStarActualKwh) * tariffPerKwh),
    isEstimate: mode === "estimate",
  };
}
