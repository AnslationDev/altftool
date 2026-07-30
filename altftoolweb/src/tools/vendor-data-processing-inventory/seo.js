const seo = {
  intro:
    "The Vendor Data Processing Inventory turns one line per vendor into a structured eight-column register — Vendor, Purpose, Data categories, People, Location, Retention, DPA / terms and Owner — and counts how many rows are complete versus how many are still missing a field. It is the shape a record of processing activities takes under GDPR Article 30: who processes personal data for you, why, whose data, where it sits, how long it is kept, and under which contract. It is for whoever has been handed the job of listing every SaaS tool that touches customer or staff data before an audit, a security questionnaire or a DPA review.",
  useCases: [
    "A customer's security questionnaire asks for your sub-processor list with purposes and retention periods, and you have the information scattered across contracts and someone's memory.",
    "Preparing for a privacy review and needing to see at a glance which vendors have no signed DPA reference and no named internal owner.",
    "Onboarding a new analytics or support tool and adding it to the register with its data categories and retention term before it goes live.",
  ],
  benefits: [
    [
      "Completeness is measured, not assumed",
      "With flagging on, any row missing one of the eight fields is counted as needing review, so the gaps surface as a number instead of a blank cell nobody notices.",
    ],
    [
      "Retention and legal basis sit beside the vendor",
      "The register keeps the retention term and the DPA or contract reference on the same row as the purpose, which is exactly the pairing an auditor asks about.",
    ],
    [
      "Plain-text in, table out",
      "Records are pipe-separated lines you can keep in any document or ticket and re-paste later, rather than a spreadsheet locked into one file format.",
    ],
  ],
  faqs: [
    [
      "What is a record of processing activities?",
      "It is a written inventory of how an organisation processes personal data — purposes, categories of data and data subjects, recipients, transfers, retention periods and security measures. GDPR Article 30 requires controllers and processors to maintain one, and supervisory authorities can ask to see it.",
    ],
    [
      "What should each vendor row contain?",
      "The eight fields this tool tracks: the vendor name, the processing purpose, the categories of data involved, whose data it is (customers, staff, applicants), where it is processed, the retention period, the DPA or contract reference, and the internal owner accountable for that relationship.",
    ],
    [
      "Does keeping this inventory make us GDPR compliant?",
      "No — a register is one requirement among many, and it does not by itself establish a lawful basis, a valid processor contract or adequate transfer safeguards. Treat the output as informational documentation and have a privacy counsel or DPO review your obligations.",
    ],
    [
      "How many vendors can I track at once?",
      "Enter as many lines as you like; the rendered table shows the first 100 rows, while the completeness counts cover everything you paste. Each line must use the pipe character to separate all eight fields, in order.",
    ],
  ],
};

export default seo;
