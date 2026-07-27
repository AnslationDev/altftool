/**
 * Getting to an exam centre on time, with a backup that is planned rather than
 * improvised.
 *
 * The maths, and where each rule comes from:
 *
 *  - Moving time is distance divided by average speed. The speeds offered below are
 *    door-to-door planning defaults for Indian cities, not claims about any
 *    particular road, and every one of them is editable.
 *
 *  - Waiting for a service you have not timed yourself to is, on average, half the
 *    headway. If buses on the route run every 20 minutes and you turn up without
 *    consulting the timetable, you wait 10 minutes on average. This is the standard
 *    random-arrival result used in transit planning, and it is why a frequent service
 *    beats a fast one on a morning that matters.
 *
 *  - Access and egress time — walking to the stop, parking, walking from the drop
 *    point to the hall — is counted separately because it does not shrink when the
 *    road is clear. It is the part candidates forget.
 *
 *  - A peak multiplier is applied to road modes only. Rail and metro running times
 *    barely move in traffic; a car's do.
 *
 *  - The buffer is not a guess: plan against the slow version of the journey, not the
 *    average one. The default here is 25% of the journey with a floor of 20 minutes,
 *    on top of arriving before the gate closes.
 *
 * Exam centre reporting and gate-closing times are printed on your own admit card and
 * are the only authority on when you must be inside.
 */

/** Buffer as a share of the journey, applied on top of the fixed floor. */
export const BUFFER_SHARE_OF_JOURNEY = 0.25;

/** Minimum buffer in minutes, however short the journey. */
export const MIN_BUFFER_MINUTES = 20;

const MINUTES_PER_DAY = 1440;
const MAX_DISTANCE_KM = 2000;
const MAX_SPEED_KMPH = 400;

/**
 * Planning defaults. speedKmph is a door-to-door average including stops and
 * junctions, not a top speed. roadMode marks the modes that peak traffic slows.
 */
export const MODES = [
  { id: "walk", label: "On foot", speedKmph: 5, roadMode: false, headway: 0, access: 0, egress: 0 },
  { id: "cycle", label: "Bicycle", speedKmph: 15, roadMode: false, headway: 0, access: 3, egress: 5 },
  { id: "twowheeler", label: "Two-wheeler", speedKmph: 25, roadMode: true, headway: 0, access: 3, egress: 8 },
  { id: "car", label: "Car or cab", speedKmph: 20, roadMode: true, headway: 0, access: 5, egress: 10 },
  { id: "auto", label: "Auto-rickshaw", speedKmph: 18, roadMode: true, headway: 5, access: 5, egress: 6 },
  { id: "bus", label: "City bus", speedKmph: 15, roadMode: true, headway: 20, access: 10, egress: 10 },
  { id: "metro", label: "Metro", speedKmph: 32, roadMode: false, headway: 6, access: 12, egress: 12 },
  { id: "local", label: "Suburban / local train", speedKmph: 35, roadMode: false, headway: 12, access: 15, egress: 15 },
  { id: "train", label: "Intercity train", speedKmph: 50, roadMode: false, headway: 0, access: 45, egress: 30 },
];

/** Traffic conditions and the multiplier each applies to road modes. */
export const TRAFFIC_LEVELS = [
  { id: "clear", label: "Clear — early morning or a holiday", multiplier: 1 },
  { id: "moderate", label: "Moderate — normal weekday", multiplier: 1.25 },
  { id: "peak", label: "Peak hour", multiplier: 1.6 },
  { id: "severe", label: "Severe — rain, procession, roadwork", multiplier: 2.1 },
];

/**
 * Convert "HH:MM" to minutes past midnight, or null.
 *
 * @param {string} clock
 * @returns {number|null}
 */
export function parseClock(clock) {
  if (typeof clock !== "string") return null;
  const match = /^\s*(\d{1,2}):(\d{2})\s*$/.exec(clock);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

/**
 * Format minutes past midnight as a 12-hour clock, wrapping across midnight.
 *
 * @param {number} totalMinutes
 * @returns {string}
 */
export function formatClock(totalMinutes) {
  if (!Number.isFinite(totalMinutes)) return "—";
  const wrapped = ((Math.round(totalMinutes) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hours24 = Math.floor(wrapped / 60);
  const minutes = wrapped % 60;
  const suffix = hours24 < 12 ? "AM" : "PM";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${hours12}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

/**
 * Format a span of minutes as "1 h 05 min".
 *
 * @param {number} minutes
 * @returns {string}
 */
export function formatDuration(minutes) {
  if (!Number.isFinite(minutes)) return "—";
  const total = Math.max(0, Math.round(minutes));
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  if (hours === 0) return `${rest} min`;
  if (rest === 0) return `${hours} h`;
  return `${hours} h ${String(rest).padStart(2, "0")} min`;
}

/**
 * Door-to-door journey time for one route.
 *
 * @param {object} input
 * @param {number} input.distanceKm
 * @param {number} input.speedKmph        Door-to-door average, not a top speed.
 * @param {number} input.trafficMultiplier Applied only when isRoadMode is true.
 * @param {boolean} input.isRoadMode
 * @param {number} input.headwayMinutes   Service interval; the average wait is half of it.
 * @param {number} input.accessMinutes    Getting to the stop or into the vehicle.
 * @param {number} input.egressMinutes    Drop point to the exam hall, parking included.
 * @param {number} input.transfers        Changes of service.
 * @param {number} input.transferMinutes  Cost of each change.
 * @returns {object} breakdown, or { error }.
 */
export function computeJourney({
  distanceKm = 10,
  speedKmph = 20,
  trafficMultiplier = 1.25,
  isRoadMode = true,
  headwayMinutes = 0,
  accessMinutes = 5,
  egressMinutes = 10,
  transfers = 0,
  transferMinutes = 5,
} = {}) {
  const distance = Number(distanceKm);
  const speed = Number(speedKmph);
  const multiplier = Number(trafficMultiplier);
  const headway = Number(headwayMinutes);
  const access = Number(accessMinutes);
  const egress = Number(egressMinutes);
  const changes = Number(transfers);
  const changeCost = Number(transferMinutes);

  const numbers = [distance, speed, multiplier, headway, access, egress, changes, changeCost];
  if (numbers.some((value) => !Number.isFinite(value))) {
    return { error: "Enter every field as a number." };
  }
  if (numbers.some((value) => value < 0)) {
    return { error: "None of these values can be negative." };
  }
  if (speed === 0) {
    return { error: "Average speed has to be greater than zero, or the journey never ends." };
  }
  if (distance > MAX_DISTANCE_KM) {
    return { error: `A journey over ${MAX_DISTANCE_KM} km to an exam centre means travelling the day before.` };
  }
  if (speed > MAX_SPEED_KMPH) {
    return { error: `An average speed above ${MAX_SPEED_KMPH} km/h is not a road or rail journey.` };
  }
  if (multiplier < 1 || multiplier > 5) {
    return { error: "The traffic multiplier runs from 1 (clear) to about 2 (severe)." };
  }
  if (changes > 10) {
    return { error: "More than ten changes of service is not a plan, it is a gamble." };
  }

  const baseMovingMinutes = (distance / speed) * 60;
  const movingMinutes = isRoadMode ? baseMovingMinutes * multiplier : baseMovingMinutes;
  // Average wait for a random arrival at a service running every `headway` minutes.
  const waitMinutes = headway / 2;
  const transferMinutesTotal = changes * changeCost;
  const fixedMinutes = access + egress + transferMinutesTotal;
  const totalMinutes = movingMinutes + waitMinutes + fixedMinutes;

  return {
    distanceKm: distance,
    speedKmph: speed,
    baseMovingMinutes,
    movingMinutes,
    trafficPenaltyMinutes: movingMinutes - baseMovingMinutes,
    waitMinutes,
    accessMinutes: access,
    egressMinutes: egress,
    transferMinutes: transferMinutesTotal,
    fixedMinutes,
    totalMinutes,
    effectiveSpeedKmph: totalMinutes > 0 ? Math.round((distance / (totalMinutes / 60)) * 100) / 100 : 0,
  };
}

/**
 * Recommended buffer: a share of the journey, with a floor.
 *
 * @param {number} journeyMinutes
 * @returns {number}
 */
export function recommendBuffer(journeyMinutes) {
  const journey = Number(journeyMinutes);
  if (!Number.isFinite(journey) || journey <= 0) return MIN_BUFFER_MINUTES;
  return Math.max(MIN_BUFFER_MINUTES, Math.ceil(journey * BUFFER_SHARE_OF_JOURNEY));
}

/**
 * The whole plan: when to leave on the primary route, when to give up on it and take
 * the backup, and how much slack is left at the gate.
 *
 * @param {object} input
 * @param {string} input.gateCloseClock   "HH:MM" from the admit card.
 * @param {number} input.arriveEarlyMinutes How far before the gate closes you want to be.
 * @param {object} input.primary          Result of computeJourney.
 * @param {object} [input.backup]         Result of computeJourney, or null.
 * @param {number} input.bufferMinutes    Slack for the unexpected.
 * @param {number} input.getReadyMinutes
 * @returns {object} plan, or { error }.
 */
export function planExamTravel({
  gateCloseClock = "09:30",
  arriveEarlyMinutes = 30,
  primary = null,
  backup = null,
  bufferMinutes = 25,
  getReadyMinutes = 45,
} = {}) {
  const gateClose = parseClock(gateCloseClock);
  if (gateClose === null) {
    return { error: "Enter the gate-closing time from your admit card as a 24-hour clock value." };
  }
  if (!primary || primary.error) {
    return { error: primary && primary.error ? primary.error : "Set up the primary route first." };
  }

  const early = Number(arriveEarlyMinutes);
  const buffer = Number(bufferMinutes);
  const getReady = Number(getReadyMinutes);
  if (![early, buffer, getReady].every((value) => Number.isFinite(value))) {
    return { error: "Enter the buffer and getting-ready times as numbers of minutes." };
  }
  if ([early, buffer, getReady].some((value) => value < 0)) {
    return { error: "Buffer and getting-ready times cannot be negative." };
  }

  const targetArrival = gateClose - early;
  const primaryDeparture = targetArrival - primary.totalMinutes - buffer;
  const wakeUp = primaryDeparture - getReady;

  const hasBackup = Boolean(backup) && !backup.error;
  const backupDeparture = hasBackup ? targetArrival - backup.totalMinutes - buffer : null;
  // The last moment you can abandon the primary route and still make it on the backup,
  // spending the buffer rather than saving it.
  const switchBy = hasBackup ? targetArrival - backup.totalMinutes : null;
  const backupSlower = hasBackup ? backup.totalMinutes - primary.totalMinutes : null;

  const warnings = [];
  if (wakeUp < 0) {
    warnings.push(
      "The plan starts before midnight. For a journey this long, travel the day before and stay near the centre.",
    );
  }
  if (buffer < MIN_BUFFER_MINUTES) {
    warnings.push(
      `A buffer under ${MIN_BUFFER_MINUTES} minutes leaves nothing for a puncture, a diversion or a wrong gate. ${recommendBuffer(primary.totalMinutes)} minutes suits this journey.`,
    );
  }
  if (early < 20) {
    warnings.push(
      "Aim to be at the centre at least 20 minutes before the gate closes. Entry checks and finding the right room take longer than candidates expect.",
    );
  }
  if (hasBackup && backupSlower > primary.totalMinutes) {
    warnings.push(
      "The backup takes more than twice as long as the primary. It is a genuine fallback only if you set out on it early enough — watch the switch-by time.",
    );
  }
  if (!hasBackup) {
    warnings.push(
      "No backup route is set. One blocked road with no alternative is the commonest way a prepared candidate misses a paper.",
    );
  }

  const steps = [
    { id: "wake", label: "Start getting ready", at: wakeUp, detail: "Bag already packed the night before; this is only bath, food and clothes." },
    { id: "leave", label: "Leave on the primary route", at: primaryDeparture, detail: `${formatDuration(primary.totalMinutes)} of journey plus ${formatDuration(buffer)} of buffer.` },
    ...(hasBackup
      ? [
          {
            id: "switch",
            label: "Last moment to switch to the backup",
            at: switchBy,
            detail: `If you are not visibly on your way by now, take the backup instead. It needs ${formatDuration(backup.totalMinutes)} with no buffer left.`,
          },
        ]
      : []),
    { id: "arrive", label: "Reach the centre", at: targetArrival, detail: `${formatDuration(early)} before the gate closes.` },
    { id: "gate", label: "Gate closes", at: gateClose, detail: "No candidate is admitted after this, whatever the reason for being late." },
  ]
    .sort((a, b) => a.at - b.at)
    .map((step) => ({ ...step, clock: formatClock(step.at), previousDay: step.at < 0 }));

  return {
    gateClose,
    gateCloseClock: formatClock(gateClose),
    targetArrival,
    targetArrivalClock: formatClock(targetArrival),
    primary,
    backup: hasBackup ? backup : null,
    hasBackup,
    primaryDeparture,
    primaryDepartureClock: formatClock(primaryDeparture),
    backupDeparture,
    backupDepartureClock: hasBackup ? formatClock(backupDeparture) : "—",
    switchBy,
    switchByClock: hasBackup ? formatClock(switchBy) : "—",
    backupSlower,
    wakeUp,
    wakeUpClock: formatClock(wakeUp),
    bufferMinutes: buffer,
    recommendedBuffer: recommendBuffer(primary.totalMinutes),
    steps,
    warnings,
  };
}

/**
 * The night-before list that makes the plan survive contact with the morning.
 *
 * @returns {Array<{id:string,label:string,detail:string}>}
 */
export function buildTravelPrepList() {
  return [
    {
      id: "recce",
      label: "Visit the centre once before the exam day",
      detail:
        "Centres are often in outlying areas with a name shared by two buildings. Twenty minutes spent finding the gate a week earlier removes the worst risk in the whole plan.",
    },
    {
      id: "printAddress",
      label: "Print the full centre address and the landmark",
      detail:
        "Signal at an exam centre is unreliable and apps fail at the worst moment. A printed address lets a driver find it without your phone.",
    },
    {
      id: "screenshot",
      label: "Screenshot the route and save the map offline",
      detail: "Both the primary and the backup, so neither depends on data.",
    },
    {
      id: "cash",
      label: "Carry cash as well as a payment app",
      detail: "Auto drivers near a centre on exam morning have a way of preferring cash, and queues do not wait.",
    },
    {
      id: "charge",
      label: "Charge the phone fully and carry a small power bank",
      detail: "You may need to leave the phone outside the hall anyway, but it has to survive the journey and the wait afterwards.",
    },
    {
      id: "alarms",
      label: "Set two alarms on two devices",
      detail: "One on a phone that might be on silent is not a plan.",
    },
    {
      id: "tellSomeone",
      label: "Tell someone the plan and the switch-by time",
      detail: "Someone who can call a cab or reach you if the primary route fails while you are on it.",
    },
    {
      id: "packNight",
      label: "Pack the bag and lay out clothes the night before",
      detail: "Everything you do at 6 a.m. is a chance to forget the admit card.",
    },
  ];
}
