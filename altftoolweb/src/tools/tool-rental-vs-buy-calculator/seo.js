const seo = {
  title: "Tool Rent vs Buy Calculator: Break-Even Days",
  metaDescription:
    "Enter the day rate, trip cost, purchase price and resale value to get the break-even usage days at which owning a tool beats hiring it.",
  steps: [
    "Under Renting, enter the Hire rate (₹ per day), Days per hire, Jobs per year and the Collection and return cost per hire.",
    "Fill the Buying group — Purchase price, Servicing per year, Storage per year and Resale value at the end (% of price) — then set Horizon (years) and the return your money would earn; the comparison recalculates as you type.",
    "Read the verdict — Rent it, Buy it or Line ball — alongside Break-even usage in days and the cost per usage day for each option, then use Copy result for the full breakdown.",
  ],
  intro:
    "This calculator answers the rent-or-buy question with a break-even figure: the number of usage days at which owning a tool becomes cheaper than hiring it. Renting is costed as a pure variable — day rate multiplied by usage days, plus the cost of each collection and return trip. Owning is costed as its fixed side: purchase price, annual servicing and storage, the capital tied up, less the resale value at the end of your horizon. Setting the two equal gives break-even days = net cost of owning divided by the effective cost of a rented day.",
  useCases: [
    "Work out whether a rotary hammer used for two weekend jobs a year is worth owning, or better hired.",
    "Justify a purchase for a small contractor by showing the usage days at which hire charges overtake the tool's price.",
    "Compare a cheap tool bought outright against a professional-grade one hired only when a job demands it.",
  ],
  benefits: [
    ["A break-even you can act on", "Turns the decision into one number: the usage days that tip it towards buying."],
    ["Trip costs counted", "Each collection and return is charged, which is often what makes short hires expensive."],
    ["Resale and capital included", "Owning is netted of what the tool sells for and charged for the money it locks up."],
  ],
  faqs: [
    [
      "When is it cheaper to buy a tool than rent it?",
      "When your expected usage days exceed the break-even, which is the net cost of owning divided by the effective cost of a rented day. A tool costing ₹12,000 that resells for 40% and needs ₹500 a year of upkeep works out near ₹10,000 net over three years; against a ₹400 day rate plus a ₹150 trip, that is about 21 usage days. Below that, hiring wins.",
    ],
    [
      "What costs do people forget when buying a tool?",
      "Storage space, annual servicing, the consumables it needs, and the money tied up in it. The largest forgotten item is usually the opposite one: resale value. A working power tool sold second-hand recovers a real share of the price, and ignoring that makes ownership look worse than it is.",
    ],
    [
      "Is a weekly tool hire cheaper than seven daily hires?",
      "Almost always. Hire companies quote tiered rates where a week typically costs the equivalent of three to four days and a month a fraction more again, because their handling cost per hire is fixed. If you plan a hire of a week or longer, take the effective per-day figure from the weekly rate rather than multiplying the daily one.",
    ],
    [
      "Does the calculator account for the tool wearing out?",
      "Indirectly, through the resale percentage and the annual upkeep you enter. Set a lower resale figure and a higher upkeep for a tool you expect to work hard. For a specialised tool used a handful of days a year, the practical limit is often obsolescence and battery degradation rather than mechanical wear.",
    ],
  ],
};

export default seo;
