const seo = {
  title: "Chennai Auto and Cab Fare Estimator",
  metaDescription:
    "Applies the notified auto meter — ₹25 for 1.8 km, ₹12/km after, ₹3 per 5 min waiting, 50% from 11 pm to 5 am — or prices an app cab with surge.",
  steps: [
    "Choose a Vehicle — Auto rickshaw (meter), Auto on an app (Ola / Uber / Rapido), or a hatchback, sedan or SUV cab — then type the Trip distance (km) or tap a Common runs chip such as Central to Airport · 20 km.",
    "Set the Pickup time (24-hour) so the 11 pm to 5 am night window is applied automatically, then Ride time (minutes), Waiting time (minutes), Surge multiplier where 1.0 means no surge (disabled for a street auto) and Tolls and parking (₹).",
    "Estimated fare gives the payable amount and a fair range for that distance, itemised as Distance fare, Ride-time charge, Waiting charge, Night surcharge, Surge, Minimum-fare top-up, Tolls and parking, Effective cost per km and Usually rounded up to, above a Chennai rate cards used table. Copy result copies it.",
  ],
  intro:
    "This estimator turns a Chennai trip into a rupee figure by applying the notified auto rickshaw meter — ₹25 for the first 1.8 km and ₹12 for every kilometre after it — plus the ₹3-per-five-minutes waiting charge and the 50% night surcharge that applies between 11 pm and 5 am. Switch the vehicle to an app auto, hatchback, sedan or SUV and it prices the same trip the way ride-hailing apps do, on base fare plus distance plus ride minutes with a surge multiplier. It is built for passengers who want to know whether a quote is fair before they get in.",
  useCases: [
    "Check whether the ₹250 an auto driver is asking for a 7 km run from Egmore to Adyar is anywhere near the meter.",
    "Work out the night premium on a 1 am airport run before booking, when the 50% surcharge window is live.",
    "Compare a surge-priced cab quote against what the same distance would cost at 1.0x before deciding to wait.",
  ],
  benefits: [
    ["Uses the notified meter", "The auto option follows the Tamil Nadu tariff card, not a guessed rate."],
    ["Night window handled correctly", "The 11 pm to 5 am surcharge wraps across midnight instead of being applied by hand."],
    ["Every line itemised", "Distance, ride time, waiting, night charge, surge and tolls are shown separately so you can see what is inflating the quote."],
  ],
  faqs: [
    [
      "What is the auto fare per km in Chennai?",
      "₹12 per kilometre after the first 1.8 km, which is covered by the ₹25 minimum fare. So a 5 km trip meters at ₹25 + (3.2 × ₹12) = ₹63.40, before any waiting or night charge.",
    ],
    [
      "Is there a night charge for autos in Chennai?",
      "Yes — 50% extra on the metered fare between 11 pm and 5 am. A trip that meters ₹100 in the daytime becomes ₹150 inside that window, and the surcharge applies to the meter reading only, not to tolls or parking you pay separately.",
    ],
    [
      "How much can an auto charge for waiting?",
      "₹3 for every five minutes of waiting, which works out to ₹36 an hour. Waiting time is meant to cover halts you ask for during the trip, not time the driver spends stuck in traffic while moving toward your destination.",
    ],
    [
      "Why is my Ola or Uber quote higher than the meter fare here?",
      "App cabs are not covered by the auto tariff notification. They add a per-minute ride-time charge to the per-kilometre rate, apply a surge multiplier when demand is high, and add GST and airport pick-up charges — which is why the same 10 km can cost twice the metered auto fare at 9 am. Fares and surcharges change without notice, so confirm the figure in the app before you ride.",
    ],
  ],
};

export default seo;
