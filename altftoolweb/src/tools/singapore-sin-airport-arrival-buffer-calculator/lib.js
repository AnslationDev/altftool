/**
 * Departure planning for Singapore Changi Airport (SIN / WSSS).
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
  code: "SIN",
  name: "Singapore Changi Airport",
  city: "Singapore",
  terminals: [
    "T1, T2, T3 - linked by the Skytrain airside and by Jewel landside",
    "T4 - a separate building reached by road or shuttle bus, not by Skytrain",
    "Several piers screen passengers at the gate itself rather than at a central checkpoint",
  ],
};

/** Minutes in a day, used for wrapping clock arithmetic across midnight. */
export const MINUTES_PER_DAY = 1440;

/** Guard rails so a typo cannot produce a nonsense plan. */
export const MAX_DRIVE_MINUTES = 600;
export const MAX_PARKING_MINUTES = 120;
export const MAX_PERSONAL_BUFFER_MINUTES = 240;

/** Time from the kerb, taxi rank or car park lift to standing in the check-in queue inside the departure hall. */
export const TERMINAL_ENTRY_MINUTES = 5;
export const TERMINAL_ENTRY_LABEL = "Kerb to the check-in hall";

/** Extra slack so you JOIN the bag-drop queue before the counter shuts, not after. */
export const COUNTER_JOIN_MARGIN_MINUTES = 5;

/** Baseline queue times at SIN in normal conditions, before the queue factor. */
export const BASELINE = {
  /** Bag-drop queue in the departure hall. */
  checkInQueueMinutes: 15,
};

/**
 * Every departure from Changi is international. Changi advises passengers to arrive
 * about 3 hours before departure, which is the reporting time used for both options.
 * The difference is where the screening happens: in the piers that screen at the
 * boarding gate you must be at the gate well before departure because the queue is
 * in front of the gate, not at a central checkpoint. Check-in closing 60 minutes
 * before departure and the gate closing 20 minutes before departure follow the
 * common full-service carrier rules at Changi; budget carriers can close earlier.
 */
export const JOURNEY_TYPES = [
  {
    id: "gatescreening",
    label: "Screening at the boarding gate (typical T1 and T3 piers)",
    recommendedLeadMinutes: 180,
    securityMinutes: 18,
    securityLabel: "Security screening at the boarding gate",
    immigrationMinutes: 12,
    immigrationLabel: "Immigration (automated lanes)",
    gateWalkMinutes: 22,
    checkInClosesMinutes: 60,
    gateClosesMinutes: 20,
  },
  {
    id: "centralscreening",
    label: "Central screening after immigration (typical T2 and T4)",
    recommendedLeadMinutes: 180,
    securityMinutes: 18,
    securityLabel: "Central security screening",
    immigrationMinutes: 12,
    immigrationLabel: "Immigration (automated lanes)",
    gateWalkMinutes: 18,
    checkInClosesMinutes: 60,
    gateClosesMinutes: 20,
  },
];

/** Multiplier applied to the free-flow drive time. Expressway congestion pricing keeps Singapore traffic predictable, so the peak factor is low by regional standards. */
export const TRAFFIC_LEVELS = [
  { id: "clear", label: "Clear (night / early morning)", multiplier: 1 },
  { id: "typical", label: "Typical daytime", multiplier: 1.1 },
  { id: "heavy", label: "Heavy (rush hour)", multiplier: 1.3 },
  { id: "severe", label: "Severe (heavy rain, expressway accident)", multiplier: 1.6 },
];

/** Multiplier applied to every queue inside the terminal. */
export const QUEUE_LEVELS = [
  { id: "quiet", label: "Quiet terminal", multiplier: 0.7 },
  { id: "typical", label: "Typical", multiplier: 1 },
  { id: "peak", label: "Peak bank (morning and late-evening departure waves)", multiplier: 1.5 },
];

/**
 * Singapore road rush-hour windows, as minutes from midnight. Used only to SUGGEST a
 * traffic level; the driver always overrides it.
 */
export const RUSH_WINDOWS = [
  [450, 570],
  [1050, 1170],
];

/**
 * Indicative free-flow (no-traffic) road times to SIN from common starting
 * points. They are starting estimates only - replace the minutes with a live maps
 * estimate for your own address.
 */
export const AREA_PRESETS = [
  { id: "changibp", label: "Changi Business Park / Simei", driveMinutes: 10 },
  { id: "tampines", label: "Tampines / Pasir Ris", driveMinutes: 15 },
  { id: "bedok", label: "Bedok / Katong", driveMinutes: 18 },
  { id: "marinabay", label: "Marina Bay / CBD / Raffles Place", driveMinutes: 25 },
  { id: "orchard", label: "Orchard Road / Novena", driveMinutes: 25 },
  { id: "sentosa", label: "HarbourFront / Sentosa", driveMinutes: 28 },
  { id: "woodlands", label: "Woodlands / Yishun", driveMinutes: 35 },
  { id: "jurong", label: "Jurong East / Clementi", driveMinutes: 35 },
  { id: "tuas", label: "Tuas / Boon Lay", driveMinutes: 40 },
  { id: "johor", label: "Johor Bahru (via Woodlands checkpoint)", driveMinutes: 75 },
  { id: "custom", label: "Other / enter my own", driveMinutes: null },
];

export const DEFAULTS = {
  departureTime: "09:30",
  journeyId: "gatescreening",
  bags: "checked",
  areaId: "marinabay",
  driveMinutes: 25,
  trafficId: "typical",
  queueId: "typical",
  parkingMinutes: 12,
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
  if (!journey) return { error: "Choose which screening layout your departure gate uses." };

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
