/**
 * GitHub Copilot comment-prompt construction.
 *
 * Rule sources — GitHub's own prompt-engineering guidance for Copilot
 * ("Best practices for using GitHub Copilot" and "Prompt engineering for
 * GitHub Copilot" in the GitHub Docs, plus the GitHub Blog article
 * "How to write better prompts for GitHub Copilot"):
 *
 *  1. Set the stage: start with a high-level description of the goal before
 *     the details ("provide context").
 *  2. Be specific and simple: one task per prompt; break compound tasks up.
 *  3. Give examples: an input/expected-output pair steers completions more
 *     than prose does.
 *  4. State constraints and edge cases explicitly (error handling, types,
 *     library choices) — Copilot cannot infer unstated requirements.
 *  5. Use meaningful names: a descriptive function signature is itself part
 *     of the prompt Copilot reads.
 *
 * The output is a comment block in the target language's syntax followed by
 * a signature stub, which is the shape inline Copilot completes from. Chat
 * mode emits the same content as plain text for Copilot Chat.
 *
 * Everything here is pure string assembly — no network, no AI.
 */

export const LANGUAGES = [
  { id: "javascript", label: "JavaScript", comment: "//", stub: (n) => `function ${n}() {` },
  { id: "typescript", label: "TypeScript", comment: "//", stub: (n) => `function ${n}() {` },
  { id: "python", label: "Python", comment: "#", stub: (n) => `def ${n}():` },
  { id: "java", label: "Java", comment: "//", stub: (n) => `public static Object ${n}() {` },
  { id: "csharp", label: "C#", comment: "//", stub: (n) => `public static object ${n}() {` },
  { id: "go", label: "Go", comment: "//", stub: (n) => `func ${n}() {` },
  { id: "rust", label: "Rust", comment: "//", stub: (n) => `fn ${n}() {` },
  { id: "ruby", label: "Ruby", comment: "#", stub: (n) => `def ${n}` },
  { id: "php", label: "PHP", comment: "//", stub: (n) => `function ${n}() {` },
  { id: "swift", label: "Swift", comment: "//", stub: (n) => `func ${n}() {` },
  { id: "kotlin", label: "Kotlin", comment: "//", stub: (n) => `fun ${n}() {` },
  { id: "sql", label: "SQL", comment: "--", stub: () => "" },
  { id: "shell", label: "Shell / Bash", comment: "#", stub: (n) => `${n}() {` },
];

export const MODES = [
  { id: "inline", label: "Inline comment prompt — paste above your cursor" },
  { id: "chat", label: "Copilot Chat prompt — paste into the chat box" },
];

/** Words that flag a compound task; GitHub's guidance says one task per prompt. */
const COMPOUND_MARKERS = [" and then ", " and also ", "; then ", ", then "];

/** A task described in fewer words than this is too vague to steer a completion. */
const MIN_TASK_WORDS = 3;

const VALID_IDENTIFIER = /^[A-Za-z_][A-Za-z0-9_]*$/;

const wordCount = (text) => String(text ?? "").trim().split(/\s+/).filter(Boolean).length;

/** Split multi-line free text into trimmed, non-empty lines. */
const toLines = (text) =>
  String(text ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

/**
 * Build the Copilot prompt.
 *
 * @param {object} input
 * @param {string} input.task         What the code should do (one task).
 * @param {string} input.languageId   One of LANGUAGES ids.
 * @param {string} [input.functionName] Identifier for the stub; also part of the prompt.
 * @param {string} [input.inputs]     Description of inputs/parameters.
 * @param {string} [input.outputs]    Description of the return value / result.
 * @param {string} [input.constraints] One per line: libraries, error handling, perf.
 * @param {string} [input.example]    A concrete input -> output example.
 * @param {string} [input.mode]       "inline" | "chat".
 * @returns {object} { prompt, lineCount, charCount, warnings, language, mode } or { error }
 */
export function buildCopilotPrompt({
  task,
  languageId,
  functionName = "",
  inputs = "",
  outputs = "",
  constraints = "",
  example = "",
  mode = "inline",
}) {
  const language = LANGUAGES.find((l) => l.id === languageId);
  if (!language) return { error: "Choose a language." };
  if (!MODES.some((m) => m.id === mode)) return { error: "Choose inline or chat mode." };

  const taskText = String(task ?? "").trim().replace(/\s+/g, " ");
  if (!taskText) return { error: "Describe the task — what should the code do?" };
  if (wordCount(taskText) < MIN_TASK_WORDS) {
    return {
      error: `A ${wordCount(taskText)}-word task is too vague to steer Copilot — say what goes in, what comes out and any rules.`,
    };
  }

  const name = String(functionName ?? "").trim();
  if (name && !VALID_IDENTIFIER.test(name)) {
    return { error: "The function name must be a plain identifier — letters, digits and underscores, not starting with a digit." };
  }

  const constraintLines = toLines(constraints);
  const exampleLines = toLines(example);

  // Assemble the content lines per GitHub's guidance ordering:
  // goal -> inputs -> output -> constraints -> example.
  const content = [];
  content.push(taskText.endsWith(".") ? taskText : `${taskText}.`);
  const inputText = String(inputs ?? "").trim();
  if (inputText) content.push(`Input: ${inputText}.`);
  const outputText = String(outputs ?? "").trim();
  if (outputText) content.push(`Output: ${outputText}.`);
  constraintLines.forEach((line) => content.push(`Constraint: ${line.replace(/\.+$/, "")}.`));
  if (exampleLines.length) {
    content.push("Example:");
    exampleLines.forEach((line) => content.push(`  ${line}`));
  }

  let prompt;
  if (mode === "chat") {
    const chatLines = [...content];
    if (name) chatLines.push(`Name the function ${name}.`);
    chatLines.push(`Write it in ${language.label}.`);
    prompt = chatLines.join("\n");
  } else {
    const c = language.comment;
    const commentBlock = content.map((line) => `${c} ${line}`.trimEnd()).join("\n");
    const stub = name ? language.stub(name) : "";
    prompt = stub ? `${commentBlock}\n${stub}` : commentBlock;
  }

  const warnings = [];
  const lowerTask = ` ${taskText.toLowerCase()} `;
  if (COMPOUND_MARKERS.some((marker) => lowerTask.includes(marker))) {
    warnings.push(
      "This reads like more than one task. GitHub's guidance is one task per prompt — split it and prompt twice.",
    );
  }
  if (!exampleLines.length) {
    warnings.push(
      "No example given. A concrete input → output pair is the single strongest steering signal for Copilot.",
    );
  }
  if (!name && mode === "inline") {
    warnings.push(
      "No function name. A descriptive signature is part of the prompt Copilot reads — add one.",
    );
  }
  if (!outputText) {
    warnings.push("Say what the code should return — unstated outputs are where completions drift.");
  }

  return {
    prompt,
    lineCount: prompt.split("\n").length,
    charCount: prompt.length,
    warnings,
    language,
    mode,
  };
}
