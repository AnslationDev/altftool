const seo = {
  intro:
    "The Document Version Timeline turns pipe-separated changelog lines — date | version | owner | summary — into a readable timeline card per revision, counting how many versions exist, how many distinct owners touched the document and which version is latest. Each entry is auto-labelled with a change theme: Approval when the summary mentions final, approve or sign; Reporting for budget, metric or table; Governance for compliance, legal or risk; and Content for everything else. It is for anyone who keeps revision notes in a text file and needs to show a stakeholder how a brief or policy actually evolved.",
  useCases: [
    "A campaign brief went through four revisions across three people and the client asks who changed what — you paste the notes and get a dated timeline instead of a wall of text.",
    "A policy document is up for review and you need to show, in one screen, which revisions were governance changes and which were ordinary content edits.",
    "You are writing a handover note and want the version history of a report summarised with owners named against each revision.",
  ],
  benefits: [
    [
      "Themes derived from the summary text",
      "Each line is classified as Approval, Reporting, Governance or Content from keywords in the summary, so a reviewer can spot sign-off points without reading every entry.",
    ],
    [
      "Malformed lines drop out quietly",
      "Only rows with all four fields present are rendered, so a half-written note or stray blank line will not break the timeline.",
    ],
    [
      "Version, owner and latest counted for you",
      "Distinct owner count and the most recent version are shown alongside the total, which is usually what a stakeholder asks first.",
    ],
  ],
  faqs: [
    [
      "What format do the changelog lines need to be in?",
      "Four fields separated by pipes, one revision per line: date | version | owner | summary — for example 2026-07-14 | v2.0 | Asha | Finalized executive summary. Spacing around the pipes does not matter, but a line missing any of the four fields is skipped.",
    ],
    [
      "How is the change theme decided?",
      "By keyword match on the summary. Words like final, approve or sign give Approval; budget, metric or table give Reporting; compliance, legal or risk give Governance; anything else falls through to Content. Rewording a summary changes its theme.",
    ],
    [
      "Does it read my actual document or its file history?",
      "No. It works only on the changelog text you paste, so nothing is uploaded and no document, repository or version-control system is opened. The timeline is exactly as accurate as the notes you feed it.",
    ],
    [
      "What version numbering should I use?",
      "Anything consistent — the version field is treated as a label, not parsed as a number. A common convention is to bump the second digit for edits (v1.1, v1.2) and the first for a released or signed-off revision (v2.0), which makes the approval points obvious in the timeline.",
    ],
  ],
};

export default seo;
