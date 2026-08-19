const seo = {
  title: "MUAC Calculator: WHO 115/125 mm Child Bands",
  metaDescription:
    "Read a MUAC tape measurement in mm or cm against the WHO cut-offs for children 6-59 months: red under 115 mm, yellow to 125 mm, green above.",
  steps: [
    "Set \"Who was measured\" to \"Child aged 6-59 months\", which adds an \"Age in months\" box, or to \"Pregnant or lactating woman\".",
    "Type the figure into \"Tape reading\" and set \"Unit\" to \"millimetres (mm)\" or \"centimetres (cm)\".",
    "\"Screening band\" names the result - Severe acute malnutrition under 115 mm, Moderate from 115 to under 125 mm, none at 125 mm and above - with the tape colour and \"Distance to the next band\" beneath; \"Copy result\" copies the reading and band.",
  ],
  intro:
    "The Mid-Upper Arm Circumference Tool reads a MUAC tape measurement against the WHO screening cut-offs for children aged 6 to 59 months: below 115 mm is severe acute malnutrition, 115 mm to under 125 mm is moderate acute malnutrition, and 125 mm or more is green. It converts between millimetres and centimetres, names the band, and states the usual next step, plus a separate view for the 230 mm threshold used for pregnant and lactating women in Indian nutrition programmes. This is screening information for parents and community health workers, not a diagnosis.",
  useCases: [
    "Check a MUAC tape reading of 118 mm on a two-year-old and see that it falls in the yellow moderate band.",
    "Convert a 12.8 cm reading into millimetres and confirm which side of the 125 mm cut-off it sits on.",
    "See how many millimetres separate a child's current reading from the next band up.",
    "Read a 22.5 cm measurement for a pregnant woman against the 23 cm programme threshold.",
  ],
  benefits: [
    ["WHO cut-offs, unchanged", "115 mm and 125 mm are used exactly as published, with the boundary cases handled correctly."],
    ["Both units", "Readings entered in centimetres or millimetres give the same band, so a mistyped unit is caught."],
    ["Clear next step", "Each band states what usually follows, including same-day referral for a red reading."],
  ],
  faqs: [
    [
      "What MUAC reading means severe acute malnutrition?",
      "Below 115 mm (11.5 cm) in a child aged 6 to 59 months. WHO and UNICEF set that cut-off in their 2009 joint statement, and it is the red zone on a standard MUAC tape. A child in the red band needs to be seen at a health facility the same day.",
    ],
    [
      "What is a normal MUAC for a child?",
      "125 mm (12.5 cm) or more is the green band, meaning no acute malnutrition by this measure. Between 115 and 125 mm is moderate acute malnutrition. Some programmes additionally watch readings between 125 and 135 mm as an early-warning strip, but that is a local convention rather than a WHO classification.",
    ],
    [
      "How do you measure mid-upper arm circumference correctly?",
      "Use the left arm. Find the midpoint between the tip of the shoulder and the tip of the elbow with the arm bent at 90 degrees, then let the arm hang relaxed and wrap the tape at that midpoint. Pull it snug without denting the skin, and read the number at the window. A loose or twisted tape is the commonest source of a wrong band.",
    ],
    [
      "Can MUAC be used instead of weight and height?",
      "No. MUAC is a fast screening measure that works well for identifying children at high risk, but weight-for-height, a check for bilateral pitting oedema and a clinical examination are all part of a proper assessment. Oedema of both feet indicates severe acute malnutrition regardless of the MUAC reading, so always take a swollen-feet finding to a clinician.",
    ],
  ],
};

export default seo;
