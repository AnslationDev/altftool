/**
 * Home Air Filter Reminder — filter life, replacement dates and running cost.
 *
 * Manufacturers state filter life two ways at once — "every 6 months or 4,000
 * hours, whichever comes first" — so every filter here carries both a rated running
 * hour figure and a calendar cap, and the shorter of the two governs.
 *
 * Both limits are shortened by a load factor built from outdoor air quality (CPCB
 * National AQI categories) plus indoor sources: pets, indoor smoking and nearby
 * construction or a busy roadside.
 *
 * Sizing uses AHAM's two-thirds rule: for a room with an 8 ft ceiling, the clean air
 * delivery rate in CFM should be at least two-thirds of the floor area in square
 * feet, which corresponds to roughly five air changes an hour.
 *
 * Pure module: no React, no DOM, no clock reads. Dates are always passed in.
 */

/** CPCB National Air Quality Index categories, with a filter-loading factor. */
export const AQI_BANDS = [
  { id: "good", label: "Good (AQI 0-50)", factor: 0.7 },
  { id: "satisfactory", label: "Satisfactory (AQI 51-100)", factor: 0.85 },
  { id: "moderate", label: "Moderate (AQI 101-200)", factor: 1 },
  { id: "poor", label: "Poor (AQI 201-300)", factor: 1.3 },
  { id: "very-poor", label: "Very poor (AQI 301-400)", factor: 1.6 },
  { id: "severe", label: "Severe (AQI 401-500)", factor: 2 },
];

/** Indoor sources that load a filter faster, as fractional uplifts. */
export const INDOOR_SOURCES = [
  { id: "pets", label: "Pets that shed indoors", uplift: 0.1 },
  { id: "smoking", label: "Smoking or incense burned indoors", uplift: 0.25 },
  { id: "construction", label: "Construction or a busy road outside", uplift: 0.2 },
  { id: "cooking", label: "Open-kitchen frying without an extractor", uplift: 0.15 },
];

/**
 * Filter catalogue.
 * ratedHours       manufacturer running-hour life at moderate air quality
 * maxCalendarDays  the "or N months" half of the same claim
 * washable         true when the part is rinsed rather than replaced
 * priceInr         typical Indian replacement price for one part
 */
export const DEVICES = [
  {
    id: "purifier",
    label: "Room air purifier",
    defaultWatts: 45,
    supportsCadr: true,
    filters: [
      { id: "pre", label: "Pre-filter (mesh)", ratedHours: 720, maxCalendarDays: 30, washable: true, priceInr: 0 },
      { id: "hepa", label: "True HEPA filter", ratedHours: 8760, maxCalendarDays: 365, washable: false, priceInr: 2500 },
      { id: "carbon", label: "Activated carbon filter", ratedHours: 4380, maxCalendarDays: 180, washable: false, priceInr: 1200 },
    ],
  },
  {
    id: "split-ac",
    label: "Split or window air conditioner",
    defaultWatts: 1200,
    supportsCadr: false,
    filters: [
      { id: "mesh", label: "Indoor unit mesh filter", ratedHours: 150, maxCalendarDays: 30, washable: true, priceInr: 0 },
      { id: "pm-cassette", label: "PM2.5 / anti-bacterial cassette", ratedHours: 1500, maxCalendarDays: 365, washable: false, priceInr: 900 },
    ],
  },
  {
    id: "central",
    label: "Central AC / ducted HVAC",
    defaultWatts: 2500,
    supportsCadr: false,
    filters: [
      { id: "merv8", label: "Pleated return-air filter (MERV 8)", ratedHours: 2160, maxCalendarDays: 90, washable: false, priceInr: 900 },
      { id: "duct-pre", label: "Grille pre-filter", ratedHours: 720, maxCalendarDays: 60, washable: true, priceInr: 0 },
    ],
  },
];

/** AHAM two-thirds rule reference ceiling height, in feet. */
export const AHAM_REFERENCE_CEILING_FT = 8;
/** CFM to cubic metres per hour. */
export const CFM_TO_M3H = 1.69901;

export const DAYS_PER_YEAR = 365;
export const MAX_HOURS_PER_DAY = 24;
const MS_PER_DAY = 86400000;

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);
const round1 = (value) => Math.round(value * 10) / 10;
const round2 = (value) => Math.round(value * 100) / 100;

export function parseIsoDate(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const stamp = Date.UTC(year, month - 1, day);
  const check = new Date(stamp);
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
    return null;
  }
  return stamp;
}

export function toIsoDate(stamp) {
  if (!isFiniteNumber(stamp)) return null;
  return new Date(stamp).toISOString().slice(0, 10);
}

/** Combined loading factor from outdoor AQI band and selected indoor sources. */
export function loadFactor(aqiBandId, sources = []) {
  const band = AQI_BANDS.find((entry) => entry.id === aqiBandId);
  if (!band) return null;
  const uplift = INDOOR_SOURCES.filter((entry) => sources.includes(entry.id)).reduce(
    (sum, entry) => sum + entry.uplift,
    0,
  );
  return band.factor * (1 + uplift);
}

/**
 * AHAM two-thirds rule, adjusted for ceiling height.
 * @returns {number} recommended CADR in CFM
 */
export function recommendedCadrCfm(areaSqft, ceilingFt) {
  if (!isFiniteNumber(areaSqft) || areaSqft <= 0) return 0;
  if (!isFiniteNumber(ceilingFt) || ceilingFt <= 0) return 0;
  return (2 / 3) * areaSqft * (ceilingFt / AHAM_REFERENCE_CEILING_FT);
}

/**
 * @param {object} input
 * @param {string} input.deviceId
 * @param {number} input.hoursPerDay
 * @param {string} input.aqiBand
 * @param {string[]} input.sources
 * @param {number} input.watts
 * @param {number} input.tariff        INR per kWh
 * @param {number} input.areaSqft
 * @param {number} input.ceilingFt
 * @param {number} input.ratedCadrCfm  the unit's own CADR, 0 if unknown
 * @param {Record<string,string>} input.lastChanged  YYYY-MM-DD per filter id
 * @returns {object} plan, or { error }
 */
export function planFilterCare({
  deviceId = "purifier",
  hoursPerDay,
  aqiBand = "moderate",
  sources = [],
  watts,
  tariff,
  areaSqft = 150,
  ceilingFt = 10,
  ratedCadrCfm = 0,
  lastChanged = {},
} = {}) {
  const device = DEVICES.find((entry) => entry.id === deviceId);
  if (!device) return { error: "Choose which appliance you are tracking." };

  if (!isFiniteNumber(hoursPerDay)) return { error: "Enter how many hours a day the unit runs." };
  if (hoursPerDay <= 0) return { error: "Running hours must be greater than zero." };
  if (hoursPerDay > MAX_HOURS_PER_DAY) return { error: "A day has only 24 hours." };

  if (!Array.isArray(sources)) return { error: "Indoor sources must be a list." };
  const factor = loadFactor(aqiBand, sources);
  if (factor === null) return { error: "Choose the outdoor air quality band." };

  if (!isFiniteNumber(watts) || watts < 0) return { error: "Power draw cannot be negative." };
  if (watts > 20000) return { error: "Power draw above 20,000 W is not a home appliance." };

  if (!isFiniteNumber(tariff) || tariff < 0) return { error: "Electricity tariff cannot be negative." };
  if (tariff > 100) return { error: "A tariff above ₹100 per unit looks like a typo." };

  if (!isFiniteNumber(areaSqft) || areaSqft <= 0) return { error: "Room area must be greater than zero." };
  if (areaSqft > 5000) return { error: "Room area above 5,000 sq ft needs a commercial design." };
  if (!isFiniteNumber(ceilingFt) || ceilingFt <= 0) return { error: "Ceiling height must be greater than zero." };
  if (ceilingFt > 30) return { error: "Ceiling height above 30 ft looks like a typo." };

  if (!isFiniteNumber(ratedCadrCfm) || ratedCadrCfm < 0) {
    return { error: "Rated CADR cannot be negative — enter 0 if you do not know it." };
  }

  const rows = [];
  let annualFilterCost = 0;

  for (const filter of device.filters) {
    const byHours = filter.ratedHours / (hoursPerDay * factor);
    const byCalendar = filter.maxCalendarDays / factor;
    const intervalDays = Math.min(byHours, byCalendar);
    const changesPerYear = DAYS_PER_YEAR / intervalDays;
    const yearlyCost = filter.washable ? 0 : filter.priceInr * changesPerYear;
    annualFilterCost += yearlyCost;

    const lastIso = lastChanged[filter.id] ?? "";
    let lastStamp = null;
    if (lastIso) {
      lastStamp = parseIsoDate(lastIso);
      if (lastStamp === null) {
        return { error: `Last change date for "${filter.label}" must be a real date in YYYY-MM-DD form.` };
      }
    }

    rows.push({
      id: filter.id,
      label: filter.label,
      washable: filter.washable,
      priceInr: filter.priceInr,
      ratedHours: filter.ratedHours,
      maxCalendarDays: filter.maxCalendarDays,
      limitedBy: byHours <= byCalendar ? "running hours" : "calendar age",
      intervalDays: Math.round(intervalDays),
      intervalDaysExact: round2(intervalDays),
      changesPerYear: round2(changesPerYear),
      yearlyCost: Math.round(yearlyCost),
      lastChangedIso: lastStamp === null ? null : lastIso,
      nextDueIso: lastStamp === null ? null : toIsoDate(lastStamp + Math.round(intervalDays) * MS_PER_DAY),
    });
  }

  const kwhPerYear = (watts * hoursPerDay * DAYS_PER_YEAR) / 1000;
  const electricityCost = kwhPerYear * tariff;
  const annualTotal = annualFilterCost + electricityCost;

  const soonest = rows
    .filter((row) => row.nextDueIso !== null)
    .sort((a, b) => (a.nextDueIso < b.nextDueIso ? -1 : 1))[0] ?? null;

  const recommendedCadr = device.supportsCadr ? recommendedCadrCfm(areaSqft, ceilingFt) : 0;
  const cadrKnown = device.supportsCadr && ratedCadrCfm > 0;

  return {
    deviceLabel: device.label,
    supportsCadr: device.supportsCadr,
    loadFactor: round2(factor),
    rows,
    annualFilterCost: Math.round(annualFilterCost),
    kwhPerYear: round1(kwhPerYear),
    electricityCost: Math.round(electricityCost),
    annualTotal: Math.round(annualTotal),
    dailyCost: round2(annualTotal / DAYS_PER_YEAR),
    soonestDue: soonest,
    recommendedCadrCfm: Math.round(recommendedCadr),
    recommendedCadrM3h: Math.round(recommendedCadr * CFM_TO_M3H),
    ratedCadrCfm: Math.round(ratedCadrCfm),
    cadrKnown,
    cadrAdequate: cadrKnown ? ratedCadrCfm >= recommendedCadr : null,
    coverableAreaSqft:
      device.supportsCadr && ratedCadrCfm > 0
        ? Math.round((ratedCadrCfm * AHAM_REFERENCE_CEILING_FT) / ((2 / 3) * ceilingFt))
        : 0,
  };
}
