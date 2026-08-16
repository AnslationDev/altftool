const seo = {
  title: "Mortgage Calculator: EMI, Loan Amount, Interest",
  metaDescription:
    "Home price, down payment %, rate and term into a monthly EMI by the amortised formula, plus the loan amount after deposit and total interest.",
  steps: [
    "Enter Home Price, Down Payment (%), Interest Rate (% p.a.) and Loan Term (Years) — the placeholders show 5000000, 20, 8.5 and 20.",
    "Press Calculate; the tool runs EMI = P x r x (1+r)^n / ((1+r)^n - 1), with P the price less the down payment, r the annual rate divided by 12 and n the term in months.",
    "The panel shows Monthly Mortgage Payment with Total Interest Paid beneath it, plus tiles for Loan Amount, Down Payment, Monthly EMI and Total Interest; the refresh button next to Calculate clears the form.",
  ],
  intro:
    "The Mortgage Calculator works out your monthly home-loan payment from the home price, down payment percentage, annual interest rate and loan term using the standard amortised EMI formula, EMI = P x r x (1+r)^n / ((1+r)^n - 1), where r is the annual rate divided by 12 and n is the term in months. Enter a price of 50,00,000 with 20% down at 8.5% over 20 years and it returns the monthly payment, the loan amount after down payment, and the total interest paid across the full term. It is built for buyers comparing offers and anyone testing whether a bigger down payment or a shorter term is worth it.",
  useCases: [
    "You have been quoted 8.5% on a 20-year loan and want to see how much total interest you would save by shortening the term to 15 years before you sign.",
    "You are deciding between putting 10% and 20% down on the same property and need the two monthly payments side by side to see what the extra deposit actually buys you.",
    "A lender's sanction letter shows only the EMI, and you want to check it against the amortised formula yourself and see how much of the total outflow is interest rather than principal.",
  ],
  benefits: [
    [
      "Shows the interest total, not just the EMI",
      "Every calculation returns total interest paid over the full term alongside the monthly figure, so the real cost of a longer tenure is visible.",
    ],
    [
      "Down payment entered as a percentage",
      "You type 20 rather than computing the rupee amount, and the tool derives both the deposit and the resulting loan principal for you.",
    ],
    [
      "Same amortisation maths lenders use",
      "Payments come from the standard reducing-balance EMI formula, so the number lines up with a bank's own schedule for the same rate and term.",
    ],
  ],
  faqs: [
    [
      "How is the monthly mortgage payment calculated?",
      "It uses the amortised loan formula EMI = P x r x (1+r)^n / ((1+r)^n - 1). P is the loan amount after the down payment, r is the annual interest rate divided by 12, and n is the loan term in months, so a 20-year loan uses n = 240.",
    ],
    [
      "How much should I put down on a house?",
      "20% is the conventional benchmark, and in many markets it is the level at which lenders drop private mortgage insurance. Loans with 5-10% down are widely available but carry a larger principal and therefore a higher monthly payment. Confirm the specific threshold with your lender, as it varies by product and country.",
    ],
    [
      "Does a shorter loan term really save money?",
      "Yes on total interest, though the monthly payment rises. A shorter term means fewer months of interest accruing on the outstanding balance, so cutting a 20-year term to 15 typically reduces total interest substantially even at the same rate. Run both terms here to see the exact difference for your figures.",
    ],
    [
      "Does this include property tax, insurance or PMI?",
      "No. The result is principal and interest only, the P and I part of a PITI payment. Property tax, homeowner's insurance and any mortgage insurance are billed separately and should be added on top when you budget. This is general information, not lending advice, so check the full cost breakdown with your lender.",
    ],
  ],
};

export default seo;
