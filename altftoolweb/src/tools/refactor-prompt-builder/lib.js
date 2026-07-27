/**
 * Refactor Prompt Builder.
 *
 * Builds a refactoring prompt around named refactorings from Fowler's
 * catalogue, hard behaviour-preservation constraints, and an optional
 * cyclomatic-complexity target checked against McCabe's recommended
 * upper bound of 10.
 */

/**
 * McCabe's original cyclomatic-complexity paper ("A Complexity Measure",
 * IEEE TSE, 1976) proposed 10 as a "reasonable upper limit" per routine;
 * most linters (ESLint complexity, pylint, SonarQube) default near it.
 */
export const MCCABE_COMPLEXITY_LIMIT = 10;

/** Practical bounds for the complexity fields. */
export const LIMITS = { complexity: { min: 1, max: 200 } };

/**
 * Refactoring goals. Names follow Fowler, "Refactoring: Improving the
 * Design of Existing Code" (2nd edition, 2018) catalogue where one exists.
 */
export const GOALS = [
  {
    id: "extract-function",
    label: "Break up a long function",
    directive: "Apply Extract Function: pull each coherent block into a well-named function; the original becomes a readable sequence of calls.",
  },
  {
    id: "guard-clauses",
    label: "Reduce nesting",
    directive: "Apply Replace Nested Conditional with Guard Clauses: return early on edge cases so the main path sits at one indent level.",
  },
  {
    id: "remove-duplication",
    label: "Remove duplication",
    directive: "Apply Extract Function / Pull Up Method on repeated blocks; two near-identical blocks become one parameterised one.",
  },
  {
    id: "rename",
    label: "Improve names",
    directive: "Apply Rename Variable / Rename Function: every name states purpose; no abbreviations that need the reader to decode them.",
  },
  {
    id: "magic-literals",
    label: "Replace magic literals",
    directive: "Apply Replace Magic Literal: every bare number or string with meaning becomes a named constant with a comment saying where the value comes from.",
  },
  {
    id: "decompose-conditional",
    label: "Simplify complex conditionals",
    directive: "Apply Decompose Conditional: move each compound condition into a predicate function named for what it tests.",
  },
  {
    id: "polymorphism",
    label: "Replace type-switching with polymorphism",
    directive: "Apply Replace Conditional with Polymorphism: switch/if-else chains on a type code become subclass or strategy dispatch.",
  },
  {
    id: "modernize",
    label: "Modernise syntax",
    directive: "Replace outdated idioms with the language's current standard equivalents without changing semantics (note any subtle differences, e.g. this-binding, lazy evaluation).",
  },
];

/** Hard constraints the prompt can impose. */
export const CONSTRAINTS = [
  { id: "behaviour", label: "Observable behaviour unchanged", directive: "Identical outputs, side effects, error types and messages for every input — including invalid input." },
  { id: "api", label: "Public API frozen", directive: "No exported/public name, signature, parameter order or return shape may change." },
  { id: "tests", label: "Existing tests must pass unmodified", directive: "Do not edit any test; if a test would fail, the refactor is wrong." },
  { id: "deps", label: "No new dependencies", directive: "No new imports from outside the project and no new packages." },
  { id: "formatting", label: "Keep the file's style", directive: "Match the surrounding code's formatting, naming convention and comment style." },
  { id: "performance", label: "No performance regression", directive: "No added passes over data, no extra allocation in loops; flag any change with different complexity." },
];

/** About four characters per token for ordinary English prose. */
export const AVERAGE_CHARS_PER_TOKEN = 4;

function toInt(value) {
  const number = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(number) ? Math.round(number) : NaN;
}

/**
 * Validate the optional complexity goal.
 * Pass empty strings to skip complexity targeting.
 * @returns {{error:string}|{enabled:boolean, current?:number, target?:number, aboveMcCabe?:boolean, reduction?:number}}
 */
export function assessComplexity({ currentComplexity, targetComplexity } = {}) {
  const currentRaw = String(currentComplexity ?? "").trim();
  const targetRaw = String(targetComplexity ?? "").trim();
  if (currentRaw === "" && targetRaw === "") return { enabled: false };
  if (currentRaw === "" || targetRaw === "") {
    return { error: "Fill both complexity fields, or leave both empty to skip the complexity target." };
  }
  const current = toInt(currentRaw);
  const target = toInt(targetRaw);
  if (Number.isNaN(current) || Number.isNaN(target)) {
    return { error: "Complexity values must be whole numbers." };
  }
  if (
    current < LIMITS.complexity.min ||
    current > LIMITS.complexity.max ||
    target < LIMITS.complexity.min ||
    target > LIMITS.complexity.max
  ) {
    return { error: `Complexity values must be between ${LIMITS.complexity.min} and ${LIMITS.complexity.max}.` };
  }
  if (target >= current) {
    return { error: "The target complexity must be lower than the current complexity — otherwise there is nothing to refactor." };
  }
  return {
    enabled: true,
    current,
    target,
    aboveMcCabe: target > MCCABE_COMPLEXITY_LIMIT,
    reduction: current - target,
  };
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
 * Write the refactoring prompt.
 * @returns {{error:string}|{text:string}}
 */
export function buildRefactorPrompt({
  language,
  goalIds,
  constraintIds,
  complexity,
  context,
  code,
} = {}) {
  if (!complexity || complexity.error) {
    return { error: complexity?.error || "Set a valid complexity target first." };
  }
  const lang = typeof language === "string" && language.trim() ? language.trim() : "";
  if (!lang) return { error: "Enter the language." };
  const goals = GOALS.filter((goal) => (Array.isArray(goalIds) ? goalIds : []).includes(goal.id));
  if (goals.length === 0) return { error: "Select at least one refactoring goal." };
  const constraints = CONSTRAINTS.filter((constraint) =>
    (Array.isArray(constraintIds) ? constraintIds : []).includes(constraint.id),
  );
  if (constraints.length === 0) {
    return { error: "Select at least one constraint — an unconstrained refactor is a rewrite." };
  }
  const contextText = typeof context === "string" ? context.trim() : "";
  const codeText = typeof code === "string" ? code.trim() : "";

  const lines = [
    `Refactor the following ${lang} code. Refactoring means restructuring without changing what the code does — if you are unsure whether a change alters behaviour, do not make it.`,
  ];
  if (contextText) lines.push("", `CONTEXT: ${contextText}`);
  lines.push("", "GOALS, in priority order:");
  goals.forEach((goal, index) => {
    lines.push(`${index + 1}. ${goal.directive}`);
  });
  if (complexity.enabled) {
    lines.push(
      "",
      `COMPLEXITY TARGET: cyclomatic complexity is about ${complexity.current}; bring the worst function to at most ${complexity.target}.` +
        (complexity.aboveMcCabe
          ? ` (Note: this is still above McCabe's recommended limit of ${MCCABE_COMPLEXITY_LIMIT} — treat it as a first step.)`
          : ` This is within McCabe's recommended limit of ${MCCABE_COMPLEXITY_LIMIT}.`),
    );
  }
  lines.push("", "HARD CONSTRAINTS — violating any one fails the task:");
  for (const constraint of constraints) {
    lines.push(`- ${constraint.label}: ${constraint.directive}`);
  }
  lines.push(
    "",
    "PROCESS:",
    "1. Work in small named steps; state which named refactoring each step applies.",
    "2. After the refactored code, list every step taken and why it cannot change behaviour.",
    "3. List anything you deliberately did NOT change and why (e.g. a suspected bug — flag it, keep it).",
    "4. If any goal conflicts with a constraint, keep the constraint and report the conflict instead of guessing.",
  );
  if (codeText) {
    lines.push("", "CODE TO REFACTOR:", "```", codeText, "```");
  } else {
    lines.push("", "CODE TO REFACTOR: (paste the code below this prompt)");
  }

  const text = lines.join("\n");
  return {
    text,
    goals: goals.map((goal) => goal.label),
    constraints: constraints.map((constraint) => constraint.label),
    complexity,
    ...measureText(text),
  };
}
