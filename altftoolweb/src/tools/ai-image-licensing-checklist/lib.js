/**
 * Commercial-use readiness checklist for AI-generated images.
 *
 * Scoring model: each item carries a risk weight (high = 2, medium = 1 — a
 * conventional prioritisation, not a legal standard). The readiness score is
 * the weight-normalised share of items answered "yes", on a 0–100 scale.
 * Status: any high-risk "no" → "not-ready"; any "no" or "unsure" → "caution";
 * all "yes" → "ready".
 *
 * The items themselves reflect documented, verifiable positions:
 *  - The US Copyright Office's registration guidance (88 FR 16190, March 2023)
 *    states that material generated purely by AI is not protected by copyright.
 *  - Midjourney's Terms of Service require a paid plan for commercial use;
 *    free-tier images are licensed CC BY-NC 4.0 (non-commercial).
 *  - Adobe Firefly and Getty's generative tool offer commercial-use
 *    indemnification; most consumer tools do not.
 *  - Major stock platforms (e.g. Getty Images) refuse or restrict AI-generated
 *    submissions, and several ad platforms and app stores require disclosure.
 */

/** Risk weights used in the readiness score. */
export const RISK_WEIGHTS = { high: 2, medium: 1 };

/** The checklist. `risk` drives both the weighting and the not-ready rule. */
export const CHECKLIST_ITEMS = [
  {
    id: "tos-commercial",
    risk: "high",
    question: "Does your plan's licence expressly allow commercial use?",
    why: "Rights come from the provider's terms, and they differ by tier — Midjourney's free tier, for example, is CC BY-NC (non-commercial only), while paid plans grant commercial rights.",
  },
  {
    id: "likeness",
    risk: "high",
    question: "Is the image free of recognisable real people?",
    why: "A real person's likeness can trigger right-of-publicity and privacy claims independent of copyright, and most provider terms prohibit depicting real people without consent.",
  },
  {
    id: "trademarks",
    risk: "high",
    question: "Is the image free of logos, brand marks and distinctive product designs?",
    why: "Trademark rights are separate from copyright — a generated image containing a recognisable logo or trade dress can infringe even if the pixels are new.",
  },
  {
    id: "artist-style",
    risk: "medium",
    question: "Did you avoid prompting for a living artist's name or signature style?",
    why: "Style-mimicry outputs are central to ongoing litigation against AI image tools, and several platforms restrict 'in the style of' prompts for living artists.",
  },
  {
    id: "copyright-limits",
    risk: "medium",
    question: "Do you accept that purely AI-generated images may have no copyright protection?",
    why: "The US Copyright Office's March 2023 guidance holds that material generated wholly by AI is not copyrightable — competitors may legally reuse it unless your own added authorship protects it.",
  },
  {
    id: "indemnity",
    risk: "medium",
    question: "If the project is high-stakes, does the provider offer IP indemnification?",
    why: "Adobe Firefly and Getty's generative tools indemnify enterprise customers against IP claims; most consumer tools put all the risk on you.",
  },
  {
    id: "platform-rules",
    risk: "medium",
    question: "Does the platform where you'll publish allow (or require labelling of) AI images?",
    why: "Stock sites like Getty refuse AI submissions, and ad platforms and app stores increasingly require AI-content disclosure — check the destination's policy, not just the generator's.",
  },
  {
    id: "records",
    risk: "medium",
    question: "Have you kept records — prompts, dates, tool and plan used?",
    why: "If a claim or takedown arrives, contemporaneous records of how the image was made and under which licence tier are your first line of defence.",
  },
];

/** Valid answer values. */
export const ANSWER_VALUES = ["yes", "no", "unsure"];

/**
 * Evaluate the checklist.
 *
 * @param {Object<string,string>} answers Map of item id → "yes" | "no" | "unsure" (missing = "unsure").
 * @returns {object} { score, status, passed, failed, unsure, totalItems,
 *                     highRiskFails, flagged: [{id, answer, risk}] } or { error }.
 */
export function evaluateChecklist(answers) {
  if (answers === null || typeof answers !== "object" || Array.isArray(answers)) {
    return { error: "Answers must be provided as an object keyed by item id." };
  }

  let weightTotal = 0;
  let weightPassed = 0;
  let passed = 0;
  let failed = 0;
  let unsure = 0;
  let highRiskFails = 0;
  const flagged = [];

  for (const item of CHECKLIST_ITEMS) {
    const raw = answers[item.id];
    const answer = ANSWER_VALUES.includes(raw) ? raw : "unsure";
    const weight = RISK_WEIGHTS[item.risk];
    weightTotal += weight;

    if (answer === "yes") {
      passed += 1;
      weightPassed += weight;
    } else if (answer === "no") {
      failed += 1;
      if (item.risk === "high") highRiskFails += 1;
      flagged.push({ id: item.id, answer, risk: item.risk, question: item.question });
    } else {
      unsure += 1;
      flagged.push({ id: item.id, answer, risk: item.risk, question: item.question });
    }
  }

  // weightTotal is a positive constant sum of RISK_WEIGHTS — never zero.
  const score = (weightPassed / weightTotal) * 100;

  let status;
  if (highRiskFails > 0) status = "not-ready";
  else if (failed > 0 || unsure > 0) status = "caution";
  else status = "ready";

  return {
    score,
    status,
    passed,
    failed,
    unsure,
    totalItems: CHECKLIST_ITEMS.length,
    highRiskFails,
    flagged,
  };
}
