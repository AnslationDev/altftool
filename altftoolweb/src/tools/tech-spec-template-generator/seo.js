const seo = {
  title: "Tech Spec Template Generator: Design Doc/RFC/ADR",
  metaDescription:
    "Generate a Markdown skeleton in a Google-style design doc, Rust/React-style RFC or Nygard ADR format, with optional risk, rollout and metrics sections.",
  steps: [
    "Enter the \"Project or decision name\" and pick a \"Document type\" - Google-style design doc, RFC or Architecture Decision Record.",
    "Tick \"Extra sections\" such as background, alternatives, risks and rollout; the ADR format stays fixed at Status/Context/Decision/Consequences.",
    "Click \"Copy Markdown\" to take the template, with guidance notes in every section, into your docs repo, wiki or pull request.",
  ],
  intro:
    "This generator produces a ready-to-fill technical specification template in one of three established formats: a Google-style design doc with objective, goals, non-goals and proposed design; an RFC in the style used by the Rust and React projects; or an Architecture Decision Record in Michael Nygard's Status/Context/Decision/Consequences format. Engineers and tech leads pick the format, toggle sections like risks, rollout and alternatives, and get clean Markdown with guidance notes in every section.",
  useCases: [
    "An engineer proposing a service rewrite generates a design doc with background, alternatives-considered and a rollout plan before the kickoff review",
    "A platform team adopting RFCs for cross-team changes standardises on the generated template with drawbacks and unresolved-questions sections",
    "A team starting an ADR log creates its first Nygard-format record for a database choice and commits it under docs/adr/",
  ],
  benefits: [
    ["Three proven formats", "Google-style design doc, Rust/React-style RFC, or Nygard ADR — not an invented structure."],
    ["Guidance in every section", "Each heading carries an italic prompt explaining what a good answer looks like, so blank-page paralysis is gone."],
    ["Risk and rollout built in", "Optional sections add risk tables, rollout checklists, success metrics and milestone tables."],
  ],
  faqs: [
    [
      "What sections should a tech spec have?",
      "A strong design doc has an objective, explicit goals, non-goals, the proposed design, and alternatives considered — the structure popularised by Google's internal design docs. High-stakes changes add security and privacy, risks with mitigations, a rollout plan and success metrics, all of which this template can include.",
    ],
    [
      "What is the difference between a design doc, an RFC and an ADR?",
      "A design doc explains how one team will build something and is reviewed before implementation; an RFC proposes a change for broad comment across teams, with explicit drawbacks and unresolved questions; an ADR records a single architecture decision after it is made, in Michael Nygard's four-part format of Status, Context, Decision and Consequences. Pick by audience and timing: design docs before building, RFCs for cross-team consensus, ADRs as a permanent decision log.",
    ],
    [
      "Why include non-goals in a design document?",
      "Non-goals state what the project deliberately will not do, which prevents scope creep and stops reviewers re-litigating settled boundaries. They are the cheapest section to write and the one that saves the most debate — a reader who expects a feature can see in one line that it was excluded on purpose.",
    ],
    [
      "How long should a tech spec or ADR be?",
      "An ADR should fit on one to two pages — one decision per record. Design docs and RFCs are typically three to ten pages depending on blast radius; if a doc is longer than the reviewers will actually read, split it or move detail to an appendix. The template's guidance notes push each section toward the shortest useful answer.",
    ],
  ],
};

export default seo;
