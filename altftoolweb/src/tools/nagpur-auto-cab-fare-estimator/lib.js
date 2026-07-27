/**
 * Nagpur auto rickshaw, shared auto and cab fare estimation.
 *
 * Auto rickshaw and taxi tariffs in Maharashtra are fixed region by region by the
 * Regional Transport Authority, and revisions are worked out with the Hakim Committee
 * formula, which ties the fare to fuel and CNG prices, vehicle and maintenance cost,
 * insurance, permit cost and a notional driver income. Nagpur RTA therefore has its
 * own card, separate from Mumbai's, and it is displayed inside the vehicle.
 *
 * Every card in this tool follows the same structure:
 *
 *   fare = a minimum fare covering the first stretch of the trip
 *        + a per-kilometre rate beyond that
 *        + waiting time
 *        (+ the statutory night charge, as a percentage of the metered amount)
 *        (x the number of passengers, on a shared-seat vehicle)
 *
 * Because RTA revisions are frequent and the tool cannot read your vehicle's card,
 * the rupee figures are starting values and every one of them is editable. The night
 * rule below is the statutory Maharashtra one and is what the tool is built around.
 *
 * Everything is pure arithmetic; the pickup time is passed in rather than read from a
 * clock, so the same inputs always give the same fare.
 */

/**
 * Maharashtra night charge: autos and taxis bill 25% above the metered fare between
 * midnight and 5 am. Unlike Delhi's window, this one starts at 00:00, not 23:00.
 */
export const NIGHT_SURCHARGE_PCT = 25;
export const NIGHT_START_MIN = 0; // 00:00
export const NIGHT_END_MIN = 5 * 60; // 05:00

/**
 * Surge ceiling. MoRTH's Motor Vehicle Aggregator Guidelines, 2020 cap an aggregator
 * at 1.5 times its declared base fare, with a floor at 50%. States may notify their
 * own scheme with different limits, so treat this as the input ceiling, not a promise.
 */
export const MAX_SURGE = 1.5;

/** Guard rails so an obvious typo returns an error instead of a silly fare. */
const MAX_DISTANCE_KM = 250;
const MAX_MINUTES = 600;
const MAX_PASSENGERS = 8;
const MAX_RATE = 500; // rupees, for any single editable rate field

/**
 * Rate cards. `rta: true` rows follow the Nagpur RTA meter structure and carry the
 * statutory night charge. `perPassenger: true` means the fare is a per-seat fare on a
 * fixed shared route, which is how a large share of Nagpur's autos actually run.
 * App-cab rows are typical Nagpur pricing, not a notified tariff.
 */
export const VEHICLES = [
  {
    id: "auto",
    label: "Auto rickshaw — RTA meter (whole vehicle)",
    rta: true,
    perPassenger: false,
    baseFare: 25,
    baseKm: 1.5,
    perKm: 15,
    perMinute: 0,
    waitingPerMin: 1,
    freeWaitingMin: 0,
    nightSurchargePct: NIGHT_SURCHARGE_PCT,
    minimumFare: 25,
    surgeable: false,
  },
  {
    id: "auto-shared",
    label: "Shared auto — per seat on a fixed route",
    rta: true,
    perPassenger: true,
    baseFare: 10,
    baseKm: 2,
    perKm: 4,
    perMinute: 0,
    waitingPerMin: 0,
    freeWaitingMin: 0,
    nightSurchargePct: NIGHT_SURCHARGE_PCT,
    minimumFare: 10,
    surgeable: false,
  },
  {
    id: "auto-app",
    label: "Auto on an app (Ola / Uber / Rapido)",
    rta: false,
    perPassenger: false,
    baseFare: 30,
    baseKm: 2,
    perKm: 11,
    perMinute: 0.5,
    waitingPerMin: 1,
    freeWaitingMin: 3,
    nightSurchargePct: 0,
    minimumFare: 40,
    surgeable: true,
  },
  {
    id: "cab-mini",
    label: "App cab — hatchback / mini",
    rta: false,
    perPassenger: false,
    baseFare: 50,
    baseKm: 2,
    perKm: 12,
    perMinute: 1,
    waitingPerMin: 1,
    freeWaitingMin: 3,
    nightSurchargePct: 0,
    minimumFare: 75,
    surgeable: true,
  },
  {
    id: "cab-sedan",
    label: "App cab — sedan / prime",
    rta: false,
    perPassenger: false,
    baseFare: 65,
    baseKm: 2,
    perKm: 15,
    perMinute: 1.2,
    waitingPerMin: 1.5,
    freeWaitingMin: 3,
    nightSurchargePct: 0,
    minimumFare: 100,
    surgeable: true,
  },
  {
    id: "cab-suv",
    label: "App cab — SUV / 6-seater",
    rta: false,
    perPassenger: false,
    baseFare: 90,
    baseKm: 2,
    perKm: 19,
    perMinute: 1.5,
    waitingPerMin: 2,
    freeWaitingMin: 3,
    nightSurchargePct: 0,
    minimumFare: 140,
    surgeable: true,
  },
];

/** Typical road distances for well-known Nagpur runs, for the quick-fill chips. */
export const COMMON_TRIPS = [
  { label: "Nagpur Jn to Sitabuldi", km: 2 },
  { label: "Nagpur Jn to Deekshabhoomi", km: 4.5 },
  { label: "Sitabuldi to Dharampeth", km: 3.5 },
  { label: "Nagpur Jn to NAG airport", km: 8 },
  { label: "Sitabuldi to MIHAN", km: 17 },
  { label: "Sitabuldi to Kamptee Road", km: 9 },
];

export function getVehicle(vehicleId) {
  return VEHICLES.find((vehicle) => vehicle.id === vehicleId) || VEHICLES[0];
}

/** "HH:MM" -> minutes past midnight, or null when it is not a valid 24-hour time. */
export function parseTimeToMinutes(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return null;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

/**
 * Maharashtra's night window does not wrap past midnight — it starts there. So the
 * test is the simple half-open interval [00:00, 05:00).
 */
export function isNightMinute(minuteOfDay) {
  if (!Number.isFinite(minuteOfDay)) return false;
  return minuteOfDay >= NIGHT_START_MIN && minuteOfDay < NIGHT_END_MIN;
}

const round2 = (value) => Math.round(value * 100) / 100;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Validate a rate card. Returns an error string, or null when the card is usable. */
export function validateRate(rate) {
  if (!rate || typeof rate !== "object") return "Pick a vehicle to load its rate card.";
  const fields = [
    ["Minimum fare", rate.baseFare],
    ["Included distance", rate.baseKm],
    ["Per-kilometre rate", rate.perKm],
    ["Per-minute rate", rate.perMinute],
    ["Waiting rate", rate.waitingPerMin],
    ["Free waiting minutes", rate.freeWaitingMin],
    ["Night charge", rate.nightSurchargePct],
    ["Fare floor", rate.minimumFare],
  ];
  for (const [label, value] of fields) {
    if (!isNum(value)) return `${label} must be a number.`;
    if (value < 0) return `${label} cannot be negative.`;
  }
  if (rate.baseFare > MAX_RATE || rate.perKm > MAX_RATE || rate.minimumFare > MAX_RATE * 4) {
    return "One of the rate-card figures is unrealistically large — check the rupee amounts.";
  }
  if (rate.baseKm > 50) return "Included distance should be 50 km or less.";
  if (rate.nightSurchargePct > 200) return "Night charge should be 200% or less.";
  return null;
}

/**
 * Estimate a Nagpur auto, shared auto or cab fare.
 *
 * @param {object} input
 * @param {object} input.rate            full rate card (see VEHICLES for the shape)
 * @param {number} input.distanceKm      trip distance in kilometres
 * @param {number} input.passengers      seats taken (only billed on a shared vehicle)
 * @param {number} input.waitingMinutes  minutes the vehicle waits for you
 * @param {number} input.rideMinutes     minutes spent moving (app cabs bill this)
 * @param {string} input.pickupTime      "HH:MM" 24-hour pickup time
 * @param {number} input.surgeMultiplier demand multiplier, 1 = none
 * @param {number} input.tollsAndParking rupees of tolls and parking on top
 * @returns {{error:string}|object} the fare breakdown, or an error for unusable input
 */
export function estimateFare({
  rate,
  distanceKm = 0,
  passengers = 1,
  waitingMinutes = 0,
  rideMinutes = 0,
  pickupTime = "10:00",
  surgeMultiplier = 1,
  tollsAndParking = 0,
} = {}) {
  const rateError = validateRate(rate);
  if (rateError) return { error: rateError };

  const km = Number(distanceKm);
  const seats = Number(passengers);
  const waiting = Number(waitingMinutes);
  const ride = Number(rideMinutes);
  const surgeRaw = Number(surgeMultiplier);
  const tolls = Number(tollsAndParking);

  if (![km, seats, waiting, ride, surgeRaw, tolls].every(isNum)) {
    return { error: "Enter valid numbers in every field." };
  }
  if (km <= 0) return { error: "Trip distance must be greater than zero." };
  if (km > MAX_DISTANCE_KM) {
    return { error: `Trip distance looks too large — enter up to ${MAX_DISTANCE_KM} km.` };
  }
  if (!Number.isInteger(seats) || seats < 1) {
    return { error: "Passengers must be a whole number, at least 1." };
  }
  if (seats > MAX_PASSENGERS) {
    return { error: `Enter at most ${MAX_PASSENGERS} passengers.` };
  }
  if (waiting < 0 || ride < 0 || tolls < 0) {
    return { error: "Waiting time, ride time and tolls cannot be negative." };
  }
  if (waiting > MAX_MINUTES || ride > MAX_MINUTES) {
    return { error: `Waiting and ride time should each be under ${MAX_MINUTES} minutes.` };
  }
  if (surgeRaw < 1 || surgeRaw > MAX_SURGE) {
    return {
      error: `Surge multiplier should be between 1.0 and ${MAX_SURGE.toFixed(1)} — MoRTH's 2020 aggregator guidelines cap it at 1.5 times the base fare.`,
    };
  }

  const pickupMinute = parseTimeToMinutes(pickupTime);
  if (pickupMinute === null) {
    return { error: "Enter the pickup time as a 24-hour time, like 01:15." };
  }

  const surge = rate.surgeable ? surgeRaw : 1;
  const billedSeats = rate.perPassenger ? seats : 1;

  const extraKm = Math.max(0, km - rate.baseKm);
  const distanceFare = rate.baseFare + extraKm * rate.perKm;
  const rideTimeFare = rate.perMinute * ride;
  const chargeableWaiting = Math.max(0, waiting - rate.freeWaitingMin);
  const waitingFare = rate.waitingPerMin * chargeableWaiting;

  const meterFare = distanceFare + rideTimeFare + waitingFare;
  const night = isNightMinute(pickupMinute);
  const nightSurcharge = night ? (meterFare * rate.nightSurchargePct) / 100 : 0;
  const afterNight = meterFare + nightSurcharge;
  const surgeAmount = afterNight * (surge - 1);

  const beforeMinimum = afterNight + surgeAmount;
  const perSeatFare = Math.max(beforeMinimum, rate.minimumFare);
  const minimumTopUp = perSeatFare - beforeMinimum;

  const fareForAllSeats = perSeatFare * billedSeats;
  const total = fareForAllSeats + tolls;

  return {
    isNight: night,
    pickupMinute,
    distanceKm: km,
    baseKm: rate.baseKm,
    extraKm: round2(extraKm),
    distanceFare: round2(distanceFare),
    rideTimeFare: round2(rideTimeFare),
    chargeableWaiting: round2(chargeableWaiting),
    waitingFare: round2(waitingFare),
    meterFare: round2(meterFare),
    nightSurcharge: round2(nightSurcharge),
    nightSurchargePct: rate.nightSurchargePct,
    surge,
    surgeAmount: round2(surgeAmount),
    minimumFare: rate.minimumFare,
    minimumTopUp: round2(minimumTopUp),
    perSeatFare: round2(perSeatFare),
    billedSeats,
    isPerPassenger: Boolean(rate.perPassenger),
    fareForAllSeats: round2(fareForAllSeats),
    tolls: round2(tolls),
    total: round2(total),
    payable: Math.round(total),
    roundedUp: Math.ceil(total / 10) * 10,
    fairLow: Math.round(total * 0.9),
    fairHigh: Math.round(total * 1.1),
    perKmEffective: round2(total / km),
  };
}
