const seo = {
  title: "Loan Foreclosure Calculator + Request Letter",
  metaDescription:
    "Principal, accrued interest, foreclosure fee and 18% GST in one total, with the RBI floating-rate exemption applied and a request letter drafted.",
  steps: [
    "Fill The loan today: Principal outstanding (INR), Interest rate (% per year), Instalments still to run and Days since the last instalment — leave Your EMI blank to compute it.",
    "Set Rate type and Borrower so the RBI floating-rate exemption test runs, then adjust Foreclosure charge (% of principal) and Other charges (INR).",
    "Read Total to pay on foreclosure with the Net saving by foreclosing now and Closing cost equals this many EMIs rows, then press Copy letter to take the drafted foreclosure request.",
  ],
  intro:
    "The Loan Foreclosure Request Generator estimates what pre-closing a loan actually costs — principal outstanding, simple interest accrued since the last instalment on a 365-day year, the foreclosure fee as a percentage of principal and 18% GST on that fee — and compares it against the interest you would still pay if the loan ran to term. It also applies the RBI direction that bars foreclosure and pre-payment charges on floating rate term loans sanctioned to individual borrowers for non-business purposes, and drafts the letter asking the lender for a formal foreclosure statement.",
  useCases: [
    "Decide whether a bonus is better spent foreclosing a home loan or left invested, by seeing the net interest saved.",
    "Challenge a foreclosure fee quoted on a floating rate home loan where the RBI bar should apply.",
    "Budget the exact transfer amount, including accrued interest for the part-month since the last EMI.",
    "Send a written request for the foreclosure statement, the no dues certificate and the return of original documents in one letter.",
  ],
  benefits: [
    [
      "Charge exemption applied",
      "Automatically zeroes the fee for a floating rate loan to an individual for a non-business purpose.",
    ],
    [
      "Real EMI maths",
      "Uses the reducing-balance annuity formula, so remaining interest is the true figure rather than a flat estimate.",
    ],
    [
      "Break-even in EMIs",
      "Shows how many instalments the closing cost is worth, which is the quickest sanity check on the decision.",
    ],
  ],
  faqs: [
    [
      "Can a bank charge foreclosure fees on a home loan?",
      "Not on a floating rate term loan sanctioned to an individual borrower. The RBI barred pre-payment penalties on floating rate home loans by its circular of 5 June 2012 and extended the bar to all floating rate term loans to individual borrowers by the circular of 2 May 2014. Fixed rate loans and loans to companies or firms remain chargeable, typically at 2% to 5% of the principal outstanding.",
    ],
    [
      "Is GST charged on the foreclosure amount?",
      "Only on the fee, not on the principal or the interest. The foreclosure charge is consideration for a service and attracts GST at the standard 18% rate, so a ₹40,000 fee carries ₹7,200 of GST.",
    ],
    [
      "How much interest do I owe between the last EMI and the closure date?",
      "Interest accrues on the principal outstanding for the days elapsed. On a 365-day year, ₹20,00,000 at 8.5% accrues about ₹5,589 over twelve days. The lender's statement will give the exact figure to its own value date, which is the amount you must actually transfer.",
    ],
    [
      "What should I get back after foreclosing a loan?",
      "A no dues certificate, a closure statement showing a nil balance, all original property and security documents, and removal of any charge registered with a registry — all within 30 days of payment under the RBI circular of 13 September 2023. Also get standing instructions cancelled and the closure reported to the credit bureaus.",
    ],
  ],
};

export default seo;
