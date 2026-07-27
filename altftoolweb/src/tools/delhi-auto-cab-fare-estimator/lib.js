/**
 * Delhi auto rickshaw and taxi fare estimation.
 *
 * Autos and black-and-yellow taxis in Delhi run on a tariff notified by the Transport
 * Department, Government of NCT of Delhi. The structure of that tariff is:
 *
 *   fare = meter-down charge (covers the first "included" kilometres)
 *        + per-kilometre rate x kilometres beyond that
 *        + waiting charge per minute
 *        + luggage charge per piece
 *   and the whole metered amount is increased by a fixed percentage at night.
 *
 * App cabs (Ola, Uber, Rapido) are NOT covered by the meter notification. They price
 * on a base fare that includes a couple of kilometres, then a per-kilometre rate plus
 * a per-minute ride-time rate, with a demand multiplier on top. Delhi does cap that
 * multiplier — see MAX_SURGE below.
 *
 * Everything here is pure arithmetic. The pickup time is passed in as a string rather
 * than read from the clock, so the same inputs always give the same fare.
 */

/* ------------------------------------------------------------------ *
 * Notified Delhi tariff constants
 * ------------------------------------------------------------------ */

/** Auto meter-down: Rs 25 covers the first 1.5 km. */
export const AUTO_BASE_FARE = 25;
export const AUTO_BASE_KM = 1.5;

/** Auto running rate beyond the meter-down distance: Rs 9.50 per km. */
export const AUTO_PER_KM = 9.5;

/** Notified auto waiting charge: Rs 0.75 per minute (Rs 45 an hour). */
export const AUTO_WAITING_PER_MIN = 0.75;

/** Notified auto luggage charge: Rs 7.50 per piece above the free allowance. */
export const AUTO_LUGGAGE_PER_PIECE = 7.5;

/** Black-and-yellow taxi meter-down: Rs 25 covers the first 1 km. */
export const TAXI_BASE_FARE = 25;
export const TAXI_BASE_KM = 1;

/** Taxi running rate: Rs 14 per km non-AC, Rs 16 per km with the AC on. */
export const TAXI_PER_KM_NON_AC = 14;
export const TAXI_PER_KM_AC = 16;

/** Notified taxi waiting charge: Rs 30 an hour = Rs 0.50 a minute. */
export const TAXI_WAITING_PER_MIN = 0.5;

/** Notified taxi luggage charge: Rs 10 per piece above the free allowance. */
export const TAXI_LUGGAGE_PER_PIECE = 10;

/**
 * Night charge: 25% on top of the metered fare between 23:00 and 05:00, for both
 * autos and black-and-yellow taxis. The window wraps past midnight.
 */
export const NIGHT_SURCHARGE_PCT = 25;
export const NIGHT_START_MIN = 23 * 60; // 23:00
export const NIGHT_END_MIN = 5 * 60; // 05:00

/**
 * Surge ceiling. The Delhi Motor Vehicle Aggregator and Delivery Service Scheme, 2023
 * caps what a licensed aggregator may charge at twice the base fare it has declared
 * (and sets a floor at half of it). MoRTH's national Motor Vehicle Aggregator
 * Guidelines, 2020 used a lower 1.5x ceiling. 2.0 is used as the input ceiling here.
 */
export const MAX_SURGE = 2;

/** Guard rails so an obvious typo returns an error instead of a silly fare. */
const MAX_DISTANCE_KM = 250;
const MAX_MINUTES = 600;
const MAX_LUGGAGE_PIECES = 20;
const MAX_RATE = 500; // rupees, for any single editable rate field

/* ------------------------------------------------------------------ *
 * Rate cards
 * ------------------------------------------------------------------ */

/**
 * `statutory: true` rows reproduce the notified Delhi meter. The app-cab rows are
 * typical Delhi NCR pricing, not a notified tariff, which is exactly why every number
 * on the card is editable in the calculator.
 */
export const VEHICLES = [
  {
    id: "auto",
    label: "Auto rickshaw (notified meter)",
    statutory: true,
    baseFare: AUTO_BASE_FARE,
    baseKm: AUTO_BASE_KM,
    perKm: AUTO_PER_KM,
    perMinute: 0,
    waitingPerMin: AUTO_WAITING_PER_MIN,
    freeWaitingMin: 0,
    luggagePerPiece: AUTO_LUGGAGE_PER_PIECE,
    freeLuggagePieces: 1,
    nightSurchargePct: NIGHT_SURCHARGE_PCT,
    minimumFare: AUTO_BASE_FARE,
    surgeable: false,
  },
  {
    id: "taxi-non-ac",
    label: "Black-and-yellow taxi — non-AC (notified meter)",
    statutory: true,
    baseFare: TAXI_BASE_FARE,
    baseKm: TAXI_BASE_KM,
    perKm: TAXI_PER_KM_NON_AC,
    perMinute: 0,
    waitingPerMin: TAXI_WAITING_PER_MIN,
    freeWaitingMin: 0,
    luggagePerPiece: TAXI_LUGGAGE_PER_PIECE,
    freeLuggagePieces: 1,
    nightSurchargePct: NIGHT_SURCHARGE_PCT,
    minimumFare: TAXI_BASE_FARE,
    surgeable: false,
  },
  {
    id: "taxi-ac",
    label: "Black-and-yellow taxi — AC (notified meter)",
    statutory: true,
    baseFare: TAXI_BASE_FARE,
    baseKm: TAXI_BASE_KM,
    perKm: TAXI_PER_KM_AC,
    perMinute: 0,
    waitingPerMin: TAXI_WAITING_PER_MIN,
    freeWaitingMin: 0,
    luggagePerPiece: TAXI_LUGGAGE_PER_PIECE,
    freeLuggagePieces: 1,
    nightSurchargePct: NIGHT_SURCHARGE_PCT,
    minimumFare: TAXI_BASE_FARE,
    surgeable: false,
  },
  {
    id: "auto-app",
    label: "Auto on an app (Ola / Uber / Rapido)",
    statutory: false,
    baseFare: 30,
    baseKm: 2,
    perKm: 11,
    perMinute: 0.5,
    waitingPerMin: 1,
    freeWaitingMin: 3,
    luggagePerPiece: 0,
    freeLuggagePieces: 0,
    nightSurchargePct: 0,
    minimumFare: 40,
    surgeable: true,
  },
  {
    id: "cab-mini",
    label: "App cab — hatchback / mini",
    statutory: false,
    baseFare: 55,
    baseKm: 2,
    perKm: 13,
    perMinute: 1,
    waitingPerMin: 1,
    freeWaitingMin: 3,
    luggagePerPiece: 0,
    freeLuggagePieces: 0,
    nightSurchargePct: 0,
    minimumFare: 80,
    surgeable: true,
  },
  {
    id: "cab-sedan",
    label: "App cab — sedan / prime",
    statutory: false,
    baseFare: 70,
    baseKm: 2,
    perKm: 16,
    perMinute: 1.2,
    waitingPerMin: 1.5,
    freeWaitingMin: 3,
    luggagePerPiece: 0,
    freeLuggagePieces: 0,
    nightSurchargePct: 0,
    minimumFare: 110,
    surgeable: true,
  },
  {
    id: "cab-suv",
    label: "App cab — SUV / 6-seater",
    statutory: false,
    baseFare: 95,
    baseKm: 2,
    perKm: 20,
    perMinute: 1.5,
    waitingPerMin: 2,
    freeWaitingMin: 3,
    luggagePerPiece: 0,
    freeLuggagePieces: 0,
    nightSurchargePct: 0,
    minimumFare: 150,
    surgeable: true,
  },
];

/** Typical road distances for well-known Delhi NCR runs, for the quick-fill chips. */
export const COMMON_TRIPS = [
  { label: "Connaught Place to IGI T3", km: 16 },
  { label: "New Delhi Rly Stn to Karol Bagh", km: 5 },
  { label: "Saket to Connaught Place", km: 15 },
  { label: "Dwarka Sec 21 to IGI T3", km: 10 },
  { label: "Noida Sec 18 to Connaught Place", km: 22 },
  { label: "Gurugram Cyber City to IGI T3", km: 15 },
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

/** The night window wraps past midnight: "at or after 23:00 OR before 05:00". */
export function isNightMinute(minuteOfDay) {
  if (!Number.isFinite(minuteOfDay)) return false;
  return minuteOfDay >= NIGHT_START_MIN || minuteOfDay < NIGHT_END_MIN;
}

const round2 = (value) => Math.round(value * 100) / 100;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Validate a rate card. Returns an error string, or null when the card is usable.
 */
export function validateRate(rate) {
  if (!rate || typeof rate !== "object") return "Pick a vehicle to load its rate card.";
  const fields = [
    ["Base fare", rate.baseFare],
    ["Included distance", rate.baseKm],
    ["Per-kilometre rate", rate.perKm],
    ["Per-minute rate", rate.perMinute],
    ["Waiting rate", rate.waitingPerMin],
    ["Free waiting minutes", rate.freeWaitingMin],
    ["Luggage rate", rate.luggagePerPiece],
    ["Free luggage pieces", rate.freeLuggagePieces],
    ["Night surcharge", rate.nightSurchargePct],
    ["Minimum fare", rate.minimumFare],
  ];
  for (const [label, value] of fields) {
    if (!isNum(value)) return `${label} must be a number.`;
    if (value < 0) return `${label} cannot be negative.`;
  }
  if (rate.baseFare > MAX_RATE || rate.perKm > MAX_RATE || rate.minimumFare > MAX_RATE * 4) {
    return "One of the rate-card figures is unrealistically large — check the rupee amounts.";
  }
  if (rate.baseKm > 50) return "Included distance should be 50 km or less.";
  if (rate.nightSurchargePct > 200) return "Night surcharge should be 200% or less.";
  return null;
}

/**
 * Estimate a Delhi auto, taxi or app-cab fare.
 *
 * @param {object} input
 * @param {object} input.rate           full rate card (see VEHICLES for the shape)
 * @param {number} input.distanceKm     trip distance in kilometres
 * @param {number} input.waitingMinutes minutes the vehicle waited for you
 * @param {number} input.rideMinutes    minutes spent moving (app cabs bill this)
 * @param {string} input.pickupTime     "HH:MM" 24-hour pickup time
 * @param {number} input.surgeMultiplier demand multiplier, 1 = none
 * @param {number} input.tollsAndParking rupees of tolls and parking paid on top
 * @param {number} input.luggagePieces  number of large bags
 * @returns {{error:string}|object} the fare breakdown, or an error for unusable input
 */
export function estimateFare({
  rate,
  distanceKm = 0,
  waitingMinutes = 0,
  rideMinutes = 0,
  pickupTime = "10:00",
  surgeMultiplier = 1,
  tollsAndParking = 0,
  luggagePieces = 0,
} = {}) {
  const rateError = validateRate(rate);
  if (rateError) return { error: rateError };

  const km = Number(distanceKm);
  const waiting = Number(waitingMinutes);
  const ride = Number(rideMinutes);
  const surgeRaw = Number(surgeMultiplier);
  const tolls = Number(tollsAndParking);
  const bags = Number(luggagePieces);

  if (![km, waiting, ride, surgeRaw, tolls, bags].every(isNum)) {
    return { error: "Enter valid numbers in every field." };
  }
  if (km <= 0) return { error: "Trip distance must be greater than zero." };
  if (km > MAX_DISTANCE_KM) {
    return { error: `Trip distance looks too large — enter up to ${MAX_DISTANCE_KM} km.` };
  }
  if (waiting < 0 || ride < 0 || tolls < 0 || bags < 0) {
    return { error: "Waiting time, ride time, tolls and bags cannot be negative." };
  }
  if (waiting > MAX_MINUTES || ride > MAX_MINUTES) {
    return { error: `Waiting and ride time should each be under ${MAX_MINUTES} minutes.` };
  }
  if (bags > MAX_LUGGAGE_PIECES) {
    return { error: `Enter at most ${MAX_LUGGAGE_PIECES} pieces of luggage.` };
  }
  if (surgeRaw < 1 || surgeRaw > MAX_SURGE) {
    return {
      error: `Surge multiplier should be between 1.0 and ${MAX_SURGE.toFixed(1)} — Delhi's 2023 aggregator scheme caps it at twice the base fare.`,
    };
  }

  const pickupMinute = parseTimeToMinutes(pickupTime);
  if (pickupMinute === null) {
    return { error: "Enter the pickup time as a 24-hour time, like 22:45." };
  }

  const surge = rate.surgeable ? surgeRaw : 1;

  const extraKm = Math.max(0, km - rate.baseKm);
  const distanceFare = rate.baseFare + extraKm * rate.perKm;
  const rideTimeFare = rate.perMinute * ride;
  const chargeableWaiting = Math.max(0, waiting - rate.freeWaitingMin);
  const waitingFare = rate.waitingPerMin * chargeableWaiting;
  const chargeableBags = Math.max(0, bags - rate.freeLuggagePieces);
  const luggageFare = rate.luggagePerPiece * chargeableBags;

  // The night charge is a percentage of the metered amount. Luggage is a flat notified
  // charge and is added after it, the way the printed card reads.
  const meterFare = distanceFare + rideTimeFare + waitingFare;
  const night = isNightMinute(pickupMinute);
  const nightSurcharge = night ? (meterFare * rate.nightSurchargePct) / 100 : 0;
  const afterNight = meterFare + nightSurcharge + luggageFare;
  const surgeAmount = afterNight * (surge - 1);

  const beforeMinimum = afterNight + surgeAmount;
  const minimumApplied = Math.max(beforeMinimum, rate.minimumFare);
  const minimumTopUp = minimumApplied - beforeMinimum;

  const total = minimumApplied + tolls;

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
    chargeableBags,
    luggageFare: round2(luggageFare),
    meterFare: round2(meterFare),
    nightSurcharge: round2(nightSurcharge),
    nightSurchargePct: rate.nightSurchargePct,
    surge,
    surgeAmount: round2(surgeAmount),
    minimumFare: rate.minimumFare,
    minimumTopUp: round2(minimumTopUp),
    tolls: round2(tolls),
    total: round2(total),
    payable: Math.round(total),
    // Drivers almost always round the collected note up to the next ten rupees.
    roundedUp: Math.ceil(total / 10) * 10,
    fairLow: Math.round(total * 0.9),
    fairHigh: Math.round(total * 1.1),
    perKmEffective: round2(total / km),
  };
}
