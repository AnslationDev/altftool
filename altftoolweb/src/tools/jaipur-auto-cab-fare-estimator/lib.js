/**
 * Jaipur auto rickshaw, e-rickshaw and cab fare estimation.
 *
 * Unlike Delhi, Mumbai or Chennai, autos in Jaipur are in practice negotiated rather
 * than metered: most vehicles either have no working meter or decline to use it, so a
 * passenger is quoted a lump sum before the trip starts. This tool therefore does not
 * claim to reproduce a notified meter. It applies the SAME two-part structure that
 * every Indian city tariff uses —
 *
 *   fare = a base amount covering the first few kilometres
 *        + a per-kilometre rate beyond that
 *        + waiting time
 *        (+ a night premium, expressed as a percentage of the running fare)
 *
 * — to a starting rate card that you can edit in full. The point is to arrive at a
 * defensible number BEFORE you negotiate, and to see what an app quote implies per
 * kilometre. App cabs (Ola, Uber, Rapido) price on base + per km + per ride minute
 * with a demand multiplier, which is modelled the same way.
 *
 * Everything is pure arithmetic and the pickup time is passed in rather than read from
 * the clock, so the same inputs always give the same fare.
 */

/**
 * Surge ceiling. Rajasthan has not published its own aggregator scheme, so the
 * national Motor Vehicle Aggregator Guidelines, 2020 issued by MoRTH apply: an
 * aggregator may charge at most 1.5 times the base fare it has declared, and at
 * least 50% of it.
 */
export const MAX_SURGE = 1.5;

/**
 * Night premium used as the starting assumption on the negotiated rate cards. Jaipur
 * autos are not metered in practice, so this is a convention drivers ask for after
 * the last buses run, NOT a notified surcharge — it is editable for that reason.
 */
export const DEFAULT_NIGHT_PCT = 25;
export const NIGHT_START_MIN = 23 * 60; // 23:00
export const NIGHT_END_MIN = 5 * 60; // 05:00

/** Guard rails so an obvious typo returns an error instead of a silly fare. */
const MAX_DISTANCE_KM = 250;
const MAX_MINUTES = 600;
const MAX_RATE = 500; // rupees, for any single editable rate field

/**
 * Starting rate cards. `negotiated: true` means the row is a benchmark to argue from,
 * not a notified tariff — which is every street vehicle in Jaipur. The app rows are
 * typical Jaipur pricing and are equally editable.
 */
export const VEHICLES = [
  {
    id: "auto",
    label: "Auto rickshaw — negotiated street rate",
    negotiated: true,
    baseFare: 30,
    baseKm: 2,
    perKm: 14,
    perMinute: 0,
    waitingPerMin: 1,
    freeWaitingMin: 5,
    nightSurchargePct: DEFAULT_NIGHT_PCT,
    minimumFare: 50,
    surgeable: false,
  },
  {
    id: "e-rickshaw",
    label: "E-rickshaw (shared-route vehicle, walled city)",
    negotiated: true,
    baseFare: 20,
    baseKm: 2,
    perKm: 9,
    perMinute: 0,
    waitingPerMin: 0.5,
    freeWaitingMin: 5,
    nightSurchargePct: DEFAULT_NIGHT_PCT,
    minimumFare: 25,
    surgeable: false,
  },
  {
    id: "auto-app",
    label: "Auto on an app (Ola / Uber / Rapido)",
    negotiated: false,
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
    negotiated: false,
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
    negotiated: false,
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
    label: "App cab / tourist SUV — 6-seater",
    negotiated: false,
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

/** Typical one-way road distances for well-known Jaipur runs, for the quick-fill chips. */
export const COMMON_TRIPS = [
  { label: "Jaipur Jn to Hawa Mahal", km: 4.5 },
  { label: "Hawa Mahal to Amber Fort", km: 11 },
  { label: "Jaipur Jn to JAI airport", km: 13 },
  { label: "Mansarovar to Badi Chaupar", km: 13 },
  { label: "Malviya Nagar to Jaipur Jn", km: 11 },
  { label: "Hawa Mahal to Nahargarh Fort", km: 7 },
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

/** Validate a rate card. Returns an error string, or null when the card is usable. */
export function validateRate(rate) {
  if (!rate || typeof rate !== "object") return "Pick a vehicle to load its rate card.";
  const fields = [
    ["Base fare", rate.baseFare],
    ["Included distance", rate.baseKm],
    ["Per-kilometre rate", rate.perKm],
    ["Per-minute rate", rate.perMinute],
    ["Waiting rate", rate.waitingPerMin],
    ["Free waiting minutes", rate.freeWaitingMin],
    ["Night premium", rate.nightSurchargePct],
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
  if (rate.nightSurchargePct > 200) return "Night premium should be 200% or less.";
  return null;
}

/**
 * Estimate a Jaipur auto, e-rickshaw or cab fare.
 *
 * @param {object} input
 * @param {object} input.rate            full rate card (see VEHICLES for the shape)
 * @param {number} input.distanceKm      one-way trip distance in kilometres
 * @param {boolean} input.roundTrip      true when the driver waits and brings you back
 * @param {number} input.waitingMinutes  minutes the vehicle waits for you
 * @param {number} input.rideMinutes     minutes spent moving (app cabs bill this)
 * @param {string} input.pickupTime      "HH:MM" 24-hour pickup time
 * @param {number} input.surgeMultiplier demand multiplier, 1 = none
 * @param {number} input.tollsAndParking rupees of tolls, entry fees and parking on top
 * @returns {{error:string}|object} the fare breakdown, or an error for unusable input
 */
export function estimateFare({
  rate,
  distanceKm = 0,
  roundTrip = false,
  waitingMinutes = 0,
  rideMinutes = 0,
  pickupTime = "10:00",
  surgeMultiplier = 1,
  tollsAndParking = 0,
} = {}) {
  const rateError = validateRate(rate);
  if (rateError) return { error: rateError };

  const oneWayKm = Number(distanceKm);
  const waiting = Number(waitingMinutes);
  const ride = Number(rideMinutes);
  const surgeRaw = Number(surgeMultiplier);
  const tolls = Number(tollsAndParking);

  if (![oneWayKm, waiting, ride, surgeRaw, tolls].every(isNum)) {
    return { error: "Enter valid numbers in every field." };
  }
  if (oneWayKm <= 0) return { error: "Trip distance must be greater than zero." };

  const km = roundTrip ? oneWayKm * 2 : oneWayKm;
  if (km > MAX_DISTANCE_KM) {
    return {
      error: `Chargeable distance looks too large — keep it under ${MAX_DISTANCE_KM} km, halved if you ticked round trip.`,
    };
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
    return { error: "Enter the pickup time as a 24-hour time, like 22:45." };
  }

  const surge = rate.surgeable ? surgeRaw : 1;

  const extraKm = Math.max(0, km - rate.baseKm);
  const distanceFare = rate.baseFare + extraKm * rate.perKm;
  const rideTimeFare = rate.perMinute * ride;
  const chargeableWaiting = Math.max(0, waiting - rate.freeWaitingMin);
  const waitingFare = rate.waitingPerMin * chargeableWaiting;

  const runningFare = distanceFare + rideTimeFare + waitingFare;
  const night = isNightMinute(pickupMinute);
  const nightSurcharge = night ? (runningFare * rate.nightSurchargePct) / 100 : 0;
  const afterNight = runningFare + nightSurcharge;
  const surgeAmount = afterNight * (surge - 1);

  const beforeMinimum = afterNight + surgeAmount;
  const minimumApplied = Math.max(beforeMinimum, rate.minimumFare);
  const minimumTopUp = minimumApplied - beforeMinimum;

  const total = minimumApplied + tolls;

  // Negotiating band. Opening at roughly 80% of the computed fare and settling near it
  // is the usual shape of a Jaipur auto negotiation; the walk-away figure is 20% above.
  const openingOffer = Math.round((total * 0.8) / 10) * 10;
  const walkAway = Math.round((total * 1.2) / 10) * 10;

  return {
    isNight: night,
    pickupMinute,
    roundTrip: Boolean(roundTrip),
    oneWayKm: round2(oneWayKm),
    distanceKm: round2(km),
    baseKm: rate.baseKm,
    extraKm: round2(extraKm),
    distanceFare: round2(distanceFare),
    rideTimeFare: round2(rideTimeFare),
    chargeableWaiting: round2(chargeableWaiting),
    waitingFare: round2(waitingFare),
    runningFare: round2(runningFare),
    nightSurcharge: round2(nightSurcharge),
    nightSurchargePct: rate.nightSurchargePct,
    surge,
    surgeAmount: round2(surgeAmount),
    minimumFare: rate.minimumFare,
    minimumTopUp: round2(minimumTopUp),
    tolls: round2(tolls),
    total: round2(total),
    payable: Math.round(total),
    roundedUp: Math.ceil(total / 10) * 10,
    openingOffer,
    walkAway,
    perKmEffective: round2(total / km),
  };
}
