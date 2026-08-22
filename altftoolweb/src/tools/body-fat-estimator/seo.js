const seo = {
  title: "Body Fat Calculator: Navy Tape, BMI, Caliper",
  metaDescription:
    "Run US Navy tape, BMI regression and Jackson-Pollock 3-site caliper on the same stats, with fat and lean mass, bands and a goal weight.",
  intro:
    "The Body Fat % Estimator runs three different estimation methods on the same person: the US Navy tape formula from neck, waist and hip circumference, a BMI regression using height, weight, age and sex, and the Jackson-Pollock three-site skinfold equation, which converts caliper readings into body density and then into fat via the Siri conversion 495 / density - 450. It is aimed at people who own calipers or a tape measure and want to see whether the methods agree before trusting any one of them. Each result is split into fat mass and lean mass, banded from essential to excess, and can be saved locally to build a history.",
  useCases: [
    "You bought a set of calipers and want to check your three-site pinch total against the tape-measure number before deciding which one to track from now on.",
    "You are eight weeks into a training block and want a dated history of the same measurement method, so you can tell progress from measurement noise.",
    "You have a goal of 20 percent body fat and want to know the scale weight that corresponds to it if your lean mass stays where it is.",
  ],
  benefits: [
    [
      "Three methods, one profile",
      "Tape, BMI regression and caliper estimates all run off the same stats, so you can see the spread between them instead of trusting a single figure.",
    ],
    [
      "Proper caliper mathematics",
      "The skinfold path uses the sex-specific Jackson-Pollock density equation and the Siri conversion rather than a generic lookup table.",
    ],
    [
      "Warns when the method is a poor fit",
      "Flags tape-method results when BMI exceeds 35 or age is under 18, the two conditions where circumference estimates are known to drift.",
    ],
  ],
  faqs: [
    [
      "Which three sites does the caliper method use?",
      "It uses the Jackson-Pollock three-site protocol: chest, abdomen and thigh for men, and triceps, suprailiac and thigh for women. The three readings in millimetres are summed and fed into a sex-specific body-density equation together with your age, then converted with the Siri formula 495 / density - 450.",
    ],
    [
      "Why do the three methods give me different numbers?",
      "Because they measure different proxies — circumference, overall mass, and subcutaneous fat thickness — and each was fitted to a different reference population. Spreads of several percentage points between methods are normal. Pick one method, measure it the same way each time, and follow the direction it moves rather than comparing across methods.",
    ],
    [
      "What body fat percentage counts as athletic?",
      "The bands used here put men at under 14 percent for athletic, 14 to 17 percent for fitness, 18 to 24 percent acceptable and 25 percent or more as excess, with under 6 percent as essential fat only. For women the same steps are under 21, 21 to 24, 25 to 31 and 32 percent or more, with under 14 percent essential. Sitting in the essential band is a health risk, not an achievement.",
    ],
    [
      "How is the goal weight worked out?",
      "It assumes your lean mass stays fixed and solves for the weight at which your target percentage would hold: target weight = lean mass / (1 - target percent / 100). That is a useful planning figure, but real dieting usually costs some lean mass too, so treat it as a ceiling on what pure fat loss would achieve rather than a promise.",
    ],
  ],
};

export default seo;
