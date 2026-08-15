const seo = {
  title: "Nagpur Auto & Cab Fare: RTA Meter + 25% Night Charge",
  metaDescription:
    "Price a Nagpur auto, shared auto or app cab on the RTA meter card — minimum fare, per-km rate, waiting time and the midnight-to-5am 25% night charge.",
  steps: [
    "Pick the Vehicle — \"Auto rickshaw — RTA meter (whole vehicle)\", \"Shared auto — per seat on a fixed route\" or an app option such as \"Auto on an app (Ola / Uber / Rapido)\" — and enter \"Trip distance (km)\", or tap a Common Nagpur runs chip like \"Nagpur Jn to NAG airport · 8 km\".",
    "Set \"Pickup time (24-hour)\", Passengers, \"Waiting time (minutes)\", \"Ride time (minutes)\", \"Surge multiplier\" and \"Tolls and parking (₹)\", then open \"Adjust the rate card\" to overwrite the minimum fare, distance included in it, rate per extra km, waiting rate and \"Night charge (% of meter)\" with the card printed in your vehicle.",
    "Read the Estimated fare and its fair range, with rows for Distance fare, Waiting charge, Night charge, Surge, Fare per seat, Seats billed, Effective cost per km and \"Usually rounded up to\"; a midnight-to-5 am pickup shows the night-charge badge, and \"Copy result\" copies the breakdown.",
  ],
  intro:
    "This estimator prices a Nagpur trip on the meter structure the Regional Transport Authority uses — a minimum fare covering the first stretch of the ride, a per-kilometre rate beyond it, waiting time billed by the minute, and Maharashtra's statutory 25% night charge between midnight and 5 am. Shared autos, which carry a large share of Nagpur's passengers on fixed routes, are priced per seat rather than per vehicle, and app cabs are modelled the aggregator way with base fare, distance, ride minutes and a demand multiplier. Auto tariffs in Maharashtra are revised region by region using the Hakim Committee formula, so every rupee figure here is editable against the card printed inside your vehicle.",
  useCases: [
    "Check whether the fare an auto driver quotes for the 8 km run from Nagpur Junction to the airport matches the meter card.",
    "Work out the 25% night charge on a 2 am station pickup before you argue about it at the destination.",
    "Compare three seats on a shared auto against hiring the whole vehicle for a Sitabuldi to MIHAN run.",
  ],
  benefits: [
    [
      "Statutory night window built in",
      "Maharashtra's charge runs midnight to 5 am, not 11 pm, so a 23:30 pickup is correctly priced at the day rate.",
    ],
    [
      "Shared autos priced per seat",
      "The per-seat fare is multiplied by the number of passengers, which is how a fixed-route shared auto actually bills.",
    ],
    [
      "Editable RTA card",
      "Nagpur RTA revises the figures periodically, so the minimum fare, per-kilometre rate and waiting rate can all be overwritten with the current card.",
    ],
  ],
  faqs: [
    [
      "What is the night charge for autos in Nagpur?",
      "25% above the metered fare, and in Maharashtra the window runs from midnight to 5 am — not from 11 pm as it does in Delhi. A trip that meters ₹100 becomes ₹125 inside that window, and the surcharge applies to the meter reading only, not to tolls or parking paid separately.",
    ],
    [
      "Who decides the auto fare in Nagpur?",
      "The Regional Transport Authority for the Nagpur region sets it, which is why the card differs from Mumbai's. Revisions are calculated with the Hakim Committee formula, which ties the fare to fuel and CNG prices, vehicle and maintenance cost, insurance, permit cost and a notional driver income, so the figures change whenever those inputs move.",
    ],
    [
      "Is a shared auto cheaper than hiring one in Nagpur?",
      "For one or two people on a route a shared auto already serves, yes — you pay only for your seat rather than the whole vehicle. Once three or four of you are travelling together the per-seat fares add up, and hiring the auto outright is usually similar or cheaper while letting you go door to door instead of along the fixed route.",
    ],
    [
      "What should I do if the driver refuses to use the meter?",
      "Agree the fare before the trip starts and compare it against the per-kilometre card. Refusal to ply by the meter is a permit-condition violation that can be reported to the Nagpur RTO or on the traffic police helpline, with the vehicle number and time of the incident. This is general information, not legal advice.",
    ],
  ],
};

export default seo;
