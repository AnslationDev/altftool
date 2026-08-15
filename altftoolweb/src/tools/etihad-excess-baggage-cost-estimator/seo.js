const seo = {
  title: "Etihad Excess Baggage Calculator: Advance",
  metaDescription:
    "Price your excess kilos through every advance weight block and against the airport desk rate, and see which route actually costs least.",
  steps: [
    "Pick your free checked allowance per passenger, then enter total checked weight and the heaviest single bag in kg.",
    "Enter the advance rate per kg and the airport rate per kg shown on your own Etihad booking, in your chosen currency.",
    "Read the Every option priced table for kilos bought, left for the desk and unused per block, then press Copy result.",
  ],
  intro:
    "This estimator prices the kilograms above your Etihad checked allowance through every advance weight block and through the airport desk, then reports which costs least. Two rules drive the answer: advance weight is sold in fixed blocks per passenger, so a small overweight forces you up to the next block and part of what you buy goes unused, while the desk bills the actual kilos with a part kilogram rounded up. Anything a block does not cover is still settled at the airport rate, which is why the smallest block that fits is often not the cheapest choice.",
  useCases: [
    "Deciding whether a 6 kg overweight is better covered by a 5 kg block plus one kilo at the desk, or by a 10 kg block.",
    "Checking how much of a large move-abroad load falls beyond the biggest advance block and has to be paid at the airport.",
    "Splitting a family's excess across passengers on one booking to see whether smaller blocks each beat one large one.",
  ],
  benefits: [
    ["Every option shown", "All blocks and the pay-at-the-desk route are priced side by side, not just the recommendation."],
    ["Block waste made visible", "You see exactly how many kilos of a block go unused before you commit to buying it."],
    ["Advance ceiling handled", "Weight beyond the largest block is priced at the airport rate rather than quietly ignored."],
  ],
  faqs: [
    [
      "How much does Etihad charge for excess baggage?",
      "Excess is charged per kilogram over the free allowance, at a rate set by route, and weight bought in advance through Manage My Booking costs less per kilo than the same weight weighed at the airport desk. Because the rate varies widely between routes and points of sale, this tool takes both rates as inputs rather than storing a figure that would quickly be wrong.",
    ],
    [
      "Is it cheaper to buy Etihad extra baggage online or at the airport?",
      "Buying in advance is normally cheaper per kilogram, but not always cheaper overall. Advance weight comes in fixed blocks per passenger, so a 1 kg overweight may cost more as a 5 kg block than it does paid for at the desk. The comparison table here prices both routes on your actual numbers so you can see where the crossover falls.",
    ],
    [
      "Can I add baggage after booking an Etihad flight?",
      "Yes — extra weight can normally be added through Manage My Booking up to a few hours before departure, and it is cheaper than paying at check-in. Once you are at the desk the airport rate applies to every excess kilogram with no block discount available, so adding weight the moment you know you are over is the cheaper habit.",
    ],
    [
      "Does buying extra baggage let me check a heavier suitcase?",
      "No. Extra allowance raises the total weight you may check in, never the weight of any one bag. A single piece over 32 kg is refused at check-in on manual-handling grounds regardless of what you have paid, so a 40 kg trunk still has to be repacked into two bags.",
    ],
  ],
};

export default seo;
