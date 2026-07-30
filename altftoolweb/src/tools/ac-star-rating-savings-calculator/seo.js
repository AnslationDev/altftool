const seo = {
  intro:
    "This calculator works out how long a higher BEE star rating takes to pay back its price premium, using each model's ISEER and the formula annual kWh = (tons x 3516.85 / ISEER) x hours x days / 1000. It compares the two units' yearly electricity, turns the difference into a rupee saving at your tariff, escalates that saving each year, and solves for the exact payback point as n = ln(1 + premium x g / first-year saving) / ln(1 + g). You also get lifetime net benefit, a year-by-year table, and the CO2 avoided at the Indian grid factor of 0.71 kg per kWh.",
  useCases: [
    "You are standing in a showroom deciding whether a 5-star split at a few thousand rupees more than the 3-star model is worth it for the hours you actually run the AC",
    "You run the AC only two months a year in a mild city and suspect the premium will never pay back within the unit's life — this tells you whether that hunch is right",
    "You are budgeting for a new flat and want the ten-year electricity cost of each option, not just the sticker price, before choosing",
  ],
  benefits: [
    ["Uses ISEER, not the star badge alone", "You type the ISEER printed on the label, so the comparison reflects the actual model rather than a generic assumption about its star band."],
    ["Tariff escalation is built into the payback", "Rising unit rates make an efficient unit pay back sooner, and the closed-form solution accounts for that instead of assuming a flat tariff forever."],
    ["A year-by-year table, not just one number", "Each year shows that year's saving, the running total and the net position against the premium, so you can see exactly when you break even."],
  ],
  faqs: [
    [
      "What is ISEER and why does it matter more than the star count?",
      "ISEER is the Indian Seasonal Energy Efficiency Ratio: the cooling delivered over a season divided by the electricity used, so a higher number means less power for the same cooling. Star bands are just ranges of ISEER, and BEE revises those thresholds every few years — which is why yesterday's 5-star can become today's 3-star, and why the printed ISEER is the number to compare.",
    ],
    [
      "How much electricity does a 5-star AC actually save over a 3-star?",
      "Roughly a quarter, for typical label values. At an ISEER of about 5.0 against about 3.7, the efficient unit draws around 26% fewer units for the same tonnage and running hours, because consumption is inversely proportional to ISEER. The rupee saving then depends entirely on your tariff and how many hours a year you run it.",
    ],
    [
      "Is a 5-star AC always worth the extra money?",
      "No — it depends on running hours. The premium is recovered from usage, so a unit running eight hours a day for six months pays back far faster than one used a few weeks a year. If the calculated payback exceeds the years you expect to keep the AC, the cheaper unit is the better financial choice even though it uses more power.",
    ],
    [
      "Why is my real electricity bill higher than the estimate?",
      "Because ISEER is measured under standard test conditions. Real consumption rises with a lower thermostat setting, poor insulation, an oversized or undersized unit, dirty filters, frequent door opening and higher outdoor temperatures. Treat the figures here as a like-for-like comparison between two models, not a bill prediction — and check the current tariff slab with your discom.",
    ],
  ],
};

export default seo;
