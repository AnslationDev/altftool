/**
 * Dehumidifier sizing from a psychrometric moisture balance.
 *
 * The room needs a machine that removes at least as much water per day as gets
 * into it. Water enters by (a) infiltration of humid ambient air, (b) people,
 * (c) indoor-dried laundry and showers, (d) evaporation off damp masonry.
 * Humidity ratios come from the Magnus/Alduchov-Eskridge saturation-vapour
 * equation, so the answer is a real moisture mass balance rather than a
 * lookup table.
 */

/** Standard sea-level atmospheric pressure, kPa (ISO 2533). */
export const ATM_PRESSURE_KPA = 101.325;

/** Density of air at ~20 C, sea level, kg/m3 (ISO 2533). */
export const AIR_DENSITY_KG_M3 = 1.2;

/** Ratio of the molar mass of water vapour to that of dry air (18.015/28.966). */
export const MOLAR_MASS_RATIO = 0.62198;

/** International foot -> metre (1959 international yard and pound agreement). */
export const FT_TO_M = 0.3048;

/** Square foot -> square metre (FT_TO_M squared). */
export const SQFT_TO_SQM = 0.09290304;

/**
 * Consumer/portable dehumidifiers sold in India, Europe and Australia quote
 * extraction at 30 C / 80% RH. US AHAM ratings use 65 F / 60% RH and read far
 * lower for the same machine, which is why nameplate litres must be corrected
 * to the conditions the unit will actually see.
 */
export const RATED_TEMP_C = 30;
export const RATED_RH_PCT = 80;

/**
 * Damp severity -> assumed air changes per hour and an evaporation allowance
 * off wet walls and floors. ACH values bracket the ASHRAE 62.2 minimum
 * dwelling ventilation rate (0.35 ACH) up to a leaky, seepage-prone room.
 */
export const DAMP_LEVELS = {
  slight: {
    id: "slight",
    label: "Slightly damp",
    hint: "Musty smell now and then, no visible marks",
    ach: 0.35,
    surfaceEvapLPerSqmDay: 0,
  },
  moderate: {
    id: "moderate",
    label: "Moderately damp",
    hint: "Damp smell in humid weather, condensation on windows",
    ach: 0.6,
    surfaceEvapLPerSqmDay: 0,
  },
  very: {
    id: "very",
    label: "Very damp",
    hint: "Damp patches on walls, clothes feel clammy",
    ach: 0.9,
    surfaceEvapLPerSqmDay: 0.05,
  },
  wet: {
    id: "wet",
    label: "Wet / seepage",
    hint: "Visible seepage, salt bloom or standing water",
    ach: 1.3,
    surfaceEvapLPerSqmDay: 0.15,
  },
};

/**
 * Latent moisture output of a resting/lightly active adult is about 45 g/h
 * (ASHRAE Handbook - Fundamentals, latent heat gain per occupant). Over the
 * ~22 h a bedroom or living room is realistically occupied that is ~1 litre.
 */
export const OCCUPANT_L_PER_DAY = 1.0;

/** A 5 kg wash load holds roughly 2 litres of water after a normal spin. */
export const LAUNDRY_L_PER_LOAD = 2.0;

/** A hot shower releases about 0.25 litres of vapour into the home. */
export const SHOWER_L_EACH = 0.25;

/** Size for ~80% duty cycle, not 100%, so the unit can recover after a wet day. */
export const SAFETY_FACTOR = 1.2;

/** Common consumer dehumidifier nameplate sizes, litres/day at 30 C / 80% RH. */
export const STANDARD_SIZES_L_PER_DAY = [10, 12, 16, 20, 25, 30, 38, 50, 60, 70, 90];

/**
 * Specific moisture extraction rate of a typical compressor dehumidifier at its
 * 30 C / 80% RH rating point, litres removed per kWh. Desiccant units are lower
 * (about 1.0-1.4 L/kWh) but keep working in cold rooms.
 */
export const RATED_SMER_L_PER_KWH = 2.0;

/** Average days in a month (365.25 / 12) for the monthly cost figure. */
export const DAYS_PER_MONTH = 30.4375;

/**
 * Saturation vapour pressure over liquid water, kPa.
 * Alduchov & Eskridge (1996) refinement of the Magnus form; valid -40..50 C.
 */
export function saturationVapourPressureKpa(tempC) {
  return 0.61094 * Math.exp((17.625 * tempC) / (tempC + 243.04));
}

/**
 * Humidity ratio (kg water vapour per kg dry air) at a temperature and RH.
 * w = 0.62198 * Pv / (P - Pv)
 */
export function humidityRatio(tempC, rhPct) {
  const pv = (rhPct / 100) * saturationVapourPressureKpa(tempC);
  const denominator = ATM_PRESSURE_KPA - pv;
  if (!(denominator > 0)) return 0;
  return (MOLAR_MASS_RATIO * pv) / denominator;
}

/** Smallest catalogue size at or above the requirement; null if none is big enough. */
export function pickStandardSize(litresPerDay) {
  for (const size of STANDARD_SIZES_L_PER_DAY) {
    if (size >= litresPerDay) return size;
  }
  return null;
}

/**
 * @param {object} input
 * @param {number} input.area          floor area in areaUnit
 * @param {"sqft"|"sqm"} input.areaUnit
 * @param {number} input.height        ceiling height in heightUnit
 * @param {"ft"|"m"} input.heightUnit
 * @param {number} input.tempC         room temperature, Celsius
 * @param {number} input.ambientRh     current / ambient relative humidity, %
 * @param {number} input.targetRh      relative humidity you want to hold, %
 * @param {string} input.dampLevel     key of DAMP_LEVELS
 * @param {number} input.occupants     people regularly in the space
 * @param {number} input.laundryLoads  wash loads dried indoors per day
 * @param {number} input.showers       showers taken in the space per day
 * @param {number} input.tariff        electricity price per kWh
 */
export function computeDehumidifier({
  area,
  areaUnit = "sqft",
  height,
  heightUnit = "ft",
  tempC,
  ambientRh,
  targetRh,
  dampLevel = "moderate",
  occupants = 0,
  laundryLoads = 0,
  showers = 0,
  tariff = 0,
} = {}) {
  const numbers = { area, height, tempC, ambientRh, targetRh, occupants, laundryLoads, showers, tariff };
  for (const [key, value] of Object.entries(numbers)) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      return { error: `Enter a valid number for ${key}.` };
    }
  }

  const damp = DAMP_LEVELS[dampLevel];
  if (!damp) return { error: "Choose how damp the space is." };

  if (!(area > 0)) return { error: "Floor area must be greater than zero." };
  if (!(height > 0)) return { error: "Ceiling height must be greater than zero." };
  if (tempC < 5 || tempC > 45) {
    return { error: "Room temperature should be between 5 C and 45 C for this estimate." };
  }
  if (ambientRh <= 0 || ambientRh > 100) return { error: "Current humidity must be between 1% and 100%." };
  if (targetRh <= 0 || targetRh >= 100) return { error: "Target humidity must be between 1% and 99%." };
  if (targetRh >= ambientRh) {
    return { error: "Target humidity must be lower than the current humidity — there is nothing to remove." };
  }
  if (occupants < 0 || laundryLoads < 0 || showers < 0 || tariff < 0) {
    return { error: "Occupants, laundry, showers and tariff cannot be negative." };
  }

  const areaSqm = areaUnit === "sqm" ? area : area * SQFT_TO_SQM;
  const heightM = heightUnit === "m" ? height : height * FT_TO_M;
  const volumeM3 = areaSqm * heightM;

  const wAmbient = humidityRatio(tempC, ambientRh);
  const wTarget = humidityRatio(tempC, targetRh);
  const deltaW = wAmbient - wTarget;

  // Air brought in by infiltration must be dried from ambient down to target.
  const airMassPerDayKg = damp.ach * volumeM3 * AIR_DENSITY_KG_M3 * 24;
  const infiltrationL = airMassPerDayKg * deltaW;

  const occupantL = occupants * OCCUPANT_L_PER_DAY;
  const laundryL = laundryLoads * LAUNDRY_L_PER_LOAD;
  const showerL = showers * SHOWER_L_EACH;
  const surfaceL = areaSqm * damp.surfaceEvapLPerSqmDay;

  const dailyLoadL = infiltrationL + occupantL + laundryL + showerL + surfaceL;
  if (!(dailyLoadL > 0)) {
    return { error: "This space has no measurable moisture load — a dehumidifier would not run." };
  }

  const requiredAtRoomL = dailyLoadL * SAFETY_FACTOR;

  // A machine's nameplate is measured at 30 C / 80% RH. Extraction falls roughly
  // in proportion to the humidity ratio of the air it is actually fed, so derate
  // by the ratio of operating to rated humidity ratio. The unit spends its life
  // between the starting and target humidity, so use the midpoint.
  const operatingRh = (ambientRh + targetRh) / 2;
  const wOperating = humidityRatio(tempC, operatingRh);
  const wRated = humidityRatio(RATED_TEMP_C, RATED_RH_PCT);
  const rawFactor = wRated > 0 ? wOperating / wRated : 0;
  const capacityFactor = Math.min(1.6, Math.max(0.15, rawFactor));

  const nameplateNeededL = requiredAtRoomL / capacityFactor;
  const picked = pickStandardSize(nameplateNeededL);
  const maxSize = STANDARD_SIZES_L_PER_DAY[STANDARD_SIZES_L_PER_DAY.length - 1];
  const recommendedSizeL = picked ?? maxSize;
  const unitsNeeded = picked ? 1 : Math.ceil(nameplateNeededL / maxSize);

  const deliveredLPerDay = recommendedSizeL * capacityFactor * unitsNeeded;
  const dutyCyclePct = Math.min(100, (dailyLoadL / deliveredLPerDay) * 100);
  const runtimeHoursPerDay = (dutyCyclePct / 100) * 24;

  // Power draw is near constant while the compressor runs, so the real-world
  // litres-per-kWh falls with the same derating factor as extraction.
  const effectiveSmer = RATED_SMER_L_PER_KWH * capacityFactor;
  const dailyKwh = dailyLoadL / effectiveSmer;
  const dailyCost = dailyKwh * tariff;
  const monthlyKwh = dailyKwh * DAYS_PER_MONTH;
  const monthlyCost = monthlyKwh * tariff;

  // One-off water held in the room air above the target, and how long the
  // chosen machine takes to pull it out while the daily load keeps arriving.
  const pullDownWaterL = volumeM3 * AIR_DENSITY_KG_M3 * deltaW;
  const netRateLPerHour = (deliveredLPerDay - dailyLoadL) / 24;
  const pullDownHours = netRateLPerHour > 0 ? pullDownWaterL / netRateLPerHour : null;

  const breakdown = [
    { key: "infiltration", label: "Humid air leaking in", litres: infiltrationL },
    { key: "occupants", label: "People breathing and perspiring", litres: occupantL },
    { key: "laundry", label: "Laundry dried indoors", litres: laundryL },
    { key: "showers", label: "Showers and bathing", litres: showerL },
    { key: "surface", label: "Evaporation off damp walls and floor", litres: surfaceL },
  ]
    .filter((row) => row.litres > 0)
    .map((row) => ({ ...row, sharePct: (row.litres / dailyLoadL) * 100 }));

  return {
    areaSqm,
    heightM,
    volumeM3,
    ach: damp.ach,
    dampLabel: damp.label,
    wAmbient,
    wTarget,
    deltaW,
    dailyLoadL,
    requiredAtRoomL,
    capacityFactor,
    operatingRh,
    nameplateNeededL,
    recommendedSizeL,
    unitsNeeded,
    deliveredLPerDay,
    dutyCyclePct,
    runtimeHoursPerDay,
    effectiveSmer,
    dailyKwh,
    dailyCost,
    monthlyKwh,
    monthlyCost,
    pullDownWaterL,
    pullDownHours,
    breakdown,
  };
}
