/**
 * Miles <-> kilometres for road travel.
 *
 * The international mile has been an exact figure since the 1959 international yard
 * and pound agreement fixed the yard at 0.9144 m. A statute mile is 1,760 yards, so:
 *
 *     1 mile = 1760 x 0.9144 m = 1609.344 m = 1.609344 km   (exact, not rounded)
 *
 * Speed uses the same factor because mph and km/h share the same time unit:
 *     km/h = mph x 1.609344      mph = km/h / 1.609344
 *
 * Driving time is distance / speed, reported in whole hours and minutes.
 */

/** Exact by definition (1959 international yard: 1 yd = 0.9144 m; 1 mile = 1760 yd). */
export const KM_PER_MILE = 1.609344;

/** Sanity ceiling: 1,000,000 km is far past any road journey and catches typos. */
export const MAX_DISTANCE_KM = 1_000_000;

/** Sanity ceiling on a road speed, in km/h. */
export const MAX_SPEED_KMH = 1000;

/**
 * Speed limits a driver actually meets abroad, listed in their posted unit so the
 * converted value is the useful one. Sources are each country's highway code.
 */
export const SPEED_LIMIT_REFERENCE = [
  { posted: 20, unit: "mph", where: "UK / US school and residential zones" },
  { posted: 30, unit: "mph", where: "UK built-up areas (default)" },
  { posted: 50, unit: "mph", where: "UK single carriageway (cars)" },
  { posted: 60, unit: "mph", where: "UK single carriageway national limit" },
  { posted: 65, unit: "mph", where: "Common US interstate limit" },
  { posted: 70, unit: "mph", where: "UK motorway / dual carriageway" },
  { posted: 50, unit: "km/h", where: "Most European built-up areas" },
  { posted: 80, unit: "km/h", where: "India: cars on national highways (many states)" },
  { posted: 90, unit: "km/h", where: "France rural roads without a central barrier" },
  { posted: 100, unit: "km/h", where: "Australia / Canada highways" },
  { posted: 120, unit: "km/h", where: "Spain, Italy and Indian expressways" },
  { posted: 130, unit: "km/h", where: "France autoroute (dry weather)" },
];

const isNumber = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Convert a road distance in either direction.
 *
 * @param {object} input
 * @param {number} input.value  the distance entered
 * @param {"mi"|"km"} input.from  the unit it was entered in
 * @returns {{error:string}|{miles:number,km:number,metres:number,from:string}}
 */
export function convertDistance({ value, from = "mi" }) {
  const amount = Number(value);
  if (!isNumber(amount)) return { error: "Enter the distance as a number." };
  if (amount < 0) return { error: "A distance cannot be negative." };

  const km = from === "km" ? amount : amount * KM_PER_MILE;
  const miles = from === "km" ? amount / KM_PER_MILE : amount;

  if (km > MAX_DISTANCE_KM) {
    return { error: `That is over ${MAX_DISTANCE_KM.toLocaleString("en-GB")} km — check the number.` };
  }

  return { miles, km, metres: km * 1000, from };
}

/**
 * Convert a speed limit or cruising speed in either direction.
 *
 * @param {object} input
 * @param {number} input.value
 * @param {"mph"|"kmh"} input.from
 * @returns {{error:string}|{mph:number,kmh:number,metresPerSecond:number,from:string}}
 */
export function convertSpeed({ value, from = "mph" }) {
  const amount = Number(value);
  if (!isNumber(amount)) return { error: "Enter the speed as a number." };
  if (amount < 0) return { error: "A speed cannot be negative." };

  const kmh = from === "kmh" ? amount : amount * KM_PER_MILE;
  const mph = from === "kmh" ? amount / KM_PER_MILE : amount;

  if (kmh > MAX_SPEED_KMH) {
    return { error: `Above ${MAX_SPEED_KMH} km/h is not a road speed — check the number.` };
  }

  return { mph, kmh, metresPerSecond: kmh / 3.6, from };
}

/**
 * Driving time at a steady speed. Pure: no clock is read.
 *
 * @returns {{error:string}|{hours:number,wholeHours:number,minutes:number,label:string}}
 */
export function estimateDriveTime({ distanceKm, speedKmh }) {
  const distance = Number(distanceKm);
  const speed = Number(speedKmh);
  if (!isNumber(distance) || !isNumber(speed)) return { error: "Enter the distance and speed as numbers." };
  if (distance < 0) return { error: "A distance cannot be negative." };
  if (!(speed > 0)) return { error: "Enter an average speed above zero to estimate the driving time." };

  const hours = distance / speed;
  const totalMinutes = Math.round(hours * 60);
  const wholeHours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes - wholeHours * 60;

  return {
    hours,
    wholeHours,
    minutes,
    label: wholeHours > 0 ? `${wholeHours} h ${minutes} min` : `${minutes} min`,
  };
}

/** The converted twin of a reference limit row. */
export function convertLimit(row) {
  if (row.unit === "mph") {
    return { mph: row.posted, kmh: row.posted * KM_PER_MILE };
  }
  return { kmh: row.posted, mph: row.posted / KM_PER_MILE };
}
