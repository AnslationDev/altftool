const seo = {
  intro:
    "This comparison shows what an evaporative desert cooler and an air conditioner each cost to run, and — more usefully — what temperature each can actually deliver in your air. A cooler cannot go below the wet-bulb temperature: its outlet is dry-bulb minus the pad's saturation effectiveness times the wet-bulb depression, so at 40 °C and 25% humidity an 85% honeycomb pad reaches about 27 °C, while at 33 °C and 85% humidity it manages under 2 °C of cooling. Wet bulb is computed with Stull's 2011 approximation and the water evaporated from a constant-enthalpy psychrometric balance.",
  useCases: [
    "Decide before summer whether a cooler is worth buying in your city, or whether the humidity there makes it pointless.",
    "Show a landlord or family member why the cooler works in April but stops working once the monsoon arrives.",
    "Put a rupee figure on the electricity a cooler saves against a 1.5 ton AC over an eight-hour night.",
  ],
  benefits: [
    ["Physics, not marketing", "Uses the wet-bulb limit and pad saturation effectiveness rather than a claimed 'up to 15 °C drop'."],
    ["Water counted as a cost", "Prices the litres evaporated per hour alongside the units of electricity."],
    ["Honest verdict", "Says plainly when the wet-bulb depression is too small for a cooler to be worth running."],
  ],
  faqs: [
    [
      "Is an air cooler cheaper to run than an AC?",
      "Yes, by a wide margin on electricity — a desert cooler draws roughly 150–200 W against about 1,400 W for a 1.5 ton 3-star split, so around one-seventh the power. Over 240 hours a month at ₹8 a unit that is roughly ₹350 against ₹2,600, before adding the cost of the water the cooler evaporates.",
    ],
    [
      "At what humidity does an air cooler stop working?",
      "There is no single cut-off, but performance collapses once the wet-bulb depression falls under about 5 °C, which typically happens above 70–75% relative humidity. At 33 °C and 85% humidity the wet bulb is near 31 °C, so even a good pad delivers under 2 °C of cooling while making the room damper.",
    ],
    [
      "How much water does a desert cooler use per hour?",
      "It depends on airflow and how dry the incoming air is, because every degree of cooling comes from evaporating water. At 40 °C and 25% humidity with 3,000 m³/h of airflow and 30% fresh air, the balance works out to roughly 5 litres an hour — one reason coolers need a tank top-up most days.",
    ],
    [
      "Why does a cooler need an open window when an AC needs a closed one?",
      "A cooler adds moisture to the air it delivers, so it only keeps working if that humid air can leave and drier outside air can replace it. Sealing the room lets humidity climb until the wet-bulb depression disappears. An AC removes moisture, so sealing the room is exactly what you want.",
    ],
  ],
};

export default seo;
