/**
 * Language exchange (tandem) session planner.
 *
 * Tandem learning rests on two principles set out in the tandem literature:
 * reciprocity — both partners get the same benefit, which in practice means the
 * same number of speaking minutes in each language — and autonomy, where each
 * partner decides what they want to work on.
 *
 * The planner enforces reciprocity arithmetically:
 *
 *   conversation = total - warmUp - 2 x correction - break - wrapUp
 *   perLanguage  = floor(conversation / 2)
 *   any odd minute left over is returned to the wrap-up block
 *
 * so the two conversation blocks are always exactly equal. Times are plain
 * minute offsets; a clock time is only rendered when you pass a start time.
 */

export const MIN_TOTAL = 20;
export const MAX_TOTAL = 240;
/** Below five minutes a conversation block is not long enough to warm into. */
export const MIN_BLOCK = 5;
export const MAX_FIXED_PART = 40;

export const LEVELS = ["beginner", "intermediate", "advanced"];

/**
 * Topic cards. Each carries three prompts so the pair is not left staring at a
 * one-word topic.
 */
export const TOPIC_CARDS = [
  {
    id: "routine",
    level: "beginner",
    title: "A normal weekday",
    prompts: [
      "What time do you wake up, and what is the first thing you do?",
      "Describe your journey to work or class.",
      "What does a good evening look like for you?",
    ],
  },
  {
    id: "food",
    level: "beginner",
    title: "Food you grew up with",
    prompts: [
      "What did your family eat on an ordinary weekday?",
      "Which dish do you miss most when you are away?",
      "Teach your partner the words for three ingredients.",
    ],
  },
  {
    id: "neighbourhood",
    level: "beginner",
    title: "Your neighbourhood",
    prompts: [
      "What is within a ten-minute walk of your home?",
      "Who are your neighbours and how well do you know them?",
      "What has changed there in the last five years?",
    ],
  },
  {
    id: "weather",
    level: "beginner",
    title: "Weather and seasons",
    prompts: [
      "Which season do you like least and why?",
      "Describe the worst weather you have been caught in.",
      "How does the weather change what people eat or wear?",
    ],
  },
  {
    id: "transport",
    level: "beginner",
    title: "Getting around",
    prompts: [
      "How do most people travel in your city?",
      "Describe a bus, metro or train ride step by step.",
      "What would you fix about local transport?",
    ],
  },
  {
    id: "weekend",
    level: "beginner",
    title: "Last weekend",
    prompts: [
      "What did you do, in order, from Saturday morning?",
      "Who did you see and what did you talk about?",
      "What would you do differently next weekend?",
    ],
  },
  {
    id: "trip",
    level: "intermediate",
    title: "A trip that went wrong",
    prompts: [
      "What was supposed to happen, and what actually happened?",
      "How did you solve it, and who helped?",
      "What do you now always pack or check?",
    ],
  },
  {
    id: "work",
    level: "intermediate",
    title: "How your job really works",
    prompts: [
      "Explain your work to someone outside the field.",
      "Which part of it would surprise an outsider?",
      "What does a bad day look like?",
    ],
  },
  {
    id: "housing",
    level: "intermediate",
    title: "Housing and cost of living",
    prompts: [
      "What does renting a one-bedroom flat cost where you live?",
      "How do young people afford to move out?",
      "Compare that with your partner's city.",
    ],
  },
  {
    id: "festival",
    level: "intermediate",
    title: "A festival you celebrate",
    prompts: [
      "Walk through the day from morning to night.",
      "What is prepared in advance, and by whom?",
      "How has the way people celebrate it changed?",
    ],
  },
  {
    id: "film",
    level: "intermediate",
    title: "Something you argued about",
    prompts: [
      "Describe a film, book or match that split opinion.",
      "Argue the side you do not personally hold.",
      "What made the other view convincing?",
    ],
  },
  {
    id: "superstition",
    level: "intermediate",
    title: "Beliefs people still follow",
    prompts: [
      "Which everyday superstitions survive where you live?",
      "Do you follow any of them, even half-seriously?",
      "Where do you think it came from?",
    ],
  },
  {
    id: "news",
    level: "advanced",
    title: "How the same story is reported",
    prompts: [
      "Pick one international story you both know.",
      "How is it framed in each of your countries?",
      "What is left out on each side?",
    ],
  },
  {
    id: "remote",
    level: "advanced",
    title: "Where work is going",
    prompts: [
      "Has remote work helped or hurt your industry?",
      "Who benefits and who quietly loses?",
      "What would you legislate, if anything?",
    ],
  },
  {
    id: "education",
    level: "advanced",
    title: "What schooling gets wrong",
    prompts: [
      "Which part of your education was wasted time?",
      "What should have been taught instead?",
      "How would you measure whether it worked?",
    ],
  },
  {
    id: "untranslatable",
    level: "advanced",
    title: "Words that do not translate",
    prompts: [
      "Give a word from your language with no clean equivalent.",
      "Explain the situation you would use it in.",
      "What does its absence say about the other language?",
    ],
  },
  {
    id: "ageing",
    level: "advanced",
    title: "How ageing is handled",
    prompts: [
      "Who looks after older people where you live?",
      "How is that changing, and why?",
      "What do you expect for yourself?",
    ],
  },
  {
    id: "languageloss",
    level: "advanced",
    title: "Languages that are fading",
    prompts: [
      "Which language or dialect near you has fewer speakers each decade?",
      "What was lost with it, practically speaking?",
      "Is state support the right answer?",
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Clock helpers                                                       */
/* ------------------------------------------------------------------ */

const CLOCK = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** Parse "HH:MM" into minutes after midnight, or NaN. */
export function parseClock(value) {
  const match = CLOCK.exec(String(value == null ? "" : value).trim());
  if (!match) return NaN;
  return Number(match[1]) * 60 + Number(match[2]);
}

/** Render minutes after midnight as "HH:MM" on a 24-hour clock. */
export function formatClock(minutes) {
  const wrapped = ((Math.round(minutes) % 1440) + 1440) % 1440;
  const hours = String(Math.floor(wrapped / 60)).padStart(2, "0");
  const mins = String(wrapped % 60).padStart(2, "0");
  return `${hours}:${mins}`;
}

/* ------------------------------------------------------------------ */
/* Topic picking                                                       */
/* ------------------------------------------------------------------ */

/** Deterministic 32-bit LCG (Numerical Recipes constants) so results repeat. */
function lcg(seed) {
  let state = (Math.abs(Math.trunc(seed)) || 1) >>> 0;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

/**
 * Pick topic cards for a level, deterministically from a seed.
 * @returns {object[]}
 */
export function pickTopics({ level = "intermediate", count = 3, seed = 1 } = {}) {
  const pool = TOPIC_CARDS.filter((card) => card.level === level);
  const wanted = Math.max(1, Math.min(Math.trunc(Number(count)) || 1, pool.length));
  const random = lcg(seed);
  const shuffled = [...pool];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swap]] = [shuffled[swap], shuffled[index]];
  }
  return shuffled.slice(0, wanted);
}

/* ------------------------------------------------------------------ */
/* Session plan                                                        */
/* ------------------------------------------------------------------ */

const cleanName = (value, fallback) => {
  const text = String(value == null ? "" : value).replace(/\s+/g, " ").trim();
  return text || fallback;
};

/**
 * Build the timed agenda.
 *
 * @param {object} input
 * @param {number} input.totalMinutes
 * @param {string} input.languageA        language the first block is held in
 * @param {string} input.languageB
 * @param {number} [input.warmUpMinutes]
 * @param {number} [input.correctionMinutes] per language
 * @param {number} [input.breakMinutes]
 * @param {number} [input.wrapUpMinutes]
 * @param {string} [input.startTime]      "HH:MM"; omit for offsets only
 * @returns {object|{error:string}}
 */
export function buildSession({
  totalMinutes,
  languageA,
  languageB,
  warmUpMinutes = 5,
  correctionMinutes = 5,
  breakMinutes = 0,
  wrapUpMinutes = 5,
  startTime = "",
} = {}) {
  const total = Math.round(Number(totalMinutes));
  if (!Number.isFinite(total) || total < MIN_TOTAL || total > MAX_TOTAL) {
    return { error: `A session should run between ${MIN_TOTAL} and ${MAX_TOTAL} minutes.` };
  }

  const parts = { warmUpMinutes, correctionMinutes, breakMinutes, wrapUpMinutes };
  for (const [key, value] of Object.entries(parts)) {
    const number = Math.round(Number(value));
    if (!Number.isFinite(number) || number < 0 || number > MAX_FIXED_PART) {
      return { error: `Each fixed block must be between 0 and ${MAX_FIXED_PART} minutes (${key}).` };
    }
    parts[key] = number;
  }

  const nameA = cleanName(languageA, "Language A");
  const nameB = cleanName(languageB, "Language B");
  if (nameA.toLowerCase() === nameB.toLowerCase()) {
    return { error: "Pick two different languages — a tandem needs one of each." };
  }
  if (nameA.length > 40 || nameB.length > 40) return { error: "Keep language names under 40 characters." };

  const fixed = parts.warmUpMinutes + parts.correctionMinutes * 2 + parts.breakMinutes + parts.wrapUpMinutes;
  const conversation = total - fixed;
  if (conversation < MIN_BLOCK * 2) {
    return {
      error: `Warm-up, feedback, break and wrap-up use ${fixed} of the ${total} minutes, leaving too little to talk. Trim them by ${MIN_BLOCK * 2 - conversation} minutes, or make the session that much longer.`,
    };
  }

  const perLanguage = Math.floor(conversation / 2);
  const leftover = conversation - perLanguage * 2;
  const wrapUp = parts.wrapUpMinutes + leftover;

  const clockStart = startTime ? parseClock(startTime) : NaN;
  if (startTime && Number.isNaN(clockStart)) return { error: "Start time must be in 24-hour HH:MM form." };

  const blocks = [];
  let cursor = 0;
  const push = (label, minutes, language, note) => {
    if (minutes <= 0) return;
    blocks.push({
      label,
      minutes,
      language,
      note,
      startOffset: cursor,
      endOffset: cursor + minutes,
      startClock: Number.isNaN(clockStart) ? "" : formatClock(clockStart + cursor),
      endClock: Number.isNaN(clockStart) ? "" : formatClock(clockStart + cursor + minutes),
    });
    cursor += minutes;
  };

  push("Warm-up", parts.warmUpMinutes, "Both", "Small talk, half in each language. No corrections yet.");
  push("Conversation block 1", perLanguage, nameA, `Only ${nameA}. The ${nameA} speaker listens and notes errors instead of translating.`);
  push("Feedback on block 1", parts.correctionMinutes, nameA, "Three corrections maximum, plus two phrases worth stealing.");
  push("Break", parts.breakMinutes, "Both", "Stand up, drink water, reset.");
  push("Conversation block 2", perLanguage, nameB, `Only ${nameB}. Same length as block 1 — that is the tandem rule.`);
  push("Feedback on block 2", parts.correctionMinutes, nameB, "Three corrections maximum, plus two phrases worth stealing.");
  push("Wrap-up", wrapUp, "Both", "Agree one thing each to review, and the topic for next time.");

  return {
    total,
    blocks,
    perLanguage,
    languageA: nameA,
    languageB: nameB,
    conversationMinutes: perLanguage * 2,
    conversationShare: Math.round(((perLanguage * 2) / total) * 1000) / 10,
    feedbackMinutes: parts.correctionMinutes * 2,
    fixedMinutes: total - perLanguage * 2,
    balanced: true,
    endOffset: cursor,
    endClock: Number.isNaN(clockStart) ? "" : formatClock(clockStart + cursor),
  };
}
