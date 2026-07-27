/**
 * AI Usage Log for Assignments.
 *
 * Builds a submission-ready log of AI assistance for coursework. The fields
 * follow what academic-integrity policies commonly require when AI use is
 * permitted with declaration — e.g. the University of Melbourne, Monash,
 * Cambridge and many US honour codes ask students to record, per use:
 * which part of the work, which tool, what it was asked, how the output was
 * used, and the date. UNESCO's 2023 guidance on generative AI in education
 * makes the same "transparent declaration of use" recommendation.
 */

/** How the AI output was used — from lightest to heaviest reliance. */
export const USE_MODES = [
  { id: "brainstorm", label: "Brainstorming / idea generation" },
  { id: "research", label: "Background research or summarising sources" },
  { id: "explain", label: "Explaining a concept to me" },
  { id: "feedback", label: "Feedback on my draft" },
  { id: "editing", label: "Editing / proofreading my writing" },
  { id: "code-debug", label: "Debugging my code" },
  { id: "drafted", label: "Drafted text or code I then revised" },
  { id: "verbatim", label: "Output used verbatim (quoted and cited)" },
];

const MODE_LABELS = Object.fromEntries(USE_MODES.map((m) => [m.id, m.label]));

/** Maximum sensible entries in one log — guards runaway state. */
export const MAX_ENTRIES = 50;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Validate one entry. Returns null when valid, otherwise a message.
 * @param {{part:string, tool:string, modeId:string, prompt:string, date:string}} entry
 */
export function validateEntry(entry, index) {
  const n = index + 1;
  if (!entry || typeof entry !== "object") return `Entry ${n} is missing.`;
  if (!String(entry.part || "").trim()) return `Entry ${n}: say which part of the assignment the AI helped with.`;
  if (!String(entry.tool || "").trim()) return `Entry ${n}: name the AI tool used.`;
  if (!MODE_LABELS[entry.modeId]) return `Entry ${n}: choose how the output was used.`;
  if (entry.date && !DATE_PATTERN.test(entry.date)) return `Entry ${n}: the date must be in yyyy-mm-dd form.`;
  return null;
}

/**
 * Build the formatted usage log.
 * @param {object} input
 * @param {string} input.studentName   Optional.
 * @param {string} input.assignment    Assignment / unit title (required).
 * @param {string} input.course        Optional course code.
 * @param {Array}  input.entries       Log entries (at least 1).
 * @param {"markdown"|"plain"} [input.format]
 * @returns {{log:string, entryCount:number, toolsUsed:string[], heaviestUse:string}|{error:string}}
 */
export function buildUsageLog({ studentName = "", assignment, course = "", entries, format = "markdown" }) {
  const title = String(assignment || "").trim();
  if (!title) return { error: "Enter the assignment title." };
  if (!Array.isArray(entries) || entries.length === 0) {
    return { error: "Add at least one AI-use entry to the log." };
  }
  if (entries.length > MAX_ENTRIES) {
    return { error: `The log supports up to ${MAX_ENTRIES} entries.` };
  }
  for (let i = 0; i < entries.length; i += 1) {
    const problem = validateEntry(entries[i], i);
    if (problem) return { error: problem };
  }

  // Heaviest reliance shown in the summary = the entry latest in USE_MODES order.
  const modeRank = Object.fromEntries(USE_MODES.map((m, i) => [m.id, i]));
  const heaviest = entries.reduce(
    (acc, e) => (modeRank[e.modeId] > modeRank[acc] ? e.modeId : acc),
    entries[0].modeId,
  );

  const toolsUsed = [...new Set(entries.map((e) => String(e.tool).trim()))];

  const md = format === "markdown";
  const lines = [];
  lines.push(md ? `# AI Usage Log — ${title}` : `AI USAGE LOG — ${title}`);
  if (course.trim()) lines.push(`${md ? "**Course:**" : "Course:"} ${course.trim()}`);
  if (studentName.trim()) lines.push(`${md ? "**Student:**" : "Student:"} ${studentName.trim()}`);
  lines.push(
    `${md ? "**Declaration:**" : "Declaration:"} I used the AI tools listed below in preparing this submission. All other work is my own, and I remain responsible for the accuracy of the final submission.`,
  );
  lines.push("");

  entries.forEach((e, i) => {
    const head = `${i + 1}. ${String(e.part).trim()}`;
    lines.push(md ? `## ${head}` : head);
    lines.push(`${md ? "- **Tool:**" : "   Tool:"} ${String(e.tool).trim()}`);
    lines.push(`${md ? "- **How it was used:**" : "   How it was used:"} ${MODE_LABELS[e.modeId]}`);
    const prompt = String(e.prompt || "").trim();
    if (prompt) lines.push(`${md ? "- **What I asked:**" : "   What I asked:"} ${prompt}`);
    if (e.date) lines.push(`${md ? "- **Date:**" : "   Date:"} ${e.date}`);
    lines.push("");
  });

  lines.push(
    `${md ? "**Summary:**" : "Summary:"} ${entries.length} recorded use${entries.length === 1 ? "" : "s"} of ${toolsUsed.length} tool${toolsUsed.length === 1 ? "" : "s"} (${toolsUsed.join(", ")}).`,
  );

  return {
    log: lines.join("\n").trimEnd(),
    entryCount: entries.length,
    toolsUsed,
    heaviestUse: MODE_LABELS[heaviest],
  };
}
