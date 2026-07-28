/**
 * Chair yoga routine builder for desk breaks.
 *
 * Hold lengths follow the usual static-stretch guidance of roughly 20-30 seconds
 * per position, held to mild tension rather than pain, which is the range the
 * ACSM flexibility recommendation for adults uses (10-30 seconds, 2-3 times a
 * week or more). The eye break uses the 20-20-20 rule: every 20 minutes look at
 * something about 20 feet (6 m) away for 20 seconds.
 *
 * Informational movement guidance, not physiotherapy.
 */

/** Focus areas, in the order they are worked through. */
export const AREAS = [
  "Neck",
  "Shoulders & chest",
  "Wrists & hands",
  "Spine",
  "Hips & legs",
  "Eyes",
  "Breath",
];

/** Static stretch hold guidance, in seconds (ACSM adult flexibility range). */
export const MIN_HOLD_SECONDS = 10;
export const MAX_HOLD_SECONDS = 60;

/** The 20-20-20 eye break: 20 seconds, every 20 minutes, at about 20 feet. */
export const EYE_BREAK_SECONDS = 20;
export const EYE_BREAK_INTERVAL_MINUTES = 20;

export const MAX_ROUTINE_MINUTES = 45;

/**
 * The pose library. `baseSeconds` is per side when `perSide` is true.
 * `order` fixes the sequence so the same inputs always build the same routine.
 */
export const POSES = [
  {
    id: "neck-side",
    name: "Seated neck side stretch",
    area: "Neck",
    order: 10,
    baseSeconds: 25,
    perSide: true,
    cue: "Sit tall, drop the right ear towards the right shoulder, let the left hand hang heavy. No pulling.",
    caution: "Stop if you feel tingling into the arm or hand.",
  },
  {
    id: "chin-tuck",
    name: "Chin tuck",
    area: "Neck",
    order: 20,
    baseSeconds: 20,
    perSide: false,
    cue: "Slide the chin straight back, making a double chin, without tipping the head down. Hold, release, repeat.",
    caution: "Keep it gentle — this is a small movement.",
  },
  {
    id: "shoulder-rolls",
    name: "Shoulder rolls",
    area: "Shoulders & chest",
    order: 30,
    baseSeconds: 20,
    perSide: false,
    cue: "Roll both shoulders up, back and down in slow full circles, then reverse halfway through.",
    caution: "",
  },
  {
    id: "chest-opener",
    name: "Seated chest opener",
    area: "Shoulders & chest",
    order: 40,
    baseSeconds: 30,
    perSide: false,
    cue: "Clasp the hands behind the chair back, draw the shoulder blades together and lift the chest.",
    caution: "Ease off if the low back pinches.",
  },
  {
    id: "eagle-arms",
    name: "Eagle arms (Garudasana arms)",
    area: "Shoulders & chest",
    order: 50,
    baseSeconds: 25,
    perSide: true,
    cue: "Cross one elbow under the other, wrap the forearms, lift the elbows and widen across the upper back.",
    caution: "Skip the wrap if the shoulder is painful — hold opposite shoulders instead.",
  },
  {
    id: "wrist-flex",
    name: "Wrist flexor and extensor stretch",
    area: "Wrists & hands",
    order: 60,
    baseSeconds: 20,
    perSide: true,
    cue: "Arm straight out, palm up, gently draw the fingers back; then palm down and draw them under.",
    caution: "Back off if there is sharp pain at the wrist crease.",
  },
  {
    id: "prayer-stretch",
    name: "Prayer stretch",
    area: "Wrists & hands",
    order: 70,
    baseSeconds: 20,
    perSide: false,
    cue: "Palms together at chest height, elbows wide, slowly lower the hands until the forearms feel a stretch.",
    caution: "",
  },
  {
    id: "cat-cow",
    name: "Seated cat-cow",
    area: "Spine",
    order: 80,
    baseSeconds: 40,
    perSide: false,
    cue: "Hands on knees. Inhale to arch and open the chest, exhale to round and drop the chin. Move with the breath.",
    caution: "",
  },
  {
    id: "seated-twist",
    name: "Seated spinal twist",
    area: "Spine",
    order: 90,
    baseSeconds: 25,
    perSide: true,
    cue: "Both feet flat, turn towards the chair back, hands light. Lengthen up on the inhale, turn on the exhale.",
    caution: "Do not lever yourself deeper with the chair arm.",
  },
  {
    id: "side-bend",
    name: "Seated side bend",
    area: "Spine",
    order: 100,
    baseSeconds: 25,
    perSide: true,
    cue: "One hand on the seat, reach the other arm overhead and lean away, keeping both sit bones down.",
    caution: "",
  },
  {
    id: "forward-fold",
    name: "Seated forward fold",
    area: "Spine",
    order: 110,
    baseSeconds: 30,
    perSide: false,
    cue: "Feet wide, fold forward from the hips and let the head and arms hang. Roll up slowly.",
    caution: "Come up slowly if you get dizzy standing up quickly.",
  },
  {
    id: "figure-four",
    name: "Seated figure four",
    area: "Hips & legs",
    order: 120,
    baseSeconds: 30,
    perSide: true,
    cue: "Ankle across the opposite knee, flex the foot, hinge forward from the hips with a long spine.",
    caution: "Keep the ankle past the knee, never resting on it, if you have knee pain.",
  },
  {
    id: "hamstring",
    name: "Seated hamstring stretch",
    area: "Hips & legs",
    order: 130,
    baseSeconds: 25,
    perSide: true,
    cue: "Extend one leg, heel down, toes up. Hinge forward from the hips until the back of the thigh lengthens.",
    caution: "",
  },
  {
    id: "ankle-circles",
    name: "Ankle circles and calf pumps",
    area: "Hips & legs",
    order: 140,
    baseSeconds: 20,
    perSide: true,
    cue: "Lift one foot, circle the ankle both ways, then press the toes down and pull them up.",
    caution: "",
  },
  {
    id: "eye-break",
    name: "20-20-20 eye break",
    area: "Eyes",
    order: 150,
    baseSeconds: 20,
    perSide: false,
    cue: "Look at something about 20 feet (6 m) away and let the eyes soften. Blink fully several times.",
    caution: "",
  },
  {
    id: "palming",
    name: "Palming",
    area: "Eyes",
    order: 160,
    baseSeconds: 25,
    perSide: false,
    cue: "Rub the palms warm, cup them lightly over closed eyes without pressing, and breathe slowly.",
    caution: "Never press on the eyeballs.",
  },
  {
    id: "diaphragmatic",
    name: "Seated diaphragmatic breathing",
    area: "Breath",
    order: 170,
    baseSeconds: 45,
    perSide: false,
    cue: "One hand on the ribs, one on the belly. Breathe so the lower hand moves first and the shoulders stay still.",
    caution: "",
  },
  {
    id: "extended-exhale",
    name: "Extended exhale",
    area: "Breath",
    order: 180,
    baseSeconds: 40,
    perSide: false,
    cue: "Inhale for a count of four, exhale for a count of eight. Keep the exhale smooth rather than forced.",
    caution: "Stop if you feel light-headed.",
  },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Build a timed routine that fits a break of a given length.
 *
 * Selection is greedy over a fixed pose order, so the same inputs always give
 * the same routine. Any time left over after selection is shared evenly across
 * the chosen poses, capped at twice the base hold.
 *
 * @param {object} input
 * @param {number} input.minutes            Length of the break.
 * @param {string[]} input.areas            Focus areas to include.
 * @param {number} [input.transitionSeconds] Seconds allowed between poses.
 * @returns {object} routine or { error }
 */
export function buildRoutine({ minutes, areas = [], transitionSeconds = 5 } = {}) {
  if (!isNum(minutes)) return { error: "Enter the length of your break in minutes." };
  if (minutes <= 0) return { error: "The break must be longer than zero minutes." };
  if (minutes > MAX_ROUTINE_MINUTES) {
    return { error: `${MAX_ROUTINE_MINUTES} minutes is the longest routine this builder makes.` };
  }
  if (!Array.isArray(areas) || areas.length === 0) {
    return { error: "Pick at least one area to work on." };
  }
  const unknown = areas.filter((area) => !AREAS.includes(area));
  if (unknown.length > 0) return { error: `Unknown focus area: ${unknown[0]}.` };
  if (!isNum(transitionSeconds) || transitionSeconds < 0) {
    return { error: "Transition time must be zero or more seconds." };
  }
  if (transitionSeconds > 30) {
    return { error: "More than 30 seconds between poses is a break, not a transition." };
  }

  const budget = Math.round(minutes * 60);
  const candidates = POSES.filter((pose) => areas.includes(pose.area)).sort(
    (a, b) => a.order - b.order,
  );

  const chosen = [];
  let used = 0;
  for (const pose of candidates) {
    const sides = pose.perSide ? 2 : 1;
    const cost = pose.baseSeconds * sides + transitionSeconds;
    if (used + cost > budget) continue;
    chosen.push(pose);
    used += cost;
  }

  if (chosen.length === 0) {
    return {
      error: `A ${minutes} minute break is too short for the areas chosen — allow at least ${Math.ceil(
        (candidates[0].baseSeconds * (candidates[0].perSide ? 2 : 1) + transitionSeconds) / 60,
      )} minute(s) or drop the transition time.`,
    };
  }

  // Share leftover time evenly, never taking a single hold past twice its base.
  let leftover = budget - used;
  const extra = new Map();
  let canStillGrow = true;
  while (leftover > 0 && canStillGrow) {
    canStillGrow = false;
    for (const pose of chosen) {
      if (leftover <= 0) break;
      const sides = pose.perSide ? 2 : 1;
      const current = pose.baseSeconds + (extra.get(pose.id) || 0);
      const ceiling = Math.min(MAX_HOLD_SECONDS, pose.baseSeconds * 2);
      if (current >= ceiling) continue;
      const step = Math.min(5, ceiling - current);
      const cost = step * sides;
      if (cost > leftover) continue;
      extra.set(pose.id, (extra.get(pose.id) || 0) + step);
      leftover -= cost;
      canStillGrow = true;
    }
  }

  let offset = 0;
  const steps = chosen.map((pose) => {
    const sides = pose.perSide ? 2 : 1;
    const holdSeconds = pose.baseSeconds + (extra.get(pose.id) || 0);
    const totalSeconds = holdSeconds * sides;
    const step = {
      id: pose.id,
      name: pose.name,
      area: pose.area,
      cue: pose.cue,
      caution: pose.caution,
      perSide: pose.perSide,
      holdSeconds,
      sides,
      totalSeconds,
      startsAt: offset,
      endsAt: offset + totalSeconds,
    };
    offset += totalSeconds + transitionSeconds;
    return step;
  });

  const holdTotal = steps.reduce((sum, step) => sum + step.totalSeconds, 0);
  const transitionTotal = steps.length * transitionSeconds;

  return {
    steps,
    stepCount: steps.length,
    holdTotal,
    transitionTotal,
    routineSeconds: holdTotal + transitionTotal,
    budgetSeconds: budget,
    leftoverSeconds: budget - (holdTotal + transitionTotal),
    areasCovered: AREAS.filter((area) => steps.some((step) => step.area === area)),
    areasSkipped: areas.filter((area) => !steps.some((step) => step.area === area)),
  };
}

/**
 * Which step is running at a given elapsed time? Pure — elapsed comes from the caller.
 *
 * @param {object[]} steps  From buildRoutine().steps
 * @param {number} elapsedSeconds
 * @returns {object|null} { index, step, inTransition, secondsLeft } or null when finished
 */
export function stepAtElapsed(steps, elapsedSeconds) {
  if (!Array.isArray(steps) || steps.length === 0) return null;
  if (!isNum(elapsedSeconds) || elapsedSeconds < 0) return null;

  for (let index = 0; index < steps.length; index += 1) {
    const step = steps[index];
    if (elapsedSeconds < step.endsAt) {
      return {
        index,
        step,
        inTransition: false,
        secondsLeft: step.endsAt - elapsedSeconds,
        progress: step.totalSeconds > 0 ? (elapsedSeconds - step.startsAt) / step.totalSeconds : 0,
      };
    }
    const nextStart = index + 1 < steps.length ? steps[index + 1].startsAt : null;
    if (nextStart !== null && elapsedSeconds < nextStart) {
      return {
        index: index + 1,
        step: steps[index + 1],
        inTransition: true,
        secondsLeft: nextStart - elapsedSeconds,
        progress: 0,
      };
    }
  }
  return null;
}

/** Format a seconds count as m:ss. */
export function formatDuration(totalSeconds) {
  if (!isNum(totalSeconds) || totalSeconds < 0) return "—";
  const rounded = Math.round(totalSeconds);
  const minutes = Math.floor(rounded / 60);
  const seconds = rounded % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
