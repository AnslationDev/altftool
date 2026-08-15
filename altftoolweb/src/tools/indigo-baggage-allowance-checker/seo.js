const seo = {
  title: "IndiGo Baggage Allowance Checker: 15 kg, 7 kg Cabin",
  metaDescription:
    "Test every bag against IndiGo's 15 kg combined check-in, the 7 kg 55x35x25 cm cabin bag and the 32 kg single-piece cap, and price the excess.",
  steps: [
    "Pick your Fare / route — \"Domestic — standard fare (15 kg check-in)\", the hand baggage only fare, or an international sector — then give the Cabin bag its Weight (kg) and Length, Width and Height.",
    "Press Add bag for each checked piece and enter its weight and dimensions, tick \"I am carrying one\" if you have a personal item, and put the Excess rate per kg quoted in your booking under Excess baggage pricing.",
    "Excess checked weight headlines the verdict, with Fare / route, Cabin bag, Free checked allowance, Total checked weight and Estimated excess charge listed, plus a Bag-by-bag table of each piece's weight and size check; press Copy result.",
  ],
  intro:
    "This checker tests a bag's weight and its three dimensions against IndiGo's published cabin and check-in limits and reports the shortfall in kilograms. IndiGo works on a weight concept, not a piece concept: the free check-in allowance is one total figure — 15 kg on a standard domestic fare — that the sum of every checked bag must stay under, alongside one 7 kg cabin bag of 55 × 35 × 25 cm and a 3 kg personal article of 40 × 30 × 15 cm. Enter what your luggage scale and tape measure say and you get a bag-by-bag verdict plus an excess estimate at the rate you were quoted.",
  useCases: [
    "Deciding at home whether to move a kilo from the check-in bag to the cabin bag, before the counter charges for it.",
    "Checking a new hard-shell trolley against 55 × 35 × 25 cm before buying it for regular 6E domestic flights.",
    "Splitting a 34 kg bag into two after seeing that no single piece over 32 kg is accepted at the counter.",
  ],
  benefits: [
    ["Weight and size together", "Most counters reject on size, not weight — both are tested, in any orientation."],
    ["Weight concept made obvious", "Adds all checked pieces into one total, the way IndiGo actually applies the allowance."],
    ["Excess priced at your rate", "Enter the per-kilo figure your booking quotes instead of relying on a stale default."],
  ],
  faqs: [
    [
      "How much baggage is allowed on an IndiGo domestic flight?",
      "A standard IndiGo domestic fare includes 15 kg of check-in baggage plus one 7 kg cabin bag no larger than 55 × 35 × 25 cm and one personal article up to 3 kg and 40 × 30 × 15 cm. The 15 kg is a combined total across every checked piece, so two 8 kg bags already exceed it.",
    ],
    [
      "What is the excess baggage charge on IndiGo?",
      "IndiGo charges a per-kilogram rate on anything above the free allowance, and the airport rate is meaningfully higher than prepaid excess bought on the website or app before departure. Buy the extra weight online in advance if you already know a bag is heavy — the rate quoted in your booking flow is the one to enter here.",
    ],
    [
      "Can I carry two hand bags on IndiGo?",
      "One cabin bag plus one small personal article such as a laptop bag or handbag, not two cabin bags. A second full-size cabin bag has to go into the hold, and if it is presented at the gate it is tagged and checked in there, sometimes with a fee.",
    ],
    [
      "What is the maximum weight of a single checked bag on IndiGo?",
      "32 kg for one piece. That ceiling is a ground-handling limit rather than a pricing one, so paying for extra weight does not let a single 35 kg bag through — it must be repacked into two pieces, each within 158 cm of length plus width plus height.",
    ],
  ],
};

export default seo;
