/**
 * Kids daily step goal planner.
 *
 * Two published anchors are used together:
 *
 * 1. Active minutes — WHO 2020 Guidelines on physical activity and sedentary
 *    behaviour. Ages 5-17: an average of at least 60 minutes a day of
 *    moderate-to-vigorous physical activity across the week, with
 *    vigorous-intensity and muscle/bone strengthening activity on at least
 *    3 days a week. Ages 3-4: at least 180 minutes of activity of any
 *    intensity, of which at least 60 minutes is moderate-to-vigorous.
 *
 * 2. Step counts — pedometer-based standards. For ages 6-11 the widely used
 *    BMI-referenced standards are 13,000 steps/day for boys and 11,000 for
 *    girls (Tudor-Locke et al.). For adolescents the published recommendation
 *    is a range of 10,000-11,700 steps/day, so this planner uses 11,000, the
 *    middle of that range, for both sexes. For preschoolers a commonly cited
 *    recommendation is about 11,500 steps/day (De Craemer et al., 2015).
 *
 * Everything here is a population target for healthy children, not a
 * prescription for an individual child.
 */

export const MIN_AGE = 3;
export const MAX_AGE = 17;

/** WHO daily activity minutes by age group. */
export const WHO_MINUTES = {
  preschool: { totalActivity: 180, mvpa: 60 },
  schoolAge: { totalActivity: null, mvpa: 60 },
};

/** Days per week WHO asks for vigorous plus strengthening activity (ages 5-17). */
export const STRENGTH_DAYS_PER_WEEK = 3;

/**
 * Cadence at which children's walking reaches moderate intensity.
 * Around 120 steps per minute in children, higher than the ~100 steps/min
 * adult threshold because children have shorter legs and faster natural turnover.
 */
export const CHILD_MODERATE_CADENCE = 120;

export const STEP_TARGETS = [
  {
    key: "preschool",
    minAge: 3,
    maxAge: 5,
    label: "Preschool (3-5)",
    steps: { male: 11500, female: 11500 },
    range: [10000, 11500],
    source: "Preschool step recommendation of about 11,500 steps/day (De Craemer et al., 2015).",
  },
  {
    key: "primary",
    minAge: 6,
    maxAge: 11,
    label: "Primary school (6-11)",
    steps: { male: 13000, female: 11000 },
    range: [11000, 13000],
    source: "BMI-referenced pedometer standards: 13,000 steps/day for boys, 11,000 for girls (Tudor-Locke et al.).",
  },
  {
    key: "teen",
    minAge: 12,
    maxAge: 17,
    label: "Adolescent (12-17)",
    steps: { male: 11000, female: 11000 },
    range: [10000, 11700],
    source: "Published adolescent recommendation of 10,000-11,700 steps/day; this planner uses the mid-point, 11,000.",
  },
];

/**
 * Step-equivalent rates for common play. Walking and running are true step
 * counts; skipping and dance are step-equivalents that a hip or wrist counter
 * registers at roughly these rates.
 */
export const ACTIVITY_RATES = [
  { key: "walk", label: "Brisk walk", stepsPerMinute: 120 },
  { key: "playground", label: "Playground games / tag", stepsPerMinute: 150 },
  { key: "skipping", label: "Skipping rope", stepsPerMinute: 160 },
  { key: "run", label: "Running around", stepsPerMinute: 180 },
  { key: "dance", label: "Dancing", stepsPerMinute: 130 },
];

/** Playful progress levels, as a share of the daily step target. */
export const LEVELS = [
  { key: "warmup", min: 0, max: 40, label: "Warming up", blurb: "The day has barely started — a short walk moves the needle fast." },
  { key: "going", min: 40, max: 70, label: "Getting going", blurb: "Good progress. One decent play session closes most of the gap." },
  { key: "nearly", min: 70, max: 100, label: "Nearly there", blurb: "The finish line is close — a walk after dinner should do it." },
  { key: "goal", min: 100, max: 130, label: "Goal smashed", blurb: "Daily target met. Anything more is a bonus." },
  { key: "superstar", min: 130, max: Infinity, label: "Step superstar", blurb: "Well above the daily target — a genuinely active day." },
];

function ageGroupFor(ageYears) {
  return STEP_TARGETS.find((row) => ageYears >= row.minAge && ageYears <= row.maxAge) || null;
}

function levelFor(percent) {
  return LEVELS.find((row) => percent >= row.min && percent < row.max) || LEVELS[LEVELS.length - 1];
}

/**
 * Build the day's plan.
 *
 * @param {object} input
 * @param {number} input.ageYears 3-17
 * @param {"male"|"female"} input.sex
 * @param {number} input.stepsToday steps already recorded today
 * @param {number} [input.activeMinutes] moderate-to-vigorous minutes already done
 * @returns {object} plan, or { error }
 */
export function planKidStepGoal({ ageYears, sex, stepsToday, activeMinutes = 0 } = {}) {
  if (sex !== "male" && sex !== "female") {
    return { error: "Choose whether the target should use the boys' or girls' step standard." };
  }

  const age = Number(ageYears);
  if (!Number.isFinite(age)) return { error: "Enter the child's age in years." };
  if (age < MIN_AGE || age > MAX_AGE) {
    return { error: `Step standards for children cover ages ${MIN_AGE} to ${MAX_AGE}.` };
  }

  const steps = Number(stepsToday);
  if (!Number.isFinite(steps)) return { error: "Enter today's step count as a number." };
  if (steps < 0) return { error: "Step count cannot be negative." };
  if (steps > 100000) return { error: "That step count is beyond anything a pedometer records in a day." };

  const minutes = Number(activeMinutes);
  if (!Number.isFinite(minutes) || minutes < 0) {
    return { error: "Enter active minutes as zero or more." };
  }
  if (minutes > 24 * 60) return { error: "Active minutes cannot exceed the 1,440 minutes in a day." };

  const group = ageGroupFor(age);
  if (!group) return { error: "No step standard is published for that age." };

  const target = group.steps[sex];
  const remaining = Math.max(0, target - steps);
  const percent = (steps / target) * 100;
  const level = levelFor(percent);

  const isPreschool = group.key === "preschool" && age < 5;
  const minuteGoal = isPreschool ? WHO_MINUTES.preschool : WHO_MINUTES.schoolAge;
  const mvpaRemaining = Math.max(0, minuteGoal.mvpa - minutes);

  const topUps = ACTIVITY_RATES.map((activity) => ({
    ...activity,
    minutesNeeded: remaining === 0 ? 0 : Math.ceil(remaining / activity.stepsPerMinute),
  }));

  // 60 minutes of moderate walking at the children's cadence threshold.
  const mvpaStepEquivalent = minuteGoal.mvpa * CHILD_MODERATE_CADENCE;

  return {
    ageYears: age,
    sex,
    group,
    target,
    range: group.range,
    stepsToday: steps,
    remaining,
    percent: Math.round(percent),
    level,
    weeklyTarget: target * 7,
    weeklyRemaining: Math.max(0, target * 7 - steps),
    activeMinutes: minutes,
    mvpaGoal: minuteGoal.mvpa,
    totalActivityGoal: minuteGoal.totalActivity,
    mvpaRemaining,
    mvpaStepEquivalent,
    strengthDays: STRENGTH_DAYS_PER_WEEK,
    topUps,
  };
}
