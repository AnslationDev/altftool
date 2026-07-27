const seo = {
  intro:
    "The Flight Hydration Planner turns flight length, cabin conditions and what you drink on board into an hourly millilitre target, and works out your arrival local time and caffeine cutoff at the same time. Aircraft cabins are pressurised to a cabin altitude of up to 8,000 feet with relative humidity typically between 10% and 20%, and the extra water that costs you is computed here from psychrometrics rather than assumed. The usual finding surprises people: on a ten-hour flight the dry air costs roughly 50 ml, while two beers cost about 260 ml in extra urine.",
  useCases: [
    "Plan how many 500 ml bottles to buy airside for a ten-hour long-haul instead of relying on the drinks trolley.",
    "See whether the wine with dinner or the cabin air is doing more damage before a morning arrival and a same-day meeting.",
    "Work out the local arrival time and the last safe moment for coffee when flying from Delhi to a European destination.",
  ],
  benefits: [
    [
      "Debunks by calculating",
      "Shows the dry-air loss as a real number rather than repeating the claim that flying badly dehydrates you.",
    ],
    [
      "Alcohol quantified properly",
      "Converts each drink to grams of ethanol from its volume and ABV, then applies the roughly 10 ml of urine per gram effect.",
    ],
    [
      "Time zones handled",
      "Gives arrival local time, day rollover, zones crossed and a caffeine cutoff six hours before your destination bedtime.",
    ],
  ],
  faqs: [
    [
      "How much water should you drink on a flight?",
      "A common airline recommendation is around 250 ml an hour, and this planner usually lands near that for a long-haul once alcohol is included. For a 70 kg adult on a ten-hour flight with two beers and a coffee, the total works out around 1.5 litres, or roughly three 500 ml bottles.",
    ],
    [
      "Does flying really dehydrate you?",
      "Far less than the folklore suggests. Cabin humidity of 10-20% adds only about 50 ml of extra water loss over ten hours through breathing and the skin, because exhaled air is saturated at body temperature whatever you inhaled. The dry eyes, blocked nose and scratchy throat are real, but they come from surface evaporation on those tissues, not whole-body fluid loss.",
    ],
    [
      "Why is alcohol worse than dry air on a plane?",
      "Ethanol suppresses vasopressin, the hormone that tells the kidneys to conserve water, producing roughly 10 ml of extra urine per gram of ethanol consumed. A 330 ml beer at 5% contains about 13 grams, so two beers cost around 260 ml — about five times what ten hours of cabin air costs. Alcohol also fragments sleep, which compounds jet lag.",
    ],
    [
      "When should I stop drinking coffee before landing?",
      "About six hours before the bedtime you intend to keep at your destination. Caffeine has a mean elimination half-life near five hours, and controlled trials show a dose taken six hours before bed still measurably reduces total sleep time. Shifting your caffeine to the destination's morning is one of the more effective jet-lag habits; recovery otherwise runs at roughly one day per time zone crossed.",
    ],
  ],
};

export default seo;
