const seo = {
  title: "High-Protein Macro Calculator for a Calorie Deficit",
  metaDescription:
    "Protein first: 1.4–3.0 g/kg body weight or 1.8–3.1 g/kg lean mass, a fat floor, carbs from the rest. Flags a loss rate above 1% of body weight a week.",
  steps: [
    "Enter sex, age, weight in kg, height in cm, activity level and \"Target loss (kg per week, 0 to maintain)\".",
    "Under \"Base protein on\", pick Body weight (1.4–3.0 g/kg) or Lean body mass (1.8–3.1 g/kg fat-free mass, with your body fat %), then set fat per kg and meals a day.",
    "Read the daily protein target with its carbohydrate and fat grams and the protein/carb/fat energy split, plus any warning that the loss rate exceeds 1% of body weight a week; press \"Copy result\".",
  ],
  intro:
    "A high-protein macro split is one where protein is set first — high enough to defend lean tissue while you are eating below maintenance — and the remaining calories are divided between a fat floor and carbohydrate. This calculator sizes the deficit from a target weight-loss rate (1 kg of body fat carries about 7,700 kcal), sets protein from either body weight or lean body mass, and flags the two mistakes that cost people muscle: dieting faster than 1% of body weight a week, and dropping fat below a fifth of calories. The body-weight protein input runs 1.4–3.0 g/kg, built around the ISSN protein position stand (1.4–2.0 g/kg for people who train, with the calculator's own higher end reflecting that intakes above 2.0 g/kg are appropriate during energy restriction). The lean-mass input runs 1.8–3.1 g/kg fat-free mass, built around the Helms review of dieting resistance-trained athletes (2.3–3.1 g/kg fat-free mass), with the floor extended down to 1.8 g/kg for people dieting less aggressively than that reviewed cohort.",
  useCases: [
    "Setting macros for a 12-week cut where the goal is to hold a bench press number, not just the scale number",
    "Converting a body-fat scan result into a protein target based on lean mass instead of total body weight",
    "Checking whether 0.9 kg a week is too aggressive at 72 kg body weight before committing to it",
  ],
  benefits: [
    ["Protein from lean mass", "Uses fat-free mass when you know your body-fat percentage, which is the more defensible basis."],
    ["Deficit from a real rate", "Converts kilograms per week into a daily calorie gap instead of an arbitrary percentage."],
    ["Guardrails on the plan", "Flags an over-fast loss rate, a sub-1,200/1,500 kcal target and a fat intake that has been squeezed too low."],
  ],
  faqs: [
    [
      "How much protein do I need to keep muscle in a calorie deficit?",
      "This calculator accepts 1.4–3.0 g per kilogram of body weight a day, with 2.2 g/kg as a sane default — toward the top of that range the leaner you are and the steeper the deficit. Expressed on lean mass instead, it accepts 1.8–3.1 g per kilogram of fat-free mass (2.6 g/kg default); the top of that range, 2.3–3.1 g/kg, is the range specifically reviewed for dieting resistance-trained athletes.",
    ],
    [
      "How fast can I lose weight without losing muscle?",
      "Keep the rate at or under about 1% of body weight per week — roughly 0.8 kg a week at 80 kg. Faster loss increases the share of weight that comes from lean tissue, and no amount of protein fully offsets it. Resistance training two to four times a week matters as much as the protein does.",
    ],
    [
      "Should I split protein evenly across meals?",
      "Yes, roughly. Muscle protein synthesis responds to a per-meal dose of about 0.4 g per kilogram of body weight, so three to five servings of that size beat one huge serving. For an 80 kg person that is around 32 g per meal, four times a day.",
    ],
    [
      "Is a high-protein diet bad for your kidneys?",
      "In healthy adults, no — controlled trials up to about 3 g/kg have not shown kidney damage. It is different if you already have reduced kidney function, where protein is usually restricted rather than increased, so anyone with chronic kidney disease should agree an intake with their doctor before raising protein.",
    ],
  ],
};

export default seo;
