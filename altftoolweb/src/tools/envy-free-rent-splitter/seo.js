const seo = {
  intro:
    "This rent splitter takes a total rent, a list of housemates and each person's preference score for every room, then tests every possible room assignment and keeps the one with the highest minimum score — the max-min rule — breaking ties by the highest total score. Rent is then divided in inverse proportion to how strongly each person rated the room they were given, rescaled so the individual shares add back to exactly the rent you entered. It is for a group moving into a flat with unequal rooms who want the split argued from numbers rather than from who spoke loudest.",
  useCases: [
    "Three flatmates signing a lease where one room has a balcony, one is larger and one is quieter, and nobody wants to be the person who says the split is unfair",
    "A housemate is replaced mid-lease and the new person's preferences change which room assignment makes sense, so the old split has to be recomputed",
    "Settling a shared holiday rental where the master bedroom, the twin room and the sofa bed obviously should not cost the same per head",
  ],
  benefits: [
    ["Every assignment is checked", "All permutations of people to rooms are enumerated, so the chosen match is optimal under the max-min rule, not a first guess."],
    ["Shares always reconcile", "The suggested amounts are rescaled to sum to the total rent you entered, so there is no rounding gap to argue about."],
    ["The reasoning is visible", "The table shows who got which room and the preference score that produced their share, so the group can check the logic rather than trust a number."],
  ],
  faqs: [
    [
      "How should we score the rooms?",
      "Each person distributes points across the rooms so that their own scores total 100 — for example 50 for the large room, 30 for the balcony room and 20 for the quiet room. Scores are personal and do not need to match anyone else's; what matters is the relative gap between rooms within one person's row.",
    ],
    [
      "How does the tool decide who gets which room?",
      "It scores every possible assignment and picks the one where the worst-off person's preference score is as high as possible. With three people that is 6 assignments, with four it is 24 and with five it is 120; ties on the worst-off score are broken by the highest combined score across the group.",
    ],
    [
      "Why does the person who loves their room pay less?",
      "Because shares here are set inversely to the preference score for the assigned room, so a strong match lowers that person's amount and a weak match raises it. That is one defensible convention, not the only one — some groups prefer the opposite rule, where the most-wanted room costs the most, so agree on the direction before you use the output.",
    ],
    [
      "Is this a legally binding way to split rent?",
      "No — it is an informational decision aid, and the tenancy agreement is what actually binds you. Whoever is named on the lease is usually liable for the full rent regardless of any private split, so put the agreed shares in writing between housemates and take legal advice if the lease terms matter.",
    ],
  ],
};

export default seo;
