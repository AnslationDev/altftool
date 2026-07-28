const seo = {
  intro:
    "The Cycling Commute Calorie Calculator works out the energy cost of riding to work and the fuel, money and CO2 the same journey by car would have used. Calories come from the ACSM equation kcal/min = MET x 3.5 x kg / 200, with the MET taken from the speed-banded bicycling codes in the Compendium of Physical Activities — 4.0 below 16 km/h, 6.8 at 16-19 km/h, 8.0 at 19-22 km/h and 10.0 at 22-26 km/h. Fuel savings use the standard combustion figures of 2.31 kg CO2 per litre of petrol and 2.68 kg per litre of diesel.",
  useCases: [
    "See what swapping a 8 km each-way car commute for a bike adds up to over a year in calories and fuel.",
    "Compare riding at an easy 15 km/h against pushing 22 km/h on the same route.",
    "Build the financial case for a bike or e-bike purchase from the fuel bill it replaces.",
    "Work out how many commuting days a week are needed to hit a weekly activity target.",
  ],
  benefits: [
    ["Speed sets the intensity", "The MET value is looked up from your average speed rather than guessed."],
    ["Whole-year view", "Per-trip, weekly and annual totals for calories, litres, money and CO2."],
    ["Honest CO2 accounting", "Tailpipe emissions only, and the page says what the figure excludes."],
  ],
  faqs: [
    [
      "How many calories does cycling to work burn?",
      "An 8 km ride at 18 km/h burns about 228 kcal for a 72 kg rider, so a return commute five days a week comes to roughly 2,285 kcal — around 119,000 kcal a year. Riding the same route at 24 km/h raises the intensity from 6.8 to 10.0 MET, though the trip is shorter in time.",
    ],
    [
      "How much CO2 does cycling instead of driving save?",
      "Burning one litre of petrol releases about 2.31 kg of CO2, and one litre of diesel about 2.68 kg. A 80 km weekly commute in a car doing 15 km per litre uses 5.3 litres, so cycling it instead avoids roughly 12.3 kg of CO2 a week, or about 640 kg a year.",
    ],
    [
      "Is a bike commute enough exercise on its own?",
      "Often yes. Cycling at 16 km/h or more is 6.8 MET, which is vigorous intensity, so a 27-minute ride each way five days a week is around 267 minutes of vigorous activity — well past the 75-minute weekly minimum in the WHO guidelines.",
    ],
    [
      "Does riding faster always burn more calories?",
      "Per minute yes, but not always per trip, because a faster ride is over sooner. Doubling speed from 15 to 25 km/h roughly halves the time while raising the MET from 4.0 to 10.0, so the total for a fixed distance still goes up — just by less than the intensity jump suggests.",
    ],
  ],
};

export default seo;
