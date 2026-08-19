const seo = {
  title: "British Airways Excess Baggage Cost Estimator",
  metaDescription:
    "Price extra, heavy (over 23 kg / 32 kg) and oversize bags per piece on a BA booking, compare prepaid against airport rates, and spot repacking savings.",
  steps: [
    "Pick your \"Cabin or fare\" — Euro Traveller / World Traveller 1 × 23 kg through First 3 × 32 kg — set \"Passengers on the booking\" and how many bags fall outside 90 × 75 × 43 cm, then weigh each case into its \"Bag N weight (kg)\" box, using \"Add bag\" for more.",
    "Under \"Charges on your route\" choose the Currency and replace the placeholder figures with the amounts your own booking quotes: Extra bag, Heavy bag and Oversize bag, each prepaid and at the airport.",
    "\"Cheapest total\" names the chargeable items, the \"Prepaid against airport\" table sets the two channels side by side, and the warnings flag bags over the 32 kg limit or weight you could shift between cases to drop a heavy-bag fee; \"Copy result\" copies the estimate.",
  ],
  intro:
    "This estimator prices British Airways checked baggage the way the airline actually bills it — per bag, not per kilogram. It separates the three charges that can apply, each levied per piece: an extra bag beyond the number your fare includes, a heavy bag over its 23 kg ceiling in economy cabins or 32 kg in Club and First, and an oversize bag outside 90 × 75 × 43 cm. Each is priced both prepaid in Manage My Booking and paid at the airport desk, so the saving from booking ahead is a number rather than a guess.",
  useCases: [
    "Deciding whether to buy a second bag online now or risk paying the higher airport rate on the day.",
    "Checking whether shifting 3 kg from a 26 kg case into a lighter one removes a heavy-bag charge entirely.",
    "Working out how many bags four people on one booking can check before an extra-piece charge starts.",
  ],
  benefits: [
    ["Per-piece maths", "Bags are counted the way BA counts them, so two light cases are not treated as one pooled weight."],
    ["Repacking check built in", "Tells you when evening out the weight across your bags removes the heavy-bag fee for free."],
    ["Both channels compared", "Prepaid and airport totals sit side by side with the saving shown in money and percent."],
  ],
  faqs: [
    [
      "How much does an extra bag cost on British Airways?",
      "Extra bags are charged per piece, with the amount set by route band, and buying one in Manage My Booking before you travel is consistently cheaper than paying at the check-in desk. Because BA revises the table and prices short-haul European routes very differently from long-haul, this tool takes the fee as an input so you can price the amount your own booking quotes.",
    ],
    [
      "What counts as a heavy bag on British Airways?",
      "A checked bag over 23 kg in Euro Traveller, World Traveller and World Traveller Plus, or over 32 kg in Club and First, attracts a heavy-bag charge levied per bag rather than per kilogram. Nothing over 32 kg is accepted in any cabin — that is a manual-handling limit for ground crew, so a heavier bag has to be repacked into two before check-in will take it.",
    ],
    [
      "Can passengers on one booking share their baggage allowance?",
      "Piece allowances add up across passengers travelling on the same booking, so two people each entitled to one 23 kg bag can check two bags between them however they like. What does not transfer is the per-bag weight ceiling: pooling gives you more pieces, never a heavier single bag.",
    ],
    [
      "Is it cheaper to pay for an extra bag or to pay the heavy bag charge?",
      "It depends on the fees on your route, which is exactly what this tool compares — but the free option is often overlooked. If your bags together weigh less than their combined ceilings, moving weight from the heavy bag into a lighter one removes the heavy-bag charge at no cost, and the estimator flags that case automatically.",
    ],
  ],
};

export default seo;
