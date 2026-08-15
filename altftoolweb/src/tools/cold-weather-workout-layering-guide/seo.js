const seo = {
  title: "What to Wear for Cold Workouts — Wind Chill",
  metaDescription:
    "Enter temperature, wind and session type to get NWS wind-chill maths, a dressing temperature, frostbite exposure time and a layer for every body zone.",
  steps: [
    "Enter the Air temperature in °C and Wind speed in km/h, then pick the session under 'What you are doing' and its length in minutes.",
    "Tick 'Rain, sleet or wet snow' or 'Asthma or cold-air wheeze' if either applies to the session.",
    "Read the wind chill, dressing temperature and safe exposed-skin time, plus the zone-by-zone What to wear table, then click Copy result.",
  ],
  intro:
    "The Cold Weather Workout Layering Guide turns the temperature, wind speed and your planned session into a specific kit list. It calculates the 2001 North American wind chill index used by the US National Weather Service and Environment Canada, adds the warmth your own effort generates using the classic coaching rule of dressing for 10 to 20 °F warmer than it is, then names a layer for the head, torso, hands, legs and feet — along with the frostbite exposure time for uncovered skin.",
  useCases: [
    "Decide whether a 6 °C morning with a 30 km/h wind calls for a shell or just a long-sleeve top.",
    "Check the frostbite exposure limit before a long run when the wind chill is below −28 °C.",
    "Adjust the kit list when a session is intervals rather than an easy hour, so you do not start overdressed.",
    "See how much colder wet clothing makes a session feel before setting out in sleet.",
  ],
  benefits: [
    ["Real wind chill maths", "The official NWS and Environment Canada formula, applied only inside its valid range."],
    ["Effort accounted for", "Hard sessions shift the dressing temperature up to 11 °C warmer than the thermometer reads."],
    ["Zone-by-zone list", "Head, torso, hands, legs and feet each get a specific layer instead of vague advice."],
  ],
  faqs: [
    [
      "How is wind chill calculated?",
      "The 2001 North American index is WCI = 13.12 + 0.6215 T − 11.37 V^0.16 + 0.3965 T V^0.16, with T in degrees Celsius and V the wind speed in km/h. It is only defined for temperatures at or below 10 °C with wind above 4.8 km/h — outside that range the air temperature is what you should use.",
    ],
    [
      "How cold is too cold to run outside?",
      "Environment Canada puts frostbite risk for exposed skin at 10 to 30 minutes once the wind chill reaches −28 °C, 5 to 10 minutes below −40 °C, and under 2 minutes below −55 °C. Below about −28 °C nothing should be uncovered, and at −48 °C or colder the sensible call is to move the session indoors.",
    ],
    [
      "Why should I dress as if it were warmer than it is?",
      "Because working muscle produces a large amount of heat, and clothing that feels right standing still leaves you soaked in sweat ten minutes in — which then chills you when you stop. The long-standing coaching rule is to dress for 10 to 20 °F (roughly 5 to 11 °C) warmer than the reading, with the bigger allowance for harder efforts. You should feel slightly cold for the first five minutes.",
    ],
    [
      "Does cold air trigger asthma during exercise?",
      "Cold dry air is one of the best-recognised triggers for exercise-induced bronchoconstriction, because rapid breathing dries and cools the airway lining. Breathing through a buff or scarf pre-warms and humidifies the air, and a longer gradual warm-up reduces the response. If you have been prescribed a reliever to use before exercise, follow your clinician's instructions rather than this guide.",
    ],
  ],
};

export default seo;
