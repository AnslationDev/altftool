const seo = {
  intro:
    "The Job Offer Comparison Tool scores competing offers against weights you set yourself, so the winner reflects your priorities rather than the biggest headline number. You enter base salary, bonus, ESOP and joining bonus for each offer plus 0–10 ratings for work-life balance, growth, learning and company stability, then move five sliders — salary, remote, growth, stability and learning — and the tool normalises those weights by their total to produce a match score per offer. Work mode feeds in directly: remote scores 100, hybrid 60 and on-site 20 on that dimension. Everything stays in your browser's local storage, and the figures are informational estimates, not financial advice.",
  useCases: [
    "Two offers are within a few percent on cash but one is fully remote and the other wants five days on-site, and you need to see which wins once you weight remote work honestly",
    "A startup offer leans heavily on ESOP while the safe option is all base salary, and you want the equity spread over a four-year vest before you compare",
    "You are talking it through with a partner and need a side-by-side table plus a JSON export you can save and revisit after the next round of negotiation",
  ],
  benefits: [
    ["Your weights, not a fixed formula", "Five sliders decide how much salary, remote work, growth, stability and learning each count, and they are normalised by their sum so the score stays comparable."],
    ["Equity treated as a stream, not a lump", "ESOP is spread across a four-year vest in the financial breakdown rather than counted as if it all landed on day one."],
    ["Offers persist between sessions", "Offers and weights are kept in local storage, so you can add a new offer weeks later without retyping the earlier ones."],
  ],
  faqs: [
    [
      "How is the match score calculated?",
      "Each offer is scored on five dimensions, then averaged using your slider weights divided by their total. Base pay is scored against a 200,000 reference and caps there; work mode scores 100 remote, 60 hybrid, 20 on-site; growth, stability and learning are your 0–10 ratings multiplied by 10. Defaults are salary 30, growth 25, remote 20, stability 15 and learning 10.",
    ],
    [
      "How does it value ESOP?",
      "It spreads the equity component across a standard four-year vesting schedule, so the monthly figure reflects one quarter of the grant per year rather than the full paper value. Real equity is worth what you can eventually sell it for, so treat it as the most uncertain line in the comparison.",
    ],
    [
      "Is the take-home figure accurate for my tax situation?",
      "No — the breakdown applies a flat 20% estimate to arrive at a net figure, which is a placeholder, not your actual liability. Real tax depends on your country, regime, slab, deductions and existing income, so use the number for rough ranking only and check a payroll or tax professional before you decide.",
    ],
    [
      "Where is my offer data stored?",
      "In your own browser's local storage on this device, and it is only written to a file when you choose to export the comparison as JSON. Nothing about your salary or the companies involved is sent anywhere, which matters when you are comparing offers you have not told either employer about.",
    ],
  ],
};

export default seo;
