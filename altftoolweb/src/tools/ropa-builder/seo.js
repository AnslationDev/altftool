const seo = {
  title: "ROPA Builder: GDPR Article 30 Register in 7",
  metaDescription:
    "Type one pipe-separated line per processing activity for an Article 30 register across 7 columns, with a count of rows missing a field.",
  steps: [
    "Type one activity per line in 'Records (one per line)', separating Activity | Purpose | Data categories | People | Processor | Retention | Safeguards with a pipe.",
    "Leave the 'Require complete rows' toggle on so 'Flag missing columns' counts every row missing one of the seven fields.",
    "Read the 'Structured inventory' table — the first 100 records — then Download it as ropa-builder.txt.",
  ],
  intro:
    "The ROPA Builder turns one line per processing activity into a structured Record of Processing Activities table across the seven columns Activity, Purpose, Data categories, People, Processor, Retention and Safeguards — the working shape of a GDPR Article 30 register. Type or paste your rows with a pipe between fields and it counts complete rows, flags any row missing a column, and renders the register as a table of up to 100 activities. It is for privacy leads, ops managers and founders who need a first inventory they can review, not a legal filing.",
  useCases: [
    "A customer asks for your Article 30 record during vendor due diligence and you have the activities in your head but nothing written down in a consistent format.",
    "You are preparing for a DPIA and need to see, at a glance, which processing activities have no retention period or no named processor written against them.",
    "A new payroll or helpdesk vendor is being onboarded and you want to add the activity to the register with its data categories and safeguards before the contract is signed.",
  ],
  benefits: [
    ["Gap detection built in", "Turn on complete-row checking and it counts exactly how many activities are missing one of the seven fields, so you know what to chase."],
    ["One line per activity", "Pipe-separated entry means you can draft the whole register in a text box and reorder it without fighting a form."],
    ["Consistent column set", "Every row is forced into the same seven headings, so the output reads as a register rather than a pile of notes."],
  ],
  faqs: [
    [
      "What is a ROPA?",
      "A ROPA is a Record of Processing Activities — the written inventory of how an organisation processes personal data, required by Article 30 of the GDPR. It documents the purposes of processing, the categories of data subjects and personal data, the recipients, any transfers outside the region, retention periods, and a general description of security measures.",
    ],
    [
      "Does a small business need to keep one?",
      "Often yes. Article 30(5) exempts organisations with fewer than 250 employees, but the exemption falls away if the processing is likely to risk people's rights and freedoms, is not occasional, or involves special-category data under Article 9 or criminal-offence data under Article 10 — which covers most businesses with staff payroll or a customer database.",
    ],
    [
      "What are the seven columns this tool uses?",
      "Activity, Purpose, Data categories, People, Processor, Retention and Safeguards. They map to the core Article 30(1) content — what you do, why, whose data and what kind, who else touches it, how long you keep it, and how it is protected — in the order they are easiest to fill in.",
    ],
    [
      "Is the output ready to file with a regulator?",
      "No — treat it as a working inventory. A submission-ready record also needs controller and DPO contact details, lawful basis, third-country transfer safeguards and any jurisdiction-specific fields, so have a data protection officer or privacy lawyer review it before you rely on it in a regulatory context.",
    ],
  ],
};

export default seo;
