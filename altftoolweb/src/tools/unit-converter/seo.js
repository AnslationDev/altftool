const seo = {
  title: "Unit Converter — Length, Weight & Temperature",
  h1: "Unit Converter",
  metaDescription:
    "Free unit converter for length, weight and temperature — 17 units, live results as you type, exact factors (1 in = 0.0254 m). Runs in your browser.",
  intro:
    "The Unit Converter handles 17 units across three categories — length, weight and temperature — by normalising every value to a base unit (metres for length, kilograms for weight) with an exact conversion-factor table, then dividing into the target unit. Temperature is handled separately: every value is pivoted through Celsius using (°F − 32) × 5/9 and K − 273.15. The factors are the exact international definitions — 1 in = 0.0254 m, 1 ft = 0.3048 m, 1 mi = 1609.344 m, 1 lb = 0.45359237 kg — and all of the arithmetic runs in JavaScript on your own device, with no server call.",
  useCases: [
    "Converting cm to inches, kg to pounds, or Celsius to Fahrenheit and back while you type",
    "Checking metric-to-imperial figures for recipes, shipping weights, travel distances or build measurements",
    "Keeping a short running log of the conversions you need again, then exporting it as a .txt file",
  ],
  benefits: [
    [
      "Exact standard factors",
      "Built on the international definitions — 1 in = 0.0254 m, 1 yd = 0.9144 m, 1 mi = 1609.344 m, 1 lb = 0.45359237 kg, 1 oz = 0.028349523125 kg — not rounded approximations.",
    ],
    [
      "Live results to six decimals",
      "The output updates on every keystroke and is shown to six decimal places with trailing zeros stripped, so 2.54 cm reads as 1 in rather than 1.000000.",
    ],
    [
      "One-click swap",
      "The swap button reverses the two units and moves the current result into the input box, so you can chain a conversion straight back the other way.",
    ],
    [
      "Free, no signup, nothing uploaded",
      "Every calculation runs in your browser. History is written only to your own browser's localStorage and can be deleted at any time.",
    ],
  ],
  faqs: [
    [
      "how do i convert cm to inches",
      "Divide centimetres by 2.54, since an inch is defined as exactly 0.0254 m. In the tool, choose Length, set From to Centimeter and To to Inch, and the answer appears as you type — 30 cm returns 11.811024 in.",
    ],
    [
      "how many pounds is 1 kg",
      "2.204623 lb as this converter displays it, from 1 ÷ 0.45359237 rounded to six decimals. Pick Weight, set From to Kilogram and To to Pound, and any value converts the same way.",
    ],
    [
      "what is the formula for fahrenheit to celsius",
      "(°F − 32) × 5 ÷ 9. The converter applies exactly that, routing every temperature through Celsius first, so Fahrenheit to Kelvin becomes (°F − 32) × 5/9 + 273.15. Entering 98.6 °F returns 37 °C.",
    ],
    [
      "what units does this unit converter support",
      "17 units in three categories: length (metre, kilometre, centimetre, millimetre, inch, foot, yard, mile), weight (kilogram, gram, milligram, pound, ounce, metric ton) and temperature (Celsius, Fahrenheit, Kelvin).",
    ],
    [
      "is this unit converter free",
      "Yes — free, with no signup and no usage limit. The conversion maths runs in JavaScript in your browser, so no value you type is sent to a server.",
    ],
    [
      "how many decimal places does the converter show",
      "Up to six. Results are calculated in full double-precision floating point and rendered to six decimal places, then trailing zeros are trimmed — so a clean result shows as 1, and 11.811023622 shows as 11.811024.",
    ],
    [
      "does it save my conversion history",
      "Yes, but only on your own device. Save to History stores up to the 10 most recent conversions in your browser's localStorage; a near-identical repeat (same units and a value within 0.0001) is skipped, and Clear All History removes everything.",
    ],
    [
      "can i copy or download the conversion result",
      "Yes. Copy result places a labelled block — category, from value, to value and timestamp — on your clipboard, Download saves that same text as unit-conversion-result.txt, and Export History saves the full log as unit-converter-history.txt.",
    ],
  ],
  steps: [
    "Pick a category — Length, Weight or Temperature — then choose your From and To units.",
    "Type a value; the converted result appears instantly, to six decimal places.",
    "Copy it, download it as a .txt, or press Save to History to keep it for later.",
  ],
};

export default seo;
