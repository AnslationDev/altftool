const seo = {
  title: "Household Electricity Bill Calculator",
  metaDescription:
    "Price your appliances at watts x hours / 1000, through telescopic domestic slabs plus fixed charge and duty — or your own flat rate per unit.",
  steps: [
    "List what you run: pick each appliance from the preset list, then set Power rating (watts), How many and Hours used per day — Add appliance adds a row and Remove drops one.",
    "Under Tariff choose State slab tariff and your state, or \"Flat rate from my bill\" plus the rate per unit in INR/kWh; set Days in the billing cycle (up to 62) and tick \"Add electricity duty / tax\".",
    "Read the estimated bill with units per day, period and year, energy charge, fixed charge, duty and effective cost per unit, plus the \"Where the units go\" table ranking appliances by share and the slab-by-slab energy charge; Copy result takes the summary.",
  ],
  intro:
    "The household electricity bill calculator turns a list of appliances into a rupee figure by computing units as watts x quantity x hours per day / 1000, then pricing those units through your state's telescopic domestic slab tariff and adding the fixed charge and electricity duty. It is built for anyone who wants to know which appliance is actually driving the bill before the meter reader arrives. One unit on the bill is one kilowatt-hour, so a 1,000 W geyser running for one hour costs exactly one unit.",
  useCases: [
    "Work out how much a 1.5 ton split AC running six hours a night adds to a Delhi bill before summer starts.",
    "Compare a 75 W ceiling fan against a 30 W BLDC fan across three fans running twelve hours a day.",
    "Check whether a sudden jump in the bill is explained by a new geyser or by crossing into a higher tariff slab.",
  ],
  benefits: [
    ["Telescopic slabs, done right", "Each block of units is charged at its own rate rather than re-pricing the whole bill at the top slab."],
    ["Per-appliance share", "Ranks every appliance by units used, so the biggest consumer is obvious at a glance."],
    ["Works with your own tariff", "Switch to flat rate and enter the cost per unit printed on your bill for an exact match."],
  ],
  faqs: [
    [
      "How do I calculate electricity units for an appliance?",
      "Multiply the wattage by the hours it runs each day and divide by 1,000 to get units per day. A 1,200 W air conditioner running 6 hours a day uses 7.2 units a day, which is 216 units over a 30-day billing cycle.",
    ],
    [
      "Does crossing a slab mean my whole bill is charged at the higher rate?",
      "No. Domestic tariffs in India are telescopic, so only the units above the slab ceiling take the higher rate. On the Delhi domestic tariff, 216 units are billed as 200 units at INR 3 plus 16 units at INR 4.50, which is INR 672 of energy charge, not 216 x INR 4.50.",
    ],
    [
      "Why is my bill higher than energy charge alone?",
      "Because a fixed or meter charge is added regardless of consumption, and electricity duty is levied on the sum of energy plus fixed charge. In Delhi that is roughly INR 125 fixed and 5% duty, so a INR 672 energy charge becomes about INR 837.",
    ],
    [
      "Which household appliance uses the most electricity?",
      "The air conditioner and the water geyser, because both draw 1,200 W to 2,000 W. A 2,000 W geyser used one hour a day costs 60 units a month, more than eight 9 W LED bulbs running six hours a day for a whole year.",
    ],
  ],
};

export default seo;
