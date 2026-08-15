const seo = {
  title: "Monthly Fuel Budget Planner: Petrol, Diesel",
  metaDescription:
    "Costs up to 10 vehicles at once from monthly km and mileage, then works out the kilometres to cut to fit inside your fuel cap.",
  steps: [
    "Press Add vehicle, then set each one's Fuel, Distance per month (km), Mileage (km per litre or kg) and Price per litre or kg.",
    "Enter your Monthly fuel budget (0 for none) to test the fleet total against a cap.",
    "Read the Fuel spend per month, the per-vehicle Cost / month and Share table, and the kilometres to trim to get under the cap.",
  ],
  intro:
    "The Monthly Fuel Budget Planner costs a household's whole set of vehicles at once: for each one it works out fuel used as monthly km ÷ mileage, multiplies by the price per litre or per kilogram, and adds the money up across petrol, diesel and CNG vehicles together. Set a monthly cap and it tells you the overspend and, using the fleet's fuel-weighted cost per kilometre, exactly how many kilometres you would have to drop to fit inside it. It is for the person running two or three vehicles in one house who wants one number for the month rather than three separate guesses.",
  useCases: [
    "A car, a scooter and a CNG hatchback share one household budget, and you want to know which of the three is actually consuming the largest share of the monthly fuel spend.",
    "Fuel prices moved and your cap is now being breached; you need to know whether trimming 200 km a month is enough or whether the cap itself has to rise.",
    "You are deciding whether a service and correct tyre pressure are worth it, so you model a 10 percent mileage improvement and see the resulting saving over 12 months.",
  ],
  benefits: [
    ["Petrol, diesel and CNG in one total", "CNG is metered in kilograms and priced per kilogram, so its efficiency is handled as km per kg; only the money is summed, never the mismatched units."],
    ["Turns overspend into kilometres", "The gap to your cap is divided by the fleet's cost per km, so you get a distance to cut rather than a vague instruction to drive less."],
    ["Shows which vehicle to look at", "Each vehicle reports its own cost per km, its share of total spend and its share of total distance, which is how you spot the thirsty one."],
  ],
  faqs: [
    [
      "How is monthly fuel cost calculated?",
      "Fuel used is monthly distance divided by mileage, and cost is that quantity multiplied by the price per unit. A car covering 1,000 km at 15 km per litre burns 66.7 litres, so at ₹105 per litre it costs about ₹7,000 for the month.",
    ],
    [
      "How many kilometres do I need to cut to stay within budget?",
      "Divide the overspend by the fleet's cost per kilometre, which the planner does for you. The fleet figure is total monthly cost ÷ total monthly distance — a fuel-weighted average across all your vehicles, which is the correct rate to use because trimmed kilometres come off the mix, not off one vehicle alone.",
    ],
    [
      "How much does better mileage actually save?",
      "A gain of g percent in km per litre cuts fuel used to 1 ÷ (1 + g/100) of the original, so a 10 percent improvement saves about 9.1 percent of the bill, not 10. The planner applies the change across every vehicle and shows both the monthly and the 12-month saving.",
    ],
    [
      "How many vehicles can I budget for?",
      "Up to 10 at once. Each vehicle is capped at 20,000 km a month and a mileage of 200 km per litre or kilogram, limits that exist to catch typos rather than to restrict real use.",
    ],
  ],
};

export default seo;
