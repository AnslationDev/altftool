/**
 * Essay Feedback Prompt Builder — assembles a prompt that makes an AI reviewer
 * give formative feedback on an essay, organised by dimension (structure,
 * evidence, clarity, argument, mechanics).
 *
 * The feedback protocol encoded in the prompt is "kind, specific, helpful" —
 * the critique norms popularised by Ron Berger's classroom critique protocol —
 * with every comment anchored to a quoted line and phrased as an actionable
 * revision, not a rewrite. The number of comments is budgeted from essay
 * length so short essays are not buried and long ones are not skimmed.
 */

/** Reviewable dimensions, each with what the reviewer must look at. */
export const FEEDBACK_DIMENSIONS = [
  {
    id: "structure",
    label: "Structure",
    focus: "thesis placement, paragraph order, topic sentences, transitions, and whether the conclusion answers the introduction",
  },
  {
    id: "evidence",
    label: "Evidence",
    focus: "whether each claim is supported, the quality and relevance of sources or examples, and whether quotes are analysed rather than dropped in",
  },
  {
    id: "clarity",
    label: "Clarity",
    focus: "sentence-level readability, wordiness, vague pronouns, jargon, and passive constructions that hide the actor",
  },
  {
    id: "argument",
    label: "Argument",
    focus: "logical consistency, unaddressed counterarguments, overgeneralisation, and gaps between evidence and conclusion",
  },
  {
    id: "mechanics",
    label: "Mechanics",
    focus: "grammar, punctuation and citation-format slips — noted briefly, never the main focus",
  },
];

/**
 * Comment budget: roughly one substantive comment per COMMENT_WORD_QUOTA words,
 * clamped to MIN/MAX. One comment per ~150 words keeps feedback dense enough to
 * act on without overwhelming the writer (typical marking guidance is a
 * handful of margin comments per page; a double-spaced page is ~250-300 words).
 */
export const COMMENT_WORD_QUOTA = 150;
export const MIN_COMMENTS = 3;
export const MAX_COMMENTS = 15;

/** Word-count bounds for a single-response review. */
export const MIN_WORDS = 50;
export const MAX_WORDS = 10000;

/** Compute the substantive-comment budget for an essay of `wordCount` words. */
export function computeCommentBudget(wordCount) {
  const words = Number(wordCount);
  if (!Number.isFinite(words) || words <= 0) return MIN_COMMENTS;
  return Math.min(MAX_COMMENTS, Math.max(MIN_COMMENTS, Math.round(words / COMMENT_WORD_QUOTA)));
}

/**
 * Build the essay-feedback prompt.
 *
 * @param {object} input
 * @param {string} input.essayType        e.g. "argumentative essay", "lab report".
 * @param {string} [input.assignmentBrief] What the essay was supposed to do (optional).
 * @param {number} input.wordCount        Approximate essay length in words.
 * @param {string[]} input.dimensionIds   Ids from FEEDBACK_DIMENSIONS, at least one.
 * @param {string} [input.audience]       Writer's level (optional).
 * @param {boolean} [input.includeSummary] Ask for an overall strengths/priorities summary.
 * @param {boolean} [input.noRewriting]   Forbid the AI from rewriting passages itself.
 * @returns {object} { prompt, commentBudget, dimensions } or { error }.
 */
export function buildEssayFeedbackPrompt({
  essayType,
  assignmentBrief = "",
  wordCount,
  dimensionIds,
  audience = "",
  includeSummary = true,
  noRewriting = true,
}) {
  const cleanType = typeof essayType === "string" ? essayType.trim() : "";
  if (!cleanType) return { error: "Say what kind of essay is being reviewed." };

  const words = Number(wordCount);
  if (!Number.isFinite(words) || !Number.isInteger(words) || words < MIN_WORDS || words > MAX_WORDS) {
    return { error: `Essay length must be a whole number between ${MIN_WORDS} and ${MAX_WORDS} words.` };
  }

  const chosen = Array.isArray(dimensionIds)
    ? FEEDBACK_DIMENSIONS.filter((dimension) => dimensionIds.includes(dimension.id))
    : [];
  if (chosen.length === 0) return { error: "Pick at least one feedback dimension." };

  const commentBudget = computeCommentBudget(words);
  const cleanBrief = typeof assignmentBrief === "string" ? assignmentBrief.trim() : "";
  const cleanAudience = typeof audience === "string" ? audience.trim() : "";

  const lines = [];
  lines.push(
    "You are an experienced writing teacher giving formative feedback. Your feedback must be kind, specific and helpful — it exists to make the next draft better, not to grade this one.",
  );
  lines.push("");
  lines.push(`I will paste a ${cleanType} of about ${words} words after this message.`);
  if (cleanBrief) lines.push(`The assignment brief was: ${cleanBrief}`);
  if (cleanAudience) lines.push(`The writer is: ${cleanAudience}.`);
  lines.push("");
  lines.push("Review ONLY these dimensions, in this order:");
  for (const dimension of chosen) {
    lines.push(`- ${dimension.label}: ${dimension.focus}.`);
  }
  lines.push("");
  lines.push("Feedback rules:");
  lines.push(
    `- Give exactly ${commentBudget} substantive comments in total, spread across the dimensions above (weight them toward the biggest problems).`,
  );
  lines.push('- Anchor every comment to the text: quote the exact phrase or sentence it refers to, in quotation marks.');
  lines.push(
    "- Phrase each comment as observation + why it matters + one concrete revision action the writer can take.",
  );
  lines.push("- Start with the two strongest things the essay does, each anchored to a quote.");
  if (noRewriting) {
    lines.push("- Do NOT rewrite sentences or paragraphs for the writer; describe the fix and let them write it.");
  }
  lines.push("- Do not comment on the writer's opinion or thesis position — only on how well it is executed.");
  if (includeSummary) {
    lines.push("");
    lines.push(
      "End with a \"Next draft priorities\" list: the top 3 actions, ordered by impact, each one line.",
    );
  }
  lines.push("");
  lines.push("Reply \"Ready\" and wait for the essay.");

  return {
    prompt: lines.join("\n"),
    commentBudget,
    wordCount: words,
    dimensions: chosen.map((dimension) => dimension.label),
  };
}
