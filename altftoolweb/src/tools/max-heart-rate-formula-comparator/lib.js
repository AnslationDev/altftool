/**
 * Age-predicted maximum heart rate equations.
 *
 * Every entry below is a published regression with its own source. The spread
 * between them at a given age is the point of the comparison: all of these
 * equations carry a standard deviation of roughly 7-12 bpm around an individual,
 * so none of them should be treated as a personal measurement.
 */

export const AGE_MIN = 10;
export const AGE_MAX = 100;

export const MAX_HR_FORMULAS = [
  {
    key: "fox",
    name: "Fox",
    equation: "220 − age",
    year: 1971,
    // Fox SM, Naughton JP, Haskell WL. Ann Clin Res 1971;3(6):404-432.
    source: "Fox, Naughton & Haskell (1971), Annals of Clinical Research.",
    // Commonly quoted standard deviation for this equation.
    sd: 12,
    appliesTo: "all",
    note: "The original gym-poster formula. It was never derived from a dedicated study and overestimates in the young, underestimates in older adults.",
    predict: (age) => 220 - age,
  },
  {
    key: "astrand",
    name: "Astrand",
    equation: "216.6 − 0.84 × age",
    year: 1952,
    // Astrand PO. Experimental studies of physical working capacity, 1952.
    source: "Astrand (1952), experimental working-capacity studies.",
    sd: 10,
    appliesTo: "all",
    note: "One of the earliest laboratory-derived equations; sits above most modern fits at younger ages.",
    predict: (age) => 216.6 - 0.84 * age,
  },
  {
    key: "inbar",
    name: "Inbar",
    equation: "205.8 − 0.685 × age",
    year: 1994,
    // Inbar O et al. Med Sci Sports Exerc 1994;26(5):538-546.
    source: "Inbar et al. (1994), Medicine & Science in Sports & Exercise.",
    sd: 10,
    appliesTo: "all",
    note: "Derived from 1,424 healthy adults across a wide age range.",
    predict: (age) => 205.8 - 0.685 * age,
  },
  {
    key: "tanaka",
    name: "Tanaka",
    equation: "208 − 0.7 × age",
    year: 2001,
    // Tanaka H, Monahan KD, Seals DR. J Am Coll Cardiol 2001;37(1):153-156.
    source: "Tanaka, Monahan & Seals (2001), Journal of the American College of Cardiology.",
    sd: 10,
    appliesTo: "all",
    note: "Meta-analysis of 351 studies covering 18,712 subjects, then validated prospectively. The usual default for adults.",
    predict: (age) => 208 - 0.7 * age,
  },
  {
    key: "gellish",
    name: "Gellish",
    equation: "207 − 0.7 × age",
    year: 2007,
    // Gellish RL et al. Med Sci Sports Exerc 2007;39(5):822-829.
    source: "Gellish et al. (2007), Medicine & Science in Sports & Exercise.",
    sd: 10,
    appliesTo: "all",
    note: "Longitudinal data from 132 adults tested repeatedly over 25 years.",
    predict: (age) => 207 - 0.7 * age,
  },
  {
    key: "gulati",
    name: "Gulati",
    equation: "206 − 0.88 × age",
    year: 2010,
    // Gulati M et al. Circulation 2010;122(2):130-137.
    source: "Gulati et al. (2010), Circulation — women-specific.",
    sd: 10,
    appliesTo: "female",
    note: "Built from 5,437 asymptomatic women in the St James Women Take Heart Project. Only intended for women.",
    predict: (age) => 206 - 0.88 * age,
  },
  {
    key: "nes",
    name: "Nes",
    equation: "211 − 0.64 × age",
    year: 2013,
    // Nes BM et al. Scand J Med Sci Sports 2013;23(6):697-704 (HUNT Fitness Study).
    source: "Nes et al. (2013), Scandinavian Journal of Medicine & Science in Sports.",
    sd: 10.8,
    appliesTo: "all",
    note: "HUNT Fitness Study: 3,320 healthy Norwegian adults tested to volitional exhaustion.",
    predict: (age) => 211 - 0.64 * age,
  },
];

/** Percentage-of-maximum intensity anchors used by ACSM training guidance. */
export const INTENSITY_ANCHORS = [
  { percent: 50, label: "Very light" },
  { percent: 60, label: "Light" },
  { percent: 70, label: "Moderate" },
  { percent: 80, label: "Vigorous" },
  { percent: 90, label: "Near maximal" },
  { percent: 100, label: "Maximum" },
];

export const SEX_OPTIONS = [
  { key: "unspecified", label: "Prefer not to say" },
  { key: "female", label: "Female" },
  { key: "male", label: "Male" },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

const roundTo = (value, places) => {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
};

/**
 * Run every equation for one age and summarise the spread.
 *
 * @param {object} input
 * @param {number} input.age            Age in years.
 * @param {string} [input.sex]          "female" | "male" | "unspecified".
 * @param {number|null} [input.measuredMaxHr] Optional lab or field-tested maximum, for comparison.
 * @returns {object} per-formula results and summary, or { error }.
 */
export function compareMaxHrFormulas({ age, sex = "unspecified", measuredMaxHr = null }) {
  if (!isNum(age)) return { error: "Enter your age in years." };
  if (age < AGE_MIN || age > AGE_MAX) {
    return { error: `Age should be between ${AGE_MIN} and ${AGE_MAX} years.` };
  }
  if (!SEX_OPTIONS.some((item) => item.key === sex)) {
    return { error: "Choose one of the listed options for sex." };
  }
  if (measuredMaxHr !== null && measuredMaxHr !== undefined && measuredMaxHr !== "") {
    if (!isNum(measuredMaxHr)) return { error: "Measured maximum heart rate must be a number." };
    if (measuredMaxHr < 80 || measuredMaxHr > 230) {
      return { error: "A measured maximum heart rate should be between 80 and 230 bpm." };
    }
  }

  const results = MAX_HR_FORMULAS.map((formula) => {
    const value = formula.predict(age);
    const applicable = formula.appliesTo === "all" || formula.appliesTo === sex;
    return {
      key: formula.key,
      name: formula.name,
      equation: formula.equation,
      year: formula.year,
      source: formula.source,
      note: formula.note,
      appliesTo: formula.appliesTo,
      applicable,
      bpm: roundTo(value, 1),
      bpmRounded: Math.round(value),
      lowerBpm: Math.round(value - formula.sd),
      upperBpm: Math.round(value + formula.sd),
      sd: formula.sd,
      differenceFromMeasured:
        isNum(measuredMaxHr) && measuredMaxHr !== "" ? Math.round(value - measuredMaxHr) : null,
    };
  });

  const pool = results.filter((item) => item.applicable);
  if (pool.length === 0) {
    return { error: "No equation applies to that combination — check the age and sex fields." };
  }

  const values = pool.map((item) => item.bpm);
  const total = values.reduce((sum, value) => sum + value, 0);
  const meanValue = total / values.length;
  const lowest = pool.reduce((best, item) => (item.bpm < best.bpm ? item : best), pool[0]);
  const highest = pool.reduce((best, item) => (item.bpm > best.bpm ? item : best), pool[0]);

  const recommendedKey = sex === "female" ? "gulati" : "tanaka";
  const recommended = results.find((item) => item.key === recommendedKey);

  return {
    age,
    sex,
    results,
    applicableCount: pool.length,
    mean: roundTo(meanValue, 1),
    meanRounded: Math.round(meanValue),
    lowest,
    highest,
    spread: roundTo(highest.bpm - lowest.bpm, 1),
    recommended,
    recommendedReason:
      sex === "female"
        ? "Gulati was derived specifically from women and predicts lower maxima than the unisex equations."
        : "Tanaka is the usual default: a large meta-analysis with a prospective validation cohort.",
    measuredMaxHr: isNum(measuredMaxHr) && measuredMaxHr !== "" ? measuredMaxHr : null,
  };
}

/**
 * Intensity anchors as beats per minute for one maximum heart rate.
 *
 * @param {number} maxHr
 * @returns {Array<{percent:number,label:string,bpm:number}>} empty array for bad input.
 */
export function intensityTable(maxHr) {
  if (!isNum(maxHr) || maxHr <= 0) return [];
  return INTENSITY_ANCHORS.map((anchor) => ({
    percent: anchor.percent,
    label: anchor.label,
    bpm: Math.round((maxHr * anchor.percent) / 100),
  }));
}
