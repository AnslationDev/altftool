const seo = {
  title: "Macro Split Calculator: Calories to Grams Per Meal",
  metaDescription:
    "Turn a calorie target into protein, carb and fat grams at 4/4/9 kcal per gram — balanced, high-protein, keto or custom splits, divided across 1-10 meals.",
  steps: [
    "Enter 'Daily calories (kcal)' (800-8,000) and 'Meals per day' (1-10), then pick a 'Diet split' preset — from Balanced (30P / 40C / 30F) to Ketogenic (25P / 5C / 70F) — or Custom split.",
    "For a custom plan, press 'Fine-tune these percentages' and set Protein %, Carb % and Fat %; the tool flags any split that does not total 100%.",
    "Read the 'Protein target' g/day headline, the grams-and-kcal table for all three macros and the per-meal cards, then press 'Copy result'.",
  ],
  "intro": "Macro Split Calculator converts a daily calorie target into grams of protein, carbohydrate and fat using the standard Atwater values — 4 kcal per gram for protein and carbs, 9 kcal per gram for fat. Choose a preset such as balanced 30/40/30, high protein 40/35/25, low carb, ketogenic 25/5/70 or high-carb endurance, or type your own percentages and the tool checks they add to 100. It also divides each macro across your chosen number of meals so you know what a single plate should look like.",
  "useCases": [
    "Translate the calorie number from a TDEE calculation into macros you can actually log in a food-tracking app.",
    "Compare what switching from a balanced split to keto does to your daily carb allowance in grams.",
    "Work out per-meal protein when you're meal-prepping four containers for the week."
  ],
  "benefits": [
    [
      "Six ready-made splits",
      "Balanced, high protein, low carb, ketogenic and endurance presets, plus a fully custom option."
    ],
    [
      "Custom split validation",
      "Percentages that don't total 100 are flagged immediately instead of silently producing wrong grams."
    ],
    [
      "Per-meal breakdown",
      "Divides protein, carbs and fat across 1 to 10 meals so each plate has a concrete target."
    ]
  ],
  "faqs": [
    [
      "How are macro grams calculated from calories?",
      "Each macro's calorie share is the target multiplied by its percentage, then divided by its energy density: 4 kcal per gram for protein and carbohydrate, 9 kcal per gram for fat."
    ],
    [
      "What is a good macro split for fat loss?",
      "There is no single best split — total calories drive weight change. Higher protein splits (around 30-40% of calories) are commonly used during a deficit because protein helps preserve lean mass and increases fullness."
    ],
    [
      "Why do my rounded grams not add back to my exact calories?",
      "Grams are rounded to whole numbers for practicality, so the recomposed total can be off by a few kcal. Use the unrounded percentages if you need an exact match."
    ],
    [
      "Do I need to hit my macros exactly every day?",
      "Most people do fine landing within about 5-10 grams of each target and looking at weekly averages. This tool is informational — speak to a dietitian or doctor before following a restrictive diet such as ketogenic eating."
    ]
  ]
};

export default seo;
