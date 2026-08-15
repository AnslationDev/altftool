const seo = {
  title: "Changelog Prompt Builder: SemVer Bump from Commits",
  metaDescription:
    "Classifies merged commit titles by Conventional Commits, maps them to Keep a Changelog sections, and computes the SemVer bump the set implies.",
  steps: [
    "Paste your merged titles into 'Commit or merged PR titles — one per line' and set 'Current version (MAJOR.MINOR.PATCH)'.",
    "Pick the 'Written for' audience and 'Tone', and add anything extra under 'Extra instruction (optional)'.",
    "Check the Next version and the 'Bump implied by the commits' row, then press 'Copy prompt' to take the generated prompt.",
  ],
  intro:
    "A changelog prompt builder reads your merged commit titles, classifies each one under Conventional Commits 1.0.0, maps it to a Keep a Changelog 1.1.0 section, and works out the Semantic Versioning 2.0.0 bump the set implies before writing the prompt. Breaking changes marked with an exclamation mark or a BREAKING CHANGE footer force a major bump and get pulled to the top with a migration note. The result is a prompt that turns commit shorthand into release notes a user can act on, without inventing changes that were never shipped.",
  useCases: [
    "Turn a release branch's commit log into user-facing release notes without rewriting each line by hand.",
    "Check the version bump a set of merged pull requests actually justifies before you tag the release.",
    "Write two versions of the same entry — one for end users, one for SDK consumers — from a single commit list.",
    "Spot the breaking changes hiding in a large merge queue so the migration note gets written before release day.",
  ],
  benefits: [
    [
      "The bump is computed, not guessed",
      "Breaking beats feature, feature beats fix — the same precedence Semantic Versioning 2.0.0 defines.",
    ],
    [
      "Standard section order",
      "Added, Changed, Deprecated, Removed, Fixed, Security, with empty sections dropped, exactly as Keep a Changelog specifies.",
    ],
    [
      "Nothing silently disappears",
      "Lines that are not in Conventional Commits format are still listed, defaulted to Changed and flagged for a human to re-classify.",
    ],
  ],
  faqs: [
    [
      "How do I decide between a major, minor and patch release?",
      "Semantic Versioning 2.0.0 is explicit: increment MAJOR for backwards-incompatible API changes, MINOR for backwards-compatible new functionality, and PATCH for backwards-compatible bug fixes. One breaking change anywhere in the set forces MAJOR, no matter how many small fixes ship with it.",
    ],
    [
      "How do I mark a breaking change in a commit message?",
      "Conventional Commits 1.0.0 gives you two ways: put an exclamation mark before the colon, as in feat(api)!: drop v1 endpoints, or add a BREAKING CHANGE: footer describing the break. Either one signals a MAJOR bump, and the footer is the better choice when the explanation needs more than a subject line.",
    ],
    [
      "What sections should a changelog have?",
      "Keep a Changelog defines six: Added, Changed, Deprecated, Removed, Fixed and Security. Show only the ones with entries, keep them in that order, and put the newest release at the top of the file so a reader lands on what just shipped.",
    ],
    [
      "Should chore and refactor commits appear in the changelog?",
      "No, unless they change observable behaviour. Dependency bumps, formatting, test and CI commits belong in the commit history, not the release notes. The exception is a dependency bump that fixes a known vulnerability — that goes under Security with the advisory referenced.",
    ],
  ],
};

export default seo;
