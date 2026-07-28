/**
 * Sleep hygiene checklist scoring.
 *
 * Items are drawn from the standard sleep hygiene and stimulus-control advice
 * published by the American Academy of Sleep Medicine, the CDC and the NHS:
 *   - Keep the same wake time every day, including weekends.
 *   - Keep the bedroom cool, dark and quiet; the commonly cited range is
 *     about 15.6-19.4 C (60-67 F).
 *   - Reserve the bed for sleep and sex (stimulus control, Bootzin 1972).
 *   - If you are awake for roughly 20 minutes, get out of bed until sleepy again.
 *   - Avoid caffeine late in the day. Caffeine's half-life is about 5-6 hours,
 *     so a 6-hour cut-off still leaves roughly half a dose on board at bedtime.
 *   - Avoid alcohol close to bed - it shortens sleep latency but fragments the
 *     second half of the night.
 *   - Get daylight soon after waking to anchor the circadian clock.
 *   - Keep naps short (20-30 minutes) and early in the afternoon.
 *
 * Weights below are a 1-3 impact ranking used to order the fixes; they are an
 * editorial judgement about which changes usually matter most, not a validated
 * clinical instrument.
 */

export const GROUPS = {
  bedroom: { key: "bedroom", label: "Bedroom environment" },
  habits: { key: "habits", label: "Daytime and evening habits" },
  routine: { key: "routine", label: "Bedtime routine and in-bed behaviour" },
};

/** weight 3 = highest impact, 1 = supporting. */
export const SLEEP_HYGIENE_ITEMS = [
  {
    id: "b1",
    group: "bedroom",
    weight: 2,
    text: "Bedroom stays roughly 16-19 C (60-67 F) overnight",
    fix: "Drop the thermostat or open a window an hour before bed - core temperature has to fall for sleep to start.",
  },
  {
    id: "b2",
    group: "bedroom",
    weight: 2,
    text: "Room is dark enough that you cannot make out your hand",
    fix: "Add blackout curtains or a sleep mask, and cover or remove standby LEDs.",
  },
  {
    id: "b3",
    group: "bedroom",
    weight: 2,
    text: "Noise is steady or absent, with no audible notifications",
    fix: "Silence the phone overnight, or mask intermittent noise with a fan or steady white noise.",
  },
  {
    id: "b4",
    group: "bedroom",
    weight: 1,
    text: "Mattress and pillow are comfortable and not worn out",
    fix: "Replace a sagging mattress or a flattened pillow - it is the cheapest fix on this list to test.",
  },
  {
    id: "b5",
    group: "bedroom",
    weight: 3,
    text: "The bed is used only for sleep and sex - no working, eating or scrolling",
    fix: "Move every other activity out of the bed so the bed itself stops being a cue for being awake.",
  },
  {
    id: "d1",
    group: "habits",
    weight: 3,
    text: "No caffeine within 6 hours of bedtime",
    fix: "Set a hard caffeine cut-off. With a 5-6 hour half-life, an afternoon coffee is still half-present at midnight.",
  },
  {
    id: "d2",
    group: "habits",
    weight: 2,
    text: "No alcohol within 3 hours of bedtime",
    fix: "Alcohol shortens the time to fall asleep but fragments the second half of the night - move drinks earlier.",
  },
  {
    id: "d3",
    group: "habits",
    weight: 2,
    text: "Outdoor daylight within an hour or two of waking",
    fix: "Ten to twenty minutes outside in the morning does more for the body clock than any indoor lamp.",
  },
  {
    id: "d4",
    group: "habits",
    weight: 2,
    text: "Regular exercise, with vigorous sessions finished at least an hour before bed",
    fix: "Keep training, just move the hardest sessions earlier so body temperature and adrenaline have time to fall.",
  },
  {
    id: "d5",
    group: "habits",
    weight: 1,
    text: "No large meal within 3 hours of bed",
    fix: "Shift the heaviest meal earlier; a light snack is fine if hunger is what wakes you.",
  },
  {
    id: "d6",
    group: "habits",
    weight: 2,
    text: "Naps kept to 20-30 minutes and taken before mid-afternoon",
    fix: "Cap naps at 30 minutes and before about 3pm so they do not eat into the night's sleep pressure.",
  },
  {
    id: "r1",
    group: "routine",
    weight: 3,
    text: "Same wake time every day, weekends included, within about 30 minutes",
    fix: "Fix the wake time first - it anchors the whole clock, and bedtime follows it rather than the other way round.",
  },
  {
    id: "r2",
    group: "routine",
    weight: 2,
    text: "A 30-60 minute wind-down of the same low-key activities each night",
    fix: "Repeat the same three or four quiet steps nightly so they become a signal rather than a decision.",
  },
  {
    id: "r3",
    group: "routine",
    weight: 2,
    text: "Bright screens and overhead lights dimmed in the last hour",
    fix: "Dim the room rather than only the screen - overhead lighting is usually the brighter source.",
  },
  {
    id: "r4",
    group: "routine",
    weight: 3,
    text: "If awake for about 20 minutes, you get out of bed until sleepy again",
    fix: "Leave the bed, keep the lights low and do something dull until sleepy. Lying awake trains the bed as a place for being awake.",
  },
  {
    id: "r5",
    group: "routine",
    weight: 1,
    text: "The clock is turned away so you are not checking the time at night",
    fix: "Turn the clock around. Knowing the time at 3am adds arousal and changes nothing.",
  },
];

export const TOTAL_WEIGHT = SLEEP_HYGIENE_ITEMS.reduce((sum, item) => sum + item.weight, 0);

export const SCORE_BANDS = [
  {
    key: "strong",
    label: "Strong sleep hygiene",
    min: 85,
    summary:
      "The basics are in place. If sleep is still poor, the problem is unlikely to be hygiene and is worth raising with a doctor.",
  },
  {
    key: "good",
    label: "Good, with gaps",
    min: 65,
    summary: "Most of the foundation is there. Closing the two or three highest-impact gaps is the quickest win.",
  },
  {
    key: "mixed",
    label: "Needs work",
    min: 45,
    summary: "Enough is missing that sleep quality is probably being affected. Change one thing at a time and give it two weeks.",
  },
  {
    key: "poor",
    label: "Major gaps",
    min: 0,
    summary:
      "Most of the basics are not in place. Start with the wake time and the bed-for-sleep-only rule before anything else.",
  },
];

/** Caffeine's half-life is 5-6 hours, hence a 6-hour cut-off before bed. */
export const CAFFEINE_CUTOFF_HOURS = 6;
export const ALCOHOL_CUTOFF_HOURS = 3;
export const LARGE_MEAL_CUTOFF_HOURS = 3;
export const WIND_DOWN_HOURS = 1;
export const MINUTES_IN_DAY = 24 * 60;

export function bandForScore(score) {
  if (typeof score !== "number" || !Number.isFinite(score)) return null;
  return SCORE_BANDS.find((band) => score >= band.min) || SCORE_BANDS[SCORE_BANDS.length - 1];
}

/**
 * Score a set of ticked item ids.
 *
 * @param {string[]} checkedIds ids from SLEEP_HYGIENE_ITEMS that are true today
 * @returns {object} score, band, per-group scores and impact-ranked fixes
 */
export function scoreSleepHygiene(checkedIds) {
  if (!Array.isArray(checkedIds)) {
    return { error: "Pass the ticked items as a list." };
  }
  const checked = new Set(checkedIds.filter((id) => typeof id === "string"));
  const known = new Set(SLEEP_HYGIENE_ITEMS.map((item) => item.id));
  const unknown = [...checked].filter((id) => !known.has(id));

  let earned = 0;
  const groupTotals = {};
  Object.keys(GROUPS).forEach((key) => {
    groupTotals[key] = { key, label: GROUPS[key].label, earned: 0, possible: 0, items: 0, done: 0 };
  });

  const missed = [];
  SLEEP_HYGIENE_ITEMS.forEach((item) => {
    const group = groupTotals[item.group];
    group.possible += item.weight;
    group.items += 1;
    if (checked.has(item.id)) {
      earned += item.weight;
      group.earned += item.weight;
      group.done += 1;
    } else {
      missed.push(item);
    }
  });

  const score = TOTAL_WEIGHT > 0 ? Math.round((earned / TOTAL_WEIGHT) * 100) : 0;
  const band = bandForScore(score);

  Object.values(groupTotals).forEach((group) => {
    group.percent = group.possible > 0 ? Math.round((group.earned / group.possible) * 100) : 0;
  });

  const groups = Object.keys(GROUPS).map((key) => groupTotals[key]);
  const weakestGroup = groups.reduce((a, b) => (b.percent < a.percent ? b : a), groups[0]);

  // Fixes ranked by impact weight, then by the order they appear in the list.
  const priorityFixes = [...missed].sort((a, b) => b.weight - a.weight).slice(0, 5);

  return {
    earned,
    possible: TOTAL_WEIGHT,
    score,
    bandKey: band.key,
    bandLabel: band.label,
    bandSummary: band.summary,
    checkedCount: SLEEP_HYGIENE_ITEMS.length - missed.length,
    itemCount: SLEEP_HYGIENE_ITEMS.length,
    groups,
    weakestGroupLabel: weakestGroup.label,
    missedCount: missed.length,
    priorityFixes,
    unknownIds: unknown,
  };
}

/** "22:30" -> 1350 minutes past midnight, or null when it is not a valid time. */
export function parseTimeToMinutes(value) {
  if (typeof value !== "string") return null;
  const match = value.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

/** 1350 -> "22:30", wrapping across midnight. */
export function formatMinutes(totalMinutes) {
  if (typeof totalMinutes !== "number" || !Number.isFinite(totalMinutes)) return "--:--";
  const wrapped = ((Math.round(totalMinutes) % MINUTES_IN_DAY) + MINUTES_IN_DAY) % MINUTES_IN_DAY;
  const hours = Math.floor(wrapped / 60);
  const minutes = wrapped % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/**
 * Cut-off clock times derived from a target bedtime.
 * @param {string} bedtime "HH:MM" in 24-hour form
 */
export function bedtimeCutoffs(bedtime) {
  const bedMinutes = parseTimeToMinutes(bedtime);
  if (bedMinutes === null) {
    return { error: "Enter a bedtime as HH:MM in 24-hour form, for example 22:30." };
  }
  const before = (hours) => formatMinutes(bedMinutes - hours * 60);
  return {
    bedtime: formatMinutes(bedMinutes),
    caffeine: before(CAFFEINE_CUTOFF_HOURS),
    alcohol: before(ALCOHOL_CUTOFF_HOURS),
    largeMeal: before(LARGE_MEAL_CUTOFF_HOURS),
    windDown: before(WIND_DOWN_HOURS),
    caffeineHours: CAFFEINE_CUTOFF_HOURS,
    alcoholHours: ALCOHOL_CUTOFF_HOURS,
    largeMealHours: LARGE_MEAL_CUTOFF_HOURS,
    windDownHours: WIND_DOWN_HOURS,
  };
}
