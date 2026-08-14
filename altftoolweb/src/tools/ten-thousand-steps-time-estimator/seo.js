const seo = {
  title: "How Long 10,000 Steps Takes at Your Cadence and Height",
  metaDescription:
    "Divide your step target by your cadence for minutes and km (step length from height), subtract steps already taken, and split the rest into equal walks.",
  steps: [
    "Set a Daily step target (or tap the 6,000–12,000 presets), your Cadence in steps per minute and your Height in cm.",
    "Enter Steps already taken today and how many walks to split the rest over; add Body weight (kg, optional) for calories.",
    "Read the total walking time, distance in km, intensity band and the per-walk steps and minutes table, then click Copy result.",
  ],
  intro:
    "10000 Steps Time Estimator divides your step target by your walking cadence to show how many minutes on your feet the goal actually costs, then converts the steps into distance using the standard pedometer relationship step length ≈ 0.415 x height for men and 0.413 x height for women. It also subtracts the steps you have already racked up incidentally and splits the remainder into equal walks. Useful for anyone trying to fit a step goal into a working day rather than guessing at it.",
  useCases: [
    "See whether 10,000 steps fits into two 30-minute walks or needs three.",
    "Find out how many kilometres 10,000 steps is for someone 155 cm tall versus 190 cm tall.",
    "Check whether your usual cadence clears the 100 steps-per-minute moderate-intensity mark.",
    "Plan the evening walk after a tracker shows 4,200 incidental steps at 5 pm.",
  ],
  benefits: [
    ["Height-aware distance", "Step length is derived from your stature, so the kilometre figure is not a one-size average."],
    ["Cadence intensity check", "Flags whether your pace reaches the 100 and 130 steps-per-minute intensity thresholds."],
    ["Splits the day for you", "Subtracts incidental steps and divides what is left into equal, schedulable walks."],
  ],
  faqs: [
    [
      "How long does it take to walk 10,000 steps?",
      "About 1 hour 30 minutes of continuous walking at a typical 110 steps per minute, or roughly 1 hour 40 minutes at a slower 100 steps per minute. Most people accumulate part of it incidentally, so the dedicated walking time is usually less.",
    ],
    [
      "How many kilometres is 10,000 steps?",
      "Around 7 to 8 km for most adults. At 170 cm tall the step length works out near 0.71 m, giving 7.1 km; a 190 cm adult covers about 7.9 km for the same step count.",
    ],
    [
      "Do I really need 10,000 steps a day?",
      "No — the 10,000 figure came from a 1960s Japanese pedometer name, not from research. Large cohort studies since have found mortality benefits levelling off somewhere between roughly 7,000 and 9,000 steps a day for middle-aged and older adults. This is general information, not medical advice.",
    ],
    [
      "How many calories do 10,000 steps burn?",
      "Roughly 350 to 450 kcal for a 70 kg adult walking at a moderate pace, scaling with body weight and speed. The calculator uses kcal/min = MET x 3.5 x kg / 200 with MET values from the Compendium of Physical Activities.",
    ],
  ],
};

export default seo;
