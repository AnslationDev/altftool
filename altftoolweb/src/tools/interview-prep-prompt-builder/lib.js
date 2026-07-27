/**
 * Interview Prep Prompt Builder — slot budgeting + roleplay prompt composition.
 *
 * Pure module: no React, no DOM, no clocks.
 */

/** Almost every interview slot loses time at both ends. */
export const INTRO_MINUTES = 5; // introductions and setting up the format
export const CANDIDATE_QUESTIONS_MINUTES = 5; // the candidate's own questions at the end

/**
 * Share of a question's slot the candidate actually spends talking, across the
 * main answer plus the interviewer's follow-ups. The rest is the question
 * itself, follow-up phrasing and note taking.
 */
export const CANDIDATE_TALK_SHARE = 0.6;

/** Practical bounds for a single interview slot. */
export const MIN_SLOT_MINUTES = 15;
export const MAX_SLOT_MINUTES = 180;

/**
 * Interview rounds with the typical minutes a single question consumes at mid
 * level, including follow-ups.
 */
export const ROUNDS = [
  {
    id: "screen",
    label: "Recruiter / phone screen",
    defaultMinutes: 30,
    minutesPerQuestion: 6,
    rubric: ["Motivation for the move", "Relevance of recent work", "Compensation and timeline alignment", "Communication"],
    style: "Keep it conversational and fast. Do not go deep on any single answer; the goal is coverage, not depth.",
  },
  {
    id: "technical",
    label: "Technical / coding",
    defaultMinutes: 60,
    minutesPerQuestion: 22,
    rubric: ["Problem decomposition", "Correctness", "Complexity and trade-offs", "Testing and edge cases", "Communication while working"],
    style:
      "Give one problem at a time and let the candidate drive. Do not reveal the optimal approach; ask what they would try next. Push on edge cases and complexity only after a working solution exists.",
  },
  {
    id: "system-design",
    label: "System design",
    defaultMinutes: 60,
    minutesPerQuestion: 45,
    rubric: ["Requirements gathering", "High-level architecture", "Data model and storage choice", "Scaling and failure modes", "Trade-off reasoning"],
    style:
      "Start deliberately vague and make the candidate ask for requirements. Introduce one new constraint partway through — a traffic spike, a region outage, a compliance rule — and see how the design adapts.",
  },
  {
    id: "behavioural",
    label: "Behavioural",
    defaultMinutes: 45,
    minutesPerQuestion: 8,
    rubric: ["Situation and task clarity", "Specific personal contribution", "Measurable result", "Reflection and learning", "Collaboration"],
    style:
      "Ask for a specific past example, never a hypothetical. If the answer uses 'we', ask what they personally did. Ask for the outcome and how it was measured.",
  },
  {
    id: "hiring-manager",
    label: "Hiring manager",
    defaultMinutes: 45,
    minutesPerQuestion: 9,
    rubric: ["Fit to the actual scope of the role", "Ownership and judgement", "Working style with the team", "Ambition and trajectory"],
    style:
      "Probe scope and judgement, not trivia. Ask about a decision they got wrong and what changed as a result.",
  },
  {
    id: "takehome",
    label: "Take-home review",
    defaultMinutes: 45,
    minutesPerQuestion: 12,
    rubric: ["Understanding of their own submission", "Trade-offs consciously made", "What they would change with more time", "Response to critique"],
    style:
      "Treat the submission as a starting point. Ask why each significant decision was made and offer one criticism to see how they handle it.",
  },
  {
    id: "values",
    label: "Values / final round",
    defaultMinutes: 30,
    minutesPerQuestion: 7,
    rubric: ["Alignment with how the team works", "Handling of disagreement", "Integrity under pressure", "Questions they ask back"],
    style: "Ask about conflict and disagreement directly. Look for specifics, not slogans.",
  },
];

/**
 * Levels change how long each question takes, because harder questions carry
 * deeper follow-ups.
 */
export const LEVELS = [
  { id: "junior", label: "Entry / junior", multiplier: 0.8, depth: "Ask one follow-up per question. Accept a working answer without demanding the optimal one." },
  { id: "mid", label: "Mid-level", multiplier: 1, depth: "Ask two follow-ups per question, at least one of them about a trade-off." },
  { id: "senior", label: "Senior", multiplier: 1.25, depth: "Ask two or three follow-ups and push into ambiguity, ownership and what they would do differently." },
  { id: "staff", label: "Staff / principal", multiplier: 1.5, depth: "Follow up until you reach the limit of their reasoning. Ask about organisational impact and second-order consequences, not just the technical answer." },
];

export function getRound(roundId) {
  return ROUNDS.find((item) => item.id === roundId) || null;
}
export function getLevel(levelId) {
  return LEVELS.find((item) => item.id === levelId) || null;
}

/**
 * Minutes actually available for questions once the introduction and the
 * candidate's own questions are removed.
 */
export function questionMinutes(slotMinutes) {
  const n = Number(slotMinutes);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, n - INTRO_MINUTES - CANDIDATE_QUESTIONS_MINUTES);
}

/**
 * Plan the slot: how many questions fit, and how long each one runs.
 * @returns {object} { questionCount, ... } or { error }
 */
export function planSlot({ roundId, levelId, slotMinutes } = {}) {
  const round = getRound(roundId);
  if (!round) return { error: "Pick which interview round you are practising." };

  const level = getLevel(levelId);
  if (!level) return { error: "Pick the level you are interviewing at." };

  const minutes = Number(slotMinutes);
  if (!Number.isFinite(minutes)) return { error: "Slot length must be a number." };
  if (minutes < MIN_SLOT_MINUTES || minutes > MAX_SLOT_MINUTES) {
    return { error: `Slot length must be between ${MIN_SLOT_MINUTES} and ${MAX_SLOT_MINUTES} minutes.` };
  }

  const available = questionMinutes(minutes);
  const perQuestion = round.minutesPerQuestion * level.multiplier;
  if (perQuestion <= 0) return { error: "This round has no question budget configured." };

  const questionCount = Math.floor(available / perQuestion);
  if (questionCount < 1) {
    return {
      error: `A ${Math.round(minutes)}-minute slot leaves ${available} minutes for questions, and one ${round.label.toLowerCase()} question at ${level.label.toLowerCase()} needs about ${Math.round(perQuestion)}. Make the slot longer or pick a shorter round.`,
    };
  }

  return {
    questionCount,
    availableMinutes: available,
    perQuestionMinutes: perQuestion,
    answerSeconds: Math.round(perQuestion * 60 * CANDIDATE_TALK_SHARE),
    slotMinutes: Math.round(minutes),
    roundLabel: round.label,
    levelLabel: level.label,
  };
}

/** One trimmed item per non-empty line. */
export function parseLines(text, limit = 15) {
  if (typeof text !== "string") return [];
  return text
    .split(/\r?\n/)
    .map((line) => line.trim().replace(/^[-*•]\s*/, ""))
    .filter(Boolean)
    .slice(0, limit);
}

/**
 * Compose the mock-interview prompt.
 * @returns {object} { prompt, plan, ... } or { error }
 */
export function buildInterviewPrompt({
  roleTitle = "",
  company = "",
  roundId,
  levelId,
  slotMinutes = 45,
  focusAreas = "",
  weakSpots = "",
  jobDescription = "",
} = {}) {
  const role = String(roleTitle || "").trim();
  if (!role) return { error: "Enter the role you are interviewing for." };

  const plan = planSlot({ roundId, levelId, slotMinutes });
  if (plan.error) return { error: plan.error };

  const round = getRound(roundId);
  const level = getLevel(levelId);
  const companyText = String(company || "").trim();
  const focusList = parseLines(focusAreas);
  const weakList = parseLines(weakSpots);
  const jd = String(jobDescription || "").trim();

  const sections = [
    {
      title: "Role",
      body: `You are running a ${round.label.toLowerCase()} interview for a ${role}${companyText ? ` at ${companyText}` : ""}. You are the interviewer, not a coach. Stay in character until I type END.`,
    },
    {
      title: "Format",
      body: [
        `The slot is ${plan.slotMinutes} minutes: ${INTRO_MINUTES} minutes of introduction, ${plan.availableMinutes} minutes of questions and ${CANDIDATE_QUESTIONS_MINUTES} minutes for my questions at the end.`,
        `Ask exactly ${plan.questionCount} main question${plan.questionCount === 1 ? "" : "s"}, about ${Math.round(plan.perQuestionMinutes)} minutes each including follow-ups. I should be speaking for roughly ${plan.answerSeconds} seconds per question in total.`,
        "Ask one question at a time and wait for my answer before continuing. Never answer for me, never write my side of the conversation, and do not move on because my answer was short — ask a follow-up instead.",
        level.depth,
        round.style,
      ].join("\n"),
    },
    {
      title: "Context",
      body: [
        `Level: ${level.label}.`,
        focusList.length > 0 ? `Focus these questions on: ${focusList.join("; ")}.` : null,
        weakList.length > 0
          ? `I know I am weak on: ${weakList.join("; ")}. Cover at least one of these, but do not announce that you are doing it.`
          : null,
        jd ? `Job description I am working from:\n${jd}` : null,
      ]
        .filter(Boolean)
        .join("\n"),
    },
    {
      title: "Scoring",
      body: [
        "When I type END, stop the interview and score me out of 4 on each of these, where 1 is 'would not pass this round' and 4 is 'clearly above the bar':",
        ...round.rubric.map((item, index) => `${index + 1}. ${item}`),
        "For each dimension quote the specific thing I said that earned the score. Then give the single change that would move my weakest score up by one point.",
      ].join("\n"),
    },
    {
      title: "Rules",
      body: [
        "Do not invent facts about the company, its stack, its salary bands or its interview process. If you need such a detail, say [ASSUMPTION] and continue.",
        "Do not flatter. A weak answer gets a follow-up, not encouragement.",
        "Keep each of your turns under 120 words.",
      ].join("\n"),
    },
  ];

  const prompt = sections.map((section) => `${section.title}:\n${section.body}`).join("\n\n");

  return {
    prompt,
    sections,
    ...plan,
    rubric: round.rubric,
    focusCount: focusList.length,
    weakCount: weakList.length,
    promptChars: prompt.length,
  };
}
