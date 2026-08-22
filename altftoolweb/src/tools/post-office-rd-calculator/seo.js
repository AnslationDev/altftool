const seo = {
  title: "Post Office RD Calculator: Maturity, Default Fee",
  metaDescription:
    "Maturity value for the 5-year National Savings RD with quarterly compounding, the ₹1 per ₹100 default fee, advance rebate and premature closure.",
  steps: [
    "Enter the Monthly deposit (INR) — minimum ₹100, in multiples of ₹10 — and the Notified rate (% per year), then pick an Account term of Five years (60 instalments) or Ten years extended (120 instalments).",
    "Add \"Instalments missed and paid late\", choose \"Instalments paid in advance\" (None, six or twelve months) and set \"Close the account after (months, 0 = hold to maturity)\".",
    "Maturity value shows at the top with Total deposited, Interest earned, Effective annual yield (quarterly compounding), Default fee on missed instalments, Advance deposit rebate and a year-by-year balance table; Copy result copies the figures.",
  ],
  intro:
    "This calculator projects a National Savings Recurring Deposit — the five-year post office RD — by valuing every monthly instalment for the months it actually stays invested and compounding quarterly at the notified small savings rate. It also applies the scheme's own rules: the ₹1 per ₹100 default fee on each missed instalment, the rebate for depositing six or twelve instalments in advance, and premature closure after three years at the Post Office Savings Account rate. Use it before committing to a sixty-month standing instruction.",
  useCases: [
    "See what ₹1,000 a month for five years matures to at the currently notified rate.",
    "Work out the default fee on three missed instalments and whether the account is close to being discontinued.",
    "Compare closing the account at three years, when only the savings account rate is paid, against holding to maturity.",
  ],
  benefits: [
    ["Scheme rules, not generic RD maths", "Includes the default fee, advance rebate, revival window and the three-year closure bar."],
    ["Instalment-level valuation", "Each deposit is compounded for its own holding period, so the interest figure is not overstated."],
    ["Rate stays editable", "Small savings rates are notified quarterly, so the rate is an input rather than a hard-coded constant."],
  ],
  faqs: [
    [
      "What is the current post office RD interest rate?",
      "6.7% a year has been notified for the quarters running from 1 January 2024, compounded quarterly. Small savings rates are reset every quarter by the Ministry of Finance, so check the latest notification — the rate field here can be changed to match it.",
    ],
    [
      "What happens if I miss a post office RD instalment?",
      "You can pay it later with a default fee of ₹1 for every ₹100 of the account's monthly denomination for each defaulted month, so a ₹1,000 account costs ₹10 per missed month. After four defaults the account is treated as discontinued and can only be revived within two months from the month of the fourth default.",
    ],
    [
      "Can I close a post office RD before five years?",
      "Only after three years, and then interest is paid at the Post Office Savings Account rate for the whole period rather than the RD rate, which wipes out most of the gain. Closure before three years is not permitted except on the death of the depositor.",
    ],
    [
      "Is post office RD interest tax-free or eligible for 80C?",
      "Neither. Interest on a five-year post office recurring deposit is fully taxable at your slab rate as income from other sources, and deposits do not qualify for a section 80C deduction — unlike the five-year post office time deposit, which does.",
    ],
  ],
};

export default seo;
