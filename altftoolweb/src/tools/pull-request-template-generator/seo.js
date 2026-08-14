const seo = {
  title: "GitHub Pull Request Template Generator (Markdown)",
  metaDescription:
    "Build a .github/pull_request_template.md with summary, linked issues, testing and screenshot sections, tickable checklists and Closes # auto-linking.",
  steps: [
    "Tick the Sections to include, from Summary and Linked issues through How this was tested, Screenshots / recordings and Author checklist.",
    "Pick a Checklist preset — General, Frontend / UI, Backend / API or Library / package — add Extra checklist items (one per line), and tick Named template in PULL_REQUEST_TEMPLATE/ if the repo needs more than one.",
    "Press Copy template and save the Markdown at the path shown under Save as, which is .github/pull_request_template.md by default, on your default branch.",
  ],
  intro:
    "This tool generates a ready-to-commit GitHub pull request template — a Markdown file saved as .github/pull_request_template.md that pre-fills every new PR description with summary, linked-issue, testing, screenshot and checklist sections. It follows GitHub's documented template locations and closing-keyword syntax, so issues linked with \"Closes #123\" are closed automatically on merge. It is built for maintainers and team leads who want consistent, reviewable pull requests without writing the boilerplate by hand.",
  useCases: [
    "A team lead standardising PR descriptions across a repository so reviewers always see testing notes and linked issues",
    "An open-source maintainer adding a checklist that reminds contributors to run tests and update docs before requesting review",
    "A frontend team adding a before/after screenshot table and accessibility checks to every UI pull request",
  ],
  benefits: [
    ["Correct file location", "Outputs the exact .github/pull_request_template.md path GitHub scans, or a named file under PULL_REQUEST_TEMPLATE/ for multi-template repos."],
    ["Role-specific checklists", "Frontend, backend, library and general presets plus your own custom items, all as tickable task-list checkboxes."],
    ["Auto-closing issue links", "Includes the Closes # keyword pattern so merged PRs close their linked issues automatically."],
  ],
  faqs: [
    [
      "Where do I put a pull request template in a GitHub repo?",
      "Save it as pull_request_template.md in the repository root, the docs/ folder, or the .github/ folder of your default branch — .github/ is the common choice. The filename is case-insensitive, and the template must be merged into the default branch before GitHub starts using it.",
    ],
    [
      "Can a GitHub repository have more than one PR template?",
      "Yes. Put each template as its own .md file inside a PULL_REQUEST_TEMPLATE/ subdirectory (for example .github/PULL_REQUEST_TEMPLATE/feature.md), then select one when opening a PR by adding ?template=feature.md to the compare URL. There is no automatic picker in the UI, so teams usually document the URLs in CONTRIBUTING.md.",
    ],
    [
      "How do I make a pull request close an issue automatically?",
      "Use a closing keyword followed by the issue number in the PR description — close, closes, closed, fix, fixes, fixed, resolve, resolves or resolved, as in \"Closes #123\". When the PR merges into the default branch, GitHub closes the referenced issue; the template generated here includes a Linked issues section with this pattern.",
    ],
    [
      "Do the checkboxes in a PR template actually do anything?",
      "They render as interactive task lists: anyone with edit access can tick them after the PR is opened, and GitHub shows task completion progress in PR lists. They are not enforced by GitHub itself, but many teams pair them with CI bots or required reviews that check the boxes are complete before merge.",
    ],
  ],
};

export default seo;
