/**
 * Turbo boost pressure conversion.
 *
 * The distinction that matters is gauge versus absolute pressure:
 *
 *     absolute = gauge + ambient
 *
 * A boost gauge reads gauge pressure — zero at atmospheric. A MAP sensor reads
 * absolute pressure. Compressor maps are plotted against pressure ratio, which
 * is an absolute quantity:
 *
 *     pressure ratio = absolute manifold pressure / absolute ambient pressure
 *
 * Ambient pressure falls with altitude, so the SAME gauge boost is a HIGHER
 * pressure ratio up a mountain. Ambient pressure follows the ISA troposphere
 * model:
 *     P = 101325 x (1 - 2.25577e-5 x h)^5.25588      (h in metres)
 *
 * Charge heating is modelled with the standard adiabatic compressor relation
 * for air (ratio of specific heats gamma = 1.4):
 *     T_out = T_in x [ 1 + (PR^((g-1)/g) - 1) / efficiency ]
 * and the intercooler with its effectiveness:
 *     T_after = T_out - effectiveness x (T_out - T_ambient)
 *
 * Finally the ideal gas law gives the air the engine actually receives:
 *     density ratio = PR x (T_in / T_after)      (absolute temperatures)
 * which is what tracks power, not boost pressure on its own.
 */

/** Standard atmosphere at sea level, in pascals. */
export const SEA_LEVEL_PA = 101325;
/** ISA troposphere lapse constants. */
export const ISA_LAPSE_COEFFICIENT = 2.25577e-5;
export const ISA_EXPONENT = 5.25588;
/** Ratio of specific heats for air. */
export const GAMMA_AIR = 1.4;
/** 1 foot = 0.3048 m exactly. */
export const M_PER_FT = 0.3048;
/** 0 °C in kelvin. */
export const KELVIN_OFFSET = 273.15;

/** Pascals per unit. All exact or conventional definitions. */
export const PRESSURE_UNITS = [
  { key: "psi", label: "Pounds per square inch (psi)", short: "psi", pa: 6894.757293168361 },
  { key: "bar", label: "Bar", short: "bar", pa: 100000 },
  { key: "kpa", label: "Kilopascals (kPa)", short: "kPa", pa: 1000 },
  { key: "inhg", label: "Inches of mercury (inHg)", short: "inHg", pa: 3386.389 },
  { key: "mmhg", label: "Millimetres of mercury (mmHg / torr)", short: "mmHg", pa: 133.322387415 },
  { key: "atm", label: "Atmospheres (atm)", short: "atm", pa: SEA_LEVEL_PA },
  { key: "kgcm2", label: "Kilogram-force per cm² (kg/cm²)", short: "kg/cm²", pa: 98066.5 },
];

export const UNIT_MAP = Object.fromEntries(PRESSURE_UNITS.map((unit) => [unit.key, unit]));

/** Refuse anything beyond a plausible engine — 1,000 psi absolute. */
export const MAX_ABSOLUTE_PA = 6894757;

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

/**
 * Ambient pressure at an altitude, using the ISA troposphere model.
 * @param {number} metres altitude above sea level
 * @returns {number} pressure in pascals
 */
export function ambientPressureAt(metres) {
  const factor = 1 - ISA_LAPSE_COEFFICIENT * metres;
  if (factor <= 0) return 0;
  return SEA_LEVEL_PA * factor ** ISA_EXPONENT;
}

/** Convert a temperature to kelvin. */
export function toKelvin(value, unit) {
  if (unit === "c") return value + KELVIN_OFFSET;
  if (unit === "f") return ((value - 32) * 5) / 9 + KELVIN_OFFSET;
  if (unit === "k") return value;
  return NaN;
}

/** Convert kelvin back to celsius. */
export const kelvinToCelsius = (k) => k - KELVIN_OFFSET;
/** Convert kelvin to fahrenheit. */
export const kelvinToFahrenheit = (k) => ((k - KELVIN_OFFSET) * 9) / 5 + 32;

/**
 * Convert a boost reading and derive pressure ratio and charge-air density.
 *
 * @param {object} input
 * @param {number|string} input.value        the pressure reading
 * @param {string} input.unit                key of UNIT_MAP
 * @param {"gauge"|"absolute"} input.reading what the value represents
 * @param {"altitude"|"pressure"} input.ambientMode
 * @param {number|string} input.altitude     altitude above sea level
 * @param {"m"|"ft"} input.altitudeUnit
 * @param {number|string} input.ambientValue ambient pressure, when set directly
 * @param {string} input.ambientUnit         key of UNIT_MAP for that ambient value
 * @param {number|string} input.ambientTemp  intake air temperature
 * @param {"c"|"f"|"k"} input.tempUnit
 * @param {number|string} input.compressorEff isentropic compressor efficiency, percent
 * @param {number|string} input.intercoolerEff intercooler effectiveness, percent
 * @returns {object} boost result, or { error } for invalid input
 */
export function convertBoost({
  value,
  unit = "psi",
  reading = "gauge",
  ambientMode = "altitude",
  altitude = 0,
  altitudeUnit = "m",
  ambientValue = 14.6959,
  ambientUnit = "psi",
  ambientTemp = 25,
  tempUnit = "c",
  compressorEff = 70,
  intercoolerEff = 75,
}) {
  const source = UNIT_MAP[unit];
  if (!source) return { error: "Choose one of the listed pressure units." };
  if (reading !== "gauge" && reading !== "absolute") {
    return { error: "Say whether the reading is gauge or absolute." };
  }

  const raw = toNumber(value);
  if (Number.isNaN(raw)) return { error: "Enter the boost reading as a number." };

  // Ambient pressure.
  let ambientPa;
  let ambientNote;
  if (ambientMode === "altitude") {
    const alt = toNumber(altitude);
    if (Number.isNaN(alt)) return { error: "Enter the altitude as a number." };
    if (altitudeUnit !== "m" && altitudeUnit !== "ft") {
      return { error: "Altitude unit must be metres or feet." };
    }
    const metres = altitudeUnit === "ft" ? alt * M_PER_FT : alt;
    if (metres < -500 || metres > 11000) {
      return { error: "Altitude must be between -500 m and 11,000 m for this atmosphere model." };
    }
    ambientPa = ambientPressureAt(metres);
    ambientNote = `ISA standard atmosphere at ${Math.round(metres)} m`;
  } else if (ambientMode === "pressure") {
    const ambUnit = UNIT_MAP[ambientUnit];
    if (!ambUnit) return { error: "Choose a valid unit for the ambient pressure." };
    const amb = toNumber(ambientValue);
    if (Number.isNaN(amb)) return { error: "Enter the ambient pressure as a number." };
    if (amb <= 0) return { error: "Ambient pressure must be greater than zero." };
    ambientPa = amb * ambUnit.pa;
    ambientNote = "measured ambient pressure";
  } else {
    return { error: "Choose whether to set ambient by altitude or by pressure." };
  }

  if (!(ambientPa > 0)) return { error: "Ambient pressure resolved to zero — check the altitude." };

  // Gauge and absolute in pascals.
  const inputPa = raw * source.pa;
  const absolutePa = reading === "gauge" ? ambientPa + inputPa : inputPa;
  const gaugePa = absolutePa - ambientPa;

  if (absolutePa <= 0) {
    return { error: "That reading implies a total vacuum or less — check the value and the unit." };
  }
  if (absolutePa > MAX_ABSOLUTE_PA) {
    return { error: "Above 1,000 psi absolute is outside any engine — check the value and the unit." };
  }

  const pressureRatio = absolutePa / ambientPa;
  const isVacuum = gaugePa < 0;

  const conversions = PRESSURE_UNITS.map((target) => ({
    key: target.key,
    label: target.label,
    short: target.short,
    gauge: gaugePa / target.pa,
    absolute: absolutePa / target.pa,
    ambient: ambientPa / target.pa,
    isSource: target.key === source.key,
  }));

  // Charge-air thermodynamics only make sense above atmospheric.
  let charge = null;
  if (!isVacuum) {
    const tIn = toKelvin(toNumber(ambientTemp), tempUnit);
    const compEff = toNumber(compressorEff) / 100;
    const icEff = toNumber(intercoolerEff) / 100;

    if (Number.isNaN(tIn)) return { error: "Enter the intake air temperature as a number." };
    if (tIn <= 0) return { error: "Intake air temperature must be above absolute zero." };
    if (Number.isNaN(compEff) || compEff <= 0 || compEff > 1) {
      return { error: "Compressor efficiency must be between 1% and 100%." };
    }
    if (Number.isNaN(icEff) || icEff < 0 || icEff > 1) {
      return { error: "Intercooler effectiveness must be between 0% and 100%." };
    }

    const exponent = (GAMMA_AIR - 1) / GAMMA_AIR;
    const idealRise = pressureRatio ** exponent;
    const tOut = tIn * (1 + (idealRise - 1) / compEff);
    const tAfter = tOut - icEff * (tOut - tIn);
    const densityRatio = pressureRatio * (tIn / tAfter);
    const densityRatioNoIc = pressureRatio * (tIn / tOut);

    charge = {
      tInK: tIn,
      tOutK: tOut,
      tAfterK: tAfter,
      tInC: kelvinToCelsius(tIn),
      tOutC: kelvinToCelsius(tOut),
      tAfterC: kelvinToCelsius(tAfter),
      tInF: kelvinToFahrenheit(tIn),
      tOutF: kelvinToFahrenheit(tOut),
      tAfterF: kelvinToFahrenheit(tAfter),
      compressorRiseC: tOut - tIn,
      intercoolerDropC: tOut - tAfter,
      densityRatio,
      densityRatioNoIc,
      extraAirPercent: (densityRatio - 1) * 100,
    };
  }

  return {
    sourceShort: source.short,
    ambientPa,
    ambientNote,
    ambientPsi: ambientPa / UNIT_MAP.psi.pa,
    ambientBar: ambientPa / UNIT_MAP.bar.pa,
    ambientKpa: ambientPa / UNIT_MAP.kpa.pa,
    gaugePa,
    absolutePa,
    pressureRatio,
    isVacuum,
    conversions,
    charge,
  };
}
