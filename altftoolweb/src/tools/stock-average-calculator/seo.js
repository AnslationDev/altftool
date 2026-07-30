const seo = {
  intro:
    "The Stock Average & Break-Even Calculator takes every buy lot in a position and returns the true weighted average price — total amount invested divided by total shares held — along with live unrealised profit and loss and the break-even price once round-trip charges are included. Its averaging-down planner solves the other direction: give it a target average and it computes the exact share count needed using shares = Q × (A − T) ÷ (T − P), or give it a budget and it shows the average you would end up with. It is for retail investors adding to an existing holding who want the arithmetic settled before they place the order.",
  useCases: [
    "You bought the same stock across four tranches on different days and want one honest average rather than the figure your broker app shows after a corporate action.",
    "A holding is down and you want to know exactly how many more shares it takes to bring your average from ₹250 to ₹220 at today's price — and whether that target is even reachable.",
    "You have ₹50,000 to deploy and want to see where your average lands before you buy, so you are not surprised by how little it moves on a large existing position.",
  ],
  benefits: [
    ["Break-even, not just average", "It applies your round-trip charge rate on both the buy and the sell side, so the price you actually need to exit flat is shown separately from your average cost."],
    ["Tells you when a target is impossible", "Buying at the market price can never pull your average below that price, and the planner says so explicitly with the reachable range instead of returning a nonsense share count."],
    ["Lots persist between visits", "Your buy lots, market price and charge rate are saved locally, so you can add each new tranche as it happens rather than retyping the whole position every time."],
  ],
  faqs: [
    [
      "How do I calculate the average price of a stock bought at different prices?",
      "Divide the total amount invested by the total number of shares — never average the prices themselves, because that ignores lot size. Buying 100 shares at ₹300 and 400 at ₹200 gives ₹110,000 over 500 shares, an average of ₹220, not the ₹250 a simple mean would suggest.",
    ],
    [
      "How many shares do I need to buy to reach a target average?",
      "Use shares = Q × (A − T) ÷ (T − P), where Q is your current quantity, A your current average, T the target average and P the price you will buy at. With 100 shares averaging ₹250 and a market price of ₹200, reaching a ₹220 average takes 150 more shares — one and a half times your existing position, which is why averaging down gets expensive fast.",
    ],
    [
      "What price do I actually need to break even?",
      "A little above your average, because charges apply on both the purchase and the sale. At a 0.3% round-trip rate the break-even sits about 0.60% above your average — an average of ₹200 needs roughly ₹201.20 to exit flat — and the gap widens proportionally as your charge rate rises.",
    ],
    [
      "Is averaging down a good idea?",
      "It lowers your average price, but only by increasing your exposure to a position that has already moved against you — the arithmetic always works, the investment case may not. Decide whether you would buy the stock today at this price with fresh money before using the planner, and treat the output as arithmetic rather than investment advice.",
    ],
  ],
};

export default seo;
