const seo = {
  intro:
    "This tracker holds every college application in one place — the deadline, the fee, and the shared pile of documents each of them will ask for — and applies the University Grants Commission's fee refund slab if you end up withdrawing from a seat you have already paid for. That slab is measured against the institution's formally notified last date of admission: a full refund less a processing charge of at most ₹1,000 if you withdraw 15 days or more before it, 90% inside 15 days before, 80% up to 15 days after, 50% up to 30 days after, and nothing beyond that.",
  useCases: [
    "Holding six applications with different closing dates and seeing which one falls due next.",
    "Working out what you get back if you release a seat two weeks after the last date of admission — 80% of the fee under the UGC slab.",
    "Catching the anti-ragging undertaking, the migration certificate and the ABC ID before the verification desk asks for them.",
  ],
  benefits: [
    ["Refund figure, not guesswork", "Applies the UGC slab against the notified last date and shows exactly what is forfeited."],
    ["One document list, many colleges", "The pile is largely the same everywhere, so it is tracked once rather than per application."],
    ["Deadline order made obvious", "Applications sort by urgency, and overdue ones are called out."],
  ],
  faqs: [
    [
      "How much fee do I get back if I cancel my college admission?",
      "It depends on when you give notice relative to the institution's notified last date of admission. Under the UGC refund policy, 15 days or more before it you get the whole fee back less a processing charge capped at ₹1,000; inside 15 days before, 90%; up to 15 days after, 80%; more than 15 and up to 30 days after, 50%; and after 30 days, nothing. The date the fee was paid is irrelevant to the calculation.",
    ],
    [
      "What is the anti-ragging undertaking and do I really need it?",
      "Yes. The UGC Regulations on Curbing the Menace of Ragging, 2009 require both the student and a parent or guardian to file an undertaking every academic year. It is filed online and you carry the reference number to the verification desk. Admission is not treated as complete without it, and institutions will not waive it.",
    ],
    [
      "When do I need a migration certificate?",
      "When you move from one board or university to another — for instance from a state board to a central university, or between universities for a postgraduate course. It is issued by the institution you are leaving, not the one you are joining. Most colleges admit you provisionally and give you a deadline to produce it.",
    ],
    [
      "What is an ABC or APAAR ID and where do I get it?",
      "It is the Academic Bank of Credits identity that stores your credits across institutions under the national credit framework. You create it yourself before filling the admission form, using your Aadhaar-linked DigiLocker account, and then quote the number on the form. Central universities and institutions following the credit framework now ask for it at admission.",
    ],
  ],
};

export default seo;
