/**
 * Runbook Template Generator — pure logic. No React, no DOM.
 *
 * Document shape follows the alert-playbook guidance in the Google SRE Workbook
 * (chapter "Alerting on SLOs" / "On-Call"): every page-worthy alert should carry
 * a linked runbook that states what fired, why it matters, how to confirm it,
 * how to mitigate it and when to escalate.
 *
 * The response targets below are the conventional on-call ladder used by
 * PagerDuty-style severity policies. They are defaults for teams that have not
 * written their own SLA — always match your organisation's published policy.
 */

/**
 * Severity ladder.
 * ackMinutes    = time to acknowledge the page.
 * updateMinutes = cadence of stakeholder updates while the incident is open
 *                 (0 means no periodic update is required).
 */
export const SEVERITY_LEVELS = [
  {
    id: "sev1",
    label: "SEV1 - Critical",
    summary: "Complete outage, data loss or security breach affecting all customers.",
    ackMinutes: 5,
    updateMinutes: 30,
    paging: "Page primary and secondary on-call at once, open an incident channel and name an incident commander.",
    statusPage: true,
  },
  {
    id: "sev2",
    label: "SEV2 - Major",
    summary: "A core user journey is broken or badly degraded for a large share of traffic.",
    ackMinutes: 15,
    updateMinutes: 60,
    paging: "Page primary on-call; pull in the service owner if not mitigated within one hour.",
    statusPage: true,
  },
  {
    id: "sev3",
    label: "SEV3 - Minor",
    summary: "Partial or non-critical degradation with a workaround available.",
    ackMinutes: 60,
    updateMinutes: 240,
    paging: "Notify the on-call channel during business hours; no out-of-hours page.",
    statusPage: false,
  },
  {
    id: "sev4",
    label: "SEV4 - Low",
    summary: "Cosmetic issue, noisy alert or a task that can wait for the next working day.",
    ackMinutes: 1440,
    updateMinutes: 0,
    paging: "File a ticket in the service backlog; do not page.",
    statusPage: false,
  },
];

/** Fixed section order of the generated document. */
export const RUNBOOK_SECTIONS = [
  "Summary",
  "Severity and response targets",
  "Symptoms",
  "Diagnostic checks",
  "Remediation",
  "Rollback / safety net",
  "Escalation",
  "After the incident",
];

/** Minutes in an hour and in a day — used only for human-readable durations. */
const MINUTES_PER_HOUR = 60;
const MINUTES_PER_DAY = 1440;

export function findSeverity(id) {
  return SEVERITY_LEVELS.find((level) => level.id === id) || null;
}

/** "5 min", "1 hr", "1 hr 30 min", "1 day". Returns "not required" for 0. */
export function formatDuration(minutes) {
  if (!Number.isFinite(minutes) || minutes <= 0) return "not required";
  if (minutes % MINUTES_PER_DAY === 0) {
    const days = minutes / MINUTES_PER_DAY;
    return `${days} day${days === 1 ? "" : "s"}`;
  }
  const hours = Math.floor(minutes / MINUTES_PER_HOUR);
  const rest = minutes % MINUTES_PER_HOUR;
  if (hours === 0) return `${rest} min`;
  if (rest === 0) return `${hours} hr`;
  return `${hours} hr ${rest} min`;
}

/** Split a textarea value into trimmed, non-empty lines with list markers stripped. */
export function parseLines(text) {
  if (typeof text !== "string") return [];
  return text
    .split("\n")
    .map((line) => line.replace(/^\s*(?:[-*+]|\d+[.)])\s*/, "").trim())
    .filter((line) => line.length > 0);
}

/** Lower-case, hyphenated anchor/id form of a label. */
export function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function numberedList(items) {
  return items.map((item, index) => `${index + 1}. ${item}`).join("\n");
}

function bulletList(items) {
  return items.map((item) => `- ${item}`).join("\n");
}

/**
 * Build the runbook.
 *
 * All inputs are plain strings; `generatedOn` is passed in so the function stays
 * pure (same input -> same output) and never reads the clock itself.
 *
 * @returns {{ markdown: string, lines: number, words: number, stepCount: number,
 *   symptomCount: number, checkCount: number, remediationCount: number,
 *   severity: object, ackMinutes: number, updateMinutes: number }
 *   | { error: string }}
 */
export function buildRunbook({
  service = "",
  alert = "",
  severityId = "sev2",
  ownerTeam = "",
  escalationContacts = "",
  symptoms = "",
  checks = "",
  remediation = "",
  rollback = "",
  dashboardUrl = "",
  logQuery = "",
  generatedOn = "",
} = {}) {
  const serviceName = String(service).trim();
  const alertName = String(alert).trim();
  const owner = String(ownerTeam).trim();

  if (!serviceName) return { error: "Enter the service or system this runbook covers." };
  if (!alertName) return { error: "Enter the alert or failure mode this runbook responds to." };

  const severity = findSeverity(severityId);
  if (!severity) return { error: "Pick a severity level from the list." };

  const symptomList = parseLines(symptoms);
  const checkList = parseLines(checks);
  const fixList = parseLines(remediation);
  const rollbackList = parseLines(rollback);
  const contactList = parseLines(escalationContacts);

  if (symptomList.length === 0) return { error: "Add at least one symptom so responders can confirm the alert is real." };
  if (checkList.length === 0) return { error: "Add at least one diagnostic check." };
  if (fixList.length === 0) return { error: "Add at least one remediation step." };

  const title = `${serviceName}: ${alertName}`;
  const header = [
    `# Runbook - ${title}`,
    "",
    `**Service:** ${serviceName}`,
    `**Alert:** ${alertName}`,
    `**Owner:** ${owner || "_unassigned - set an owning team_"}`,
    `**Severity:** ${severity.label}`,
    generatedOn ? `**Last reviewed:** ${generatedOn}` : "**Last reviewed:** _set a review date_",
  ].join("\n");

  const summary = [
    "## Summary",
    "",
    `${severity.summary} This page fires for **${alertName}** on **${serviceName}**.`,
    "Confirm the symptoms first, then work the checks in order before changing anything.",
  ].join("\n");

  const responseTargets = [
    "## Severity and response targets",
    "",
    "| Item | Target |",
    "| --- | --- |",
    `| Acknowledge the page | ${formatDuration(severity.ackMinutes)} |`,
    `| Stakeholder updates | ${formatDuration(severity.updateMinutes)} |`,
    `| Status page | ${severity.statusPage ? "Post an update" : "Not required"} |`,
    "",
    severity.paging,
  ].join("\n");

  const symptomsBlock = [
    "## Symptoms",
    "",
    "You are in the right runbook if you see:",
    "",
    bulletList(symptomList),
  ].join("\n");

  const observability = [];
  if (dashboardUrl) observability.push(`Dashboard: ${dashboardUrl}`);
  if (logQuery) observability.push(`Log query: \`${logQuery}\``);

  const checksBlock = [
    "## Diagnostic checks",
    "",
    "Work top to bottom and record what you find in the incident channel.",
    "",
    numberedList(checkList),
    observability.length > 0 ? `\n${bulletList(observability)}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const remediationBlock = [
    "## Remediation",
    "",
    "Mitigate first, diagnose the root cause afterwards.",
    "",
    numberedList(fixList),
  ].join("\n");

  const rollbackBlock = [
    "## Rollback / safety net",
    "",
    rollbackList.length > 0
      ? numberedList(rollbackList)
      : "1. If remediation makes things worse, revert the last deploy or config change and re-check the symptoms above.",
  ].join("\n");

  const escalationBlock = [
    "## Escalation",
    "",
    `Escalate if the symptoms persist beyond ${formatDuration(severity.ackMinutes * 4)} of active work, or immediately if customer data is at risk.`,
    "",
    contactList.length > 0
      ? bulletList(contactList)
      : `- ${owner || "Service owner"} (primary)\n- Engineering manager on call (secondary)`,
  ].join("\n");

  const afterBlock = [
    "## After the incident",
    "",
    bulletList([
      "Note start time, detection time and mitigation time.",
      severity.statusPage ? "Close out the status page entry." : "Update the ticket with what happened.",
      "Raise follow-up work for anything you fixed by hand.",
      "If this runbook was wrong or slow, edit it now while it is fresh.",
    ]),
  ].join("\n");

  const markdown = [
    header,
    summary,
    responseTargets,
    symptomsBlock,
    checksBlock,
    remediationBlock,
    rollbackBlock,
    escalationBlock,
    afterBlock,
  ].join("\n\n");

  const lines = markdown.split("\n").length;
  const words = markdown.split(/\s+/).filter(Boolean).length;

  return {
    markdown,
    lines,
    words,
    stepCount: checkList.length + fixList.length + (rollbackList.length || 1),
    symptomCount: symptomList.length,
    checkCount: checkList.length,
    remediationCount: fixList.length,
    rollbackCount: rollbackList.length || 1,
    severity,
    ackMinutes: severity.ackMinutes,
    updateMinutes: severity.updateMinutes,
    anchor: slugify(title),
  };
}
