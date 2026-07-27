const seo = {
  intro:
    "Running cost per kilometre is the only fair way to compare an electric car with a petrol one, because a kWh and a litre are not comparable units. This calculator divides usable battery capacity by real-world range to get consumption at the wheels, grosses it up by charging efficiency to get the energy actually drawn from the socket, blends your home and public charging tariffs, and sets the result against petrol price divided by mileage — then adds each car's own maintenance and works out the distance at which the EV's higher purchase price pays back.",
  useCases: [
    "You mostly charge at home at ₹8 a unit but take two long trips a year on ₹20-a-unit fast chargers, and want the blended figure rather than the brochure one.",
    "The EV you are considering costs ₹5 lakh more than the petrol equivalent and you want to see how many kilometres it takes to recover that.",
    "You drive only 6,000 km a year and suspect the running-cost saving will never catch the price gap — this shows whether that hunch is right.",
  ],
  benefits: [
    ["Charging losses counted", "Energy drawn from the wall is 10–15% more than the energy stored, and ignoring that understates EV cost by the same margin."],
    ["Home and public blended", "One slider moves you from a cheap overnight charge to expensive DC fast charging, which is where most EV cost comparisons go wrong."],
    ["Break-even, not just per-km", "Reports the distance and the number of years at which a higher sticker price is repaid, and says plainly when it never is."],
  ],
  faqs: [
    [
      "How much does it cost to charge an electric car per km in India?",
      "Roughly ₹1.2 to ₹1.8 per km charging at home. A car using 12 kWh per 100 km draws about 13.6 kWh from the socket after charging losses, so at a domestic tariff of ₹8 per unit that is about ₹1.09 per km; the same car on a ₹20-per-unit fast charger costs about ₹2.73 per km.",
    ],
    [
      "Is an EV really cheaper than petrol in India?",
      "On energy, almost always — a petrol car at 16 km/l and ₹105 a litre costs about ₹6.56 per km against roughly ₹1.40 for an EV charged mostly at home. Whether the whole package is cheaper depends on the purchase price gap and how far you drive; at a ₹5 lakh premium and a ₹5.94 per km saving, break-even arrives near 84,000 km.",
    ],
    [
      "Why is charging efficiency less than 100%?",
      "Because the onboard charger converts AC to DC and the battery has internal resistance, both of which shed energy as heat. AC home charging typically lands at 85–90% wall-to-battery, so a 30 kWh battery needs about 34 kWh from the meter. Your electricity bill measures the larger number.",
    ],
    [
      "Does an EV actually reduce CO2 if the grid burns coal?",
      "Usually yes, but by less than people assume. At an Indian grid average near 0.71 kg CO2 per kWh, an EV drawing 0.136 kWh per km emits about 0.097 kg per km, against roughly 0.144 kg for a petrol car at 16 km/l — around a third lower. Charging from rooftop solar removes almost all of it.",
    ],
  ],
};

export default seo;
