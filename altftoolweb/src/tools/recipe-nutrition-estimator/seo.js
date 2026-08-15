const seo = {
  title: "Recipe Nutrition Estimator: 147 Foods, Per Serving",
  metaDescription:
    "Build a dish from 147 ingredients using tsp, tbsp and katori weights, then read per-serving calories, protein, carbs, fat and fibre with %DV.",
  steps: [
    "Set the Recipe name and Servings, then use \"Add an ingredient\" to search the 147-food table — each match shows its kcal / 100 g — and click one to add a row.",
    "Type grams into each row, or tap the \"Tap to add\" chips (tsp, tbsp, katori, cup) which add that measure's real gram weight to the row.",
    "Read the per-serving kcal, the \"Where the calories come from\" split at 4 kcal/g protein and carbs and 9 kcal/g fat, the %DV table and \"What is making this heavy\", then press \"Copy nutrition label\" or Save recipe.",
  ],
  intro:
    "Recipe Nutrition Estimator builds a nutrition label for a dish you enter yourself: pick ingredients from a built-in table of about 147 foods with per-100 g values for calories, protein, carbs, fat and fibre, enter the weight of each, set the number of servings, and it divides the totals to give per-serving figures. It also splits the calories by macro using the 4/4/9 kcal-per-gram convention, ranks which ingredient is contributing the most calories and what share, and shows each nutrient as a percentage of the FDA daily values (2000 kcal, 50 g protein, 275 g carbs, 78 g fat, 28 g fibre). It is an estimate from a reference table, not a lab analysis, and is intended for home cooks and anyone tracking intake rather than for regulatory labelling.",
  useCases: [
    "You cook a big pot of dal or curry for the week and want to know what one katori actually costs you in calories and protein, which no packaged label can tell you.",
    "You are trying to hit a protein target and want to see whether adding paneer or swapping to a leaner ingredient moves the per-serving number enough to matter.",
    "Your dish came out at a calorie count you did not expect, and you want to see the ranked contributor list — usually the oil or ghee — before deciding what to cut.",
  ],
  benefits: [
    [
      "Household measures, not just grams",
      "Ingredients carry their own measure sets — tsp, tbsp, katori, cup — with real gram weights, so you can enter what you actually used.",
    ],
    [
      "Names the calorie culprit",
      "Ingredients are ranked by calories contributed with a percentage share, and the top one comes with specific reduction swaps.",
    ],
    [
      "Per serving and whole recipe together",
      "Totals, per-serving values, the macro split and %DV are all shown at once, and the whole label can be copied out as text.",
    ],
  ],
  faqs: [
    [
      "How accurate are the calorie numbers?",
      "They are estimates from a fixed per-100 g reference table, so expect to be in the right range rather than exact. Real variation comes from the fat content of your specific meat or dairy, how much oil the food absorbed, and water lost in cooking — none of which the table can see.",
    ],
    [
      "What daily values are the percentages based on?",
      "A 2000 kcal reference day with 50 g protein, 275 g carbohydrate, 78 g fat and 28 g fibre — the standard FDA daily values used on packaged labels. Your own requirement may be well above or below that depending on size, age and activity, so treat the percentages as a common yardstick rather than your personal target.",
    ],
    [
      "How is the macro split calculated?",
      "Protein and carbohydrate are counted at 4 kcal per gram and fat at 9 kcal per gram, then each is expressed as a share of that macro calorie total. Because alcohol and rounding are not accounted for, the split can differ slightly from the raw calorie figure.",
    ],
    [
      "Can I use this to manage a medical condition or a strict diet?",
      "Use it for general awareness only. It gives no sodium, sugar, cholesterol or micronutrient data, and the figures are estimates — if you are managing diabetes, kidney disease, an allergy or a clinically prescribed diet, work from values confirmed with a dietitian or your treating clinician.",
    ],
  ],
};

export default seo;
