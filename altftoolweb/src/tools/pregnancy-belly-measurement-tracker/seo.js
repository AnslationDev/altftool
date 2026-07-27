const seo = {
  intro:
    "This tracker logs fundal height and belly circumference by gestational week and scores each entry against McDonald's rule, under which fundal height in centimetres approximately equals the number of weeks pregnant between 24 and 36 weeks. It shows the difference from expected, the growth rate in centimetres per week, and a Johnson's formula estimate of fetal weight — (fundal height − 12) × 155 grams, adjusted when the head has engaged or maternal weight exceeds 91 kg. It records and compares measurements; it does not diagnose anything.",
  useCases: [
    "Keeping your own record between antenatal visits so you can see whether growth has continued at about 1 cm a week.",
    "Checking whether the 3 cm gap your midwife mentioned at 32 weeks has narrowed by the next appointment.",
    "Tracking belly circumference alongside fundal height when you want a second, easier-to-repeat measurement.",
    "Preparing a short measurement history to show at a growth-scan appointment.",
  ],
  benefits: [
    ["Scored against a real rule", "Every entry is compared with McDonald's rule and the ±2 cm normal band, not just plotted."],
    ["Growth rate, not single points", "Week-to-week and whole-log growth in cm per week show the trend a single measurement hides."],
    ["Bedside weight estimate", "Johnson's formula gives a rough fetal weight from the latest fundal height, with the engagement and maternal-weight adjustments."],
  ],
  faqs: [
    [
      "What should my fundal height be at each week?",
      "Between about 24 and 36 weeks, fundal height in centimetres is roughly equal to your gestational age in weeks — 30 cm at 30 weeks, give or take 2 cm. The rule loses accuracy before 24 weeks and after 36 weeks, when the baby descends into the pelvis and the measurement can fall.",
    ],
    [
      "When is a fundal height difference a problem?",
      "A gap of more than 3 cm from the expected figure is the usual trigger for a growth ultrasound. A larger measurement can indicate a bigger baby, excess amniotic fluid, fibroids or twins; a smaller one can indicate restricted growth or low fluid — which is why it is checked with a scan rather than assumed.",
    ],
    [
      "How do I measure fundal height at home?",
      "Lie flat with an empty bladder and run a non-stretch tape from the top of the pubic bone to the top of the uterus, keeping the tape's numbers face-down so you are not influenced by the reading. Home measurement is far less consistent than a clinician's, so treat differences of a centimetre or two as measurement noise.",
    ],
    [
      "How accurate is Johnson's formula for fetal weight?",
      "It is a bedside approximation, typically within several hundred grams, and it is less reliable at the extremes of fetal size or with maternal obesity. Ultrasound biometry is the accurate method — use this estimate for interest only and rely on your clinician's assessment.",
    ],
  ],
};

export default seo;
