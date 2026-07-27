/**
 * Chronotype scoring using the reduced Morningness-Eveningness Questionnaire (rMEQ).
 *
 * The rMEQ (Adan & Almirall, Personality and Individual Differences, 1991) takes five items
 * from the full 19-item Horne & Ostberg MEQ (1976) — items 1, 5, 7, 10 and 19 — and keeps the
 * original item weights. Summing them gives a score from 5 to 25 on this scoring, and the
 * standard published cut-offs are:
 *
 *   <= 11   Evening type
 *   12-17   Intermediate type
 *   >= 18   Morning type
 *
 * Two of the items ask for a clock band (free wake time, and the time you feel sleepy in the
 * evening). The midpoint of the band you pick is used to describe your natural sleep window,
 * so the timings shown come from your own answers rather than from a lookup table.
 *
 * Additional timing rules:
 *  - Caffeine has a ~5 hour half-life, so the cutoff is set 8 hours before natural sleep onset.
 *  - Bright light in the hours after waking advances the body clock (helps evening types);
 *    bright light in the late evening delays it (helps extreme morning types).
 *  - A sleep schedule advances by roughly 30 minutes per day at most, which sets how long it
 *    takes to close the gap between your natural wake time and the one work demands.
 *
 * Pure module: no clock reads, no DOM, no React.
 */

export const MINUTES_PER_DAY = 1440;

/** Caffeine cutoff before natural sleep onset, hours. */
export const CAFFEINE_CUTOFF_BEFORE_SLEEP_H = 8;
/** Dim screens and overhead lights this long before sleep onset, minutes. */
export const SCREEN_DIM_BEFORE_SLEEP_MIN = 90;
/** Practical maximum a sleep schedule advances per day, minutes. */
export const MAX_PHASE_ADVANCE_PER_DAY_MIN = 30;

const mid = (fromMin, toMin) => Math.round((fromMin + (toMin < fromMin ? toMin + MINUTES_PER_DAY : toMin)) / 2);

/**
 * The five rMEQ items. `weight` is the original MEQ score for that option.
 * `midMinutes` is the midpoint of the clock band, used for the timing output only.
 */
export const QUESTIONS = [
  {
    id: "free-wake",
    text: "If you were entirely free to plan your day, what time would you get up?",
    options: [
      { label: "05:00 – 06:30", weight: 5, midMinutes: mid(300, 390) },
      { label: "06:30 – 07:45", weight: 4, midMinutes: mid(390, 465) },
      { label: "07:45 – 09:45", weight: 3, midMinutes: mid(465, 585) },
      { label: "09:45 – 11:00", weight: 2, midMinutes: mid(585, 660) },
      { label: "11:00 – 12:00", weight: 1, midMinutes: mid(660, 720) },
    ],
  },
  {
    id: "wake-tiredness",
    text: "During the first half hour after waking, how tired do you feel?",
    options: [
      { label: "Very tired", weight: 1 },
      { label: "Fairly tired", weight: 2 },
      { label: "Fairly refreshed", weight: 3 },
      { label: "Very refreshed", weight: 4 },
    ],
  },
  {
    id: "evening-sleepy",
    text: "At what time in the evening do you feel tired and in need of sleep?",
    options: [
      { label: "20:00 – 21:00", weight: 5, midMinutes: mid(1200, 1260) },
      { label: "21:00 – 22:15", weight: 4, midMinutes: mid(1260, 1335) },
      { label: "22:15 – 00:45", weight: 3, midMinutes: mid(1335, 45) },
      { label: "00:45 – 02:00", weight: 2, midMinutes: mid(45, 120) + MINUTES_PER_DAY },
      { label: "02:00 – 03:00", weight: 1, midMinutes: mid(120, 180) + MINUTES_PER_DAY },
    ],
  },
  {
    id: "peak",
    text: "At what time of day do you reach your 'feeling best' peak?",
    options: [
      { label: "05:00 – 08:00", weight: 5, window: "05:00–08:00" },
      { label: "08:00 – 10:00", weight: 4, window: "08:00–10:00" },
      { label: "10:00 – 17:00", weight: 3, window: "10:00–17:00" },
      { label: "17:00 – 22:00", weight: 2, window: "17:00–22:00" },
      { label: "22:00 – 05:00", weight: 1, window: "22:00–05:00" },
    ],
  },
  {
    id: "self-type",
    text: "Which of these types do you consider yourself to be?",
    options: [
      { label: "Definitely a morning type", weight: 6 },
      { label: "Rather more a morning type than an evening type", weight: 4 },
      { label: "Rather more an evening type than a morning type", weight: 2 },
      { label: "Definitely an evening type", weight: 1 },
    ],
  },
];

export const MIN_SCORE = QUESTIONS.reduce((sum, q) => sum + Math.min(...q.options.map((o) => o.weight)), 0);
export const MAX_SCORE = QUESTIONS.reduce((sum, q) => sum + Math.max(...q.options.map((o) => o.weight)), 0);

/** Published rMEQ cut-offs. */
export const CHRONOTYPES = [
  {
    key: "evening",
    maxScore: 11,
    label: "Evening type",
    short: "Owl",
    summary:
      "Your body clock runs late. You wake slowly, feel best in the afternoon or evening, and early starts cost you real sleep rather than willpower.",
    lightAdvice:
      "Get 20–30 minutes of daylight as soon after waking as you can, and keep the last two hours before bed dim. Morning light is the strongest signal for pulling a late clock earlier.",
  },
  {
    key: "intermediate",
    maxScore: 17,
    label: "Intermediate type",
    short: "Neither",
    summary:
      "Your clock sits near the middle of the population. You adapt to most schedules, which makes consistency — not timing — the thing that matters most for you.",
    lightAdvice:
      "Daylight in the morning and dim light in the evening will hold your clock steady. Keep wake time within about an hour across the week.",
  },
  {
    key: "morning",
    maxScore: MAX_SCORE,
    label: "Morning type",
    short: "Lark",
    summary:
      "Your body clock runs early. You wake easily, peak before lunch, and fade in the evening — late social or work commitments are what cost you sleep.",
    lightAdvice:
      "If you need to stay up later, get bright light in the late afternoon and early evening and keep mornings dimmer. Evening light delays the clock.",
  },
];

const pad2 = (n) => String(n).padStart(2, "0");

export function toClock(absoluteMinutes) {
  if (!Number.isFinite(absoluteMinutes)) return null;
  const rounded = Math.round(absoluteMinutes);
  const within = ((rounded % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  return {
    minutes: rounded,
    minutesOfDay: within,
    time: `${pad2(Math.floor(within / 60))}:${pad2(within % 60)}`,
  };
}

export function formatDuration(totalMinutes) {
  if (!Number.isFinite(totalMinutes) || totalMinutes < 0) return "—";
  const mins = Math.round(totalMinutes);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

export function parseTimeToMinutes(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
}

export function classifyScore(score) {
  return CHRONOTYPES.find((type) => score <= type.maxScore) || CHRONOTYPES[CHRONOTYPES.length - 1];
}

/**
 * @param {object} input
 * @param {number[]} input.answers        one option index per question, in QUESTIONS order
 * @param {string} [input.requiredWake]   "HH:MM" the wake time work or school forces on you
 */
export function scoreChronotype({ answers, requiredWake = "" }) {
  if (!Array.isArray(answers) || answers.length !== QUESTIONS.length) {
    return { error: `Answer all ${QUESTIONS.length} questions to get a result.` };
  }

  let score = 0;
  const picked = [];
  for (let i = 0; i < QUESTIONS.length; i += 1) {
    const index = answers[i];
    if (!Number.isInteger(index) || index < 0 || index >= QUESTIONS[i].options.length) {
      return { error: `Question ${i + 1} has no valid answer selected.` };
    }
    const option = QUESTIONS[i].options[index];
    score += option.weight;
    picked.push(option);
  }

  const type = classifyScore(score);

  const wakeMinutes = picked[0].midMinutes;
  const sleepyMinutes = picked[2].midMinutes;
  // Sleep window runs from the evening sleepiness midpoint forward to the free wake midpoint.
  let sleepWindowMin = wakeMinutes - sleepyMinutes;
  while (sleepWindowMin <= 0) sleepWindowMin += MINUTES_PER_DAY;
  const midSleepMinutes = sleepyMinutes + sleepWindowMin / 2;

  const caffeineCutoff = toClock(sleepyMinutes - CAFFEINE_CUTOFF_BEFORE_SLEEP_H * 60);
  const screensDimBy = toClock(sleepyMinutes - SCREEN_DIM_BEFORE_SLEEP_MIN);

  let socialJetlagMin = null;
  let daysToAdjust = null;
  const requiredWakeMinutes = requiredWake ? parseTimeToMinutes(requiredWake) : null;
  if (requiredWake && requiredWakeMinutes === null) {
    return { error: "Enter the forced wake time as HH:MM, for example 06:30." };
  }
  if (requiredWakeMinutes !== null) {
    const naturalWakeOfDay = toClock(wakeMinutes).minutesOfDay;
    let gap = naturalWakeOfDay - requiredWakeMinutes;
    if (gap > MINUTES_PER_DAY / 2) gap -= MINUTES_PER_DAY;
    if (gap < -MINUTES_PER_DAY / 2) gap += MINUTES_PER_DAY;
    socialJetlagMin = gap; // positive = you are forced up earlier than your natural wake
    daysToAdjust = gap > 0 ? Math.ceil(gap / MAX_PHASE_ADVANCE_PER_DAY_MIN) : 0;
  }

  return {
    score,
    minScore: MIN_SCORE,
    maxScore: MAX_SCORE,
    type,
    naturalWake: toClock(wakeMinutes),
    naturalSleepy: toClock(sleepyMinutes),
    suggestedBedtime: toClock(sleepyMinutes),
    midSleep: toClock(midSleepMinutes),
    sleepWindowMin,
    peakWindow: picked[3].window,
    caffeineCutoff,
    screensDimBy,
    socialJetlagMin,
    daysToAdjust,
    requiredWake: requiredWakeMinutes === null ? null : toClock(requiredWakeMinutes),
  };
}
