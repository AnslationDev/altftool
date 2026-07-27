/**
 * AI Plagiarism Risk Worksheet.
 *
 * A structured self-assessment of how derivative an AI-assisted draft is.
 * The six factors mirror what academic-integrity offices actually examine in
 * AI-related misconduct cases (verbatim retention, paraphrase depth, source
 * citation, fabricated references, disclosure, and original contribution) —
 * the same dimensions integrity guidance from bodies like the International
 * Center for Academic Integrity and university misconduct procedures assess.
 *
 * Scoring model: each factor contributes weighted points to a 0-100 risk
 * score. Weights reflect how decisive each factor is in real cases:
 * verbatim unattributed text and fabricated citations are treated as the
 * gravest issues, disclosure and originality as strong mitigators.
 */

/**
 * Each factor: question, options ordered safest → riskiest, each option
 * carrying a 0..1 severity multiplied by the factor weight.
 * Weights sum to 100 so the total risk score is 0-100.
 */
export const FACTORS = [
  {
    id: "verbatim",
    // Weight 30: near-verbatim unattributed AI text is the core of most
    // AI-plagiarism findings — the single strongest predictor of a breach.
    weight: 30,
    question: "How much of the final text is AI-drafted and kept close to verbatim (not rewritten in your own words)?",
    options: [
      { label: "None — all AI text was rewritten or is quoted and cited", severity: 0 },
      { label: "A little (under ~10% of the draft)", severity: 0.35 },
      { label: "A meaningful share (~10-30%)", severity: 0.7 },
      { label: "A large share (over ~30%)", severity: 1 },
    ],
    advice: "Rewrite retained AI passages in your own words and structure, or quote and attribute them explicitly if your policy permits verbatim use.",
  },
  {
    id: "paraphrase",
    // Weight 15: shallow word-swap paraphrase is still treated as derivative;
    // real paraphrase changes structure and synthesises.
    weight: 15,
    question: "Where you did paraphrase AI output, how deep was the rewrite?",
    options: [
      { label: "Full rewrite — new structure, my own argument and examples", severity: 0 },
      { label: "Restructured sentences but kept the AI's organisation", severity: 0.5 },
      { label: "Mostly word swaps / synonym changes", severity: 1 },
    ],
    advice: "Word-swap paraphrase is still derivative. Close the AI output, write the passage from your own understanding, then compare.",
  },
  {
    id: "sources",
    // Weight 15: ideas and facts taken from AI answers still need citation to
    // a real underlying source.
    weight: 15,
    question: "Are the facts and ideas the AI supplied backed by citations to real sources you located?",
    options: [
      { label: "Yes — every borrowed fact or idea cites a real source I checked", severity: 0 },
      { label: "Partly — some claims still lack a real source", severity: 0.5 },
      { label: "No — AI-supplied claims stand uncited", severity: 1 },
    ],
    advice: "Trace every AI-supplied fact or idea to a real, checkable source and cite it — an AI answer is not a citable source for facts.",
  },
  {
    id: "citations",
    // Weight 20: fabricated references are treated as fabrication — often a
    // separate and more serious head of misconduct than plagiarism itself.
    weight: 20,
    question: "Did you verify that every reference in the draft actually exists (AI tools fabricate plausible citations)?",
    options: [
      { label: "Yes — I opened and checked every reference", severity: 0 },
      { label: "Spot-checked some of them", severity: 0.5 },
      { label: "No — references are unverified", severity: 1 },
    ],
    advice: "Open every reference and confirm it exists and says what the draft claims. Fabricated citations are treated as fabrication, not a formatting slip.",
  },
  {
    id: "disclosure",
    // Weight 10: failure to declare permitted AI use converts acceptable
    // assistance into a breach under most policies.
    weight: 10,
    question: "Have you disclosed the AI assistance as your policy or venue requires?",
    options: [
      { label: "Yes — declared per the policy (or the policy requires none)", severity: 0 },
      { label: "Not yet, but I will before submitting", severity: 0.4 },
      { label: "No, and I do not plan to", severity: 1 },
    ],
    advice: "Add the required declaration. Undisclosed AI use is a breach on its own under most policies, even where the assistance itself was permitted.",
  },
  {
    id: "originality",
    // Weight 10: a clear original contribution (argument, analysis, data)
    // is the strongest positive signal that the work is yours.
    weight: 10,
    question: "How much of the argument, analysis or interpretation is genuinely yours?",
    options: [
      { label: "The core argument and analysis are mine; AI helped at the edges", severity: 0 },
      { label: "Mixed — some sections are mine, some follow the AI's line", severity: 0.5 },
      { label: "The AI's structure and argument carry the piece", severity: 1 },
    ],
    advice: "Add your own analysis: take a position, weigh evidence, connect to course material — the parts a model cannot know you think.",
  },
];

/** Risk bands. Thresholds chosen so that any single gravest factor at full
 * severity (30 points) cannot stay "Low", and combined major failures reach High. */
export const LOW_MAX = 20; // 0-20: low risk
export const MODERATE_MAX = 50; // 21-50: moderate; 51-100: high

export const BANDS = [
  { max: LOW_MAX, label: "Low risk", verdict: "The draft looks substantially your own. Fix any flagged items and keep your usage log." },
  { max: MODERATE_MAX, label: "Moderate risk", verdict: "Parts of the draft are derivative. Work through the recommendations before submitting." },
  { max: 100, label: "High risk", verdict: "As it stands the draft could be found derivative or in breach. Rewrite and re-source before submitting." },
];

/**
 * Assess the draft.
 * @param {Record<string, number>} selections Map of factor id -> chosen option index.
 * @returns {{score:number, band:string, verdict:string, breakdown:Array, recommendations:string[]}|{error:string}}
 */
export function assessRisk(selections) {
  if (!selections || typeof selections !== "object") {
    return { error: "Answer the worksheet questions first." };
  }
  const breakdown = [];
  const recommendations = [];
  let score = 0;

  for (const factor of FACTORS) {
    const picked = selections[factor.id];
    if (!Number.isInteger(picked) || picked < 0 || picked >= factor.options.length) {
      return { error: "Answer every question — one or more are unanswered." };
    }
    const option = factor.options[picked];
    const points = factor.weight * option.severity;
    score += points;
    breakdown.push({
      id: factor.id,
      question: factor.question,
      answer: option.label,
      points: Math.round(points * 10) / 10,
      maxPoints: factor.weight,
    });
    // Any factor at or above half severity earns its remediation advice.
    if (option.severity >= 0.5) recommendations.push(factor.advice);
  }

  const rounded = Math.round(score);
  const band = BANDS.find((b) => rounded <= b.max);
  return {
    score: rounded,
    band: band.label,
    verdict: band.verdict,
    breakdown,
    recommendations,
  };
}
