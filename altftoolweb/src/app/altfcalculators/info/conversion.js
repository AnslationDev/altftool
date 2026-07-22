const info = {
  "length-converter": {
    intro: [
      "The length converter changes a distance from one unit to another — metric (mm, cm, m, km) and imperial/US (inch, foot, yard, mile) — instantly as you type.",
      "Every unit is defined by an exact factor: how many metres it equals. The tool converts your value to metres first, then to the target unit, so results are accurate in both directions.",
    ],
    formula: {
      expression: "result = value × (factorFrom ÷ factorTo)",
      where: [
        ["value", "the number you enter"],
        ["factorFrom", "metres in one 'from' unit"],
        ["factorTo", "metres in one 'to' unit"],
      ],
      note: "Exact definitions: 1 in = 0.0254 m, 1 ft = 0.3048 m, 1 yd = 0.9144 m, 1 mi = 1609.344 m.",
    },
    howToUse: [
      "Type the value you want to convert.",
      "Pick the unit you are converting from and the unit you want.",
      "Read the highlighted result; the grid shows the same value in every other unit.",
      "Use the swap button to reverse the direction.",
    ],
    goodToKnow: [
      "The inch has been defined as exactly 25.4 mm worldwide since 1959.",
      "1 mile = 1760 yards = 5280 feet = 1609.344 metres.",
      "1 kilometre ≈ 0.621371 miles; 1 mile ≈ 1.609 km.",
    ],
    faqs: [
      { q: "Is a US foot the same as a metric foot?", a: "There is no metric foot. The international foot used here is exactly 0.3048 m and is standard in both the US and UK for everyday measurement." },
      { q: "How many centimetres are in an inch?", a: "Exactly 2.54 cm, because 1 inch = 25.4 mm by definition." },
      { q: "Why convert through metres?", a: "Using a single base unit (the metre) keeps every conversion consistent and avoids rounding errors that pile up when converting unit-to-unit directly." },
    ],
  },

  "weight-converter": {
    intro: [
      "The weight converter switches a mass between metric units (mg, g, kg, tonne) and imperial/US units (ounce, pound, stone), updating live as you type.",
      "Strictly these are units of mass, not weight (force), but 'weight' is the everyday term. Each unit is defined by how many grams it equals, so conversions stay exact both ways.",
    ],
    formula: {
      expression: "result = value × (factorFrom ÷ factorTo)",
      where: [
        ["value", "the number you enter"],
        ["factorFrom", "grams in one 'from' unit"],
        ["factorTo", "grams in one 'to' unit"],
      ],
      note: "Exact definitions: 1 oz = 28.349523125 g, 1 lb = 453.59237 g, 1 stone = 14 lb = 6350.29318 g.",
    },
    howToUse: [
      "Enter the mass you want to convert.",
      "Choose the 'from' unit and the 'to' unit.",
      "Read the highlighted result and the full breakdown grid.",
      "Tap swap to convert the other way.",
    ],
    goodToKnow: [
      "1 kilogram ≈ 2.20462 pounds; 1 pound ≈ 0.453592 kg.",
      "A metric tonne is 1000 kg; a US 'short ton' (2000 lb ≈ 907 kg) and UK 'long ton' are different and not included here.",
      "The stone (14 lb) is still commonly used for body weight in the UK and Ireland.",
    ],
    faqs: [
      { q: "Is mass the same as weight?", a: "Not exactly — mass is the amount of matter (kg), while weight is the force gravity exerts on it. On Earth the two track each other, so the terms are used interchangeably in daily life." },
      { q: "How many grams are in a pound?", a: "Exactly 453.59237 grams, which is the international definition of the avoirdupois pound." },
      { q: "Does this use troy ounces?", a: "No. The ounce here is the avoirdupois ounce (28.35 g) used for food and general goods, not the troy ounce (31.10 g) used for precious metals." },
    ],
  },

  "temperature-converter": {
    intro: [
      "The temperature converter translates a reading between Celsius (°C), Fahrenheit (°F) and Kelvin (K). Unlike length or weight, temperature scales do not share a zero point, so conversion is not a simple multiply.",
      "The tool converts your input to Celsius first, then to the target scale, so any pair of units converts correctly.",
    ],
    formula: {
      expression: "°F = °C × 9/5 + 32   •   K = °C + 273.15",
      where: [
        ["°C", "temperature in Celsius"],
        ["°F", "temperature in Fahrenheit"],
        ["K", "temperature in Kelvin"],
      ],
      note: "Reverse: °C = (°F − 32) × 5/9 and °C = K − 273.15.",
    },
    howToUse: [
      "Enter the temperature value (it can be negative).",
      "Select the scale you are converting from and to.",
      "Read the result plus the equivalent in all three scales.",
      "Use swap to reverse the conversion.",
    ],
    goodToKnow: [
      "Water freezes at 0 °C = 32 °F = 273.15 K and boils at 100 °C = 212 °F = 373.15 K at sea level.",
      "−40 °C equals −40 °F — the one point where the two scales meet.",
      "Kelvin has no negative values: 0 K (absolute zero) is the coldest possible temperature, −273.15 °C.",
    ],
    faqs: [
      { q: "Why can't I just multiply to convert temperatures?", a: "Because the scales have different zero points. Celsius and Fahrenheit are offset (0 °C = 32 °F), so you must scale and shift, not just scale." },
      { q: "Quick way to estimate °C to °F?", a: "Double the Celsius value and add 30 for a rough figure. For example 20 °C ≈ 70 °F (exact is 68 °F)." },
      { q: "Is a temperature difference the same in each scale?", a: "A change of 1 °C equals a change of 1 K, but equals 1.8 °F. So intervals convert differently from absolute readings." },
    ],
  },

  "speed-converter": {
    intro: [
      "The speed converter changes a rate of motion between metres per second (m/s), kilometres per hour (km/h), miles per hour (mph), knots and feet per second, updating live as you type.",
      "Each unit is defined by its value in metres per second, the SI base for speed, so every conversion is exact in both directions.",
    ],
    formula: {
      expression: "result = value × (factorFrom ÷ factorTo)",
      where: [
        ["value", "the number you enter"],
        ["factorFrom", "m/s in one 'from' unit"],
        ["factorTo", "m/s in one 'to' unit"],
      ],
      note: "Definitions: 1 km/h = 1/3.6 m/s, 1 mph = 0.44704 m/s, 1 knot = 0.514444 m/s, 1 ft/s = 0.3048 m/s.",
    },
    howToUse: [
      "Type the speed you want to convert.",
      "Pick the source and target units.",
      "Read the highlighted result and the grid of all units.",
      "Swap to reverse the direction.",
    ],
    goodToKnow: [
      "To convert m/s to km/h multiply by 3.6; to go back, divide by 3.6.",
      "1 knot = 1 nautical mile per hour ≈ 1.852 km/h, used in aviation and shipping.",
      "1 mph ≈ 1.60934 km/h, so a 60 mph speed limit is about 97 km/h.",
    ],
    faqs: [
      { q: "Why is a knot not the same as mph?", a: "A knot is one nautical mile per hour, and a nautical mile (1852 m) is longer than a statute mile (1609.344 m), so 1 knot ≈ 1.15 mph." },
      { q: "How do I convert km/h to m/s quickly?", a: "Divide by 3.6. For example 90 km/h ÷ 3.6 = 25 m/s." },
      { q: "What speed unit does physics use?", a: "The SI unit is metres per second (m/s), which is why this tool uses it as the base for every conversion." },
    ],
  },

  "area-converter": {
    intro: [
      "The area converter changes a surface measurement between metric units (mm², cm², m², hectare, km²) and imperial/US units (in², ft², yd², acre, mi²) — handy for real estate, land, flooring and mapping.",
      "Every unit is defined by how many square metres it equals, so the tool converts to m² first and then to your target unit for accurate results.",
    ],
    formula: {
      expression: "result = value × (factorFrom ÷ factorTo)",
      where: [
        ["value", "the number you enter"],
        ["factorFrom", "square metres in one 'from' unit"],
        ["factorTo", "square metres in one 'to' unit"],
      ],
      note: "Key definitions: 1 ft² = 0.09290304 m², 1 acre = 4046.8564224 m², 1 hectare = 10000 m².",
    },
    howToUse: [
      "Enter the area value.",
      "Choose the unit to convert from and the unit you want.",
      "Read the highlighted result and the grid showing every unit.",
      "Use swap to reverse the conversion.",
    ],
    goodToKnow: [
      "1 hectare = 10,000 m² ≈ 2.4711 acres; 1 acre = 43,560 ft² ≈ 4046.86 m².",
      "Area units scale as the square of length: 1 m = 100 cm, but 1 m² = 10,000 cm².",
      "1 square kilometre = 100 hectares = 1,000,000 m².",
    ],
    faqs: [
      { q: "How big is an acre?", a: "An acre is 43,560 square feet, about 4046.86 m², or roughly 90% of an American football field. It equals 0.4047 hectares." },
      { q: "Why isn't 1 m² equal to 100 cm²?", a: "Because area grows with the square of length. Since 1 m = 100 cm, 1 m² = 100 × 100 = 10,000 cm²." },
      { q: "Which acre does this use?", a: "The international acre (4046.8564224 m²). The US survey acre differs by a few parts per million and is not used here." },
    ],
  },

  "volume-converter": {
    intro: [
      "The volume converter switches a capacity between metric units (mL, L, cm³, m³) and US customary units (gallon, quart, pint, cup, fluid ounce, tablespoon, teaspoon), updating live as you type.",
      "Each unit is defined by how many litres it equals, so the tool converts to litres first and then to your chosen unit. All cooking and gallon units here are US measures.",
    ],
    formula: {
      expression: "result = value × (factorFrom ÷ factorTo)",
      where: [
        ["value", "the number you enter"],
        ["factorFrom", "litres in one 'from' unit"],
        ["factorTo", "litres in one 'to' unit"],
      ],
      note: "Definitions: 1 US gallon = 3.785411784 L, 1 US cup ≈ 0.2366 L, 1 m³ = 1000 L.",
    },
    howToUse: [
      "Type the volume you want to convert.",
      "Pick the source and target units.",
      "Read the highlighted result and the full unit grid.",
      "Tap swap to reverse the direction.",
    ],
    goodToKnow: [
      "1 US gallon = 4 quarts = 8 pints = 16 cups = 128 fluid ounces ≈ 3.785 L.",
      "1 cubic metre = 1000 litres; 1 millilitre = 1 cubic centimetre (cm³).",
      "US units differ from imperial: a US gallon (3.785 L) is smaller than an imperial gallon (4.546 L).",
    ],
    faqs: [
      { q: "Are these US or imperial gallons?", a: "US units. A US gallon is 3.785 L and a US fluid ounce is 29.57 mL; the imperial gallon (4.546 L) and imperial fluid ounce (28.41 mL) are different and not used here." },
      { q: "Is a millilitre the same as a cubic centimetre?", a: "Yes, 1 mL = 1 cm³ exactly. Both equal one-thousandth of a litre." },
      { q: "How many millilitres in a US teaspoon?", a: "About 4.93 mL. A US tablespoon is three teaspoons, roughly 14.79 mL." },
    ],
  },

  "data-storage-converter": {
    intro: [
      "The data storage converter changes a quantity of digital information between bits, bytes and their multiples in both decimal (KB, MB, GB, TB, PB) and binary (KiB, MiB, GiB, TiB) systems.",
      "It converts everything through bytes. Decimal units step by powers of 1000 (SI), while binary units step by powers of 1024 (IEC) — the distinction that explains why storage sizes never seem to match.",
    ],
    formula: {
      expression: "result = value × (factorFrom ÷ factorTo)",
      where: [
        ["value", "the number you enter"],
        ["factorFrom", "bytes in one 'from' unit"],
        ["factorTo", "bytes in one 'to' unit"],
      ],
      note: "1 byte = 8 bits. Decimal: 1 KB = 1000 B, 1 MB = 1000 KB. Binary: 1 KiB = 1024 B, 1 MiB = 1024 KiB.",
    },
    howToUse: [
      "Enter the amount of data.",
      "Select the unit to convert from and the unit you want.",
      "Read the highlighted result and the grid across all units.",
      "Swap to reverse the conversion.",
    ],
    goodToKnow: [
      "Drive makers advertise decimal units, so a '1 TB' disk (1,000,000,000,000 bytes) shows as about 931 GiB in operating systems that count in binary.",
      "1 byte = 8 bits, so network speeds in megabits (Mb) are one-eighth the equivalent in megabytes (MB).",
      "The IEC prefixes (KiB, MiB, GiB) exist specifically to remove ambiguity between the 1000 and 1024 conventions.",
    ],
    faqs: [
      { q: "Why does my '500 GB' drive show as ~465 GB?", a: "The maker counts 500 GB as 500 × 10⁹ bytes, but the OS reports binary gibibytes (2³⁰ bytes). 500 × 10⁹ ÷ 2³⁰ ≈ 465 GiB, which many systems still label 'GB'." },
      { q: "What is the difference between a bit and a byte?", a: "A bit is a single 0 or 1; a byte is 8 bits. File sizes use bytes (MB), while data-transfer rates often use bits (Mbps)." },
      { q: "KB or KiB — which is correct?", a: "Both are valid but mean different amounts: 1 KB = 1000 bytes (decimal), 1 KiB = 1024 bytes (binary). Use KiB/MiB/GiB when you need the exact binary value." },
    ],
  },

  "time-converter": {
    intro: [
      "The time converter changes a duration between milliseconds, seconds, minutes, hours, days, weeks, months and years, updating live as you type.",
      "Fixed units (second up to week) convert exactly. Because calendar months and years vary in length, this tool uses averages: a month of 30.4375 days and a year of 365.25 days, converted through seconds.",
    ],
    formula: {
      expression: "result = value × (factorFrom ÷ factorTo)",
      where: [
        ["value", "the number you enter"],
        ["factorFrom", "seconds in one 'from' unit"],
        ["factorTo", "seconds in one 'to' unit"],
      ],
      note: "1 day = 86,400 s, 1 week = 604,800 s, average month = 2,629,800 s, average year = 31,557,600 s.",
    },
    howToUse: [
      "Enter the duration you want to convert.",
      "Choose the source and target units.",
      "Read the highlighted result and the grid of all units.",
      "Use swap to reverse the direction.",
    ],
    goodToKnow: [
      "The average year here is 365.25 days (the Julian year); the average month is exactly one-twelfth of that, 30.4375 days.",
      "Real calendar months (28–31 days) and years (365 or 366 days) differ from these averages, so month/year results are approximate.",
      "1 hour = 3600 seconds; 1 day = 86,400 seconds; 1 week = 604,800 seconds.",
    ],
    faqs: [
      { q: "How long is a 'month' in this converter?", a: "An average of 30.4375 days (2,629,800 seconds), which is one-twelfth of a 365.25-day year. Actual months range from 28 to 31 days." },
      { q: "Why is a year 365.25 days?", a: "That average accounts for the leap day added roughly every four years, giving the Julian year of 365.25 days used for smooth conversions." },
      { q: "Are the smaller units exact?", a: "Yes. Milliseconds through weeks are fixed multiples of the second, so those conversions carry no approximation." },
    ],
  },

  "unit-converter": {
    intro: [
      "The all-in-one unit converter handles eight measurement types — length, weight, area, volume, temperature, speed, data and time — in a single tool. Pick a category and convert instantly as you type.",
      "Most categories are linear: each unit has a fixed factor relative to a base unit, so conversion is a single multiply and divide. Temperature is the exception and is handled through a Celsius base because its scales have different zero points.",
    ],
    formula: {
      expression: "linear: result = value × (factorFrom ÷ factorTo)",
      where: [
        ["value", "the number you enter"],
        ["factorFrom", "base units in one 'from' unit"],
        ["factorTo", "base units in one 'to' unit"],
      ],
      note: "Temperature is non-linear: °F = °C × 9/5 + 32 and K = °C + 273.15.",
    },
    howToUse: [
      "Choose a measurement type (length, weight, area, and so on).",
      "Enter your value and pick the 'from' and 'to' units.",
      "Read the highlighted result and the grid of every unit in that category.",
      "Switch category or swap units at any time.",
    ],
    goodToKnow: [
      "Each category converts through a single base unit (metre, gram, litre, byte, second, and so on) to keep results consistent.",
      "Area and volume scale with the square and cube of length respectively, so their factors grow faster than length factors.",
      "Volume and speed use US customary definitions where they differ from imperial (for example the US gallon).",
    ],
    faqs: [
      { q: "Why is temperature handled differently?", a: "Length or weight units share a zero point, so converting is just scaling. Temperature scales are offset (0 °C = 32 °F), so the tool must both scale and shift, converting via Celsius." },
      { q: "Can I convert between different measurement types?", a: "No — you can only convert within a category (length to length, mass to mass). Converting, say, litres to kilograms needs a substance density and is outside a pure unit converter." },
      { q: "Which system do the units use?", a: "Metric (SI) units alongside imperial/US customary. Where US and imperial differ, such as gallons, the US definition is used." },
    ],
  },
};

export default info;
