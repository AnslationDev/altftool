const seo = {
  title: "Split vs Window AC: Breakeven Year From ISEER",
  metaDescription:
    "Compare split and window AC on price, install and ISEER-based electricity, then see the total cost and the year the split overtakes the window.",
  steps: [
    "Set the shared usage under \"How you will use it\": Capacity (ton), Hours per day, Cooling days per year, Electricity tariff (per kWh), Tariff rise per year (%) and Years you will keep it.",
    "Fill the Split AC and Window AC cards with each unit's Purchase price, installation cost, ISEER from the BEE label and Servicing per year — the defaults are ISEER 5.0 for the split against 3.1 for the window.",
    "Read the \"Cheaper over N years\" verdict, the year the split overtakes the window and the \"Cumulative cost, year by year\" table; Copy result puts the whole comparison on the clipboard and Reset restores the defaults.",
  ],
  intro:
    "This tool compares a split and a window air conditioner on total cost of ownership, not just sticker price. Electricity is derived from the ISEER on each unit's BEE star label — average input power equals rated cooling in watts divided by ISEER, so a 1.5 ton unit rated 3,516.85 W per ton draws about 1,055 W at ISEER 5.0 but about 1,649 W at ISEER 3.2. Add purchase price, installation, yearly servicing and an optional tariff escalation, and it reports which type is cheaper over your ownership horizon and the year the split overtakes the window.",
  useCases: [
    "Deciding between a 40,000 rupee 5-star inverter split and a 30,000 rupee window unit for a rented flat you will leave in three years",
    "Justifying the higher upfront cost of a split AC to a family that only sees the price tag",
    "Checking whether a window AC still makes sense when the unit runs 10 hours a night for five months",
  ],
  benefits: [
    ["Breakeven year, not a slogan", "Reports the exact year cumulative split cost falls below cumulative window cost at your usage."],
    ["Tariff escalation built in", "Compounds the electricity cost each year, which is what makes efficiency worth more over a long hold."],
    ["Non-cost trade-offs listed", "Noise, the lost window, servicing and what happens when you shift house sit alongside the numbers."],
  ],
  faqs: [
    [
      "Is a split AC cheaper than a window AC in the long run?",
      "Usually yes if you keep it more than about three years and run it several hours a day. A 1.5 ton split at ISEER 5.0 uses roughly 1,266 kWh over a 150-day season at 8 hours a day, against about 1,978 kWh for a window unit at ISEER 3.2 — at 8 rupees a unit that is around 5,700 rupees a year, which typically clears a 10,000-12,000 rupee price gap in the third summer.",
    ],
    [
      "How much electricity does a 1.5 ton AC use per hour?",
      "Divide the rated cooling by the ISEER: 1.5 ton is 5,275 W of cooling, so at ISEER 5.0 the average draw is about 1.06 kW and at ISEER 3.2 about 1.65 kW. That is roughly 1.06 and 1.65 units per hour of running.",
    ],
    [
      "When is a window AC still the better choice?",
      "When the install is temporary or the wall cannot be cored — rented rooms, short stays, servant quarters and buildings that ban outdoor units on the facade. A window unit also has no copper piping to redo when you shift, and its lower upfront cost wins if the horizon is one or two summers.",
    ],
    [
      "What does ISEER mean on an AC label?",
      "ISEER is the Indian Seasonal Energy Efficiency Ratio: the total cooling delivered over a cooling season divided by the total electricity consumed over that season, both in watt-hours. Higher is better, and because it is seasonal it accounts for part-load running rather than a single full-load test point.",
    ],
  ],
};

export default seo;
