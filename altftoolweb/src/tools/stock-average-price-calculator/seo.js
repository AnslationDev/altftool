const seo = {
  title: "Stock Average Price Calculator with Averaging Planner",
  metaDescription:
    "Enter each buy's quantity and price to get your weighted average, total invested and unrealised P&L — plus the shares needed to hit a target average.",
  steps: [
    "Enter each lot's 'Buy 1 — quantity' and 'Buy 1 — price per share (INR)', using Add another purchase for more rows and the optional Charges per order field.",
    "Fill in the Current market price (INR, optional) and a Target average price (INR) for the averaging planner.",
    "Read the weighted average buy price, total invested and unrealised P&L, see the 'more shares' plan with its cash outlay, then click Copy result.",
  ],
  intro:
    "The Stock Average Price Calculator blends every purchase you have made in the same stock into one weighted average buy price. Enter each lot's quantity and price — plus optional brokerage — and it returns your total holding, total invested amount and the exact break-even price per share. It also tells you how many more shares at today's market price would move your average to a level you pick.",
  useCases: [
    "Work out the true average cost of an SIP-style position built over several months of small buys.",
    "Decide how many extra shares to buy to bring a losing position's average down to a specific price.",
    "Reconcile your average price against the broker's holdings page after partial buys at different rates.",
  ],
  benefits: [
    ["Weighted, not simple", "Averages by money invested and shares held, so large lots carry the weight they should."],
    ["Charges included", "Add per-order brokerage and fees so the average reflects the price you actually break even at."],
    ["Averaging planner", "See the share count and cash needed to reach a target average before you place the order."],
  ],
  faqs: [
    [
      "How is the average stock price calculated?",
      "Add up the money spent across all buys (quantity multiplied by price for each lot) and divide by the total number of shares. It is a weighted average, so a 100-share lot influences it five times more than a 20-share lot.",
    ],
    [
      "Should brokerage and charges be included in the average price?",
      "For a realistic break-even they should be. Adding brokerage, STT, GST and stamp duty raises your effective cost per share, which is the price the stock must cross before you are actually in profit.",
    ],
    [
      "What does averaging down mean?",
      "Buying more shares at a price below your current average, which pulls the blended average down. It lowers the break-even price but also increases the total money exposed to that single stock, so it raises risk as well.",
    ],
    [
      "Does selling part of my holding change the average buy price?",
      "Under the standard weighted-average method used by most Indian brokers, selling reduces the quantity but leaves the average buy price of the remaining shares unchanged. Only new purchases move the average.",
    ],
  ],
};

export default seo;
