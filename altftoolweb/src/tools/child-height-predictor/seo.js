const seo = {
  title: "Child Height Predictor: Mid-Parental Height Formula",
  metaDescription:
    "Estimates a child's adult height from both parents: (mother + father ± 13 cm) ÷ 2, with the ±8.5 cm likely range and a feet-and-inches conversion.",
  intro:
    "The mid-parental height method estimates how tall a child will end up as an adult by averaging both parents' heights after adjusting for the child's sex: for a boy, (mother + father + 13) / 2 in centimetres, and for a girl, (mother + father - 13) / 2. This calculator applies that formula and reports the result with its usual confidence band of about plus or minus 8.5 cm, plus a feet-and-inches conversion. It is an informational estimate of genetic potential, not a diagnosis or a measurement of your child.",
  useCases: [
    "Your child is the shortest in their class and you want to see whether their expected adult height is simply what their family genetics predict",
    "You are buying a bike, a bed or sports equipment meant to last years and want a sense of the height range to plan for",
    "A paediatrician has mentioned target height at a growth check and you want to work out the same number at home before the next appointment",
  ],
  benefits: [
    ["Uses the standard clinical formula", "The same mid-parental calculation used in growth assessment, with the 13 cm sex adjustment applied in the correct direction for boys and girls."],
    ["Shows the range, not just a single figure", "A likely band of roughly 17 cm total width is reported alongside the point estimate, because the method is genuinely that imprecise."],
    ["Answers in both units", "Centimetres and feet-and-inches are shown together, so you can use whichever your growth chart or family uses."],
  ],
  faqs: [
    [
      "How do you calculate a child's predicted adult height from the parents?",
      "Add both parents' heights in centimetres, add 13 cm for a boy or subtract 13 cm for a girl, then divide by two. So a 165 cm mother and a 178 cm father give roughly 178 cm for a son and 165 cm for a daughter.",
    ],
    [
      "How accurate is the mid-parental height method?",
      "It is a population estimate with a wide margin: about plus or minus 8.5 cm, meaning roughly a 17 cm spread within which most children in that family land. Two siblings with the same parents can differ substantially and both be entirely normal.",
    ],
    [
      "Why is 13 cm added for boys and subtracted for girls?",
      "Because 13 cm is approximately the average adult height difference between men and women, so the adjustment shifts the parental average onto the child's own sex-specific scale. It is a correction for that population gap, not a claim about any individual child.",
    ],
    [
      "Can nutrition or health change the outcome?",
      "Yes. The formula reflects genetic potential only; nutrition, sleep, chronic illness, hormone conditions and timing of puberty all affect the height actually reached. If a child is growing much slower or faster than expected, or crossing centile lines on a growth chart, that is a question for a paediatrician rather than a calculator.",
    ],
  ],
};

export default seo;
