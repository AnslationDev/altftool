const seo = {
  title: "Emirates Excess Baggage: Per Kg or Per Bag",
  metaDescription:
    "Price excess baggage per kg on weight-concept routes, or per bag on Americas piece routes, and compare prepaid 5 kg steps against the airport rate.",
  steps: [
    "Pick \"Weight concept (kg allowance)\" or \"Piece concept (Americas routes)\", then the Currency of the quoted rates and Passengers on the booking.",
    "On a weight route set the Fare brand / cabin, Total checked baggage weight (kg), Heaviest single bag (kg), Airport rate and Prepaid online rate; on a piece route set Checked pieces in total, Pieces over the per-bag weight limit and both piece fees.",
    "Read whether prepaying online or paying at the airport is cheaper, the chargeable excess over the allowance and the warnings, then press \"Copy result\".",
  ],
  intro:
    "This estimator prices Emirates excess baggage under both systems the airline uses: the weight concept that applies across most of the network, where kilograms above the fare brand's allowance are billed per kilogram, and the piece concept used on routes to and from the Americas, where you pay a flat fee for each additional bag and a separate flat fee for a bag over its weight ceiling. On weight-concept routes it also compares buying the weight in advance online — sold in 5 kg steps up to 50 kg per passenger — against paying at the airport counter. Rates are entered by you, because Emirates prices excess by route band and currency.",
  useCases: [
    "Checking whether prepaying 15 kg online beats the airport rate on a Dubai to South Asia sector.",
    "Working out the cost of a third suitcase on a Dubai to New York ticket where the allowance is counted in pieces, not kilos.",
    "Deciding whether to move 3 kg between two bags to avoid a flat overweight-piece fee on an Americas route.",
  ],
  benefits: [
    ["Both baggage systems in one place", "Weight concept and Americas piece concept, with the right arithmetic for each."],
    ["Prepaid step rounding shown", "Online weight is sold in 5 kg steps, so you see the step you must buy and what goes unused."],
    ["Currency you actually pay in", "Enter the rate in AED, USD, INR, GBP or EUR and read the result in the same currency."],
  ],
  faqs: [
    [
      "How much does Emirates charge for excess baggage per kg?",
      "There is no single rate — Emirates prices excess by route band and by the currency of the point of sale, so the same extra kilo costs a different amount on a Dubai to Mumbai sector than on a Dubai to London one. What is consistent is that weight bought in advance through manage-booking is cheaper per kilogram than weight weighed at the airport counter, which is why this tool prices both from the rate you enter.",
    ],
    [
      "What is the Emirates baggage allowance in Economy?",
      "On weight-concept routes it depends on the fare brand: Economy Special carries 20 kg, Saver 25 kg, Flex 30 kg and Flex Plus 35 kg, with Business at 40 kg and First at 50 kg. On routes to and from the Americas the allowance switches to pieces — typically two bags of up to 23 kg each in Economy and two of up to 32 kg in the premium cabins.",
    ],
    [
      "Can I buy extra baggage online before my Emirates flight?",
      "Yes. Prepaid excess baggage can be added through manage-booking up until shortly before departure, and it is sold in 5 kg steps up to a ceiling of 50 kg per passenger. Because it is sold in steps, covering 12 kg of excess means buying 15 kg, so a very small overweight can be cheaper to settle at the counter. Anything above the 50 kg ceiling has to be paid for at the airport.",
    ],
    [
      "Will Emirates accept a suitcase heavier than 32 kg?",
      "No. A single piece over 32 kg is refused at check-in on manual-handling grounds, regardless of how much excess baggage you have bought. On piece-concept routes a bag between its ceiling and 32 kg attracts a flat overweight fee, and above 32 kg the bag must be repacked or sent as cargo.",
    ],
  ],
};

export default seo;
