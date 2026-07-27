/**
 * Caffeine cutoff maths.
 *
 * Caffeine follows first-order elimination, so the amount left in the body is
 *
 *   remaining = dose x 0.5 ^ (hours elapsed / half-life)
 *
 * Rearranged, the wait needed to fall from `dose` to a chosen residual is
 *
 *   hours = half-life x log2(dose / residual)
 *
 * All times are handled as "HH:MM" strings and minutes past midnight; nothing
 * here reads the system clock.
 */

export const MINUTES_PER_DAY = 1440;

/**
 * Caffeine half-life in healthy non-pregnant adults is commonly cited as about
 * 5 hours, with an individual range of roughly 3-7 hours. Oral contraceptives,
 * pregnancy and liver disease lengthen it; smoking shortens it.
 */
export const DEFAULT_HALF_LIFE_HOURS = 5;
export const MIN_HALF_LIFE_HOURS = 1.5;
export const MAX_HALF_LIFE_HOURS = 12;

/**
 * Practical "low residual" target at bedtime. There is no official threshold,
 * but 50 mg is roughly half a standard 240 ml cup of brewed coffee and is a
 * common working target for a dose small enough to be unlikely to matter.
 */
export const DEFAULT_TARGET_RESIDUAL_MG = 50;
export const MIN_TARGET_RESIDUAL_MG = 5;

/**
 * Controlled trial evidence (Drake et al., Journal of Clinical Sleep Medicine,
 * 2013) found 400 mg of caffeine still measurably disrupted sleep when taken
 * 6 hours before bed, which is why 6 hours is treated as a floor here rather
 * than a "safe" gap.
 */
export const EVIDENCE_MINIMUM_GAP_HOURS = 6;

/** FDA: up to 400 mg a day is not generally associated with negative effects in healthy adults. */
export const FDA_DAILY_LIMIT_MG = 400;
/** ACOG guidance for pregnancy is under 200 mg a day. */
export const PREGNANCY_DAILY_LIMIT_MG = 200;

/** Single-dose sanity ceiling for this calculator. */
export const MAX_DOSE_MG = 2000;

/**
 * Typical caffeine content of common servings, in milligrams.
 * Figures follow the widely published USDA / FDA reference values.
 */
export const DRINKS = [
  { id: "brewed-coffee", label: "Brewed coffee (240 ml)", mg: 95 },
  { id: "instant-coffee", label: "Instant coffee (240 ml)", mg: 62 },
  { id: "espresso", label: "Espresso shot (30 ml)", mg: 63 },
  { id: "black-tea", label: "Black tea (240 ml)", mg: 47 },
  { id: "green-tea", label: "Green tea (240 ml)", mg: 28 },
  { id: "cola", label: "Cola (355 ml)", mg: 34 },
  { id: "energy-drink", label: "Energy drink (240 ml)", mg: 80 },
  { id: "dark-chocolate", label: "Dark chocolate (30 g)", mg: 23 },
];

/** Parse an "HH:MM" 24-hour clock string into minutes past midnight, or null. */
export function parseClock(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

/** Wrap any minute value into 0..1439. */
export function wrapMinutes(minutes) {
  if (!Number.isFinite(minutes)) return 0;
  const wrapped = Math.round(minutes) % MINUTES_PER_DAY;
  return wrapped < 0 ? wrapped + MINUTES_PER_DAY : wrapped;
}

/** Format minutes past midnight as a 12-hour clock string. */
export function formatClock12(minutes) {
  const m = wrapMinutes(minutes);
  const hours24 = Math.floor(m / 60);
  const suffix = hours24 >= 12 ? "pm" : "am";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${hours12}:${String(m % 60).padStart(2, "0")} ${suffix}`;
}

/** Format a decimal number of hours as "4h 38m". */
export function formatHours(hours) {
  if (!Number.isFinite(hours) || hours < 0) return "0h 00m";
  const totalMinutes = Math.round(hours * 60);
  return `${Math.floor(totalMinutes / 60)}h ${String(totalMinutes % 60).padStart(2, "0")}m`;
}

/**
 * Caffeine left in the body after a given number of hours.
 * Returns 0 for invalid input rather than NaN.
 */
export function caffeineRemaining({ doseMg, hoursElapsed, halfLifeHours = DEFAULT_HALF_LIFE_HOURS }) {
  const dose = Number(doseMg);
  const hours = Number(hoursElapsed);
  const halfLife = Number(halfLifeHours);
  if (!Number.isFinite(dose) || dose <= 0) return 0;
  if (!Number.isFinite(hours) || hours <= 0) return dose;
  if (!Number.isFinite(halfLife) || halfLife <= 0) return dose;
  return dose * Math.pow(0.5, hours / halfLife);
}

/**
 * Hours needed for `doseMg` to decay to `targetMg`.
 * Returns 0 when the dose is already at or below the target.
 */
export function hoursToDecay({ doseMg, targetMg, halfLifeHours = DEFAULT_HALF_LIFE_HOURS }) {
  const dose = Number(doseMg);
  const target = Number(targetMg);
  const halfLife = Number(halfLifeHours);
  if (!Number.isFinite(dose) || !Number.isFinite(target) || !Number.isFinite(halfLife)) return 0;
  if (dose <= 0 || target <= 0 || halfLife <= 0) return 0;
  if (dose <= target) return 0;
  return halfLife * Math.log2(dose / target);
}

/**
 * Work out the latest sensible caffeine time for a given bedtime.
 *
 * @param {object} input
 * @param {string} input.bedTime "HH:MM" planned bedtime.
 * @param {number} input.doseMg Caffeine in the drink, in milligrams.
 * @param {number} [input.halfLifeHours] Personal caffeine half-life.
 * @param {number} [input.targetResidualMg] Residual you are willing to have on board at bedtime.
 * @param {string} [input.drinkTime] Optional "HH:MM" of when you actually drank it.
 * @returns {object} results or { error }
 */
export function computeCaffeineCutoff({
  bedTime,
  doseMg,
  halfLifeHours = DEFAULT_HALF_LIFE_HOURS,
  targetResidualMg = DEFAULT_TARGET_RESIDUAL_MG,
  drinkTime = null,
} = {}) {
  const bed = parseClock(bedTime);
  if (bed === null) return { error: "Enter a valid bedtime in 24-hour HH:MM form." };

  const dose = Number(doseMg);
  if (!Number.isFinite(dose)) return { error: "Enter the caffeine amount in milligrams." };
  if (dose <= 0) return { error: "Caffeine amount must be greater than zero." };
  if (dose > MAX_DOSE_MG) {
    return { error: `A single dose above ${MAX_DOSE_MG} mg is outside the range this tool models.` };
  }

  const halfLife = Number(halfLifeHours);
  if (!Number.isFinite(halfLife) || halfLife < MIN_HALF_LIFE_HOURS || halfLife > MAX_HALF_LIFE_HOURS) {
    return {
      error: `Half-life should be between ${MIN_HALF_LIFE_HOURS} and ${MAX_HALF_LIFE_HOURS} hours.`,
    };
  }

  const target = Number(targetResidualMg);
  if (!Number.isFinite(target) || target < MIN_TARGET_RESIDUAL_MG) {
    return { error: `Bedtime residual target must be at least ${MIN_TARGET_RESIDUAL_MG} mg.` };
  }
  if (target >= dose) {
    return {
      error: "Your residual target is not smaller than the dose — lower the target or raise the dose.",
    };
  }

  const waitHours = hoursToDecay({ doseMg: dose, targetMg: target, halfLifeHours: halfLife });
  const cutoffMinutes = wrapMinutes(bed - Math.round(waitHours * 60));
  const evidenceCutoffMinutes = wrapMinutes(bed - EVIDENCE_MINIMUM_GAP_HOURS * 60);
  const strictestCutoffMinutes =
    waitHours >= EVIDENCE_MINIMUM_GAP_HOURS ? cutoffMinutes : evidenceCutoffMinutes;

  // Decay curve at each half-life step, useful for showing how slowly it falls.
  const curve = [];
  for (let step = 0; step <= 4; step += 1) {
    const hours = step * halfLife;
    curve.push({
      hours,
      label: step === 0 ? "At the drink" : `${step} half-${step === 1 ? "life" : "lives"}`,
      remaining: caffeineRemaining({ doseMg: dose, hoursElapsed: hours, halfLifeHours: halfLife }),
      clock: wrapMinutes(bed - Math.round(waitHours * 60) + Math.round(hours * 60)),
    });
  }

  let drink = null;
  if (typeof drinkTime === "string" && drinkTime.trim() !== "") {
    const drankAt = parseClock(drinkTime);
    if (drankAt === null) return { error: "Enter a valid drink time in 24-hour HH:MM form." };
    const gapMinutes = wrapMinutes(bed - drankAt);
    const gapHours = gapMinutes / 60;
    const residual = caffeineRemaining({
      doseMg: dose,
      hoursElapsed: gapHours,
      halfLifeHours: halfLife,
    });
    drink = {
      drankAt,
      gapMinutes,
      gapHours,
      residual,
      overTarget: residual > target,
      residualShare: (residual / dose) * 100,
    };
  }

  return {
    bed,
    dose,
    halfLife,
    target,
    waitHours,
    cutoffMinutes,
    evidenceCutoffMinutes,
    strictestCutoffMinutes,
    usesEvidenceFloor: waitHours < EVIDENCE_MINIMUM_GAP_HOURS,
    overFdaDailyLimit: dose > FDA_DAILY_LIMIT_MG,
    overPregnancyLimit: dose > PREGNANCY_DAILY_LIMIT_MG,
    curve,
    drink,
  };
}
