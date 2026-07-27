const seo = {
  intro:
    "A Definition of Done is the shared checklist every increment must pass before the team calls it finished — the Scrum Guide requires one and requires it to be the same for every item in the increment, but deliberately does not say what goes on it. This generator assembles a concrete one from four inputs: what you are building, how many engineers are on the team, how often you release, and which compliance regimes apply. Every check carries the reason it exists, and compliance checks name the clause they come from.",
  useCases: [
    "Write a team's first Definition of Done in a single retro instead of arguing about it across three",
    "Add GDPR, HIPAA, PCI DSS, SOC 2 or WCAG 2.2 AA items with the clause reference attached, so an auditor can trace each one",
    "Tighten the review rules when a team grows past eight people and single-reviewer approvals stop being enough",
  ],
  benefits: [
    ["Sized to the team", "A solo maintainer gets self-review rules; a team of nine gets two-reviewer and cross-boundary rules."],
    ["Cadence-aware", "Continuous deployment makes merge equal release, so release-readiness moves into the merge checklist automatically."],
    ["Every item justified", "Each check states why it is there, which is what stops a Definition of Done from becoming ritual."],
  ],
  faqs: [
    [
      "What is the difference between a Definition of Done and acceptance criteria?",
      "Acceptance criteria are specific to one story — what this particular feature must do. The Definition of Done applies to every story equally: tests written, review passed, docs updated, deployed. A story is finished only when it meets both. The Scrum Guide treats the Definition of Done as a commitment attached to the increment itself.",
    ],
    [
      "How many items should a Definition of Done have?",
      "Enough to cover the real risks and few enough that people read it — typically 12 to 25 checks across five or six sections. If items are routinely skipped, the list is too long or the team did not write it; both are fixed by cutting it down in a retro rather than adding a reminder.",
    ],
    [
      "Should code coverage be in the Definition of Done?",
      "Only as a threshold on the files changed, not on the whole repository. A per-change target such as 80% stops coverage sliding without blocking work in legacy areas, and it avoids the failure mode where a global number is met by testing trivial code. Set the target to 0 here to leave coverage out entirely.",
    ],
    [
      "Can the Definition of Done change?",
      "Yes, and it should — most teams revisit it at a retrospective and tighten it as their tooling improves. What it must not do is vary between stories in the same increment: a per-story exception turns the commitment into a negotiation, which is precisely what it exists to prevent.",
    ],
  ],
};

export default seo;
