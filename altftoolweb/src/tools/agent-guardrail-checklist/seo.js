const seo = {
  intro:
    "This checklist scores an AI agent's guardrails across 21 weighted items — permissions and least privilege, spend caps, human confirmation gates, prompt-injection defences, and monitoring — before it ships. The item set follows the OWASP Top 10 for LLM Applications (Excessive Agency and Prompt Injection) plus standard operational controls, and any missing critical item blocks the ship verdict regardless of the overall percentage. It is for engineers and teams putting a tool-using agent in front of real systems.",
  useCases: [
    "A developer reviewing a browsing-and-email agent before giving it write access, catching that it still runs on a human's personal tokens",
    "A team lead turning a launch review into a copyable scorecard showing exactly which critical guardrails are missing",
    "A security engineer using the OWASP-aligned item list as the agenda for an agent threat-modelling session",
  ],
  benefits: [
    ["Criticals block the verdict", "Nine critical items — spend cap, kill switch, injection handling, human gates — cap the result at 'not ready' if any is missing."],
    ["Weighted, not vibes", "Critical items score 3, important 2, recommended 1, so the percentage reflects real risk coverage."],
    ["Copyable report", "One click produces a plain-text scorecard with per-category coverage and the exact missing criticals."],
  ],
  faqs: [
    [
      "What guardrails does an AI agent need before production?",
      "Five groups: least-privilege permissions with the agent on its own service identity; hard spend caps and loop breakers enforced outside the model; human confirmation for irreversible actions and money movement; prompt-injection defences that treat everything the agent reads as data; and monitoring — an immutable action log plus a kill switch. This checklist scores all five and blocks the verdict if any critical item is unchecked.",
    ],
    [
      "What is excessive agency in the OWASP LLM Top 10?",
      "Excessive Agency (LLM06 in the OWASP Top 10 for LLM Applications) is when an LLM-based system holds more functionality, permissions or autonomy than its task needs — for example a summarising agent with delete rights, or an agent reusing a human's full-privilege session. The mitigations are exactly the checklist's first category: minimal tool allowlists, scoped credentials, a separate service identity and read-only defaults.",
    ],
    [
      "Why do prompt-based guardrails fail for agents?",
      "Because the prompt is advisory while the agent's credentials are real: a prompt injection in a web page or email the agent reads can override written instructions, but it cannot override an API scope, a spend cap or a rate limit enforced by infrastructure. That is why this checklist marks externally-enforced controls — budget caps, argument validation, human gates — as critical and treats prompt rules as a complement, not a defence.",
    ],
    [
      "When should an AI agent require human approval?",
      "At minimum for irreversible or destructive actions (deleting data, sending external messages, deploying) and for any payment or transfer above a defined threshold, with the exact action and amount shown to the approver. Bulk operations deserve a dry-run preview instead of item-by-item approval. The goal is human-in-the-loop where a mistake is expensive, and autonomy where it is cheap to undo.",
    ],
  ],
};

export default seo;
