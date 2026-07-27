/**
 * Pressure conversion, plus the temperature correction that explains why a
 * tyre reads higher after a drive.
 *
 * All units are anchored to the pascal:
 *
 *   1 psi      = 1 lbf / in2. With lbf = 4.4482216152605 N and
 *                in2 = 0.00064516 m2, that is 6894.757293168361 Pa exactly.
 *   1 bar      = 100000 Pa (definition).
 *   1 kgf/cm2  = 9.80665 N / 1e-4 m2 = 98066.5 Pa exactly. Often printed as
 *                "at" or loosely called a "kg" on Indian air pumps.
 *   1 atm      = 101325 Pa (standard atmosphere).
 *   1 torr     = 101325 / 760 Pa = 133.3223684... Pa.
 *
 * Temperature correction uses Gay-Lussac's law on ABSOLUTE pressure and
 * ABSOLUTE temperature, because the volume of a mounted tyre barely changes:
 *
 *   (P_gauge2 + P_atm) / (P_gauge1 + P_atm) = T2 / T1     [T in kelvin]
 *
 * That is where the familiar "about 1 psi per 10 degrees F" rule comes from —
 * this computes it properly instead of using the rule of thumb.
 */

/** 1 psi = 4.4482216152605 N / 0.00064516 m2. */
export const PA_PER_PSI = 6894.757293168361;

/** 1 bar = 100 kPa exactly. */
export const PA_PER_BAR = 100000;

/** 1 kgf/cm2: kgf uses standard gravity 9.80665 m/s2. */
export const PA_PER_KGF_CM2 = 98066.5;

/** Standard atmosphere, ISO 2533. */
export const PA_PER_ATM = 101325;

export const UNITS = [
  { id: "psi", label: "psi (pounds per square inch)", short: "psi", pa: PA_PER_PSI, dp: 2 },
  { id: "bar", label: "bar", short: "bar", pa: PA_PER_BAR, dp: 3 },
  { id: "kpa", label: "kilopascal (kPa)", short: "kPa", pa: 1000, dp: 1 },
  { id: "kgf", label: "kgf/cm2 (also written at)", short: "kgf/cm2", pa: PA_PER_KGF_CM2, dp: 3 },
  { id: "atm", label: "atmosphere (atm)", short: "atm", pa: PA_PER_ATM, dp: 3 },
  { id: "pa", label: "pascal (Pa)", short: "Pa", pa: 1, dp: 0 },
  { id: "mpa", label: "megapascal (MPa)", short: "MPa", pa: 1000000, dp: 4 },
  { id: "torr", label: "torr / mmHg", short: "torr", pa: PA_PER_ATM / 760, dp: 1 },
];

/** Absolute zero in Celsius; temperatures below this are physically impossible. */
export const ABSOLUTE_ZERO_C = -273.15;

/** Sanity ceiling: well above any tyre or domestic system pressure. */
export const MAX_PA = 1e9;

export function unitById(id) {
  return UNITS.find((u) => u.id === id) ?? null;
}

export function celsiusToKelvin(celsius) {
  return celsius - ABSOLUTE_ZERO_C;
}

/**
 * Gauge pressure after a temperature change, in the same unit it was given in.
 * Returns null when the inputs cannot produce a physical answer.
 */
export function pressureAtTemperature({ gaugePa, fromC, toC, atmosphericPa = PA_PER_ATM }) {
  const t1 = celsiusToKelvin(Number(fromC));
  const t2 = celsiusToKelvin(Number(toC));
  if (!(t1 > 0) || !(t2 > 0)) return null;
  const absolute1 = Number(gaugePa) + atmosphericPa;
  if (!(absolute1 > 0)) return null;
  const absolute2 = absolute1 * (t2 / t1);
  return absolute2 - atmosphericPa;
}

/**
 * @param {object} input
 * @param {number} input.value    Pressure reading.
 * @param {string} input.fromUnit Unit id of that reading.
 * @param {number} [input.fromC]  Temperature the reading was taken at, Celsius.
 * @param {number} [input.toC]    Temperature to project the reading to, Celsius.
 * @returns {object} { pa, byUnit, ... } or { error }.
 */
export function convertPressure({ value, fromUnit = "psi", fromC = 25, toC = 25 }) {
  const qty = Number(value);
  const unit = unitById(fromUnit);
  const t1 = Number(fromC);
  const t2 = Number(toC);

  if (!unit) return { error: "Choose a unit to convert from." };
  if (!Number.isFinite(qty)) return { error: "Enter a valid pressure reading." };
  if (qty < 0) return { error: "Gauge pressure cannot be negative in this converter." };
  if (!Number.isFinite(t1) || !Number.isFinite(t2)) {
    return { error: "Enter valid temperatures in Celsius." };
  }
  if (t1 <= ABSOLUTE_ZERO_C || t2 <= ABSOLUTE_ZERO_C) {
    return { error: `Temperature must be above absolute zero (${ABSOLUTE_ZERO_C} C).` };
  }

  const pa = qty * unit.pa;
  if (pa > MAX_PA) {
    return { error: "That pressure is beyond the range this converter handles." };
  }

  const byUnit = {};
  for (const u of UNITS) byUnit[u.id] = pa / u.pa;

  const projectedPa = pressureAtTemperature({ gaugePa: pa, fromC: t1, toC: t2 });
  const projected =
    projectedPa === null
      ? null
      : {
          pa: projectedPa,
          inFromUnit: projectedPa / unit.pa,
          psi: projectedPa / PA_PER_PSI,
          bar: projectedPa / PA_PER_BAR,
          deltaPsi: (projectedPa - pa) / PA_PER_PSI,
          deltaBar: (projectedPa - pa) / PA_PER_BAR,
        };

  return {
    pa,
    absolutePa: pa + PA_PER_ATM,
    absoluteKpa: (pa + PA_PER_ATM) / 1000,
    byUnit,
    projected,
    fromUnit: unit,
    fromC: t1,
    toC: t2,
  };
}
