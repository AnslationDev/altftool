const seo = {
  title: "Debt to Income Ratio Checker: FOIR & EMI Headroom",
  metaDescription:
    "Compute FOIR on take-home pay and DTI on gross pay from your EMIs, test them against lender caps and the 28/36 rule, and see the EMI room left in rupees.",
  steps: [
    "Enter 'Gross monthly income (INR)' and 'Net take-home income (INR)', then each EMI including 'Credit card minimum due (INR)'.",
    "Optionally tick 'Count rent as an obligation' and set the 'Lender FOIR to test against (%)' — the default is 50%.",
    "Read FOIR on take-home pay with its zone, the 28/36 benchmarks and your EMI headroom in rupees, then click 'Copy result'.",
  ],
  intro:
    "Your debt to income ratio is total monthly debt payments divided by income, and Indian lenders underwrite the version called FOIR, which uses net take-home pay as the denominator. This checker computes FOIR on take-home pay, the debt-to-income ratio on gross pay, and the housing share separately, then reads them against common lender caps of roughly 40% to 55% and against the 28/36 benchmark used in mortgage underwriting. It also shows how much EMI room is left at whatever FOIR your lender applies.",
  useCases: [
    "Checking before a home loan application whether existing car and personal loan EMIs already push FOIR past 50%.",
    "Working out how much of an EMI you would have to clear to bring the ratio back under a lender's cap.",
    "Seeing whether your housing payment alone breaches the 28% of gross income benchmark even when the total looks acceptable.",
  ],
  benefits: [
    [
      "Both denominators",
      "FOIR on take-home pay for Indian lenders and DTI on gross pay for the 28/36 rule, side by side.",
    ],
    [
      "Counts what lenders count",
      "Credit card minimum due rather than full outstanding, with an option to include rent as an obligation.",
    ],
    [
      "Headroom in rupees",
      "Tells you the EMI you could still take on, or the amount by which you are over the cap.",
    ],
  ],
  faqs: [
    [
      "What is a good debt to income ratio in India?",
      "Under 35% of take-home pay is comfortable and leaves room for a new loan; 35% to 45% is still acceptable to most lenders; above 55% is beyond what mainstream banks underwrite. These are lender credit-policy norms, not a regulatory limit.",
    ],
    [
      "Does a credit card balance count in the ratio?",
      "Lenders count the minimum amount due each month, not the full outstanding balance, because that is the committed monthly obligation. A large revolving balance still hurts indirectly by pushing up credit utilisation and lowering your credit score.",
    ],
    [
      "What is the 28/36 rule?",
      "It is a mortgage underwriting benchmark: housing payments should stay under 28% of gross monthly income and all debt payments under 36%. It comes from US lending practice and is used worldwide as a conservative sanity check alongside FOIR.",
    ],
    [
      "How do I lower my debt to income ratio quickly?",
      "Clearing the smallest high-EMI loan removes its full instalment from the numerator immediately, which moves the ratio faster than paying down a large loan slowly. Extending the tenure on an existing loan also lowers the EMI, though it raises total interest — worth discussing with your lender or a financial adviser.",
    ],
  ],
};

export default seo;
