const seo = {
  intro:
    "The fake scholarship scam is an advance-fee fraud in which a student is told they have won an award they never applied for, then asked for a registration, verification or tax payment before the money is released. This explainer maps the eight stages of the script, scores the offer against a weighted twelve-point checklist, tallies every fee demanded against the promised award, and parses the portal link offline to show whether it is a gov.in domain or a lookalike. The reference point throughout is simple: a centrally funded scholarship is paid by Direct Benefit Transfer into the student's own account and costs the student nothing at any stage.",
  useCases: [
    "A WhatsApp message says you have been selected for a 50,000 rupee merit scholarship and asks for 1,500 rupees to register.",
    "Checking whether a link that looks like the National Scholarship Portal actually resolves to scholarships.gov.in.",
    "An agent guarantees a management-quota engineering seat for a cash deposit outside the counselling process.",
    "Explaining to a first-year student why a scholarship that demands GST is fake by definition.",
  ],
  benefits: [
    [
      "Offline link parsing",
      "Reads the real host, including the user-info trick where text before an @ sign hides the true domain.",
    ],
    [
      "Fee tally against the award",
      "Sums every demand and states the only correct figure a student ever pays: zero.",
    ],
    [
      "Points at real channels",
      "The national portal, your state portal, your college aid cell and the UGC recognition lists.",
    ],
  ],
  faqs: [
    [
      "Do government scholarships in India ever charge a fee?",
      "No. Applying for and receiving a centrally funded scholarship through scholarships.gov.in is free at every stage — there is no registration, processing, verification or courier charge. Awards are paid by Direct Benefit Transfer into the student's own Aadhaar-seeded bank account, so no intermediary handles the money.",
    ],
    [
      "Is a scholarship taxable, and can anyone ask me to pay GST on it?",
      "Scholarships granted to meet the cost of education are exempt from income tax under Section 10(16) of the Income-tax Act, 1961. A demand for tax, TDS or GST before a scholarship is released has no basis in law and is one of the clearest signs of fraud. For your specific circumstances, check with a qualified tax professional.",
    ],
    [
      "How do I tell a fake scholarship portal from the real one?",
      "Look at the text between the scheme prefix and the first single slash. Central government services sit on gov.in or nic.in — the national portal is exactly scholarships.gov.in. Anything on .com, .org, .in without gov, or a domain that borrows words like nsp or yojana while sitting outside gov.in, is a lookalike, however closely the page copies the real design.",
    ],
    [
      "What details does a genuine scholarship actually need from me?",
      "Your application details, institution details, marksheets, and a bank account number with IFSC for the transfer. No genuine scheme needs your net banking password, UPI PIN, card CVV or a one-time password, because none of those are required to credit money into an account. Any request for them is credential theft, not verification.",
    ],
  ],
};

export default seo;
