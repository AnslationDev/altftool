const seo = {
  intro:
    "A weekly meal planner lays out breakfast, lunch, dinner and snacks across seven days, converts the grams you enter into calories using the Atwater factors (4 kcal per gram of protein, 4 for carbohydrate, 9 for fat), and checks each day's macronutrient split against the Institute of Medicine's Acceptable Macronutrient Distribution Ranges. It then merges every ingredient line into one shopping list. It is for anyone doing a weekly shop who wants the plan to add up before they get to the supermarket.",
  useCases: [
    "Batch-cook Sunday: spot the dishes repeating three or more times across the week and cook them once",
    "Check that a training week actually reaches your protein target instead of assuming it does",
    "Turn seven days of recipes into a single deduplicated shopping list with combined quantities",
  ],
  benefits: [
    ["Calories that always agree", "Energy is derived from grams, so the kcal figure can never contradict the macros you typed."],
    ["Macro split checked against AMDR", "Days outside 45-65% carbs, 10-35% protein or 20-35% fat are flagged with the actual percentage."],
    ["Quantities that combine", "Two meals each needing 200 g of rice appear once on the list as 400 g."],
  ],
  faqs: [
    [
      "How are the calories worked out?",
      "With the Atwater general factors: 4 kcal per gram of protein, 4 per gram of carbohydrate and 9 per gram of fat. So a meal with 30 g protein, 60 g carbs and 20 g fat is 120 + 240 + 180 = 540 kcal. Nothing is entered as a calorie figure, which is why the totals always reconcile with the grams.",
    ],
    [
      "What macro split should I aim for?",
      "The Institute of Medicine's ranges for adults are 45-65% of energy from carbohydrate, 10-35% from protein and 20-35% from fat. These are wide on purpose — plenty of healthy patterns sit anywhere inside them. This planner flags a day only when it falls outside those bounds, not when it differs from some ideal.",
    ],
    [
      "What is the difference between macros and portions here?",
      "The macros are what one person eats, and they drive the day's calorie total. Portions is how many servings you cook, and it only multiplies the ingredients on the shopping list. Cooking four portions of a meal you eat one of will not change your calorie total, but it will quadruple the rice you need to buy.",
    ],
    [
      "How far off target does a day have to be before it is flagged?",
      "More than 10%. On a 2,200 kcal target that means anything below 1,980 or above 2,420 kcal gets a warning, with the exact shortfall or surplus in kilocalories. Smaller day-to-day swings are normal and are left alone.",
    ],
  ],
};

export default seo;
