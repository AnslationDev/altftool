/**
 * Pre-ship guardrail checklist for autonomous / tool-using AI agents.
 *
 * The item set is drawn from the OWASP Top 10 for LLM Applications (2025):
 * LLM06 "Excessive Agency" (permissions, tool scope, human gates) and
 * LLM01 "Prompt Injection" (untrusted-content handling), plus standard
 * operational controls (budget caps, kill switches, audit logs) as described
 * in the NIST AI Risk Management Framework's "manage" function.
 *
 * Scoring is a weighted sum. Weights:
 *   critical    = 3  (shipping without it is an incident waiting to happen)
 *   important   = 2
 *   recommended = 1
 * Readiness bands are defined on the percentage of the weighted maximum,
 * with the extra rule that ANY unchecked critical item caps the verdict at
 * "not ready" regardless of percentage.
 */

export const WEIGHTS = {
  critical: 3,
  important: 2,
  recommended: 1,
};

/** Readiness thresholds (percent of weighted max, all criticals passing). */
export const READY_PERCENT = 90;
export const NEARLY_PERCENT = 70;

export const CATEGORIES = [
  {
    id: "permissions",
    title: "Permissions and least privilege",
    note: "OWASP LLM06 'Excessive Agency': the agent can only do what its task needs.",
    items: [
      {
        id: "leastPrivilege",
        weight: "critical",
        label: "Agent credentials are scoped to the minimum APIs, scopes and resources the task needs",
      },
      {
        id: "ownIdentity",
        weight: "critical",
        label: "The agent has its own service identity — it never borrows a human's session or personal tokens",
      },
      {
        id: "toolAllowlist",
        weight: "important",
        label: "Tools are an explicit allowlist; no open-ended shell or code execution unless the task requires it",
      },
      {
        id: "readOnlyDefault",
        weight: "important",
        label: "Read-only by default; each write-capable tool was added deliberately with a reason",
      },
      {
        id: "envSeparation",
        weight: "recommended",
        label: "The agent runs against staging/sandbox data until production access is signed off",
      },
    ],
  },
  {
    id: "spend",
    title: "Spend and runaway protection",
    note: "Caps enforced outside the model, so a bad plan cannot outspend you.",
    items: [
      {
        id: "spendCap",
        weight: "critical",
        label: "A hard budget cap (API spend and any money the agent can move) is enforced by infrastructure, not by the prompt",
      },
      {
        id: "rateLimit",
        weight: "important",
        label: "Rate limits bound actions per minute/hour for every side-effecting tool",
      },
      {
        id: "loopBreaker",
        weight: "important",
        label: "A max-steps / max-iterations guard stops runaway loops and retry storms",
      },
      {
        id: "costAlerts",
        weight: "recommended",
        label: "Spend and usage alerts fire well before the cap is hit",
      },
    ],
  },
  {
    id: "gates",
    title: "Confirmation gates",
    note: "Human-in-the-loop where a mistake is expensive or irreversible.",
    items: [
      {
        id: "irreversibleGate",
        weight: "critical",
        label: "Irreversible or destructive actions (deletes, sends, deploys, transfers) require explicit human approval",
      },
      {
        id: "moneyGate",
        weight: "critical",
        label: "Any payment or transfer above a defined threshold needs human confirmation with the exact amount shown",
      },
      {
        id: "dryRun",
        weight: "important",
        label: "Bulk operations support a dry-run/preview the human can inspect before execution",
      },
      {
        id: "scopeConfirm",
        weight: "recommended",
        label: "The agent restates its plan and scope before long multi-step runs",
      },
    ],
  },
  {
    id: "injection",
    title: "Prompt injection and data handling",
    note: "OWASP LLM01: everything the agent reads is untrusted input.",
    items: [
      {
        id: "untrustedContent",
        weight: "critical",
        label: "Content the agent reads (web pages, emails, files, tool output) is treated as data — instructions found there are never followed",
      },
      {
        id: "secretsIsolation",
        weight: "critical",
        label: "Secrets and credentials are injected at the tool layer, never placed in the model's context window",
      },
      {
        id: "piiMinimisation",
        weight: "important",
        label: "Personal data in context and logs is minimised or redacted to what the task needs",
      },
      {
        id: "outputValidation",
        weight: "important",
        label: "Tool arguments produced by the model are validated (schema, ranges, allowlisted targets) before execution",
      },
    ],
  },
  {
    id: "monitoring",
    title: "Monitoring and recovery",
    note: "You can see what it did and stop it fast.",
    items: [
      {
        id: "auditLog",
        weight: "critical",
        label: "Every action is logged (tool, arguments, result, timestamp) somewhere the agent cannot alter",
      },
      {
        id: "killSwitch",
        weight: "critical",
        label: "A documented kill switch halts the agent immediately, and the on-call team knows where it is",
      },
      {
        id: "rollback",
        weight: "important",
        label: "Actions are reversible, or a compensating rollback procedure exists and has been tested",
      },
      {
        id: "anomalyAlerts",
        weight: "recommended",
        label: "Alerts fire on unusual action volume, error rates or off-hours activity",
      },
    ],
  },
];

/** Flat map id -> item (with category id) for scoring. */
export const ALL_ITEMS = CATEGORIES.flatMap((category) =>
  category.items.map((item) => ({ ...item, categoryId: category.id })),
);

/** Weighted maximum across all items. */
export const MAX_SCORE = ALL_ITEMS.reduce((sum, item) => sum + WEIGHTS[item.weight], 0);

/**
 * Score the checklist.
 *
 * @param {object} input
 * @param {string[]} input.checked  Ids of items that are done. Unknown ids are ignored.
 * @returns {object} score breakdown; never errors on odd input — an empty or
 *   invalid list simply scores zero.
 */
export function scoreChecklist({ checked } = {}) {
  const done = new Set(Array.isArray(checked) ? checked.filter((id) => typeof id === "string") : []);

  let score = 0;
  const missingCritical = [];
  const byCategory = CATEGORIES.map((category) => {
    let catScore = 0;
    let catMax = 0;
    let catDone = 0;
    for (const item of category.items) {
      const weight = WEIGHTS[item.weight];
      catMax += weight;
      if (done.has(item.id)) {
        catScore += weight;
        catDone += 1;
      } else if (item.weight === "critical") {
        missingCritical.push({ id: item.id, category: category.title, label: item.label });
      }
    }
    score += catScore;
    return {
      id: category.id,
      title: category.title,
      score: catScore,
      max: catMax,
      done: catDone,
      total: category.items.length,
    };
  });

  // MAX_SCORE is a positive constant, so this division is always safe.
  const percent = Math.round((score / MAX_SCORE) * 100);

  let level;
  let verdict;
  if (missingCritical.length > 0) {
    level = "blocked";
    verdict = `Not ready to ship — ${missingCritical.length} critical guardrail${missingCritical.length === 1 ? "" : "s"} missing.`;
  } else if (percent >= READY_PERCENT) {
    level = "ready";
    verdict = "Ready to ship: all critical guardrails are in place and coverage is strong.";
  } else if (percent >= NEARLY_PERCENT) {
    level = "nearly";
    verdict = "Nearly there: criticals are covered — close the remaining important items before launch.";
  } else {
    level = "early";
    verdict = "Early days: criticals are covered but overall guardrail coverage is still thin.";
  }

  return {
    score,
    maxScore: MAX_SCORE,
    percent,
    level,
    verdict,
    missingCritical,
    byCategory,
    checkedCount: byCategory.reduce((sum, category) => sum + category.done, 0),
    totalCount: ALL_ITEMS.length,
  };
}
