const seo = {
  title: "Blood Glucose Converter: mg/dL to mmol/L",
  metaDescription:
    "Convert a blood sugar reading with the 18.0182 factor and see the ADA fasting, 2-hour or random band it lands in. 126 mg/dL = 7.0 mmol/L.",
  steps: [
    "Type the number into Reading and set Unit of that reading to mg/dL or mmol/L; the Switch to mmol/L button flips the input unit.",
    "Choose When was the sample taken? — Fasting (no food for 8 hours), 2 hours after food or an OGTT, or Random / any time of day.",
    "Converted reading shows the same value in the other unit, with a Reference band row naming the matching ADA band; Copy result copies both numbers and the band.",
  ],
  intro:
    "The Blood Glucose Unit Converter changes a blood sugar reading between mg/dL and mmol/L using the standard glucose factor of 18.0182, derived from glucose's molar mass of 180.156 g/mol. It also places the converted value against published American Diabetes Association reference bands for a fasting sample, a two-hour post-meal or OGTT sample, and a random sample. It is useful for anyone reading results across countries: mg/dL is standard in the US and India, mmol/L in the UK, Europe, Canada and Australia.",
  useCases: [
    "Read a UK or European lab report in mmol/L when your meter and target ranges are set in mg/dL.",
    "Convert a 7.0 mmol/L fasting result and see that it equals 126 mg/dL, the diabetes diagnostic threshold.",
    "Check whether a 2-hour post-meal value of 8.5 mmol/L sits inside or outside the normal range.",
    "Set up a meter bought abroad by matching its unit to the numbers your clinician uses.",
  ],
  benefits: [
    ["Exact factor", "Uses 18.0182 mg/dL per mmol/L, so 7.0 mmol/L converts to 126 mg/dL exactly as published tables show."],
    ["Context-aware bands", "Fasting, 2-hour and random samples have different thresholds, and the tool applies the right set."],
    ["Low readings flagged", "Values below 70 mg/dL and below 54 mg/dL are called out as the ADA level 1 and level 2 hypoglycaemia alerts."],
  ],
  faqs: [
    [
      "How do you convert mg/dL to mmol/L for blood sugar?",
      "Divide the mg/dL value by 18.0182. For example 126 mg/dL ÷ 18.0182 = 7.0 mmol/L. To go the other way, multiply mmol/L by 18.0182: 5.5 mmol/L × 18.0182 = 99 mg/dL.",
    ],
    [
      "What is a normal fasting blood sugar level?",
      "Under 100 mg/dL (5.6 mmol/L) is the normal fasting range in the ADA Standards of Care. 100 to 125 mg/dL (5.6 to 6.9 mmol/L) is impaired fasting glucose, often called prediabetes, and 126 mg/dL (7.0 mmol/L) or above on two separate tests meets the diagnostic threshold for diabetes.",
    ],
    [
      "What blood sugar level is considered too low?",
      "Below 70 mg/dL (3.9 mmol/L) is the ADA hypoglycaemia alert value, and below 54 mg/dL (3.0 mmol/L) is classed as clinically significant hypoglycaemia. Treat a low with fast-acting carbohydrate and seek medical help if you feel unwell or the reading does not recover.",
    ],
    [
      "Why do some countries use mmol/L and others mg/dL?",
      "mmol/L is the SI unit, expressing concentration as molecules per litre, and is used in the UK, Ireland, most of Europe, Canada, Australia and China. mg/dL is a mass-per-volume unit retained in the United States, India, Japan and much of the Middle East. Both describe the same blood, so only the number on the screen changes.",
    ],
  ],
};

export default seo;
