const seo = {
  "intro": "Equity Capital Gains Tax Calculator works out the tax on a listed equity share or equity mutual fund sale. It reads your buy and sell dates to decide short term or long term, applies the annual LTCG exemption, adds 4% cess, and handles grandfathering for holdings bought before 1 February 2018. Rates and the exemption limit are editable so the tool stays correct as rules change.",
  "useCases": [
    "Check the tax on a stock sold after two years, including how much of the annual LTCG exemption it uses up.",
    "Compare the tax hit of selling now (short term) versus waiting past the 12-month mark.",
    "Value a pre-2018 holding correctly using the 31 January 2018 fair market value under grandfathering."
  ],
  "benefits": [
    [
      "Holding period decided for you",
      "Buy and sell dates set short term or long term automatically — no manual 12-month counting."
    ],
    [
      "Exemption tracking",
      "Enter the exemption you have already used this financial year so the remaining headroom is accurate."
    ],
    [
      "Grandfathering built in",
      "For pre-Feb-2018 buys the cost is taken as the higher of actual cost and the lower of 31 Jan 2018 FMV and sale price."
    ]
  ],
  "faqs": [
    [
      "What are the current STCG and LTCG rates on listed equity?",
      "For transfers on or after 23 July 2024, short-term gains under section 111A are taxed at 20% and long-term gains under section 112A at 12.5% on the amount above the annual exemption, plus 4% cess. Both rates are editable in the tool."
    ],
    [
      "How much long-term equity gain is exempt each year?",
      "Up to ₹1,25,000 of section 112A long-term gains in a financial year is exempt. The exemption is per taxpayer per year across all equity holdings, not per trade — which is why the tool asks how much you have already used."
    ],
    [
      "When does a share become long term?",
      "Listed equity shares and equity-oriented mutual funds become long term once held for more than 12 months from the date of acquisition. Selling at 12 months or earlier is short term."
    ],
    [
      "What happens if I make a loss?",
      "No tax is payable. A short-term capital loss can be set off against both short-term and long-term capital gains, a long-term loss only against long-term gains, and unabsorbed losses can be carried forward for up to eight assessment years if you file your return by the due date. This tool is informational — confirm your position with a tax professional."
    ]
  ]
};

export default seo;
