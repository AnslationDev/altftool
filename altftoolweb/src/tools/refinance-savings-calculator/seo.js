const seo = {
  title: "Refinance Savings Calculator: Break-Even Month",
  metaDescription:
    "Amortise your current loan against a refinance offer, net off processing, legal, valuation and foreclosure costs, and see the break-even month.",
  steps: [
    "Fill in Current Outstanding Balance, Current Interest Rate and Remaining Tenure, or press Load Sample to start from the worked scenario.",
    "Enter New Interest Rate and New Tenure, then the switch costs: Processing Fee, Legal Charges, Valuation Charges, Prepayment Penalty, Cashback / Waiver and Tax Benefit Impact.",
    "Read New EMI, Net Savings and Break-even Month in the Refinance Verdict panel, then press Copy Summary or Export CSV to save refinance-savings.csv.",
  ],
  intro:
    "The Refinance Savings Calculator amortises your existing loan and a proposed refinance offer month by month using the standard EMI formula, then subtracts the full switching cost to show what you actually keep. It is for borrowers holding a balance-transfer offer who want to know whether a lower rate survives the processing fee, legal and valuation charges, and the foreclosure penalty on the outstanding balance. You get the new EMI, total interest on each loan, net savings after costs, and the break-even month at which the cheaper EMI has repaid the switch.",
  useCases: [
    "Your bank offers a balance transfer at 8.35% against your current 10.5% home loan, and you want to see whether the roughly 25,000 processing fee plus a 0.5% foreclosure penalty leaves any real gain on the remaining 14 years.",
    "Two lenders quote almost the same rate but very different fees, so you enter each one and compare net savings after costs rather than the headline rate.",
    "You are likely to sell the property or prepay in full within three years and need to check whether the break-even month arrives before you exit the loan.",
  ],
  benefits: [
    ["Costs are inside the maths", "Processing, legal and valuation charges, the percentage foreclosure penalty and any cashback are netted off before savings are reported."],
    ["Break-even in months, not vibes", "It divides the total switch cost by the monthly EMI reduction, so you see the exact month the refinance turns positive."],
    ["Compares different tenures honestly", "Both loans are simulated to payoff, so a shorter or longer new tenure shows up as a change in total interest instead of a misleading EMI drop."],
  ],
  faqs: [
    [
      "How do I know if refinancing my loan is worth it?",
      "It is worth it when your net savings after costs are positive and you will hold the loan past the break-even month. The calculator computes break-even as the total switching cost divided by the monthly EMI reduction, so a 60,000 switch cost against a 3,000 lower EMI breaks even in month 20 and everything after that is gain.",
    ],
    [
      "What counts as the cost of switching a loan?",
      "The calculator totals the processing fee, legal charges and valuation charges, adds the prepayment or foreclosure penalty as a percentage of the outstanding balance, and subtracts any cashback the new lender offers. In the sample scenario a 0.5% penalty on a 28,00,000 balance alone adds 14,000 to the switch cost.",
    ],
    [
      "Does a lower EMI always mean I save money?",
      "No. A lower EMI often comes from a longer tenure, which can raise total interest even at a lower rate. The tool simulates both loans to full payoff and reports total interest on each, so you can see whether the EMI drop is a real saving or just a stretched schedule.",
    ],
    [
      "Why does the calculator ask for a tax benefit rate?",
      "Because interest you no longer pay is also interest you can no longer claim as a deduction. Entering your marginal rate reduces the reported savings by that share of the interest saved, giving an after-tax figure. This is an informational estimate only — confirm how home loan interest deductions apply to you with a qualified tax adviser.",
    ],
  ],
};

export default seo;
