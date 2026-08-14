const seo = {
  title: "Clinical Weight Converter: kg, g, lb oz and st lb",
  metaDescription:
    "Convert body weight with the exact 0.45359237 kg pound, using newborn 5 g, infant 10 g or adult 0.1 kg recording steps, with the shift shown in grams.",
  steps: [
    "Set \"How the weight was recorded\" to Kilograms, Grams, Pounds (decimal), Pounds and ounces, or Stones and pounds.",
    "Type the reading into the field or pair of fields that appears, then pick a Recording precision: No rounding — exact value, Newborn — nearest 5 g, Infant under 1 year — nearest 10 g, or Child or adult — nearest 0.1 kg.",
    "Read all five formats side by side plus \"Exact value before rounding\" and \"Shift caused by rounding\" in grams, then press Copy result.",
  ],
  intro:
    "The Clinical Weight Converter changes a body weight between kilograms, grams, decimal pounds, pounds-and-ounces and stones-and-pounds using the exact international pound of 0.45359237 kg and the 14-pound stone. It also applies the recording step that matches the age group — nearest 5 g for a newborn, nearest 10 g for an infant, nearest 0.1 kg for a child or adult — and shows how many grams that rounding moved the figure. It is aimed at anyone filling in a clinical form, a growth chart or a dosing calculation where the units on the scale and on the paperwork differ.",
  useCases: [
    "Convert a birth weight reported as 7 lb 8 oz into the 3.4 kg figure a growth chart expects.",
    "Turn a UK 11 st 4 lb reading into 71.7 kg for a weight-based drug dose.",
    "Record a neonatal scale reading of 3437 g at the nearest 5 g used on the ward chart.",
    "Check how much a 0.1 kg rounding step shifts a figure before using it in a mg/kg calculation.",
  ],
  benefits: [
    ["Exact pound", "Uses 0.45359237 kg rather than a 2.2 shortcut, which drifts by grams on infant weights."],
    ["Age-appropriate precision", "Separate rounding steps for newborns, infants and everyone else, with the shift shown in grams."],
    ["Every clinical format", "Decimal kilograms, grams, decimal pounds, pounds-and-ounces and stones-and-pounds side by side."],
  ],
  faqs: [
    [
      "How do I convert pounds to kilograms exactly?",
      "Multiply pounds by 0.45359237, the exact definition of the international avoirdupois pound. Dividing by 2.2 instead is about 0.2 percent out — small for an adult, but roughly 7 g on a newborn weight, which matters on a growth chart.",
    ],
    [
      "What is 7 lb 8 oz in kilograms?",
      "3.402 kg, which is recorded as 3.40 kg at the nearest 10 g used for infants. An ounce is exactly one sixteenth of a pound, so 8 oz is 0.5 lb.",
    ],
    [
      "How many kilograms is a stone?",
      "One stone is 14 pounds, which is 6.35029318 kg exactly. So 11 st 4 lb is 158 lb, or 71.67 kg, recorded as 71.7 kg at the usual adult precision.",
    ],
    [
      "How precisely should a weight be recorded?",
      "Newborn weights are normally recorded to the nearest 5 or 10 grams, infants to the nearest 10 grams on WHO-style growth charts, and older children and adults to the nearest 0.1 kg. Match the precision to the chart or protocol you are filling in rather than copying every decimal a converter produces.",
    ],
  ],
};

export default seo;
