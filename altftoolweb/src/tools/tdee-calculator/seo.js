const seo = {
  title: "TDEE Calculator: Maintenance Calories from 3 BMR Formulas",
  metaDescription:
    "Estimate daily calorie burn with Mifflin-St Jeor, Harris-Benedict or Katch-McArdle, an activity factor from 1.2 to 1.9, and cut-to-bulk targets.",
  steps: [
    "Fill in Your details: pick Metric (kg / cm) or Imperial (lb / ft), set Sex at birth, Age (years), height and weight, then choose an Activity level from Sedentary (factor 1.2) to Extra active (1.9).",
    "Choose a BMR formula — Mifflin-St Jeor, Harris-Benedict (revised) or Katch-McArdle (needs body fat %) — and a Goal from Aggressive fat loss (−1000 kcal) to Muscle gain (+500 kcal); the result recalculates as you type.",
    "Read the Daily target in kcal/day with BMR (at rest), Activity multiplier and TDEE (maintenance) beneath it, compare the All goals at a glance grid, and press Copy result for a plain-text summary.",
  ],
  "intro": "TDEE Calculator estimates how many calories your body burns in a full day: it first works out your basal metabolic rate with Mifflin-St Jeor, Harris-Benedict or Katch-McArdle, then multiplies it by an activity factor from 1.2 (desk-bound) to 1.9 (physical job or twice-daily training). The result is your maintenance intake, alongside cut, recomposition and lean-bulk targets built from 250, 500 and 1000 kcal daily adjustments. It's for anyone setting a calorie number before they start tracking food.",
  "useCases": [
    "Set a starting calorie number before beginning a fat-loss phase, instead of guessing at '1,500 a day'.",
    "Work out how much more you need to eat on training days versus rest days by switching the activity factor.",
    "Compare Mifflin-St Jeor against Katch-McArdle once you have a DEXA or calliper body-fat reading."
  ],
  "benefits": [
    [
      "Three BMR equations",
      "Mifflin-St Jeor for general use, revised Harris-Benedict for comparison, and Katch-McArdle when you know your body fat."
    ],
    [
      "Every goal side by side",
      "See aggressive cut through lean bulk at once, so you can pick a deficit you'll actually stick to."
    ],
    [
      "Safety floor built in",
      "Targets are never shown below 1,500 kcal for men or 1,200 for women, with a clear warning when the floor kicks in."
    ]
  ],
  "faqs": [
    [
      "What is the difference between BMR and TDEE?",
      "BMR is what you would burn lying still all day — breathing, circulation, cell repair. TDEE is BMR multiplied by an activity factor, so it also covers walking, work, training and digesting food."
    ],
    [
      "Which activity level should I choose?",
      "Most people overestimate. If you train 3-4 times a week but sit for work, 'moderately active' (1.55) is usually closer than 'very active'. Pick the lower option if you're unsure and adjust after two weeks of weight data."
    ],
    [
      "How accurate is a TDEE calculation?",
      "Prediction equations are typically within about 10-15% for most people, but individual metabolism, NEAT and body composition vary. Treat the number as a starting point and correct it against your real weight trend."
    ],
    [
      "How big a calorie deficit is sensible?",
      "A deficit of roughly 500 kcal a day corresponds to about 0.5 kg of weight loss per week, which most guidance considers a sustainable rate. This tool is informational — talk to a doctor or dietitian before large deficits or if you have a medical condition."
    ]
  ]
};

export default seo;
