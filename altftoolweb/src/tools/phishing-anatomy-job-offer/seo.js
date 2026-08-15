const seo = {
  title: "Job Offer Scam Check: Fee Demands & Fake HR Domains",
  metaDescription:
    "Scores a recruiter message against 13 weighted markers and checks every link’s registrable domain. No real employer charges a candidate a fee.",
  steps: [
    "Paste the SMS, email or WhatsApp message into the scan box; defanged forms like bad[.]online and hxxp:// are read as written.",
    "The scanner weighs 13 markers — a registration, training or security fee scores 14 points on its own — and inspects each link's registrable domain.",
    "Read the Risk score, the Markers matched count and the Strongest link problem row, then press Copy result.",
  ],
  intro:
    "This explainer takes a fraudulent job offer apart line by line — the selection with no interview, the salary that does not match the work, the \"refundable\" registration fee, the careers page on a domain the company does not own — and explains why each part is there. A scanner scores any recruiter message you paste against 13 weighted markers, including the task-based work-from-home pitch that leads into an investment scam, and inspects every link's registrable domain. The rule underneath all of it is simple: a genuine employer never charges a candidate to be hired.",
  useCases: [
    "Check an unsolicited offer letter or WhatsApp recruiter message before paying anything or sending documents.",
    "Test whether a careers link belongs to the company or to a freshly registered lookalike domain.",
    "Explain to a first-time job seeker why a small refundable deposit is the opening of the scam, not proof of good faith.",
    "Give a college placement cell a concrete marker list for the messages students keep forwarding.",
  ],
  benefits: [
    [
      "One decisive rule, weighted highest",
      "Any request for a registration, training, ID-card or security fee scores 14 points on its own, because no legitimate employer asks for one.",
    ],
    [
      "Covers the task-scam variant",
      "Per-task earning offers, Telegram-only threads and USDT payouts are scored too, since that is where the largest losses come from.",
    ],
    [
      "Runs locally",
      "Every rule executes in your browser, so a chat you are unsure about is never uploaded.",
    ],
  ],
  faqs: [
    [
      "Do real companies ever ask candidates for a registration fee?",
      "No. Legitimate employers and their recruitment agencies do not charge candidates anything — not registration, training, ID cards, background verification, a laptop or a refundable security deposit. Any fee demand, however small or however it is labelled, means the offer is fraudulent.",
    ],
    [
      "How do I check whether a job offer email is genuine?",
      "Look at the domain after the @ and the domain of the careers link, not at the words inside them. Genuine recruiters write from the company's own domain and link to its own site; a free Gmail or Outlook mailbox using the company's name, or a lookalike domain like nexora-careers-hr.online, is the whole tell.",
    ],
    [
      "Why is the deposit always described as refundable?",
      "Because \"refundable\" makes a small first payment feel reversible and therefore safe. It also sets up the next request: once the first amount is paid, further fees for verification, tax or release of the salary follow, and none of it comes back.",
    ],
    [
      "What are the part-time task jobs that pay for liking videos or rating hotels?",
      "They are the entry point of an investment scam. Small payouts arrive for the first few tasks, then you are asked to deposit your own money to unlock higher-paying tasks, and the balance shown in the app cannot be withdrawn. If money has already been sent, call 1930 and file at cybercrime.gov.in; this is general guidance, not legal advice.",
    ],
  ],
};

export default seo;
