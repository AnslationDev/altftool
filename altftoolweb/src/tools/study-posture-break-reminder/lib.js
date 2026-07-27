/**
 * Study posture and eye-break scheduling.
 *
 * Rules encoded:
 *  - 20-20-20 rule for digital eye strain: every 20 minutes look at something
 *    about 20 feet (6 m) away for at least 20 seconds. Popularised by the
 *    American Academy of Ophthalmology and American Optometric Association.
 *  - Posture reset: ergonomics guidance (e.g. UK HSE display screen equipment
 *    guidance, Cornell University Ergonomics Web) advises changing posture and
 *    micro-pausing roughly every 30 minutes of seated work.
 *  - Stand-and-move break: occupational health consensus (e.g. Buckley et al.,
 *    BJSM 2015 expert statement) recommends breaking up sitting at least every
 *    hour with standing or light walking.
 */

/** 20-20-20 rule interval, minutes (AAO/AOA guidance). */
export const EYE_BREAK_INTERVAL_MIN = 20;
/** 20-20-20 rule: look away for at least 20 seconds. */
export const EYE_BREAK_SECONDS = 20;
/** Posture reset interval, minutes (ergonomics micro-break guidance). */
export const POSTURE_BREAK_INTERVAL_MIN = 30;
/** Posture reset length: a short 30-60 s re-alignment; 45 s used as midpoint. */
export const POSTURE_BREAK_SECONDS = 45;
/** Stand-and-move interval, minutes (break up sitting at least hourly). */
export const STAND_BREAK_INTERVAL_MIN = 60;
/** Stand break length: 2-3 minutes of standing/walking; 120 s used. */
export const STAND_BREAK_SECONDS = 120;

/** Practical cap so the schedule stays meaningful (12 hours). */
export const MAX_SESSION_MINUTES = 720;
export const MIN_SESSION_MINUTES = 20;

export const BREAK_TYPES = {
  eye: {
    id: "eye",
    label: "Eye break",
    seconds: EYE_BREAK_SECONDS,
    cue: "Look at something 20 feet (6 m) away for 20 seconds.",
  },
  posture: {
    id: "posture",
    label: "Posture reset",
    seconds: POSTURE_BREAK_SECONDS,
    cue: "Sit tall: feet flat, shoulders back and down, screen at eye level, chin gently tucked.",
  },
  stand: {
    id: "stand",
    label: "Stand and move",
    seconds: STAND_BREAK_SECONDS,
    cue: "Stand up, roll your shoulders and walk for a couple of minutes.",
  },
};

/**
 * Build the merged break schedule for one study session.
 * Events falling on the same minute are merged; only the longest pause counts
 * towards total pause time (you do the eye break while standing, for example).
 *
 * @param {object} input
 * @param {number} input.sessionMinutes      Planned session length in minutes.
 * @param {number} [input.eyeIntervalMin]    Eye-break interval (default 20).
 * @param {number} [input.postureIntervalMin] Posture-reset interval (default 30).
 * @param {number} [input.standIntervalMin]  Stand-break interval (default 60).
 * @returns {{events, counts, totalPauseSeconds, sessionMinutes}|{error:string}}
 */
export function buildBreakSchedule({
  sessionMinutes,
  eyeIntervalMin = EYE_BREAK_INTERVAL_MIN,
  postureIntervalMin = POSTURE_BREAK_INTERVAL_MIN,
  standIntervalMin = STAND_BREAK_INTERVAL_MIN,
}) {
  const session = Number(sessionMinutes);
  if (!Number.isFinite(session)) {
    return { error: "Enter your session length in minutes." };
  }
  if (session < MIN_SESSION_MINUTES) {
    return { error: `Sessions under ${MIN_SESSION_MINUTES} minutes do not need scheduled breaks.` };
  }
  if (session > MAX_SESSION_MINUTES) {
    return { error: "Keep one session at 12 hours or less — split longer days into two sessions." };
  }

  const intervals = [
    ["eye", Number(eyeIntervalMin)],
    ["posture", Number(postureIntervalMin)],
    ["stand", Number(standIntervalMin)],
  ];
  for (const [, value] of intervals) {
    if (!Number.isFinite(value) || value < 5 || value > MAX_SESSION_MINUTES) {
      return { error: "Each interval must be between 5 and 720 minutes." };
    }
  }

  const byMinute = new Map();
  for (const [type, interval] of intervals) {
    for (let t = interval; t <= session; t += interval) {
      if (!byMinute.has(t)) byMinute.set(t, []);
      byMinute.get(t).push(type);
    }
  }

  const order = ["stand", "posture", "eye"]; // longest pause first when merged
  const events = [...byMinute.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([minute, types]) => {
      const sorted = order.filter((t) => types.includes(t));
      return {
        minute,
        types: sorted,
        // Merged pause = the longest single pause among the merged types.
        pauseSeconds: Math.max(...sorted.map((t) => BREAK_TYPES[t].seconds)),
      };
    });

  const counts = { eye: 0, posture: 0, stand: 0 };
  for (const event of events) {
    for (const type of event.types) counts[type] += 1;
  }

  return {
    sessionMinutes: session,
    events,
    counts,
    totalPauseSeconds: events.reduce((sum, e) => sum + e.pauseSeconds, 0),
  };
}

/**
 * Find the next break event after the given elapsed time.
 * Pure: takes elapsed seconds as an argument.
 * @returns {{event, secondsUntil}|null} null when the session is over.
 */
export function nextEventAfter(schedule, elapsedSeconds) {
  if (!schedule || schedule.error || !Array.isArray(schedule.events)) return null;
  const elapsed = Number(elapsedSeconds);
  if (!Number.isFinite(elapsed) || elapsed < 0) return null;
  for (const event of schedule.events) {
    const eventSeconds = event.minute * 60;
    if (eventSeconds > elapsed) {
      return { event, secondsUntil: eventSeconds - elapsed };
    }
  }
  return null;
}

/** Format whole seconds as m:ss (pure string helper, never NaN). */
export function formatSeconds(totalSeconds) {
  const value = Number(totalSeconds);
  if (!Number.isFinite(value) || value < 0) return "0:00";
  const mins = Math.floor(value / 60);
  const secs = Math.round(value % 60);
  return `${mins}:${String(secs).padStart(2, "0")}`;
}
