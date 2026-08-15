const seo = {
  title: "Treadmill Calorie Calculator",
  metaDescription:
    "Enter weight, speed, incline and minutes; the ACSM walking and running equations give gross and net kcal, METs, VO2 and distance covered.",
  steps: [
    "Enter Body weight in kg or lb, Speed in km/h or mph, Incline (%) and Duration (minutes).",
    "Leave Walking or running on Auto (by speed), or force the ACSM walking or running equation yourself.",
    "Read Calories burned (gross), Net calories (above resting), Intensity in METs, Oxygen uptake and Distance covered, then press Copy result.",
  ],
  intro:
    "This calculator estimates treadmill calorie burn from oxygen uptake using the ACSM metabolic equations: VO2 = 0.1 × speed + 1.8 × speed × grade + 3.5 for walking, and VO2 = 0.2 × speed + 0.9 × speed × grade + 3.5 for running, with speed in metres per minute and grade as a fraction. Oxygen uptake is converted to energy at 5 kcal per litre of O2 and scaled by your body weight, so incline and body mass change the answer the way they change the actual effort. Both gross calories and net calories above resting metabolism are shown, because they differ by a surprising amount over a long session.",
  useCases: [
    "Compare a flat 30-minute run against a 12% incline walk of the same length to see which actually costs more energy.",
    "Work out what treadmill speed and grade you need to hit a 400 kcal session in the time you have.",
    "Check whether the console figure is plausible when the machine has no idea what you weigh.",
    "Convert a prescribed intensity in METs into a specific speed and incline setting.",
  ],
  benefits: [
    [
      "Incline handled properly",
      "Grade enters the equation directly, so a 10% climb raises the estimate far more than a MET lookup table would.",
    ],
    [
      "Gross and net separated",
      "Net calories subtract the energy you would have burned resting, which is the honest figure for a weight-loss calculation.",
    ],
    [
      "Metric or imperial",
      "Weight in kg or lb, speed in km/h or mph, with distance reported in both kilometres and miles.",
    ],
  ],
  faqs: [
    [
      "How many calories does 30 minutes on a treadmill burn?",
      "For a 70 kg person walking 30 minutes at 5.6 km/h on the flat, the ACSM walking equation gives about 135 kcal gross and about 98 kcal net of resting metabolism. The same 30 minutes running at 10 km/h works out near 387 kcal gross. Body weight moves both figures proportionally.",
    ],
    [
      "Does incline really increase calorie burn that much?",
      "Yes, especially when walking. In the ACSM walking equation the grade term is 1.8 × speed × grade, so at 5.6 km/h a 10% incline raises oxygen uptake from about 12.8 to about 29.6 mL/kg/min — roughly 2.3 times the energy cost. For running, the grade coefficient is 0.9, so incline adds proportionally less.",
    ],
    [
      "Why is the treadmill's own calorie readout different?",
      "Most consoles assume a default body weight unless you enter yours, report gross rather than net calories, and use a generic conversion instead of a grade-aware equation. Holding the handrails also reduces the real cost by supporting some of your body weight, which no machine can detect.",
    ],
    [
      "Should I use gross or net calories for weight loss?",
      "Net calories — the amount above what you would have burned sitting still — is the figure that reflects the extra energy the session actually cost. Over an hour the difference is roughly 60 to 90 kcal for a typical adult, which matters if you are eating those calories back. These are estimates rather than measurements; talk to a dietitian or doctor before building a strict energy deficit around them.",
    ],
  ],
};

export default seo;
