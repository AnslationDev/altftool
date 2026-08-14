const seo = {
  title: "Runbook Template Generator: 8-Section Markdown",
  metaDescription:
    "Fill in the service, alert and severity and get an eight-section Markdown runbook — symptoms, diagnostic checks, remediation, rollback, escalation.",
  steps: [
    "Enter Service or system, Alert or failure mode and Owning team, then pick a Severity — SEV1 - Critical through SEV4 - Low, each carrying its own acknowledgement and update targets.",
    "Fill Symptoms, Diagnostic checks and Remediation steps one per line, plus the optional Rollback steps, Escalation contacts, Dashboard URL, Log query and Last reviewed fields.",
    "The preview assembles eight Markdown sections — Summary, Severity and response targets, Symptoms, Diagnostic checks, Remediation, Rollback / safety net, Escalation, After the incident — then press Copy Markdown to paste it beside your alert rule.",
  ],
  intro:
    "A runbook template generator turns one alert into a structured Markdown document that tells a responder what they should be seeing, which checks to run in order, how to mitigate, and who to escalate to. It follows the alert-playbook structure recommended in the Google SRE Workbook — every page-worthy alert links to a runbook — and pairs each severity with acknowledgement and update targets from the usual four-level SEV ladder. Fill in the service, the alert and your own steps, then paste the output next to the alert rule in your repository.",
  useCases: [
    "Writing the linked runbook a Prometheus or Datadog alert rule points at, before the alert is allowed to page anyone",
    "Standardising a team's on-call documentation so every service has the same eight sections instead of a wiki page per engineer",
    "Producing the runbook that a production readiness review or SOC 2 change-management control asks you to show",
  ],
  benefits: [
    ["Mitigation before diagnosis", "Steps are ordered so responders restore service first and investigate root cause afterwards."],
    ["Severity-aware targets", "Each SEV level carries its own acknowledgement window, update cadence and status-page rule."],
    ["Plain Markdown output", "Paste it straight into GitHub, GitLab, Backstage, Notion or Confluence with no reformatting."],
  ],
  faqs: [
    [
      "What should a runbook contain?",
      "At minimum: the alert it responds to, the symptoms that confirm it, ordered diagnostic checks, remediation steps, a rollback path, and escalation contacts. The Google SRE Workbook adds that a runbook should be specific enough for someone who has never touched the service to act on it at 3am.",
    ],
    [
      "What is the difference between a runbook and a playbook?",
      "A runbook is procedural and scoped to one failure mode or task — restart this consumer, drain this node. A playbook is broader and covers a whole incident type or scenario, including coordination and communication. Many teams use the words interchangeably; what matters is that the alert links to something actionable.",
    ],
    [
      "How fast should on-call acknowledge a page?",
      "Five minutes is the common target for a SEV1 total outage and 15 minutes for a SEV2 major degradation, with SEV3 handled inside an hour during business hours. These are conventional defaults used in PagerDuty-style policies — check your own incident response SLA, because contractual targets override any generic ladder.",
    ],
    [
      "How often should a runbook be reviewed?",
      "Review it every time it is used in a real incident, and otherwise on a fixed cadence — quarterly is typical. A runbook that references a dashboard, flag or deploy pipeline that no longer exists is worse than none, because it costs a responder minutes before they realise it is stale.",
    ],
  ],
};

export default seo;
