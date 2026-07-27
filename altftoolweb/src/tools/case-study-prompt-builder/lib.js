/**
 * Case Study Prompt Builder — assembles a structured LLM prompt for writing a
 * business case study around the classic Problem → Approach → Result narrative.
 *
 * The framework structures encoded here follow widely documented case-study
 * conventions: the Problem–Solution–Result (PSR) format used across B2B content
 * marketing, the STAR method (Situation, Task, Action, Result) popularised in
 * behavioural interviewing and case writing, and the Challenge–Solution–Impact
 * variant common in consulting decks.
 */

/**
 * Rule of thumb published by OpenAI in its tokenizer documentation:
 * one token corresponds to roughly 4 characters of common English text.
 */
export const CHARS_PER_TOKEN = 4;

/** Word-count bands reflect common published guidance that case studies run ~500–1,500 words. */
export const LENGTH_OPTIONS = [
  { id: "brief", label: "Brief (one-pager)", words: 500 },
  { id: "standard", label: "Standard", words: 1000 },
  { id: "deep", label: "Deep dive", words: 1800 },
];

export const FRAMEWORK_OPTIONS = [
  {
    id: "psr",
    label: "Problem – Solution – Result",
    sections: [
      "Executive summary (2–3 sentences)",
      "Client background and context",
      "The problem and its business cost",
      "The approach / solution, step by step",
      "Measurable results with before/after numbers",
      "Client quote or testimonial",
      "Key takeaways and call to action",
    ],
  },
  {
    id: "star",
    label: "STAR (Situation, Task, Action, Result)",
    sections: [
      "Situation: the client's context and constraints",
      "Task: the specific objective and success criteria",
      "Action: what was done, in sequence, and why",
      "Result: quantified outcomes against the success criteria",
      "Lessons learned",
    ],
  },
  {
    id: "csi",
    label: "Challenge – Solution – Impact",
    sections: [
      "The challenge, framed from the customer's point of view",
      "Why previous attempts or alternatives fell short",
      "The solution and how it was implemented",
      "Impact: metrics, timeline to value, and qualitative wins",
      "What's next for the client",
    ],
  },
];

export const TONE_OPTIONS = [
  { id: "professional", label: "Professional and factual" },
  { id: "conversational", label: "Conversational" },
  { id: "executive", label: "Executive brief (crisp, numbers-first)" },
  { id: "storytelling", label: "Narrative / storytelling" },
];

export const AUDIENCE_OPTIONS = [
  { id: "buyers", label: "Prospective buyers / decision makers" },
  { id: "technical", label: "Technical evaluators" },
  { id: "internal", label: "Internal stakeholders / leadership" },
  { id: "press", label: "Press and analysts" },
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
 * Build the case study prompt.
 * Required: problem, approach, results — a case study without all three has no
 * narrative spine, so the builder refuses rather than emitting a hollow prompt.
 */
export function buildCaseStudyPrompt({
  clientName = "",
  industry = "",
  offering = "",
  problem,
  approach,
  results,
  metrics = "",
  frameworkId = "psr",
  toneId = "professional",
  audienceId = "buyers",
  lengthId = "standard",
  includeQuote = true,
  anonymise = false,
}) {
  const problemText = typeof problem === "string" ? problem.trim() : "";
  const approachText = typeof approach === "string" ? approach.trim() : "";
  const resultsText = typeof results === "string" ? results.trim() : "";

  if (!problemText) return { error: "Describe the problem the client faced — it is the core of the case study." };
  if (!approachText) return { error: "Describe the approach or solution — what was actually done." };
  if (!resultsText) return { error: "Describe the results — a case study needs at least one outcome." };

  const framework =
    FRAMEWORK_OPTIONS.find((f) => f.id === frameworkId) ?? FRAMEWORK_OPTIONS[0];
  const tone = TONE_OPTIONS.find((t) => t.id === toneId) ?? TONE_OPTIONS[0];
  const audience =
    AUDIENCE_OPTIONS.find((a) => a.id === audienceId) ?? AUDIENCE_OPTIONS[0];
  const length =
    LENGTH_OPTIONS.find((l) => l.id === lengthId) ?? LENGTH_OPTIONS[1];

  const clientLabel = anonymise
    ? "an anonymised client (use a descriptive stand-in such as “a mid-size logistics company”; never invent a real-sounding name)"
    : clientName.trim() || "the client (name not provided — use a neutral descriptor)";

  const lines = [];
  lines.push(
    `You are an experienced B2B content writer. Write a business case study of about ${length.words} words.`,
  );
  lines.push("");
  lines.push(`Audience: ${audience.label}.`);
  lines.push(`Tone: ${tone.label}.`);
  lines.push(`Subject: ${clientLabel}${industry.trim() ? `, operating in ${industry.trim()}` : ""}.`);
  if (offering.trim()) {
    lines.push(`Product / service featured: ${offering.trim()}.`);
  }
  lines.push("");
  lines.push(`Structure the case study using the ${framework.label} framework, with these sections:`);
  framework.sections.forEach((section, index) => {
    lines.push(`${index + 1}. ${section}`);
  });
  lines.push("");
  lines.push("Source facts (use ONLY these facts; do not invent numbers, names or outcomes):");
  lines.push(`- Problem: ${problemText}`);
  lines.push(`- Approach: ${approachText}`);
  lines.push(`- Results: ${resultsText}`);
  if (metrics.trim()) {
    lines.push(`- Key metrics to feature verbatim: ${metrics.trim()}`);
  }
  lines.push("");
  lines.push("Rules:");
  lines.push("- Lead every results claim with the concrete number from the source facts; if no number exists, describe the outcome qualitatively without inventing one.");
  if (includeQuote) {
    lines.push("- Include one placeholder pull-quote marked [CLIENT QUOTE HERE] where a testimonial fits best — do not fabricate a quote.");
  } else {
    lines.push("- Do not include any client quotes or testimonials.");
  }
  lines.push("- Write scannable prose: short paragraphs, descriptive subheadings, and a bolded key metric per section where one exists.");
  lines.push("- End with a one-line summary a salesperson could read aloud in ten seconds.");

  const prompt = lines.join("\n");

  return {
    prompt,
    frameworkLabel: framework.label,
    sectionCount: framework.sections.length,
    targetWords: length.words,
    promptWords: countWords(prompt),
    promptChars: prompt.length,
    estTokens: estimateTokens(prompt),
  };
}
