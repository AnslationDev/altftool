const seo = {
  title: "Treadmill Pace Converter: Speed & Incline",
  metaDescription:
    "Convert belt speed and incline to min/km and min/mile pace, the flat and outdoor equivalents, plus METs and calories from the ACSM equations.",
  steps: [
    "Enter the \"Belt speed\" and pick km/h or mph under \"Speed unit\".",
    "Set the \"Incline (% grade)\" — type it or tap the 0/1/2/5/10% preset buttons — plus \"Body weight (kg)\" and \"Session length (minutes)\".",
    "Read the belt pace per km and per mile, the same-effort flat and outdoor speeds, METs and session calories, then click \"Copy result\".",
  ],
  intro:
    "The Treadmill Pace Converter turns a belt speed and incline into running pace per kilometre and per mile, and into the flat-belt and outdoor speeds that cost the same oxygen. It uses the ACSM metabolic equations for walking and running to estimate VO2, METs and calories, and applies the Jones and Doust finding that a 1% treadmill grade matches the energy cost of level outdoor running. Built for runners who train indoors but race outside and need the two paces to line up.",
  useCases: [
    "Set the belt to the speed that reproduces your 5:30/km outdoor race pace once wind resistance is accounted for.",
    "Work out how much a 5% incline raises the effort of a 10 km/h jog before you build a hill session around it.",
    "Compare a 6 mph gym treadmill readout with your watch's min/km pace when travelling.",
    "Estimate the calorie cost of a 45-minute incline walk at 5 km/h and 10% grade for a weight-management log.",
  ],
  benefits: [
    ["Published equations", "VO2 and METs come from the ACSM walking and running equations, not a generic multiplier."],
    ["Incline handled honestly", "Grade is converted into an equivalent flat speed, with a flag when the input falls outside the validated range."],
    ["Indoor to outdoor", "The 1% wind-resistance allowance is applied so belt pace and road pace can be compared directly."],
  ],
  faqs: [
    [
      "What incline should I set on a treadmill to match outdoor running?",
      "Set 1%. Jones and Doust (1996) found that a 1% grade reproduces the energy cost of level outdoor running for speeds between about 10.5 and 18 km/h, where air resistance becomes significant. Below roughly 10 km/h the difference is small enough that 0% is fine.",
    ],
    [
      "How do I convert treadmill speed to pace per kilometre?",
      "Divide 60 by the speed in km/h. A belt at 10 km/h is 6:00 per kilometre; 12 km/h is 5:00 per kilometre. For pace per mile, multiply the per-kilometre pace by 1.609344, so 6:00/km is about 9:39/mile.",
    ],
    [
      "How much harder is running at a 5% incline?",
      "In the ACSM running equation the grade term is 0.9 mL O2 per kg per metre against 0.2 for the horizontal term, so each 1% of grade adds about 4.5% to the equivalent flat speed. A 5% incline therefore makes 10 km/h cost about the same as 12.25 km/h on the flat.",
    ],
    [
      "Are the treadmill calorie numbers accurate?",
      "They are population averages. The tool converts estimated VO2 into calories at 5 kcal per litre of oxygen, which is standard, but running economy varies by roughly 10% between individuals and treadmill belts drift out of calibration. Use the figure for comparison between sessions rather than as an exact energy balance, and consult a clinician or dietitian for medical or weight-loss decisions.",
    ],
  ],
};

export default seo;
