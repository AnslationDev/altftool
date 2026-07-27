/**
 * Commit Message Prompt Builder.
 *
 * Builds a Conventional Commits header preview from type / scope / breaking
 * flag, checks it against the 50-character-subject and 72-character-hard-cap
 * conventions, and writes a commit-message prompt around a pasted diff
 * summary.
 */

/**
 * Commit types. "feat" and "fix" are defined by the Conventional Commits
 * v1.0.0 specification itself; the rest are the additional types the spec
 * recommends via the Angular convention (@commitlint/config-conventional).
 */
export const COMMIT_TYPES = [
  { id: "feat", label: "feat — a new feature (SemVer MINOR)" },
  { id: "fix", label: "fix — a bug fix (SemVer PATCH)" },
  { id: "docs", label: "docs — documentation only" },
  { id: "style", label: "style — formatting, no code meaning change" },
  { id: "refactor", label: "refactor — neither fixes a bug nor adds a feature" },
  { id: "perf", label: "perf — improves performance" },
  { id: "test", label: "test — adds or corrects tests" },
  { id: "build", label: "build — build system or dependencies" },
  { id: "ci", label: "ci — CI configuration" },
  { id: "chore", label: "chore — other changes not touching src or tests" },
  { id: "revert", label: "revert — reverts a previous commit" },
];

/**
 * The "50/72" git convention (popularised by Tim Pope's 2008 note on commit
 * messages, echoed in the git book): subject aims for <=50 characters,
 * 72 is the practical hard cap before git log/GitHub truncate, and body
 * lines wrap at 72.
 */
export const SUBJECT_SOFT_LIMIT = 50;
export const SUBJECT_HARD_LIMIT = 72;
export const BODY_WRAP_COLUMN = 72;

export const LIMITS = { summaryChars: { min: 10, max: 4000 } };

/** About four characters per token for ordinary English prose. */
export const AVERAGE_CHARS_PER_TOKEN = 4;

/** Conventional Commits scope: a noun in parentheses, e.g. feat(parser). */
const SCOPE_PATTERN = /^[a-z0-9][a-z0-9._\/-]*$/i;

export function getCommitType(typeId) {
  return COMMIT_TYPES.find((type) => type.id === typeId) || null;
}

/**
 * Build the Conventional Commits header preview and length verdicts.
 * `description` may be empty — the header is then shown with a placeholder
 * and lengths are computed for the fixed part only.
 * @returns {{error:string}|{header:string, fixedLength:number, room:number, warnings:string[]}}
 */
export function buildHeaderPreview({ typeId, scope, breaking, description } = {}) {
  const type = getCommitType(typeId);
  if (!type) return { error: "Choose a commit type." };
  const scopeText = typeof scope === "string" ? scope.trim() : "";
  if (scopeText && !SCOPE_PATTERN.test(scopeText)) {
    return { error: "Scope must be a short noun like parser or api — letters, digits, ., _, -, / only." };
  }
  const descriptionText = typeof description === "string" ? description.trim() : "";

  const prefix = `${type.id}${scopeText ? `(${scopeText})` : ""}${breaking ? "!" : ""}: `;
  const header = prefix + (descriptionText || "<description>");
  const fixedLength = prefix.length;
  const headerLength = prefix.length + (descriptionText ? descriptionText.length : 0);
  const room = SUBJECT_SOFT_LIMIT - fixedLength;

  const warnings = [];
  if (room < 20) {
    warnings.push(
      `The prefix "${prefix.trim()}" already uses ${fixedLength} of ${SUBJECT_SOFT_LIMIT} subject characters — a shorter scope leaves the description more room.`,
    );
  }
  if (descriptionText) {
    if (headerLength > SUBJECT_HARD_LIMIT) {
      warnings.push(
        `Header is ${headerLength} characters — beyond the ${SUBJECT_HARD_LIMIT}-character hard cap it gets truncated in git log and GitHub.`,
      );
    } else if (headerLength > SUBJECT_SOFT_LIMIT) {
      warnings.push(
        `Header is ${headerLength} characters — over the ${SUBJECT_SOFT_LIMIT}-character convention, still under the ${SUBJECT_HARD_LIMIT} cap.`,
      );
    }
    if (/\.\s*$/.test(descriptionText)) {
      warnings.push("Drop the trailing full stop — the convention omits it in the subject.");
    }
    if (/^[A-Z]/.test(descriptionText)) {
      warnings.push("Conventional Commits descriptions start lower-case (\"add\", not \"Add\").");
    }
  }

  return { header, prefix, fixedLength, headerLength, room, warnings, type, scope: scopeText, breaking: Boolean(breaking) };
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
 * Write the commit-message prompt around the diff summary.
 * @returns {{error:string}|{text:string, preview:object}}
 */
export function buildCommitPrompt({ diffSummary, breakingDetail, issueRef, preview } = {}) {
  if (!preview || preview.error) return { error: preview?.error || "Set a valid header first." };
  const summary = typeof diffSummary === "string" ? diffSummary.trim() : "";
  if (summary.length < LIMITS.summaryChars.min) {
    return { error: "Describe or paste what changed — at least a sentence, or the prompt has nothing to work from." };
  }
  if (summary.length > LIMITS.summaryChars.max) {
    return { error: `Keep the change summary under ${LIMITS.summaryChars.max.toLocaleString("en-US")} characters — summarise the diff, don't paste all of it.` };
  }
  if (preview.breaking && !(typeof breakingDetail === "string" && breakingDetail.trim())) {
    return { error: "You marked this breaking — say what breaks, so the BREAKING CHANGE footer has real content." };
  }
  const breakingText = typeof breakingDetail === "string" ? breakingDetail.trim() : "";
  const issue = typeof issueRef === "string" ? issueRef.trim() : "";

  const lines = [
    "Write one git commit message in Conventional Commits v1.0.0 format for the change below.",
    "",
    `HEADER FORMAT: exactly "${preview.prefix}<description>".`,
    `- Description: imperative mood, lower-case start, no trailing period ("add", not "added" or "adds").`,
    `- Keep the whole header at or under ${SUBJECT_SOFT_LIMIT} characters if possible (${SUBJECT_HARD_LIMIT} is the hard cap); the fixed prefix already takes ${preview.fixedLength}.`,
    "",
    "BODY:",
    `- Blank line after the header, then 1–3 short paragraphs wrapped at ${BODY_WRAP_COLUMN} columns.`,
    "- Explain WHAT changed and WHY — the diff already shows how.",
    "- Mention user-visible behaviour changes before internal ones.",
  ];
  if (preview.breaking) {
    lines.push(
      "",
      "FOOTER (required):",
      `- "BREAKING CHANGE: " followed by what breaks and the migration, based on: ${breakingText}`,
    );
  }
  if (issue) {
    lines.push(preview.breaking ? `- Also add "Refs: ${issue}".` : `\nFOOTER: add "Refs: ${issue}".`);
  }
  lines.push(
    "",
    "RULES:",
    "- Describe only changes present in the summary below — do not infer or embellish.",
    "- If the summary contains several unrelated changes, write the message for the main one and add a final line 'Consider splitting: …' listing the rest.",
    "- Output only the commit message, no commentary and no code fences.",
    "",
    "CHANGE SUMMARY / DIFF:",
    summary,
  );

  const text = lines.join("\n");
  return { text, preview, ...measureText(text) };
}
