const seo = {
  intro:
    "The Loan Prepayment Calculator shows what happens to your loan when you pay a fixed extra amount towards principal every month: it computes the scheduled EMI from the standard formula P x r x (1+r)^n / ((1+r)^n - 1), then runs the loan month by month with the extra payment applied straight to principal, and reports the shortened tenure alongside the interest saved. Enter loan amount, annual rate, tenure in years and the extra monthly amount, and you get the original EMI, the reduced tenure in years and months, and the total saving. It is for borrowers deciding whether a small monthly top-up is worth committing to.",
  useCases: [
    "You got a raise and can send an extra amount to your home loan every month, and want to know how many years that actually shaves off a 20-year tenure before you set up the standing instruction.",
    "You are choosing between two top-up sizes and want to see the point at which a bigger monthly prepayment stops meaningfully shortening the loan.",
    "Your lender says prepayment reduces tenure rather than EMI, and you want the reduced-tenure number in years and months so you can plan around the new closure date.",
  ],
  benefits: [
    [
      "Simulates the loan month by month",
      "It amortises the balance one month at a time with the extra payment applied to principal, rather than approximating with a closed-form shortcut.",
    ],
    [
      "Reports the new closure date, not just a saving",
      "The reduced tenure comes back in years and months next to the original tenure, so you can see exactly when the loan ends.",
    ],
    [
      "Isolates the effect of a recurring top-up",
      "Keeping the EMI fixed and varying only the extra monthly amount makes the marginal value of each additional rupee obvious.",
    ],
  ],
  faqs: [
    [
      "How much does a small monthly prepayment actually save?",
      "On the tool's default scenario — a 50,00,000 loan at 9% over 20 years — an extra 5,000 a month cuts the tenure from 240 months to about 186 months, roughly 15 years 6 months, and saves close to 15,00,000 in total outgo. The EMI itself stays at about 44,986.",
    ],
    [
      "Does prepayment reduce my EMI or my tenure?",
      "This calculator models tenure reduction, which is what most lenders apply by default: the EMI stays the same and the loan closes earlier. Some lenders let you choose EMI reduction instead, which keeps the original end date and lowers the monthly instalment, saving less interest overall.",
    ],
    [
      "Is prepaying better than investing the same money?",
      "Prepaying gives a guaranteed return equal to your loan interest rate, so it usually wins on high-rate debt above roughly 8-9%; below that, a diversified investment may beat it if you can tolerate the risk. This is informational only — check your loan's prepayment terms and speak to a licensed adviser about your own position.",
    ],
    [
      "Why does prepaying early save so much more than prepaying later?",
      "Because in an amortising loan the early instalments are mostly interest, so a rupee of principal removed in year 2 stops interest accruing for the remaining 18 years, while the same rupee in year 18 only saves two years of interest. Front-loading prepayments is where nearly all the benefit sits.",
    ],
  ],
};

export default seo;
