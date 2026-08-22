const seo = {
  title: "Stride Length Calculator: Cadence, Steps, Height",
  metaDescription:
    "Work out running stride and step length from watch cadence and pace, a counted step test, or height — plus steps per km and per mile.",
  steps: [
    "Pick a method with the mode buttons: \"Cadence + pace\", \"Steps over a distance\" or \"From height\".",
    "Enter that mode's inputs — e.g. \"Cadence (steps per minute)\" plus pace minutes/seconds per km, or \"Distance covered (metres)\" and \"Steps counted\".",
    "Read stride length in cm, m and ft with steps per kilometre and per mile, then click \"Copy result\" for the text summary.",
  ],
  intro:
    "Stride length is the distance covered by one full gait cycle — from a foot strike back to the next strike of the same foot — and it is exactly two steps. This calculator derives it three ways: from watch cadence and pace (step length = speed ÷ steps per second), from a counted step test over a measured distance, or from the pedometer height rule of thumb. Runners get step length, stride length, steps per kilometre and steps per mile from the same input.",
  useCases: [
    "Convert a watch reading of 172 spm at 5:30/km into the step and stride length behind it, so you can see whether a pace change came from turnover or from reach.",
    "Count your steps over a marked 400 m track lap and get a measured step length to enter into a treadmill or pedometer that asks for one.",
    "Check how much your step length grows between easy pace and 5K pace while cadence stays roughly flat — the usual pattern in trained runners.",
    "Work out how many steps a marathon will take at your current step length before choosing shoes and planning cadence work.",
  ],
  benefits: [
    ["Step and stride kept separate", "Cadence counts steps; a stride is two of them, and the tool never conflates the two."],
    ["Three input routes", "Use watch data, a counted step test, or a height estimate — whichever numbers you actually have."],
    ["Steps per km and per mile", "See the total footfalls behind a race distance, useful for shoe wear and impact planning."],
  ],
  faqs: [
    [
      "What is the difference between step length and stride length?",
      "Step length is the distance from one foot strike to the opposite foot strike; stride length is from one foot strike to the next strike of the same foot, so stride length is exactly two step lengths. If your step length is 1.1 m, your stride length is 2.2 m.",
    ],
    [
      "How do I calculate stride length from cadence and pace?",
      "Convert pace to speed in metres per second (1000 ÷ seconds per kilometre), divide by cadence in steps per second (spm ÷ 60) to get step length, then double it. At 180 spm and 5:00/km the speed is 3.33 m/s, step length is 1.11 m and stride length is 2.22 m.",
    ],
    [
      "What is a normal running stride length?",
      "Most recreational runners land somewhere between 0.8 m and 1.6 m per step — roughly 1.6 m to 3.2 m per stride — and it rises with speed. There is no single correct value: it depends on leg length, pace, gradient and fitness, so track your own trend rather than chasing an average.",
    ],
    [
      "Should I try to lengthen my stride to run faster?",
      "Deliberately reaching further ahead usually means landing with the foot well in front of the body, which increases braking forces, so most coaches raise cadence instead and let step length grow on its own as fitness improves. Any change to running mechanics is best made gradually and, if you have a history of injury, with a physiotherapist or coach.",
    ],
  ],
};

export default seo;
