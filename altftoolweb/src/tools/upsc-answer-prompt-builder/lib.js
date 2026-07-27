/**
 * UPSC Mains answer prompt builder.
 *
 * Builds a practice prompt for AI-assisted UPSC Civil Services Mains answer
 * writing using the exam's real parameters, and computes the numbers a candidate
 * actually trains against: the time a question earns inside the paper, the
 * writing speed the word limit demands, and the intro/body/conclusion word split.
 *
 * Exam facts encoded below (UPSC CSE Mains pattern, current since 2013):
 *  - Each GS paper (GS I-IV) carries 250 marks answered in 3 hours (180 min),
 *    giving 180/250 = 0.72 minutes per mark.
 *  - GS questions are 10 marks with a 150-word limit or 15 marks with a
 *    250-word limit (stated on the question paper itself).
 *  - The Essay paper asks two essays of 1,000-1,200 words, 125 marks each,
 *    in 3 hours — the same 0.72 min/mark.
 *
 * Pure module — no React, no DOM, no clock.
 */

/** UPSC Mains: 250 marks per paper, 180 minutes -> 0.72 minutes earned per mark. */
export const TOTAL_PAPER_MARKS = 250;
export const TOTAL_PAPER_MINUTES = 180;
export const MIN_PER_MARK = TOTAL_PAPER_MINUTES / TOTAL_PAPER_MARKS;

/**
 * Conventional answer architecture taught across UPSC test series:
 * roughly 15% introduction, 70% body, 15% conclusion.
 */
export const INTRO_PCT = 0.15;
export const CONCLUSION_PCT = 0.15;

export const ANSWER_FORMATS = [
  {
    id: "gs-10",
    label: "GS 10-marker (150 words)",
    marks: 10, // 10-mark GS question
    wordLimit: 150, // word limit printed on the Mains paper for 10-markers
  },
  {
    id: "gs-15",
    label: "GS 15-marker (250 words)",
    marks: 15, // 15-mark GS question
    wordLimit: 250, // word limit printed on the Mains paper for 15-markers
  },
  {
    id: "essay",
    label: "Essay (1,000-1,200 words)",
    marks: 125, // each essay carries 125 marks
    wordLimit: 1100, // midpoint of the 1,000-1,200 word band
  },
];

export const PAPERS = [
  { id: "gs1", label: "GS Paper I", scope: "Indian heritage and culture, history, geography of the world and society" },
  { id: "gs2", label: "GS Paper II", scope: "governance, Constitution, polity, social justice and international relations" },
  { id: "gs3", label: "GS Paper III", scope: "economy, technology, environment, disaster management and internal security" },
  { id: "gs4", label: "GS Paper IV", scope: "ethics, integrity and aptitude, with case-study application" },
  { id: "essay", label: "Essay Paper", scope: "essay writing judged on structure, coherence and breadth of ideas" },
];

/**
 * Directive words as UPSC uses them; each demands a different answer shape,
 * so the AI must be told which one governs.
 */
export const DIRECTIVES = [
  { id: "discuss", label: "Discuss", meaning: "present the important aspects and both sides of the issue, then reason to a view" },
  { id: "critically-examine", label: "Critically examine", meaning: "probe the merits and faults in depth and deliver a fair judgement at the end" },
  { id: "analyse", label: "Analyse", meaning: "break the issue into components and show how they relate and interact" },
  { id: "evaluate", label: "Evaluate", meaning: "weigh the worth or effectiveness against clear criteria before concluding" },
  { id: "comment", label: "Comment", meaning: "take a considered position on the statement and defend it with evidence" },
  { id: "elucidate", label: "Elucidate", meaning: "make the statement clear with explanation, examples and illustration" },
  { id: "examine", label: "Examine", meaning: "inquire into the issue closely, establishing facts before assessing them" },
];

const clean = (value) => String(value ?? "").replace(/\s+/g, " ").trim();
const byId = (list, id) => list.find((item) => item.id === id) || null;
const round1 = (value) => Math.round(value * 10) / 10;

/**
 * Time, speed and word-split budget for one answer.
 * timeMin = marks x 0.72 (the share of the 180-minute paper this question earns).
 * wpm     = wordLimit / timeMin — the sustained writing speed the limit demands.
 * Split   = 15% intro, 15% conclusion, remainder body.
 */
export function computeAnswerBudget({ marks, wordLimit } = {}) {
  const m = Number(marks);
  const words = Number(wordLimit);

  if (!Number.isFinite(m) || m <= 0) return { error: "Marks must be a positive number." };
  if (!Number.isFinite(words) || words <= 0) return { error: "Word limit must be a positive number." };
  if (words > 5000) return { error: "No UPSC answer runs past 5,000 words — check the word limit." };

  const timeMin = round1(m * MIN_PER_MARK);
  const wpm = round1(words / timeMin);
  const introWords = Math.round(words * INTRO_PCT);
  const conclusionWords = Math.round(words * CONCLUSION_PCT);
  const bodyWords = words - introWords - conclusionWords;

  return { marks: m, wordLimit: words, timeMin, wpm, introWords, bodyWords, conclusionWords };
}

/**
 * Compose the practice prompt plus the computed budget.
 */
export function buildUpscPrompt({
  question = "",
  paperId = "gs2",
  formatId = "gs-10",
  directiveId = "discuss",
  includeCurrentAffairs = true,
  askEvaluation = true,
} = {}) {
  const q = clean(question);
  if (!q) return { error: "Paste the question — the directive, paper and word limit all wrap around it." };
  if (q.length < 15) return { error: "That question looks truncated. Paste the full question text." };
  if (q.length > 600) return { error: "Keep the question under 600 characters — Mains questions are short." };

  const paper = byId(PAPERS, paperId) || PAPERS[1];
  const format = byId(ANSWER_FORMATS, formatId) || ANSWER_FORMATS[0];
  const directive = byId(DIRECTIVES, directiveId) || DIRECTIVES[0];

  const budget = computeAnswerBudget({ marks: format.marks, wordLimit: format.wordLimit });
  if (budget.error) return { error: budget.error };

  const isEssay = format.id === "essay";

  const lines = [
    `You are a UPSC Civil Services Mains mentor. Write a model answer for this ${paper.label} question (${paper.scope}).`,
    "",
    `QUESTION: ${q}`,
    "",
    `DIRECTIVE: The question says "${directive.label}" — that means: ${directive.meaning}. The whole answer must obey this directive.`,
    "",
    "CONSTRAINTS:",
    `- Hard word limit: ${format.wordLimit} words${isEssay ? " (the paper allows 1,000-1,200)" : ""}. State the final word count at the end.`,
    `- Structure: introduction of about ${budget.introWords} words that defines the core issue, a body of about ${budget.bodyWords} words in clear headed points, and a conclusion of about ${budget.conclusionWords} words that is forward-looking.`,
    "- Body points must carry substance: constitutional articles, committee reports, Supreme Court cases, schemes or data where relevant — named specifically, never invented. If unsure of a fact, omit it rather than guess.",
    isEssay
      ? "- Maintain an essay's flow: no bullet points, thesis sustained across sections, transitions between ideas."
      : "- Use the point format an examiner can scan in under a minute: short headed points, one idea each, underline-worthy keywords.",
    includeCurrentAffairs
      ? "- Weave in one or two recent, verifiable developments relevant to the topic and say why each matters to the answer."
      : "- Stick to the static syllabus; do not add current-affairs examples.",
    `- This answer earns ${budget.timeMin} minutes of exam time (${format.marks} marks x 0.72 min/mark). Do not write more than the limit — extra words earn nothing and steal time from other answers.`,
  ];

  if (askEvaluation) {
    lines.push(
      "",
      "AFTER THE ANSWER, EVALUATE IT:",
      "- Score it out of " + format.marks + " as a strict examiner would, with one line of justification.",
      "- List the two strongest elements and the two weakest.",
      "- Name one enrichment (report, judgment, data point or thinker) that would lift the score, and where to insert it."
    );
  }

  const prompt = lines.join("\n");

  return {
    prompt,
    budget,
    paper: { id: paper.id, label: paper.label },
    format: { id: format.id, label: format.label, marks: format.marks, wordLimit: format.wordLimit },
    directive: { id: directive.id, label: directive.label, meaning: directive.meaning },
  };
}
