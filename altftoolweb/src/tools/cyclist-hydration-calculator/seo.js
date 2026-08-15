const seo = {
  title: "Cyclist Hydration Calculator: Bottles, Carbs",
  metaDescription:
    "Turn weight, ride length, heat and humidity into bottles per hour, refill stops, carb grams and drink sodium using the ACSM fluid and fuelling bands.",
  steps: [
    "Enter Rider weight (kg), Ride length (hours), Air temperature (C) and Relative humidity (%), then pick a Ride intensity.",
    "Set Bottle cages on the bike and Bottle size (ml), or fill in Measured sweat rate (L/h) to override the temperature and intensity model.",
    "Read Bottles to fill in total, Refill stops with your cages, Carbohydrate target and Sodium to put in the bottles, then press Copy plan.",
  ],
  intro:
    "This calculator converts a planned ride into bottles per hour, refill stops, carbohydrate grams and drink sodium. It models sweat rate from rider weight, ride intensity, air temperature and humidity, then applies the ACSM Position Stand on Exercise and Fluid Replacement: drink at your sweat rate but no faster than the gut can absorb it (about 1 L per hour), finish under 2% body-mass loss, and replace 1.5 litres for every kilogram still down. Carbohydrate follows the duration bands in the ACSM joint position on Nutrition and Athletic Performance — roughly 30 g/h from one hour, 60 g/h from two, and up to 90 g/h past two and a half.",
  useCases: [
    "Plan a 3-hour summer ride at 30 C and find out you need four 750 ml bottles and one refill stop with two cages.",
    "Check whether a 100 km sportive needs 60 g or 90 g of carbohydrate an hour before you buy gels.",
    "Enter a sweat rate you measured by weighing in and out, and get a bottle schedule built on your own number rather than an average.",
  ],
  benefits: [
    ["Bottles, not abstractions", "Turns litres per hour into bottles per hour and the number of refill stops your cages force."],
    ["Fuel and fluid together", "Gives carbohydrate grams per hour and drink sodium alongside the volume."],
    ["Guards both directions", "Caps intake at your sweat rate so the plan never pushes you toward over-drinking."],
  ],
  faqs: [
    [
      "How much should a cyclist drink per hour?",
      "Match your sweat rate, which for most riders is 0.5-1.5 litres an hour and rises steeply with heat. Practically that is one 500-750 ml bottle an hour in mild weather and up to two in the heat, capped near 1 litre an hour because that is roughly what the gut can absorb while riding.",
    ],
    [
      "How many bottles do I need for a 100 km ride?",
      "For a 3-4 hour ride at moderate temperature, plan on 3-4 large bottles — about 750 ml per hour. Two cages means at least one refill stop, so check where the taps or feed stations are before you set off.",
    ],
    [
      "How many carbs per hour on the bike?",
      "About 30 g/h for rides of 1-2 hours, 60 g/h for 2-2.5 hours, and up to 90 g/h beyond that. The 90 g figure only works with a glucose-plus-fructose blend, because a single sugar saturates its intestinal transporter near 60 g per hour.",
    ],
    [
      "Can you drink too much water on a bike ride?",
      "Yes. Drinking more than you sweat over several hours dilutes blood sodium and can cause exercise-associated hyponatraemia, which is more dangerous than mild dehydration. Never plan to drink faster than your sweat rate, and on rides over two hours use a drink containing roughly 460-690 mg of sodium per litre. This is general information, not medical advice.",
    ],
  ],
};

export default seo;
