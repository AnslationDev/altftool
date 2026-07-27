/**
 * Ceiling fan running cost and BLDC upgrade payback.
 *
 * Running cost
 *   kWh/year = watts / 1000 x hours per day x days used per year x fan count
 *   Cost     = kWh x tariff
 *
 * Upgrade payback
 *   Simple payback (years) = net upgrade cost / annual saving.
 *   Net upgrade cost = (new fan price - what the old fan is worth) x fan count.
 *   No discounting is applied; this is the plain simple-payback figure used in
 *   appliance efficiency comparisons.
 *
 * Speed and power
 *   For a fan whose speed is controlled electronically (a BLDC fan, or any fan
 *   on a true variable-speed drive) the fan affinity laws apply: airflow is
 *   proportional to speed and shaft power to the cube of speed, so running at
 *   60 % speed needs about 0.6^3 = 22 % of full power. An old resistive
 *   regulator does NOT save that way — it burns the difference as heat in the
 *   resistor, so mains draw barely falls. A capacitor regulator sits between
 *   the two. That is why the load factor is an input you set rather than
 *   something the tool assumes.
 */

export const DAYS_PER_MONTH = 365 / 12;
export const DAYS_PER_YEAR = 365;

/** CEA CO2 Baseline Database for the Indian grid, combined margin ~0.71 kg/kWh. */
export const GRID_CO2_KG_PER_KWH = 0.71;

/** Fan affinity law exponent: shaft power scales with the cube of speed. */
export const AFFINITY_POWER_EXPONENT = 3;
/** Ceiling-fan regulators in India are conventionally five-step. */
export const MAX_SPEED_STEP = 5;

/** Typical full-speed input power for common 1200 mm ceiling fan classes. */
export const FAN_PRESETS = [
  { id: "old", label: "Old induction fan (pre-BEE)", watts: 80 },
  { id: "star3", label: "BEE 3-star induction fan", watts: 60 },
  { id: "star5", label: "BEE 5-star induction fan", watts: 50 },
  { id: "bldc", label: "BLDC fan", watts: 30 },
];

const num = (value) => {
  if (value === "" || value === null || value === undefined) return Number.NaN;
  const n = Number(value);
  return Number.isFinite(n) ? n : Number.NaN;
};

/**
 * Fraction of full power drawn at a given regulator step under the fan
 * affinity law (electronic speed control only).
 * Returns null when the step is outside 1..maxStep.
 * @param {number} step 1..maxStep
 */
export function affinityPowerFraction(step, maxStep = MAX_SPEED_STEP) {
  const s = num(step);
  const m = num(maxStep);
  if (!(s > 0) || !(m > 0) || s > m) return null;
  return Math.pow(s / m, AFFINITY_POWER_EXPONENT);
}

/**
 * @param {object} input
 * @param {number} input.existingWatts  Full-speed input power of the current fan.
 * @param {number} input.newWatts       Full-speed input power of the BLDC fan.
 * @param {number} input.loadFactor     Share of full power at your usual speed, 0-1.
 * @param {number} input.fanCount       How many fans you would replace.
 * @param {number} input.hoursPerDay    Hours each fan runs on a day it is used.
 * @param {number} input.monthsPerYear  Months of the year the fans are used.
 * @param {number} input.tariff         Electricity price per kWh.
 * @param {number} input.newFanPrice    Price of one BLDC fan.
 * @param {number} input.oldFanValue    Resale or trade-in value of one old fan.
 * @returns {object} result or { error }
 */
export function computeFanCost({
  existingWatts,
  newWatts,
  loadFactor = 1,
  fanCount,
  hoursPerDay,
  monthsPerYear,
  tariff,
  newFanPrice,
  oldFanValue = 0,
}) {
  const oldW = num(existingWatts);
  const newW = num(newWatts);
  const load = num(loadFactor);
  const fans = num(fanCount);
  const hours = num(hoursPerDay);
  const months = num(monthsPerYear);
  const rate = num(tariff);
  const price = num(newFanPrice);
  const salvage = num(oldFanValue);

  const all = [oldW, newW, load, fans, hours, months, rate, price, salvage];
  if (all.some((v) => Number.isNaN(v))) return { error: "Enter a number in every field." };
  if (oldW <= 0 || newW <= 0) return { error: "Fan wattage must be greater than zero." };
  if (oldW > 500 || newW > 500) return { error: "A ceiling fan above 500 W is out of range." };
  if (!(load > 0) || load > 1) return { error: "Load factor must be above 0 and at most 1." };
  if (!Number.isInteger(fans) || fans < 1 || fans > 100) {
    return { error: "Number of fans must be a whole number between 1 and 100." };
  }
  if (hours < 0 || hours > 24) return { error: "Running hours must be between 0 and 24 per day." };
  if (months <= 0 || months > 12) return { error: "Months of use must be between 1 and 12." };
  if (rate <= 0) return { error: "Electricity tariff must be greater than zero." };
  if (price < 0 || salvage < 0) return { error: "Prices cannot be negative." };

  const daysPerYear = months * DAYS_PER_MONTH;
  const oldRunWatts = oldW * load;
  const newRunWatts = newW * load;

  const oldKwhPerYear = ((oldRunWatts * hours) / 1000) * daysPerYear * fans;
  const newKwhPerYear = ((newRunWatts * hours) / 1000) * daysPerYear * fans;
  const kwhSavedPerYear = oldKwhPerYear - newKwhPerYear;

  const oldCostPerYear = oldKwhPerYear * rate;
  const newCostPerYear = newKwhPerYear * rate;
  const savingPerYear = oldCostPerYear - newCostPerYear;

  const netUpgradeCost = Math.max(0, price - salvage) * fans;
  const paybackYears = savingPerYear > 0 ? netUpgradeCost / savingPerYear : null;

  return {
    daysPerYear,
    oldRunWatts,
    newRunWatts,
    oldKwhPerYear,
    newKwhPerYear,
    kwhSavedPerYear,
    oldCostPerMonth: oldCostPerYear / 12,
    newCostPerMonth: newCostPerYear / 12,
    oldCostPerYear,
    newCostPerYear,
    savingPerMonth: savingPerYear / 12,
    savingPerYear,
    savingSharePct: oldCostPerYear > 0 ? (savingPerYear / oldCostPerYear) * 100 : 0,
    netUpgradeCost,
    paybackYears,
    paybackMonths: paybackYears === null ? null : paybackYears * 12,
    fiveYearNetSaving: savingPerYear * 5 - netUpgradeCost,
    tenYearNetSaving: savingPerYear * 10 - netUpgradeCost,
    co2SavedKgPerYear: kwhSavedPerYear * GRID_CO2_KG_PER_KWH,
  };
}
