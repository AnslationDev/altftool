/**
 * Departure-time planner for Cochin International Airport (COK), Nedumbassery.
 *
 * Kochi differs from most Indian airport runs in two ways that this model has
 * to respect:
 *
 *   1. The airport is genuinely far out. It sits at Nedumbassery on NH 544,
 *      roughly 28-30 km from Ernakulam and over 40 km from Fort Kochi, so the
 *      transfer is a highway journey with a city crawl bolted onto one end.
 *   2. Part of the journey can be taken off the road entirely. Kochi Metro
 *      Line 1 runs Aluva to Tripunithura, and Aluva is only about 10 km from
 *      the terminal. A metro leg is immune to road traffic, so it is modelled
 *      as fixed minutes rather than as distance at a traffic-dependent speed.
 *
 * The drive itself is simulated forward in one-minute steps through an
 * hour-of-day traffic profile, then the departure is found by scanning
 * backwards for the LATEST minute whose simulated arrival still lands on or
 * before the target. That is exact rather than an averaged guess, and it never
 * flatters the answer.
 *
 * Clock values are integer minutes from midnight on the day of the flight;
 * negatives mean the previous calendar day. The flight time is an argument, so
 * the same input always gives the same output.
 */

export const MINUTES_PER_DAY = 1440;
export const MINUTES_PER_HOUR = 60;

export const AIRPORT = {
  iata: "COK",
  name: "Cochin International Airport",
  locality: "Nedumbassery, on NH 544 north-east of Ernakulam",
  terminalNote:
    "Terminal 1 handles domestic departures and Terminal 3 international ones, and T3 is much the bigger walk.",
};

/** Web check-in on Indian carriers opens 48 hours before scheduled departure. */
export const WEB_CHECK_IN_OPENS_HOURS = 48;

/** Road distance from Aluva, where the metro line ends, to the terminal. */
export const ALUVA_TO_AIRPORT_KM = 10;
export const ALUVA_ROAD_OPEN_SPEED_KMPH = 34;

/**
 * Kochi Metro Line 1 runs roughly 06:00 to 22:00. Treat these as indicative:
 * KMRL adjusts first and last services, and runs later on some occasions.
 */
export const METRO_FIRST_TRAIN_MIN = 6 * MINUTES_PER_HOUR;
export const METRO_LAST_TRAIN_MIN = 22 * MINUTES_PER_HOUR;

/** Changing from the metro at Aluva to a feeder bus, auto or taxi. */
export const ALUVA_INTERCHANGE_MIN = 9;

export const JOURNEY_TYPES = [
  {
    id: "domestic",
    label: "Domestic flight — Terminal 1",
    checkInCloseMin: 45,
    gateCloseMin: 25,
    boardingStartsMin: 40,
    advisedArrivalMin: 120,
    securityMin: 15,
    immigrationMin: 0,
    gateWalkMin: 10,
    note: "Counters typically close 45 minutes before departure and the gate 25 minutes before.",
  },
  {
    id: "international",
    label: "International flight — Terminal 3",
    checkInCloseMin: 60,
    gateCloseMin: 25,
    boardingStartsMin: 60,
    advisedArrivalMin: 180,
    securityMin: 20,
    immigrationMin: 30,
    gateWalkMin: 15,
    note: "Counters typically close 60 minutes before departure, and COK's Gulf departures produce the longest emigration queues of the day.",
  },
];

/** Fixed terminal-side times at COK, in minutes. */
export const TERMINAL_ENTRY_MIN = 6; // CISF ticket and ID check at the terminal door
export const BAG_DROP_MIN = 20; // counter bag drop; COK's international banks run long
export const COUNTER_CHECK_IN_MIN = 15; // extra if you did not web check in
export const SELF_BAG_TAG_SAVING_MIN = 6; // printing your own tag before the drop queue

export const MIN_CONTINGENCY_MIN = 0;
export const MAX_CONTINGENCY_MIN = 180;
export const DEFAULT_CONTINGENCY_MIN = 25;

/** Refuse to plan a departure more than this far ahead — the input is wrong. */
export const MAX_LEAD_MINUTES = 20 * MINUTES_PER_HOUR;

/** Upper bound on the backward scan, in minutes. */
const MAX_DRIVE_MINUTES = 720;

/**
 * Pickup zones, their road distance to the terminal, the free-flowing speed the
 * route realistically supports, and — where the point is on Kochi Metro Line 1
 * — the running time to Aluva. metroToAluvaMin is null where no metro station
 * serves the area; Kakkanad and Infopark are the notable gap.
 */
export const PICKUP_ZONES = [
  {
    id: "athani",
    label: "Athani / Nedumbassery",
    km: 3,
    openSpeedKmph: 30,
    metroToAluvaMin: null,
    note: "The airport's own village. Minutes away, but the approach road backs up at bank times.",
  },
  {
    id: "chengamanad",
    label: "Chengamanad / Karukutty",
    km: 6,
    openSpeedKmph: 34,
    metroToAluvaMin: null,
    note: "Short hop on local roads rather than the highway.",
  },
  {
    id: "angamaly",
    label: "Angamaly",
    km: 9,
    openSpeedKmph: 38,
    metroToAluvaMin: null,
    note: "Straight down NH 544, and the nearest railway station to the airport.",
  },
  {
    id: "aluva",
    label: "Aluva",
    km: 10,
    openSpeedKmph: 34,
    metroToAluvaMin: 0,
    note: "The metro terminus and the usual transfer point for anyone coming up the line.",
  },
  {
    id: "kalamassery",
    label: "Kalamassery / HMT Colony",
    km: 18,
    openSpeedKmph: 40,
    metroToAluvaMin: 12,
    note: "On the highway and on the metro, so both options work well from here.",
  },
  {
    id: "edappally",
    label: "Edappally / Lulu Mall",
    km: 22,
    openSpeedKmph: 40,
    metroToAluvaMin: 18,
    note: "Edappally junction is the single worst pinch point on the drive out.",
  },
  {
    id: "palarivattom",
    label: "Palarivattom",
    km: 23,
    openSpeedKmph: 38,
    metroToAluvaMin: 23,
    note: "Feeds into the same Edappally bottleneck.",
  },
  {
    id: "kakkanad",
    label: "Kakkanad / Infopark / Smart City",
    km: 24,
    openSpeedKmph: 36,
    metroToAluvaMin: null,
    note: "Kochi Metro Line 1 does not reach Kakkanad, so this is a road-only journey.",
  },
  {
    id: "marine-drive",
    label: "Marine Drive / Ernakulam North",
    km: 28,
    openSpeedKmph: 36,
    metroToAluvaMin: 30,
    note: "City centre, and the point most hotel transfers start from.",
  },
  {
    id: "mg-road",
    label: "MG Road / Ernakulam South",
    km: 30,
    openSpeedKmph: 35,
    metroToAluvaMin: 33,
    note: "Ernakulam Junction railway station is here, with a metro station alongside.",
  },
  {
    id: "vyttila",
    label: "Vyttila / Mobility Hub",
    km: 32,
    openSpeedKmph: 35,
    metroToAluvaMin: 40,
    note: "Vyttila junction is Kerala's busiest, and the long way round the city.",
  },
  {
    id: "willingdon-island",
    label: "Willingdon Island / Cochin Port",
    km: 33,
    openSpeedKmph: 32,
    metroToAluvaMin: null,
    note: "Bridge-bound, so a single blockage on the causeway costs real time.",
  },
  {
    id: "thrippunithura",
    label: "Thrippunithura / SN Junction",
    km: 36,
    openSpeedKmph: 34,
    metroToAluvaMin: 47,
    note: "The far end of the metro line, and the far end of the drive.",
  },
  {
    id: "kumbalam",
    label: "Kumbalam / Aroor / NH 66 south",
    km: 40,
    openSpeedKmph: 36,
    metroToAluvaMin: null,
    note: "Comes through the city or round the bypass; neither is quick in the evening.",
  },
  {
    id: "fort-kochi",
    label: "Fort Kochi / Mattancherry",
    km: 42,
    openSpeedKmph: 30,
    metroToAluvaMin: null,
    note: "The longest common transfer in the city. Treat it as an hour and a half in daylight.",
  },
  {
    id: "cherai",
    label: "Cherai / Munambam",
    km: 27,
    openSpeedKmph: 30,
    metroToAluvaMin: null,
    note: "Backwater roads are narrow, so the distance understates the time.",
  },
  {
    id: "perumbavoor",
    label: "Perumbavoor",
    km: 25,
    openSpeedKmph: 34,
    metroToAluvaMin: null,
    note: "Comes in from the east on state roads rather than the national highway.",
  },
];

/**
 * Multiplier applied to the free-flowing speed, indexed by hour of day (0-23).
 * Kochi's morning peak is early and sharp — Kerala's offices and schools open
 * between 08:30 and 09:30 — and the evening peak runs from about 17:00 to
 * 20:00. NH 544 flows freely overnight, which is why the small hours run above
 * the nominal open speed.
 */
export const TRAFFIC_BY_HOUR = [
  1.25, 1.25, 1.25, 1.25, 1.25, 1.2, // 00:00-05:59 clear highway
  1.1, 0.9, 0.72, // 06:00-08:59 sharp morning build-up
  0.68, 0.8, 0.88, // 09:00-11:59 morning peak then easing
  0.88, 0.85, 0.85, // 12:00-14:59 midday
  0.85, 0.8, 0.68, // 15:00-17:59 evening build-up
  0.62, 0.65, 0.8, // 18:00-20:59 evening peak
  0.95, 1.15, 1.25, // 21:00-23:59 clearing
];

export const PEAK_WINDOWS = [
  { label: "Morning peak", from: "08:00", to: "10:30" },
  { label: "Evening peak", from: "17:00", to: "20:00" },
];

export const BOTTLENECKS = [
  "Edappally junction, where NH 66 and NH 544 meet",
  "Vyttila junction, the busiest in Kerala",
  "The Aluva bypass and Marthanda Varma bridge over the Periyar",
  "Angamaly town, where the highway service roads narrow",
];

/**
 * Ways of getting there. speedFactor scales the road speed, waitMin is time
 * lost before you move, kerbMin is arriving at the airport to standing inside
 * the terminal door. viaMetro modes ride Kochi Metro Line 1 to Aluva and then
 * cover only the last 10 km by road.
 */
export const TRANSPORT_MODES = [
  {
    id: "app-cab",
    label: "App cab (Uber, Ola)",
    shortLabel: "cab",
    speedFactor: 1,
    waitMin: 11,
    kerbMin: 3,
    viaMetro: false,
    note: "Allow for allocation plus the driver's approach. Availability thins out badly between midnight and 04:00.",
  },
  {
    id: "own-car",
    label: "Own car, parking at the airport",
    shortLabel: "car",
    speedFactor: 1,
    waitMin: 5,
    kerbMin: 10,
    viaMetro: false,
    note: "Includes parking and walking in with bags; the T3 car park is a longer walk than T1.",
  },
  {
    id: "hotel-car",
    label: "Hotel car or pre-booked taxi",
    shortLabel: "hotel car",
    speedFactor: 1,
    waitMin: 5,
    kerbMin: 3,
    viaMetro: false,
    note: "The only option that is genuinely reliable for a 02:00 Gulf departure.",
  },
  {
    id: "airport-bus",
    label: "Airport bus (KSRTC or CIAL service)",
    shortLabel: "airport bus",
    speedFactor: 0.68,
    waitMin: 20,
    kerbMin: 8,
    viaMetro: false,
    note: "Cheap and steady, but the wait allows for half a service headway and buses do not run through the night.",
  },
  {
    id: "metro-taxi",
    label: "Metro to Aluva, then taxi or auto",
    shortLabel: "metro",
    speedFactor: 1,
    waitMin: 10,
    kerbMin: 3,
    viaMetro: true,
    note: "The metro leg ignores traffic entirely, which is why this wins in the evening peak from the city centre.",
  },
  {
    id: "metro-bus",
    label: "Metro to Aluva, then feeder bus",
    shortLabel: "metro and bus",
    speedFactor: 0.7,
    waitMin: 10,
    kerbMin: 8,
    viaMetro: true,
    note: "Cheapest way in from the city, but the feeder leg from Aluva is the slow part.",
  },
];

/**
 * Conditions that change the whole run. Kerala's two monsoons — south-west from
 * June to September and north-east from October to December — matter more here
 * than anywhere else in India, and a hartal is a genuine local risk because
 * road traffic thins while public transport becomes unreliable.
 */
export const ROAD_CONDITIONS = [
  { id: "clear", label: "Normal day", factor: 1, note: "Ordinary weekday or weekend traffic." },
  {
    id: "rain",
    label: "Monsoon rain",
    factor: 0.8,
    note: "The south-west monsoon runs June to September and the north-east one October to December.",
  },
  {
    id: "flooding",
    label: "Heavy rain with flooding",
    factor: 0.55,
    note: "The Periyar around Aluva and the low ground at Edappally and Vyttila flood first, and diversions are long.",
  },
  {
    id: "festival",
    label: "Onam, Christmas or a festival crowd",
    factor: 0.72,
    note: "Onam week and the fortnight before Christmas fill every shopping road in Ernakulam.",
  },
  {
    id: "roadworks",
    label: "Road works on NH 544 or the bypass",
    factor: 0.78,
    note: "Lane closures on the highway push traffic onto the service roads.",
  },
  {
    id: "hartal",
    label: "Hartal or bandh",
    factor: 1.15,
    note: "Roads empty out, but autos, buses and many app cabs stop running. Fix a car the night before.",
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
  const speed = openSpeedKmph * TRAFFIC_BY_HOUR[hour] * modeFactor * conditionFactor;
  // Even a jam crawls: floor the speed so the simulation always terminates.
  return Math.max(4, speed);
}

/**
 * Simulate the drive forward in one-minute steps and return whole minutes.
 * Stepping minute by minute charges the peak rate only to the part of the
 * journey that actually falls inside the peak.
 */
export function simulateDriveMinutes(departMinute, km, openSpeedKmph, modeFactor, conditionFactor) {
  if (!(km > 0)) return 0;
  // Tolerance so a distance covered in an exact number of minutes is not pushed
  // to an extra minute by binary floating-point residue.
  const EPSILON_KM = 1e-9;
  let remaining = km;
  let elapsed = 0;
  while (remaining > EPSILON_KM && elapsed < MAX_DRIVE_MINUTES) {
    const speed = speedAtMinute(departMinute + elapsed, openSpeedKmph, modeFactor, conditionFactor);
    remaining -= speed / MINUTES_PER_HOUR;
    elapsed += 1;
  }
  return elapsed;
}

/**
 * Latest whole minute the road leg can start and still reach the airport by
 * arriveByMinute. Scans backwards, so the answer is the true latest feasible
 * start rather than a fixed-point approximation.
 */
export function latestDeparture(arriveByMinute, km, openSpeedKmph, modeFactor, conditionFactor) {
  for (let offset = 0; offset <= MAX_DRIVE_MINUTES; offset += 1) {
    const candidate = arriveByMinute - offset;
    const drive = simulateDriveMinutes(candidate, km, openSpeedKmph, modeFactor, conditionFactor);
    if (candidate + drive <= arriveByMinute) {
      return { departMinute: candidate, driveMinutes: drive };
    }
  }
  return { departMinute: arriveByMinute - MAX_DRIVE_MINUTES, driveMinutes: MAX_DRIVE_MINUTES };
}

/** Human label for the traffic band a minute falls into. */
export function trafficBandLabel(minute) {
  const factor = TRAFFIC_BY_HOUR[Math.floor(wrapMinute(minute) / MINUTES_PER_HOUR)];
  if (factor >= 1.2) return "Clear highway";
  if (factor >= 1) return "Light traffic";
  if (factor >= 0.8) return "Moderate traffic";
  if (factor >= 0.7) return "Heavy traffic";
  return "Peak-hour crawl";
}

/**
 * Build the full backward schedule for a departure from Kochi.
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
  zoneId = "mg-road",
  modeId = "app-cab",
  conditionId = "clear",
  checkedBag = true,
  webCheckedIn = true,
  contingencyMin = DEFAULT_CONTINGENCY_MIN,
} = {}) {
  const flightMinute = parseHhmm(flightTime);
  if (flightMinute === null) {
    return { error: "Enter the scheduled departure time as a 24-hour clock time, such as 03:45." };
  }
  const journey = JOURNEY_TYPES.find((entry) => entry.id === journeyTypeId);
  if (!journey) return { error: "Choose a domestic or an international flight." };
  const zone = PICKUP_ZONES.find((entry) => entry.id === zoneId);
  if (!zone) return { error: "Choose where in Kochi you are starting from." };
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
  if (mode.viaMetro && zone.metroToAluvaMin === null) {
    return {
      error: `Kochi Metro Line 1 runs Aluva to Tripunithura and does not serve ${zone.label}. Pick a road option instead.`,
    };
  }

  // --- Which distance is actually driven ---
  const usesMetro = mode.viaMetro;
  const roadKm = usesMetro ? ALUVA_TO_AIRPORT_KM : zone.km;
  const roadOpenSpeed = usesMetro ? ALUVA_ROAD_OPEN_SPEED_KMPH : zone.openSpeedKmph;
  const metroRideMin = usesMetro ? zone.metroToAluvaMin : 0;
  const interchangeMin = usesMetro ? ALUVA_INTERCHANGE_MIN : 0;
  const preRoadMin = metroRideMin + interchangeMin;

  // --- Terminal-side processing, in the order you actually do it ---
  const steps = [{ id: "entry", label: "Terminal entry and ID check", minutes: TERMINAL_ENTRY_MIN }];
  if (!webCheckedIn) {
    steps.push({ id: "checkin", label: "Check in at the counter", minutes: COUNTER_CHECK_IN_MIN });
  }
  if (checkedBag) {
    steps.push({
      id: "bags",
      label: webCheckedIn ? "Self bag tag and bag drop" : "Bag drop",
      minutes: webCheckedIn ? BAG_DROP_MIN - SELF_BAG_TAG_SAVING_MIN : BAG_DROP_MIN,
    });
  }
  if (journey.immigrationMin > 0) {
    steps.push({ id: "emigration", label: "Emigration counters", minutes: journey.immigrationMin });
  }
  steps.push({ id: "security", label: "Security screening", minutes: journey.securityMin });
  steps.push({ id: "walk", label: "Walk to the gate", minutes: journey.gateWalkMin });

  const processingMin = steps.reduce((total, step) => total + step.minutes, 0);

  // --- The deadlines, expressed as "be at the kerb by" times ---
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
        },
    { id: "gate", label: "Boarding gate closes", kerbMinute: kerbForGate },
  ].filter(Boolean);

  const bindingDeadline = kerbDeadlines.reduce((tightest, entry) =>
    entry.kerbMinute < tightest.kerbMinute ? entry : tightest,
  );

  const targetKerbMinute = Math.min(kerbForAdvice, bindingDeadline.kerbMinute) - contingencyMin;

  const drive = latestDeparture(
    targetKerbMinute - mode.kerbMin,
    roadKm,
    roadOpenSpeed,
    mode.speedFactor,
    condition.factor,
  );
  const metroBoardMinute = drive.departMinute - interchangeMin - metroRideMin;
  const leaveMinute = metroBoardMinute - mode.waitMin;
  const kerbMinute = drive.departMinute + drive.driveMinutes + mode.kerbMin;

  // The last moment you could set off and still, in theory, make the flight.
  const lastChanceDrive = latestDeparture(
    bindingDeadline.kerbMinute - mode.kerbMin,
    roadKm,
    roadOpenSpeed,
    mode.speedFactor,
    condition.factor,
  );
  const lastChanceLeaveMinute = lastChanceDrive.departMinute - preRoadMin - mode.waitMin;

  const leadMinutes = flightMinute - leaveMinute;
  if (leadMinutes > MAX_LEAD_MINUTES) {
    return {
      error:
        "That combination needs more than 20 hours of lead time. Check the flight time, the starting point and the road conditions.",
    };
  }

  const averageSpeedKmph =
    drive.driveMinutes > 0
      ? Math.round((roadKm / drive.driveMinutes) * MINUTES_PER_HOUR * 10) / 10
      : 0;

  const timeline = [
    {
      id: "leave",
      minute: leaveMinute,
      label: usesMetro
        ? "Head for the metro station"
        : mode.id === "own-car"
          ? "Set off"
          : `Book or call the ${mode.shortLabel}`,
      detail:
        mode.waitMin > 0
          ? `Allow ${mode.waitMin} min before you are actually moving.`
          : "Moving straight away.",
    },
    ...(usesMetro && metroRideMin > 0
      ? [
          {
            id: "metro",
            minute: metroBoardMinute,
            label: "Metro towards Aluva",
            detail: `About ${formatDuration(metroRideMin)} on Line 1 from ${zone.label}, unaffected by road traffic.`,
          },
          {
            id: "interchange",
            minute: metroBoardMinute + metroRideMin,
            label: "Change at Aluva",
            detail: `Allow ${ALUVA_INTERCHANGE_MIN} min to get out of the station and into a vehicle.`,
          },
        ]
      : []),
    {
      id: "drive",
      minute: drive.departMinute,
      label: "On the road",
      detail: `${roadKm} km ${usesMetro ? "from Aluva" : `from ${zone.label}`} — about ${formatDuration(drive.driveMinutes)} in ${trafficBandLabel(drive.departMinute).toLowerCase()}.`,
    },
    {
      id: "kerb",
      minute: kerbMinute,
      label: `Inside ${journey.id === "international" ? "Terminal 3" : "Terminal 1"}`,
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
      detail: `${journey.boardingStartsMin} min before departure.`,
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

  const metroRunning =
    !usesMetro ||
    (wrapMinute(metroBoardMinute) >= METRO_FIRST_TRAIN_MIN &&
      wrapMinute(drive.departMinute) <= METRO_LAST_TRAIN_MIN &&
      dayOffset(metroBoardMinute) === dayOffset(drive.departMinute));

  const warnings = [];
  if (dayOffset(leaveMinute) < 0) {
    warnings.push(
      "You need to set off the day before the flight. Treat the departure time as belonging to the previous calendar date.",
    );
  }
  if (usesMetro && !metroRunning) {
    warnings.push(
      `Kochi Metro runs roughly ${formatHhmm(METRO_FIRST_TRAIN_MIN)} to ${formatHhmm(METRO_LAST_TRAIN_MIN)}, and this plan would have you boarding at ${formatHhmm(metroBoardMinute)}. Check KMRL's timings, and assume a road transfer instead if in doubt.`,
    );
  }
  if (bindingDeadline.kerbMinute < kerbForAdvice) {
    warnings.push(
      `The ${bindingDeadline.label.toLowerCase()} cutoff is tighter than the airline's ${formatDuration(journey.advisedArrivalMin)} arrival advice, so the plan works back from the cutoff instead.`,
    );
  }
  if (drive.driveMinutes > 0 && averageSpeedKmph < 20) {
    warnings.push(
      `The model averages only ${averageSpeedKmph} km/h on this run. On a highway route that means the junctions are doing the damage, and any incident will cost you far more.`,
    );
  }
  if (condition.id === "hartal") {
    warnings.push(
      "On a hartal day the roads are clear but public transport and many app cabs stop. Book a private car the night before and carry your ticket to show at any picket.",
    );
  }
  if (!webCheckedIn) {
    warnings.push(
      `Web check-in opens ${WEB_CHECK_IN_OPENS_HOURS} hours before departure and takes about ${COUNTER_CHECK_IN_MIN} minutes of counter queueing out of this plan.`,
    );
  }
  if (journey.id === "international" && wrapMinute(flightMinute) < 6 * MINUTES_PER_HOUR) {
    warnings.push(
      "COK's Gulf departures cluster in the small hours, and that is when the Terminal 3 check-in and emigration queues are at their worst. Treat the emigration allowance here as a minimum.",
    );
  }
  if (mode.id === "airport-bus") {
    warnings.push(
      "Airport bus services do not run through the night and have no allowance here for a service that fails to turn up.",
    );
  }

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
    metroRideMin,
    interchangeMin,
    metroBoardMinute,
    usesMetro,
    metroRunning,
    waitMinutes: mode.waitMin,
    kerbWalkMinutes: mode.kerbMin,
    roadKm,
    fullDistanceKm: zone.km,
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
