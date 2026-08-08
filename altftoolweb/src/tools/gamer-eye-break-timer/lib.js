/**
 * Eye breaks placed on match boundaries — pure logic, no DOM.
 *
 * The target is the 20-20-20 rule: after at most 20 minutes of near work, look
 * about 20 feet (6.1 m) away for at least 20 seconds. The constraint gaming
 * adds is that you cannot stop mid-round without letting a team down, so the
 * only usable slot is the lobby between matches. This module works out how
 * many matches fit inside a 20 minute window, whether the lobby is long enough
 * to serve as the break, and by how much a long match format overshoots the
 * rule no matter how you schedule it.
 */

/** Maximum near-work run before a break is due, in seconds. */
export const RULE_INTERVAL_SECONDS = 20 * 60;
/** Minimum break length, in seconds. */
export const MIN_BREAK_SECONDS = 20;
/** 20 feet in metres (1 foot = 0.3048 m exactly). */
export const BREAK_DISTANCE_METRES = 6.1;
/** Standard ergonomic advice: get up and move at least once an hour. */
export const STAND_UP_INTERVAL_MINUTES = 60;

export const LIMITS = {
  sessionMinutes: { min: 15, max: 600 },
  matchMinutes: { min: 1, max: 90 },
  lobbySeconds: { min: 0, max: 600 },
};

export const MAX_PHASES = 600;

export const PHASE_KINDS = {
  MATCH: "match",
  LOBBY: "lobby",
  BREAK: "break",
  DONE: "done",
};

/** Rough match lengths by format. Real times vary with mode and skill bracket. */
export const FORMAT_PRESETS = [
  { id: "mobile", name: "Casual mobile match", matchMinutes: 4, lobbySeconds: 30 },
  { id: "racing", name: "Racing race", matchMinutes: 6, lobbySeconds: 45 },
  { id: "fighting", name: "Fighting game set", matchMinutes: 7, lobbySeconds: 40 },
  { id: "shooter", name: "Team shooter round", matchMinutes: 12, lobbySeconds: 60 },
  { id: "battleRoyale", name: "Battle royale drop", matchMinutes: 20, lobbySeconds: 90 },
  { id: "moba", name: "MOBA match", matchMinutes: 32, lobbySeconds: 90 },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

function checkRange(value, bounds, label) {
  if (!isNum(value)) return `${label} must be a number.`;
  if (value < bounds.min) return `${label} cannot be below ${bounds.min}.`;
  if (value > bounds.max) return `${label} cannot be above ${bounds.max}.`;
  return null;
}

/** Seconds -> m:ss (h:mm:ss past an hour). Never NaN. */
export function formatClock(totalSeconds) {
  const safe = isNum(totalSeconds) && totalSeconds > 0 ? Math.round(totalSeconds) : 0;
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`;
}

/**
 * @returns {{error:string}|object}
 */
export function buildGamerPlan({ sessionMinutes = 120, matchMinutes = 12, lobbySeconds = 60 } = {}) {
  const problem =
    checkRange(sessionMinutes, LIMITS.sessionMinutes, "Session length (minutes)") ||
    checkRange(matchMinutes, LIMITS.matchMinutes, "Match length (minutes)") ||
    checkRange(lobbySeconds, LIMITS.lobbySeconds, "Lobby and queue time (seconds)");
  if (problem) return { error: problem };

  const sessionSeconds = Math.round(sessionMinutes * 60);
  const matchSeconds = Math.round(matchMinutes * 60);
  const lobby = Math.round(lobbySeconds);
  const cycleSeconds = matchSeconds + lobby;

  // How many whole matches fit inside one 20 minute near-work window. A single
  // match longer than the window still counts as one — you cannot break inside
  // a live round, so the schedule accepts the overshoot and reports it.
  // n matches + (n-1) lobbies between them must fit the window, i.e.
  // n*matchSeconds + (n-1)*lobby <= RULE_INTERVAL_SECONDS, which rearranges to
  // n <= (RULE_INTERVAL_SECONDS + lobby) / cycleSeconds.
  const matchesPerBreak = Math.max(1, Math.floor((RULE_INTERVAL_SECONDS + lobby) / cycleSeconds));
  const nominalIntervalSeconds = matchesPerBreak * matchSeconds + (matchesPerBreak - 1) * lobby;
  const overshootSeconds = Math.max(0, nominalIntervalSeconds - RULE_INTERVAL_SECONDS);
  const lobbyCoversBreak = lobby >= MIN_BREAK_SECONDS;

  const phases = [];
  let clock = 0;
  let matchIndex = 0;

  while (clock < sessionSeconds && phases.length < MAX_PHASES) {
    matchIndex += 1;
    phases.push({
      kind: PHASE_KINDS.MATCH,
      label: `Match ${matchIndex}`,
      hint: "Live round. Nothing interrupts this — the break waits for the lobby.",
      seconds: matchSeconds,
      match: matchIndex,
    });
    clock += matchSeconds;
    if (clock >= sessionSeconds || phases.length >= MAX_PHASES) break;

    const isBreakPoint = matchIndex % matchesPerBreak === 0;
    if (isBreakPoint) {
      const breakLength = Math.max(lobby, MIN_BREAK_SECONDS);
      phases.push({
        kind: PHASE_KINDS.BREAK,
        label: "Eye break in the lobby",
        hint: `Do not queue yet. Look about ${BREAK_DISTANCE_METRES} m away — a window or across the room — and blink properly.`,
        seconds: breakLength,
        match: matchIndex,
        added: Math.max(0, MIN_BREAK_SECONDS - lobby),
      });
      clock += breakLength;
    } else {
      phases.push({
        kind: PHASE_KINDS.LOBBY,
        label: "Lobby and queue",
        hint: "Still screen time. Loadouts and menus are near work like anything else.",
        seconds: lobby,
        match: matchIndex,
      });
      clock += lobby;
    }
  }

  // Trim to the requested session length - except a live MATCH phase, which
  // can never be cut short (you cannot break mid-round). Break/lobby phases
  // are still clamped to whatever room remains; a trailing match is left at
  // its full length even when that pushes `used`/`totalSeconds` past
  // sessionSeconds, so the running timer never truncates a live round.
  const trimmed = [];
  let used = 0;
  for (const phase of phases) {
    if (used >= sessionSeconds) break;
    const room = sessionSeconds - used;
    const seconds = phase.kind === PHASE_KINDS.MATCH ? phase.seconds : Math.min(phase.seconds, room);
    trimmed.push({ ...phase, seconds });
    used += seconds;
  }

  const totalSeconds = used;
  const matches = trimmed.filter((phase) => phase.kind === PHASE_KINDS.MATCH).length;
  const breaks = trimmed.filter((phase) => phase.kind === PHASE_KINDS.BREAK).length;
  const breakSecondsTotal = trimmed
    .filter((phase) => phase.kind === PHASE_KINDS.BREAK)
    .reduce((sum, phase) => sum + phase.seconds, 0);
  const addedSeconds = trimmed
    .filter((phase) => phase.kind === PHASE_KINDS.BREAK)
    .reduce((sum, phase) => sum + (phase.added || 0), 0);

  // Longest run of continuous screen time; only a break phase resets it.
  let longestRun = 0;
  let run = 0;
  for (const phase of trimmed) {
    if (phase.kind === PHASE_KINDS.BREAK) {
      run = 0;
    } else {
      run += phase.seconds;
      if (run > longestRun) longestRun = run;
    }
  }
  // A live match can never be cut short (you cannot break mid-round), so the
  // real longest run is never less than one full match — even when the
  // trimming above clips the final phase's *reported* seconds down to fit the
  // requested session length exactly.
  if (matches > 0) longestRun = Math.max(longestRun, matchSeconds);

  const hours = totalSeconds / 3600;

  return {
    phases: trimmed,
    totalSeconds,
    matchSeconds,
    lobbySeconds: lobby,
    cycleSeconds,
    matchesPerBreak,
    nominalIntervalSeconds,
    overshootSeconds,
    overshootMinutes: Math.round((overshootSeconds / 60) * 10) / 10,
    lobbyCoversBreak,
    matches,
    breaks,
    breakSecondsTotal,
    addedSeconds,
    longestRunSeconds: longestRun,
    longestRunMinutes: Math.round((longestRun / 60) * 10) / 10,
    withinRule: longestRun <= RULE_INTERVAL_SECONDS,
    matchLongerThanWindow: matchSeconds > RULE_INTERVAL_SECONDS,
    matchesPerHour: hours > 0 ? Math.round((matches / hours) * 10) / 10 : 0,
    standUpBreaks: Math.floor(totalSeconds / (STAND_UP_INTERVAL_MINUTES * 60)),
    truncated: phases.length >= MAX_PHASES,
  };
}

/** Which phase is running at `elapsedSeconds`. */
export function phaseAt(phases, elapsedSeconds) {
  const list = Array.isArray(phases) ? phases : [];
  const total = list.reduce((sum, phase) => sum + (isNum(phase.seconds) ? phase.seconds : 0), 0);
  const t = isNum(elapsedSeconds) && elapsedSeconds > 0 ? elapsedSeconds : 0;

  if (list.length === 0) {
    return { index: -1, phase: null, remaining: 0, overallProgress: 0, done: true, breaksTaken: 0 };
  }
  if (t >= total) {
    return {
      index: list.length,
      phase: {
        kind: PHASE_KINDS.DONE,
        label: "Session finished",
        hint: "Log off, stand up and look at something far away for longer than twenty seconds.",
        seconds: 0,
        match: 0,
      },
      remaining: 0,
      overallProgress: 1,
      done: true,
      breaksTaken: list.filter((phase) => phase.kind === PHASE_KINDS.BREAK).length,
    };
  }

  let cursor = 0;
  let breaksTaken = 0;
  for (let index = 0; index < list.length; index += 1) {
    const phase = list[index];
    const length = isNum(phase.seconds) ? phase.seconds : 0;
    if (t < cursor + length) {
      return {
        index,
        phase,
        remaining: Math.max(0, cursor + length - t),
        overallProgress: total > 0 ? t / total : 1,
        done: false,
        breaksTaken,
      };
    }
    if (phase.kind === PHASE_KINDS.BREAK) breaksTaken += 1;
    cursor += length;
  }

  return { index: list.length, phase: null, remaining: 0, overallProgress: 1, done: true, breaksTaken };
}
