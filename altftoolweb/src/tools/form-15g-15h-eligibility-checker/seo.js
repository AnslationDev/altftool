const seo = {
  title: "Form 15G or 15H? Check Eligibility and TDS",
  metaDescription:
    "Applies the section 197A nil-tax test and the 15G interest ceiling, then shows the section 194A TDS at 10% (20% without PAN) you would lose.",
  steps: [
    "Enter your Age during the financial year, Residential status, Who is declaring, and the Tax regime you will use (new or old).",
    "Add your Estimated total income for the year (INR) and the Interest expected from this bank (INR), and tick PAN has been given to the bank.",
    "Read the verdict and TDS at stake this year, with the Form that applies to you, Basic exemption limit used, Section 194A TDS threshold and TDS rate applied.",
  ],
  intro:
    "This checker tells you whether you may file Form 15G or Form 15H — the self-declarations that stop a bank deducting TDS on your interest — by applying the actual tests in sections 197A(1), 197A(1A) and 197A(1C) of the Income-tax Act. It works out tax on your estimated total income under the new or old regime, compares your interest against the basic exemption limit, and shows the section 194A TDS you stand to lose if you do not file. It is aimed at depositors, pensioners and anyone whose fixed-deposit interest crosses the bank's TDS threshold.",
  useCases: [
    "A 68-year-old pensioner with Rs 6,00,000 total income and Rs 2,00,000 of FD interest checking whether Form 15H stops the bank deducting Rs 20,000.",
    "A salaried person under 60 finding out that even with nil tax, interest above the basic exemption limit disqualifies Form 15G.",
    "Comparing the new and old regime before choosing which regime to state in the declaration, since the exemption limit differs.",
  ],
  benefits: [
    ["Both statutory tests", "Applies the nil-tax test and, for Form 15G only, the interest ceiling in section 197A(1A)."],
    ["Current thresholds", "Uses the section 194A limits of Rs 50,000, and Rs 1,00,000 for senior citizens, in force from 1 April 2025."],
    ["Shows the money", "Prints the TDS that would be deducted at 10%, or 20% where no PAN is on record under section 206AA."],
  ],
  faqs: [
    [
      "Who can submit Form 15H instead of Form 15G?",
      "A resident individual who is 60 years or more at any time during the financial year submits Form 15H; everyone else eligible uses Form 15G. Form 15H has only one condition — tax on estimated total income must be nil — while Form 15G additionally requires that total interest stays within the basic exemption limit.",
    ],
    [
      "What is the TDS limit on fixed deposit interest?",
      "From 1 April 2025 a bank, co-operative bank or post office deducts TDS under section 194A only once interest crosses Rs 50,000 in the financial year, or Rs 1,00,000 for a senior citizen. Below that, no declaration is needed because no TDS arises.",
    ],
    [
      "Can I file Form 15G if my income is nil but interest is Rs 5,00,000?",
      "No. Section 197A(1A) blocks Form 15G once aggregate interest exceeds the maximum amount not chargeable to tax, which is Rs 4,00,000 under the new regime for FY 2025-26 and Rs 2,50,000 under the old regime for someone below 60. A person aged 60 or above escapes this test because Form 15H has no interest ceiling.",
    ],
    [
      "What happens if I submit a wrong Form 15G or 15H?",
      "The declaration is a statement made under section 277, so a false declaration to avoid tax can attract prosecution, and any tax the bank did not deduct still has to be paid with interest under sections 234B and 234C. If your income turns out higher than estimated, withdraw the declaration and let the bank deduct, or discuss the position with a tax professional.",
    ],
  ],
};

export default seo;
