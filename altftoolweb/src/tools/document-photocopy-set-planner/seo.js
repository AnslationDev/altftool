const seo = {
  intro:
    "This planner computes how many photocopy sets of your documents an admission or recruitment process actually needs: for each stage it multiplies sets-per-application by the number of applications, sums across stages, adds the customary two spare sets, and converts the total into pages and copying cost. It also counts separately how many sets need attestation, since those require signatures before the day. It is built for students and job applicants juggling form submission, document verification, counselling rounds and joining formalities at once.",
  useCases: [
    "An engineering aspirant applying to 5 colleges that each want 2 attested sets, working out total sets, pages and cost before visiting the copy shop",
    "A government-job candidate preparing separate sets for application, verification and joining, and counting how many need attestation in advance",
    "A parent budgeting the photocopying for two children's admission season by listing every stage in one plan",
  ],
  benefits: [
    ["Stage-by-stage arithmetic", "Sets per application times applications, per stage — no more guessing on the counselling-day queue."],
    ["Attestation counted separately", "Flag which stages need attested copies and see how many sets must be signed or stamped beforehand."],
    ["Pages and cost included", "Total sets become total pages and an estimated bill at your local per-page rate."],
  ],
  faqs: [
    [
      "How many photocopy sets of documents should I carry for college admission?",
      "Carry what each stage's prospectus specifies plus at least two spare sets — the buffer this planner adds by default, matching the 'carry extra sets' advice on most Indian university admission checklists. A typical cycle (application, verification, counselling, joining) asks for around six sets in total, but the binding number is always your own notification.",
    ],
    [
      "What is the difference between self-attested and gazetted-attested copies?",
      "A self-attested copy carries your own signature with the words 'true copy', while gazetted attestation needs a Group A/B government officer's signature and stamp. Since 2014 the Government of India has directed departments to accept self-attested copies for most purposes, verifying originals only at the final stage — but some universities and state processes still ask for gazetted attestation, so check each notification.",
    ],
    [
      "Should photocopies for document verification be in colour or black and white?",
      "Black and white is accepted almost everywhere and costs roughly a quarter of colour copying; colour is worth it only for documents where a seal or photograph matters, such as some ID proofs. What matters more is legibility — recopy anything where the text or photo is unclear, because verification officers can reject faint copies.",
    ],
    [
      "Why keep spare photocopy sets at all?",
      "Because processes routinely demand one more set than announced — an extra counselling round, a damaged copy, or an office that keeps a set it was only meant to view. Two spares per person is the standard checklist advice; at typical Indian copy-shop rates of Rs 1-3 per page, a spare 12-page set costs less than the auto fare back to the copy shop.",
    ],
  ],
};

export default seo;
