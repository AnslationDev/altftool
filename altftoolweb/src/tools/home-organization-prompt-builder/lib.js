/**
 * Home Organization Prompt Builder — pure logic.
 *
 *  1. Real session arithmetic: room area (converted to square metres) times a
 *     minutes-per-square-metre rate times a clutter multiplier gives a total
 *     workload, which is then divided into sessions, weeks and Pomodoro blocks.
 *  2. Deterministic assembly of a decluttering prompt around a named method.
 *
 * No React, no DOM, no clocks.
 */

/** OpenAI's published rule of thumb for English: ~4 characters per token. */
export const CHARS_PER_TOKEN = 4;

/** 1 square metre = 10.7639104167097 square feet (exact from 1 ft = 0.3048 m). */
export const SQFT_PER_SQM = 10.7639104167097;

/**
 * Planning assumption, exposed as an input: minutes of sorting work per square
 * metre of floor area at "normal" clutter. 6 min/m² means a 12 m² bedroom takes
 * roughly 72 minutes end to end. A budgeting figure, not a measured average.
 */
export const DEFAULT_MINUTES_PER_SQM = 6;
export const MAX_MINUTES_PER_SQM = 60;

/**
 * Pomodoro Technique (Francesco Cirillo): a 25-minute focused block followed by
 * a 5-minute break, with a longer break after four blocks.
 */
export const POMODORO_WORK_MIN = 25;
export const POMODORO_BREAK_MIN = 5;
export const POMODOROS_BEFORE_LONG_BREAK = 4;

/** How much longer the job takes at each clutter level. Level 3 is the baseline. */
export const CLUTTER_LEVELS = {
  1: { label: "Mostly tidy", multiplier: 0.5 },
  2: { label: "Slightly cluttered", multiplier: 0.75 },
  3: { label: "Normal lived-in mess", multiplier: 1 },
  4: { label: "Very cluttered", multiplier: 1.5 },
  5: { label: "Overwhelming", multiplier: 2.25 },
};

/** Named decluttering methods, described as their authors define them. */
export const METHODS = {
  "four-box": {
    label: "Four-Box method",
    rule: "Every item goes into exactly one of four boxes: Keep, Donate, Relocate, Trash. Nothing goes back down undecided.",
  },
  konmari: {
    label: "KonMari",
    rule: "Work by category, never by room, in Marie Kondo's fixed order: clothes, books, papers, komono (miscellaneous), then sentimental items. Handle each item and keep only what you actively want to keep.",
  },
  "twenty-twenty": {
    label: "20/20 rule",
    rule: "The Minimalists' test: if an item could be replaced for under $20 in under 20 minutes, it does not need to be kept 'just in case'.",
  },
  ohio: {
    label: "OHIO (Only Handle It Once)",
    rule: "Every item you pick up gets its decision immediately — put away, binned or bagged for donation. No 'deal with it later' pile.",
  },
  "twelve-twelve-twelve": {
    label: "12-12-12 challenge",
    rule: "In each pass, find 12 items to throw away, 12 to donate, and 12 to return to their proper place.",
  },
};

/** Common rooms, used as prompt context and for the storage question. */
export const ROOMS = [
  "Bedroom",
  "Kitchen",
  "Living room",
  "Home office",
  "Bathroom",
  "Garage",
  "Loft or attic",
  "Wardrobe or closet",
  "Kids' room",
  "Entryway",
];

export const AREA_UNITS = { sqm: "square metres", sqft: "square feet" };

function clean(text) {
  return String(text ?? "").trim();
}

/** Convert an area to square metres. Returns null for unusable input. */
export function toSquareMetres(area, unit) {
  if (!Number.isFinite(area) || area <= 0) return null;
  return unit === "sqft" ? area / SQFT_PER_SQM : area;
}

/**
 * Whole Pomodoro blocks that fit in a session. The final break is not needed,
 * so a 55-minute session fits two 25-minute blocks (25 + 5 + 25).
 */
export function pomodorosIn(sessionMinutes) {
  if (!(sessionMinutes >= POMODORO_WORK_MIN)) return 0;
  return Math.floor(
    (sessionMinutes + POMODORO_BREAK_MIN) / (POMODORO_WORK_MIN + POMODORO_BREAK_MIN),
  );
}

/**
 * Split a total workload into sessions and calendar weeks.
 */
export function planSessions({ totalMinutes, sessionMinutes, sessionsPerWeek }) {
  const sessions = Math.ceil(totalMinutes / sessionMinutes);
  const weeks = Math.ceil(sessions / sessionsPerWeek);
  return { sessions, weeks };
}

/**
 * @returns {{error: string} | object}
 */
export function buildHomeOrganizationPrompt({
  room = "Bedroom",
  areaValue = 0,
  areaUnit = "sqm",
  clutterLevel = 3,
  minutesPerSqm = DEFAULT_MINUTES_PER_SQM,
  sessionMinutes = 45,
  sessionsPerWeek = 3,
  method = "four-box",
  householdSize = 1,
  problemAreas = "",
  keepConstraints = "",
} = {}) {
  const roomText = clean(room) || "Bedroom";
  const area = Number(areaValue);
  const level = Math.round(Number(clutterLevel));
  const rate = Number(minutesPerSqm);
  const session = Number(sessionMinutes);
  const perWeek = Number(sessionsPerWeek);
  const household = Math.round(Number(householdSize));

  if (![area, level, rate, session, perWeek, household].every(Number.isFinite)) {
    return { error: "Area, clutter level, session length and frequency must all be numbers." };
  }
  if (!(area > 0)) return { error: "Enter a room area greater than zero." };
  if (!CLUTTER_LEVELS[level]) return { error: "Clutter level must be between 1 and 5." };
  if (rate <= 0 || rate > MAX_MINUTES_PER_SQM) {
    return { error: `Minutes per square metre should be between 1 and ${MAX_MINUTES_PER_SQM}.` };
  }
  if (session < 10 || session > 480) {
    return { error: "A session should be between 10 and 480 minutes." };
  }
  if (perWeek < 1 || perWeek > 14) {
    return { error: "Sessions per week should be between 1 and 14." };
  }
  if (household < 1 || household > 20) {
    return { error: "Household size should be between 1 and 20 people." };
  }

  const sqm = toSquareMetres(area, areaUnit);
  if (sqm === null) return { error: "Enter a room area greater than zero." };
  if (sqm > 2000) return { error: "That area is larger than a house — check the unit you picked." };

  const clutter = CLUTTER_LEVELS[level];
  const totalMinutes = Math.round(sqm * rate * clutter.multiplier);
  if (!(totalMinutes > 0)) {
    return { error: "That combination works out to no work at all — increase the area or the rate." };
  }

  const { sessions, weeks } = planSessions({
    totalMinutes,
    sessionMinutes: session,
    sessionsPerWeek: perWeek,
  });
  const blocks = pomodorosIn(session);
  const chosen = METHODS[method] ?? METHODS["four-box"];
  const unitLabel = AREA_UNITS[areaUnit] ?? AREA_UNITS.sqm;

  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

  const lines = [];
  lines.push(
    `Act as a professional organiser. Build me a decluttering plan for one room: the ${roomText.toLowerCase()}.`,
  );
  lines.push("");
  lines.push("THE SPACE");
  lines.push(`- Room: ${roomText}`);
  lines.push(`- Area: ${area} ${unitLabel} (${Math.round(sqm * 10) / 10} m²)`);
  lines.push(`- Clutter level: ${level} of 5 — ${clutter.label}`);
  lines.push(`- People living here: ${household}`);
  if (clean(problemAreas)) lines.push(`- The worst spots: ${clean(problemAreas)}`);
  if (clean(keepConstraints)) lines.push(`- Things that must stay: ${clean(keepConstraints)}`);
  lines.push("");
  lines.push("MY TIME BUDGET");
  lines.push(`- Estimated total work: ${totalMinutes} minutes (about ${totalHours} hours)`);
  lines.push(`- Session length: ${session} minutes, ${perWeek} ${perWeek === 1 ? "session" : "sessions"} a week`);
  lines.push(`- That is ${sessions} ${sessions === 1 ? "session" : "sessions"}, finishing in about ${weeks} ${weeks === 1 ? "week" : "weeks"}`);
  if (blocks > 0) {
    lines.push(
      `- Each session fits ${blocks} Pomodoro ${blocks === 1 ? "block" : "blocks"} of ${POMODORO_WORK_MIN} minutes with ${POMODORO_BREAK_MIN}-minute breaks (take a longer break after ${POMODOROS_BEFORE_LONG_BREAK}).`,
    );
  }
  lines.push("");
  lines.push("METHOD");
  lines.push(`Use the ${chosen.label}. ${chosen.rule}`);
  lines.push("");
  lines.push("WHAT TO GIVE ME");
  lines.push(`1. A numbered plan with exactly ${sessions} ${sessions === 1 ? "session" : "sessions"}, each with a title, the specific zone to attack, and what "done" looks like.`);
  lines.push("2. The order of zones, easiest first, so the room looks visibly better after session one.");
  lines.push("3. A shopping list of storage only for what is left after decluttering — never before.");
  lines.push("4. For each session, one decision rule I can apply without thinking, in plain language.");
  lines.push("5. A short list of what to do with items leaving the house: donate, sell, recycle, dispose — and how to handle batteries, paint and electronics separately.");
  lines.push("6. A five-minute daily reset routine that stops the room refilling.");
  lines.push("");
  lines.push("Keep every session inside the stated length. Do not suggest buying containers before the sorting is finished, and do not tell me to 'just start' — give me the first physical action.");

  const prompt = lines.join("\n");

  return {
    prompt,
    squareMetres: Math.round(sqm * 100) / 100,
    totalMinutes,
    totalHours,
    sessions,
    weeks,
    pomodoros: blocks,
    clutterLabel: clutter.label,
    methodLabel: chosen.label,
    wordCount: prompt.split(/\s+/).filter(Boolean).length,
    tokenEstimate: Math.ceil(prompt.length / CHARS_PER_TOKEN),
  };
}
