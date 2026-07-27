const seo = {
  intro:
    "This checker measures a souvenir quote against the median of the prices you recorded yourself for the same item, and reports the markup as (quoted ÷ median − 1) × 100. The median is used rather than the average because in a sample of five or six market prices a single inflated quote pulls the average up but leaves the middle value untouched. It is for travellers standing in a market who want a number before answering the seller, and it returns an opening counter-offer, a target and a walk-away price alongside the verdict.",
  useCases: [
    "You noted pashmina prices at four stalls in a bazaar and a fifth seller opens at three times the middle figure.",
    "Buying six identical fridge magnets as gifts and wanting to know what the markup costs you across the whole batch.",
    "Comparing a hotel gift-shop price with the prices you saw on the street the same morning.",
  ],
  benefits: [
    ["Your data, not a guessed database", "Every figure comes from prices you actually observed, so it stays accurate for that town on that day."],
    ["Robust to one silly quote", "The median ignores a single outlier that would drag a simple average off course."],
    ["Three numbers to bargain with", "An opening counter, a realistic target and the point where walking away is the better move."],
  ],
  faqs: [
    [
      "How do I know if a souvenir price is fair?",
      "Compare it with prices for the identical item at three or more other sellers and use the middle value as your reference; anything within roughly 15% of that median is ordinary stall-to-stall variation. Beyond about double the median you are being quoted a tourist price rather than a local one.",
    ],
    [
      "What should my first counter-offer be when haggling?",
      "Counter at the lowest genuine price you have seen for the same item, which anchors the negotiation at a number you can defend, and expect to settle near the middle of your recorded range. Naming an arbitrary fraction of the asking price only works if the asking price happens to be inflated by that same fraction.",
    ],
    [
      "Why does this use the median instead of the average price?",
      "With five or six observations one very high quote can move the average by 20% or more while leaving the median unchanged, and tourist price samples are skewed high by exactly that kind of outlier. The median is the standard robust measure of centre for small, skewed samples.",
    ],
    [
      "Is bargaining expected everywhere?",
      "No. It is normal in open-air markets and craft bazaars across South Asia, the Middle East, North Africa and much of Southeast Asia, but fixed-price shops, government emporiums and most of Europe, Japan and North America expect the marked price to be paid. Where haggling is customary it is a friendly exchange, not a confrontation — if the seller will not move, thank them and move on.",
    ],
  ],
};

export default seo;
