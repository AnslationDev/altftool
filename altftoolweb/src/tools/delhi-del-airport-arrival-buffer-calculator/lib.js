/**
 * Departure planning for Indira Gandhi International Airport, Delhi (DEL / VIDP).
 *
 * The maths is plain clock arithmetic on minutes-from-midnight. Working backwards
 * from the scheduled departure time there are three independent deadlines:
 *
 *   1. Process deadline  - you must physically be at the gate before it closes, so
 *      terminal arrival must be at least (all in-terminal steps + gate-closing lead)
 *      before departure.
 *   2. Check-in deadline - if you are dropping a bag you must reach the counter
 *      before the airline closes it.
 *   3. Airport advice    - the reporting time the airport publishes for the flight type.
 *
 * The terminal arrival lead is the LARGEST of the three; the leave-home time is that
 * arrival time minus the road journey (free-flow drive time x traffic factor) and the
 * parking / drop-off walk. Everything is pure: pass the departure clock time in, no
 * clock is read inside.
 */

/** Airport identity, used by the UI for labels only. */
export const AIRPORT = {
  code: "DEL",
  name: "Indira Gandhi International Airport",
  city: "Delhi",
  authority: "Delhi International Airport Ltd (DIAL)",
  terminals: [
    "T1 - domestic (IndiGo, Akasa, SpiceJet)",
    "T2 - domestic overflow",
    "T3 - all international plus full-service domestic",
  ],
};

/** Minutes in a day, used for wrapping clock arithmetic across midnight. */
export const MINUTES_PER_DAY = 1440;

/** Guard rails so a typo cannot produce a nonsense plan. */
export const MAX_DRIVE_MINUTES = 600;
export const MAX_PARKING_MINUTES = 120;
export const MAX_PERSONAL_BUFFER_MINUTES = 240;

/**
 * Time from the terminal kerb to standing at the check-in counter: at Indian
 * airports CISF checks ticket and photo ID at the terminal door before you can
 * enter the departure hall.
 */
export const TERMINAL_ENTRY_MINUTES = 5;

/** Extra slack so you JOIN the bag-drop queue before the counter shuts, not after. */
export const COUNTER_JOIN_MARGIN_MINUTES = 5;

/** Baseline queue times at DEL in normal conditions, before the queue factor. */
export const BASELINE = {
  /** Bag-drop queue in the departure hall. */
  checkInQueueMinutes: 20,
};

/**
 * Flight types. Reporting time follows the airport's published advice for DEL:
 * 2 hours before a domestic departure, 3 hours before an international one.
 * Check-in and gate cut-offs are airline rules, not airport rules - the values
 * here are the common Indian-carrier defaults (domestic bag drop closing 45 min
 * before departure, international 60 min, boarding gate closing 25 min before)
 * and every one of them is editable in the calculator.
 */
export const JOURNEY_TYPES = [
  {
    id: "domestic",
    label: "Domestic (T1 / T2 / T3)",
    recommendedLeadMinutes: 120,
    securityMinutes: 20,
    immigrationMinutes: 0,
    gateWalkMinutes: 12,
    checkInClosesMinutes: 45,
    gateClosesMinutes: 25,
  },
  {
    id: "international",
    label: "International (T3 only)",
    recommendedLeadMinutes: 180,
    securityMinutes: 25,
    immigrationMinutes: 20,
    gateWalkMinutes: 18,
    checkInClosesMinutes: 60,
    gateClosesMinutes: 25,
  },
];

/** Multiplier applied to the free-flow drive time. */
export const TRAFFIC_LEVELS = [
  { id: "clear", label: "Clear (night / early morning)", multiplier: 1 },
  { id: "typical", label: "Typical daytime", multiplier: 1.25 },
  { id: "heavy", label: "Heavy (rush hour)", multiplier: 1.6 },
  { id: "severe", label: "Severe (rain, fog, protest, roadworks)", multiplier: 2.1 },
];

/** Multiplier applied to every queue inside the terminal. */
export const QUEUE_LEVELS = [
  { id: "quiet", label: "Quiet terminal", multiplier: 0.7 },
  { id: "typical", label: "Typical", multiplier: 1 },
  { id: "peak", label: "Peak bank (05:00-09:00, 18:00-23:00)", multiplier: 1.5 },
];

/**
 * Delhi road rush-hour windows, as minutes from midnight. Used only to SUGGEST a
 * traffic level; the driver always overrides it.
 */
export const RUSH_WINDOWS = [
  [8 * 60, 11 * 60],
  [17 * 60, 21 * 60],
];

/**
 * Indicative free-flow (no-traffic) road times to the DEL terminal complex from
 * common starting points in the NCR. They are starting estimates only - replace
 * the minutes with a live maps estimate for your own address.
 */
export const AREA_PRESETS = [
  { id: "aerocity", label: "Aerocity / Mahipalpur", driveMinutes: 10 },
  { id: "dwarka", label: "Dwarka", driveMinutes: 25 },
  { id: "southdelhi", label: "South Delhi (Hauz Khas, Saket)", driveMinutes: 30 },
  { id: "cp", label: "Connaught Place / Central Delhi", driveMinutes: 35 },
  { id: "gurugram", label: "Gurugram (Cyber City, Golf Course Road)", driveMinutes: 35 },
  { id: "westdelhi", label: "West Delhi (Janakpuri, Rajouri)", driveMinutes: 35 },
  { id: "eastdelhi", label: "East Delhi (Laxmi Nagar, Mayur Vihar)", driveMinutes: 50 },
  { id: "noida", label: "Noida (Sector 18 / Sector 62)", driveMinutes: 55 },
  { id: "faridabad", label: "Faridabad", driveMinutes: 55 },
  { id: "ghaziabad", label: "Ghaziabad", driveMinutes: 65 },
  { id: "custom", label: "Other / enter my own", driveMinutes: null },
];

export const DEFAULTS = {
  departureTime: "08:30",
  journeyId: "international",
  bags: "checked",
  areaId: "southdelhi",
  driveMinutes: 30,
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

  const terminalLeadMinutes = Math.max(processLeadMinutes, checkInLeadMinutes, recommendedLeadMinutes);
  let governedBy = "the airport's published reporting time";
  if (terminalLeadMinutes === processLeadMinutes && processLeadMinutes >= checkInLeadMinutes) {
    governedBy = "your own queue, walking and buffer estimates";
  }
  if (
    terminalLeadMinutes === checkInLeadMinutes &&
    checkInLeadMinutes > processLeadMinutes &&
    checkInLeadMinutes > recommendedLeadMinutes
  ) {
    governedBy = "the bag-drop counter cut-off";
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
  push("Terminal entry check (ticket and photo ID)", TERMINAL_ENTRY_MINUTES);
  push("Check-in and bag drop", checkInQueueMinutes);
  push("Security screening", securityMinutes);
  push("Emigration / passport control", immigrationMinutes);
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
  if (hasBags && checkInLeadMinutes > recommendedLeadMinutes) {
    warnings.push(
      `Bag drop closes ${journey.checkInClosesMinutes} minutes before departure, which is the binding deadline here.`,
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
