const seo = {
  title: "Engineering Style Guide + .editorconfig Generator",
  metaDescription:
    "Turn team conventions into a Markdown style guide plus a matching .editorconfig, seeded from Prettier, PEP 8, gofmt, Google Java Style or RuboCop.",
  steps: [
    "Type a Team or repository name and pick a Language from TypeScript, JavaScript, Python, Go, Java, Ruby or C# to seed the defaults from that ecosystem's published guide.",
    "Override Indent style, Indent width (1-8), Line length (60-200, 0 = no limit), String quotes, Semicolons, Max function length (lines) and Branch prefix, then tick the boxes under Sections to include such as Commit messages (Conventional Commits).",
    "Check the Language baseline, Indentation and Line length rows, then press Copy Markdown for the style guide and Copy .editorconfig for the machine-readable editor rules.",
  ],
  intro:
    "This generator turns a handful of choices — language, indentation, line length, quotes and review rules — into a complete engineering style guide in Markdown plus a matching .editorconfig file. Defaults are seeded from each ecosystem's dominant published standard: Prettier for JavaScript and TypeScript, PEP 8 for Python, gofmt for Go, the Google Java Style Guide, RuboCop defaults for Ruby and Microsoft's .NET naming guidelines for C#. It is built for tech leads and new teams who want a documented standard without writing it from scratch.",
  useCases: [
    "A new startup team adopting TypeScript agrees on conventions in one meeting and pastes the generated STYLE_GUIDE.md into their repository the same day",
    "A tech lead inheriting a Python codebase with inconsistent formatting generates a PEP 8-based guide and an .editorconfig so every editor indents the same way",
    "An engineering manager formalising code review adds the review-expectations and Conventional Commits sections to an existing team handbook",
  ],
  benefits: [
    ["Real published baselines", "Defaults come from Prettier, PEP 8, gofmt, Google Java Style, RuboCop and .NET guidelines — not invented rules."],
    ["Two artifacts at once", "One set of choices produces both the human-readable Markdown guide and a machine-readable .editorconfig."],
    ["Sections you actually need", "Toggle commit messages, branching, reviews, tests, error handling and documentation rules on or off."],
  ],
  faqs: [
    [
      "What should an engineering style guide include?",
      "At minimum: formatting rules (indentation, line length, quotes), naming conventions, a short list of language-specific rules, and the exact formatter and linter commands that enforce them. Strong guides also cover commit-message format, branch naming, code-review expectations and testing rules — the sections this generator lets you toggle on.",
    ],
    [
      "What is the standard line length for code?",
      "It varies by ecosystem: Prettier defaults to 80 characters for JavaScript and TypeScript, PEP 8 specifies 79 for Python (Black raises it to 88), the Google Java Style Guide uses 100, RuboCop defaults to 120 for Ruby, and gofmt imposes no hard limit at all for Go. The generator applies the right default for your language and lets you override it between 60 and 200.",
    ],
    [
      "What is an .editorconfig file and why generate one with the guide?",
      "An .editorconfig is a small INI-style file that editors and IDEs read automatically to apply indentation style, indent size, line endings and trailing-whitespace rules per file type. Generating it alongside the written guide means the most mechanical rules are enforced by tooling instead of by reviewers.",
    ],
    [
      "Should style rules be enforced in code review?",
      "No — anything a formatter can enforce should be enforced by the formatter in CI, and reviewers should focus on behaviour, naming and design. The generated guide states this explicitly and includes the formatter and linter commands (for example `prettier --write .` or `ruff format .`) so the rule is automated rather than debated.",
    ],
  ],
};

export default seo;
