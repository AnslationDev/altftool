/**
 * AI Resume Prompt Builder.
 *
 * Assembles a structured resume-rewriting prompt. The prompt structure follows
 * established prompt-engineering practice for career documents:
 *  - role + audience framing ("act as an experienced recruiter for X"),
 *  - explicit task and output format,
 *  - the XYZ achievement formula popularised by Google recruiting
 *    ("Accomplished [X] as measured by [Y], by doing [Z]") for bullets,
 *  - ATS constraints (standard section names, no tables/graphics, keywords
 *    mirrored from the job description) that applicant-tracking parsers need,
 *  - a strict no-fabrication instruction, the main failure mode of AI resume
 *    rewriting.
 */

/** What the user wants the AI to do. */
export const TASKS = [
  {
    id: "bullets",
    label: "Rewrite my experience bullets",
    instruction:
      "Rewrite each bullet point I provide using the XYZ formula — 'Accomplished [X] as measured by [Y], by doing [Z]' — starting each with a strong past-tense action verb. Keep each bullet under 30 words.",
  },
  {
    id: "summary",
    label: "Write my professional summary",
    instruction:
      "Write a 3-4 line professional summary that leads with my title and years of experience, names my 2-3 strongest quantified achievements, and ends with the value I bring to the target role. No first-person pronouns, no clichés like 'results-driven' or 'team player'.",
  },
  {
    id: "tailor",
    label: "Tailor my resume to a job description",
    instruction:
      "Compare my resume against the job description I provide. Identify the top requirements, mirror the exact keywords the description uses where I genuinely have that experience, reorder and rewrite bullets to foreground the most relevant achievements, and list any important requirement I do not currently evidence so I can address it honestly.",
  },
  {
    id: "full",
    label: "Restructure the full resume",
    instruction:
      "Restructure my full resume: a professional summary, a skills section with the most relevant hard skills, and experience in reverse-chronological order with 3-5 XYZ-formula bullets per role. Use standard section headings (Summary, Skills, Experience, Education) so applicant tracking systems parse it cleanly.",
  },
];

export const SENIORITY_OPTIONS = [
  { id: "entry", label: "Entry level / new graduate", phrase: "an entry-level candidate — emphasise internships, projects, coursework and transferable skills over job titles" },
  { id: "mid", label: "Mid-level (3-7 years)", phrase: "a mid-level professional — emphasise ownership, measurable outcomes and growing scope" },
  { id: "senior", label: "Senior (8-14 years)", phrase: "a senior professional — emphasise leadership, cross-team impact, and business results over task lists" },
  { id: "executive", label: "Executive / leadership", phrase: "an executive — emphasise strategy, P&L or budget scale, organisational change and board-level outcomes" },
];

export const TONE_OPTIONS = [
  { id: "impact", label: "Impact-focused (default)", phrase: "confident and achievement-led" },
  { id: "conservative", label: "Conservative / formal", phrase: "formal and understated, suited to law, finance or government" },
  { id: "dynamic", label: "Dynamic / startup", phrase: "energetic and direct, suited to startups and product teams" },
];

const MAX_TEXT = 4000;

/**
 * Build the resume prompt.
 * @param {object} input
 * @param {string} input.taskId       One of TASKS ids.
 * @param {string} input.role         Target role (required).
 * @param {string} input.seniorityId  One of SENIORITY_OPTIONS ids.
 * @param {string} [input.industry]   Target industry.
 * @param {string} input.toneId       One of TONE_OPTIONS ids.
 * @param {string} [input.metrics]    Achievements / numbers to work in.
 * @param {string} [input.keywords]   Comma-separated ATS keywords.
 * @param {boolean} [input.hasJobDescription] Whether the user will paste a JD (required for tailor).
 * @returns {{prompt:string, checklist:string[]}|{error:string}}
 */
export function buildResumePrompt({
  taskId,
  role,
  seniorityId,
  industry = "",
  toneId,
  metrics = "",
  keywords = "",
  hasJobDescription = false,
}) {
  const task = TASKS.find((t) => t.id === taskId);
  const seniority = SENIORITY_OPTIONS.find((s) => s.id === seniorityId);
  const tone = TONE_OPTIONS.find((t) => t.id === toneId);
  if (!task || !seniority || !tone) {
    return { error: "Choose a task, seniority level and tone from the lists." };
  }
  const targetRole = String(role || "").trim();
  if (!targetRole) return { error: "Enter the role you are applying for." };
  if (targetRole.length > 200) return { error: "Keep the role under 200 characters." };
  for (const [label, v] of [["industry", industry], ["achievements", metrics], ["keywords", keywords]]) {
    if (String(v).length > MAX_TEXT) return { error: `Keep the ${label} field under ${MAX_TEXT} characters.` };
  }
  if (task.id === "tailor" && !hasJobDescription) {
    return { error: "Tailoring needs a job description — confirm you will paste one below the prompt." };
  }

  const industryNote = String(industry).trim();
  const metricNote = String(metrics).trim();
  const keywordList = String(keywords)
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  const lines = [];
  lines.push(
    `Act as an experienced recruiter and resume writer for ${targetRole} positions${industryNote ? ` in the ${industryNote} industry` : ""}. I am ${seniority.phrase}.`,
  );
  lines.push("");
  lines.push(`Task: ${task.instruction}`);
  lines.push("");
  lines.push(`Tone: ${tone.phrase}.`);
  if (metricNote) {
    lines.push(
      `Work these real achievements and numbers in where they fit best (do not exaggerate them): ${metricNote}.`,
    );
  }
  if (keywordList.length > 0) {
    lines.push(
      `Naturally incorporate these keywords for applicant tracking systems, only where they truthfully apply: ${keywordList.join(", ")}.`,
    );
  }
  lines.push(
    "Hard rules: never invent employers, titles, dates, metrics or credentials — if a bullet lacks a number, ask me for one instead of fabricating it. Keep formatting ATS-safe: plain text, standard headings, no tables, columns or graphics.",
  );
  lines.push("");
  lines.push(
    task.id === "tailor"
      ? "I will paste my current resume and the job description below."
      : "I will paste my current resume (or the bullets to rewrite) below.",
  );

  const checklist = [
    "Paste your real resume text after the prompt — the AI cannot improve what it cannot see.",
    "Verify every number and claim in the output; delete anything you cannot defend in an interview.",
    keywordList.length > 0
      ? "Check the keywords appear naturally, not stuffed — recruiters read the resume after the ATS does."
      : "Pull 5-10 keywords from the job description and add them for a stronger ATS match.",
    "Read the result aloud once — AI phrasing that sounds generic should be rewritten in your voice.",
  ];

  const prompt = lines.join("\n");

  return {
    prompt,
    checklist,
    wordCount: countWords(prompt),
    keywordCount: keywordList.length,
    taskLabel: task.label,
    seniorityLabel: seniority.label,
    toneLabel: tone.label,
    targetRole,
  };
}

/** Whitespace-delimited word count, used only for the "how long is this prompt" readout. */
export function countWords(text) {
  const trimmed = String(text || "").trim();
  if (trimmed === "") return 0;
  return trimmed.split(/\s+/).length;
}
