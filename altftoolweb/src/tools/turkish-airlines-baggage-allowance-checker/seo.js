const seo = {
  intro:
    "This checker tests your bags against Turkish Airlines' published cabin and check-in limits and reports how many kilograms or pieces you are over. Turkish uses a weight concept on most of its network — 15 kg on domestic Türkiye sectors, typically 20 kg to 30 kg on international Economy and 30 kg or 40 kg in Business, shared across every checked bag together — and switches to piece rules of 2 × 23 kg or 2 × 32 kg on journeys to and from the Americas. Cabin baggage is 8 kg at 55 × 40 × 23 cm, a kilogram more generous than most carriers, plus a small accessory bag of up to 40 × 30 × 15 cm.",
  useCases: [
    "Checking whether an Istanbul–Delhi 30 kg allowance covers two cases before buying extra weight online.",
    "Confirming a carry-on fits 55 × 40 × 23 cm and 8 kg rather than the 7 kg most other airlines apply.",
    "Planning a Türkiye connection to New York where the allowance becomes two counted 23 kg bags instead of pooled kilos.",
  ],
  benefits: [
    ["The 8 kg cabin rule", "Uses Turkish's own cabin weight rather than the industry-standard 7 kg other calculators assume."],
    ["Weight and piece routes", "Weight-concept sectors and Americas piece-concept sectors are handled as separate systems."],
    ["Per-piece ceiling flagged", "A bag over 32 kg is called out as unacceptable rather than merely priced as excess."],
  ],
  faqs: [
    [
      "What is the Turkish Airlines baggage allowance?",
      "On most routes it is a single weight covering all your checked bags together: 15 kg on domestic Türkiye flights, commonly 20 kg, 25 kg or 30 kg on international Economy depending on the route and fare, and 30 kg or 40 kg in Business. Flights to and from the Americas use piece rules instead — two bags of 23 kg in Economy and two of 32 kg in Business.",
    ],
    [
      "How much hand luggage can I take on Turkish Airlines?",
      "Economy allows one cabin bag up to 8 kg measuring no more than 55 × 40 × 23 cm, plus one small accessory item such as a handbag or laptop bag up to 40 × 30 × 15 cm. Business allows two cabin pieces of 8 kg each on the same size rule. The 8 kg figure is worth noting because most airlines cap cabin bags at 7 kg.",
    ],
    [
      "How is Turkish Airlines excess baggage charged?",
      "On weight-concept routes it is a per-kilogram charge on everything over the free allowance, set by route band, and weight bought in advance through Manage Booking costs less per kilo than the same weight paid for at the airport desk. On Americas piece-concept routes you pay per additional bag instead. This tool takes the amount as an input so you can price your own sector.",
    ],
    [
      "Can I split my Turkish Airlines allowance across two suitcases?",
      "Yes on weight-concept routes — the allowance is a total, so 30 kg can be two 15 kg cases or three 10 kg ones, and passengers on the same booking can usually have their allowances pooled at check-in. No single piece may exceed 32 kg or 158 cm of length plus width plus height, and on Americas piece-concept routes the number of bags is capped regardless of how little each weighs.",
    ],
  ],
};

export default seo;
