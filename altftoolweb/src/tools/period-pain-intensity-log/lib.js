/**
 * Period pain intensity log.
 *
 * Pain is recorded on the 11-point Numeric Rating Scale (NRS-11), the scale
 * used in clinics and in pain research: 0 is no pain and 10 is the worst pain
 * imaginable. The bands applied here are the standard interpretation of that
 * scale — 0 none, 1-3 mild, 4-6 moderate, 7-10 severe.
 *
 * Everything in this module is pure. Entries arrive as an array, dates arrive
 * as YYYY-MM-DD strings, and nothing reads the clock, so the same log always
 * produces the same summary.
 *
 * The relief comparison is descriptive, not causal: people reach for stronger
 * relief on their worst days, so a method can look "worse" simply because it
 * was used when the pain was already high. That confound is reported alongside
 * the numbers rather than hidden.
 */

/** Lowest and highest values on the Numeric Rating Scale. */
export const PAIN_MIN = 0;
export const PAIN_MAX = 10;

/** Standard NRS-11 severity bands. */
export const PAIN_BANDS = [
  { id: "none", label: "No pain", min: 0, max: 0 },
  { id: "mild", label: "Mild", min: 1, max: 3 },
  { id: "moderate", label: "Moderate", min: 4, max: 6 },
  { id: "severe", label: "Severe", min: 7, max: 10 },
];

/** Score at or above which pain is classed as severe on the NRS. */
export const SEVERE_THRESHOLD = 7;

/** Relief methods offered in the log. No efficacy claim is made for any of them. */
export const RELIEF_METHODS = [
  { id: "heat", label: "Heat pad or hot water bottle" },
  { id: "nsaid", label: "Anti-inflammatory painkiller" },
  { id: "paracetamol", label: "Paracetamol" },
  { id: "rest", label: "Rest or lying down" },
  { id: "movement", label: "Gentle movement or stretching" },
  { id: "hydration", label: "Fluids and warm drinks" },
  { id: "massage", label: "Massage or pressure" },
  { id: "tens", label: "TENS machine" },
  { id: "hormonal", label: "Hormonal contraception" },
  { id: "other", label: "Something else" },
];

/** Highest cycle day the log will accept. */
export const MAX_CYCLE_DAY = 45;

/** Number of severe days in the log that triggers the "worth discussing" flag. */
export const SEVERE_DAYS_FLAG = 3;

/** Cycle day beyond which pain is no longer typical period pain. */
export const LATE_CYCLE_PAIN_DAY = 8;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

const mean = (values) =>
  values.length === 0 ? null : values.reduce((sum, value) => sum + value, 0) / values.length;

/** True when a YYYY-MM-DD string is a real calendar date. */
export function isValidDate(value) {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const check = new Date(Date.UTC(year, month - 1, day));
  return (
    check.getUTCFullYear() === year &&
    check.getUTCMonth() === month - 1 &&
    check.getUTCDate() === day
  );
}

/** The NRS band a score falls into. */
export function bandForPain(pain) {
  if (!isNum(pain)) return null;
  return PAIN_BANDS.find((band) => pain >= band.min && pain <= band.max) || null;
}

/**
 * Validate one log entry.
 * @returns {{error:string}|{entry:object}}
 */
export function validateEntry({ date, cycleDay, pain, methods = [], note = "" } = {}) {
  if (!isValidDate(date)) return { error: "Enter a valid date for this entry." };
  if (!isNum(cycleDay) || !Number.isInteger(cycleDay)) {
    return { error: "Cycle day must be a whole number." };
  }
  if (cycleDay < 1 || cycleDay > MAX_CYCLE_DAY) {
    return { error: `Cycle day should be between 1 and ${MAX_CYCLE_DAY}.` };
  }
  if (!isNum(pain) || !Number.isInteger(pain)) {
    return { error: "Pain score must be a whole number." };
  }
  if (pain < PAIN_MIN || pain > PAIN_MAX) {
    return { error: `Pain score should be between ${PAIN_MIN} and ${PAIN_MAX}.` };
  }
  const known = new Set(RELIEF_METHODS.map((item) => item.id));
  const cleanMethods = Array.isArray(methods)
    ? methods.filter((id) => known.has(id))
    : [];
  return {
    entry: {
      date,
      cycleDay,
      pain,
      methods: cleanMethods,
      note: typeof note === "string" ? note.slice(0, 200) : "",
    },
  };
}

/**
 * Summarise a log.
 * @param {Array} entries validated entries
 * @returns {{error:string}|object}
 */
export function summariseLog(entries) {
  if (!Array.isArray(entries) || entries.length === 0) {
    return { error: "Add at least one entry to see a summary." };
  }

  const clean = entries.filter(
    (item) => item && isNum(item.pain) && isNum(item.cycleDay) && isValidDate(item.date),
  );
  if (clean.length === 0) {
    return { error: "None of the saved entries are usable — add a new one." };
  }

  const scores = clean.map((item) => item.pain);
  const averagePain = mean(scores);
  const peakPain = Math.max(...scores);
  const lowestPain = Math.min(...scores);

  const worstEntry = clean.reduce(
    (worst, item) => (item.pain > worst.pain ? item : worst),
    clean[0],
  );

  const bandCounts = PAIN_BANDS.map((band) => ({
    id: band.id,
    label: band.label,
    count: clean.filter((item) => item.pain >= band.min && item.pain <= band.max).length,
  })).map((row) => ({ ...row, share: (row.count / clean.length) * 100 }));

  const dayMap = new Map();
  for (const item of clean) {
    const bucket = dayMap.get(item.cycleDay) || [];
    bucket.push(item.pain);
    dayMap.set(item.cycleDay, bucket);
  }
  const byCycleDay = [...dayMap.entries()]
    .map(([cycleDay, values]) => ({
      cycleDay,
      entries: values.length,
      averagePain: mean(values),
      peakPain: Math.max(...values),
    }))
    .sort((a, b) => a.cycleDay - b.cycleDay);

  const severeEntries = clean.filter((item) => item.pain >= SEVERE_THRESHOLD);
  const lateCyclePain = clean.filter(
    (item) => item.cycleDay > LATE_CYCLE_PAIN_DAY && item.pain >= 4,
  );

  const dates = clean.map((item) => item.date).sort();

  const flags = [];
  if (severeEntries.length >= SEVERE_DAYS_FLAG) {
    flags.push(
      `You have logged ${severeEntries.length} days at ${SEVERE_THRESHOLD} or above on the 0-10 scale. Pain that repeatedly reaches the severe band, or that stops you going to work or school, is worth raising with a clinician.`,
    );
  }
  if (lateCyclePain.length > 0) {
    flags.push(
      `You have logged moderate or worse pain after cycle day ${LATE_CYCLE_PAIN_DAY}. Pain well outside the bleeding days is worth mentioning, since it is not typical period cramping.`,
    );
  }
  if (averagePain !== null && averagePain >= SEVERE_THRESHOLD) {
    flags.push(
      "Your average across every logged day sits in the severe band. Bring this log to an appointment rather than managing it alone.",
    );
  }

  return {
    count: clean.length,
    averagePain,
    peakPain,
    lowestPain,
    averageBand: bandForPain(Math.round(averagePain)),
    peakBand: bandForPain(peakPain),
    worstEntry,
    bandCounts,
    byCycleDay,
    severeCount: severeEntries.length,
    severeShare: (severeEntries.length / clean.length) * 100,
    firstDate: dates[0],
    lastDate: dates[dates.length - 1],
    flags,
  };
}

/**
 * Compare average pain on days a relief method was used against days it was not.
 * Descriptive only — see the module note on confounding.
 * @returns {Array} one row per method that appears in the log
 */
export function reliefComparison(entries) {
  if (!Array.isArray(entries) || entries.length === 0) return [];
  const clean = entries.filter((item) => item && isNum(item.pain) && Array.isArray(item.methods));
  if (clean.length === 0) return [];

  return RELIEF_METHODS.map((method) => {
    const used = clean.filter((item) => item.methods.includes(method.id));
    if (used.length === 0) return null;
    const notUsed = clean.filter((item) => !item.methods.includes(method.id));
    const withMethod = mean(used.map((item) => item.pain));
    const withoutMethod = notUsed.length === 0 ? null : mean(notUsed.map((item) => item.pain));
    return {
      id: method.id,
      label: method.label,
      uses: used.length,
      averageWith: withMethod,
      averageWithout: withoutMethod,
      difference: withoutMethod === null ? null : withMethod - withoutMethod,
    };
  })
    .filter(Boolean)
    .sort((a, b) => b.uses - a.uses);
}
