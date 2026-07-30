const seo = {
  intro:
    "Personal Data Flow Mapper turns pipe-separated lines into a structured data-flow inventory with seven fixed columns: step, source, data element, purpose, destination, retention or deletion rule, and control. Write one line per flow — for example '1 | Signup form | Email | Create account | Identity service | Account life + 30d | TLS and role access' — and it builds the table, counts complete rows, and flags any row with a missing column when the completeness check is on. The columns deliberately mirror what a processing record is normally expected to state: what data, why, where it goes, how long it is kept and what protects it.",
  useCases: [
    "Writing the first draft of a processing inventory for a small product, where the flows exist in people's heads but have never been written down",
    "Preparing for a privacy review by listing every place an email address travels — signup form, identity service, CRM, email provider — with the retention rule beside each hop",
    "Checking a vendor questionnaire answer by mapping which fields actually leave your systems and to which processor",
  ],
  benefits: [
    ["Forces the questions people skip", "Every row needs a purpose, a retention rule and a control, so 'we store it' cannot pass as a complete entry."],
    ["Completeness check built in", "Turn on the flag and it counts exactly how many rows are missing a column, splitting the inventory into complete and needs-review."],
    ["Plain-text source, structured output", "The inventory lives as editable lines you can keep in a ticket or a repo, and renders as a table without a spreadsheet."],
  ],
  faqs: [
    [
      "What format do the records use?",
      "One flow per line, with seven fields separated by the pipe character in this order: Step | Source | Data | Purpose | Destination | Retention / deletion | Control. Any field left out shows as a dash, and up to 100 rows are rendered in the table.",
    ],
    [
      "What should go in the retention column?",
      "A rule, not a date — something like 'account life + 30 days' or '13 months from last login' that says when the data stops existing and what triggers the clock. A flow whose retention cannot be stated as a rule is usually one nobody has decided the answer for yet.",
    ],
    [
      "What counts as a control?",
      "The specific safeguard on that hop: encryption in transit, role-based access, pseudonymised keys, a data processing agreement with the recipient, or a regional storage restriction. One concrete measure per row is more useful than a general policy statement.",
    ],
    [
      "Does completing this make me compliant with privacy law?",
      "No. This produces an internal inventory that can feed a processing record or a privacy review, but it does not assess lawful basis, transfers or your obligations under any specific regime. Treat the output as informational and have it reviewed by a qualified privacy or legal adviser before relying on it.",
    ],
  ],
};

export default seo;
