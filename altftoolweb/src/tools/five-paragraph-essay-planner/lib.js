/**
 * Five Paragraph Essay Planner — pure logic.
 *
 * Splits a word-count target across introduction, body paragraphs and
 * conclusion, converts each budget into a sentence count and a Jane Schaffer
 * chunk count, and turns the drafting speed into a session time plan.
 *
 * No React, no DOM, no clock reads.
 */

/* --------------------------- proportion rules --------------------------- */

/**
 * Standard composition guidance places the introduction at roughly 10-15% of
 * an essay's word count. 12% is the mid-point used here.
 */
export const INTRO_SHARE = 0.12;

/**
 * The conclusion is conventionally the shortest section, about 8-12%.
 * 11% keeps it slightly under the introduction, which is the usual advice.
 */
export const CONCLUSION_SHARE = 0.11;

/**
 * Plain-language and academic style guides both recommend an average sentence
 * length of 15-20 words. 18 is used to convert a word budget into sentences.
 */
export const WORDS_PER_SENTENCE = 18;

/**
 * Jane Schaffer paragraph format: one topic sentence, then repeating "chunks"
 * of 1 concrete detail followed by 2 commentary sentences, then a concluding
 * sentence. So sentences = 2 + 3 x chunks.
 */
export const SCHAFFER_SENTENCES_PER_CHUNK = 3;
export const SCHAFFER_FRAME_SENTENCES = 2; // topic sentence + concluding sentence

/**
 * Widely taught writing-process allocation: about a quarter of the time
 * planning, half drafting, a quarter revising and proofreading.
 */
export const PLANNING_SHARE = 0.25;
export const DRAFTING_SHARE = 0.5;
export const REVISING_SHARE = 0.25;

/* ----------------------------- input bounds ----------------------------- */

export const MIN_TOTAL_WORDS = 150;
export const MAX_TOTAL_WORDS = 5000;
export const MIN_BODY_PARAGRAPHS = 2;
export const MAX_BODY_PARAGRAPHS = 6;
/** Below 5 wpm nothing finishes; above 100 wpm is transcription, not composing. */
export const MIN_DRAFTING_WPM = 5;
export const MAX_DRAFTING_WPM = 100;

/**
 * Reference drafting speeds. Handwriting figures follow the usual exam-hall
 * guidance of roughly 15-20 words per minute of sustained legible writing;
 * typed composing speed is lower than raw typing speed because you are
 * thinking as well as typing.
 */
export const SPEED_PRESETS = [
  { id: "exam-hand", label: "Handwritten, exam conditions", wpm: 18 },
  { id: "relaxed-hand", label: "Handwritten, unhurried", wpm: 14 },
  { id: "typed", label: "Typed, composing as you go", wpm: 25 },
  { id: "typed-outline", label: "Typed from a finished outline", wpm: 35 },
];

const INTRO_MOVES = [
  "Hook: one sentence of context, image or question that earns attention.",
  "Bridge: narrow from the general subject to this specific question.",
  "Thesis: the single arguable claim the whole essay defends.",
  "Roadmap: name the reasons in the order the body will take them.",
];

const CONCLUSION_MOVES = [
  "Restate the thesis in new words — never copy the original sentence.",
  "Synthesise the body reasons into one combined point.",
  "Answer 'so what?': the consequence, application or unresolved question.",
];

/* ------------------------------- helpers -------------------------------- */

const isFiniteNumber = (value) => Number.isFinite(Number(value));

/** Sentences for a word budget, never fewer than 2. */
export function sentencesFor(words) {
  const w = Number(words);
  if (!Number.isFinite(w) || w <= 0) return 0;
  return Math.max(2, Math.round(w / WORDS_PER_SENTENCE));
}

/** Schaffer chunks that fit a sentence count, never fewer than 1. */
export function chunksFor(sentences) {
  const s = Number(sentences);
  if (!Number.isFinite(s)) return 1;
  return Math.max(
    1,
    Math.round((s - SCHAFFER_FRAME_SENTENCES) / SCHAFFER_SENTENCES_PER_CHUNK),
  );
}

/**
 * Split `total` into `parts` whole numbers that sum exactly to `total`,
 * giving the remainder to the earliest parts.
 */
export function splitEvenly(total, parts) {
  const t = Math.max(0, Math.round(Number(total) || 0));
  const n = Math.max(1, Math.round(Number(parts) || 1));
  const base = Math.floor(t / n);
  const remainder = t - base * n;
  return Array.from({ length: n }, (_, index) => base + (index < remainder ? 1 : 0));
}

/** Whole minutes, rounded up, never negative. */
function minutes(value) {
  const v = Number(value);
  if (!Number.isFinite(v) || v <= 0) return 0;
  return Math.ceil(v);
}

/* -------------------------------- planner -------------------------------- */

/**
 * Build the essay plan.
 *
 * @param {object} input
 * @param {number} input.totalWords      Target word count for the finished essay.
 * @param {number} input.bodyParagraphs  How many body paragraphs (3 = classic five-paragraph essay).
 * @param {number} input.draftingWpm     Composing speed in words per minute.
 * @param {string} input.thesis          Optional thesis statement.
 * @param {string[]} input.points        Optional labels for each body paragraph.
 * @returns {object} plan, or { error }.
 */
export function planEssay(input = {}) {
  const { totalWords, bodyParagraphs = 3, draftingWpm = 18, thesis = "", points = [] } = input;

  if (!isFiniteNumber(totalWords)) return { error: "Enter a target word count." };
  const total = Math.round(Number(totalWords));
  if (total < MIN_TOTAL_WORDS) {
    return { error: `A structured essay needs at least ${MIN_TOTAL_WORDS} words — below that, use a single paragraph.` };
  }
  if (total > MAX_TOTAL_WORDS) {
    return { error: `Above ${MAX_TOTAL_WORDS} words the five-paragraph shape stops working; plan it by section instead.` };
  }

  if (!isFiniteNumber(bodyParagraphs)) return { error: "Enter how many body paragraphs you need." };
  const bodies = Math.round(Number(bodyParagraphs));
  if (bodies < MIN_BODY_PARAGRAPHS || bodies > MAX_BODY_PARAGRAPHS) {
    return { error: `Choose between ${MIN_BODY_PARAGRAPHS} and ${MAX_BODY_PARAGRAPHS} body paragraphs.` };
  }

  if (!isFiniteNumber(draftingWpm)) return { error: "Enter your drafting speed in words per minute." };
  const wpm = Number(draftingWpm);
  if (wpm < MIN_DRAFTING_WPM || wpm > MAX_DRAFTING_WPM) {
    return { error: `Drafting speed should be between ${MIN_DRAFTING_WPM} and ${MAX_DRAFTING_WPM} words per minute.` };
  }

  const introWords = Math.round(total * INTRO_SHARE);
  const conclusionWords = Math.round(total * CONCLUSION_SHARE);
  const bodyWords = total - introWords - conclusionWords;

  // bodyWords can never go negative: INTRO_SHARE + CONCLUSION_SHARE is 0.23.
  const perBody = splitEvenly(bodyWords, bodies);

  const bodySections = perBody.map((words, index) => {
    // chunksFor() floors to at least 1 chunk, which structurally needs
    // SCHAFFER_FRAME_SENTENCES + SCHAFFER_SENTENCES_PER_CHUNK sentences. Once
    // chunks is fixed, the displayed sentence count must be recomputed from
    // that same structural formula — otherwise the printed "~N sentences"
    // figure can be lower than what the paragraph's own moves list (topic +
    // evidence + commentary + link) actually requires.
    const chunks = chunksFor(sentencesFor(words));
    const sentences = SCHAFFER_FRAME_SENTENCES + SCHAFFER_SENTENCES_PER_CHUNK * chunks;
    const label = String(points[index] ?? "").trim();
    return {
      id: `body-${index + 1}`,
      kind: "body",
      title: `Body paragraph ${index + 1}`,
      point: label,
      words,
      sentences,
      chunks,
      evidenceNeeded: chunks,
      commentaryNeeded: chunks * 2,
      moves: [
        "Topic sentence: the reason, stated as a claim that supports the thesis.",
        `${chunks} piece${chunks === 1 ? "" : "s"} of concrete evidence — quotation, data, example.`,
        `${chunks * 2} commentary sentence${chunks * 2 === 1 ? "" : "s"} explaining what the evidence proves.`,
        "Link sentence: tie the point back to the thesis and set up the next paragraph.",
      ],
    };
  });

  // The introduction and conclusion each print a fixed move checklist
  // (INTRO_MOVES / CONCLUSION_MOVES), so the sentence estimate can never
  // report fewer sentences than there are required moves.
  const introSentences = Math.max(INTRO_MOVES.length, sentencesFor(introWords));
  const conclusionSentences = Math.max(CONCLUSION_MOVES.length, sentencesFor(conclusionWords));

  const sections = [
    {
      id: "introduction",
      kind: "intro",
      title: "Introduction",
      point: "",
      words: introWords,
      sentences: introSentences,
      chunks: 0,
      moves: INTRO_MOVES,
    },
    ...bodySections,
    {
      id: "conclusion",
      kind: "conclusion",
      title: "Conclusion",
      point: "",
      words: conclusionWords,
      sentences: conclusionSentences,
      chunks: 0,
      moves: CONCLUSION_MOVES,
    },
  ];

  const draftingMinutes = minutes(total / wpm);
  const totalMinutes = minutes(draftingMinutes / DRAFTING_SHARE);
  const planningMinutes = minutes(totalMinutes * PLANNING_SHARE);
  const revisingMinutes = minutes(totalMinutes * REVISING_SHARE);

  sections.forEach((section) => {
    section.percent = Math.round((section.words / total) * 100);
  });

  const totalSentences = sections.reduce((sum, section) => sum + section.sentences, 0);
  const totalEvidence = bodySections.reduce((sum, section) => sum + section.evidenceNeeded, 0);
  const allocated = sections.reduce((sum, section) => sum + section.words, 0);

  return {
    totalWords: total,
    bodyParagraphs: bodies,
    paragraphCount: bodies + 2,
    introWords,
    bodyWords,
    conclusionWords,
    allocated,
    sections,
    totalSentences,
    totalEvidence,
    draftingWpm: wpm,
    planningMinutes,
    draftingMinutes,
    revisingMinutes,
    totalMinutes: planningMinutes + draftingMinutes + revisingMinutes,
    thesis: String(thesis ?? "").trim(),
    isClassicFive: bodies === 3,
  };
}

/** Render the plan as a plain-text outline. */
export function planToText(plan) {
  if (!plan || plan.error) return "";
  const lines = [
    `Essay plan — ${plan.totalWords} words in ${plan.paragraphCount} paragraphs`,
    plan.thesis ? `Thesis: ${plan.thesis}` : "Thesis: (write one arguable sentence here)",
    "",
  ];
  plan.sections.forEach((section) => {
    lines.push(
      `${section.title}${section.point ? ` — ${section.point}` : ""}: ${section.words} words, about ${section.sentences} sentences`,
    );
    section.moves.forEach((move) => lines.push(`  - ${move}`));
    lines.push("");
  });
  lines.push(
    `Time plan at ${plan.draftingWpm} wpm — plan ${plan.planningMinutes} min, draft ${plan.draftingMinutes} min, revise ${plan.revisingMinutes} min (${plan.totalMinutes} min total).`,
  );
  lines.push(`Evidence to gather: ${plan.totalEvidence} concrete details across the body.`);
  return lines.join("\n").trim();
}
