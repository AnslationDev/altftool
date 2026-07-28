/**
 * Wellness journaling prompt generator — pure logic.
 *
 * Prompts are drawn without replacement from a themed bank using a seeded,
 * deterministic pseudo-random shuffle, so the same (theme, count, seed) always
 * produces the same set. The caller supplies the seed; nothing here reads the
 * clock, so the module stays pure and testable.
 */

/**
 * Pennebaker's expressive-writing protocol asks for 15-20 minutes of
 * uninterrupted writing per session, repeated on 3-4 consecutive days.
 * We use the lower bound as the "full session" marker.
 */
export const EXPRESSIVE_WRITING_MIN_MINUTES = 15;

/** Default time budget per prompt, in minutes. */
export const DEFAULT_MINUTES_PER_PROMPT = 5;

/** Guard rails so a session stays usable rather than overwhelming. */
export const MIN_PROMPT_COUNT = 1;
export const MAX_PROMPT_COUNT = 10;
export const MIN_MINUTES_PER_PROMPT = 1;
export const MAX_MINUTES_PER_PROMPT = 60;

/** Average longhand journaling speed used to estimate a word target. */
export const WORDS_PER_MINUTE_HANDWRITING = 13;

export const THEMES = [
  {
    id: "gratitude",
    label: "Gratitude",
    blurb: "Notice what is already working before looking at what is missing.",
  },
  {
    id: "self-compassion",
    label: "Self-Compassion",
    blurb: "Speak to yourself the way you would speak to a friend.",
  },
  {
    id: "stress",
    label: "Stress & Anxiety",
    blurb: "Name the worry, separate the fact from the forecast.",
  },
  {
    id: "goals",
    label: "Goals & Direction",
    blurb: "Turn vague intentions into a next visible step.",
  },
  {
    id: "relationships",
    label: "Relationships",
    blurb: "Look at the people around you and the space between you.",
  },
  {
    id: "morning",
    label: "Morning Intention",
    blurb: "Set the tone for the day in a few honest lines.",
  },
  {
    id: "evening",
    label: "Evening Wind-Down",
    blurb: "Close the day so it stops replaying at 2am.",
  },
  {
    id: "grief",
    label: "Grief & Change",
    blurb: "Give loss and transition somewhere to go on the page.",
  },
];

export const PROMPT_BANK = {
  gratitude: [
    "Name one ordinary object you used today that would be genuinely hard to live without. Why?",
    "Who made your day slightly easier without being asked? What exactly did they do?",
    "Write about a part of your body that did its job quietly today.",
    "What is something you once wanted badly and now simply have?",
    "Describe a place you can return to in your head when you need calm.",
    "What went right today that you would not have noticed if you were not looking?",
    "Name a skill you have that past-you had to work for. What did it cost?",
    "Which small daily ritual would you miss most if it disappeared tomorrow?",
    "Write a short thank-you to someone you will probably never send it to.",
    "What is one thing about this season of your life that you will look back on fondly?",
  ],
  "self-compassion": [
    "What are you being harder on yourself about than you would be on a friend?",
    "Write the sentence you most need to hear right now, addressed to yourself by name.",
    "Describe a mistake you made this month, then write what you actually learned from it.",
    "What standard are you holding yourself to that nobody asked you to meet?",
    "List three things you got right this week, even if they feel too small to count.",
    "Where in your life are you tired rather than lazy? What would rest look like?",
    "What would you tell a younger version of yourself about the thing you are worried about?",
    "Name one part of yourself you usually hide. What would acceptance sound like?",
    "Write about a time you were kind to yourself and it worked out.",
    "What do you need today that you have been refusing to ask for?",
  ],
  stress: [
    "Write down the worry in one sentence. Now write what part of it is fact and what part is forecast.",
    "What is the worst realistic outcome here, and what would you actually do if it happened?",
    "Which of the things on your mind right now are genuinely yours to solve?",
    "Where do you feel this stress in your body? Describe the sensation without judging it.",
    "What would you drop from this week if someone gave you permission?",
    "Write about a stressful period you have already survived. What helped then?",
    "Name the smallest possible next action on the thing you are avoiding.",
    "What are you afraid people will think? How much of that is evidence?",
    "Describe your ideal 30 minutes of relief. What would it take to have 10 of them today?",
    "If this problem were solved next month, what would you have stopped doing today?",
  ],
  goals: [
    "What do you want more of six months from now, described in plain language?",
    "Which goal on your list is really someone else's expectation?",
    "What is the very next physical action for the thing you keep postponing?",
    "Describe what a good week would look like if nothing dramatic changed.",
    "What have you already made progress on without giving yourself credit?",
    "What would you attempt if you knew the first version was allowed to be bad?",
    "Which habit, kept for 90 days, would change the most for you?",
    "What are you saying yes to that is quietly crowding out what matters?",
    "Write the story of your next year as if it went well. What was the turning point?",
    "What does 'enough' look like for this goal, so you know when to stop?",
  ],
  relationships: [
    "Who have you been meaning to contact? Draft the first two lines here.",
    "Describe a recent conversation you would like to have handled differently.",
    "What do you need from the people closest to you that you have not said out loud?",
    "Who makes you feel most like yourself, and what do they do that causes it?",
    "Write about a boundary you would like to set and the exact words you would use.",
    "What has someone forgiven you for? What did that feel like to receive?",
    "Which relationship in your life is taking more energy than it returns right now?",
    "Describe someone who influenced you and never knew it.",
    "What assumption are you making about what someone else is thinking?",
    "Write about a moment of connection this week, however brief.",
  ],
  morning: [
    "What is the one thing that would make today count as a good day?",
    "How do you want to feel by this evening, and what would help you get there?",
    "What are you carrying into today from yesterday that you can put down?",
    "Name the hardest part of today. When will you do it?",
    "Write three lines about how you slept and what your body is asking for.",
    "Who will you see today, and how do you want to show up for them?",
    "What is the first thing you will do after closing this page?",
    "What are you looking forward to today, even slightly?",
    "If today had a single word as its theme, what would you choose and why?",
    "What is one thing you will say no to today to protect your attention?",
  ],
  evening: [
    "What happened today that you want to remember in a year?",
    "Write down anything still spinning in your head so it can wait until morning.",
    "What drained you today, and what refilled you?",
    "Which moment today would you happily live again?",
    "What did you do today that your future self will thank you for?",
    "Was there a point today when you felt fully present? Describe it.",
    "What is unfinished, and what is the earliest sensible time to deal with it?",
    "Rate the day out of ten and write one sentence explaining the number.",
    "What kindness did you give or receive today?",
    "Name one thing you are ready to let go of before sleeping.",
  ],
  grief: [
    "Write about what you miss most, in as much sensory detail as you can manage.",
    "What has changed in your daily routine because of this loss?",
    "What would you say to them, or to it, if you had five more minutes?",
    "Which parts of your old life do you want to carry forward?",
    "What have people said that helped, and what has not helped at all?",
    "Describe a moment recently when the grief was quieter. What was happening?",
    "What are you afraid you will forget? Write it down here so you do not have to.",
    "Where are you pretending to be further along than you are?",
    "What does support look like for you this week, concretely?",
    "Write about who you are becoming on the other side of this change.",
  ],
};

/** Deterministic 32-bit PRNG (mulberry32) — same seed, same stream, every time. */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Seeded Fisher-Yates shuffle on a copy of the input array. */
function shuffle(items, seed) {
  const out = items.slice();
  const random = mulberry32(seed);
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

/** Every prompt across every theme, tagged with its theme label. */
export function allPrompts() {
  const out = [];
  THEMES.forEach((theme) => {
    (PROMPT_BANK[theme.id] || []).forEach((text) => {
      out.push({ text, themeId: theme.id, themeLabel: theme.label });
    });
  });
  return out;
}

export function themeById(themeId) {
  return THEMES.find((theme) => theme.id === themeId) || null;
}

/**
 * Build one journaling session.
 *
 * @param {object} input
 * @param {string} input.themeId - a THEMES id, or "mixed" to draw from every theme.
 * @param {number} input.count - how many prompts to draw.
 * @param {number} input.seed - integer seed; change it to redraw.
 * @param {number} [input.minutesPerPrompt] - time budget per prompt.
 * @returns {{prompts: Array, totalMinutes: number}|{error: string}}
 */
export function generateJournalSession({
  themeId,
  count,
  seed,
  minutesPerPrompt = DEFAULT_MINUTES_PER_PROMPT,
}) {
  const isMixed = themeId === "mixed";
  const theme = isMixed ? null : themeById(themeId);
  if (!isMixed && !theme) {
    return { error: "Pick a journaling theme from the list." };
  }

  const n = Number(count);
  if (!Number.isFinite(n) || Math.floor(n) !== n) {
    return { error: "Number of prompts must be a whole number." };
  }
  if (n < MIN_PROMPT_COUNT || n > MAX_PROMPT_COUNT) {
    return {
      error: `Choose between ${MIN_PROMPT_COUNT} and ${MAX_PROMPT_COUNT} prompts for one session.`,
    };
  }

  const minutes = Number(minutesPerPrompt);
  if (!Number.isFinite(minutes) || minutes < MIN_MINUTES_PER_PROMPT || minutes > MAX_MINUTES_PER_PROMPT) {
    return {
      error: `Minutes per prompt must be between ${MIN_MINUTES_PER_PROMPT} and ${MAX_MINUTES_PER_PROMPT}.`,
    };
  }

  const rawSeed = Number(seed);
  if (!Number.isFinite(rawSeed)) {
    return { error: "Seed must be a number." };
  }
  const safeSeed = Math.abs(Math.floor(rawSeed)) % 4294967296;

  const pool = isMixed
    ? allPrompts()
    : PROMPT_BANK[theme.id].map((text) => ({
        text,
        themeId: theme.id,
        themeLabel: theme.label,
      }));

  if (pool.length === 0) {
    return { error: "No prompts available for that theme." };
  }

  const picked = shuffle(pool, safeSeed).slice(0, Math.min(n, pool.length));
  const totalMinutes = picked.length * minutes;

  return {
    themeId: isMixed ? "mixed" : theme.id,
    themeLabel: isMixed ? "Mixed themes" : theme.label,
    themeBlurb: isMixed
      ? "A spread across every theme in the bank."
      : theme.blurb,
    prompts: picked,
    poolSize: pool.length,
    minutesPerPrompt: minutes,
    totalMinutes,
    wordTarget: Math.round(totalMinutes * WORDS_PER_MINUTE_HANDWRITING),
    meetsExpressiveWritingMinimum: totalMinutes >= EXPRESSIVE_WRITING_MIN_MINUTES,
  };
}
