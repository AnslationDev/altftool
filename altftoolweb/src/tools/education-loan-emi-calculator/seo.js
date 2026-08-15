const seo = {
  title: "Education Loan EMI Calculator with Moratorium",
  metaDescription:
    "Model the moratorium and the EMI phase: simple interest through the course plus grace, capitalised into the principal, or serviced monthly instead.",
  steps: [
    "Enter Loan amount (INR), Interest rate (% per year), Course duration (years), Grace period after course (months) and Repayment tenure (years).",
    "Set During the moratorium to either \"Pay nothing — interest is capitalised\" or \"Pay simple interest every month\", adding a Rate concession for servicing (% points) if your bank offers one.",
    "Read the EMI after the moratorium headline, the interest capitalised into the principal, and the two-phase Repayment timeline, then press Copy result.",
  ],
  intro:
    "This Education Loan EMI Calculator models the two phases of a student loan: the moratorium, where banks charge simple interest through the course plus a grace period of usually six months to a year, and the repayment phase, where EMIs run on a reducing balance. It shows how much interest is capitalised into your principal if you pay nothing while studying, and how the EMI changes if you service that interest monthly instead. Useful for students and co-applicants comparing offers before signing a sanction letter.",
  useCases: [
    "Working out the EMI on a INR 15 lakh loan for a 4-year engineering degree with a 6-month grace period and a 10-year repayment.",
    "Comparing paying nothing during the course against servicing simple interest monthly with a typical 1 percentage point rate concession.",
    "Showing a parent or co-applicant what monthly commitment starts once the moratorium ends.",
  ],
  benefits: [
    ["Moratorium handled properly", "Simple interest through the course, then capitalisation into the principal."],
    ["Servicing comparison", "See in one switch what paying interest while studying saves overall."],
    ["Full timeline", "Month-by-month phases from first disbursal to the last EMI."],
  ],
  faqs: [
    [
      "What is a moratorium in an education loan?",
      "It is the period when no EMI is due — the course duration plus a grace period, typically 6 to 12 months after the course ends. Interest still accrues during this time.",
    ],
    [
      "Why does the principal grow during the moratorium?",
      "If you do not pay the interest that accrues while studying, banks capitalise it — the accrued simple interest is added to the loan, and EMIs are then calculated on the larger amount.",
    ],
    [
      "Is it worth paying interest during the course?",
      "It usually reduces total cost twice over: the interest is never capitalised, and many banks give a rate concession of around 0.5 to 1 percentage point for servicing it. Switch the moratorium dropdown to see the difference on your own numbers.",
    ],
    [
      "Can I claim tax deduction on an education loan?",
      "Section 80E of the Income Tax Act allows a deduction on the interest paid on an education loan taken for higher studies, for up to 8 years from when repayment starts, with no upper limit on the amount and no deduction on principal. This is general information, not tax advice — confirm eligibility with a qualified professional.",
    ],
  ],
};

export default seo;
