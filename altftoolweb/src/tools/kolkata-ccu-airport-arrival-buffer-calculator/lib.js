/**
 * Departure planning for Netaji Subhas Chandra Bose International Airport (CCU / VECC).
 *
 * The maths is plain clock arithmetic on minutes-from-midnight. Working backwards
 * from the scheduled departure time there are two deadlines that can govern the plan,
 * plus a third figure shown for reference only:
 *
 *   1. Process deadline  - you must physically be at the gate before it closes, so
 *      terminal arrival must be at least (all in-terminal steps + gate-closing lead)
 *      before departure.
 *   2. Airport advice    - the reporting time the airport publishes for the flight type.
 *   3. Check-in deadline (informational) - if you are dropping a bag, the time you'd need
 *      to reach the counter before the airline closes it. With this tool's constants
 *      (45-60 min airline cut-off) it is always earlier than deadlines 1 and 2, so it
 *      never ends up being the binding one - it is still shown ("Bag drop closes") so
 *      you know the counter's own cut-off, just not treated as governing the plan.
 *
 * The terminal arrival lead is the LARGER of deadlines 1 and 2; the leave-home time is
 * that arrival time minus the road journey (free-flow drive time x traffic factor) and
 * the parking / drop-off walk. Everything is pure: pass the departure clock time in, no
 * clock is read inside.
 */

/** Airport identity, used by the UI for labels only. */
export const AIRPORT = {
  code: "CCU",
  name: "Netaji Subhas Chandra Bose International Airport",
  city: "Kolkata",
  terminals: [
    "One integrated terminal at Dum Dum for all airlines",
    "Domestic check-in rows and international check-in rows sit in the same departure hall",
    "Separate domestic and international security and departure piers after check-in",
  ],
};

/** Minutes in a day, used for wrapping clock arithmetic across midnight. */
export const MINUTES_PER_DAY = 1440;

/** Guard rails so a typo cannot produce a nonsense plan. */
export const MAX_DRIVE_MINUTES = 600;
export const MAX_PARKING_MINUTES = 120;
export const MAX_PERSONAL_BUFFER_MINUTES = 240;

/** Time from the terminal kerb to standing at the check-in counter: at Indian airports CISF checks ticket and photo ID at the terminal door before you can enter the departure hall. */
export const TERMINAL_ENTRY_MINUTES = 5;
export const TERMINAL_ENTRY_LABEL = "Terminal entry check (ticket and photo ID)";

/** Extra slack so you JOIN the bag-drop queue before the counter shuts, not after. */
export const COUNTER_JOIN_MARGIN_MINUTES = 5;

/** Baseline queue times at CCU in normal conditions, before the queue factor. */
export const BASELINE = {
  /** Bag-drop queue in the departure hall. */
  checkInQueueMinutes: 18,
};

/**
 * Flight types. Reporting time follows the airport's published advice:
 * 2 hours before a domestic departure, 3 hours before an international one.
 * Check-in and gate cut-offs are airline rules, not airport rules - the values
 * here are the common Indian-carrier defaults (domestic bag drop closing 45 min
 * before departure, international 60 min, boarding gate closing 25 min before).
 */
export const JOURNEY_TYPES = [
  {
    id: "domestic",
    label: "Domestic",
    recommendedLeadMinutes: 120,
    securityMinutes: 18,
    securityLabel: "Security screening",
    immigrationMinutes: 0,
    immigrationLabel: "Emigration / passport control",
    gateWalkMinutes: 10,
    checkInClosesMinutes: 45,
    gateClosesMinutes: 25,
  },
  {
    id: "international",
    label: "International",
    recommendedLeadMinutes: 180,
    securityMinutes: 22,
    securityLabel: "Security screening",
    immigrationMinutes: 20,
    immigrationLabel: "Emigration / passport control",
    gateWalkMinutes: 15,
    checkInClosesMinutes: 60,
    gateClosesMinutes: 25,
  },
];

/** Multiplier applied to the free-flow drive time. Most journeys use VIP Road or the EM Bypass, both of which slow sharply in the evening and during festival processions. */
export const TRAFFIC_LEVELS = [
  { id: "clear", label: "Clear (night / early morning)", multiplier: 1 },
  { id: "typical", label: "Typical daytime", multiplier: 1.25 },
  { id: "heavy", label: "Heavy (rush hour)", multiplier: 1.6 },
  { id: "severe", label: "Severe (rain, procession, VIP road closure)", multiplier: 2.1 },
];

/** Multiplier applied to every queue inside the terminal. */
export const QUEUE_LEVELS = [
  { id: "quiet", label: "Quiet terminal", multiplier: 0.7 },
  { id: "typical", label: "Typical", multiplier: 1 },
  { id: "peak", label: "Peak bank (05:00-09:00, 17:00-21:00)", multiplier: 1.5 },
];

/**
 * Kolkata road rush-hour windows, as minutes from midnight. Used only to SUGGEST a
 * traffic level; the driver always overrides it.
 */
export const RUSH_WINDOWS = [
  [540, 690],
  [1050, 1260],
];

/**
 * Indicative free-flow (no-traffic) road times to CCU from common starting
 * points. They are starting estimates only - replace the minutes with a live maps
 * estimate for your own address.
 */
export const AREA_PRESETS = [
  { id: "dumdum", label: "Dum Dum / Nagerbazar / Lake Town", driveMinutes: 15 },
  { id: "saltlake", label: "Salt Lake (Bidhannagar) / Sector V", driveMinutes: 25 },
  { id: "newtown", label: "New Town / Rajarhat", driveMinutes: 25 },
  { id: "barasat", label: "Barasat / Madhyamgram", driveMinutes: 25 },
  { id: "ultadanga", label: "Ultadanga / Shyambazar", driveMinutes: 30 },
  { id: "parkstreet", label: "Park Street / Esplanade / Sealdah", driveMinutes: 45 },
  { id: "ballygunge", label: "Ballygunge / Gariahat", driveMinutes: 45 },
  { id: "howrah", label: "Howrah / Salkia", driveMinutes: 55 },
  { id: "behala", label: "Behala / Joka", driveMinutes: 60 },
  { id: "garia", label: "Garia / Sonarpur", driveMinutes: 55 },
  { id: "custom", label: "Other / enter my own", driveMinutes: null },
];

export const DEFAULTS = {
  departureTime: "08:30",
  journeyId: "domestic",
  bags: "checked",
  areaId: "saltlake",
  driveMinutes: 25,
  trafficId: "typical",
  queueId: "typical",
  parkingMinutes: 10,
  personalBufferMinutes: 20,
};

/** "HH:MM" (24-hour) -> minutes from midnight, or null when unparseable. */
export function parseClock(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return null;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

/** Minutes from midnight -> "5:40 am", wrapping safely across midnight. */
export function formatClock(totalMinutes) {
  if (!Number.isFinite(totalMinutes)) return "--:--";
  const wrapped = ((Math.round(totalMinutes) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hours = Math.floor(wrapped / 60);
  const minutes = wrapped % 60;
  const period = hours < 12 ? "am" : "pm";
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${String(minutes).padStart(2, "0")} ${period}`;
}

/** How many whole days a wrapped clock value sits before (negative) the flight day. */
export function dayOffset(totalMinutes) {
  if (!Number.isFinite(totalMinutes)) return 0;
  return Math.floor(totalMinutes / MINUTES_PER_DAY);
}

/** "3 h 55 min" style duration label. */
export function formatDuration(totalMinutes) {
  if (!Number.isFinite(totalMinutes)) return "--";
  const value = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} h`;
  return `${hours} h ${minutes} min`;
}

/** Suggests a traffic level from the hour the drive starts. */
export function suggestTrafficLevel(startMinutes) {
  if (!Number.isFinite(startMinutes)) return "typical";
  const wrapped = ((Math.round(startMinutes) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  if (RUSH_WINDOWS.some(([from, to]) => wrapped >= from && wrapped < to)) return "heavy";
  if (wrapped < 6 * 60 || wrapped >= 23 * 60) return "clear";
  return "typical";
}

function findById(list, id) {
  return list.find((item) => item.id === id) || null;
}

function toFiniteNumber(raw) {
  if (raw === "" || raw === null || raw === undefined) return NaN;
  const value = Number(String(raw).trim());
  return Number.isFinite(value) ? value : NaN;
}

/**
 * Builds the full departure plan.
 *
 * @returns {{error: string}} for invalid input, otherwise the plan object.
 */
export function computeArrivalPlan({
  departureTime,
  journeyId,
  bags,
  driveMinutes,
  trafficId,
  queueId,
  parkingMinutes,
  personalBufferMinutes,
} = {}) {
  const departure = parseClock(departureTime);
  if (departure === null) {
    return { error: "Enter the scheduled departure time on a 24-hour clock, for example 08:30." };
  }

  const journey = findById(JOURNEY_TYPES, journeyId);
  if (!journey) return { error: "Choose whether this is a domestic or an international departure." };

  const traffic = findById(TRAFFIC_LEVELS, trafficId);
  if (!traffic) return { error: "Choose the road conditions you expect." };

  const queue = findById(QUEUE_LEVELS, queueId);
  if (!queue) return { error: "Choose how busy the terminal is likely to be." };

  const drive = toFiniteNumber(driveMinutes);
  if (Number.isNaN(drive)) return { error: "Enter the driving time to the airport in minutes." };
  if (drive < 0) return { error: "Driving time cannot be negative." };
  if (drive > MAX_DRIVE_MINUTES) {
    return { error: `Driving time above ${MAX_DRIVE_MINUTES} minutes is out of range for an airport transfer.` };
  }

  const parking = toFiniteNumber(parkingMinutes);
  if (Number.isNaN(parking)) return { error: "Enter the parking or drop-off time in minutes." };
  if (parking < 0) return { error: "Parking and drop-off time cannot be negative." };
  if (parking > MAX_PARKING_MINUTES) {
    return { error: `Parking and drop-off above ${MAX_PARKING_MINUTES} minutes is out of range.` };
  }

  const personal = toFiniteNumber(personalBufferMinutes);
  if (Number.isNaN(personal)) return { error: "Enter your personal buffer in minutes (0 if you want none)." };
  if (personal < 0) return { error: "Personal buffer cannot be negative." };
  if (personal > MAX_PERSONAL_BUFFER_MINUTES) {
    return { error: `A personal buffer above ${MAX_PERSONAL_BUFFER_MINUTES} minutes is out of range.` };
  }

  const hasBags = bags === "checked";
  const checkInQueueMinutes = hasBags ? Math.round(BASELINE.checkInQueueMinutes * queue.multiplier) : 0;
  const securityMinutes = Math.round(journey.securityMinutes * queue.multiplier);
  const immigrationMinutes = Math.round(journey.immigrationMinutes * queue.multiplier);
  const gateWalkMinutes = journey.gateWalkMinutes;

  // Deadline 1: be at the gate before it closes.
  const inTerminalMinutes =
    TERMINAL_ENTRY_MINUTES +
    checkInQueueMinutes +
    securityMinutes +
    immigrationMinutes +
    gateWalkMinutes +
    personal;
  const processLeadMinutes = inTerminalMinutes + journey.gateClosesMinutes;

  // Deadline 2: reach the bag-drop counter before the airline shuts it.
  const checkInLeadMinutes = hasBags
    ? journey.checkInClosesMinutes + TERMINAL_ENTRY_MINUTES + COUNTER_JOIN_MARGIN_MINUTES
    : 0;

  // Deadline 3: the airport's published reporting time.
  const recommendedLeadMinutes = journey.recommendedLeadMinutes;

  // Note: the bag-drop counter cut-off (checkInLeadMinutes, ~55-70 min) is always
  // smaller than the airport's advised reporting time (recommendedLeadMinutes,
  // 120-180 min) with the current constants, so it can never be the binding
  // deadline. It is still computed and shown informationally (see checkInCloseMinutes),
  // but only the process estimate vs. the airport's advice can govern the plan.
  const terminalLeadMinutes = Math.max(processLeadMinutes, checkInLeadMinutes, recommendedLeadMinutes);
  let governedBy = "the airport's published reporting time";
  if (terminalLeadMinutes === processLeadMinutes && processLeadMinutes >= recommendedLeadMinutes) {
    governedBy = "your own queue, walking and buffer estimates";
  }

  const driveWithTrafficMinutes = Math.round(drive * traffic.multiplier);
  const roadMinutes = driveWithTrafficMinutes + parking;
  const totalLeadMinutes = terminalLeadMinutes + roadMinutes;

  const arriveTerminalMinutes = departure - terminalLeadMinutes;
  const leaveByMinutes = arriveTerminalMinutes - roadMinutes;
  const checkInCloseMinutes = departure - journey.checkInClosesMinutes;
  const gateCloseMinutes = departure - journey.gateClosesMinutes;
  const spareMinutes = Math.max(0, terminalLeadMinutes - processLeadMinutes);

  const steps = [];
  let cursor = leaveByMinutes;
  const push = (label, minutes) => {
    if (minutes <= 0) return;
    steps.push({ label, minutes, startMinutes: cursor });
    cursor += minutes;
  };
  push("Drive to the airport", driveWithTrafficMinutes);
  push("Park or drop off, walk to the terminal", parking);
  push(TERMINAL_ENTRY_LABEL, TERMINAL_ENTRY_MINUTES);
  push("Check-in and bag drop", checkInQueueMinutes);
  push(journey.securityLabel, securityMinutes);
  push(journey.immigrationLabel, immigrationMinutes);
  push("Walk to the boarding gate", gateWalkMinutes);
  push("Personal buffer", personal);
  push("Spare time at the gate", spareMinutes);
  push("Boarding gate closes, aircraft door shuts", journey.gateClosesMinutes);

  const warnings = [];
  if (processLeadMinutes > recommendedLeadMinutes) {
    warnings.push(
      `Your own step estimates need ${formatDuration(processLeadMinutes)} inside the terminal, which is more than the ${formatDuration(recommendedLeadMinutes)} the airport advises. The larger figure is used.`,
    );
  }
  if (dayOffset(leaveByMinutes) < 0) {
    warnings.push("You need to set off the day before the flight - check overnight road closures and cab availability.");
  }
  if (spareMinutes < 15 && spareMinutes === terminalLeadMinutes - processLeadMinutes) {
    warnings.push("This plan leaves under 15 minutes of slack at the gate. Add to the personal buffer if you can.");
  }

  return {
    departureMinutes: departure,
    journey,
    traffic,
    queue,
    hasBags,
    driveWithTrafficMinutes,
    roadMinutes,
    parkingMinutes: parking,
    personalBufferMinutes: personal,
    checkInQueueMinutes,
    securityMinutes,
    immigrationMinutes,
    gateWalkMinutes,
    terminalEntryMinutes: TERMINAL_ENTRY_MINUTES,
    inTerminalMinutes,
    processLeadMinutes,
    checkInLeadMinutes,
    recommendedLeadMinutes,
    terminalLeadMinutes,
    totalLeadMinutes,
    spareMinutes,
    governedBy,
    leaveByMinutes,
    arriveTerminalMinutes,
    checkInCloseMinutes,
    gateCloseMinutes,
    leaveByDayOffset: dayOffset(leaveByMinutes),
    arriveTerminalDayOffset: dayOffset(arriveTerminalMinutes),
    steps,
    warnings,
  };
}
