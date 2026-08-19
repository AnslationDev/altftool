const seo = {
  title: "Geyser Electricity Cost Calculator, Standing Loss",
  steps: [
    "Set Heater type to Storage tank geyser or Instant / tankless heater, then add Tank capacity (litres), BEE star rating and Hours left switched on per day.",
    "Fill Bucket baths per day, Litres per bucket, Showers per day, Minutes per shower, Shower flow (litres per minute), Bathing and Mains water temperature (°C), Days used per month and Electricity tariff (₹ per unit).",
    "Read Cost per month with Standing loss from the tank shown as its own line, plus Cost per bucket and Cost per minute of shower, then press Copy result.",
  ],
  intro:
    "A geyser's electricity bill is the sum of two things: the heat that goes into the water you use, and the heat the tank leaks into the bathroom while it sits switched on. This calculator computes the first from the standard heat equation — litres × 4.186 kJ per kg per °C × temperature rise ÷ 3600 — and the second from the BEE standing-loss figure printed on the star label, scaled for tank size and the hours you leave the switch on. It is for anyone trying to work out whether the bill comes from long showers, a cold-winter inlet, or simply forgetting to switch the geyser off.",
  useCases: [
    "Your winter electricity bill doubles every December and you want to see how much of that is the geyser working against a 14 °C mains supply.",
    "You are choosing between a 15 L and a 25 L storage geyser and want the standing-loss difference over a year, not just the price difference.",
    "You suspect the household habit of leaving the geyser on all morning is costing more than the baths themselves.",
  ],
  benefits: [
    ["Standing loss counted separately", "The tank leaks heat even when nobody bathes, and that share is shown as its own line rather than buried in the total."],
    ["Bucket and shower costed", "You get a rupee figure per bucket and per minute of shower, which is far easier to act on than a monthly lump sum."],
    ["Winter versus summer", "Changing only the mains water temperature shows why the same bathing habit costs much more in January than in May."],
  ],
  faqs: [
    [
      "How many units does a geyser use per bath?",
      "Roughly 0.5 kWh for a 20-litre bucket in winter, when mains water is near 15 °C and you bathe at about 42 °C. A 72-litre eight-minute shower at the same temperatures uses about 2.3 kWh — roughly four and a half times as much, because it is simply four times the water.",
    ],
    [
      "Does leaving the geyser switched on all day waste much electricity?",
      "Yes, but less than most people fear on a well-insulated tank. A 5-star 25-litre geyser leaks around 0.47 kWh a day if left on continuously against about 0.04 kWh if switched on for two hours — roughly ₹100 a month at ₹8 a unit. On an unrated or 1-star tank the same habit costs nearly twice that.",
    ],
    [
      "Is a higher BEE star rating on a geyser worth the extra price?",
      "It pays back only if you leave the geyser on for long stretches, because the star rating measures standing loss and nothing else — the energy that goes into the water you actually use is identical on a 1-star and a 5-star heater. If you switch on for twenty minutes before bathing, the difference between star ratings is a few rupees a month.",
    ],
    [
      "Is an instant geyser cheaper to run than a storage one?",
      "Per litre of hot water they are almost identical, because both convert electricity to heat at close to 100% efficiency. An instant heater avoids standing loss entirely, so it wins where hot water is drawn in small amounts, while a storage tank suits showers and bucket baths because a 3 kW instant unit cannot deliver a hot shower flow in a cold winter.",
    ],
  ],
};

export default seo;
