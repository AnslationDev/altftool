const seo = {
  title: "Haemoglobin Unit Converter: g/dL, g/L and mmol/L",
  metaDescription:
    "Convert haemoglobin between g/dL, g/L and mmol/L (×0.6206) and check it against WHO anaemia thresholds by age, sex, pregnancy and altitude.",
  steps: [
    "Type the \"Haemoglobin result\" and pick the \"Unit on the report\" — g/dL, g/L or mmol/L.",
    "Choose a group under \"Who is the result for?\" and, if you live above 1,000 m, fill in \"Altitude of residence in metres\".",
    "Read the value in all three units, the WHO anaemia threshold for your group and the result band, then click \"Copy result\".",
  ],
  intro:
    "The Haemoglobin Unit Converter changes a haemoglobin result between g/dL, g/L and mmol/L, using the exact 10× relationship between g/dL and g/L and the SI factor of 0.6206 mmol/L per g/dL, which comes from the 16,114.5 g/mol molar mass of the iron-carrying haemoglobin monomer. It then compares the value with the World Health Organization anaemia thresholds for the relevant age, sex and pregnancy group, and applies the WHO altitude adjustment above 1,000 metres.",
  useCases: [
    "Read a Dutch or Scandinavian report given as 8.7 mmol/L when your records are in g/dL.",
    "Convert a European result of 130 g/L into the 13.0 g/dL figure used in the US, UK and India.",
    "Check a pregnancy haemoglobin against the WHO threshold of 11.0 g/dL rather than the non-pregnant 12.0.",
    "Adjust a result taken in a city at 2,500 metres before comparing it with sea-level thresholds.",
  ],
  benefits: [
    ["Three units at once", "g/dL, g/L and mmol/L are shown together, so you never have to chain two conversions."],
    ["Group-specific thresholds", "Men, non-pregnant women, pregnant women and three childhood bands each have their own WHO cut-off."],
    ["Altitude handled properly", "Applies the published WHO adjustment table from 1,000 metres up, interpolating between listed elevations."],
  ],
  faqs: [
    [
      "How do you convert haemoglobin from g/dL to mmol/L?",
      "Multiply by 0.6206. So 14 g/dL is 8.7 mmol/L and 12 g/dL is 7.45 mmol/L. Divide by 0.6206 to convert mmol/L back to g/dL. The factor is based on the haemoglobin monomer, which is why it differs from the factors used for other blood tests.",
    ],
    [
      "What haemoglobin level counts as anaemia?",
      "Using WHO thresholds at sea level: below 13.0 g/dL (130 g/L) for men aged 15 and over, below 12.0 g/dL (120 g/L) for non-pregnant women aged 15 and over, and below 11.0 g/dL (110 g/L) in pregnancy and in children aged 6 to 59 months. Individual laboratory reference intervals may differ slightly.",
    ],
    [
      "Is g/dL the same as g/L?",
      "No — g/L is exactly ten times the g/dL number, because a decilitre is a tenth of a litre. A haemoglobin of 13.5 g/dL is 135 g/L. Mixing the two is the most common misreading of a full blood count from another country.",
    ],
    [
      "Why is haemoglobin adjusted for altitude?",
      "Lower oxygen pressure at height stimulates red cell production, so healthy people living at altitude run higher haemoglobin. WHO therefore subtracts a published amount before applying the anaemia thresholds — about 0.2 g/dL at 1,000 metres, 1.3 g/dL at 2,500 metres and 3.5 g/dL at 4,000 metres. Without that adjustment, anaemia at altitude is missed.",
    ],
  ],
};

export default seo;
