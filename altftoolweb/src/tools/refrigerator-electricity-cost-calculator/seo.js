const seo = {
  title: "Fridge Running Cost Calculator from the BEE Label",
  metaDescription:
    "Turns a fridge's BEE-label kWh/year into cost per day, month and year at your tariff, adjusted for a kitchen warmer than the 32 °C test ambient.",
  steps: [
    "Press I have the BEE label and type the Annual energy consumption on the label (kWh/year), or press Estimate from litres and stars and give Refrigerator type, Gross capacity (litres) and BEE star rating.",
    "Set Average kitchen temperature (°C), the Extra consumption per °C above 32 °C (%) sensitivity, How the fridge is used, and Electricity tariff (₹ per unit).",
    "Running cost per year updates live, above rows for cost per day and month, average power draw in watts, CO2 per year and what a 5-star equivalent would cost; Copy result saves the breakdown.",
  ],
  intro:
    "This calculator turns a refrigerator's annual energy consumption — the kWh/year printed on its BEE label — into cost per day, per month and per year at your tariff, then adjusts for a kitchen warmer than the laboratory test condition of 32 °C. If the label is not to hand, it reconstructs the rated figure from gross litres and star rating, using specific consumption calibrated against published label values and roughly a 20% step between star bands. It also prices what a 5-star equivalent of the same size would cost to run.",
  useCases: [
    "Work out what the old single-door fridge in the second kitchen is quietly costing every year.",
    "Compare two models in a showroom on running cost rather than sticker price, using the kWh/year on each label.",
    "Explain a summer bill increase by showing how much more the fridge draws when the kitchen sits at 38 °C.",
  ],
  benefits: [
    ["Label-first", "Uses the manufacturer's tested kWh/year figure when you have it, instead of guessing at wattage."],
    ["Kitchen-adjusted", "Corrects the laboratory figure for the average temperature the fridge actually stands in."],
    ["Upgrade comparison built in", "Shows the yearly cost of a 5-star model of the same size and the difference between them."],
  ],
  faqs: [
    [
      "How much electricity does a refrigerator use per year?",
      "A 250 litre 3-star frost-free is typically labelled near 260 kWh a year, which is about ₹2,100 at ₹8 a unit, or roughly 30 W running continuously. A 5-star model of the same size is closer to 170 kWh a year, and a 190 litre single-door direct-cool around 150 kWh.",
    ],
    [
      "Does a fridge use more electricity in summer?",
      "Yes. The label figure is measured at a fixed test ambient of 32 °C, and consumption rises as the surrounding air gets warmer — studies put the sensitivity somewhere between 2% and 6% per degree. A kitchen averaging 38 °C can therefore run roughly a quarter above the label figure.",
    ],
    [
      "Is a 5-star fridge worth the extra price?",
      "Compare the yearly saving against the price difference. A 3-star to 5-star upgrade on a 250 litre frost-free saves roughly 90 kWh a year — about ₹750 at ₹8 a unit — so a ₹5,000 premium pays back in around six to seven years, which is within a fridge's normal life but not a quick win.",
    ],
    [
      "How can I cut my refrigerator's running cost without replacing it?",
      "Leave at least 5–10 cm of clearance behind and beside the cabinet so the condenser coil can shed heat, keep it out of direct sun and away from the hob, let hot food cool before putting it in, and check the door gasket seals on a slip of paper. A worn gasket lets the compressor run far longer than the label ever assumed.",
    ],
  ],
};

export default seo;
