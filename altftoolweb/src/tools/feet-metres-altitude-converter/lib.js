/**
 * Altitude: feet <-> metres, with the air pressure and effective oxygen that go with it.
 *
 * The international foot has been exactly 0.3048 m since the 1959 international yard
 * and pound agreement, so the conversion is exact:
 *
 *     metres = feet x 0.3048        feet = metres / 0.3048
 *
 * Pressure comes from the International Standard Atmosphere (ISA, ISO 2533):
 *
 *   Troposphere, 0 to 11,000 m (lapse rate 6.5 K/km):
 *       p = p0 x (1 - L h / T0) ^ (g M / (R L))
 *   Lower stratosphere, 11,000 to 20,000 m (isothermal at 216.65 K):
 *       p = p_trop x exp(-g M (h - 11000) / (R T_trop))
 *
 * "Effective oxygen" is the sea-level-equivalent oxygen percentage: the fraction of
 * oxygen in air stays 20.95% at every altitude, but the pressure driving it into your
 * blood falls with the total pressure, so 20.95% x (p / p0) is the figure that matters
 * physiologically. It is a physical quantity, not a medical assessment.
 */

/** Exact by definition (1959 international yard and pound agreement). */
export const METRES_PER_FOOT = 0.3048;

/* --- International Standard Atmosphere constants (ISO 2533) --- */
export const SEA_LEVEL_PRESSURE_PA = 101325;
export const SEA_LEVEL_TEMPERATURE_K = 288.15;
export const TEMPERATURE_LAPSE_RATE_K_PER_M = 0.0065;
export const GRAVITY_M_PER_S2 = 9.80665;
export const MOLAR_MASS_AIR_KG_PER_MOL = 0.0289644;
export const UNIVERSAL_GAS_CONSTANT = 8.31447;
export const TROPOPAUSE_M = 11000;
export const TROPOPAUSE_TEMPERATURE_K = 216.65;

/** Oxygen is 20.95% of dry air by volume at every altitude. */
export const OXYGEN_FRACTION_PERCENT = 20.95;

/** The ISA model in this file is only defined up to 20 km. */
export const MAX_ALTITUDE_M = 20000;
/** Lowest dry land on Earth is the Dead Sea shore, about -430 m. */
export const MIN_ALTITUDE_M = -500;

/**
 * Wilderness-medicine altitude classification (the bands used by the Wilderness
 * Medical Society and most trekking guidance). Each entry is the UPPER edge in metres.
 */
export const ALTITUDE_BANDS = [
  {
    maxM: 1500,
    key: "low",
    label: "Near sea level",
    note: "No altitude effect for almost everyone.",
  },
  {
    maxM: 2500,
    key: "moderate",
    label: "Moderate altitude",
    note: "Mild breathlessness on exertion; acute mountain sickness is uncommon below 2,500 m.",
  },
  {
    maxM: 3500,
    key: "high",
    label: "High altitude",
    note: "Acute mountain sickness becomes common above 2,500 m. Ascend sleeping altitude slowly and do not push through symptoms.",
  },
  {
    maxM: 5500,
    key: "very-high",
    label: "Very high altitude",
    note: "Serious illness is possible; guidance is to gain no more than about 500 m of sleeping altitude a day with a rest day every 3 to 4 days.",
  },
  {
    maxM: Infinity,
    key: "extreme",
    label: "Extreme altitude",
    note: "No one acclimatises indefinitely here; the body deteriorates even at rest. Expedition territory.",
  },
];

/**
 * FAA 14 CFR 25.841 caps the cabin pressure altitude of a transport aircraft at
 * 8,000 ft at its maximum operating altitude; most jets hold 6,000 to 8,000 ft.
 */
export const CABIN_ALTITUDE_LIMIT_FT = 8000;

/** Familiar altitudes, in metres, for a sense of scale. */
export const REFERENCE_ALTITUDES = [
  { metres: 1400, what: "Shimla, Himachal Pradesh" },
  { metres: 2438, what: "Maximum certified cabin altitude (8,000 ft)" },
  { metres: 3440, what: "Namche Bazaar, Everest trek" },
  { metres: 4130, what: "Tiger's Nest / typical Andean pass" },
  { metres: 5364, what: "Everest Base Camp (south)" },
  { metres: 5895, what: "Kilimanjaro summit" },
  { metres: 8849, what: "Everest summit" },
  { metres: 11000, what: "Typical jet cruising altitude outside" },
];

/** Convert an altitude in either direction. */
export function convertAltitude({ value, from = "ft" }) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return { error: "Enter the altitude as a number." };

  const metres = from === "m" ? amount : amount * METRES_PER_FOOT;
  if (metres < MIN_ALTITUDE_M) {
    return { error: `Below ${MIN_ALTITUDE_M} m is lower than any dry land — check the number.` };
  }
  if (metres > MAX_ALTITUDE_M) {
    return { error: `This standard-atmosphere model stops at ${MAX_ALTITUDE_M.toLocaleString("en-GB")} m (${Math.round(MAX_ALTITUDE_M / METRES_PER_FOOT).toLocaleString("en-GB")} ft).` };
  }

  return { metres, feet: metres / METRES_PER_FOOT, kilometres: metres / 1000, from };
}

/** Boiling point of water at sea level, in kelvin. */
export const WATER_BOILING_POINT_K = 373.15;
/** Enthalpy of vaporisation of water near 100°C, J/mol. */
export const WATER_ENTHALPY_VAPORISATION = 40660;

/**
 * Boiling point of water from the Clausius-Clapeyron relation:
 *     1/Tb = 1/T0 - (R / dHvap) x ln(p / p0)
 * which gives about 92°C at 2,438 m (8,000 ft) and about 85°C at 4,000 m.
 */
export function boilingPointC(pressureRatio) {
  if (!Number.isFinite(pressureRatio) || pressureRatio <= 0) return NaN;
  const inverse =
    1 / WATER_BOILING_POINT_K -
    (UNIVERSAL_GAS_CONSTANT / WATER_ENTHALPY_VAPORISATION) * Math.log(pressureRatio);
  if (!(inverse > 0)) return NaN;
  return 1 / inverse - 273.15;
}

/** Pressure at the tropopause, used as the base of the stratospheric branch. */
function tropopausePressurePa() {
  const exponent =
    (GRAVITY_M_PER_S2 * MOLAR_MASS_AIR_KG_PER_MOL) /
    (UNIVERSAL_GAS_CONSTANT * TEMPERATURE_LAPSE_RATE_K_PER_M);
  const ratio = 1 - (TEMPERATURE_LAPSE_RATE_K_PER_M * TROPOPAUSE_M) / SEA_LEVEL_TEMPERATURE_K;
  return SEA_LEVEL_PRESSURE_PA * Math.pow(ratio, exponent);
}

/**
 * ISA air pressure, temperature and effective oxygen at an altitude in metres.
 *
 * @returns {{error:string}|{pressurePa:number,pressureHpa:number,pressureRatio:number,temperatureC:number,effectiveOxygenPercent:number,boilingPointC:number}}
 */
export function standardAtmosphere(metres) {
  const h = Number(metres);
  if (!Number.isFinite(h)) return { error: "Enter the altitude as a number." };
  if (h < MIN_ALTITUDE_M || h > MAX_ALTITUDE_M) {
    return { error: "That altitude is outside the standard-atmosphere model." };
  }

  let pressurePa;
  let temperatureK;
  if (h <= TROPOPAUSE_M) {
    temperatureK = SEA_LEVEL_TEMPERATURE_K - TEMPERATURE_LAPSE_RATE_K_PER_M * h;
    const exponent =
      (GRAVITY_M_PER_S2 * MOLAR_MASS_AIR_KG_PER_MOL) /
      (UNIVERSAL_GAS_CONSTANT * TEMPERATURE_LAPSE_RATE_K_PER_M);
    pressurePa = SEA_LEVEL_PRESSURE_PA * Math.pow(temperatureK / SEA_LEVEL_TEMPERATURE_K, exponent);
  } else {
    temperatureK = TROPOPAUSE_TEMPERATURE_K;
    const scale =
      (-GRAVITY_M_PER_S2 * MOLAR_MASS_AIR_KG_PER_MOL * (h - TROPOPAUSE_M)) /
      (UNIVERSAL_GAS_CONSTANT * TROPOPAUSE_TEMPERATURE_K);
    pressurePa = tropopausePressurePa() * Math.exp(scale);
  }

  const pressureRatio = pressurePa / SEA_LEVEL_PRESSURE_PA;

  return {
    pressurePa,
    pressureHpa: pressurePa / 100,
    pressureRatio,
    temperatureC: temperatureK - 273.15,
    effectiveOxygenPercent: OXYGEN_FRACTION_PERCENT * pressureRatio,
    boilingPointC: boilingPointC(pressureRatio),
  };
}

/** The altitude band whose upper edge first covers this altitude in metres. */
export function altitudeBandFor(metres) {
  if (!Number.isFinite(metres)) return null;
  return ALTITUDE_BANDS.find((band) => metres <= band.maxM) ?? ALTITUDE_BANDS[ALTITUDE_BANDS.length - 1];
}

/**
 * Everything about one altitude in one call.
 *
 * @returns {{error:string}|object}
 */
export function describeAltitude({ value, from = "ft" }) {
  const converted = convertAltitude({ value, from });
  if (converted.error) return { error: converted.error };

  const atmosphere = standardAtmosphere(converted.metres);
  if (atmosphere.error) return { error: atmosphere.error };

  const band = altitudeBandFor(converted.metres);
  const cabinLimitM = CABIN_ALTITUDE_LIMIT_FT * METRES_PER_FOOT;

  return {
    ...converted,
    ...atmosphere,
    band,
    aboveCabinLimit: converted.metres > cabinLimitM,
    cabinLimitM,
    /** Percentage of sea-level oxygen partial pressure still available. */
    oxygenAvailablePercent: atmosphere.pressureRatio * 100,
  };
}
