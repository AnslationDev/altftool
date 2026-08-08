const seo = {
  title: "Alcohol Units & BAC Calculator (Widmark Formula)",
  metaDescription:
    "Count UK units as ml x ABV% / 1000, estimate BAC with the Widmark formula, and track your week against the 14-unit guidance. Not a fitness-to-drive test.",
  intro:
    "The Alcohol Units & BAC Calculator counts UK units from the real volume and ABV of what you drank using units = ml × ABV% ÷ 1000, then estimates blood alcohol with the Widmark formula: BAC% = (grams of alcohol × 100) ÷ (body weight in grams × r) − 0.015 × hours since the first drink. It converts the same session into US standard drinks (14 g of pure alcohol each), tracks a rolling seven days against the 14-unit low-risk guidance, and shows how long the estimate takes to fall back to zero. Everything is an informational estimate from population averages — it is not a measurement, and never a basis for deciding whether to drive.",
  useCases: [
    "You poured two large pegs and a beer at home and want to know what that adds up to in units before you log the week",
    "You are checking whether a Friday night plus a Sunday lunch has already used up the 14 units of weekly low-risk guidance",
    "You want to see roughly how many hours a session takes to clear at 0.015% per hour, so you can plan tomorrow morning around it rather than around a guess",
  ],
  benefits: [
    ["Real pour sizes, not \"a drink\"", "A 30 ml peg at 42.8%, a 568 ml pint at 5% and a 750 ml bottle of wine are each counted on their own numbers."],
    ["Shows the Widmark arithmetic", "The r value, your weight in grams and the elimination subtraction are all printed, so the estimate can be checked rather than trusted blindly."],
    ["Honest about what it cannot know", "It refuses to pretend food shortens your time to sober, and states plainly that a low reading is not evidence you are under any legal limit."],
  ],
  faqs: [
    [
      "How do you calculate alcohol units?",
      "Units = volume in ml × ABV% ÷ 1000. A 330 ml beer at 5% is 1.65 units, a 175 ml glass of wine at 12% is 2.1 units, and a 750 ml bottle of wine at 12% is 9 units. One UK unit is 10 ml — about 8 g — of pure alcohol.",
    ],
    [
      "How many units a week is considered low risk?",
      "UK Chief Medical Officers' guidance is no more than 14 units a week, spread over three or more days, with several drink-free days. Guidance differs between countries, and 14 units is described as a low-risk line rather than a safe one — no level of drinking is completely risk-free. Speak to a doctor about your own drinking rather than relying on a threshold.",
    ],
    [
      "How long does it take for alcohol to leave your system?",
      "Roughly 0.015% BAC per hour for most adults, which works out to about one unit an hour. A reading of 0.06% therefore takes around four hours to reach zero. Coffee, a cold shower, food and sleep do not speed elimination up — only time does. This is an average rate, and individual clearance varies.",
    ],
    [
      "Can I use a BAC estimate to decide if I am safe to drive?",
      "No. This is arithmetic on population averages, not a measurement of you, and two people of the same weight and sex drinking identically can land at meaningfully different real readings. India's legal limit is 0.03% BAC — 30 mg per 100 ml of blood — and driving at or above it is a criminal offence under the Motor Vehicles Act. If you have been drinking, do not drive.",
    ],
  ],
};

export default seo;
