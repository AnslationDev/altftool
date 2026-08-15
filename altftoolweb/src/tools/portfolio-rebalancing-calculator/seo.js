const seo = {
  title: "Portfolio Rebalancing Calculator with No-Sell Option",
  metaDescription:
    "Get the exact buy or sell amount for each holding to hit your target mix — or split fresh money across underweight assets without selling anything.",
  steps: [
    "Enter each holding's Current value (INR) and Target allocation (%) — targets must total 100% — and click Add asset for more rows.",
    "Choose Buy and sell to target or New money only (no selling), then set New money to invest and your Tolerance band in percentage points.",
    "Read each row's Buy, Sell or Hold amount, the total turnover, and which holdings sit outside the band, then click Copy result for the plan.",
  ],
  intro:
    "The Portfolio Rebalancing Calculator turns a drifted portfolio back into your intended asset mix. Enter the current value of each holding and the target percentage you want it to hold, and it returns the exact rupee amount to buy or sell in every line item, the resulting weights and the total turnover. A second mode allocates only fresh money across the underweight assets, so you can correct drift without selling anything and triggering tax.",
  useCases: [
    "A 60:30:10 equity, debt and gold plan has drifted to 70:25:5 after a strong equity year and you need the precise trades to reset it.",
    "You have 1 lakh rupees of bonus money and want it directed entirely at whichever assets are furthest below target instead of selling winners.",
    "Checking whether any holding has drifted beyond your 5-percentage-point tolerance band before deciding to rebalance at all.",
  ],
  benefits: [
    ["Exact rupee instructions", "No mental arithmetic — each holding gets a buy, sell or hold amount you can act on directly."],
    ["Tax-aware no-sell mode", "Directs new contributions to underweight assets so you avoid realising capital gains."],
    ["Tolerance band check", "Flags whether any asset has actually drifted far enough to justify the transaction costs."],
  ],
  faqs: [
    [
      "How often should I rebalance a portfolio?",
      "Once a year is a common rule, often combined with a tolerance band such as 5 percentage points so you only trade when an asset has genuinely drifted. Rebalancing more often raises costs and taxes without reliably improving returns.",
    ],
    [
      "Is it better to rebalance with new money instead of selling?",
      "Usually yes, when the amounts allow it. Directing fresh contributions to underweight assets moves you toward target without realising capital gains or paying exit loads. New money alone cannot fully correct a large overweight, though — this calculator shows how far it gets you.",
    ],
    [
      "Does rebalancing trigger tax in India?",
      "Selling mutual fund units or shares is a redemption and can create capital gains, with different treatment for holdings under and over the relevant holding period. Switching between schemes counts as a sale too. This is general information — confirm your position with a tax professional.",
    ],
    [
      "Why do my target allocations have to add up to 100%?",
      "The calculator applies each target to the whole portfolio value. If the targets do not sum to 100%, part of the portfolio would be unassigned and the buy and sell amounts would not net out correctly, so the tool asks you to fix the totals first.",
    ],
  ],
};

export default seo;
