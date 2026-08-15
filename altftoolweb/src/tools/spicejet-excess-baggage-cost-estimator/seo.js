const seo = {
  title: "SpiceJet Excess Baggage Calculator: Counter",
  metaDescription:
    "Prices extra kilos at the per-kg counter rate against a pre-booked 3, 5, 10, 15, 20 or 30 kg block, and adds cabin weight over 7 kg moved to the hold.",
  steps: [
    "Pick your ticket's free allowance — Domestic economy (15 kg), Domestic SpiceMax (20 kg), an international 20 kg or 30 kg sector, a hand-baggage-only fare, or Custom — then enter passengers, total checked weight, cabin bag weight and the heaviest single bag.",
    "Overwrite \"Counter rate (INR per kg)\" and \"Pre-booked rate (INR per kg)\" with the figures from your own booking page (they start at 500 and 400), and leave \"Pool the allowance across everyone on the booking\" ticked for a family PNR.",
    "The headline names the cheaper of \"Cheapest: pre-book online\" and \"Cheapest: pay at the counter\", with cabin overage moved to the hold, excess rounded up to whole kilos, unused pre-booked weight, and a price ladder for the 3, 5, 10, 15, 20 and 30 kg blocks.",
  ],
  intro:
    "This estimator prices the extra kilograms on a SpiceJet booking twice — at the per-kilogram counter rate and as a pre-booked baggage block bought before travel — and reports which is cheaper. It applies the rules that actually decide the bill: the counter rounds a part kilogram up to a whole kilogram, pre-booked weight is only sold in fixed blocks per passenger, and a cabin bag over the 7 kg limit is sent to the hold where it is charged as checked weight. Every rate is editable so you can use the figures from your own booking page.",
  useCases: [
    "Deciding at home whether to pre-book 5 kg online or take your chances at the check-in scale.",
    "Working out the real cost when the cabin bag is 3 kg over and the gate makes you check it.",
    "Splitting a family booking's bags so the pooled allowance is used properly instead of paying twice.",
  ],
  benefits: [
    ["Cabin overage priced too", "Adds the weight above the 7 kg cabin limit to the checked total, the way the gate does."],
    ["Blocks, not kilograms", "Shows the block you are forced to buy and the kilos of it you will not use."],
    ["Says which option wins", "Names the cheaper of counter and pre-booked instead of assuming pre-booking always saves."],
  ],
  faqs: [
    [
      "What is the SpiceJet excess baggage charge per kg?",
      "Domestic excess is charged per kilogram at the check-in counter, with the published rate sitting around ₹500 per kilogram in recent fare sheets. Weight bought in advance through manage-booking is charged at a lower per-kilogram rate. Because the rate changes with the fare sheet and by sector, type the figure your booking page shows into the calculator rather than relying on a stored number.",
    ],
    [
      "How much free baggage does a SpiceJet ticket include?",
      "A standard domestic economy ticket includes 15 kg of checked baggage per passenger plus one 7 kg cabin bag and a small personal item; SpiceMax seats carry a larger checked allowance, and international sectors are commonly 20 kg to 30 kg. Hand-baggage-only fares include no free checked allowance, so the first kilogram in the hold is chargeable.",
    ],
    [
      "What happens if my cabin bag is over 7 kg?",
      "It gets tagged and sent to the hold at the gate or the check-in desk, and its weight is then assessed against your checked allowance — so a 10 kg cabin bag effectively adds 3 kg of chargeable excess if you are already at your limit. Gate-side charges are settled at the counter rate, which is why moving the heavy items into a checked bag before you leave home is cheaper.",
    ],
    [
      "Is pre-booking extra baggage always cheaper than paying at the airport?",
      "No. The per-kilogram rate is lower when you pre-book, but weight is sold in blocks of 3, 5, 10, 15, 20 and 30 kg, so a 1 kg or 2 kg overweight can cost more to pre-book than to pay for at the desk. Pre-booking clearly wins once you are around 5 kg or more over, and it is the only way to avoid a queue at the excess baggage counter.",
    ],
  ],
};

export default seo;
