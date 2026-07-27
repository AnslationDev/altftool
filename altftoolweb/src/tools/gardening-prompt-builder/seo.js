const seo = {
  intro:
    "The Gardening Prompt Builder turns a bed size, a plant spacing and a sowing date into the numbers a growing plan actually needs — how many plants fit at square spacing, how many litres a week the bed needs at the standard 25 mm (1 inch) guideline, and the date maturity falls due — then writes an AI prompt around them. It also converts a USDA hardiness zone into its defined minimum-temperature band and warns when a tender crop is being sown before the last spring frost. For kitchen gardeners who want a plan tied to their plot, not to a generic article.",
  useCases: [
    "Find out that a 240 × 120 cm bed at 45 cm spacing holds exactly 10 cordon tomatoes, not the 15 you hoped.",
    "Check the harvest date before you sow, so a 75-day crop is not maturing the week you are away.",
    "Catch that a tender crop is going out 20 days before your last frost and needs starting indoors.",
    "Size a watering can routine: 2.88 m² at 25 mm a week is about 72 litres, rain included.",
  ],
  benefits: [
    ["Spacing done properly", "Whole plants only, along and across, so the count matches what will really fit."],
    ["Zone temperatures, not vibes", "Zone 7b resolves to its official 5 to 10 °F band rather than a vague description."],
    ["Frost check built in", "Sowing date against last frost date, with hardiness-aware warnings for tender and half-hardy crops."],
  ],
  faqs: [
    [
      "How many plants fit in a raised bed?",
      "At square spacing it is floor(bed length ÷ spacing) multiplied by floor(bed width ÷ spacing) — partial spaces do not count. A 240 × 120 cm bed at 45 cm spacing gives 5 along by 2 across, so 10 plants.",
    ],
    [
      "How much water does a vegetable bed need per week?",
      "The long-standing guideline is about 25 mm (1 inch) per week from rain and irrigation combined. Because 1 mm of depth over 1 m² is exactly 1 litre, that works out to 25 litres per square metre — roughly 72 litres a week for a 2.88 m² bed.",
    ],
    [
      "What does USDA hardiness zone 7b mean?",
      "Zone 7b means the average annual minimum winter temperature is between 5 and 10 °F (about −15 to −12 °C). Each whole zone spans 10 °F and the a/b halves split it into 5 °F bands; the zone describes winter cold only, not summer heat, rainfall or season length.",
    ],
    [
      "Can I sow tomatoes before the last frost?",
      "Not outdoors — tomatoes are tender and a single frost usually kills them, so plants go out only after the last spring frost date. You can start seed indoors roughly six to eight weeks earlier and transplant once nights are reliably above freezing.",
    ],
  ],
};

export default seo;
