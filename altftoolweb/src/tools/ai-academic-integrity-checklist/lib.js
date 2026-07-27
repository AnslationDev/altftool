/**
 * AI Academic Integrity Checklist — a self-audit against the dimensions that
 * recur across university and school AI-use policies: permission, disclosure,
 * authorship of the submitted work product, verification of AI output, and
 * data handling.
 *
 * The items generalise common policy requirements (e.g. course-level AI
 * permissions, disclosure/acknowledgement statements, the rule that submitted
 * work must be the student's own, and checking AI-generated citations, which
 * are known to be fabricated at times). It is an informational self-check —
 * the institution's own policy is always the authority.
 */

/** Answer values. */
export const ANSWERS = { YES: "yes", NO: "no", NA: "na" };

/**
 * Severity meanings:
 *  - critical:  a "No" here typically constitutes a policy violation on its own
 *               (submitting would be unsafe until fixed).
 *  - important: a "No" here creates real risk if questioned, but may be
 *               recoverable before submission.
 *  - advisory:  good practice; a "No" is a note, not a violation.
 */
export const SEVERITIES = ["critical", "important", "advisory"];

export const CHECKLIST_ITEMS = [
  {
    id: "policy-read",
    category: "Permission",
    severity: "critical",
    text: "I have read what my course syllabus or institution says about AI use for this specific assignment.",
  },
  {
    id: "use-permitted",
    category: "Permission",
    severity: "critical",
    text: "The way I used AI (brainstorming, feedback, editing, code help...) is permitted for this assignment.",
  },
  {
    id: "disclosed",
    category: "Disclosure",
    severity: "critical",
    text: "I have disclosed my AI use in the form required (acknowledgement statement, citation, or checkbox) — or disclosure is explicitly not required.",
  },
  {
    id: "own-work",
    category: "Authorship",
    severity: "critical",
    text: "The words, code or answers I am submitting were produced by me — AI output was not pasted in as my own work.",
  },
  {
    id: "can-explain",
    category: "Authorship",
    severity: "important",
    text: "I can explain and defend every part of the submitted work without AI in the room (e.g. in a viva or follow-up question).",
  },
  {
    id: "history-kept",
    category: "Disclosure",
    severity: "important",
    text: "I could show my prompts or chat history if my instructor asked for them.",
  },
  {
    id: "facts-verified",
    category: "Verification",
    severity: "important",
    text: "I verified AI-provided facts, figures and quotes against real sources before relying on them.",
  },
  {
    id: "citations-exist",
    category: "Verification",
    severity: "important",
    text: "Every source or citation the AI suggested was checked to actually exist and say what it is cited for.",
  },
  {
    id: "no-private-data",
    category: "Data handling",
    severity: "important",
    text: "I did not paste other people's work, unpublished data or personal information into the AI tool.",
  },
  {
    id: "process-notes",
    category: "Good practice",
    severity: "advisory",
    text: "I kept brief notes on which stages of my process used AI, in case I need to reconstruct it later.",
  },
];

/** Overall status ids returned by evaluateChecklist. */
export const STATUS = {
  ALIGNED: "aligned",
  CAUTION: "caution",
  HIGH_RISK: "high-risk",
};

/**
 * Evaluate the checklist.
 *
 * Rules:
 *  - Any critical item answered "No"  -> HIGH_RISK.
 *  - Otherwise any important "No"     -> CAUTION.
 *  - Otherwise (all applicable pass)  -> ALIGNED.
 *  - "N/A" answers are excluded from the score's denominator.
 *  - Score = passed / applicable * 100, rounded.
 *
 * @param {Object<string,string>} answers Map of item id -> "yes" | "no" | "na".
 * @returns {object} evaluation or { error }.
 */
export function evaluateChecklist(answers) {
  if (answers == null || typeof answers !== "object" || Array.isArray(answers)) {
    return { error: "Answer the checklist items to get an assessment." };
  }

  let applicable = 0;
  let passed = 0;
  let unanswered = 0;
  const fails = { critical: [], important: [], advisory: [] };

  for (const item of CHECKLIST_ITEMS) {
    const answer = answers[item.id];
    if (answer !== ANSWERS.YES && answer !== ANSWERS.NO && answer !== ANSWERS.NA) {
      unanswered += 1;
      continue;
    }
    if (answer === ANSWERS.NA) continue;
    applicable += 1;
    if (answer === ANSWERS.YES) {
      passed += 1;
    } else {
      fails[item.severity].push(item);
    }
  }

  if (unanswered > 0) {
    return {
      error: `Answer all items to get an assessment — ${unanswered} item${unanswered === 1 ? " is" : "s are"} still unanswered (use N/A if one does not apply).`,
    };
  }
  if (applicable === 0) {
    return { error: "Every item is marked N/A — at least one item must apply to your situation." };
  }

  let status = STATUS.ALIGNED;
  let statusDetail =
    "Your answers match the permission, disclosure and verification expectations found in typical institutional AI policies.";
  if (fails.critical.length > 0) {
    status = STATUS.HIGH_RISK;
    statusDetail =
      "At least one critical item failed. Under typical policies this alone can constitute a violation — resolve it before submitting.";
  } else if (fails.important.length > 0) {
    status = STATUS.CAUTION;
    statusDetail =
      "No critical failures, but some important safeguards are missing. Fix what you can before submitting, and be ready to answer questions about your process.";
  }

  const score = Math.round((passed / applicable) * 100);

  return {
    status,
    statusDetail,
    score,
    applicable,
    passed,
    criticalFails: fails.critical,
    importantFails: fails.important,
    advisoryFails: fails.advisory,
    totalItems: CHECKLIST_ITEMS.length,
  };
}
