const seo = {
  intro:
    "Luggage Weight Splitter distributes a packing list across every bag and traveller in your group, tracks each bag against its own kilo limit, and flags any bag that is over — or within 85% of — its allowance before you reach the airport. Auto Balance runs a largest-item-first pass that repeatedly drops the heaviest remaining item into whichever bag has the most free capacity, which is the standard greedy fix for uneven bags. Families and groups travelling on mixed allowances get a per-bag plan they can export as CSV or copy as a checklist, instead of re-weighing suitcases on a bathroom scale.",
  useCases: [
    "You are flying tomorrow with a 15 kg checked allowance each, one suitcase is clearly heavier than the other, and you want to know exactly which items to swap rather than guessing.",
    "Three of you are travelling on one booking and someone is well under their allowance, so you want to shift the gifts and shoes to their bag before check-in charges appear.",
    "You want the packing plan written down so the person doing the actual packing at 11pm knows which pouch goes in which bag, exported as a spreadsheet or a copied checklist.",
  ],
  benefits: [
    [
      "Warns before you are over, not after",
      "Bags turn amber once they hit 85% of their limit, which is the point where one forgotten jacket tips you into excess-baggage territory.",
    ],
    [
      "Names the specific swap",
      "When a bag is over, it identifies the heaviest item in it and the bag with the most free space, so the suggestion is 'move the gifts to the family checked bag', not 'reduce weight'.",
    ],
    [
      "Per-bag limits, not one number",
      "Cabin, checked, backpack and personal bags each carry their own limit and traveller, so a 7 kg cabin restriction is enforced separately from a 23 kg checked one.",
    ],
  ],
  faqs: [
    [
      "What baggage limits does it start with?",
      "Four presets: India domestic at 7 kg cabin and 15 kg checked, international economy at 7 kg and 23 kg, low-cost carrier at 7 kg and 20 kg, and a custom option at 8 kg and 20 kg. Every bag limit is editable in 0.5 kg steps, so always set the figures printed on your own ticket — allowances differ by airline, route and fare class.",
    ],
    [
      "How does Auto Balance decide where items go?",
      "It sorts every item by total weight, heaviest first, and assigns each one to whichever bag currently has the most unused capacity. That greedy pass evens out bag totals quickly, but it ignores what you actually want in the cabin — review the result before packing.",
    ],
    [
      "When does a bag get flagged as close to the limit?",
      "At 85% of its limit or above, while still under it — so a 15 kg checked bag is flagged from 12.75 kg. Anything past 100% is marked over limit and counted in the overweight total.",
    ],
    [
      "Does it handle multiple items of the same thing?",
      "Yes. Each item has a per-unit weight and a quantity, and the total counted is weight multiplied by quantity — so eight 0.42 kg clothing sets contribute 3.36 kg. That is the easiest way to model a stack of similar items without listing each one.",
    ],
  ],
};

export default seo;
