/**
 * Bengaluru airport transfer time planner — Kempegowda International Airport (BLR / VOBL).
 *
 * The question this answers is "what time do I have to walk out of my door?", and it
 * is answered by working backwards from the scheduled departure through three
 * independent constraints:
 *
 *   1. Bag-drop deadline  — if you are checking a bag you must be AT the counter
 *      before the airline closes it, so terminal arrival must lead departure by
 *      (check-in close + terminal entry + a margin to join the queue rather than
 *      reach an already-shut counter).
 *   2. Gate deadline      — you must be at the gate before it closes, so terminal
 *      arrival must lead departure by the sum of every in-terminal step plus the
 *      gate-closing lead.
 *   3. Airport advice     — the reporting time the airport publishes for that
 *      flight type (2 hours domestic, 3 hours international at Indian airports).
 *
 * The required terminal lead is the LARGEST of the three. Leave-home time is then
 * terminal-arrival minus the road or rail journey minus your personal buffer.
 *
 * The road journey is free-flow time (distance / free-flow speed) multiplied by a
 * congestion factor for the hour you are actually travelling. That is circular — the
 * hour you leave depends on how long the trip takes, which depends on the hour you
 * leave — so the answer is found by fixed-point iteration (see planTransfer).
 *
 * BLR sits at Devanahalli, roughly 35 km north of the city centre, so the transfer is
 * a long one by Indian standards and the congestion penalty compounds over distance.
 * Most of the run is on NH-44 and the elevated tollway, which is why the free-flow
 * speed is set higher than an inner-city figure.
 *
 * Everything is pure: clock times come in as "HH:MM" strings and no clock is read.
 */

export const AIRPORT = {
  code: "BLR",
  name: "Kempegowda International Airport",
  city: "Bengaluru",
  terminals: "T1 and T2, adjacent buildings sharing one forecourt at Devanahalli",
};

/** City-specific prose the UI renders. Kept here so the UI file stays purely presentational. */
export const COPY = {
  intro:
    "Works backwards from your departure time to the moment you have to walk out of the door. It applies a congestion factor for the hour you are actually on the road, then takes the strictest of three deadlines — the airline's bag-drop close, the boarding gate close, and the airport's reporting advice.",
  footnote:
    "BLR is about 35 km north of the centre at Devanahalli, so the transfer itself is usually the largest single block of time in the plan — and the one with the widest spread between a clear run and a peak-hour one. Check which of T1 and T2 your flight uses; they share a forecourt but not a check-in hall. The congestion profile is a typical-weekday approximation, not a live traffic feed: check a live map before leaving, and add time for rain, roadworks or a diversion. Airline bag-drop and gate closing times are the ones printed on your booking.",
};

export const MINUTES_PER_DAY = 1440;

/**
 * Weekday congestion profile: the multiplier applied to free-flow travel time for a
 * trip starting in that hour. Bengaluru consistently ranks among the most congested
 * large cities in global traffic indices, so the peaks here are the steepest of any
 * city in this set — a morning peak around 08:00-10:00 and an evening one from about
 * 17:00 to 20:00. It is a typical-day approximation, not a live feed, which is why the
 * calculator also lets you override it with a traffic level you pick yourself.
 */
export const TRAFFIC_PROFILE = [
  1.0, 1.0, 1.0, 1.0, 1.05, 1.1, // 00:00-05:59
  1.25, 1.5, 1.8, 2.0, 1.9, 1.65, // 06:00-11:59
  1.5, 1.45, 1.45, 1.6, 1.8, 2.0, // 12:00-17:59
  2.0, 1.85, 1.6, 1.35, 1.15, 1.05, // 18:00-23:59
];

/**
 * Weekends and public holidays flatten the peaks. The excess over free flow is cut by
 * this share; the base free-flow time obviously does not change.
 */
export const WEEKEND_PEAK_RELIEF = 0.45;

/** Manual traffic levels, for when you already know what the road looks like. */
export const TRAFFIC_LEVELS = [
  { id: "auto", label: "Use the typical profile for that hour", factor: null },
  { id: "light", label: "Light — clear roads", factor: 1.05 },
  { id: "normal", label: "Normal", factor: 1.3 },
  { id: "heavy", label: "Heavy — rush hour", factor: 1.7 },
  { id: "severe", label: "Severe — rain, protest or a major diversion", factor: 2.2 },
];

/**
 * Typical road distance from the area to the terminal forecourt. Enter your own figure
 * if you are starting somewhere else; these are only quick-fill values.
 */
export const ORIGINS = [
  { id: "devanahalli", label: "Devanahalli town", km: 8 },
  { id: "yelahanka", label: "Yelahanka", km: 18 },
  { id: "hebbal", label: "Hebbal", km: 24 },
  { id: "indiranagar", label: "Indiranagar", km: 33 },
  { id: "mg-road", label: "MG Road / city centre", km: 35 },
  { id: "koramangala", label: "Koramangala", km: 40 },
  { id: "whitefield", label: "Whitefield", km: 45 },
  { id: "electronic-city", label: "Electronic City", km: 55 },
];

/**
 * Travel modes. `trafficSensitive` decides whether the congestion factor is applied.
 * `freeFlowKmh` is the door-to-terminal average speed with no congestion; the fixed
 * overhead covers everything that does not scale with distance — waiting for the cab,
 * parking and the walk in, or the wait at the bus bay.
 */
export const MODES = [
  {
    id: "app-cab",
    label: "App cab or taxi",
    freeFlowKmh: 50,
    trafficSensitive: true,
    fixedOverheadMinutes: 8,
    note: "Most of the run is on NH-44 and the elevated tollway, hence the high free-flow speed. Includes waiting for the car and the drop at the departures kerb.",
  },
  {
    id: "own-car",
    label: "Own car, parked at the terminal",
    freeFlowKmh: 50,
    trafficSensitive: true,
    fixedOverheadMinutes: 18,
    note: "Includes the toll stop, finding a space in the car park and the walk to departures.",
  },
  {
    id: "vayu-vajra",
    label: "BMTC Vayu Vajra airport bus",
    freeFlowKmh: 32,
    trafficSensitive: true,
    fixedOverheadMinutes: 20,
    note: "Runs on the same roads as the cars, so it gets the same congestion factor, plus the wait at the bus bay and intermediate stops.",
  },
  {
    id: "auto",
    label: "Auto rickshaw (short hops only)",
    freeFlowKmh: 35,
    trafficSensitive: true,
    fixedOverheadMinutes: 6,
    note: "Realistic from Yelahanka or Devanahalli; from the city centre a 35 km auto run is neither cheap nor comfortable.",
  },
];
export const FLIGHT_TYPES = [
  {
    id: "domestic",
    label: "Domestic",
    reportingLeadMinutes: 120,
    checkInCloseMinutes: 45,
    gateCloseMinutes: 25,
    securityMinutes: 20,
    immigrationMinutes: 0,
  },
  {
    id: "international",
    label: "International",
    reportingLeadMinutes: 180,
    checkInCloseMinutes: 60,
    gateCloseMinutes: 40,
    securityMinutes: 25,
    immigrationMinutes: 30,
  },
];

/** CISF check the ticket and photo ID at the terminal door before you can go in. */
export const TERMINAL_ENTRY_MINUTES = 5;

/** Slack so you JOIN the bag-drop queue before it shuts, not reach a closed counter. */
export const COUNTER_JOIN_MARGIN_MINUTES = 5;

/** Typical bag-drop queue once inside the departure hall. */
export const BAG_DROP_QUEUE_MINUTES = 20;

/** Walk from security to the furthest gate in a large terminal. */
export const WALK_TO_GATE_MINUTES = 12;

/** Guard rails so a typo cannot produce a nonsense plan. */
export const MAX_DISTANCE_KM = 300;
export const MAX_BUFFER_MINUTES = 240;
const MAX_LEAD_MINUTES = 600;

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

/** Wrap any minute value into [0, 1440). */
export function normaliseMinute(minute) {
  if (!Number.isFinite(minute)) return 0;
  return ((minute % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
}

/** Minutes past midnight -> "HH:MM", wrapping across midnight. */
export function formatMinutes(minute) {
  const wrapped = Math.round(normaliseMinute(minute));
  const hours = Math.floor(wrapped / 60) % 24;
  const mins = wrapped % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

/** How many whole days before the flight date the given minute falls on. */
export function dayOffset(minute) {
  return Math.floor(minute / MINUTES_PER_DAY);
}

/** Congestion multiplier for a trip starting at this minute of the day. */
export function trafficFactorAt(minute, { isWeekend = false } = {}) {
  const hour = Math.floor(normaliseMinute(minute) / 60);
  const raw = TRAFFIC_PROFILE[hour];
  if (!isWeekend) return raw;
  return 1 + (raw - 1) * (1 - WEEKEND_PEAK_RELIEF);
}

export function getMode(modeId) {
  return MODES.find((mode) => mode.id === modeId) || MODES[0];
}

export function getFlightType(flightTypeId) {
  return FLIGHT_TYPES.find((type) => type.id === flightTypeId) || FLIGHT_TYPES[0];
}

const round1 = (value) => Math.round(value * 10) / 10;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Journey time in minutes for a given congestion factor. */
export function journeyMinutes({ distanceKm, mode, factor }) {
  const rolling = (distanceKm / mode.freeFlowKmh) * 60 * (mode.trafficSensitive ? factor : 1);
  return rolling + mode.fixedOverheadMinutes;
}

/**
 * Plan a Delhi airport transfer.
 *
 * @param {object} input
 * @param {string} input.departureTime      scheduled departure, "HH:MM" 24-hour
 * @param {number} input.distanceKm         door-to-terminal distance
 * @param {string} input.modeId             one of MODES
 * @param {string} input.trafficLevelId     one of TRAFFIC_LEVELS ("auto" = use profile)
 * @param {boolean} input.isWeekend         weekend or public holiday
 * @param {string} input.flightTypeId       "domestic" or "international"
 * @param {boolean} input.checkedBag        true when you have a bag to drop
 * @param {number} input.reportingLeadMinutes airport reporting advice, minutes
 * @param {number} input.checkInCloseMinutes  airline bag-drop close, minutes before departure
 * @param {number} input.gateCloseMinutes     boarding gate close, minutes before departure
 * @param {number} input.securityMinutes      pre-embarkation security screening
 * @param {number} input.immigrationMinutes   emigration counters (international only)
 * @param {number} input.personalBufferMinutes your own slack
 * @returns {{error:string}|object} the plan, or an error for unusable input
 */
export function planTransfer({
  departureTime = "10:00",
  distanceKm = 16,
  modeId = "app-cab",
  trafficLevelId = "auto",
  isWeekend = false,
  flightTypeId = "domestic",
  checkedBag = true,
  reportingLeadMinutes,
  checkInCloseMinutes,
  gateCloseMinutes,
  securityMinutes,
  immigrationMinutes,
  personalBufferMinutes = 15,
} = {}) {
  const mode = MODES.find((item) => item.id === modeId);
  if (!mode) return { error: "Pick a way of getting to the airport." };

  const flightType = FLIGHT_TYPES.find((item) => item.id === flightTypeId);
  if (!flightType) return { error: "Pick whether the flight is domestic or international." };

  const level = TRAFFIC_LEVELS.find((item) => item.id === trafficLevelId);
  if (!level) return { error: "Pick a traffic assumption." };

  const departureMinute = parseTimeToMinutes(departureTime);
  if (departureMinute === null) {
    return { error: "Enter the scheduled departure as a 24-hour time, like 06:20." };
  }

  const km = Number(distanceKm);
  const reporting = Number(reportingLeadMinutes ?? flightType.reportingLeadMinutes);
  const checkInClose = Number(checkInCloseMinutes ?? flightType.checkInCloseMinutes);
  const gateClose = Number(gateCloseMinutes ?? flightType.gateCloseMinutes);
  const security = Number(securityMinutes ?? flightType.securityMinutes);
  const immigration = Number(immigrationMinutes ?? flightType.immigrationMinutes);
  const buffer = Number(personalBufferMinutes);

  const numbers = [km, reporting, checkInClose, gateClose, security, immigration, buffer];
  if (!numbers.every(isNum)) return { error: "Enter a valid number in every field." };
  if (km <= 0) return { error: "Distance to the terminal must be greater than zero." };
  if (km > MAX_DISTANCE_KM) {
    return { error: `Distance looks too large — enter up to ${MAX_DISTANCE_KM} km.` };
  }
  if (numbers.slice(1).some((value) => value < 0)) {
    return { error: "Lead times and buffers cannot be negative." };
  }
  if (buffer > MAX_BUFFER_MINUTES) {
    return { error: `Personal buffer should be ${MAX_BUFFER_MINUTES} minutes or less.` };
  }
  if ([reporting, checkInClose, gateClose, security, immigration].some((v) => v > MAX_LEAD_MINUTES)) {
    return { error: `Each lead time should be under ${MAX_LEAD_MINUTES} minutes.` };
  }
  if (checkedBag && checkInClose <= gateClose) {
    return {
      error: "Bag drop must close before the boarding gate does — check those two figures.",
    };
  }

  const bagQueue = checkedBag ? BAG_DROP_QUEUE_MINUTES : 0;

  // Constraint 1: be at the bag-drop counter before it shuts.
  const bagDropLead = checkedBag
    ? checkInClose + TERMINAL_ENTRY_MINUTES + COUNTER_JOIN_MARGIN_MINUTES
    : 0;

  // Constraint 2: be at the gate before it closes, having done every step on the way.
  const gateLead =
    TERMINAL_ENTRY_MINUTES + bagQueue + security + immigration + WALK_TO_GATE_MINUTES + gateClose;

  // Constraint 3: the airport's own reporting advice.
  const adviceLead = reporting;

  const requiredLead = Math.max(bagDropLead, gateLead, adviceLead);
  let bindingConstraint = "Airport reporting advice";
  if (requiredLead === gateLead) bindingConstraint = "Boarding gate closing time";
  if (requiredLead === bagDropLead) bindingConstraint = "Airline bag-drop closing time";

  const terminalArrivalMinute = departureMinute - requiredLead;

  // The congestion factor depends on the hour you set off, which depends on how long
  // the trip takes, which depends on the factor. Iterate to a fixed point. The profile
  // is piecewise constant per hour, so this settles in a couple of passes; if it
  // oscillates between two adjacent hours we keep the EARLIER (safer) departure.
  let leaveByMinute = terminalArrivalMinute - 60;
  let travel = 0;
  let factor = 1;
  let converged = false;
  let previous = null;
  for (let pass = 0; pass < 6; pass += 1) {
    factor = level.factor === null ? trafficFactorAt(leaveByMinute, { isWeekend }) : level.factor;
    travel = journeyMinutes({ distanceKm: km, mode, factor });
    const next = terminalArrivalMinute - travel - buffer;
    if (Math.abs(next - leaveByMinute) < 0.5) {
      leaveByMinute = next;
      converged = true;
      break;
    }
    if (previous !== null && Math.abs(next - previous) < 0.5) {
      // Oscillating between two hours — take the earlier of the pair.
      leaveByMinute = Math.min(next, leaveByMinute);
      factor = level.factor === null ? trafficFactorAt(leaveByMinute, { isWeekend }) : level.factor;
      travel = journeyMinutes({ distanceKm: km, mode, factor });
      break;
    }
    previous = leaveByMinute;
    leaveByMinute = next;
  }

  const freeFlowTravel = journeyMinutes({ distanceKm: km, mode, factor: 1 });
  const totalDoorToDeparture = departureMinute - leaveByMinute;

  // What the same trip would take leaving in each hour of the day, for the table.
  const freeFlowRounded = Math.round(freeFlowTravel);
  const hourlyTravel = TRAFFIC_PROFILE.map((_, hour) => {
    const hourFactor =
      level.factor === null ? trafficFactorAt(hour * 60, { isWeekend }) : level.factor;
    const minutes = Math.round(journeyMinutes({ distanceKm: km, mode, factor: hourFactor }));
    return {
      hour,
      label: `${String(hour).padStart(2, "0")}:00`,
      factor: round1(hourFactor),
      minutes,
      deltaMinutes: minutes - freeFlowRounded,
    };
  });

  return {
    mode,
    flightType,
    trafficLevel: level,
    factor: Math.round(factor * 100) / 100,
    departureMinute,
    departureTime: formatMinutes(departureMinute),
    leaveByMinute,
    leaveByTime: formatMinutes(leaveByMinute),
    leaveByDayOffset: dayOffset(leaveByMinute),
    terminalArrivalMinute,
    terminalArrivalTime: formatMinutes(terminalArrivalMinute),
    terminalArrivalDayOffset: dayOffset(terminalArrivalMinute),
    travelMinutes: Math.round(travel),
    freeFlowTravelMinutes: Math.round(freeFlowTravel),
    congestionCostMinutes: Math.round(travel - freeFlowTravel),
    personalBufferMinutes: buffer,
    requiredLeadMinutes: requiredLead,
    bagDropLeadMinutes: bagDropLead,
    gateLeadMinutes: gateLead,
    adviceLeadMinutes: adviceLead,
    bindingConstraint,
    bagQueueMinutes: bagQueue,
    totalDoorToDepartureMinutes: Math.round(totalDoorToDeparture),
    converged,
    hourlyTravel,
  };
}

/** "137" -> "2 h 17 min". Used by the UI for every duration it prints. */
export function formatDuration(minutes) {
  if (!Number.isFinite(minutes)) return null;
  const rounded = Math.round(minutes);
  const sign = rounded < 0 ? "-" : "";
  const abs = Math.abs(rounded);
  const hours = Math.floor(abs / 60);
  const mins = abs % 60;
  if (hours === 0) return `${sign}${mins} min`;
  if (mins === 0) return `${sign}${hours} h`;
  return `${sign}${hours} h ${mins} min`;
}
