/**
 * Whole-home LED retrofit savings.
 *
 * Energy
 *   kWh/year = watts / 1000 x hours per day x 365 x number of bulbs
 *   Cost     = kWh x tariff
 *
 * Equivalent brightness
 *   Light output is measured in lumens, and luminous efficacy is lumens per
 *   watt. To keep the room equally bright, the replacement wattage is
 *     new_W = old_W x old_efficacy / new_efficacy
 *   which is why a 60 W incandescent (about 14 lm/W, roughly 800 lm) is
 *   matched by a 100 lm/W LED of a little over 8 W.
 *
 * Replacement bulbs
 *   Bulbs consumed over a horizon = burn hours / rated life, prorated rather
 *   than rounded up, so a five-year total is not distorted by part-used bulbs.
 *
 * Payback
 *   Simple payback = up-front cost of the LEDs / annual electricity saving.
 *   No discounting or tariff escalation is applied.
 */

export const DAYS_PER_YEAR = 365;

/** CEA CO2 Baseline Database for the Indian grid, combined margin ~0.71 kg/kWh. */
export const GRID_CO2_KG_PER_KWH = 0.71;

/**
 * Typical luminous efficacy (lumens per watt) and rated life (hours) for each
 * lamp technology. Efficacy figures are the usual retail-product ranges;
 * rated lives are the conventional published values (1000 h incandescent,
 * 2000 h halogen, 8000 h CFL, 25000 h LED).
 */
export const LAMP_TYPES = [
  { id: "incandescent", label: "Incandescent (GLS)", efficacy: 14, ratedLifeHours: 1000, typicalWatts: 60 },
  { id: "halogen", label: "Halogen", efficacy: 20, ratedLifeHours: 2000, typicalWatts: 42 },
  { id: "cfl", label: "CFL / compact fluorescent", efficacy: 60, ratedLifeHours: 8000, typicalWatts: 14 },
  { id: "led", label: "LED", efficacy: 100, ratedLifeHours: 25000, typicalWatts: 9 },
];

/** Efficacy assumed for the replacement LED, lumens per watt. */
export const LED_EFFICACY_LM_PER_W = 100;
/** Rated life assumed for the replacement LED, hours. */
export const LED_RATED_LIFE_HOURS = 25000;

const num = (value) => {
  if (value === "" || value === null || value === undefined) return Number.NaN;
  const n = Number(value);
  return Number.isFinite(n) ? n : Number.NaN;
};

/** Lumen output of a lamp: watts x luminous efficacy. */
export function lumensFor(watts, efficacy) {
  if (!(watts > 0) || !(efficacy > 0)) return 0;
  return watts * efficacy;
}

/** LED wattage that matches an existing lamp's light output. */
export function equivalentLedWatts(currentWatts, currentEfficacy, ledEfficacy = LED_EFFICACY_LM_PER_W) {
  if (!(currentWatts > 0) || !(currentEfficacy > 0) || !(ledEfficacy > 0)) return null;
  return (currentWatts * currentEfficacy) / ledEfficacy;
}

/**
 * @param {object} input
 * @param {string} input.currentTypeId  LAMP_TYPES id of what is fitted now.
 * @param {number} input.currentWatts   Wattage of each existing bulb.
 * @param {number} input.ledWatts       Wattage of each replacement LED.
 * @param {number} input.bulbCount      Number of bulbs being swapped.
 * @param {number} input.hoursPerDay    Average burn hours per bulb per day.
 * @param {number} input.tariff         Electricity price per kWh.
 * @param {number} input.ledPrice       Price of one LED bulb.
 * @param {number} input.currentPrice   Price of one replacement bulb of the old type.
 * @param {number} input.horizonYears   Comparison horizon in years.
 * @param {number} [input.currentLifeHours] Override rated life of the old lamp.
 * @param {number} [input.ledLifeHours]     Override rated life of the LED.
 * @returns {object} result or { error }
 */
export function computeLedSavings({
  currentTypeId = "cfl",
  currentWatts,
  ledWatts,
  bulbCount,
  hoursPerDay,
  tariff,
  ledPrice,
  currentPrice,
  horizonYears,
  currentLifeHours = null,
  ledLifeHours = LED_RATED_LIFE_HOURS,
}) {
  const type = LAMP_TYPES.find((t) => t.id === currentTypeId);
  if (!type) return { error: "Choose what is fitted at the moment." };

  const oldW = num(currentWatts);
  const newW = num(ledWatts);
  const count = num(bulbCount);
  const hours = num(hoursPerDay);
  const rate = num(tariff);
  const ledCost = num(ledPrice);
  const oldCost = num(currentPrice);
  const years = num(horizonYears);
  const oldLife = currentLifeHours === null || currentLifeHours === "" ? type.ratedLifeHours : num(currentLifeHours);
  const newLife = num(ledLifeHours);

  const all = [oldW, newW, count, hours, rate, ledCost, oldCost, years, oldLife, newLife];
  if (all.some((v) => Number.isNaN(v))) return { error: "Enter a number in every field." };
  if (oldW <= 0 || newW <= 0) return { error: "Bulb wattage must be greater than zero." };
  if (oldW > 1000 || newW > 1000) return { error: "A household bulb above 1000 W is out of range." };
  if (!Number.isInteger(count) || count < 1 || count > 500) {
    return { error: "Number of bulbs must be a whole number between 1 and 500." };
  }
  if (hours <= 0 || hours > 24) return { error: "Burn hours must be between 0 and 24 per day." };
  if (rate <= 0) return { error: "Electricity tariff must be greater than zero." };
  if (ledCost < 0 || oldCost < 0) return { error: "Bulb prices cannot be negative." };
  if (years <= 0 || years > 30) return { error: "Comparison horizon should be between 1 and 30 years." };
  if (!(oldLife > 0) || !(newLife > 0)) return { error: "Rated life must be greater than zero hours." };

  const hoursPerYear = hours * DAYS_PER_YEAR;
  const burnHoursOverHorizon = hoursPerYear * years;

  const currentKwhPerYear = ((oldW * hoursPerYear) / 1000) * count;
  const ledKwhPerYear = ((newW * hoursPerYear) / 1000) * count;
  const kwhSavedPerYear = currentKwhPerYear - ledKwhPerYear;

  const currentEnergyCostPerYear = currentKwhPerYear * rate;
  const ledEnergyCostPerYear = ledKwhPerYear * rate;
  const energySavingPerYear = currentEnergyCostPerYear - ledEnergyCostPerYear;

  const currentBulbsOverHorizon = (burnHoursOverHorizon / oldLife) * count;
  const ledBulbsOverHorizon = (burnHoursOverHorizon / newLife) * count;
  const currentBulbCostOverHorizon = currentBulbsOverHorizon * oldCost;
  const ledBulbCostOverHorizon = ledBulbsOverHorizon * ledCost;

  const currentTotalOverHorizon = currentEnergyCostPerYear * years + currentBulbCostOverHorizon;
  const ledTotalOverHorizon = ledEnergyCostPerYear * years + ledBulbCostOverHorizon;

  const upfrontCost = ledCost * count;
  const paybackYears = energySavingPerYear > 0 ? upfrontCost / energySavingPerYear : null;

  return {
    type,
    hoursPerYear,
    currentLumensPerBulb: lumensFor(oldW, type.efficacy),
    ledLumensPerBulb: lumensFor(newW, LED_EFFICACY_LM_PER_W),
    suggestedLedWatts: equivalentLedWatts(oldW, type.efficacy),
    currentKwhPerYear,
    ledKwhPerYear,
    kwhSavedPerYear,
    currentEnergyCostPerMonth: currentEnergyCostPerYear / 12,
    ledEnergyCostPerMonth: ledEnergyCostPerYear / 12,
    currentEnergyCostPerYear,
    ledEnergyCostPerYear,
    energySavingPerMonth: energySavingPerYear / 12,
    energySavingPerYear,
    energySavingSharePct:
      currentEnergyCostPerYear > 0 ? (energySavingPerYear / currentEnergyCostPerYear) * 100 : 0,
    currentBulbsOverHorizon,
    ledBulbsOverHorizon,
    currentBulbCostOverHorizon,
    ledBulbCostOverHorizon,
    currentTotalOverHorizon,
    ledTotalOverHorizon,
    totalSavingOverHorizon: currentTotalOverHorizon - ledTotalOverHorizon,
    upfrontCost,
    paybackYears,
    paybackMonths: paybackYears === null ? null : paybackYears * 12,
    co2SavedKgPerYear: kwhSavedPerYear * GRID_CO2_KG_PER_KWH,
  };
}
