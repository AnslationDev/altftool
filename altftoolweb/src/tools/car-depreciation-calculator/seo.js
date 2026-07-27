const seo = {
  intro:
    "Car depreciation follows a declining-balance curve — each year's loss is a percentage of what the car was worth at the start of that year, not of its original price — and this calculator plots that curve out to ten years alongside the separate IDV figure your insurer uses. It takes ex-showroom price, age, kilometres run and your own depreciation rates, then reports value today, total loss, loss per kilometre and the effective compound rate you have actually realised. The insurance side follows the Indian Motor Tariff schedule: 5% off in the first six months, 15% to one year, 20%, 30%, 40% and 50% at each subsequent year up to five.",
  useCases: [
    "Deciding whether to sell a four-year-old car now or run it another year, by comparing this year's rupee loss against the next one's",
    "Sanity-checking a dealer's exchange quote against the value the curve implies for the car's age and odometer reading",
    "Working out the true cost per kilometre of a car once depreciation is counted alongside fuel and servicing",
  ],
  benefits: [
    ["Two curves, clearly separated", "Market resale value and the statutory IDV are shown side by side instead of being confused."],
    ["Kilometres actually change the answer", "Running above or below 12,000 km a year adjusts the value, capped so it never dominates."],
    ["Loss per year and per kilometre", "Turns an abstract percentage into the rupee figure that decides whether to keep or sell."],
  ],
  faqs: [
    [
      "How much does a car depreciate in the first year in India?",
      "A mainstream Indian car typically loses about 15% to 20% of its ex-showroom price in the first year, and the drop is steepest the moment it is registered because the second owner pays no road tax, registration fee or dealer margin. For insurance purposes the figure is fixed rather than estimated: the Indian Motor Tariff sets IDV depreciation at 5% up to six months and 15% from six months to one year.",
    ],
    [
      "What is IDV and is it the same as resale value?",
      "IDV is the Insured Declared Value — the maximum a comprehensive motor policy pays out on a total loss or theft — and it is not the same as resale value. It is calculated as the manufacturer's listed selling price minus a fixed depreciation percentage set by the tariff schedule, excluding registration cost and insurance premium. Resale value depends on the market, so the two figures routinely differ by a wide margin.",
    ],
    [
      "How is car depreciation calculated?",
      "The standard method is declining balance: value after n years = price × (1 − first-year rate) × (1 − later-year rate)^(n − 1). At a 20% first year and 15% thereafter, a ₹12,00,000 car is worth ₹9,60,000 after one year and ₹5,89,560 after four — 49% of what was paid. Straight-line depreciation, which subtracts the same rupee amount every year, is used in company accounts but describes the used-car market poorly.",
    ],
    [
      "Do high kilometres reduce a car's value a lot?",
      "Yes, but less than age does. Against a benchmark of roughly 12,000 km a year, buyers discount unusually high readings and pay a modest premium for low ones — this calculator applies about 0.5% of value per 1,000 km away from the benchmark, capped at 20% either way. Beyond that, a documented service history and a clean accident record usually move the price more than the odometer.",
    ],
  ],
};

export default seo;
