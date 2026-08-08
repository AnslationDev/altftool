const seo = {
  title: "Steps to Calories: ACSM MET Equation Calculator",
  metaDescription:
    "Convert steps to calories with the ACSM equation and 2011 Compendium METs. Step length comes from your height; shows gross and net kcal plus distance.",
  steps: [
    "Enter Steps walked and pick a Walking pace — from \"Slow stroll — 2.0 mph\" through \"Fast walk — 4.5 mph\" and \"Jogging — 5.0 mph\", each carrying its own Compendium MET code.",
    "Give your Body weight with a Weight unit of Kilograms (kg) or Pounds (lb), your Height (cm), and a Step-length basis of Female (0.413 × height) or Male (0.415 × height).",
    "Read \"Calories burnt\" in kcal plus Net calories (above resting), Distance covered, Time on feet, Estimated step length, MET value used and Calories per 1,000 steps; Copy result copies the summary and Reset restores the defaults.",
  ],
  intro:
    "This converter turns a step count into calories by first estimating your step length from your height (0.415 × height for men, 0.413 for women), converting steps into distance and time at your chosen pace, then applying the ACSM metabolic equation kcal/min = MET × 3.5 × body mass in kg ÷ 200. MET values come from the 2011 Compendium of Physical Activities, so a moderate 3 mph walk uses 3.5 METs and a brisk 3.5 mph walk uses 4.3. It is for walkers and step-goal chasers who want a figure grounded in a published equation rather than a flat guess.",
  useCases: [
    "Checking what a 10,000-step day actually burns at your own weight and height rather than an app's default",
    "Comparing a slow stroll with a brisk walk over the same number of steps before choosing a lunchtime route",
    "Working out how many steps it takes to offset a specific snack, using the calories-per-1,000-steps figure",
  ],
  benefits: [
    ["Published equation, not a guess", "Uses the ACSM MET equation and Compendium MET codes, both citable, instead of an unexplained per-step constant."],
    ["Gross and net calories", "Shows total energy used and energy above resting metabolism, which is the honest number for weight management."],
    ["Height-based step length", "Distance comes from your own height rather than a fixed 0.76 m stride, which matters a lot at the extremes."],
  ],
  faqs: [
    [
      "How many calories does 10,000 steps burn?",
      "For a 70 kg person 165 cm tall walking at a moderate 3 mph, 10,000 steps covers about 6.8 km in roughly 85 minutes and burns about 363 kcal gross, or 259 kcal above resting metabolism. Heavier or taller people burn more, because both mass and step length rise.",
    ],
    [
      "How do you convert steps into calories?",
      "Steps × step length gives distance, distance ÷ speed gives minutes, and minutes × MET × 3.5 × weight in kg ÷ 200 gives kilocalories. The middle term is the ACSM metabolic equation, which comes from 1 MET being 3.5 mL of oxygen per kg per minute and each litre of oxygen releasing about 5 kcal.",
    ],
    [
      "How long is one step?",
      "About 0.41 times your standing height while walking — roughly 68 cm for someone 165 cm tall and 75 cm for someone 180 cm tall. Step length grows with speed, so a brisk walk covers more ground per step than a stroll.",
    ],
    [
      "Should I use gross or net calories for weight loss?",
      "Net calories, because your body would have burnt the resting portion anyway. In the 10,000-step example above, the net figure of 259 kcal is about 100 kcal lower than the gross 363 kcal — a gap big enough to matter if you eat back what your tracker reports.",
    ],
  ],
};

export default seo;
