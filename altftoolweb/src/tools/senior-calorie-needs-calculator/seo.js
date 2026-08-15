const seo = {
  title: "Senior Calorie Calculator: Mifflin-St Jeor",
  metaDescription:
    "Daily calories for adults 50+ from Mifflin-St Jeor, an activity factor of 1.2-1.9, a 1,200/1,500 kcal floor and the 1.0-1.2 g/kg senior protein target.",
  steps: [
    "Set Sex, 'Age (years)', 'Weight (kg)' and 'Height (cm)' — the Mifflin-St Jeor equation takes 5 kcal of resting metabolism off for every year of age.",
    "Choose an Activity level from Sedentary (1.2) to Extremely active (1.9) and a Goal, and tick 'Living with illness or recovering from surgery' to lift the protein band to 1.2-1.5 g/kg.",
    "Read the Daily calorie target beside 'Resting energy (BMR)' and Maintenance calories, plus the Protein target in g/day, the Fluid guide in mL and the kcal lost per decade, then press Copy result.",
  ],
  intro:
    "The Senior Calorie Needs Calculator estimates daily energy requirements for adults aged 50 and over using the Mifflin-St Jeor equation, which subtracts 5 kcal of resting metabolism for every year of age and is the prediction equation recommended by the Academy of Nutrition and Dietetics. Resting energy is multiplied by an activity factor from 1.2 to 1.9, adjusted for a weight goal, and held above a safe intake floor. It also reports the higher protein target of 1.0 to 1.2 g per kg of body weight that PROT-AGE and ESPEN recommend for older adults.",
  useCases: [
    "Working out why a 70-year-old who eats exactly as they did at 50 is slowly gaining weight.",
    "Setting a realistic calorie target for gentle weight loss without dropping so low that protein and micronutrients suffer.",
    "Checking the protein grams needed to support muscle during recovery from surgery or a hospital stay.",
    "Giving a carer a written daily calorie and fluid figure to plan meals around.",
  ],
  benefits: [
    ["Age is in the equation", "Mifflin-St Jeor includes an explicit age term, so the fall in resting metabolism is calculated rather than assumed."],
    ["Protein set for later life", "Uses the 1.0-1.2 g/kg older-adult target, well above the general 0.8 g/kg RDA, and 1.2-1.5 g/kg during illness."],
    ["A floor on the target", "Weight-loss targets are never allowed below 1,200 kcal for women or 1,500 for men without supervision."],
  ],
  faqs: [
    [
      "How many calories does a 70-year-old need per day?",
      "It depends on sex, weight, height and activity, but a lightly active 70-year-old woman of 65 kg and 160 cm needs roughly 1,570 kcal a day, while a sedentary 68-year-old man of 78 kg and 175 cm needs about 1,850 kcal. Enter the actual figures rather than relying on an average, because weight and activity move the number by several hundred calories.",
    ],
    [
      "Why do calorie needs drop with age?",
      "Mostly because muscle mass falls, and muscle is metabolically active tissue. The Mifflin-St Jeor equation captures this as a 5 kcal reduction in resting metabolism per year of age, which becomes 60 to 95 kcal a day per decade once an activity factor is applied. Resistance exercise slows the loss by preserving muscle.",
    ],
    [
      "How much protein do older adults need?",
      "The PROT-AGE study group and ESPEN recommend 1.0 to 1.2 grams of protein per kilogram of body weight per day for healthy older adults, rising to 1.2 to 1.5 g/kg with acute or chronic illness. That is well above the 0.8 g/kg general adult RDA, and spreading it across meals rather than loading it into dinner helps muscle use it. People with kidney disease need a target set by their doctor.",
    ],
    [
      "Is it safe for an older adult to lose weight?",
      "Deliberate, slow weight loss can help when excess weight is affecting joints or blood sugar, but rapid loss in later life takes muscle and bone with the fat and raises frailty and fracture risk. Aim for no more than about 0.5 kg a week, keep protein high, add resistance exercise, and have any unintentional weight loss investigated by a doctor.",
    ],
  ],
};

export default seo;
