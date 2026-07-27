/**
 * Socratic Tutor Prompt Builder — assembles a system-style prompt that makes an
 * AI assistant tutor by questioning rather than telling.
 *
 * The questioning moves encoded in the prompt follow Richard Paul's taxonomy of
 * Socratic questions (six categories: clarification, probing assumptions,
 * probing reasons and evidence, viewpoints and perspectives, implications and
 * consequences, and questions about the question). The graded hint ladder
 * mirrors scaffolding practice in tutoring research: escalate help gradually
 * and fade it as the learner progresses.
 */

/** Richard Paul's six categories of Socratic questions. */
export const QUESTION_CATEGORIES = [
  { id: "clarification", label: "Clarification", example: "What do you mean when you say...?" },
  { id: "assumptions", label: "Probing assumptions", example: "What are you assuming here?" },
  { id: "evidence", label: "Reasons and evidence", example: "What makes you think that is true?" },
  { id: "viewpoints", label: "Viewpoints and perspectives", example: "How would this look from the other side?" },
  { id: "implications", label: "Implications and consequences", example: "If that were true, what would follow?" },
  { id: "meta", label: "Questions about the question", example: "Why do you think this question matters?" },
];

/** Hint-ladder bounds: fewer than 2 rungs is not a ladder; beyond 5 the session stalls. */
export const MIN_HINT_LEVELS = 2;
export const MAX_HINT_LEVELS = 5;

/** Fixed rung descriptions, ordered from least to most help. */
const HINT_RUNG_POOL = [
  "Restate or narrow the problem with a focusing question — no new information.",
  "Point to the relevant concept, rule or formula by name, without applying it.",
  "Give a small structural nudge: identify the first step or the part of their work to re-examine.",
  "Work one analogous, simpler example fully, leaving the actual problem to the student.",
  "Reveal one intermediate step of the actual problem, then hand back control.",
];

export const STUDENT_LEVELS = [
  { id: "primary", label: "Primary / middle school" },
  { id: "secondary", label: "High school" },
  { id: "undergraduate", label: "Undergraduate" },
  { id: "adult", label: "Adult self-learner" },
];

/**
 * Pick `count` rungs from the pool, always keeping the least-help first rung
 * and the most-help last rung, and spacing the rest evenly between them.
 */
export function buildHintLadder(count) {
  const n = Number(count);
  if (!Number.isInteger(n) || n < MIN_HINT_LEVELS || n > MAX_HINT_LEVELS) return [];
  if (n === HINT_RUNG_POOL.length) return [...HINT_RUNG_POOL];
  const ladder = [];
  for (let i = 0; i < n; i += 1) {
    // Evenly spread indices from 0 to pool.length-1 inclusive.
    const poolIndex = Math.round((i * (HINT_RUNG_POOL.length - 1)) / (n - 1));
    ladder.push(HINT_RUNG_POOL[poolIndex]);
  }
  return ladder;
}

/**
 * Build the Socratic tutor prompt.
 *
 * @param {object} input
 * @param {string} input.subject         Subject area (e.g. "algebra").
 * @param {string} [input.topic]         Optional specific topic or problem.
 * @param {string} input.studentLevelId  Id from STUDENT_LEVELS.
 * @param {number} input.hintLevels      Rungs in the hint ladder (2-5).
 * @param {boolean} [input.allowReveal]  Permit revealing the answer after the ladder is exhausted.
 * @param {string[]} [input.categoryIds] Paul categories to emphasise (defaults to all).
 * @returns {object} { prompt, ladder, categories } or { error }.
 */
export function buildSocraticPrompt({
  subject,
  topic = "",
  studentLevelId,
  hintLevels,
  allowReveal = true,
  categoryIds,
}) {
  const cleanSubject = typeof subject === "string" ? subject.trim() : "";
  if (!cleanSubject) return { error: "Enter the subject the tutor should cover." };

  const level = STUDENT_LEVELS.find((option) => option.id === studentLevelId);
  if (!level) return { error: "Choose the student's level." };

  const ladder = buildHintLadder(hintLevels);
  if (ladder.length === 0) {
    return {
      error: `Hint ladder must have a whole number of levels between ${MIN_HINT_LEVELS} and ${MAX_HINT_LEVELS}.`,
    };
  }

  const chosenIds = Array.isArray(categoryIds) && categoryIds.length > 0 ? categoryIds : QUESTION_CATEGORIES.map((c) => c.id);
  const categories = QUESTION_CATEGORIES.filter((category) => chosenIds.includes(category.id));
  if (categories.length === 0) return { error: "Keep at least one question category selected." };

  const cleanTopic = typeof topic === "string" ? topic.trim() : "";

  const lines = [];
  lines.push(
    `You are a Socratic tutor for ${cleanSubject}, teaching a ${level.label.toLowerCase()} student. Your job is to lead the student to work out answers themselves — never to hand answers over.`,
  );
  if (cleanTopic) lines.push(`Current topic or problem: ${cleanTopic}.`);
  lines.push("");
  lines.push("Core rules:");
  lines.push("- Ask exactly ONE question per turn, then stop and wait for the student's reply.");
  lines.push("- Never state the final answer or complete a step the student could attempt.");
  lines.push("- When the student answers, first say what is right in their reasoning, then question the weakest link.");
  lines.push("- If the student is correct, ask them to explain why it works or to try a transfer question one notch harder.");
  lines.push("- Keep each turn under 80 words and match vocabulary to the student's level.");
  lines.push("");
  lines.push("Draw your questions from these Socratic moves:");
  for (const category of categories) {
    lines.push(`- ${category.label} — e.g. "${category.example}"`);
  }
  lines.push("");
  lines.push(
    `Hint ladder — when the student is stuck (says "I don't know", gives two wrong attempts in a row, or asks for the answer), escalate ONE rung at a time, in order:`,
  );
  ladder.forEach((rung, index) => {
    lines.push(`${index + 1}. ${rung}`);
  });
  if (allowReveal) {
    lines.push(
      `${ladder.length + 1}. Only after all ${ladder.length} rungs are used: walk through the full solution, then immediately pose a similar problem for the student to try alone.`,
    );
  } else {
    lines.push(
      `Never reveal the full solution, even after rung ${ladder.length} — instead suggest a break or a prerequisite topic to revisit.`,
    );
  }
  lines.push("");
  lines.push("Start by asking the student what they already know or have tried on this topic.");

  return {
    prompt: lines.join("\n"),
    ladder,
    hintLevels: ladder.length,
    categories: categories.map((category) => category.label),
    studentLevel: level.label,
  };
}
