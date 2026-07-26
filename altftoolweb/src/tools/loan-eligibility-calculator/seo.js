const seo = {
  intro:
    "The Loan Eligibility Calculator estimates how much a bank or NBFC would lend you before you apply. It takes your net salary and other counted income, subtracts every running EMI, applies the FOIR ceiling underwriters use, and converts the leftover EMI room into a loan amount using the reducing-balance present-value formula. Side tables show how the same EMI capacity translates across tenures and across different FOIR bands, so you can see exactly where the number comes from.",
  useCases: [
    "Checking your personal loan eligibility on a INR 80,000 salary with a INR 12,000 car EMI already running, before a lender pulls your credit report.",
    "Deciding whether closing one small consumer-durable EMI is enough to push your eligibility past the amount you actually need.",
    "Comparing what a 15-year and a 20-year home loan sanction would look like on identical income and obligations.",
  ],
  benefits: [
    [
      "Mirrors the underwriting test",
      "FOIR on assessed income minus obligations is the first screen almost every Indian lender runs.",
    ],
    [
      "Handles part-counted income",
      "Rental and business income are usually discounted; set the share the lender counts instead of guessing.",
    ],
    [
      "Shows the trade-offs",
      "Tenure and FOIR tables make it obvious how much eligibility each extra year or looser band buys you.",
    ],
  ],
  faqs: [
    [
      "What FOIR do Indian lenders normally allow?",
      "Most banks work in the 40% to 55% range of net monthly income for all EMIs combined, allowing the upper end to higher-income and low-risk borrowers. Some NBFCs stretch to 60% at a higher interest rate.",
    ],
    [
      "Do credit card dues affect my eligibility?",
      "Yes. Lenders typically treat about 5% of your outstanding card balance as a monthly obligation, so a large revolving balance can cut eligibility noticeably even if you pay it off each month.",
    ],
    [
      "Why does a longer tenure increase the amount I qualify for?",
      "Eligibility is the present value of the EMI you can afford. Stretching the tenure spreads the same EMI over more instalments, so it services a bigger principal — but total interest rises steeply.",
    ],
    [
      "Is the eligible amount the same as what I will be sanctioned?",
      "No. This is the income-side ceiling. The final sanction is the lower of this figure and the asset-side cap (loan-to-value on the property or vehicle), and it can be reduced further by a weak credit score or unstable employment history.",
    ],
  ],
};

export default seo;
