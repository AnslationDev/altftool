const seo = {
  title: "Cold Weather Hydration Calculator: Breath & Sweat",
  metaDescription:
    "Adds respiratory water loss in dry cold air, sweat under layers and cold-induced diuresis to a 35 ml/kg baseline, and flags when you need sodium.",
  steps: [
    "Enter Body weight (kg), Outdoor temperature (°C), Relative humidity (%) and Hours outdoors today.",
    "Pick your Activity level outdoors, which sets the minute ventilation used for the respiratory loss from the Magnus saturation-vapour equation.",
    "Read Drink today in litres and 250 ml glasses, with the during-session share capped at 800 ml an hour and the sweat sodium estimate, then press Copy result.",
  ],
  intro:
    "The Cold Weather Hydration Calculator estimates how much fluid you lose on a cold day by adding four separate losses: your baseline need of about 35 ml per kg of body mass, the extra water carried off by breathing dry sub-zero air, sweat trapped under insulating layers, and cold-induced diuresis. The breathing loss is calculated from psychrometrics rather than a rule of thumb — exhaled air leaves the airway saturated at 37 °C while air at -10 °C holds under 2 g of water per cubic metre, and that gap is water you never get back. It is aimed at hikers, skiers, construction and site crews and anyone who stops feeling thirsty once the temperature drops.",
  useCases: [
    "Plan how much water to carry on a four-hour winter hike at -10 °C when a hydration bladder hose freezes and you ration sips.",
    "Work out the fluid a construction or utility crew should drink across an eight-hour shift in freezing wind.",
    "Check whether a ski touring day at -20 °C needs an electrolyte mix rather than plain water, based on estimated sweat sodium loss.",
  ],
  benefits: [
    [
      "Physics, not folklore",
      "Respiratory loss comes from the Magnus saturation-vapour equation and your actual minute ventilation, with the indoor resting loss subtracted so nothing is double-counted.",
    ],
    [
      "Splits the day sensibly",
      "Separates what to drink during the outdoor session from what to drink afterwards, and caps the hourly rate at a safe 800 ml.",
    ],
    [
      "Flags sodium, not just volume",
      "Estimates sweat sodium loss so you know when plain water alone is the wrong replacement.",
    ],
  ],
  faqs: [
    [
      "Do you really need more water in cold weather?",
      "Yes — cold air is extremely dry, so you lose more water through breathing, and cold exposure triggers cold-induced diuresis that raises urine output. The bigger problem is that cold blunts thirst by roughly 40% in laboratory studies, so people under-drink even when their losses are unchanged or higher.",
    ],
    [
      "How much water do you lose just from breathing in the cold?",
      "At rest indoors, breathing costs around 250-350 ml of water a day. Working hard outdoors at -10 °C, minute ventilation can rise five-fold and each cubic metre of air you exhale carries about 42 g more water than it brought in, which typically adds 150-500 ml over a few hours of activity.",
    ],
    [
      "Why do I sweat so much in the cold?",
      "Insulating layers trap heat, so once you start moving your body still has to dump the heat your muscles make. Sweat rates of 0.5-1.0 L per hour during winter hiking or shovelling are normal, and because the sweat is absorbed by clothing rather than dripping visibly, most people badly underestimate it.",
    ],
    [
      "Should I drink plain water or an electrolyte drink in winter?",
      "Plain water is fine below roughly 1.5 L of sweat loss. Above that, sweat sodium at around 40 mmol per litre adds up to more than a gram of sodium, so an electrolyte drink or salty food alongside water reduces the risk of dilutional hyponatraemia. This tool is informational — if you have a kidney, heart or blood-pressure condition or take diuretics, ask your doctor about your own targets.",
    ],
  ],
};

export default seo;
