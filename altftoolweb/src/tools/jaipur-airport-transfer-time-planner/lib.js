/**
 * Departure-time planner for Jaipur International Airport (JAI).
 *
 * The problem is a backward schedule with one awkward property: how long the
 * drive takes depends on when you leave, and when you should leave depends on
 * how long the drive takes. This module solves it by simulating the drive
 * forward through an hour-of-day traffic profile and then scanning backwards
 * for the LATEST departure minute whose simulated arrival still lands on or
 * before the target. That is exact, deterministic and never optimistic.
 *
 * Three separate deadlines are modelled, because missing any one of them means
 * missing the flight:
 *   1. Check-in / bag drop closes a fixed number of minutes before departure.
 *   2. The boarding gate closes a fixed number of minutes before departure.
 *      To make it you must also have cleared entry, security and (on an
 *      international flight) emigration, and walked to the gate.
 *   3. The airline's own "be at the airport by" advice — 2 hours domestic and
 *      3 hours international is the figure published across Indian carriers.
 *
 * Every clock value is an integer number of minutes from midnight on the day of
 * the flight. Values below zero mean the previous calendar day. Nothing here
 * reads the system clock: the flight time is an argument, so the same input
 * always produces the same output.
 */

export const MINUTES_PER_DAY = 1440;
export const MINUTES_PER_HOUR = 60;

export const AIRPORT = {
  iata: "JAI",
  name: "Jaipur International Airport",
  locality: "Sanganer, on the southern edge of Jaipur",
  terminalNote:
    "Terminal 2 handles both domestic and international departures, so the walk from kerb to gate is short by big-city standards.",
};

/**
 * Web check-in on Indian carriers opens 48 hours before scheduled departure and
 * generally closes an hour before it.
 */
export const WEB_CHECK_IN_OPENS_HOURS = 48;

/**
 * Journey types. The cutoffs are the values Indian carriers publish for a
 * non-metro station like Jaipur; the tool lets you override the advisory
 * arrival figure because airlines differ by an odd 15 minutes here and there.
 *
 *  - checkInCloseMin: counters and bag drop shut this long before departure.
 *  - gateCloseMin: the gate shuts this long before departure. Being airside is
 *    not enough; you have to be at the gate.
 *  - boardingStartsMin: typical start of boarding, useful as a sanity marker.
 *  - advisedArrivalMin: the airline's "reach the airport by" advice.
 *  - securityMin / immigrationMin: base queue time at JAI, before the peak
 *    multiplier below is applied.
 */
export const JOURNEY_TYPES = [
  {
    id: "domestic",
    label: "Domestic flight",
    checkInCloseMin: 45,
    gateCloseMin: 25,
    boardingStartsMin: 40,
    advisedArrivalMin: 120,
    securityMin: 15,
    immigrationMin: 0,
    note: "Counters typically close 45 minutes before departure and the gate 25 minutes before.",
  },
  {
    id: "international",
    label: "International flight",
    checkInCloseMin: 60,
    gateCloseMin: 25,
    boardingStartsMin: 60,
    advisedArrivalMin: 180,
    securityMin: 20,
    immigrationMin: 25,
    note: "Counters typically close 60 minutes before departure, and emigration has to be cleared as well as security.",
  },
];

/** Fixed terminal-side times at JAI, in minutes. */
export const TERMINAL_ENTRY_MIN = 6; // CISF ticket and ID check at the terminal door
export const BAG_DROP_MIN = 18; // queueing at a counter to hand over a checked bag
export const COUNTER_CHECK_IN_MIN = 14; // extra if you did not web check in
export const GATE_WALK_MIN = 10; // JAI T2 is compact; kerb-to-gate walk after security
export const SELF_BAG_TAG_SAVING_MIN = 6; // printing your own tag before the drop queue

export const MIN_CONTINGENCY_MIN = 0;
export const MAX_CONTINGENCY_MIN = 180;
export const DEFAULT_CONTINGENCY_MIN = 20;

/** Refuse to plan a departure more than this far ahead — the input is wrong. */
export const MAX_LEAD_MINUTES = 20 * MINUTES_PER_HOUR;

/** Upper bound on the backward scan, in minutes. */
const MAX_DRIVE_MINUTES = 720;

/**
 * Pickup zones and their road distance to the terminal, in kilometres, with the
 * free-flowing speed the road realistically supports. Walled-city lanes never
 * run fast even at 3 a.m.; the Tonk Road and Ring Road corridors do.
 */
export const PICKUP_ZONES = [
  {
    id: "sanganer",
    label: "Sanganer / Pratap Nagar",
    km: 6,
    openSpeedKmph: 28,
    note: "The airport's own neighbourhood — short but through congested market roads.",
  },
  {
    id: "sitapura",
    label: "Sitapura industrial area / Tonk Road south",
    km: 8,
    openSpeedKmph: 34,
    note: "Straight run up Tonk Road with few turns.",
  },
  {
    id: "malviya-nagar",
    label: "Malviya Nagar / JLN Marg",
    km: 8,
    openSpeedKmph: 30,
    note: "JLN Marg is wide but signal-heavy near the hospitals.",
  },
  {
    id: "durgapura",
    label: "Durgapura / Gopalpura Bypass",
    km: 9,
    openSpeedKmph: 30,
    note: "The Gopalpura and Tonk Road junctions are the slow points.",
  },
  {
    id: "jagatpura",
    label: "Jagatpura / Malviya Industrial Area",
    km: 10,
    openSpeedKmph: 30,
    note: "Ring Road access makes this quicker than the distance suggests.",
  },
  {
    id: "mansarovar",
    label: "Mansarovar / New Sanganer Road",
    km: 12,
    openSpeedKmph: 28,
    note: "Cross-town rather than radial, so it slows in both peaks.",
  },
  {
    id: "railway-station",
    label: "Jaipur Junction / Sindhi Camp bus stand",
    km: 12,
    openSpeedKmph: 24,
    note: "Station approach roads are the bottleneck, not the distance.",
  },
  {
    id: "mi-road",
    label: "MI Road / C-Scheme / Ashok Nagar",
    km: 13,
    openSpeedKmph: 24,
    note: "Central Jaipur, where evening traffic bites hardest.",
  },
  {
    id: "walled-city",
    label: "Walled City — Hawa Mahal, Johari Bazaar, Badi Chaupar",
    km: 14,
    openSpeedKmph: 18,
    note: "Bazaar lanes are slow at any hour and can be closed for processions.",
  },
  {
    id: "vaishali",
    label: "Vaishali Nagar / Nirman Nagar",
    km: 16,
    openSpeedKmph: 26,
    note: "Diagonally across the city from the airport.",
  },
  {
    id: "ajmer-road",
    label: "Ajmer Road / Bhankrota / 200-ft bypass",
    km: 19,
    openSpeedKmph: 34,
    note: "Mostly bypass, so it holds its speed better than the inner roads.",
  },
  {
    id: "jhotwara",
    label: "Jhotwara / Sikar Road",
    km: 20,
    openSpeedKmph: 24,
    note: "North-west corner of the city, with level crossings on some routes.",
  },
  {
    id: "amer",
    label: "Amer Fort / Jal Mahal / Delhi Road",
    km: 23,
    openSpeedKmph: 32,
    note: "Fine on the bypass, painful if the route goes through the walled city.",
  },
  {
    id: "kukas",
    label: "Kukas / Delhi Road resorts",
    km: 31,
    openSpeedKmph: 40,
    note: "Highway most of the way, but it is a genuinely long transfer.",
  },
];

/**
 * Multiplier applied to the free-flowing speed, indexed by hour of day (0-23).
 * Jaipur's two clear peaks are the late-morning office and school build-up
 * around 09:00-11:00 and the long evening peak from about 17:30 to 20:30.
 * Nights are quicker than the nominal open speed because the signals are on
 * blinker and the bazaars are shut.
 */
export const TRAFFIC_BY_HOUR = [
  1.3, 1.3, 1.3, 1.3, 1.3, 1.25, // 00:00-05:59 empty roads
  1.1, 0.95, 0.82, // 06:00-08:59 school run builds
  0.7, 0.7, 0.78, // 09:00-11:59 late-morning peak
  0.85, 0.82, 0.8, // 12:00-14:59 lunch and school pickup
  0.85, 0.85, 0.78, // 15:00-17:59 evening build-up
  0.62, 0.6, 0.65, // 18:00-20:59 evening peak
  0.82, 0.95, 1.25, // 21:00-23:59 clearing
];

export const PEAK_WINDOWS = [
  { label: "Late-morning peak", from: "09:00", to: "12:00" },
  { label: "Evening peak", from: "17:30", to: "20:30" },
];

/**
 * Modes of getting there. speedFactor scales the road speed; waitMin is the
 * time lost before the wheels move; kerbMin is the time from arriving at the
 * airport to standing inside the terminal door.
 */
export const TRANSPORT_MODES = [
  {
    id: "app-cab",
    label: "App cab (Uber, Ola, Rapido)",
    shortLabel: "cab",
    speedFactor: 1,
    waitMin: 9,
    kerbMin: 3,
    note: "Allocation plus the driver's own approach. Book earlier in the evening peak, when cancellations are common.",
  },
  {
    id: "own-car",
    label: "Own car, parking at the airport",
    shortLabel: "car",
    speedFactor: 1,
    waitMin: 5,
    kerbMin: 9,
    note: "Includes finding a bay in the car park and walking in with bags.",
  },
  {
    id: "hotel-car",
    label: "Hotel car or pre-booked taxi",
    shortLabel: "hotel car",
    speedFactor: 1,
    waitMin: 5,
    kerbMin: 3,
    note: "The most predictable option for an early-morning flight.",
  },
  {
    id: "auto",
    label: "Auto-rickshaw",
    shortLabel: "auto",
    speedFactor: 0.86,
    waitMin: 7,
    kerbMin: 7,
    note: "Cruises slower than a car and is dropped short of the terminal forecourt, so allow a walk with bags.",
  },
  {
    id: "bus",
    label: "City bus (JCTSL low-floor)",
    shortLabel: "bus",
    speedFactor: 0.62,
    waitMin: 16,
    kerbMin: 8,
    note: "Cheapest and slowest. The wait allows for half the service headway plus the walk to the stop.",
  },
];

/**
 * Road conditions that change the whole run rather than one junction.
 * Jaipur's wedding season and the Teej and Gangaur processions genuinely close
 * roads in and around the walled city, which is why they are here.
 */
export const ROAD_CONDITIONS = [
  { id: "clear", label: "Normal day", factor: 1, note: "Ordinary weekday or weekend traffic." },
  {
    id: "rain",
    label: "Rain",
    factor: 0.82,
    note: "Monsoon showers between late June and mid-September slow everything by roughly a fifth.",
  },
  {
    id: "waterlogging",
    label: "Heavy rain with waterlogging",
    factor: 0.62,
    note: "Underpasses and the Tonk Road drains back up; some routes close entirely.",
  },
  {
    id: "event",
    label: "Procession, wedding season or a big event",
    factor: 0.72,
    note: "Teej and Gangaur processions, Diwali shopping and the November-to-February wedding evenings all close or choke central roads.",
  },
  {
    id: "fog",
    label: "Winter fog",
    factor: 0.7,
    note: "Late-December and January mornings. Fog also delays the inbound aircraft, so check the flight status before leaving.",
  },
];

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);

/** Parse "HH:MM" (24-hour) into minutes from midnight, or null if malformed. */
export function parseHhmm(text) {
  if (typeof text !== "string") return null;
  const match = /^(\d{1,2}):(\d{2})$/.exec(text.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return null;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * MINUTES_PER_HOUR + minutes;
}

/** Wrap any minute value into 0-1439. */
export function wrapMinute(minute) {
  if (!isFiniteNumber(minute)) return 0;
  const wrapped = Math.round(minute) % MINUTES_PER_DAY;
  return wrapped < 0 ? wrapped + MINUTES_PER_DAY : wrapped;
}

/** Whole days a minute value sits before (negative) or after the flight day. */
export function dayOffset(minute) {
  if (!isFiniteNumber(minute)) return 0;
  return Math.floor(Math.round(minute) / MINUTES_PER_DAY);
}

/** Format a minute value as "HH:MM", ignoring which day it falls on. */
export function formatHhmm(minute) {
  const wrapped = wrapMinute(minute);
  const hours = Math.floor(wrapped / MINUTES_PER_HOUR);
  const minutes = wrapped % MINUTES_PER_HOUR;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/** Format a minute count as "2 h 05 m". */
export function formatDuration(totalMinutes) {
  if (!isFiniteNumber(totalMinutes)) return "—";
  const sign = totalMinutes < 0 ? "-" : "";
  const value = Math.abs(Math.round(totalMinutes));
  const hours = Math.floor(value / MINUTES_PER_HOUR);
  const minutes = value % MINUTES_PER_HOUR;
  if (hours === 0) return `${sign}${minutes} min`;
  return `${sign}${hours} h ${String(minutes).padStart(2, "0")} m`;
}

/** Effective road speed in km/h at a given minute of the day. */
export function speedAtMinute(minute, openSpeedKmph, modeFactor, conditionFactor) {
  const hour = Math.floor(wrapMinute(minute) / MINUTES_PER_HOUR);
  const traffic = TRAFFIC_BY_HOUR[hour];
  const speed = openSpeedKmph * traffic * modeFactor * conditionFactor;
  // Even a jam crawls: floor the speed so the simulation always terminates.
  return Math.max(4, speed);
}

/**
 * Simulate the drive forward in one-minute steps and return whole minutes.
 * Stepping minute by minute is what lets the model charge you the peak rate
 * only for the part of the journey that actually falls inside the peak.
 */
export function simulateDriveMinutes(departMinute, km, openSpeedKmph, modeFactor, conditionFactor) {
  if (!(km > 0)) return 0;
  let remaining = km;
  let elapsed = 0;
  // Tolerance so that a distance covered in an exact number of minutes is not
  // pushed to an extra minute by binary floating-point residue.
  const EPSILON_KM = 1e-9;
  while (remaining > EPSILON_KM && elapsed < MAX_DRIVE_MINUTES) {
    const speed = speedAtMinute(departMinute + elapsed, openSpeedKmph, modeFactor, conditionFactor);
    remaining -= speed / MINUTES_PER_HOUR;
    elapsed += 1;
  }
  return elapsed;
}

/**
 * Latest whole minute you can pull away and still be at the airport kerb by
 * arriveByMinute. Scans backwards one minute at a time, so the answer is the
 * true latest feasible departure rather than the output of a fixed-point guess.
 */
export function latestDeparture(arriveByMinute, km, openSpeedKmph, modeFactor, conditionFactor) {
  for (let offset = 0; offset <= MAX_DRIVE_MINUTES; offset += 1) {
    const candidate = arriveByMinute - offset;
    const drive = simulateDriveMinutes(candidate, km, openSpeedKmph, modeFactor, conditionFactor);
    if (candidate + drive <= arriveByMinute) {
      return { departMinute: candidate, driveMinutes: drive };
    }
  }
  return {
    departMinute: arriveByMinute - MAX_DRIVE_MINUTES,
    driveMinutes: MAX_DRIVE_MINUTES,
  };
}

/** Human label for the traffic band a minute falls into. */
export function trafficBandLabel(minute) {
  const factor = TRAFFIC_BY_HOUR[Math.floor(wrapMinute(minute) / MINUTES_PER_HOUR)];
  if (factor >= 1.2) return "Empty roads";
  if (factor >= 1) return "Light traffic";
  if (factor >= 0.8) return "Moderate traffic";
  if (factor >= 0.7) return "Heavy traffic";
  return "Peak-hour crawl";
}

/**
 * Build the full backward schedule for a departure from Jaipur.
 *
 * @param {object} input
 * @param {string} input.flightTime scheduled departure as "HH:MM", 24-hour
 * @param {string} input.journeyTypeId "domestic" or "international"
 * @param {string} input.zoneId a PICKUP_ZONES id
 * @param {string} input.modeId a TRANSPORT_MODES id
 * @param {string} input.conditionId a ROAD_CONDITIONS id
 * @param {boolean} input.checkedBag whether a bag has to be dropped at a counter
 * @param {boolean} input.webCheckedIn whether you already hold a boarding pass
 * @param {number} input.contingencyMin personal buffer in minutes
 * @returns {object} the plan, or { error }
 */
export function planAirportTransfer({
  flightTime = "",
  journeyTypeId = "domestic",
  zoneId = "mi-road",
  modeId = "app-cab",
  conditionId = "clear",
  checkedBag = true,
  webCheckedIn = true,
  contingencyMin = DEFAULT_CONTINGENCY_MIN,
} = {}) {
  const flightMinute = parseHhmm(flightTime);
  if (flightMinute === null) {
    return { error: "Enter the scheduled departure time as a 24-hour clock time, such as 06:20." };
  }
  const journey = JOURNEY_TYPES.find((entry) => entry.id === journeyTypeId);
  if (!journey) return { error: "Choose a domestic or an international flight." };
  const zone = PICKUP_ZONES.find((entry) => entry.id === zoneId);
  if (!zone) return { error: "Choose where in Jaipur you are starting from." };
  const mode = TRANSPORT_MODES.find((entry) => entry.id === modeId);
  if (!mode) return { error: "Choose how you are getting to the airport." };
  const condition = ROAD_CONDITIONS.find((entry) => entry.id === conditionId);
  if (!condition) return { error: "Choose the road conditions you expect." };
  if (
    !isFiniteNumber(contingencyMin) ||
    contingencyMin < MIN_CONTINGENCY_MIN ||
    contingencyMin > MAX_CONTINGENCY_MIN
  ) {
    return {
      error: `Your personal buffer must be between ${MIN_CONTINGENCY_MIN} and ${MAX_CONTINGENCY_MIN} minutes.`,
    };
  }

  // --- Terminal-side processing, in the order you actually do it ---
  const steps = [{ id: "entry", label: "Terminal entry and ID check", minutes: TERMINAL_ENTRY_MIN }];
  if (!webCheckedIn) {
    steps.push({
      id: "checkin",
      label: "Check in at the counter",
      minutes: COUNTER_CHECK_IN_MIN,
    });
  }
  if (checkedBag) {
    steps.push({
      id: "bags",
      label: webCheckedIn ? "Self bag tag and bag drop" : "Bag drop",
      minutes: webCheckedIn ? BAG_DROP_MIN - SELF_BAG_TAG_SAVING_MIN : BAG_DROP_MIN,
    });
  }
  if (journey.immigrationMin > 0) {
    steps.push({
      id: "emigration",
      label: "Emigration counters",
      minutes: journey.immigrationMin,
    });
  }
  steps.push({ id: "security", label: "Security screening", minutes: journey.securityMin });
  steps.push({ id: "walk", label: "Walk to the gate", minutes: GATE_WALK_MIN });

  const processingMin = steps.reduce((total, step) => total + step.minutes, 0);

  // --- The three deadlines, expressed as "be at the kerb by" times ---
  const checkInClosesAt = flightMinute - journey.checkInCloseMin;
  const gateClosesAt = flightMinute - journey.gateCloseMin;
  const boardingStartsAt = flightMinute - journey.boardingStartsMin;

  const kerbForCheckIn = checkedBag || !webCheckedIn ? checkInClosesAt - TERMINAL_ENTRY_MIN : null;
  const kerbForGate = gateClosesAt - processingMin;
  const kerbForAdvice = flightMinute - journey.advisedArrivalMin;

  const kerbDeadlines = [
    kerbForCheckIn === null
      ? null
      : {
          id: "check-in",
          label: "Check-in and bag drop close",
          kerbMinute: kerbForCheckIn,
          deadlineMinute: checkInClosesAt,
        },
    {
      id: "gate",
      label: "Boarding gate closes",
      kerbMinute: kerbForGate,
      deadlineMinute: gateClosesAt,
    },
  ].filter(Boolean);

  // The hard deadline: miss check-in or the gate and you miss the flight, no
  // matter what the airline's advisory arrival time said.
  const hardDeadline = kerbDeadlines.reduce((tightest, entry) =>
    entry.kerbMinute < tightest.kerbMinute ? entry : tightest,
  );

  const adviceDeadline = {
    id: "advice",
    label: "Airline arrival advice",
    kerbMinute: kerbForAdvice,
    deadlineMinute: flightMinute,
  };

  // The plan targets whichever is tightest overall — the hard deadline or the
  // airline's arrival advice — and that is what gets reported as the binding
  // cutoff, instead of always blaming the hard deadline even on the (typical)
  // occasions when the advice is actually what decided the departure time.
  // Your own buffer is then taken off the top of that.
  const bindingDeadline =
    adviceDeadline.kerbMinute < hardDeadline.kerbMinute ? adviceDeadline : hardDeadline;
  const targetKerbMinute = bindingDeadline.kerbMinute - contingencyMin;

  const drive = latestDeparture(
    targetKerbMinute - mode.kerbMin,
    zone.km,
    zone.openSpeedKmph,
    mode.speedFactor,
    condition.factor,
  );
  const leaveMinute = drive.departMinute - mode.waitMin;
  const kerbMinute = drive.departMinute + drive.driveMinutes + mode.kerbMin;

  // The last moment you could set off and still, in theory, make the flight.
  const lastChance = latestDeparture(
    hardDeadline.kerbMinute - mode.kerbMin,
    zone.km,
    zone.openSpeedKmph,
    mode.speedFactor,
    condition.factor,
  );
  const lastChanceLeaveMinute = lastChance.departMinute - mode.waitMin;

  const leadMinutes = flightMinute - leaveMinute;
  if (leadMinutes > MAX_LEAD_MINUTES) {
    return {
      error:
        "That combination needs more than 20 hours of lead time. Check the flight time, the pickup point and the road conditions.",
    };
  }

  const averageSpeedKmph =
    drive.driveMinutes > 0
      ? Math.round((zone.km / drive.driveMinutes) * MINUTES_PER_HOUR * 10) / 10
      : 0;

  const timeline = [
    {
      id: "leave",
      minute: leaveMinute,
      label: mode.id === "own-car" ? "Set off" : `Book or call the ${mode.shortLabel}`,
      detail:
        mode.waitMin > 0
          ? `Allow ${mode.waitMin} min before the wheels actually move.`
          : "Wheels moving.",
    },
    {
      id: "drive",
      minute: drive.departMinute,
      label: "On the road",
      detail: `${zone.km} km from ${zone.label} — about ${formatDuration(drive.driveMinutes)} in ${trafficBandLabel(drive.departMinute).toLowerCase()}.`,
    },
    {
      id: "kerb",
      minute: kerbMinute,
      label: "Inside the terminal",
      detail: `${formatDuration(flightMinute - kerbMinute)} before the scheduled departure.`,
    },
    ...steps.reduce((rows, step) => {
      const previous = rows.length > 0 ? rows[rows.length - 1].minute : kerbMinute;
      rows.push({
        id: step.id,
        minute: previous + step.minutes,
        label: step.label,
        detail: `Allow ${step.minutes} min.`,
      });
      return rows;
    }, []),
    {
      id: "boarding",
      minute: boardingStartsAt,
      label: "Boarding usually starts",
      detail: `${journey.boardingStartsMin} min before departure on a ${journey.label.toLowerCase()}.`,
    },
    {
      id: "gate-close",
      minute: gateClosesAt,
      label: "Gate closes",
      detail: `${journey.gateCloseMin} min before departure. Nothing gets you on board after this.`,
    },
    { id: "flight", minute: flightMinute, label: "Scheduled departure", detail: "Doors shut." },
  ].sort((a, b) => a.minute - b.minute);

  const atGateMinute = kerbMinute + processingMin;
  const gateSlackMin = gateClosesAt - atGateMinute;
  const checkInSlackMin =
    kerbForCheckIn === null ? null : checkInClosesAt - (kerbMinute + TERMINAL_ENTRY_MIN);

  const warnings = [];
  if (dayOffset(leaveMinute) < 0) {
    warnings.push(
      "You need to set off the day before the flight. Treat the departure time as belonging to the previous calendar date.",
    );
  }
  if (bindingDeadline.kerbMinute < kerbForAdvice) {
    warnings.push(
      `The ${bindingDeadline.label.toLowerCase()} cutoff is tighter than the airline's ${formatDuration(journey.advisedArrivalMin)} arrival advice, so the plan works back from the cutoff instead.`,
    );
  }
  if (drive.driveMinutes > 0 && averageSpeedKmph < 16) {
    warnings.push(
      `The model averages only ${averageSpeedKmph} km/h on this run. If anything at all goes wrong you will not recover the time.`,
    );
  }
  if (mode.id === "bus") {
    warnings.push(
      "The bus has no allowance for a service that does not turn up. For a first flight of the day, do not rely on it.",
    );
  }
  if (!webCheckedIn) {
    warnings.push(
      `Web check-in opens ${WEB_CHECK_IN_OPENS_HOURS} hours before departure. Using it removes about ${COUNTER_CHECK_IN_MIN} minutes of counter queueing from this plan.`,
    );
  }
  if (condition.id === "fog") {
    warnings.push(
      "Winter fog delays inbound aircraft as well as the drive. Check the flight status before you leave, but leave on time anyway — a delayed flight can still depart close to schedule.",
    );
  }
  if (wrapMinute(flightMinute) < 8 * MINUTES_PER_HOUR) {
    warnings.push(
      "Early-morning departures are the busiest bank at JAI. Counters and security queues are longest between 04:00 and 07:00.",
    );
  }
  warnings.push(
    "The Jaipur Metro does not serve the airport, so there is no rail option — every route here is by road.",
  );

  return {
    flightMinute,
    journey,
    zone,
    mode,
    condition,
    checkedBag,
    webCheckedIn,
    contingencyMin,

    leaveMinute,
    leaveDayOffset: dayOffset(leaveMinute),
    lastChanceLeaveMinute,
    kerbMinute,
    driveMinutes: drive.driveMinutes,
    waitMinutes: mode.waitMin,
    kerbWalkMinutes: mode.kerbMin,
    distanceKm: zone.km,
    averageSpeedKmph,
    trafficBand: trafficBandLabel(drive.departMinute),

    processingMin,
    steps,
    timeline,

    checkInClosesAt,
    gateClosesAt,
    boardingStartsAt,
    bindingDeadlineLabel: bindingDeadline.label,
    atGateMinute,
    gateSlackMin,
    checkInSlackMin,
    marginOverLastChanceMin: lastChanceLeaveMinute - leaveMinute,

    leadMinutes,
    webCheckInOpensAt: flightMinute - WEB_CHECK_IN_OPENS_HOURS * MINUTES_PER_HOUR,
    warnings,
  };
}
