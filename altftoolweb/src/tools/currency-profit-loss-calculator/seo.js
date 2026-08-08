const seo = {
  title: "Currency Profit/Loss Calculator: P&L and % Return",
  metaDescription:
    "Forex P&L from (sell rate − buy rate) × amount, with total buy cost, total sell value and return on cost. Gross only — spread and commission excluded.",
  intro:
    "The Currency Profit/Loss Calculator works out the gain or loss on a foreign exchange position using the standard formula P&L = (sell rate − buy rate) × amount, and expresses it as a percentage of what the position cost you. Enter the rate you bought at, the rate you exited at, and the size of the position in the foreign currency, and it returns the total buy cost, the total sell value, the rupee gain or loss and the return percentage rounded to two decimals. It is arithmetic on the numbers you supply, so it works for a travel-money exchange just as well as for a closed forex trade.",
  useCases: [
    "You bought 1,000 US dollars at ₹83.50 and sold them back at ₹84.20, and you want the actual rupee gain rather than a vague sense that the rate moved in your favour.",
    "You are holding foreign currency left over from a trip and want to know at what sell rate you break even before deciding whether to convert now or wait.",
    "A trade closed at a small rate move on a large position and you need the percentage return to compare it against your other positions, where the amounts differ.",
  ],
  benefits: [
    ["Absolute and percentage in one pass", "You get the rupee figure and the return on cost together, so a 70-paise move on 1,000 units is immediately comparable with a smaller move on a bigger position."],
    ["Shows both legs of the trade", "Total buy cost and total sell value are reported alongside the P&L, which makes an entry-rate typo obvious instead of silently distorting the answer."],
    ["Break-even is one edit away", "Because the calculation is a direct formula rather than a fitted model, changing the sell rate until the result reaches zero gives you the exact break-even rate."],
  ],
  faqs: [
    [
      "How is forex profit calculated?",
      "Profit or loss equals (sell rate − buy rate) × the amount of foreign currency held. Buying 1,000 units at 83.50 and selling at 84.20 gives (84.20 − 83.50) × 1,000 = ₹700, which is a 0.84% return on the ₹83,500 cost.",
    ],
    [
      "Does this include the spread, commission or swap charges?",
      "No — it compares two clean rates, so the figure is your gross P&L. Real costs sit in the gap between the buy and sell rates a broker or exchange counter quotes you, plus any commission or overnight swap, and those reduce what you actually keep.",
    ],
    [
      "How do I account for the buy-sell spread?",
      "Enter the rate you were actually charged to buy and the rate you were actually paid to sell, not the mid-market rate you saw quoted. The spread is then already baked into both legs and the result reflects what really landed in your account.",
    ],
    [
      "Is the P&L percentage return on cost or on notional?",
      "On cost — the P&L is divided by buy rate × amount, the full value of the position at entry. If you traded on margin, the return on the capital you actually put up will be higher than this figure, in both directions.",
    ],
  ],
};

export default seo;
