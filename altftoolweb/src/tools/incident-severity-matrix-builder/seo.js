const seo = {
  title: "Incident Severity Matrix Builder: SEV-1 to SEV-5 Table",
  metaDescription:
    "Define SEV-1 to SEV-5 — impact, first-response target, update cadence, escalation — and copy the Markdown table straight into a runbook or wiki.",
  steps: [
    "Enter your Organisation or team name and pick the Number of severity levels — two to five, labelled SEV-1 to SEV-n.",
    "Open each level tab and edit its Level name, Impact definition, Examples, First response target, Status update cadence and Escalation path.",
    "Check the Generated matrix preview, then press Copy Markdown to paste the table and per-level definitions into your runbook or wiki.",
  ],
  intro:
    "This builder produces an incident severity matrix — the table that maps SEV-1 through SEV-5 to customer impact, first-response targets, status-update cadence and escalation paths — and exports it as clean Markdown. It follows the numbered-severity convention used in Google SRE incident management and the Atlassian and PagerDuty incident handbooks, where SEV-1 is the most severe. Engineering managers, SREs and support leads can adapt every field to their own on-call reality and paste the result straight into a runbook or wiki.",
  useCases: [
    "A startup formalising incident response for the first time and needing agreed SEV definitions before its next outage",
    "An SRE lead replacing a vague 'P1/P2' culture with impact-based severity definitions and explicit response-time targets",
    "A support manager aligning customer-communication cadence (every 30 or 60 minutes) to each severity level in one shared document",
  ],
  benefits: [
    ["Industry-standard defaults", "Starts from SEV conventions used in SRE practice — critical, major, minor, low — so you edit rather than invent."],
    ["Every field editable", "Impact, examples, response target, update cadence and escalation are all customisable per level."],
    ["Markdown export", "One click copies a formatted table plus per-level definitions for your wiki, runbook or repository."],
  ],
  faqs: [
    [
      "What is a SEV level in incident management?",
      "A SEV (severity) level is a ranked classification of an incident's current customer impact, where SEV-1 conventionally means a critical, product-wide outage or data loss and higher numbers mean progressively smaller impact. The level determines who gets paged, how fast the first response must be and how often status updates go out.",
    ],
    [
      "What is the difference between severity and priority?",
      "Severity measures the impact of the incident right now; priority ranks how urgently the follow-up work gets scheduled. A cosmetic bug on the pricing page can be low severity but high priority, which is why mature processes track the two separately.",
    ],
    [
      "How many severity levels should an incident matrix have?",
      "Three to five is the practical range, and this builder supports two to five. Fewer than three loses useful distinction; more than five forces responders to debate categories during an outage instead of acting. Many organisations only page humans for the top two levels.",
    ],
    [
      "Who decides the severity of an incident?",
      "The first responder assigns an initial severity based on observed impact, and the incident commander adjusts it as scope becomes clearer. The working rule in most handbooks is to choose the higher severity when in doubt and downgrade later, because under-calling an incident delays escalation.",
    ],
  ],
};

export default seo;
