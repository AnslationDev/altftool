/**
 * Research Summary Prompt Builder — assembles a prompt that makes an AI
 * assistant summarise a research paper into the sections of a structured
 * abstract (the IMRaD-derived format used by journals): background, research
 * question, method, findings, limitations and implications.
 *
 * The total summary length is split into per-section word budgets using
 * largest-remainder apportionment over fixed section weights, so section
 * budgets always sum exactly to the requested length. The prompt also carries
 * an anti-fabrication rule: anything not stated in the paper must be written
 * as "not reported", because AI summaries are known to invent details.
 */

/**
 * Summary sections with default weights (percent of the word budget).
 * Weights follow structured-abstract conventions: methods and findings carry
 * the most detail; framing sections stay short. Weights sum to 100.
 */
export const SECTIONS = [
  { id: "background", label: "Background & context", weight: 10, instruction: "why the study exists and the gap it addresses" },
  { id: "question", label: "Research question / hypothesis", weight: 10, instruction: "the exact question or hypothesis, as stated by the authors" },
  { id: "method", label: "Method", weight: 25, instruction: "design, sample and size, materials or data, procedure, and analysis approach" },
  { id: "findings", label: "Key findings", weight: 30, instruction: "main results with the actual numbers reported (effect sizes, confidence intervals, p-values) — never just \"significant\"" },
  { id: "limitations", label: "Limitations", weight: 15, instruction: "limitations the authors state, then (clearly separated) any obvious ones they do not mention" },
  { id: "implications", label: "Implications", weight: 10, instruction: "what the findings mean in practice and what the authors propose next" },
];

/** Word-budget bounds for one summary. */
export const MIN_TOTAL_WORDS = 100;
export const MAX_TOTAL_WORDS = 1500;

export const AUDIENCES = [
  { id: "expert", label: "Expert in the field" },
  { id: "student", label: "Student in an adjacent field" },
  { id: "layperson", label: "Educated non-specialist" },
];

/**
 * Largest-remainder apportionment over arbitrary positive weights:
 * split `total` whole words across `weights` so parts sum exactly to `total`.
 * Ties in fractional remainder go to the earlier section for determinism.
 */
export function apportionWords(total, weights) {
  const weightSum = weights.reduce((sum, weight) => sum + weight, 0);
  if (weightSum <= 0) return weights.map(() => 0);
  const quotas = weights.map((weight) => (total * weight) / weightSum);
  const counts = quotas.map((quota) => Math.floor(quota));
  let leftover = total - counts.reduce((sum, count) => sum + count, 0);
  const order = quotas
    .map((quota, index) => ({ index, frac: quota - Math.floor(quota) }))
    .sort((a, b) => b.frac - a.frac || a.index - b.index);
  for (let i = 0; leftover > 0 && i < order.length; i += 1) {
    counts[order[i].index] += 1;
    leftover -= 1;
  }
  return counts;
}

/**
 * Build the research-summary prompt.
 *
 * @param {object} input
 * @param {string} [input.field]        Research field (optional, sharpens vocabulary).
 * @param {number} input.totalWords     Target summary length in words.
 * @param {string[]} input.sectionIds   Ids from SECTIONS, at least method + findings recommended.
 * @param {string} input.audienceId     Id from AUDIENCES.
 * @param {boolean} [input.requireQuotes]  Require a page/section reference for each key claim.
 * @param {boolean} [input.glossary]       Add a jargon glossary at the end.
 * @returns {object} { prompt, budgets, totalWords } or { error }.
 */
export function buildResearchSummaryPrompt({
  field = "",
  totalWords,
  sectionIds,
  audienceId,
  requireQuotes = true,
  glossary = false,
}) {
  const total = Number(totalWords);
  if (!Number.isInteger(total) || total < MIN_TOTAL_WORDS || total > MAX_TOTAL_WORDS) {
    return { error: `Summary length must be a whole number between ${MIN_TOTAL_WORDS} and ${MAX_TOTAL_WORDS} words.` };
  }

  const chosen = Array.isArray(sectionIds)
    ? SECTIONS.filter((section) => sectionIds.includes(section.id))
    : [];
  if (chosen.length === 0) return { error: "Pick at least one summary section." };

  const audience = AUDIENCES.find((option) => option.id === audienceId);
  if (!audience) return { error: "Choose who the summary is for." };

  const words = apportionWords(total, chosen.map((section) => section.weight));
  const budgets = chosen.map((section, index) => ({
    id: section.id,
    label: section.label,
    words: words[index],
  }));

  const cleanField = typeof field === "string" ? field.trim() : "";

  const lines = [];
  lines.push(
    `You are a careful research analyst${cleanField ? ` in ${cleanField}` : ""}. Summarise the paper I paste below for a reader who is: ${audience.label.toLowerCase()}.`,
  );
  lines.push("");
  lines.push(`Write about ${total} words in total, in exactly these sections with these word budgets:`);
  for (let i = 0; i < chosen.length; i += 1) {
    lines.push(`- ${chosen[i].label} (~${budgets[i].words} words): ${chosen[i].instruction}.`);
  }
  lines.push("");
  lines.push("Accuracy rules (non-negotiable):");
  lines.push(
    "- Use ONLY what the paper states. If a detail (sample size, effect size, dates, funding) is not in the paper, write \"not reported\" — never estimate or fill in.",
  );
  lines.push("- Report numbers exactly as printed, with their units and uncertainty where given.");
  lines.push("- Keep the authors' claims separate from your assessment; label any assessment of your own explicitly.");
  lines.push("- Do not cite or mention any source other than this paper.");
  if (requireQuotes) {
    lines.push("- After each key claim, add the paper's section or page it comes from in parentheses, e.g. (Results, p. 7).");
  }
  if (audience.id === "layperson") {
    lines.push("- Define every technical term in plain words the first time it appears.");
  }
  if (glossary) {
    lines.push("");
    lines.push("After the summary, add a short glossary of up to 8 technical terms used in the paper.");
  }
  lines.push("");
  lines.push("Reply \"Ready\" and wait for the paper text (or PDF).");

  return {
    prompt: lines.join("\n"),
    budgets,
    totalWords: total,
    sectionCount: chosen.length,
    audience: audience.label,
  };
}
