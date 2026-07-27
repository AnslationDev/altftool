/**
 * Sauna Fluid Loss Estimator — pure calculation module.
 *
 * Two modes:
 *
 *  1. MEASURED — the gold standard. Sweat loss is derived from body-mass change
 *     corrected for what you drank and passed:
 *         sweat = (pre-weight - post-weight) + fluid drunk - urine passed
 *     using the standard equivalence of 1 kg body mass to 1 litre of water.
 *
 *  2. ESTIMATED — when you did not weigh yourself. Sauna air is far hotter than
 *     skin, so dry heat flows INTO the body and the sweating drive scales with
 *     how far the air sits above skin temperature. Evaporative cooling barely
 *     works in a sauna (in a 85 C room at 15% RH the air's vapour pressure is
 *     already close to what saturated skin can produce), so almost all sweat
 *     drips off unused — which is why sauna sweat rates are so high.
 */

/** Sweating starts once air temperature exceeds roughly skin temperature. */
export const SWEAT_ONSET_TEMP_C = 33;

/**
 * Sweat rate gradient, litres per hour per m2 of body surface per degree above
 * SWEAT_ONSET_TEMP_C. Calibrated so a 1.98 m2 adult in an 85 C, 15% RH Finnish
 * sauna sweats about 1.75 L/h, matching commonly reported sauna sweat rates of
 * roughly 0.5 kg per 15-20 minute session.
 */
export const SWEAT_RATE_L_PER_H_PER_M2_PER_C = 0.0162;

/** Humid heat blocks evaporation entirely, so the sweating drive rises further.
 *  A full 100% RH room adds 40% to the modelled rate. */
export const HUMIDITY_SWEAT_FACTOR = 0.4;

/** Physiological ceiling on sweat rate, litres per hour. Even elite,
 *  heat-acclimatised athletes rarely sustain more than this. */
export const MAX_SWEAT_L_PER_HOUR = 2.5;

/** ACSM position stand: after a session, drink 125-150% of the fluid deficit,
 *  because some of it is lost again as urine before rehydration completes. */
export const REPLACEMENT_FACTOR_MIN = 1.25;
export const REPLACEMENT_FACTOR_MAX = 1.5;

/** Mean sweat sodium, mmol/L (population range roughly 20-80 mmol/L). */
export const SWEAT_SODIUM_MMOL_PER_L = 40;
const SODIUM_MG_PER_MMOL = 23;

/** Body-mass loss thresholds, percent. Above 2% performance and thermoregulation
 *  measurably decline; above 4% is a meaningful dehydration risk. */
export const BODY_MASS_LOSS_CAUTION_PCT = 2;
export const BODY_MASS_LOSS_HIGH_PCT = 4;

/** Sauna presets. Temperature and humidity are the typical operating range of
 *  each style; they only seed the inputs, the maths uses whatever you enter. */
export const SAUNA_TYPES = [
  { id: "finnish", label: "Finnish dry sauna", tempC: 85, rh: 15 },
  { id: "steam", label: "Steam room / hammam", tempC: 45, rh: 100 },
  { id: "infrared", label: "Infrared cabin", tempC: 55, rh: 30 },
  { id: "banya", label: "Russian banya", tempC: 70, rh: 40 },
];

/** Total sauna time in a day beyond which the figure stops being meaningful.
 *  Usual practice is 15-20 minutes per round with cooling breaks between. */
export const MAX_TOTAL_SESSION_MINUTES = 180;

/** Du Bois body surface area, m2. */
export function bodySurfaceArea(heightCm, weightKg) {
  return 0.007184 * Math.pow(heightCm, 0.725) * Math.pow(weightKg, 0.425);
}

/** Modelled sauna sweat rate in litres per hour. */
export function sweatRateLPerHour({ heightCm, weightKg, tempC, rhPct }) {
  const bsa = bodySurfaceArea(heightCm, weightKg);
  const above = Math.max(0, tempC - SWEAT_ONSET_TEMP_C);
  const humidityFactor = 1 + HUMIDITY_SWEAT_FACTOR * (Math.min(100, Math.max(0, rhPct)) / 100);
  const raw = SWEAT_RATE_L_PER_H_PER_M2_PER_C * above * humidityFactor * bsa;
  return { rate: Math.min(MAX_SWEAT_L_PER_HOUR, raw), capped: raw > MAX_SWEAT_L_PER_HOUR, bsa };
}

function round(value, step = 1) {
  return Math.round(value / step) * step;
}

/** Shared reporting for a known sweat volume. */
function buildResult({ sweatMl, weightKg, minutes, extra }) {
  const bodyMassLossPct = (sweatMl / 1000 / weightKg) * 100;
  const sodiumLossMg = (sweatMl / 1000) * SWEAT_SODIUM_MMOL_PER_L * SODIUM_MG_PER_MMOL;

  return {
    sweatMl: round(sweatMl, 10),
    sweatL: Math.round((sweatMl / 1000) * 100) / 100,
    totalMinutes: minutes,
    sweatRatePerHourL:
      minutes > 0 ? Math.round((sweatMl / 1000 / (minutes / 60)) * 100) / 100 : 0,
    bodyMassLossPct: Math.round(bodyMassLossPct * 100) / 100,
    replacementMinMl: round(sweatMl * REPLACEMENT_FACTOR_MIN, 10),
    replacementMaxMl: round(sweatMl * REPLACEMENT_FACTOR_MAX, 10),
    sodiumLossMg: Math.round(sodiumLossMg),
    needsElectrolytes: sweatMl >= 1000,
    cautionLoss: bodyMassLossPct >= BODY_MASS_LOSS_CAUTION_PCT,
    highLoss: bodyMassLossPct >= BODY_MASS_LOSS_HIGH_PCT,
    ...extra,
  };
}

/**
 * @param {object} input
 * @param {string} input.mode        "estimate" | "measured"
 * @param {number} input.weightKg    body weight (pre-session in measured mode)
 * @param {number} input.heightCm
 * @param {number} input.tempC       sauna air temperature
 * @param {number} input.rhPct       sauna relative humidity
 * @param {number} input.minutesPerRound
 * @param {number} input.rounds
 * @param {number} input.postWeightKg  measured mode: weight after the session
 * @param {number} input.drankMl       measured mode: fluid drunk during
 * @param {number} input.urineMl       measured mode: urine passed during
 */
export function computeSaunaFluidLoss({
  mode = "estimate",
  weightKg,
  heightCm,
  tempC,
  rhPct,
  minutesPerRound,
  rounds,
  postWeightKg,
  drankMl = 0,
  urineMl = 0,
} = {}) {
  const weight = Number(weightKg);
  const minutes = Number(minutesPerRound);
  const roundCount = Number(rounds);

  if (![weight, minutes, roundCount].every((v) => Number.isFinite(v))) {
    return { error: "Enter a number for weight, minutes per round and number of rounds." };
  }
  if (weight <= 0 || weight > 350) return { error: "Enter a body weight between 1 kg and 350 kg." };
  if (minutes <= 0) return { error: "Minutes per round must be greater than zero." };
  if (minutes > 60) return { error: "Sessions longer than 60 minutes in one round are not supported." };
  if (roundCount < 1 || roundCount > 10) return { error: "Enter between 1 and 10 rounds." };

  const totalMinutes = minutes * roundCount;
  if (totalMinutes > MAX_TOTAL_SESSION_MINUTES) {
    return {
      error: `More than ${MAX_TOTAL_SESSION_MINUTES / 60} hours of total sauna time in a day is well outside safe practice — typical guidance is 15-20 minutes per round with cooling breaks between.`,
    };
  }

  if (mode === "measured") {
    const post = Number(postWeightKg);
    const drank = Number(drankMl);
    const urine = Number(urineMl);
    if (![post, drank, urine].every((v) => Number.isFinite(v))) {
      return { error: "Enter your weight after the session, plus what you drank and passed." };
    }
    if (post <= 0 || post > 350) return { error: "Enter a post-session weight between 1 kg and 350 kg." };
    if (drank < 0 || urine < 0) return { error: "Fluid volumes cannot be negative." };
    if (drank > 5000 || urine > 3000) return { error: "Those fluid volumes look implausible — check the units." };

    const massLossMl = (weight - post) * 1000;
    const sweatMl = massLossMl + drank - urine;
    if (sweatMl < 0) {
      return {
        error:
          "That works out to negative sweat loss — you gained more mass than you lost. Check the two weights, and weigh yourself towelled dry and without clothes both times.",
      };
    }
    if (sweatMl > 6000) {
      return { error: "Over 6 litres of sweat in one session is not plausible — check the weights." };
    }

    return buildResult({
      sweatMl,
      weightKg: weight,
      minutes: totalMinutes,
      extra: { mode: "measured", massLossMl: round(massLossMl, 10), drankMl: drank, urineMl: urine },
    });
  }

  const temp = Number(tempC);
  const rh = Number(rhPct);
  const height = Number(heightCm);
  if (![temp, rh, height].every((v) => Number.isFinite(v))) {
    return { error: "Enter a number for height, sauna temperature and humidity." };
  }
  if (height < 50 || height > 250) return { error: "Enter a height between 50 cm and 250 cm." };
  if (temp < 20 || temp > 120) return { error: "Sauna temperature should be between 20 °C and 120 °C." };
  if (rh < 0 || rh > 100) return { error: "Relative humidity must be between 0% and 100%." };

  const { rate, capped, bsa } = sweatRateLPerHour({
    heightCm: height,
    weightKg: weight,
    tempC: temp,
    rhPct: rh,
  });
  const sweatMl = rate * 1000 * (totalMinutes / 60);

  return buildResult({
    sweatMl,
    weightKg: weight,
    minutes: totalMinutes,
    extra: {
      mode: "estimate",
      bsa: Math.round(bsa * 100) / 100,
      modelledRateLPerHour: Math.round(rate * 100) / 100,
      rateCapped: capped,
    },
  });
}

export default computeSaunaFluidLoss;
