const seo = {
  title: "Lumpsum Calculator: Future Value of an Investment",
  metaDescription:
    "Compounds a one-time investment with FV = P × (1 + r)^n and shows a year-by-year table splitting invested capital from accumulated interest.",
  steps: [
    "Enter the Lumpsum Investment Amount in ₹, the Expected Return Rate (% p.a.) and the Investment Period (Years), up to 100 whole years.",
    "Press Calculate to compound the principal annually — the panel returns Future Value and Total Interest Earned.",
    "Open Year-by-Year Breakdown for the Year, Invested, Interest and Balance columns and find the year gains overtake the capital.",
  ],
  intro:
    "Lumpsum Investment Calculator projects what a single one-time investment grows to using the annual compounding formula FV = P × (1 + r)^n, where P is the amount invested, r the expected annual return and n the number of years. It returns the maturity value alongside a year-by-year table separating your original capital from accumulated gains, so you can see the year the returns overtake the principal. It is for anyone deciding what to do with a bonus, a maturing deposit or sale proceeds and wanting the arithmetic before the pitch.",
  useCases: [
    "You have received an annual bonus and want to see what investing it for 10 years at a realistic 10-12% assumption looks like versus leaving it in a savings account.",
    "A fixed deposit is maturing and you are comparing renewing it at around 7% against a market-linked option at a higher but uncertain rate, over the same horizon.",
    "You want to know which year your gains exceed your original capital, so you can decide how long you genuinely need to leave the money untouched.",
  ],
  benefits: [
    [
      "Shows the crossover year",
      "The year-by-year table splits invested capital from accumulated returns, so compounding stops being abstract and you can see when it takes over.",
    ],
    [
      "Honest about the assumption",
      "The return rate is your input, not a promise — change it by two points and the projection changes, which is exactly the sensitivity test people skip.",
    ],
    [
      "Built for the one-time case",
      "It compounds a single principal annually rather than modelling monthly contributions, which is the correct model for a bonus, a windfall or a rolled-over deposit.",
    ],
  ],
  faqs: [
    [
      "How do I calculate the future value of a lumpsum investment?",
      "Use FV = P × (1 + r)^n. A one-time ₹1,00,000 at 12% a year for 10 years gives ₹1,00,000 × 1.12^10 = about ₹3,10,585, of which ₹2,10,585 is gain. Extend the same investment to 20 years and it reaches roughly ₹9,64,629.",
    ],
    [
      "What return rate should I assume?",
      "Use a rate that matches the instrument, not a hopeful one. Bank fixed deposits and debt instruments typically sit in the single digits, while long-run equity assumptions of 10-12% are common but not guaranteed and can be negative over short periods. Run the projection twice, at an optimistic and a conservative rate, and plan around the lower figure.",
    ],
    [
      "Is lumpsum better than SIP?",
      "It depends on when you invest. A lumpsum puts the whole amount to work immediately, which wins when markets rise from the point of entry but exposes you fully to a fall right after. A SIP averages your entry price over time, which suits money arriving monthly — the choice is usually decided by how the money arrives, not by forecasting.",
    ],
    [
      "Does the projection account for tax and inflation?",
      "No. The result is a gross nominal figure — it excludes capital gains tax, exit loads, expense ratios and inflation, all of which reduce what you actually keep. This is an informational calculation, not investment advice; a registered financial adviser can tell you how it applies to your own tax position.",
    ],
  ],
};

export default seo;
