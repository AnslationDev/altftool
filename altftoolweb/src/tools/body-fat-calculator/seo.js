const seo = {
  intro:
    "The Body Fat Percentage Calculator estimates body fat two ways: the US Navy tape method, which feeds neck, waist and — for women — hip circumference plus height into a log-based regression, and the Deurenberg equation, which derives fat from BMI, age and sex when you have no tape. It then splits your weight into fat mass and lean mass, places the result on the standard essential/athlete/fitness/average/obese bands, and works out the goal weight and rough timeline to reach a target percentage. Tape estimates typically carry a few percentage points of error, so treat the number as a trend line rather than a lab result.",
  useCases: [
    "The scale has not moved in a month but your waist is down two centimetres, and you want to see whether you have swapped fat for lean mass rather than stalled.",
    "You have a target of 15 percent body fat and need to know what that actually means in kilograms — the goal weight, the fat to lose, and how many weeks that is at a sensible rate.",
    "You only have a bathroom scale and no tape measure, and want a first estimate from height, weight, age and sex before deciding whether a proper measurement is worth it.",
  ],
  benefits: [
    [
      "Two methods on the same inputs",
      "Runs the Navy tape formula and the Deurenberg BMI formula side by side, so you can see how far apart the two estimates land for you.",
    ],
    [
      "Separates fat mass from lean mass",
      "Reports both in kilograms or pounds, which is what actually tells you whether a diet is costing you muscle.",
    ],
    [
      "Turns a target percentage into a weight",
      "Holds your lean mass constant to compute the weight you would be at your goal body fat, plus a week range at 0.5 to 1 percent of body weight lost per week.",
    ],
  ],
  faqs: [
    [
      "How does the US Navy body fat formula work?",
      "For men it is 495 / (1.0324 - 0.19077 x log10(waist - neck) + 0.15456 x log10(height)) - 450, all in centimetres. For women the same shape uses waist + hip - neck with the constants 1.29579, 0.35004 and 0.221. It is circumference-based, so a waist larger than the neck is required for the formula to produce a value at all.",
    ],
    [
      "What is a healthy body fat percentage?",
      "The bands used here put men at 6-13 percent athlete, 14-17 percent fitness, 18-24 percent average and 25 percent or more obese, with 2-5 percent as essential fat. For women the same steps are 14-20, 21-24, 25-31 and 32 percent or more, with 10-13 percent essential. Dropping below the essential band is not a fitness goal — it carries real hormonal and health consequences.",
    ],
    [
      "Which method should I trust, tape or BMI?",
      "The tape method is generally the better of the two because it responds to where your weight actually sits, while the Deurenberg estimate starts from BMI and therefore cannot distinguish muscle from fat. Neither approaches DEXA or hydrostatic weighing for accuracy — tape estimates commonly sit a few percentage points off — so use one method consistently and watch the direction it moves.",
    ],
    [
      "How is the timeline to my goal calculated?",
      "It takes the fat you would need to lose to hit your target percentage and divides it by a weekly loss of 1 percent of body weight for the fast end and 0.5 percent for the slow end, producing a week range. That rate band is the one usually recommended to preserve lean mass; faster loss tends to take muscle with it, and a dietitian or doctor is the right person to sign off on an aggressive plan.",
    ],
  ],
};

export default seo;
