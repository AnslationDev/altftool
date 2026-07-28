/**
 * RICE protocol timer — pure logic.
 *
 * RICE stands for Rest, Ice, Compression, Elevation, the standard first-aid
 * approach to an acute soft-tissue injury such as an ankle sprain.
 *
 * Cryotherapy timings used here reflect standard first-aid guidance:
 *  - Apply cold for 10-20 minutes at a time. Longer applications do not cool
 *    the tissue further and risk ice burn and superficial nerve injury.
 *  - Repeat every 2-3 hours while awake during the first 24-48 hours.
 *  - Never place ice directly on skin; use a damp cloth as a barrier.
 *
 * Nothing here reads the clock: the caller supplies start time and elapsed
 * seconds, so every function is a pure mapping from input to output.
 */

export const ICE_MIN_MINUTES = 10;
export const ICE_MAX_MINUTES = 20;
export const ICE_DEFAULT_MINUTES = 15;

/** Interval between the START of consecutive applications, in hours. */
export const GAP_MIN_HOURS = 2;
export const GAP_MAX_HOURS = 4;
export const GAP_DEFAULT_HOURS = 2;

/** The window in which icing is normally used after an acute injury. */
export const ACUTE_PHASE_HOURS = 48;
export const PROTOCOL_HOURS_MAX = 72;

export const RICE_STEPS = [
  {
    id: "rest",
    letter: "R",
    label: "Rest",
    detail:
      "Stop the activity and avoid loading the injured area for the first day. Modern sports-medicine guidance favours a return to gentle, pain-free movement after that rather than prolonged rest.",
  },
  {
    id: "ice",
    letter: "I",
    label: "Ice",
    detail:
      "10-20 minutes at a time, every 2-3 hours while awake, for the first 24-48 hours. Always put a damp cloth between the ice and the skin.",
  },
  {
    id: "compression",
    letter: "C",
    label: "Compression",
    detail:
      "An elastic bandage wrapped from the far end of the limb towards the body, snug but never tight. Re-wrap if it starts to dig in as swelling changes.",
  },
  {
    id: "elevation",
    letter: "E",
    label: "Elevation",
    detail:
      "Raise the injured part above the level of the heart. For an ankle that means lying down with the leg on pillows, not sitting with the foot on a stool.",
  },
];

export const COMPRESSION_CHECKS = [
  "Numbness or pins and needles below the bandage",
  "Toes or fingers turning pale, blue or cold",
  "Pain that increases after wrapping rather than easing",
  "Swelling appearing below the edge of the bandage",
];

export const ICE_CONTRAINDICATIONS = [
  "Raynaud's phenomenon or cold urticaria",
  "Peripheral vascular disease or poor circulation in the limb",
  "Reduced or absent sensation in the area, including diabetic neuropathy",
  "Open wounds or broken skin over the injury",
];

export const RED_FLAGS = [
  "You cannot put any weight on it, or cannot take four steps",
  "The joint or limb looks deformed or out of place",
  "Numbness, tingling or loss of movement below the injury",
  "Severe pain, rapidly worsening swelling, or no improvement after 48-72 hours",
];

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** Parse "HH:MM" to minutes past midnight, or NaN. */
export function parseClock(value) {
  if (typeof value !== "string") return NaN;
  const match = TIME_RE.exec(value.trim());
  if (!match) return NaN;
  return Number(match[1]) * 60 + Number(match[2]);
}

/** Format minutes past midnight (any integer) to "HH:MM". */
export function formatClock(minutes) {
  const wrapped = ((Math.round(minutes) % 1440) + 1440) % 1440;
  const h = String(Math.floor(wrapped / 60)).padStart(2, "0");
  const m = String(wrapped % 60).padStart(2, "0");
  return `${h}:${m}`;
}

/** Seconds to "M:SS" or "H:MM:SS". */
export function formatDuration(totalSeconds) {
  const safe = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/** True when `minutes` falls inside the sleep window, which may wrap midnight. */
export function inSleepWindow(minutes, sleepMinutes, wakeMinutes) {
  if (sleepMinutes === wakeMinutes) return false;
  const normalised = ((minutes % 1440) + 1440) % 1440;
  if (sleepMinutes < wakeMinutes) {
    return normalised >= sleepMinutes && normalised < wakeMinutes;
  }
  return normalised >= sleepMinutes || normalised < wakeMinutes;
}

/**
 * Where the current cycle is right now.
 *
 * @param {object} input
 * @param {number} input.elapsedSeconds - seconds since the first ice pack went on
 * @param {number} input.iceMinutes
 * @param {number} input.gapHours - interval between the start of applications
 * @returns {{phase: string, remainingSeconds: number, cycleNumber: number, progressPct: number}}
 */
export function cycleState({ elapsedSeconds, iceMinutes, gapHours }) {
  const iceSeconds = Math.max(0, Number(iceMinutes) || 0) * 60;
  const cycleSeconds = Math.max(1, Number(gapHours) || 0) * 3600;
  const elapsed = Math.max(0, Number(elapsedSeconds) || 0);

  if (iceSeconds <= 0 || iceSeconds >= cycleSeconds) {
    return { phase: "ice", remainingSeconds: 0, cycleNumber: 1, progressPct: 0 };
  }

  const cycleNumber = Math.floor(elapsed / cycleSeconds) + 1;
  const position = elapsed % cycleSeconds;

  if (position < iceSeconds) {
    return {
      phase: "ice",
      remainingSeconds: Math.round(iceSeconds - position),
      cycleNumber,
      progressPct: Math.round((position / iceSeconds) * 100),
    };
  }

  const offSeconds = cycleSeconds - iceSeconds;
  const offPosition = position - iceSeconds;
  return {
    phase: "off",
    remainingSeconds: Math.round(offSeconds - offPosition),
    cycleNumber,
    progressPct: Math.round((offPosition / offSeconds) * 100),
  };
}

/**
 * Build the full application schedule for the protocol window.
 *
 * @param {object} input
 * @param {string} input.startClock - "HH:MM" of the first ice application
 * @param {number} input.iceMinutes
 * @param {number} input.gapHours
 * @param {number} input.protocolHours
 * @param {string} input.sleepClock - when you go to bed
 * @param {string} input.wakeClock - when you get up
 * @returns {object|{error: string}}
 */
export function buildIceSchedule({
  startClock,
  iceMinutes,
  gapHours,
  protocolHours = ACUTE_PHASE_HOURS,
  sleepClock = "23:00",
  wakeClock = "07:00",
}) {
  const start = parseClock(startClock);
  if (Number.isNaN(start)) return { error: "Enter the first ice time as HH:MM." };

  const ice = Number(iceMinutes);
  if (!Number.isFinite(ice) || ice < ICE_MIN_MINUTES || ice > ICE_MAX_MINUTES) {
    return {
      error: `Each ice application should be ${ICE_MIN_MINUTES} to ${ICE_MAX_MINUTES} minutes. Longer does not cool the tissue further and risks an ice burn.`,
    };
  }

  const gap = Number(gapHours);
  if (!Number.isFinite(gap) || gap < GAP_MIN_HOURS || gap > GAP_MAX_HOURS) {
    return { error: `Leave ${GAP_MIN_HOURS} to ${GAP_MAX_HOURS} hours between applications.` };
  }
  if (gap * 60 <= ice) {
    return { error: "The gap between applications must be longer than the application itself." };
  }

  const hours = Number(protocolHours);
  if (!Number.isFinite(hours) || hours <= 0 || hours > PROTOCOL_HOURS_MAX) {
    return { error: `Protocol length should be between 1 and ${PROTOCOL_HOURS_MAX} hours.` };
  }

  const sleep = parseClock(sleepClock);
  const wake = parseClock(wakeClock);
  if (Number.isNaN(sleep) || Number.isNaN(wake)) {
    return { error: "Enter your sleep and wake times as HH:MM." };
  }

  const sessions = [];
  const totalMinutes = hours * 60;
  for (let offset = 0; offset <= totalMinutes; offset += gap * 60) {
    const absolute = start + offset;
    const asleep = inSleepWindow(absolute, sleep, wake);
    sessions.push({
      index: sessions.length + 1,
      hoursIn: Math.round((offset / 60) * 10) / 10,
      dayOffset: Math.floor(absolute / 1440),
      startClock: formatClock(absolute),
      endClock: formatClock(absolute + ice),
      asleep,
    });
    if (sessions.length >= 200) break;
  }

  const awake = sessions.filter((session) => !session.asleep);

  return {
    sessions,
    totalSessions: sessions.length,
    awakeSessions: awake.length,
    sleptThroughSessions: sessions.length - awake.length,
    totalIceMinutes: awake.length * ice,
    iceMinutes: ice,
    gapHours: gap,
    protocolHours: hours,
    offMinutes: Math.round(gap * 60 - ice),
    inAcutePhase: hours <= ACUTE_PHASE_HOURS,
  };
}
