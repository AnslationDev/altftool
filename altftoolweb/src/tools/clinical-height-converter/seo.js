const seo = {
  title: "Clinical Height Converter: cm to Feet, Inches, m²",
  metaDescription:
    "Convert height between cm, m, total inches and feet-and-inches on the exact 2.54 cm inch, with height squared for BMI and the rounding shift.",
  intro:
    "The Clinical Height Converter changes a height between centimetres, metres, total inches and feet-and-inches using the exact international inch of 2.54 cm, so a foot is exactly 30.48 cm. It applies the recording step your chart uses — 0.1 cm on a stadiometer, or half and whole centimetres on many forms — reports how far that rounding moved the value, and gives the height squared in square metres that a BMI calculation needs. It is for filling in medical forms, growth charts and dosing calculations where the units differ from the ones on the measuring device.",
  useCases: [
    "Convert a 5 ft 11 in height on a US form into the 180.34 cm a metric record expects.",
    "Get the height squared in square metres before calculating BMI by hand.",
    "Record a stadiometer reading to the nearest 0.1 cm for a paediatric growth chart.",
    "Check how much rounding to the nearest whole centimetre shifts a height used in a body surface area formula.",
  ],
  benefits: [
    ["Exact inch", "Uses 2.54 cm rather than 2.5, which drifts by nearly 3 cm across an adult height."],
    ["Carry handled", "Feet-and-inches output rolls 11.98 in up to the next whole foot instead of printing 12 in."],
    ["BMI ready", "Shows metres and metres squared alongside, so the BMI denominator does not need a second calculation."],
  ],
  faqs: [
    [
      "How do I convert cm to feet and inches?",
      "Divide centimetres by 2.54 to get total inches, then divide by 12 for whole feet and keep the remainder as inches. 170 cm is 66.93 inches, which is 5 feet 6.9 inches.",
    ],
    [
      "What is 5 foot 11 in centimetres?",
      "180.34 cm. Five feet is 60 inches, plus 11 makes 71 inches, and 71 × 2.54 = 180.34 cm exactly.",
    ],
    [
      "Why does BMI need height in metres?",
      "BMI is weight in kilograms divided by height in metres squared. A height of 170 cm becomes 1.70 m, and 1.70² = 2.89 m², so a 70 kg adult has a BMI of 70 ÷ 2.89 = 24.2.",
    ],
    [
      "Is lying length the same as standing height?",
      "No. Recumbent length, used for children under two, typically measures a few millimetres to about a centimetre longer than standing height because the spine is not compressed. Growth charts have separate reference curves, so record which method was used.",
    ],
  ],
};

export default seo;
