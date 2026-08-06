/**
 * VO2 Max Estimator — five published field-test equations plus Cooper Institute norms.
 *
 * VO2 max is the highest rate of oxygen the body can use, in millilitres of
 * oxygen per kilogram of body mass per minute (ml/kg/min). A laboratory
 * measures it directly; these equations estimate it from a field test.
 *
 * Equations implemented (each exactly as published — no rounding baked in):
 *
 *  1. Cooper 12-minute run (Cooper KH, JAMA 1968):
 *        VO2max = (distance_metres - 504.9) / 44.73
 *
 *  2. 1.5-mile (2.4 km) run test:
 *        VO2max = 483 / time_minutes + 3.5
 *
 *  3. Rockport 1-mile walk test (Kline et al., Med Sci Sports Exerc 1987):
 *        VO2max = 132.853 - 0.0769*weight_lb - 0.3877*age
 *                 + 6.315*sex - 3.2649*time_minutes - 0.1565*heart_rate
 *        sex = 1 for male, 0 for female
 *
 *  4. Queens College step test (McArdle et al., 1972) — 3 minutes of stepping
 *     on a 16.25 in (41.3 cm) step, then a 15-second recovery pulse x 4:
 *        men:   VO2max = 111.33 - 0.42 * recovery_HR
 *        women: VO2max =  65.81 - 0.1847 * recovery_HR
 *
 *  5. Resting heart-rate method (Uth, Sorensen, Overgaard & Pedersen,
 *     Eur J Appl Physiol 2004):
 *        VO2max = 15.3 * (HRmax / HRrest)
 *
 * Maximum heart rate, when not measured, uses Tanaka, Monahan & Seals
 * (J Am Coll Cardiol 2001): HRmax = 208 - 0.7 * age.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** One metabolic equivalent (MET) = 3.5 ml of oxygen per kg per minute. */
export const ML_O2_PER_MET = 3.5;

/** Metres in one statute mile. */
export const METRES_PER_MILE = 1609.344;

/** Kilograms to pounds. */
export const LB_PER_KG = 2.2046226218;

/** Plausible input bounds — outside these the equations were never validated. */
export const MIN_AGE = 10;
export const MAX_AGE = 100;
export const MIN_HR = 30;
export const MAX_HR = 230;

/** Cooper 12-minute run coefficients (Cooper 1968). */
export const COOPER_OFFSET_M = 504.9;
export const COOPER_DIVISOR = 44.73;

/** 1.5-mile run coefficients. */
export const MILE15_NUMERATOR = 483;
export const MILE15_CONSTANT = 3.5;

/** Rockport 1-mile walk coefficients (Kline 1987). */
export const ROCKPORT = {
  intercept: 132.853,
  weightLb: -0.0769,
  age: -0.3877,
  male: 6.315,
  timeMin: -3.2649,
  heartRate: -0.1565,
};

/** Queens College step test coefficients (McArdle 1972). */
export const QUEENS_COLLEGE = {
  male: { intercept: 111.33, slope: -0.42, stepsPerMinute: 24 },
  female: { intercept: 65.81, slope: -0.1847, stepsPerMinute: 22 },
  stepHeightCm: 41.3,
  durationMinutes: 3,
};

/** Uth-Sorensen-Overgaard-Pedersen constant (2004). */
export const UTH_CONSTANT = 15.3;

/** Tanaka, Monahan & Seals (2001) maximum heart-rate prediction. */
export const TANAKA = { intercept: 208, ageSlope: -0.7 };

/**
 * Cooper Institute VO2 max norms, ml/kg/min, by sex and age band.
 * Each band lists the lower bound of Poor, Fair, Good, Excellent and Superior;
 * anything under the first bound is Very Poor.
 */
export const COOPER_NORMS = {
  male: [
    { minAge: 13, maxAge: 19, cuts: [35.0, 38.4, 45.2, 51.0, 56.0] },
    { minAge: 20, maxAge: 29, cuts: [33.0, 36.5, 42.5, 46.5, 52.5] },
    { minAge: 30, maxAge: 39, cuts: [31.5, 35.5, 41.0, 45.0, 49.5] },
    { minAge: 40, maxAge: 49, cuts: [30.2, 33.6, 39.0, 43.8, 48.1] },
    { minAge: 50, maxAge: 59, cuts: [26.1, 31.0, 35.8, 41.0, 45.4] },
    { minAge: 60, maxAge: 200, cuts: [20.5, 26.1, 32.3, 36.5, 44.3] },
  ],
  female: [
    { minAge: 13, maxAge: 19, cuts: [25.0, 31.0, 35.0, 39.0, 42.0] },
    { minAge: 20, maxAge: 29, cuts: [23.6, 29.0, 33.0, 37.0, 41.1] },
    { minAge: 30, maxAge: 39, cuts: [22.8, 27.0, 31.5, 35.7, 40.1] },
    { minAge: 40, maxAge: 49, cuts: [21.0, 24.5, 29.0, 32.9, 37.0] },
    { minAge: 50, maxAge: 59, cuts: [20.2, 22.8, 27.0, 31.5, 35.8] },
    { minAge: 60, maxAge: 200, cuts: [17.5, 20.2, 24.5, 30.3, 31.5] },
  ],
};

export const FITNESS_LABELS = ["Very poor", "Poor", "Fair", "Good", "Excellent", "Superior"];

export const TEST_METHODS = [
  { id: "cooper", label: "Cooper 12-minute run" },
  { id: "run15", label: "1.5-mile (2.4 km) run" },
  { id: "rockport", label: "Rockport 1-mile walk" },
  { id: "queens", label: "Queens College step test" },
  { id: "resting", label: "Resting heart rate (no test)" },
];

const isNum = (v) => typeof v === "number" && Number.isFinite(v);

const checkAge = (age) =>
  isNum(age) && age >= MIN_AGE && age <= MAX_AGE
    ? null
    : { error: `Enter an age between ${MIN_AGE} and ${MAX_AGE} years.` };

const checkHr = (hr, name) =>
  isNum(hr) && hr >= MIN_HR && hr <= MAX_HR
    ? null
    : { error: `Enter a ${name} between ${MIN_HR} and ${MAX_HR} beats per minute.` };

/** Tanaka age-predicted maximum heart rate. */
export function predictedMaxHeartRate(age) {
  const bad = checkAge(age);
  if (bad) return bad;
  return { hrMax: TANAKA.intercept + TANAKA.ageSlope * age };
}

/** Cooper 12-minute run: distance covered in 12 minutes, in metres. */
export function cooperTest({ distanceMetres }) {
  if (!isNum(distanceMetres) || distanceMetres <= 0) {
    return { error: "Enter the distance covered in 12 minutes, in metres." };
  }
  if (distanceMetres > 6000) return { error: "That distance is beyond any human 12-minute record — check the units." };
  const vo2max = (distanceMetres - COOPER_OFFSET_M) / COOPER_DIVISOR;
  if (vo2max <= 0) {
    return { error: `Distances at or below ${COOPER_OFFSET_M} m fall outside the Cooper equation's range.` };
  }
  return { vo2max };
}

/** 1.5-mile / 2.4 km run for time. */
export function run15MileTest({ timeMinutes }) {
  if (!isNum(timeMinutes) || timeMinutes <= 0) return { error: "Enter your 1.5-mile time in minutes." };
  if (timeMinutes < 6) return { error: "No one runs 1.5 miles under 6 minutes — check the time." };
  if (timeMinutes > 40) return { error: "Times over 40 minutes fall outside this equation's validated range." };
  return { vo2max: MILE15_NUMERATOR / timeMinutes + MILE15_CONSTANT };
}

/** Rockport 1-mile walk test. */
export function rockportTest({ weightKg, age, sex, timeMinutes, heartRate }) {
  const badAge = checkAge(age);
  if (badAge) return badAge;
  if (!isNum(weightKg) || weightKg <= 0) return { error: "Enter your body weight in kilograms." };
  if (weightKg > 400) return { error: "Enter a body weight of 400 kg or less." };
  if (!isNum(timeMinutes) || timeMinutes <= 0) return { error: "Enter your 1-mile walk time in minutes." };
  if (timeMinutes < 8 || timeMinutes > 30) {
    return { error: "The Rockport walk test is validated for 1-mile times between 8 and 30 minutes." };
  }
  const badHr = checkHr(heartRate, "finishing heart rate");
  if (badHr) return badHr;
  const weightLb = weightKg * LB_PER_KG;
  const vo2max =
    ROCKPORT.intercept +
    ROCKPORT.weightLb * weightLb +
    ROCKPORT.age * age +
    ROCKPORT.male * (sex === "male" ? 1 : 0) +
    ROCKPORT.timeMin * timeMinutes +
    ROCKPORT.heartRate * heartRate;
  if (vo2max <= 0) return { error: "Those values produce a negative VO2 max — re-check the walk time and heart rate." };
  return { vo2max, weightLb };
}

/** Queens College step test: recovery heart rate taken 5-20 s after stopping. */
export function queensCollegeTest({ sex, recoveryHeartRate }) {
  const bad = checkHr(recoveryHeartRate, "recovery heart rate");
  if (bad) return bad;
  const coefficients = sex === "male" ? QUEENS_COLLEGE.male : QUEENS_COLLEGE.female;
  const vo2max = coefficients.intercept + coefficients.slope * recoveryHeartRate;
  if (vo2max <= 0) {
    return { error: "That recovery heart rate is too high for this equation to give a usable result." };
  }
  return { vo2max, stepsPerMinute: coefficients.stepsPerMinute };
}

/** Resting heart rate method — needs a measured or predicted HRmax. */
export function restingHeartRateTest({ restingHeartRate, maxHeartRate }) {
  const badRest = checkHr(restingHeartRate, "resting heart rate");
  if (badRest) return badRest;
  const badMax = checkHr(maxHeartRate, "maximum heart rate");
  if (badMax) return badMax;
  if (maxHeartRate <= restingHeartRate) {
    return { error: "Maximum heart rate must be higher than resting heart rate." };
  }
  return { vo2max: UTH_CONSTANT * (maxHeartRate / restingHeartRate) };
}

/**
 * Place a VO2 max on the Cooper Institute norm table.
 *
 * @param {{ vo2max: number, age: number, sex: "male"|"female" }} input
 */
export function classifyVo2Max({ vo2max, age, sex }) {
  const badAge = checkAge(age);
  if (badAge) return badAge;
  if (!isNum(vo2max) || vo2max <= 0) return { error: "VO2 max must be greater than zero." };
  const table = COOPER_NORMS[sex === "male" ? "male" : "female"];
  const band = table.find((row) => age >= row.minAge && age <= row.maxAge);
  if (!band) {
    return { error: `The Cooper Institute norms start at age ${table[0].minAge}.` };
  }
  let index = 0;
  for (let i = 0; i < band.cuts.length; i += 1) {
    if (vo2max >= band.cuts[i]) index = i + 1;
  }
  const superiorCut = band.cuts[band.cuts.length - 1];
  return {
    category: FITNESS_LABELS[index],
    bandLabel: band.maxAge >= 200 ? `${band.minAge}+` : `${band.minAge}-${band.maxAge}`,
    cuts: band.cuts,
    toSuperior: Math.max(0, superiorCut - vo2max),
  };
}

/**
 * Run whichever test was chosen and return the score, METs and classification.
 *
 * @param {{ method: string, age: number, sex: "male"|"female", weightKg?: number,
 *           distanceMetres?: number, timeMinutes?: number, heartRate?: number,
 *           recoveryHeartRate?: number, restingHeartRate?: number,
 *           maxHeartRate?: number|null }} input
 */
export function estimateVo2Max(input) {
  const { method, age, sex } = input;
  const badAge = checkAge(age);
  if (badAge) return badAge;

  let outcome;
  if (method === "cooper") outcome = cooperTest({ distanceMetres: input.distanceMetres });
  else if (method === "run15") outcome = run15MileTest({ timeMinutes: input.timeMinutes });
  else if (method === "rockport") {
    outcome = rockportTest({
      weightKg: input.weightKg,
      age,
      sex,
      timeMinutes: input.timeMinutes,
      heartRate: input.heartRate,
    });
  } else if (method === "queens") {
    outcome = queensCollegeTest({ sex, recoveryHeartRate: input.recoveryHeartRate });
  } else if (method === "resting") {
    // input.maxHeartRate is `null` only when the "use my measured HRmax"
    // checkbox is unchecked — that's an intentional request to fall back to
    // the Tanaka prediction. Any other non-numeric value (NaN) means the box
    // was checked but the field was left blank or unparsable, which must be
    // reported instead of silently substituting the prediction the user
    // explicitly opted out of.
    let hrMaxInput;
    if (input.maxHeartRate === null || input.maxHeartRate === undefined) {
      hrMaxInput = predictedMaxHeartRate(age).hrMax;
    } else if (isNum(input.maxHeartRate)) {
      hrMaxInput = input.maxHeartRate;
    } else {
      return { error: "Enter your measured maximum heart rate, or uncheck the box to use the predicted value." };
    }
    outcome = restingHeartRateTest({ restingHeartRate: input.restingHeartRate, maxHeartRate: hrMaxInput });
  } else {
    return { error: "Choose one of the five field tests." };
  }

  if (outcome.error) return outcome;

  const vo2max = outcome.vo2max;
  const rating = classifyVo2Max({ vo2max, age, sex });
  const hrMax = predictedMaxHeartRate(age);

  // A valid, computed VO2 max should still be reported even when the Cooper
  // Institute norm table has no band for this age (it starts at 13) — the
  // number and METs are real regardless of whether a category can be
  // assigned, so only the rating fields fall back to "unavailable" instead
  // of discarding the whole result.
  return {
    vo2max,
    mets: vo2max / ML_O2_PER_MET,
    absoluteLitresPerMin: isNum(input.weightKg) && input.weightKg > 0 ? (vo2max * input.weightKg) / 1000 : null,
    category: rating.error ? null : rating.category,
    bandLabel: rating.error ? null : rating.bandLabel,
    cuts: rating.error ? null : rating.cuts,
    toSuperior: rating.error ? null : rating.toSuperior,
    ratingUnavailable: rating.error || null,
    predictedHrMax: hrMax.error ? null : hrMax.hrMax,
    methodLabel: TEST_METHODS.find((m) => m.id === method)?.label ?? method,
  };
}
