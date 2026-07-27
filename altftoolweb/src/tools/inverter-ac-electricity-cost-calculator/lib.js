/**
 * Inverter AC running cost.
 *
 *   rated cooling (W)  = tons x 3516.85
 *   average input (W)  = rated cooling / ISEER          (ISEER definition)
 *   setpoint factor    = 1.06 ^ (24 - setpoint in C)    (BEE: about 6% per degree)
 *   cooling units      = input x setpoint factor x hours x days / 1000
 *   standby units      = 2 W x (24 - hours) x days / 1000
 *   stabiliser losses  = +5% of the AC's own consumption when a servo stabiliser is used
 *   bill               = (units) x tariff + fixed monthly charge
 *
 * ISEER is a seasonal figure, so the input power derived from it is already an
 * average over a cooling season rather than the compressor's peak draw.
 */

/** ASHRAE definition: 1 ton of refrigeration = 3516.85 W of cooling. */
export const WATTS_PER_TON = 3516.85;

/**
 * BEE mandated 24 C as the default power-on setpoint for room ACs sold in
 * India from 1 January 2020, and puts the saving from raising the thermostat
 * at roughly 6% of electricity per degree Celsius. Both figures are used here:
 * 24 C is the reference point and 1.06 is the per-degree multiplier.
 */
export const REFERENCE_SETPOINT_C = 24;
export const SETPOINT_SENSITIVITY = 1.06;

/** Typical standby draw of a modern split AC with the compressor off, in watts. */
export const STANDBY_WATTS = 2;

/** A servo voltage stabiliser is typically about 95% efficient, so it adds ~5%. */
export const STABILISER_LOSS = 0.05;

/**
 * CEA CO2 Baseline Database: the Indian grid emission factor is close to
 * 0.71 kg CO2 per kWh on a weighted average basis.
 */
export const GRID_CO2_KG_PER_KWH = 0.71;

/** Indicative ISEER of a non-inverter, fixed-speed split AC for comparison. */
export const TYPICAL_FIXED_SPEED_ISEER = 3.7;

export const MIN_ISEER = 2;
export const MAX_ISEER = 7;
export const MIN_SETPOINT_C = 16;
export const MAX_SETPOINT_C = 32;

/** Average electrical input power at the rated capacity, in watts. */
export function averageInputWatts(tons, iseer) {
  if (!(tons > 0) || !(iseer > 0)) return 0;
  return (tons * WATTS_PER_TON) / iseer;
}

/** Consumption multiplier for running colder or warmer than the 24 C reference. */
export function setpointFactor(setpointC) {
  if (!Number.isFinite(setpointC)) return 1;
  return Math.pow(SETPOINT_SENSITIVITY, REFERENCE_SETPOINT_C - setpointC);
}

/**
 * @param {object} input
 * @param {number} input.tons          Rated capacity in tons.
 * @param {number} input.iseer         ISEER from the BEE label.
 * @param {number} input.hoursPerDay   Hours the AC actually runs each day.
 * @param {number} input.daysPerMonth  Days per month it is used.
 * @param {number} input.setpointC     Thermostat setting in Celsius.
 * @param {number} input.tariff        Currency per kWh.
 * @param {number} input.fixedCharge   Fixed monthly charge on the bill.
 * @param {boolean} input.stabiliser   True if a servo stabiliser is in circuit.
 * @param {number} input.monthsPerYear Months of the year the AC is used.
 * @param {number} input.compareIseer  ISEER of the unit being compared against.
 * @returns {object} breakdown or { error }.
 */
export function computeInverterAcCost({
  tons,
  iseer,
  hoursPerDay,
  daysPerMonth = 30,
  setpointC = REFERENCE_SETPOINT_C,
  tariff,
  fixedCharge = 0,
  stabiliser = false,
  monthsPerYear = 5,
  compareIseer = TYPICAL_FIXED_SPEED_ISEER,
}) {
  const t = Number(tons);
  const e = Number(iseer);
  const hours = Number(hoursPerDay);
  const days = Number(daysPerMonth);
  const setpoint = Number(setpointC);
  const rate = Number(tariff);
  const fixed = Number(fixedCharge);
  const months = Number(monthsPerYear);
  const compare = Number(compareIseer);

  if (![t, e, hours, days, setpoint, rate, fixed, months, compare].every((v) => Number.isFinite(v))) {
    return { error: "Enter valid numbers in every field." };
  }
  if (t <= 0 || t > 5) return { error: "Capacity should be between 0.5 and 5 ton." };
  if (e < MIN_ISEER || e > MAX_ISEER) {
    return { error: `ISEER should be between ${MIN_ISEER} and ${MAX_ISEER} — check the BEE label.` };
  }
  if (compare < MIN_ISEER || compare > MAX_ISEER) {
    return { error: `Comparison ISEER should be between ${MIN_ISEER} and ${MAX_ISEER}.` };
  }
  if (hours <= 0 || hours > 24) return { error: "Hours per day must be between 1 and 24." };
  if (days <= 0 || days > 31) return { error: "Days per month must be between 1 and 31." };
  if (setpoint < MIN_SETPOINT_C || setpoint > MAX_SETPOINT_C) {
    return { error: `Setpoint should be between ${MIN_SETPOINT_C} C and ${MAX_SETPOINT_C} C.` };
  }
  if (rate < 0 || fixed < 0) return { error: "Tariff and fixed charge cannot be negative." };
  if (months <= 0 || months > 12) return { error: "Months of use per year must be between 1 and 12." };

  const inputWatts = averageInputWatts(t, e);
  const factor = setpointFactor(setpoint);
  const effectiveWatts = inputWatts * factor;

  const stabiliserMultiplier = stabiliser ? 1 + STABILISER_LOSS : 1;
  const coolingUnitsPerMonth = (effectiveWatts * stabiliserMultiplier * hours * days) / 1000;
  const standbyUnitsPerMonth = (STANDBY_WATTS * Math.max(0, 24 - hours) * days) / 1000;
  const monthlyUnits = coolingUnitsPerMonth + standbyUnitsPerMonth;

  const monthlyEnergyCost = monthlyUnits * rate;
  const monthlyCost = monthlyEnergyCost + fixed;
  const dailyUnits = monthlyUnits / days;
  const dailyCost = dailyUnits * rate;
  const unitsPerHour = (effectiveWatts * stabiliserMultiplier) / 1000;
  const costPerHour = unitsPerHour * rate;

  const annualUnits = monthlyUnits * months;
  const annualCost = monthlyEnergyCost * months + fixed * months;

  // Same room, same setpoint, same hours, but a unit of different efficiency.
  const compareWatts = averageInputWatts(t, compare) * factor * stabiliserMultiplier;
  const compareMonthlyUnits = (compareWatts * hours * days) / 1000 + standbyUnitsPerMonth;
  const compareMonthlyCost = compareMonthlyUnits * rate + fixed;
  const monthlySaving = compareMonthlyCost - monthlyCost;
  const annualSaving = (compareMonthlyUnits - monthlyUnits) * rate * months;

  return {
    inputWatts,
    setpointFactorValue: factor,
    effectiveWatts,
    stabiliserMultiplier,
    unitsPerHour,
    costPerHour,
    dailyUnits,
    dailyCost,
    coolingUnitsPerMonth,
    standbyUnitsPerMonth,
    monthlyUnits,
    monthlyEnergyCost,
    fixedCharge: fixed,
    monthlyCost,
    annualUnits,
    annualCost,
    monthsPerYear: months,
    compareIseer: compare,
    compareMonthlyUnits,
    compareMonthlyCost,
    monthlySaving,
    annualSaving,
    annualCo2Kg: annualUnits * GRID_CO2_KG_PER_KWH,
  };
}
