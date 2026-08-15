const seo = {
  title: "EMI Affordability Check: FOIR and Rate-Rise",
  metaDescription:
    "Computes the reducing-balance EMI, puts your FOIR against a ceiling you choose, shows the surplus after essentials, and re-prices 2 points higher.",
  steps: [
    "Enter Net monthly income (INR), EMIs you already pay (INR), Essential monthly expenses (INR) and the FOIR ceiling to test against (%).",
    "Enter the Loan amount (INR), Interest rate (% a year) and Tenure (years) you are being offered.",
    "Read FOIR after this loan with the Proposed EMI and Left after EMIs and essentials, plus the panel for a 2 percentage point rate rise.",
  ],
  intro:
    "FOIR, the fixed obligation to income ratio, is the share of net monthly income already committed to EMIs, and it is the number a lender underwrites against: (existing EMIs + proposed EMI) ÷ net monthly income × 100. This checker computes the proposed EMI from the standard reducing-balance formula, places the resulting FOIR against a chosen ceiling, shows the surplus left after essential expenses, and re-runs the EMI two percentage points higher to see whether the loan survives a rate rise. It is for anyone about to sign a sanction letter who wants the arithmetic before the commitment.",
  useCases: [
    "Testing whether a Rs 30 lakh home loan at 8.75% over 20 years fits alongside an existing car EMI",
    "Finding the largest loan a salary can carry at a 50% FOIR before applying, so the application is not rejected",
    "Checking whether a floating-rate EMI would still be affordable if the benchmark rate rose two percentage points",
  ],
  benefits: [
    ["Lender's own metric", "Uses FOIR, the ratio banks actually underwrite against, not a vague affordability rule."],
    ["Budget check as well", "Shows the surplus left after essentials, which is often tighter than the lender's ceiling."],
    ["Built-in stress test", "Re-prices the EMI two percentage points higher, the rise a floating loan can deliver."],
  ],
  faqs: [
    [
      "What is a good FOIR for a loan application?",
      "Below 40% is comfortable and below 35% is very safe. Most Indian banks and NBFCs sanction retail loans up to a FOIR of around 50% of net monthly income, tightening towards 40% for lower incomes and stretching to 55-60% for high earners with strong credit profiles. There is no statutory limit — each lender sets its own policy.",
    ],
    [
      "How is EMI calculated?",
      "EMI = P × r × (1+r)ⁿ ÷ ((1+r)ⁿ − 1), where P is the principal, r is the annual rate divided by 12 and by 100, and n is the number of monthly instalments. A Rs 30 lakh loan at 8.75% over 20 years gives r = 0.00729 and n = 240, producing an EMI of about Rs 26,511 and total interest of roughly Rs 33.6 lakh.",
    ],
    [
      "How much loan can I get on a Rs 1 lakh salary?",
      "Work backwards from the FOIR ceiling. At 50% of a Rs 1,00,000 net salary the total EMI budget is Rs 50,000; if Rs 12,000 of EMIs are already running, Rs 38,000 is available, which at 8.75% over 20 years supports a loan of roughly Rs 43 lakh. Actual eligibility also depends on credit score, age, employer category and, for a home loan, the RBI's loan-to-value limits on the property.",
    ],
    [
      "What happens to my EMI if interest rates rise?",
      "On a floating-rate loan linked to an external benchmark, banks normally extend the tenure and keep the EMI unchanged. That only works while there is tenure left to give — the loan cannot usually run past retirement age — so once the tenure is maxed out the EMI itself rises. A two percentage point rise on a 20-year Rs 30 lakh loan lifts the EMI by roughly Rs 3,900 a month, which is why the stress test matters before signing.",
    ],
  ],
};

export default seo;
