/**
 * Recruiting-assistant system prompt composer.
 *
 * Pure string assembly: the same configuration always produces the same prompt.
 * Section order follows the instruction-prompt layout used across this tool
 * family — identity, then context, then hard rules (fairness, privacy), then
 * output rules — so the constraints sit after the context needed to apply them.
 *
 * Regulatory background encoded in the rule text:
 * - US federal protected characteristics: race, colour, religion, sex and
 *   national origin (Title VII, Civil Rights Act 1964), age 40+ (ADEA),
 *   disability (ADA), genetic information (GINA).
 * - Automated hiring tools are regulated as high-risk: NYC Local Law 144
 *   requires bias audits of automated employment decision tools, and the EU
 *   AI Act lists employment/recruitment systems in its high-risk Annex III.
 *   Hence the mandatory human-decision rule is on by default.
 * - Privacy rules follow GDPR data-minimisation vocabulary (Art. 5(1)(c)).
 */

/** OpenAI's rule of thumb: roughly 4 characters per token for English prose. */
export const CHARS_PER_TOKEN = 4;

/** Warn-only budget: a system prompt is prepended to every request. */
export const DEFAULT_TOKEN_BUDGET = 900;

export const TONE_OPTIONS = {
  professional: {
    label: "Professional and neutral",
    line: "Write in a professional, neutral tone. No hype, no exclamation marks, no slang.",
  },
  warm: {
    label: "Warm and personal",
    line: "Write warmly and personally, as one person to another, while staying professional. Candidates should feel respected, not processed.",
  },
  concise: {
    label: "Brief and direct",
    line: "Be brief and direct. Short sentences, no filler, lead with the point.",
  },
};

export const TASK_OPTIONS = {
  jobDescriptions: "Draft job descriptions from a role brief: responsibilities, must-have skills, nice-to-haves, and what the team offers.",
  outreach: "Write first-touch and follow-up outreach messages personalised to the candidate's public professional background only.",
  screeningQuestions: "Design structured screening questions that map one-to-one to the stated job requirements.",
  interviewKits: "Build interview kits: competency areas, behavioural questions and a scoring rubric anchored to observable evidence.",
  candidateSummaries: "Summarise candidate materials against the job requirements, quoting the evidence for every claim.",
  offerComms: "Draft offer, rejection and keep-warm messages that are specific, kind and honest.",
};

export const FAIRNESS_RULES = {
  noProtectedInference:
    "Never infer, guess or use a candidate's race, colour, religion, sex, sexual orientation, gender identity, national origin, age, disability, pregnancy, marital status or genetic information — the protected characteristics under Title VII, the ADEA, the ADA and GINA — even when asked.",
  noProxyCriteria:
    "Never score or filter on proxies for protected traits: name, photo, postcode, graduation year, school prestige, career gaps, accent or visa status (beyond a stated work-authorisation requirement).",
  structuredCriteria:
    "Evaluate every candidate against the same written, job-related criteria. If a criterion is not in the job requirements, do not use it.",
  inclusiveLanguage:
    "Use inclusive language: no gender-coded wording, no age-coded wording ('digital native', 'recent graduate' unless legally required), and list only requirements that are genuinely necessary.",
  evidenceOnly:
    "Every judgement about a candidate must quote its evidence from their materials. If the evidence is not there, say 'not evidenced' rather than guessing.",
  humanDecision:
    "You never make or imply a hiring decision. You prepare drafts and structured summaries for a human recruiter, who makes every screening and hiring decision. Automated employment decisions are restricted by law in several jurisdictions (e.g. NYC Local Law 144, EU AI Act high-risk rules).",
};

export const PRIVACY_RULES = {
  dataMinimisation:
    "Use only the candidate data needed for the task at hand and nothing more (GDPR-style data minimisation). Do not ask for extra personal details.",
  noPIIEcho:
    "Never repeat a candidate's contact details, ID numbers, salary history or references into outputs that will be shared beyond the hiring team.",
  noBackgroundDigging:
    "Do not speculate about a candidate's personal life, health, family plans or finances, and do not suggest researching them outside their submitted materials and stated public professional profiles.",
  confidentiality:
    "Treat every candidate's application as confidential. Never mention one candidate's details when working on another candidate.",
  candidateRights:
    "If asked to do something that conflicts with these rules or with applicable employment or data-protection law, refuse and say which rule blocks it.",
};

const clean = (value) => String(value ?? "").trim();

/** Rough token estimate from the 4-characters-per-token rule of thumb. */
export function estimateTokens(text) {
  const chars = String(text ?? "").length;
  return { chars, tokens: Math.ceil(chars / CHARS_PER_TOKEN) };
}

/**
 * Build the recruiting-assistant system prompt.
 *
 * @param {object} config
 * @returns {{prompt: string, sections: Array, tokens: object, warnings: string[], completeness: number}|{error: string}}
 */
export function buildRecruiterPrompt(config = {}) {
  const company = clean(config.company);
  const rolesFocus = clean(config.rolesFocus);
  if (rolesFocus === "") {
    return { error: "Name the roles this assistant recruits for — without that, every draft is generic." };
  }

  const industry = clean(config.industry);
  const location = clean(config.location);
  const valuesNotes = clean(config.valuesNotes);
  const styleNotes = clean(config.styleNotes);

  const toneKey = TONE_OPTIONS[config.tone] ? config.tone : "professional";

  const tasks = Array.isArray(config.tasks) ? config.tasks.filter((key) => TASK_OPTIONS[key]) : [];
  if (tasks.length === 0) {
    return { error: "Pick at least one task — the assistant needs a job to do." };
  }

  const fairness = Array.isArray(config.fairnessRules)
    ? config.fairnessRules.filter((key) => FAIRNESS_RULES[key])
    : [];
  const privacy = Array.isArray(config.privacyRules)
    ? config.privacyRules.filter((key) => PRIVACY_RULES[key])
    : [];

  const budget = Number(config.tokenBudget ?? DEFAULT_TOKEN_BUDGET);
  if (!Number.isFinite(budget) || budget <= 0) {
    return { error: "The token budget must be a positive number." };
  }

  const sections = [];

  const identity = [
    `You are a recruiting assistant${company ? ` for ${company}` : ""}${industry ? `, a company in ${industry}` : ""}.`,
    `You support human recruiters hiring for: ${rolesFocus}.`,
    location ? `Hiring is based in ${location}; follow the employment norms and laws that apply there.` : "",
    "You draft and structure; humans decide.",
  ]
    .filter(Boolean)
    .join(" ");
  sections.push({ id: "identity", title: "Role", body: identity });

  if (valuesNotes) {
    sections.push({ id: "context", title: "Company context", body: valuesNotes });
  }

  sections.push({
    id: "tasks",
    title: "What you do",
    body: tasks.map((key) => `- ${TASK_OPTIONS[key]}`).join("\n"),
  });

  if (fairness.length > 0) {
    sections.push({
      id: "fairness",
      title: "Fairness rules (non-negotiable)",
      body: fairness.map((key) => `- ${FAIRNESS_RULES[key]}`).join("\n"),
    });
  }

  if (privacy.length > 0) {
    sections.push({
      id: "privacy",
      title: "Candidate privacy rules (non-negotiable)",
      body: privacy.map((key) => `- ${PRIVACY_RULES[key]}`).join("\n"),
    });
  }

  const output = [
    TONE_OPTIONS[toneKey].line,
    "Ask for the job requirements before drafting anything that depends on them.",
    "When you are unsure whether something is job-related, ask the recruiter instead of assuming.",
  ];
  if (styleNotes) output.push(styleNotes);
  sections.push({
    id: "output",
    title: "How to write",
    body: output.map((line) => `- ${line}`).join("\n"),
  });

  const prompt = sections
    .map((section) => (section.id === "identity" ? section.body : `## ${section.title}\n${section.body}`))
    .join("\n\n");

  const tokens = estimateTokens(prompt);

  const warnings = [];
  if (fairness.length === 0) {
    warnings.push(
      "No fairness rules selected. At minimum include the protected-characteristics rule and the human-decision rule — automated hiring decisions are legally restricted in several jurisdictions.",
    );
  } else if (!fairness.includes("humanDecision")) {
    warnings.push(
      "The human-decision rule is off. NYC Local Law 144 and the EU AI Act treat automated employment decisions as regulated/high-risk — keep a human deciding.",
    );
  }
  if (privacy.length === 0) {
    warnings.push("No privacy rules selected — candidate data will have no stated handling constraints.");
  }
  if (!company) warnings.push("No company named — outreach drafts will read as anonymous.");
  if (tokens.tokens > budget) {
    warnings.push(`The prompt is about ${tokens.tokens} tokens, above your ${budget}-token budget.`);
  }

  const filled = [
    company,
    rolesFocus,
    industry || location,
    valuesNotes,
    tasks.length > 0 ? "y" : "",
    fairness.length > 0 ? "y" : "",
    privacy.length > 0 ? "y" : "",
  ].filter((value) => clean(value) !== "").length;
  const completeness = Math.round((filled / 7) * 100);

  return { prompt, sections, tokens, warnings, completeness, toneKey };
}
