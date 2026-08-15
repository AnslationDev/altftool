const seo = {
  title: "Pantry Expiry Tracker – USDA FoodKeeper Shelf Life",
  metaDescription:
    "List fridge, freezer and cupboard items, sort by days left with USDA FoodKeeper shelf lives, and see the money at risk in your reminder window.",
  steps: [
    "Set 'Today's date' and 'Remind me this many days ahead', then click 'Add item' and give each food a Name, 'Food type', 'Stored in' location and 'Use by' date.",
    "Press 'Use FoodKeeper shelf life' to fill the use-by date from USDA storage times for that food and location, and add Quantity and 'Unit cost (INR)' to price it.",
    "Read 'Items needing attention', the 'Use-first order' table sorted by days left, and the value at risk or already lost, then click 'Copy list'.",
  ],
  intro:
    "The Pantry Expiry Tracker sorts everything in your kitchen by days remaining and tells you what to cook first, using the storage times published in the USDA FoodKeeper database maintained by the Food Safety and Inspection Service. It also prices the problem: the value of food expiring inside your reminder window, and the value already lost. Built for anyone who keeps finding forgotten spinach at the back of the fridge.",
  useCases: [
    "Plan a week of meals around the four things that expire soonest instead of shopping again.",
    "Check whether the chicken bought yesterday is still safe: FoodKeeper allows raw poultry only 1 to 2 days in the refrigerator.",
    "Show a household exactly how much money went in the bin last month as a share of total pantry value.",
  ],
  benefits: [
    ["Real storage times", "Shelf life comes from USDA FoodKeeper, using the conservative end of each range so warnings come early."],
    ["Money, not just dates", "Adds up the value expiring inside your reminder window so waste stops being abstract."],
    ["Fridge, freezer and cupboard", "Each food knows which locations are valid — shell eggs, for example, are blocked from the freezer."],
  ],
  faqs: [
    [
      "How long does cooked food last in the fridge?",
      "Three to four days at 4 °C or below, per USDA FoodKeeper and FSIS guidance. This tracker uses three days so leftovers are flagged before the limit, and shows 2 to 6 months if you freeze them instead.",
    ],
    [
      "How long can raw chicken stay in the refrigerator?",
      "One to two days. That is far shorter than most people assume, which is why raw poultry is the food most often flagged red here; frozen at −18 °C, chicken pieces keep about 9 months.",
    ],
    [
      "Does a use-by date mean the food is unsafe after that day?",
      "A use-by date is a safety date and should be respected for perishable foods; a best-before date is about quality, and the food is often still safe afterwards. This tool warns on the date you enter — it does not override what is printed on the pack.",
    ],
    [
      "Is my pantry list uploaded anywhere?",
      "No. Every item, date and price stays in your browser tab and is calculated locally. Use the copy button to move the list into notes or a shopping app.",
    ],
  ],
};

export default seo;
