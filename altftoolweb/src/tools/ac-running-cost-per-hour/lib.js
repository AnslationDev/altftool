/**
 * Air conditioner running cost.
 *
 * The label on an Indian split AC states its cooling capacity and its ISEER.
 * ISEER (Indian Seasonal Energy Efficiency Ratio) is defined by BEE as the total
 * annual cooling output in watt-hours divided by the total annual electricity input
 * in watt-hours, so:
 *
 *     average electrical input (W) = cooling capacity (W) / ISEER
 *
 * Multiply by the hours the machine runs and by the tariff to get money. ISEER is a
 * seasonal average across the BEE bin-temperature profile, so it gives a season-average
 * cost rather than the draw on the hottest afternoon — the load factor input scales
 * for that.
 */

/** 1 ton of refrigeration = 12,000 BTU/h = 3516.85 W of cooling. */
export const WATTS_PER_TON_REFRIGERATION = 3516.85;

/**
 * BEE star bands for split (inverter) room air conditioners, as the minimum ISEER
 * for each star level. Each entry is the lower edge of the band, so a machine
 * carrying the star is at least this efficient.
 */
export const STAR_BANDS = [
  { stars: 1, minIseer: 3.3 },
  { stars: 2, minIseer: 3.5 },
  { stars: 3, minIseer: 3.8 },
  { stars: 4, minIseer: 4.4 },
  { stars: 5, minIseer: 4.9 },
];

/** Common Indian split AC capacities, in tons of refrigeration. */
export const TONNAGES = [0.75, 1, 1.2, 1.5, 1.8, 2, 2.5, 3];

/**
 * CO2 intensity of the Indian grid. CEA's CO2 Baseline Database puts the weighted
 * average operating margin close to 0.71–0.73 kg CO2 per kWh; 0.716 is used here.
 */
export const GRID_CO2_KG_PER_KWH = 0.716;

const MAX_ISEER = 12; // no room AC on sale comes near this
const MAX_TONS = 10;

export function starsForIseer(iseer) {
  let stars = 0;
  for (const band of STAR_BANDS) {
    if (iseer >= band.minIseer) stars = band.stars;
  }
  return stars;
}

/**
 * @returns {{error:string}|object} energy and money for one AC
 */
export function computeAcRunningCost({
  mode = "tonnage",
  tons = 1.5,
  iseer = 3.8,
  ratedPowerW = 1500,
  loadFactorPercent = 100,
  tariffPerKwh,
  hoursPerDay,
  daysPerMonth = 30,
}) {
  const numbers = [tons, iseer, ratedPowerW, loadFactorPercent, tariffPerKwh, hoursPerDay, daysPerMonth];
  if (numbers.some((v) => typeof v !== "number" || !Number.isFinite(v))) {
    return { error: "Enter a valid number in every field." };
  }
  if (mode !== "tonnage" && mode !== "power") {
    return { error: "Choose either the tonnage or the rated-power method." };
  }
  if (loadFactorPercent < 10 || loadFactorPercent > 130) {
    return { error: "Load factor should be between 10% and 130%." };
  }
  if (tariffPerKwh < 0) return { error: "Tariff cannot be negative." };
  if (tariffPerKwh > 100) return { error: "Tariff looks too high — enter rupees per unit, not paise." };
  if (hoursPerDay <= 0 || hoursPerDay > 24) {
    return { error: "Hours per day must be more than 0 and at most 24." };
  }
  if (daysPerMonth <= 0 || daysPerMonth > 31) {
    return { error: "Days per month must be between 1 and 31." };
  }

  let ratedInputW;
  let coolingW = null;
  if (mode === "tonnage") {
    if (tons <= 0) return { error: "Cooling capacity must be greater than zero tons." };
    if (tons > MAX_TONS) return { error: `Cooling capacity must be ${MAX_TONS} tons or less.` };
    if (iseer <= 0) return { error: "ISEER must be greater than zero." };
    if (iseer > MAX_ISEER) return { error: `ISEER must be ${MAX_ISEER} or less.` };
    coolingW = tons * WATTS_PER_TON_REFRIGERATION;
    ratedInputW = coolingW / iseer;
  } else {
    if (ratedPowerW <= 0) return { error: "Rated power must be greater than zero watts." };
    if (ratedPowerW > 20000) return { error: "Rated power must be 20,000 W or less." };
    ratedInputW = ratedPowerW;
  }

  const effectiveInputW = ratedInputW * (loadFactorPercent / 100);
  const kwhPerHour = effectiveInputW / 1000;
  const costPerHour = kwhPerHour * tariffPerKwh;

  const kwhPerDay = kwhPerHour * hoursPerDay;
  const kwhPerMonth = kwhPerDay * daysPerMonth;

  return {
    coolingW,
    ratedInputW,
    effectiveInputW,
    kwhPerHour,
    costPerHour,
    kwhPerDay,
    costPerDay: kwhPerDay * tariffPerKwh,
    kwhPerMonth,
    costPerMonth: kwhPerMonth * tariffPerKwh,
    co2KgPerMonth: kwhPerMonth * GRID_CO2_KG_PER_KWH,
    starsEquivalent: mode === "tonnage" ? starsForIseer(iseer) : null,
    minutesPerRupee: costPerHour > 0 ? 60 / costPerHour : null,
  };
}
