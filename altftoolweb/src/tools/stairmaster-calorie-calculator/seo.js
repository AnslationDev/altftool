const seo = {
  title: "StairMaster Calorie Burn From Steps Per Minute",
  metaDescription:
    "Body weight × gravity × climb rate ÷ 25% efficiency, not a flat MET. 70 steps/min on an 8-inch step gives 9.0 MET, and leaning on the rails cuts ~20%.",
  steps: [
    "Enter Body weight (kg), Steps per minute, Minutes and Step height (m) — the 0.2032 default is the standard 8-inch step.",
    "Set Handrail use to \"Hands off, or light fingertip balance only\", \"Resting hands on the rails\" or \"Leaning weight through the rails\", and add an optional Calorie target.",
    "Read the StairMaster estimate — kcal/min and MET, gross versus active kcal, total steps, vertical metres and floors — then press Copy output.",
  ],
  intro:
    "The Stairmaster Calorie Calculator estimates step-mill energy expenditure from the mechanical work of lifting your body mass — body weight times gravity times climbing speed — divided by the roughly 25 percent gross efficiency of stair climbing, with resting metabolism added back on. Because climbing is almost pure vertical work, that approach responds properly to step rate, step height and handrail use instead of applying one flat MET value to every session. At 70 steps per minute on a standard 8-inch step it reproduces the 9.0 MET figure the Compendium of Physical Activities lists for a stair-treadmill ergometer.",
  useCases: [
    "Compare 20 minutes at 80 steps per minute against 35 minutes at 50 steps per minute before choosing a session.",
    "See how much the burn drops when you lean on the handrails — typically about 20 percent.",
    "Work out how long you need on the machine to hit a 300 kcal target at your usual pace.",
    "Convert a session into vertical metres and building floors climbed for a stair-climb challenge.",
  ],
  benefits: [
    [
      "Physics, not a lookup table",
      "Uses work done against gravity, so doubling the step rate genuinely doubles the climbing component.",
    ],
    [
      "Gross and net calories",
      "Separates the exercise cost from the resting calories you would have burned anyway.",
    ],
    [
      "Handrail honesty",
      "Applies a documented reduction when you rest or lean on the rails, which consoles ignore.",
    ],
  ],
  faqs: [
    [
      "How many calories does 30 minutes on the StairMaster burn?",
      "About 315 kcal for a 70 kg person at 70 steps per minute, of which roughly 280 kcal is above resting metabolism. Body weight drives the result almost linearly, so a 90 kg person at the same settings burns about 405 kcal.",
    ],
    [
      "Does holding the handrails reduce calories burned?",
      "Yes, substantially. Resting your hands on the rails cuts the work by roughly 8 percent, and leaning your weight through them by about 20 percent, because part of your body mass is no longer being lifted by your legs. The machine's own console cannot detect this, which is one reason its calorie figure usually reads high.",
    ],
    [
      "Is the StairMaster better than the treadmill for burning calories?",
      "At matched effort they are similar, but the step mill reaches a high MET value at a pace most people can sustain — 9 METs at 70 steps per minute — without the joint impact of running. The best choice is the one you will actually do for the full session.",
    ],
    [
      "Why is my console calorie number higher than this?",
      "Gym consoles typically report gross calories, often assume a default body weight if you did not enter one, and cannot account for handrail support or your individual efficiency. Treat any calorie readout, including this one, as an estimate with a margin of roughly 10 to 20 percent.",
    ],
  ],
};

export default seo;
