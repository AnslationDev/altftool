/**
 * Statuses from Michael Nygard's original ADR template (2011). An ADR is never
 * edited once accepted: it is superseded by a later record instead.
 */
export const ADR_STATUSES = [
  { key: "proposed", label: "Proposed", hint: "Written up, not yet agreed." },
  { key: "accepted", label: "Accepted", hint: "Agreed and in force." },
  { key: "rejected", label: "Rejected", hint: "Considered and turned down — keep the record." },
  { key: "deprecated", label: "Deprecated", hint: "No longer applies, nothing replaced it." },
  { key: "superseded", label: "Superseded", hint: "Replaced by a later ADR — link it." },
];

/**
 * Two widely used record shapes:
 *  - "nygard": Title / Status / Context / Decision / Consequences (2011)
 *  - "madr":   MADR 4.0 — adds decision drivers, considered options and
 *              per-option pros and cons.
 */
export const ADR_FORMATS = [
  { key: "nygard", label: "Nygard (short)", requiresOptions: false },
  { key: "madr", label: "MADR 4.0 (with options)", requiresOptions: true },
];

/** ADR files are conventionally numbered with four digits: 0001-title.md */
export const ADR_NUMBER_WIDTH = 4;

/** Highest ADR number the four-digit convention can express. */
export const MAX_ADR_NUMBER = 9999;

export const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Validate an ISO date and confirm the calendar day exists. */
export function isValidIsoDate(value) {
  const match = ISO_DATE_RE.exec(String(value == null ? "" : value).trim());
  if (!match) return false;
  const [, y, m, d] = match;
  const date = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
  return (
    date.getUTCFullYear() === Number(y) &&
    date.getUTCMonth() === Number(m) - 1 &&
    date.getUTCDate() === Number(d)
  );
}

/** Zero-pad an ADR number to the conventional four digits. */
export function formatAdrNumber(number, width = ADR_NUMBER_WIDTH) {
  const value = Number(number);
  if (!Number.isFinite(value) || !Number.isInteger(value) || value < 0) {
    return { error: "ADR number must be a whole number of 0 or more." };
  }
  if (value > MAX_ADR_NUMBER) {
    return { error: `ADR number must be ${MAX_ADR_NUMBER} or lower.` };
  }
  return { id: String(value).padStart(Math.max(1, width), "0") };
}

/** Lowercase, dash-separated file-name stem, capped at 60 characters. */
export function slugifyTitle(title) {
  return String(title == null ? "" : title)
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
}

/** Build the conventional ADR file name, e.g. 0007-use-postgres-for-billing.md */
export function adrFileName({ number, title }) {
  const padded = formatAdrNumber(number);
  if (padded.error) return padded;
  const slug = slugifyTitle(title);
  if (!slug) return { error: "Give the decision a title so the file can be named." };
  return { fileName: `${padded.id}-${slug}.md` };
}

const clean = (value) => String(value == null ? "" : value).trim();

function bulletList(items, fallback) {
  const list = (Array.isArray(items) ? items : [])
    .map(clean)
    .filter((item) => item !== "");
  if (list.length === 0) return [fallback];
  return list.map((item) => `- ${item}`);
}

/**
 * Render an architecture decision record.
 *
 * @param {object} input
 * @returns {{ markdown: string, fileName: string, id: string, wordCount: number,
 *   optionCount: number } | { error: string }}
 */
export function generateAdr(input = {}) {
  const {
    number = 1,
    title = "",
    status = "proposed",
    date = "2026-01-01",
    deciders = [],
    format = "nygard",
    context = "",
    drivers = [],
    options = [],
    chosenOptionIndex = 0,
    decision = "",
    rationale = "",
    positive = [],
    negative = [],
    supersedes = "",
    links = [],
  } = input;

  const titleText = clean(title);
  if (titleText === "") return { error: "Give the decision a title, e.g. “Use PostgreSQL for billing”." };

  const naming = adrFileName({ number, title: titleText });
  if (naming.error) return naming;
  const padded = formatAdrNumber(number);
  if (padded.error) return padded;

  if (!isValidIsoDate(date)) {
    return { error: "Decision date must be a real date in YYYY-MM-DD format." };
  }

  const statusEntry = ADR_STATUSES.find((item) => item.key === status);
  if (!statusEntry) return { error: "Pick a status: proposed, accepted, rejected, deprecated or superseded." };

  const formatEntry = ADR_FORMATS.find((item) => item.key === format);
  if (!formatEntry) return { error: "Pick a record format: nygard or madr." };

  const cleanOptions = (Array.isArray(options) ? options : [])
    .map((option, i) => ({
      i,
      name: clean(option && option.name),
      pros: clean(option && option.pros),
      cons: clean(option && option.cons),
    }))
    .filter((option) => option.name !== "");

  if (formatEntry.requiresOptions && cleanOptions.length < 2) {
    return { error: "MADR compares alternatives — list at least two considered options." };
  }

  if (clean(context) === "") {
    return { error: "Describe the context: the forces and constraints that make this a decision." };
  }

  const matchIdx = cleanOptions.findIndex((o) => o.i === chosenOptionIndex);
  const chosenIndex = matchIdx !== -1 ? matchIdx : 0;
  const chosenName = cleanOptions.length > 0 ? cleanOptions[chosenIndex].name : "";
  const decisionText = clean(decision) || (chosenName ? `Adopt ${chosenName}.` : "");

  if (decisionText === "") {
    return { error: "State the decision in one sentence, in the active voice: “We will …”." };
  }

  const deciderList = (Array.isArray(deciders) ? deciders : [])
    .map(clean)
    .filter((item) => item !== "");

  const statusLine =
    statusEntry.key === "superseded" && clean(supersedes)
      ? `${statusEntry.label} by ${clean(supersedes)}`
      : statusEntry.label;

  const lines = [`# ${padded.id}. ${titleText}`, ""];
  lines.push(`- Status: ${statusLine}`);
  lines.push(`- Date: ${date}`);
  if (deciderList.length > 0) lines.push(`- Deciders: ${deciderList.join(", ")}`);
  lines.push("");

  if (formatEntry.key === "madr") {
    lines.push("## Context and Problem Statement", "", clean(context), "");
    lines.push("## Decision Drivers", "", ...bulletList(drivers, "- (none recorded)"), "");
    lines.push("## Considered Options", "");
    cleanOptions.forEach((option, index) => {
      lines.push(`${index + 1}. ${option.name}${index === chosenIndex ? " — chosen" : ""}`);
    });
    lines.push("", "## Decision Outcome", "", decisionText, "");
    if (clean(rationale)) lines.push(clean(rationale), "");
    const goods = (Array.isArray(positive) ? positive : []).map(clean).filter(Boolean);
    const bads = (Array.isArray(negative) ? negative : []).map(clean).filter(Boolean);
    lines.push("### Consequences", "");
    if (goods.length === 0 && bads.length === 0) lines.push("- (not yet recorded)");
    lines.push(...goods.map((item) => `- Good, because ${item}`));
    lines.push(...bads.map((item) => `- Bad, because ${item}`));
    lines.push("", "## Pros and Cons of the Options", "");
    cleanOptions.forEach((option) => {
      lines.push(`### ${option.name}`, "");
      if (option.pros) lines.push(`- Good, because ${option.pros}`);
      if (option.cons) lines.push(`- Bad, because ${option.cons}`);
      if (!option.pros && !option.cons) lines.push("- (not yet assessed)");
      lines.push("");
    });
  } else {
    lines.push("## Context", "", clean(context), "");
    if (cleanOptions.length > 0) {
      lines.push("### Options considered", "");
      cleanOptions.forEach((option, index) => {
        const detail = [option.pros ? `pro: ${option.pros}` : "", option.cons ? `con: ${option.cons}` : ""]
          .filter(Boolean)
          .join("; ");
        lines.push(`- ${option.name}${index === chosenIndex ? " (chosen)" : ""}${detail ? ` — ${detail}` : ""}`);
      });
      lines.push("");
    }
    lines.push("## Decision", "", decisionText, "");
    if (clean(rationale)) lines.push(clean(rationale), "");
    lines.push("## Consequences", "");
    lines.push("**Positive**", "", ...bulletList(positive, "- (none recorded)"), "");
    lines.push("**Negative**", "", ...bulletList(negative, "- (none recorded)"), "");
  }

  const linkList = (Array.isArray(links) ? links : []).map(clean).filter((item) => item !== "");
  if (linkList.length > 0) {
    lines.push("## Links", "", ...linkList.map((link) => `- ${link}`), "");
  }

  const markdown = `${lines.join("\n").replace(/\n{3,}/g, "\n\n").trim()}\n`;
  const wordCount = markdown.split(/\s+/).filter(Boolean).length;

  return {
    markdown,
    fileName: naming.fileName,
    id: padded.id,
    status: statusLine,
    format: formatEntry.key,
    optionCount: cleanOptions.length,
    wordCount,
  };
}
