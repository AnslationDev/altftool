const seo = {
  title: "Loan Comparison Calculator: EMI & Total Cost",
  metaDescription:
    "Enter amount, annual rate and term in years for the level monthly EMI, total interest and total payable. A 0% rate falls back to principal / months.",
  intro:
    "The Loan Comparison Tool turns a loan amount, an annual interest rate and a term in years into the level monthly payment, the total interest paid and the total amount payable, using the standard amortising EMI formula EMI = P x r x (1+r)^n / ((1+r)^n - 1), where r is the annual rate divided by 100 and by 12 and n is the term in months. Change one input and every figure updates, so you can put two quotes side by side and see which one actually costs less over its life. It is aimed at anyone weighing a mortgage, car loan or personal loan offer before signing.",
  useCases: [
    "Two lenders quote you 6.9% over 25 years and 7.4% over 20 years, and you want to know which one has the lower monthly payment and which one costs less in total interest.",
    "You are deciding whether to stretch a car loan from three years to five to make the payment fit your budget, and want to see exactly how much extra interest that stretch adds.",
    "A dealer or broker quotes only a monthly figure, and you want to work backwards by entering the amount, rate and term yourself to check the payment they quoted is consistent.",
  ],
  benefits: [
    [
      "Total cost, not just the payment",
      "Every calculation returns total interest and total payable alongside the monthly figure, which is where long-term offers really differ.",
    ],
    [
      "Handles a zero-rate loan correctly",
      "At 0% interest it falls back to principal divided by months instead of dividing by zero, so interest-free promotional offers still compute.",
    ],
    [
      "Same formula lenders use",
      "It applies the standard amortising annuity formula on a monthly compounding basis, so the payment lines up with a bank's own EMI schedule.",
    ],
  ],
  faqs: [
    [
      "What formula does this loan calculator use?",
      "It uses the standard amortising loan payment formula: EMI = P x r x (1+r)^n / ((1+r)^n - 1). P is the loan amount, r is the annual interest rate divided by 12 and by 100, and n is the number of monthly payments (years x 12). When the rate is 0%, the payment is simply P divided by n.",
    ],
    [
      "How much interest does a 200,000 loan at 7% over 20 years cost?",
      "About 172,143 in interest, on a monthly payment of roughly 1,550.60 and a total payable of about 372,143. That means the interest alone comes to roughly 86% of the amount borrowed, which is why the term matters as much as the rate.",
    ],
    [
      "Is a lower monthly payment always the better loan?",
      "No. A longer term lowers the monthly payment but usually raises the total interest, because interest accrues on the outstanding balance for more months. Compare the total payable figure, not just the monthly figure, when the terms differ.",
    ],
    [
      "Will my real payment match this exactly?",
      "The principal-and-interest portion should match closely, but lenders add processing fees, insurance, taxes or escrow that this calculation does not include, and some quote an APR that already bundles fees. Treat the result as an informational estimate and check the lender's official amortisation schedule before committing.",
    ],
  ],
};

export default seo;
