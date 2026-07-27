const seo = {
  intro:
    "This calculator turns a motorcycle or scooter's mileage in km/l into petrol cost per ride, per week, per month and per year, using litres = distance ÷ km/l and cost = litres × pump price. It also reports tank range (tank litres × mileage), the cost of filling up, and how many refills a month your riding pattern needs. Useful for commuters, delivery riders and anyone weighing a 60 km/l commuter against a 32 km/l cruiser.",
  useCases: [
    "Costing a 12 km each-way office ride six days a week before deciding between bike and bus",
    "Working out whether a 350cc bike at 32 km/l is affordable as a daily rider",
    "Estimating tank range so you know when a highway stretch needs a fuel stop",
  ],
  benefits: [
    ["Per-ride and per-month in one view", "See both the small number you feel daily and the big one that shapes a budget."],
    ["Tank range included", "Know how far a full tank goes and how often you will refuel."],
    ["Bike-to-bike comparison", "Hold the route constant and change only km/l to see the true cost difference."],
  ],
  faqs: [
    [
      "How do I calculate petrol cost for my bike?",
      "Divide the distance by your mileage in km/l to get litres, then multiply by the pump price. A 24 km return ride on a bike doing 45 km/l uses 0.53 litres, which is about ₹56 at ₹105 a litre.",
    ],
    [
      "What mileage should I expect from a 100cc, 125cc and 350cc bike?",
      "Real-world figures are roughly 55-70 km/l for a 100-110cc commuter, 40-50 km/l for a 125cc scooter, and 30-35 km/l for a 350cc single. City traffic, pillion weight and a poorly maintained chain can each pull these down by 10-20%.",
    ],
    [
      "How far can my bike go on a full tank?",
      "Multiply tank capacity by mileage: a 12-litre tank at 45 km/l gives about 540 km. Plan a refill at roughly 80% of that, since the last couple of litres sit in the reserve and are hard to use accurately.",
    ],
    [
      "Why is my actual mileage lower than the claimed figure?",
      "Manufacturer figures come from steady-speed test conditions. Stop-start traffic, hard acceleration, tyre pressure 5-7 psi below spec, a dirty air filter and a loose or dry chain each cost fuel, and together they commonly account for a 15-25% gap.",
    ],
  ],
};

export default seo;
