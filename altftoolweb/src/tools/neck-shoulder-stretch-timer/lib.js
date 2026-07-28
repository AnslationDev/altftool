/**
 * Neck and Shoulder Stretch Timer — pure routine and break-scheduling maths.
 * No React, no timers: the component owns the clock and queries this module.
 */

/**
 * ACSM Position Stand on flexibility (Med Sci Sports Exerc, 2011): hold static
 * stretches 10 to 30 seconds. Cervical stretches are held gently at the low end.
 */
export const MIN_HOLD_SECONDS = 10;
export const MAX_HOLD_SECONDS = 45;
export const DEFAULT_HOLD_SECONDS = 25;

export const MIN_REST_SECONDS = 0;
export const MAX_REST_SECONDS = 30;
export const DEFAULT_REST_SECONDS = 5;

/** Focus-block lengths people actually use, from a 15-minute micro-block to a 3-hour deep block. */
export const MIN_BLOCK_MINUTES = 15;
export const MAX_BLOCK_MINUTES = 180;
export const DEFAULT_BLOCK_MINUTES = 50;

/**
 * Rolling the head backwards through a full circle compresses the cervical
 * facet joints and is advised against in standard physiotherapy guidance, so no
 * step in this routine includes a full neck circle.
 */
export const NO_FULL_NECK_CIRCLES = true;

export const STRETCHES = [
  {
    id: "chin-tuck",
    name: "Chin tuck",
    cue: "Sit tall, eyes level. Glide the chin straight back as if making a double chin, hold two seconds, release. Repeat slowly — no tilting up or down.",
    type: "move",
    seconds: 30,
    perSide: false,
  },
  {
    id: "upper-trapezius",
    name: "Upper trapezius stretch",
    cue: "Sit on your hand to anchor the shoulder down. Tip the opposite ear towards that shoulder until you feel a stretch along the side of the neck.",
    type: "hold",
    seconds: DEFAULT_HOLD_SECONDS,
    perSide: true,
  },
  {
    id: "levator-scapulae",
    name: "Levator scapulae stretch",
    cue: "Anchor one shoulder down, turn the head about 45 degrees away, then look down towards the opposite pocket. The stretch runs from the base of the skull to the shoulder blade.",
    type: "hold",
    seconds: DEFAULT_HOLD_SECONDS,
    perSide: true,
  },
  {
    id: "neck-rotation",
    name: "Slow neck rotation",
    cue: "Turn the head slowly to look over one shoulder, pause, then the other. Stay within a comfortable range and keep the chin level — no full head circles.",
    type: "move",
    seconds: 30,
    perSide: false,
  },
  {
    id: "scalene",
    name: "Scalene stretch",
    cue: "Anchor the collarbone with one hand, tip the ear away and rotate the chin slightly upward on the same side. Very gentle — this is a small movement.",
    type: "hold",
    seconds: DEFAULT_HOLD_SECONDS,
    perSide: true,
    caution:
      "Ease off immediately if you feel tingling, pins and needles or pain travelling down the arm.",
  },
  {
    id: "shoulder-rolls",
    name: "Shoulder rolls",
    cue: "Roll both shoulders up, back and down in a slow, full circle. Ten backwards, then five forwards.",
    type: "move",
    seconds: 30,
    perSide: false,
  },
  {
    id: "scapular-squeeze",
    name: "Scapular squeezes",
    cue: "Draw the shoulder blades down and together as if pinching a pencil between them. Hold three seconds, release, repeat.",
    type: "move",
    seconds: 30,
    perSide: false,
  },
  {
    id: "doorway-pec",
    name: "Doorway chest stretch",
    cue: "Forearms on a doorframe, elbows at shoulder height. Step one foot through until the front of the chest and shoulders open.",
    type: "hold",
    seconds: DEFAULT_HOLD_SECONDS,
    perSide: false,
  },
  {
    id: "thoracic-extension",
    name: "Thoracic extension over the chair",
    cue: "Hands behind the head, upper back against the top of the chair back. Ease the upper back over the edge, breathe out, return. Keep the lower back still.",
    type: "move",
    seconds: 30,
    perSide: false,
  },
  {
    id: "shrug-release",
    name: "Shrug and release",
    cue: "Shrug both shoulders hard towards the ears for three seconds, then drop them completely. Repeat, finishing with a long slow breath out.",
    type: "move",
    seconds: 20,
    perSide: false,
  },
];

export const ROUTINE_LEVELS = [
  {
    id: "micro",
    label: "Micro break",
    blurb: "Chin tucks, both traps and shoulder rolls.",
    stretchIds: ["chin-tuck", "upper-trapezius", "shoulder-rolls"],
  },
  {
    id: "standard",
    label: "Standard release",
    blurb: "Adds the levator scapulae stretch and scapular work.",
    stretchIds: ["chin-tuck", "upper-trapezius", "levator-scapulae", "scapular-squeeze", "shoulder-rolls"],
  },
  {
    id: "full",
    label: "Full upper-body reset",
    blurb: "Neck, chest and upper back, for the end of a screen-heavy day.",
    stretchIds: [
      "chin-tuck",
      "upper-trapezius",
      "levator-scapulae",
      "neck-rotation",
      "scalene",
      "shoulder-rolls",
      "scapular-squeeze",
      "doorway-pec",
      "thoracic-extension",
      "shrug-release",
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

/** 155 -> "2:35". */
export function formatMmSs(totalSeconds) {
  const safe = Number.isFinite(totalSeconds) && totalSeconds > 0 ? Math.round(totalSeconds) : 0;
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/** Build the timed step list for one stretch break. */
export function buildRoutine({
  levelId = "standard",
  holdSeconds = DEFAULT_HOLD_SECONDS,
  restSeconds = DEFAULT_REST_SECONDS,
} = {}) {
  const level = ROUTINE_LEVELS.find((item) => item.id === levelId);
  if (!level) return { error: "Pick one of the available routines." };

  const hold = toFinite(holdSeconds);
  const rest = toFinite(restSeconds);
  if (Number.isNaN(hold) || Number.isNaN(rest)) {
    return { error: "Hold and changeover lengths must be numbers." };
  }
  if (hold < MIN_HOLD_SECONDS || hold > MAX_HOLD_SECONDS) {
    return { error: `Hold each stretch for ${MIN_HOLD_SECONDS} to ${MAX_HOLD_SECONDS} seconds.` };
  }
  if (rest < MIN_REST_SECONDS || rest > MAX_REST_SECONDS) {
    return { error: `Changeover must be ${MIN_REST_SECONDS} to ${MAX_REST_SECONDS} seconds.` };
  }

  const holdLen = Math.round(hold);
  const restLen = Math.round(rest);

  const active = [];
  for (const id of level.stretchIds) {
    const stretch = STRETCH_BY_ID[id];
    if (!stretch) continue;
    const seconds = stretch.type === "hold" ? holdLen : stretch.seconds;
    if (stretch.perSide) {
      active.push({ stretch, side: "Left", seconds });
      active.push({ stretch, side: "Right", seconds });
    } else {
      active.push({ stretch, side: null, seconds });
    }
  }
  if (active.length === 0) return { error: "This routine has no stretches left to run." };

  const steps = [];
  let cursor = 0;
  active.forEach((item, index) => {
    steps.push({
      key: `${item.stretch.id}-${item.side ?? "both"}`,
      kind: "stretch",
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
        name: "Change over",
        cue: "Shoulders down, arms loose. Get set for the next stretch.",
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
  };
}

/**
 * How many of these breaks fit in a workday of focus blocks?
 * One cycle = one focus block followed by one stretch break.
 */
export function planBreaks({ workdayHours, blockMinutes, routineSeconds } = {}) {
  const workday = toFinite(workdayHours);
  const block = toFinite(blockMinutes);
  const routine = toFinite(routineSeconds);

  if ([workday, block, routine].some((value) => Number.isNaN(value))) {
    return { error: "Workday and focus block length must be numbers." };
  }
  if (workday <= 0 || workday > 16) return { error: "Enter a workday between 0 and 16 hours." };
  if (block < MIN_BLOCK_MINUTES || block > MAX_BLOCK_MINUTES) {
    return { error: `Focus blocks should be ${MIN_BLOCK_MINUTES} to ${MAX_BLOCK_MINUTES} minutes long.` };
  }
  if (routine <= 0) return { error: "The routine has no length to schedule." };

  const totalSec = Math.round(workday * 3600);
  const blockSec = Math.round(block * 60);
  const cycleSec = blockSec + Math.round(routine);
  if (cycleSec > totalSec) {
    return {
      error: "One focus block plus a stretch break is longer than the whole workday — shorten the block.",
    };
  }

  const breaks = Math.floor(totalSec / cycleSec);
  const stretchSec = breaks * Math.round(routine);
  const focusSec = totalSec - stretchSec;
  const leftoverSec = totalSec - breaks * cycleSec;

  return {
    breaks,
    totalSec,
    blockSec,
    cycleSec,
    stretchSec,
    focusSec,
    leftoverSec,
    stretchSharePct: (stretchSec / totalSec) * 100,
  };
}

/** Which step is on screen at `elapsedSeconds` into the routine? */
export function stepAtElapsed(routine, elapsedSeconds) {
  if (!routine || routine.error || !Array.isArray(routine.steps) || routine.steps.length === 0) {
    return { error: "No routine to run." };
  }
  const elapsed = toFinite(elapsedSeconds);
  if (Number.isNaN(elapsed) || elapsed < 0) return { error: "Elapsed time must be zero or more." };

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
