const seo = {
  title: "Git Commit Message Linter: Conventional Commits Check",
  metaDescription:
    "Lint a commit message against Conventional Commits v1.0.0 and commitlint config-conventional rules, with each violation named and a fixed message to copy.",
  steps: [
    "Paste your message into the \"Commit message\" box and pick a header length limit — the commitlint default of 100 characters or the classic 50.",
    "Tick \"Require a scope, e.g. feat(api): …\" if your team mandates scopes.",
    "Read the Passes/Fails verdict with each violation cited by rule name, then click \"Copy fixed message\" to take the corrected commit.",
  ],
  intro:
    "This linter checks a git commit message against the Conventional Commits v1.0.0 specification and the default rules of commitlint's config-conventional preset: header shape (type(scope)!: description), allowed types, subject case and punctuation, header length, the blank line before the body, body line length and BREAKING CHANGE footers. It reports each violation with the rule name and produces a suggested corrected message, so you can fix a commit before commitlint or CI rejects it.",
  useCases: [
    "Checking a commit message in the browser before pushing to a repository whose CI runs commitlint",
    "Learning which config-conventional rule a cryptic commitlint failure is actually complaining about",
    "Drafting a breaking-change commit and verifying the ! marker and BREAKING CHANGE footer are formatted correctly",
  ],
  benefits: [
    ["Spec-accurate", "Implements the header grammar and blank-line rule straight from Conventional Commits v1.0.0."],
    ["Named rules", "Each finding cites the commitlint rule (type-enum, subject-full-stop, body-leading-blank) so fixes map to config."],
    ["Suggested fix", "Generates a corrected message — lowercased type, trimmed subject, stripped trailing period — ready to copy."],
  ],
  faqs: [
    [
      "What is the correct format for a conventional commit message?",
      "type(scope)!: description — a type such as feat or fix, an optional scope in parentheses, an optional ! for breaking changes, then a colon and a single space before the description. A longer body, if present, must start exactly one blank line after the description, per the Conventional Commits v1.0.0 spec.",
    ],
    [
      "Which commit types does Conventional Commits allow?",
      "The spec itself only mandates feat and fix, but the widely used config-conventional preset (based on the Angular convention) allows eleven: build, chore, ci, docs, feat, fix, perf, refactor, revert, style and test. feat correlates with a MINOR version bump in semantic versioning and fix with a PATCH.",
    ],
    [
      "How long can a commit message header be?",
      "commitlint's config-conventional preset errors above 100 characters (header-max-length). The older git convention popularised by Tim Pope suggests about 50 characters for the summary line with body lines wrapped at 72, which keeps messages readable in git log and email patches. This tool lets you lint against either limit.",
    ],
    [
      "How do I mark a breaking change in a commit message?",
      "Two spec-compliant ways: append ! after the type or scope (feat(api)!: remove v1 endpoints), or add a footer starting with BREAKING CHANGE: followed by a description. BREAKING-CHANGE with a hyphen is defined as synonymous. Either form signals a MAJOR version bump to semantic-release and similar tooling.",
    ],
  ],
};

export default seo;
