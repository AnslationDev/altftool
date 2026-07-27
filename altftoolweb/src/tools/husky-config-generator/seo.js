const seo = {
  intro:
    "This generator produces a complete Husky v9 and lint-staged setup: the exact install commands for npm, pnpm, Yarn or bun, the .husky hook files, and the package.json additions including the prepare script and lint-staged configuration. It follows the current Husky v9 format, where hook files are plain shell lines and the deprecated husky.sh sourcing boilerplate is gone. It is built for developers wiring up pre-commit linting, commitlint message checks or pre-push tests in a new or existing repository.",
  useCases: [
    "Setting up a new repository so ESLint and Prettier run automatically on staged files before every commit",
    "Adding a commit-msg hook that enforces Conventional Commits with commitlint across a whole team",
    "Migrating an old Husky v4 setup to the v9 file-based format without hunting through changelogs",
  ],
  benefits: [
    ["Package-manager aware", "Emits the right install, init and exec commands for npm, pnpm, Yarn or bun."],
    ["Current v9 format", "Generates plain shell hook files without the deprecated husky.sh boilerplate that breaks in v10."],
    ["Complete output", "Covers install commands, hook files, commitlint config and the package.json prepare script in one pass."],
  ],
  faqs: [
    [
      "How do I set up Husky and lint-staged together?",
      "Install both as dev dependencies, run husky init, then make .husky/pre-commit run lint-staged and add a lint-staged object to package.json mapping globs to commands. husky init also adds a \"prepare\": \"husky\" script so hooks are installed for everyone who clones and runs an install.",
    ],
    [
      "Do Husky v9 hook files still need the husky.sh boilerplate?",
      "No. Since Husky v9, hook files are plain shell snippets — a one-line file containing npx lint-staged is a valid pre-commit hook. The old #!/usr/bin/env sh and husky.sh sourcing lines are deprecated and cause a failure in v10, so they should be removed when migrating.",
    ],
    [
      "How do I skip Husky hooks for a single commit?",
      "Set the HUSKY environment variable to 0, for example HUSKY=0 git commit -m \"wip\". Git's own --no-verify flag also skips pre-commit and commit-msg hooks. Both are meant for exceptional cases; hooks exist so problems are caught before they reach CI.",
    ],
    [
      "What does lint-staged actually run the commands on?",
      "Only on the files currently staged for the commit that match each glob pattern, not the whole project. That keeps pre-commit hooks fast: a one-line fix triggers linting for one file. Commands like eslint --fix that modify files have their changes automatically re-staged by lint-staged.",
    ],
  ],
};

export default seo;
