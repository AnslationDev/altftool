/**
 * Cricket match energy expenditure.
 *
 * The 2011 Compendium of Physical Activities gives one figure for the whole game
 * (code 15200, "cricket, batting, bowling, fielding", 4.8 METs), which badly
 * misrepresents a sport where a fast bowler and a deep fielder are doing completely
 * different jobs. This model keeps 4.8 as the whole-game anchor but costs each role
 * separately, spread around that anchor in the order the match-analysis literature
 * consistently reports: fast bowling hardest, outfielding lightest.
 */

/** Compendium code 15200, cricket (batting, bowling, fielding), all roles combined. */
export const COMPENDIUM_CRICKET_MET = 4.8;

/** On-field roles other than bowling, with their working MET values. */
export const FIELD_ROLES = {
  outfield: {
    key: "outfield",
    label: "Fielding in the deep",
    met: 3.8,
    note: "Mostly standing and walking, with occasional chases and throws.",
  },
  infield: {
    key: "infield",
    label: "Fielding in the ring or close in",
    met: 5,
    note: "Constant repositioning, crouching and short sprints to the ball.",
  },
  keeping: {
    key: "keeping",
    label: "Wicketkeeping",
    met: 5,
    note: "Squatting and standing for every delivery, plus lateral dives.",
  },
};

/** Batting at the crease, including running between the wickets. */
export const BATTING_MET = 5.5;

/** Bowling intensity by type. Pace bowling includes the run-up and the delivery stride. */
export const BOWLING_TYPES = {
  spin: { key: "spin", label: "Spin bowling", met: 6 },
  medium: { key: "medium", label: "Medium pace", met: 7.5 },
  fast: { key: "fast", label: "Fast bowling", met: 8.5 },
};

/** Padded up in the pavilion or off the field between spells. Sitting is 1.3-1.5 METs. */
export const WAITING_MET = 1.5;

/** One MET by definition, used to strip out the calories you would burn anyway. */
export const RESTING_MET = 1;

/** ACSM energy equation: kcal/min = METs x 3.5 mL O2 per kg per min x kg / 200. */
export const ML_O2_PER_MET = 3.5;
export const ACSM_KCAL_DIVISOR = 200;

/**
 * A cricket pitch is 22 yards, which is 20.12 m stump to stump. The popping creases
 * sit 4 feet in front of each set of stumps, so a completed run covers the 58 feet
 * (17.68 m) between them.
 */
export const PITCH_LENGTH_M = 20.12;
export const RUN_DISTANCE_M = 17.68;

/** Over rates of roughly 15 an hour give about 4 minutes of match time per over. */
export const DEFAULT_MINUTES_PER_OVER = 4;

export const LIMITS = {
  weightKg: [25, 250],
  minutes: [0, 600],
  overs: [0, 100],
  minutesPerOver: [1, 10],
  runs: [0, 500],
};

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);

/** kcal per minute for a given MET value and body mass. */
export function kcalPerMinute(met, weightKg) {
  if (!isFiniteNumber(met) || !isFiniteNumber(weightKg)) return NaN;
  return (met * ML_O2_PER_MET * weightKg) / ACSM_KCAL_DIVISOR;
}

const inRange = (value, [low, high]) => value >= low && value <= high;

/**
 * @param {object} input
 * @param {number} input.weightKg          body mass in kilograms
 * @param {number} input.fieldingMinutes   minutes spent fielding
 * @param {string} [input.fieldingRole]    key of FIELD_ROLES
 * @param {number} input.battingMinutes    minutes at the crease
 * @param {number} input.oversBowled       overs bowled in the match
 * @param {string} [input.bowlingType]     key of BOWLING_TYPES
 * @param {number} [input.minutesPerOver]  match minutes each over consumes
 * @param {number} [input.waitingMinutes]  minutes padded up or off the field
 * @param {number} [input.runsRun]         runs actually run between the wickets
 */
export function computeCricketCalories({
  weightKg,
  fieldingMinutes = 0,
  fieldingRole = "outfield",
  battingMinutes = 0,
  oversBowled = 0,
  bowlingType = "medium",
  minutesPerOver = DEFAULT_MINUTES_PER_OVER,
  waitingMinutes = 0,
  runsRun = 0,
}) {
  const numbers = [
    weightKg,
    fieldingMinutes,
    battingMinutes,
    oversBowled,
    minutesPerOver,
    waitingMinutes,
    runsRun,
  ];
  if (!numbers.every(isFiniteNumber)) {
    return { error: "Enter a number in every field — use 0 for anything you did not do." };
  }
  if (!inRange(weightKg, LIMITS.weightKg)) {
    return { error: `Body weight should be between ${LIMITS.weightKg[0]} kg and ${LIMITS.weightKg[1]} kg.` };
  }
  if (!inRange(fieldingMinutes, LIMITS.minutes) || !inRange(battingMinutes, LIMITS.minutes) || !inRange(waitingMinutes, LIMITS.minutes)) {
    return { error: `Each block of time should be between ${LIMITS.minutes[0]} and ${LIMITS.minutes[1]} minutes.` };
  }
  if (!inRange(oversBowled, LIMITS.overs)) {
    return { error: `Overs bowled should be between ${LIMITS.overs[0]} and ${LIMITS.overs[1]}.` };
  }
  if (!inRange(minutesPerOver, LIMITS.minutesPerOver)) {
    return { error: `Minutes per over should be between ${LIMITS.minutesPerOver[0]} and ${LIMITS.minutesPerOver[1]}.` };
  }
  if (!inRange(runsRun, LIMITS.runs)) {
    return { error: `Runs run should be between ${LIMITS.runs[0]} and ${LIMITS.runs[1]}.` };
  }

  const role = FIELD_ROLES[fieldingRole];
  if (!role) return { error: "Choose a fielding position." };
  const bowling = BOWLING_TYPES[bowlingType];
  if (!bowling) return { error: "Choose a bowling type." };

  const bowlingMinutes = oversBowled * minutesPerOver;

  const segments = [
    { key: "fielding", label: role.label, met: role.met, minutes: fieldingMinutes },
    { key: "batting", label: "Batting at the crease", met: BATTING_MET, minutes: battingMinutes },
    { key: "bowling", label: bowling.label, met: bowling.met, minutes: bowlingMinutes },
    { key: "waiting", label: "Padded up or off the field", met: WAITING_MET, minutes: waitingMinutes },
  ].map((segment) => ({
    ...segment,
    kcalPerMin: kcalPerMinute(segment.met, weightKg),
    kcal: kcalPerMinute(segment.met, weightKg) * segment.minutes,
  }));

  const totalMinutes = segments.reduce((sum, segment) => sum + segment.minutes, 0);
  if (totalMinutes <= 0) {
    return { error: "Enter at least some time batting, bowling, fielding or waiting." };
  }

  const grossKcal = segments.reduce((sum, segment) => sum + segment.kcal, 0);
  const restingKcalPerMin = kcalPerMinute(RESTING_MET, weightKg);
  const netKcal = Math.max(0, grossKcal - restingKcalPerMin * totalMinutes);
  const averageMet = grossKcal / totalMinutes / restingKcalPerMin;

  const runningDistanceM = runsRun * RUN_DISTANCE_M;
  const ballsBowled = oversBowled * 6;

  return {
    segments,
    totalMinutes,
    grossKcal,
    netKcal,
    averageMet,
    bowlingMinutes,
    ballsBowled,
    runningDistanceM,
    kcalPerHour: (grossKcal / totalMinutes) * 60,
    compendiumComparisonKcal: kcalPerMinute(COMPENDIUM_CRICKET_MET, weightKg) * totalMinutes,
    fieldingRoleNote: role.note,
  };
}
