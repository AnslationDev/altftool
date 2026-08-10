/**
 * Evaporative (desert) cooler versus air conditioner.
 *
 * A cooler cannot make air colder than its wet-bulb temperature: it converts sensible
 * heat into latent heat by evaporating water, so the outlet sits between the dry-bulb
 * and the wet-bulb according to the pad's saturation effectiveness:
 *
 *     outlet dry-bulb = T - effectiveness x (T - wet-bulb)
 *
 * An air conditioner has no such limit — it condenses moisture out instead. This module
 * computes the wet bulb, the temperature each machine can reach, the water the cooler
 * evaporates and the electricity both draw.
 */

/** Standard sea-level atmospheric pressure. */
export const ATMOSPHERIC_PRESSURE_KPA = 101.325;

/** 1 ton of refrigeration = 12,000 BTU/h = 3516.85 W of cooling. */
export const WATTS_PER_TON_REFRIGERATION = 3516.85;

/** Saturation effectiveness of cooler pads, from manufacturer performance data. */
export const PAD_TYPES = [
  { value: "honeycomb", label: "Rigid honeycomb / cellulose pad", effectiveness: 0.85 },
  { value: "aspen", label: "Aspen (wood wool) pad", effectiveness: 0.75 },
  { value: "worn", label: "Old or partly clogged pad", effectiveness: 0.6 },
];

/** Ratio of dry-air to water-vapour molar masses, used in the humidity-ratio formula. */
const MOLAR_MASS_RATIO = 0.621945;

/** Specific gas constant for dry air, kJ/(kg K). */
const R_DRY_AIR = 0.287042;

/** Specific heat of dry air, kJ/(kg K). */
const CP_DRY_AIR = 1.006;

/** Latent heat of vaporisation of water at 0 degC, kJ/kg (moist-air enthalpy datum). */
const H_FG_0C = 2501;

/** Specific heat of water vapour, kJ/(kg K). */
const CP_VAPOUR = 1.86;

/**
 * Saturation vapour pressure over water, kPa.
 * Alduchov & Eskridge (1996) improved Magnus form; error under 0.4% from -40 to +50 degC.
 */
export function saturationVapourPressureKpa(tempC) {
  return 0.61094 * Math.exp((17.625 * tempC) / (tempC + 243.04));
}

/** Humidity ratio (kg water per kg dry air) from dry-bulb temperature and relative humidity. */
export function humidityRatio(tempC, rhPercent, pressureKpa = ATMOSPHERIC_PRESSURE_KPA) {
  const pv = (rhPercent / 100) * saturationVapourPressureKpa(tempC);
  const denominator = pressureKpa - pv;
  if (denominator <= 0) return NaN;
  return (MOLAR_MASS_RATIO * pv) / denominator;
}

/** Moist-air enthalpy in kJ per kg of dry air. */
export function moistAirEnthalpy(tempC, w) {
  return CP_DRY_AIR * tempC + w * (H_FG_0C + CP_VAPOUR * tempC);
}

/** Relative humidity from dry-bulb temperature and humidity ratio. */
export function relativeHumidityFromW(tempC, w, pressureKpa = ATMOSPHERIC_PRESSURE_KPA) {
  const pv = (w * pressureKpa) / (MOLAR_MASS_RATIO + w);
  return (pv / saturationVapourPressureKpa(tempC)) * 100;
}

/**
 * Wet-bulb temperature from dry bulb and relative humidity.
 * Stull (2011), Journal of Applied Meteorology and Climatology — accurate to about
 * 0.3 degC for relative humidity from 5% to 99% and air from -20 to +50 degC at
 * sea-level pressure.
 */
export function wetBulbC(tempC, rhPercent) {
  return (
    tempC * Math.atan(0.151977 * Math.sqrt(rhPercent + 8.313659)) +
    Math.atan(tempC + rhPercent) -
    Math.atan(rhPercent - 1.676331) +
    0.00391838 * Math.pow(rhPercent, 1.5) * Math.atan(0.023101 * rhPercent) -
    4.686035
  );
}

/** Comfort verdict bands, keyed on the wet-bulb depression (dry bulb minus wet bulb). */
export const VERDICT_BANDS = [
  { minDepression: 12, verdict: "excellent", text: "Dry heat — a cooler works very well here." },
  { minDepression: 8, verdict: "good", text: "A cooler will give a clear, usable drop in temperature." },
  { minDepression: 5, verdict: "marginal", text: "A cooler helps a little, but the room will feel humid." },
  { minDepression: 0, verdict: "poor", text: "Air is close to saturated — a cooler will add damp without cooling." },
];

export function verdictFor(depression) {
  return VERDICT_BANDS.find((band) => depression >= band.minDepression) ?? VERDICT_BANDS[VERDICT_BANDS.length - 1];
}

/**
 * @returns {{error:string}|object} side-by-side cooler and AC figures
 */
export function compareCoolerAndAc({
  outdoorTempC,
  relativeHumidityPercent,
  padType = "honeycomb",
  coolerAirflowCmh = 3000,
  freshAirPercent = 30,
  coolerPowerW = 180,
  acTons = 1.5,
  acIseer = 3.8,
  acSetpointC = 24,
  tariffPerKwh,
  waterPricePerKilolitre = 0,
  hoursPerDay,
  daysPerMonth = 30,
}) {
  const numbers = [
    outdoorTempC,
    relativeHumidityPercent,
    coolerAirflowCmh,
    freshAirPercent,
    coolerPowerW,
    acTons,
    acIseer,
    acSetpointC,
    tariffPerKwh,
    waterPricePerKilolitre,
    hoursPerDay,
    daysPerMonth,
  ];
  if (numbers.some((v) => typeof v !== "number" || !Number.isFinite(v))) {
    return { error: "Enter a valid number in every field." };
  }

  const pad = PAD_TYPES.find((item) => item.value === padType);
  if (!pad) return { error: "Choose a cooler pad type from the list." };

  // Stull's approximation is only valid inside this envelope.
  if (outdoorTempC < -20 || outdoorTempC > 50) {
    return { error: "Air temperature must be between -20 °C and 50 °C." };
  }
  if (relativeHumidityPercent < 5 || relativeHumidityPercent > 99) {
    return { error: "Relative humidity must be between 5% and 99%." };
  }
  if (coolerAirflowCmh <= 0 || coolerAirflowCmh > 30000) {
    return { error: "Cooler airflow must be between 1 and 30,000 m³/h." };
  }
  if (freshAirPercent < 0 || freshAirPercent > 100) {
    return { error: "Fresh-air share must be between 0% and 100%." };
  }
  if (coolerPowerW <= 0 || coolerPowerW > 5000) {
    return { error: "Cooler power must be between 1 W and 5,000 W." };
  }
  if (acTons <= 0 || acTons > 10) return { error: "AC capacity must be between 0 and 10 tons." };
  if (acIseer <= 0 || acIseer > 12) return { error: "ISEER must be greater than 0 and at most 12." };
  if (acSetpointC < 16 || acSetpointC > 30) {
    return { error: "AC setpoint must be between 16 °C and 30 °C." };
  }
  if (tariffPerKwh < 0 || tariffPerKwh > 100) {
    return { error: "Enter the tariff in rupees per unit (0 to 100)." };
  }
  if (waterPricePerKilolitre < 0) return { error: "Water price cannot be negative." };
  if (hoursPerDay <= 0 || hoursPerDay > 24) {
    return { error: "Hours per day must be more than 0 and at most 24." };
  }
  if (daysPerMonth <= 0 || daysPerMonth > 31) {
    return { error: "Days per month must be between 1 and 31." };
  }

  const wetBulb = wetBulbC(outdoorTempC, relativeHumidityPercent);
  // Stull's approximation can overshoot the true wet-bulb temperature by a
  // fraction of a degree near the edges of its accepted range, which would
  // otherwise make the depression negative and report the cooler as heating
  // the room. A cooler cannot physically warm the air, so clamp at zero.
  const depression = Math.max(0, outdoorTempC - wetBulb);
  const coolerOutletC = outdoorTempC - pad.effectiveness * depression;

  // Adiabatic saturation: enthalpy stays constant while water evaporates into the air.
  const wIn = humidityRatio(outdoorTempC, relativeHumidityPercent);
  if (!Number.isFinite(wIn)) return { error: "Those conditions are outside the psychrometric range." };
  const enthalpy = moistAirEnthalpy(outdoorTempC, wIn);
  const wOut = (enthalpy - CP_DRY_AIR * coolerOutletC) / (H_FG_0C + CP_VAPOUR * coolerOutletC);
  const outletRh = Math.min(100, Math.max(0, relativeHumidityFromW(coolerOutletC, wOut)));

  // Specific volume of the incoming moist air, m3 per kg of dry air.
  const specificVolume =
    (R_DRY_AIR * (outdoorTempC + 273.15) * (1 + wIn / MOLAR_MASS_RATIO)) / ATMOSPHERIC_PRESSURE_KPA;
  const dryAirKgPerHour = coolerAirflowCmh / specificVolume;
  // Only the fresh-air share arrives dry enough to take up the full moisture load.
  const waterLitresPerHour =
    Math.max(0, wOut - wIn) * dryAirKgPerHour * (freshAirPercent / 100);

  const coolerKwhPerHour = coolerPowerW / 1000;
  const acKwhPerHour = (acTons * WATTS_PER_TON_REFRIGERATION) / acIseer / 1000;

  const hoursPerMonth = hoursPerDay * daysPerMonth;

  const coolerElectricityMonth = coolerKwhPerHour * hoursPerMonth * tariffPerKwh;
  const coolerWaterLitresMonth = waterLitresPerHour * hoursPerMonth;
  const coolerWaterCostMonth = (coolerWaterLitresMonth / 1000) * waterPricePerKilolitre;
  const coolerTotalMonth = coolerElectricityMonth + coolerWaterCostMonth;
  const acTotalMonth = acKwhPerHour * hoursPerMonth * tariffPerKwh;

  const band = verdictFor(depression);

  return {
    wetBulbC: wetBulb,
    depressionC: depression,
    coolerOutletC,
    coolerTempDropC: outdoorTempC - coolerOutletC,
    coolerOutletRhPercent: outletRh,
    acTempDropC: outdoorTempC - acSetpointC,
    padEffectiveness: pad.effectiveness,
    verdict: band.verdict,
    verdictText: band.text,
    coolerCanReachSetpoint: coolerOutletC <= acSetpointC,
    coolerAboveSetpointC: Math.max(0, coolerOutletC - acSetpointC),
    coolerKwhPerHour,
    acKwhPerHour,
    waterLitresPerHour,
    coolerKwhPerMonth: coolerKwhPerHour * hoursPerMonth,
    acKwhPerMonth: acKwhPerHour * hoursPerMonth,
    coolerWaterLitresMonth,
    coolerElectricityMonth,
    coolerWaterCostMonth,
    coolerTotalMonth,
    acTotalMonth,
    monthlySaving: acTotalMonth - coolerTotalMonth,
    savingPercent: acTotalMonth > 0 ? ((acTotalMonth - coolerTotalMonth) / acTotalMonth) * 100 : 0,
    powerRatio: coolerKwhPerHour > 0 ? acKwhPerHour / coolerKwhPerHour : null,
    hoursPerMonth,
  };
}
