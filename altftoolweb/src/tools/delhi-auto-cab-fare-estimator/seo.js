const seo = {
  title: "Delhi Auto & Taxi Fare Calculator",
  metaDescription:
    "Price a Delhi trip on the notified meter: ₹25 for 1.5 km, ₹9.50 per km, ₹0.75 a minute waiting, and the 25% night charge from 11pm to 5am.",
  steps: [
    "Pick the Vehicle — auto rickshaw, black-and-yellow taxi or an app cab — then enter trip distance in km and the pickup time.",
    "Add waiting minutes, Large bags, Tolls and parking and a Surge multiplier, or tap a Common Delhi runs preset such as Connaught Place to IGI T3.",
    "Read the estimated fare with the 25% night surcharge applied, overwrite any figure in Delhi rate cards used, and press Copy result.",
  ],
  intro:
    "This estimator prices a Delhi trip on the meter tariff notified by the Transport Department, Government of NCT of Delhi: ₹25 covers the first 1.5 km in an auto rickshaw, ₹9.50 applies to every kilometre after that, waiting is billed at ₹0.75 a minute, and the whole metered amount goes up 25% between 11 pm and 5 am. Black-and-yellow taxis use the same structure at ₹25 for the first kilometre and ₹14 (non-AC) or ₹16 (AC) per kilometre. Switch the vehicle to an app cab and it prices the trip the way aggregators do — base fare, per kilometre, per ride minute and a demand multiplier — so you can see whether the quote on your screen is in the right range before you accept it.",
  useCases: [
    "Check whether the ₹250 an auto driver is asking for a 9 km run from Connaught Place to Lajpat Nagar is anywhere near the notified meter.",
    "Work out the night premium on a 1 am airport drop before booking, when the 25% surcharge window is live.",
    "Compare a surge-priced cab quote with the same trip at 1.0x to decide whether waiting fifteen minutes is worth it.",
  ],
  benefits: [
    [
      "Uses the notified meter",
      "The auto and taxi options follow the Delhi tariff card, not a guessed per-kilometre rate.",
    ],
    [
      "Night window handled correctly",
      "The 11 pm to 5 am surcharge wraps across midnight, so a 00:30 pickup is priced as night without any manual adjustment.",
    ],
    [
      "Editable rate card",
      "Every figure — base, per km, waiting, luggage, night percentage — can be overwritten to match the card in your vehicle or the breakdown in your app.",
    ],
  ],
  faqs: [
    [
      "What is the auto fare per km in Delhi?",
      "₹9.50 per kilometre after the first 1.5 km, which the ₹25 meter-down charge covers. A 5 km trip therefore meters at ₹25 + (3.5 × ₹9.50) = ₹58.25 before any waiting, luggage or night charge.",
    ],
    [
      "Is there a night charge for autos and taxis in Delhi?",
      "Yes — 25% on top of the metered fare between 11 pm and 5 am, for both autos and black-and-yellow taxis. A trip that meters ₹100 in the daytime becomes ₹125 inside that window, and the surcharge applies to the meter reading only, not to tolls or parking you pay separately.",
    ],
    [
      "Can an auto driver charge extra for luggage in Delhi?",
      "The notified tariff allows ₹7.50 per piece of luggage in an auto and ₹10 per piece in a black-and-yellow taxi, above a small free allowance. It is a flat per-bag charge, not a percentage, so it should be a few rupees rather than a round-number addition to the fare.",
    ],
    [
      "How much surge can an Ola or Uber charge in Delhi?",
      "Under the Delhi Motor Vehicle Aggregator and Delivery Service Scheme, 2023, a licensed aggregator may charge at most twice the base fare it has declared, and at least half of it. The earlier national Motor Vehicle Aggregator Guidelines, 2020 used a 1.5x ceiling. If a quote implies more than double the normal rate for that distance, it is worth checking the fare breakdown in the app.",
    ],
  ],
};

export default seo;
