const seo = {
  title: "Goal Based SIP Calculator — Solve the Monthly Amount",
  metaDescription:
    "Works backwards from your target: enter the corpus, years, return, existing investment, step-up and goal inflation to get the monthly SIP required.",
  steps: [
    "Enter the 'Target corpus in today's money (INR)', Years to the goal (1 to 40) and Expected return (% per year).",
    "Add what is 'Already invested for this goal', an Annual SIP step-up — quick chips for 0/5/10/15% — and Goal inflation (% per year).",
    "Read the Monthly SIP required, the inflation-adjusted goal value and the year-by-year projection, then click Copy result.",
  ],
  intro:
    "Most SIP calculators start from an instalment and tell you what it grows into. This one works backwards: you name the corpus you need and the date you need it, and it solves for the monthly SIP that gets you there. It accounts for money you have already invested, an annual step-up as your income grows, and inflation on the goal itself — because a ₹50 lakh target twelve years away is not ₹50 lakh in today's money.",
  useCases: [
    "Sizing the SIP for a child's undergraduate fees due in 12 years, with education inflation running well above general inflation.",
    "Working out how much a ₹5 lakh existing folio reduces the monthly instalment needed for a house down payment.",
    "Setting a 10% annual step-up SIP so the starting instalment fits today's salary while still hitting the target date.",
  ],
  benefits: [
    ["Solves for the instalment", "Inverts the SIP future-value formula instead of making you guess and check."],
    ["Counts what you already have", "Grows your existing corpus at the same return and subtracts it from the target."],
    ["Step-up aware", "Models an annual increase in the SIP amount, which usually cuts the starting instalment by 25-35%."],
  ],
  faqs: [
    [
      "How is the required SIP amount calculated?",
      "By inverting the future value of an annuity: FV = P × [((1+i)^n − 1) / i] × (1+i), where i is the monthly return and n the number of instalments. The calculator computes the growth factor for a ₹1 SIP, subtracts the future value of any lumpsum from your target, and divides.",
    ],
    [
      "What return should I assume for a goal 10 years away?",
      "Long-run assumptions commonly used in India are around 10-12% a year for diversified equity funds, 8-10% for hybrid or balanced advantage funds and 6-7% for debt funds. Returns are not guaranteed and shorter goals should use more conservative figures.",
    ],
    [
      "Should I adjust my goal for inflation?",
      "Yes, for anything more than a few years away. A ₹25 lakh goal at 6% inflation becomes about ₹44.8 lakh in 10 years; education costs are often modelled at 8-10%. Turn on inflation adjustment so the SIP targets tomorrow's price, not today's.",
    ],
    [
      "Does a step-up SIP really help?",
      "Considerably. Because the later instalments are larger but still get years of compounding, a 10% annual step-up typically lets you start roughly 30% lower than a flat SIP for the same target and date. This is informational content, not investment advice.",
    ],
  ],
};

export default seo;
