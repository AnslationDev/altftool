/**
 * Coding-assistant system prompt composer.
 *
 * Pure string assembly: the same configuration always produces the same prompt.
 * Section order follows the common instruction-prompt layout — identity, then
 * context, then hard rules, then output format — so the constraints a model must
 * not break are stated after the background it needs to apply them.
 */

/**
 * OpenAI's published rule of thumb for English text is roughly 4 characters per
 * token. Source code is denser because of punctuation and identifiers, so this
 * module reports a range using both figures rather than a single number.
 */
export const CHARS_PER_TOKEN_PROSE = 4;
export const CHARS_PER_TOKEN_CODE = 3.2;

/** Default budget used only to warn that a system prompt has grown long. */
export const DEFAULT_TOKEN_BUDGET = 900;

export const VERBOSITY_LEVELS = {
  terse: {
    label: "Terse",
    line: "Answer with the code and nothing else unless the change is non-obvious. At most two sentences of prose before a code block.",
  },
  balanced: {
    label: "Balanced",
    line: "Lead with the answer, then give a short explanation of the trade-off you made. Keep prose under six sentences.",
  },
  explanatory: {
    label: "Explanatory",
    line: "Explain the approach before the code, name the alternative you rejected and why, then give the implementation.",
  },
};

export const TEST_POLICIES = {
  none: { label: "No test requirement", line: null },
  suggest: {
    label: "Suggest tests",
    line: "After any behaviour change, list the test cases that should exist, including the edge cases.",
  },
  require: {
    label: "Always write tests",
    line: "Ship a test with every behaviour change. Cover the happy path, one boundary and one failure case.",
  },
  tdd: {
    label: "Test first",
    line: "Write the failing test first, show it, then write the minimum implementation that makes it pass.",
  },
};

export const REVIEW_FOCUS_OPTIONS = {
  correctness: "Correctness: trace the actual control flow, including empty, null and boundary inputs.",
  security:
    "Security: flag injection, unvalidated input, secrets in code, unsafe deserialisation and missing authorisation checks.",
  performance:
    "Performance: flag N+1 queries, work inside loops that could be hoisted, and unbounded memory growth.",
  readability: "Readability: prefer the shorter, more obvious version over the clever one.",
  errorHandling:
    "Error handling: every failure path either recovers or surfaces a message the caller can act on.",
  accessibility:
    "Accessibility: semantic elements, labelled controls, visible focus, and keyboard paths for every pointer action.",
  api: "API design: keep public signatures backward compatible, and name things for the caller, not the implementation.",
  concurrency: "Concurrency: identify shared mutable state, race windows and missing cancellation.",
};

export const REFUSAL_OPTIONS = {
  noSecrets: "Never print, echo or invent API keys, tokens, passwords or connection strings.",
  noInvention:
    "Never invent a library, package, flag or API that you are not sure exists. Say you are unsure and name what you would check.",
  noSilentRewrite:
    "Never rewrite unrelated code. Change only what the request needs, and say so if a wider change is required.",
  noDestructive:
    "Never suggest a destructive command (force push, drop table, rm -rf) without stating what is lost and asking for confirmation.",
  noLicence:
    "Never paste code whose licence is unknown or incompatible with the project's licence.",
  admitLimits:
    "When the request cannot be met with the given context, say what is missing instead of guessing.",
};

export const OUTPUT_FORMATS = {
  diff: "Return changes as a unified diff against the file you were given.",
  fullFile: "Return the complete updated file so it can be pasted over the original.",
  snippet: "Return only the changed function or block, with the file path above it.",
  patchPlan: "Return a numbered plan first, then the code for each step.",
};

const clean = (value) => String(value ?? "").trim();

/** Rough token estimate as a range, from the characters-per-token rules of thumb. */
export function estimateTokens(text) {
  const chars = String(text ?? "").length;
  return {
    chars,
    low: Math.ceil(chars / CHARS_PER_TOKEN_PROSE),
    high: Math.ceil(chars / CHARS_PER_TOKEN_CODE),
  };
}

/**
 * Builds the system prompt.
 *
 * @param {object} config
 * @returns {{prompt: string, sections: Array, tokens: object, warnings: string[], completeness: number}|{error: string}}
 */
export function buildCodingAssistantPrompt(config = {}) {
  const language = clean(config.language);
  if (language === "") {
    return { error: "Name the primary language — without it the assistant will guess a stack." };
  }

  const seniority = clean(config.seniority) || "senior";
  const product = clean(config.product);
  const framework = clean(config.framework);
  const runtime = clean(config.runtime);
  const packageManager = clean(config.packageManager);
  const styleGuide = clean(config.styleGuide);
  const formatter = clean(config.formatter);
  const linter = clean(config.linter);
  const testFramework = clean(config.testFramework);
  const commentStyle = clean(config.commentStyle);
  const contextNotes = clean(config.contextNotes);
  const bannedPatterns = clean(config.bannedPatterns);

  const verbosityKey = VERBOSITY_LEVELS[config.verbosity] ? config.verbosity : "balanced";
  const testPolicyKey = TEST_POLICIES[config.testPolicy] ? config.testPolicy : "suggest";
  const outputFormatKey = OUTPUT_FORMATS[config.outputFormat] ? config.outputFormat : "snippet";

  const reviewFocus = Array.isArray(config.reviewFocus)
    ? config.reviewFocus.filter((key) => REVIEW_FOCUS_OPTIONS[key])
    : [];
  const refusals = Array.isArray(config.refusals)
    ? config.refusals.filter((key) => REFUSAL_OPTIONS[key])
    : [];

  const budget = Number(config.tokenBudget ?? DEFAULT_TOKEN_BUDGET);
  if (!Number.isFinite(budget) || budget <= 0) {
    return { error: "The token budget must be a positive number." };
  }

  const sections = [];

  const identity = [
    `You are a ${seniority} ${language} engineer${product ? ` working on ${product}` : ""}.`,
    "You pair with the user on real code in a real repository. You are precise, you do not pad, and you say when you are unsure.",
  ].join(" ");
  sections.push({ id: "identity", title: "Role", body: identity });

  const stack = [];
  stack.push(`- Language: ${language}`);
  if (framework) stack.push(`- Framework: ${framework}`);
  if (runtime) stack.push(`- Runtime / target: ${runtime}`);
  if (packageManager) stack.push(`- Package manager: ${packageManager} (never suggest another one)`);
  if (testFramework) stack.push(`- Test framework: ${testFramework}`);
  if (styleGuide) stack.push(`- Style guide: ${styleGuide}`);
  if (formatter) stack.push(`- Formatter: ${formatter} — match its output, do not hand-format`);
  if (linter) stack.push(`- Linter: ${linter} — code must pass it without new suppressions`);
  if (commentStyle) stack.push(`- Documentation comments: ${commentStyle}`);
  sections.push({ id: "stack", title: "Stack", body: stack.join("\n") });

  if (contextNotes) {
    sections.push({
      id: "context",
      title: "Project context",
      body: contextNotes,
    });
  }

  const answering = [
    VERBOSITY_LEVELS[verbosityKey].line,
    OUTPUT_FORMATS[outputFormatKey],
    "Use the project's existing helpers, naming and file layout before introducing anything new.",
    "If the request is ambiguous in a way that changes the code, ask one specific question instead of producing two variants.",
  ];
  sections.push({ id: "answering", title: "How to answer", body: answering.map((l) => `- ${l}`).join("\n") });

  const testLine = TEST_POLICIES[testPolicyKey].line;
  if (testLine) {
    sections.push({
      id: "testing",
      title: "Testing",
      body: `- ${testLine}${testFramework ? `\n- Write tests with ${testFramework}, following the patterns already in the repository.` : ""}`,
    });
  }

  if (reviewFocus.length > 0) {
    sections.push({
      id: "review",
      title: "Review checklist",
      body: ["Before you present code, check it against this list:"]
        .concat(reviewFocus.map((key) => `- ${REVIEW_FOCUS_OPTIONS[key]}`))
        .join("\n"),
    });
  }

  const hardRules = refusals.map((key) => `- ${REFUSAL_OPTIONS[key]}`);
  if (bannedPatterns) {
    hardRules.push(`- Do not use: ${bannedPatterns}.`);
  }
  if (hardRules.length > 0) {
    sections.push({ id: "rules", title: "Hard rules", body: hardRules.join("\n") });
  }

  const prompt = sections
    .map((section) => (section.id === "identity" ? section.body : `## ${section.title}\n${section.body}`))
    .join("\n\n");

  const tokens = estimateTokens(prompt);

  const warnings = [];
  if (reviewFocus.length === 0) {
    warnings.push("No review checklist selected — the assistant has no stated bar for its own output.");
  }
  if (refusals.length === 0) {
    warnings.push("No hard rules selected. At minimum, forbid inventing APIs and printing secrets.");
  }
  if (!testFramework && testPolicyKey !== "none") {
    warnings.push("A test policy is set but no test framework is named, so the assistant will pick one.");
  }
  if (!styleGuide && !formatter) {
    warnings.push("No style guide or formatter named — expect inconsistent formatting between answers.");
  }
  if (tokens.high > budget) {
    warnings.push(
      `The prompt is about ${tokens.low}-${tokens.high} tokens, above your ${budget}-token budget. Every request pays this cost.`,
    );
  }

  const filled = [
    language,
    framework,
    styleGuide || formatter,
    testFramework,
    contextNotes,
    reviewFocus.length > 0 ? "y" : "",
    refusals.length > 0 ? "y" : "",
  ].filter((value) => clean(value) !== "").length;
  const completeness = Math.round((filled / 7) * 100);

  return { prompt, sections, tokens, warnings, completeness, verbosityKey, testPolicyKey, outputFormatKey };
}
