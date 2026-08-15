const seo = {
  title: "Emirates Baggage Allowance Checker: Weight vs Piece",
  metaDescription:
    "Test cabin and checked bags against Emirates weight or Americas piece allowances, the 32 kg per-bag ceiling and the 150/300 cm size caps.",
  steps: [
    "Pick your Cabin, fare or route so the checker applies the weight allowance or the Americas piece allowance, then tick “I am carrying one” under Cabin bag and Personal item and give each its Weight (kg) and three dimensions.",
    "Under Checked bags press Add bag for each piece — up to 8 — with its weight and length, width and height, keeping every piece under 32 kg, 150 cm summed per bag and 300 cm across all bags; add your quoted Excess rate per kg, Fee per extra bag and Fee per overweight bag under Excess baggage pricing.",
    "Read “Excess checked weight” in kg with either “Everything is within the published allowance” or the count of things to fix, then Fare / route, Free checked allowance, Total checked weight and Estimated excess charge plus the Bag-by-bag table; Copy result copies it.",
  ],
  intro:
    "This checker tests your bags against the two different Emirates checked-baggage systems — the weight concept used on most of the network and the piece concept used to and from the Americas — and tells you exactly how many kilograms or how many pieces you are over. It also applies the size rules that catch people out: no single checked piece over 150 cm of length plus width plus height, and no more than 300 cm across all pieces added together. Cabin baggage is checked separately, at 7 kg and 55 × 38 × 20 cm in Economy, or two pieces under one combined weight ceiling in First and Business.",
  useCases: [
    "Working out whether a Dubai–London 30 kg weight allowance covers two half-packed suitcases before paying for a third.",
    "Checking a US-bound itinerary where the allowance switches to 2 × 23 kg pieces and a third bag becomes a separate charge.",
    "Testing three medium cases against the 300 cm combined size cap, which bites long before the weight allowance does.",
  ],
  benefits: [
    ["Both allowance systems", "Weight-concept and piece-concept sectors are modelled properly, not merged into one figure."],
    ["The 300 cm cap applied", "The combined size rule most calculators ignore is checked across every piece you enter."],
    ["Combined cabin weight", "Premium cabins are judged on the two-piece combined limit rather than a made-up per-bag figure."],
  ],
  faqs: [
    [
      "What is the Emirates baggage allowance?",
      "On most Emirates routes the checked allowance is a total weight — commonly 20 kg to 35 kg in Economy, 40 kg in Business and 50 kg in First — spread across any number of bags. On journeys to and from the Americas it switches to a piece allowance instead: 2 bags of 23 kg in Economy and Premium Economy, 2 bags of 32 kg in Business and First. The allowance printed on your own ticket is the one that applies.",
    ],
    [
      "How big can an Emirates checked bag be?",
      "No single checked piece may exceed 150 cm when you add length, width and height together, and all your checked pieces combined must not exceed 300 cm on the same measure. That combined cap is the rule travellers hit unexpectedly: three ordinary 105 cm cases already total 315 cm and would be refused even though each one is well inside the single-piece limit.",
    ],
    [
      "How much cabin baggage does Emirates allow in Economy?",
      "One piece up to 7 kg, no larger than 55 × 38 × 20 cm. First and Business are different: you may carry two pieces — one bag of the same size plus a briefcase up to 45 × 35 × 20 cm — with a combined weight limit of 12 kg rather than a separate limit on each item.",
    ],
    [
      "What happens if my Emirates suitcase is over 32 kg?",
      "It will not be accepted as a single piece. The 32 kg ceiling is a manual-handling rule that applies regardless of how much extra weight you have bought, so the bag has to be repacked into two before check-in. Buying additional allowance raises the total you may carry, never the weight of any one bag.",
    ],
  ],
};

export default seo;
