/**
 * Departure planning for Frankfurt Airport (FRA / EDDF).
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
  code: "FRA",
  name: "Frankfurt Airport",
  city: "Frankfurt",
  terminals: [
    "Terminal 1 - Lufthansa and Star Alliance, Concourses A, B and Z",
    "Terminal 2 - Concourses D and E, other alliances and carriers",
    "Sky Line train links T1 and T2 in about 10 minutes; Concourse Z sits above B and needs its own passport control",
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

/** Baseline queue times at FRA in normal conditions, before the queue factor. */
export const BASELINE = {
  /** Bag-drop queue in the departure hall. */
  checkInQueueMinutes: 20,
};

/**
 * Frankfurt Airport advises being at the airport about 2 hours before a European
 * flight and 3 hours before an intercontinental one, which is what the two options
 * use. A Schengen departure has no passport control at all, while a non-Schengen
 * departure adds a border check and, for Concourse Z and the far piers, a longer
 * walk. Check-in closing 45 minutes before a European departure and 60 minutes
 * before an intercontinental one, with the gate closing 20 minutes before
 * departure, follow the common Lufthansa rules; other carriers can differ.
 */
export const JOURNEY_TYPES = [
  {
    id: "schengen",
    label: "Schengen (no passport control)",
    recommendedLeadMinutes: 120,
    securityMinutes: 20,
    securityLabel: "Security screening",
    immigrationMinutes: 0,
    immigrationLabel: "Passport control",
    gateWalkMinutes: 20,
    checkInClosesMinutes: 45,
    gateClosesMinutes: 20,
  },
  {
    id: "nonschengen",
    label: "Non-Schengen / intercontinental",
    recommendedLeadMinutes: 180,
    securityMinutes: 22,
    securityLabel: "Security screening",
    immigrationMinutes: 20,
    immigrationLabel: "Passport control (border check)",
    gateWalkMinutes: 28,
    checkInClosesMinutes: 60,
    gateClosesMinutes: 20,
  },
];

/** Multiplier applied to the free-flow drive time. The A3 and A5 autobahn junctions around the airport are the constraint; roadworks and Stau reports matter more than the time of day. */
export const TRAFFIC_LEVELS = [
  { id: "clear", label: "Clear (night / early morning)", multiplier: 1 },
  { id: "typical", label: "Typical daytime", multiplier: 1.15 },
  { id: "heavy", label: "Heavy (rush hour)", multiplier: 1.4 },
  { id: "severe", label: "Severe (Stau, roadworks, snow or ice)", multiplier: 1.8 },
];

/** Multiplier applied to every queue inside the terminal. */
export const QUEUE_LEVELS = [
  { id: "quiet", label: "Quiet terminal", multiplier: 0.7 },
  { id: "typical", label: "Typical", multiplier: 1 },
  { id: "peak", label: "Peak bank (06:00-09:00 morning wave)", multiplier: 1.5 },
];

/**
 * Frankfurt road rush-hour windows, as minutes from midnight. Used only to SUGGEST a
 * traffic level; the driver always overrides it.
 */
export const RUSH_WINDOWS = [
  [420, 570],
  [960, 1140],
];

/**
 * Indicative free-flow (no-traffic) road times to FRA from common starting
 * points. They are starting estimates only - replace the minutes with a live maps
 * estimate for your own address.
 */
export const AREA_PRESETS = [
  { id: "gateway", label: "Gateway Gardens / Airport hotels", driveMinutes: 5 },
  { id: "frankfurtcity", label: "Frankfurt city centre / Hauptbahnhof", driveMinutes: 20 },
  { id: "sachsenhausen", label: "Sachsenhausen / Niederrad", driveMinutes: 18 },
  { id: "mainz", label: "Mainz", driveMinutes: 25 },
  { id: "offenbach", label: "Offenbach / Bad Homburg", driveMinutes: 30 },
  { id: "wiesbaden", label: "Wiesbaden", driveMinutes: 30 },
  { id: "darmstadt", label: "Darmstadt", driveMinutes: 30 },
  { id: "hanau", label: "Hanau / Aschaffenburg", driveMinutes: 40 },
  { id: "heidelberg", label: "Heidelberg / Mannheim", driveMinutes: 60 },
  { id: "custom", label: "Other / enter my own", driveMinutes: null },
];

export const DEFAULTS = {
  departureTime: "10:00",
  journeyId: "nonschengen",
  bags: "checked",
  areaId: "frankfurtcity",
  driveMinutes: 20,
  trafficId: "typical",
  queueId: "typical",
  parkingMinutes: 15,
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
  if (!journey) return { error: "Choose whether the flight stays inside the Schengen area or leaves it." };

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

  // Deadline 2: reach the bag-drop counter before the airline shuts it. Scales
  // with the same terminal-queue congestion used for the gate deadline below,
  // so a busy check-in hall genuinely tightens this cut-off rather than being
  // a fixed constant.
  const checkInLeadMinutes = hasBags
    ? journey.checkInClosesMinutes + TERMINAL_ENTRY_MINUTES + checkInQueueMinutes + COUNTER_JOIN_MARGIN_MINUTES
    : 0;

  // Deadline 3: the airport's published reporting time.
  const recommendedLeadMinutes = journey.recommendedLeadMinutes;

  // Two deadlines can end up governing the plan: your own queue/walk/buffer
  // estimate (the process/gate-closing chain), or the airport's published
  // reporting time. The bag-drop cut-off (checkInLeadMinutes) is folded into
  // the max() below as a floor, but for FRA's published check-in and gate
  // timings it can never independently exceed both of the others at once -
  // the gate-side chain (security + immigration + gate walk + gate closing)
  // always needs more total lead than the earlier check-in cut-off buys on
  // its own, so it never becomes the sole binding deadline. It still matters:
  // raising queueId or turning on bags widens checkInLeadMinutes and can push
  // the process deadline itself higher via checkInQueueMinutes.
  const terminalLeadMinutes = Math.max(processLeadMinutes, checkInLeadMinutes, recommendedLeadMinutes);
  const governedBy =
    terminalLeadMinutes === processLeadMinutes
      ? "your own queue, walking and buffer estimates"
      : "the airport's published reporting time";

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
