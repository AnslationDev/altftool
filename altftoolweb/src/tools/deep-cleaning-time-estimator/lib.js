/**
 * Deep Cleaning Time Estimator — labour model.
 *
 * Method: a task-time build-up, the same shape professional cleaning firms use when
 * quoting. Fixed per-room deep-clean times are added to an area-driven allowance for
 * whole-home surfaces (floors, skirting, doors, glass, fans, switch plates), then
 * scaled by soil level, furnishing density and pets, and finally divided across the
 * crew with an allowance for coordination loss and rest breaks.
 *
 * Times are drawn from residential deep-clean production rates, where one cleaner
 * covers roughly 200-300 sq ft per hour versus 500-700 sq ft for a routine clean.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** Deep-clean minutes for one room, one cleaner, at normal soil level. */
export const ROOM_TYPES = [
  { id: "bedroom", label: "Bedrooms", minutes: 45 },
  { id: "living", label: "Living / dining rooms", minutes: 60 },
  { id: "kitchen", label: "Kitchens", minutes: 120 },
  { id: "bathroom", label: "Bathrooms", minutes: 60 },
  { id: "study", label: "Study / home office", minutes: 40 },
  { id: "utility", label: "Utility / store rooms", minutes: 30 },
  { id: "balcony", label: "Balconies", minutes: 25 },
  { id: "stairs", label: "Staircase flights", minutes: 20 },
];

/**
 * Whole-home surface allowance: minutes per 100 sq ft of carpet area for floors,
 * skirting, doors, window glass, fans and switch plates. Equivalent to roughly
 * 330 sq ft per hour before modifiers.
 */
export const AREA_MINUTES_PER_100_SQFT = 18;

/** Condition of the home. Multiplies the whole base time. */
export const SOIL_LEVELS = [
  { id: "light", label: "Light — cleaned regularly", factor: 0.8 },
  { id: "normal", label: "Normal — a few months of build-up", factor: 1 },
  { id: "heavy", label: "Heavy — greasy kitchen, hard-water stains", factor: 1.35 },
  { id: "move", label: "Move-out or post-renovation", factor: 1.8 },
];

/** How much stuff has to be moved, wiped around and put back. */
export const FURNISHING_LEVELS = [
  { id: "sparse", label: "Sparse / mostly empty", factor: 0.9 },
  { id: "normal", label: "Normally furnished", factor: 1 },
  { id: "dense", label: "Heavily furnished, lots of decor", factor: 1.2 },
];

/** Extra uplift for shed hair and dander, per pet. */
export const PET_UPLIFT_PER_PET = 0.06;
/** Cap on the pet uplift — beyond three pets the marginal work flattens out. */
export const MAX_PET_UPLIFT = 0.18;

/** Optional add-ons, charged as fixed minutes on top of the base clean. */
export const EXTRAS = [
  { id: "fridge", label: "Refrigerator cleaned inside", minutes: 30 },
  { id: "oven", label: "Oven / microwave degreased inside", minutes: 25 },
  { id: "cabinets", label: "Kitchen cabinets emptied and wiped inside", minutes: 60 },
  { id: "wardrobes", label: "Wardrobes emptied and wiped inside", minutes: 45 },
  { id: "windows", label: "Window tracks, grilles and both glass faces", minutes: 40 },
  { id: "upholstery", label: "Sofa and upholstery shampoo", minutes: 60 },
  { id: "mattress", label: "Mattress vacuum and sanitise", minutes: 20 },
  { id: "balconyWash", label: "Balcony and exterior sill pressure wash", minutes: 35 },
];

/**
 * Coordination loss per extra cleaner. Two cleaners do not finish in exactly half
 * the time — they share doorways, equipment and a single water point.
 * Planning assumption, not a published standard.
 */
export const TEAM_LOSS_PER_EXTRA_CLEANER = 0.05;

/** Rest break added for every full 4 hours of elapsed work. */
export const BREAK_MINUTES_PER_4_HOURS = 15;
const MINUTES_PER_BREAK_BLOCK = 240;

export const MAX_CLEANERS = 8;
export const MIN_AREA_SQFT = 100;
export const MAX_AREA_SQFT = 20000;
export const MAX_ROOMS_PER_TYPE = 30;
export const MAX_PETS = 10;

const EXTRA_BY_ID = new Map(EXTRAS.map((extra) => [extra.id, extra]));

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Effective throughput of a crew, in "cleaner equivalents".
 * 1 -> 1.00, 2 -> 1.90, 3 -> 2.70, 4 -> 3.40
 */
export function crewThroughput(cleaners) {
  if (!isFiniteNumber(cleaners) || cleaners < 1) return 0;
  const factor = 1 - TEAM_LOSS_PER_EXTRA_CLEANER * (cleaners - 1);
  return cleaners * Math.max(0.4, factor);
}

/** Elapsed minutes for a given amount of work and crew size, including breaks. */
export function elapsedWithBreaks(personMinutes, cleaners) {
  const throughput = crewThroughput(cleaners);
  if (throughput <= 0) return Infinity;
  const working = personMinutes / throughput;
  const breaks = Math.floor(working / MINUTES_PER_BREAK_BLOCK) * BREAK_MINUTES_PER_4_HOURS;
  return working + breaks;
}

/**
 * @param {object} input
 * @param {number} input.areaSqft   carpet area of the home
 * @param {Record<string, number>} input.rooms  room counts keyed by room type id
 * @param {string} input.soil       soil level id
 * @param {string} input.furnishing furnishing level id
 * @param {number} input.pets       number of shedding pets
 * @param {string[]} input.extras   extra add-on ids
 * @param {number} input.cleaners   crew size actually available
 * @param {number} input.targetHours longest single day you are willing to work
 * @returns {object} estimate, or { error }
 */
export function estimateDeepClean({
  areaSqft,
  rooms = {},
  soil = "normal",
  furnishing = "normal",
  pets = 0,
  extras = [],
  cleaners = 2,
  targetHours = 8,
} = {}) {
  if (!isFiniteNumber(areaSqft)) return { error: "Enter the carpet area in square feet." };
  if (areaSqft < MIN_AREA_SQFT) {
    return { error: `Carpet area should be at least ${MIN_AREA_SQFT} sq ft.` };
  }
  if (areaSqft > MAX_AREA_SQFT) {
    return { error: `Carpet area above ${MAX_AREA_SQFT} sq ft needs a commercial quote, not this estimate.` };
  }

  const soilLevel = SOIL_LEVELS.find((entry) => entry.id === soil);
  if (!soilLevel) return { error: "Choose how dirty the home currently is." };
  const furnishingLevel = FURNISHING_LEVELS.find((entry) => entry.id === furnishing);
  if (!furnishingLevel) return { error: "Choose how heavily furnished the home is." };

  if (!isFiniteNumber(pets) || pets < 0) return { error: "Number of pets cannot be negative." };
  if (pets > MAX_PETS) return { error: `Enter ${MAX_PETS} pets or fewer.` };

  if (!isFiniteNumber(cleaners) || cleaners < 1) return { error: "You need at least one cleaner." };
  if (cleaners > MAX_CLEANERS) return { error: `A crew larger than ${MAX_CLEANERS} gets in its own way.` };

  if (!isFiniteNumber(targetHours) || targetHours < 1 || targetHours > 24) {
    return { error: "Target working window must be between 1 and 24 hours." };
  }
  if (!Array.isArray(extras)) return { error: "Extras must be a list." };

  const roomRows = [];
  let roomMinutes = 0;
  let roomCount = 0;

  for (const room of ROOM_TYPES) {
    const raw = rooms[room.id];
    const count = raw === undefined || raw === null || raw === "" ? 0 : Number(raw);
    if (!isFiniteNumber(count)) return { error: `Enter a number of ${room.label.toLowerCase()}.` };
    if (count < 0) return { error: "Room counts cannot be negative." };
    if (count > MAX_ROOMS_PER_TYPE) {
      return { error: `More than ${MAX_ROOMS_PER_TYPE} of one room type looks like a typo.` };
    }
    const minutes = count * room.minutes;
    roomMinutes += minutes;
    roomCount += count;
    if (count > 0) {
      roomRows.push({ id: room.id, label: room.label, count, minutes });
    }
  }

  if (roomCount <= 0) return { error: "Add at least one room to clean." };

  const areaMinutes = (areaSqft / 100) * AREA_MINUTES_PER_100_SQFT;

  const extraRows = [];
  let extraMinutes = 0;
  for (const id of extras) {
    const extra = EXTRA_BY_ID.get(id);
    if (!extra) continue;
    extraMinutes += extra.minutes;
    extraRows.push({ id: extra.id, label: extra.label, minutes: extra.minutes });
  }

  const petUplift = Math.min(MAX_PET_UPLIFT, pets * PET_UPLIFT_PER_PET);
  const multiplier = soilLevel.factor * furnishingLevel.factor * (1 + petUplift);

  const baseMinutes = roomMinutes + areaMinutes;
  const personMinutes = (baseMinutes + extraMinutes) * multiplier;

  const elapsedMinutes = elapsedWithBreaks(personMinutes, cleaners);
  const targetMinutes = targetHours * 60;

  let recommendedCrew = null;
  for (let n = 1; n <= MAX_CLEANERS; n += 1) {
    if (elapsedWithBreaks(personMinutes, n) <= targetMinutes) {
      recommendedCrew = n;
      break;
    }
  }

  const crewOptions = [];
  for (let n = 1; n <= MAX_CLEANERS; n += 1) {
    const minutes = elapsedWithBreaks(personMinutes, n);
    crewOptions.push({ cleaners: n, elapsedMinutes: minutes, elapsedHours: minutes / 60 });
  }

  return {
    personMinutes,
    personHours: personMinutes / 60,
    elapsedMinutes,
    elapsedHours: elapsedMinutes / 60,
    daysAtTarget: elapsedMinutes / targetMinutes,
    roomMinutes,
    areaMinutes,
    extraMinutes,
    multiplier,
    petUplift,
    soilLabel: soilLevel.label,
    furnishingLabel: furnishingLevel.label,
    roomCount,
    roomRows,
    extraRows,
    crewThroughput: crewThroughput(cleaners),
    recommendedCrew,
    crewOptions,
    sqftPerPersonHour: personMinutes > 0 ? areaSqft / (personMinutes / 60) : 0,
  };
}

/** Format a minute count as "3 h 25 min" for display. */
export function formatDuration(minutes) {
  if (!isFiniteNumber(minutes) || minutes < 0) return "—";
  const total = Math.round(minutes);
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}
