const seo = {
  intro:
    "The Steps to Kilometres Converter multiplies a step count by your step length to give distance in kilometres, metres and miles. Step length can come from the conventional height proportions used by pedometer makers — 0.415 times height for men and 0.413 for women — from a distance you measure and count yourself, which is the most accurate method, or from a figure you already know. It also reports how many steps make up a kilometre and a mile for you, and estimates walking time and energy from published MET values.",
  useCases: [
    "Turn a phone's daily step total into kilometres so it can be logged against a distance goal.",
    "Find how many steps a kilometre takes for you, rather than using a generic 1,250 or 1,300.",
    "Measure your real step length over 20 metres and see how far the height estimate was off.",
    "Check the distance and rough calorie cost of hitting 10,000 steps at a brisk pace.",
  ],
  benefits: [
    ["Three ways to set step length", "Height estimate, your own measurement, or a known value — the measurement method overrides any formula."],
    ["Step and stride kept separate", "A stride is two steps, and confusing the two is what doubles or halves most step-distance answers."],
    ["Time and energy included", "Uses Compendium MET values for slow to fast walking rather than a single generic calories-per-step figure."],
  ],
  faqs: [
    [
      "How many steps are in a kilometre?",
      "It depends on your step length: at 70 cm per step it is about 1,430 steps, at 75 cm about 1,330, and at 80 cm about 1,250. Generic answers of 1,250 to 1,400 cover most adults, but the exact figure for you is simply 100,000 divided by your step length in centimetres.",
    ],
    [
      "How do I calculate step length from height?",
      "Multiply height by 0.415 for men or 0.413 for women, which gives step length in the same unit — so a 170 cm person using the 0.413 proportion has a step length of about 70 cm. These proportions describe comfortable walking; running takes longer steps, and stairs, hills and crowds shorten them.",
    ],
    [
      "What is the difference between step length and stride length?",
      "A step is one foot strike, measured heel to heel between opposite feet. A stride is two steps — a complete gait cycle from one heel strike to the next by the same foot — so stride length is exactly double step length. Fitness devices usually report steps, so a step length is what a distance calculation needs.",
    ],
    [
      "How far is 10,000 steps?",
      "Between roughly 6.5 and 8 kilometres for most adults, or about 4 to 5 miles, depending on step length. At a 70 cm step it is 7.0 km; at 80 cm it is 8.0 km. At a brisk 5.6 km/h that is somewhere between an hour and an hour and a half of walking.",
    ],
  ],
};

export default seo;
