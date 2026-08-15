const seo = {
  title: "Bargaining Simulator: Opening Counter and Walk-Away",
  metaDescription:
    "Sets your opening counter at 2 x target minus the asking price so the midpoint is your target, then plays the concessions out round by round.",
  steps: [
    "Pick the kind of seller - tourist-strip souvenir stall, local produce market, antiques or an unmetered taxi fare - choose a currency, and enter the seller's first quote.",
    "Enter what you think a local pays, the premium you accept paying, the seller's assumed floor above the local price and how far above target you will still pay.",
    "Read the Open at counter, your target, the walk-away price and the round-by-round ladder of offers over up to 8 rounds, then press Copy plan.",
  ],
  intro:
    "This simulator works out the three numbers a haggle actually turns on — your opening counter, your target and your walk-away — and then plays the concessions out round by round. The opening counter uses mirrored anchoring: because splitting the difference is the default ending, the counter is placed so the midpoint of the two anchors is your target, which is counter = 2 × target − asking. Both sides then concede a shrinking share of the remaining gap, the pattern that signals an approaching limit, until the distance is small enough that somebody proposes meeting in the middle.",
  useCases: [
    "Rehearsing a number before walking into a market where the first quote is several times the local price.",
    "Working out whether a quoted tuk-tuk fare is worth arguing about once you know the metered equivalent.",
    "Teaching a first-time traveller why opening at 80% of the quote guarantees they overpay.",
  ],
  benefits: [
    ["The counter is arithmetic, not nerve", "Mirrored anchoring gives you a defensible opening number instead of a guess you feel rude saying."],
    ["A walk-away decided in advance", "The model makes you set the number before the pressure starts, which is the only time you can set it honestly."],
    ["Shows when there is no deal", "If the seller's floor sits above your walk-away, it says so rather than inventing an agreement."],
  ],
  faqs: [
    [
      "What should my first counter-offer be when haggling?",
      "Low enough that the midpoint between the two opening numbers is the price you actually want. If the seller opens at 3,000 and your target is 1,000, the mirrored counter is 2 × 1,000 − 3,000, which is negative — meaning the spread is too wide to counter at all, and you should ask for their best price instead. Opening at 80% of the quote guarantees you finish above your target.",
    ],
    [
      "How do I know what the real local price is?",
      "Ask two or three other sellers for the same item and take the lowest quote as an upper bound, or ask somebody who is not selling — a guesthouse owner, a driver, a shopkeeper in a different trade. Prices posted in supermarkets and fixed-price cooperative shops are the most reliable anchor of all, because nobody is negotiating them.",
    ],
    [
      "Does walking away actually work?",
      "It works when it is real. A seller whose floor sits below your walk-away loses the whole sale by letting you go, so the call-back offer tends to arrive close to their floor. It fails when you have already shown you want the item badly, when you come back twice, or when the seller's floor genuinely sits above your number — which is why the simulator checks whether an overlap exists at all.",
    ],
    [
      "Is it rude to haggle?",
      "It depends where and over what. At tourist-strip souvenir stalls a counter is expected and not countering just surprises them. At fixed-price shops, cooperatives and supermarkets it is simply refused, and pushing hard over food in a produce market — where margins are thin — reads badly. The most useful rule is that the difference you are arguing over is often trivial to you and not to the seller.",
    ],
  ],
};

export default seo;
