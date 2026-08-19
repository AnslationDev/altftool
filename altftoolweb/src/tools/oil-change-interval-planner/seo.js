const seo = {
  title: "Oil Change Interval Planner: Distance vs Time",
  metaDescription:
    "Work out the next oil change from the km and month limits together, shortened for severe service but never below half the normal interval.",
  steps: [
    "Pick the 'Engine oil type' — Mineral (20W-40 / 20W-50) at 5,000 km / 6 months, Semi-synthetic (10W-30 / 10W-40) at 7,500 km / 9 months, Fully synthetic (5W-30 / 0W-20) at 10,000 km / 12 months or Long-life synthetic at 15,000 km — then enter 'Kilometres since last change', 'Months since last change' and 'Average kilometres per month'.",
    "Under Driving conditions tick everything that covers at least half your running; each shows its factor, from ×0.75 for mostly short trips under 8 km to ×1.1 for steady highway running, and the combined factor is clamped so the interval never falls below half the normal figure.",
    "Read 'Change due in' with the percent-used bar, then the 'Normal (manual) interval', 'Your adjusted interval', 'Distance limit reached in', 'Time limit reached in' and 'Limit that hits first' rows, and press 'Copy result'.",
  ],
  intro:
    "The Oil Change Interval Planner works out when your engine oil is actually due by applying the manufacturer's dual limit — a distance limit and a time limit, whichever arrives first — and then shortening it for severe-service conditions such as short trips, dust, towing and long idling. Enter your oil grade, the kilometres and months since the last drain, and your average monthly running to see how much of the interval is already used. It is built for owners who drive nothing like the manual's 'normal service' assumption and want a defensible interval rather than a guess.",
  useCases: [
    "A city commuter doing 6 km each way wants to know why a 10,000 km synthetic interval is unrealistic for their car",
    "A driver who bought a used car with no service history needs a starting interval before the first drain",
    "A weekend highway driver checking whether the calendar limit will expire before the odometer limit does",
  ],
  benefits: [
    ["Both limits, not one", "Shows the distance limit and the time limit side by side and flags which one hits first."],
    ["Severe service applied", "Short trips, dust, towing, heat and idling each cut the interval by a stated factor."],
    ["Never over-shortens", "Combined severity is clamped at half the normal interval, matching standard manufacturer guidance."],
  ],
  faqs: [
    [
      "How often should I change engine oil?",
      "Follow whichever comes first: the distance limit or the time limit in your owner's manual. Typical normal-service figures are around 5,000 km or 6 months on mineral oil, 7,500 km or 9 months on semi-synthetic, and 10,000 km or 12 months on fully synthetic — but the manual for your exact engine is the authority.",
    ],
    [
      "Do I need to change oil if I hardly drive?",
      "Yes. Oil degrades on the calendar as well as the odometer, because additives oxidise and condensation and fuel dilution build up in a sump that never gets hot. A car that covers 2,000 km in a year still needs the time-based change, which is why every manual states months alongside kilometres.",
    ],
    [
      "What counts as severe service?",
      "Manuals typically list repeated short trips where the engine never fully warms up, extended idling in stop-go traffic, dusty or unpaved roads, towing or carrying maximum load, and sustained extreme heat. Each of those shortens the safe interval; the common rule is to shorten it but not below half the normal figure.",
    ],
    [
      "Is synthetic oil worth the longer interval?",
      "Fully synthetic oil resists oxidation and shear better, which is why manufacturers approve longer drains on it — commonly 10,000 km against 5,000 km for mineral. It only pays off if your engine is specified for that grade; putting long-drain oil in an engine whose manual calls for a shorter interval does not extend the interval. Check the manual or ask your service adviser before switching.",
    ],
  ],
};

export default seo;
