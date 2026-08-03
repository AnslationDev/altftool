/**
 * Negative split race planner.
 *
 * A negative split means the second half of a race is covered faster than the
 * first. The planner solves for the two half times that (a) add up to the goal
 * finish time and (b) sit in the requested ratio, then expands them into a
 * segment-by-segment pace sheet.
 *
 * Distances below are the official World Athletics road-race distances.
 */

export const KM_PER_MILE = 1.609344;

export const RACE_PRESETS = [
  { id: "5k", label: "5K", km: 5 },
  { id: "10k", label: "10K", km: 10 },
  { id: "15k", label: "15K", km: 15 },
  { id: "10mile", label: "10 miles", km: 10 * KM_PER_MILE },
  { id: "half", label: "Half marathon", km: 21.0975 },
  { id: "30k", label: "30K", km: 30 },
  { id: "marathon", label: "Marathon", km: 42.195 },
  { id: "custom", label: "Custom distance", km: null },
];

/** Split shapes the planner can build. */
export const SPLIT_MODES = [
  { id: "block", label: "Two blocks (step down at halfway)" },
  { id: "gradual", label: "Gradual (pace creeps down every segment)" },
];

/** Coaching guidance: a 1-3% negative split is the range most marathon plans target. */
export const RECOMMENDED_SPLIT_MIN_PCT = 1;
export const RECOMMENDED_SPLIT_MAX_PCT = 3;
/** Beyond this the first half is so slow the plan stops being a race plan. */
export const MAX_SPLIT_PCT = 20;

export const MAX_DISTANCE_KM = 300;
export const MAX_FINISH_SECONDS = 24 * 3600;
/** Fastest credible human road pace, ~2:00/km (world record marathon pace is ~2:54/km). */
export const MIN_PACE_SEC_PER_KM = 120;
/**
 * Ceiling on how many rows the split sheet can build. Comfortably covers the
 * planner's own stated bounds (a 300 km ultra at a fine 0.1 km step is 3,000
 * rows) while still refusing a segment length so small it would try to
 * build an unreasonable table.
 */
export const MAX_SEGMENTS = 6000;

const toFinite = (value) => {
  const num = typeof value === "number" ? value : Number(String(value ?? "").trim());
  return Number.isFinite(num) ? num : NaN;
};

/** Convert an h/m/s trio into total seconds. Returns NaN if any part is unusable. */
export function toTotalSeconds({ hours = 0, minutes = 0, seconds = 0 }) {
  const h = toFinite(hours === "" ? 0 : hours);
  const m = toFinite(minutes === "" ? 0 : minutes);
  const s = toFinite(seconds === "" ? 0 : seconds);
  if ([h, m, s].some(Number.isNaN)) return NaN;
  if (h < 0 || m < 0 || s < 0) return NaN;
  return h * 3600 + m * 60 + s;
}

/** Format seconds as h:mm:ss, or m:ss when under an hour. */
export function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "—";
  const total = Math.round(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

/** Format a pace in seconds per km as m:ss. */
export function formatPace(secondsPerKm) {
  if (!Number.isFinite(secondsPerKm) || secondsPerKm <= 0) return "—";
  const total = Math.round(secondsPerKm);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * Time in seconds for the stretch from distance fraction a to fraction b.
 * `block` holds a constant pace in each half; `gradual` runs a straight line
 * from the opening pace to the closing pace.
 */
function segmentSeconds({ mode, a, b, distanceKm, firstPace, secondPace, openPace, closePace }) {
  if (mode === "gradual") {
    // Integral of a linear pace profile p(x) = openPace + (closePace - openPace) * x
    const linear = openPace * (b - a) + ((closePace - openPace) * (b * b - a * a)) / 2;
    return linear * distanceKm;
  }
  const firstShare = Math.max(0, Math.min(b, 0.5) - Math.min(a, 0.5));
  const secondShare = Math.max(0, b - Math.max(a, 0.5));
  return (firstShare * firstPace + secondShare * secondPace) * distanceKm;
}

/**
 * Build a negative split plan.
 *
 * @param {object} input
 * @param {number|string} input.distanceKm race distance in kilometres
 * @param {number|string} input.hours goal finish hours
 * @param {number|string} input.minutes goal finish minutes
 * @param {number|string} input.seconds goal finish seconds
 * @param {number|string} input.splitPct how much faster the second half should be, in percent
 * @param {"block"|"gradual"} input.mode shape of the plan
 * @param {number|string} input.segmentKm length of each row in the split table
 * @returns {object} plan figures, or { error } when the input is unusable
 */
export function planNegativeSplit({
  distanceKm,
  hours,
  minutes,
  seconds,
  splitPct,
  mode = "block",
  segmentKm = 1,
}) {
  const distance = toFinite(distanceKm);
  const total = toTotalSeconds({ hours, minutes, seconds });
  const split = toFinite(splitPct);
  const segLength = toFinite(segmentKm);

  if ([distance, total, split, segLength].some(Number.isNaN)) {
    return { error: "Enter a number in every field; the goal time cannot be negative." };
  }
  if (mode !== "block" && mode !== "gradual") {
    return { error: "Choose a plan shape of two blocks or gradual." };
  }
  if (!(distance > 0)) return { error: "Race distance must be greater than zero." };
  if (distance > MAX_DISTANCE_KM) {
    return { error: `Distances above ${MAX_DISTANCE_KM} km are outside this planner.` };
  }
  if (!(total > 0)) return { error: "Enter a goal finish time greater than zero." };
  if (total > MAX_FINISH_SECONDS) return { error: "Goal finish time must be under 24 hours." };
  if (split < 0 || split > MAX_SPLIT_PCT) {
    return { error: `The negative split should be between 0% and ${MAX_SPLIT_PCT}%.` };
  }
  if (!(segLength > 0) || segLength > distance) {
    return { error: "Segment length must be greater than zero and no longer than the race." };
  }
  const segmentCount = Math.ceil((distance - 1e-9) / segLength);
  if (segmentCount > MAX_SEGMENTS) {
    const minSegmentKm = distance / MAX_SEGMENTS;
    return {
      error: `A ${segLength} km segment over ${distance} km would build ${segmentCount} rows, more than this planner supports. Use a segment length of at least ${minSegmentKm.toFixed(2)} km.`,
    };
  }

  // Second-half time = first-half time x ratio, and the two must add to the goal.
  const ratio = 1 - split / 100;
  const firstHalfSeconds = total / (1 + ratio);
  const secondHalfSeconds = total - firstHalfSeconds;
  const halfDistance = distance / 2;

  const averagePace = total / distance;
  const firstHalfPace = firstHalfSeconds / halfDistance;
  const secondHalfPace = secondHalfSeconds / halfDistance;

  // For the gradual profile, solve the linear pace line that produces the same
  // half-time ratio: with p(x) = avg(1 + d) tapering to avg(1 - d),
  // secondHalf/firstHalf = (0.5 - 0.25d)/(0.5 + 0.25d), so d = 2(1 - ratio)/(1 + ratio).
  const taper = (2 * (1 - ratio)) / (1 + ratio);
  const openPace = averagePace * (1 + taper);
  const closePace = averagePace * (1 - taper);

  const fastestPace = mode === "gradual" ? closePace : secondHalfPace;
  if (fastestPace < MIN_PACE_SEC_PER_KM) {
    return {
      error: `That plan needs a closing pace of ${formatPace(fastestPace)}/km, which is faster than any road world record. Slow the goal time or reduce the split.`,
    };
  }

  const segments = [];
  let cumulative = 0;
  let covered = 0;
  let guard = 0;
  const guardLimit = segmentCount + 2;
  while (covered < distance - 1e-9 && guard < guardLimit) {
    const start = covered;
    const end = Math.min(distance, covered + segLength);
    const secs = segmentSeconds({
      mode,
      a: start / distance,
      b: end / distance,
      distanceKm: distance,
      firstPace: firstHalfPace,
      secondPace: secondHalfPace,
      openPace,
      closePace,
    });
    cumulative += secs;
    segments.push({
      from: start,
      to: end,
      lengthKm: end - start,
      seconds: secs,
      pacePerKm: secs / (end - start),
      cumulativeSeconds: cumulative,
    });
    covered = end;
    guard += 1;
  }
  if (covered < distance - 1e-6) {
    // Should be unreachable now that segmentCount is validated up front, but
    // never hand back a truncated table that looks complete.
    return { error: "Could not build a complete split sheet for these inputs. Try a longer segment length." };
  }

  const notes = [];
  if (split === 0) {
    notes.push("A 0% split is an even-pace plan, not a negative split.");
  } else if (split < RECOMMENDED_SPLIT_MIN_PCT) {
    notes.push(
      `Under ${RECOMMENDED_SPLIT_MIN_PCT}% the difference is inside normal course and GPS noise; ${RECOMMENDED_SPLIT_MIN_PCT}-${RECOMMENDED_SPLIT_MAX_PCT}% is the usual target.`,
    );
  } else if (split > RECOMMENDED_SPLIT_MAX_PCT) {
    notes.push(
      `A ${split}% split means starting well below goal pace. Most plans aim for ${RECOMMENDED_SPLIT_MIN_PCT}-${RECOMMENDED_SPLIT_MAX_PCT}%, because too slow a first half rarely gets fully repaid.`,
    );
  }
  if (mode === "gradual") {
    notes.push("The gradual plan drops pace every segment, so no single kilometre is a big step change.");
  }

  return {
    distanceKm: distance,
    totalSeconds: total,
    splitPct: split,
    mode,
    halfDistanceKm: halfDistance,
    firstHalfSeconds,
    secondHalfSeconds,
    differenceSeconds: firstHalfSeconds - secondHalfSeconds,
    averagePace,
    averagePacePerMile: averagePace * KM_PER_MILE,
    firstHalfPace,
    secondHalfPace,
    openPace,
    closePace,
    startPace: mode === "gradual" ? openPace : firstHalfPace,
    finishPace: mode === "gradual" ? closePace : secondHalfPace,
    segments,
    notes,
  };
}
