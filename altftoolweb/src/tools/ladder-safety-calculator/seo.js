const seo = {
  title: "Ladder Safety Calculator: OSHA 4-to-1 Base Distance",
  metaDescription:
    "Base distance at the OSHA 4-to-1 angle (about 75.5°), minimum ladder length with 3 ft of rail above the roof, highest safe rung and ANSI load check.",
  steps: [
    "Set Units to Feet or Metres, then enter Height of the top support point — the eave, sill or landing edge — and Ladder working length, using the extended length rather than the sum of the sections.",
    "Choose the Ladder duty rating, add Climber weight (kg) and Tools and materials carried up (kg), and tick \"I step off onto a roof or landing\" if you transfer onto one.",
    "\"Set the feet this far from the wall\" gives the base distance and the OSHA 4-to-1 angle, with Working length along the rails, Minimum ladder length, Rail above the support point, Highest rung you may stand on and Practical reach height below; press Copy result.",
  ],
  intro:
    "This calculator turns a wall height into a ladder set-up you can measure: how far the feet go from the wall, whether your ladder is long enough, the highest rung you may stand on and how far you can actually reach. It applies the OSHA 4-to-1 rule from 29 CFR 1926.1053 — the base sits one quarter of the working length out from the wall, an angle of about 75.5 degrees — plus the 3 ft rail extension required for stepping onto a roof and ANSI A14 duty ratings for the load check. Useful for painters, roofers, electricians, window cleaners and anyone clearing gutters at home.",
  useCases: [
    "Position an extension ladder against a gutter at 20 ft and mark where the feet should land before climbing.",
    "Check whether the 24 ft ladder in the van is long enough to step onto a first-floor terrace with the required 3 ft of rail above the edge.",
    "Confirm that a 95 kg technician plus a 15 kg tool bag stays inside a Type I 250 lb duty rating.",
  ],
  benefits: [
    ["Measured, not guessed", "Gives the base distance in feet or metres so you can pace it out instead of eyeballing the lean."],
    ["Catches a short ladder early", "Tells you the minimum length the height needs before you are halfway up and reaching."],
    ["Load check included", "Compares climber plus tools against the ladder's ANSI duty rating, which is a total load, not a body weight."],
  ],
  faqs: [
    [
      "What is the 4 to 1 ladder rule?",
      "Set the foot of the ladder one quarter of its working length away from the wall. OSHA 1926.1053(b)(5)(i) defines working length as the distance along the ladder between its foot and the top support, so a 20 ft working length means the base sits 5 ft out — an angle of about 75.5 degrees from the ground.",
    ],
    [
      "How far above the roof should a ladder extend?",
      "At least 3 feet (0.9 m) of side rail above the landing surface, per OSHA 1926.1053(b)(1), whenever you use the ladder to get onto a roof or platform. Without it there is nothing to hold while you transfer your weight across, which is where a large share of ladder falls happen.",
    ],
    [
      "What is the highest rung you can stand on?",
      "On a leaning or extension ladder, the top three rungs are not a standing level, so the highest safe rung sits about 3 feet of rail below the top. On a stepladder, do not stand on the top cap or the step immediately below it unless the ladder is specifically built and labelled for it.",
    ],
    [
      "Does the ladder duty rating include my tools?",
      "Yes. An ANSI A14 duty rating is the total load: your body weight, clothing, boots, tool belt and anything you carry or hoist up. Type III is rated 200 lb, Type II 225 lb, Type I 250 lb, Type IA 300 lb and Type IAA 375 lb, so a 90 kg worker with a 15 kg bag is already past a Type II ladder.",
    ],
  ],
};

export default seo;
