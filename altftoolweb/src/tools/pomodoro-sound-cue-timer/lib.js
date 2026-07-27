/**
 * Pomodoro Sound Cue Timer — pure session maths.
 * No React, no JSX, no DOM, no Date.now(): every function takes time as an argument.
 */

/** Classic Pomodoro Technique intervals (Francesco Cirillo, 1980s). */
export const CLASSIC_FOCUS_MINUTES = 25;
export const CLASSIC_SHORT_BREAK_MINUTES = 5;
/** Cirillo specifies a 15-30 minute long break; 15 is the common default. */
export const CLASSIC_LONG_BREAK_MINUTES = 15;
/** A "set" is four pomodoros, after which the long break is taken. */
export const CLASSIC_POMODOROS_PER_SET = 4;

export const SECONDS_PER_MINUTE = 60;

/** Input guard rails. */
export const LIMITS = {
  focusMinutes: { min: 1, max: 180 },
  shortBreakMinutes: { min: 1, max: 60 },
  longBreakMinutes: { min: 1, max: 120 },
  pomodorosPerSet: { min: 1, max: 12 },
  totalPomodoros: { min: 1, max: 24 },
};

/**
 * Cue tones, in hertz, from 12-tone equal temperament with A4 = 440 Hz.
 * Rising interval to start focus, falling interval to start a break.
 */
export const CUE_TONES = {
  focus: { label: "Focus start", frequencies: [659.25, 880.0], beepMs: 180 }, // E5 -> A5
  short: { label: "Short break", frequencies: [880.0, 659.25], beepMs: 180 }, // A5 -> E5
  long: { label: "Long break", frequencies: [880.0, 659.25, 523.25], beepMs: 200 }, // A5 -> E5 -> C5
  done: { label: "Session complete", frequencies: [523.25, 659.25, 783.99, 1046.5], beepMs: 160 }, // C5 E5 G5 C6
};

export const PRESETS = [
  {
    id: "classic",
    label: "Classic 25/5",
    focusMinutes: CLASSIC_FOCUS_MINUTES,
    shortBreakMinutes: CLASSIC_SHORT_BREAK_MINUTES,
    longBreakMinutes: CLASSIC_LONG_BREAK_MINUTES,
    pomodorosPerSet: CLASSIC_POMODOROS_PER_SET,
    totalPomodoros: 8,
  },
  {
    id: "deep",
    label: "Deep work 50/10",
    focusMinutes: 50,
    shortBreakMinutes: 10,
    longBreakMinutes: 30,
    pomodorosPerSet: 2,
    totalPomodoros: 6,
  },
  {
    id: "short",
    label: "Short bursts 15/3",
    focusMinutes: 15,
    shortBreakMinutes: 3,
    longBreakMinutes: 12,
    pomodorosPerSet: 4,
    totalPomodoros: 8,
  },
  {
    id: "study",
    label: "Study 45/15",
    focusMinutes: 45,
    shortBreakMinutes: 15,
    longBreakMinutes: 25,
    pomodorosPerSet: 3,
    totalPomodoros: 6,
  },
];

function checkRange(value, key, label) {
  const { min, max } = LIMITS[key];
  if (!Number.isFinite(value)) return `${label} must be a number.`;
  if (value < min || value > max) return `${label} must be between ${min} and ${max}.`;
  return null;
}

/**
 * Build the full ordered phase list for a session.
 * A break follows every focus block except the last one; the break is long
 * when the completed focus block closes a set of `pomodorosPerSet`.
 *
 * @returns {{error:string}|{phases:Array,totalSeconds:number,focusSeconds:number,breakSeconds:number,focusSharePercent:number,shortBreakCount:number,longBreakCount:number,phaseCount:number}}
 */
export function buildSession({
  focusMinutes = CLASSIC_FOCUS_MINUTES,
  shortBreakMinutes = CLASSIC_SHORT_BREAK_MINUTES,
  longBreakMinutes = CLASSIC_LONG_BREAK_MINUTES,
  pomodorosPerSet = CLASSIC_POMODOROS_PER_SET,
  totalPomodoros = 8,
} = {}) {
  const focus = Number(focusMinutes);
  const shortBreak = Number(shortBreakMinutes);
  const longBreak = Number(longBreakMinutes);
  const perSet = Math.round(Number(pomodorosPerSet));
  const total = Math.round(Number(totalPomodoros));

  const errors = [
    checkRange(focus, "focusMinutes", "Focus length (minutes)"),
    checkRange(shortBreak, "shortBreakMinutes", "Short break (minutes)"),
    checkRange(longBreak, "longBreakMinutes", "Long break (minutes)"),
    checkRange(perSet, "pomodorosPerSet", "Pomodoros before a long break"),
    checkRange(total, "totalPomodoros", "Pomodoros in the session"),
  ].filter(Boolean);
  if (errors.length > 0) return { error: errors[0] };

  const phases = [];
  let cursor = 0;
  let focusSeconds = 0;
  let breakSeconds = 0;
  let shortBreakCount = 0;
  let longBreakCount = 0;

  for (let pomodoro = 1; pomodoro <= total; pomodoro += 1) {
    const focusLength = Math.round(focus * SECONDS_PER_MINUTE);
    phases.push({
      index: phases.length,
      type: "focus",
      label: `Focus ${pomodoro} of ${total}`,
      pomodoro,
      durationSeconds: focusLength,
      startSeconds: cursor,
      endSeconds: cursor + focusLength,
      cue: "focus",
    });
    cursor += focusLength;
    focusSeconds += focusLength;

    if (pomodoro === total) break;

    const isLong = pomodoro % perSet === 0;
    const breakLength = Math.round((isLong ? longBreak : shortBreak) * SECONDS_PER_MINUTE);
    phases.push({
      index: phases.length,
      type: isLong ? "long" : "short",
      label: isLong ? "Long break" : "Short break",
      pomodoro,
      durationSeconds: breakLength,
      startSeconds: cursor,
      endSeconds: cursor + breakLength,
      cue: isLong ? "long" : "short",
    });
    cursor += breakLength;
    breakSeconds += breakLength;
    if (isLong) longBreakCount += 1;
    else shortBreakCount += 1;
  }

  const totalSeconds = cursor;

  return {
    phases,
    phaseCount: phases.length,
    totalSeconds,
    focusSeconds,
    breakSeconds,
    focusSharePercent: totalSeconds > 0 ? (focusSeconds / totalSeconds) * 100 : 0,
    shortBreakCount,
    longBreakCount,
    pomodoroCount: total,
  };
}

/**
 * Which phase is active after `elapsedSeconds` of the session.
 * Boundaries belong to the phase that is starting.
 */
export function phaseAt(session, elapsedSeconds) {
  if (!session || !Array.isArray(session.phases) || session.phases.length === 0) {
    return { error: "No session to run." };
  }
  const elapsed = Number(elapsedSeconds);
  if (!Number.isFinite(elapsed) || elapsed < 0) {
    return { error: "Elapsed time must be zero or more seconds." };
  }
  if (elapsed >= session.totalSeconds) {
    const last = session.phases[session.phases.length - 1];
    return {
      finished: true,
      phase: last,
      phaseIndex: last.index,
      remainingSeconds: 0,
      phaseProgressPercent: 100,
      sessionProgressPercent: 100,
      sessionRemainingSeconds: 0,
    };
  }
  const phase = session.phases.find((item) => elapsed < item.endSeconds) || session.phases[0];
  const intoPhase = elapsed - phase.startSeconds;
  return {
    finished: false,
    phase,
    phaseIndex: phase.index,
    remainingSeconds: Math.max(0, phase.endSeconds - elapsed),
    phaseProgressPercent:
      phase.durationSeconds > 0 ? Math.min(100, (intoPhase / phase.durationSeconds) * 100) : 0,
    sessionProgressPercent:
      session.totalSeconds > 0 ? Math.min(100, (elapsed / session.totalSeconds) * 100) : 0,
    sessionRemainingSeconds: Math.max(0, session.totalSeconds - elapsed),
  };
}

/** Seconds -> "MM:SS", or "H:MM:SS" once the value passes an hour. */
export function formatClock(seconds) {
  const value = Number(seconds);
  if (!Number.isFinite(value) || value < 0) return "00:00";
  const whole = Math.floor(value);
  const hours = Math.floor(whole / 3600);
  const minutes = Math.floor((whole % 3600) / 60);
  const secs = whole % 60;
  const mm = String(minutes).padStart(2, "0");
  const ss = String(secs).padStart(2, "0");
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}

/**
 * Clock time the session ends, given the start time as "HH:MM" (24-hour).
 * Pure — the caller supplies the start time, nothing is read from the system clock.
 */
export function finishClock(startHHMM, totalSeconds) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(String(startHHMM ?? "").trim());
  if (!match) return { error: "Start time must look like 09:30." };
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return { error: "Start time must be a real 24-hour clock time." };
  const total = Number(totalSeconds);
  if (!Number.isFinite(total) || total < 0) return { error: "Session length is not valid." };

  const startMinutes = hours * 60 + minutes;
  const endMinutesRaw = startMinutes + Math.round(total / SECONDS_PER_MINUTE);
  const dayRollover = Math.floor(endMinutesRaw / (24 * 60));
  const endMinutes = ((endMinutesRaw % (24 * 60)) + 24 * 60) % (24 * 60);
  const endHH = String(Math.floor(endMinutes / 60)).padStart(2, "0");
  const endMM = String(endMinutes % 60).padStart(2, "0");
  return { time: `${endHH}:${endMM}`, dayRollover };
}
