const seo = {
  intro:
    "The Desert Climate Hydration Calculator estimates how much fluid and sodium you need to replace during exposure to hot, very dry air, by adding heat-scaled sweat loss and dry-air respiratory loss on top of a 35 mL/kg daily maintenance baseline. It reports a per-hour drinking rate, a sip size every 15 minutes, and the sodium carried out in that sweat using ACSM's 200-2000 mg per litre sweat sodium range. It is aimed at desert hikers, pilgrims, outdoor workers and anyone travelling somewhere the humidity sits below 20 percent.",
  useCases: [
    "Plan water and electrolyte drink for a six-hour summer hike where the forecast is 42 C and 12 percent humidity.",
    "Work out how much a construction or agricultural crew needs to carry per person for an eight-hour shift in the sun.",
    "Check whether a planned day is safe at all — if the calculated replacement rate exceeds 1.5 L per hour, the exposure itself needs shortening.",
    "Compare fluid needs before and after two weeks of heat acclimatisation, which raises sweat volume but roughly halves sweat sodium.",
  ],
  benefits: [
    [
      "Accounts for invisible loss",
      "Adds up to 0.12 L per hour of respiratory and skin loss below 10 percent humidity, the loss desert travellers never see as sweat.",
    ],
    [
      "Sodium, not just water",
      "Reports sweat sodium separately so you know when plain water alone would put you at risk of hyponatraemia.",
    ],
    [
      "Flags unsafe exposure",
      "Warns when the plan crosses the 1.5 L per hour absorption ceiling or the 12 L per day heat-illness guideline.",
    ],
  ],
  faqs: [
    [
      "How much water should I drink per hour in the desert?",
      "For moderate activity at around 40 C, roughly 0.8 to 1.2 litres per hour is typical, and hard work can push it towards 2 litres per hour. The absolute ceiling is about 1.5 litres per hour — the gut cannot absorb more than that, and drinking faster raises the risk of dilutional hyponatraemia rather than fixing dehydration.",
    ],
    [
      "Why do I feel less thirsty in dry heat even though I am sweating more?",
      "In air below about 20 percent relative humidity, sweat evaporates the instant it reaches the skin, so you never feel wet and never get the visual cue that you are losing fluid. Thirst also lags actual loss by roughly 1 to 2 percent of body mass, which is why desert guidance is to drink on a fixed schedule rather than on demand.",
    ],
    [
      "Do I need electrolytes or is water enough?",
      "Water is enough for short exposures, but once you lose more than about 3,500 mg of sodium — roughly three litres of sweat for an unacclimatised person — you need salt as well. Sweat sodium averages about 1,150 mg per litre unacclimatised and around 575 mg per litre once heat acclimatised, so an electrolyte drink or salted food matters more the longer you are out.",
    ],
    [
      "How do I know if I am actually dehydrated?",
      "Weigh yourself before and after the exposure: a loss of more than 2 percent of body mass, which is 1.4 kg for a 70 kg person, is the threshold ACSM treats as performance-impairing dehydration. Dark urine and a dry mouth are supporting signs, but confusion, fainting or sweating that stops in the heat are emergencies — get medical help immediately rather than relying on any calculator.",
    ],
  ],
};

export default seo;
