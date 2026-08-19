/**
 * Workout caffeine dose calculator — pure logic.
 *
 * Dosing follows the ISSN position stand on caffeine and exercise performance
 * (Guest et al., JISSN 2021):
 *  - The ergogenic dose is 3-6 mg of caffeine per kg bodyweight.
 *  - Anhydrous caffeine is typically taken about 60 minutes before exercise.
 *  - Doses above roughly 9 mg/kg add no further performance benefit and
 *    increase side effects.
 *
 * Safety reference points come from the EFSA 2015 scientific opinion on
 * caffeine: single doses up to 200 mg and habitual intakes up to 400 mg per day
 * are of no safety concern for healthy adults, with 200 mg per day the figure
 * used during pregnancy.
 *
 * Clearance uses first-order elimination with a plasma half-life of about
 * 5 hours in healthy adults (published range roughly 3-7 hours).
 */

export const ERGOGENIC_MIN_MG_PER_KG = 3;
export const ERGOGENIC_MAX_MG_PER_KG = 6;
/** Above this, extra caffeine adds side effects rather than performance. */
export const NO_EXTRA_BENEFIT_MG_PER_KG = 9;

export const EFSA_DAILY_LIMIT_MG = 400;
export const EFSA_SINGLE_DOSE_MG = 200;
export const EFSA_PREGNANCY_DAILY_MG = 200;

export const HALF_LIFE_HOURS_DEFAULT = 5;
export const HALF_LIFE_HOURS_MIN = 3;
export const HALF_LIFE_HOURS_MAX = 7;

/**
 * Caffeine still circulating at bedtime above roughly this level is where most
 * sleep-quality guidance draws the line; sensitive people react to less.
 */
export const SLEEP_THRESHOLD_MG = 100;

export const DOSE_LEVELS = [
  { id: "low", label: "Low — 3 mg/kg", mgPerKg: 3, note: "Bottom of the ergogenic range; fewer side effects." },
  { id: "moderate", label: "Moderate — 4.5 mg/kg", mgPerKg: 4.5, note: "Mid-range, the most commonly studied dose." },
  { id: "high", label: "High — 6 mg/kg", mgPerKg: 6, note: "Top of the ergogenic range; check it against the daily limit." },
];

/**
 * Delivery forms and how far ahead of training to take them. Anhydrous caffeine
 * peaks in plasma around 30-120 minutes; caffeine gum is absorbed through the
 * buccal mucosa and peaks far sooner.
 */
export const FORMS = [
  { id: "capsule", label: "Capsule / anhydrous caffeine", leadMinutes: 60, note: "Peak plasma caffeine is reached roughly 60 minutes after swallowing." },
  { id: "coffee", label: "Brewed coffee", leadMinutes: 60, note: "Similar absorption to a capsule, but the dose per cup varies a lot." },
  { id: "preworkout", label: "Pre-workout powder", leadMinutes: 45, note: "Liquid on an empty stomach absorbs a little faster than a capsule." },
  { id: "energy-drink", label: "Energy drink", leadMinutes: 45, note: "Carbonated and cold, so it is usually drunk quickly." },
  { id: "gum", label: "Caffeine gum", leadMinutes: 10, note: "Absorbed through the cheek lining; effective within about 10 minutes." },
];

/**
 * Caffeine content of common sources. Values are typical figures from food
 * composition tables and product labels; brewed strength varies widely.
 */
export const CAFFEINE_SOURCES = [
  { id: "brewed", label: "Brewed coffee", serving: "240 ml cup", mgPerServing: 95 },
  { id: "espresso", label: "Espresso", serving: "30 ml shot", mgPerServing: 63 },
  { id: "instant", label: "Instant coffee", serving: "240 ml cup", mgPerServing: 62 },
  { id: "black-tea", label: "Black tea", serving: "240 ml cup", mgPerServing: 47 },
  { id: "green-tea", label: "Green tea", serving: "240 ml cup", mgPerServing: 28 },
  { id: "energy", label: "Energy drink", serving: "250 ml can", mgPerServing: 80 },
  { id: "cola", label: "Cola", serving: "355 ml can", mgPerServing: 34 },
  { id: "gum", label: "Caffeine gum", serving: "1 piece", mgPerServing: 100 },
];

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** Parse "HH:MM" into minutes past midnight, or NaN. */
export function parseClock(value) {
  if (typeof value !== "string") return NaN;
  const match = TIME_RE.exec(value.trim());
  if (!match) return NaN;
  return Number(match[1]) * 60 + Number(match[2]);
}

/** Format minutes past midnight (any integer) back to "HH:MM". */
export function formatClock(minutes) {
  const wrapped = ((Math.round(minutes) % 1440) + 1440) % 1440;
  const h = String(Math.floor(wrapped / 60)).padStart(2, "0");
  const m = String(wrapped % 60).padStart(2, "0");
  return `${h}:${m}`;
}

/** First-order elimination: what is left after `hours` at a given half-life. */
export function remainingCaffeine(doseMg, hours, halfLifeHours) {
  if (!(doseMg > 0) || !(halfLifeHours > 0) || !(hours >= 0)) return 0;
  return doseMg * Math.pow(0.5, hours / halfLifeHours);
}

const round1 = (value) => Math.round(value * 10) / 10;

/**
 * @param {object} input
 * @param {number} input.bodyWeightKg
 * @param {string} input.doseLevel - a DOSE_LEVELS id, or "custom"
 * @param {number} [input.customMgPerKg] - used when doseLevel is "custom"
 * @param {string} input.form - a FORMS id
 * @param {string} input.trainingTime - "HH:MM"
 * @param {string} input.bedTime - "HH:MM"
 * @param {number} [input.halfLifeHours]
 * @param {number} [input.otherCaffeineMg] - caffeine already taken today
 * @returns {object|{error: string}}
 */
export function computeCaffeinePlan({
  bodyWeightKg,
  doseLevel = "moderate",
  customMgPerKg = ERGOGENIC_MIN_MG_PER_KG,
  form = "capsule",
  trainingTime,
  bedTime,
  halfLifeHours = HALF_LIFE_HOURS_DEFAULT,
  otherCaffeineMg = 0,
}) {
  const weight = Number(bodyWeightKg);
  if (!Number.isFinite(weight)) return { error: "Enter your bodyweight in kilograms." };
  if (weight < 30 || weight > 250) {
    return { error: "Bodyweight should be between 30 kg and 250 kg." };
  }

  let mgPerKg;
  let levelLabel;
  let levelNote;
  if (doseLevel === "custom") {
    mgPerKg = Number(customMgPerKg);
    levelLabel = "Custom dose";
    levelNote = "Your own mg per kg figure.";
    if (!Number.isFinite(mgPerKg) || mgPerKg <= 0 || mgPerKg > 12) {
      return { error: "Custom dose should be between 0 and 12 mg per kg." };
    }
  } else {
    const level = DOSE_LEVELS.find((item) => item.id === doseLevel);
    if (!level) return { error: "Pick a dose level." };
    mgPerKg = level.mgPerKg;
    levelLabel = level.label;
    levelNote = level.note;
  }

  const formEntry = FORMS.find((item) => item.id === form);
  if (!formEntry) return { error: "Pick how you are taking the caffeine." };

  const trainingMinutes = parseClock(trainingTime);
  if (Number.isNaN(trainingMinutes)) {
    return { error: "Enter your training start time as HH:MM." };
  }
  const bedMinutes = parseClock(bedTime);
  if (Number.isNaN(bedMinutes)) {
    return { error: "Enter your bedtime as HH:MM." };
  }

  const halfLife = Number(halfLifeHours);
  if (!Number.isFinite(halfLife) || halfLife < HALF_LIFE_HOURS_MIN || halfLife > HALF_LIFE_HOURS_MAX) {
    return {
      error: `Caffeine half-life should be between ${HALF_LIFE_HOURS_MIN} and ${HALF_LIFE_HOURS_MAX} hours.`,
    };
  }

  const other = Number(otherCaffeineMg);
  if (!Number.isFinite(other) || other < 0 || other > 2000) {
    return { error: "Other caffeine today should be between 0 mg and 2000 mg." };
  }

  const doseMg = Math.round(weight * mgPerKg);
  const intakeMinutes = trainingMinutes - formEntry.leadMinutes;
  const intakeTime = formatClock(intakeMinutes);

  // Bedtime is the next occurrence of that clock time after the dose is taken.
  const minutesToBed = ((bedMinutes - intakeMinutes) % 1440 + 1440) % 1440;
  const hoursToBed = round1(minutesToBed / 60);
  const remainingAtBedMg = Math.round(remainingCaffeine(doseMg, minutesToBed / 60, halfLife));

  const dailyTotalMg = doseMg + other;
  const overDailyLimit = dailyTotalMg > EFSA_DAILY_LIMIT_MG;
  const overSingleDoseGuide = doseMg > EFSA_SINGLE_DOSE_MG;
  const aboveErgogenicRange = mgPerKg > NO_EXTRA_BENEFIT_MG_PER_KG;
  const belowErgogenicRange = mgPerKg < ERGOGENIC_MIN_MG_PER_KG;
  const sleepRisk = remainingAtBedMg >= SLEEP_THRESHOLD_MG;

  // How long until the dose has decayed below the sleep threshold.
  const exactHoursToSleepSafe =
    doseMg > SLEEP_THRESHOLD_MG
      ? halfLife * (Math.log(doseMg / SLEEP_THRESHOLD_MG) / Math.LN2)
      : 0;
  const hoursToSleepSafe = round1(exactHoursToSleepSafe);
  const sleepSafeTime = formatClock(intakeMinutes + exactHoursToSleepSafe * 60);

  const decay = [];
  for (let h = 0; h <= 12; h += 2) {
    decay.push({
      hours: h,
      clock: formatClock(intakeMinutes + h * 60),
      mg: Math.round(remainingCaffeine(doseMg, h, halfLife)),
    });
  }

  const sources = CAFFEINE_SOURCES.map((source) => ({
    id: source.id,
    label: source.label,
    serving: source.serving,
    mgPerServing: source.mgPerServing,
    servings: round1(doseMg / source.mgPerServing),
  }));

  return {
    weight,
    mgPerKg: round1(mgPerKg),
    levelLabel,
    levelNote,
    formLabel: formEntry.label,
    formNote: formEntry.note,
    leadMinutes: formEntry.leadMinutes,
    doseMg,
    intakeTime,
    trainingTime,
    bedTime,
    hoursToBed,
    remainingAtBedMg,
    halfLifeHours: halfLife,
    otherCaffeineMg: other,
    dailyTotalMg,
    overDailyLimit,
    overSingleDoseGuide,
    aboveErgogenicRange,
    belowErgogenicRange,
    sleepRisk,
    hoursToSleepSafe,
    sleepSafeTime,
    ergogenicRangeMg: {
      low: Math.round(weight * ERGOGENIC_MIN_MG_PER_KG),
      high: Math.round(weight * ERGOGENIC_MAX_MG_PER_KG),
    },
    decay,
    sources,
  };
}
