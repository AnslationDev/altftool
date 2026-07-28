/**
 * Treadmill pace conversion and incline-equivalent effort.
 *
 * Sources for every constant below:
 *  - ACSM's Guidelines for Exercise Testing and Prescription, metabolic equations
 *    for gross VO2 during walking and running on a treadmill.
 *  - Jones A.M. & Doust J.H. (1996), J Sports Sci 14(4):321-327 — a 1% treadmill
 *    grade reproduces the energy cost of outdoor level running at 2.92-5.00 m/s.
 */

/** Exact international mile in kilometres. */
export const KM_PER_MILE = 1.609344;

/** ACSM running equation: horizontal component, mL O2 per kg per metre travelled. */
export const ACSM_RUN_HORIZONTAL = 0.2;
/** ACSM running equation: vertical component (grade as a fraction). */
export const ACSM_RUN_VERTICAL = 0.9;
/** ACSM walking equation: horizontal component. */
export const ACSM_WALK_HORIZONTAL = 0.1;
/** ACSM walking equation: vertical component (grade as a fraction). */
export const ACSM_WALK_VERTICAL = 1.8;
/** Resting oxygen uptake, 1 MET, in mL/kg/min. */
export const RESTING_VO2 = 3.5;
/** Energy released per litre of oxygen consumed, kcal (mixed-diet approximation). */
export const KCAL_PER_LITRE_O2 = 5;

/** ACSM running equation is validated at or above 5 mph (8.05 km/h). */
export const RUN_THRESHOLD_KMH = 5 * KM_PER_MILE;
/** ACSM walking equation is validated from 1.9 to 3.7 mph (3.06 - 5.95 km/h). */
export const WALK_MIN_KMH = 1.9 * KM_PER_MILE;
export const WALK_MAX_KMH = 3.7 * KM_PER_MILE;

/** Jones & Doust wind-resistance allowance, in percent grade. */
export const WIND_RESISTANCE_GRADE_PCT = 1;
/** Speed window (km/h) in which the Jones & Doust 1% finding was validated. */
export const JONES_DOUST_MIN_KMH = 2.92 * 3.6;
export const JONES_DOUST_MAX_KMH = 5.0 * 3.6;

/** Practical treadmill limits used for input validation. */
export const MAX_SPEED_KMH = 30;
export const MIN_INCLINE_PCT = -5;
export const MAX_INCLINE_PCT = 40;
export const MIN_WEIGHT_KG = 20;
export const MAX_WEIGHT_KG = 300;
export const MAX_MINUTES = 600;

const toFinite = (value) => {
  const num = typeof value === "number" ? value : Number(String(value ?? "").trim());
  return Number.isFinite(num) ? num : NaN;
};

/**
 * Gross VO2 in mL/kg/min for a given treadmill speed and grade.
 * @param {number} speedMetresPerMin speed in m/min
 * @param {number} gradeFraction grade as a fraction (5% -> 0.05)
 * @param {"run"|"walk"} gait which ACSM equation to apply
 */
export function grossVo2(speedMetresPerMin, gradeFraction, gait) {
  const horizontal = gait === "run" ? ACSM_RUN_HORIZONTAL : ACSM_WALK_HORIZONTAL;
  const vertical = gait === "run" ? ACSM_RUN_VERTICAL : ACSM_WALK_VERTICAL;
  return horizontal * speedMetresPerMin + vertical * speedMetresPerMin * gradeFraction + RESTING_VO2;
}

/**
 * Speed (m/min) on a level belt that costs the same VO2.
 * Inverts the ACSM equation with grade set to zero.
 */
export function levelSpeedForVo2(vo2, gait) {
  const horizontal = gait === "run" ? ACSM_RUN_HORIZONTAL : ACSM_WALK_HORIZONTAL;
  const speed = (vo2 - RESTING_VO2) / horizontal;
  return speed > 0 ? speed : 0;
}

/** Seconds per kilometre from a speed in km/h. Returns null when speed is not positive. */
export function paceSecondsPerKm(speedKmh) {
  if (!(speedKmh > 0)) return null;
  return 3600 / speedKmh;
}

/** Format seconds as m:ss (or h:mm:ss when an hour or longer). */
export function formatPace(seconds) {
  if (seconds === null || !Number.isFinite(seconds) || seconds <= 0) return "—";
  const total = Math.round(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(secs)}` : `${minutes}:${pad(secs)}`;
}

/**
 * Convert a treadmill setting into pace, effort and equivalent outdoor pace.
 *
 * @param {object} input
 * @param {number|string} input.speed belt speed
 * @param {"kmh"|"mph"} input.speedUnit unit of input.speed
 * @param {number|string} input.incline belt grade in percent
 * @param {number|string} input.weightKg body mass in kilograms
 * @param {number|string} input.minutes session duration in minutes
 * @returns {object} result figures, or { error } when the input is unusable
 */
export function convertTreadmillPace({ speed, speedUnit = "kmh", incline, weightKg, minutes }) {
  const rawSpeed = toFinite(speed);
  const grade = toFinite(incline);
  const mass = toFinite(weightKg);
  const mins = toFinite(minutes);

  if ([rawSpeed, grade, mass, mins].some((value) => Number.isNaN(value))) {
    return { error: "Enter a number in every field." };
  }
  if (speedUnit !== "kmh" && speedUnit !== "mph") {
    return { error: "Speed unit must be km/h or mph." };
  }
  if (!(rawSpeed > 0)) {
    return { error: "Belt speed must be greater than zero." };
  }

  const speedKmh = speedUnit === "mph" ? rawSpeed * KM_PER_MILE : rawSpeed;
  if (speedKmh > MAX_SPEED_KMH) {
    return { error: `Belt speed above ${MAX_SPEED_KMH} km/h is beyond any consumer treadmill.` };
  }
  if (grade < MIN_INCLINE_PCT || grade > MAX_INCLINE_PCT) {
    return { error: `Incline must be between ${MIN_INCLINE_PCT}% and ${MAX_INCLINE_PCT}%.` };
  }
  if (mass < MIN_WEIGHT_KG || mass > MAX_WEIGHT_KG) {
    return { error: `Body weight must be between ${MIN_WEIGHT_KG} and ${MAX_WEIGHT_KG} kg.` };
  }
  if (mins < 0 || mins > MAX_MINUTES) {
    return { error: `Duration must be between 0 and ${MAX_MINUTES} minutes.` };
  }

  const speedMph = speedKmh / KM_PER_MILE;
  const speedMetresPerMin = (speedKmh * 1000) / 60;
  const gradeFraction = grade / 100;
  const gait = speedKmh >= RUN_THRESHOLD_KMH ? "run" : "walk";

  const vo2 = grossVo2(speedMetresPerMin, gradeFraction, gait);
  const mets = vo2 / RESTING_VO2;
  const kcalPerMin = (vo2 * mass * KCAL_PER_LITRE_O2) / 1000;

  const levelMetresPerMin = levelSpeedForVo2(vo2, gait);
  const flatEquivalentKmh = (levelMetresPerMin * 60) / 1000;

  // Outdoor level running costs the same as a 1% treadmill grade, so subtract that
  // allowance from the belt grade before solving for the equivalent outdoor speed.
  const outdoorGradeFraction = (grade - WIND_RESISTANCE_GRADE_PCT) / 100;
  const outdoorVo2 = grossVo2(speedMetresPerMin, outdoorGradeFraction, gait);
  const outdoorMetresPerMin = levelSpeedForVo2(outdoorVo2, gait);
  const outdoorEquivalentKmh = (outdoorMetresPerMin * 60) / 1000;

  const distanceKm = (speedKmh * mins) / 60;
  const calories = kcalPerMin * mins;

  const notes = [];
  if (gait === "run") {
    if (speedKmh < JONES_DOUST_MIN_KMH || speedKmh > JONES_DOUST_MAX_KMH) {
      notes.push(
        `The 1% wind-resistance allowance was validated between ${JONES_DOUST_MIN_KMH.toFixed(1)} and ${JONES_DOUST_MAX_KMH.toFixed(1)} km/h, so the outdoor figure is an extrapolation here.`,
      );
    }
  } else {
    notes.push(
      `Below ${RUN_THRESHOLD_KMH.toFixed(1)} km/h the walking equation is used; it is validated from ${WALK_MIN_KMH.toFixed(1)} to ${WALK_MAX_KMH.toFixed(1)} km/h on the level.`,
    );
    if (flatEquivalentKmh > WALK_MAX_KMH) {
      notes.push(
        "The flat-equivalent walking speed is faster than most people can walk, so treat it as an effort score rather than a speed you could hold.",
      );
    }
  }
  if (grade < 0) {
    notes.push("ACSM equations are not validated for downhill grades; the negative-grade figure is indicative only.");
  }

  return {
    gait,
    speedKmh,
    speedMph,
    paceSecPerKm: paceSecondsPerKm(speedKmh),
    paceSecPerMile: paceSecondsPerKm(speedKmh / KM_PER_MILE),
    incline: grade,
    vo2,
    mets,
    kcalPerMin,
    calories,
    distanceKm,
    distanceMiles: distanceKm / KM_PER_MILE,
    flatEquivalentKmh,
    flatEquivalentSecPerKm: paceSecondsPerKm(flatEquivalentKmh),
    outdoorEquivalentKmh,
    outdoorEquivalentSecPerKm: paceSecondsPerKm(outdoorEquivalentKmh),
    inclineBoostPct: speedKmh > 0 ? ((flatEquivalentKmh - speedKmh) / speedKmh) * 100 : 0,
    notes,
  };
}
