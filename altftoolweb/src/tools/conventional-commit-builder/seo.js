const seo = {
  intro:
    "Conventional Commit Builder assembles a commit message in the Conventional Commits format — `type(scope): subject`, followed by a blank line and an optional body — from four separate fields so the punctuation and spacing are correct every time. It offers the ten standard types (feat, fix, docs, style, refactor, perf, test, build, ci and chore) and drops the parentheses automatically when you leave the scope empty. It is for developers on a repo where commitlint, semantic-release or a changelog generator expects that exact shape.",
  useCases: [
    "Your team just turned on commitlint and your pushes keep getting rejected, so you want the message assembled correctly before you paste it into `git commit`.",
    "You fixed a bug in the auth module and need `fix(auth): ...` rather than `fix auth: ...`, because the changelog generator parses the parenthesised scope.",
    "You are writing a commit with a multi-line explanation and want the mandatory blank line between the subject and the body inserted for you instead of remembered.",
  ],
  benefits: [
    ["The separator rules are handled", "The scope is wrapped in parentheses only when you supply one, and the body is preceded by a blank line — the two places hand-typed conventional commits usually break."],
    ["Ten types with plain-English labels", "The type picker spells out what each prefix means, so you are choosing 'Performance Improvement' rather than guessing between perf, refactor and chore."],
    ["Fields stay separate until the end", "Type, scope, subject and body are edited independently and shown back to you as a breakdown, which makes a mistyped scope obvious before you commit."],
  ],
  faqs: [
    [
      "What is the correct conventional commit format?",
      "`type(scope): description`, with an optional body after one blank line and optional footers after another. The type and description are required; the scope in parentheses is optional, and there is exactly one space after the colon.",
    ],
    [
      "Which commit types can I use?",
      "This builder offers ten: feat, fix, docs, style, refactor, perf, test, build, ci and chore. The Conventional Commits 1.0.0 specification only mandates feat and fix — the rest are the widely adopted set from the Angular convention, and projects are free to add their own.",
    ],
    [
      "How do conventional commits affect version numbers?",
      "Under semantic versioning, a fix commit bumps the PATCH version, a feat commit bumps MINOR, and a breaking change bumps MAJOR. That mapping is what lets tools like semantic-release choose the next version from the commit log alone.",
    ],
    [
      "How do I mark a breaking change?",
      "Add a `!` before the colon — `feat(api)!: drop v1 endpoints` — or add a `BREAKING CHANGE: <explanation>` footer at the end of the body. This builder does not add either for you, so type the `!` into the scope-and-subject text or append the footer in the body field.",
    ],
  ],
};

export default seo;
