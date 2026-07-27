/**
 * Per-language defaults taken from each ecosystem's dominant published guide:
 *  - JavaScript / TypeScript: Prettier defaults (printWidth 80, 2 spaces,
 *    double quotes, semicolons) with Airbnb-style naming.
 *  - Python: PEP 8 (4 spaces, snake_case, 79-column limit; Black uses 88).
 *  - Go: gofmt — tabs, no configurable line limit, MixedCaps names.
 *  - Java: Google Java Style (2 spaces, 100-column limit).
 *  - Ruby: RuboCop defaults (2 spaces, Layout/LineLength Max 120).
 *  - C#: Microsoft .NET naming guidelines (4 spaces, PascalCase members).
 */
export const LANGUAGE_PROFILES = [
  {
    key: "typescript",
    label: "TypeScript",
    source: "Prettier defaults + typescript-eslint recommended",
    indentStyle: "space",
    indentSize: 2,
    lineLength: 80,
    quotes: "double",
    semicolons: true,
    trailingComma: "all",
    globs: ["*.ts", "*.tsx"],
    naming: [
      ["Variables and functions", "camelCase"],
      ["Types, interfaces and classes", "PascalCase"],
      ["React components", "PascalCase"],
      ["Module-level constants", "UPPER_SNAKE_CASE"],
      ["Files", "kebab-case.ts (PascalCase.tsx for components)"],
    ],
    rules: [
      "Export types with `export type`; never widen a public type to `any` to silence an error.",
      "Prefer `unknown` over `any` at boundaries and narrow explicitly.",
      "Annotate the return type of every exported function.",
      "`const` by default, `let` only when reassigned, never `var`.",
    ],
    formatter: "prettier --write .",
    linter: "eslint . --max-warnings=0",
  },
  {
    key: "javascript",
    label: "JavaScript",
    source: "Prettier defaults + ESLint recommended",
    indentStyle: "space",
    indentSize: 2,
    lineLength: 80,
    quotes: "double",
    semicolons: true,
    trailingComma: "all",
    globs: ["*.js", "*.jsx", "*.mjs"],
    naming: [
      ["Variables and functions", "camelCase"],
      ["Classes and React components", "PascalCase"],
      ["Module-level constants", "UPPER_SNAKE_CASE"],
      ["Files", "kebab-case.js"],
    ],
    rules: [
      "`const` by default, `let` only when reassigned, never `var`.",
      "Prefer named exports; keep one default export per module at most.",
      "Await promises or return them — never leave a floating promise.",
    ],
    formatter: "prettier --write .",
    linter: "eslint . --max-warnings=0",
  },
  {
    key: "python",
    label: "Python",
    source: "PEP 8 (line length 79) — Black users set 88",
    indentStyle: "space",
    indentSize: 4,
    lineLength: 79,
    quotes: "double",
    semicolons: false,
    trailingComma: "es5",
    globs: ["*.py"],
    naming: [
      ["Functions, variables and modules", "snake_case"],
      ["Classes and exceptions", "PascalCase"],
      ["Constants", "UPPER_SNAKE_CASE"],
      ["Non-public names", "_leading_underscore"],
    ],
    rules: [
      "Type-annotate every public function signature; run mypy or pyright in CI.",
      "Raise a specific exception type; bare `except:` is banned.",
      "No mutable default arguments — use `None` and build inside the function.",
      "Imports grouped standard library, third party, first party, separated by blank lines (PEP 8).",
    ],
    formatter: "ruff format .",
    linter: "ruff check .",
  },
  {
    key: "go",
    label: "Go",
    source: "gofmt and Effective Go",
    indentStyle: "tab",
    indentSize: 4,
    lineLength: 0,
    quotes: "double",
    semicolons: false,
    trailingComma: "all",
    globs: ["*.go"],
    naming: [
      ["Exported identifiers", "MixedCaps starting with a capital"],
      ["Unexported identifiers", "mixedCaps starting lowercase"],
      ["Acronyms", "Keep the case uniform: `URL`, `userID`"],
      ["Packages", "short, lowercase, no underscores"],
    ],
    rules: [
      "gofmt is the formatter — there is no style debate and no configuration.",
      "Handle every error; wrap with `fmt.Errorf(\"doing x: %w\", err)` to keep the chain.",
      "Accept interfaces, return structs.",
      "Keep the happy path at the leftmost indentation; return early on errors.",
    ],
    formatter: "gofmt -w .",
    linter: "golangci-lint run",
  },
  {
    key: "java",
    label: "Java",
    source: "Google Java Style Guide (100-column limit)",
    indentStyle: "space",
    indentSize: 2,
    lineLength: 100,
    quotes: "double",
    semicolons: true,
    trailingComma: "none",
    globs: ["*.java"],
    naming: [
      ["Classes and interfaces", "UpperCamelCase"],
      ["Methods and fields", "lowerCamelCase"],
      ["Constants", "UPPER_SNAKE_CASE"],
      ["Packages", "all lowercase, no underscores"],
    ],
    rules: [
      "One top-level class per file, named after the file.",
      "Never catch and ignore an exception — log it or rethrow with context.",
      "Prefer immutable value objects and `final` fields.",
      "Braces are required even for one-line `if` bodies.",
    ],
    formatter: "google-java-format -i",
    linter: "./gradlew checkstyleMain",
  },
  {
    key: "ruby",
    label: "Ruby",
    source: "RuboCop defaults (Layout/LineLength Max 120)",
    indentStyle: "space",
    indentSize: 2,
    lineLength: 120,
    quotes: "single",
    semicolons: false,
    trailingComma: "all",
    globs: ["*.rb", "*.rake"],
    naming: [
      ["Methods and variables", "snake_case"],
      ["Classes and modules", "CamelCase"],
      ["Constants", "SCREAMING_SNAKE_CASE"],
      ["Predicate methods", "end with `?`; mutating methods end with `!`"],
    ],
    rules: [
      "Prefer `each` and the enumerable methods over index loops.",
      "Keep methods under ten lines; extract a private method rather than nest.",
      "Freeze string literals with the magic comment at the top of each file.",
    ],
    formatter: "rubocop -a",
    linter: "rubocop",
  },
  {
    key: "csharp",
    label: "C#",
    source: "Microsoft .NET naming guidelines",
    indentStyle: "space",
    indentSize: 4,
    lineLength: 120,
    quotes: "double",
    semicolons: true,
    trailingComma: "none",
    globs: ["*.cs"],
    naming: [
      ["Classes, methods, properties", "PascalCase"],
      ["Local variables and parameters", "camelCase"],
      ["Private fields", "_camelCase"],
      ["Interfaces", "IPascalCase"],
    ],
    rules: [
      "`async` methods end in `Async` and accept a `CancellationToken`.",
      "Use `var` only when the type is obvious from the right-hand side.",
      "Dispose of anything `IDisposable` with `using`.",
    ],
    formatter: "dotnet format",
    linter: "dotnet build -warnaserror",
  },
];

/** Conventional Commits 1.0.0 types, used for the commit-message section. */
export const COMMIT_TYPES = [
  "feat",
  "fix",
  "docs",
  "refactor",
  "perf",
  "test",
  "build",
  "ci",
  "chore",
  "revert",
];

/** Practical bounds for a configurable line-length limit. */
export const MIN_LINE_LENGTH = 60;
export const MAX_LINE_LENGTH = 200;

/** Practical bounds for indentation width. */
export const MIN_INDENT = 1;
export const MAX_INDENT = 8;

/** Optional sections the guide can include. */
export const OPTIONAL_SECTIONS = [
  { key: "commits", label: "Commit messages (Conventional Commits)" },
  { key: "branches", label: "Branch naming and lifetime" },
  { key: "reviews", label: "Code review expectations" },
  { key: "tests", label: "Testing rules" },
  { key: "errors", label: "Error handling and logging" },
  { key: "comments", label: "Comments and documentation" },
];

const clean = (value) => String(value == null ? "" : value).trim();

/**
 * Render an .editorconfig body. EditorConfig ignores `max_line_length` when it
 * is 0 or unset, which matches gofmt's "no limit" position.
 */
export function generateEditorConfig({
  globs = ["*"],
  indentStyle = "space",
  indentSize = 2,
  lineLength = 80,
  finalNewline = true,
  trimTrailingWhitespace = true,
  charset = "utf-8",
} = {}) {
  const size = Math.round(Number(indentSize));
  if (!Number.isFinite(size) || size < MIN_INDENT || size > MAX_INDENT) {
    return { error: `Indent width must be between ${MIN_INDENT} and ${MAX_INDENT}.` };
  }
  if (indentStyle !== "space" && indentStyle !== "tab") {
    return { error: "Indent style must be space or tab." };
  }

  const limit = Math.round(Number(lineLength) || 0);
  if (limit !== 0 && (limit < MIN_LINE_LENGTH || limit > MAX_LINE_LENGTH)) {
    return {
      error: `Line length must be 0 (no limit) or between ${MIN_LINE_LENGTH} and ${MAX_LINE_LENGTH}.`,
    };
  }

  const pattern = globs.length === 1 ? globs[0] : `{${globs.join(",")}}`;
  const lines = [
    "root = true",
    "",
    "[*]",
    `charset = ${charset}`,
    "end_of_line = lf",
    `insert_final_newline = ${finalNewline}`,
    `trim_trailing_whitespace = ${trimTrailingWhitespace}`,
    "",
    `[${pattern}]`,
    `indent_style = ${indentStyle}`,
    `indent_size = ${size}`,
  ];
  if (limit > 0) lines.push(`max_line_length = ${limit}`);
  lines.push("", "[*.md]", "trim_trailing_whitespace = false");

  return { editorConfig: `${lines.join("\n")}\n`, lineLimit: limit };
}

/**
 * Build the style-guide document.
 *
 * @returns {{ markdown: string, editorConfig: string, ruleCount: number } | { error: string }}
 */
export function generateStyleGuide(input = {}) {
  const {
    teamName = "",
    language = "typescript",
    indentStyle,
    indentSize,
    lineLength,
    quotes,
    semicolons,
    sections = ["commits", "reviews", "tests", "errors", "comments"],
    maxFunctionLines = 40,
    maxPrPatchSize = 400,
    branchPrefix = "feat/",
  } = input;

  const profile = LANGUAGE_PROFILES.find((item) => item.key === language);
  if (!profile) return { error: "Pick a language from the list." };

  const team = clean(teamName);
  if (team === "") return { error: "Name the team or repository this guide applies to." };

  const resolved = {
    indentStyle: indentStyle || profile.indentStyle,
    indentSize: indentSize == null ? profile.indentSize : Number(indentSize),
    lineLength: lineLength == null ? profile.lineLength : Number(lineLength),
    quotes: quotes || profile.quotes,
    semicolons: semicolons == null ? profile.semicolons : Boolean(semicolons),
  };

  const editor = generateEditorConfig({
    globs: profile.globs,
    indentStyle: resolved.indentStyle,
    indentSize: resolved.indentSize,
    lineLength: resolved.lineLength,
  });
  if (editor.error) return editor;

  const funcLines = Math.round(Number(maxFunctionLines));
  if (!Number.isFinite(funcLines) || funcLines < 5 || funcLines > 500) {
    return { error: "Maximum function length must be between 5 and 500 lines." };
  }
  const patchSize = Math.round(Number(maxPrPatchSize));
  if (!Number.isFinite(patchSize) || patchSize < 20 || patchSize > 5000) {
    return { error: "Maximum pull-request size must be between 20 and 5000 changed lines." };
  }

  const chosen = new Set(Array.isArray(sections) ? sections : []);
  const lines = [
    `# ${team} engineering style guide`,
    "",
    `Language: **${profile.label}** · Baseline: ${profile.source}`,
    "",
    "This document records decisions, not preferences. Where a formatter can enforce a rule, the formatter wins and the rule is not worth discussing in review.",
    "",
    "## Formatting",
    "",
    `- Indentation: ${resolved.indentStyle === "tab" ? "tabs" : `${resolved.indentSize} spaces`}`,
    resolved.lineLength > 0
      ? `- Line length: ${resolved.lineLength} characters`
      : "- Line length: no hard limit (the formatter decides)",
    `- String quotes: ${resolved.quotes}`,
    `- Statement terminators: ${resolved.semicolons ? "semicolons required" : "no semicolons"}`,
    "- Line endings: LF, files end with a newline, no trailing whitespace",
    `- Formatter: \`${profile.formatter}\` — run it on save and in CI`,
    `- Linter: \`${profile.linter}\` — a failing lint blocks the merge`,
    "",
    "## Naming",
    "",
    "| Thing | Convention |",
    "| --- | --- |",
    ...profile.naming.map(([thing, rule]) => `| ${thing} | ${rule} |`),
    "",
    "## Language rules",
    "",
    ...profile.rules.map((rule) => `- ${rule}`),
    `- Keep functions under ${funcLines} lines; if it is longer, name the parts.`,
    "",
  ];

  if (chosen.has("comments")) {
    lines.push(
      "## Comments and documentation",
      "",
      "- Comment why, not what — the code already says what.",
      "- Every public function gets a one-line doc comment describing its contract, including what it does on invalid input.",
      "- A `TODO` must carry an owner and a ticket: `TODO(nikhil, PAY-482): remove after the v3 cutover`.",
      "- Delete commented-out code. Version control remembers it.",
      "",
    );
  }

  if (chosen.has("errors")) {
    lines.push(
      "## Errors and logging",
      "",
      "- Fail loudly at the boundary, handle deliberately in the middle, never swallow silently.",
      "- Every error carries context about what was being attempted, not just what failed.",
      "- Log at `error` only for things a human must act on; everything else is `warn` or lower.",
      "- Never log secrets, tokens, full card numbers or personal identifiers.",
      "",
    );
  }

  if (chosen.has("tests")) {
    lines.push(
      "## Tests",
      "",
      "- Every bug fix lands with a test that fails without the fix.",
      "- Test names state behaviour: `returns 404 when the invoice is not found`.",
      "- One assertion subject per test; no branching inside a test body.",
      "- Tests must not depend on execution order, wall-clock time or network access.",
      "",
    );
  }

  if (chosen.has("branches")) {
    lines.push(
      "## Branches",
      "",
      `- Branch from \`main\` and name it \`${clean(branchPrefix) || "feat/"}<ticket>-<short-slug>\`.`,
      "- A branch lives days, not weeks — rebase on `main` daily.",
      "- Delete the branch when the pull request merges.",
      "",
    );
  }

  if (chosen.has("commits")) {
    lines.push(
      "## Commit messages",
      "",
      "Conventional Commits 1.0.0: `<type>(<scope>): <description>`, imperative mood, no full stop, under 72 characters on the subject line.",
      "",
      `Allowed types: ${COMMIT_TYPES.map((type) => `\`${type}\``).join(", ")}.`,
      "",
      "A breaking change adds `!` after the type and a `BREAKING CHANGE:` footer explaining the migration.",
      "",
    );
  }

  if (chosen.has("reviews")) {
    lines.push(
      "## Code review",
      "",
      `- Keep a pull request under ${patchSize} changed lines. Bigger than that, split it — review quality falls off sharply on large diffs.`,
      "- The author writes the description: what changed, why, and how it was verified.",
      "- Reviewers respond within one working day; blocking comments say what would unblock them.",
      "- Distinguish blocking from optional. Prefix suggestions with `nit:` when they are not blocking.",
      "- Approve on behaviour and readability. Formatting is the formatter's job.",
      "",
    );
  }

  const ruleCount = lines.filter((line) => line.startsWith("- ")).length;

  return {
    markdown: `${lines.join("\n").replace(/\n{3,}/g, "\n\n").trim()}\n`,
    editorConfig: editor.editorConfig,
    ruleCount,
    languageLabel: profile.label,
    resolved,
    sectionCount: chosen.size,
  };
}
