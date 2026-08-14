const seo = {
  title: "Macro Calculator: Protein, Carb & Fat Grams a Day",
  metaDescription:
    "Mifflin-St Jeor BMR x an activity factor of 1.2-1.9, then ±250 or ±500 kcal, split into protein, carb and fat grams at 4/4/9 calories per gram.",
  steps: [
    "Enter Age, Gender, Weight (kg) and Height (cm), then pick the BMR Formula — Mifflin-St Jeor (Default), Harris-Benedict, or Katch-McArdle, which reveals a Body Fat % field and works from lean body mass.",
    "Choose an Activity Level from Sedentary (Little or no exercise) to Athlete (Twice daily training), which multiplies BMR by 1.2 to 1.9; set a Primary Goal of -500, -250, Maintain Weight, +250 or +500 kcal and a Macro Split of Balanced (30P/40C/30F), High Protein (40P/30C/30F), Low Carb (35P/25C/40F) or High Carb (25P/50C/25F), then click Calculate Macros.",
    "Read BMR, TDEE, Target Calories and Water Intake, then the Daily Macro Targets cards giving protein, carb and fat in grams — calories divided by 4, 4 and 9 — with each macro's percentage of the calorie target.",
  ],
  intro:
    "The Macro Calculator turns your age, sex, height and weight into a daily protein, carbohydrate and fat target by estimating BMR with the Mifflin-St Jeor equation, multiplying it by an activity factor from 1.2 to 1.9 to get TDEE, then adjusting by 250 or 500 calories for a cut or a bulk. It converts the resulting calorie target into grams using 4 calories per gram for protein and carbs and 9 per gram for fat, across four preset splits. It is for anyone setting up a food-tracking app and needing starting numbers rather than a guess. The output is general information, not a clinical prescription — talk to a doctor or registered dietitian before changing your intake if you have a medical condition.",
  useCases: [
    "Setting up MyFitnessPal or a similar tracker for the first time and needing protein, carb and fat gram targets to type into the goals screen instead of accepting the app's defaults.",
    "Deciding whether a 250-calorie or a 500-calorie deficit fits your schedule, by comparing the two calorie targets and the gram splits side by side before committing to a cut.",
    "Knowing your body fat percentage from a DEXA or calliper reading and wanting the Katch-McArdle estimate, which works from lean body mass instead of total weight.",
  ],
  benefits: [
    [
      "Three BMR equations, not one",
      "Switch between Mifflin-St Jeor, Harris-Benedict and Katch-McArdle so you can see how much the choice of formula actually moves your number.",
    ],
    [
      "Calories converted straight to grams",
      "Each split is applied to your calorie target and divided by the Atwater factors, so you get grams to log rather than percentages to work out yourself.",
    ],
    [
      "Deficit and surplus as fixed steps",
      "Goals move your TDEE by a defined 250 or 500 calories rather than an opaque percentage, so you can see exactly what changed.",
    ],
  ],
  faqs: [
    [
      "What formula does this use to work out my calories?",
      "Mifflin-St Jeor by default: 10 x weight in kg plus 6.25 x height in cm minus 5 x age, then plus 5 for men or minus 161 for women. That gives BMR, which is then multiplied by your activity factor to give TDEE.",
    ],
    [
      "Which activity multiplier should I pick?",
      "1.2 for sedentary, 1.375 for light activity, 1.55 for moderate, 1.725 for very active and 1.9 for athlete-level training. Most people who train three to five times a week and are otherwise desk-bound land on 1.55.",
    ],
    [
      "How many calories should I cut to lose fat?",
      "This calculator offers a 250-calorie deficit for a slower cut and a 500-calorie deficit for a faster one, with matching 250 and 500 surpluses for bulking. A 500-calorie daily deficit is the conventional starting point for roughly half a kilogram a week, though real results vary with adherence and activity — check with a doctor or dietitian before a large or prolonged deficit.",
    ],
    [
      "How are grams of protein, carbs and fat calculated?",
      "Each macro's share of your calorie target is divided by its calorie density: 4 calories per gram for protein, 4 for carbohydrate and 9 for fat. The balanced preset is 30 percent protein, 40 carbs and 30 fat; the alternatives are high protein at 40/30/30, low carb at 35/25/40, and high carb at 25/50/25.",
    ],
  ],
};

export default seo;
