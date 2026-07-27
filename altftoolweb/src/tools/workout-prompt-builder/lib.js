/**
 * Workout Prompt Builder — pure logic.
 *
 * Programming rules implemented here, all from standard resistance-training
 * practice rather than invention:
 *  - Weekly hard sets per muscle group. The dose-response literature
 *    (Schoenfeld and colleagues' meta-analyses on training volume) puts the
 *    productive range at roughly 10 to 20 sets per muscle per week, with the
 *    lower end sufficient for beginners.
 *  - Repetition and load ranges by training goal, following the conventional
 *    NSCA/ACSM loading table: heavy and few for strength, moderate for
 *    hypertrophy, light and many for muscular endurance.
 *  - Training split chosen by days available, the usual full body → upper /
 *    lower → push / pull / legs progression.
 *  - Session duration estimated as sets × (time under tension + rest), plus
 *    warm-up and cool-down.
 *
 * Estimates for planning. Not medical advice.
 * No React, no DOM, no Date.now().
 */

/** Productive weekly set range per muscle group. */
export const WEEKLY_SETS_MIN = 10;
export const WEEKLY_SETS_MAX = 20;

/** Seconds per repetition at a controlled tempo: about 2 s down, 1 s up. */
export const SECONDS_PER_REP = 3;

/** Practical ceiling for one session before quality falls away. */
export const SESSION_SET_CAP = 30;

export const EXPERIENCE_LEVELS = [
  {
    key: "beginner",
    label: "Beginner — under 6 months of consistent training",
    weeklySetsPerMuscle: 10,
    note: "The bottom of the effective range is plenty; technique and consistency matter more than volume.",
  },
  {
    key: "intermediate",
    label: "Intermediate — 6 months to 2 years",
    weeklySetsPerMuscle: 14,
    note: "Mid-range volume, with load added before sets.",
  },
  {
    key: "advanced",
    label: "Advanced — 2 years or more",
    weeklySetsPerMuscle: 18,
    note: "Near the top of the useful range; recovery becomes the limit.",
  },
];

/** Rep and load prescriptions by goal, with the rest interval each needs. */
export const TRAINING_GOALS = [
  {
    key: "strength",
    label: "Maximal strength",
    repMin: 3,
    repMax: 6,
    pctMin: 80,
    pctMax: 90,
    restSec: 180,
    note: "Heavy loads and long rests; the limiting factor is neural recovery between sets.",
  },
  {
    key: "hypertrophy",
    label: "Muscle size (hypertrophy)",
    repMin: 6,
    repMax: 12,
    pctMin: 67,
    pctMax: 80,
    restSec: 90,
    note: "Moderate loads taken close to failure, 1-3 reps in reserve.",
  },
  {
    key: "endurance",
    label: "Muscular endurance",
    repMin: 12,
    repMax: 20,
    pctMin: 50,
    pctMax: 67,
    restSec: 45,
    note: "Lighter loads, short rests, higher repetition totals.",
  },
  {
    key: "general",
    label: "General fitness",
    repMin: 8,
    repMax: 15,
    pctMin: 60,
    pctMax: 75,
    restSec: 60,
    note: "A middle setting that builds a bit of everything.",
  },
];

/** Splits by days available. */
export const SPLITS = {
  1: { name: "Full body", sessions: ["Full body"] },
  2: { name: "Full body twice a week", sessions: ["Full body A", "Full body B"] },
  3: { name: "Full body three times a week", sessions: ["Full body A", "Full body B", "Full body C"] },
  4: { name: "Upper / Lower", sessions: ["Upper A", "Lower A", "Upper B", "Lower B"] },
  5: {
    name: "Upper / Lower plus Push / Pull / Legs",
    sessions: ["Upper", "Lower", "Push", "Pull", "Legs"],
  },
  6: {
    name: "Push / Pull / Legs twice a week",
    sessions: ["Push A", "Pull A", "Legs A", "Push B", "Pull B", "Legs B"],
  },
};

export const DAYS_MIN = 1;
export const DAYS_MAX = 6;

export const MUSCLE_GROUPS = [
  "Chest",
  "Back",
  "Shoulders",
  "Quadriceps",
  "Hamstrings and glutes",
  "Arms",
  "Calves",
  "Core",
];

export const EQUIPMENT_OPTIONS = [
  "Bodyweight only",
  "Resistance bands",
  "Adjustable dumbbells",
  "Fixed dumbbells",
  "Barbell and plates",
  "Squat rack",
  "Bench",
  "Pull-up bar",
  "Cable machine",
  "Leg press",
  "Kettlebells",
  "Cardio machine",
];

export const WARMUP_MINUTES = 8;
export const COOLDOWN_MINUTES = 5;

export const SESSION_MINUTES_MIN = 20;
export const SESSION_MINUTES_MAX = 180;

/**
 * Split a weekly set total across sessions so the per-session numbers sum
 * exactly to the total.
 */
export function splitSets(weeklyTotal, sessions) {
  const total = Math.round(Number(weeklyTotal));
  const count = Math.round(Number(sessions));
  if (!Number.isFinite(total) || total < 0) return [];
  if (!Number.isFinite(count) || count < 1) return [];

  const base = Math.floor(total / count);
  let remainder = total - base * count;
  const out = [];
  for (let i = 0; i < count; i += 1) {
    const extra = remainder > 0 ? 1 : 0;
    remainder -= extra;
    out.push(base + extra);
  }
  return out;
}

/**
 * Seconds one working set occupies, including the rest that follows it.
 * timeUnderTension = midpoint reps × seconds per rep.
 */
export function secondsPerSet({ repMin, repMax, restSec }) {
  const low = Number(repMin);
  const high = Number(repMax);
  const rest = Number(restSec);
  if (![low, high, rest].every(Number.isFinite) || low <= 0 || high < low || rest < 0) return 0;
  const midReps = (low + high) / 2;
  return midReps * SECONDS_PER_REP + rest;
}

/**
 * Longest session that fits a time budget, in whole sets.
 * Returns 0 when warm-up and cool-down already use the whole slot.
 */
export function maxSetsInMinutes(minutes, perSetSeconds) {
  const total = Number(minutes);
  const perSet = Number(perSetSeconds);
  if (!Number.isFinite(total) || !Number.isFinite(perSet) || perSet <= 0) return 0;
  const workSeconds = (total - WARMUP_MINUTES - COOLDOWN_MINUTES) * 60;
  if (workSeconds <= 0) return 0;
  return Math.max(0, Math.floor(workSeconds / perSet));
}

/**
 * Full volume plan. Returns { error } for unusable input; never NaN.
 */
export function planVolume({
  daysPerWeek,
  experience = "intermediate",
  goal = "hypertrophy",
  muscleGroups = MUSCLE_GROUPS,
  sessionMinutes = 60,
} = {}) {
  const days = Math.round(Number(daysPerWeek));
  if (!Number.isFinite(days)) return { error: "Training days per week must be a number." };
  if (days < DAYS_MIN || days > DAYS_MAX) {
    return { error: `Pick between ${DAYS_MIN} and ${DAYS_MAX} training days a week — a seventh day leaves no recovery.` };
  }

  const groups = (Array.isArray(muscleGroups) ? muscleGroups : []).filter((name) =>
    MUSCLE_GROUPS.includes(name),
  );
  if (groups.length === 0) return { error: "Select at least one muscle group to train." };

  const minutes = Math.round(Number(sessionMinutes));
  if (!Number.isFinite(minutes)) return { error: "Session length must be a number." };
  if (minutes < SESSION_MINUTES_MIN || minutes > SESSION_MINUTES_MAX) {
    return { error: `Session length should be between ${SESSION_MINUTES_MIN} and ${SESSION_MINUTES_MAX} minutes.` };
  }

  const level = EXPERIENCE_LEVELS.find((entry) => entry.key === experience) || EXPERIENCE_LEVELS[1];
  const goalEntry = TRAINING_GOALS.find((entry) => entry.key === goal) || TRAINING_GOALS[1];
  const split = SPLITS[days];

  const weeklyTotal = level.weeklySetsPerMuscle * groups.length;
  const perSession = splitSets(weeklyTotal, days);
  const heaviestSession = perSession.length ? Math.max(...perSession) : 0;

  const perSet = secondsPerSet(goalEntry);
  const estimatedMinutes = Math.round(
    (heaviestSession * perSet) / 60 + WARMUP_MINUTES + COOLDOWN_MINUTES,
  );
  const fits = maxSetsInMinutes(minutes, perSet);
  const overTime = heaviestSession > fits;
  const overCap = heaviestSession > SESSION_SET_CAP;

  // Frequency per muscle group across the week, to one decimal.
  const frequency = days >= 4 ? 2 : days;

  return {
    days,
    split,
    level,
    goal: goalEntry,
    groups,
    weeklySetsPerMuscle: level.weeklySetsPerMuscle,
    weeklyTotal,
    perSession,
    heaviestSession,
    perSetSeconds: perSet,
    estimatedMinutes,
    sessionMinutes: minutes,
    setsThatFit: fits,
    overTime,
    overCap,
    frequency,
    weeklyMinutes: perSession.reduce(
      (sum, sets) => sum + Math.round((sets * perSet) / 60 + WARMUP_MINUTES + COOLDOWN_MINUTES),
      0,
    ),
  };
}

/** Split a textarea into a clean list of lines. */
export function parseLines(raw, max = 20) {
  if (typeof raw !== "string") return [];
  const out = [];
  for (const line of raw.split(/[\n,]+/)) {
    const item = line
      .replace(/^\s+/, "")
      .replace(/^\d+[.)]\s+/, "")
      .replace(/^[-*•–]\s*/, "")
      .trim();
    if (!item) continue;
    out.push(item);
    if (out.length >= max) break;
  }
  return out;
}

/** Assemble the prompt. Returns { error } for unusable input. */
export function buildWorkoutPrompt(input = {}) {
  const {
    daysPerWeek = 4,
    experience = "intermediate",
    goal = "hypertrophy",
    muscleGroups = MUSCLE_GROUPS,
    sessionMinutes = 60,
    equipment = [],
    injuriesRaw = "",
    dislikedExercisesRaw = "",
    weeks = 8,
    includeDeload = true,
  } = input;

  const plan = planVolume({ daysPerWeek, experience, goal, muscleGroups, sessionMinutes });
  if (plan.error) return { error: plan.error };

  const blockWeeks = Math.round(Number(weeks));
  if (!Number.isFinite(blockWeeks) || blockWeeks < 2 || blockWeeks > 16) {
    return { error: "Plan length should be between 2 and 16 weeks." };
  }

  const kit = (Array.isArray(equipment) ? equipment : []).filter((item) =>
    EQUIPMENT_OPTIONS.includes(item),
  );
  if (kit.length === 0) {
    return { error: "Select at least one piece of equipment, or pick 'Bodyweight only'." };
  }

  const injuries = parseLines(injuriesRaw);
  const disliked = parseLines(dislikedExercisesRaw);

  const lines = [];
  lines.push(
    `Write a ${blockWeeks}-week resistance training programme, ${plan.days} sessions a week, using the "${plan.split.name}" split.`,
  );
  lines.push("");
  lines.push("SAFETY — READ FIRST");
  lines.push(
    "- This is a general training plan, not medical or physiotherapy advice. Do not diagnose anything or prescribe rehabilitation.",
  );
  if (injuries.length) {
    lines.push(
      `- Injuries and limitations to work around: ${injuries.join(", ")}. Avoid loading these directly, offer a substitute for every affected movement, and add a line telling me to clear the plan with a physiotherapist or doctor first.`,
    );
  } else {
    lines.push(
      "- No injuries declared. Still include a line telling me to stop and get advice if a movement causes sharp or joint pain.",
    );
  }
  lines.push("");
  lines.push("VOLUME AND LOADING");
  lines.push(`- Experience: ${plan.level.label}. ${plan.level.note}`);
  lines.push(
    `- Weekly hard sets per muscle group: ${plan.weeklySetsPerMuscle} (the productive range is ${WEEKLY_SETS_MIN}-${WEEKLY_SETS_MAX}).`,
  );
  lines.push(`- Muscle groups trained: ${plan.groups.join(", ")}`);
  lines.push(`- Total working sets a week: ${plan.weeklyTotal}`);
  lines.push(
    `- Sets per session: ${plan.perSession.join(", ")} across ${plan.split.sessions.join(" / ")}`,
  );
  lines.push(`- Each muscle group is trained about ${plan.frequency}× a week.`);
  lines.push(
    `- Goal: ${plan.goal.label}. Work sets of ${plan.goal.repMin}-${plan.goal.repMax} reps at roughly ${plan.goal.pctMin}-${plan.goal.pctMax}% of one-rep max, resting ${plan.goal.restSec} seconds between sets. ${plan.goal.note}`,
  );
  lines.push(
    `- Session budget: ${plan.sessionMinutes} minutes including a ${WARMUP_MINUTES}-minute warm-up and a ${COOLDOWN_MINUTES}-minute cool-down. At these rest intervals that allows about ${plan.setsThatFit} working sets.`,
  );
  if (plan.overTime) {
    lines.push(
      `- WARNING: the volume above needs ${plan.heaviestSession} sets in the longest session, which is more than fits in ${plan.sessionMinutes} minutes. Either supersets for the non-competing accessory work, or drop the least important muscle group, or add a day. Say which you chose and why.`,
    );
  }
  if (plan.overCap) {
    lines.push(
      `- WARNING: ${plan.heaviestSession} sets in one session is above the practical ceiling of ${SESSION_SET_CAP}. Quality falls off; redistribute.`,
    );
  }
  lines.push("");
  lines.push("EQUIPMENT AVAILABLE (use nothing else)");
  lines.push(kit.map((item) => `- ${item}`).join("\n"));
  if (disliked.length) {
    lines.push("");
    lines.push(`EXERCISES TO AVOID: ${disliked.join(", ")}. Substitute something that trains the same pattern.`);
  }
  lines.push("");
  lines.push("RULES");
  lines.push(
    "1. Give every session as a table: exercise, sets, rep range, target rest, and a note on where to start the load.",
  );
  lines.push(
    "2. Lead each session with the heaviest compound movement while I am fresh; put isolation work last.",
  );
  lines.push(
    "3. Prescribe effort in reps-in-reserve, not 'to failure' — 1-3 RIR on compounds, 0-2 on isolation.",
  );
  lines.push(
    `4. Show progression explicitly: what changes week to week over the ${blockWeeks} weeks and the rule for when to add load rather than reps.`,
  );
  if (includeDeload) {
    lines.push(
      "5. Include a deload week — roughly half the usual sets at the same load — and say which week it falls in and why.",
    );
  }
  lines.push(
    "6. Use only the equipment listed. Do not substitute in a machine I do not have; give a free-weight or band alternative instead.",
  );
  lines.push(
    "7. Do not invent research citations, percentages of bodyweight, or expected rates of gain. Where an individual variable matters, say so.",
  );
  lines.push("");
  lines.push("OUTPUT");
  lines.push(
    "Week 1 in full, session by session, then a progression table for the remaining weeks, then a short list of what to log each session so I can tell whether it is working.",
  );

  const prompt = lines.join("\n");

  return { prompt, plan, kit, injuries, disliked, blockWeeks, charCount: prompt.length };
}
