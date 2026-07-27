/**
 * Parenting Prompt Builder.
 *
 * Maps a child's age onto a recognised developmental stage, derives a realistic
 * per-activity attention block and works out how many activities fit the time the
 * caregiver actually has. Those figures are then written into an AI prompt so the
 * model plans for the child in front of you rather than an average child.
 *
 * Sources for every constant are named in the comment above it.
 */

/**
 * Piaget's four stages of cognitive development (Piaget, 1936; ages are the
 * conventional approximations used in developmental psychology teaching).
 * The "capabilities" and "avoid" lines describe what the stage does and does not
 * support, which is what the prompt needs the model to respect.
 */
export const DEVELOPMENT_STAGES = [
  {
    id: "sensorimotor",
    label: "Sensorimotor (0–2 years)",
    minAge: 0,
    maxAge: 2,
    capabilities:
      "learning through senses and movement, object permanence emerging, imitation of simple actions",
    avoid: "rules, turn-taking games, anything needing spoken instructions longer than a few words",
  },
  {
    id: "preoperational",
    label: "Preoperational (2–7 years)",
    minAge: 2,
    maxAge: 7,
    capabilities:
      "symbolic and pretend play, fast vocabulary growth, strong interest in 'why' questions",
    avoid:
      "abstract reasoning, hypotheticals, tasks that need holding two rules in mind at once, losing gracefully",
  },
  {
    id: "concrete-operational",
    label: "Concrete operational (7–11 years)",
    minAge: 7,
    maxAge: 11,
    capabilities:
      "logical thinking about real objects, sorting and classifying, following multi-step rules, fairness matters a lot",
    avoid: "purely abstract or hypothetical reasoning without a concrete example to anchor it",
  },
  {
    id: "formal-operational",
    label: "Formal operational (11+ years)",
    minAge: 11,
    maxAge: 18,
    capabilities:
      "hypothetical and abstract reasoning, planning ahead, debating ideas, self-conscious identity work",
    avoid: "babyish framing, being talked down to, activities with no say in the choice",
  },
];

/**
 * Classroom and paediatric rule of thumb for sustained attention on an adult-directed
 * task: roughly 2 to 5 minutes per year of age. It is a planning heuristic, not a
 * clinical measure, and it is quoted for pre-adolescent children.
 */
export const ATTENTION_MIN_PER_YEAR = 2;
export const ATTENTION_MAX_PER_YEAR = 5;

/**
 * Practical floor and ceiling applied to a single activity block. Below 5 minutes an
 * activity is not worth setting up; beyond 30 minutes almost every child benefits from
 * a break, so longer sessions are planned as several blocks instead of one.
 */
export const MIN_BLOCK_MINUTES = 5;
export const MAX_BLOCK_MINUTES = 30;

/** Planning allowance for setting up, tidying and moving a child between activities. */
export const TRANSITION_MINUTES = 3;

export const LIMITS = {
  ageYears: { min: 0.5, max: 18 },
  availableMinutes: { min: 5, max: 240 },
};

/**
 * American Academy of Pediatrics media-use guidance (AAP policy statement, "Media and
 * Young Minds" 2016 and "Media Use in School-Aged Children and Adolescents" 2016).
 */
export const SCREEN_GUIDANCE = [
  { maxAge: 1.5, text: "No screen media other than video chat before about 18 months." },
  {
    maxAge: 2,
    text: "18–24 months: only high-quality programming, watched together with an adult who explains it.",
  },
  { maxAge: 5, text: "Ages 2–5: about 1 hour a day of high-quality programming, co-viewed." },
  {
    maxAge: 18,
    text: "Ages 6 and up: consistent limits that still leave room for sleep, physical activity and offline play.",
  },
];

/**
 * Recommended sleep, American Academy of Sleep Medicine consensus statement (2016),
 * endorsed by the AAP. Hours are per 24 hours including naps for the youngest bands.
 */
export const SLEEP_GUIDANCE = [
  { maxAge: 2, low: 11, high: 14 },
  { maxAge: 5, low: 10, high: 13 },
  { maxAge: 12, low: 9, high: 12 },
  { maxAge: 18, low: 8, high: 10 },
];

/** What the caregiver is trying to achieve in this block of time. */
export const SESSION_GOALS = [
  {
    id: "screen-free-play",
    label: "Screen-free play",
    directive:
      "Every activity must work with no screen at all, and must not need an adult to run it end to end.",
  },
  {
    id: "calm-down",
    label: "Calm down and regulate",
    directive:
      "Activities should lower arousal, not raise it: slow, repetitive, sensory or rhythmic. Name the feeling first, solve the problem second.",
  },
  {
    id: "conversation",
    label: "Conversation starters",
    directive:
      "Give open questions the child cannot answer with yes or no, plus one follow-up per question that goes a level deeper.",
  },
  {
    id: "learning-play",
    label: "Learning through play",
    directive:
      "Hide the learning inside the play. Say what skill each activity builds, but do not turn it into a lesson or a test.",
  },
  {
    id: "siblings",
    label: "Siblings playing together",
    directive:
      "Activities must give each child a distinct role so neither is waiting, and must have a stated rule for who goes first.",
  },
  {
    id: "bedtime",
    label: "Bedtime wind-down",
    directive:
      "Keep everything low-light, low-movement and predictable, ending in the same place each night so the routine itself becomes the cue.",
  },
];

/** Where the time will actually be spent — this constrains what is possible more than age does. */
export const SETTINGS = [
  { id: "small-indoor", label: "Small indoor space (flat, one room)" },
  { id: "outdoor", label: "Outdoors — garden, park or street" },
  { id: "car", label: "In a car or on public transport" },
  { id: "waiting", label: "Waiting somewhere quiet (clinic, restaurant)" },
  { id: "rainy-day", label: "Whole rainy day indoors" },
];

function toNumber(value) {
  const number = Number(String(value ?? "").replace(/,/g, "").trim());
  return Number.isFinite(number) ? number : NaN;
}

function clamp(value, low, high) {
  return Math.min(high, Math.max(low, value));
}

/** The developmental stage a given age falls in. Boundaries belong to the older stage. */
export function getStageForAge(ageYears) {
  const age = toNumber(ageYears);
  if (Number.isNaN(age)) return null;
  for (let i = DEVELOPMENT_STAGES.length - 1; i >= 0; i -= 1) {
    if (age >= DEVELOPMENT_STAGES[i].minAge) return DEVELOPMENT_STAGES[i];
  }
  return DEVELOPMENT_STAGES[0];
}

export function getScreenGuidance(ageYears) {
  const age = toNumber(ageYears);
  if (Number.isNaN(age)) return null;
  return SCREEN_GUIDANCE.find((band) => age < band.maxAge) || SCREEN_GUIDANCE[SCREEN_GUIDANCE.length - 1];
}

export function getSleepGuidance(ageYears) {
  const age = toNumber(ageYears);
  if (Number.isNaN(age)) return null;
  return SLEEP_GUIDANCE.find((band) => age <= band.maxAge) || SLEEP_GUIDANCE[SLEEP_GUIDANCE.length - 1];
}

export function getGoal(goalId) {
  return SESSION_GOALS.find((goal) => goal.id === goalId) || null;
}

export function getSetting(settingId) {
  return SETTINGS.find((setting) => setting.id === settingId) || null;
}

/** About four characters per token for ordinary English prose. */
export const AVERAGE_CHARS_PER_TOKEN = 4;

export function measureText(text) {
  if (typeof text !== "string" || text.trim().length === 0) {
    return { characters: 0, words: 0, approxTokens: 0 };
  }
  return {
    characters: text.length,
    words: text.trim().split(/\s+/).length,
    approxTokens: Math.max(1, Math.ceil(text.length / AVERAGE_CHARS_PER_TOKEN)),
  };
}

/**
 * Work out the attention band, the activity block length and how many blocks fit.
 * @returns {{error:string}|object}
 */
export function planSession({ ageYears, availableMinutes } = {}) {
  const age = toNumber(ageYears);
  const minutes = toNumber(availableMinutes);

  if (Number.isNaN(age)) return { error: "Enter the child's age in years." };
  if (age < LIMITS.ageYears.min) {
    return { error: "This planner starts at 6 months (0.5 years)." };
  }
  if (age > LIMITS.ageYears.max) {
    return { error: "This planner covers children up to 18 years." };
  }
  if (Number.isNaN(minutes)) return { error: "Enter how many minutes you have as a number." };
  if (minutes < LIMITS.availableMinutes.min) {
    return { error: `Give the session at least ${LIMITS.availableMinutes.min} minutes.` };
  }
  if (minutes > LIMITS.availableMinutes.max) {
    return { error: "Sessions longer than 4 hours are better planned as separate blocks." };
  }

  const attentionLow = Math.max(1, Math.round(ATTENTION_MIN_PER_YEAR * age));
  const attentionHigh = Math.max(attentionLow + 1, Math.round(ATTENTION_MAX_PER_YEAR * age));
  const blockMinutes = clamp(
    Math.round((attentionLow + attentionHigh) / 2),
    MIN_BLOCK_MINUTES,
    MAX_BLOCK_MINUTES,
  );

  // n activity blocks need n-1 transitions between them, not n — the last block has
  // nothing to move on to. Adding one transition to the numerator encodes that.
  const slotMinutes = blockMinutes + TRANSITION_MINUTES;
  const activityCount = Math.max(1, Math.floor((minutes + TRANSITION_MINUTES) / slotMinutes));
  const plannedMinutes = activityCount * blockMinutes + (activityCount - 1) * TRANSITION_MINUTES;
  const spareMinutes = Math.max(0, minutes - plannedMinutes);

  const stage = getStageForAge(age);
  const screen = getScreenGuidance(age);
  const sleep = getSleepGuidance(age);

  const warnings = [];
  if (minutes < blockMinutes) {
    warnings.push(
      `A typical activity block at this age is about ${blockMinutes} minutes, which is longer than the time you have — plan one shortened activity and stop cleanly.`,
    );
  }
  if (activityCount > 8) {
    warnings.push(
      "More than eight activities in one sitting usually means constant transitions — consider a longer block for each instead.",
    );
  }

  return {
    age,
    minutes,
    stage,
    attentionLow,
    attentionHigh,
    blockMinutes,
    transitionMinutes: TRANSITION_MINUTES,
    transitionCount: Math.max(0, activityCount - 1),
    activityCount,
    plannedMinutes,
    spareMinutes,
    screenGuidance: screen ? screen.text : "",
    sleepLow: sleep ? sleep.low : null,
    sleepHigh: sleep ? sleep.high : null,
    warnings,
  };
}

/**
 * Write the parenting prompt around the computed session plan.
 * @returns {{error:string}|{text:string, plan:object}}
 */
export function buildParentingPrompt({
  plan,
  childName,
  goalId,
  settingId,
  interests,
  materials,
  notes,
} = {}) {
  if (!plan || plan.error) return { error: plan?.error || "Set a valid age and time first." };
  const goal = getGoal(goalId);
  if (!goal) return { error: "Choose what this block of time is for." };
  const setting = getSetting(settingId);
  if (!setting) return { error: "Choose where the time will be spent." };

  const name = typeof childName === "string" && childName.trim() ? childName.trim() : "my child";
  const likes = typeof interests === "string" ? interests.trim() : "";
  const kit = typeof materials === "string" ? materials.trim() : "";
  const extra = typeof notes === "string" ? notes.trim() : "";

  const ageLabel =
    plan.age < 1
      ? `${Math.round(plan.age * 12)} months`
      : `${plan.age % 1 === 0 ? plan.age : plan.age.toFixed(1)} years`;

  const lines = [
    `Act as an experienced early-years and child-development practitioner. Plan ${plan.activityCount} ${plan.activityCount === 1 ? "activity" : "activities"} for ${name}, aged ${ageLabel}. Work only from the constraints below.`,
    "",
    `DEVELOPMENTAL STAGE: ${plan.stage.label}.`,
    `- Can do: ${plan.stage.capabilities}.`,
    `- Do not assume: ${plan.stage.avoid}.`,
    "",
    "TIME BUDGET:",
    `- Total time available: ${plan.minutes} minutes.`,
    `- Sustained attention for an adult-directed task at this age is roughly ${plan.attentionLow}–${plan.attentionHigh} minutes (2–5 minutes per year of age).`,
    `- Plan ${plan.activityCount} ${plan.activityCount === 1 ? "block" : "blocks"} of about ${plan.blockMinutes} minutes each, with ${plan.transitionMinutes} minutes between blocks for setting up and tidying.`,
  ];

  if (plan.spareMinutes > 0) {
    lines.push(`- Leave the remaining ${plan.spareMinutes} minutes unplanned as slack.`);
  }

  lines.push(
    "",
    `PURPOSE: ${goal.label}. ${goal.directive}`,
    `SETTING: ${setting.label}. Nothing that does not fit this space.`,
  );

  if (likes) lines.push(`WHAT ${name.toUpperCase()} IS INTO RIGHT NOW: ${likes}`);
  lines.push(
    kit
      ? `MATERIALS AVAILABLE: ${kit}. Do not require anything else.`
      : "MATERIALS: assume ordinary household objects only — no craft kits, no printing, nothing to buy.",
  );

  lines.push(
    "",
    "OUTPUT — for each activity give:",
    "1. A name a child would find appealing.",
    "2. Minutes it should take.",
    "3. Exactly what the adult says to start it, in one sentence, in words this age understands.",
    "4. The setup in one line, and what to do when the child loses interest early.",
    "5. One sentence on what it is building — motor, language, attention, cooperation or emotional skill.",
    "",
    "THEN give a 'if it goes wrong' line: the single most likely way this session derails at this age, and the specific thing to say or do.",
    "",
    "RULES:",
    "- Age-appropriate safety first: no small parts, ropes, heat or water hazards unsupervised for a child under 4.",
    "- No screens as the activity itself unless I asked for one.",
    "- Do not moralise about parenting choices and do not offer medical, psychological or diagnostic opinions.",
    "- Ask at most 2 clarifying questions, and only if a constraint above is genuinely ambiguous.",
  );

  if (plan.screenGuidance) {
    lines.push("", `CONTEXT — media guidance for this age (AAP): ${plan.screenGuidance}`);
  }
  if (plan.sleepLow && plan.sleepHigh) {
    lines.push(
      `CONTEXT — recommended sleep at this age (AASM/AAP): ${plan.sleepLow}–${plan.sleepHigh} hours per 24 hours.`,
    );
  }
  if (extra) lines.push("", `ALSO: ${extra}`);

  const text = lines.join("\n");
  return { text, plan, goal, setting, ...measureText(text) };
}
