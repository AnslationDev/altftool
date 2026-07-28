/**
 * Cycling power-to-weight (W/kg) maths.
 *
 *     W/kg = functional threshold power (watts) / body mass (kg)
 *
 * Category bands follow the shape of the Coggan power-profile table published in
 * "Training and Racing with a Power Meter" (Allen & Coggan), which classifies
 * riders by threshold W/kg from untrained up to international professional.
 * Boundaries are approximate — they describe where a rider sits, not a licence.
 *
 * Climbing speed uses the Ferrari VAM relation, which links vertical ascent
 * metres per hour to threshold W/kg on a sustained climb:
 *
 *     VAM (m/h) = W/kg x 100 x (2 + gradient% / 10)
 *
 * The relation is calibrated on real climbs and is most reliable on sustained
 * gradients of roughly 5-12%.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** Ferrari VAM base coefficient; the gradient term is added to this. */
export const VAM_BASE_COEFFICIENT = 2;

/** Gradient range over which the VAM relation is quoted here. */
export const MIN_GRADIENT_PERCENT = 1;
export const MAX_GRADIENT_PERCENT = 25;

/** Plausibility bounds, so a typo cannot produce a fake world record. */
export const MAX_FTP_WATTS = 800;
export const MIN_MASS_KG = 25;
export const MAX_MASS_KG = 250;
export const MAX_ELEVATION_M = 3000;

/**
 * Threshold W/kg category bands, descending. `min` is the lower bound of the band.
 * Shape follows the Coggan power-profile classification for 60-minute power.
 */
export const BANDS = {
  male: [
    { min: 6.4, label: "World class", note: "International professional territory — grand tour climbers." },
    { min: 5.7, label: "Exceptional", note: "Domestic professional / continental level." },
    { min: 5.0, label: "Excellent", note: "Around elite amateur, Category 1 racing." },
    { min: 4.3, label: "Very good", note: "Strong club racer, Category 2." },
    { min: 3.7, label: "Good", note: "Competitive Category 3 racing." },
    { min: 3.1, label: "Moderate", note: "Category 4 racing or a keen, consistent cyclist." },
    { min: 2.4, label: "Fair", note: "Category 5 / new racer territory." },
    { min: 0, label: "Untrained", note: "Below regular endurance training — a normal starting point." },
  ],
  female: [
    { min: 5.7, label: "World class", note: "International professional territory." },
    { min: 5.0, label: "Exceptional", note: "Domestic professional / continental level." },
    { min: 4.3, label: "Excellent", note: "Around elite amateur, Category 1 racing." },
    { min: 3.8, label: "Very good", note: "Strong club racer, Category 2." },
    { min: 3.2, label: "Good", note: "Competitive Category 3 racing." },
    { min: 2.6, label: "Moderate", note: "Category 4 racing or a keen, consistent cyclist." },
    { min: 2.0, label: "Fair", note: "Category 5 / new racer territory." },
    { min: 0, label: "Untrained", note: "Below regular endurance training — a normal starting point." },
  ],
};

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Category band for a W/kg figure. Falls back to the male table for unknown sex. */
export function bandFor(wattsPerKg, sex = "male") {
  const table = BANDS[sex] ?? BANDS.male;
  if (!isNum(wattsPerKg) || wattsPerKg < 0) return table[table.length - 1];
  return table.find((band) => wattsPerKg >= band.min) ?? table[table.length - 1];
}

/** Ferrari coefficient for a gradient in percent. */
export function vamCoefficient(gradientPercent) {
  const g = isNum(gradientPercent) ? gradientPercent : 0;
  return VAM_BASE_COEFFICIENT + g / 10;
}

/** Hours -> h:mm:ss. Total function: never NaN. */
export function formatDuration(hours) {
  const totalSeconds = isNum(hours) ? Math.max(0, Math.round(hours * 3600)) : 0;
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

/**
 * Power-to-weight, category, climbing VAM and the gap to a target W/kg.
 *
 * @param {object} input
 * @param {number} input.ftpWatts          Functional threshold power in watts.
 * @param {number} input.massKg            Body mass in kilograms.
 * @param {"male"|"female"} [input.sex]    Which category table to use.
 * @param {number} [input.gradientPercent] Sustained gradient for the VAM estimate.
 * @param {number} [input.elevationGainM]  Climb height for a time estimate.
 * @param {number} [input.targetWattsPerKg] Goal power-to-weight.
 */
export function computePowerToWeight({
  ftpWatts,
  massKg,
  sex = "male",
  gradientPercent = 8,
  elevationGainM = 500,
  targetWattsPerKg = 0,
} = {}) {
  const values = [ftpWatts, massKg, gradientPercent, elevationGainM, targetWattsPerKg];
  if (!values.every(isNum)) return { error: "Enter a number in every field." };
  if (ftpWatts <= 0) return { error: "FTP must be greater than zero watts." };
  if (ftpWatts > MAX_FTP_WATTS) {
    return { error: `An FTP above ${MAX_FTP_WATTS} W is beyond the range this tool covers.` };
  }
  if (massKg < MIN_MASS_KG || massKg > MAX_MASS_KG) {
    return { error: `Body mass must be between ${MIN_MASS_KG} and ${MAX_MASS_KG} kg.` };
  }
  if (gradientPercent < MIN_GRADIENT_PERCENT || gradientPercent > MAX_GRADIENT_PERCENT) {
    return {
      error: `Gradient must be between ${MIN_GRADIENT_PERCENT}% and ${MAX_GRADIENT_PERCENT}%.`,
    };
  }
  if (elevationGainM < 0 || elevationGainM > MAX_ELEVATION_M) {
    return { error: `Elevation gain must be between 0 and ${MAX_ELEVATION_M} m.` };
  }
  if (targetWattsPerKg < 0 || targetWattsPerKg > 8) {
    return { error: "Target W/kg must be between 0 and 8." };
  }

  const wattsPerKg = ftpWatts / massKg;
  const band = bandFor(wattsPerKg, sex);
  const coefficient = vamCoefficient(gradientPercent);
  const vam = wattsPerKg * 100 * coefficient;

  // Climb length along the road, from rise and gradient.
  const climbDistanceKm =
    gradientPercent > 0 ? elevationGainM / (gradientPercent / 100) / 1000 : 0;
  const climbHours = vam > 0 ? elevationGainM / vam : 0;
  const climbSpeedKph = climbHours > 0 ? climbDistanceKm / climbHours : 0;

  const table = BANDS[sex] ?? BANDS.male;
  const nextBand = [...table].reverse().find((entry) => entry.min > wattsPerKg) ?? null;

  const hasTarget = targetWattsPerKg > 0;
  const wattsForTarget = hasTarget ? targetWattsPerKg * massKg : null;
  const massForTarget = hasTarget ? ftpWatts / targetWattsPerKg : null;

  return {
    wattsPerKg,
    band,
    nextBand,
    wattsToNextBand: nextBand ? nextBand.min * massKg - ftpWatts : null,
    coefficient,
    vam,
    climbDistanceKm,
    climbHours,
    climbSpeedKph,
    wattsForTarget,
    extraWattsNeeded: hasTarget ? wattsForTarget - ftpWatts : null,
    massForTarget,
    massToLose: hasTarget ? massKg - massForTarget : null,
    ftpWatts,
    massKg,
    gradientPercent,
    elevationGainM,
  };
}

/** W/kg for a sweep of body masses at a fixed FTP — shows the weight lever. */
export function massSweep(ftpWatts, massKg, offsets = [-6, -4, -2, 0, 2, 4]) {
  if (!isNum(ftpWatts) || !isNum(massKg) || ftpWatts <= 0 || massKg <= 0) return [];
  return offsets
    .map((offset) => {
      const mass = massKg + offset;
      if (mass < MIN_MASS_KG || mass > MAX_MASS_KG) return null;
      return { offset, massKg: mass, wattsPerKg: ftpWatts / mass };
    })
    .filter(Boolean);
}
