/**
 * Gym rest timer scheduling.
 *
 * The whole session is expanded into an ordered queue of work and rest intervals
 * with cumulative start offsets, so "where am I now" is a pure lookup against a
 * number of elapsed seconds. Nothing here reads the clock - the component passes
 * elapsed seconds in, which keeps the scheduling testable and deterministic.
 *
 * Rest defaults follow the resistance-training guidance in the NSCA's Essentials
 * of Strength Training and Conditioning and the ACSM position stand: long rests
 * for maximal-strength and power work, short rests for endurance work.
 */

/**
 * Rest presets by training goal, in seconds.
 * strength/power: 2-5 minutes between sets at or above ~85% of 1RM.
 * hypertrophy: 30-90 seconds at moderate loads and 6-12 reps.
 * endurance: 30 seconds or less at light loads and high reps.
 */
export const REST_PRESETS = [
  {
    id: "power",
    label: "Power / max strength",
    seconds: 240,
    range: "2–5 min",
    note: "Singles, doubles and triples at or above 85% of 1RM.",
  },
  {
    id: "strength",
    label: "Strength",
    seconds: 180,
    range: "2–3 min",
    note: "Heavy sets of 3–6 reps on the main lifts.",
  },
  {
    id: "hypertrophy",
    label: "Hypertrophy",
    seconds: 90,
    range: "30–90 s",
    note: "Moderate load, 6–12 reps, accessory and main work alike.",
  },
  {
    id: "endurance",
    label: "Muscular endurance",
    seconds: 30,
    range: "≤ 30 s",
    note: "Light load, 12+ reps, circuits and conditioning.",
  },
];

export const MIN_REST_SEC = 0;
export const MAX_REST_SEC = 900;
export const MIN_SETS = 1;
export const MAX_SETS = 20;
export const MAX_EXERCISES = 15;
export const MIN_WORK_SEC = 5;
export const MAX_WORK_SEC = 600;
export const DEFAULT_WORK_SEC = 30;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Preset lookup with a safe fallback. */
export function getPreset(presetId) {
  return REST_PRESETS.find((preset) => preset.id === presetId) ?? REST_PRESETS[2];
}

/** Seconds to m:ss. Negative and non-numeric input render as 0:00. */
export function formatDuration(totalSeconds) {
  const seconds = isNum(totalSeconds) && totalSeconds > 0 ? Math.round(totalSeconds) : 0;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
}

/**
 * Expand a list of exercises into an ordered queue of intervals.
 * Rest belongs to the set that was just completed, and there is no rest after the
 * final set of the session because the session is over.
 *
 * @param {{exercises:Array<{name?:string,sets:number,restSec:number,workSec?:number}>,
 *          workSec?:number}} input
 */
export function buildQueue({ exercises, workSec = DEFAULT_WORK_SEC } = {}) {
  const list = Array.isArray(exercises) ? exercises : [];
  if (list.length === 0) return { error: "Add at least one exercise." };
  if (list.length > MAX_EXERCISES) {
    return { error: `Keep the session to ${MAX_EXERCISES} exercises or fewer.` };
  }
  if (!isNum(workSec) || workSec < MIN_WORK_SEC || workSec > MAX_WORK_SEC) {
    return { error: `A set should take between ${MIN_WORK_SEC} and ${MAX_WORK_SEC} seconds.` };
  }

  const cleaned = [];
  for (const exercise of list) {
    const sets = exercise?.sets;
    const restSec = exercise?.restSec;
    if (!isNum(sets) || sets < MIN_SETS || sets > MAX_SETS || Math.floor(sets) !== sets) {
      return { error: `Sets must be a whole number between ${MIN_SETS} and ${MAX_SETS}.` };
    }
    if (!isNum(restSec) || restSec < MIN_REST_SEC || restSec > MAX_REST_SEC) {
      return { error: `Rest must be between ${MIN_REST_SEC} and ${MAX_REST_SEC} seconds.` };
    }
    cleaned.push({
      name: typeof exercise.name === "string" && exercise.name.trim() ? exercise.name.trim() : "Exercise",
      sets,
      restSec,
      workSec: isNum(exercise.workSec) ? exercise.workSec : workSec,
    });
  }

  const steps = [];
  let offset = 0;
  cleaned.forEach((exercise, exerciseIndex) => {
    for (let setNumber = 1; setNumber <= exercise.sets; setNumber += 1) {
      steps.push({
        type: "work",
        exerciseIndex,
        exerciseName: exercise.name,
        setNumber,
        totalSets: exercise.sets,
        seconds: exercise.workSec,
        startsAt: offset,
        endsAt: offset + exercise.workSec,
      });
      offset += exercise.workSec;

      const lastSetOfSession =
        exerciseIndex === cleaned.length - 1 && setNumber === exercise.sets;
      if (!lastSetOfSession && exercise.restSec > 0) {
        steps.push({
          type: "rest",
          exerciseIndex,
          exerciseName: exercise.name,
          setNumber,
          totalSets: exercise.sets,
          seconds: exercise.restSec,
          startsAt: offset,
          endsAt: offset + exercise.restSec,
        });
        offset += exercise.restSec;
      }
    }
  });

  const totalWorkSeconds = steps
    .filter((step) => step.type === "work")
    .reduce((sum, step) => sum + step.seconds, 0);
  const totalRestSeconds = steps
    .filter((step) => step.type === "rest")
    .reduce((sum, step) => sum + step.seconds, 0);

  return {
    steps,
    exercises: cleaned,
    totalSets: cleaned.reduce((sum, exercise) => sum + exercise.sets, 0),
    totalWorkSeconds,
    totalRestSeconds,
    totalSeconds: offset,
  };
}

/**
 * Which interval is running at a given number of elapsed seconds.
 * Elapsed is supplied by the caller so this stays a pure function.
 *
 * @param {{steps:Array, totalSeconds:number}} queue
 * @param {number} elapsedSec
 */
export function stepAt(queue, elapsedSec) {
  const steps = queue?.steps;
  if (!Array.isArray(steps) || steps.length === 0) {
    return { error: "Build a session queue first." };
  }
  const elapsed = isNum(elapsedSec) && elapsedSec > 0 ? elapsedSec : 0;

  if (elapsed >= queue.totalSeconds) {
    return {
      done: true,
      index: steps.length - 1,
      step: steps[steps.length - 1],
      elapsedInStep: steps[steps.length - 1].seconds,
      remainingInStep: 0,
      remainingTotal: 0,
      progressPct: 100,
      setsCompleted: queue.totalSets,
    };
  }

  let index = steps.findIndex((step) => elapsed >= step.startsAt && elapsed < step.endsAt);
  if (index === -1) index = 0;
  const step = steps[index];
  const setsCompleted = steps
    .slice(0, index + (step.type === "rest" ? 1 : 0))
    .filter((entry) => entry.type === "work").length;

  return {
    done: false,
    index,
    step,
    elapsedInStep: elapsed - step.startsAt,
    remainingInStep: step.endsAt - elapsed,
    remainingTotal: queue.totalSeconds - elapsed,
    progressPct: queue.totalSeconds > 0 ? (elapsed / queue.totalSeconds) * 100 : 0,
    setsCompleted,
  };
}

/** Elapsed seconds at the start of a step - used to skip forward or back. */
export function offsetOfStep(queue, index) {
  const steps = queue?.steps;
  if (!Array.isArray(steps) || !isNum(index)) return 0;
  const clamped = Math.max(0, Math.min(steps.length - 1, Math.round(index)));
  return steps[clamped].startsAt;
}
