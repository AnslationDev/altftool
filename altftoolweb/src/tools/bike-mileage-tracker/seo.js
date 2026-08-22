const seo = {
  title: "Bike Mileage Tracker: Tank-to-Tank km/l & Cost/km",
  metaDescription:
    "Log brim-to-brim fill-ups for true distance-weighted km/l, cost per kilometre and a monthly fuel bill. Partial top-ups are carried forward, not dropped.",
  steps: [
    "Enter each fill-up oldest first with Odometer (km), Litres filled and Price (₹ per litre), ticking Filled to the brim.",
    "Press Add a fill-up for up to 20 rows, then set Kilometres you ride in a month.",
    "Read True average mileage in km/l with Cost per kilometre and the per-stretch table, then press Copy result.",
  ],
  intro:
    "A bike mileage tracker measures real two-wheeler fuel economy by the tank-to-tank method: the distance between two brim-full fills, divided by every litre added in between. Partial top-ups are carried forward rather than discarded, so a mixed log stays accurate, and the overall figure is total distance over total litres — the distance-weighted average, not the arithmetic mean of the per-tank numbers that most spreadsheets report. It also turns the log into cost per kilometre and a projected monthly fuel bill.",
  useCases: [
    "Checking whether a 110cc commuter is really delivering the 60 km/l it was sold with",
    "Spotting the mileage drop that follows a slack chain, a clogged air filter or soft tyres",
    "Working out the true per-kilometre running cost before deciding between riding and taking a cab",
  ],
  benefits: [
    ["Correct averaging", "Weights by distance, so small top-up tanks cannot skew the headline figure."],
    ["Handles partial fills", "Carries unclosed litres into the next full tank instead of throwing the reading away."],
    ["Cost, not just km/l", "Reports rupees per kilometre and a monthly fuel bill from the prices you actually paid."],
  ],
  faqs: [
    [
      "How do I calculate my bike's mileage accurately?",
      "Fill the tank to the brim, note the odometer, ride normally, then fill to the brim again and divide the kilometres covered by the litres it took. One tank is a noisy sample — three or four consecutive full tanks give a figure you can trust, and the nozzle must be allowed to cut off on its own each time rather than being topped up by hand.",
    ],
    [
      "Why is my mileage different every tank?",
      "Almost always the filling, not the engine. How full the tank ends up depends on the nozzle cut-off, the slope the bike is parked on and whether it is on the side stand or upright, and a half-litre difference on a 6-litre tank is an 8% swing. Traffic, pillion weight, tyre pressure and cold starts explain the rest.",
    ],
    [
      "What is a good mileage for a 100–125cc bike in India?",
      "Commuter 100–125cc motorcycles typically return 50–70 km/l in real riding, while 150cc bikes sit around 40–50 km/l and 125cc scooters around 40–50 km/l. Manufacturer figures come from a standardised test cycle, so a real-world number 10–20% lower is normal rather than a fault.",
    ],
    [
      "How can I improve my two-wheeler's fuel efficiency?",
      "Start with tyre pressure — the single cheapest fix, and worth several percent when tyres are 5 psi low. Then chain slack and lubrication, a clean air filter, a serviced spark plug, and riding habits: steady throttle, early upshifts and no idling for more than about a minute. Track it in a log so you can tell a real improvement from tank-to-tank noise.",
    ],
  ],
};

export default seo;
