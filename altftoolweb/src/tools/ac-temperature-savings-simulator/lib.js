/**
 * Savings from raising the AC thermostat setpoint.
 *
 * Heat leaks into a room in proportion to the temperature difference across its walls,
 * windows and roof, so the sensible cooling load an AC has to remove is proportional to
 * (outdoor temperature - indoor setpoint). Raising the setpoint shrinks that difference,
 * and the energy for a given run time scales with it:
 *
 *     energy ratio = (T_outdoor - T_new) / (T_outdoor - T_baseline)
 *
 * At 38 degC outside, going from 22 degC to 24 degC gives 14/16 = 0.875, a 12.5% saving —
 * about 6.25% per degree, which is why BEE's advisory for the 24 degC default setting
 * quotes roughly 6% saved per degree raised. Both figures are reported so you can see the
 * physical model and the published rule of thumb side by side.
 */

/** 1 ton of refrigeration = 12,000 BTU/h = 3516.85 W of cooling. */
export const WATTS_PER_TON_REFRIGERATION = 3516.85;

/** BEE's rule of thumb behind the 24 degC default-setting advisory: about 6% per degree. */
export const BEE_SAVING_FRACTION_PER_DEGREE = 0.06;

/** India's BEE-mandated default AC setting. */
export const BEE_DEFAULT_SETPOINT_C = 24;

/**
 * CO2 intensity of the Indian grid. CEA's CO2 Baseline Database puts the weighted
 * average close to 0.71–0.73 kg CO2 per kWh; 0.716 is used here.
 */
export const GRID_CO2_KG_PER_KWH = 0.716;

/** Range a room AC thermostat covers. */
export const MIN_SETPOINT_C = 16;
export const MAX_SETPOINT_C = 30;

/** Energy ratio between two setpoints under the temperature-difference load model. */
export function energyRatio(outdoorC, baselineC, newC) {
  const baseDelta = outdoorC - baselineC;
  if (!(baseDelta > 0)) return NaN;
  return Math.max(0, (outdoorC - newC) / baseDelta);
}

/**
 * @returns {{error:string}|object} baseline vs raised-setpoint energy and money
 */
export function simulateSetpointSavings({
  tons,
  iseer,
  outdoorTempC,
  baselineSetpointC,
  newSetpointC,
  tariffPerKwh,
  hoursPerDay,
  daysPerMonth = 30,
}) {
  const numbers = [
    tons,
    iseer,
    outdoorTempC,
    baselineSetpointC,
    newSetpointC,
    tariffPerKwh,
    hoursPerDay,
    daysPerMonth,
  ];
  if (numbers.some((v) => typeof v !== "number" || !Number.isFinite(v))) {
    return { error: "Enter a valid number in every field." };
  }
  if (tons <= 0 || tons > 10) return { error: "Cooling capacity must be between 0 and 10 tons." };
  if (iseer <= 0 || iseer > 12) return { error: "ISEER must be greater than 0 and at most 12." };
  if (outdoorTempC < 20 || outdoorTempC > 55) {
    return { error: "Outdoor temperature must be between 20 °C and 55 °C." };
  }
  if (
    baselineSetpointC < MIN_SETPOINT_C ||
    baselineSetpointC > MAX_SETPOINT_C ||
    newSetpointC < MIN_SETPOINT_C ||
    newSetpointC > MAX_SETPOINT_C
  ) {
    return { error: `Setpoints must be between ${MIN_SETPOINT_C} °C and ${MAX_SETPOINT_C} °C.` };
  }
  if (outdoorTempC <= baselineSetpointC) {
    return {
      error: "Outdoor temperature must be above the baseline setpoint, or there is no cooling load to save.",
    };
  }
  if (tariffPerKwh < 0 || tariffPerKwh > 100) {
    return { error: "Enter the tariff in rupees per unit (0 to 100)." };
  }
  if (hoursPerDay <= 0 || hoursPerDay > 24) {
    return { error: "Hours per day must be more than 0 and at most 24." };
  }
  if (daysPerMonth <= 0 || daysPerMonth > 31) {
    return { error: "Days per month must be between 1 and 31." };
  }

  const baselineKwhPerHour = (tons * WATTS_PER_TON_REFRIGERATION) / iseer / 1000;
  const hoursPerMonth = hoursPerDay * daysPerMonth;

  const baselineKwhMonth = baselineKwhPerHour * hoursPerMonth;
  const ratio = energyRatio(outdoorTempC, baselineSetpointC, newSetpointC);
  const newKwhMonth = baselineKwhMonth * ratio;

  const degreesRaised = newSetpointC - baselineSetpointC;
  const savingPercent = (1 - ratio) * 100;

  // Published rule of thumb, compounding 6% for each degree raised.
  const beeSavingPercent =
    (1 - Math.pow(1 - BEE_SAVING_FRACTION_PER_DEGREE, degreesRaised)) * 100;

  const table = [];
  for (let setpoint = MIN_SETPOINT_C; setpoint <= MAX_SETPOINT_C; setpoint += 1) {
    const r = energyRatio(outdoorTempC, baselineSetpointC, setpoint);
    const kwh = baselineKwhMonth * r;
    table.push({
      setpointC: setpoint,
      kwhMonth: kwh,
      costMonth: kwh * tariffPerKwh,
      savingPercent: (1 - r) * 100,
      savingMonth: (baselineKwhMonth - kwh) * tariffPerKwh,
      isBaseline: setpoint === baselineSetpointC,
      isSelected: setpoint === newSetpointC,
    });
  }

  const unitsSavedMonth = baselineKwhMonth - newKwhMonth;

  return {
    baselineKwhPerHour,
    hoursPerMonth,
    baselineKwhMonth,
    newKwhMonth,
    baselineCostMonth: baselineKwhMonth * tariffPerKwh,
    newCostMonth: newKwhMonth * tariffPerKwh,
    unitsSavedMonth,
    moneySavedMonth: unitsSavedMonth * tariffPerKwh,
    moneySavedSeason: unitsSavedMonth * tariffPerKwh * 4,
    degreesRaised,
    savingPercent,
    savingPercentPerDegree: degreesRaised !== 0 ? savingPercent / degreesRaised : 0,
    beeSavingPercent,
    co2SavedKgMonth: unitsSavedMonth * GRID_CO2_KG_PER_KWH,
    isIncrease: degreesRaised < 0,
    table,
  };
}
