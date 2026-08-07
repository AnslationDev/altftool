/**
 * Local festival day trip planner.
 *
 * Three real pieces of crowd engineering drive the timings.
 *
 * 1. ENTRY QUEUE — a deterministic fluid queue. If arrivals are spread evenly
 *    over a peak window of W minutes at rate lambda (people per minute) and the
 *    gates process mu people per minute, then while lambda > mu a queue builds
 *    at (lambda - mu) people per minute. Arriving t minutes into that window
 *    means (lambda - mu) x t people are already ahead of you, so your wait is
 *
 *        wait = (lambda - mu) x t / mu
 *
 *    Arrive at the start of the window and the wait is nil; arrive at the end
 *    and you inherit the whole backlog. This is why "get there early" is worth
 *    far more at a festival than at anything else.
 *
 * 2. EXIT — the UK Guide to Safety at Sports Grounds (the Green Guide) sets a
 *    maximum rate of passage of 82 persons per minute per metre of width for
 *    level exit routes and 73 persons per minute per metre for stairways. Time
 *    to clear a venue is therefore
 *
 *        clear time = crowd / (exit width in metres x rate)
 *
 *    The same guidance uses an eight-minute emergency evacuation criterion,
 *    which is a useful sanity check on whether an exit system is remotely
 *    adequate for the crowd it serves.
 *
 * 3. DENSITY — the Green Guide caps standing accommodation at 47 persons per
 *    10 square metres, that is 4.7 per square metre. Pedestrian research
 *    (Fruin) puts free movement below about 2 per square metre and effectively
 *    no independent movement above about 4.
 *
 * Clock times are passed in as "HH:MM" strings and converted to minutes from
 * midnight. Nothing here reads the system clock.
 */

/** Green Guide maximum rate of passage, level exit route: persons/min per metre. */
export const EGRESS_RATE_LEVEL = 82;

/** Green Guide maximum rate of passage, stairway: persons/min per metre. */
export const EGRESS_RATE_STAIRS = 73;

/** Green Guide emergency evacuation criterion, minutes. */
export const EVACUATION_CRITERION_MIN = 8;

/** Green Guide maximum density for standing accommodation, persons per square metre. */
export const MAX_STANDING_DENSITY = 4.7;

/** Above this, independent movement through a crowd is effectively impossible. */
export const CONSTRAINED_DENSITY = 4;

/** Below this, people move freely and can choose their own speed. */
export const FREE_FLOW_DENSITY = 2;

export const EXIT_ROUTES = [
  { id: "level", label: "Level exits and gateways", rate: EGRESS_RATE_LEVEL },
  { id: "stairs", label: "Stairways or a stepped exit", rate: EGRESS_RATE_STAIRS },
];

/** Share of a crowd that leaves before the headline finishes. */
export const DEFAULT_EARLY_LEAVER_SHARE_PCT = 15;

/**
 * Planning floor for arriving at the gate. Even with no queue at all you need
 * time to find the right stage, the toilets and the people you came with.
 */
export const MIN_ARRIVAL_BUFFER_MIN = 15;

export const MAX_CROWD = 500000;

const TIME_PATTERN = /^(\d{1,2}):(\d{2})$/;

/** "18:30" -> 1110 minutes from midnight. Returns null on anything else. */
export function parseClock(value) {
  if (typeof value !== "string") return null;
  const match = TIME_PATTERN.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

/** 1110 -> "18:30". Wraps around midnight and marks the next day. */
export function formatClock(totalMinutes) {
  if (!Number.isFinite(totalMinutes)) return "—";
  const rounded = Math.round(totalMinutes);
  const dayOffset = Math.floor(rounded / 1440);
  const inDay = ((rounded % 1440) + 1440) % 1440;
  const hours = String(Math.floor(inDay / 60)).padStart(2, "0");
  const minutes = String(inDay % 60).padStart(2, "0");
  const suffix = dayOffset > 0 ? " (+1d)" : dayOffset < 0 ? " (−1d)" : "";
  return `${hours}:${minutes}${suffix}`;
}

/** "1 h 25 min" */
export function formatMinutes(value) {
  if (!Number.isFinite(value) || value < 0) return "—";
  const minutes = Math.round(value);
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} min`;
  if (rest === 0) return `${hours} h`;
  return `${hours} h ${rest} min`;
}

/**
 * @param {object} input
 * @param {number} input.crowd                expected attendance
 * @param {string} input.startTime            "HH:MM" when the thing you came for starts
 * @param {string} input.endTime              "HH:MM" when it finishes
 * @param {number} input.gateLanes            search lanes or turnstiles open
 * @param {number} input.laneThroughput       people processed per lane per minute
 * @param {number} input.peakSharePct         share of the crowd arriving in the peak window
 * @param {number} input.peakWindowMin        length of that window before the start
 * @param {number} input.targetWaitMin        queue time you are willing to accept
 * @param {number} input.screeningMin         fixed time for the search itself
 * @param {number} input.travelToMin          door to the transport stop nearest the venue
 * @param {number} input.walkFromStopMin      that stop to the gate
 * @param {number} input.travelHomeMin        stop to your door on the way back
 * @param {string} input.lastTransportTime    "HH:MM" of the last service home
 * @param {string} input.exitRoute            an EXIT_ROUTES id
 * @param {number} input.exitWidthM           total usable exit width
 * @param {number} input.standingAreaM2       0 to skip the density check
 * @param {number} input.earlyExitMin         minutes before the end you plan to slip out
 * @param {number} input.earlyLeaverSharePct
 */
export function planFestivalDay(input) {
  const {
    crowd,
    startTime,
    endTime,
    gateLanes,
    laneThroughput,
    peakSharePct,
    peakWindowMin,
    targetWaitMin,
    screeningMin,
    travelToMin,
    walkFromStopMin,
    travelHomeMin,
    lastTransportTime,
    exitRoute = "level",
    exitWidthM,
    standingAreaM2 = 0,
    earlyExitMin = 0,
    earlyLeaverSharePct = DEFAULT_EARLY_LEAVER_SHARE_PCT,
  } = input || {};

  const values = {
    crowd: Number(crowd),
    gateLanes: Number(gateLanes),
    laneThroughput: Number(laneThroughput),
    peakSharePct: Number(peakSharePct),
    peakWindowMin: Number(peakWindowMin),
    targetWaitMin: Number(targetWaitMin),
    screeningMin: Number(screeningMin),
    travelToMin: Number(travelToMin),
    walkFromStopMin: Number(walkFromStopMin),
    travelHomeMin: Number(travelHomeMin),
    exitWidthM: Number(exitWidthM),
    standingAreaM2: Number(standingAreaM2),
    earlyExitMin: Number(earlyExitMin),
    earlyLeaverSharePct: Number(earlyLeaverSharePct),
  };

  if (Object.values(values).some((value) => !Number.isFinite(value))) {
    return { error: "Enter a number in every field." };
  }
  if (values.crowd < 1 || values.crowd > MAX_CROWD) {
    return { error: `Expected attendance must be between 1 and ${MAX_CROWD.toLocaleString("en-US")}.` };
  }
  if (values.gateLanes < 1 || values.gateLanes > 500) return { error: "Gate lanes must be between 1 and 500." };
  if (values.laneThroughput <= 0 || values.laneThroughput > 120) {
    return { error: "Throughput must be between 1 and 120 people per lane per minute." };
  }
  if (values.peakSharePct <= 0 || values.peakSharePct > 100) {
    return { error: "The peak arrival share must be between 1% and 100%." };
  }
  if (values.peakWindowMin < 5 || values.peakWindowMin > 480) {
    return { error: "The peak arrival window must be between 5 and 480 minutes." };
  }
  if (values.targetWaitMin < 0 || values.targetWaitMin > 480) {
    return { error: "Acceptable queue time must be between 0 and 480 minutes." };
  }
  if ([values.screeningMin, values.travelToMin, values.walkFromStopMin, values.travelHomeMin].some((v) => v < 0 || v > 600)) {
    return { error: "Screening, walking and travel times must each be between 0 and 600 minutes." };
  }
  if (values.exitWidthM <= 0 || values.exitWidthM > 500) {
    return { error: "Total exit width must be between 0.5 and 500 metres." };
  }
  if (values.standingAreaM2 < 0 || values.standingAreaM2 > 5_000_000) {
    return { error: "Standing area must be between 0 and 5,000,000 square metres." };
  }
  if (values.earlyExitMin < 0 || values.earlyExitMin > 600) {
    return { error: "Leaving early must be between 0 and 600 minutes before the end." };
  }
  if (values.earlyLeaverSharePct < 0 || values.earlyLeaverSharePct > 100) {
    return { error: "The share of people leaving early must be between 0% and 100%." };
  }

  const start = parseClock(startTime);
  const end = parseClock(endTime);
  const lastTransport = parseClock(lastTransportTime);
  if (start === null) return { error: "Enter the start time as HH:MM, for example 18:30." };
  if (end === null) return { error: "Enter the finish time as HH:MM." };
  if (lastTransport === null) return { error: "Enter the last service home as HH:MM." };

  const route = EXIT_ROUTES.find((item) => item.id === exitRoute);
  if (!route) return { error: "Pick which kind of exit route the venue has." };

  // Times can run past midnight; unroll them onto one continuous timeline.
  const endAbsolute = end >= start ? end : end + 1440;
  if (endAbsolute - start > 1440) return { error: "The event cannot run for more than 24 hours." };
  let lastTransportAbsolute = lastTransport;
  while (lastTransportAbsolute < start) lastTransportAbsolute += 1440;

  // --- Entry queue: deterministic fluid model -----------------------------
  const serviceRate = values.gateLanes * values.laneThroughput; // mu, people/min
  const peakArrivals = values.crowd * (values.peakSharePct / 100);
  const arrivalRate = peakArrivals / values.peakWindowMin; // lambda, people/min
  const buildRate = arrivalRate - serviceRate;
  const queueBuilds = buildRate > 0;

  const worstWaitMin = queueBuilds ? (buildRate * values.peakWindowMin) / serviceRate : 0;
  // Solve wait = buildRate x t / serviceRate for t, then arrive that far into the window.
  const targetMinutesIntoWindow = queueBuilds
    ? Math.min(values.peakWindowMin, (values.targetWaitMin * serviceRate) / buildRate)
    : values.peakWindowMin;
  // Never plan to arrive later than the floor below, queue or no queue: you still
  // have to find the right stage, the toilets and the people you came with.
  const arriveBeforeStartMin = Math.max(MIN_ARRIVAL_BUFFER_MIN, values.peakWindowMin - targetMinutesIntoWindow);
  const minutesIntoWindow = Math.max(0, values.peakWindowMin - arriveBeforeStartMin);
  const expectedWaitMin = queueBuilds ? (buildRate * minutesIntoWindow) / serviceRate : 0;

  const gateArrival = start - arriveBeforeStartMin;
  const throughGate = gateArrival + expectedWaitMin + values.screeningMin;
  const leaveHome = gateArrival - values.walkFromStopMin - values.travelToMin;

  // --- Exit ---------------------------------------------------------------
  const egressCapacity = values.exitWidthM * route.rate; // people/min
  const fullClearMin = values.crowd / egressCapacity;
  const averageWaitIfStayingMin = fullClearMin / 2;
  const earlyLeavers = values.crowd * (values.earlyLeaverSharePct / 100);
  const earlyExitWaitMin = values.earlyExitMin > 0 ? earlyLeavers / egressCapacity : averageWaitIfStayingMin;

  const leaveSeatAt = endAbsolute - values.earlyExitMin;
  const outOfVenueAt = leaveSeatAt + earlyExitWaitMin;
  const atStopAt = outOfVenueAt + values.walkFromStopMin;
  const homeAt = atStopAt + values.travelHomeMin;

  const catchesLastService = atStopAt <= lastTransportAbsolute;
  const latestAtStop = lastTransportAbsolute;
  const latestOutOfVenue = latestAtStop - values.walkFromStopMin;
  const latestLeaveSeat = latestOutOfVenue - earlyExitWaitMin;
  const spareMinutes = latestAtStop - atStopAt;

  // --- Density ------------------------------------------------------------
  let density = null;
  if (values.standingAreaM2 > 0) {
    const perM2 = values.crowd / values.standingAreaM2;
    density = {
      perM2,
      areaPerPerson: 1 / perM2,
      band:
        perM2 > MAX_STANDING_DENSITY
          ? { id: "over", label: `Above the ${MAX_STANDING_DENSITY}/m² standing limit`, tone: "danger" }
          : perM2 >= CONSTRAINED_DENSITY
            ? { id: "packed", label: "Packed — you will not be able to move at will", tone: "danger" }
            : perM2 >= FREE_FLOW_DENSITY
              ? { id: "busy", label: "Busy but navigable", tone: "warn" }
              : { id: "free", label: "Free movement", tone: "ok" },
    };
  }

  const timeline = [
    { id: "leave", label: "Leave home", at: leaveHome },
    { id: "gate", label: "Reach the gate queue", at: gateArrival },
    { id: "in", label: "Through security and inside", at: throughGate },
    { id: "start", label: "The thing you came for starts", at: start },
    { id: "seat", label: values.earlyExitMin > 0 ? `Start moving (${values.earlyExitMin} min early)` : "It finishes", at: leaveSeatAt },
    { id: "out", label: "Out of the venue", at: outOfVenueAt },
    { id: "stop", label: "At the stop or station", at: atStopAt },
    { id: "home", label: "Home", at: homeAt },
  ];

  const warnings = [];
  if (queueBuilds) {
    warnings.push(
      `Arrivals peak at ${Math.round(arrivalRate)} people a minute against ${Math.round(serviceRate)} the gates can process. Turning up at the last moment means about ${formatMinutes(worstWaitMin)} in the queue.`,
    );
  }
  if (fullClearMin > EVACUATION_CRITERION_MIN * 3) {
    warnings.push(
      `Clearing ${values.crowd.toLocaleString("en-US")} people through ${values.exitWidthM} m of exit takes about ${formatMinutes(fullClearMin)}. Staying to the last note costs most of that.`,
    );
  }
  if (!catchesLastService) {
    warnings.push(
      `You would reach the stop at ${formatClock(atStopAt)}, after the last service at ${formatClock(lastTransportAbsolute)}. Leave the venue by ${formatClock(latestLeaveSeat)} or arrange another way home before you go.`,
    );
  } else if (spareMinutes < 20) {
    warnings.push(`Only ${formatMinutes(spareMinutes)} of margin on the last service. One delay and you are walking.`);
  }
  if (density && density.band.tone === "danger") {
    warnings.push(
      `At ${Math.round(density.perM2 * 10) / 10} people per square metre you cannot choose your own direction. Stay near an edge, know where two exits are, and move with the crowd rather than across it.`,
    );
  }
  if (values.earlyExitMin === 0 && fullClearMin > 15) {
    warnings.push(`Leaving even ten minutes early would cut roughly ${formatMinutes(averageWaitIfStayingMin - earlyLeavers / egressCapacity)} off your wait to get out of the venue.`);
  }
  // earlyExitMin is only checked against a fixed [0, 600] range above, with no cross-check
  // against how long the event itself actually runs — so a short event plus a large early-exit
  // value can compute a "leave your seat" time before the event has even started (or before
  // you're even through the gate). Surface that instead of silently rendering a backwards timeline.
  const earliestPlausibleLeaveMin = Math.max(start, throughGate);
  if (values.earlyExitMin > 0 && leaveSeatAt < earliestPlausibleLeaveMin) {
    warnings.push(
      `"Leaving early by" (${formatMinutes(values.earlyExitMin)}) is longer than the event itself, so it works out to leaving your seat at ${formatClock(leaveSeatAt)} — before you'd even be inside for the start at ${formatClock(start)}. Lower it so it fits within the event's length.`,
    );
  }

  return {
    serviceRate,
    arrivalRate,
    queueBuilds,
    worstWaitMin,
    expectedWaitMin,
    arriveBeforeStartMin,
    totalBufferMin: values.travelToMin + values.walkFromStopMin + arriveBeforeStartMin,
    egressCapacity,
    fullClearMin,
    averageWaitIfStayingMin,
    earlyExitWaitMin,
    exitRoute: route,
    catchesLastService,
    spareMinutes,
    latestLeaveSeat,
    lastTransportAbsolute,
    density,
    timeline,
    warnings,
  };
}

/** Clipboard summary. */
export function formatFestivalPlanText(plan, name) {
  if (!plan || plan.error) return "";
  const lines = [
    `Festival day plan${name ? ` — ${name}` : ""}`,
    `Get to the gate ${formatMinutes(plan.arriveBeforeStartMin)} before the start for a queue of about ${formatMinutes(plan.expectedWaitMin)}.`,
    `Leaving at the last moment would mean roughly ${formatMinutes(plan.worstWaitMin)} queuing.`,
    "",
    "Timeline:",
  ];
  plan.timeline.forEach((step) => {
    lines.push(`  ${formatClock(step.at)}  ${step.label}`);
  });
  lines.push(
    "",
    `Full venue clear time: ${formatMinutes(plan.fullClearMin)} (${plan.exitRoute.label.toLowerCase()})`,
    plan.catchesLastService
      ? `Last service home: ${formatMinutes(plan.spareMinutes)} of margin.`
      : `MISSES the last service home — leave your spot by ${formatClock(plan.latestLeaveSeat)}.`,
  );
  if (plan.density) {
    lines.push(`Crowd density: ${Math.round(plan.density.perM2 * 10) / 10} per m² — ${plan.density.band.label}`);
  }
  return lines.join("\n");
}
