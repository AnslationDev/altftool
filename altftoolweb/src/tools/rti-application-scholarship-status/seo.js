const seo = {
  intro:
    "This tool drafts an application under Section 6(1) of the Right to Information Act 2005 to trace a scholarship through every stage it passes — institute verification, district and state verification, sanction, and the Direct Benefit Transfer push into the bank account — and to obtain the recorded ground for a rejection. Section 4(1)(d) of the same Act requires a public authority to provide reasons for its administrative decisions to affected persons, which is what turns 'why was I rejected' into an answerable question. The draft also calculates the 30-day reply deadline under Section 7(1) and the appeal windows that follow, and states how long the application has been pending.",
  useCases: [
    "Find out which verification level a Post Matric Scholarship application has been sitting at, and since when.",
    "Get the transaction reference and failure reason when a scholarship shows as paid but nothing reached the bank account.",
    "Obtain the exact clause and the order behind a rejection so an appeal or representation can answer it.",
    "Check whether funds for the scheme and academic year were actually released to the state or institute.",
  ],
  benefits: [
    ["Follows the real workflow", "Queries mirror the actual chain of institute, district, state, sanction and payment, so each one names a record that exists."],
    ["Reasons must be given", "Section 4(1)(d) is quoted directly, which makes a bare 'not eligible' answer hard to defend."],
    ["Deadlines calculated", "Reply, transfer, first appeal and second appeal dates are worked from the filing date, alongside the exact pendency in months and days."],
  ],
  faqs: [
    [
      "Can I file an RTI to know why my scholarship was rejected?",
      "Yes. Section 4(1)(d) of the Right to Information Act 2005 obliges a public authority to provide reasons for its administrative or quasi-judicial decisions to affected persons, so asking for the order, the ground recorded and the guideline clause relied on is a proper request rather than a request for an opinion.",
    ],
    [
      "Which office should a scholarship RTI be addressed to?",
      "Address the office that actually holds the record you need: the institute for verification entries, the district welfare office for forwarding lists, the state department for sanction and rejection orders, and the central ministry for scheme guidelines and fund releases. If you pick the wrong one the application must be transferred within five days under Section 6(3), which costs time.",
    ],
    [
      "How long does the department have to answer a scholarship RTI?",
      "Thirty days from receipt under Section 7(1). If the deadline is missed, Section 7(6) requires the information to be given free of charge, and Section 20(1) allows a penalty of Rs 250 per day up to Rs 25,000 on the Public Information Officer. A first appeal lies within 30 days under Section 19(1) and a second appeal within 90 days under Section 19(3).",
    ],
    [
      "My scholarship shows as paid but no money arrived. What should I ask for?",
      "Ask for the sanction order, the date the payment file was generated and pushed, the DBT or PFMS transaction reference, the failure reason recorded by the bank or payment system, and the Aadhaar seeding or NPCI mapping status recorded against the application. Most such cases turn out to be an unseeded or wrongly mapped bank account, and the transaction reference is what lets the branch trace it. This is general information, not legal or financial advice.",
    ],
  ],
};

export default seo;
