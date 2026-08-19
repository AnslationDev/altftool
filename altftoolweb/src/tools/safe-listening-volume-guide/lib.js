/**
 * Safe listening allowance, based on the WHO-ITU global standard for safe listening
 * devices and systems (Recommendation ITU-T H.870).
 *
 * H.870 defines a weekly "sound allowance": a reference sound energy dose equal to
 * 80 dB(A) sustained for 40 hours in a week for adults, and a more protective
 * 75 dB(A) for 40 hours for children and other sensitive users.
 *
 * Sound energy doubles for every 3 dB increase in level, so the permitted duration
 * halves every 3 dB. That gives:
 *
 *   allowedHours = 40 x 2 ^ ((referenceLevel - level) / 3)
 *
 * This is informational only and does not diagnose or rule out hearing damage.
 */

/** WHO-ITU H.870 adult reference level, in dB(A). */
export const REFERENCE_LEVEL_ADULT_DB = 80;

/** WHO-ITU H.870 reference level for children and sensitive users, in dB(A). */
export const REFERENCE_LEVEL_SENSITIVE_DB = 75;

/** Both reference doses are defined over this many hours in one week. */
export const REFERENCE_HOURS_PER_WEEK = 40;

/** Equal-energy exchange rate used by WHO-ITU H.870: +3 dB halves the allowed time. */
export const EXCHANGE_RATE_DB = 3;

/** NIOSH occupational recommended exposure limit: 85 dB(A) for 8 hours a day, 3 dB exchange rate. */
export const NIOSH_LEVEL_DB = 85;
export const NIOSH_HOURS_PER_DAY = 8;

/** There are only this many hours in a week — used to flag allowances that are longer than a week. */
export const HOURS_PER_WEEK = 168;

/** Accepted input range. Below 40 dB(A) is quieter than a library; above 130 dB(A) is instant-pain territory. */
export const MIN_LEVEL_DB = 40;
export const MAX_LEVEL_DB = 130;

/** Everyday reference levels in dB(A), for orientation only. */
export const REFERENCE_SOUNDS = [
  { level: 60, label: "Normal conversation" },
  { level: 70, label: "Busy street traffic from the pavement" },
  { level: 80, label: "Headphones at a moderate indoor volume" },
  { level: 85, label: "Heavy city traffic, noisy restaurant" },
  { level: 94, label: "Headphones near maximum on many phones" },
  { level: 100, label: "Motorbike, loud club floor" },
  { level: 105, label: "Front rows at a live concert" },
  { level: 110, label: "Chainsaw, siren at close range" },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Allowed weekly hours at a level for a given reference level, from the equal-energy rule. */
export function allowedWeeklyHours(levelDb, referenceLevelDb = REFERENCE_LEVEL_ADULT_DB) {
  if (!isNum(levelDb) || !isNum(referenceLevelDb)) return NaN;
  return REFERENCE_HOURS_PER_WEEK * 2 ** ((referenceLevelDb - levelDb) / EXCHANGE_RATE_DB);
}

/** NIOSH permitted daily hours at a level (85 dB(A) / 8 h, 3 dB exchange rate). */
export function nioshDailyHours(levelDb) {
  if (!isNum(levelDb)) return NaN;
  return NIOSH_HOURS_PER_DAY * 2 ** ((NIOSH_LEVEL_DB - levelDb) / EXCHANGE_RATE_DB);
}

/**
 * @param {{levelDb:number, hoursPerDay:number, daysPerWeek:number, profile:"adult"|"sensitive"}} input
 * @returns {{error:string}|{
 *   referenceLevelDb:number, allowedWeeklyHours:number, allowedWeeklyHoursCapped:number,
 *   exceedsWeek:boolean, allowedDailyHours:number, allowedDailyHoursCapped:number,
 *   exceedsDay:boolean, nioshDailyHours:number,
 *   actualWeeklyHours:number, allowanceUsedPercent:number, withinAllowance:boolean,
 *   maxSafeLevelDb:number|null, safeHoursPerDayAtLevel:number,
 *   dbOverReference:number, band:string, headline:string
 * }}
 */
export function computeSafeListening({
  levelDb = REFERENCE_LEVEL_ADULT_DB,
  hoursPerDay = 1,
  daysPerWeek = 7,
  profile = "adult",
} = {}) {
  if (![levelDb, hoursPerDay, daysPerWeek].every(isNum)) {
    return { error: "Enter valid numbers for level, hours per day and days per week." };
  }
  if (levelDb < MIN_LEVEL_DB || levelDb > MAX_LEVEL_DB) {
    return { error: `Listening level must be between ${MIN_LEVEL_DB} and ${MAX_LEVEL_DB} dB(A).` };
  }
  if (hoursPerDay < 0 || hoursPerDay > 24) {
    return { error: "Hours of listening per day must be between 0 and 24." };
  }
  if (daysPerWeek < 1 || daysPerWeek > 7) {
    return { error: "Days of listening per week must be between 1 and 7." };
  }

  const referenceLevelDb =
    profile === "sensitive" ? REFERENCE_LEVEL_SENSITIVE_DB : REFERENCE_LEVEL_ADULT_DB;

  const allowed = allowedWeeklyHours(levelDb, referenceLevelDb);
  const actualWeeklyHours = hoursPerDay * daysPerWeek;
  const allowanceUsedPercent = allowed > 0 ? (actualWeeklyHours / allowed) * 100 : Infinity;

  // The level at which this listening habit would use exactly 100% of the weekly allowance.
  const maxSafeLevelDb =
    actualWeeklyHours > 0
      ? referenceLevelDb +
        EXCHANGE_RATE_DB * Math.log2(REFERENCE_HOURS_PER_WEEK / actualWeeklyHours)
      : null;

  const dbOverReference = levelDb - referenceLevelDb;

  let band;
  if (allowanceUsedPercent <= 50) band = "Comfortably inside the weekly allowance";
  else if (allowanceUsedPercent <= 100) band = "Close to the weekly allowance";
  else if (allowanceUsedPercent <= 400) band = "Over the weekly allowance";
  else band = "Far over the weekly allowance";

  const safeHoursPerDayAtLevel = allowed / daysPerWeek;
  const allowedDailyHours = allowed / 7;

  return {
    referenceLevelDb,
    allowedWeeklyHours: allowed,
    allowedWeeklyHoursCapped: Math.min(allowed, HOURS_PER_WEEK),
    exceedsWeek: allowed > HOURS_PER_WEEK,
    allowedDailyHours,
    // There are only 24 hours in a day — cap the equal-energy estimate at
    // that physical bound the same way allowedWeeklyHoursCapped caps the
    // weekly figure at HOURS_PER_WEEK.
    allowedDailyHoursCapped: Math.min(allowedDailyHours, 24),
    exceedsDay: allowedDailyHours > 24,
    nioshDailyHours: nioshDailyHours(levelDb),
    actualWeeklyHours,
    allowanceUsedPercent,
    withinAllowance: actualWeeklyHours <= allowed,
    maxSafeLevelDb,
    safeHoursPerDayAtLevel,
    dbOverReference,
    band,
    headline:
      actualWeeklyHours <= allowed
        ? "Within the WHO-ITU weekly sound allowance"
        : "Above the WHO-ITU weekly sound allowance",
  };
}

/** Renders a duration given in hours as a readable string ("2 h 30 min", "24 min", "48 s"). */
export function formatHours(hours) {
  if (!isNum(hours) || hours < 0) return "—";
  const totalSeconds = Math.round(hours * 3600);
  if (totalSeconds < 60) return `${totalSeconds} s`;
  const totalMinutes = Math.round(totalSeconds / 60);
  if (totalMinutes < 60) return `${totalMinutes} min`;
  const wholeHours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes === 0 ? `${wholeHours} h` : `${wholeHours} h ${minutes} min`;
}

/** A level-by-level table of allowed weekly listening time, for the reference chart. */
export function buildAllowanceTable(
  levels = [75, 80, 85, 90, 95, 100, 105, 110],
  referenceLevelDb = REFERENCE_LEVEL_ADULT_DB,
) {
  return levels.map((level) => {
    const weeklyHours = allowedWeeklyHours(level, referenceLevelDb);
    const dailyHours = weeklyHours / 7;
    return {
      level,
      weeklyHours,
      weeklyMinutes: weeklyHours * 60,
      // Capped to the physically possible bounds — a quiet level can
      // otherwise compute to thousands of "allowed" hours in a single week.
      weeklyHoursCapped: Math.min(weeklyHours, HOURS_PER_WEEK),
      dailyHours,
      dailyHoursCapped: Math.min(dailyHours, 24),
      exceedsWeek: weeklyHours > HOURS_PER_WEEK,
      exceedsDay: dailyHours > 24,
    };
  });
}
