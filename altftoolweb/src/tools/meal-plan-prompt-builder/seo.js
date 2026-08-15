const seo = {
  title: "Meal Plan Prompt Builder With Mifflin-St Jeor",
  metaDescription:
    "Turns Mifflin-St Jeor calories, protein and fat grams, a per-serving budget and named allergen exclusions into one AI meal-planning prompt.",
  steps: [
    "Fill in Sex used by the equation, Age (years), Weight (kg), Height (cm), Activity level and Goal, then choose a Protein target from 0.8 g/kg (the adult RDA) to 2.0 g/kg, and Fat as % of calories.",
    "Set People eating, Meals a day, Days to plan, Currency and Total food budget for the plan, tick anything under Allergens to exclude absolutely, and cap Max hands-on minutes per meal.",
    "Check the Daily energy target headline and the Rough split per meal table, then press Copy prompt to take the assembled text shown under Your prompt to an AI assistant.",
  ],
  intro:
    "The Meal Plan Prompt Builder works out an estimated daily energy and macronutrient target, converts a food budget into a per-serving figure, and folds both into a single prompt an AI assistant can plan a week of meals from. Energy is estimated with the Mifflin-St Jeor equation (Am J Clin Nutr, 1990) multiplied by a physical activity level, and macros are converted using the Atwater factors of 4 kcal per gram of protein and carbohydrate and 9 per gram of fat. It is a planning estimate, not dietetic advice, and the prompt it writes instructs the assistant to say so too.",
  useCases: [
    "Plan seven days of vegetarian dinners for two people inside a fixed weekly grocery budget and see the per-serving figure it implies.",
    "Set a protein target in grams per kilogram and get the carbohydrate allowance that leaves, rather than guessing.",
    "Generate a plan that excludes named allergens explicitly in every dish, sauce and garnish rather than assuming they are absent.",
    "Cap hands-on cooking time at 30 minutes a meal and let the plan work around a pressure cooker and a single pan.",
  ],
  benefits: [
    [
      "A real equation, not a guess",
      "Mifflin-St Jeor plus a standard activity multiplier, with every constant shown.",
    ],
    [
      "Budget turned into per-serving cost",
      "Total budget divided by people × meals × days, so the constraint reaches the recipe choices.",
    ],
    [
      "Allergens stated as absolute",
      "Selected allergens become a hard exclusion in the prompt, with a reminder to check labels anyway.",
    ],
  ],
  faqs: [
    [
      "How do you calculate daily calorie needs?",
      "Estimate resting metabolic rate with the Mifflin-St Jeor equation — 10 × weight in kg, plus 6.25 × height in cm, minus 5 × age in years, then plus 5 for men or minus 161 for women — and multiply by an activity factor between 1.2 for sedentary and 1.9 for very active. A 30-year-old man of 80 kg and 180 cm has an RMR of 1,780 kcal; at moderate activity that is about 2,759 kcal a day.",
    ],
    [
      "How much protein should a meal plan include?",
      "The adult Recommended Dietary Allowance is 0.8 grams per kilogram of body weight per day, which is a minimum to prevent deficiency rather than an optimum. People doing regular resistance training commonly use 1.6 g/kg, and 2.0 g/kg is a figure often used while eating in a deficit. This tool converts whichever you pick into grams and calories, and gives the carbohydrate allowance that is left.",
    ],
    [
      "Which allergens should a meal plan exclude by name?",
      "At minimum the nine the US Food and Drug Administration requires to be labelled: milk, eggs, fish, crustacean shellfish, tree nuts, peanuts, wheat, soybeans and sesame — sesame was added by the FASTER Act. Selecting them here makes the prompt treat them as absolute exclusions covering sauces, stocks and garnishes, not just the headline ingredient. Never rely on an AI-generated plan alone for allergy safety: read the label on every product.",
    ],
    [
      "Is a calculated calorie target safe to follow?",
      "Treat it as a planning estimate. Prediction equations sit within roughly 10 to 20 percent of measured expenditure for most adults and do not account for pregnancy, breastfeeding, thyroid or metabolic conditions, eating disorders, or growth in under-18s. This tool warns when a target falls below the conventional 1,200 kcal (women) or 1,500 kcal (men) floors. Speak to a doctor or a registered dietitian before making a significant change to how you eat.",
    ],
  ],
};

export default seo;
