const seo = {
  title: ".gitignore Generator – Combine Templates by Stack",
  metaDescription:
    "Tick languages, frameworks, IDEs and operating systems to merge community .gitignore templates into one sectioned, de-duplicated file plus your patterns.",
  steps: [
    "Tick your stack's checkboxes under Language, Framework, IDE / Editor and Operating system — the page starts with Node, Next.js, macOS and VS Code selected.",
    "Add project-specific rules under 'Extra patterns (optional, one per line)'; they get their own section, de-duplicated against the templates.",
    "Review the generated file with its Patterns, Sections and Duplicates removed counts, then press 'Copy .gitignore' to copy the whole file.",
  ],
  intro:
    "This generator builds a complete .gitignore file by combining per-stack templates — nine languages, five frameworks, four editors and three operating systems — into one de-duplicated, sectioned file. The pattern sets track the community templates maintained at github.com/github/gitignore, the same collection GitHub offers at repository creation, and the output follows the gitignore syntax documented by git itself. Tick your stack, add any custom patterns, and copy the result.",
  useCases: [
    "Starting a Next.js project on macOS with VS Code and getting node_modules, .next, .DS_Store and .vscode covered in one file",
    "Adding Terraform state and variable files to an existing repository's ignore rules without hunting for the canonical patterns",
    "Standardising one merged .gitignore for a polyglot monorepo that mixes Python, Go and JetBrains IDE files",
  ],
  benefits: [
    ["Stack-aware combining", "Language, framework, IDE and OS templates merge into labelled sections in a sensible order."],
    ["Automatic de-duplication", "Patterns shared between templates, like dist/ in Node and Vite, are emitted exactly once."],
    ["Custom patterns", "Append project-specific entries in their own section, de-duplicated against the templates."],
  ],
  faqs: [
    [
      "What should a .gitignore file contain?",
      "Anything generated rather than authored: dependency directories (node_modules/, vendor/), build output (dist/, target/, .next/), caches, logs, editor metadata (.idea/, .vscode/) and OS clutter (.DS_Store, Thumbs.db). Secrets like .env files belong there too — though ignoring them prevents future commits, it does not scrub ones already pushed.",
    ],
    [
      "Why is Git still tracking files I added to .gitignore?",
      ".gitignore only affects untracked files — once a file is committed, Git keeps tracking it regardless. Run 'git rm --cached <file>' (or -r for a directory) to remove it from the index while keeping it on disk, then commit; from that point the ignore rule applies.",
    ],
    [
      "What does the trailing slash in a gitignore pattern mean?",
      "A trailing slash makes the pattern match directories only: 'build/' ignores a build directory and everything in it but not a file named build. Other key syntax: '*' matches within one path segment, '**' crosses directories, '#' starts a comment, and a leading '!' re-includes a previously ignored path.",
    ],
    [
      "Should IDE and OS files go in the project .gitignore or a global one?",
      "Purists put personal noise like .DS_Store and .idea/ in a global ignore file (configured with git config core.excludesFile) so project files stay stack-specific. In practice most teams add them to the project .gitignore anyway, because it protects every contributor regardless of their local setup — both approaches work, and this generator supports the project-file route.",
    ],
  ],
};

export default seo;
