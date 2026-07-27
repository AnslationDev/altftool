/**
 * Air-Conditioned Office Hydration Planner — pure calculation module.
 *
 * Air conditioning dries indoor air, which raises two small but real losses:
 *   - respiratory water loss (exhaled air is saturated at 37 C regardless of
 *     how dry the air you inhaled was), and
 *   - transepidermal water loss, which is a Fick diffusion flux driven by the
 *     vapour-pressure gap between the skin surface and the room air.
 *
 * Both are computed against a reference comfortable room (22 C, 40% RH) so the
 * figure reported is the EXTRA loss the dry office causes, not the whole thing.
 * The bigger practical problem in an office is simply forgetting to drink, so
 * the module also builds a timed reminder schedule.
 */

/** Total-water adequate intake per kg of body mass, ml/kg/day. */
export const BASELINE_ML_PER_KG = 35;

/** Share of total daily water that arrives in food rather than drink (EFSA: 20-30%). */
export const FOOD_WATER_SHARE = 0.2;

/** Hours awake in a normal day, used to spread the baseline across the clock. */
export const WAKING_HOURS = 16;

/** Magnus-Tetens coefficients over liquid water (WMO CIMO Guide). */
const MAGNUS_A = 6.112;
const MAGNUS_B = 17.62;
const MAGNUS_C = 243.12;

/** rho_v (g/m3) = 216.7 * e(hPa) / T(K). */
const ABS_HUMIDITY_CONST = 216.7;

/** Exhaled air leaves the airway saturated at core temperature. */
const EXPIRED_AIR_TEMP_C = 37;

/** Seated minute ventilation, litres per minute (resting is ~6, desk work ~7). */
const SEATED_VENTILATION_LPM = 7;

/** Skin surface temperature at rest indoors, degrees Celsius. Evaporimetry
 *  treats the skin side of the gradient as saturated at this temperature. */
const SKIN_SURFACE_TEMP_C = 33;

/** Whole-body transepidermal water loss in a comfortable room, ml/day.
 *  Insensible skin loss is conventionally put at roughly 400 ml/day for an adult. */
const REFERENCE_TEWL_ML_PER_DAY = 400;

/** The comfortable reference room the baseline intake already assumes.
 *  ASHRAE Standard 55 recommends indoor relative humidity in the 30-60% band. */
export const REFERENCE_ROOM_TEMP_C = 22;
export const REFERENCE_ROOM_RH = 40;
export const ASHRAE_MIN_COMFORT_RH = 30;
export const ASHRAE_MAX_COMFORT_RH = 60;

/** Caffeine below this daily dose produces no net diuresis in habitual
 *  consumers (Maughan & Griffin, 2003 review of caffeine and fluid balance). */
export const CAFFEINE_NO_EFFECT_MG = 300;

/** Extra urine produced per mg of caffeine above the no-effect dose, ml/mg.
 *  Calibrated so a 400 mg day adds roughly 120 ml, in line with dose-response data. */
const EXTRA_URINE_ML_PER_MG_CAFFEINE = 1.2;

/** EFSA considers single doses up to 200 mg and daily intakes up to 400 mg
 *  safe for healthy non-pregnant adults. */
export const CAFFEINE_DAILY_SAFE_MG = 400;

/** Typical caffeine content per serving, mg. Values are USDA/FDA-typical means. */
export const DRINK_CAFFEINE_MG = {
  coffee: 95, // 240 ml brewed filter coffee
  espresso: 63, // single 30 ml shot
  tea: 47, // 240 ml black tea
  cola: 34, // 330 ml cola
  energy: 80, // 250 ml energy drink
};

/** Container sizes offered for the refill count, ml. */
export const CONTAINER_SIZES = [
  { id: "glass", label: "Glass (250 ml)", ml: 250 },
  { id: "mug", label: "Mug (300 ml)", ml: 300 },
  { id: "bottle500", label: "Bottle (500 ml)", ml: 500 },
  { id: "bottle750", label: "Bottle (750 ml)", ml: 750 },
  { id: "bottle1000", label: "Bottle (1 litre)", ml: 1000 },
];

/** Reminder amounts are rounded to a sensible sip size. */
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

/** "HH:MM" -> minutes after midnight, or null when unparseable. */
export function parseTime(value) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(String(value).trim());
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
}

/** Minutes after midnight -> "HH:MM" on a 24-hour clock. */
export function formatTime(minutes) {
  const total = ((Math.round(minutes) % 1440) + 1440) % 1440;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function round(value, step = 1) {
  return Math.round(value / step) * step;
}

/**
 * @param {object} input
 * @param {number} input.weightKg
 * @param {number} input.roomTempC     office air temperature, Celsius
 * @param {number} input.roomRh        office relative humidity, 0-100
 * @param {string} input.startTime     "HH:MM" start of the working day
 * @param {string} input.endTime       "HH:MM" end of the working day
 * @param {number} input.reminderMins  minutes between reminders
 * @param {object} input.drinks        counts keyed like DRINK_CAFFEINE_MG
 * @param {string} input.containerId   one of CONTAINER_SIZES ids
 */
export function computeOfficeHydration({
  weightKg,
  roomTempC,
  roomRh,
  startTime,
  endTime,
  reminderMins = 60,
  drinks = {},
  containerId = "bottle500",
} = {}) {
  const weight = Number(weightKg);
  const temp = Number(roomTempC);
  const rh = Number(roomRh);
  const interval = Number(reminderMins);

  if (![weight, temp, rh, interval].every((v) => Number.isFinite(v))) {
    return { error: "Enter a number in every field." };
  }
  if (weight <= 0 || weight > 350) return { error: "Enter a body weight between 1 kg and 350 kg." };
  if (temp < 10 || temp > 40) return { error: "Office temperature should be between 10 °C and 40 °C." };
  if (rh < 0 || rh > 100) return { error: "Relative humidity must be between 0% and 100%." };
  if (interval < 15 || interval > 240) {
    return { error: "Set the reminder interval between 15 and 240 minutes." };
  }

  const start = parseTime(startTime);
  const end = parseTime(endTime);
  if (start === null || end === null) {
    return { error: "Enter start and end times as HH:MM, for example 09:30." };
  }
  if (end <= start) return { error: "The end of the working day must be after the start." };

  const workMinutes = end - start;
  if (workMinutes > 16 * 60) return { error: "A working day of more than 16 hours is not supported." };
  const workHours = workMinutes / 60;

  // Caffeine total, mg.
  let caffeineMg = 0;
  for (const [key, perServing] of Object.entries(DRINK_CAFFEINE_MG)) {
    const count = Number(drinks[key]);
    if (!Number.isFinite(count) || count < 0) {
      return { error: "Drink counts cannot be negative or blank — use 0 for none." };
    }
    if (count > 30) return { error: "That is more than 30 servings of one drink — check the counts." };
    caffeineMg += count * perServing;
  }
  const caffeineDiuresisMl =
    caffeineMg > CAFFEINE_NO_EFFECT_MG
      ? (caffeineMg - CAFFEINE_NO_EFFECT_MG) * EXTRA_URINE_ML_PER_MG_CAFFEINE
      : 0;

  // Extra respiratory loss caused by the dry office air, ml over the working day.
  const expiredDensity = absoluteHumidity(EXPIRED_AIR_TEMP_C, 100);
  const officeDensity = absoluteHumidity(temp, rh);
  const referenceDensity = absoluteHumidity(REFERENCE_ROOM_TEMP_C, REFERENCE_ROOM_RH);
  const ventM3PerHour = (SEATED_VENTILATION_LPM * 60) / 1000;
  const respiratoryExtraMl = Math.max(
    0,
    ventM3PerHour * (referenceDensity - officeDensity) * workHours,
  );

  // Extra transepidermal loss, scaled by the vapour-pressure gradient ratio.
  const skinVapourHpa = saturationVapourPressure(SKIN_SURFACE_TEMP_C);
  const officeVapourHpa = (saturationVapourPressure(temp) * rh) / 100;
  const referenceVapourHpa =
    (saturationVapourPressure(REFERENCE_ROOM_TEMP_C) * REFERENCE_ROOM_RH) / 100;
  const officeGradient = Math.max(0, skinVapourHpa - officeVapourHpa);
  const referenceGradient = Math.max(0.1, skinVapourHpa - referenceVapourHpa);
  const tewlPerDayMl = REFERENCE_TEWL_ML_PER_DAY * (officeGradient / referenceGradient);
  const tewlExtraMl = Math.max(
    0,
    ((tewlPerDayMl - REFERENCE_TEWL_ML_PER_DAY) * workHours) / 24,
  );

  const dryAirExtraMl = respiratoryExtraMl + tewlExtraMl;

  // Daily totals.
  const baselineMl = weight * BASELINE_ML_PER_KG;
  const foodWaterMl = baselineMl * FOOD_WATER_SHARE;
  const dailyDrinkMl = Math.max(0, baselineMl - foodWaterMl) + dryAirExtraMl + caffeineDiuresisMl;

  // What of that belongs to the hours at the desk.
  const shareOfDay = Math.min(1, workHours / WAKING_HOURS);
  const officeShareMl =
    (baselineMl - foodWaterMl) * shareOfDay + dryAirExtraMl + caffeineDiuresisMl;
  const outsideOfficeMl = Math.max(0, dailyDrinkMl - officeShareMl);

  // Reminder schedule.
  const reminderCount = Math.max(1, Math.ceil(workMinutes / interval));
  const perReminderMl = Math.max(
    SIP_ROUNDING_ML,
    round(officeShareMl / reminderCount, SIP_ROUNDING_ML),
  );
  const schedule = [];
  for (let i = 0; i < reminderCount; i += 1) {
    schedule.push({
      time: formatTime(start + i * interval),
      amountMl: perReminderMl,
    });
  }
  const scheduledTotalMl = perReminderMl * reminderCount;

  const container =
    CONTAINER_SIZES.find((item) => item.id === containerId) || CONTAINER_SIZES[2];
  const refills = Math.ceil(officeShareMl / container.ml);

  let humidityNote;
  if (rh < ASHRAE_MIN_COMFORT_RH) {
    humidityNote = `At ${Math.round(rh)}% the air is below the ASHRAE comfort band of ${ASHRAE_MIN_COMFORT_RH}-${ASHRAE_MAX_COMFORT_RH}% — expect dry eyes, dry throat and static.`;
  } else if (rh > ASHRAE_MAX_COMFORT_RH) {
    humidityNote = `At ${Math.round(rh)}% the air is above the ASHRAE comfort band of ${ASHRAE_MIN_COMFORT_RH}-${ASHRAE_MAX_COMFORT_RH}% — the room will feel muggy rather than dry.`;
  } else {
    humidityNote = `At ${Math.round(rh)}% the air sits inside the ASHRAE comfort band of ${ASHRAE_MIN_COMFORT_RH}-${ASHRAE_MAX_COMFORT_RH}%.`;
  }

  return {
    workHours: Math.round(workHours * 10) / 10,
    baselineMl: round(baselineMl, 10),
    foodWaterMl: round(foodWaterMl, 10),
    dailyDrinkMl: round(dailyDrinkMl, 10),
    officeShareMl: round(officeShareMl, 10),
    outsideOfficeMl: round(outsideOfficeMl, 10),
    respiratoryExtraMl: Math.round(respiratoryExtraMl),
    tewlExtraMl: Math.round(tewlExtraMl),
    dryAirExtraMl: Math.round(dryAirExtraMl),
    caffeineMg: Math.round(caffeineMg),
    caffeineDiuresisMl: Math.round(caffeineDiuresisMl),
    caffeineOverSafeLimit: caffeineMg > CAFFEINE_DAILY_SAFE_MG,
    officeAbsoluteHumidity: Math.round(officeDensity * 100) / 100,
    referenceAbsoluteHumidity: Math.round(referenceDensity * 100) / 100,
    humidityNote,
    schedule,
    perReminderMl,
    reminderCount,
    scheduledTotalMl,
    containerLabel: container.label,
    refills,
  };
}

export default computeOfficeHydration;
