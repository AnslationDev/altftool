const seo = {
  intro:
    "This checker tests your bags against Thai Airways' published cabin and check-in limits and reports how far over you are. Thai uses a weight concept on almost the whole network — a single allowance in kilograms, from 20 kg on the cheapest Economy fares up to 50 kg in Royal First, shared across every checked bag — and switches to IATA piece rules of 2 × 23 kg or 2 × 32 kg on journeys to and from the Americas. The cabin bag is judged against two rules at once: 56 × 45 × 25 cm per side and 115 cm for the three sides added together, so a case built to the maximum on every side measures 126 cm and fails.",
  useCases: [
    "Testing a carry-on that passes a generic 56 × 45 × 25 cm gauge against TG's tighter 115 cm total rule.",
    "Checking whether a 20 kg Economy Saver allowance covers a suitcase plus a box of duty-free before adding weight.",
    "Planning a Bangkok–Los Angeles trip where the allowance becomes two counted bags rather than pooled kilos.",
  ],
  benefits: [
    ["Both cabin size rules", "The per-side triple and the 115 cm total are applied together, the way the airline states them."],
    ["Weight and piece routes", "Regional weight-concept sectors and Americas piece-concept sectors are handled separately."],
    ["No stale fee baked in", "Excess is priced at the rate you enter, since Thai's per-kilo charge varies sharply by route band."],
  ],
  faqs: [
    [
      "What is the Thai Airways baggage allowance?",
      "On most routes it is a total weight covering all your checked bags together: around 20 kg on the cheapest Economy fares and domestic Thailand sectors, 30 kg on standard and flexible Economy, 40 kg in Premium Economy and Royal Silk Business, and 50 kg in Royal First. Flights to and from the Americas use piece rules instead — two bags of 23 kg in Economy and two of 32 kg in the premium cabins.",
    ],
    [
      "What size cabin bag does Thai Airways allow?",
      "One piece up to 7 kg that fits within 56 × 45 × 25 cm and whose length, width and height add up to no more than 115 cm. Both tests have to pass, which catches a lot of luggage: a suitcase at the full 56 × 45 × 25 cm totals 126 cm and would be refused, so aim for roughly 55 × 38 × 22 cm or smaller.",
    ],
    [
      "How much is excess baggage on Thai Airways?",
      "Excess weight is charged per kilogram over the free allowance, at a rate set by route band, so the same extra 5 kg costs very different amounts on a domestic Thai sector and a long-haul European one. Buying extra weight in advance through Manage My Booking is normally cheaper than paying at the check-in counter — this tool takes the rate as an input so you can price your own sector.",
    ],
    [
      "Can two passengers share a Thai Airways baggage allowance?",
      "On weight-concept routes, passengers travelling together on the same booking can normally have their allowances pooled at check-in, so a 22 kg bag and a 38 kg bag can clear a 2 × 30 kg pool. Pooling does not lift the 32 kg ceiling on any single piece, and it is granted at the airline's discretion, so confirm it at the counter rather than planning around it.",
    ],
  ],
};

export default seo;
