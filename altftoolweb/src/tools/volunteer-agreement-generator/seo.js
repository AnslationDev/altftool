const seo = {
  title: "Volunteer Agreement Generator: POSH, Expenses",
  metaDescription:
    "Draft a volunteer agreement that stays clear of employment: hours, travel and meal reimbursement budget, and optional POSH and safeguarding clauses.",
  steps: [
    "Under Role and commitment set Role title, Location, Start date, Placement length (weeks), Hours per week, Days per week and Notice to end the placement (days).",
    "Under Reimbursement enter Travel per week (km), Rate per km (INR), Meal or refreshment allowance per day (INR) and any Fixed monthly payment, then tick the optional clauses you need, such as Prevention of sexual harassment or Child protection and safeguarding.",
    "Check Total volunteer hours, the travel and meal reimbursement budgets and the warning shown when the fixed payment exceeds them, then press Copy agreement to take the draft from the Agreement preview.",
  ],
  intro:
    "A volunteer agreement records what an organisation and a volunteer have agreed — role, hours, supervision, confidentiality and expenses — while deliberately stopping short of creating an employment relationship. This generator builds that document from your inputs and does the arithmetic behind it: total hours across the placement, the travel and meal reimbursement budget, and a check on whether a fixed monthly payment exceeds the expenses actually budgeted, which is the point at which a payment starts to look like wages. It also offers the clauses Indian nonprofits are most often asked for, including the POSH clause that applies because Section 2(f) of the 2013 Act treats a person working on a voluntary basis as an employee.",
  useCases: [
    "Set out a six-month weekend placement with hours, coordinator and notice period in one page.",
    "Check whether a Rs 5,000 monthly payment to a volunteer exceeds the reimbursement budget and risks being read as pay.",
    "Add safeguarding and POCSO reporting clauses for a role that puts a volunteer in contact with children.",
    "Produce a version for a volunteer under 18 with a parental consent clause and counter-signature block.",
  ],
  benefits: [
    ["Employment line held", "Every draft states that no wages are payable and that reimbursement covers actual expenses only."],
    ["Budget totalled", "Travel and meal reimbursement are computed across the whole placement, not left as a rate on a page."],
    ["Clauses you can choose", "Data protection, safeguarding, POSH, insurance, IP and publicity clauses switch on and off as the role needs."],
  ],
  faqs: [
    [
      "Is a volunteer agreement legally binding in India?",
      "It is normally written not to be a binding contract of employment or service, and most organisations state that expressly. The confidentiality and safeguarding obligations are still meant to bind, and a court looks at the substance of the arrangement — control, payment and integration — rather than the label on the document.",
    ],
    [
      "Can a volunteer be paid a stipend?",
      "Reimbursement of expenses actually incurred, against receipts, is safe. A fixed payment that exceeds those expenses starts to look like wages and can pull the arrangement into employment law and tax, so the tool compares the fixed payment against the reimbursement budget and warns when it is higher.",
    ],
    [
      "Does the POSH Act cover volunteers?",
      "Yes. Section 2(f) of the Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013 defines 'employee' to include a person engaged on a voluntary basis, whether for remuneration or not. Volunteers can therefore complain to the Internal Committee, and the organisation should share its contact details with them at induction.",
    ],
    [
      "What extra terms are needed for volunteers working with children?",
      "A declaration and background check, a rule that the volunteer is never alone and unsupervised with a child, and an express acknowledgement of the mandatory reporting duty under Sections 19 and 21 of the POCSO Act, 2012 — failure to report can attract imprisonment of up to six months, or up to one year for a person in charge of an institution.",
    ],
  ],
};

export default seo;
