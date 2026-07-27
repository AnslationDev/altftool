/**
 * IELTS Speaking practice timer — pure timing logic.
 *
 * Test format per ielts.org (Speaking test, 11–14 minutes total):
 *  - Part 1 (Introduction and interview): 4–5 minutes of questions on familiar
 *    topics. Timed here at the 5-minute ceiling.
 *  - Part 2 (Long turn / cue card): exactly 1 minute of preparation, then the
 *    candidate speaks for 1–2 minutes; the examiner stops them at 2 minutes.
 *    Timed here as 60 s preparation + 120 s talk.
 *  - Part 3 (Discussion): 4–5 minutes of deeper questions linked to the Part 2
 *    topic. Timed here at the 5-minute ceiling.
 */

/** Seconds in each timed phase, from the IELTS Speaking format above. */
export const PART1_SECONDS = 300; // 5-minute ceiling of the 4–5 min interview
export const PART2_PREP_SECONDS = 60; // exactly 1 minute of preparation
export const PART2_TALK_SECONDS = 120; // examiner stops the long turn at 2 minutes
export const PART3_SECONDS = 300; // 5-minute ceiling of the 4–5 min discussion

export const PARTS = [
  {
    id: "part1",
    label: "Part 1 — Introduction & interview (4–5 min)",
    phases: [{ id: "interview", label: "Answer the interview questions", seconds: PART1_SECONDS }],
  },
  {
    id: "part2",
    label: "Part 2 — Cue card long turn (1 min prep + 2 min talk)",
    phases: [
      { id: "prep", label: "Preparation — make notes", seconds: PART2_PREP_SECONDS },
      { id: "talk", label: "Speak until stopped", seconds: PART2_TALK_SECONDS },
    ],
  },
  {
    id: "part3",
    label: "Part 3 — Two-way discussion (4–5 min)",
    phases: [{ id: "discussion", label: "Discuss the abstract questions", seconds: PART3_SECONDS }],
  },
];

/** Practice cue cards in the standard IELTS Part 2 format (topic + 4 prompts). */
export const CUE_CARDS = [
  {
    topic: "Describe a person who has influenced you.",
    prompts: ["who this person is", "how you know them", "what they have done", "and explain why they influenced you"],
  },
  {
    topic: "Describe a place you like to visit.",
    prompts: ["where it is", "how often you go there", "what you do there", "and explain why you like it"],
  },
  {
    topic: "Describe a skill you would like to learn.",
    prompts: ["what the skill is", "how you would learn it", "how long it would take", "and explain why you want to learn it"],
  },
  {
    topic: "Describe a memorable journey you have made.",
    prompts: ["where you went", "how you travelled", "who you were with", "and explain why it was memorable"],
  },
  {
    topic: "Describe a book that made an impression on you.",
    prompts: ["what the book is", "when you read it", "what it is about", "and explain why it impressed you"],
  },
  {
    topic: "Describe an important decision you have made.",
    prompts: ["what the decision was", "when you made it", "who helped you decide", "and explain why it was important"],
  },
  {
    topic: "Describe a piece of technology you find useful.",
    prompts: ["what it is", "how you use it", "how often you use it", "and explain why it is useful"],
  },
  {
    topic: "Describe a tradition or festival in your country.",
    prompts: ["what it is", "when it takes place", "what people do", "and explain why it matters to people"],
  },
];

/** Sample Part 1 and Part 3 question sets for unprompted practice. */
export const PART1_QUESTIONS = [
  "Do you work or are you a student?",
  "What do you enjoy most about your work or studies?",
  "How do you usually spend your weekends?",
  "Do you prefer mornings or evenings? Why?",
];
export const PART3_QUESTIONS = [
  "How do you think this topic will change in the next twenty years?",
  "Do older and younger people see this differently in your country?",
  "What role should the government play in this area?",
  "Are there any disadvantages people often overlook?",
];

/** Total timed seconds for a part. */
export function totalSeconds(partId) {
  const part = PARTS.find((p) => p.id === partId);
  if (!part) return 0;
  return part.phases.reduce((sum, phase) => sum + phase.seconds, 0);
}

/**
 * Locate the current phase for an elapsed time within a part.
 * Phase boundaries are half-open: prep is [0, 60), talk is [60, 180).
 *
 * @returns {object} { phase, phaseIndex, elapsedInPhase, remainingInPhase,
 *                     totalRemaining, finished } or { error }.
 */
export function phaseAt({ partId, elapsedSeconds }) {
  const part = PARTS.find((p) => p.id === partId);
  if (!part) return { error: "Choose a speaking part to time." };
  const elapsed = Number(elapsedSeconds);
  if (!Number.isFinite(elapsed) || elapsed < 0) {
    return { error: "Elapsed time must be zero or more seconds." };
  }

  const total = totalSeconds(partId);
  if (elapsed >= total) {
    const last = part.phases[part.phases.length - 1];
    return {
      phase: last,
      phaseIndex: part.phases.length - 1,
      elapsedInPhase: last.seconds,
      remainingInPhase: 0,
      totalRemaining: 0,
      finished: true,
    };
  }

  let offset = 0;
  for (let i = 0; i < part.phases.length; i += 1) {
    const phase = part.phases[i];
    if (elapsed < offset + phase.seconds) {
      const elapsedInPhase = elapsed - offset;
      return {
        phase,
        phaseIndex: i,
        elapsedInPhase,
        remainingInPhase: phase.seconds - elapsedInPhase,
        totalRemaining: total - elapsed,
        finished: false,
      };
    }
    offset += phase.seconds;
  }
  // Unreachable: elapsed < total guarantees a phase above.
  return { error: "Could not locate the current phase." };
}

/** Deterministically pick a cue card from a non-negative integer seed. */
export function pickCueCard(seed) {
  const n = Number(seed);
  if (!Number.isInteger(n) || n < 0) return { error: "Seed must be a non-negative whole number." };
  return { card: CUE_CARDS[n % CUE_CARDS.length], index: n % CUE_CARDS.length };
}

/** Format whole seconds as m:ss. Negative-safe. */
export function formatClock(seconds) {
  const s = Math.max(0, Math.round(Number(seconds) || 0));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}
