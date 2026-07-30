const seo = {
  intro:
    "The Restaurant Bill Splitter assigns each dish to the people who actually ordered it, then charges GST and tip in proportion to what each person ate rather than dividing them equally. Every diner's total is their item share multiplied by (1 + tax rate + tip rate), so the individual amounts always add back to the exact grand total — the tool shows that reconciliation check on screen. It is for groups where one person ordered drinks and dessert and another only had a starter, and an even split would be unfair.",
  useCases: [
    "Six people at dinner, two shared a bottle and one only had soup, and you want each person charged 5% GST and a 10% tip on their own share instead of on an averaged amount.",
    "One person is paying the card bill and needs a per-person figure to send to the group chat that provably sums to the printed total, with no rounding leftover.",
    "A shared platter needs to be divided between three of the five people at the table, while the rest of the order stays individually assigned.",
  ],
  benefits: [
    ["Tax and tip follow the food", "Each person's GST and tip are calculated on their own item subtotal, so the biggest orderer pays the biggest share of both."],
    ["Totals reconcile to the paisa", "The per-person totals are summed and compared against the grand total, with a visible check line so nobody is short by a rupee."],
    ["Shared items split cleanly", "Assign a dish to any subset of the table and its price divides among just those people; anything left unassigned falls back to an even split across everyone."],
  ],
  faqs: [
    [
      "How do you split a restaurant bill when everyone ordered different things?",
      "Assign each item to the person or people who ordered it, then apply tax and tip proportionally to each person's item subtotal. This tool does exactly that: your total is your items × (1 + tax% + tip%), which is why the individual amounts still sum to the printed bill.",
    ],
    [
      "How is the tip divided between people?",
      "By share of the food, not by head. If you ordered 40% of the bill's value you carry 40% of the tip. The default tip is 10% and the default tax is 5%, and both are editable to any percentage.",
    ],
    [
      "What happens to a shared starter or a bottle nobody claimed?",
      "An item assigned to several people splits equally among just those people, and an item left unassigned is split evenly across everyone at the table. There is also a switch that forces the whole bill into an even split if the group prefers that.",
    ],
    [
      "Do the individual shares always add up to the bill total?",
      "Yes — the tool sums every person's total and flags a match when it is within 0.01 of the grand total. Because tax and tip are applied as a single multiplier on each subtotal, no rounding gap is left for the payer to absorb.",
    ],
  ],
};

export default seo;
