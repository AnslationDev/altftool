const seo = {
  title: "Personal Loan EMI Calculator with Fees, GST & APR",
  metaDescription:
    "EMI on a reducing-balance personal loan plus total interest, processing fee, 18% GST, the amount actually credited and effective annual cost.",
  steps: [
    "Enter Loan amount (INR), Interest rate (% per year) and Tenure (months).",
    "Add the Processing fee (% of loan) and upfront insurance charges, and tick Add 18% GST on the processing fee.",
    "Read Monthly EMI, Net amount credited to you, Effective annual cost of the loan and the year-by-year repayment table.",
  ],
  intro:
    "This Personal Loan EMI Calculator works out your monthly instalment on a reducing-balance personal loan, the total interest across the tenure, and the amount that actually lands in your bank account after the processing fee and 18% GST are deducted. Because unsecured personal loans in India typically carry 10.5%–24% interest plus a 1%–3% processing fee, the headline rate rarely reflects the true cost. The tool also solves for the effective annual cost, so two offers with different fees can be compared honestly.",
  useCases: [
    "Comparing a 10.99% bank offer with a 2% fee against a 13.5% NBFC offer with zero fee on the same INR 5 lakh loan.",
    "Checking whether stretching a wedding or medical loan from 36 to 60 months is worth the extra interest.",
    "Working out the net disbursal before you commit, so a INR 5,00,000 sanction that credits only INR 4,88,200 does not surprise you.",
  ],
  benefits: [
    ["True cost, not just EMI", "Adds processing fee, GST and insurance so you see the full outgo."],
    ["Effective annual rate", "Solves the real cost of the EMI stream against the cash you receive."],
    ["Full amortisation view", "Year-by-year principal, interest and closing balance for the whole tenure."],
  ],
  faqs: [
    [
      "How is personal loan EMI calculated?",
      "EMI = P x r x (1+r)^n / ((1+r)^n - 1), where P is the loan amount, r the monthly rate (annual rate divided by 12 and by 100) and n the number of months. Interest is charged on the reducing balance, so the interest portion of each EMI falls over time.",
    ],
    [
      "Why is the amount credited less than my sanctioned loan?",
      "Most lenders deduct the processing fee plus 18% GST from the disbursal. On a INR 5,00,000 loan with a 2% fee, that is INR 10,000 plus INR 1,800 GST, so about INR 4,88,200 is credited while EMIs are still calculated on the full INR 5,00,000.",
    ],
    [
      "Does a longer tenure make a personal loan cheaper?",
      "It lowers the EMI but raises total interest, because you owe the balance for longer. Use the tenure presets to compare the EMI drop against the extra interest before deciding.",
    ],
    [
      "Can I reduce interest by prepaying a personal loan?",
      "Usually yes, since interest accrues on the outstanding balance. Lenders may charge a foreclosure fee of roughly 2%–5% on fixed-rate personal loans, and RBI rules on prepayment charges vary by borrower and loan type, so check your loan agreement first. This tool is informational and not financial advice.",
    ],
  ],
};

export default seo;
