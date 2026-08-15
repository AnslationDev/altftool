const seo = {
  title: "Road Trip Fuel Cost: Mileage, Tolls, Cost",
  metaDescription:
    "Adjust rated mileage for highway, city or ghat roads, AC and a roof carrier, then get fuel, tolls, refuel stops and the per-head share.",
  steps: [
    "Under The trip, enter One-way distance (km) and People sharing the cost, tick Driving back as well to double the distance, then add Tolls, both ways (INR) and Parking, permits, other (INR) under Other costs and timing.",
    "Under The vehicle, choose Petrol, Diesel, CNG or Auto LPG, enter Rated mileage, Fuel price and Tank capacity, set Road conditions to Open highway cruising, Mixed highway and towns, City and heavy traffic or Hills and ghat roads, and tick AC running most of the way or Loaded roof carrier fitted.",
    "Trip total shows the all-in cost and what each traveller pays, with rows for Effective mileage, Fuel needed, Refuel stops needed, Usable range per tank and Cost per km (all in); press Copy result.",
  ],
  intro:
    "Trip fuel cost is distance divided by mileage, multiplied by pump price — but the mileage in that formula is never the number on the brochure. This calculator adjusts your rated figure for the roads you will actually drive (highway cruising beats the combined figure by about 10%, ghat roads fall roughly 25% below it), for air conditioning at about a 7% penalty and for a loaded roof carrier at about 10%, then adds tolls, splits the total per head and works out how many refuel stops the tank forces on you.",
  useCases: [
    "Four friends are driving 500 km each way and want to agree the per-head share before leaving, not argue about it afterwards.",
    "You are taking a ghat route with a roof box and suspect the usual mileage assumption is far too optimistic.",
    "You want to know whether your tank makes the run in one go or whether you need to plan a fuel stop into the schedule.",
  ],
  benefits: [
    ["Mileage you will actually get", "Highway, city and hill factors plus AC and roof-carrier penalties, instead of the single number that always underestimates the bill."],
    ["Refuel stops, not just litres", "Uses 90% of tank capacity to work out real range per fill and how many stops the trip needs."],
    ["Works for CNG and LPG too", "Switches the unit to km/kg and prices per kilogram where that is how the fuel is sold."],
  ],
  faqs: [
    [
      "How do I calculate fuel cost for a road trip?",
      "Divide total distance by your effective mileage to get litres, then multiply by the pump price. For 1,000 km at 16 km/l and ₹105 a litre that is 62.5 litres and about ₹6,563 — before tolls, and before adjusting the mileage for hills, traffic or the AC.",
    ],
    [
      "How much does running the AC cost in fuel?",
      "Around 5–10% of fuel consumption on a highway run, and more in slow traffic where the engine is doing little else. On a 1,000 km trip at 16 km/l that is roughly 3 to 6 extra litres. Below about 60 km/h open windows can be cheaper; above it the extra drag usually costs more than the compressor.",
    ],
    [
      "Does a roof box reduce mileage?",
      "Yes, typically 5–15% at highway speed, because it adds frontal area and disturbs airflow where the car is otherwise cleanest. Remove an empty carrier rather than leaving it fitted between trips — it costs fuel even with nothing in it.",
    ],
    [
      "How many hours of driving is safe in one day?",
      "Most road-safety guidance caps a single driver at about 8 to 10 hours behind the wheel in a day, with a break of at least 15 minutes every two hours. A 1,000 km round trip at an average 60 km/h is nearly 17 hours of driving, which needs either two drivers or an overnight halt.",
    ],
  ],
};

export default seo;
