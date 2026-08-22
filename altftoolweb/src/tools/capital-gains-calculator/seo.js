const seo = {
  title: "Capital Gains Tax Calculator: Gain/Tax/Net Profit",
  metaDescription:
    "Enter buy price, sell price, quantity and your own tax rate to get the gain, tax owed, net profit and percentage return. A loss returns zero tax.",
  intro:
    "This calculator works out the capital gain on a holding as (sell price − buy price) × quantity, applies the tax rate you enter to that gain, and reports the tax owed, the net profit after tax, and the percentage return on the buy price. You supply the rate, so it works for any jurisdiction and for either a short-term or long-term slab — the tool does not assume one. Tax is applied only when the result is a gain; a loss returns zero tax rather than a negative figure, because how losses are offset depends on your local rules.",
  useCases: [
    "You are deciding whether to sell a holding now and want to see what lands in your account after tax, not just the headline gain",
    "You want to compare the same trade under two rates — the short-term slab versus the long-term one — by running it twice and reading the net profit",
    "You are reconciling a broker statement and need to check that the gain per lot and the percentage return match what the platform reported",
  ],
  benefits: [
    ["Net profit, not just gross gain", "The result separates the gain, the tax on it and what is left, so the number you plan around is the one you actually keep."],
    ["Jurisdiction-neutral by design", "Because the rate is an input rather than a hardcoded assumption, the same tool works for a 10%, 15%, 20% or 30% regime without going out of date."],
    ["Percentage return alongside the money", "The return is computed against the buy price, which makes a 5,000 gain on a 10,000 position instantly distinguishable from the same gain on a 100,000 one."],
  ],
  faqs: [
    [
      "How is a capital gain calculated?",
      "Sell price minus buy price, multiplied by the number of units. Selling 100 units bought at 100 for 150 gives (150 − 100) × 100 = a 5,000 gain, which at a 15% rate means 750 in tax and 4,250 net — a 50% return on the purchase price.",
    ],
    [
      "What tax rate should I enter?",
      "The rate that applies to this specific gain in your country and holding period — most systems tax short-term and long-term gains differently, and some apply an annual exempt amount before any tax is due. Look up the current rate for your situation rather than reusing the 15% default, and confirm it with a tax professional before acting on the result.",
    ],
    [
      "Does it account for brokerage, fees and exemptions?",
      "No. The calculation uses only buy price, sell price, quantity and rate — it does not subtract brokerage, transaction taxes, exchange charges or any tax-free allowance, and it does not apply indexation or cost-inflation adjustment. Deduct fees from your figures first if you want a closer estimate.",
    ],
    [
      "What happens if I sold at a loss?",
      "The tool shows the loss and sets tax owed to zero, because a loss creates no liability. It does not model carry-forward or set-off against other gains, which most tax systems allow under specific conditions and time limits — that part needs your local rules or an accountant.",
    ],
  ],
};

export default seo;
