/**
 * Relationship Adviser — communication prompts and a weekly connection budget.
 *
 * Everything here is drawn from published, non-clinical relationship-education
 * frameworks, and none of it is therapy or a diagnosis:
 *
 *  - Nonviolent Communication (Marshall Rosenberg): a request is built from
 *    observation -> feeling -> need -> request, with the observation kept free
 *    of evaluation.
 *  - The Gottman Institute's "Four Horsemen" (criticism, contempt,
 *    defensiveness, stonewalling) and their published antidotes.
 *  - The Gottman "magic ratio": stable couples average about 5 positive
 *    interactions for every 1 negative one during conflict.
 *  - Gottman's "Magic Six Hours a Week", a fixed weekly budget of rituals
 *    totalling roughly 6 hours (360 minutes).
 *  - The flooding rule: once someone is physiologically flooded, a break of at
 *    least 20 minutes is needed before the conversation can restart usefully.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** Gottman's magic ratio — positive to negative interactions during conflict. */
export const MAGIC_RATIO = 5;

/** Minimum break, in minutes, after emotional flooding before resuming. */
export const FLOODING_BREAK_MINUTES = 20;

/** Gottman's Magic Six Hours a Week, in minutes. 6 hours = 360 minutes. */
export const WEEKLY_TARGET_MINUTES = 360;

/**
 * The six rituals in the Magic Six Hours, with the published default amount.
 * `perDay` items are multiplied by the number of days the couple is together.
 */
export const RITUALS = [
  {
    id: "partings",
    label: "Partings",
    detail: "Learn one thing happening in your partner's day before you separate.",
    defaultMinutes: 2,
    perDay: true,
  },
  {
    id: "reunions",
    label: "Reunions",
    detail: "A stress-reducing conversation at the end of the working day.",
    defaultMinutes: 20,
    perDay: true,
  },
  {
    id: "appreciation",
    label: "Appreciation",
    detail: "Say one specific thing you valued today.",
    defaultMinutes: 5,
    perDay: true,
  },
  {
    id: "affection",
    label: "Affection",
    detail: "Physical affection, including a proper goodnight.",
    defaultMinutes: 5,
    perDay: true,
  },
  {
    id: "date",
    label: "Weekly date",
    detail: "Uninterrupted time together, asking open questions.",
    defaultMinutes: 120,
    perDay: false,
  },
  {
    id: "stateOfUnion",
    label: "State of the union",
    detail: "One weekly hour: what went well, then one issue, then repair.",
    defaultMinutes: 60,
    perDay: false,
  },
];

/** The Four Horsemen and the antidote published for each. */
export const FOUR_HORSEMEN = [
  {
    id: "criticism",
    label: "Criticism",
    looksLike: "Attacking character: \"You never think about anyone but yourself.\"",
    antidote: "Gentle start-up — describe the specific event, say how you feel, state a positive need.",
  },
  {
    id: "contempt",
    label: "Contempt",
    looksLike: "Mockery, eye-rolling, sarcasm, name-calling, talking down.",
    antidote: "Build a culture of appreciation — name something you respect out loud, daily, not only in conflict.",
  },
  {
    id: "defensiveness",
    label: "Defensiveness",
    looksLike: "Counter-attacking or playing the innocent victim to deflect a complaint.",
    antidote: "Accept responsibility for your part, even a small part, before explaining anything.",
  },
  {
    id: "stonewalling",
    label: "Stonewalling",
    looksLike: "Shutting down, going silent, walking off mid-sentence.",
    antidote: `Name the flooding and take a break of at least ${FLOODING_BREAK_MINUTES} minutes, then return at an agreed time.`,
  },
];

/** Common situations with prompts. `horseman` links to the pattern most likely at play. */
export const SITUATIONS = [
  {
    id: "same-argument",
    label: "We keep having the same argument",
    horseman: "criticism",
    summary:
      "Recurring arguments usually sit on an unspoken need rather than the surface topic, so restating the topic harder does not move it.",
    prompts: [
      "What does this argument mean to you that it might not mean to me?",
      "What would a good enough outcome look like this week, not forever?",
      "Which part of this is about the task, and which part is about feeling unseen?",
    ],
    avoid: ["Starting sentences with \"you always\" or \"you never\".", "Reopening it within the first hour after it ends."],
  },
  {
    id: "chores",
    label: "The load at home feels unfair",
    horseman: "criticism",
    summary:
      "Fairness disputes go better when the invisible work of noticing and planning is counted, not only the visible tasks.",
    prompts: [
      "Let's list who notices each task, not just who does it.",
      "Which two tasks would make the biggest difference if I owned them completely?",
      "What is a fair review point — shall we look at this again in a month?",
    ],
    avoid: ["Keeping a private mental scoreboard and revealing it during a fight.", "Doing a task badly on purpose to get out of it."],
  },
  {
    id: "shut-down",
    label: "One of us shuts down mid-conversation",
    horseman: "stonewalling",
    summary: `Shutting down is usually flooding, not indifference. The published guidance is a break of at least ${FLOODING_BREAK_MINUTES} minutes, agreed out loud with a time to return.`,
    prompts: [
      "I am flooded and I want to keep talking. Can we restart in half an hour?",
      "What helps you settle — walking, silence, or something practical?",
      "Shall we agree a signal we both accept without arguing about it?",
    ],
    avoid: ["Following someone into another room to finish the point.", "Treating the break as a punishment or a walkout."],
  },
  {
    id: "money",
    label: "We disagree about money",
    horseman: "defensiveness",
    summary:
      "Money conflicts are usually about safety and freedom. Separating shared obligations from personal discretion removes most of the friction.",
    prompts: [
      "What did money feel like in your family growing up?",
      "Shall we agree a no-questions personal amount each, per month?",
      "What is the one purchase size above which we always check with each other?",
    ],
    avoid: ["Hiding a purchase and hoping it goes unnoticed.", "Using a past financial mistake as evidence in an unrelated argument."],
  },
  {
    id: "distance",
    label: "We feel more like flatmates than partners",
    horseman: "contempt",
    summary:
      "Drift is a rituals problem more often than a feelings problem. The Magic Six Hours budget below is a concrete, checkable fix.",
    prompts: [
      "What is one thing we used to do that you miss?",
      "Which evening this week is genuinely protected for us?",
      "What made you feel close to me most recently?",
    ],
    avoid: ["Scheduling a big holiday instead of a small weekly habit.", "Waiting for the other person to start first."],
  },
  {
    id: "in-laws",
    label: "Family and in-laws are causing friction",
    horseman: "defensiveness",
    summary:
      "The workable rule is that each partner handles their own family, and the couple agrees the boundary before it is tested.",
    prompts: [
      "What boundary do you want, and what would you like me to say to them?",
      "Which visits are non-negotiable for you this year?",
      "How do we want to answer questions we do not want to answer?",
    ],
    avoid: ["Criticising your partner's family and then defending your own.", "Agreeing to a visit in the moment and resenting it later."],
  },
  {
    id: "long-distance",
    label: "We are long distance",
    horseman: "stonewalling",
    summary:
      "Distance rewards predictability. A fixed call rhythm and a known next-meeting date do more than long unplanned calls.",
    prompts: [
      "What rhythm actually suits your week — short daily, or long twice a week?",
      "When is the next time we will be in the same room? Let's fix the date.",
      "What do you want to know about my ordinary day, not just the highlights?",
    ],
    avoid: ["Saving up every grievance for the visit.", "Reading tone into a delayed reply."],
  },
  {
    id: "apology",
    label: "I need to apologise properly",
    horseman: "defensiveness",
    summary:
      "A repair lands when it names the specific act, the effect on the other person, and a change — with no \"but\" attached.",
    prompts: [
      "I was wrong to do that specific thing.",
      "I can see it left you feeling unimportant.",
      "Here is what I will do differently, and you can hold me to it.",
    ],
    avoid: ["\"I'm sorry you felt that way.\"", "Attaching an explanation before the other person has accepted the apology."],
  },
];

/** Shown whenever the answer is not communication advice. */
export const SAFETY_NOTE =
  "If there is fear, threats, control of your money or movement, or any physical harm, this is not a communication problem and these prompts are not the right tool. Contact local emergency services or a domestic-abuse support service, and speak to someone you trust.";

/**
 * Look up one situation.
 * @param {string} id
 * @returns {object | {error: string}}
 */
export function getSituation(id) {
  const found = SITUATIONS.find((s) => s.id === id);
  if (!found) return { error: "Pick one of the listed situations." };
  const horseman = FOUR_HORSEMEN.find((h) => h.id === found.horseman) ?? null;
  return { ...found, horsemanDetail: horseman };
}

/**
 * Build a Nonviolent Communication statement:
 * "When <observation>, I feel <feeling>, because I need <need>. Would you be
 *  willing to <request>?"
 *
 * The observation must be an event, not a judgement, so evaluative words are
 * rejected with an explanation rather than silently accepted.
 *
 * @param {object} input
 * @param {string} input.observation - what happened, without interpretation
 * @param {string} input.feeling - one feeling word
 * @param {string} input.need - the underlying need
 * @param {string} input.request - a specific, doable, present-tense request
 * @returns {{statement: string, words: number} | {error: string}}
 */
export function buildStatement({ observation, feeling, need, request } = {}) {
  const clean = (value) => (typeof value === "string" ? value.trim() : "");
  const o = clean(observation);
  const f = clean(feeling);
  const n = clean(need);
  const r = clean(request);

  if (!o) return { error: "Describe what actually happened — an event, not a verdict." };
  if (!f) return { error: "Add one feeling word, such as hurt, anxious, tired or ignored." };
  if (!n) return { error: "Name the need behind the feeling, such as rest, reassurance or clarity." };
  if (!r) return { error: "Add one specific request the other person could agree to today." };

  /** Evaluation words that turn an observation into an accusation (NVC:
   *  "observation free of evaluation"). */
  const EVALUATIVE = ["always", "never", "obviously", "lazy", "selfish", "stupid", "typical"];
  const offender = EVALUATIVE.find((word) => new RegExp(`\\b${word}\\b`, "i").test(o));
  if (offender) {
    return {
      error: `"${offender}" turns the observation into a judgement. Describe the single event and when it happened instead.`,
    };
  }

  const statement = `When ${o}, I feel ${f}, because I need ${n}. Would you be willing to ${r}?`;
  return { statement, words: statement.split(/\s+/).length };
}

/**
 * Check a week against the magic ratio.
 * @param {number} positive - count of positive interactions
 * @param {number} negative - count of negative interactions
 * @returns {{ratio: number|null, meets: boolean, needed: number, message: string} | {error: string}}
 */
export function ratioCheck(positive, negative) {
  const p = Number(positive);
  const n = Number(negative);
  if (!Number.isFinite(p) || !Number.isFinite(n)) {
    return { error: "Enter both counts as numbers." };
  }
  if (p < 0 || n < 0) return { error: "Counts cannot be negative." };

  if (n === 0) {
    return {
      ratio: null,
      meets: p > 0,
      needed: 0,
      message:
        p > 0
          ? "No negative interactions logged, so the ratio is not defined — keep the positives going."
          : "Nothing logged either way. Log a normal week to make this meaningful.",
    };
  }

  const ratio = p / n;
  const needed = Math.max(0, Math.ceil(MAGIC_RATIO * n - p));
  return {
    ratio,
    meets: ratio >= MAGIC_RATIO,
    needed,
    message:
      ratio >= MAGIC_RATIO
        ? `At ${ratio.toFixed(1)}:1 you are at or above the ${MAGIC_RATIO}:1 mark associated with stable couples.`
        : `At ${ratio.toFixed(1)}:1 you are below ${MAGIC_RATIO}:1. About ${needed} more positive ${needed === 1 ? "moment" : "moments"} this week would close the gap.`,
  };
}

/**
 * Weekly connection budget against the Magic Six Hours (360 minutes).
 *
 * Per-day rituals are multiplied by `daysTogether`; weekly rituals are counted
 * once. Returns the total, the gap and a per-ritual breakdown.
 *
 * @param {object} input
 * @param {number} input.daysTogether - days per week you actually see each other, 0-7
 * @param {Record<string, number>} input.minutes - minutes keyed by ritual id
 * @returns {{totalMinutes: number, targetMinutes: number, gapMinutes: number,
 *   percentOfTarget: number, breakdown: Array<{id: string, label: string, weeklyMinutes: number}>}
 *   | {error: string}}
 */
export function weeklyConnection({ daysTogether, minutes } = {}) {
  const days = Number(daysTogether);
  if (!Number.isFinite(days)) return { error: "Enter how many days a week you are together." };
  if (days < 0 || days > 7) return { error: "Days together must be between 0 and 7." };
  if (!minutes || typeof minutes !== "object") {
    return { error: "Enter the minutes you spend on each ritual." };
  }

  const breakdown = [];
  let totalMinutes = 0;

  for (const ritual of RITUALS) {
    const raw = Number(minutes[ritual.id]);
    if (!Number.isFinite(raw) || raw < 0) {
      return { error: `Enter ${ritual.label.toLowerCase()} as a number of minutes, zero or more.` };
    }
    if (raw > 1440) return { error: "A single ritual cannot exceed 1,440 minutes (one day)." };
    const weeklyMinutes = ritual.perDay ? raw * days : raw;
    totalMinutes += weeklyMinutes;
    breakdown.push({ id: ritual.id, label: ritual.label, weeklyMinutes });
  }

  return {
    totalMinutes,
    targetMinutes: WEEKLY_TARGET_MINUTES,
    gapMinutes: WEEKLY_TARGET_MINUTES - totalMinutes,
    percentOfTarget: (totalMinutes / WEEKLY_TARGET_MINUTES) * 100,
    breakdown,
  };
}

/** Default minutes map, matching the published ritual amounts. */
export function defaultMinutes() {
  return RITUALS.reduce((acc, ritual) => {
    acc[ritual.id] = ritual.defaultMinutes;
    return acc;
  }, {});
}
