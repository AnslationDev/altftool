/**
 * Template structures follow three widely used public formats:
 *  - "Design doc": the Google-style design document (context, goals, non-goals,
 *    design, alternatives considered, cross-cutting concerns) as described in
 *    "Design Docs at Google" (industrial empiricism / design-docs literature).
 *  - "RFC": the request-for-comments style used by Rust, React and many
 *    engineering orgs — problem statement, guide-level explanation, drawbacks,
 *    rationale and alternatives, unresolved questions.
 *  - "ADR": Michael Nygard's Architecture Decision Record format —
 *    Status / Context / Decision / Consequences.
 */

export const DOC_TYPES = [
  { key: "design-doc", label: "Design doc (Google style)" },
  { key: "rfc", label: "RFC (Rust / React style)" },
  { key: "adr", label: "ADR (Nygard format)" },
];

/**
 * Sections available for the design-doc and RFC types.
 * `core` sections are always included for that doc type; the rest are optional.
 */
export const OPTIONAL_SECTIONS = [
  { key: "background", label: "Background / context" },
  { key: "alternatives", label: "Alternatives considered" },
  { key: "security", label: "Security and privacy" },
  { key: "risks", label: "Risks and mitigations" },
  { key: "rollout", label: "Rollout and migration plan" },
  { key: "metrics", label: "Success metrics" },
  { key: "timeline", label: "Milestones and timeline" },
  { key: "openQuestions", label: "Open questions" },
];

const clean = (value) => String(value == null ? "" : value).trim();

const SECTION_BODIES = {
  background: [
    "## Background",
    "",
    "_What exists today, why it is not enough, and any prior attempts. A reader new to the area should understand the problem after this section._",
    "",
  ],
  alternatives: [
    "## Alternatives considered",
    "",
    "_For each alternative: what it is, why it was rejected. \"Do nothing\" is always an alternative worth stating._",
    "",
    "| Alternative | Summary | Why not chosen |",
    "| --- | --- | --- |",
    "| Do nothing | | |",
    "| | | |",
    "",
  ],
  security: [
    "## Security and privacy",
    "",
    "- What new data is collected, stored or transmitted, and its sensitivity.",
    "- Authentication and authorization changes.",
    "- New attack surface (endpoints, parsers, third-party dependencies).",
    "",
  ],
  risks: [
    "## Risks and mitigations",
    "",
    "| Risk | Likelihood | Impact | Mitigation |",
    "| --- | --- | --- | --- |",
    "| | | | |",
    "",
  ],
  rollout: [
    "## Rollout plan",
    "",
    "- [ ] Feature flag / kill switch defined",
    "- [ ] Migration steps and their order (backward-compatible first)",
    "- [ ] Rollback procedure written and tested",
    "- [ ] Monitoring and alerts in place before launch",
    "",
  ],
  metrics: [
    "## Success metrics",
    "",
    "_How we will know this worked. Name the metric, its current baseline, and the target after launch._",
    "",
  ],
  timeline: [
    "## Milestones",
    "",
    "| Milestone | Target date | Owner |",
    "| --- | --- | --- |",
    "| Design approved | | |",
    "| Implementation complete | | |",
    "| Rolled out to 100% | | |",
    "",
  ],
  openQuestions: [
    "## Open questions",
    "",
    "_Things not yet decided. Each should have an owner and a date by which it must be resolved._",
    "",
  ],
};

/** Order sections appear in, when selected. */
const SECTION_ORDER = [
  "background",
  "alternatives",
  "security",
  "risks",
  "rollout",
  "metrics",
  "timeline",
  "openQuestions",
];

function headerBlock({ title, author, reviewers, date, status }) {
  return [
    `# ${title}`,
    "",
    `| | |`,
    `| --- | --- |`,
    `| **Author** | ${author || "_name_"} |`,
    `| **Reviewers** | ${reviewers || "_names_"} |`,
    `| **Status** | ${status} |`,
    `| **Last updated** | ${date || "_yyyy-mm-dd_"} |`,
    "",
  ];
}

/**
 * Build the spec template.
 *
 * @param {object} input
 * @param {string} input.projectName  Title of the document.
 * @param {string} [input.author]
 * @param {string} [input.reviewers]
 * @param {string} [input.date]      yyyy-mm-dd shown in the header (passed in, never Date.now()).
 * @param {string} input.docType     One of DOC_TYPES keys.
 * @param {string[]} [input.sections] Subset of OPTIONAL_SECTIONS keys (design-doc / rfc only).
 * @returns {{ markdown: string, sectionCount: number, docLabel: string } | { error: string }}
 */
export function generateSpecTemplate({
  projectName,
  author = "",
  reviewers = "",
  date = "",
  docType = "design-doc",
  sections = [],
} = {}) {
  const title = clean(projectName);
  if (title === "") return { error: "Name the project or decision this document is about." };

  const type = DOC_TYPES.find((item) => item.key === docType);
  if (!type) return { error: "Pick a document type from the list." };

  const chosen = new Set(
    (Array.isArray(sections) ? sections : []).filter((key) =>
      Object.prototype.hasOwnProperty.call(SECTION_BODIES, key),
    ),
  );

  let lines = [];
  let sectionCount = 0;

  if (docType === "adr") {
    // Nygard ADR: Status / Context / Decision / Consequences — fixed structure.
    lines = [
      `# ADR: ${title}`,
      "",
      "## Status",
      "",
      "Proposed <!-- Proposed | Accepted | Deprecated | Superseded by ADR-NNN -->",
      "",
      "## Context",
      "",
      "_The forces at play: technical, political, social. Written as neutral facts — what is true that makes this decision necessary?_",
      "",
      "## Decision",
      "",
      `_The change we are making, stated in full sentences with active voice: "We will ..."_`,
      "",
      "## Consequences",
      "",
      "_What becomes easier, what becomes harder, and what new obligations exist after this decision — including the negative ones._",
      "",
    ];
    sectionCount = 4;
  } else if (docType === "rfc") {
    lines = [
      ...headerBlock({ title: `RFC: ${title}`, author, reviewers, date, status: "Draft" }),
      "## Summary",
      "",
      "_One paragraph. What is being proposed?_",
      "",
      "## Motivation",
      "",
      "_Why do this? What use cases does it enable? What is the expected outcome?_",
      "",
      "## Guide-level explanation",
      "",
      "_Explain the proposal as if teaching it to a colleague after it ships: new concepts, examples, how existing users are affected._",
      "",
      "## Reference-level explanation",
      "",
      "_The technical detail: interfaces, data model, algorithms, interaction with existing features, corner cases._",
      "",
      "## Drawbacks",
      "",
      "_Why should we not do this? Cost, complexity, migration burden._",
      "",
    ];
    sectionCount = 5;
    for (const key of SECTION_ORDER) {
      if (chosen.has(key)) {
        lines.push(...SECTION_BODIES[key]);
        sectionCount += 1;
      }
    }
  } else {
    // Google-style design doc: context, goals, non-goals, design, then cross-cutting extras.
    lines = [
      ...headerBlock({ title, author, reviewers, date, status: "Draft" }),
      "## Objective",
      "",
      "_Two to four sentences: the problem and the proposed solution at the highest useful level._",
      "",
      "## Goals",
      "",
      "- _Measurable outcome this design must achieve_",
      "- ",
      "",
      "## Non-goals",
      "",
      "_Things a reasonable reader might expect this project to cover, that it deliberately does not. Non-goals prevent scope creep and re-litigation._",
      "",
      "- ",
      "",
      "## Proposed design",
      "",
      "_The system at the level a reviewer needs: architecture diagram, data model, APIs, and the trade-offs made. Focus on the parts that were hard to decide._",
      "",
    ];
    sectionCount = 4;
    for (const key of SECTION_ORDER) {
      if (chosen.has(key)) {
        lines.push(...SECTION_BODIES[key]);
        sectionCount += 1;
      }
    }
  }

  return {
    markdown: `${lines.join("\n").replace(/\n{3,}/g, "\n\n").trim()}\n`,
    sectionCount,
    docLabel: type.label,
    adrFixed: docType === "adr",
  };
}
