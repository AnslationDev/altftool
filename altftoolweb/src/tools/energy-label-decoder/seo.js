const seo = {
  intro:
    "A BEE star label carries two numbers that matter and one that mostly does not. The stars are a band the model fell into when it was certified, and those bands are tightened every few years; the annual consumption in kWh, or the ISEER on an air conditioner label, is the measurement that decides your bill. This decoder converts either figure into running cost, then compares two models on savings, payback on the price premium and CO2 avoided.",
  useCases: [
    "Deciding whether a 5-star air conditioner is worth its premium over a 3-star at your electricity tariff",
    "Comparing two refrigerators whose labels were issued in different star-table periods",
    "Explaining to a buyer why a higher star count on an older label is not the better machine",
  ],
  benefits: [
    ["Works from ISEER or kWh", "Handles both label formats, including the tons-to-watts conversion for air conditioners."],
    ["No stale star tables", "Compares the measured figures instead of thresholds that get revised every few years."],
    ["Payback, not just savings", "Weighs the annual saving against the price premium over the years you will keep it."],
  ],
  faqs: [
    [
      "What does ISEER mean on an AC label?",
      "ISEER is the Indian Seasonal Energy Efficiency Ratio: the cooling delivered across a simulated Indian cooling season divided by the electricity consumed to deliver it. Higher is better, typical values run from about 3 to 6, and because it is a ratio you can invert it — annual units equal capacity in watts times cooling hours divided by ISEER divided by 1,000.",
    ],
    [
      "Is a 5-star appliance always better than a 3-star one?",
      "Not necessarily, if the labels are from different years. BEE revises the star thresholds on a published schedule, so a 5-star rating awarded under an older table can correspond to roughly 3 stars under the current one. Compare the kWh per year or the ISEER printed on each label, which mean the same thing whatever year they were issued.",
    ],
    [
      "How many hours a year does BEE assume an AC runs?",
      "1,600 hours. That is the annual operating assumption built into the ISEER test procedure for room air conditioners in India. If you cool a bedroom for far fewer hours, or run an office unit for far more, change that figure before judging the payback on a higher-rated model.",
    ],
    [
      "How do I work out what an appliance costs to run per year?",
      "Multiply the annual energy consumption printed on the label by your electricity tariff. A refrigerator labelled 250 kWh a year at 8 per unit costs about 2,000 a year to run. Use your marginal slab rate rather than the average on your bill, because appliance consumption sits on top of everything else you use.",
    ],
  ],
};

export default seo;
