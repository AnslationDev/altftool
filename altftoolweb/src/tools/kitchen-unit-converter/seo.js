const seo = {
  title: "Kitchen Unit Converter: Cups, Grams, ml, °F to °C",
  metaDescription:
    "Convert recipe weights, volumes and oven temperatures — US cups (236.588 ml), oz to grams, °F to °C — plus cup-to-gram ingredient equivalents.",
  steps: [
    "Pick the Weight, Volume or Temperature tab and type a number into 'Amount to Convert'.",
    "Choose the 'From' and 'To' units — such as Grams (g) to Ounces (oz), or Cups (US) to Milliliters (ml) — or hit the swap arrow between them; the Result recomputes on every change, rounded to 4 decimal places.",
    "Read the Result panel, click 'Copy' to copy the number, or 'Save to History' to keep it in the Recent Conversions list.",
  ],
  intro:
    "The Kitchen Unit Converter handles the three conversions recipes actually need — weight, volume and oven temperature — using US customary measures, where one cup is 236.588 ml, one tablespoon is 14.79 ml and one teaspoon is 4.93 ml. Weight moves through grams (1 oz = 28.3495 g, 1 lb = 453.592 g) and temperature uses the exact Celsius-to-Fahrenheit formula, °F = °C × 9/5 + 32. It is for anyone cooking from a recipe written in units their kitchen scale, jug or oven does not speak.",
  useCases: [
    "You are following an American baking recipe with cups and °F, and your scale reads grams and your oven dial is in Celsius.",
    "A recipe calls for 4 oz of an ingredient and you need it in grams before you can weigh it out accurately.",
    "You have halved a recipe and ended up with an awkward figure like 3.5 tbsp that you want expressed in millilitres.",
  ],
  benefits: [
    ["Covers the three kitchen conversions", "Weight, volume and temperature in one place, each with the units recipes actually use rather than a general-purpose unit list."],
    ["Exact factors, not rounded ones", "Conversions use the full values — 28.3495 g per ounce, 29.5735 ml per fluid ounce — and results are given to four decimal places before you round for the kitchen."],
    ["Ingredient equivalents alongside", "A reference panel gives the cup-to-gram weights that vary by ingredient, such as 120 g for a cup of all-purpose flour against 200 g for granulated sugar."],
  ],
  faqs: [
    [
      "How many grams is a cup of flour?",
      "About 120 g for all-purpose flour, but the figure is ingredient-specific: a cup of granulated sugar is around 200 g and packed brown sugar around 220 g. A cup is a volume, so its weight depends on the density of what fills it — which is why the tool lists these equivalents separately from the volume conversions.",
    ],
    [
      "Is a cup here the US cup or the metric cup?",
      "The US customary cup, 236.588 ml. A metric cup is 250 ml and an imperial cup is about 284 ml, so a recipe written in Australian or older British cups will be roughly 6 to 20 percent larger than the value shown here.",
    ],
    [
      "How do I convert an oven temperature from Fahrenheit to Celsius?",
      "Subtract 32 and multiply by 5/9, which is the formula used here: 350°F comes out at 176.67°C, usually set as 180°C, and 400°F is 204.44°C, usually set as 200°C. Round to the nearest mark your oven dial actually offers.",
    ],
    [
      "Can it convert cups directly to grams?",
      "No, and no converter can do it correctly without knowing the ingredient, because volume-to-weight depends on density. Use the volume tab for liquids, the weight tab for weights, and the equivalents panel when you need to cross between the two for flour, sugar or butter.",
    ],
  ],
};

export default seo;
