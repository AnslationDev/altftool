const seo = {
  intro:
    "The Stop Loss and Target Calculator turns an entry price and a risk-reward ratio into the two prices that actually matter before you place an order: where you get out if you are wrong, and where you book profit if you are right. It works for both long and short trades, accepts the stop as a percentage or an exact price, and shows the rupee risk and reward for your quantity.",
  useCases: [
    "Set a 1:2 target and a 2% stop before entering an intraday equity trade, so both orders go in together.",
    "Convert a technical stop below a support level into the matching target for the ratio your system needs.",
    "Check the rupee loss a short trade would cause if the stop above resistance is hit.",
  ],
  benefits: [
    ["Long and short", "Stops and targets flip correctly for short trades instead of forcing you to reverse the maths."],
    ["Two ways to set the stop", "Enter a percentage from entry or the exact price level your chart gives you."],
    ["Break-even win rate", "See what percentage of trades must win for the chosen ratio to be profitable overall."],
  ],
  faqs: [
    [
      "How do I calculate a target price from a risk-reward ratio?",
      "Measure the risk per share as the distance between entry and stop loss, multiply it by the ratio, then add that to the entry for a long trade or subtract it for a short trade. Entry ₹100 with a ₹5 stop distance at 1:2 gives a ₹110 target.",
    ],
    [
      "What is a good risk-reward ratio?",
      "Many swing and intraday traders aim for at least 1:2, because it only needs about a 34% win rate to break even before costs. A 1:1 ratio needs more than half your trades to work out, which is harder to sustain.",
    ],
    [
      "Should the stop loss be a fixed percentage or based on the chart?",
      "A chart-based stop placed beyond a support, resistance or recent swing tends to survive normal noise better; a fixed percentage is simpler but can sit inside the instrument's usual daily range. The calculator supports both so you can compare them.",
    ],
    [
      "Do brokerage and taxes change the target?",
      "They reduce the money you keep, so the effective break-even sits slightly beyond the entry price. On small quantities it is worth adding a few extra paise to the target to cover brokerage, STT and GST.",
    ],
  ],
};

export default seo;
