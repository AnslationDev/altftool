/**
 * Standup Notes Generator.
 *
 * Formats the three questions of a daily scrum — what I did, what I will do,
 * what is in my way (Scrum Guide 2020, "Daily Scrum") — into a message ready
 * to paste into Slack, a Markdown doc, a Jira comment or plain text.
 *
 * Markup rules applied per target:
 *   Slack mrkdwn   *bold* with a single asterisk, bullets typed as "•"
 *   Markdown       **bold**, "- " bullets
 *   Jira wiki      "h3. " headings, "* " bullets
 *   Plain text     UPPERCASE headings, "- " bullets
 *
 * The date is always passed in as an ISO yyyy-mm-dd string, never read from the
 * clock, so the same inputs always produce the same output.
 */

export const FORMATS = [
  { id: "slack", label: "Slack (mrkdwn)" },
  { id: "markdown", label: "Markdown" },
  { id: "plain", label: "Plain text" },
  { id: "jira", label: "Jira wiki markup" },
];

/**
 * chat.postMessage rejects a message whose text exceeds 40,000 characters
 * (Slack API limits). Longer notes are flagged rather than silently truncated.
 */
export const SLACK_CHAR_LIMIT = 40000;

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/**
 * Turn a block of text into a clean list of items.
 * Leading bullet characters, hyphens, asterisks and "1." numbering are removed.
 *
 * @param {string} text
 * @returns {string[]}
 */
export function parseItems(text) {
  return String(text ?? "")
    .split("\n")
    .map((line) => line.replace(/^\s*(?:[-*•‣▪]|\d+[.)])\s*/, "").trim())
    .filter((line) => line !== "");
}

/**
 * Format an ISO date as "Monday, 27 July 2026" without touching the clock.
 *
 * @param {string} iso yyyy-mm-dd
 * @returns {string|null} null when the date is not a real calendar date.
 */
export function formatIsoDate(iso) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso ?? "").trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const stamp = Date.UTC(year, month - 1, day);
  const date = new Date(stamp);
  // Reject rolled-over dates such as 2026-02-30.
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    return null;
  }
  return `${WEEKDAYS[date.getUTCDay()]}, ${day} ${MONTHS[month - 1]} ${year}`;
}

function renderBlock(formatId, heading, items, emptyText) {
  const lines = [];
  if (formatId === "slack") lines.push(`*${heading}*`);
  else if (formatId === "markdown") lines.push(`**${heading}**`);
  else if (formatId === "jira") lines.push(`h3. ${heading}`);
  else lines.push(heading.toUpperCase());

  const bullet = formatId === "slack" ? "• " : formatId === "jira" ? "* " : "- ";
  if (items.length === 0) {
    lines.push(`${bullet}${emptyText}`);
  } else {
    items.forEach((item) => lines.push(`${bullet}${item}`));
  }
  return lines.join("\n");
}

/**
 * Build the standup message.
 *
 * @param {object} input
 * @param {string} [input.name]        Person giving the update.
 * @param {string} [input.team]        Team or squad name.
 * @param {string} [input.dateIso]     yyyy-mm-dd, supplied by the caller.
 * @param {string} [input.yesterday]   Raw multi-line text.
 * @param {string} [input.today]       Raw multi-line text.
 * @param {string} [input.blockers]    Raw multi-line text.
 * @param {string} [input.formatId]    FORMATS[].id.
 * @param {boolean} [input.includeDate]
 * @returns {{text: string, ...}|{error: string}}
 */
export function generateStandupNotes({
  name = "",
  team = "",
  dateIso = "",
  yesterday = "",
  today = "",
  blockers = "",
  formatId = "slack",
  includeDate = true,
}) {
  const format = FORMATS.find((f) => f.id === formatId);
  if (!format) return { error: "Choose an output format." };

  const yesterdayItems = parseItems(yesterday);
  const todayItems = parseItems(today);
  const blockerItems = parseItems(blockers);

  if (yesterdayItems.length === 0 && todayItems.length === 0 && blockerItems.length === 0) {
    return { error: "Add at least one line under yesterday, today or blockers." };
  }

  let dateLabel = "";
  if (includeDate) {
    if (String(dateIso).trim() === "") {
      return { error: "Pick a date for the standup, or switch the date off." };
    }
    const formatted = formatIsoDate(dateIso);
    if (!formatted) return { error: "That is not a real calendar date — use the yyyy-mm-dd picker." };
    dateLabel = formatted;
  }

  const titleParts = ["Daily standup"];
  if (team.trim() !== "") titleParts.push(`— ${team.trim()}`);
  if (dateLabel !== "") titleParts.push(`— ${dateLabel}`);
  const title = titleParts.join(" ");

  const header = [];
  if (format.id === "slack") header.push(`*${title}*`);
  else if (format.id === "markdown") header.push(`## ${title}`);
  else if (format.id === "jira") header.push(`h2. ${title}`);
  else header.push(title);
  if (name.trim() !== "") header.push(name.trim());

  const body = [
    renderBlock(format.id, "Yesterday", yesterdayItems, "Nothing to report"),
    renderBlock(format.id, "Today", todayItems, "Nothing planned yet"),
    renderBlock(format.id, "Blockers", blockerItems, "None"),
  ];

  const text = [header.join("\n"), ...body].join("\n\n");
  const charCount = text.length;
  const wordCount = text.split(/\s+/).filter((w) => w !== "").length;

  const overSlackLimit = format.id === "slack" && charCount > SLACK_CHAR_LIMIT;

  return {
    text,
    format,
    title,
    dateLabel,
    yesterdayItems,
    todayItems,
    blockerItems,
    itemCount: yesterdayItems.length + todayItems.length + blockerItems.length,
    charCount,
    wordCount,
    overSlackLimit,
    note: overSlackLimit
      ? `This message is ${charCount} characters — Slack rejects anything over ${SLACK_CHAR_LIMIT}. Trim it or split it in two.`
      : blockerItems.length > 0
        ? `${blockerItems.length} blocker${blockerItems.length === 1 ? "" : "s"} flagged — name an owner for each one so the scrum can resolve it.`
        : "",
  };
}
