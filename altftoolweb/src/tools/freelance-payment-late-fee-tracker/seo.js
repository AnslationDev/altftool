const seo = {
  title: "Freelance Late-Fee Tracker: Invoice Evidence Register",
  metaDescription:
    "Paste pipe-separated invoice lines into an eight-column register with the agreed late-fee term and its evidence, and see how many rows are incomplete.",
  steps: [
    "Paste one invoice per line into Records, one per line, using | between Invoice, Client, Issued, Due, Amount, Paid date / status, Agreed late-fee term and Evidence.",
    "Leave Flag rows with missing columns switched on so the completeness review counts any line with a blank field.",
    "Read the Complete and Needs review counts above the eight-column register, which lists up to 200 invoice records.",
  ],
  intro:
    "The Freelance Payment & Late-Fee Tracker turns a plain list of invoice lines into a structured eight-column register — Invoice, Client, Issued, Due, Amount, Paid date or status, the agreed late-fee term, and the evidence backing it — and flags any row that is missing a field. It is a record organiser rather than an interest calculator: it does not compute a fee, it makes sure every claim you might later make is written down with the contract clause or bank reference beside it. It suits freelancers and small studios chasing overdue invoices who need their paperwork straight before sending a reminder.",
  useCases: [
    "Preparing to chase a client who is six weeks late, and needing each unpaid invoice paired with the exact contract clause that permits a late fee",
    "Reconciling a quarter's invoicing by listing every invoice with its issue date, due date and paid date, then spotting which rows have no payment evidence at all",
    "Handing an accountant or advisor a clean register of what was billed, what was collected and which late-fee terms were actually agreed in writing",
  ],
  benefits: [
    ["Evidence is a required column", "Every row carries the contract reference or bank record that supports it, so a fee claim is never recorded without its source."],
    ["Gaps are counted, not hidden", "The completeness review reports how many rows are missing one of the eight fields, separating complete records from ones that need review."],
    ["Bulk paste, structured out", "Pipe-separated lines are parsed into a readable table of up to 200 records, so a whole quarter can go in at once."],
  ],
  faqs: [
    [
      "What do I enter for each invoice?",
      "One line per invoice with eight fields separated by the pipe character: Invoice number, Client, Issued date, Due date, Amount, Paid date or status, the agreed late-fee term, and the evidence for it. Rows with any field blank are counted as incomplete.",
    ],
    [
      "Does this calculate the late fee for me?",
      "No — it records the late-fee term you agreed, such as \"1% per month in signed contract\", rather than computing an amount. That is deliberate: the enforceable figure depends on your contract wording and local law, not on a generic formula.",
    ],
    [
      "Can I charge a late fee if my contract does not mention one?",
      "Generally not by default — a late fee usually has to be an agreed term, and many jurisdictions additionally cap the rate or require notice before it applies. Record the clause you are relying on and confirm with a qualified professional before charging; this tool is informational and is not legal advice.",
    ],
    [
      "How many invoices can I track at once?",
      "The table renders up to 200 records at a time, which covers a typical quarter or year of freelance invoicing. Longer histories are best split by period so each register stays reviewable.",
    ],
  ],
};

export default seo;
