/**
 * Run-walk interval planner.
 *
 * The run-walk-run method (popularised by Jeff Galloway) inserts a timed walk
 * break into a run at a fixed cadence. Given the two paces and the two interval
 * lengths, everything else is exact arithmetic: how far one cycle covers, how
 * many cycles the target distance takes, and the resulting average pace.
 *
 * The level presets below are conventional starting ratios used in couch-to-5K
 * style programmes; they are a starting point, not a prescription.
 */

export const KM_PER_MILE = 1.609344;

export const LEVEL_PRESETS = [
  {
    id: "new",
    label: "New to running",
    runSeconds: 30,
    walkSeconds: 60,
    note: "Short run bursts with a longer walk keep heart rate and impact load low.",
  },
  {
    id: "building",
    label: "Building a base",
    runSeconds: 60,
    walkSeconds: 60,
    note: "Equal run and walk is the classic week 3-4 step of a couch-to-5K progression.",
  },
  {
    id: "returning",
    label: "Returning after a break or injury",
    runSeconds: 90,
    walkSeconds: 60,
    note: "Longer running blocks with a full recovery walk; stop the session if pain appears.",
  },
  {
    id: "endurance",
    label: "Building endurance",
    runSeconds: 180,
    walkSeconds: 60,
    note: "A 3:1 ratio is a common long-run pattern for 10K and half-marathon training.",
  },
  {
    id: "advanced",
    label: "Experienced, using walk breaks for recovery",
    runSeconds: 240,
    walkSeconds: 30,
    note: "Short breaks that protect the legs late in a marathon without costing much time.",
  },
  { id: "custom", label: "Custom ratio", runSeconds: null, walkSeconds: null, note: "" },
];

export const MAX_DISTANCE_KM = 200;
/** Fastest credible sustained running pace, ~2:20/km. */
export const MIN_RUN_PACE_SEC_PER_KM = 140;
/** Slowest pace the planner treats as movement, 30 min/km. */
export const MAX_PACE_SEC_PER_KM = 1800;
export const MAX_INTERVAL_SECONDS = 3600;
/** Rows in the preview table; long plans are summarised instead of listed. */
export const MAX_PREVIEW_CYCLES = 40;

const EPSILON = 1e-9;

const toFinite = (value) => {
  const num = typeof value === "number" ? value : Number(String(value ?? "").trim());
  return Number.isFinite(num) ? num : NaN;
};

/** Convert a m:ss style pace pair into seconds per km. */
export function paceToSeconds({ minutes, seconds }) {
  const m = toFinite(minutes === "" ? 0 : minutes);
  const s = toFinite(seconds === "" ? 0 : seconds);
  if ([m, s].some(Number.isNaN) || m < 0 || s < 0) return NaN;
  return m * 60 + s;
}

/** Format seconds as h:mm:ss, or m:ss below an hour. */
export function formatDuration(totalSeconds) {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "—";
  const total = Math.round(totalSeconds);
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
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

/**
 * Build a run-walk plan.
 *
 * @param {object} input
 * @param {number|string} input.distanceKm target distance
 * @param {number|string} input.runPaceSec running pace, seconds per km
 * @param {number|string} input.walkPaceSec walking pace, seconds per km
 * @param {number|string} input.runSeconds length of each run interval
 * @param {number|string} input.walkSeconds length of each walk interval
 * @returns {object} plan figures, or { error } when the input is unusable
 */
export function planWalkRun({ distanceKm, runPaceSec, walkPaceSec, runSeconds, walkSeconds }) {
  const distance = toFinite(distanceKm);
  const runPace = toFinite(runPaceSec);
  const walkPace = toFinite(walkPaceSec);
  const runInterval = toFinite(runSeconds);
  const walkInterval = toFinite(walkSeconds);

  if ([distance, runPace, walkPace, runInterval, walkInterval].some(Number.isNaN)) {
    return { error: "Enter a number in every field." };
  }
  if (!(distance > 0)) return { error: "Target distance must be greater than zero." };
  if (distance > MAX_DISTANCE_KM) {
    return { error: `Distances above ${MAX_DISTANCE_KM} km are outside this planner.` };
  }
  if (runPace < MIN_RUN_PACE_SEC_PER_KM) {
    return { error: "That running pace is faster than the world record; check the minutes and seconds." };
  }
  if (runPace > MAX_PACE_SEC_PER_KM || walkPace > MAX_PACE_SEC_PER_KM) {
    return { error: "Paces slower than 30:00 per km are outside this planner." };
  }
  if (!(walkPace > 0)) return { error: "Walking pace must be greater than zero." };
  if (walkPace <= runPace) {
    return { error: "Walking pace has to be slower than running pace, otherwise the breaks are not breaks." };
  }
  if (runInterval < 0 || walkInterval < 0) return { error: "Interval lengths cannot be negative." };
  if (runInterval > MAX_INTERVAL_SECONDS || walkInterval > MAX_INTERVAL_SECONDS) {
    return { error: "Keep each interval under 60 minutes." };
  }
  if (!(runInterval > 0)) {
    return { error: "The run interval must be longer than zero seconds." };
  }

  const runDistancePerCycle = runInterval / runPace;
  const walkDistancePerCycle = walkInterval / walkPace;
  const cycleDistance = runDistancePerCycle + walkDistancePerCycle;
  const cycleSeconds = runInterval + walkInterval;

  // How many whole run+walk cycles fit inside the target distance.
  const fullCycles = Math.floor((distance + EPSILON) / cycleDistance);
  const coveredByCycles = fullCycles * cycleDistance;
  let remaining = distance - coveredByCycles;
  if (remaining < EPSILON) remaining = 0;

  let totalSeconds = fullCycles * cycleSeconds;
  let runSecondsTotal = fullCycles * runInterval;
  let walkSecondsTotal = fullCycles * walkInterval;
  let runDistance = fullCycles * runDistancePerCycle;
  let walkDistance = fullCycles * walkDistancePerCycle;
  let runSegments = fullCycles;
  let walkSegments = walkInterval > 0 ? fullCycles : 0;
  let partial = null;

  if (remaining > 0) {
    if (remaining <= runDistancePerCycle + EPSILON) {
      const secs = remaining * runPace;
      totalSeconds += secs;
      runSecondsTotal += secs;
      runDistance += remaining;
      runSegments += 1;
      partial = { type: "run", km: remaining, seconds: secs, runKm: remaining, walkKm: 0 };
    } else {
      const walkPart = remaining - runDistancePerCycle;
      const secs = runInterval + walkPart * walkPace;
      totalSeconds += secs;
      runSecondsTotal += runInterval;
      walkSecondsTotal += walkPart * walkPace;
      runDistance += runDistancePerCycle;
      walkDistance += walkPart;
      runSegments += 1;
      walkSegments += 1;
      partial = { type: "run+walk", km: remaining, seconds: secs, runKm: runDistancePerCycle, walkKm: walkPart };
    }
  }

  const averagePace = totalSeconds / distance;
  const continuousSeconds = distance * runPace;
  const timeCost = totalSeconds - continuousSeconds;

  const preview = [];
  let cumulativeKm = 0;
  let cumulativeSeconds = 0;
  const previewCycles = Math.min(fullCycles, MAX_PREVIEW_CYCLES);
  for (let i = 1; i <= previewCycles; i += 1) {
    cumulativeKm += cycleDistance;
    cumulativeSeconds += cycleSeconds;
    preview.push({
      cycle: i,
      runKm: runDistancePerCycle,
      walkKm: walkDistancePerCycle,
      cumulativeKm,
      cumulativeSeconds,
    });
  }

  const notes = [];
  if (walkInterval === 0) {
    notes.push("With a zero-second walk break this is a continuous run, so the average pace equals the run pace.");
  }
  if (fullCycles > MAX_PREVIEW_CYCLES) {
    notes.push(`The plan runs to ${fullCycles} cycles; the table shows the first ${MAX_PREVIEW_CYCLES}.`);
  }
  if (runInterval < 30) {
    notes.push("Run intervals under 30 seconds are hard to time reliably on the move; a watch or app beeper helps.");
  }
  if (cycleSeconds > 0 && walkSecondsTotal / totalSeconds > 0.5) {
    notes.push("More than half the session is spent walking, which is a normal and effective place to start.");
  }

  return {
    distanceKm: distance,
    runPace,
    walkPace,
    runInterval,
    walkInterval,
    cycleDistance,
    cycleSeconds,
    fullCycles,
    runSegments,
    walkSegments,
    partial,
    totalSeconds,
    averagePace,
    averagePacePerMile: averagePace * KM_PER_MILE,
    runSecondsTotal,
    walkSecondsTotal,
    runDistance,
    walkDistance,
    runShare: (runSecondsTotal / totalSeconds) * 100,
    continuousSeconds,
    timeCost,
    preview,
    notes,
  };
}
