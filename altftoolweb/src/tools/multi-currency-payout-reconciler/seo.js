const seo = {
  title: "Reconcile Payouts After FX, Platform Fees and Tax",
  metaDescription:
    "Paste one pipe-separated row per payout and see expected base = gross x FX - fee - withholding, the variance, and a Match or Review flag per invoice.",
  intro:
    "Multi-Currency Payout Reconciler checks each foreign-currency payout against what the invoice should have produced, computing expected base amount = gross foreign x FX rate - platform fee - withholding, then flagging any row whose received amount differs from that by more than your tolerance. You paste one pipe-separated line per payout (invoice, currency, gross, FX rate, fee, withholding, received) and get a per-row variance plus a Match or Review status and a count such as 1/2 payouts match. It is aimed at freelancers, agencies and creators settling USD or EUR invoices into a base currency where fees and tax withholding are deducted before the money lands.",
  useCases: [
    "A marketplace paid out for six USD invoices in one batch and you need to find the single invoice where the platform fee was deducted twice.",
    "Your bank credited a EUR invoice at a different FX rate than the remittance advice showed, and you want the exact base-currency variance to quote in the support ticket.",
    "You are closing the month and need to confirm that every payout landed within one rupee of the expected figure before you post the receipts to your books.",
  ],
  benefits: [
    [
      "Separates FX drift from fee errors",
      "Because the expected amount is rebuilt from gross, rate, fee and withholding, the variance points at which input is wrong rather than just saying the total is off.",
    ],
    [
      "Tolerance is yours to set",
      "One shared threshold decides Match versus Review, so rounding noise of a few paise stops generating false alarms while a real shortfall still stands out.",
    ],
    [
      "FX rates kept at six decimals",
      "Rates are carried to six decimal places in the output, which matters when a 1,000-unit invoice turns a rate difference in the fourth decimal into a visible amount.",
    ],
  ],
  faqs: [
    [
      "How is the expected payout calculated?",
      "Expected base = gross foreign amount x FX rate, minus the platform fee, minus withholding, with fee and withholding both entered in base currency. Variance is then received minus expected, so a negative variance means you were paid less than the invoice implied.",
    ],
    [
      "What format do the payout rows need?",
      "One payout per line, seven fields separated by pipes, in this order: invoice reference, currency, gross foreign amount, FX rate to base, platform fee in base, withholding in base, received in base. For example: INV-101 | USD | 1000 | 83.10 | 25 | 50 | 80525.",
    ],
    [
      "What does the match tolerance do?",
      "A row is marked Match when the absolute variance is less than or equal to the tolerance, and Review otherwise. The default is 1 unit of base currency, which absorbs ordinary rounding; set it to 0 to require an exact match.",
    ],
    [
      "Can I use this for tax or accounting filings?",
      "Treat it as a reconciliation check, not a tax computation. It compares figures you supply and does not apply any jurisdiction's withholding rates, treaty relief or FX-gain rules, so confirm the treatment of withholding and exchange differences with your accountant before filing.",
    ],
  ],
};

export default seo;
