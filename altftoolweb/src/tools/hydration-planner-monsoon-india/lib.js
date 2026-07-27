/**
 * Monsoon Hydration Planner (India) — pure calculation module.
 *
 * Humidity is the whole story during the monsoon. Sweat only cools you when it
 * EVAPORATES; when the air is already near saturation, most of the sweat you
 * secrete simply drips off. Your body compensates by secreting more, so fluid
 * loss goes up even though the temperature has come down from the May peak.
 *
 * The sweat model follows the simplified ISO 7933 (Predicted Heat Strain)
 * chain: required evaporation -> maximum evaporative capacity -> sweating
 * efficiency -> required sweat rate. It also reports the US National Weather
 * Service heat index and the volume of safe drinking water a household needs.
 */

/** Total-water adequate intake per kg of body mass, ml/kg/day. */
export const BASELINE_ML_PER_KG = 35;

/** Share of total daily water that arrives in food rather than drink (EFSA: 20-30%). */
export const FOOD_WATER_SHARE = 0.2;

/** Magnus-Tetens coefficients over liquid water (WMO CIMO Guide). */
const MAGNUS_A = 6.112;
const MAGNUS_B = 17.62;
const MAGNUS_C = 243.12;

/** Mean skin temperature under warm-humid conditions, degrees Celsius (ISO 7933). */
const SKIN_TEMP_C = 35;

/** Evaporative heat transfer coefficient in still-to-light air, W/(m2 * hPa).
 *  Derived from the Lewis relation h_e = 16.5 * h_c with h_c ~ 3.1 W/(m2 * K). */
const EVAPORATIVE_COEFF_W_PER_M2_HPA = 5.1;

/** Combined convective + radiative heat transfer coefficient, W/(m2 * K). */
const DRY_HEAT_COEFF_W_PER_M2_K = 8.7;

/** Clothing reduction factor applied to dry heat loss (typical light clothing ~0.6 clo effect). */
const CLOTHING_DRY_FACTOR = 0.6;

/** Latent heat of vaporisation of sweat at skin temperature, J per gram. */
const LATENT_HEAT_J_PER_G = 2426;

/** Physiological ceiling on sustained sweat rate, litres per hour.
 *  Unacclimatised people rarely exceed 1.5 L/h for long. */
export const MAX_SWEAT_L_PER_HOUR = 1.5;

/** Mean sweat sodium concentration, mmol/L, and sodium molar mass in mg/mmol. */
export const SWEAT_SODIUM_MMOL_PER_L = 40;
const SODIUM_MG_PER_MMOL = 23;

/** Sweat loss above which plain water alone is no longer the right replacement. */
export const ELECTROLYTE_SWEAT_THRESHOLD_ML = 2000;

/** Safe upper drinking rate, ml/hour (gastric emptying and hyponatraemia limit). */
export const MAX_HOURLY_INTAKE_ML = 800;

/** Daily intake beyond which the answer stops being a plan and becomes a warning.
 *  Sustained intakes above ~10 L/day exceed what the kidneys can excrete safely. */
export const SAFE_DAILY_INTAKE_CEILING_ML = 10000;

/** Upper end of the published NWS heat index chart, degrees Fahrenheit. */
const HEAT_INDEX_CHART_MAX_F = 137;

/** WHO minimum safe drinking + cooking water per person per day, litres.
 *  WHO puts basic survival drinking water at 2.5-3 L/person/day plus cooking. */
export const SAFE_WATER_L_PER_PERSON_DAY = 3;

/**
 * Metabolic rates by activity, W/m2 of body surface (ISO 8996 metabolic classes).
 */
export const ACTIVITY_LEVELS = [
  { id: "resting", label: "Resting / seated indoors", metabolicWPerM2: 70 },
  { id: "light", label: "Light — desk work, slow walking, commuting", metabolicWPerM2: 100 },
  { id: "moderate", label: "Moderate — brisk walking, housework, field visits", metabolicWPerM2: 165 },
  { id: "heavy", label: "Heavy — manual labour, construction, sport", metabolicWPerM2: 230 },
];

/** NWS heat index risk bands, in degrees Fahrenheit. */
const HEAT_INDEX_BANDS = [
  { maxF: 80, level: "Comfortable", note: "No heat-related caution needed for most people." },
  { maxF: 91, level: "Caution", note: "Fatigue possible with prolonged exposure or activity." },
  { maxF: 103, level: "Extreme caution", note: "Heat cramps and heat exhaustion possible." },
  { maxF: 125, level: "Danger", note: "Heat cramps and heat exhaustion likely; heat stroke possible." },
  { maxF: Infinity, level: "Extreme danger", note: "Heat stroke highly likely — avoid exertion outdoors." },
];

/** Saturation vapour pressure over water, hPa. */
export function saturationVapourPressure(tC) {
  return MAGNUS_A * Math.exp((MAGNUS_B * tC) / (MAGNUS_C + tC));
}

/** Du Bois body surface area, m2. BSA = 0.007184 * height(cm)^0.725 * weight(kg)^0.425. */
export function bodySurfaceArea(heightCm, weightKg) {
  return 0.007184 * Math.pow(heightCm, 0.725) * Math.pow(weightKg, 0.425);
}

export function celsiusToFahrenheit(c) {
  return (c * 9) / 5 + 32;
}

/**
 * US National Weather Service heat index (Rothfusz regression) in degrees Fahrenheit,
 * including the published low-humidity and high-humidity adjustments.
 */
export function heatIndexF(tempF, rhPct) {
  const simple =
    0.5 * (tempF + 61 + (tempF - 68) * 1.2 + rhPct * 0.094);
  if ((simple + tempF) / 2 < 80) return simple;

  const T = tempF;
  const R = rhPct;
  let hi =
    -42.379 +
    2.04901523 * T +
    10.14333127 * R -
    0.22475541 * T * R -
    0.00683783 * T * T -
    0.05481717 * R * R +
    0.00122874 * T * T * R +
    0.00085282 * T * R * R -
    0.00000199 * T * T * R * R;

  if (R < 13 && T >= 80 && T <= 112) {
    hi -= ((13 - R) / 4) * Math.sqrt((17 - Math.abs(T - 95)) / 17);
  } else if (R > 85 && T >= 80 && T <= 87) {
    hi += ((R - 85) / 10) * ((87 - T) / 5);
  }
  return hi;
}

function bandFor(hiF) {
  return HEAT_INDEX_BANDS.find((band) => hiF < band.maxF) || HEAT_INDEX_BANDS[HEAT_INDEX_BANDS.length - 1];
}

function round(value, step = 1) {
  return Math.round(value / step) * step;
}

/**
 * @param {object} input
 * @param {number} input.weightKg
 * @param {number} input.heightCm
 * @param {number} input.tempC         ambient air temperature, Celsius
 * @param {number} input.humidityPct   relative humidity, 0-100
 * @param {number} input.hoursExposed  hours spent in that environment today
 * @param {string} input.activityId    one of ACTIVITY_LEVELS ids
 * @param {number} input.householdSize people the safe-water figure should cover
 */
export function computeMonsoonHydration({
  weightKg,
  heightCm,
  tempC,
  humidityPct,
  hoursExposed,
  activityId,
  householdSize = 1,
} = {}) {
  const weight = Number(weightKg);
  const height = Number(heightCm);
  const temp = Number(tempC);
  const rh = Number(humidityPct);
  const hours = Number(hoursExposed);
  const people = Number(householdSize);

  if (![weight, height, temp, rh, hours, people].every((v) => Number.isFinite(v))) {
    return { error: "Enter a number in every field." };
  }
  if (weight <= 0 || weight > 350) return { error: "Enter a body weight between 1 kg and 350 kg." };
  if (height < 50 || height > 250) return { error: "Enter a height between 50 cm and 250 cm." };
  if (temp < 15 || temp > 50) {
    return { error: "Monsoon planning works between 15 °C and 50 °C — check the temperature." };
  }
  if (rh < 0 || rh > 100) return { error: "Relative humidity must be between 0% and 100%." };
  if (hours < 0 || hours > 16) return { error: "Enter between 0 and 16 hours of exposure." };
  if (people < 1 || people > 30) return { error: "Household size should be between 1 and 30 people." };

  const activity =
    ACTIVITY_LEVELS.find((level) => level.id === activityId) || ACTIVITY_LEVELS[1];

  const bsa = bodySurfaceArea(height, weight);
  const ambientVapourHpa = (saturationVapourPressure(temp) * rh) / 100;
  const skinVapourHpa = saturationVapourPressure(SKIN_TEMP_C);

  // Maximum evaporative capacity of the environment, W/m2. Never negative.
  const eMaxRaw = EVAPORATIVE_COEFF_W_PER_M2_HPA * (skinVapourHpa - ambientVapourHpa);
  const eMax = Math.max(1, eMaxRaw);

  // Dry heat exchange (positive = you lose heat; negative = the air heats you).
  const dryHeatWPerM2 = CLOTHING_DRY_FACTOR * DRY_HEAT_COEFF_W_PER_M2_K * (SKIN_TEMP_C - temp);

  // Evaporation the body needs to stay in heat balance, W/m2.
  const eReq = Math.max(0, activity.metabolicWPerM2 - dryHeatWPerM2);

  // Skin wettedness and sweating efficiency (ISO 7933: r = 1 - w^2 / 2).
  const wettedness = Math.min(1, eMax > 0 ? eReq / eMax : 1);
  const efficiency = 1 - (wettedness * wettedness) / 2;

  // Required sweat rate as heat equivalent, then as mass.
  const sweatWPerM2 = efficiency > 0 ? eReq / efficiency : 0;
  const sweatGramsPerHourRaw = (sweatWPerM2 * bsa * 3600) / LATENT_HEAT_J_PER_G;
  const sweatLPerHour = Math.min(MAX_SWEAT_L_PER_HOUR, sweatGramsPerHourRaw / 1000);
  const sweatCapped = sweatGramsPerHourRaw / 1000 > MAX_SWEAT_L_PER_HOUR;

  const sweatMl = sweatLPerHour * 1000 * hours;
  const baselineMl = weight * BASELINE_ML_PER_KG;
  const totalWaterMl = baselineMl + sweatMl;
  const foodWaterMl = baselineMl * FOOD_WATER_SHARE;
  const drinkMl = Math.max(0, totalWaterMl - foodWaterMl);

  const hourlyRaw = hours > 0 ? sweatMl / hours : 0;
  const hourlyDuringMl = Math.min(hourlyRaw, MAX_HOURLY_INTAKE_ML);
  const duringExposureMl = hourlyDuringMl * hours;
  const restOfDayMl = Math.max(0, drinkMl - duringExposureMl);

  const hiF = heatIndexF(celsiusToFahrenheit(temp), rh);
  const band = bandFor(hiF);

  const sodiumLossMg = (sweatMl / 1000) * SWEAT_SODIUM_MMOL_PER_L * SODIUM_MG_PER_MMOL;

  // Safe drinking water to boil or treat: the household minimum, but never less
  // than what this person alone is being told to drink.
  const householdSafeWaterL = Math.max(
    people * SAFE_WATER_L_PER_PERSON_DAY,
    (drinkMl / 1000) * people,
  );

  return {
    bsa: Math.round(bsa * 100) / 100,
    heatIndexC: Math.round((((hiF - 32) * 5) / 9) * 10) / 10,
    heatIndexF: Math.round(hiF * 10) / 10,
    heatLevel: band.level,
    heatNote: band.note,
    heatIndexOutOfRange: hiF > HEAT_INDEX_CHART_MAX_F,
    uncompensableHeat: eMaxRaw <= 0 || wettedness >= 1,
    exceedsSafeDailyIntake: drinkMl > SAFE_DAILY_INTAKE_CEILING_ML,
    evaporativeCapacity: Math.round(eMax),
    requiredEvaporation: Math.round(eReq),
    wettednessPct: Math.round(wettedness * 100),
    efficiencyPct: Math.round(efficiency * 100),
    sweatLPerHour: Math.round(sweatLPerHour * 100) / 100,
    sweatCapped,
    sweatMl: round(sweatMl, 10),
    baselineMl: round(baselineMl, 10),
    totalWaterMl: round(totalWaterMl, 10),
    foodWaterMl: round(foodWaterMl, 10),
    drinkMl: round(drinkMl, 10),
    duringExposureMl: round(duringExposureMl, 10),
    hourlyDuringMl: round(hourlyDuringMl, 10),
    restOfDayMl: round(restOfDayMl, 10),
    intakeCapped: hourlyRaw > MAX_HOURLY_INTAKE_ML,
    sodiumLossMg: Math.round(sodiumLossMg),
    needsElectrolytes: sweatMl >= ELECTROLYTE_SWEAT_THRESHOLD_ML,
    householdSafeWaterL: Math.round(householdSafeWaterL * 10) / 10,
    glasses250: Math.round(drinkMl / 250),
    activityLabel: activity.label,
  };
}

export default computeMonsoonHydration;
