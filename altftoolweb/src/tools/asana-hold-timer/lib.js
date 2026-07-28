/**
 * Asana sequence timing.
 *
 * A sequence is a list of poses, each with a hold length and a flag for whether
 * it is done on both sides. Poses are expanded into segments (a two-sided pose
 * becomes two segments), transitions are inserted between segments but not after
 * the last one, and breath counts come from a single "seconds per breath"
 * setting — a full inhale plus exhale, commonly 4-6 seconds in a steady practice.
 */

/** Bounds that keep a sequence sane. */
export const MIN_HOLD_SECONDS = 5;
export const MAX_HOLD_SECONDS = 900;
export const MIN_BREATH_SECONDS = 2;
export const MAX_BREATH_SECONDS = 20;
export const MAX_TRANSITION_SECONDS = 60;
export const MAX_ROUNDS = 10;
export const MAX_POSES = 40;

/** Ready-made sequences. Seconds are per side where perSide is true. */
export const PRESETS = [
  {
    id: "morning",
    name: "Morning wake-up",
    poses: [
      { name: "Tadasana (mountain)", seconds: 30, perSide: false },
      { name: "Urdhva Hastasana (upward salute)", seconds: 30, perSide: false },
      { name: "Uttanasana (standing forward fold)", seconds: 30, perSide: false },
      { name: "Ashwa Sanchalanasana (low lunge)", seconds: 30, perSide: true },
      { name: "Adho Mukha Svanasana (downward dog)", seconds: 45, perSide: false },
      { name: "Balasana (child's pose)", seconds: 60, perSide: false },
    ],
  },
  {
    id: "hips",
    name: "Hip openers",
    poses: [
      { name: "Baddha Konasana (bound angle)", seconds: 60, perSide: false },
      { name: "Malasana (garland squat)", seconds: 45, perSide: false },
      { name: "Anjaneyasana (crescent lunge)", seconds: 45, perSide: true },
      { name: "Eka Pada Rajakapotasana (pigeon)", seconds: 60, perSide: true },
      { name: "Supta Baddha Konasana (reclined bound angle)", seconds: 90, perSide: false },
    ],
  },
  {
    id: "strength",
    name: "Core and strength",
    poses: [
      { name: "Phalakasana (plank)", seconds: 45, perSide: false },
      { name: "Vasisthasana (side plank)", seconds: 30, perSide: true },
      { name: "Navasana (boat)", seconds: 30, perSide: false },
      { name: "Setu Bandhasana (bridge)", seconds: 45, perSide: false },
      { name: "Salabhasana (locust)", seconds: 30, perSide: false },
    ],
  },
  {
    id: "balance",
    name: "Standing balance",
    poses: [
      { name: "Vrksasana (tree)", seconds: 45, perSide: true },
      { name: "Utthita Trikonasana (extended triangle)", seconds: 45, perSide: true },
      { name: "Virabhadrasana III (warrior 3)", seconds: 30, perSide: true },
      { name: "Garudasana (eagle)", seconds: 30, perSide: true },
    ],
  },
  {
    id: "winddown",
    name: "Wind-down before bed",
    poses: [
      { name: "Balasana (child's pose)", seconds: 90, perSide: false },
      { name: "Supta Matsyendrasana (reclined twist)", seconds: 60, perSide: true },
      { name: "Viparita Karani (legs up the wall)", seconds: 180, perSide: false },
      { name: "Savasana (corpse pose)", seconds: 300, perSide: false },
    ],
  },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Expand poses into timed segments and total the sequence.
 *
 * @param {object} input
 * @param {Array<{name:string, seconds:number, perSide:boolean}>} input.poses
 * @param {number} [input.secondsPerBreath]  Length of one full breath.
 * @param {number} [input.transitionSeconds] Gap between segments.
 * @param {number} [input.rounds]            How many times to repeat the sequence.
 * @returns {object} sequence or { error }
 */
export function computeSequence({
  poses = [],
  secondsPerBreath = 5,
  transitionSeconds = 5,
  rounds = 1,
} = {}) {
  if (!Array.isArray(poses) || poses.length === 0) {
    return { error: "Add at least one pose to the sequence." };
  }
  if (poses.length > MAX_POSES) {
    return { error: `A sequence of more than ${MAX_POSES} poses is beyond this timer.` };
  }
  if (!isNum(secondsPerBreath) || secondsPerBreath < MIN_BREATH_SECONDS || secondsPerBreath > MAX_BREATH_SECONDS) {
    return {
      error: `One full breath should be between ${MIN_BREATH_SECONDS} and ${MAX_BREATH_SECONDS} seconds.`,
    };
  }
  if (!isNum(transitionSeconds) || transitionSeconds < 0 || transitionSeconds > MAX_TRANSITION_SECONDS) {
    return { error: `Transition time must be between 0 and ${MAX_TRANSITION_SECONDS} seconds.` };
  }
  if (!isNum(rounds) || rounds < 1 || rounds > MAX_ROUNDS || Math.floor(rounds) !== rounds) {
    return { error: `Rounds must be a whole number between 1 and ${MAX_ROUNDS}.` };
  }

  for (const pose of poses) {
    if (!pose || typeof pose.name !== "string" || pose.name.trim() === "") {
      return { error: "Every pose needs a name." };
    }
    if (!isNum(pose.seconds) || pose.seconds < MIN_HOLD_SECONDS || pose.seconds > MAX_HOLD_SECONDS) {
      return {
        error: `"${pose.name}" needs a hold between ${MIN_HOLD_SECONDS} and ${MAX_HOLD_SECONDS} seconds.`,
      };
    }
  }

  const segments = [];
  let offset = 0;
  for (let round = 1; round <= rounds; round += 1) {
    for (const pose of poses) {
      const sides = pose.perSide ? ["right", "left"] : [null];
      for (const side of sides) {
        segments.push({
          key: `${round}-${pose.name}-${side || "both"}-${segments.length}`,
          round,
          name: pose.name,
          side,
          seconds: pose.seconds,
          breaths: pose.seconds / secondsPerBreath,
          startsAt: offset,
          endsAt: offset + pose.seconds,
        });
        offset += pose.seconds + transitionSeconds;
      }
    }
  }

  // The gap after the very last segment is not part of the practice.
  const holdSeconds = segments.reduce((sum, segment) => sum + segment.seconds, 0);
  const transitionTotal = Math.max(0, segments.length - 1) * transitionSeconds;
  const totalSeconds = holdSeconds + transitionTotal;

  return {
    segments,
    segmentCount: segments.length,
    poseCount: poses.length,
    rounds,
    holdSeconds,
    transitionTotal,
    totalSeconds,
    totalBreaths: holdSeconds / secondsPerBreath,
    secondsPerBreath,
    transitionSeconds,
    averageHoldSeconds: holdSeconds / segments.length,
    longestSegment: segments.reduce((best, segment) => (segment.seconds > best.seconds ? segment : best), segments[0]),
  };
}

/**
 * Which segment is running at a given elapsed time? Pure.
 *
 * @param {object[]} segments  From computeSequence().segments
 * @param {number} elapsedSeconds
 * @returns {object|null}
 */
export function segmentAtElapsed(segments, elapsedSeconds) {
  if (!Array.isArray(segments) || segments.length === 0) return null;
  if (!isNum(elapsedSeconds) || elapsedSeconds < 0) return null;

  for (let index = 0; index < segments.length; index += 1) {
    const segment = segments[index];
    if (elapsedSeconds < segment.endsAt) {
      const into = elapsedSeconds - segment.startsAt;
      return {
        index,
        segment,
        inTransition: false,
        secondsLeft: segment.endsAt - elapsedSeconds,
        breathsDone: into / (segment.seconds / segment.breaths),
        progress: segment.seconds > 0 ? into / segment.seconds : 0,
      };
    }
    const next = segments[index + 1];
    if (next && elapsedSeconds < next.startsAt) {
      return {
        index: index + 1,
        segment: next,
        inTransition: true,
        secondsLeft: next.startsAt - elapsedSeconds,
        breathsDone: 0,
        progress: 0,
      };
    }
  }
  return null;
}

/** Format seconds as m:ss, or h:mm:ss past an hour. */
export function formatDuration(totalSeconds) {
  if (!isNum(totalSeconds) || totalSeconds < 0) return "—";
  const rounded = Math.round(totalSeconds);
  const hours = Math.floor(rounded / 3600);
  const minutes = Math.floor((rounded % 3600) / 60);
  const seconds = rounded % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
