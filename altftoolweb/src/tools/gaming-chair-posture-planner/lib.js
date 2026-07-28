/**
 * Gaming Chair Posture Planner — pure calculation module.
 *
 * Gaming chairs have more adjustment than most office chairs and are usually set
 * up by eye. This module turns body height into target seat, armrest, lumbar and
 * recline settings, and lands the break schedule on a match boundary so a break
 * never falls in the middle of a live round.
 */

/** Popliteal (seat) height / stature. Pheasant, Bodyspace, 50th-percentile adult. */
export const POPLITEAL_RATIO = 0.25;

/** Buttock-to-popliteal length (usable seat depth) / stature. Pheasant, 50th pct. */
export const BUTTOCK_POPLITEAL_RATIO = 0.29;

/** Sitting elbow height above the seat / stature. Pheasant, 50th pct. */
export const SITTING_ELBOW_RATIO = 0.133;

/** Sitting eye height above the seat / stature. Pheasant, 50th pct. */
export const SITTING_EYE_RATIO = 0.454;

/**
 * Lumbar support apex above the seat pan. Chair design places it over the
 * lumbar curve, conventionally 15-25 cm above the seat; 0.115 x stature puts a
 * 175 cm player at 20 cm, the middle of that band.
 */
export const LUMBAR_APEX_RATIO = 0.115;

/** Shoes add height under the heel; seat height targets are set with shoes on. */
export const SHOE_ALLOWANCE_CM = 2;

/** Clearance behind the knee so the seat front does not press the calf. */
export const KNEE_CLEARANCE_CM = 5;

/** ANSI/HFES 100 and OSHA: top of the viewable screen at or slightly below eye height. */
export const MONITOR_TOP_BELOW_EYE_CM = 5;

/** Armrest-to-desk mismatch small enough to ignore. */
export const DESK_TOLERANCE_CM = 2;

/**
 * Play styles. Upright recline is the range used for active input; the relaxed
 * range is for watching, queueing or single-player sessions where the arms are
 * doing less work. Viewing distances sit inside the 50-100 cm band of ANSI/HFES 100.
 */
export const PLAY_STYLES = {
  competitive: {
    label: "Competitive / fast aim",
    activeReclineDeg: [100, 105],
    relaxedReclineDeg: [105, 115],
    viewingDistanceCm: [55, 65],
    note: "Sit forward with the backrest still touching you — a deep recline slows shoulder rotation.",
  },
  casual: {
    label: "Casual / single player",
    activeReclineDeg: [100, 110],
    relaxedReclineDeg: [110, 130],
    viewingDistanceCm: [60, 75],
    note: "Use the recline. Alternating between an upright and a reclined angle is better than holding either one.",
  },
};

/** Change posture and stand at least this often during a long session. */
export const POSTURE_BREAK_TARGET_MIN = 60;

/** 20-20-20 rule: every 20 minutes, look 20 feet away for 20 seconds. */
export const EYE_BREAK_INTERVAL_MIN = 20;

/** Between-match routine. Durations in seconds. */
export const BREAK_ROUTINE = [
  { name: "Stand and walk", seconds: 60, cue: "Leave the chair completely for a full minute." },
  {
    name: "Chin tucks",
    seconds: 30,
    cue: "Draw the chin straight back, hold 5 s, 6 reps — undoes the screen-lean.",
  },
  {
    name: "Doorway chest stretch",
    seconds: 40,
    cue: "Forearm on the frame, step through, 20 s each side.",
  },
  {
    name: "Hip flexor stretch",
    seconds: 60,
    cue: "Split stance, tuck the tailbone, 30 s each side.",
  },
  {
    name: "Wrist flexor and extensor stretch",
    seconds: 40,
    cue: "Arm straight, pull the fingers back then down, 20 s each side.",
  },
  {
    name: "Eye reset",
    seconds: 20,
    cue: "Look at something at least 6 m away and blink slowly ten times.",
  },
];

/** Total seconds in one between-match routine. */
export const BREAK_ROUTINE_SECONDS = BREAK_ROUTINE.reduce((sum, step) => sum + step.seconds, 0);

/** Round to 1 dp, and normalise -0 to 0 so nothing ever renders as "-0". */
const round1 = (value) => {
  const rounded = Math.round(value * 10) / 10;
  return Object.is(rounded, -0) ? 0 : rounded;
};

/**
 * @param {object} input
 * @param {number} input.heightCm       Body height, 120-220.
 * @param {number} input.sessionHours   Planned session, 0.25-16.
 * @param {number} input.matchMinutes   Typical match or round length, 1-120.
 * @param {number} input.deskHeightCm   Floor to desk surface, 50-120.
 * @param {string} input.playStyle      Key of PLAY_STYLES.
 * @returns {object} chair targets and break plan, or { error }.
 */
export function planGamingSetup({
  heightCm,
  sessionHours,
  matchMinutes,
  deskHeightCm,
  playStyle = "competitive",
}) {
  const height = Number(heightCm);
  const hours = Number(sessionHours);
  const match = Number(matchMinutes);
  const desk = Number(deskHeightCm);

  if ([height, hours, match, desk].some((value) => !Number.isFinite(value))) {
    return { error: "Enter a number in every field." };
  }
  if (height < 120 || height > 220) return { error: "Enter a body height between 120 cm and 220 cm." };
  if (hours <= 0) return { error: "Session length must be greater than zero." };
  if (hours > 16) return { error: "Keep the session to 16 hours or less." };
  if (match < 1) return { error: "A match has to be at least 1 minute long." };
  if (match > 120) return { error: "Match length above 120 minutes is not a round — enter the real value." };
  if (desk < 50 || desk > 120) return { error: "Desk height is usually between 50 cm and 120 cm." };

  const styleKey = PLAY_STYLES[playStyle] ? playStyle : "competitive";
  const style = PLAY_STYLES[styleKey];

  const seatHeight = height * POPLITEAL_RATIO + SHOE_ALLOWANCE_CM;
  const seatDepth = height * BUTTOCK_POPLITEAL_RATIO - KNEE_CLEARANCE_CM;
  const elbowAboveSeat = height * SITTING_ELBOW_RATIO;
  const armrestHeight = seatHeight + elbowAboveSeat;
  const lumbarApex = height * LUMBAR_APEX_RATIO;
  const eyeHeight = seatHeight + height * SITTING_EYE_RATIO;
  const monitorTop = eyeHeight - MONITOR_TOP_BELOW_EYE_CM;

  const deskDelta = desk - armrestHeight;
  const deskTooHigh = deskDelta > DESK_TOLERANCE_CM;
  const deskTooLow = deskDelta < -DESK_TOLERANCE_CM;

  const sessionMin = Math.round(hours * 60);
  const matchMin = Math.round(match);
  // Round the 60-minute posture-break target up to the next whole match so a
  // break never lands mid-round.
  const breakIntervalMin = Math.ceil(POSTURE_BREAK_TARGET_MIN / matchMin) * matchMin;
  const matchesPerBlock = Math.round(breakIntervalMin / matchMin);
  const postureBreaks = Math.max(0, Math.ceil(sessionMin / breakIntervalMin) - 1);
  const eyeBreaks = Math.max(0, Math.ceil(sessionMin / EYE_BREAK_INTERVAL_MIN) - 1);
  const totalBreakSeconds = postureBreaks * BREAK_ROUTINE_SECONDS;

  const blocks = [];
  let elapsed = 0;
  while (elapsed < sessionMin) {
    const length = Math.min(breakIntervalMin, sessionMin - elapsed);
    blocks.push({
      index: blocks.length + 1,
      startMin: elapsed,
      endMin: elapsed + length,
      lengthMin: length,
      matches: Math.round(length / matchMin),
      breakAfter: elapsed + length < sessionMin,
    });
    elapsed += length;
  }

  return {
    styleKey,
    styleLabel: style.label,
    styleNote: style.note,
    activeReclineDeg: style.activeReclineDeg,
    relaxedReclineDeg: style.relaxedReclineDeg,
    viewingDistanceCm: style.viewingDistanceCm,
    seatHeightCm: round1(seatHeight),
    seatDepthCm: round1(seatDepth),
    armrestHeightCm: round1(armrestHeight),
    armrestAboveSeatCm: round1(elbowAboveSeat),
    lumbarApexCm: round1(lumbarApex),
    eyeHeightCm: round1(eyeHeight),
    monitorTopCm: round1(monitorTop),
    deskDeltaCm: round1(deskDelta),
    deskTooHigh,
    deskTooLow,
    sessionMin,
    matchMin,
    breakIntervalMin,
    matchesPerBlock,
    postureBreaks,
    eyeBreaks,
    routineSeconds: BREAK_ROUTINE_SECONDS,
    totalBreakSeconds,
    blocks,
  };
}

/** Minutes -> "2 h 30 m". Pure formatting helper. */
export function formatMinutes(totalMin) {
  const value = Number(totalMin);
  if (!Number.isFinite(value) || value < 0) return "—";
  const mins = Math.round(value);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} m`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} m`;
}

/** Seconds -> "4 min 10 s". Pure formatting helper. */
export function formatSeconds(totalSeconds) {
  const value = Number(totalSeconds);
  if (!Number.isFinite(value) || value < 0) return "—";
  const seconds = Math.round(value);
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s} s`;
  if (s === 0) return `${m} min`;
  return `${m} min ${s} s`;
}
