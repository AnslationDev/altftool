/**
 * Flight Hydration Planner — pure calculation module.
 *
 * Cabin air really is dry — pressurised to a cabin altitude of up to 8,000 ft
 * with relative humidity typically 10-20% — but the water that costs you is
 * smaller than the folklore suggests. The dry air is computed honestly here
 * from psychrometrics (extra respiratory and transepidermal loss against a
 * normal 22 C / 40% RH room), and the results usually show alcohol mattering
 * several times more than the air does.
 *
 * All time arithmetic is pure: departure time and UTC offsets come in as
 * arguments, nothing reads the system clock.
 */

/** Total-water adequate intake per kg of body mass, ml/kg/day. */
export const BASELINE_ML_PER_KG = 35;

/** Share of total daily water that arrives in food rather than drink. */
export const FOOD_WATER_SHARE = 0.2;

/** Hours awake in a normal day, used to prorate the baseline to flight length. */
const WAKING_HOURS = 16;

/** Magnus-Tetens coefficients over liquid water (WMO CIMO Guide). */
const MAGNUS_A = 6.112;
const MAGNUS_B = 17.62;
const MAGNUS_C = 243.12;

/** rho_v (g/m3) = 216.7 * e(hPa) / T(K). */
const ABS_HUMIDITY_CONST = 216.7;

/** Seated minute ventilation, litres per minute. */
const SEATED_VENTILATION_LPM = 7;

/** Skin surface temperature; the skin side of the evaporation gradient. */
const SKIN_SURFACE_TEMP_C = 33;

/** Whole-body transepidermal water loss in a normal room, ml/day. */
const REFERENCE_TEWL_ML_PER_DAY = 400;

/** The ordinary room the baseline intake assumes. */
const REFERENCE_ROOM_TEMP_C = 22;
const REFERENCE_ROOM_RH = 40;

/** Typical cabin conditions. FAA/EASA require cabin pressure altitude at or
 *  below 8,000 ft in normal operation; humidity commonly runs 10-20%. */
export const DEFAULT_CABIN_TEMP_C = 23;
export const DEFAULT_CABIN_RH = 12;
export const MAX_CABIN_ALTITUDE_FT = 8000;

/** Ethanol density, g/ml, and its diuretic effect: roughly 10 ml of extra urine
 *  is produced per gram of ethanol consumed. */
const ETHANOL_DENSITY_G_PER_ML = 0.789;
export const ETHANOL_DIURESIS_ML_PER_G = 10;

/** Standard drink options. Ethanol grams are computed from volume and ABV. */
export const DRINK_TYPES = [
  { id: "beer", label: "Beer (330 ml, 5%)", ml: 330, abv: 5 },
  { id: "wine", label: "Wine (150 ml, 12%)", ml: 150, abv: 12 },
  { id: "spirit", label: "Spirit measure (30 ml, 40%)", ml: 30, abv: 40 },
];

/** Caffeine below this daily dose produces no net diuresis in habitual drinkers. */
export const CAFFEINE_NO_EFFECT_MG = 300;
const EXTRA_URINE_ML_PER_MG_CAFFEINE = 1.2;

/** Typical caffeine per serving, mg. */
export const CAFFEINE_PER_COFFEE_MG = 95;
export const CAFFEINE_PER_TEA_MG = 47;

/** Caffeine's mean elimination half-life is about 5 hours, and trials show a
 *  dose 6 hours before bed still measurably disrupts sleep. */
export const CAFFEINE_CUTOFF_HOURS_BEFORE_SLEEP = 6;

/** Jet lag recovery is conventionally about one day per time zone crossed. */
export const JETLAG_DAYS_PER_ZONE = 1;

/** Reminder amounts are rounded to this sip size, ml. */
const SIP_ROUNDING_ML = 25;

/** Saturation vapour pressure over water, hPa. */
export function saturationVapourPressure(tC) {
  return MAGNUS_A * Math.exp((MAGNUS_B * tC) / (MAGNUS_C + tC));
}

/** Absolute humidity, g of water per m3 of air. */
export function absoluteHumidity(tC, rhPct) {
  const e = (saturationVapourPressure(tC) * rhPct) / 100;
  return (ABS_HUMIDITY_CONST * e) / (tC + 273.15);
}

/** Grams of ethanol in a drink of the given volume and strength. */
export function ethanolGrams(volumeMl, abvPct) {
  return volumeMl * (abvPct / 100) * ETHANOL_DENSITY_G_PER_ML;
}

/** "HH:MM" -> minutes after midnight, or null when unparseable. */
export function parseTime(value) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(String(value).trim());
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
}

/** Minutes after midnight -> "HH:MM", wrapping across days. */
export function formatTime(minutes) {
  const total = ((Math.round(minutes) % 1440) + 1440) % 1440;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** How many whole days a time crosses relative to midnight of day zero. */
export function dayOffset(minutes) {
  return Math.floor(minutes / 1440);
}

function round(value, step = 1) {
  return Math.round(value / step) * step;
}

/**
 * @param {object} input
 * @param {number} input.weightKg
 * @param {number} input.flightHours
 * @param {number} input.cabinTempC
 * @param {number} input.cabinRh
 * @param {object} input.drinks          counts keyed by DRINK_TYPES id
 * @param {number} input.coffees
 * @param {number} input.teas
 * @param {string} input.departTime      "HH:MM" local at origin
 * @param {number} input.originUtcOffset hours, e.g. 5.5 for IST
 * @param {number} input.destUtcOffset   hours
 * @param {string} input.destBedtime     "HH:MM" intended local bedtime at destination
 */
export function computeFlightHydration({
  weightKg,
  flightHours,
  cabinTempC = DEFAULT_CABIN_TEMP_C,
  cabinRh = DEFAULT_CABIN_RH,
  drinks = {},
  coffees = 0,
  teas = 0,
  departTime = "10:00",
  originUtcOffset = 0,
  destUtcOffset = 0,
  destBedtime = "23:00",
} = {}) {
  const weight = Number(weightKg);
  const hours = Number(flightHours);
  const temp = Number(cabinTempC);
  const rh = Number(cabinRh);
  const coffeeCount = Number(coffees);
  const teaCount = Number(teas);
  const originOffset = Number(originUtcOffset);
  const destOffset = Number(destUtcOffset);

  if (
    ![weight, hours, temp, rh, coffeeCount, teaCount, originOffset, destOffset].every((v) =>
      Number.isFinite(v),
    )
  ) {
    return { error: "Enter a number in every field." };
  }
  if (weight < 1 || weight > 350) return { error: "Enter a body weight between 1 kg and 350 kg." };
  if (hours <= 0) return { error: "Flight time must be greater than zero." };
  if (hours > 20) return { error: "Enter a flight time of 20 hours or less." };
  if (temp < 10 || temp > 35) return { error: "Cabin temperature should be between 10 °C and 35 °C." };
  if (rh < 0 || rh > 100) return { error: "Cabin humidity must be between 0% and 100%." };
  if (coffeeCount < 0 || teaCount < 0) return { error: "Drink counts cannot be negative." };
  if (coffeeCount > 20 || teaCount > 20) return { error: "Enter 20 servings or fewer per drink." };
  if (originOffset < -12 || originOffset > 14 || destOffset < -12 || destOffset > 14) {
    return { error: "UTC offsets must be between -12 and +14 hours." };
  }

  let alcoholGrams = 0;
  let alcoholVolumeMl = 0;
  for (const type of DRINK_TYPES) {
    const count = Number(drinks[type.id] ?? 0);
    if (!Number.isFinite(count) || count < 0) {
      return { error: "Alcoholic drink counts cannot be negative or blank — use 0 for none." };
    }
    if (count > 20) return { error: "Enter 20 alcoholic drinks or fewer of each type." };
    alcoholGrams += count * ethanolGrams(type.ml, type.abv);
    alcoholVolumeMl += count * type.ml;
  }
  const alcoholDiuresisMl = alcoholGrams * ETHANOL_DIURESIS_ML_PER_G;

  const caffeineMg = coffeeCount * CAFFEINE_PER_COFFEE_MG + teaCount * CAFFEINE_PER_TEA_MG;
  const caffeineDiuresisMl =
    caffeineMg > CAFFEINE_NO_EFFECT_MG
      ? (caffeineMg - CAFFEINE_NO_EFFECT_MG) * EXTRA_URINE_ML_PER_MG_CAFFEINE
      : 0;

  // Extra respiratory loss caused by dry cabin air.
  const cabinDensity = absoluteHumidity(temp, rh);
  const referenceDensity = absoluteHumidity(REFERENCE_ROOM_TEMP_C, REFERENCE_ROOM_RH);
  const ventM3PerHour = (SEATED_VENTILATION_LPM * 60) / 1000;
  const respiratoryExtraMl = Math.max(
    0,
    ventM3PerHour * (referenceDensity - cabinDensity) * hours,
  );

  // Extra transepidermal loss, scaled by the vapour-pressure gradient ratio.
  const skinVapourHpa = saturationVapourPressure(SKIN_SURFACE_TEMP_C);
  const cabinVapourHpa = (saturationVapourPressure(temp) * rh) / 100;
  const referenceVapourHpa =
    (saturationVapourPressure(REFERENCE_ROOM_TEMP_C) * REFERENCE_ROOM_RH) / 100;
  const cabinGradient = Math.max(0, skinVapourHpa - cabinVapourHpa);
  const referenceGradient = Math.max(0.1, skinVapourHpa - referenceVapourHpa);
  const tewlPerDayMl = REFERENCE_TEWL_ML_PER_DAY * (cabinGradient / referenceGradient);
  const tewlExtraMl = Math.max(0, ((tewlPerDayMl - REFERENCE_TEWL_ML_PER_DAY) * hours) / 24);

  const dryAirExtraMl = respiratoryExtraMl + tewlExtraMl;

  const baselineDailyDrinkMl = weight * BASELINE_ML_PER_KG * (1 - FOOD_WATER_SHARE);
  const baselineShareMl = baselineDailyDrinkMl * (hours / WAKING_HOURS);

  const totalDrinkMl =
    baselineShareMl + dryAirExtraMl + alcoholDiuresisMl + caffeineDiuresisMl;
  const hourlyMl = totalDrinkMl / hours;

  // Hourly schedule, in elapsed flight hours. Each slot is rounded to a
  // sip-friendly 25 ml step using cumulative (Bresenham-style) rounding, so
  // individual amounts stay tidy while the running total tracks the ideal
  // proportional split closely. Any residual left by that per-slot rounding
  // is then folded back in (borrowing from later slots first, then earlier
  // ones) so the schedule's own total always reconciles exactly with
  // totalDrinkMl below - the number the headline figure and copy summary
  // actually show the user.
  const totalDrinkMlRounded = round(totalDrinkMl, 10);
  const slots = Math.max(1, Math.round(hours));
  const schedule = [];
  {
    let cumulativeTarget = 0;
    let cumulativeRounded = 0;
    for (let i = 0; i < slots; i += 1) {
      cumulativeTarget += totalDrinkMlRounded / slots;
      const nextCumulativeRounded = round(cumulativeTarget, SIP_ROUNDING_ML);
      const amountMl = Math.max(0, nextCumulativeRounded - cumulativeRounded);
      cumulativeRounded += amountMl;
      schedule.push({ hour: i + 1, amountMl });
    }
    let remaining = totalDrinkMlRounded - cumulativeRounded;
    for (let i = schedule.length - 1; i >= 0 && remaining !== 0; i -= 1) {
      const slot = schedule[i];
      if (remaining > 0) {
        slot.amountMl += remaining;
        remaining = 0;
      } else {
        const reducible = Math.min(slot.amountMl, -remaining);
        slot.amountMl -= reducible;
        remaining += reducible;
      }
    }
    let cumulativeMl = 0;
    for (const slot of schedule) {
      cumulativeMl += slot.amountMl;
      slot.cumulativeMl = cumulativeMl;
    }
  }
  const perSlotMl = Math.round(totalDrinkMlRounded / slots);

  // Time arithmetic.
  const depart = parseTime(departTime);
  const bedtime = parseTime(destBedtime);
  if (depart === null || bedtime === null) {
    return { error: "Enter departure time and destination bedtime as HH:MM, for example 21:30." };
  }

  const offsetShiftHours = destOffset - originOffset;
  const arrivalRawMinutes = depart + hours * 60 + offsetShiftHours * 60;
  const arrivalLocalTime = formatTime(arrivalRawMinutes);
  const arrivalDayOffset = dayOffset(arrivalRawMinutes);

  const cutoffRawMinutes = bedtime - CAFFEINE_CUTOFF_HOURS_BEFORE_SLEEP * 60;
  const caffeineCutoffDest = formatTime(cutoffRawMinutes);
  const caffeineCutoffOrigin = formatTime(cutoffRawMinutes - offsetShiftHours * 60);

  const zonesCrossed = Math.abs(offsetShiftHours);
  const direction =
    offsetShiftHours > 0 ? "eastward" : offsetShiftHours < 0 ? "westward" : "none";

  return {
    baselineShareMl: round(baselineShareMl, 10),
    respiratoryExtraMl: Math.round(respiratoryExtraMl),
    tewlExtraMl: Math.round(tewlExtraMl),
    dryAirExtraMl: Math.round(dryAirExtraMl),
    alcoholGrams: Math.round(alcoholGrams * 10) / 10,
    alcoholVolumeMl: Math.round(alcoholVolumeMl),
    alcoholDiuresisMl: Math.round(alcoholDiuresisMl),
    caffeineMg: Math.round(caffeineMg),
    caffeineDiuresisMl: Math.round(caffeineDiuresisMl),
    totalDrinkMl: totalDrinkMlRounded,
    hourlyMl: round(hourlyMl, 5),
    perSlotMl,
    schedule,
    cabinAbsoluteHumidity: Math.round(cabinDensity * 100) / 100,
    referenceAbsoluteHumidity: Math.round(referenceDensity * 100) / 100,
    alcoholOutweighsAir: alcoholDiuresisMl > dryAirExtraMl,
    arrivalLocalTime,
    arrivalDayOffset,
    offsetShiftHours: Math.round(offsetShiftHours * 10) / 10,
    zonesCrossed: Math.round(zonesCrossed * 10) / 10,
    direction,
    jetlagDays: Math.round(zonesCrossed * JETLAG_DAYS_PER_ZONE),
    caffeineCutoffDest,
    caffeineCutoffOrigin,
    bottlesOf500: Math.ceil(totalDrinkMl / 500),
  };
}

export default computeFlightHydration;
