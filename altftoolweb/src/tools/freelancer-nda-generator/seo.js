const seo = {
  title: "Freelancer NDA Generator: IP, Portfolio & Deletion",
  metaDescription:
    "Draft a contractor NDA covering deliverable ownership, portfolio rights and data handling — deletion and confidentiality dates computed for you.",
  steps: [
    "Fill in the client and freelancer names and addresses, the Project name, \"What the project covers\" and the Start date and Expected end date.",
    "Set the Terms — Portfolio and publicity, confidentiality survival years, the delete-everything deadline in days, data breach notice hours and Governing law — and tick clauses such as \"Assign deliverable IP to the client\".",
    "Review the clause-by-clause draft with its computed \"Delete everything by\" and \"Confidentiality runs until\" dates, then press Copy result for the full text.",
  ],
  intro:
    "A freelancer NDA has to do more than keep a secret: on a short contractor engagement the same document usually has to say who owns the deliverables, whether the work can appear in a portfolio, how credentials and personal data are handled, and what gets deleted at the end. This generator assembles all of that around your actual project dates, computing the deletion deadline and the confidentiality end date from the project end rather than leaving blanks. It is a template and not legal advice.",
  useCases: [
    "Send a designer or developer an agreement before granting repository and staging access.",
    "Agree up front that work can go in a portfolio once the client has publicly launched it.",
    "Cover a contractor who will touch customer records, with a fixed breach notification deadline.",
    "Make sure editable source files and credentials are handed back within two weeks of delivery.",
  ],
  benefits: [
    ["Deliverables treated as confidential", "Drafts and working files stay confidential until the client publicly releases them, which a plain NDA usually misses."],
    ["Portfolio question answered explicitly", "Three drafted positions — no use, use with approval, or use after public launch — instead of silence that leads to a dispute."],
    ["Dates computed, not left blank", "Project length, deletion deadline and confidentiality expiry are calculated from the start and end dates you enter."],
  ],
  faqs: [
    [
      "Who owns the work a freelancer creates?",
      "By default, in most jurisdictions the person who creates a work owns the copyright unless it is assigned in writing or falls within a narrow work-made-for-hire category. A contractor is generally not an employee, so an express written assignment is what actually transfers ownership to the client.",
    ],
    [
      "Can a freelancer put NDA-covered work in their portfolio?",
      "Only if the agreement says so. The common middle ground is that publicly released work can be shown while unreleased work, internal metrics and source code cannot. A blanket ban is enforceable but is a genuine cost to a freelancer and is usually negotiable.",
    ],
    [
      "What is the difference between an NDA and a contract for services?",
      "An NDA governs confidentiality and, in this template, ownership and deletion. A contract for services or statement of work governs scope, fees, milestones, revisions and termination. Keep them separate so that a confidentiality dispute never becomes an argument about whether an invoice is payable.",
    ],
    [
      "How quickly must a contractor report a data breach?",
      "Under GDPR-style regimes the controller must notify the supervisory authority without undue delay and, where feasible, within 72 hours of becoming aware of a breach. Contracts therefore set a shorter processor deadline — commonly 12 to 48 hours — so the client has time to assess and report. A separate data processing agreement is normally required as well.",
    ],
  ],
};

export default seo;
