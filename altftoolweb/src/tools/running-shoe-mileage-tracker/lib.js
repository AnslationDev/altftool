/**
 * Running shoe mileage tracking.
 *
 * The long-standing industry guidance is that a running shoe's midsole foam loses
 * its cushioning and stability somewhere between 500 and 800 km (roughly 300-500
 * miles), with racing and plated shoes at the short end and max-cushion trainers at
 * the long end. The defaults below sit inside that band; every one is editable
 * because rotation, body mass, surface and gait all move the real number.
 */

/** Exact mile (1959 international yard and pound agreement). */
export const KM_PER_MILE = 1.609344;
export const DAYS_PER_WEEK = 7;
export const MS_PER_DAY = 86400000;

/**
 * Default rated life per shoe category, in kilometres.
 * Daily trainer 640 km = 400 miles, the middle of the 300-500 mile guidance.
 * Max cushion 800 km = 500 miles, the top of the band.
 * Tempo / lightweight 480 km = 300 miles, the bottom of the band.
 * Carbon-plated racer 320 km = 200 miles - plated race shoes are widely rated
 * for far fewer kilometres than trainers.
 * Trail 640 km = 400 miles, usually limited by outsole lug wear rather than foam.
 */
export const SHOE_TYPES = [
  { id: "daily-trainer", label: "Daily trainer", lifeKm: 640 },
  { id: "max-cushion", label: "Max cushion", lifeKm: 800 },
  { id: "tempo", label: "Lightweight / tempo", lifeKm: 480 },
  { id: "racer", label: "Carbon-plated racer", lifeKm: 320 },
  { id: "trail", label: "Trail shoe", lifeKm: 640 },
];

/** Percentage of rated life at which the tracker starts warning. */
export const REPLACE_SOON_AT = 80;
/** Percentage below which a shoe is still considered fresh. */
export const FRESH_BELOW = 50;

export const MIN_LIFE_KM = 50;
export const MAX_LIFE_KM = 2000;

export const STATUS = {
  fresh: { id: "fresh", label: "Fresh", advice: "Plenty of midsole life left." },
  good: { id: "good", label: "In service", advice: "Well inside its rated life." },
  soon: {
    id: "soon",
    label: "Replace soon",
    advice: "Past 80% of rated life — start breaking in the next pair.",
  },
  retire: {
    id: "retire",
    label: "Retire",
    advice: "At or beyond rated life — move these to walking duty.",
  },
};

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

export const kmToMiles = (km) => (isNum(km) ? km / KM_PER_MILE : null);
export const milesToKm = (miles) => (isNum(miles) ? miles * KM_PER_MILE : null);

/** Default rated life for a shoe type id, falling back to the daily trainer figure. */
export function defaultLifeKm(typeId) {
  const found = SHOE_TYPES.find((type) => type.id === typeId);
  return found ? found.lifeKm : SHOE_TYPES[0].lifeKm;
}

/** Parse a YYYY-MM-DD string as a UTC timestamp. Returns null if unusable. */
export function parseIsoDate(iso) {
  if (typeof iso !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const ts = Date.UTC(year, month - 1, day);
  const back = new Date(ts);
  if (back.getUTCMonth() !== month - 1 || back.getUTCDate() !== day) return null;
  return ts;
}

/** Whole days from one ISO date to another. Null when either date is unusable. */
export function daysBetween(fromIso, toIso) {
  const a = parseIsoDate(fromIso);
  const b = parseIsoDate(toIso);
  if (a === null || b === null) return null;
  return Math.round((b - a) / MS_PER_DAY);
}

/** Add whole days to an ISO date and return a new YYYY-MM-DD string. */
export function addDaysIso(iso, days) {
  const ts = parseIsoDate(iso);
  if (ts === null || !isNum(days)) return null;
  return new Date(ts + Math.round(days) * MS_PER_DAY).toISOString().slice(0, 10);
}

function bandFor(percentUsed) {
  if (percentUsed >= 100) return STATUS.retire;
  if (percentUsed >= REPLACE_SOON_AT) return STATUS.soon;
  if (percentUsed < FRESH_BELOW) return STATUS.fresh;
  return STATUS.good;
}

/**
 * Status of a single pair.
 *
 * percentUsed  = distance / rated life x 100
 * remaining    = max(0, rated life - distance)
 * weekly km    = distance / (days in service / 7)      [needs a valid first-use date]
 * weeks left   = remaining / weekly km
 *
 * @param {{name?:string, typeId?:string, lifeKm?:number, distanceKm?:number, firstUsedIso?:string}} shoe
 * @param {string} todayIso YYYY-MM-DD, passed in so the maths stays pure.
 */
export function computeShoeStatus(shoe = {}, todayIso) {
  const { name = "Pair", typeId = "daily-trainer", firstUsedIso } = shoe;
  const distanceKm = shoe.distanceKm;
  const lifeKm = isNum(shoe.lifeKm) ? shoe.lifeKm : defaultLifeKm(typeId);

  if (!isNum(distanceKm)) return { error: `Enter the kilometres logged on "${name}".` };
  if (distanceKm < 0) return { error: "Distance cannot be negative." };
  if (!isNum(lifeKm) || lifeKm < MIN_LIFE_KM || lifeKm > MAX_LIFE_KM) {
    return { error: `Rated life should be between ${MIN_LIFE_KM} and ${MAX_LIFE_KM} km.` };
  }

  const percentUsed = (distanceKm / lifeKm) * 100;
  const remainingKm = Math.max(0, lifeKm - distanceKm);
  const status = bandFor(percentUsed);

  const days = daysBetween(firstUsedIso, todayIso);
  const inService = isNum(days) && days > 0;
  const weeklyKm = inService ? distanceKm / (days / DAYS_PER_WEEK) : null;
  const weeksRemaining =
    isNum(weeklyKm) && weeklyKm > 0 && remainingKm > 0 ? remainingKm / weeklyKm : null;
  const retireDateIso = isNum(weeksRemaining)
    ? addDaysIso(todayIso, weeksRemaining * DAYS_PER_WEEK)
    : null;

  return {
    name,
    typeId,
    lifeKm,
    distanceKm,
    distanceMiles: kmToMiles(distanceKm),
    lifeMiles: kmToMiles(lifeKm),
    remainingKm,
    remainingMiles: kmToMiles(remainingKm),
    percentUsed,
    percentClamped: Math.max(0, Math.min(100, percentUsed)),
    status,
    daysInService: isNum(days) ? days : null,
    weeklyKm,
    weeksRemaining,
    retireDateIso,
  };
}

/**
 * Roll a list of pairs into fleet totals.
 * @param {Array} shoes
 * @param {string} todayIso
 */
export function summariseFleet(shoes, todayIso) {
  const list = Array.isArray(shoes) ? shoes : [];
  const rows = list.map((shoe) => computeShoeStatus(shoe, todayIso));
  const valid = rows.filter((row) => !row.error);

  const totalDistanceKm = valid.reduce((sum, row) => sum + row.distanceKm, 0);
  const totalRemainingKm = valid.reduce((sum, row) => sum + row.remainingKm, 0);
  const needsAttention = valid.filter(
    (row) => row.status.id === "soon" || row.status.id === "retire"
  ).length;
  const weeklyValues = valid.map((row) => row.weeklyKm).filter((value) => isNum(value));
  const fleetWeeklyKm = weeklyValues.length
    ? weeklyValues.reduce((sum, value) => sum + value, 0)
    : null;

  return {
    rows,
    pairs: valid.length,
    invalid: rows.length - valid.length,
    totalDistanceKm,
    totalDistanceMiles: kmToMiles(totalDistanceKm),
    totalRemainingKm,
    totalRemainingMiles: kmToMiles(totalRemainingKm),
    needsAttention,
    fleetWeeklyKm,
  };
}
