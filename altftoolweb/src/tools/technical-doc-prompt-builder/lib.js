/**
 * Technical Doc Prompt Builder — assembles a structured LLM prompt for writing
 * developer documentation.
 *
 * Document types follow the Diátaxis framework (diataxis.fr) by Daniele
 * Procida, which divides documentation into four modes: tutorials (learning-
 * oriented), how-to guides (task-oriented), reference (information-oriented)
 * and explanation (understanding-oriented). Style rules encode the common core
 * of the Google developer documentation style guide and the Microsoft Writing
 * Style Guide: second person, present tense, active voice, sentence-case
 * headings.
 */

/**
 * Rule of thumb published by OpenAI in its tokenizer documentation:
 * one token corresponds to roughly 4 characters of common English text.
 */
export const CHARS_PER_TOKEN = 4;

/** Diátaxis document types with their canonical section outlines. */
export const DOC_TYPE_OPTIONS = [
  {
    id: "tutorial",
    label: "Tutorial (learning-oriented)",
    goal: "take a newcomer from zero to a small, guaranteed success by doing",
    sections: [
      "What you'll build and what you'll learn (one short paragraph)",
      "Prerequisites: exact versions, accounts and tools needed",
      "Setup: numbered steps to a verified starting point",
      "The lesson: small numbered steps, each with the expected visible result",
      "Checkpoints: how the learner confirms each stage worked",
      "Recap and where to go next",
    ],
  },
  {
    id: "how-to",
    label: "How-to guide (task-oriented)",
    goal: "help a competent user accomplish one specific real-world task",
    sections: [
      "Goal statement: the task this guide accomplishes, in one sentence",
      "Before you begin: prerequisites and assumptions",
      "Numbered steps to complete the task, one action per step",
      "Verification: how to confirm the task succeeded",
      "Troubleshooting: the most likely failures and their fixes",
    ],
  },
  {
    id: "reference",
    label: "Reference (information-oriented)",
    goal: "describe the machinery accurately and completely for lookup",
    sections: [
      "Overview: what this API/module/command does, in two sentences",
      "Complete listing: every parameter, field, flag or endpoint with type, default and constraints",
      "Return values / outputs and error codes",
      "Minimal usage example per item where helpful",
      "Notes on limits, versioning and deprecations",
    ],
  },
  {
    id: "explanation",
    label: "Explanation (understanding-oriented)",
    goal: "deepen understanding of how and why the system works as it does",
    sections: [
      "The question this document answers, stated up front",
      "Background and context: the problem space",
      "How it works: the design, its key decisions and trade-offs",
      "Alternatives considered and why they were rejected",
      "Implications for users and links to related how-tos and reference",
    ],
  },
];

export const AUDIENCE_OPTIONS = [
  {
    id: "beginner",
    label: "Developers new to this domain",
    instruction:
      "developers who are competent programmers but new to this domain — define domain jargon on first use and never assume prior product knowledge",
  },
  {
    id: "experienced",
    label: "Experienced developers",
    instruction:
      "experienced developers familiar with the domain — be concise, skip basics, and link concepts instead of re-explaining them",
  },
  {
    id: "ops",
    label: "Ops / SRE / platform engineers",
    instruction:
      "operations and platform engineers — emphasise configuration, failure modes, observability and rollback paths",
  },
  {
    id: "mixed",
    label: "Mixed technical and non-technical readers",
    instruction:
      "a mixed audience including non-developers — lead each section with a plain-language summary before any technical detail",
  },
];

export const CODE_STYLE_RULES = [
  "Every code block must be complete and runnable as shown — no ellipses, no undefined variables, no pseudo-code unless explicitly labelled as pseudo-code.",
  "State the language and any required version directly above each code block.",
  "Show the expected output or result immediately after each command or snippet.",
  "Use realistic placeholder values in ALL_CAPS (e.g. YOUR_API_KEY) and list them all in one place.",
];

/** Common core of the Google and Microsoft developer style guides. */
export const PROSE_STYLE_RULES = [
  "Write in second person (“you”), present tense, active voice.",
  "One idea per sentence; keep sentences under ~25 words where possible.",
  "Use sentence case for headings, and make every heading a verb phrase for task docs.",
  "Never say “simply”, “just”, “easy” or “obviously” — they alienate readers who are stuck.",
  "Spell out an abbreviation on first use, with the abbreviation in parentheses.",
];

/** Count words in a plain-text string; empty and whitespace-only strings count as 0. */
export function countWords(text) {
  if (typeof text !== "string") return 0;
  const trimmed = text.trim();
  if (trimmed === "") return 0;
  return trimmed.split(/\s+/).length;
}

/** Estimate LLM tokens from character count using the ~4 chars/token rule of thumb. */
export function estimateTokens(text) {
  if (typeof text !== "string" || text.length === 0) return 0;
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

/**
 * Build the documentation prompt.
 * Required: subject — the feature, API or system being documented. Without it
 * the prompt has nothing to document, so the builder refuses.
 */
export function buildDocPrompt({
  subject,
  product = "",
  docTypeId = "how-to",
  audienceId = "experienced",
  language = "",
  inScope = "",
  outOfScope = "",
  prerequisites = "",
  includeCode = true,
  includeDiagramHints = false,
}) {
  const subjectText = typeof subject === "string" ? subject.trim() : "";
  if (!subjectText) {
    return { error: "Describe what is being documented — the feature, API, command or system." };
  }

  const docType = DOC_TYPE_OPTIONS.find((d) => d.id === docTypeId) ?? DOC_TYPE_OPTIONS[1];
  const audience = AUDIENCE_OPTIONS.find((a) => a.id === audienceId) ?? AUDIENCE_OPTIONS[1];

  const lines = [];
  lines.push(
    `You are a senior technical writer. Write a ${docType.label.toLowerCase()} following the Diátaxis framework. Its single job is to ${docType.goal}.`,
  );
  lines.push("");
  lines.push(`Subject: ${subjectText}`);
  if (product.trim()) lines.push(`Product / project: ${product.trim()}`);
  lines.push(`Audience: ${audience.instruction}.`);
  if (language.trim()) lines.push(`Code examples: use ${language.trim()}.`);
  if (prerequisites.trim()) lines.push(`Assumed prerequisites: ${prerequisites.trim()}`);
  if (inScope.trim()) lines.push(`In scope: ${inScope.trim()}`);
  if (outOfScope.trim()) {
    lines.push(`Out of scope (state this explicitly near the top and do not cover it): ${outOfScope.trim()}`);
  }
  lines.push("");
  lines.push("Structure the document with these sections:");
  docType.sections.forEach((section, index) => {
    lines.push(`${index + 1}. ${section}`);
  });
  lines.push("");
  lines.push("Prose style (Google / Microsoft developer style guide conventions):");
  PROSE_STYLE_RULES.forEach((rule) => lines.push(`- ${rule}`));
  if (includeCode) {
    lines.push("");
    lines.push("Code example rules:");
    CODE_STYLE_RULES.forEach((rule) => lines.push(`- ${rule}`));
  } else {
    lines.push("");
    lines.push("Do not include code blocks; describe actions in prose and UI terms only.");
  }
  if (includeDiagramHints) {
    lines.push("");
    lines.push(
      "Where a diagram would help, insert a placeholder line in the form [DIAGRAM: one-sentence description of what it should show] instead of ASCII art.",
    );
  }
  lines.push("");
  lines.push(
    "Accuracy rule: use ONLY the facts supplied above. Where a required detail (a version, default, limit or URL) is not supplied, write TODO(author) with a note of what is missing — never invent it.",
  );

  const prompt = lines.join("\n");

  return {
    prompt,
    docTypeLabel: docType.label,
    sectionCount: docType.sections.length,
    audienceLabel: audience.label,
    promptWords: countWords(prompt),
    promptChars: prompt.length,
    estTokens: estimateTokens(prompt),
  };
}
