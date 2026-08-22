const seo = {
  title: "Data Deletion Proof Log: 7-Column Evidence",
  metaDescription:
    "Paste one pipe-separated line per system — Request ID, System, Scope, Action, Completed at, Evidence, Reviewer — and see which rows miss a column.",
  steps: [
    "In Records (one per line), type one line per system with seven fields separated by | in this order: Request ID | System | Record scope | Action | Completed at | Evidence reference | Reviewer.",
    "Leave Require complete rows switched on (Flag missing columns) so any line with a blank cell or the wrong number of cells is counted under Needs review instead of passing silently.",
    "Check the Structured inventory table and the Complete rows, Needs review and Columns figures, then Copy or Download the log as data-deletion-proof-log.txt — the first 100 records are what gets exported.",
  ],
  intro:
    "The Data Deletion Proof Log turns loose notes about an erasure request into a seven-column evidence table — Request ID, System, Record scope, Action, Completed at, Evidence reference and Reviewer — with one line per system touched. Type each line pipe-separated and it builds the inventory, counts complete rows, and flags any row with a blank or missing column. It is for the privacy or ops person who has to show not just that a deletion request was honoured, but in which systems, when, by whom, and with what artefact backing each claim.",
  useCases: [
    "A customer has asked for erasure and you deleted from the CRM, the warehouse and the mailing tool on different days — you need one row per system with the job ID that proves each one",
    "An auditor asks for evidence that last quarter's deletions were reviewed, and you need a table showing a named reviewer against every line rather than a shared inbox thread",
    "Backups cannot be hard-deleted immediately, so you need to record the snapshot as expiry-queued with its date, separately from the live records that were removed outright",
  ],
  benefits: [
    ["Forces a row per system, not per request", "One deletion request usually spans several stores, and the log keeps CRM, backups and analytics as separate provable lines."],
    ["Incomplete rows are counted, not hidden", "Any line missing a column shows as needing review and blank cells render as a dash, so gaps are visible before an auditor finds them."],
    ["Separates the action from the evidence", "Every row carries both what was done (hard delete, anonymise, expiry queued) and the reference — job ID, ticket, audit log entry — that backs it."],
  ],
  faqs: [
    [
      "What format do the records need to be in?",
      "One record per line with seven fields separated by vertical bars, in this order: Request ID | System | Record scope | Action | Completed at | Evidence reference | Reviewer. A line such as DEL-104 | CRM | Contact record | Hard delete | 2026-07-22 11:20 | crm-audit-8841 | AK parses into a single complete row.",
    ],
    [
      "How long do we have to complete an erasure request?",
      "Under the GDPR's right to erasure a controller must respond without undue delay and within one month of receiving the request, extendable by a further two months for complex or numerous requests if the individual is told why within that first month. Other regimes set their own clocks, so check the law that applies to you rather than assuming one deadline covers everything.",
    ],
    [
      "How do we log data that lives in backups?",
      "As its own row, with the action describing what actually happened — typically that the snapshot is queued to expire on its retention schedule rather than deleted in place. Recording the backup job reference and the expected expiry keeps the log honest about the window in which the data still exists.",
    ],
    [
      "Is this log itself proof of compliance?",
      "No. It structures the evidence you already hold; it does not verify that a deletion occurred, and the underlying artefacts — job logs, audit trails, tickets — are what an auditor or regulator will examine. Have your data protection officer or legal adviser confirm that your retention exceptions and record-keeping meet the regime you operate under.",
    ],
  ],
};

export default seo;
