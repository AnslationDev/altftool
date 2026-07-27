const seo = {
  intro:
    "This builder turns a list of drafts into a numbered revision history, assigning version numbers on the standard MAJOR.MINOR drafting convention — 0.1, 0.2 for internal edits, a jump to 1.0 when a version is circulated, and a final major number for the execution version. It also measures the turnaround between rounds so you can see where a negotiation stalled. Lawyers, contract managers and company secretaries use it to produce the revision table that sits at the front of a contract or pleading.",
  useCases: [
    "A contract manager producing the revision history table required at the front of a supplier agreement before signature",
    "An associate showing the client how many days each round with the counterparty actually took",
    "A company secretary logging who drafted and who reviewed every version of a board policy for the audit file",
  ],
  benefits: [
    ["Automatic numbering", "Version numbers follow the 0.1 to 1.0 draft convention without manual bookkeeping."],
    ["Turnaround visible", "Shows the gap in days before each version and flags the longest stall."],
    ["Paste-ready output", "Copies a pipe-separated version, date, author, reviewer and change table."],
  ],
  faqs: [
    [
      "How should legal documents be version numbered?",
      "The common convention keeps every pre-signature draft in the 0.x series — 0.1 for the first draft, 0.2, 0.3 for internal edits — and moves to 1.0 when a version is circulated outside the drafting team, with the signed text taking the final whole number. Firms differ, so match your client's or firm's house style if it prescribes one.",
    ],
    [
      "What should a version log contain?",
      "At minimum: the version number, the date, who prepared it, who reviewed it and a one-line description of what changed. Adding the gap in days between versions makes it obvious where a matter sat idle, which is useful when a client questions the timeline.",
    ],
    [
      "How is turnaround time between drafts measured?",
      "As whole calendar days between the date of one version and the date of the next. If the first draft is dated the 5th and the next the 9th, that is a 4-day turnaround; the average across all gaps gives the typical round length for the matter.",
    ],
    [
      "Does this replace document management or track changes?",
      "No. It builds the human-readable history table; it does not compare files or store them. Keep the authoritative versions in your document-management system and use your word processor's compare feature to see the actual textual differences.",
    ],
  ],
};

export default seo;
