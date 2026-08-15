const seo = {
  title: "Ghee Intake Calculator: Daily Teaspoons You Can Eat",
  metaDescription:
    "How much ghee fits your day in teaspoons: applies the ICMR-NIN 20-30% fat range and WHO's under-10% saturated ceiling, and names which limit binds.",
  steps: [
    "Enter your Daily calorie target (kcal), then Fat already eaten today (g) and Of which saturated (g) for everything else on the plate.",
    "Set Total fat share of energy (20% to 35% of energy) and the Saturated fat ceiling — Under 10% of energy (WHO 2023) or Under 6% of energy (AHA, for lowering LDL).",
    "\"Ghee left for today\" shows the allowance in tsp, with grams, tablespoons, calories added, both budgets and which limit is binding listed underneath; Copy result copies the breakdown.",
  ],
  intro:
    "The Ghee Intake Calculator works out how much ghee fits inside two ceilings at the same time — total fat as a share of daily energy, and saturated fat as a share of daily energy — and reports whichever runs out first. It uses the USDA composition for anhydrous butter oil (876 kcal, 99.5 g fat and 61.9 g saturated fat per 100 g), the ICMR-NIN adult range of 20-30% of energy from fat, and the WHO 2023 guideline of under 10% of energy from saturated fat. The answer comes back in teaspoons, because that is how ghee actually gets served.",
  useCases: [
    "See how many teaspoons of ghee are left after a day that already included 40 g of fat from cooking oil and dairy.",
    "Compare the allowance under the WHO 10% saturated fat ceiling against the stricter 6% figure the AHA uses for lowering LDL.",
    "Check whether adding a spoon of ghee to dal and a spoon to roti still fits a 2,000 kcal day.",
    "Work out the ghee budget for a 1,600 kcal weight-loss plan where the fat share is set at 25% of energy.",
  ],
  benefits: [
    ["Two limits at once", "Total fat and saturated fat are both applied, and the tool names which one is binding."],
    ["Answer in spoons", "Grams are converted at 4.5 g per teaspoon and 13.6 g per tablespoon, using the density of ghee."],
    ["Accounts for the rest of the day", "Fat already eaten is subtracted first, so the allowance is what is genuinely left."],
  ],
  faqs: [
    [
      "How much ghee can I eat in a day?",
      "On a 2,000 kcal day with fat at 30% of energy and saturated fat held under 10%, the saturated ceiling is 22 g. If the rest of the day supplies 10 g of saturated fat, the remaining 12 g allows roughly 20 g of ghee, which is about 4 teaspoons. Eat more saturated fat elsewhere and the allowance falls quickly.",
    ],
    [
      "How many calories are in one teaspoon of ghee?",
      "About 40 kcal. A teaspoon holds roughly 4.5 g of ghee, and ghee runs at 876 kcal per 100 g, so a tablespoon of about 13.6 g comes to around 119 kcal.",
    ],
    [
      "Is ghee healthier than refined oil?",
      "Ghee is around 62% saturated fat against roughly 10-15% in most refined seed oils, and WHO advises replacing saturated fat with unsaturated fat to lower cardiovascular risk. Ghee does carry fat-soluble vitamins and a high smoke point, so the practical answer is to use it in measured quantity rather than as the main cooking fat.",
    ],
    [
      "Does ghee count towards my visible fat limit?",
      "Yes. Ghee, butter, vanaspati and cooking oil are all visible fats and share the same budget, which is why the calculator asks what you have already eaten. Invisible fat in nuts, dairy, meat and grains counts towards the total fat figure too, so include it if you are tracking closely.",
    ],
  ],
};

export default seo;
