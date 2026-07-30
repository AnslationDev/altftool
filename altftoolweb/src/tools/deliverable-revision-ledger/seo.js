const seo = {
  intro:
    "The Deliverable Revision Ledger turns a pipe-separated list of client feedback into an eight-column revision log covering deliverable, version, date sent, feedback source, requested change, whether the round is included or extra, approval status and an evidence reference. Each line becomes a row, and any line missing a column is counted as needing review so gaps in your record are visible before a dispute, not after. It is built for freelancers and studios working to a fixed number of included revision rounds.",
  useCases: [
    "A client asks for a fourth round of changes on a two-revision contract, and you need the dated log showing which rounds were included and where the limit was reached.",
    "Reconstructing a project's feedback history from scattered emails, calls and messages into one table that records the source and evidence reference for every request.",
    "Preparing a final invoice with billable extra rounds itemised, so the charge lines up with a version, a date and the specific change that was requested.",
  ],
  benefits: [
    [
      "Included versus extra tracked per round",
      "The included/extra column runs alongside the version number, so 'Included 2/2' makes the contractual limit part of the record instead of something you recall later.",
    ],
    [
      "Every request tied to evidence",
      "An evidence reference field pairs each requested change with the email, call note or message ID it came from, which is what makes the ledger usable in a dispute.",
    ],
    [
      "Incomplete rows are counted",
      "Rows missing any of the eight fields are tallied separately, so an entry with no approval status or no date is flagged rather than silently accepted.",
    ],
  ],
  faqs: [
    [
      "How do I enter records?",
      "One record per line, with eight fields separated by the pipe character | in header order: Deliverable | Version | Sent at | Feedback source | Requested change | Included / extra | Approval | Evidence ref. Any line with fewer than eight filled fields is counted under 'Needs review'.",
    ],
    [
      "What counts as a revision round?",
      "A round is one consolidated set of feedback on one delivered version — not each individual comment. Logging it as a version with a send date and a feedback source is what keeps 'round two' from being argued over later; the exact definition should also be written into your contract.",
    ],
    [
      "How many revisions should I include in a project?",
      "Two included rounds is a common freelance default, which is why the ledger's included/extra column is phrased as a fraction like 1/2 or 2/2. What matters more than the number is that the contract states it and that each round is logged against a version and a date.",
    ],
    [
      "Why record the feedback source separately from the requested change?",
      "Because the source — client email, call, message thread — determines whether the request is verifiable. A change agreed on a call with only a note as evidence carries less weight than one in writing, and separating the two columns makes that visible at a glance.",
    ],
  ],
};

export default seo;
