const seo = {
  title: "Prepay Loan or Invest? Break-Even Calculator",
  metaDescription:
    "Weighs interest saved by prepaying against the same money invested to the loan's original end date, and solves the break-even annual return.",
  steps: [
    "Enter Outstanding principal, Remaining tenure, Loan interest rate, Lump sum available, Extra monthly amount and Expected investment return.",
    "Choose the Prepayment mode — 'Reduce tenure' keeps the same EMI, 'Reduce EMI' keeps the same tenure — and optionally 'Apply rough tax haircuts'.",
    "The verdict names the winner and the margin at the loan's original end date, with the Break-even return percentage; 'Copy analysis' copies it.",
  ],
  intro:
    "The Loan Prepayment vs Investment Analyzer answers one question with numbers: if you have spare money and a running loan, are you better off prepaying the loan or investing the same amount until the loan's original end date? It simulates the loan month by month from the EMI formula P x r x (1+r)^n / ((1+r)^n - 1), compares the interest saved against the future value of the same money compounded at your expected return, and solves for the break-even annual return at which investing starts to win. It is for anyone sitting on a bonus, a maturity payout or a monthly surplus and unsure where to put it.",
  useCases: [
    "Your annual bonus lands and you have a home loan at 8.5% with twelve years left — you want to see whether a lump-sum prepayment beats putting the same money into an index fund you expect to return 12%.",
    "You can spare an extra amount every month and want to know whether directing it at the loan closes it years earlier, or whether a monthly SIP of the same amount builds more by the loan's original end date.",
    "You are choosing between the two prepayment modes your bank offers — keeping the EMI the same and shortening the tenure, or keeping the tenure and cutting the EMI — and want both outcomes side by side.",
  ],
  benefits: [
    [
      "Gives you the break-even return, not just a verdict",
      "It binary-searches the annual return at which investing exactly matches the interest saved, so you can judge the call against your own portfolio expectations.",
    ],
    [
      "Models both prepayment modes properly",
      "Reduce-tenure keeps the EMI and reports how many years and months the loan closes early; reduce-EMI recomputes the instalment on the lower balance over the same tenure.",
    ],
    [
      "Optional tax haircuts on both sides",
      "One toggle applies a 30% haircut to interest saved for the lost home-loan interest deduction and a 12.5% haircut to investment gains for equity LTCG.",
    ],
  ],
  faqs: [
    [
      "Should I prepay my home loan or invest the money?",
      "Prepaying wins whenever your investment return after tax stays below the break-even rate this tool calculates, which is close to your loan interest rate. Prepaying delivers a guaranteed return equal to the loan rate; the investment return is an average that a weak first few years can undershoot exactly when your outstanding balance is largest.",
    ],
    [
      "What is the difference between reducing tenure and reducing EMI?",
      "Reducing tenure keeps your EMI unchanged and closes the loan earlier, which saves the most interest. Reducing EMI keeps the original end date and lowers the monthly instalment on the reduced balance, which saves less interest but frees up monthly cash flow. The tool computes both from the same prepayment amount.",
    ],
    [
      "What do the tax haircuts in this analyzer do?",
      "The toggle cuts the interest saved by 30% and the investment gain by 12.5%. The 30% reflects the home-loan interest deduction you give up by prepaying, and 12.5% is the equity long-term capital gains rate that applies on redemption above the annual exemption threshold. These are rough approximations, not a tax computation for your slab or regime.",
    ],
    [
      "Does the comparison assume I reinvest the EMIs I free up?",
      "No. The default comparison holds the prepayment amount against the same amount invested until the loan's original end date, without reinvesting freed-up EMIs. A stricter time-value comparison that also reinvests those instalments pushes the break-even hurdle up to roughly your loan interest rate. This is informational modelling, not personalised financial advice; a licensed adviser should review your actual situation.",
    ],
  ],
};

export default seo;
