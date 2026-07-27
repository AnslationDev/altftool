/**
 * Incident severity (SEV) matrix builder.
 *
 * The default level definitions follow the de-facto industry convention used
 * in Google SRE incident management, Atlassian's incident handbook and
 * PagerDuty's response docs: numbered SEV levels where SEV-1 is the most
 * severe, each with an impact statement, a first-response target, an update
 * cadence and an escalation path. All content is user-editable; the defaults
 * are a starting point, not a standard imposed on the org.
 */

/** Maximum number of SEV levels the builder supports (more than 5 stops being actionable). */
export const MAX_LEVELS = 5;
/** Minimum number of SEV levels (a matrix with one level ranks nothing). */
export const MIN_LEVELS = 2;

/** Conventional starting definitions, most severe first. */
export const DEFAULT_LEVELS = [
  {
    name: "SEV-1",
    summary: "Critical — full outage or data loss",
    impact: "Product is down or unusable for all customers, or customer data is being lost or exposed.",
    examples: "Site-wide outage; database corruption; active security breach.",
    response: "15 minutes, 24x7 page",
    updates: "Every 30 minutes",
    escalation: "Page on-call engineer, engineering lead and incident commander immediately; notify executives.",
  },
  {
    name: "SEV-2",
    summary: "Major — significant degradation",
    impact: "A core feature is broken or severely degraded for many customers; no acceptable workaround.",
    examples: "Checkout failing for one region; login latency 10x normal.",
    response: "30 minutes, 24x7 page",
    updates: "Every 60 minutes",
    escalation: "Page on-call engineer; escalate to engineering lead if not mitigated within one hour.",
  },
  {
    name: "SEV-3",
    summary: "Minor — limited impact",
    impact: "A non-core feature is degraded, or a core feature is degraded for few customers with a workaround.",
    examples: "Report export slow; UI glitch affecting one browser.",
    response: "Next business day",
    updates: "Daily until resolved",
    escalation: "Ticket to the owning team; no paging outside business hours.",
  },
  {
    name: "SEV-4",
    summary: "Low — cosmetic or informational",
    impact: "Cosmetic issues, minor bugs or tooling annoyances with no customer-visible impact.",
    examples: "Typo in UI; stale dashboard panel; flaky internal alert.",
    response: "Within the sprint / backlog",
    updates: "On resolution",
    escalation: "Backlog triage by the owning team.",
  },
  {
    name: "SEV-5",
    summary: "Informational — no action required",
    impact: "No functional impact; tracked only for awareness or trend analysis.",
    examples: "Single transient error spike that auto-recovered.",
    response: "None committed",
    updates: "None",
    escalation: "Log for weekly operational review.",
  },
];

/** Column definitions for the matrix, in output order. */
export const MATRIX_COLUMNS = [
  { key: "name", label: "Level" },
  { key: "summary", label: "Summary" },
  { key: "impact", label: "Impact" },
  { key: "response", label: "First response" },
  { key: "updates", label: "Update cadence" },
  { key: "escalation", label: "Escalation path" },
];

/** Escape characters that would break a Markdown table cell. */
export function escapeCell(value) {
  return String(value ?? "")
    .replace(/\|/g, "\\|")
    .replace(/\r?\n+/g, " ")
    .trim();
}

/**
 * Build the severity matrix as Markdown (table + per-level detail sections).
 *
 * @param {object} input
 * @param {string} input.orgName   Organisation or team name for the heading.
 * @param {Array}  input.levels    Levels, most severe first; each needs at least a name and impact.
 * @returns {{ markdown: string, levelCount: number } | { error: string }}
 */
export function buildSeverityMatrix({ orgName, levels }) {
  if (!Array.isArray(levels)) return { error: "Levels must be a list." };
  const active = levels.filter((level) => level && String(level.name).trim() !== "");
  if (active.length < MIN_LEVELS) {
    return { error: `Define at least ${MIN_LEVELS} severity levels so incidents can be ranked.` };
  }
  if (active.length > MAX_LEVELS) {
    return { error: `Keep the matrix to at most ${MAX_LEVELS} levels — more stops being actionable.` };
  }
  const missingImpact = active.find((level) => String(level.impact ?? "").trim() === "");
  if (missingImpact) {
    return { error: `Level "${missingImpact.name}" needs an impact definition — it is what responders classify by.` };
  }
  const names = active.map((level) => String(level.name).trim().toLowerCase());
  if (new Set(names).size !== names.length) {
    return { error: "Each severity level needs a unique name." };
  }

  const title = String(orgName ?? "").trim() || "Our organisation";
  const header = `| ${MATRIX_COLUMNS.map((c) => c.label).join(" | ")} |`;
  const divider = `| ${MATRIX_COLUMNS.map(() => "---").join(" | ")} |`;
  const rows = active.map(
    (level) => `| ${MATRIX_COLUMNS.map((c) => escapeCell(level[c.key])).join(" | ")} |`,
  );

  const details = active
    .map((level) =>
      [
        `### ${escapeCell(level.name)} — ${escapeCell(level.summary)}`,
        "",
        `- **Impact:** ${escapeCell(level.impact)}`,
        `- **Examples:** ${escapeCell(level.examples) || "—"}`,
        `- **First response target:** ${escapeCell(level.response) || "—"}`,
        `- **Status updates:** ${escapeCell(level.updates) || "—"}`,
        `- **Escalation:** ${escapeCell(level.escalation) || "—"}`,
      ].join("\n"),
    )
    .join("\n\n");

  const markdown = [
    `# Incident Severity Matrix — ${escapeCell(title)}`,
    "",
    "Severity is set by **current customer impact**, not by root cause. When in doubt, pick the higher severity and downgrade later.",
    "",
    header,
    divider,
    ...rows,
    "",
    "## Level definitions",
    "",
    details,
    "",
    "## Rules of use",
    "",
    "- The first responder assigns an initial severity; the incident commander may change it as impact becomes clearer.",
    "- Severity drives paging and update cadence; priority of the follow-up fix is decided separately.",
    "- Re-evaluate severity whenever scope changes (more regions, more customers, data at risk).",
  ].join("\n");

  return { markdown, levelCount: active.length };
}
