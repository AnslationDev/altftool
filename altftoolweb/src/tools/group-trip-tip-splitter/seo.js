const seo = {
  title: "Split Group Trip Tips by Who Was Actually There",
  metaDescription:
    "Split each tip only between the travellers who were there, net off who paid, and settle in at most one fewer transfer than people. Whole-cent arithmetic.",
  steps: [
    "Name each traveller, adding rows with Add traveller, and start a line for every tip with Add a shared tip.",
    "Per tip fill What was it for, the Tip amount, Who paid it (or Nobody yet — collect into a kitty) and tick Who was there.",
    "Settle up lists the fewest transfers that clear the balances and Per traveller shows each net position; press Copy split.",
  ],
  intro:
    "This splitter divides each shared travel tip only among the travellers who were actually present, nets that against who has already paid, and reduces the resulting web of debts to a small number of transfers that clears it — at most one fewer than the number of people. All the arithmetic runs in whole cents, so the individual shares always add back up to the exact total instead of drifting by a penny the way a decimal split does. It is for groups where attendance varies: one person skipped the group dinner, two took the private guide, everyone chipped in for the porter.",
  useCases: [
    "Settle a week of shared restaurant, guide and porter tips at the end of a trip when different people paid on different nights.",
    "Split a dinner tip fairly when two of the six travellers ate elsewhere that evening.",
    "Work out what each person owes into a kitty for tips nobody has fronted yet.",
  ],
  benefits: [
    ["Only splits between people who were there", "Attendance is set per tip line, so nobody subsidises a meal they skipped."],
    ["Few transfers to settle", "Uses greedy debt simplification, so five people settle in at most four payments rather than twenty."],
    ["Exact to the cent", "Shares are allocated in integer minor units and the leftover cents are handed out deterministically, so the split always reconciles."],
  ],
  faqs: [
    [
      "How do you split tips fairly in a group when not everyone eats together?",
      "Split each tip only among the people at that meal, rather than dividing the trip total by the group size. Then subtract what each person already paid to get a net balance, and settle those balances directly. Someone who skipped two of eight dinners should carry six shares, not eight.",
    ],
    [
      "How do you handle the leftover cent when a bill will not divide evenly?",
      "Give it to someone, deterministically. Splitting $10.00 three ways gives $3.34, $3.33 and $3.33 — the extra cent goes to the first person in the list. Rounding each share to $3.33 instead loses a cent and the split no longer reconciles, which is exactly the error that causes arguments at the end of a trip.",
    ],
    [
      "What is the smallest number of payments needed to settle a group?",
      "At most one fewer than the number of people — that is a guaranteed worst-case cap, not always the true theoretical minimum. With five travellers, four transfers always suffice, because each payment can fully settle at least one person's balance. Matching the largest debtor against the largest creditor repeatedly reaches that bound reliably, though a smarter (and much slower) search can occasionally find one or two fewer transfers.",
    ],
    [
      "Should tips be split evenly or by what each person consumed?",
      "For a shared service tip — a guide, a driver, a porter, a table's waiter — splitting evenly among those present is the normal convention, because the service was given to the group rather than per plate. Splitting a tip in proportion to what each person ordered is unusual and generally only worth doing when one person's order dwarfs the rest.",
    ],
  ],
};

export default seo;
