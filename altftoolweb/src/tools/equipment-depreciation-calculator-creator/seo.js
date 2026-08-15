const seo = {
  title: "Camera Gear Depreciation Calculator – Cost",
  metaDescription:
    "Run straight line, declining balance and sum-of-years depreciation on camera gear, floored at resale value, and get a true cost per shoot.",
  steps: [
    "Enter the Purchase price (INR), Resale value at the end and Useful life (years), then pick a Method: Straight line, Declining balance or Sum of the years' digits.",
    "Add Shoots a year plus your annual Servicing & repairs and Insurance figures.",
    "Read the year-one depreciation, the Year-by-year schedule table and the Cost per shoot line, then press Copy result.",
  ],
  intro:
    "Depreciation spreads the fall in value of a camera, lens or computer across the years you actually use it, and this calculator runs all three standard methods on your numbers: straight line, declining balance and sum of the years' digits. All three write off exactly the purchase price minus resale value; they differ only in how fast, which matters because gear loses most of its value early. It then divides one year's charge by the shoots you do to give a genuine cost per shoot.",
  useCases: [
    "See that a 2,50,000 camera kept five years and sold for 50,000 costs 40,000 a year in wear on a straight-line basis.",
    "Compare straight line against double declining balance to reflect how steeply a new camera body loses resale value in year one.",
    "Work out the day rate you need to charge so a shoot covers gear wear, servicing and insurance, not just your time.",
    "Estimate what your kit is worth on paper after three years before you decide whether to sell or keep shooting with it.",
  ],
  benefits: [
    ["Three methods, one screen", "Switch between straight line, declining balance and sum-of-years to see how much the choice changes year one."],
    ["Never falls below resale", "Book value is floored at the salvage figure under every method, so the schedule stays realistic."],
    ["Cost per shoot, not just per year", "Depreciation, servicing and insurance divided by the shoots you actually book."],
  ],
  faqs: [
    [
      "How do you calculate depreciation on camera equipment?",
      "The straight-line method is purchase price minus expected resale value, divided by useful life in years. A 2,50,000 camera expected to fetch 50,000 after five years depreciates by (250000 - 50000) / 5 = 40,000 a year. Declining balance and sum-of-years charge more in the early years and less later.",
    ],
    [
      "What is a realistic useful life for creator gear?",
      "Camera bodies and computers are usually planned over three to five years because sensors, codecs and software move fast. Lenses, tripods and lighting hold value longer and are often planned over seven to ten. Use the period you genuinely expect to keep working with the item, not a tax table.",
    ],
    [
      "What is double declining balance depreciation?",
      "It charges a fixed percentage of the remaining book value each year, where the rate is 2 divided by the useful life. On a five-year life that is 40% a year, so a 2,50,000 camera loses 1,00,000 in year one and 60,000 in year two — a much closer match to how resale prices actually behave.",
    ],
    [
      "Is book depreciation the same as tax depreciation?",
      "No. Book depreciation is a management estimate you choose for budgeting. Tax authorities prescribe their own methods and rates — India, for example, uses written-down value on blocks of assets. Keep the two separate and let your accountant handle the tax computation.",
    ],
  ],
};

export default seo;
