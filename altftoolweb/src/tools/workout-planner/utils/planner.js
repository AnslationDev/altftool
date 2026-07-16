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

export function calcNutrition(goal, weight) {
  const w = Number(weight) || 70;
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
  const total = Number(daysPerWeek);
  const deloadWeek = blockWeeks >= 4 ? 4 : null;
  const weeklyIncrease = level === "beginner" ? "2.5%" : "5%";

  for (let i = 0; i < total; i += 1) {
    const primary = base[i % base.length];
    const exercise = SUBSTITUTE_MAP[primary]?.[equipment] || primary;
    const setsBase = goal === "endurance" ? 3 : 4;
    const repsBase = goal === "strength" ? "4-6" : goal === "muscle-gain" ? "8-12" : "12-20";
    const warmup = Math.max(5, Math.round(duration * 0.2));
    const main = Math.max(15, Math.round(duration * 0.65));
    const cooldown = Math.max(5, duration - warmup - main);
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
  const completed = logs.filter((log) => log.completed).length;
  const avgRpe = logs.length ? (logs.reduce((acc, cur) => acc + Number(cur.rpe || 0), 0) / logs.length).toFixed(1) : "0.0";
  const adherence = totalSessions ? Math.round((completed / totalSessions) * 100) : 0;
  const coach =
    avgRpe >= 8.5
      ? "High fatigue trend. Keep next week volume flat and prioritize sleep."
      : adherence < 70
      ? "Consistency first. Reduce weekly days by 1 and lock fixed workout times."
      : "Great momentum. Progress load or reps next week and keep technique sharp.";
  return { completed, adherence, avgRpe, coach };
}
