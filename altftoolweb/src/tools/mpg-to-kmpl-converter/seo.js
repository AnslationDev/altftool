const seo = {
  title: "MPG to km/l Converter – US & UK mpg, l/100 km",
  metaDescription:
    "Convert US or imperial mpg, km/l, mi/l and l/100 km with exact gallon and mile definitions, plus fuel cost per km and per 100 km at your pump price.",
  steps: [
    "Type the number in 'Fuel economy figure' and pick its unit in 'Unit of that figure' — US mpg, imperial mpg, km/l, miles per litre or litres per 100 km.",
    "Set 'Fuel price per litre (for cost figures)' to price the economy at your own pump rate.",
    "Read the km/l headline plus every equivalent — US and UK mpg, mi/l, l/100 km, cost per km and per 100 km — and press 'Copy result'.",
  ],
  intro:
    "This converter translates fuel economy between US mpg, imperial mpg, km/l, miles per litre and litres per 100 km using exact unit definitions — 1 mile = 1.609344 km, 1 US gallon = 3.785411784 litres, 1 imperial gallon = 4.54609 litres. It handles the fact that km/l and mpg are distance-per-fuel (higher is better) while l/100 km is fuel-per-distance (lower is better), so the two families are reciprocals. Useful when a review quotes mpg, a brochure quotes km/l and a European spec sheet quotes l/100 km.",
  useCases: [
    "Reading a US car review that quotes 32 mpg and wanting the km/l equivalent",
    "Comparing an Indian brochure figure in km/l against a European l/100 km rating",
    "Converting a UK magazine's mpg figure without mistaking it for the US number",
  ],
  benefits: [
    ["Exact definitions", "Uses the legal gallon and mile values, not rounded shortcuts."],
    ["Both gallons handled", "Keeps US and imperial mpg separate so you never compare the wrong one."],
    ["Cost attached", "Adds fuel cost per km and per 100 km at your pump price."],
  ],
  faqs: [
    [
      "How do I convert mpg to kmpl?",
      "Multiply US mpg by 0.425144 to get km/l, or divide by 2.352146. So 30 US mpg is 12.75 km/l. For imperial mpg the multiplier is 0.354006, because a UK gallon holds 4.54609 litres against the US gallon's 3.785412.",
    ],
    [
      "Is US mpg the same as UK mpg?",
      "No. An imperial gallon is about 20.1% larger than a US gallon, so the same car scores about 20% higher in UK mpg. 30 US mpg is 36.0 UK mpg — quoting one for the other overstates or understates efficiency by a fifth.",
    ],
    [
      "How do I convert km/l to litres per 100 km?",
      "Divide 100 by the km/l figure, since the two units are reciprocals. 20 km/l is 100 ÷ 20 = 5.0 l/100 km, and 12.75 km/l is 7.84 l/100 km.",
    ],
    [
      "Which unit is best for comparing running cost?",
      "Litres per 100 km scales linearly with fuel spend, so a 1 l/100 km improvement is worth the same money whether the car is thirsty or frugal. With mpg or km/l the same numerical gain matters far more at the low end — going from 10 to 12 km/l saves much more fuel than going from 20 to 22.",
    ],
  ],
};

export default seo;
