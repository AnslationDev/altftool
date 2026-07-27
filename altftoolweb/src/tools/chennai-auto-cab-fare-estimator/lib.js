/**
 * Chennai auto rickshaw and cab fare estimation.
 *
 * Auto rickshaws in Chennai run on a tariff notified by the Government of Tamil Nadu
 * (Home, Transport department fare revision of 2013, still the card displayed inside
 * the vehicle): a minimum fare covering the first 1.8 km, a per-kilometre rate beyond
 * that, a waiting charge billed per five minutes, and a 50% night surcharge on the
 * meter reading between 23:00 and 05:00.
 *
 * App cabs (Ola, Uber, Rapido cabs and the local call-taxi fleets) are not covered by
 * that notification. They price on a base fare that includes a couple of kilometres,
 * then a per-kilometre rate plus a per-minute ride-time rate, with a surge multiplier
 * applied on top. Their defaults below are typical Chennai city rates and are exposed
 * as editable inputs precisely because operators change them without notice.
 *
 * Everything here is pure arithmetic: the same inputs always give the same fare, and
 * the pickup time is passed in rather than read from the clock.
 */

/** Notified Chennai auto tariff: ₹25 covers the first 1.8 km, ₹12 for every km after. */
export const AUTO_BASE_FARE = 25;
export const AUTO_BASE_KM = 1.8;
export const AUTO_PER_KM = 12;

/** Notified waiting charge: ₹3 for every 5 minutes of waiting = ₹0.60 per minute. */
export const AUTO_WAITING_PER_MIN = 3 / 5;

/** Notified night surcharge: 50% extra on the metered fare between 23:00 and 05:00. */
export const NIGHT_SURCHARGE_PCT = 50;
export const NIGHT_START_MIN = 23 * 60; // 23:00
export const NIGHT_END_MIN = 5 * 60; // 05:00

/** Guard rails so an obvious typo returns an error instead of a silly fare. */
const MAX_DISTANCE_KM = 200;
const MAX_MINUTES = 600;
const MAX_SURGE = 5;

/**
 * Rate cards. `auto` is the statutory one; the cab rows are typical Chennai app-cab
 * pricing and are meant to be edited to match the quote on screen.
 */
export const VEHICLES = [
  {
    id: "auto",
    label: "Auto rickshaw (meter)",
    statutory: true,
    baseFare: AUTO_BASE_FARE,
    baseKm: AUTO_BASE_KM,
    perKm: AUTO_PER_KM,
    perMinute: 0,
    waitingPerMin: AUTO_WAITING_PER_MIN,
    freeWaitingMin: 0,
    nightSurchargePct: NIGHT_SURCHARGE_PCT,
    minimumFare: AUTO_BASE_FARE,
    surgeable: false,
  },
  {
    id: "auto-app",
    label: "Auto on an app (Ola / Uber / Rapido)",
    statutory: false,
    baseFare: 30,
    baseKm: 2,
    perKm: 12,
    perMinute: 0.5,
    waitingPerMin: 1,
    freeWaitingMin: 3,
    nightSurchargePct: 0,
    minimumFare: 40,
    surgeable: true,
  },
  {
    id: "cab-mini",
    label: "Cab — hatchback / mini",
    statutory: false,
    baseFare: 55,
    baseKm: 2,
    perKm: 13,
    perMinute: 1,
    waitingPerMin: 1,
    freeWaitingMin: 3,
    nightSurchargePct: 0,
    minimumFare: 80,
    surgeable: true,
  },
  {
    id: "cab-sedan",
    label: "Cab — sedan / prime",
    statutory: false,
    baseFare: 70,
    baseKm: 2,
    perKm: 16,
    perMinute: 1.2,
    waitingPerMin: 1.5,
    freeWaitingMin: 3,
    nightSurchargePct: 0,
    minimumFare: 110,
    surgeable: true,
  },
  {
    id: "cab-suv",
    label: "Cab — SUV / 6-seater",
    statutory: false,
    baseFare: 95,
    baseKm: 2,
    perKm: 20,
    perMinute: 1.5,
    waitingPerMin: 2,
    freeWaitingMin: 3,
    nightSurchargePct: 0,
    minimumFare: 150,
    surgeable: true,
  },
];

/** Common Chennai runs, for the quick-distance chips. Straight road distances. */
export const COMMON_TRIPS = [
  { label: "Central to T Nagar", km: 6 },
  { label: "T Nagar to Airport", km: 14 },
  { label: "Central to Airport", km: 20 },
  { label: "Adyar to OMR Sholinganallur", km: 15 },
  { label: "Egmore to Tambaram", km: 27 },
];

export function getVehicle(vehicleId) {
  return VEHICLES.find((vehicle) => vehicle.id === vehicleId) || VEHICLES[0];
}

/**
 * "HH:MM" -> minutes past midnight, or null when it is not a valid 24 hour time.
 */
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

/** The night window wraps past midnight, so the test is "at or after 23:00 OR before 05:00". */
export function isNightMinute(minuteOfDay) {
  if (!Number.isFinite(minuteOfDay)) return false;
  return minuteOfDay >= NIGHT_START_MIN || minuteOfDay < NIGHT_END_MIN;
}

const round2 = (value) => Math.round(value * 100) / 100;

/**
 * Estimate a Chennai auto or cab fare.
 *
 * @returns {{error:string}|object} the fare breakdown, or an error for unusable input
 */
export function estimateFare({
  vehicleId = "auto",
  distanceKm = 0,
  waitingMinutes = 0,
  rideMinutes = 0,
  pickupTime = "10:00",
  surgeMultiplier = 1,
  tollsAndParking = 0,
} = {}) {
  const vehicle = VEHICLES.find((item) => item.id === vehicleId);
  if (!vehicle) return { error: "Pick a vehicle type from the list." };

  const km = Number(distanceKm);
  const waiting = Number(waitingMinutes);
  const ride = Number(rideMinutes);
  const surgeRaw = Number(surgeMultiplier);
  const tolls = Number(tollsAndParking);

  if (![km, waiting, ride, surgeRaw, tolls].every((value) => Number.isFinite(value))) {
    return { error: "Enter valid numbers in every field." };
  }
  if (km <= 0) return { error: "Trip distance must be greater than zero." };
  if (km > MAX_DISTANCE_KM) {
    return { error: `Trip distance looks too large — enter up to ${MAX_DISTANCE_KM} km.` };
  }
  if (waiting < 0 || ride < 0 || tolls < 0) {
    return { error: "Waiting time, ride time and tolls cannot be negative." };
  }
  if (waiting > MAX_MINUTES || ride > MAX_MINUTES) {
    return { error: `Waiting and ride time should each be under ${MAX_MINUTES} minutes.` };
  }
  if (surgeRaw < 1 || surgeRaw > MAX_SURGE) {
    return { error: `Surge multiplier should be between 1.0 and ${MAX_SURGE.toFixed(1)}.` };
  }

  const pickupMinute = parseTimeToMinutes(pickupTime);
  if (pickupMinute === null) return { error: "Enter the pickup time as a 24-hour time, like 22:45." };

  const surge = vehicle.surgeable ? surgeRaw : 1;

  const extraKm = Math.max(0, km - vehicle.baseKm);
  const distanceFare = vehicle.baseFare + extraKm * vehicle.perKm;
  const rideTimeFare = vehicle.perMinute * ride;
  const chargeableWaiting = Math.max(0, waiting - vehicle.freeWaitingMin);
  const waitingFare = vehicle.waitingPerMin * chargeableWaiting;

  const meterFare = distanceFare + rideTimeFare + waitingFare;
  const night = isNightMinute(pickupMinute);
  const nightSurcharge = night ? (meterFare * vehicle.nightSurchargePct) / 100 : 0;
  const afterNight = meterFare + nightSurcharge;
  const surgeAmount = afterNight * (surge - 1);

  const beforeMinimum = afterNight + surgeAmount;
  const minimumApplied = Math.max(beforeMinimum, vehicle.minimumFare);
  const minimumTopUp = minimumApplied - beforeMinimum;

  const total = minimumApplied + tolls;
  const payable = Math.round(total);
  // Drivers and apps both round the collected amount; the nearest ₹10 is the usual ask.
  const roundedUp = Math.ceil(total / 10) * 10;

  return {
    vehicle,
    isNight: night,
    pickupMinute,
    distanceKm: km,
    baseKm: vehicle.baseKm,
    extraKm: round2(extraKm),
    distanceFare: round2(distanceFare),
    rideTimeFare: round2(rideTimeFare),
    chargeableWaiting: round2(chargeableWaiting),
    waitingFare: round2(waitingFare),
    meterFare: round2(meterFare),
    nightSurcharge: round2(nightSurcharge),
    nightSurchargePct: vehicle.nightSurchargePct,
    surge,
    surgeAmount: round2(surgeAmount),
    minimumFare: vehicle.minimumFare,
    minimumTopUp: round2(minimumTopUp),
    tolls: round2(tolls),
    total: round2(total),
    payable,
    roundedUp,
    fairLow: Math.round(total * 0.9),
    fairHigh: Math.round(total * 1.1),
    perKmEffective: round2(total / km),
  };
}
