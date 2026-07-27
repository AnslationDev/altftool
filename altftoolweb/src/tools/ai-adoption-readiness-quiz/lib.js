/**
 * AI Adoption Readiness Quiz — a 12-question maturity self-assessment across the
 * four dimensions that organisational AI-readiness frameworks (e.g. Gartner's AI
 * maturity model, Microsoft's Responsible AI Standard structure) consistently use:
 * data, skills, process and governance.
 *
 * Scoring: each question offers four maturity levels worth 0-3 points, so each
 * dimension is worth 9 and the quiz 36. Bands are set on the percentage score.
 */

export const MAX_POINTS_PER_QUESTION = 3;

export const DIMENSIONS = [
  { id: "data", label: "Data readiness" },
  { id: "skills", label: "Skills & people" },
  { id: "process", label: "Process fit" },
  { id: "governance", label: "Governance & risk" },
];

/**
 * Each question has 4 options in ascending maturity order; option index = points (0-3).
 */
export const QUESTIONS = [
  // Data
  {
    id: "data-access",
    dimension: "data",
    text: "Can the data an AI tool would need actually be accessed?",
    options: [
      "Data is scattered, mostly in personal files and email",
      "Key data exists but exporting it needs manual work each time",
      "Core systems have APIs or exports the team can use",
      "Data is centralised, documented and queryable on demand",
    ],
  },
  {
    id: "data-quality",
    dimension: "data",
    text: "How reliable is that data?",
    options: [
      "Nobody checks quality; duplicates and gaps are common",
      "Quality issues are known but fixed only when they cause problems",
      "Key datasets have an owner and periodic clean-ups",
      "Data quality is monitored with defined standards and metrics",
    ],
  },
  {
    id: "data-privacy",
    dimension: "data",
    text: "Do you know which data is sensitive (personal, confidential, regulated)?",
    options: [
      "No classification exists",
      "People use judgement case by case",
      "A written classification exists but is patchily applied",
      "Data is classified, and handling rules are enforced by policy and tooling",
    ],
  },
  // Skills
  {
    id: "skills-usage",
    dimension: "skills",
    text: "How much hands-on AI experience does the team already have?",
    options: [
      "Almost none — a few people have tried chatbots casually",
      "Scattered individual use, no shared practices",
      "Several teams use AI tools regularly and swap techniques",
      "AI use is widespread with internal champions and shared playbooks",
    ],
  },
  {
    id: "skills-training",
    dimension: "skills",
    text: "Is there any structured AI training?",
    options: [
      "None planned",
      "Ad-hoc lunch-and-learns or self-serve videos",
      "A defined training path exists for key roles",
      "Role-based training with time budgeted and completion tracked",
    ],
  },
  {
    id: "skills-owner",
    dimension: "skills",
    text: "Who owns AI adoption?",
    options: [
      "Nobody — it just happens (or doesn't)",
      "An enthusiast pushes it informally",
      "A named person or team owns it part-time",
      "There is an accountable owner with budget and executive sponsorship",
    ],
  },
  // Process
  {
    id: "process-candidates",
    dimension: "process",
    text: "Have you identified which workflows AI should improve?",
    options: [
      "No — the interest is 'AI in general'",
      "A loose wishlist of ideas exists",
      "Candidate workflows are listed with rough effort/impact estimates",
      "Target workflows are prioritised with baseline metrics measured",
    ],
  },
  {
    id: "process-measure",
    dimension: "process",
    text: "Do those workflows have measurable baselines (time, cost, error rate)?",
    options: [
      "Nothing is measured",
      "Anecdotal timings only",
      "Some workflows have real measurements",
      "Baselines are measured and tracked for every candidate workflow",
    ],
  },
  {
    id: "process-change",
    dimension: "process",
    text: "How does the organisation usually handle new tools?",
    options: [
      "Rollouts stall; old habits win",
      "Adoption is slow and depends on individuals",
      "Structured rollouts with training usually stick",
      "There is a proven change process: pilot, measure, train, scale",
    ],
  },
  // Governance
  {
    id: "gov-policy",
    dimension: "governance",
    text: "Is there a written policy on acceptable AI use?",
    options: [
      "No policy at all",
      "Verbal guidance only",
      "A draft or basic do/don't list exists",
      "An approved policy covers data, review duty and approved tools",
    ],
  },
  {
    id: "gov-review",
    dimension: "governance",
    text: "Is AI output reviewed before it reaches customers or decisions?",
    options: [
      "No review expectations exist",
      "Review is assumed but not stated",
      "Human review is required for defined high-risk uses",
      "Review requirements are documented per use case and audited",
    ],
  },
  {
    id: "gov-legal",
    dimension: "governance",
    text: "Have legal/compliance obligations (privacy law, sector rules, IP) been assessed?",
    options: [
      "Not considered",
      "Someone plans to look into it",
      "An initial assessment exists for the main use cases",
      "Obligations are mapped, with counsel signed off and contracts checked",
    ],
  },
];

/** Band thresholds on the percentage score. */
export const BANDS = [
  { min: 80, label: "Ready to scale", advice: "Foundations are strong — move from pilots to a prioritised rollout with measured targets." },
  { min: 60, label: "Ready to pilot", advice: "Run one or two scoped pilots with baselines and review rules; fix the weakest dimension in parallel." },
  { min: 40, label: "Early stage", advice: "Close the biggest gaps first — a small pilot is possible, but only on low-risk workflows." },
  { min: 0, label: "Not ready yet", advice: "Fix foundations before buying tools: identify data, name an owner, and write a basic use policy." },
];

export const MAX_SCORE = QUESTIONS.length * MAX_POINTS_PER_QUESTION;

/**
 * Scores the quiz. `answers` maps question id -> chosen option index (0-3).
 * Returns { total, maxScore, pct, band, dimensionScores, weakest } or { error }.
 */
export function scoreReadiness(answers) {
  if (!answers || typeof answers !== "object") {
    return { error: "Answer the questions to get a score." };
  }

  const unanswered = QUESTIONS.filter((q) => {
    const v = answers[q.id];
    return !Number.isInteger(v) || v < 0 || v > MAX_POINTS_PER_QUESTION;
  });
  if (unanswered.length > 0) {
    return {
      error: `Answer all questions — ${unanswered.length} of ${QUESTIONS.length} still unanswered.`,
      unansweredCount: unanswered.length,
    };
  }

  const dimensionScores = DIMENSIONS.map((d) => {
    const qs = QUESTIONS.filter((q) => q.dimension === d.id);
    const score = qs.reduce((sum, q) => sum + answers[q.id], 0);
    const max = qs.length * MAX_POINTS_PER_QUESTION;
    return { id: d.id, label: d.label, score, max, pct: (score / max) * 100 };
  });

  const total = dimensionScores.reduce((sum, d) => sum + d.score, 0);
  const pct = (total / MAX_SCORE) * 100;
  const band = BANDS.find((b) => pct >= b.min) ?? BANDS[BANDS.length - 1];
  const weakest = dimensionScores.reduce((min, d) => (d.pct < min.pct ? d : min), dimensionScores[0]);

  return { total, maxScore: MAX_SCORE, pct, band, dimensionScores, weakest };
}
