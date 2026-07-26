const seo = {
  intro:
    "The Rolling Returns Calculator takes a NAV or index series and slides a fixed window — one year, three years, five years — across every possible start point, annualising each window with the CAGR formula. Instead of one flattering point-to-point number, you get the average, median, best and worst experience across all overlapping periods, plus how often the fund cleared your hurdle rate. It is the honest way to judge consistency rather than luck of the start date.",
  useCases: [
    "Comparing two equity funds whose 5-year point-to-point returns look identical, to see which one had the worse rolling 3-year troughs.",
    "Checking how often a fund beat a 12% per year hurdle over rolling 3-year windows before you commit to a SIP.",
    "Showing a nervous investor the worst rolling 5-year outcome in a fund's history so expectations are set before markets fall.",
  ],
  benefits: [
    ["Removes start-date bias", "Every possible entry point is tested, not just the one that flatters the fund."],
    ["Worst case in plain sight", "The minimum rolling return tells you what the unluckiest investor actually earned."],
    ["Consistency scoring", "Distribution buckets and the hit rate above your hurdle show how reliable the returns were."],
  ],
  faqs: [
    [
      "What is the difference between rolling returns and CAGR?",
      "CAGR measures one fixed period between two dates. Rolling returns compute that same CAGR for every overlapping window in the history, so you see a whole distribution instead of a single number that depends on your chosen start date.",
    ],
    [
      "Which rolling window should I use for equity funds?",
      "Three and five years are the common choices for equity, because they roughly match a realistic minimum holding period. One-year rolling windows show volatility, while seven- and ten-year windows show how the fund behaved over a full market cycle.",
    ],
    [
      "Why is the worst rolling return more useful than the average?",
      "The average tells you what a typical investor earned; the minimum tells you what the most unfortunate one earned. If the worst rolling 3-year return is deeply negative, you know the drawdown you must be able to tolerate.",
    ],
    [
      "Where do I get the NAV series to paste in?",
      "Fund houses and AMFI publish historical NAV downloads, and most portfolio trackers export month-end NAV as CSV. Paste month-end values oldest first and choose the matching frequency.",
    ],
  ],
};

export default seo;
