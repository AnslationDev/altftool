const GOAL_EXERCISES = {
  strength: ["Barbell Squat", "Bench Press", "Romanian Deadlift", "Overhead Press"],
  "muscle-gain": ["Incline Dumbbell Press", "Lat Pulldown", "Split Squat", "Cable Fly"],
  "fat-loss": ["Bodyweight Circuit", "Kettlebell Swing", "Walking Lunge", "Bike Intervals"],
  endurance: ["Steady Cardio", "Tempo Run", "Rowing Intervals", "Assault Bike"],
};

const SUBSTITUTE_MAP = {
  "Barbell Squat": { none: "Bodyweight Squat", basic: "Goblet Squat", full: "Barbell Squat" },
  "Bench Press": { none: "Push-Ups", basic: "Dumbbell Floor Press", full: "Bench Press" },
  "Romanian Deadlift": { none: "Hip Hinge Drill", basic: "Dumbbell RDL", full: "Romanian Deadlift" },
  "Overhead Press": { none: "Pike Push-Up", basic: "Dumbbell Press", full: "Overhead Press" },
};

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Warm-up/main/cooldown each have a minimum floor, but those floors must never let the
// blocks add up to more than the user's configured session Duration. When the floors
// would overflow the budget, scale the blocks down proportionally. The three segments
// must always reconcile to the total duration -- that invariant takes priority over the
// per-block floor, so a block can shrink all the way to 0 minutes (never negative) for a
// very short total (e.g. a 1 or 2 minute session) rather than the sum overshooting total.
function splitSessionMinutes(duration) {
  const total = Math.max(1, Number(duration) || 0);
  const rawWarmup = Math.max(5, Math.round(total * 0.2));
  const rawMain = Math.max(15, Math.round(total * 0.65));
  const rawCooldown = Math.max(5, Math.round(total * 0.15));
  const rawTotal = rawWarmup + rawMain + rawCooldown;

  if (rawTotal <= total) {
    return { warmup: rawWarmup, main: rawMain, cooldown: total - rawWarmup - rawMain };
  }

  const scale = total / rawTotal;
  let warmup = Math.max(1, Math.round(rawWarmup * scale));
  let main = Math.max(1, Math.round(rawMain * scale));
  let cooldown = Math.max(1, total - warmup - main);

  let overflow = warmup + main + cooldown - total;
  while (overflow > 0 && main > 0) {
    main -= 1;
    overflow -= 1;
  }
  while (overflow > 0 && warmup > 0) {
    warmup -= 1;
    overflow -= 1;
  }
  while (overflow > 0 && cooldown > 0) {
    cooldown -= 1;
    overflow -= 1;
  }

  return { warmup, main, cooldown };
}

// Stable identity for a timeline session, used to keep completion/RPE logs correctly
// attached to the same day+exercise pairing even after the timeline regenerates.
export function sessionKey(session) {
  return `${session.day}::${session.exercise}`;
}

export function calcNutrition(goal, weight) {
  const w = Math.max(1, Number(weight) || 70);
  const factor = goal === "fat-loss" ? 29 : goal === "muscle-gain" ? 35 : 32;
  const calories = Math.round(w * factor);
  const proteinG = Math.round(w * 1.8);
  const sleepHours = goal === "strength" ? 8 : 7.5;
  const hydrationL = (w * 0.035).toFixed(1);
  return { calories, proteinG, sleepHours, hydrationL };
}

export function buildTimeline(input) {
  const { daysPerWeek, duration, goal, level, equipment, focusArea, blockWeeks, injuryFlag } = input;
  const base = GOAL_EXERCISES[goal] || GOAL_EXERCISES.strength;
  const sessions = [];
  // Days is meant to be a day-of-week count and DAY_NAMES only has 7 entries. The
  // "Days" input's min/max attributes (1-7) are never enforced (there is no <form> to
  // trigger HTML5 validation), so a typed value like 9 must still be clamped here --
  // otherwise DAY_NAMES[i] goes out of bounds for i >= 7, producing sessions with
  // day: undefined, which then collide on the same sessionKey (day+exercise) once the
  // exercise list wraps back around, entangling two different sessions' completion/RPE.
  const total = Math.min(DAY_NAMES.length, Math.max(1, Math.round(Number(daysPerWeek)) || 1));
  const deloadWeek = blockWeeks >= 4 ? 4 : null;
  const weeklyIncrease = level === "beginner" ? "2.5%" : "5%";

  for (let i = 0; i < total; i += 1) {
    const primary = base[i % base.length];
    const exercise = SUBSTITUTE_MAP[primary]?.[equipment] || primary;
    const setsBase = goal === "endurance" ? 3 : 4;
    const repsBase = goal === "strength" ? "4-6" : goal === "muscle-gain" ? "8-12" : "12-20";
    const { warmup, main, cooldown } = splitSessionMinutes(duration);
    const weekPlan = Array.from({ length: blockWeeks }, (_, w) => {
      const week = w + 1;
      const isDeload = deloadWeek && week === deloadWeek;
      return {
        week,
        prescription: isDeload
          ? "Deload: reduce volume by 35% and keep form strict."
          : `Progressive overload: increase load/reps by ${weeklyIncrease} if RPE <= 8.`,
      };
    });

    sessions.push({
      day: DAY_NAMES[i],
      title: `${focusArea} Session ${i + 1}`,
      intensity: level === "advanced" ? "High" : level === "intermediate" ? "Moderate-High" : "Moderate",
      exercise,
      sets: setsBase,
      reps: repsBase,
      blocks: [
        `${warmup} min warm-up and mobility`,
        `${main} min main training block`,
        `${cooldown} min cooldown and breathing`,
      ],
      injuryNote: injuryFlag ? "Use pain-free range, reduce load, avoid aggravating patterns." : "No injury constraints selected.",
      weekPlan,
    });
  }

  return sessions;
}

export function completionStats(logs, timeline) {
  const totalSessions = timeline.length;
  // Only count logs that still match a session in the current timeline (keyed by
  // day+exercise) so stale entries left over from a prior input configuration can
  // never inflate adherence above 100% or get misattributed to a different session.
  const currentLogs = timeline.map((session) => logs[sessionKey(session)]).filter(Boolean);
  const completed = currentLogs.filter((log) => log.completed).length;
  // RPE is documented (and now enforced on write, see updateRpe) as a 1-10 scale, but
  // clamp defensively here too so a log entry saved before that fix -- or edited outside
  // the UI -- can never drag the average, or the >= 8.5 fatigue-trend coaching threshold
  // below, outside that documented range.
  const clampRpe = (value) => Math.min(10, Math.max(0, Number(value) || 0));
  const avgRpe = currentLogs.length
    ? (currentLogs.reduce((acc, cur) => acc + clampRpe(cur.rpe), 0) / currentLogs.length).toFixed(1)
    : "0.0";
  const adherence = totalSessions ? Math.round((completed / totalSessions) * 100) : 0;
  const coach =
    avgRpe >= 8.5
      ? "High fatigue trend. Keep next week volume flat and prioritize sleep."
      : adherence < 70
      ? "Consistency first. Reduce weekly days by 1 and lock fixed workout times."
      : "Great momentum. Progress load or reps next week and keep technique sharp.";
  return { completed, adherence, avgRpe, coach };
}
