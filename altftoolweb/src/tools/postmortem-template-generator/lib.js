/**
 * Blameless postmortem template generator.
 *
 * The section structure follows the widely used postmortem shape popularised
 * by the Google SRE Book (ch. 15, "Postmortem Culture") and the Atlassian /
 * PagerDuty incident handbooks: summary, impact, timeline, root cause
 * (contributing factors), what went well / what went poorly, and tracked
 * action items with owners and due dates. Wording is blameless by
 * construction: it prompts for systems and processes, not people at fault.
 */

/** Severity options for the header block, most severe first. */
export const SEVERITY_OPTIONS = ["SEV-1", "SEV-2", "SEV-3", "SEV-4"];

/** Optional sections a team can toggle. Ids are stable keys for the UI. */
export const OPTIONAL_SECTIONS = [
  { id: "fiveWhys", label: "5 Whys analysis scaffold" },
  { id: "lessons", label: "What went well / poorly / where we got lucky" },
  { id: "supporting", label: "Supporting data (graphs, dashboards, queries)" },
];

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Escape characters that would break a Markdown table cell. */
function escapeCell(value) {
  return String(value ?? "").replace(/\|/g, "\\|");
}

/** Non-negative integer minutes → "2h 15m" style label. */
export function formatMinutes(totalMinutes) {
  if (!Number.isFinite(totalMinutes) || totalMinutes < 0) return null;
  const minutes = Math.round(totalMinutes);
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest}m`;
  if (rest === 0) return `${hours}h`;
  return `${hours}h ${rest}m`;
}

/**
 * Build the postmortem document as Markdown.
 *
 * @param {object} input
 * @param {string} input.title            Incident title, e.g. "Checkout API outage".
 * @param {string} input.incidentDate     Date of the incident, yyyy-mm-dd.
 * @param {string} input.severity         One of SEVERITY_OPTIONS (free text allowed).
 * @param {number|string} input.durationMinutes  Total impact duration in minutes.
 * @param {string} input.commander        Incident commander / postmortem owner.
 * @param {string} input.impactSummary    One-paragraph customer impact description.
 * @param {number|string} input.actionItemCount  Number of empty action-item rows (1–10).
 * @param {object} input.sections         { fiveWhys, lessons, supporting } booleans.
 * @returns {{ markdown: string, wordCount: number } | { error: string }}
 */
export function buildPostmortem({
  title,
  incidentDate,
  severity,
  durationMinutes,
  commander,
  impactSummary,
  actionItemCount = 3,
  sections = {},
}) {
  const cleanTitle = String(title ?? "").trim();
  if (cleanTitle === "") return { error: "Give the incident a short, descriptive title." };

  if (typeof incidentDate !== "string" || !DATE_PATTERN.test(incidentDate)) {
    return { error: "Enter the incident date in yyyy-mm-dd form." };
  }

  const duration = Number(durationMinutes);
  if (durationMinutes === "" || !Number.isFinite(duration)) {
    return { error: "Enter the impact duration in minutes." };
  }
  if (duration < 0) return { error: "Duration cannot be negative." };
  // A postmortem for an incident longer than a year is almost certainly a typo.
  const MAX_DURATION_MINUTES = 525960; // minutes in a Gregorian mean year
  if (duration > MAX_DURATION_MINUTES) {
    return { error: "Duration is longer than a year — check the figure." };
  }

  const rows = Number(actionItemCount);
  if (!Number.isInteger(rows) || rows < 1 || rows > 10) {
    return { error: "Action item rows must be a whole number between 1 and 10." };
  }

  const cleanSeverity = String(severity ?? "").trim() || "SEV-2";
  const cleanCommander = String(commander ?? "").trim() || "_TBD_";
  const cleanImpact = String(impactSummary ?? "").trim();
  const durationLabel = formatMinutes(duration);

  const actionRows = [];
  for (let i = 1; i <= rows; i += 1) {
    actionRows.push(`| ${i} | _Action_ | _Owner_ | _yyyy-mm-dd_ | Open |`);
  }

  const parts = [
    `# Postmortem: ${cleanTitle}`,
    "",
    "> **Blameless reminder:** this document examines systems and processes, not people. Assume everyone acted with the best intentions given the information they had at the time.",
    "",
    "## Incident metadata",
    "",
    "| Field | Value |",
    "| --- | --- |",
    `| Date of incident | ${incidentDate} |`,
    `| Severity | ${escapeCell(cleanSeverity)} |`,
    `| Impact duration | ${durationLabel} (${Math.round(duration)} minutes) |`,
    `| Incident commander | ${escapeCell(cleanCommander)} |`,
    "| Status | Draft |",
    "",
    "## Summary",
    "",
    "_Two or three sentences: what broke, for how long, who was affected, and how it was resolved._",
    "",
    "## Customer impact",
    "",
    cleanImpact === "" ? "_Describe what customers experienced, how many were affected and any SLA/SLO consequences._" : cleanImpact,
    "",
    "## Timeline (all times in one stated timezone)",
    "",
    "| Time | Event |",
    "| --- | --- |",
    "| _hh:mm_ | First customer impact begins |",
    "| _hh:mm_ | Alert fired / issue reported |",
    "| _hh:mm_ | Incident declared, responder engaged |",
    "| _hh:mm_ | Mitigation applied |",
    "| _hh:mm_ | Full recovery confirmed |",
    "",
    "## Root cause and contributing factors",
    "",
    "_Explain the technical trigger and the conditions that allowed it to become an incident. List contributing factors separately — most incidents have more than one._",
  ];

  if (sections.fiveWhys) {
    parts.push(
      "",
      "### 5 Whys",
      "",
      "1. Why did the impact occur? —",
      "2. Why? —",
      "3. Why? —",
      "4. Why? —",
      "5. Why? —",
    );
  }

  parts.push(
    "",
    "## Detection",
    "",
    "_How was the problem detected — automated alert, internal user, customer report? How long after impact began?_",
    "",
    "## Resolution",
    "",
    "_What action ended the impact, and why did it work?_",
  );

  if (sections.lessons) {
    parts.push(
      "",
      "## Lessons learned",
      "",
      "### What went well",
      "",
      "- ",
      "",
      "### What went poorly",
      "",
      "- ",
      "",
      "### Where we got lucky",
      "",
      "- ",
    );
  }

  parts.push(
    "",
    "## Action items",
    "",
    "| # | Action | Owner | Due | Status |",
    "| --- | --- | --- | --- | --- |",
    ...actionRows,
    "",
    "_Each action item needs a single owner and a due date; 'improve monitoring' without an owner is a wish, not an action._",
  );

  if (sections.supporting) {
    parts.push(
      "",
      "## Supporting data",
      "",
      "_Link graphs, dashboards, log queries and relevant PRs/commits here._",
    );
  }

  const markdown = parts.join("\n");
  // Exclude bare markdown table-syntax tokens ("|", "---", ":--", etc.) so the
  // displayed count approximates actual prose length rather than table markup.
  const wordCount = markdown
    .split(/\s+/)
    .filter((token) => token !== "" && !/^[|:-]+$/.test(token)).length;
  return { markdown, wordCount };
}
