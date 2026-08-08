const seo = {
  title: "British Airways Baggage Allowance Checker by Piece",
  metaDescription:
    "Counts bags the way BA does: 56x45x25 cm cabin bag, 40x30x15 cm handbag, 90x75x43 cm checked pieces at 23 kg or 32 kg, extra-bag and heavy-bag fees apart.",
  steps: [
    "Pick your Cabin, fare or route from the fare list, then tick I am carrying one under Cabin bag and Personal item and give each one a Weight (kg) plus Length, Width and Height in cm.",
    "Press Add bag for each hold piece — up to 8 — and enter its weight and three dimensions; under Excess baggage pricing choose the Currency and enter the Fee per extra bag and Fee per overweight bag your own booking quotes, since BA prices those by route and purchase date.",
    "The result headline shows Excess checked weight in kg with either \"Everything is within the published allowance\" or the number of things to fix, a breakdown of Fare / route, Cabin bag, Personal item and Free checked allowance, and a Bag-by-bag table marking every piece Fits or Too big. Copy result copies it.",
  ],
  intro:
    "This checker tests your bags against British Airways' piece-based allowance, which counts bags rather than pooling kilograms. It separates the two things that get charged differently — an extra piece beyond what your fare includes, and a heavy bag over its 23 kg or 32 kg ceiling — and applies the 90 × 75 × 43 cm size rule that BA measures with wheels and handles included. Hand baggage is checked too: one 56 × 45 × 25 cm cabin bag plus one 40 × 30 × 15 cm handbag or laptop bag, each up to 23 kg, on every fare including hand-baggage-only tickets.",
  useCases: [
    "Working out whether splitting one 30 kg case into two 15 kg cases helps or costs more on a 1-bag World Traveller fare.",
    "Checking a hard case against 90 × 75 × 43 cm before a Club World flight, since BA measures the wheels and handles too.",
    "Confirming that a hand-baggage-only Basic fare still lets you take both cabin bags into the aircraft.",
  ],
  benefits: [
    ["Pieces, not pooled kilos", "Counts bags the way BA does, so two light cases are correctly shown as two pieces."],
    ["Extra bag and heavy bag apart", "The two charges are calculated separately instead of being merged into a single fee."],
    ["Wheels-and-handles sizing", "The 90 × 75 × 43 cm test is applied in any orientation, matching how the gauge is used."],
  ],
  faqs: [
    [
      "What is the British Airways baggage allowance?",
      "Every BA fare includes two hand baggage items — a cabin bag up to 56 × 45 × 25 cm and a handbag or laptop bag up to 40 × 30 × 15 cm, each up to 23 kg. Checked allowance depends on the cabin and fare: hand-baggage-only Basic tickets include none, Euro Traveller and World Traveller include one 23 kg bag, World Traveller Plus two 23 kg bags, Club Europe and Club World two 32 kg bags, and First three 32 kg bags.",
    ],
    [
      "How much does an extra bag cost on British Airways?",
      "Extra bags are priced per piece by route band, and buying one in Manage My Booking before you get to the airport is consistently cheaper than paying at the check-in desk. Because the amount changes by route and by how far ahead you buy, this tool takes the fee as an input — enter the figure your booking quotes rather than a stored average.",
    ],
    [
      "What happens if my British Airways bag is over 23 kg?",
      "A bag between 23 kg and 32 kg in an economy cabin is accepted but attracts a heavy bag charge, applied per bag rather than per kilogram. Nothing over 32 kg is accepted at all, in any cabin, because that is a manual-handling limit for the ground crew — the bag has to be repacked into two pieces first.",
    ],
    [
      "Does the British Airways cabin bag size include wheels and handles?",
      "Yes. Both the 56 × 45 × 25 cm cabin bag limit and the 90 × 75 × 43 cm checked bag limit are measured with wheels, handles and side pockets included, which is why a case sold as \"cabin size\" can still fail at the gauge. You also need to be able to lift your own cabin bag into the overhead locker unaided.",
    ],
  ],
};

export default seo;
