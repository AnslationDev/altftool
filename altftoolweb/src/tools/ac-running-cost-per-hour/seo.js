const seo = {
  title: "AC Running Cost Per Hour: Tonnage, ISEER & Tariff",
  metaDescription:
    "Cooling capacity divided by ISEER gives the average draw; times your rupee tariff it gives cost per hour, day and month. 1 ton = 3,516.85 W.",
  steps: [
    "Choose Tonnage + ISEER or Rated power in watts, then set Cooling capacity (tons) and ISEER from the BEE label — the star chips fill 3.30 through 4.90.",
    "Enter Load factor (%), Electricity tariff (₹ per unit), Hours run per day and Days used per month.",
    "Cost per hour leads the result, with rows for Average draw at your load factor, Energy per hour, Units per month, Cost per month and CO2 per month; Copy result saves them.",
  ],
  intro:
    "This calculator gives the rupees an air conditioner burns per hour by dividing its cooling capacity by its ISEER to get the average electrical draw, then multiplying by your tariff. ISEER is BEE's Indian Seasonal Energy Efficiency Ratio — annual cooling output in watt-hours divided by annual electricity input — and 1 ton of refrigeration equals 3,516.85 W of cooling, so a 1.5 ton machine at ISEER 3.8 averages about 1,388 W. Enter the label figures and your unit rate to see hourly, daily and monthly cost.",
  useCases: [
    "Work out what an extra two hours of AC each night adds to the monthly bill before the summer starts.",
    "Compare the running cost of a 3-star and a 5-star 1.5 ton split before buying.",
    "Estimate an AC's share of a bill when the meter reading jumped and you want to know if the machine explains it.",
  ],
  benefits: [
    ["Uses the label, not a guess", "Works from the printed cooling capacity and ISEER instead of an assumed wattage."],
    ["Two input methods", "Enter tonnage and ISEER, or the rated power in watts straight off the nameplate."],
    ["Hour, day and month", "Same calculation shown at three horizons, plus units consumed and CO2 for the month."],
  ],
  faqs: [
    [
      "How much electricity does a 1.5 ton AC use per hour?",
      "About 1.39 kWh an hour for a 3-star inverter split at ISEER 3.8, and about 1.08 kWh for a 5-star unit at ISEER 4.9. That comes from 1.5 × 3,516.85 W of cooling divided by the ISEER, and at ₹8 a unit works out to roughly ₹11 and ₹8.60 an hour respectively.",
    ],
    [
      "What ISEER counts as 5 star?",
      "For split room air conditioners, BEE's bands set 3.30 as the 1-star minimum, 3.50 for 2 star, 3.80 for 3 star, 4.40 for 4 star and 4.90 and above for 5 star. The exact ISEER of your unit is printed on the yellow BEE label along with the star count.",
    ],
    [
      "Does an inverter AC cost less per hour to run?",
      "Once the room reaches the setpoint, an inverter compressor throttles down instead of cycling off and on, which is why inverter models achieve higher ISEER values and therefore a lower average draw. The saving shows up over a full run — in the first pull-down from a hot room both types draw close to full power.",
    ],
    [
      "Why is my actual bill higher than this estimate?",
      "ISEER is a season-average measured across BEE's temperature bins, so a 45°C afternoon pushes the real draw above it — that is what the load factor input is for. Bills also add fixed charges per kW of sanctioned load, fuel surcharges, electricity duty and higher tariff slabs once monthly consumption crosses a threshold.",
    ],
  ],
};

export default seo;
