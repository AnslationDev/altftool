const seo = {
  title: "Fever Temperature Converter: C, F, K by Measuring Site",
  metaDescription:
    "Convert a reading between Celsius, Fahrenheit and Kelvin, then check it against that site's fever threshold: 38.0 rectal, 37.8 oral, 37.2 armpit.",
  steps: [
    "Enter the Temperature reading and pick the Scale: Celsius (°C), Fahrenheit (°F) or Kelvin (K).",
    "Choose Where it was measured — Oral (under the tongue), Rectal, Ear (tympanic), Forehead (temporal artery) or Armpit (axillary).",
    "Read all three scales with the fever threshold for that site, your distance from it, the core-equivalent reading and a band from Hypothermia range to Hyperpyrexia.",
  ],
  intro:
    "The Fever Temperature Converter changes a thermometer reading between Celsius, Fahrenheit and Kelvin with the exact formulas °F = °C × 9/5 + 32 and K = °C + 273.15, then compares it against the fever threshold for the site it was taken from. Because those thresholds differ — 38.0 °C (100.4 °F) rectal or ear, 37.8 °C (100.0 °F) oral, 37.2 °C (99.0 °F) armpit — the same number can mean fever at one site and not another. It is written for parents and carers translating between a thermometer, a leaflet and a doctor who uses the other scale.",
  useCases: [
    "Translate a 101.2 °F reading from an American guide into the Celsius figure an Indian or UK doctor expects.",
    "Check whether an armpit reading of 37.4 °C already counts as fever once the site is taken into account.",
    "Compare an ear reading taken this morning with an oral reading taken tonight on the same core scale.",
    "Confirm the exact Celsius value of the 100.4 °F threshold quoted in infant fever advice.",
  ],
  benefits: [
    ["Site-aware", "Uses the published fever threshold for oral, rectal, ear, forehead and armpit readings instead of one number for all."],
    ["Three scales at once", "Celsius, Fahrenheit and Kelvin from a single entry, with the core-equivalent figure alongside."],
    ["Clear safety framing", "Names the hypothermia and hyperpyrexia bands and when to seek urgent care rather than guessing."],
  ],
  faqs: [
    [
      "What temperature counts as a fever?",
      "A core or rectal temperature of 38.0 °C (100.4 °F) or higher is the standard definition of fever. The equivalent thresholds are about 37.8 °C (100.0 °F) taken orally and 37.2 °C (99.0 °F) under the arm, because those sites read lower than core.",
    ],
    [
      "How do I convert Fahrenheit to Celsius for a fever?",
      "Subtract 32 and multiply by 5/9. So 100.4 °F is 38.0 °C, 101.3 °F is 38.5 °C and 104 °F is 40 °C. Going the other way, multiply Celsius by 9/5 and add 32.",
    ],
    [
      "Is an armpit temperature accurate?",
      "It is the least reliable of the common sites and typically reads about 0.5–0.8 °C below core, which is why its fever threshold is 37.2 °C rather than 38.0 °C. Use it as a screen and confirm anything borderline with an oral, ear or rectal reading.",
    ],
    [
      "When should a fever be treated as an emergency?",
      "Seek urgent care for any fever in a baby under three months, for a core temperature at or above 41 °C (105.8 °F), or at any temperature if there is a stiff neck, a rash that does not fade under pressure, difficulty breathing, a seizure, severe drowsiness or dehydration. This tool is informational and does not replace assessment by a clinician.",
    ],
  ],
};

export default seo;
