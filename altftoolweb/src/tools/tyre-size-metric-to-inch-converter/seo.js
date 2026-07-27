const seo = {
  intro:
    "The two tyre sizing systems describe the same rubber in different terms, and this converter moves between them exactly. A metric size such as 205/55R16 gives section width in millimetres, sidewall height as a percentage of that width, and rim diameter in inches, so overall diameter is rim × 25.4 + 2 × (width × aspect ÷ 100). An inch or flotation size such as 31x10.50R15 states overall diameter and width directly in inches, from which aspect ratio falls out as (diameter − rim) ÷ 2 ÷ width. Enter either and you get the other, plus rolling circumference, revolutions per kilometre and the speedometer error against your factory size.",
  useCases: [
    "Your SUV came with 265/70R17 and the off-road tyre you want is listed only as 31x10.50R15 — you need them in the same language to compare.",
    "You are moving from 205/55R16 to 225/45R17 and want to confirm the overall diameter stays within the fitment window.",
    "Your speedometer has read optimistic since a tyre change and you want to know the true speed when the dial shows 100.",
  ],
  benefits: [
    ["Both directions, exactly", "Uses the exact 25.4 mm inch, so a converted size matches the manufacturer's published dimensions rather than a rounded approximation."],
    ["Speedometer and odometer error", "Shows the true speed at any indicated reading and how many kilometres the odometer displays over 100 real ones."],
    ["Fitment window checked", "Flags a change that moves overall diameter beyond about 3% of stock, where ABS and stability-control calibration start to drift."],
  ],
  faqs: [
    [
      "How do I convert 205/55R16 to inches?",
      "Sidewall height is 205 × 0.55 = 112.75 mm, and the 16-inch rim is 406.4 mm, so overall diameter is 406.4 + 2 × 112.75 = 631.9 mm, or 24.9 inches. Section width is 205 ÷ 25.4 = 8.07 inches, making the flotation equivalent roughly 24.9x8.07R16.",
    ],
    [
      "What does 31x10.50R15 mean?",
      "31 inches overall diameter, 10.50 inches section width, on a 15-inch rim. The sidewall is (31 − 15) ÷ 2 = 8 inches, which against a 10.50-inch width is a 76% aspect ratio — so the nearest metric size is about 267/76R15, commonly sold as 265/75R15.",
    ],
    [
      "How much can I change tyre size without affecting the speedometer?",
      "Keep the overall diameter within about 3% of the factory size. A speedometer is calibrated to the original tyre's rolling circumference, so a diameter 3% larger makes you travel 3% faster than the dial says — 103 km/h when it reads 100 — and makes the odometer under-record by the same proportion.",
    ],
    [
      "Does a wider tyre always have a bigger overall diameter?",
      "No, and that is the point of plus-sizing. Going from 205/55R16 to 225/45R17 adds 20 mm of width and an inch of rim but cuts the aspect ratio, so overall diameter changes by only about 2 mm — under half a percent. Width and diameter are independent as long as the aspect ratio moves to compensate.",
    ],
  ],
};

export default seo;
