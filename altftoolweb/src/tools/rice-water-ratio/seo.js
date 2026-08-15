const seo = {
  title: "Rice Water Ratio Chart: 13 Grains, 3 Cooking",
  metaDescription:
    "Basmati 1:1.5, jasmine 1:1.25 — exact water for 13 grains by open pot, pressure cooker or rice cooker, with cooked yield and servings.",
  steps: [
    "Under Pick your grain choose one of the 13 chips, then enter the raw amount with the cups / grams toggle.",
    "Under Cooking method pick Open pot, Pressure cooker or Rice cooker — or set a headcount in Cooking for and press Set quantity.",
    "Read Water needed in ml and cups (1 cup = 240 ml) with Cooked yield and Serves, then Copy plan or Download the cooking-plan .txt file.",
  ],
  intro:
    "This guide gives the exact water-to-grain ratio for 13 grains — basmati, jasmine, sona masoori, brown, parboiled sella, sticky rice, quinoa, dalia, couscous, whole and small millets, oats and poha — separately for an open pot, a pressure cooker and an electric rice cooker. Enter your quantity in cups or grams and it returns the water in millilitres, the ratio by volume, the expected cooked yield and roughly how many people it serves. All ratios are by volume with 1 cup taken as 240 ml, and each grain carries its own rinse and soak instructions.",
  useCases: [
    "You bought jasmine rice for the first time and want to know why 1 : 2 turned it to mush — the sheet puts jasmine at 1 : 1.25, the lowest of any white rice here.",
    "Cooking for eight people and needing to work backwards from headcount: at about 75 g raw basmati per person that is 600 g, and the tool converts that to cups and millilitres of water.",
    "Switching from rice to whole millets like bajra or ragi and needing the much higher 1 : 3 open-pot ratio and the longer soak that goes with it.",
  ],
  benefits: [
    ["Per-method ratios, not one number", "Every grain lists a separate open-pot, pressure-cooker and rice-cooker ratio, plus whistle counts and release notes where they differ."],
    ["Grams and cups both work", "Each grain has its own cup weight — 190 g for basmati, 85 g for poha — so switching units does not quietly change the amount of water."],
    ["Yield and servings, not just water", "It also returns cooked weight using a per-grain expansion factor and how many people that feeds at the standard raw-per-person amount."],
  ],
  faqs: [
    [
      "What is the correct water ratio for basmati rice?",
      "1 part basmati to 1.5 parts water by volume, unsoaked, in an open pot, pressure cooker or rice cooker. If you soak the rice 20–30 minutes first, cut the water by about 10% to roughly 1 : 1.35, since the grain has already taken on moisture.",
    ],
    [
      "How much water for brown rice compared with white?",
      "Brown rice needs about 1 : 2.25 in an open pot and simmers 35–40 minutes, roughly three times as long as white rice, because the intact bran layer resists water. In a pressure cooker the ratio drops to 1 : 2 with 3–4 whistles and a 10-minute natural release.",
    ],
    [
      "How much raw rice per person should I cook?",
      "About 75 g of raw rice per person for most white rices, or 70 g for brown, which is where the built-in servings estimate comes from. Raw grain roughly triples in weight — basmati finishes at about 2.9× its raw weight cooked — so 75 g raw lands near 215 g on the plate.",
    ],
    [
      "Does poha need measured water?",
      "No. Poha is already cooked and flattened, so it takes moisture rather than measured water: rinse thick poha in a colander under running water for 30–60 seconds and rest it 5 minutes. Never soak it in standing water and never pressure cook it — both collapse it to paste.",
    ],
  ],
};

export default seo;
