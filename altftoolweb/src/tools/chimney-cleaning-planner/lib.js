/**
 * Chimney Cleaning Planner — grease-load model for Indian kitchen chimneys.
 *
 * Idea: a filter has a grease capacity, and cooking deposits grease at a rate set by
 * how long you cook, how much frying you do and how many burners run under the hood.
 * Cleaning interval = capacity / daily load. All capacities are expressed in "load
 * units", where one unit is one hour of mixed cooking on two burners.
 *
 * Reference point: a baffle filter under typical Indian mixed cooking — about
 * 1.5 hours a day on two burners — needs cleaning roughly monthly, which is what
 * chimney manufacturers state in their manuals.
 *
 * Suction sizing uses the air-change rule: the hood should replace the kitchen's air
 * 10-20 times an hour depending on how much frying happens, subject to the practical
 * minimums Indian manufacturers publish for regular and heavy cooking.
 *
 * Pure module: no React, no DOM, no clock reads. Dates are always passed in.
 */

/** One load unit = one hour of mixed cooking on two burners. */
export const REFERENCE_HOURS_PER_DAY = 1.5;
export const REFERENCE_BURNERS = 2;

/** Filter grease capacity, in load units, before performance drops noticeably. */
export const FILTER_TYPES = [
  {
    id: "baffle",
    label: "Baffle filter (stainless steel)",
    capacityUnits: 45,
    note: "Curved plates spin grease out of the airflow. Soak in hot water with caustic soda or dishwasher powder.",
  },
  {
    id: "mesh",
    label: "Cassette / mesh filter (aluminium)",
    capacityUnits: 22.5,
    note: "Multiple aluminium layers clog fastest and lose suction quickly. Largely superseded by baffle filters.",
  },
  {
    id: "filterless",
    label: "Filterless / auto-clean with oil collector",
    capacityUnits: 60,
    note: "A centrifugal blower throws oil into a collector cup. Empty the cup and run the heat cycle regularly.",
  },
];

/** Cooking intensity — how much grease reaches the hood per hour. */
export const COOKING_STYLES = [
  { id: "light", label: "Light — mostly boiling, steaming, little frying", factor: 0.6, airChanges: 10, minSuction: 600 },
  { id: "mixed", label: "Mixed — typical Indian home cooking with tadka", factor: 1, airChanges: 15, minSuction: 800 },
  { id: "heavy", label: "Heavy — daily deep-frying, tandoor, non-veg", factor: 1.6, airChanges: 20, minSuction: 1000 },
];

/** Charcoal filters in a recirculating (ductless) chimney: about 6 months at reference load. */
export const CHARCOAL_CAPACITY_UNITS = 270;
/** Professional deep service: about 9 months at reference load, floored at 3 months. */
export const PRO_SERVICE_CAPACITY_UNITS = 405;
/** Duct cleaning: about 12 months at reference load. */
export const DUCT_CLEAN_CAPACITY_UNITS = 547.5;

/** Auto-clean heat cycle interval, per manufacturer manuals. */
export const AUTO_CLEAN_CYCLE_DAYS = 7;

/** Interval clamps, in days, so an extreme input never produces an absurd schedule. */
export const FILTER_INTERVAL_RANGE = [3, 120];
export const CHARCOAL_INTERVAL_RANGE = [60, 365];
export const PRO_SERVICE_INTERVAL_RANGE = [90, 365];
export const DUCT_INTERVAL_RANGE = [180, 730];

/** Indicative Indian costs in INR. */
export const COSTS = {
  diyFilterClean: 25, // caustic soda / dishwasher powder per soak
  proFilterClean: 350,
  deepService: 800,
  charcoalSet: 1500,
  ductClean: 700,
};

/** Cubic feet to cubic metres. */
export const CU_FT_TO_M3 = 0.0283168;

export const DAYS_PER_YEAR = 365;

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);
const round1 = (value) => Math.round(value * 10) / 10;
const round2 = (value) => Math.round(value * 100) / 100;
const clamp = (value, [low, high]) => Math.min(high, Math.max(low, value));

/** Parse a YYYY-MM-DD string into a UTC timestamp. Returns null if unusable. */
export function parseIsoDate(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const stamp = Date.UTC(year, month - 1, day);
  const check = new Date(stamp);
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
    return null;
  }
  return stamp;
}

/** Format a UTC timestamp back as YYYY-MM-DD. */
export function toIsoDate(stamp) {
  if (!isFiniteNumber(stamp)) return null;
  return new Date(stamp).toISOString().slice(0, 10);
}

const MS_PER_DAY = 86400000;

/** Dates for the next `count` occurrences after `fromIso`, spaced `intervalDays` apart. */
export function scheduleFrom(fromIso, intervalDays, count) {
  const start = parseIsoDate(fromIso);
  if (start === null || !isFiniteNumber(intervalDays) || intervalDays <= 0) return [];
  const total = Math.max(0, Math.min(24, Math.trunc(count)));
  const dates = [];
  for (let n = 1; n <= total; n += 1) {
    dates.push(toIsoDate(start + Math.round(intervalDays * n) * MS_PER_DAY));
  }
  return dates;
}

/**
 * @param {object} input
 * @param {string} input.filterType    FILTER_TYPES id
 * @param {number} input.hoursPerDay   cooking hours under the hood
 * @param {string} input.cookingStyle  COOKING_STYLES id
 * @param {number} input.burners       burners typically used under the hood
 * @param {boolean} input.autoClean    unit has a heat auto-clean cycle
 * @param {boolean} input.ductless     recirculating chimney with charcoal filters
 * @param {number} input.kitchenLengthFt
 * @param {number} input.kitchenWidthFt
 * @param {number} input.kitchenHeightFt
 * @param {number} input.ratedSuction  chimney suction in m3/hr, 0 if unknown
 * @param {string} input.lastCleanedIso YYYY-MM-DD of the last filter clean
 * @returns {object} plan, or { error }
 */
export function planChimneyCare({
  filterType = "baffle",
  hoursPerDay,
  cookingStyle = "mixed",
  burners = 2,
  autoClean = false,
  ductless = false,
  kitchenLengthFt = 10,
  kitchenWidthFt = 8,
  kitchenHeightFt = 10,
  ratedSuction = 1200,
  lastCleanedIso = "",
} = {}) {
  const filter = FILTER_TYPES.find((entry) => entry.id === filterType);
  if (!filter) return { error: "Choose the type of filter your chimney uses." };

  const style = COOKING_STYLES.find((entry) => entry.id === cookingStyle);
  if (!style) return { error: "Choose how much frying your cooking involves." };

  if (!isFiniteNumber(hoursPerDay)) return { error: "Enter how many hours a day you cook." };
  if (hoursPerDay <= 0) return { error: "Cooking hours must be greater than zero." };
  if (hoursPerDay > 16) return { error: "More than 16 hours a day is a commercial kitchen, not a home." };

  if (!isFiniteNumber(burners) || burners < 1) return { error: "At least one burner must run under the hood." };
  if (burners > 6) return { error: "Enter six burners or fewer." };

  for (const [label, value] of [
    ["length", kitchenLengthFt],
    ["width", kitchenWidthFt],
    ["height", kitchenHeightFt],
  ]) {
    if (!isFiniteNumber(value) || value <= 0) return { error: `Kitchen ${label} must be greater than zero.` };
    if (value > 60) return { error: `Kitchen ${label} above 60 ft looks like a typo.` };
  }

  if (!isFiniteNumber(ratedSuction) || ratedSuction < 0) {
    return { error: "Rated suction cannot be negative — enter 0 if you do not know it." };
  }
  if (ratedSuction > 5000) return { error: "Suction above 5000 m³/hr is commercial equipment." };

  const lastCleaned = lastCleanedIso ? parseIsoDate(lastCleanedIso) : null;
  if (lastCleanedIso && lastCleaned === null) {
    return { error: "Last cleaned date must be a real date in YYYY-MM-DD form." };
  }

  // Grease load per day, in load units.
  const loadPerDay = hoursPerDay * style.factor * (burners / REFERENCE_BURNERS);

  const filterIntervalDays = clamp(filter.capacityUnits / loadPerDay, FILTER_INTERVAL_RANGE);
  const charcoalIntervalDays = ductless
    ? clamp(CHARCOAL_CAPACITY_UNITS / loadPerDay, CHARCOAL_INTERVAL_RANGE)
    : null;
  const serviceIntervalDays = clamp(PRO_SERVICE_CAPACITY_UNITS / loadPerDay, PRO_SERVICE_INTERVAL_RANGE);
  const ductIntervalDays = ductless
    ? null
    : clamp(DUCT_CLEAN_CAPACITY_UNITS / loadPerDay, DUCT_INTERVAL_RANGE);

  const filterCleansPerYear = DAYS_PER_YEAR / filterIntervalDays;
  const servicesPerYear = DAYS_PER_YEAR / serviceIntervalDays;
  const charcoalSetsPerYear = charcoalIntervalDays ? DAYS_PER_YEAR / charcoalIntervalDays : 0;
  const ductCleansPerYear = ductIntervalDays ? DAYS_PER_YEAR / ductIntervalDays : 0;

  const annualCostDiy =
    filterCleansPerYear * COSTS.diyFilterClean +
    servicesPerYear * COSTS.deepService +
    charcoalSetsPerYear * COSTS.charcoalSet +
    ductCleansPerYear * COSTS.ductClean;

  const annualCostPro =
    filterCleansPerYear * COSTS.proFilterClean +
    servicesPerYear * COSTS.deepService +
    charcoalSetsPerYear * COSTS.charcoalSet +
    ductCleansPerYear * COSTS.ductClean;

  // Suction sizing.
  const volumeCuFt = kitchenLengthFt * kitchenWidthFt * kitchenHeightFt;
  const volumeM3 = volumeCuFt * CU_FT_TO_M3;
  const byAirChanges = volumeM3 * style.airChanges;
  const requiredSuction = Math.max(byAirChanges, style.minSuction);
  const suctionKnown = ratedSuction > 0;
  const suctionAdequate = suctionKnown ? ratedSuction >= requiredSuction : null;
  const suctionShortfall = suctionKnown ? Math.max(0, requiredSuction - ratedSuction) : 0;

  const dueOn = lastCleaned === null ? null : toIsoDate(lastCleaned + Math.round(filterIntervalDays) * MS_PER_DAY);
  const upcoming = lastCleanedIso ? scheduleFrom(lastCleanedIso, filterIntervalDays, 6) : [];

  return {
    filterLabel: filter.label,
    filterNote: filter.note,
    styleLabel: style.label,
    loadPerDay: round2(loadPerDay),
    filterIntervalDays: Math.round(filterIntervalDays),
    filterCleansPerYear: round1(filterCleansPerYear),
    autoCleanCycleDays: autoClean ? AUTO_CLEAN_CYCLE_DAYS : null,
    charcoalIntervalDays: charcoalIntervalDays === null ? null : Math.round(charcoalIntervalDays),
    charcoalSetsPerYear: round1(charcoalSetsPerYear),
    serviceIntervalDays: Math.round(serviceIntervalDays),
    servicesPerYear: round1(servicesPerYear),
    ductIntervalDays: ductIntervalDays === null ? null : Math.round(ductIntervalDays),
    ductCleansPerYear: round1(ductCleansPerYear),
    annualCostDiy: Math.round(annualCostDiy),
    annualCostPro: Math.round(annualCostPro),
    savingByDoingItYourself: Math.round(annualCostPro - annualCostDiy),
    volumeCuFt: Math.round(volumeCuFt),
    volumeM3: round1(volumeM3),
    airChangesUsed: style.airChanges,
    requiredSuction: Math.round(requiredSuction),
    ratedSuction: Math.round(ratedSuction),
    suctionKnown,
    suctionAdequate,
    suctionShortfall: Math.round(suctionShortfall),
    nextFilterCleanIso: dueOn,
    upcomingFilterCleans: upcoming,
    ductless,
  };
}
