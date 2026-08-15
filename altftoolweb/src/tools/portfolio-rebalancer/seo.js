const seo = {
  title: "Portfolio Rebalancer: Exact Buys, Sells or New",
  metaDescription:
    "Compare each holding against its target, see the drift in percentage points, and get exact buys and sells - or fix it with fresh money, no selling.",
  steps: [
    "Fill each row of Your holdings with Asset, Class, Current value and Target %, using Add asset for more rows and Scale to 100 if the targets do not add to 100%.",
    "Pick Sell and buy for exact targets today, or Fresh money only and enter a figure in New money to invest; the Exactly enough chip fills in the sum that closes the drift with nothing sold.",
    "Read the Drift column in pp against the 5-point band, work down Your action plan for the Asset, Action and Amount of every trade, then press Copy plan.",
  ],
  intro:
    "The Portfolio Drift Rebalancer compares each holding's current weight against its target, reports the drift in percentage points against a ±5 point band, and produces the exact buy and sell amounts to bring the portfolio back to plan. A second mode allocates only fresh money — filling the underweight assets first, selling nothing — and tells you how much new money it would take to fix the drift without a single redemption. It is aimed at Indian investors weighing a rebalance against the capital gains it would trigger. It is informational, not tax or investment advice.",
  useCases: [
    "A long equity run has pushed your 60/40 portfolio to something like 72/28 and you want the rupee figure to move, not just the feeling that it looks off.",
    "Your annual bonus has landed and you would rather direct it into the underweight legs than sell anything and pay tax on the gains.",
    "You want to see whether the drift is even worth acting on, because every holding is still inside a 5 percentage point band around its target.",
  ],
  benefits: [
    [
      "Two methods, honestly compared",
      "A full rebalance shows the total you would have to sell — the part that creates a tax event — beside a fresh-money plan that sells nothing.",
    ],
    [
      "Fresh money allocated properly",
      "New money is levelled into the underweight holdings first rather than split by target weight, which is what actually closes the gap fastest.",
    ],
    [
      "It tells you when new money is not enough",
      "If your contribution cannot reach the target weights on its own, the calculator states the amount that would, so you know when selling is unavoidable.",
    ],
  ],
  faqs: [
    [
      "How far should a portfolio drift before I rebalance?",
      "A common rule is a band of about 5 percentage points around each target, which is the band this calculator flags against. Inside the band the cost and tax of trading usually outweigh the benefit; a drift beyond it is what most written policies treat as the trigger.",
    ],
    [
      "Can I rebalance without paying tax?",
      "Often yes, by directing new contributions into the underweight assets instead of selling the overweight ones. The fresh-money mode calculates exactly that split; it works when the gap is small relative to what you are adding, and the tool tells you the amount required when it is not.",
    ],
    [
      "How are equity gains taxed when I sell to rebalance?",
      "For listed equity held over 12 months, long-term gains are taxed at 12.5% on the amount above ₹1.25 lakh in a financial year; sold within 12 months, short-term gains are taxed at 20%. Only the gain is taxed, not the full redemption. Rates change — confirm the current position with a tax professional before you act.",
    ],
    [
      "Do debt funds still get a long-term benefit?",
      "Not for units bought on or after 1 April 2023 — those are taxed at your slab rate regardless of holding period, so waiting no longer improves the treatment. Gold funds and ETFs are different again, with long-term treatment after 24 months.",
    ],
  ],
};

export default seo;
