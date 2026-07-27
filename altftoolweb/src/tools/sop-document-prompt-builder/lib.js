/**
 * SOP Document Prompt Builder.
 *
 * Turns a procedure title, an owning role and a list of "Role: action" steps
 * into a prompt for a standard operating procedure that carries the document
 * control fields ISO 9001:2015 clause 7.5 expects (identification, review and
 * approval), a RACI responsibility table, and explicit control checks.
 *
 * Pure module: no React, no DOM, no clock reads. Dates arrive as arguments.
 */

/**
 * RACI assigns exactly one Accountable party per activity; Responsible,
 * Consulted and Informed may have several. Used to seed the roles table.
 */
export const RACI_ROLES = [
  { key: "R", label: "Responsible", meaning: "does the work in the step" },
  { key: "A", label: "Accountable", meaning: "answerable for the outcome — exactly one per step" },
  { key: "C", label: "Consulted", meaning: "two-way input before the step completes" },
  { key: "I", label: "Informed", meaning: "one-way notification after the step completes" },
];

/**
 * How often the SOP must be re-reviewed. ISO 9001:2015 clause 7.5.2 requires
 * documented information to be reviewed and approved for suitability; the
 * cycle length itself is a company policy choice, so all four are offered.
 */
export const REVIEW_CYCLES = [
  { id: "quarterly", label: "Quarterly", months: 3 },
  { id: "semiannual", label: "Every 6 months", months: 6 },
  { id: "annual", label: "Annually", months: 12 },
  { id: "biennial", label: "Every 2 years", months: 24 },
];

/** Risk tier drives how much verification and record-keeping the prompt demands. */
export const RISK_LEVELS = [
  {
    id: "low",
    label: "Low — internal, easily reversed",
    directive:
      "Keep verification light: one confirmation step at the end. No sign-off required.",
  },
  {
    id: "medium",
    label: "Medium — affects customers or money",
    directive:
      "Add a verification step after each control point, and a named reviewer sign-off before the procedure is considered complete.",
  },
  {
    id: "high",
    label: "High — safety, regulatory or irreversible",
    directive:
      "Add a verification step and a recorded evidence item (log entry, photo, signature) at every control point, a second-person check before any irreversible step, and a stop-work condition that halts the procedure.",
  },
];

/** Document control fields carried in the SOP header. */
export const DOCUMENT_CONTROL_FIELDS = [
  "Document ID",
  "Version",
  "Effective date",
  "Next review date",
  "Process owner",
  "Approver",
  "Revision history",
];

/** Practical bounds. */
export const LIMITS = {
  steps: { min: 1, max: 60 },
  /** More than this in one SOP usually means two procedures were merged. */
  recommendedMaxSteps: 20,
};

/** Roughly four characters per token for ordinary English prose. */
export const AVERAGE_CHARS_PER_TOKEN = 4;

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Proleptic Gregorian leap rule: divisible by 4, except centuries not by 400. */
function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function daysInMonth(year, monthIndex) {
  if (monthIndex === 1 && isLeapYear(year)) return 29;
  return DAYS_IN_MONTH[monthIndex];
}

function pad2(value) {
  return String(value).padStart(2, "0");
}

/**
 * Add whole months to an ISO date, clamping to the last valid day
 * (31 Jan + 1 month = 28 or 29 Feb).
 * @param {string} isoDate "YYYY-MM-DD"
 * @param {number} months whole months to add
 * @returns {{error:string}|{date:string}}
 */
export function addMonths(isoDate, months) {
  if (typeof isoDate !== "string" || !ISO_DATE_PATTERN.test(isoDate)) {
    return { error: "Enter the effective date as YYYY-MM-DD." };
  }
  if (!Number.isFinite(months) || !Number.isInteger(months) || months < 0) {
    return { error: "The review cycle must be a whole number of months." };
  }
  const [, yearText, monthText, dayText] = isoDate.match(ISO_DATE_PATTERN);
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  if (month < 1 || month > 12) return { error: "Month must be between 01 and 12." };
  if (day < 1 || day > daysInMonth(year, month - 1)) {
    return { error: `${isoDate} is not a real calendar date.` };
  }

  const totalMonths = (year * 12 + (month - 1)) + months;
  const targetYear = Math.floor(totalMonths / 12);
  const targetMonthIndex = totalMonths % 12;
  const targetDay = Math.min(day, daysInMonth(targetYear, targetMonthIndex));
  return { date: `${targetYear}-${pad2(targetMonthIndex + 1)}-${pad2(targetDay)}` };
}

export function getReviewCycle(id) {
  return REVIEW_CYCLES.find((cycle) => cycle.id === id) || null;
}

export function getRiskLevel(id) {
  return RISK_LEVELS.find((level) => level.id === id) || null;
}

function cleanLines(text) {
  if (typeof text !== "string") return [];
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "").trim())
    .filter((line) => line.length > 0);
}

/**
 * Parse "Role: action" step lines. The role prefix is optional; steps without
 * one are counted so the prompt can demand an owner for each.
 * @returns {{error:string}|{steps:Array<{number:number,role:string|null,action:string}>,roles:string[],unassigned:number}}
 */
export function parseSopSteps(text) {
  const lines = cleanLines(text);
  if (lines.length < LIMITS.steps.min) {
    return { error: "Add at least one step — one action per line, optionally as \"Role: action\"." };
  }
  if (lines.length > LIMITS.steps.max) {
    return {
      error: `Keep it to ${LIMITS.steps.max} steps — split anything longer into linked procedures.`,
    };
  }

  const roles = [];
  let unassigned = 0;
  const steps = lines.map((line, index) => {
    const separator = line.indexOf(":");
    let role = null;
    let action = line;
    // Treat a short prefix before the first colon as a role name, not prose.
    if (separator > 0 && separator <= 40) {
      const candidate = line.slice(0, separator).trim();
      const rest = line.slice(separator + 1).trim();
      if (candidate.length > 0 && rest.length > 0 && candidate.split(/\s+/).length <= 5) {
        role = candidate;
        action = rest;
      }
    }
    if (role) {
      if (!roles.includes(role)) roles.push(role);
    } else {
      unassigned += 1;
    }
    return { number: index + 1, role, action };
  });

  return { steps, roles, unassigned };
}

export function measureText(text) {
  if (typeof text !== "string" || text.trim().length === 0) {
    return { characters: 0, words: 0, approxTokens: 0 };
  }
  const characters = text.length;
  const words = text.trim().split(/\s+/).length;
  return {
    characters,
    words,
    approxTokens: Math.max(1, Math.ceil(characters / AVERAGE_CHARS_PER_TOKEN)),
  };
}

/**
 * Build the SOP prompt.
 * @returns {{error:string}|{text:string,...}}
 */
export function buildSopPrompt({
  title,
  scope,
  ownerRole,
  riskId,
  cycleId,
  effectiveDate,
  stepsText,
  notes,
} = {}) {
  const cleanTitle = typeof title === "string" ? title.trim() : "";
  if (!cleanTitle) return { error: "Enter the procedure title." };

  const owner = typeof ownerRole === "string" ? ownerRole.trim() : "";
  if (!owner) return { error: "Name the process owner — the role accountable for this SOP." };

  const risk = getRiskLevel(riskId);
  if (!risk) return { error: "Choose a risk level." };
  const cycle = getReviewCycle(cycleId);
  if (!cycle) return { error: "Choose a review cycle." };

  const nextReview = addMonths(effectiveDate, cycle.months);
  if (nextReview.error) return { error: nextReview.error };

  const parsed = parseSopSteps(stepsText);
  if (parsed.error) return { error: parsed.error };

  const scopeText = typeof scope === "string" && scope.trim() ? scope.trim() : "";
  const extra = typeof notes === "string" ? notes.trim() : "";
  const tooLong = parsed.steps.length > LIMITS.recommendedMaxSteps;

  const lines = [
    `Write a standard operating procedure titled "${cleanTitle}".`,
    "",
    `PROCESS OWNER (accountable role): ${owner}`,
    `RISK LEVEL: ${risk.label}`,
    risk.directive,
    `REVIEW CYCLE: ${cycle.label}. Effective ${effectiveDate}, next review due ${nextReview.date}.`,
  ];

  if (scopeText) {
    lines.push(`SCOPE: ${scopeText}`);
  } else {
    lines.push(
      "SCOPE: not supplied — open the document with an explicit scope statement covering what is in scope and, just as importantly, what is out of scope.",
    );
  }

  lines.push(
    "",
    "DOCUMENT HEADER — fill these control fields, leaving TODO(verify) where the value was not supplied:",
    ...DOCUMENT_CONTROL_FIELDS.map((field) => `- ${field}`),
    "",
    `PROCEDURE STEPS (${parsed.steps.length}) — expand each into a full instruction:`,
  );

  for (const step of parsed.steps) {
    lines.push(`${step.number}. [${step.role || "OWNER TBD"}] ${step.action}`);
  }

  if (parsed.roles.length > 0) {
    lines.push("", `ROLES NAMED IN THE STEPS (${parsed.roles.length}): ${parsed.roles.join(", ")}.`);
  }

  lines.push(
    "",
    "REQUIRED SECTIONS, in this order:",
    "1. Purpose — one sentence on why the procedure exists.",
    "2. Scope — what and who it covers, and what it excludes.",
    "3. Definitions — every term, abbreviation and system name used below.",
    "4. Responsibilities — a RACI table with one row per step:",
    ...RACI_ROLES.map((role) => `   - ${role.key} = ${role.label}: ${role.meaning}`),
    "5. Materials, systems and access needed before starting.",
    "6. Procedure — numbered steps, imperative mood, one action each, with the responsible role named in the step.",
    "7. Control checks — for each control point: what is checked, the acceptance criterion, and what to do when it fails.",
    "8. Records — what evidence each step produces, where it is stored and how long it is retained.",
    "9. Escalation — who to contact, in what time frame, when the procedure cannot be completed.",
    "10. Revision history table.",
    "",
    "RULES:",
    "- Exactly one Accountable role per step in the RACI table. If a step has two candidates, mark TODO(verify) and say why.",
    "- Every acceptance criterion must be measurable (a number, a state, a document that exists) — never \"looks correct\".",
    "- Do not invent system names, thresholds, retention periods or legal requirements. Use TODO(verify) instead.",
    "- Write for someone doing the job for the first time, with no prior context.",
  );

  if (parsed.unassigned > 0) {
    lines.push(
      `- ${parsed.unassigned} of the supplied steps have no role prefix. Propose the most likely responsible role for each and mark it TODO(verify).`,
    );
  }
  if (tooLong) {
    lines.push(
      `- This procedure has ${parsed.steps.length} steps, above the ${LIMITS.recommendedMaxSteps}-step guideline. Group them into named phases, and flag any block that should become its own SOP.`,
    );
  }
  if (extra) lines.push(`- ${extra}`);

  const text = lines.join("\n");
  return {
    text,
    risk,
    cycle,
    nextReviewDate: nextReview.date,
    steps: parsed.steps,
    stepCount: parsed.steps.length,
    roles: parsed.roles,
    roleCount: parsed.roles.length,
    unassigned: parsed.unassigned,
    tooLong,
    ...measureText(text),
  };
}
