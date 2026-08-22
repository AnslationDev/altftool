const seo = {
  title: "Celsius, Fahrenheit & Kelvin Converter",
  metaDescription:
    "Type one temperature and read Celsius, Fahrenheit and Kelvin together, using °F = °C×9/5+32 and K = °C+273.15, rounded to two decimal places.",
  steps: [
    "Enter a value in the Temperature field and pick Celsius (°C), Fahrenheit (°F) or Kelvin (K) from the 'Convert From' menu.",
    "The Result updates as you type: the input is first normalised to Celsius, then °F = °C × 9/5 + 32 and K = °C + 273.15 are applied.",
    "Read all three scales side by side, each rounded to two decimal places; press Copy to copy inputs and results, or Reset to restore the defaults.",
  ],
  intro:
    "Enter one temperature and this converter shows the equivalent in Celsius, Fahrenheit and Kelvin at the same time, using the exact definitions °F = °C x 9/5 + 32 and K = °C + 273.15. Whichever unit you pick as the source, the value is first normalised to Celsius and then expressed in all three scales, each rounded to two decimal places. It is aimed at anyone reading a foreign weather forecast, an oven recipe or a lab value and needing the number in a scale they think in.",
  useCases: [
    "You are following an American recipe that says 350 °F and your oven dial is in Celsius, so you need the setting before the dough over-proves",
    "You are checking a fever reading someone sent you as 38.6 °C against the 100.4 °F threshold you grew up with",
    "You are writing up a physics or chemistry lab and need a reaction temperature recorded in Celsius restated in Kelvin for the calculation",
  ],
  benefits: [
    ["All three scales at once", "Type once and read Celsius, Fahrenheit and Kelvin side by side instead of running two separate conversions."],
    ["Exact definitions, not approximations", "It uses the 9/5 ratio and the 273.15 offset rather than the 'double it and add 30' shortcut, so results hold up in coursework and lab notes."],
    ["Handles negatives and sub-zero values", "Below-freezing inputs and negative Fahrenheit values convert correctly, including the point where the two scales meet."],
  ],
  faqs: [
    [
      "What is the formula for Fahrenheit to Celsius?",
      "°C = (°F - 32) x 5/9. Subtract 32 first, then multiply by 5/9 — doing it in the other order is the single most common mistake. Going the other way, °F = °C x 9/5 + 32.",
    ],
    [
      "How do I convert Celsius to Kelvin?",
      "Add 273.15. Kelvin uses the same degree size as Celsius, so only the zero point moves: 0 °C is 273.15 K, and 100 °C is 373.15 K. There is no 'degrees' sign on Kelvin — it is written as K.",
    ],
    [
      "At what temperature are Celsius and Fahrenheit the same?",
      "-40. Minus 40 °C equals minus 40 °F, the one point where the two scales cross, which makes it a handy sanity check on any conversion tool.",
    ],
    [
      "What is normal body temperature in Fahrenheit and Celsius?",
      "The long-standing reference is 37 °C, which is 98.6 °F. Healthy readings vary by person, time of day and measurement site, and clinical fever is usually defined at or above 38 °C (100.4 °F) — treat the conversion as arithmetic and a clinician's judgement as the medical part.",
    ],
  ],
};

export default seo;
