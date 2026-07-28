/**
 * Eye Exercise Routine Builder — logic only. No React, no DOM, no clock reads.
 *
 * What the drill library is based on:
 *  - The 20-20-20 rule: every 20 minutes of near work, look at something about
 *    20 feet (6 metres) away for 20 seconds. This is the standard optometric
 *    advice for near-work breaks.
 *  - Near-far focus change (also sold as "pencil push-ups") is a vergence and
 *    accommodative exercise. The Convergence Insufficiency Treatment Trial
 *    (CITT) found office-based vergence/accommodative therapy most effective
 *    for symptomatic convergence insufficiency, with home pencil push-ups less
 *    effective but still commonly prescribed as an adjunct.
 *  - Brock string work is a standard convergence exercise prescribed in
 *    vision therapy.
 *  - Warm compress for 5 to 10 minutes is the routine first-line self-care for
 *    meibomian gland dysfunction and evaporative dry eye; lid hygiene sits
 *    alongside it for blepharitis.
 *  - Complete blink drills address the incomplete blinking seen during screen
 *    work.
 *  - Palming and figure-of-eight are relaxation and smooth-pursuit drills. They
 *    ease the feeling of strain; they do not change refractive error.
 *
 * None of these exercises reduce myopia or remove the need for glasses.
 */

/** Minutes of near work between 20-20-20 breaks. */
export const BREAK_INTERVAL_MINUTES = 20;

/** Seconds one 20-20-20 distance break lasts. */
export const BREAK_SECONDS = 20;

/** Distance to focus on during a 20-20-20 break, in metres. */
export const BREAK_DISTANCE_METRES = 6;

export const SECONDS_PER_MINUTE = 60;

/**
 * The drill library. `seconds` is the time for one round of that drill.
 * `category` groups drills so the running order stays sensible: warm-up and
 * lubrication first, focusing work in the middle, relaxation last.
 */
export const DRILLS = [
  {
    id: "warm-compress",
    name: "Warm compress",
    seconds: 300,
    order: 1,
    category: "Lubrication",
    how: "Hold a clean, comfortably warm compress over closed lids. Re-warm it if it cools before the time is up.",
    why: "First-line self-care for meibomian gland dysfunction — heat softens the oil so a blink can express it.",
  },
  {
    id: "lid-hygiene",
    name: "Lid margin cleaning",
    seconds: 60,
    order: 2,
    category: "Lubrication",
    how: "Clean along the lash line with a lid wipe or diluted cleanser on a cotton pad, lids closed, no rubbing the eye itself.",
    why: "Routine care for blepharitis and crusting at the lid margin.",
  },
  {
    id: "blink-drill",
    name: "Complete blink drill",
    seconds: 60,
    order: 3,
    category: "Lubrication",
    how: "Twenty deliberate blinks: close gently, squeeze for 2 seconds, open wide.",
    why: "Screen work produces incomplete blinks that leave the lower cornea uncovered.",
  },
  {
    id: "near-far",
    name: "Near-far focus change",
    seconds: 60,
    order: 4,
    category: "Focusing",
    how: "Hold a thumb about 25 cm away. Focus on it for 5 seconds, then on something at least 6 m away for 5 seconds. Repeat.",
    why: "Exercises the accommodative system that stiffens up during long near work.",
  },
  {
    id: "pencil-pushup",
    name: "Pencil push-up",
    seconds: 90,
    order: 5,
    category: "Focusing",
    how: "Hold a pencil at arm's length, focus on the tip and bring it slowly towards your nose until it doubles, then move it back out.",
    why: "The home exercise studied in the CITT trial for convergence insufficiency — best used alongside, not instead of, prescribed therapy.",
  },
  {
    id: "brock-string",
    name: "Brock string convergence",
    seconds: 120,
    order: 6,
    category: "Focusing",
    how: "With beads on a string held to your nose, shift focus bead to bead and check you see two crossing strings meeting at each bead.",
    why: "Standard convergence and suppression-check drill used in vision therapy.",
  },
  {
    id: "figure-eight",
    name: "Figure-of-eight",
    seconds: 30,
    order: 7,
    category: "Movement",
    how: "Imagine a large figure eight on its side about 3 m away and trace it slowly with your eyes, then reverse direction.",
    why: "Smooth-pursuit movement in every direction, without holding a single fixed focus.",
  },
  {
    id: "eye-rolls",
    name: "Slow eye rolls",
    seconds: 30,
    order: 8,
    category: "Movement",
    how: "Look up, then slowly roll the gaze clockwise through a full circle. Three circles each way, head still.",
    why: "Takes the extraocular muscles through their full range after hours in one position.",
  },
  {
    id: "distance-break",
    name: "20-20-20 distance break",
    seconds: 20,
    order: 9,
    category: "Relaxation",
    how: "Look at something at least 6 m away for a full 20 seconds. Do not shortcut it.",
    why: "The standard near-work break: releases accommodation and lets the blink rate recover.",
  },
  {
    id: "palming",
    name: "Palming",
    seconds: 60,
    order: 10,
    category: "Relaxation",
    how: "Rest warmed palms lightly over closed eyes without pressing on the eyeballs, and breathe slowly.",
    why: "Darkness and warmth with no visual task — a genuine rest rather than an exercise.",
  },
];

export function findDrill(id) {
  return DRILLS.find((drill) => drill.id === id) || null;
}

/** A sensible starting selection for someone with screen-related eye strain. */
export const DEFAULT_SELECTION = ["blink-drill", "near-far", "figure-eight", "distance-break", "palming"];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const round1 = (value) => Math.round(value * 10) / 10;

/** Format seconds as "5:00" or "0:45". */
export function formatClock(totalSeconds) {
  if (!isNum(totalSeconds) || totalSeconds < 0) return "—";
  const whole = Math.round(totalSeconds);
  const minutes = Math.floor(whole / SECONDS_PER_MINUTE);
  const secs = whole % SECONDS_PER_MINUTE;
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

/**
 * Build a routine.
 *
 * @param {object} input
 * @param {string[]} input.selectedIds   Drill ids to include.
 * @param {number} input.rounds          How many times the whole routine runs per day.
 * @param {number} input.restSeconds     Rest between drills, in seconds.
 * @param {number} input.screenHours     Screen hours per day, for the break count.
 * @returns {object} routine, or { error }.
 */
export function buildRoutine({ selectedIds, rounds, restSeconds, screenHours } = {}) {
  if (!Array.isArray(selectedIds)) return { error: "Choose at least one exercise." };
  if (!isNum(rounds) || !isNum(restSeconds) || !isNum(screenHours)) {
    return { error: "Enter a number for rounds, rest and screen hours." };
  }
  if (rounds < 1 || rounds > 10) return { error: "Run the routine between 1 and 10 times a day." };
  if (restSeconds < 0 || restSeconds > 120) return { error: "Rest between drills should be 0 to 120 seconds." };
  if (screenHours < 0 || screenHours > 24) return { error: "Screen hours must be between 0 and 24." };

  const chosen = selectedIds.map(findDrill).filter(Boolean);
  if (chosen.length === 0) return { error: "Choose at least one exercise to build a routine." };

  const ordered = [...chosen].sort((a, b) => a.order - b.order);

  const drillSeconds = ordered.reduce((total, drill) => total + drill.seconds, 0);
  const restTotal = ordered.length > 1 ? restSeconds * (ordered.length - 1) : 0;
  const roundSeconds = drillSeconds + restTotal;
  const dailySeconds = roundSeconds * Math.floor(rounds);
  const weeklyMinutes = round1((dailySeconds * 7) / SECONDS_PER_MINUTE);

  // Running order with the offset each drill starts at inside one round.
  let cursor = 0;
  const steps = ordered.map((drill, index) => {
    const startsAt = cursor;
    cursor += drill.seconds;
    if (index < ordered.length - 1) cursor += restSeconds;
    return {
      ...drill,
      index: index + 1,
      startsAt,
      startsAtClock: formatClock(startsAt),
      durationClock: formatClock(drill.seconds),
    };
  });

  const screenMinutes = Math.round(screenHours * SECONDS_PER_MINUTE);
  const breaksNeeded = Math.floor(screenMinutes / BREAK_INTERVAL_MINUTES);
  const breakSecondsPerDay = breaksNeeded * BREAK_SECONDS;

  const categories = [...new Set(ordered.map((drill) => drill.category))];
  const notes = [];
  if (!categories.includes("Lubrication")) {
    notes.push(
      "No lubrication drill selected. If the main complaint is grittiness or burning, add the blink drill or a warm compress.",
    );
  }
  if (!categories.includes("Relaxation")) {
    notes.push("Finish with the 20-20-20 break or palming so the routine ends with the eyes relaxed, not working.");
  }
  if (roundSeconds > 900) {
    notes.push(
      `One round takes ${formatClock(roundSeconds)}. Routines longer than about 15 minutes rarely survive a working week — trim it or split it across the day.`,
    );
  }
  if (breaksNeeded > 0) {
    notes.push(
      `Separately from the routine, your ${screenHours} screen hours need about ${breaksNeeded} 20-20-20 breaks (${breakSecondsPerDay} seconds in total).`,
    );
  }

  return {
    steps,
    drillCount: ordered.length,
    drillSeconds,
    restTotal,
    roundSeconds,
    roundClock: formatClock(roundSeconds),
    rounds: Math.floor(rounds),
    dailySeconds,
    dailyClock: formatClock(dailySeconds),
    dailyMinutes: round1(dailySeconds / SECONDS_PER_MINUTE),
    weeklyMinutes,
    categories,
    screenHours,
    breaksNeeded,
    breakSecondsPerDay,
    breakIntervalMinutes: BREAK_INTERVAL_MINUTES,
    breakDistanceMetres: BREAK_DISTANCE_METRES,
    notes,
  };
}
