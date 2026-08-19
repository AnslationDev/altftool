/**
 * Air fryer vs conventional electric oven: energy and cost per meal.
 *
 * Both appliances are resistive heaters on a thermostat, so the honest model
 * splits every cook into two phases:
 *
 *   preheat  - the element runs continuously to bring the cavity up to
 *              temperature, so it draws the full rated wattage;
 *   cooking  - the thermostat cycles the element on and off to hold that
 *              temperature, so the average draw is rated wattage x duty cycle.
 *
 *   Energy (kWh) = rated_W / 1000 x ( preheat_min / 60 + cook_min / 60 x duty )
 *   Cost         = Energy x tariff
 *
 * An air fryer wins on two counts that the formula makes explicit: a much
 * smaller cavity needs a far shorter preheat, and a lower rated wattage
 * (typically 1400-1800 W against 2000-3000 W for a full-size oven).
 */

export const DAYS_PER_YEAR = 365;
export const WEEKS_PER_YEAR = DAYS_PER_YEAR / 7;

/** CEA CO2 Baseline Database Version 21.0 (Dec 2025), FY2023-24 Combined Margin, 0.757 kg CO2/kWh, for the Indian grid. */
export const GRID_CO2_KG_PER_KWH = 0.757;

/**
 * Fraction of the cooking phase the element is actually powered.
 * A small, lightly insulated air-fryer cavity loses heat quickly and cycles
 * on more often; a heavy oven cavity holds heat and cycles on less.
 */
export const DEFAULT_AIR_FRYER_DUTY = 0.65;
export const DEFAULT_OVEN_DUTY = 0.4;

export const DEFAULTS = {
  airFryerWatts: 1500,
  airFryerPreheatMin: 3,
  airFryerCookMin: 18,
  ovenWatts: 2400,
  ovenPreheatMin: 12,
  ovenCookMin: 25,
};

const num = (value) => {
  if (value === "" || value === null || value === undefined) return Number.NaN;
  const n = Number(value);
  return Number.isFinite(n) ? n : Number.NaN;
};

/** Energy for one cook: full power through preheat, duty-cycled while cooking. */
export function cookEnergyKwh({ watts, preheatMin, cookMin, duty }) {
  if (!(watts > 0)) return 0;
  const preheatHours = Math.max(0, preheatMin) / 60;
  const cookHours = Math.max(0, cookMin) / 60;
  return (watts / 1000) * (preheatHours + cookHours * duty);
}

function validateAppliance(name, watts, preheat, cook, duty) {
  if ([watts, preheat, cook, duty].some((v) => Number.isNaN(v))) {
    return { error: `Enter a number in every ${name} field.` };
  }
  if (watts <= 0 || watts > 6000) return { error: `${name} wattage should be between 1 and 6000 W.` };
  if (preheat < 0 || preheat > 120) return { error: `${name} preheat should be between 0 and 120 minutes.` };
  if (cook < 0 || cook > 600) return { error: `${name} cook time should be between 0 and 600 minutes.` };
  if (duty <= 0 || duty > 1) return { error: `${name} duty cycle must be above 0 and at most 1.` };
  return null;
}

/**
 * @param {object} input
 * @param {number} input.airFryerWatts      Rated power of the air fryer.
 * @param {number} input.airFryerPreheatMin Preheat minutes.
 * @param {number} input.airFryerCookMin    Cooking minutes.
 * @param {number} input.airFryerDuty       On-fraction during cooking, 0-1.
 * @param {number} input.ovenWatts          Rated power of the oven.
 * @param {number} input.ovenPreheatMin     Preheat minutes.
 * @param {number} input.ovenCookMin        Cooking minutes.
 * @param {number} input.ovenDuty           On-fraction during cooking, 0-1.
 * @param {number} input.tariff             Electricity price per kWh.
 * @param {number} input.mealsPerWeek       Meals cooked this way each week.
 * @returns {object} result or { error }
 */
export function compareAirFryerAndOven({
  airFryerWatts,
  airFryerPreheatMin,
  airFryerCookMin,
  airFryerDuty = DEFAULT_AIR_FRYER_DUTY,
  ovenWatts,
  ovenPreheatMin,
  ovenCookMin,
  ovenDuty = DEFAULT_OVEN_DUTY,
  tariff,
  mealsPerWeek,
}) {
  const afW = num(airFryerWatts);
  const afP = num(airFryerPreheatMin);
  const afC = num(airFryerCookMin);
  const afD = num(airFryerDuty);
  const ovW = num(ovenWatts);
  const ovP = num(ovenPreheatMin);
  const ovC = num(ovenCookMin);
  const ovD = num(ovenDuty);
  const rate = num(tariff);
  const meals = num(mealsPerWeek);

  const afError = validateAppliance("air fryer", afW, afP, afC, afD);
  if (afError) return afError;
  const ovError = validateAppliance("oven", ovW, ovP, ovC, ovD);
  if (ovError) return ovError;

  if (Number.isNaN(rate) || Number.isNaN(meals)) return { error: "Enter a number in every field." };
  if (rate <= 0) return { error: "Electricity tariff must be greater than zero." };
  if (meals <= 0 || meals > 70) return { error: "Meals per week should be between 1 and 70." };

  const airFryerKwh = cookEnergyKwh({ watts: afW, preheatMin: afP, cookMin: afC, duty: afD });
  const ovenKwh = cookEnergyKwh({ watts: ovW, preheatMin: ovP, cookMin: ovC, duty: ovD });

  const airFryerCost = airFryerKwh * rate;
  const ovenCost = ovenKwh * rate;
  const airFryerMinutes = afP + afC;
  const ovenMinutes = ovP + ovC;

  const savingPerMeal = ovenCost - airFryerCost;
  const kwhSavedPerMeal = ovenKwh - airFryerKwh;
  const minutesSavedPerMeal = ovenMinutes - airFryerMinutes;
  const mealsPerYear = meals * WEEKS_PER_YEAR;

  return {
    airFryerKwh,
    ovenKwh,
    airFryerCost,
    ovenCost,
    airFryerMinutes,
    ovenMinutes,
    airFryerAvgWatts: airFryerMinutes > 0 ? (airFryerKwh * 1000) / (airFryerMinutes / 60) : 0,
    ovenAvgWatts: ovenMinutes > 0 ? (ovenKwh * 1000) / (ovenMinutes / 60) : 0,
    savingPerMeal,
    kwhSavedPerMeal,
    minutesSavedPerMeal,
    cheaperOption: savingPerMeal > 0 ? "air fryer" : savingPerMeal < 0 ? "oven" : "tie",
    savingSharePct:
      Math.max(airFryerCost, ovenCost) > 0
        ? (Math.abs(savingPerMeal) / Math.max(airFryerCost, ovenCost)) * 100
        : 0,
    mealsPerYear,
    savingPerMonth: (savingPerMeal * mealsPerYear) / 12,
    savingPerYear: savingPerMeal * mealsPerYear,
    kwhSavedPerYear: kwhSavedPerMeal * mealsPerYear,
    hoursSavedPerYear: (minutesSavedPerMeal * mealsPerYear) / 60,
    co2SavedKgPerYear: kwhSavedPerMeal * mealsPerYear * GRID_CO2_KG_PER_KWH,
  };
}
