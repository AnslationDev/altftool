/**
 * JEE doubt prompt builder.
 *
 * Frames a physics, chemistry or maths doubt as a step-by-step teaching prompt,
 * and computes the exam arithmetic a JEE aspirant plans around: the time one
 * question earns and the expected value of guessing under negative marking.
 *
 * Exam facts encoded (JEE Main pattern, NTA):
 *  - 75 questions (25 per subject) in 180 minutes for 300 marks.
 *  - Marking scheme: +4 for a correct answer, -1 for a wrong one — applied to
 *    both MCQs and numerical-value questions since the 2023-24 cycle.
 *  - MCQs have 4 options with exactly one correct.
 *
 * Pure module — no React, no DOM, no clock.
 */

/** JEE Main: 75 questions in 180 minutes -> 2.4 minutes per question. */
export const JEE_MAIN_QUESTIONS = 75;
export const JEE_MAIN_MINUTES = 180;
export const MINUTES_PER_QUESTION = JEE_MAIN_MINUTES / JEE_MAIN_QUESTIONS;

/** NTA marking scheme: +4 correct, -1 incorrect, 0 unattempted. */
export const MARKS_CORRECT = 4;
export const MARKS_WRONG = -1;

/** JEE Main MCQs carry 4 options with a single correct answer. */
export const MCQ_OPTIONS = 4;

export const SUBJECTS = [
  {
    id: "physics",
    label: "Physics",
    steps: [
      "Restate the given quantities with SI units and what must be found.",
      "Draw or describe the setup (free-body diagram, circuit, ray diagram) before any equation.",
      "Name the principle or law being applied and why it applies here.",
      "Do the algebra symbol-first; substitute numbers only at the end.",
      "Check the final answer by dimensions and by a limiting case.",
    ],
  },
  {
    id: "chemistry",
    label: "Chemistry",
    steps: [
      "Classify the problem: physical (calculation), organic (mechanism) or inorganic (trend/fact).",
      "Write every reaction or equilibrium involved, balanced, with states.",
      "For organic, show electron movement with the named mechanism; for physical, define each term before using it.",
      "Point out the standard exception or trap in this topic (NCERT exceptions included).",
      "Verify: units and significant figures for numericals, charge and mass balance for equations.",
    ],
  },
  {
    id: "maths",
    label: "Mathematics",
    steps: [
      "State the domain and any constraints before manipulating anything.",
      "Name the technique being used and why it fits (substitution, symmetry, standard identity).",
      "Show every algebraic step — no 'clearly' or 'it can be shown'.",
      "Check the answer: substitute back, test an edge value, or verify against a quick sketch.",
      "Give the fastest exam-hall alternative (elimination, option testing) if one exists.",
    ],
  },
];

export const EXAM_LEVELS = [
  { id: "jee-main", label: "JEE Main", phrase: "JEE Main level (NCERT depth plus standard applications)" },
  { id: "jee-advanced", label: "JEE Advanced", phrase: "JEE Advanced level (multi-concept, longer chains of reasoning)" },
  { id: "class11", label: "Class 11 foundation", phrase: "Class 11 foundation level (build the concept from first principles)" },
  { id: "class12", label: "Class 12 boards + JEE", phrase: "Class 12 level (board rigour with JEE-style application)" },
];

export const CONFUSION_TYPES = [
  { id: "concept", label: "The concept itself", ask: "Explain the underlying concept from scratch before touching the problem, including what it is NOT." },
  { id: "method", label: "Which method to use", ask: "Focus on how to recognise which method this problem wants — list the cues in the question that signal it." },
  { id: "stuck", label: "Stuck mid-solution", ask: "Identify exactly where my attempt goes wrong and continue correctly from that precise step." },
  { id: "answer-mismatch", label: "My answer does not match", ask: "Find the discrepancy between my answer and the expected one — check my method, then the given answer's validity." },
  { id: "speed", label: "Too slow at this type", ask: "Show the fastest exam-hall route and what part of the standard method can be safely skipped or precomputed." },
];

const clean = (value) => String(value ?? "").replace(/\s+/g, " ").trim();
const byId = (list, id) => list.find((item) => item.id === id) || null;
const round2 = (value) => Math.round(value * 100) / 100;

/**
 * Expected marks from guessing one 4-option MCQ under +4/-1 marking after
 * eliminating `eliminated` options:
 *   remaining = 4 - eliminated
 *   EV = 4 x (1/remaining) + (-1) x ((remaining-1)/remaining)
 * Blind guess: (4 - 3)/4 = +0.25. One eliminated: +2/3. Two eliminated: +1.5.
 */
export function guessExpectedValue(eliminated) {
  const k = Number(eliminated);
  if (!Number.isFinite(k) || k < 0 || k > MCQ_OPTIONS - 1 || !Number.isInteger(k)) {
    return { error: `Options eliminated must be a whole number from 0 to ${MCQ_OPTIONS - 1}.` };
  }
  const remaining = MCQ_OPTIONS - k;
  const ev = round2(MARKS_CORRECT / remaining + (MARKS_WRONG * (remaining - 1)) / remaining);
  return { eliminated: k, remaining, expectedMarks: ev, worthGuessing: ev > 0 };
}

/** Guessing table for 0..3 eliminated options. */
export function guessTable() {
  return [0, 1, 2, 3].map((k) => guessExpectedValue(k));
}

/**
 * Compose the doubt prompt plus exam stats.
 */
export function buildJeeDoubtPrompt({
  subjectId = "physics",
  topic = "",
  doubt = "",
  attempt = "",
  levelId = "jee-main",
  confusionId = "concept",
} = {}) {
  const subject = byId(SUBJECTS, subjectId) || SUBJECTS[0];
  const level = byId(EXAM_LEVELS, levelId) || EXAM_LEVELS[0];
  const confusion = byId(CONFUSION_TYPES, confusionId) || CONFUSION_TYPES[0];

  const topicText = clean(topic);
  const doubtText = clean(doubt);
  const attemptText = clean(attempt);

  if (!doubtText) return { error: "Paste the question or describe the doubt — everything else wraps around it." };
  if (doubtText.length < 15) return { error: "That doubt looks truncated. Paste the full question or a complete description." };
  if (doubtText.length > 2000) return { error: "Keep the doubt under 2,000 characters — split multi-part problems into separate prompts." };
  if (confusion.id === "answer-mismatch" && !attemptText) {
    return { error: "For an answer mismatch, paste your attempt or your answer so the discrepancy can be located." };
  }

  const stepList = subject.steps.map((step, index) => `${index + 1}. ${step}`).join("\n");

  const lines = [
    `You are a patient ${subject.label} teacher for Indian engineering-entrance preparation. Teach at ${level.phrase}.`,
    "",
    topicText ? `TOPIC: ${topicText}` : "",
    `MY DOUBT: ${doubtText}`,
    attemptText ? `MY ATTEMPT SO FAR: ${attemptText}` : "",
    "",
    `WHAT I NEED: ${confusion.ask}`,
    "",
    "HOW TO EXPLAIN:",
    stepList,
    "",
    "RULES:",
    "- One step at a time; never merge two steps into one line.",
    "- Use only NCERT/JEE-standard notation and name every formula before using it.",
    "- After the solution, state the single most common mistake students make on this exact type.",
    "- End with one similar practice problem (no solution) so I can test myself.",
    "- If the question itself is ambiguous or missing data, say so explicitly instead of assuming silently.",
  ].filter((line) => line !== "");

  const prompt = lines.join("\n");

  return {
    prompt,
    subject: { id: subject.id, label: subject.label },
    stats: {
      minutesPerQuestion: round2(MINUTES_PER_QUESTION),
      marksCorrect: MARKS_CORRECT,
      marksWrong: MARKS_WRONG,
      guessTable: guessTable(),
    },
  };
}
