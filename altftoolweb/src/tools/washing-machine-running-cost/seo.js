const seo = {
  title: "Washing Machine Running Cost Per Wash Calculator",
  metaDescription:
    "Splits one cycle into electricity, water and detergent for front load, top load or semi automatic, from cold to a 90 °C boil wash, on your own tariffs.",
  steps: [
    "Choose front load, top load or semi automatic and set the rated capacity in kg and washes per week.",
    "Pick the wash programme from cold tap water up to a 90 °C boil wash, then enter your electricity, water and detergent tariffs.",
    "Read the cost per wash with water heating shown separately from drum energy, plus the monthly and yearly bill.",
  ],
  intro:
    "This calculator works out the true cost of one wash cycle by splitting it into the three things you actually pay for: the electricity the drum and heater consume, the water the machine draws, and the detergent you pour in. The energy side uses the standard heat equation — litres × 4.186 kJ per kg per °C × temperature rise ÷ 3600 — added to the mechanical energy of the drum, pump and spin, which is why raising the programme from cold to 60 °C multiplies the bill several times over. It is aimed at anyone deciding between a front loader and a top loader, or wondering whether the warm-wash habit is worth what it adds to the monthly bill.",
  useCases: [
    "You are choosing between a 7 kg front loader and a 7 kg top loader and want the ten-year water and electricity difference, not just the sticker price.",
    "Your electricity bill jumped after you started using the 60 °C programme and you want to see how much of the cycle is pure water heating.",
    "You run a paying guest accommodation with five washes a day and need a defensible per-wash cost to build into the rent.",
  ],
  benefits: [
    ["Heating shown separately", "The breakdown splits drum energy from water heating, so you can see exactly what the temperature dial costs."],
    ["Water counted, not ignored", "Top loaders use roughly twice the water of front loaders, and that difference shows up in rupees per year."],
    ["Your own tariffs", "Electricity per unit, water per kilolitre and detergent per wash are all editable, so the answer matches your bill and not a national average."],
  ],
  faqs: [
    [
      "How much electricity does a washing machine use per wash?",
      "A cold wash in a 7 kg front loader uses roughly 0.3 kWh, while the same load at 60 °C uses about 1.3 kWh — over four times more, because heating the wash water dominates the cycle. Semi-automatic machines use the least electricity of all, around 0.2 kWh, since they run short cycles with no heater.",
    ],
    [
      "Do front load washing machines really use less water?",
      "Yes. A typical 7 kg front loader draws about 55-60 litres a cycle against 105-120 litres for a fully automatic top loader of the same capacity, because tumble action reuses a shallow pool of water instead of floating the clothes. Over 260 washes a year that is roughly 15 kilolitres of water saved.",
    ],
    [
      "Is washing in cold water cheaper enough to matter?",
      "For most household laundry, yes — switching from a 40 °C to a cold programme cuts about 0.4 kWh per wash, which at ₹8 a unit and five washes a week works out to roughly ₹800 a year. Keep hot washes for genuinely soiled items, bedding and nappies, where the temperature does hygienic work.",
    ],
    [
      "Does running a half-empty machine cost less?",
      "Slightly less on a load-sensing front loader, and almost nothing on a top loader or semi-automatic, where you set the water level yourself and the motor runs the same programme regardless. Filling the drum to about three-quarters gives the lowest cost per kilogram of laundry — the figures here assume a full rated load.",
    ],
  ],
};

export default seo;
