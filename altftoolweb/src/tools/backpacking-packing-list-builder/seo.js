const seo = {
  title: "Backpacking Weight Calculator and Packing List",
  metaDescription:
    "Enter nights, body weight and night low for base weight, food at 4.4 kcal/g, water at 1 kg/L, and a check against the 20% of body weight ceiling.",
  steps: [
    "Enter Nights out, Your body weight (kg), Expected night low (°C) and Daily energy target (kcal).",
    "Set Water carried between sources (L), Resupply every N days (0 = none) and Tent shared between, then tick the Conditions: Rain expected, Cooking on a stove, Trekking poles.",
    "Read Base weight (no food, water or fuel) against the 20% target for your body weight, plus Food carried, Water carried and Sleeping bag comfort rating, then press Copy list.",
  ],
  intro:
    "This builder treats a backpacking list as a weight budget rather than a checklist. It separates base weight — everything that is not eaten, drunk or burned — from consumables, sizes food by calorie density at the classic 125 kcal per ounce (4.4 kcal per gram), counts water at 1 kg per litre, and checks the loaded total against the 20%-of-body-weight carrying guideline. The sleep system is chosen from the expected night low using the ISO 23537 comfort rating rather than the survival limit printed on the label.",
  useCases: [
    "Find out whether a three-night trip with no resupply already breaks the 20% rule before you buy lighter gear.",
    "See how much weight a mid-trip resupply saves compared with carrying all the food from the trailhead.",
    "Work out the sleeping bag comfort rating a forecast low of 2 °C actually calls for.",
  ],
  benefits: [
    ["Base weight separated out", "Consumables shrink as you walk; base weight is the number you can actually change."],
    ["Food planned by energy", "Enter a daily calorie target and get grams, not a vague 'a kilo a day'."],
    ["Gear tied to the forecast", "Mid-layer, puffy, waterproofs and mat thickness all switch on from the night low."],
  ],
  faqs: [
    [
      "How much should my backpack weigh?",
      "The common guideline is no more than 20% of your body weight fully loaded, so 14 kg for a 70 kg hiker, and 10-15% if you are new to carrying a load or the terrain is steep. Food, water and fuel are usually a third of that, which is why they are counted separately here.",
    ],
    [
      "What is base weight in backpacking?",
      "Base weight is the weight of your pack with everything in it except consumables — no food, water or fuel. It is the number that stays the same on day one and day six, so it is the only part you can reduce by choosing different gear. Under 9 kg is generally called lightweight and under 4.5 kg ultralight.",
    ],
    [
      "How much food should I carry per day for backpacking?",
      "Plan by calories, then convert: at the standard target of 4.4 kcal per gram (125 kcal per ounce), a 3,000 kcal day weighs about 680 g. If your food bag weighs much more than that per day, it is carrying water — swap fresh items for dried ones rather than eating less.",
    ],
    [
      "How do I choose a sleeping bag temperature rating?",
      "Use the ISO 23537 comfort rating, not the extreme or limit figure, and pick one at or a few degrees below the expected overnight low. A bag whose comfort rating equals the forecast leaves no margin for a colder night, a damp bag or a tired body, so this tool suggests about 5 °C of headroom.",
    ],
  ],
};

export default seo;
