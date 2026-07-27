/**
 * Journaling Prompt Builder — pure logic.
 *
 * Turns "I have N minutes" into a word budget, splits that budget across a
 * warm-up, main reflection and close, picks prompts deterministically from a
 * curated bank, and writes an AI brief for generating more in the same style.
 *
 * No React, no DOM, no Date.now(). Same input -> same output.
 */

/** OpenAI's published English rule of thumb: ~4 characters per token. */
export const CHARS_PER_TOKEN = 4;

export const MIN_MINUTES = 2;
export const MAX_MINUTES = 180;
export const MIN_VARIATION = 1;
export const MAX_VARIATION = 24;

/**
 * Reflective writing paces in words per minute.
 * Karat et al. (1999) measured average copying speeds of roughly 20 wpm by hand
 * and 33 wpm typed for non-expert users. Composing original reflective text is
 * slower than copying, so these paces sit deliberately below those figures.
 */
export const WRITING_PACES = [
  { id: "hand-slow", label: "Handwriting, unhurried", wpm: 10 },
  { id: "hand-steady", label: "Handwriting, steady", wpm: 15 },
  { id: "type-steady", label: "Typing, steady", wpm: 25 },
  { id: "type-fast", label: "Typing, fast", wpm: 40 },
];

/** Session shape: settle in, do the work, land it. Shares sum to 1. */
export const WARM_UP_SHARE = 0.15;
export const MAIN_SHARE = 0.7;
export const CLOSE_SHARE = 0.15;

/** Below this a prompt cannot get a real answer, so fewer prompts are used. */
export const MIN_WORDS_PER_PROMPT = 60;
export const MAX_PROMPTS = 5;

/**
 * Mood framings. The low and anxious framings use self-distanced ("you" or
 * third-person) reflection, which Kross and Ayduk's work on distanced
 * self-reflection associates with less rumination than immersed "why do I feel
 * this way" questioning.
 */
export const MOODS = [
  {
    id: "low",
    label: "Low or heavy",
    framing:
      "write in the second person, as if to a friend, and stay with what happened rather than why you feel it",
    guard: "Skip any prompt that invites you to rank yourself or replay a failure.",
  },
  {
    id: "anxious",
    label: "Anxious or wired",
    framing: "start from the body and the facts, and separate what is known from what is predicted",
    guard: "Write the worry down once, then move to what is actually in your control.",
  },
  {
    id: "flat",
    label: "Flat or numb",
    framing: "keep prompts small and concrete so you are not asked to generate feeling on demand",
    guard: "A one-line answer is a complete answer today.",
  },
  {
    id: "okay",
    label: "Steady",
    framing: "go for depth — follow the thread rather than answering neatly",
    guard: "If an answer feels finished in two lines, ask yourself what you left out.",
  },
  {
    id: "bright",
    label: "Energised",
    framing: "capture the specifics while they are fresh so the entry is useful later",
    guard: "Name the conditions that made today work, not just that it worked.",
  },
];

/** Curated prompt banks. Each theme carries more prompts than a session uses. */
export const THEMES = [
  {
    id: "day-review",
    label: "Evening review",
    prompts: [
      "What actually took your time today, as against what you planned to spend it on?",
      "Name one moment today you would happily live again, in enough detail to picture it.",
      "What did you avoid today, and what was the avoidance protecting you from?",
      "Which conversation today are you still carrying, and what part of it is yours to put down?",
      "What went better than you expected, and what made the difference?",
      "If tomorrow started right now, what is the one thing you would move first?",
      "What did you learn today that you did not know yesterday, however small?",
    ],
  },
  {
    id: "morning-intention",
    label: "Morning intention",
    prompts: [
      "What is the one thing that, if it happens today, makes the day a success?",
      "Where is today most likely to go sideways, and what is your response ready to be?",
      "Who needs something from you today, and what is the smallest useful version of it?",
      "What are you dreading, and what is the first five-minute step into it?",
      "What do you want to feel like at 9pm tonight, and what supports that?",
      "What can you decide now so you do not spend willpower deciding it later?",
    ],
  },
  {
    id: "gratitude",
    label: "Gratitude, specifically",
    prompts: [
      "Name something ordinary that worked today because someone did their job well.",
      "Who made your week easier without being asked, and what exactly did they do?",
      "What do you have now that you once actively hoped for?",
      "Describe one small physical comfort of today in a full sentence.",
      "What is one thing you would miss immediately if it disappeared tomorrow?",
      "Which past difficulty are you now quietly glad happened, and why?",
    ],
  },
  {
    id: "stress",
    label: "Stress and overwhelm",
    prompts: [
      "List everything currently on your plate, then mark which items are genuinely yours.",
      "What is the actual deadline, as against the deadline you have been treating as real?",
      "Which task is taking up the most head space relative to the time it would take to do?",
      "What would you drop first if you were forced to drop something, and what stops you?",
      "Where in your body is today sitting, and what does that usually mean for you?",
      "Who could you ask for help, and what exactly would you ask them for?",
    ],
  },
  {
    id: "relationships",
    label: "Relationships",
    prompts: [
      "What did you want from a recent conversation that you did not say out loud?",
      "Who have you been meaning to contact, and what has actually been in the way?",
      "Describe a recent disagreement from the other person's account of it.",
      "Where are you giving more than you have, and what would a fair version look like?",
      "What does this person do that you have never told them you value?",
      "What boundary would make this relationship easier, and what makes it hard to say?",
    ],
  },
  {
    id: "work",
    label: "Work and career",
    prompts: [
      "Which part of your work would you still do if nobody were watching?",
      "What did you do this week that only you could have done?",
      "Where are you busy in a way that is not the same as being useful?",
      "What skill are you avoiding building, and what does the avoidance cost you?",
      "If you had to justify this month's work in three sentences, what would they be?",
      "What would you need to see in six months to call this role the right choice?",
    ],
  },
  {
    id: "decision",
    label: "A decision you are stuck on",
    prompts: [
      "State the decision as a single question with a clear yes and no.",
      "What would you tell a friend in exactly this position, in one sentence?",
      "Which option are you already leaning towards, and what are you hoping to be talked into?",
      "What is the cost of deciding nothing for another month?",
      "Which of your reasons is about the decision, and which is about how it will look?",
      "What would make this reversible, and does that change the stakes?",
    ],
  },
  {
    id: "self-doubt",
    label: "Self-doubt",
    prompts: [
      "Write the criticism in your head as a sentence, then note who it sounds like.",
      "What evidence would change your mind about yourself here?",
      "Describe a time you were wrong about your own capability, in either direction.",
      "What standard are you holding yourself to, and where did it come from?",
      "What would 'good enough' concretely look like for this?",
      "What have you done recently that past-you would have found difficult?",
    ],
  },
  {
    id: "habits",
    label: "Habits and health",
    prompts: [
      "Which habit did you keep this week, and what made keeping it easy?",
      "What is the cue that reliably breaks the habit you are trying to hold?",
      "Describe your day yesterday in terms of energy rather than tasks.",
      "What is the smallest version of this habit you would never skip?",
      "What are you doing out of momentum rather than because it still works?",
      "What would you need to change about your evening to change your morning?",
    ],
  },
  {
    id: "creative",
    label: "Creative work",
    prompts: [
      "What idea keeps coming back uninvited, and what is it asking for?",
      "Describe the piece you wish existed but cannot find anywhere.",
      "What are you making to impress someone, and what would you make instead?",
      "Which constraint would make this project more interesting rather than less?",
      "What did you enjoy making before you cared whether it was good?",
      "What is the ugliest possible first version, and what stops you making it today?",
    ],
  },
];

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/**
 * Deterministic prompt pick. `variation` lets you get a different set without
 * randomness, so the same inputs always produce the same session.
 */
export function selectPrompts(themeId, moodId, count, variation) {
  const theme = THEMES.find((item) => item.id === themeId) || THEMES[0];
  const moodIndex = Math.max(0, MOODS.findIndex((item) => item.id === moodId));
  const bank = theme.prompts;
  const wanted = clamp(Math.round(count) || 1, 1, Math.min(MAX_PROMPTS, bank.length));
  const offset = (Math.round(variation) - 1 + moodIndex) % bank.length;
  const start = ((offset % bank.length) + bank.length) % bank.length;
  return Array.from({ length: wanted }, (_, index) => bank[(start + index) % bank.length]);
}

const countWords = (text) => (text.trim() ? text.trim().split(/\s+/).length : 0);

export function buildJournalSession(input) {
  const {
    minutes,
    pace = "hand-steady",
    theme = "day-review",
    mood = "okay",
    variation = 1,
    context = "",
  } = input || {};

  const paceEntry = WRITING_PACES.find((item) => item.id === pace);
  if (!paceEntry) return { error: "Choose a writing pace." };

  const themeEntry = THEMES.find((item) => item.id === theme);
  if (!themeEntry) return { error: "Choose a journaling theme." };

  const moodEntry = MOODS.find((item) => item.id === mood);
  if (!moodEntry) return { error: "Choose how you are feeling right now." };

  const mins = Number(minutes);
  if (!isFiniteNumber(mins)) return { error: "Enter the minutes you have as a number." };
  if (mins < MIN_MINUTES || mins > MAX_MINUTES) {
    return { error: `Session length should be between ${MIN_MINUTES} and ${MAX_MINUTES} minutes.` };
  }

  const varNumber = Number(variation);
  if (!isFiniteNumber(varNumber) || !Number.isInteger(varNumber)) {
    return { error: "Variation must be a whole number." };
  }
  if (varNumber < MIN_VARIATION || varNumber > MAX_VARIATION) {
    return { error: `Variation should be between ${MIN_VARIATION} and ${MAX_VARIATION}.` };
  }

  const totalWords = mins * paceEntry.wpm;
  const warmUpWords = totalWords * WARM_UP_SHARE;
  const mainWords = totalWords * MAIN_SHARE;
  const closeWords = totalWords * CLOSE_SHARE;

  const promptCount = clamp(Math.floor(mainWords / MIN_WORDS_PER_PROMPT), 1, MAX_PROMPTS);
  const wordsPerPrompt = mainWords / promptCount;
  const minutesPerPrompt = (mins * MAIN_SHARE) / promptCount;
  const prompts = selectPrompts(themeEntry.id, moodEntry.id, promptCount, varNumber);

  const sessionSheet = [
    `${themeEntry.label} — ${Math.round(mins)} minute session`,
    `Mood: ${moodEntry.label}. ${moodEntry.guard}`,
    "",
    `Warm-up (about ${Math.round(warmUpWords)} words): write what is in the way of starting. No editing.`,
    "",
    ...prompts.flatMap((text, index) => [
      `${index + 1}. ${text}`,
      `   (about ${Math.round(wordsPerPrompt)} words, ${Math.round(minutesPerPrompt)} min)`,
      "",
    ]),
    `Close (about ${Math.round(closeWords)} words): one sentence you want to remember, and one thing you will do next.`,
  ].join("\n");

  const aiPrompt = [
    "You write journaling prompts. You do not give therapy, diagnoses or reassurance.",
    "",
    `Write ${promptCount + 2} new journaling prompts on the theme "${themeEntry.label}".`,
    "",
    "CONSTRAINTS",
    `- The person has ${Math.round(mins)} minutes and writes at roughly ${paceEntry.wpm} words a minute, so each prompt should be answerable in about ${Math.round(wordsPerPrompt)} words.`,
    `- They described their state as ${moodEntry.label.toLowerCase()}, so ${moodEntry.framing}.`,
    `- ${moodEntry.guard}`,
    context.trim() ? `- Context that matters today: ${context.trim()}.` : null,
    "- Each prompt must be a single question or instruction, under 25 words, asking for something specific rather than a feeling in general.",
    "- No prompt may be answerable with yes or no.",
    "- Do not reuse these, which they already have: " + prompts.join(" / "),
    "- Do not offer advice, interpretation or encouragement. Prompts only.",
    "",
    "OUTPUT FORMAT",
    "A numbered list. After each prompt, add one short line naming what the prompt is trying to surface.",
  ]
    .filter((line) => line !== null)
    .join("\n");

  const charCount = aiPrompt.length;

  return {
    sessionSheet,
    aiPrompt,
    prompts,
    promptCount,
    totalWords,
    warmUpWords,
    mainWords,
    closeWords,
    wordsPerPrompt,
    minutesPerPrompt,
    minutes: mins,
    wpm: paceEntry.wpm,
    paceLabel: paceEntry.label,
    themeLabel: themeEntry.label,
    moodLabel: moodEntry.label,
    moodGuard: moodEntry.guard,
    wordCount: countWords(aiPrompt),
    charCount,
    tokenEstimate: Math.ceil(charCount / CHARS_PER_TOKEN),
  };
}
