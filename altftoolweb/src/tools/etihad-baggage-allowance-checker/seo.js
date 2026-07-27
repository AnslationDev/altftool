const seo = {
  intro:
    "This checker tests your bags against Etihad Airways' published cabin and check-in limits and reports the shortfall in kilograms or pieces. Etihad uses a weight concept across most of its Abu Dhabi network — one total figure covering every checked bag together — but switches to a piece concept on journeys touching the United States, Canada and Brazil, where the allowance becomes 2 × 23 kg in Economy and 2 × 32 kg in Business. Cabin baggage is checked separately at 7 kg and 50 × 40 × 21 cm in Economy, or two pieces under a 12 kg combined limit in Business and First.",
  useCases: [
    "Deciding whether a 25 kg weight allowance stretches across two half-full cases before paying to add weight.",
    "Checking an Abu Dhabi–New York itinerary where the allowance switches from pooled kilos to two counted bags.",
    "Measuring a cabin case against 50 × 40 × 21 cm, which is tighter in depth than most airlines' carry-on gauge.",
  ],
  benefits: [
    ["Both Etihad systems", "Weight-concept and Americas piece-concept routes are modelled separately, not blended."],
    ["Per-piece ceiling flagged", "A bag over 32 kg is called out as unacceptable rather than just priced as excess."],
    ["Combined cabin weight", "Business and First are judged on the 12 kg two-piece total instead of an invented per-bag figure."],
  ],
  faqs: [
    [
      "What is the Etihad baggage allowance in Economy?",
      "On most routes Etihad Economy has a weight allowance — commonly between 23 kg and 35 kg depending on the fare family — shared across any number of checked bags, plus one 7 kg cabin bag at 50 × 40 × 21 cm and a small personal item. On flights to and from the United States, Canada and Brazil the allowance becomes two checked pieces of 23 kg each instead.",
    ],
    [
      "How much is Etihad excess baggage?",
      "Excess is charged per kilogram over the free allowance on weight-concept routes and per extra piece on piece-concept routes, with prepaid weight bought through Manage My Booking costing less per kilo than the same weight paid for at the airport. The rate varies by route, so this tool takes it as an input rather than storing a figure that would quickly go stale.",
    ],
    [
      "Can I take two cabin bags on Etihad?",
      "In Economy you get one cabin bag up to 7 kg plus a small personal item such as a handbag or laptop bag. Business and First are a genuine two-piece cabin allowance, but with a combined weight limit of 12 kg across both items rather than 12 kg each, so a heavy laptop bag eats into what the main cabin bag can weigh.",
    ],
    [
      "Is there a weight limit for a single Etihad suitcase?",
      "Yes, 32 kg. That is a manual-handling limit for ground staff, so it applies no matter how much extra allowance you have paid for — a bag heavier than 32 kg has to be repacked into two before check-in will accept it. The size limit for one checked piece is 158 cm of length plus width plus height.",
    ],
  ],
};

export default seo;
