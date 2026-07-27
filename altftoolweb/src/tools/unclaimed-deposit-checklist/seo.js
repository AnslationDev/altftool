const seo = {
  intro:
    "This checklist works out where forgotten money has gone and how to get it back: it measures how long an account, deposit, share folio, insurance benefit, EPF balance or mutual fund folio has been untouched, then applies the statutory clocks that move it out of the institution — two years to inoperative and ten years to RBI's Depositor Education and Awareness Fund for bank deposits, seven years to the Investor Education and Protection Fund for unclaimed dividends and shares under section 124 of the Companies Act 2013, and ten years to the Senior Citizens' Welfare Fund for unclaimed insurance amounts. It then produces the ordered claim steps and the exact papers that institution will ask for. Transfer to a fund never extinguishes the claim; it only changes who reimburses the payer.",
  useCases: [
    "Tracing a parent's old savings account that has not been used since 2012, and finding out that it now sits in the DEAF fund but is still claimable through the same bank.",
    "A shareholder whose dividends went unclaimed for seven consecutive years discovering the shares themselves have moved to IEPF and that recovery starts with Form IEPF-5.",
    "A nominee assembling the death certificate, indemnity bond and heir disclaimers needed before a bank will release a dormant balance.",
  ],
  benefits: [
    ["Names the fund", "Tells you whether the money sits with the bank, DEAF, IEPF or the Senior Citizens' Welfare Fund."],
    ["Counts calendar years properly", "Thresholds are tested on the actual anniversary date, not an approximate decimal."],
    ["Tailored paperwork", "Adds the heirship documents only when the holder has died, so the list stays short."],
  ],
  faqs: [
    [
      "How long before a bank account becomes inoperative?",
      "Two years with no customer-induced transaction, under the RBI Master Direction of 1 January 2024 that took effect on 1 April 2024. While it is inoperative the bank cannot charge you to reactivate it and cannot levy a minimum balance penalty on it — a single verified transaction brings it back.",
    ],
    [
      "Can I still claim money that has gone to the DEAF fund?",
      "Yes. Deposits unclaimed for ten years move to RBI's Depositor Education and Awareness Fund under section 26A of the Banking Regulation Act 1949, but the depositor's right to claim survives indefinitely. You apply to the bank, the bank pays you, and the bank then claims a refund from the RBI — a refusal on the ground that the money has been transferred is not correct.",
    ],
    [
      "Where do I search for unclaimed deposits in my name?",
      "Start with the RBI's UDGAM portal, launched on 17 August 2023, which searches unclaimed deposits across participating banks by name and identifier. Also check each bank's own published unclaimed deposits list, since coverage on UDGAM depends on the bank having uploaded its data.",
    ],
    [
      "What happens to shares whose dividends were never collected?",
      "A dividend unclaimed for seven years from the date it fell due goes to the Investor Education and Protection Fund under section 124(5) of the Companies Act 2013, and where the dividend has been unclaimed for seven consecutive years the underlying shares are transferred too under section 124(6). Recovery starts with Form IEPF-5 filed online, then a physical claim through the company's Nodal Officer.",
    ],
  ],
};

export default seo;
