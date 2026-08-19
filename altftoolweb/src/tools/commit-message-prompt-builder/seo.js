const seo = {
  title: "Commit Message Prompt: Conventional Commits",
  metaDescription:
    "Turn a diff summary into an AI prompt for a Conventional Commits message — type, scope, breaking-change footer and your 50-character subject budget.",
  steps: [
    "Pick a Commit type (feat, fix, docs and eight more), add an optional Scope, and paste your change into 'What changed (summary or trimmed diff)'.",
    "Tick 'Breaking change' to add ! and a required BREAKING CHANGE footer — the header preview shows how much of the 50-character subject your prefix leaves.",
    "Click Copy prompt to paste the generated Conventional Commits v1.0.0 prompt into your AI assistant.",
  ],
  intro:
    "The Commit Message Prompt Builder turns a diff summary into a prompt that produces a Conventional Commits v1.0.0 message with your chosen type, optional scope, breaking-change marker and the 50/72 length rules built in. It computes how many of the 50 subject characters your prefix (like feat(auth)!: ) already consumes, warns when the scope leaves too little room, and requires a real BREAKING CHANGE footer whenever you mark the change breaking.",
  useCases: [
    "A developer pastes a five-line summary of a password-reset feature and gets a prompt producing feat(auth): with an imperative, under-50-character subject and a why-focused body.",
    "A team using commitlint generates messages that pass the conventional config on the first try, because the exact header format is dictated in the prompt.",
    "A maintainer shipping an API change marks it breaking, describes the migration, and the prompt forces a BREAKING CHANGE footer with that content.",
  ],
  benefits: [
    [
      "Header budget arithmetic",
      "The tool measures your fixed prefix against the 50-character subject convention and shows exactly how many characters remain for the description.",
    ],
    [
      "Spec-correct types",
      "All eleven types — feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert — follow Conventional Commits v1.0.0 and the Angular convention it references.",
    ],
    [
      "One change per commit",
      "If your summary mixes unrelated changes, the generated prompt tells the model to write for the main one and list the rest under 'Consider splitting'.",
    ],
  ],
  faqs: [
    [
      "What is the Conventional Commits format?",
      "A commit header of the form type(scope)!: description — for example feat(parser): add array support — followed by an optional body and footers, as defined by the Conventional Commits v1.0.0 specification. feat maps to a SemVer MINOR release, fix to PATCH, and a ! or BREAKING CHANGE footer to MAJOR.",
    ],
    [
      "How long should a git commit message subject be?",
      "Aim for 50 characters or fewer, with 72 as the practical hard cap — beyond that git log and GitHub truncate the line. Body text wraps at 72 columns. This 50/72 rule is the long-standing git convention, and the tool subtracts your type-and-scope prefix from the 50 so the model knows its real budget.",
    ],
    [
      "When should a commit be marked as a breaking change?",
      "When any consumer of your public API — function signatures, endpoints, config formats, CLI flags — must change their code or usage after upgrading. Mark it with ! after the type/scope and a BREAKING CHANGE: footer describing what breaks and how to migrate; this tool refuses to build the prompt until you say what actually breaks.",
    ],
    [
      "Why write commit messages in the imperative mood?",
      "Convention: a commit subject completes the sentence 'If applied, this commit will …' — so 'add rate limiting', not 'added' or 'adds'. Git's own generated messages (merges, reverts) use the imperative, and the generated prompt enforces it along with a lower-case start and no trailing period.",
    ],
  ],
};

export default seo;
