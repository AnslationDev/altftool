const seo = {
  title: "Home Loan Tax Benefit Calculator: 80C + 24(b)",
  metaDescription:
    "Splits your EMI into principal and interest for any loan year, then applies the ₹1.5 lakh 80C cap, the ₹2 lakh 24(b) cap and 80EEA.",
  steps: [
    "Enter the Loan amount (INR), Interest rate (% per year), Tenure (years) and the Loan year to analyse, plus Other 80C investments already claimed (INR).",
    "Pick Your marginal tax slab from 5% to 30% + 4% cess and set Property type to Self-occupied or Let out / rented, ticking Eligible for Section 80EEA where it applies.",
    "Read the tax saved for that loan year above the Section 80C deduction (principal), Section 24(b) deduction (interest) and Same year under the new regime rows, then the Year / 80C / 24(b) / Tax saved table; Copy result copies the summary.",
  ],
  intro:
    "This calculator splits a home loan EMI into principal and interest for any year of the loan, then applies the Indian old-regime deductions: Section 80C on principal repayment up to ₹1,50,000 and Section 24(b) on interest up to ₹2,00,000 for a self-occupied house. It also handles let-out property, where interest is deductible in full but the house-property loss set-off against other income is capped at ₹2,00,000 a year, and the optional Section 80EEA extra ₹1,50,000 on interest. Use it to see the real, after-tax cost of your home loan instead of the headline EMI.",
  useCases: [
    "Working out how much of your first-year home loan EMI actually comes back as tax relief before you sign the sanction letter",
    "Deciding whether the old regime still beats the new regime for you once 80C and 24(b) on the home loan are counted",
    "Checking how much 80C room is left for the home loan principal after EPF, PPF, ELSS and school fees are already claimed",
    "Comparing a self-occupied purchase with a let-out second home, where full interest is deductible but only ₹2 lakh of the loss can be set off each year",
  ],
  benefits: [
    ["Year-by-year, not just year one", "Principal rises and interest falls over the tenure, so the 80C and 24(b) split changes every year — the table shows all of it."],
    ["Caps applied correctly", "80C is shared with your other investments, 24(b) is capped at ₹2 lakh for a self-occupied home, and excess let-out loss is shown as carried forward."],
    ["Old vs new regime at a glance", "The result panel shows what the same year is worth under Section 115BAC, where 80C and self-occupied 24(b) are not available."],
  ],
  faqs: [
    [
      "How much home loan tax benefit can I claim in a year?",
      "Under the old regime a self-occupied borrower can claim up to ₹1,50,000 of principal under Section 80C and up to ₹2,00,000 of interest under Section 24(b) — ₹3,50,000 in total, which is worth about ₹1,09,200 at the 30% slab with 4% cess.",
    ],
    [
      "Is the home loan deduction available under the new tax regime?",
      "No. Under the new regime (Section 115BAC) there is no Section 80C deduction and no Section 24(b) interest deduction for a self-occupied house. Interest on a let-out property can still be set off against the rental income of that property, but the resulting loss cannot be set off against salary.",
    ],
    [
      "What is the limit on interest for a rented-out property?",
      "There is no cap on the interest itself for a let-out house, but the loss under the head 'income from house property' that you can set off against other income is limited to ₹2,00,000 per year. Anything above that is carried forward for up to eight assessment years.",
    ],
    [
      "Can I claim tax benefit while the house is still under construction?",
      "Deductions start only in the financial year in which construction is completed and possession is taken. Interest paid before that is aggregated as pre-construction interest and claimed in five equal annual instalments, still inside the same ₹2,00,000 self-occupied cap.",
    ],
  ],
};

export default seo;
