const seo = {
  title: "Office Worker Protein Calculator: Daily, Per Meal",
  metaDescription:
    "Set a desk-job protein target from Mifflin-St Jeor, your step count and gym sessions, then split it per meal against 0.24 g/kg, or 0.40 from age 60.",
  steps: [
    "Enter sex, age, weight and height, then hours seated at work, average daily steps, resistance sessions a week and minutes per session.",
    "Choose a goal — maintain weight and keep muscle, lose fat and keep muscle, or build muscle — and how many meals with protein you eat a day.",
    "Read the daily protein target in grams with its range and the per-meal dose across your meals, then press Copy result.",
  ],
  intro:
    "This calculator sets a daily protein target for a desk-based adult and splits it across meals, starting from the fact that the 0.8 g per kg RDA prevents deficiency rather than preserving muscle. It uses 1.0-1.2 g/kg for simply holding on to lean mass, up to about 1.6 g/kg where there is regular resistance training (the breakpoint Morton's 2018 meta-analysis found), and 1.6-2.2 g/kg in a calorie deficit. Daily energy comes from the Mifflin-St Jeor equation with an activity factor chosen from your step count using the Tudor-Locke bands, plus gym sessions costed separately with the ACSM metabolic equation so a low step count does not erase your training.",
  useCases: [
    "Finding out what a 78 kg office worker walking 6,000 steps and lifting three times a week actually needs — around 117 g, not the 62 g the RDA implies",
    "Checking whether three meals a day can each carry enough protein to trigger muscle protein synthesis, or whether a fourth is needed",
    "Setting a protein floor before starting a calorie deficit, so the weight lost is fat rather than muscle",
  ],
  benefits: [
    [
      "Steps and gym counted separately",
      "A step-based activity factor plus a MET-costed session, so a desk job with real training is not scored as sedentary.",
    ],
    [
      "Per-meal dose, not just a daily total",
      "Checks each meal against 0.24 g/kg, rising to 0.40 g/kg from age 60, which is where the muscle response actually happens.",
    ],
    [
      "Sanity-checked against calories",
      "Flags a target that falls outside the 10-35% of energy acceptable range for adults.",
    ],
  ],
  faqs: [
    [
      "How much protein does an office worker need per day?",
      "About 1.0-1.2 g per kilogram of body weight to hold on to muscle — roughly 70-84 g for a 70 kg adult. That is above the 0.8 g/kg RDA, which was set as the minimum to avoid deficiency in healthy adults, not as an optimum. Add resistance training and the useful range rises to about 1.4-1.6 g/kg.",
    ],
    [
      "Is 1.6 g/kg of protein enough to build muscle?",
      "For most people, yes. Morton and colleagues pooled 49 studies in 2018 and found the benefit of extra protein on lean mass plateaued at about 1.62 g per kg per day, with a confidence interval reaching 2.2 g/kg. Above that range, additional protein reliably adds cost rather than muscle.",
    ],
    [
      "How much protein should be in each meal?",
      "Roughly 0.24 g per kg of body weight per meal for adults under about 60, which is 17 g for a 70 kg person and closer to 25-30 g in practice at most meals. From around 60 the dose needed rises to about 0.40 g/kg because ageing muscle responds less to the same amount. Spreading protein evenly across three or four meals works better than one large dinner.",
    ],
    [
      "Does sitting all day change how much protein I need?",
      "Not the gram target directly, but it changes what the protein is working against. Prolonged sitting reduces the muscle-building signal and lowers total energy expenditure, so a sedentary day makes both the protein floor and resistance training more important, not less. The WHO's 2020 guidelines ask for 150-300 minutes of moderate activity a week plus muscle-strengthening on at least two days.",
    ],
  ],
};

export default seo;
