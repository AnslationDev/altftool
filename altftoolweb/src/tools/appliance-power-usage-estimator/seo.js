const seo = {
  intro:
    "The Appliance Power Usage Estimator converts an appliance's wattage, daily running hours and quantity into electricity units using kWh per day = watts × hours × quantity ÷ 1000, then multiplies by 30 for the month and 365 for the year and by your tariff to give a cost. Add every appliance in the house and it ranks them by monthly cost, names the biggest contributor, and exports the whole list as CSV or PDF. It ships with wattage presets for common appliances — 1500 W air conditioner, 2000 W water heater, 250 W refrigerator, 75 W ceiling fan, 12 W LED bulb — and defaults to a rate of ₹8.0 per unit that you can change.",
  useCases: [
    "Your electricity bill jumped after buying an air conditioner and you want to see, unit by unit, how much of the increase 1500 W for six hours a day actually accounts for.",
    "You are deciding between running the geyser twice a day or once, and need the monthly rupee difference rather than a guess before changing the household routine.",
    "You are moving into a rented flat with a fixed per-unit tariff and want a printable estimate of the monthly bill from the appliances you own before you commit.",
  ],
  benefits: [
    ["Whole-house totals, not one appliance", "Daily, monthly and yearly units and cost are summed across every appliance you add, and the single highest-cost appliance is called out by name."],
    ["Quantity-aware", "Four identical 75 W fans are entered once with a quantity, so the kWh figure reflects the real count instead of needing a separate row per unit."],
    ["Keeps your list and exports it", "The appliance list and tariff persist in your browser between visits, and both CSV and a printable PDF summary can be downloaded."],
  ],
  faqs: [
    [
      "How do you convert watts to units on the electricity bill?",
      "One unit is one kilowatt-hour, so units per day = watts × hours used per day ÷ 1000. A 1500 W air conditioner run for 6 hours uses 1500 × 6 ÷ 1000 = 9 units a day; at ₹8 per unit that is ₹72 a day, about ₹2,160 a month.",
    ],
    [
      "Which month and year lengths does the estimate use?",
      "Monthly figures are daily consumption × 30 and yearly figures are daily consumption × 365. Months with 31 days will run slightly higher than the estimate, so treat the monthly number as a close approximation rather than a billed amount.",
    ],
    [
      "What if I do not know an appliance's wattage?",
      "Start from the built-in presets — air conditioner 1500 W, microwave 1200 W, washing machine 500 W, refrigerator 250 W, air cooler 200 W, television 100 W, ceiling fan 75 W, laptop 65 W, LED bulb 12 W — then correct it from the rating label on the appliance or its manual, which is always more accurate than a category average.",
    ],
    [
      "Will this match my actual electricity bill?",
      "Rarely to the rupee. Real bills use slab or time-of-use tariffs, fixed charges, taxes and duties, and appliances like refrigerators and air conditioners cycle on and off rather than drawing rated wattage continuously. Use the result to compare appliances against each other and to size a change in habits.",
    ],
  ],
};

export default seo;
