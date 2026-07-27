/**
 * Exam stress reflection prompts.
 *
 * The prompt structure follows well-established, low-risk techniques from the
 * self-help literature:
 *  - Expressive writing: naming a worry in words reduces its intensity
 *    ("affect labeling", Lieberman et al. 2007; expressive-writing work of
 *    Pennebaker). Ramirez & Beilock (Science, 2011) found writing about test
 *    worries for ~10 minutes before an exam improved performance for anxious
 *    students.
 *  - Control sorting: separating what is and is not in your control is a core
 *    cognitive-behavioural and Stoic technique.
 *  - Implementation intention: converting a concern into one small, scheduled
 *    next action ("if X, then I will Y" — Gollwitzer 1999).
 *
 * Every prompt set ends with the same three-step close: name it, sort it,
 * choose one next action. Deterministic selection: same stage + seed always
 * returns the same prompts.
 */

/** Suggested journalling time per prompt, minutes (expressive-writing studies use ~10 min total). */
export const MINUTES_PER_PROMPT = 3;

export const CLOSING_STEPS = [
  "Name it: finish the sentence 'What I am actually worried about is…' in one line.",
  "Sort it: mark that worry In my control / Partly / Not in my control.",
  "One next action: write one small step you will take, and when — 'If it is 7 pm today, then I will…'.",
];

export const PROMPT_STAGES = [
  {
    id: "weeks-before",
    label: "Weeks before the exam",
    prompts: [
      "Which single topic makes your chest tighten when it comes up? What, specifically, about it feels hard?",
      "What would 'prepared enough' look like for you — described in behaviour, not marks?",
      "Whose expectations are you carrying into this exam? Which are actually yours?",
      "What did you do in your last exam cycle that helped? What drained you for no gain?",
      "If a close friend had your exact preparation level today, what would you honestly tell them?",
      "What is one thing you are avoiding because starting it feels bad? What is the smallest first piece of it?",
      "Which part of your day consistently goes to plan? What makes that part work?",
      "What will still be true about you if this exam goes badly?",
    ],
  },
  {
    id: "night-before",
    label: "Night before the exam",
    prompts: [
      "Write down every practical thing already handled — admit card, pens, route, timings. What is genuinely left?",
      "What is the worst realistic outcome of tomorrow, and what would you actually do the day after it?",
      "Which three topics are your bankers — the ones you know you can score on?",
      "What does your body need tonight that revision cannot give you?",
      "Finish this sentence honestly: 'Tomorrow I am afraid that…'. Now read it back — how likely is it, really?",
      "What is one thing from your preparation you are quietly proud of?",
      "If tomorrow's paper is harder than expected, what is your in-the-hall plan — in one sentence?",
    ],
  },
  {
    id: "exam-morning",
    label: "Exam morning",
    prompts: [
      "Write your worries down for two minutes, then close the page. What feels lighter having said it?",
      "What is the very first thing you will do when the paper lands in front of you?",
      "Which thought is loudest right now? Is it a fact or a prediction?",
      "Name three things in the room you can see, two you can hear, one you can feel. What changed in your breathing?",
      "What is one sentence you want to say to yourself walking into the hall?",
      "What has gone right this morning so far?",
    ],
  },
  {
    id: "after-exam",
    label: "Right after a paper",
    prompts: [
      "What are you replaying from the paper? Write the loop down once, fully, then stop.",
      "What can you still influence — the next paper, rest, food — and what is now sealed in the answer sheet?",
      "What did you handle better in this paper than in your practice tests?",
      "If the paper went badly: what share was preparation, what share was the paper itself, what share was the day?",
      "What does the next 24 hours need to look like for the next paper to go well?",
      "What would you tell a friend who came out of the hall saying exactly what you are saying now?",
    ],
  },
  {
    id: "result-wait",
    label: "Waiting for results",
    prompts: [
      "What story are you telling yourself about the result? Write the harshest version, then the kindest — which is more evidence-based?",
      "What in your life right now does not depend on this result at all?",
      "What is your concrete plan for each realistic outcome — good, middling, poor? One line each.",
      "How much time per day are you giving to checking, forums and speculation? What is that time costing you?",
      "Who is your first call on result day, whatever the number says?",
      "What did this exam cycle teach you that a marksheet cannot show?",
    ],
  },
];

/**
 * Mulberry32 — small deterministic PRNG so a given seed always yields the
 * same prompt selection (pure: no Date.now(), seed is an argument).
 */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const MIN_PROMPTS = 1;

/**
 * Pick a deterministic set of prompts for a stage.
 *
 * @param {object} input
 * @param {string} input.stageId  One of PROMPT_STAGES ids.
 * @param {number} input.count    How many prompts to draw.
 * @param {number} input.seed     Any integer; same seed -> same selection.
 * @returns {{stage, prompts, suggestedMinutes, closingSteps}|{error:string}}
 */
export function getPromptSet({ stageId, count, seed }) {
  const stage = PROMPT_STAGES.find((s) => s.id === stageId);
  if (!stage) return { error: "Choose a valid exam stage." };

  const n = Number(count);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < MIN_PROMPTS) {
    return { error: "Choose at least one prompt." };
  }
  if (n > stage.prompts.length) {
    return { error: `This stage has ${stage.prompts.length} prompts — choose ${stage.prompts.length} or fewer.` };
  }

  const seedNum = Number(seed);
  if (!Number.isFinite(seedNum)) return { error: "Shuffle seed must be a number." };

  // Fisher-Yates partial shuffle with seeded PRNG, without replacement.
  const rand = mulberry32(Math.floor(Math.abs(seedNum)));
  const pool = [...stage.prompts];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return {
    stage: { id: stage.id, label: stage.label },
    prompts: pool.slice(0, n),
    suggestedMinutes: n * MINUTES_PER_PROMPT,
    closingSteps: CLOSING_STEPS,
  };
}

/**
 * Compile prompts and the user's written answers into a plain-text journal
 * entry (pure string building; skips empty answers).
 */
export function compileJournal({ stageLabel, prompts, answers }) {
  if (!Array.isArray(prompts) || prompts.length === 0) {
    return { error: "Nothing to compile yet." };
  }
  const safeAnswers = Array.isArray(answers) ? answers : [];
  const lines = [`Exam stress reflection — ${stageLabel || "session"}`, ""];
  prompts.forEach((prompt, index) => {
    lines.push(`Q${index + 1}. ${prompt}`);
    const answer = (safeAnswers[index] || "").trim();
    lines.push(answer === "" ? "(not answered)" : answer);
    lines.push("");
  });
  lines.push("Close-out:");
  for (const step of CLOSING_STEPS) lines.push(`- ${step}`);
  return { text: lines.join("\n") };
}
