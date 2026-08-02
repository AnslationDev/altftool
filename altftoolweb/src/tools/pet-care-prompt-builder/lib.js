/**
 * Pet Care Prompt Builder — pure logic.
 *
 * Turns pet facts into (a) a normalised life-stage classification and daily
 * training plan and (b) a fully written prompt for an AI assistant.
 *
 * No React, no DOM, no Date.now(). Same input -> same output.
 */

/** 12 months per year / 52 weeks per year — exact conversion factor. */
export const MONTHS_PER_WEEK = 12 / 52;
export const MONTHS_PER_YEAR = 12;

/** Upper sanity bound: the oldest verified dog lived ~29 years, cats ~38. */
export const MAX_AGE_MONTHS = 40 * MONTHS_PER_YEAR;

/** OpenAI's published English rule of thumb: ~4 characters per token. */
export const CHARS_PER_TOKEN = 4;

export const SPECIES = [
  { id: "dog", label: "Dog" },
  { id: "cat", label: "Cat" },
];

export const AGE_UNITS = [
  { id: "weeks", label: "weeks", months: MONTHS_PER_WEEK },
  { id: "months", label: "months", months: 1 },
  { id: "years", label: "years", months: MONTHS_PER_YEAR },
];

export const EXPERIENCE_LEVELS = [
  { id: "first-time", label: "First-time owner", note: "explain every step and define any jargon" },
  { id: "some", label: "Some experience", note: "skip the basics, focus on technique" },
  { id: "experienced", label: "Experienced owner", note: "go straight to advanced detail and edge cases" },
];

export const GOALS = [
  {
    id: "house-training",
    label: "House / litter training",
    ask: "a house-training or litter-training plan with a fixed break schedule and an accident-recovery routine",
  },
  {
    id: "basic-obedience",
    label: "Basic obedience & cues",
    ask: "a cue-training curriculum that teaches one behaviour at a time using positive reinforcement",
  },
  {
    id: "daily-routine",
    label: "Daily routine & enrichment",
    ask: "a repeatable daily routine covering feeding windows, activity, enrichment and rest",
  },
  {
    id: "behaviour-issue",
    label: "Specific behaviour problem",
    ask: "a management plan for one specific behaviour, separating the immediate management step from the longer-term training plan",
  },
  {
    id: "feeding-routine",
    label: "Feeding schedule structure",
    ask: "a feeding-schedule structure with meal timing and portion-splitting logic (amounts to be confirmed with a vet)",
  },
  {
    id: "settling-in",
    label: "Settling a new arrival",
    ask: "a first-two-weeks settling-in plan with a decompression period and gradual introductions",
  },
  {
    id: "senior-care",
    label: "Senior comfort & mobility",
    ask: "a comfort and mobility routine appropriate to an older animal, with signs that warrant a vet visit",
  },
];

/**
 * Life-stage bands.
 * Dog bands follow the AAHA Canine Life Stage Guidelines structure
 * (puppy / young adult / mature adult / senior).
 * Cat bands follow the AAFP-AAHA Feline Life Stage Guidelines
 * (kitten to 1 yr, young adult 1-6 yr, mature adult 7-10 yr, senior 10 yr+).
 */
export const DOG_LIFE_STAGES = [
  { maxMonths: 12, id: "puppy", label: "Puppy", note: "rapid growth, short attention span, frequent breaks" },
  { maxMonths: 36, id: "young-adult", label: "Young adult", note: "physically mature but still high energy" },
  { maxMonths: 84, id: "mature-adult", label: "Mature adult", note: "settled; watch weight and dental health" },
  { maxMonths: Infinity, id: "senior", label: "Senior", note: "shorter sessions, joint and cognition changes" },
];

export const CAT_LIFE_STAGES = [
  { maxMonths: 12, id: "kitten", label: "Kitten", note: "socialisation window; play in very short bursts" },
  { maxMonths: 84, id: "young-adult", label: "Young adult", note: "peak activity; needs hunting-style play" },
  { maxMonths: 120, id: "mature-adult", label: "Mature adult", note: "weight gain is the common risk here" },
  { maxMonths: Infinity, id: "senior", label: "Senior", note: "easier litter access and warmth matter more" },
];

/**
 * Session length guidance used by positive-reinforcement trainers: keep very
 * young animals to ~5 minutes, adolescents to ~10, adults to ~15, and split the
 * daily budget across several short sessions rather than one long one.
 */
export const SESSION_MINUTES_BANDS = [
  { maxMonths: 6, minutes: 5 },
  { maxMonths: 12, minutes: 10 },
  { maxMonths: Infinity, minutes: 15 },
];

export const MAX_SESSIONS_PER_DAY = 6;
export const MIN_DAILY_MINUTES = 5;
export const MAX_DAILY_MINUTES = 240;

/**
 * Common house-training guideline for puppies: a puppy can usually hold its
 * bladder for roughly (age in months + 1) hours, and no dog should routinely go
 * longer than about 8 hours between breaks.
 */
export const BLADDER_HOURS_OFFSET = 1;
export const BLADDER_HOURS_CAP = 8;
export const BLADDER_HOURS_FLOOR = 1;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);

/** Convert an age given in weeks / months / years into whole-ish months. */
export function toAgeMonths(value, unit) {
  const numeric = Number(value);
  if (!isFiniteNumber(numeric)) return NaN;
  const found = AGE_UNITS.find((item) => item.id === unit);
  if (!found) return NaN;
  return numeric * found.months;
}

export function classifyLifeStage(species, ageMonths) {
  if (!isFiniteNumber(ageMonths) || ageMonths < 0) return null;
  const bands = species === "cat" ? CAT_LIFE_STAGES : DOG_LIFE_STAGES;
  return bands.find((band) => ageMonths < band.maxMonths) || bands[bands.length - 1];
}

export function sessionMinutesFor(ageMonths) {
  if (!isFiniteNumber(ageMonths) || ageMonths < 0) return NaN;
  const band = SESSION_MINUTES_BANDS.find((item) => ageMonths < item.maxMonths);
  return band ? band.minutes : SESSION_MINUTES_BANDS[SESSION_MINUTES_BANDS.length - 1].minutes;
}

/** Hours a young dog can usually wait between toilet breaks. Null when N/A. */
export function bladderIntervalHours(species, ageMonths) {
  if (species !== "dog") return null;
  if (!isFiniteNumber(ageMonths) || ageMonths <= 0) return null;
  if (ageMonths >= 12) return BLADDER_HOURS_CAP;
  const raw = ageMonths + BLADDER_HOURS_OFFSET;
  return clamp(Math.round(raw * 10) / 10, BLADDER_HOURS_FLOOR, BLADDER_HOURS_CAP);
}

export function formatAge(ageMonths) {
  if (!isFiniteNumber(ageMonths) || ageMonths <= 0) return "";
  if (ageMonths < 3) {
    const weeks = Math.round(ageMonths / MONTHS_PER_WEEK);
    return `${weeks} week${weeks === 1 ? "" : "s"} old`;
  }
  if (ageMonths < 24) {
    const months = Math.round(ageMonths);
    return `${months} month${months === 1 ? "" : "s"} old`;
  }
  const years = Math.round((ageMonths / MONTHS_PER_YEAR) * 10) / 10;
  return `${years} year${years === 1 ? "" : "s"} old`;
}

const countWords = (text) => (text.trim() ? text.trim().split(/\s+/).length : 0);

/**
 * Build the finished prompt plus the derived plan figures.
 * Returns { error } for anything that cannot produce an honest answer.
 */
export function buildPetCarePrompt(input) {
  const {
    species = "dog",
    petName = "",
    breed = "",
    ageValue,
    ageUnit = "months",
    weightKg = "",
    experience = "first-time",
    goal = "basic-obedience",
    concern = "",
    household = "",
    minutesPerDay,
  } = input || {};

  const speciesEntry = SPECIES.find((item) => item.id === species);
  if (!speciesEntry) return { error: "Choose whether this is a dog or a cat." };

  const ageMonths = toAgeMonths(ageValue, ageUnit);
  if (Number.isNaN(ageMonths)) return { error: "Enter the pet's age as a number." };
  if (ageMonths <= 0) return { error: "Age must be greater than zero." };
  if (ageMonths > MAX_AGE_MONTHS) {
    return { error: `That age is out of range — enter an age under ${MAX_AGE_MONTHS / MONTHS_PER_YEAR} years.` };
  }

  const minutes = Number(minutesPerDay);
  if (!isFiniteNumber(minutes)) return { error: "Enter your daily training minutes as a number." };
  if (minutes < MIN_DAILY_MINUTES || minutes > MAX_DAILY_MINUTES) {
    return {
      error: `Daily training time should be between ${MIN_DAILY_MINUTES} and ${MAX_DAILY_MINUTES} minutes.`,
    };
  }

  let weight = null;
  if (String(weightKg).trim() !== "") {
    const parsed = Number(weightKg);
    if (!isFiniteNumber(parsed)) return { error: "Weight must be a number, or left blank." };
    if (parsed <= 0 || parsed > 120) return { error: "Weight should be between 0 and 120 kg, or left blank." };
    weight = Math.round(parsed * 10) / 10;
  }

  const goalEntry = GOALS.find((item) => item.id === goal) || GOALS[1];
  const experienceEntry =
    EXPERIENCE_LEVELS.find((item) => item.id === experience) || EXPERIENCE_LEVELS[0];
  const stage = classifyLifeStage(species, ageMonths);
  const ageAppropriateSessionMinutes = sessionMinutesFor(ageMonths);
  // A full age-appropriate session may not fit inside the owner's stated daily
  // budget (e.g. 5 minutes/day for a dog whose life stage calls for 15-minute
  // sessions). Rather than force a session length the owner told us they don't
  // have time for, shrink the single session to fit and say so in the prompt —
  // never claim a plan that contradicts the stated available minutes.
  const canFitFullSession = minutes >= ageAppropriateSessionMinutes;
  const sessionsPerDay = canFitFullSession
    ? clamp(Math.floor(minutes / ageAppropriateSessionMinutes), 1, MAX_SESSIONS_PER_DAY)
    : 1;
  const sessionMinutes = canFitFullSession ? ageAppropriateSessionMinutes : Math.round(minutes);
  const sessionsShortened = !canFitFullSession;
  const plannedMinutes = sessionsPerDay * sessionMinutes;
  const leftoverMinutes = Math.max(0, Math.round(minutes - plannedMinutes));
  const bladderHours = bladderIntervalHours(species, ageMonths);
  const bladderGuidanceIncluded = bladderHours !== null && ageMonths < 12;

  const subject = petName.trim() ? petName.trim() : `my ${speciesEntry.label.toLowerCase()}`;
  const breedText = breed.trim() ? `${breed.trim()} ` : "";
  const ageText = formatAge(ageMonths);

  const facts = [
    `Species: ${speciesEntry.label}`,
    breed.trim() ? `Breed or type: ${breed.trim()}` : null,
    `Age: ${ageText} (${stage.label.toLowerCase()} stage)`,
    weight !== null ? `Weight: ${weight} kg` : null,
    `Owner experience: ${experienceEntry.label}`,
    `Time I can give to structured training: ${Math.round(minutes)} minutes a day`,
    household.trim() ? `Household context: ${household.trim()}` : null,
    concern.trim() ? `What I most want fixed: ${concern.trim()}` : null,
  ].filter(Boolean);

  const constraints = [
    `Fit the plan into ${sessionsPerDay} session${sessionsPerDay === 1 ? "" : "s"} a day of about ${sessionMinutes} minutes each — short sessions suit a ${stage.label.toLowerCase()}.`,
    sessionsShortened
      ? `${Math.round(minutes)} minutes a day is less than the ${ageAppropriateSessionMinutes}-minute session length that usually suits a ${stage.label.toLowerCase()}, so today's session is shortened to fit — increase daily minutes if you want full-length sessions.`
      : null,
    leftoverMinutes > 0
      ? `I have about ${leftoverMinutes} spare minutes a day; suggest low-effort enrichment for that time rather than another drill.`
      : null,
    bladderGuidanceIncluded
      ? `Assume toilet breaks roughly every ${bladderHours} hours (a puppy can usually hold about age-in-months + 1 hours) and build the day around that.`
      : null,
    "Use reward-based methods only. Do not suggest aversive tools, punishment, alpha or dominance framing.",
    `Adapt the level of explanation: ${experienceEntry.note}.`,
    "Flag anything that is a veterinary or qualified-behaviourist question instead of guessing, and never suggest medication, dosages or a diagnosis.",
  ].filter(Boolean);

  const outputSpec = [
    "1. A one-paragraph summary of what we are working on and why it suits this life stage.",
    `2. A ${sessionsPerDay}-session daily schedule with a clock-time suggestion for each session.`,
    "3. For each session: the exact drill, what to reward, and the one mistake owners make with it.",
    "4. A week-by-week progression for four weeks, with a measurable success marker for each week.",
    "5. A short list of warning signs that mean I should stop and speak to a vet or certified behaviourist.",
  ];

  const prompt = [
    `You are an experienced, reward-based ${speciesEntry.label.toLowerCase()} trainer writing for ${experienceEntry.label.toLowerCase()}s.`,
    "",
    `Build ${goalEntry.ask} for ${breedText ? `my ${breedText}${speciesEntry.label.toLowerCase()}, ` : ""}${subject}.`,
    "",
    "PET DETAILS",
    ...facts.map((line) => `- ${line}`),
    "",
    "CONSTRAINTS",
    ...constraints.map((line) => `- ${line}`),
    "",
    "OUTPUT FORMAT",
    ...outputSpec,
    "",
    "Keep it concrete and specific to the details above. If a detail is missing that would change your advice, ask me for that one detail first instead of assuming it.",
  ].join("\n");

  const charCount = prompt.length;

  return {
    prompt,
    ageMonths: Math.round(ageMonths * 10) / 10,
    ageText,
    lifeStage: stage.label,
    lifeStageNote: stage.note,
    sessionMinutes,
    sessionsPerDay,
    sessionsShortened,
    plannedMinutes,
    leftoverMinutes,
    bladderHours,
    bladderGuidanceIncluded,
    weight,
    goalLabel: goalEntry.label,
    wordCount: countWords(prompt),
    charCount,
    tokenEstimate: Math.ceil(charCount / CHARS_PER_TOKEN),
  };
}
