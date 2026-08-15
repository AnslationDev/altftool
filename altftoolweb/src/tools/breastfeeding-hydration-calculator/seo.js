const seo = {
  title: "Breastfeeding Hydration Calculator From Milk",
  metaDescription:
    "Rebuilds EFSA's +700 ml lactation increment from your own milk volume x 87% water, scaled by stage, feeds and twins, on a 2.0 L or 35 ml/kg baseline.",
  steps: [
    "Choose your Breastfeeding stage, enter Feeds in 24 hours counting pumping sessions, and how many Babies nursing.",
    "Pick the Baseline method — EFSA adequate intake (2.0 L/day) or Body weight (35 ml per kg per day) — then set Climate and Moderate activity (minutes a day); a measured 24-hour pumped volume overrides the estimate.",
    "Read the 'Drink each day' litre target and the amount per feed, with milk produced, water leaving as milk and the EFSA flat lactation increment itemised, then press Copy result.",
  ],
  intro:
    "This calculator works out how much extra fluid breastfeeding adds to your day by rebuilding the figure from milk output rather than quoting a flat number. EFSA adds 700 ml of total water a day for lactation because average exclusive-breastfeeding output is about 800 ml of milk a day and human milk is roughly 87% water — 800 x 0.87 = 696 ml. Enter your stage, feeds per day and number of babies (or a measured pumped volume) and the increment scales with your actual production, on top of your chosen baseline — the 2.0 L/day adequate intake for adult women by default, or 35 ml per kg of body weight if you switch to the weight-based method.",
  useCases: [
    "See how much less fluid you need at 9 months on solids and three feeds a day than during exclusive newborn feeding.",
    "Work out the target while tandem feeding twins, where the flat +700 ml figure clearly under-counts.",
    "Convert a measured 24-hour pumped volume into a personal daily drinks target.",
  ],
  benefits: [
    ["Derived, not guessed", "Rebuilds EFSA's +700 ml from milk volume x 87% water, so the number moves with your output."],
    ["Scales with feeding", "Stage and feeds per day change the milk estimate instead of everyone getting the same answer."],
    ["Practical unit", "Also expressed as a glass at each feed, which is easier to act on than a daily litre figure."],
  ],
  faqs: [
    [
      "How much water should I drink while breastfeeding?",
      "About 2.7 litres of total water a day — the 2.0 L adequate intake for adult women plus EFSA's 700 ml lactation increment. Around 20% comes from food, so roughly 2.1-2.2 litres as drinks, more in hot weather or with a heavy milk supply.",
    ],
    [
      "Does drinking more water increase milk supply?",
      "No. Trials of forced fluid intake have not shown higher milk production, and drinking well beyond thirst does not help. Supply responds to frequent, effective milk removal; if supply is a concern, ask a lactation consultant or your health visitor rather than adding litres.",
    ],
    [
      "How much milk does a breastfeeding mother produce a day?",
      "Roughly 750-800 ml a day during exclusive breastfeeding in the first six months, dropping to about 600 ml once solids start and lower again past a year. Individual output varies widely, which is why a measured pumped volume beats any average.",
    ],
    [
      "Why am I so thirsty when breastfeeding?",
      "Oxytocin released during let-down triggers thirst, which is the body's way of covering the water leaving as milk — roughly 700 ml a day. Drinking to thirst, with a glass at each feed as a prompt, generally covers it. Persistent extreme thirst with frequent urination should be checked by a doctor.",
    ],
  ],
};

export default seo;
