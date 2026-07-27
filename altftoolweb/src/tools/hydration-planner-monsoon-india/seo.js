const seo = {
  intro:
    "The Monsoon Hydration Planner estimates monsoon-season fluid loss in India by modelling how badly sweat evaporates when the air is already close to saturation. It runs the simplified ISO 7933 heat-strain chain — required evaporation, the environment's maximum evaporative capacity, sweating efficiency, then required sweat rate — and reports the US National Weather Service heat index alongside it. Because contaminated water is the other monsoon risk, it also sizes the volume of safe drinking water a household needs to boil or treat that day.",
  useCases: [
    "Plan water for a field visit or site inspection in Mumbai or Kolkata at 30 °C and 90% humidity, where the temperature looks mild but the heat index reads over 40 °C.",
    "Size how many litres a family of four needs to boil each day during a week when the municipal supply is under a boil-water advisory.",
    "Decide whether an afternoon of outdoor work needs ORS or buttermilk rather than plain water, using the estimated sodium lost in sweat.",
  ],
  benefits: [
    [
      "Humidity is modelled, not guessed",
      "Sweating efficiency falls as skin wettedness rises, so a humid 30 °C day correctly demands more fluid than a dry 35 °C one.",
    ],
    [
      "Warns when water is not the answer",
      "Flags uncompensable heat stress, where skin is fully wet and no amount of drinking restores heat balance.",
    ],
    [
      "Covers water safety too",
      "Adds WHO household treatment guidance and a per-person litre target for boiled or chlorinated water.",
    ],
  ],
  faqs: [
    [
      "Do you need more water during the monsoon in India?",
      "Usually yes, compared with what people actually drink. Monsoon air often sits above 85% relative humidity, which cripples sweat evaporation, so the body secretes far more sweat for the same cooling — much of it dripping off unused. A 30 °C day at 90% humidity carries a heat index near 41 °C, in the National Weather Service 'Danger' band.",
    ],
    [
      "Why do I sweat more when it is humid but not hotter?",
      "Sweat cools you only when it evaporates, and evaporation depends on the vapour-pressure gap between wet skin and the air. At 90% humidity that gap nearly closes, so the body raises sweat output to compensate. The extra sweat runs off without cooling you, which is why fluid loss climbs while the thermometer stays put.",
    ],
    [
      "How much safe drinking water does a family need per day in the monsoon?",
      "Plan on at least 3 litres of treated water per person per day for drinking and cooking, then add whatever sweat losses the calculator shows. To make water safe at home, WHO advises a rolling boil for one minute, extended to three minutes above 2,000 metres, or chlorine tablets used at the labelled dose and contact time.",
    ],
    [
      "When should I use ORS instead of plain water in humid weather?",
      "Once sweat loss passes roughly 2 litres in a day. At an average sweat sodium of about 40 mmol per litre, that is close to 2 grams of sodium gone, and replacing it with plain water alone dilutes blood sodium. ORS, lemon-salt water or buttermilk restores both. This is general information — if you have kidney or heart disease or take diuretics, follow the fluid and salt limits your doctor set.",
    ],
  ],
};

export default seo;
