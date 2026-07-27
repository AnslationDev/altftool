/**
 * Chatbot Escalation Rules Planner — generates an ordered, deterministic rule
 * set defining when a bot must hand a conversation to a human agent.
 *
 * The defaults encode widely used conversation-design conventions:
 * - A "two-strikes" repair rule: after two consecutive failed understanding
 *   attempts, stop re-prompting and escalate — the standard guidance in
 *   conversation design practice (e.g. Google's conversation design guidance
 *   on error repair) to avoid dead-end loops.
 * - An intent-confidence floor around 0.7: NLU platforms such as Dialogflow
 *   ship classification thresholds in the 0.3–0.7 range and treat scores
 *   below the threshold as no-match; 0.7 is a common conservative default.
 * - Immediate, unconditional handoff when the user explicitly asks for a
 *   human — burying or refusing that request is a recognised dark pattern.
 * Rules are ordered safety-first: sensitive topics outrank cost triggers.
 */

/** Two-strikes convention: consecutive failed attempts before escalating. */
export const DEFAULT_FAILED_ATTEMPTS = 2;
export const MIN_FAILED_ATTEMPTS = 1;
export const MAX_FAILED_ATTEMPTS = 5;

/** Common conservative NLU confidence floor (platform defaults run 0.3–0.7). */
export const DEFAULT_CONFIDENCE_THRESHOLD = 0.7;
export const MIN_CONFIDENCE = 0.1;
export const MAX_CONFIDENCE = 0.95;

export const SENSITIVE_TOPIC_OPTIONS = [
  { id: "safety", label: "Self-harm, threats or abuse", always: true },
  { id: "legal", label: "Legal threats and formal complaints", always: false },
  { id: "medical", label: "Medical or health-related requests", always: false },
  { id: "billing-dispute", label: "Billing disputes and refund escalations", always: false },
  { id: "account-security", label: "Account security / suspected fraud", always: false },
];

export const HOURS_OPTIONS = [
  { id: "24-7", label: "Human agents available 24/7" },
  { id: "business-hours", label: "Human agents only during business hours" },
];

/**
 * Build the ordered escalation rule set.
 * @returns {object} { rules, ruleCount, ... } or { error }.
 */
export function buildEscalationPlan({
  failedAttempts = DEFAULT_FAILED_ATTEMPTS,
  confidenceThreshold = DEFAULT_CONFIDENCE_THRESHOLD,
  sentimentTrigger = true,
  highValueThreshold = 0,
  sensitiveTopicIds = ["safety"],
  hoursId = "24-7",
}) {
  const attempts = Number(failedAttempts);
  if (!Number.isInteger(attempts) || attempts < MIN_FAILED_ATTEMPTS || attempts > MAX_FAILED_ATTEMPTS) {
    return {
      error: `Failed-attempt limit must be a whole number between ${MIN_FAILED_ATTEMPTS} and ${MAX_FAILED_ATTEMPTS}.`,
    };
  }

  const confidence = Number(confidenceThreshold);
  if (!Number.isFinite(confidence) || confidence < MIN_CONFIDENCE || confidence > MAX_CONFIDENCE) {
    return {
      error: `Confidence threshold must be between ${MIN_CONFIDENCE} and ${MAX_CONFIDENCE} (it is a probability, e.g. 0.7).`,
    };
  }

  const value = Number(highValueThreshold);
  if (!Number.isFinite(value) || value < 0) {
    return { error: "High-value threshold cannot be negative. Use 0 to disable the value trigger." };
  }

  const hours = HOURS_OPTIONS.find((h) => h.id === hoursId);
  if (!hours) return { error: "Choose your human-agent availability." };

  const topicIds = new Set(Array.isArray(sensitiveTopicIds) ? sensitiveTopicIds : []);
  // The safety topic can never be opted out of.
  topicIds.add("safety");
  const topics = SENSITIVE_TOPIC_OPTIONS.filter((t) => topicIds.has(t.id));

  const offHours =
    hours.id === "business-hours"
      ? " Outside business hours: state that no agent is available now, collect contact details, create a priority ticket and give a response-time commitment."
      : "";

  const rules = [];

  topics.forEach((topic) => {
    rules.push({
      trigger: `Sensitive topic: ${topic.label.toLowerCase()}`,
      condition:
        topic.id === "safety"
          ? "Any detected mention of self-harm, threats of violence, or abuse — regardless of confidence score"
          : `Conversation classified into "${topic.label.toLowerCase()}"`,
      action:
        topic.id === "safety"
          ? "Escalate immediately to a trained human with full transcript; surface crisis resources where applicable; never let the bot continue alone." + offHours
          : "Stop automated resolution and route to a qualified human with full transcript and customer context." + offHours,
    });
  });

  rules.push({
    trigger: "Customer asks for a human",
    condition: 'Any explicit request ("agent", "human", "representative", "talk to a person")',
    action:
      "Hand off immediately without arguing or adding extra bot turns; confirm the handoff and pass the transcript." + offHours,
  });

  if (sentimentTrigger) {
    rules.push({
      trigger: "Frustration or negative sentiment",
      condition:
        "Sentiment turns strongly negative, or frustration signals appear (caps, profanity, repeated punctuation, 'this is useless')",
      action:
        "Acknowledge the frustration in one sentence, then offer or perform a human handoff — do not send the user back into the same flow." + offHours,
    });
  }

  rules.push({
    trigger: "Repeated failure to understand",
    condition: `${attempts} consecutive failed attempt${attempts === 1 ? "" : "s"} (no-match or re-prompt) on the same user goal`,
    action:
      "Stop re-prompting, summarise what the bot understood so far, and escalate with that summary attached." + offHours,
  });

  rules.push({
    trigger: "Low intent confidence",
    condition: `Top intent confidence below ${confidence} on a consequential action (payments, cancellations, account changes)`,
    action:
      "Do not act on the uncertain intent; ask one clarifying question, and escalate if confidence stays below the threshold." + offHours,
  });

  if (value > 0) {
    rules.push({
      trigger: "High-value conversation",
      condition: `Order, refund or account value at stake exceeds ${value} (your currency)`,
      action:
        "Route to a human before any irreversible step; the bot may still collect details to speed the agent up." + offHours,
    });
  }

  const numbered = rules.map((rule, index) => ({ priority: index + 1, ...rule }));

  return {
    rules: numbered,
    ruleCount: numbered.length,
    failedAttempts: attempts,
    confidenceThreshold: confidence,
    highValueThreshold: value,
    hoursLabel: hours.label,
    sensitiveTopicCount: topics.length,
  };
}

/** Render the rule set as copy-ready Markdown, ordered by priority. */
export function planToMarkdown(plan) {
  if (!plan || !Array.isArray(plan.rules)) return "";
  const lines = [
    "# Chatbot escalation rules (evaluated top to bottom)",
    `Agent availability: ${plan.hoursLabel}`,
    "",
  ];
  plan.rules.forEach((rule) => {
    lines.push(`## Rule ${rule.priority}: ${rule.trigger}`);
    lines.push(`- When: ${rule.condition}`);
    lines.push(`- Then: ${rule.action}`);
    lines.push("");
  });
  return lines.join("\n").trimEnd();
}
