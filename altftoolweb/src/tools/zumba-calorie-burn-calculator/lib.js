/**
 * Zumba calorie maths.
 *
 * Two independent methods:
 *
 * 1. MET method (ACSM):  kcal/min = MET x 3.5 x kg / 200
 *    1 MET = 3.5 mL O2 per kg per minute; 1 L of O2 ~= 5 kcal.
 *
 * 2. Heart-rate method (Keytel et al., 2005, J Sports Sci 23(3):289-297),
 *    which predicts energy expenditure in kJ/min from heart rate, body mass
 *    and age, separately for men and women. Divide by 4.184 for kcal.
 */

export const LB_TO_KG = 0.45359237;
export const O2_ML_PER_KG_PER_MET = 3.5;
export const KCAL_PER_LITRE_O2 = 5;
export const RESTING_MET = 1;
export const KJ_PER_KCAL = 4.184;
export const KCAL_PER_KG_BODY_FAT = 7700;

export const MIN_WEIGHT_KG = 25;
export const MAX_WEIGHT_KG = 400;
export const MAX_MINUTES = 300;
export const MIN_AGE = 12;
export const MAX_AGE = 100;
export const MIN_HR = 60;
export const MAX_HR = 220;

export const ZUMBA_FORMATS = [
  {
    id: "gold",
    label: "Zumba Gold (low impact, all levels)",
    met: 5.0,
    basis: "Compendium of Physical Activities value for low-impact aerobic dance (5.0 MET).",
  },
  {
    id: "aqua",
    label: "Aqua Zumba (in the pool)",
    met: 5.3,
    basis: "Compendium value for water aerobics / water calisthenics (5.3 MET).",
  },
  {
    id: "toning",
    label: "Zumba Toning (with toning sticks)",
    met: 6.8,
    basis: "Between low-impact dance (5.0) and general aerobic dance (7.3 MET).",
  },
  {
    id: "fitness",
    label: "Zumba Fitness (standard class)",
    met: 7.9,
    basis:
      "Midpoint of the 7-9 MET range reported when researchers measured oxygen uptake in full Zumba classes.",
  },
  {
    id: "step",
    label: "Zumba Step (risers)",
    met: 8.5,
    basis: "Compendium value for a bench-step aerobics class (8.5 MET).",
  },
  {
    id: "strong",
    label: "STRONG Nation / HIIT format",
    met: 9.0,
    basis: "Between vigorous calisthenics circuits (8.0) and high step aerobics (10.0 MET).",
  },
];

const round = (value, places = 0) => {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
};

export function metToKcalPerMinute(met, weightKg) {
  if (!Number.isFinite(met) || !Number.isFinite(weightKg)) return 0;
  if (met <= 0 || weightKg <= 0) return 0;
  return (met * O2_ML_PER_KG_PER_MET * weightKg * KCAL_PER_LITRE_O2) / 1000;
}

export function getZumbaFormat(id) {
  return ZUMBA_FORMATS.find((item) => item.id === id) || null;
}

/**
 * Keytel et al. (2005) heart-rate energy expenditure, returned in kcal/min.
 * Returns null when the equation yields a non-positive rate (heart rate too
 * low for the equation to be meaningful).
 */
export function keytelKcalPerMinute({ heartRate, weightKg, age, sex }) {
  if (![heartRate, weightKg, age].every(Number.isFinite)) return null;
  const kjPerMin =
    sex === "male"
      ? -55.0969 + 0.6309 * heartRate + 0.1988 * weightKg + 0.2017 * age
      : -20.4022 + 0.4472 * heartRate - 0.1263 * weightKg + 0.074 * age;
  const kcalPerMin = kjPerMin / KJ_PER_KCAL;
  return kcalPerMin > 0 ? kcalPerMin : null;
}

export function computeZumbaBurn({
  weight,
  weightUnit = "kg",
  minutes,
  formatId,
  useHeartRate = false,
  heartRate,
  age,
  sex = "female",
}) {
  if (![weight, minutes].every(Number.isFinite)) {
    return { error: "Enter your body weight and the class length." };
  }
  const format = getZumbaFormat(formatId);
  if (!format) return { error: "Pick a Zumba class format." };

  const weightKg = weightUnit === "lb" ? weight * LB_TO_KG : weight;
  if (weightKg < MIN_WEIGHT_KG || weightKg > MAX_WEIGHT_KG) {
    return { error: `Body weight should be between ${MIN_WEIGHT_KG} kg and ${MAX_WEIGHT_KG} kg.` };
  }
  if (minutes <= 0) return { error: "Class length must be more than zero minutes." };
  if (minutes > MAX_MINUTES) {
    return { error: `Class length should be ${MAX_MINUTES} minutes or less.` };
  }

  const kcalPerMinute = metToKcalPerMinute(format.met, weightKg);
  const grossKcal = kcalPerMinute * minutes;
  const restingKcal = metToKcalPerMinute(RESTING_MET, weightKg) * minutes;
  const netKcal = Math.max(0, grossKcal - restingKcal);

  let heartRateKcal = null;
  let heartRateMet = null;
  let heartRateNote = null;

  if (useHeartRate) {
    if (![heartRate, age].every(Number.isFinite)) {
      heartRateNote = "Enter both average heart rate and age to use the heart-rate method.";
    } else if (heartRate < MIN_HR || heartRate > MAX_HR) {
      heartRateNote = `Average heart rate should be between ${MIN_HR} and ${MAX_HR} bpm.`;
    } else if (age < MIN_AGE || age > MAX_AGE) {
      heartRateNote = `Age should be between ${MIN_AGE} and ${MAX_AGE} years.`;
    } else {
      const perMinute = keytelKcalPerMinute({ heartRate, weightKg, age, sex });
      if (perMinute === null) {
        heartRateNote =
          "At that heart rate the Keytel equation returns a non-positive value, so only the MET estimate is shown.";
      } else {
        heartRateKcal = perMinute * minutes;
        heartRateMet = (perMinute * 200) / (O2_ML_PER_KG_PER_MET * weightKg);
      }
    }
  }

  return {
    weightKg: round(weightKg, 1),
    met: format.met,
    formatLabel: format.label,
    basis: format.basis,
    kcalPerMinute: round(kcalPerMinute, 2),
    kcalPerHour: round(kcalPerMinute * 60),
    grossKcal: round(grossKcal),
    restingKcal: round(restingKcal),
    netKcal: round(netKcal),
    fatGramsEquivalent: round((netKcal / KCAL_PER_KG_BODY_FAT) * 1000, 1),
    heartRateKcal: heartRateKcal === null ? null : round(heartRateKcal),
    heartRateKcalPerMinute: heartRateKcal === null ? null : round(heartRateKcal / minutes, 2),
    heartRateMet: heartRateMet === null ? null : round(heartRateMet, 1),
    heartRateNote,
  };
}
