const seo = {
  title: "GitHub Issue Template Generator — Issue Form YAML",
  metaDescription:
    "Build GitHub issue form YAML with required-field validation, labels and title prefixes — bug, feature and support presets for .github/ISSUE_TEMPLATE/.",
  steps: [
    "Pick a Template type — Bug report, Feature request or Support question — then edit the template name, description, default title prefix, labels and assignees.",
    "For bug reports, toggle fields such as 'Require a duplicate-search checkbox', the affected version, an operating-system dropdown and shell-rendered log output.",
    "Click Copy YAML and save the file at the shown path, e.g. .github/ISSUE_TEMPLATE/bug_report.yml; interactive and required field counts sit above the preview.",
  ],
  intro:
    "This tool generates GitHub issue form YAML — the structured template format stored in .github/ISSUE_TEMPLATE/ that replaces free-text issues with validated fields like dropdowns, required textareas and checkboxes. It follows GitHub's documented issue-forms schema (name, description and body are mandatory; validations.required enforces a field). Maintainers get bug reports with reproduction steps and versions attached instead of one-line complaints.",
  useCases: [
    "An open-source maintainer replacing a Markdown bug template with a form that makes reproduction steps and version mandatory",
    "A platform team adding separate bug, feature and support-question forms so incoming issues arrive pre-labelled for triage",
    "A developer adding a required 'I searched existing issues' checkbox to cut duplicate reports",
  ],
  benefits: [
    ["Schema-correct YAML", "Emits the exact top-level keys and body item types (markdown, input, textarea, dropdown, checkboxes) GitHub's issue-forms parser accepts."],
    ["Enforced fields", "Marks critical fields with validations.required so the issue cannot be submitted without them."],
    ["Three ready presets", "Bug report, feature request and support question with sensible labels, title prefixes and field sets you can adjust."],
  ],
  faqs: [
    [
      "What is the difference between GitHub issue templates and issue forms?",
      "Issue templates are plain Markdown files that pre-fill the issue body and can be edited or deleted by the reporter; issue forms are YAML files that render as a web form with typed fields and required-field validation. Forms use the .yml extension in .github/ISSUE_TEMPLATE/ and currently work on public repositories, while Markdown templates work everywhere.",
    ],
    [
      "Where do GitHub issue form files go in a repository?",
      "In the .github/ISSUE_TEMPLATE/ directory of the default branch, one .yml or .yaml file per template — for example .github/ISSUE_TEMPLATE/bug_report.yml. An optional config.yml in the same folder can disable blank issues and add contact links to external support channels.",
    ],
    [
      "How do I make a field required in a GitHub issue form?",
      "Add a validations block with required: true to the body item, which blocks submission until the field is filled. For checkboxes, set required: true on the individual option instead — that is how 'I searched for duplicates' confirmations are enforced.",
    ],
    [
      "What field types can a GitHub issue form contain?",
      "Five body types: markdown (static guidance text), input (single line), textarea (multi-line, optionally rendered as code with the render attribute), dropdown (single or multiple choice) and checkboxes. Every type except markdown needs an attributes.label, and ids let automation read specific answers later.",
    ],
  ],
};

export default seo;
