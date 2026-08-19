const seo = {
  title: "EV Road-Trip Charge Planner: Stops, kWh & Reserve",
  metaDescription:
    "Enter each leg's distance and your kWh/100 km. It carries state of charge forward, adds a stop below your 80% target and totals the kWh.",
  steps: [
    "Type the route into the 'Route legs' box, one line per leg as 'Leg | distance km' — it opens with 'Home to Stop 1 | 180' and two more legs.",
    "Set 'Usable battery (kWh)', 'Consumption (kWh/100 km)', 'Start state of charge (%)', 'Arrival reserve (%)' and 'Charge-to target at stops (%)' — 60, 18, 90, 15 and 80 by default; the result recomputes as you type.",
    "Read the total shown as 'kWh planned stop charging' above a table of Leg, km, Energy, Arrival SOC, Reserve and Charge before next, then Copy or Download it as ev-road-trip-charge-planner.txt.",
  ],
  intro:
    "This planner walks a road trip leg by leg and tracks state of charge: each leg's energy is distance × consumption in kWh/100 km, that energy is subtracted from the pack as a percentage, and wherever you would arrive below your charge-to target a stop is added to bring the battery back up to it. Every leg is flagged against the arrival reserve you set, and the kWh you will need to buy across all stops is totalled. It is for EV drivers sizing up a long trip before they leave, to see how many charging stops the route really needs.",
  useCases: [
    "Planning a 550 km drive in a 60 kWh car and wanting to know whether two charging stops are enough or a third is unavoidable",
    "Testing whether leaving at 90% instead of 100% still keeps every leg above a 15% arrival reserve in winter, when consumption climbs",
    "Comparing a motorway route with long legs against a slower route with more frequent chargers, by entering both leg lists and counting the stops",
  ],
  benefits: [
    ["State of charge carried forward", "Each leg starts from the SOC the previous leg ended on, so a short leg after a big charge is treated correctly instead of every leg being priced from full."],
    ["Reserve checked at every arrival", "Legs are marked above or below your arrival reserve individually, so you see exactly which one is the problem rather than a single pass or fail."],
    ["Charging targeted, not maxed", "Stops charge only up to the target you set — 80% by default — which is where DC charging is still fast, and the tool totals the kWh that implies."],
  ],
  faqs: [
    [
      "What consumption figure should I enter?",
      "Use your own observed kWh/100 km rather than the WLTP or EPA figure, because motorway cruising is where the two diverge most. Typical real-world highway consumption sits around 18–22 kWh/100 km for a mid-size EV, rising sharply in cold weather and at higher speeds.",
    ],
    [
      "Why charge to 80% and not 100%?",
      "Because DC fast charging slows dramatically above roughly 80% state of charge as the car protects the cells, so the last 20% can take as long as the first 60%. On a long trip, more short stops to 80% is usually faster overall than fewer stops to 100%.",
    ],
    [
      "What arrival reserve should I plan for?",
      "Enough to reach an alternative charger if your planned one is broken or occupied — 10–20% is a common working range, and 15% is the default here. Set it higher for remote routes with sparse charging or in cold weather, where indicated range falls faster than expected.",
    ],
    [
      "Does this find actual chargers along my route?",
      "No — it is energy arithmetic on the legs and distances you type in, with no map, no charger database and no live availability. Use it to work out how many stops and how much energy the trip needs, then confirm real charger locations, connector types and status in a route planner or charging app before you drive.",
    ],
  ],
};

export default seo;
