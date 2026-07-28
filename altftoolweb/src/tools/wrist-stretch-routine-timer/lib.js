/**
 * Wrist Stretch Routine Timer — pure routine construction and timeline maths.
 *
 * No timers, no DOM: the component owns the clock and asks this module what
 * should be on screen at a given number of elapsed seconds.
 */

/**
 * ACSM Position Stand on flexibility (Med Sci Sports Exerc, 2011) — static
 * stretches are held 10 to 30 seconds; longer holds bring no extra benefit for
 * most adults. The tool therefore accepts holds from 10 to 60 seconds.
 */
export const MIN_HOLD_SECONDS = 10;
export const MAX_HOLD_SECONDS = 60;
export const DEFAULT_HOLD_SECONDS = 30;

/** Short changeover gap so you can reposition between holds. */
export const MIN_REST_SECONDS = 0;
export const MAX_REST_SECONDS = 30;
export const DEFAULT_REST_SECONDS = 5;

/**
 * NIOSH / OSHA computer-workstation guidance for intensive keyboard work:
 * take a short break away from the keyboard roughly every 30 to 60 minutes.
 */
export const SUGGESTED_BREAK_INTERVAL_MIN = 45;

/**
 * `type: "hold"` steps use your chosen hold length. `type: "move"` steps are
 * mobility drills with a fixed sensible duration of their own.
 */
export const STRETCHES = [
  {
    id: "wrist-flexor",
    name: "Wrist flexor stretch",
    cue: "Arm straight out, palm up. With the other hand, gently pull the fingers down and back until you feel a stretch along the inside of the forearm.",
    type: "hold",
    seconds: DEFAULT_HOLD_SECONDS,
    perSide: true,
  },
  {
    id: "wrist-extensor",
    name: "Wrist extensor stretch",
    cue: "Arm straight out, palm down. Press the back of the hand downward with the other hand to stretch the top of the forearm.",
    type: "hold",
    seconds: DEFAULT_HOLD_SECONDS,
    perSide: true,
  },
  {
    id: "prayer",
    name: "Prayer stretch",
    cue: "Palms together in front of the chest, elbows out. Lower the hands towards the waist, keeping the palms pressed together.",
    type: "hold",
    seconds: DEFAULT_HOLD_SECONDS,
    perSide: false,
  },
  {
    id: "reverse-prayer",
    name: "Reverse prayer stretch",
    cue: "Backs of the hands together, fingers pointing down, in front of the chest. Raise the elbows slightly until the outer forearms lengthen.",
    type: "hold",
    seconds: DEFAULT_HOLD_SECONDS,
    perSide: false,
  },
  {
    id: "wrist-circles",
    name: "Wrist circles",
    cue: "Loose fists, forearms still. Circle both wrists slowly — ten one way, ten the other. Keep the movement smooth, never forced.",
    type: "move",
    seconds: 30,
    perSide: false,
  },
  {
    id: "tendon-glides",
    name: "Finger tendon glides",
    cue: "Start with a flat hand, then move through hook fist, full fist and tabletop, pausing a moment in each shape. Repeat slowly.",
    type: "move",
    seconds: 40,
    perSide: false,
  },
  {
    id: "median-nerve-glide",
    name: "Median nerve glide",
    cue: "Arm out to the side, palm up, fingers open. Gently tip the head away while easing the wrist back, then release. Move in and out of the position — never hold at the point of tingling.",
    type: "move",
    seconds: 30,
    perSide: true,
    caution:
      "Nerve glides should feel like a light pull. Stop if you get numbness, tingling or shooting pain and have the symptoms assessed.",
  },
  {
    id: "thumb-stretch",
    name: "Thumb and base-of-thumb stretch",
    cue: "Tuck the thumb into a loose fist, then tilt the wrist gently towards the little-finger side until the thumb side of the wrist lengthens.",
    type: "hold",
    seconds: DEFAULT_HOLD_SECONDS,
    perSide: true,
  },
  {
    id: "forearm-rotation",
    name: "Pronation and supination",
    cue: "Elbows tucked at your sides, bent to 90 degrees. Turn the palms fully up, then fully down, keeping the elbows still.",
    type: "move",
    seconds: 30,
    perSide: false,
  },
  {
    id: "shake-out",
    name: "Shake out and relax",
    cue: "Drop the shoulders, let the arms hang and shake the hands loosely. Finish with slow breathing before you go back to the keyboard.",
    type: "move",
    seconds: 20,
    perSide: false,
  },
];

export const ROUTINE_LEVELS = [
  {
    id: "quick",
    label: "Quick reset",
    blurb: "The two essential forearm stretches plus a shake-out.",
    stretchIds: ["wrist-flexor", "wrist-extensor", "shake-out"],
  },
  {
    id: "standard",
    label: "Standard routine",
    blurb: "Both forearm lines, the prayer stretch and tendon mobility.",
    stretchIds: ["wrist-flexor", "wrist-extensor", "prayer", "tendon-glides", "wrist-circles", "shake-out"],
  },
  {
    id: "full",
    label: "Full session",
    blurb: "Everything, including thumb and rotation work — for a long typing day.",
    stretchIds: [
      "wrist-flexor",
      "wrist-extensor",
      "prayer",
      "reverse-prayer",
      "wrist-circles",
      "tendon-glides",
      "median-nerve-glide",
      "thumb-stretch",
      "forearm-rotation",
      "shake-out",
    ],
  },
];

const STRETCH_BY_ID = STRETCHES.reduce((map, stretch) => {
  map[stretch.id] = stretch;
  return map;
}, {});

const toFinite = (value) => {
  const parsed = Number(String(value ?? "").trim());
  return Number.isFinite(parsed) ? parsed : NaN;
};

/** 155 -> "2:35". Negative or non-finite input clamps to "0:00". */
export function formatMmSs(totalSeconds) {
  const safe = Number.isFinite(totalSeconds) && totalSeconds > 0 ? Math.round(totalSeconds) : 0;
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/**
 * Build the timed step list for a routine.
 *
 * @param {object} input
 * @param {string} input.levelId       One of ROUTINE_LEVELS ids.
 * @param {number} input.holdSeconds   Hold length for static stretches.
 * @param {number} input.restSeconds   Changeover gap between steps.
 * @param {boolean} input.includeNerveGlides Keep the median nerve glide in the full routine.
 */
export function buildRoutine({
  levelId = "standard",
  holdSeconds = DEFAULT_HOLD_SECONDS,
  restSeconds = DEFAULT_REST_SECONDS,
  includeNerveGlides = false,
} = {}) {
  const level = ROUTINE_LEVELS.find((item) => item.id === levelId);
  if (!level) return { error: "Pick one of the available routines." };

  const hold = toFinite(holdSeconds);
  const rest = toFinite(restSeconds);
  if (Number.isNaN(hold) || Number.isNaN(rest)) {
    return { error: "Hold and rest lengths must be numbers." };
  }
  if (hold < MIN_HOLD_SECONDS || hold > MAX_HOLD_SECONDS) {
    return { error: `Hold each stretch for ${MIN_HOLD_SECONDS} to ${MAX_HOLD_SECONDS} seconds.` };
  }
  if (rest < MIN_REST_SECONDS || rest > MAX_REST_SECONDS) {
    return { error: `Rest between steps must be ${MIN_REST_SECONDS} to ${MAX_REST_SECONDS} seconds.` };
  }

  const holdLen = Math.round(hold);
  const restLen = Math.round(rest);

  const chosen = level.stretchIds
    .map((id) => STRETCH_BY_ID[id])
    .filter(Boolean)
    .filter((stretch) => includeNerveGlides || stretch.id !== "median-nerve-glide");

  if (chosen.length === 0) return { error: "This routine has no stretches left to run." };

  const active = [];
  for (const stretch of chosen) {
    const seconds = stretch.type === "hold" ? holdLen : stretch.seconds;
    if (stretch.perSide) {
      active.push({ stretch, side: "Left", seconds });
      active.push({ stretch, side: "Right", seconds });
    } else {
      active.push({ stretch, side: null, seconds });
    }
  }

  const steps = [];
  let cursor = 0;
  active.forEach((item, index) => {
    steps.push({
      key: `${item.stretch.id}-${item.side ?? "both"}`,
      kind: "stretch",
      id: item.stretch.id,
      name: item.side ? `${item.stretch.name} — ${item.side} side` : item.stretch.name,
      cue: item.stretch.cue,
      caution: item.stretch.caution ?? null,
      seconds: item.seconds,
      start: cursor,
      end: cursor + item.seconds,
    });
    cursor += item.seconds;

    if (restLen > 0 && index < active.length - 1) {
      steps.push({
        key: `rest-${index}`,
        kind: "rest",
        id: "rest",
        name: "Change over",
        cue: "Let the arms hang loose and get into position for the next stretch.",
        caution: null,
        seconds: restLen,
        start: cursor,
        end: cursor + restLen,
      });
      cursor += restLen;
    }
  });

  const stretchSeconds = steps
    .filter((step) => step.kind === "stretch")
    .reduce((sum, step) => sum + step.seconds, 0);

  return {
    levelId: level.id,
    levelLabel: level.label,
    steps,
    stretchCount: active.length,
    holdSeconds: holdLen,
    restSeconds: restLen,
    stretchSeconds,
    restTotalSeconds: cursor - stretchSeconds,
    totalSeconds: cursor,
    sessionsPerDay: 3,
    dailySeconds: cursor * 3,
  };
}

/**
 * Where are we at `elapsedSeconds` into the routine?
 * Returns the active step plus remaining time, or done:true once past the end.
 */
export function stepAtElapsed(routine, elapsedSeconds) {
  if (!routine || routine.error || !Array.isArray(routine.steps) || routine.steps.length === 0) {
    return { error: "No routine to run." };
  }
  const elapsed = toFinite(elapsedSeconds);
  if (Number.isNaN(elapsed) || elapsed < 0) {
    return { error: "Elapsed time must be zero or more." };
  }
  if (elapsed >= routine.totalSeconds) {
    return {
      done: true,
      index: routine.steps.length - 1,
      step: routine.steps[routine.steps.length - 1],
      remainingInStep: 0,
      remainingTotal: 0,
      progressPct: 100,
    };
  }
  const index = routine.steps.findIndex((step) => elapsed >= step.start && elapsed < step.end);
  const safeIndex = index === -1 ? 0 : index;
  const step = routine.steps[safeIndex];
  return {
    done: false,
    index: safeIndex,
    step,
    remainingInStep: Math.max(0, Math.ceil(step.end - elapsed)),
    remainingTotal: Math.max(0, Math.ceil(routine.totalSeconds - elapsed)),
    progressPct: (elapsed / routine.totalSeconds) * 100,
  };
}
