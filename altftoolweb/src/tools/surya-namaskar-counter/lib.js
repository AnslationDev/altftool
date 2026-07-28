/**
 * Surya Namaskar round counting, breath pacing, energy cost and streaks.
 *
 * Energy uses the standard ACSM metabolic relationship: 1 MET = 3.5 mL O2 per kg
 * per minute and 1 L of O2 ~ 5 kcal, giving
 *     kcal/min = MET x 3.5 x bodyweight(kg) / 200.
 *
 * MET values are taken from the 2011 Compendium of Physical Activities:
 *   02150 yoga, Hatha .............. 2.5 METs
 *   02135 yoga, Surya Namaskar ..... 3.3 METs
 *   02120 yoga, Power .............. 4.0 METs
 * The three pace presets below map onto those three published values.
 */

/** The classical sequence has 12 postures, one breath per posture. */
export const POSTURES_PER_SEQUENCE = 12;
export const BREATHS_PER_SEQUENCE = 12;

/** The 12 postures of the classical Hatha sequence, with the breath cue. */
export const SEQUENCE = [
  ["Pranamasana", "Prayer pose", "exhale"],
  ["Hasta Uttanasana", "Raised arms pose", "inhale"],
  ["Padahastasana", "Hand to foot pose", "exhale"],
  ["Ashwa Sanchalanasana", "Equestrian pose", "inhale"],
  ["Dandasana", "Plank / stick pose", "exhale"],
  ["Ashtanga Namaskara", "Eight limbed salute", "hold"],
  ["Bhujangasana", "Cobra pose", "inhale"],
  ["Adho Mukha Svanasana", "Downward dog", "exhale"],
  ["Ashwa Sanchalanasana", "Equestrian pose, other leg", "inhale"],
  ["Padahastasana", "Hand to foot pose", "exhale"],
  ["Hasta Uttanasana", "Raised arms pose", "inhale"],
  ["Pranamasana", "Prayer pose", "exhale"],
];

/** Pace presets: seconds per 12-posture sequence and the matching Compendium MET. */
export const PACES = [
  {
    id: "gentle",
    label: "Gentle — hold each posture",
    secondsPerSequence: 60,
    met: 2.5,
    metSource: "Compendium 02150, yoga Hatha",
  },
  {
    id: "steady",
    label: "Steady — one breath per posture",
    secondsPerSequence: 35,
    met: 3.3,
    metSource: "Compendium 02135, yoga Surya Namaskar",
  },
  {
    id: "brisk",
    label: "Brisk — flowing, warm-up pace",
    secondsPerSequence: 22,
    met: 4.0,
    metSource: "Compendium 02120, yoga Power",
  },
];

/** Sensible input bounds. */
export const MAX_ROUNDS = 1080;
export const MIN_WEIGHT_KG = 20;
export const MAX_WEIGHT_KG = 300;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

const MS_PER_DAY = 86400000;

/** Convert an ISO yyyy-mm-dd string to a whole-day number, or NaN. */
export function isoToDayNumber(iso) {
  if (typeof iso !== "string") return NaN;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!match) return NaN;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return NaN;
  const stamp = Date.UTC(year, month - 1, day);
  const check = new Date(stamp);
  if (check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) return NaN;
  return stamp / MS_PER_DAY;
}

/**
 * Work out session length, breaths and energy cost for a set of rounds.
 *
 * @param {object} input
 * @param {number} input.rounds          Number of 12-posture sequences.
 * @param {string} [input.paceId]        One of the PACES ids.
 * @param {number} input.weightKg        Body weight in kilograms.
 * @param {boolean} [input.bothSides]    Count a round as leading with each leg (2 sequences).
 * @param {number} [input.restSeconds]   Rest taken between rounds, seconds.
 * @returns {object} result or { error }
 */
export function computeSession({
  rounds,
  paceId = "steady",
  weightKg,
  bothSides = false,
  restSeconds = 0,
} = {}) {
  const pace = PACES.find((item) => item.id === paceId);
  if (!pace) return { error: "Choose a practice pace." };
  if (!isNum(rounds) || !isNum(weightKg) || !isNum(restSeconds)) {
    return { error: "Rounds, body weight and rest must all be numbers." };
  }
  if (rounds <= 0) return { error: "Enter at least one round." };
  if (rounds > MAX_ROUNDS) {
    return { error: `${MAX_ROUNDS} rounds is the highest this counter handles in one session.` };
  }
  if (weightKg < MIN_WEIGHT_KG || weightKg > MAX_WEIGHT_KG) {
    return { error: `Body weight should be between ${MIN_WEIGHT_KG} kg and ${MAX_WEIGHT_KG} kg.` };
  }
  if (restSeconds < 0) return { error: "Rest between rounds cannot be negative." };
  if (restSeconds > 300) return { error: "Rest between rounds above 5 minutes is not a flow practice." };

  const sequencesPerRound = bothSides ? 2 : 1;
  const sequences = rounds * sequencesPerRound;

  const movingSeconds = sequences * pace.secondsPerSequence;
  const restTotalSeconds = Math.max(0, rounds - 1) * restSeconds;
  const totalSeconds = movingSeconds + restTotalSeconds;

  const movingMinutes = movingSeconds / 60;
  const totalMinutes = totalSeconds / 60;

  // kcal/min = MET x 3.5 x kg / 200 (ACSM). Rest is costed at 1.3 METs (quiet standing).
  const REST_MET = 1.3;
  const kcalPerMinuteMoving = (pace.met * 3.5 * weightKg) / 200;
  const kcalPerMinuteRest = (REST_MET * 3.5 * weightKg) / 200;
  const calories = kcalPerMinuteMoving * movingMinutes + kcalPerMinuteRest * (restTotalSeconds / 60);

  const postures = sequences * POSTURES_PER_SEQUENCE;
  const breaths = sequences * BREATHS_PER_SEQUENCE;

  return {
    pace,
    rounds,
    sequences,
    sequencesPerRound,
    postures,
    breaths,
    movingSeconds,
    restTotalSeconds,
    totalSeconds,
    totalMinutes,
    calories,
    caloriesPerRound: calories / rounds,
    kcalPerMinuteMoving,
    metMinutes: pace.met * movingMinutes,
    breathsPerMinute: movingMinutes > 0 ? breaths / movingMinutes : 0,
    secondsPerPosture: pace.secondsPerSequence / POSTURES_PER_SEQUENCE,
  };
}

/**
 * Current and longest daily streak from a list of practice dates.
 * A streak stays alive if the most recent practice was today or yesterday.
 *
 * @param {object} input
 * @param {string[]} input.dates  ISO yyyy-mm-dd practice dates (any order, duplicates fine).
 * @param {string} input.today    ISO yyyy-mm-dd for "today" — passed in so the maths stays pure.
 * @returns {object} result or { error }
 */
export function computeStreak({ dates = [], today } = {}) {
  if (!Array.isArray(dates)) return { error: "Practice dates must be supplied as a list." };
  const todayDay = isoToDayNumber(today);
  if (Number.isNaN(todayDay)) return { error: "Today's date must be in yyyy-mm-dd form." };

  const days = [];
  for (const iso of dates) {
    const day = isoToDayNumber(iso);
    if (Number.isNaN(day)) return { error: `"${iso}" is not a valid yyyy-mm-dd date.` };
    if (day > todayDay) return { error: `"${iso}" is in the future — log practice on the day you do it.` };
    if (!days.includes(day)) days.push(day);
  }
  days.sort((a, b) => a - b);

  if (days.length === 0) {
    return {
      totalDays: 0,
      currentStreak: 0,
      longestStreak: 0,
      practisedToday: false,
      lastGapDays: null,
    };
  }

  let longest = 1;
  let run = 1;
  for (let i = 1; i < days.length; i += 1) {
    run = days[i] === days[i - 1] + 1 ? run + 1 : 1;
    if (run > longest) longest = run;
  }

  const last = days[days.length - 1];
  const gap = todayDay - last;
  let current = 0;
  if (gap <= 1) {
    current = 1;
    for (let i = days.length - 1; i > 0; i -= 1) {
      if (days[i] === days[i - 1] + 1) current += 1;
      else break;
    }
  }

  return {
    totalDays: days.length,
    currentStreak: current,
    longestStreak: longest,
    practisedToday: gap === 0,
    lastGapDays: gap,
  };
}

/** Format a seconds count as m:ss. */
export function formatDuration(totalSeconds) {
  if (!isNum(totalSeconds) || totalSeconds < 0) return "—";
  const rounded = Math.round(totalSeconds);
  const minutes = Math.floor(rounded / 60);
  const seconds = rounded % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
