/**
 * Room humidity and comfort checker.
 *
 * Everything here comes from three well-defined pieces of psychrometry.
 *
 * 1. SATURATION VAPOUR PRESSURE — the Magnus form recommended by the WMO,
 *      es(T) = 6.112 x exp(17.62 T / (243.12 + T))   hPa
 *    accurate to about 0.1% between -45 and +60 degrees C.
 *
 * 2. DEW POINT — the same relation inverted,
 *      g  = ln(RH/100) + 17.62 T / (243.12 + T)
 *      Td = 243.12 g / (17.62 - g)
 *
 * 3. ABSOLUTE HUMIDITY — the ideal gas law for water vapour,
 *      AH = Pv / (Rv x T_kelvin),  Rv = 461.5 J/(kg K)
 *
 * The apparent temperature uses the Rothfusz regression published by the US
 * National Weather Service, including its two published correction terms.
 */

/** Magnus coefficients over water, WMO recommendation. */
export const MAGNUS_B = 17.62;
export const MAGNUS_C = 243.12;
/** Saturation vapour pressure at 0 degrees C, hPa. */
export const ES_AT_ZERO_HPA = 6.112;
/** Specific gas constant for water vapour, J/(kg K). */
export const R_VAPOUR = 461.5;
/** Ratio of the molar masses of water and dry air. */
export const MOLAR_RATIO = 0.621945;
/** Standard sea-level pressure, hPa. */
export const STANDARD_PRESSURE_HPA = 1013.25;
export const KELVIN_OFFSET = 273.15;

/**
 * Comfort bands. ASHRAE 55 puts the summer operative temperature band for
 * lightly clothed, sedentary occupants at roughly 23 to 26 degrees C, and the
 * winter band at 20 to 23.5. Relative humidity between 30% and 60% is the range
 * normally maintained; ASHRAE 55 itself sets no lower humidity limit and caps
 * the upper end by humidity ratio rather than RH.
 */
export const COMFORT_TEMP_MIN_C = 23;
export const COMFORT_TEMP_MAX_C = 26;
export const COMFORT_RH_MIN = 30;
export const COMFORT_RH_MAX = 60;

/** ASHRAE 55 upper humidity limit, expressed as a humidity ratio in kg/kg. */
export const ASHRAE_MAX_HUMIDITY_RATIO = 0.012;

/**
 * Mould germinates where the relative humidity AT THE SURFACE stays above about
 * 80% (BS 5250 and WHO indoor-damp guidance). Because surfaces are cooler than
 * room air, a room RH near 70% is already enough to push a cold external wall
 * past that limit. House dust mites need roughly 50% RH to keep their water
 * balance, which is why 45 to 50% is the target in allergy guidance.
 */
export const SURFACE_MOULD_RH = 80;
export const ROOM_MOULD_WATCH_RH = 70;
export const DUST_MITE_RH = 50;

export const MIN_TEMP_C = -20;
export const MAX_TEMP_C = 60;
export const MAX_ROOM_VOLUME_M3 = 5000;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const round1 = (value) => Math.round(value * 10) / 10;
const round2 = (value) => Math.round(value * 100) / 100;
const round3 = (value) => Math.round(value * 1000) / 1000;

/** Saturation vapour pressure over water, hPa. */
export function saturationVapourPressure(tempC) {
  if (!isNum(tempC)) return NaN;
  return ES_AT_ZERO_HPA * Math.exp((MAGNUS_B * tempC) / (MAGNUS_C + tempC));
}

/**
 * Dew point from temperature and relative humidity, degrees C.
 * @returns {number} Dew point, or NaN when RH is 0 or out of range.
 */
export function dewPoint(tempC, relativeHumidity) {
  if (!isNum(tempC) || !isNum(relativeHumidity)) return NaN;
  if (relativeHumidity <= 0 || relativeHumidity > 100) return NaN;
  const gamma =
    Math.log(relativeHumidity / 100) + (MAGNUS_B * tempC) / (MAGNUS_C + tempC);
  return (MAGNUS_C * gamma) / (MAGNUS_B - gamma);
}

/** Absolute humidity in grams of water per cubic metre of air. */
export function absoluteHumidity(tempC, relativeHumidity) {
  if (!isNum(tempC) || !isNum(relativeHumidity)) return NaN;
  if (relativeHumidity < 0 || relativeHumidity > 100) return NaN;
  const pvPa = (relativeHumidity / 100) * saturationVapourPressure(tempC) * 100;
  return (pvPa / (R_VAPOUR * (tempC + KELVIN_OFFSET))) * 1000;
}

/** Humidity ratio in grams of water per kilogram of dry air. */
export function humidityRatio(tempC, relativeHumidity, pressureHpa = STANDARD_PRESSURE_HPA) {
  if (!isNum(tempC) || !isNum(relativeHumidity) || !isNum(pressureHpa)) return NaN;
  if (relativeHumidity < 0 || relativeHumidity > 100 || pressureHpa <= 0) return NaN;
  const pv = (relativeHumidity / 100) * saturationVapourPressure(tempC);
  if (pv >= pressureHpa) return NaN;
  return MOLAR_RATIO * (pv / (pressureHpa - pv)) * 1000;
}

/**
 * NWS heat index (apparent temperature) in degrees C.
 * Uses the simple Steadman average first and only applies the Rothfusz
 * regression when that average reaches 80 F, exactly as the NWS specifies.
 */
export function heatIndexC(tempC, relativeHumidity) {
  if (!isNum(tempC) || !isNum(relativeHumidity)) return NaN;
  if (relativeHumidity < 0 || relativeHumidity > 100) return NaN;
  const t = (tempC * 9) / 5 + 32;
  const r = relativeHumidity;

  const simple = 0.5 * (t + 61.0 + (t - 68.0) * 1.2 + r * 0.094);
  if ((simple + t) / 2 < 80) return ((simple - 32) * 5) / 9;

  let hi =
    -42.379 +
    2.04901523 * t +
    10.14333127 * r -
    0.22475541 * t * r -
    0.00683783 * t * t -
    0.05481717 * r * r +
    0.00122874 * t * t * r +
    0.00085282 * t * r * r -
    0.00000199 * t * t * r * r;

  // Published corrections at the dry and humid extremes.
  if (r < 13 && t >= 80 && t <= 112) {
    hi -= ((13 - r) / 4) * Math.sqrt((17 - Math.abs(t - 95)) / 17);
  } else if (r > 85 && t >= 80 && t <= 87) {
    hi += ((r - 85) / 10) * ((87 - t) / 5);
  }
  return ((hi - 32) * 5) / 9;
}

/**
 * @param {object} input
 * @param {number} input.temperatureC       Room air temperature.
 * @param {number} input.relativeHumidity   Room RH, 1 to 100.
 * @param {number} [input.surfaceTempC]     Coldest surface: window glass, outer wall.
 * @param {number} [input.targetHumidity]   RH you want to reach.
 * @param {number} [input.roomVolumeM3]     Room volume, for the water-to-remove figure.
 * @param {number} [input.pressureHpa]      Local air pressure.
 * @returns {object} Psychrometrics and verdicts, or { error } for bad input.
 */
export function checkRoomComfort({
  temperatureC,
  relativeHumidity,
  surfaceTempC,
  targetHumidity = 50,
  roomVolumeM3 = 0,
  pressureHpa = STANDARD_PRESSURE_HPA,
} = {}) {
  const raw = { temperatureC, relativeHumidity, targetHumidity, roomVolumeM3, pressureHpa };
  if (Object.values(raw).some((value) => !isNum(value))) {
    return { error: "Enter a valid number for temperature, humidity, target and volume." };
  }
  if (temperatureC < MIN_TEMP_C || temperatureC > MAX_TEMP_C) {
    return { error: `Room temperature must be between ${MIN_TEMP_C} and ${MAX_TEMP_C} degrees C.` };
  }
  if (relativeHumidity <= 0 || relativeHumidity > 100) {
    return { error: "Relative humidity must be above 0% and no more than 100%." };
  }
  if (targetHumidity <= 0 || targetHumidity > 100) {
    return { error: "Target humidity must be above 0% and no more than 100%." };
  }
  if (roomVolumeM3 < 0 || roomVolumeM3 > MAX_ROOM_VOLUME_M3) {
    return { error: `Room volume must be between 0 and ${MAX_ROOM_VOLUME_M3} cubic metres.` };
  }
  if (pressureHpa < 500 || pressureHpa > 1100) {
    return { error: "Air pressure must be between 500 and 1100 hPa." };
  }
  const hasSurface = isNum(surfaceTempC);
  if (hasSurface && (surfaceTempC < MIN_TEMP_C - 20 || surfaceTempC > MAX_TEMP_C)) {
    return { error: "Surface temperature is outside a believable range." };
  }

  const es = saturationVapourPressure(temperatureC);
  const pv = (relativeHumidity / 100) * es;
  const td = dewPoint(temperatureC, relativeHumidity);
  const ah = absoluteHumidity(temperatureC, relativeHumidity);
  const w = humidityRatio(temperatureC, relativeHumidity, pressureHpa);
  const hi = heatIndexC(temperatureC, relativeHumidity);

  // What the same air would read against a cold surface.
  const surfaceRh = hasSurface
    ? Math.min(100, (pv / saturationVapourPressure(surfaceTempC)) * 100)
    : NaN;
  const condensing = hasSurface ? surfaceTempC <= td : false;
  const surfaceMargin = hasSurface ? surfaceTempC - td : NaN;

  const tempVerdict =
    temperatureC < COMFORT_TEMP_MIN_C - 3
      ? "cold"
      : temperatureC < COMFORT_TEMP_MIN_C
        ? "cool"
        : temperatureC <= COMFORT_TEMP_MAX_C
          ? "comfortable"
          : temperatureC <= COMFORT_TEMP_MAX_C + 3
            ? "warm"
            : "hot";

  const humidityVerdict =
    relativeHumidity < COMFORT_RH_MIN
      ? "dry"
      : relativeHumidity <= COMFORT_RH_MAX
        ? "comfortable"
        : relativeHumidity <= ROOM_MOULD_WATCH_RH
          ? "humid"
          : "very humid";

  const inComfortZone = tempVerdict === "comfortable" && humidityVerdict === "comfortable";

  const overAshraeLimit = w / 1000 > ASHRAE_MAX_HUMIDITY_RATIO;
  const mouldRisk = relativeHumidity >= ROOM_MOULD_WATCH_RH || (hasSurface && surfaceRh >= SURFACE_MOULD_RH);
  const dustMiteRisk = relativeHumidity >= DUST_MITE_RH;
  const tooDry = relativeHumidity < COMFORT_RH_MIN;

  // Water to add or remove to reach the target at the same temperature.
  const targetAh = absoluteHumidity(temperatureC, targetHumidity);
  const deltaAhGPerM3 = ah - targetAh;
  const waterGrams = roomVolumeM3 > 0 ? deltaAhGPerM3 * roomVolumeM3 : NaN;
  const waterLitres = Number.isFinite(waterGrams) ? waterGrams / 1000 : NaN;

  // Warm the air and RH falls without adding or removing any water at all.
  const tempForTargetC =
    targetHumidity < relativeHumidity
      ? (MAGNUS_C * Math.log((pv / ES_AT_ZERO_HPA) / (targetHumidity / 100))) /
        (MAGNUS_B - Math.log((pv / ES_AT_ZERO_HPA) / (targetHumidity / 100)))
      : NaN;

  return {
    temperatureC: round1(temperatureC),
    relativeHumidity: round1(relativeHumidity),
    saturationPressureHpa: round2(es),
    vapourPressureHpa: round2(pv),
    dewPointC: round1(td),
    absoluteHumidityGPerM3: round2(ah),
    humidityRatioGPerKg: round2(w),
    humidityRatioKgPerKg: round3(w / 1000),
    heatIndexC: round1(hi),
    heatIndexAbove: round1(hi - temperatureC),

    hasSurface,
    surfaceTempC: hasSurface ? round1(surfaceTempC) : NaN,
    surfaceRelativeHumidity: hasSurface ? round1(surfaceRh) : NaN,
    surfaceMarginC: hasSurface ? round1(surfaceMargin) : NaN,
    condensing,

    tempVerdict,
    humidityVerdict,
    inComfortZone,
    overAshraeLimit,
    mouldRisk,
    dustMiteRisk,
    tooDry,

    targetHumidity: round1(targetHumidity),
    targetAbsoluteHumidityGPerM3: round2(targetAh),
    deltaAhGPerM3: round2(deltaAhGPerM3),
    waterLitres: Number.isFinite(waterLitres) ? round3(waterLitres) : NaN,
    waterLitresMagnitude: Number.isFinite(waterLitres) ? round3(Math.abs(waterLitres)) : NaN,
    needsDrying: deltaAhGPerM3 > 0,
    tempForTargetC: Number.isFinite(tempForTargetC) ? round1(tempForTargetC) : NaN,
  };
}
