/**
 * Fever Fluid Replacement Calculator — pure calculation module.
 *
 * Fever raises the metabolic rate, and with it insensible water loss through
 * the skin and airway. Standard clinical teaching is to add roughly 10-12% to
 * maintenance fluid for every 1 C of body temperature above 37 C; 12% is used
 * here, prorated by how many hours of the day the temperature was actually up.
 *
 * Maintenance itself comes from the age-appropriate rule:
 *   - children: Holliday-Segar, 100/50/20 ml per kg
 *   - adults:   30 ml/kg/day
 *   - 65 and over: 25 ml/kg/day, the lower end NICE advises for older and
 *     frailer patients, whose kidneys concentrate urine less well.
 *
 * Everything here is informational. Fever with dehydration in an infant, or in
 * anyone who cannot keep fluids down, is a reason to seek care, not to
 * calculate a target.
 */

/** Normal core temperature the surcharge is measured from, degrees Celsius. */
export const BASELINE_BODY_TEMP_C = 37;

/** Extra fluid per degree Celsius of fever, as a percentage of maintenance.
 *  Clinical range is 10-12%; the upper figure is used to be safe. */
export const FEVER_EXTRA_PCT_PER_DEG_C = 12;

/** Temperature at or above which a reading counts as fever (WHO/NICE convention). */
export const FEVER_THRESHOLD_C = 38;

/** Hyperpyrexia — a medical emergency, not something to plan fluids around. */
export const HYPERPYREXIA_C = 41;

/** Holliday-Segar maintenance bands, ml per kg per day. */
export const HS_FIRST_10KG_ML_PER_KG = 100;
export const HS_SECOND_10KG_ML_PER_KG = 50;
export const HS_ABOVE_20KG_ML_PER_KG = 20;

/** Adult maintenance fluid, ml/kg/day (NICE adult maintenance is 25-30 ml/kg). */
export const ADULT_ML_PER_KG = 30;
export const OLDER_ADULT_ML_PER_KG = 25;

/** Age from which the Holliday-Segar paediatric rule gives way to adult figures. */
export const ADULT_AGE_YEARS = 18;
/** Age from which the lower older-adult maintenance figure is used. */
export const OLDER_ADULT_AGE_YEARS = 65;

/** Infants below this age need medical review for any fever of 38 C or more. */
export const INFANT_URGENT_AGE_MONTHS = 3;

/** Waking hours across which the daily target is spread. */
const WAKING_HOURS = 16;

/** Convert Fahrenheit to Celsius. */
export function fahrenheitToCelsius(f) {
  return ((f - 32) * 5) / 9;
}

/** Convert Celsius to Fahrenheit. */
export function celsiusToFahrenheit(c) {
  return (c * 9) / 5 + 32;
}

/** Holliday-Segar maintenance fluid, ml/day. */
export function hollidaySegarMl(weightKg) {
  if (!(weightKg > 0)) return 0;
  if (weightKg <= 10) return weightKg * HS_FIRST_10KG_ML_PER_KG;
  if (weightKg <= 20) {
    return 10 * HS_FIRST_10KG_ML_PER_KG + (weightKg - 10) * HS_SECOND_10KG_ML_PER_KG;
  }
  return (
    10 * HS_FIRST_10KG_ML_PER_KG +
    10 * HS_SECOND_10KG_ML_PER_KG +
    (weightKg - 20) * HS_ABOVE_20KG_ML_PER_KG
  );
}

/** Maintenance fluid for a person of this age and weight, ml/day. */
export function maintenanceMl({ ageYears, weightKg }) {
  if (ageYears < ADULT_AGE_YEARS) {
    return { ml: hollidaySegarMl(weightKg), rule: "Holliday-Segar paediatric rule (100/50/20 ml/kg)" };
  }
  if (ageYears >= OLDER_ADULT_AGE_YEARS) {
    return {
      ml: weightKg * OLDER_ADULT_ML_PER_KG,
      rule: `Older-adult maintenance (${OLDER_ADULT_ML_PER_KG} ml/kg/day)`,
    };
  }
  return { ml: weightKg * ADULT_ML_PER_KG, rule: `Adult maintenance (${ADULT_ML_PER_KG} ml/kg/day)` };
}

function round(value, step = 1) {
  return Math.round(value / step) * step;
}

/**
 * @param {object} input
 * @param {number} input.ageYears
 * @param {number} input.weightKg
 * @param {number} input.temperature      body temperature in the chosen unit
 * @param {string} input.unit             "C" | "F"
 * @param {number} input.hoursFebrile     hours of the day the temperature was up
 */
export function computeFeverFluid({
  ageYears,
  weightKg,
  temperature,
  unit = "C",
  hoursFebrile = 24,
} = {}) {
  const age = Number(ageYears);
  const weight = Number(weightKg);
  const rawTemp = Number(temperature);
  const hours = Number(hoursFebrile);

  if (![age, weight, rawTemp, hours].every((v) => Number.isFinite(v))) {
    return { error: "Enter a number for age, weight, temperature and hours." };
  }
  if (age < 0 || age > 120) return { error: "Enter an age between 0 and 120 years." };
  if (weight < 1 || weight > 300) return { error: "Enter a weight between 1 kg and 300 kg." };
  if (hours < 0 || hours > 24) return { error: "Hours with a fever must be between 0 and 24." };

  const tempC = unit === "F" ? fahrenheitToCelsius(rawTemp) : rawTemp;

  if (tempC < 34) {
    return {
      error:
        "A body temperature below 34 °C is hypothermia, not fever, and needs urgent medical attention — check the reading and the unit.",
    };
  }
  if (tempC > 45) {
    return { error: "That temperature is outside any survivable range — check the reading and the unit." };
  }
  if (tempC >= HYPERPYREXIA_C) {
    return {
      error: `A temperature of ${HYPERPYREXIA_C} °C or above is hyperpyrexia and a medical emergency. Seek urgent medical care now rather than planning fluids at home.`,
    };
  }

  const { ml: baseMaintenanceMl, rule } = maintenanceMl({ ageYears: age, weightKg: weight });

  const degreesAbove = Math.max(0, tempC - BASELINE_BODY_TEMP_C);
  const surchargePct = degreesAbove * FEVER_EXTRA_PCT_PER_DEG_C;
  const fullDayExtraMl = baseMaintenanceMl * (surchargePct / 100);
  const feverExtraMl = fullDayExtraMl * (hours / 24);

  const ageMonths = age * 12;
  const infantUrgent = ageMonths < INFANT_URGENT_AGE_MONTHS && tempC >= FEVER_THRESHOLD_C;

  // Round the two components that are actually displayed first, then derive the
  // headline total as their sum — rather than rounding an independently-computed
  // total — so the on-screen breakdown always adds up to the on-screen total.
  const baseMaintenanceMlRounded = round(baseMaintenanceMl, 5);
  const feverExtraMlRounded = round(feverExtraMl, 5);
  const totalMl = baseMaintenanceMlRounded + feverExtraMlRounded;
  const hourlyMl = totalMl / WAKING_HOURS;

  return {
    tempC: Math.round(tempC * 10) / 10,
    tempF: Math.round(celsiusToFahrenheit(tempC) * 10) / 10,
    isFever: tempC >= FEVER_THRESHOLD_C,
    degreesAbove: Math.round(degreesAbove * 10) / 10,
    maintenanceRule: rule,
    baseMaintenanceMl: baseMaintenanceMlRounded,
    surchargePct: Math.round(surchargePct * 10) / 10,
    fullDayExtraMl: round(fullDayExtraMl, 5),
    hoursFebrile: hours,
    feverExtraMl: feverExtraMlRounded,
    totalMl: round(totalMl, 5),
    hourlyMl: round(hourlyMl, 5),
    glasses200: Math.round(totalMl / 200),
    infantUrgent,
  };
}

export default computeFeverFluid;
