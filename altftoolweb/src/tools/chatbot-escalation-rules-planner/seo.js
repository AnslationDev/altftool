const seo = {
  title: "Chatbot Escalation Rules: When to Hand",
  metaDescription:
    "Build a first-match-wins handoff rule set: two failed attempts, a 0.7 intent-confidence floor, explicit human requests and always-on safety triggers.",
  steps: [
    "Set Failed attempts before escalating and Intent confidence floor — they default to 2 and 0.7 — plus a High-value threshold (0 disables) for refunds a human must approve.",
    "Choose Human agent availability, then under Sensitive topics that always escalate tick the ones you want; Self-harm, threats or abuse is marked (always on) and cannot be unticked, and you can add Escalate on frustration / negative sentiment.",
    "The Escalation rules count and a numbered list appear straight away, each rule spelling out its When and Then line in evaluation order, and Copy as Markdown exports the whole ordered set.",
  ],
  intro:
    "The Chatbot Escalation Rules Planner generates an ordered, first-match-wins rule set defining exactly when a chatbot must hand a conversation to a human agent. It builds on established conversation-design conventions — the two-strikes repair rule for repeated misunderstanding, an NLU intent-confidence floor (commonly around 0.7), unconditional handoff when a user asks for a human, and safety-first ordering for sensitive topics. It is built for support leads and conversation designers preparing a bot for launch or tightening one that traps users in loops.",
  useCases: [
    "A support team writing the handoff spec for a new customer-service bot before connecting it to their live-chat platform",
    "A conversation designer fixing a bot that loops endlessly by codifying a two-failed-attempts escalation rule",
    "An e-commerce operator adding a rule that any refund above a set value goes to a human before the bot acts",
  ],
  benefits: [
    ["Safety-first ordering", "Sensitive-topic rules outrank cost triggers, and the self-harm/safety rule can never be switched off; fraud and formal-complaint rules are on by default but stay optional checkboxes."],
    ["Grounded defaults", "Two failed attempts and a 0.7 confidence floor reflect real conversation-design and NLU-platform conventions, and both are tunable."],
    ["Off-hours handling built in", "If agents only work business hours, every rule gains a queue-and-callback path instead of a dead end."],
  ],
  faqs: [
    [
      "When should a chatbot escalate to a human agent?",
      "At minimum: immediately when the user explicitly asks for a human, after two consecutive failed attempts to understand the same request, when intent confidence is too low to act safely on a consequential action, and always for self-harm, threats or abuse — that rule can never be turned off. Legal threats, formal complaints, fraud and other sensitive topics are strongly recommended additional triggers, and this planner turns each checked one into an ordered rule, but they stay optional so you can match your own escalation policy.",
    ],
    [
      "What is a good confidence threshold for chatbot escalation?",
      "Around 0.7 is a common conservative floor for acting on an intent without clarification; NLU platforms such as Dialogflow ship classification thresholds in the 0.3–0.7 range and treat scores below the threshold as no-match. The right value depends on your platform's score distribution — set it too high and everything escalates, too low and the bot acts on guesses.",
    ],
    [
      "Why should the bot escalate after two failed attempts?",
      "Because a third re-prompt almost never recovers the conversation and measurably increases frustration — conversation-design guidance (including Google's error-repair patterns) recommends at most one or two repair attempts before changing strategy. The two-strikes rule stops the loop, summarises what the bot understood, and passes that summary to the agent so the customer doesn't repeat themselves.",
    ],
    [
      "Should a chatbot ever refuse to connect a user to a human?",
      "No. Hiding or refusing an explicit human request is a recognised dark pattern that damages trust and CSAT, and consumer-protection regulators have criticised obstruction of human contact. If no agent is available — for instance outside business hours — the right pattern is to say so honestly, collect contact details, create a priority ticket and commit to a response time.",
    ],
  ],
};

export default seo;
