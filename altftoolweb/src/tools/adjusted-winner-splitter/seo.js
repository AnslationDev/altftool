const seo = {
  title: "Adjusted-Winner Splitter: Assets by 100 Points",
  steps: [
    "Type one line per asset into 'Items and point allocations' using the 'Item | Person A points | Person B points' format shown in the hint, and set 'Names' to the two people (the built-in example is 'Asha, Ben').",
    "Each item is awarded to whoever bid more points, then the single item with the lowest ratio between the richer and poorer side's valuation is split fractionally until both point totals meet.",
    "The result table lists Item, each person's points, 'Initial owner' and 'Final share' — with the divided item shown as a percentage to each side — and the Copy and Download buttons save it as adjusted-winner-splitter.txt.",
  ],
  metaDescription:
    "Compare two people's 100-point asset preferences, produce an educational adjusted-winner allocation, and identify any fractional split.",
  intro:
    "The Adjusted-Winner Splitter divides a set of shared items between exactly two people using the adjusted-winner idea from Brams and Taylor: each person secretly spreads 100 points across the items, every item first goes to whoever bid more points on it, and then the single item with the lowest ratio of the richer side's valuation to the poorer side's is split fractionally until both sides hold the same point total. It is for two people settling a shared pile — a separating couple, two siblings dividing an estate, two co-founders unwinding shared kit — who want the split driven by stated priorities rather than by who argues hardest. Everything is computed in the browser from the lines you type, and the output is an educational allocation, not a legal settlement.",
  useCases: [
    "Two siblings are dividing a parent's house contents and want to stop trading the same three items back and forth by putting numbers on what each one actually cares about",
    "A separating couple is listing the car, the savings, the furniture and the artwork, and needs a starting allocation both can look at before speaking to solicitors",
    "Two co-founders are winding down a shared workspace and want to see which single asset would have to be sold or shared because it is the one the maths splits",
  ],
  benefits: [
    ["Points, not arguments", "Each person's 100 points are a private statement of priority, so the allocation reflects intensity of preference instead of negotiating stamina."],
    ["Only one item ever gets divided", "Whole items go to whoever valued them most, and just the lowest-ratio item is split fractionally — so you know in advance which single asset needs a cash adjustment or a sale."],
    ["Shows the working, item by item", "The table lists both point bids, the initial owner and the final share for every line, so each side can see exactly why an item landed where it did."],
  ],
  faqs: [
    [
      "How many points does each person get?",
      "100 each, spread across the items in whatever proportions reflect how much each item matters to them. The tool does not force the totals to balance, so check both columns add to 100 before you trust the result — the caption under the table reminds you to.",
    ],
    [
      "How does it decide who gets each item?",
      "Every item goes first to whoever put more points on it, with ties going to the person listed first. Point totals are then compared, and the item with the smallest ratio of the higher-scoring person's points to the lower-scoring person's points is divided fractionally so both totals meet in the middle.",
    ],
    [
      "What if an item cannot physically be split, like a car?",
      "Read the fraction as a value share rather than a physical cut: the person keeping the item pays the other their percentage in cash, or the item is sold and the proceeds are divided in those proportions. Because at most one item is ever divided, you only have to negotiate that one.",
    ],
    [
      "Is this a legally binding division of assets?",
      "No. It is an educational two-party allocation method and it knows nothing about legal ownership, current market valuations, debts secured on an asset, tax on a transfer, or what a court would treat as fair. Use it to structure the conversation, then take a proposed split to a solicitor, mediator or tax adviser before signing anything.",
    ],
  ],
};

export default seo;
