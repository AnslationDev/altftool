/**
 * Creatine loading calculator — pure logic.
 *
 * Dosing follows the ISSN position stand on creatine supplementation
 * (Kreider et al., JISSN 2017):
 *  - Loading phase: approximately 0.3 g of creatine monohydrate per kg
 *    bodyweight per day for 5-7 days, split into four evenly spaced doses.
 *  - Maintenance: approximately 0.03 g per kg per day thereafter, which is
 *    3-5 g per day for most adults and 5-10 g per day for larger athletes.
 *  - Skipping the loading phase and taking 3-5 g per day reaches the same
 *    muscle saturation in roughly 28 days.
 *
 * All dates are supplied by the caller; nothing here reads the clock.
 */

/** ISSN loading rate, grams of creatine monohydrate per kg bodyweight per day. */
export const LOADING_G_PER_KG_PER_DAY = 0.3;
/** ISSN maintenance rate, grams per kg bodyweight per day. */
export const MAINTENANCE_G_PER_KG_PER_DAY = 0.03;

/** Loading phase length, in days (ISSN: 5-7 days). */
export const LOADING_DAYS_MIN = 5;
export const LOADING_DAYS_MAX = 7;
export const LOADING_DAYS_DEFAULT = 5;

/** ISSN recommends splitting the loading dose into four servings a day. */
export const LOADING_DOSES_PER_DAY = 4;
export const MAX_DOSES_PER_DAY = 6;

/** Practical maintenance band, grams per day. */
export const MAINTENANCE_MIN_G = 3;
export const MAINTENANCE_MAX_G = 10;

/** Days to reach the same muscle saturation with no loading phase. */
export const NO_LOAD_SATURATION_DAYS = 28;

/** A level 5 ml scoop of micronised creatine monohydrate weighs about 5 g. */
export const GRAMS_PER_LEVEL_SCOOP = 5;

/** Reported increase in body mass during loading, mostly intracellular water. */
export const LOADING_WATER_GAIN_KG_MIN = 1;
export const LOADING_WATER_GAIN_KG_MAX = 2;

export const PROTOCOLS = [
  {
    id: "loading",
    label: "Load then maintain",
    blurb: "0.3 g/kg/day for 5-7 days, then drop to the maintenance dose.",
  },
  {
    id: "no-load",
    label: "Skip loading (low dose only)",
    blurb: "Maintenance dose from day one; muscle stores saturate in about 28 days.",
  },
];

const DAY_MS = 86400000;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Parse a YYYY-MM-DD string into a UTC epoch, or NaN if malformed. */
export function parseIsoDate(iso) {
  if (typeof iso !== "string" || !ISO_DATE.test(iso)) return NaN;
  const [y, m, d] = iso.split("-").map(Number);
  if (m < 1 || m > 12 || d < 1 || d > 31) return NaN;
  const ms = Date.UTC(y, m - 1, d);
  const check = new Date(ms);
  if (check.getUTCFullYear() !== y || check.getUTCMonth() !== m - 1 || check.getUTCDate() !== d) {
    return NaN;
  }
  return ms;
}

/** Add whole days to a UTC epoch and return a YYYY-MM-DD string. */
export function addDaysIso(epochMs, days) {
  const next = new Date(epochMs + days * DAY_MS);
  const y = next.getUTCFullYear();
  const m = String(next.getUTCMonth() + 1).padStart(2, "0");
  const d = String(next.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const round1 = (value) => Math.round(value * 10) / 10;

/**
 * Build a full creatine dosing plan.
 *
 * @param {object} input
 * @param {number} input.bodyWeightKg
 * @param {string} input.protocol - "loading" or "no-load"
 * @param {number} input.loadingDays - 5 to 7, ignored when protocol is "no-load"
 * @param {number} input.dosesPerDay - servings the loading dose is split across
 * @param {string} input.startDate - YYYY-MM-DD
 * @param {number} [input.tubGrams] - tub size in grams, 0 to skip cost output
 * @param {number} [input.tubPrice] - price of one tub in your currency
 * @param {number} [input.maintenanceDaysShown] - how many maintenance rows to list
 * @returns {object|{error: string}}
 */
export function buildCreatinePlan({
  bodyWeightKg,
  protocol = "loading",
  loadingDays = LOADING_DAYS_DEFAULT,
  dosesPerDay = LOADING_DOSES_PER_DAY,
  startDate,
  tubGrams = 0,
  tubPrice = 0,
  maintenanceDaysShown = 7,
}) {
  const weight = Number(bodyWeightKg);
  if (!Number.isFinite(weight)) return { error: "Enter your bodyweight in kilograms." };
  if (weight < 25 || weight > 250) {
    return { error: "Bodyweight should be between 25 kg and 250 kg." };
  }

  const proto = PROTOCOLS.find((item) => item.id === protocol);
  if (!proto) return { error: "Pick a loading protocol." };

  const doses = Number(dosesPerDay);
  if (!Number.isFinite(doses) || Math.floor(doses) !== doses || doses < 1 || doses > MAX_DOSES_PER_DAY) {
    return { error: `Servings per day should be a whole number from 1 to ${MAX_DOSES_PER_DAY}.` };
  }

  const isLoading = proto.id === "loading";
  const days = Number(loadingDays);
  if (isLoading) {
    if (!Number.isFinite(days) || Math.floor(days) !== days) {
      return { error: "Loading days must be a whole number." };
    }
    if (days < LOADING_DAYS_MIN || days > LOADING_DAYS_MAX) {
      return { error: `A loading phase runs ${LOADING_DAYS_MIN} to ${LOADING_DAYS_MAX} days.` };
    }
  }

  const startMs = parseIsoDate(startDate);
  if (Number.isNaN(startMs)) {
    return { error: "Enter a valid start date in YYYY-MM-DD form." };
  }

  const tub = Number(tubGrams);
  const price = Number(tubPrice);
  if (!Number.isFinite(tub) || tub < 0 || tub > 20000) {
    return { error: "Tub size should be between 0 g and 20000 g." };
  }
  if (!Number.isFinite(price) || price < 0) {
    return { error: "Tub price cannot be negative." };
  }

  const shownDays = Number(maintenanceDaysShown);
  if (!Number.isFinite(shownDays) || shownDays < 0 || shownDays > 60) {
    return { error: "Maintenance rows to show should be between 0 and 60." };
  }

  const loadingDailyG = round1(weight * LOADING_G_PER_KG_PER_DAY);
  const rawMaintenance = weight * MAINTENANCE_G_PER_KG_PER_DAY;
  const maintenanceDailyG = round1(
    Math.min(MAINTENANCE_MAX_G, Math.max(MAINTENANCE_MIN_G, rawMaintenance)),
  );
  const maintenanceRaised = rawMaintenance < MAINTENANCE_MIN_G;

  const perDoseG = round1(loadingDailyG / doses);
  const activeLoadingDays = isLoading ? days : 0;
  const loadingTotalG = round1(loadingDailyG * activeLoadingDays);
  const daysToSaturation = isLoading ? activeLoadingDays : NO_LOAD_SATURATION_DAYS;

  const schedule = [];
  for (let i = 0; i < activeLoadingDays; i += 1) {
    schedule.push({
      day: i + 1,
      date: addDaysIso(startMs, i),
      phase: "Loading",
      dailyG: loadingDailyG,
      perDoseG,
      doses,
      scoops: round1(loadingDailyG / GRAMS_PER_LEVEL_SCOOP),
    });
  }
  for (let i = 0; i < Math.floor(shownDays); i += 1) {
    const dayIndex = activeLoadingDays + i;
    schedule.push({
      day: dayIndex + 1,
      date: addDaysIso(startMs, dayIndex),
      phase: "Maintenance",
      dailyG: maintenanceDailyG,
      perDoseG: maintenanceDailyG,
      doses: 1,
      scoops: round1(maintenanceDailyG / GRAMS_PER_LEVEL_SCOOP),
    });
  }

  const first30DaysG = round1(
    loadingTotalG + maintenanceDailyG * Math.max(0, 30 - activeLoadingDays),
  );

  let costPerDay = null;
  let daysPerTub = null;
  let costFirst30Days = null;
  if (tub > 0) {
    const gramPrice = price > 0 ? price / tub : 0;
    costPerDay = price > 0 ? Number((maintenanceDailyG * gramPrice).toFixed(2)) : null;
    costFirst30Days = price > 0 ? Number((first30DaysG * gramPrice).toFixed(2)) : null;
    daysPerTub = Math.floor(
      maintenanceDailyG > 0
        ? Math.max(0, tub - loadingTotalG) / maintenanceDailyG + activeLoadingDays
        : 0,
    );
    if (tub < loadingTotalG) daysPerTub = Math.floor(tub / loadingDailyG);
  }

  return {
    weight,
    protocolId: proto.id,
    protocolLabel: proto.label,
    protocolBlurb: proto.blurb,
    isLoading,
    loadingDays: activeLoadingDays,
    loadingDailyG,
    perDoseG,
    dosesPerDay: doses,
    loadingTotalG,
    maintenanceDailyG,
    maintenanceRaised,
    maintenanceScoops: round1(maintenanceDailyG / GRAMS_PER_LEVEL_SCOOP),
    loadingScoops: round1(loadingDailyG / GRAMS_PER_LEVEL_SCOOP),
    daysToSaturation,
    saturationDate: addDaysIso(startMs, Math.max(0, daysToSaturation - 1)),
    first30DaysG,
    startDate,
    schedule,
    costPerDay,
    costFirst30Days,
    daysPerTub,
    waterGainKgMin: LOADING_WATER_GAIN_KG_MIN,
    waterGainKgMax: LOADING_WATER_GAIN_KG_MAX,
  };
}
