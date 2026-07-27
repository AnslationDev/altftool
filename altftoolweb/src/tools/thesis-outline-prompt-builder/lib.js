/**
 * Thesis Outline Prompt Builder.
 *
 * Allocates a thesis word count across the conventional six-chapter
 * dissertation structure (introduction, literature review, methodology,
 * results, discussion, conclusion), then writes a chapter-outline prompt
 * that embeds the budget, the research questions and an explicit scope
 * statement, so the model plans a thesis rather than a generic essay.
 */

/**
 * Chapter shares for the conventional six-chapter empirical thesis.
 * These proportions follow widely repeated university dissertation
 * guidance (e.g. the "10% introduction / 25% literature review" split
 * used in many UK dissertation handbooks). They are planning rules of
 * thumb, not regulations — every institution's handbook wins.
 * Shares sum to exactly 1.0.
 */
export const CHAPTERS = [
  { id: "introduction", label: "Introduction", share: 0.1 },
  { id: "literature", label: "Literature Review", share: 0.25 },
  { id: "methodology", label: "Methodology", share: 0.2 },
  { id: "results", label: "Results / Findings", share: 0.2 },
  { id: "discussion", label: "Discussion", share: 0.15 },
  { id: "conclusion", label: "Conclusion", share: 0.1 },
];

/**
 * Typical total-length presets. UK norms repeated across university
 * regulations: undergraduate dissertations commonly 8,000–12,000 words,
 * taught master's 15,000–20,000, and doctoral theses capped at 80,000
 * words at many universities (e.g. Oxford and Cambridge humanities
 * regulations). Presets are starting points; the field stays editable.
 */
export const DEGREE_PRESETS = [
  { id: "bachelor", label: "Bachelor's dissertation (~10,000 words)", words: 10000 },
  { id: "master", label: "Master's thesis (~20,000 words)", words: 20000 },
  { id: "phd", label: "Doctoral thesis (~80,000 words)", words: 80000 },
];

export const METHODOLOGIES = [
  {
    id: "quantitative",
    label: "Quantitative",
    directive:
      "State hypotheses, variables, instruments, sampling frame and the statistical tests planned for each research question.",
  },
  {
    id: "qualitative",
    label: "Qualitative",
    directive:
      "State the paradigm, participant selection, data collection method and the analysis approach (e.g. thematic analysis), with a reflexivity note.",
  },
  {
    id: "mixed",
    label: "Mixed methods",
    directive:
      "State the mixed-methods design (convergent, explanatory or exploratory sequential) and where the strands integrate.",
  },
  {
    id: "review",
    label: "Systematic / literature review",
    directive:
      "State the search strategy, databases, inclusion and exclusion criteria, and the synthesis method; replace 'Results' with the review findings.",
  },
  {
    id: "design",
    label: "Design / engineering project",
    directive:
      "State requirements, the design alternatives considered, evaluation criteria and how the artefact will be validated.",
  },
];

/** Sensible planning bounds — outside these an outline stops being meaningful. */
export const LIMITS = {
  totalWords: { min: 3000, max: 150000 },
  researchQuestions: { min: 1, max: 6 },
};

/** About four characters per token for ordinary English prose. */
export const AVERAGE_CHARS_PER_TOKEN = 4;

function toInt(value) {
  const number = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(number) ? Math.round(number) : NaN;
}

/**
 * Largest-remainder allocation: split `total` across `shares` so the
 * parts are whole numbers and sum exactly to `total`.
 */
export function allocateByShares(total, shares) {
  if (!Number.isFinite(total) || total <= 0 || !Array.isArray(shares) || shares.length === 0) {
    return [];
  }
  const raw = shares.map((share) => total * share);
  const floors = raw.map((value) => Math.floor(value));
  let remainder = total - floors.reduce((sum, value) => sum + value, 0);
  const order = raw
    .map((value, index) => ({ index, frac: value - Math.floor(value) }))
    .sort((a, b) => b.frac - a.frac);
  const result = floors.slice();
  for (let i = 0; i < order.length && remainder > 0; i += 1, remainder -= 1) {
    result[order[i].index] += 1;
  }
  return result;
}

/**
 * Allocate the thesis word budget across the six chapters.
 * @returns {{error:string}|object}
 */
export function planThesis({ totalWords, researchQuestionCount } = {}) {
  const total = toInt(totalWords);
  const rqs = toInt(researchQuestionCount);

  if (Number.isNaN(total) || Number.isNaN(rqs)) {
    return { error: "Enter whole numbers for the word count and research questions." };
  }
  if (total < LIMITS.totalWords.min || total > LIMITS.totalWords.max) {
    return {
      error: `Total length must be between ${LIMITS.totalWords.min.toLocaleString("en-IN")} and ${LIMITS.totalWords.max.toLocaleString("en-IN")} words.`,
    };
  }
  if (rqs < LIMITS.researchQuestions.min || rqs > LIMITS.researchQuestions.max) {
    return {
      error: `Use between ${LIMITS.researchQuestions.min} and ${LIMITS.researchQuestions.max} research questions — more than ${LIMITS.researchQuestions.max} cannot each be answered properly in one thesis.`,
    };
  }

  const words = allocateByShares(total, CHAPTERS.map((chapter) => chapter.share));
  const chapterPlan = CHAPTERS.map((chapter, index) => ({
    ...chapter,
    words: words[index],
    sharePercent: Math.round(chapter.share * 100),
  }));

  return {
    total,
    researchQuestions: rqs,
    chapterPlan,
    chapterCount: CHAPTERS.length,
  };
}

export function getMethodology(methodologyId) {
  return METHODOLOGIES.find((method) => method.id === methodologyId) || null;
}

export function measureText(text) {
  if (typeof text !== "string" || text.trim().length === 0) {
    return { characters: 0, words: 0, approxTokens: 0 };
  }
  const characters = text.length;
  const words = text.trim().split(/\s+/).length;
  return {
    characters,
    words,
    approxTokens: Math.max(1, Math.ceil(characters / AVERAGE_CHARS_PER_TOKEN)),
  };
}

/**
 * Write the chapter-outline prompt around the computed budget.
 * @returns {{error:string}|{text:string, plan:object}}
 */
export function buildThesisPrompt({ topic, field, methodologyId, scope, notes, plan } = {}) {
  if (!plan || plan.error) return { error: plan?.error || "Set a valid word budget first." };
  const subject = typeof topic === "string" && topic.trim() ? topic.trim() : "";
  if (!subject) return { error: "Enter your thesis topic or working title." };
  const discipline = typeof field === "string" && field.trim() ? field.trim() : "";
  if (!discipline) return { error: "Enter the field or discipline." };
  const methodology = getMethodology(methodologyId);
  if (!methodology) return { error: "Choose a methodology." };
  const scopeText = typeof scope === "string" ? scope.trim() : "";
  const extra = typeof notes === "string" ? notes.trim() : "";

  const lines = [
    "Draft a chapter-by-chapter thesis outline. Outline only — do not write the thesis.",
    "",
    `WORKING TITLE: ${subject}`,
    `FIELD: ${discipline}`,
    `METHODOLOGY: ${methodology.label} — ${methodology.directive}`,
  ];
  if (scopeText) {
    lines.push(`SCOPE: ${scopeText}`);
  }
  lines.push(
    "",
    `RESEARCH QUESTIONS: propose exactly ${plan.researchQuestions} research question${plan.researchQuestions > 1 ? "s" : ""} for this topic. Each must be answerable with the stated methodology, name its unit of analysis, and be listed before the chapter outline. Number them RQ1 to RQ${plan.researchQuestions}.`,
    "",
    `WORD BUDGET — ${plan.total.toLocaleString("en-US")} words across ${plan.chapterCount} chapters:`,
  );
  for (const chapter of plan.chapterPlan) {
    lines.push(`- ${chapter.label}: ${chapter.words.toLocaleString("en-US")} words (${chapter.sharePercent}%)`);
  }
  lines.push(
    "",
    "FOR EVERY CHAPTER GIVE:",
    "1. The chapter aim in one sentence.",
    "2. Three to six section headings with a one-line note on what each section must establish.",
    "3. Which research question(s) the chapter advances, by RQ number.",
    "4. The word budget from the list above.",
    "",
    "RULES:",
    "- Every research question must be introduced in the Introduction, grounded in the Literature Review, operationalised in the Methodology, answered in Results, and interpreted in the Discussion — flag any RQ that goes missing in a chapter.",
    "- State one explicit delimitation (what the thesis deliberately excludes) in the Introduction outline.",
    "- Do not invent citations, authors or datasets — write [source needed] where the literature must be filled in.",
    "- The Discussion outline must include a limitations section and the Conclusion a future-work section.",
  );
  if (extra) lines.push(`- ${extra}`);

  const text = lines.join("\n");
  return { text, plan, methodology, ...measureText(text) };
}
