const seo = {
  title: "Thai Airways Excess Baggage Cost: Per Kg or Per Piece",
  metaDescription:
    "Price excess baggage on the weight concept or the Americas piece concept, pooled across the booking, comparing prepaid blocks against the airport rate.",
  steps: [
    "Choose Weight concept (kg allowance) or Piece concept (Americas routes), then set Currency of the quoted rates, Passengers on the booking and Cabin and fare family.",
    "On a weight route fill Total checked baggage weight (kg), Heaviest single bag (kg), the Airport rate and Prepaid rate per kg, and the Prepaid block size sold (kg).",
    "See whether prepaying or the counter is cheaper against the pooled allowance, read the warning if any bag breaks the 32 kg ceiling, then press Copy result.",
  ],
  intro:
    "This estimator prices Thai Airways excess baggage under both systems the airline uses: the weight concept that covers most of the network, where every kilogram above the pooled allowance is billed per kilo, and the piece concept on routes touching the Americas, where you pay a flat fee for each additional bag and a separate flat fee for a bag over its 23 kg or 32 kg ceiling. On weight routes it compares buying the kilos in advance — sold in fixed blocks, so a purchase always rounds up — against settling at the check-in desk. Rates are entered by you, because Thai Airways prices excess by route band and by the currency of sale.",
  useCases: [
    "Deciding whether to prepay 10 kg before a Bangkok to London flight or hand over a card at the Suvarnabhumi counter.",
    "Working out what a third suitcase costs on a Bangkok to Los Angeles ticket, where the allowance is counted in pieces rather than kilos.",
    "Checking whether a family of three travelling on one booking can pool 90 kg between them and avoid any charge at all.",
  ],
  benefits: [
    ["Both baggage systems covered", "Weight concept and the Americas piece concept, each with the arithmetic that actually applies."],
    ["Block rounding made visible", "Prepaid weight sells in fixed blocks, so you see the block you have to buy and the kilos that go unused."],
    ["Pooling built in", "Allowances for everyone on the booking are added together, the way check-in assesses a party travelling on the same flight."],
  ],
  faqs: [
    [
      "How much does Thai Airways charge for excess baggage per kg?",
      "There is no single worldwide rate — Thai Airways sets excess charges by route band and by the currency of the point of sale, so an extra kilo on a Bangkok to Singapore sector costs a different amount from the same kilo to Frankfurt. What holds everywhere is that weight bought in advance is cheaper per kilogram than weight weighed at the check-in desk, which is why this tool prices both from the rate quoted on your own booking.",
    ],
    [
      "What is the Thai Airways checked baggage allowance?",
      "On weight-concept routes the published allowance is 20 kg on Economy Saver, 30 kg on Economy Standard and Flexible, 40 kg in Premium Economy and Royal Silk, and 50 kg in Royal First. On routes touching the Americas the allowance switches to pieces: normally two bags of up to 23 kg each in Economy and Premium Economy, and two of up to 32 kg in Royal Silk and Royal First. Promotional and codeshare fares can carry less, so the figure on your ticket is the one that counts.",
    ],
    [
      "Can passengers on the same Thai Airways booking share their baggage allowance?",
      "Yes. Passengers travelling together on the same booking and the same flight are assessed on their combined allowance, so two Economy Standard tickets give the pair 60 kg between them rather than 30 kg each. That means one 34 kg suitcase costs nothing extra if a companion checks only 24 kg — though the 32 kg per-piece ceiling still applies to that individual bag.",
    ],
    [
      "Will Thai Airways accept a suitcase heavier than 32 kg?",
      "No. A single piece over 32 kg is refused at a normal check-in desk on manual-handling grounds, and buying excess baggage does not create an exemption. The options are to repack the contents across two bags, each inside the ceiling, or to send the item as air cargo, which is booked separately from your ticket.",
    ],
  ],
};

export default seo;
