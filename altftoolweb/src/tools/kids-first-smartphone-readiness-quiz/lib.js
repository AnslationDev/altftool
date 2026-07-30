/**
 * First-smartphone readiness quiz.
 *
 * Pure logic: no React, no DOM, no clock reads.
 *
 * The score measures observable behaviour, not age. Age is used separately to
 * decide which device tier and which platform age rules apply.
 */

/**
 * Almost every mainstream social platform sets 13 as its minimum age, following
 * the US Children's Online Privacy Protection Act, which restricts collecting
 * personal data from children under 13 without verifiable parental consent.
 */
export const SOCIAL_MEDIA_MIN_AGE = 13;

/** Answer scale used by every question. */
export const ANSWER_OPTIONS = [
  { value: 0, label: "Rarely or never" },
  { value: 1, label: "Sometimes" },
  { value: 2, label: "Usually" },
  { value: 3, label: "Consistently" },
];

export const MAX_ANSWER = 3;

export const DIMENSIONS = [
  { id: "self-regulation", label: "Self-regulation", blurb: "Can they stop when asked and cope without a screen?" },
  { id: "responsibility", label: "Responsibility", blurb: "Do they look after things and tell you when something goes wrong?" },
  { id: "judgement", label: "Online judgement", blurb: "Do they know what not to share and what to do when it goes wrong?" },
  { id: "need", label: "Practical need", blurb: "Is there a real reason for a phone right now?" },
  { id: "household", label: "Household readiness", blurb: "Have the adults agreed the rules and the review habit?" },
];

/**
 * weight: how much the question counts. redFlag questions are the ones where a
 * low answer should hold back the recommendation regardless of the total.
 */
export const QUESTIONS = [
  {
    id: "hands-back",
    dimension: "self-regulation",
    text: "They hand a device back at the agreed time without it turning into an argument.",
    weight: 3,
    redFlag: true,
  },
  {
    id: "tasks-first",
    dimension: "self-regulation",
    text: "Homework and chores get done before screen time without repeated reminders.",
    weight: 2,
  },
  {
    id: "handles-boredom",
    dimension: "self-regulation",
    text: "They can be bored for a while without needing a screen to fix it.",
    weight: 2,
  },
  {
    id: "keeps-belongings",
    dimension: "responsibility",
    text: "They keep track of their own belongings — coat, water bottle, keys, kit bag.",
    weight: 2,
  },
  {
    id: "looks-after-devices",
    dimension: "responsibility",
    text: "They charge and look after the devices they already use.",
    weight: 2,
  },
  {
    id: "tells-you",
    dimension: "responsibility",
    text: "When something goes wrong, they tell you rather than hide it.",
    weight: 3,
    redFlag: true,
  },
  {
    id: "withholds-personal-info",
    dimension: "judgement",
    text: "They understand not to share their address, school, timetable or photos with people they have not met.",
    weight: 3,
    redFlag: true,
  },
  {
    id: "knows-what-to-do",
    dimension: "judgement",
    text: "They know exactly what to do if someone is cruel or asks for a photo: stop replying, screenshot, tell an adult.",
    weight: 3,
    redFlag: true,
  },
  {
    id: "spots-scams",
    dimension: "judgement",
    text: "They recognise fake giveaways, prize links and messages pretending to be from a friend.",
    weight: 2,
  },
  {
    id: "practical-need",
    dimension: "need",
    text: "There is a practical reason for a phone now — travelling alone, activities, or two households to coordinate.",
    weight: 2,
  },
  {
    id: "social-exclusion",
    dimension: "need",
    text: "Their close friends already arrange things by phone, so not having one leaves them out of real plans.",
    weight: 1,
  },
  {
    id: "app-approval-agreed",
    dimension: "household",
    text: "The adults have agreed which apps are allowed and who approves a new one.",
    weight: 2,
  },
  {
    id: "overnight-rule",
    dimension: "household",
    text: "There is an agreed rule for where the phone spends the night, outside the bedroom.",
    weight: 2,
  },
  {
    id: "review-habit",
    dimension: "household",
    text: "You are willing to sit down and review settings, contacts and messages together at agreed intervals.",
    weight: 2,
  },
];

export const BANDS = [
  {
    min: 80,
    label: "Ready for a first smartphone",
    tone: "success",
    reviewWeeks: 12,
    summary: "The behaviours that matter are already there. Start with a normal phone plus the rules below and review quarterly.",
  },
  {
    min: 60,
    label: "Ready, with tight rules",
    tone: "success",
    reviewWeeks: 4,
    summary: "Close enough to start, provided the phone arrives with limits already set and a short review cycle.",
  },
  {
    min: 40,
    label: "Start with a limited device",
    tone: "warning",
    reviewWeeks: 8,
    summary: "A watch or a calls-and-texts phone gives the safety benefit now, and the gaps below can be worked on before a full smartphone.",
  },
  {
    min: 0,
    label: "Not yet",
    tone: "danger",
    reviewWeeks: 12,
    summary: "The groundwork is not in place. Work on the weakest area below and reassess rather than setting a date.",
  },
];

function bandFor(percent) {
  return BANDS.find((band) => percent >= band.min) || BANDS[BANDS.length - 1];
}

/** Device tier suggested by the readiness band and the child's age. */
export function deviceTier({ bandLabel, age }) {
  if (bandLabel === "Not yet") return "No connected device yet, or a location-only tracker";
  if (bandLabel === "Start with a limited device") {
    return age < 11
      ? "A kids smartwatch with calls to a fixed contact list"
      : "A calls-and-texts phone with no app store";
  }
  if (bandLabel === "Ready, with tight rules") {
    return age < SOCIAL_MEDIA_MIN_AGE
      ? "A smartphone in a supervised child account, app store locked, no social apps"
      : "A smartphone in a supervised account with app approval turned on";
  }
  return age < SOCIAL_MEDIA_MIN_AGE
    ? "A smartphone in a supervised child account, with social apps deferred until 13"
    : "A smartphone with supervision that can be loosened as they show it is earned";
}

/**
 * Score the quiz.
 *
 * @param {object} input
 * @param {number} input.age
 * @param {Record<string, number>} input.answers  question id -> 0..3
 */
export function scoreQuiz({ age, answers } = {}) {
  const years = Number(age);
  if (!Number.isFinite(years)) return { error: "Enter the child's age in years." };
  if (years < 5 || years > 17) {
    return { error: "This quiz is aimed at children aged 5 to 17." };
  }
  if (!answers || typeof answers !== "object") {
    return { error: "Answer every question to get a score." };
  }

  const unanswered = QUESTIONS.filter((question) => {
    const value = answers[question.id];
    return !Number.isInteger(value) || value < 0 || value > MAX_ANSWER;
  });
  if (unanswered.length > 0) {
    return {
      error: `Answer all ${QUESTIONS.length} questions — ${unanswered.length} still ${unanswered.length === 1 ? "needs" : "need"} an answer.`,
    };
  }

  const totalWeight = QUESTIONS.reduce((sum, question) => sum + question.weight, 0);
  const maxScore = totalWeight * MAX_ANSWER;
  const score = QUESTIONS.reduce(
    (sum, question) => sum + question.weight * answers[question.id],
    0,
  );
  // totalWeight is a positive constant from the catalogue, so this cannot divide by zero.
  const percent = Math.round((score / maxScore) * 100);

  const dimensions = DIMENSIONS.map((dimension) => {
    const items = QUESTIONS.filter((question) => question.dimension === dimension.id);
    const dimensionMax = items.reduce((sum, question) => sum + question.weight, 0) * MAX_ANSWER;
    const dimensionScore = items.reduce(
      (sum, question) => sum + question.weight * answers[question.id],
      0,
    );
    return {
      ...dimension,
      score: dimensionScore,
      max: dimensionMax,
      percent: dimensionMax > 0 ? Math.round((dimensionScore / dimensionMax) * 100) : 0,
    };
  });

  const flags = QUESTIONS.filter(
    (question) => question.redFlag && answers[question.id] <= 1,
  ).map((question) => question.text);

  let band = bandFor(percent);
  // A high total should not outrank an unmet safety fundamental.
  if (flags.length > 0 && band.label === BANDS[0].label) band = BANDS[1];

  const weakest = dimensions.reduce(
    (lowest, dimension) => (dimension.percent < lowest.percent ? dimension : lowest),
    dimensions[0],
  );

  const rules = [
    `Phone charges outside the bedroom overnight, from day one${band.label === "Ready for a first smartphone" ? "" : " and non-negotiably"}.`,
    "App installs need an adult approval, through Family Link on Android or Screen Time on iPhone.",
    years < SOCIAL_MEDIA_MIN_AGE
      ? `No social accounts yet — the mainstream platforms set ${SOCIAL_MEDIA_MIN_AGE} as their minimum age.`
      : "Social accounts start as teen or supervised accounts, private, with DMs limited to known contacts.",
    "Contacts are added together at the start, and new ones are mentioned.",
    `Sit down together every ${band.reviewWeeks} weeks to look at settings, screen time and anything uncomfortable.`,
    "Agreed in advance: telling you about something bad never costs them the phone.",
  ];

  return {
    score,
    maxScore,
    percent,
    band: band.label,
    tone: band.tone,
    summary: band.summary,
    reviewWeeks: band.reviewWeeks,
    dimensions,
    weakest,
    flags,
    rules,
    device: deviceTier({ bandLabel: band.label, age: years }),
    socialAllowed: years >= SOCIAL_MEDIA_MIN_AGE,
  };
}

/** Every question answered with the same value — used for defaults and testing. */
export function uniformAnswers(value) {
  return QUESTIONS.reduce((acc, question) => ({ ...acc, [question.id]: value }), {});
}
