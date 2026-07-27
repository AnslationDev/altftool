/**
 * Pull request template generator.
 *
 * GitHub picks up a single default PR template from one of three locations in the
 * default branch: the repository root, /docs, or /.github, with the filename
 * pull_request_template.md (case-insensitive). Multiple templates live in a
 * PULL_REQUEST_TEMPLATE/ subdirectory and are selected with the ?template= query
 * parameter. Source: GitHub Docs — "Creating a pull request template for your
 * repository".
 */

/** Canonical single-template path recommended by GitHub Docs. */
export const DEFAULT_TEMPLATE_PATH = ".github/pull_request_template.md";

/** Path pattern for named templates chosen via ?template=<file>. */
export const MULTI_TEMPLATE_DIR = ".github/PULL_REQUEST_TEMPLATE/";

/**
 * Sections a PR template can contain, in the order they render.
 * Each id doubles as the toggle key in buildPrTemplate.
 */
export const SECTION_ORDER = [
  { id: "summary", label: "Summary", defaultOn: true },
  { id: "linkedIssues", label: "Linked issues", defaultOn: true },
  { id: "changeType", label: "Type of change", defaultOn: true },
  { id: "changes", label: "What changed", defaultOn: true },
  { id: "testing", label: "How this was tested", defaultOn: true },
  { id: "screenshots", label: "Screenshots / recordings", defaultOn: true },
  { id: "breaking", label: "Breaking changes", defaultOn: false },
  { id: "deployment", label: "Deployment / rollout notes", defaultOn: false },
  { id: "checklist", label: "Author checklist", defaultOn: true },
];

/**
 * Checklist presets. "Closes #" linking keywords (close/fix/resolve) auto-close
 * issues on merge per GitHub Docs — "Linking a pull request to an issue".
 */
export const CHECKLIST_PRESETS = [
  {
    id: "general",
    label: "General",
    items: [
      "Self-reviewed the diff before requesting review",
      "Added or updated tests that prove the change works",
      "Updated documentation where behaviour changed",
      "No new warnings or errors in CI",
    ],
  },
  {
    id: "frontend",
    label: "Frontend / UI",
    items: [
      "Self-reviewed the diff before requesting review",
      "Checked the change at mobile and desktop widths",
      "Verified keyboard navigation and focus states",
      "Checked light and dark themes where applicable",
      "Added or updated component/unit tests",
    ],
  },
  {
    id: "backend",
    label: "Backend / API",
    items: [
      "Self-reviewed the diff before requesting review",
      "Added or updated unit and integration tests",
      "Considered backwards compatibility of API responses",
      "Database migrations are reversible and reviewed",
      "No secrets, credentials or PII in code or logs",
    ],
  },
  {
    id: "library",
    label: "Library / package",
    items: [
      "Self-reviewed the diff before requesting review",
      "Public API changes are documented in the README/docs",
      "Added a changelog entry or changeset",
      "Semver impact assessed (patch / minor / major)",
      "Types and exports updated for the change",
    ],
  },
];

/** Conventional change-type options shown as checkboxes in the template. */
export const CHANGE_TYPES = [
  "Bug fix (non-breaking change that fixes an issue)",
  "New feature (non-breaking change that adds functionality)",
  "Breaking change (fix or feature that breaks existing behaviour)",
  "Refactor / code quality (no functional change)",
  "Documentation only",
  "Build, CI or tooling",
];

const MAX_EXTRA_ITEMS = 30; // sanity cap so a pasted file cannot explode the output

/**
 * Build the PR template markdown.
 *
 * @param {object} input
 * @param {object} input.sections          Map of section id -> boolean include flag.
 * @param {string} input.checklistPreset   One of CHECKLIST_PRESETS ids.
 * @param {string} [input.extraChecklist]  Newline-separated extra checklist items.
 * @param {boolean} [input.useComments]    Emit HTML comments as author guidance.
 * @param {boolean} [input.multiTemplate]  Place the file under PULL_REQUEST_TEMPLATE/.
 * @param {string}  [input.templateName]   Filename (without .md) when multiTemplate.
 * @returns {{markdown: string, path: string, sectionCount: number, lineCount: number} | {error: string}}
 */
export function buildPrTemplate({
  sections,
  checklistPreset,
  extraChecklist = "",
  useComments = true,
  multiTemplate = false,
  templateName = "default",
}) {
  if (!sections || typeof sections !== "object") {
    return { error: "Choose at least one section to include." };
  }
  const active = SECTION_ORDER.filter((s) => Boolean(sections[s.id]));
  if (active.length === 0) {
    return { error: "Choose at least one section — an empty template does nothing." };
  }

  const preset =
    CHECKLIST_PRESETS.find((p) => p.id === checklistPreset) ?? CHECKLIST_PRESETS[0];

  const extras = String(extraChecklist)
    .split("\n")
    .map((line) => line.trim().replace(/^[-*]\s*(\[[ x]\]\s*)?/i, ""))
    .filter((line) => line.length > 0)
    .slice(0, MAX_EXTRA_ITEMS);

  const comment = (text) => (useComments ? `<!-- ${text} -->` : null);
  const blocks = [];

  for (const section of active) {
    switch (section.id) {
      case "summary":
        blocks.push([
          "## Summary",
          comment("Explain WHAT changed and WHY in one or two sentences."),
          "",
        ]);
        break;
      case "linkedIssues":
        blocks.push([
          "## Linked issues",
          comment(
            'Use closing keywords so merge closes the issue, e.g. "Closes #123".',
          ),
          "Closes #",
          "",
        ]);
        break;
      case "changeType":
        blocks.push([
          "## Type of change",
          ...CHANGE_TYPES.map((t) => `- [ ] ${t}`),
          "",
        ]);
        break;
      case "changes":
        blocks.push([
          "## What changed",
          comment("Bullet the key changes so reviewers can navigate the diff."),
          "- ",
          "- ",
          "",
        ]);
        break;
      case "testing":
        blocks.push([
          "## How this was tested",
          comment("Commands run, environments covered, and edge cases exercised."),
          "- [ ] Unit tests",
          "- [ ] Integration / e2e tests",
          "- [ ] Manual verification (describe below)",
          "",
        ]);
        break;
      case "screenshots":
        blocks.push([
          "## Screenshots / recordings",
          comment("Before/after screenshots for UI changes; delete if not applicable."),
          "| Before | After |",
          "| ------ | ----- |",
          "|        |       |",
          "",
        ]);
        break;
      case "breaking":
        blocks.push([
          "## Breaking changes",
          comment("List breaking changes and the migration path, or write 'None'."),
          "None.",
          "",
        ]);
        break;
      case "deployment":
        blocks.push([
          "## Deployment / rollout notes",
          comment("Feature flags, migrations, env vars, ordering constraints."),
          "None.",
          "",
        ]);
        break;
      case "checklist":
        blocks.push([
          "## Checklist",
          ...preset.items.map((item) => `- [ ] ${item}`),
          ...extras.map((item) => `- [ ] ${item}`),
          "",
        ]);
        break;
      default:
        break;
    }
  }

  const markdown = blocks
    .flat()
    .filter((line) => line !== null)
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trimEnd()
    .concat("\n");

  const safeName =
    String(templateName)
      .trim()
      .toLowerCase()
      .replace(/\.md$/i, "")
      .replace(/[^a-z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "default";

  const path = multiTemplate
    ? `${MULTI_TEMPLATE_DIR}${safeName}.md`
    : DEFAULT_TEMPLATE_PATH;

  return {
    markdown,
    path,
    sectionCount: active.length,
    lineCount: markdown.split("\n").length,
  };
}
