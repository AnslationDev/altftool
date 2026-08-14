const seo = {
  title: "Kisan Vikas Patra: 115-Month Doubling at 7.5%",
  metaDescription:
    "KVP maturity value and the exact doubling period from ln(2)/ln(1+r), with a year-by-year table. Notified rate 7.5% p.a. over 9 years 7 months.",
  steps: [
    "Enter \"Amount invested (₹)\", the \"Interest rate (% p.a., compounded yearly)\" and the \"Holding period (months)\".",
    "Press \"Use notified 7.5% / 115 months\" to snap both fields back to the currently notified combination.",
    "Read the Maturity value with the amount invested and interest earned, scan the year-by-year balance table, then press Copy result.",
  ],
  intro:
    "Kisan Vikas Patra is a Government of India savings certificate whose tenure is fixed so the money invested comes back exactly doubled, and this calculator works out both halves of that promise: the maturity value for any amount and the exact doubling period implied by the rate. It applies annual compounding, solving ln(2) / ln(1 + r) for the doubling time, and uses the notified 7.5% per annum rate with its 115-month (9 years 7 months) tenure as the starting point. Useful if you are choosing between KVP and a bank fixed deposit, or checking what an older certificate bought at a different quarterly rate will pay out.",
  useCases: [
    "Checking that ₹1,00,000 put into KVP today returns ₹2,00,000 after 9 years 7 months, and what that works out to per year.",
    "Valuing a certificate bought when the rate was 6.9%, where the notified tenure was 124 months rather than 115.",
    "Comparing KVP against a 7.1% five-year bank FD before locking money away, since KVP interest is taxable but has no TDS.",
  ],
  benefits: [
    [
      "Doubling period from the rate itself",
      "Enter any rate and see the exact months needed to double, not a rule-of-72 approximation.",
    ],
    [
      "Notified combinations flagged",
      "When the rate and tenure match a Ministry of Finance notification, the result shows the exact 2x maturity value.",
    ],
    [
      "Year-by-year table",
      "See the balance building up each year, including the final part-year stub that completes the tenure.",
    ],
  ],
  faqs: [
    [
      "How long does Kisan Vikas Patra take to double money?",
      "115 months, that is 9 years and 7 months, at the currently notified rate of 7.5% per annum compounded annually. The tenure moves with the rate: it was 124 months when KVP paid 6.9% and 120 months at 7.2%.",
    ],
    [
      "What is the minimum and maximum amount I can put into KVP?",
      "The minimum is ₹1,000 and certificates are issued in multiples of ₹100, with no upper limit on the amount you can invest. Deposits above ₹10 lakh need income proof along with PAN under the post office KYC rules.",
    ],
    [
      "Can I withdraw Kisan Vikas Patra before maturity?",
      "Premature closure is allowed only after 2 years and 6 months from the date of deposit, and before that only on the death of a holder, forfeiture by a pledgee who is a Gazetted officer, or a court order. Closing early pays a lower amount from the scheme's prescribed table, not the doubled value.",
    ],
    [
      "Is KVP interest tax free?",
      "No. KVP interest is fully taxable as income from other sources and the deposit does not qualify for a section 80C deduction, although the post office does not deduct TDS on it. Because interest accrues annually, many taxpayers declare it year by year rather than in one lump at maturity — worth confirming with a tax professional for your own return.",
    ],
  ],
};

export default seo;
