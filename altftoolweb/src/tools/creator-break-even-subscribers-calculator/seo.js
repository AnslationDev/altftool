const seo = {
  title: "Break-Even Subscribers Calculator for Memberships",
  metaDescription:
    "How many members cover your monthly costs after platform %, processing % and the flat per-payment charge, blended across tiers, with churn replacements.",
  steps: [
    "Enter 'Monthly production costs (INR)', 'Platform fee (% of pledge)', 'Payment processing (%)', 'Flat processing charge per payment (INR)', 'Monthly churn (%)' and 'Net new members a month'.",
    "Under 'Tiers and the mix of members' give each tier a Tier name, 'Price a month (INR)' and 'Share of members (%)'; the header shows 'Shares total N%' and turns red until it reaches 100. 'Add a tier' goes up to six tiers and Remove deletes one.",
    "Read 'Paying members needed to break even' with the net value of one member underneath, then 'Share of a pledge you keep', 'Fees lost each month at that size' and 'Replacements needed each month for churn'. 'Check a target' takes a member count and reports the net income and what is left after production costs.",
  ],
  intro:
    "Break-even membership count is your monthly production cost divided by what one member is actually worth after fees, where net per member equals price multiplied by (1 minus the platform rate minus the processing rate) minus the flat processing charge. This calculator blends several tiers by the share of members on each, then adds the churn replacements you must recruit every month just to stand still. Built for creators launching a membership and deciding whether the tier prices they picked can ever cover the work.",
  useCases: [
    "Check whether 40,000 a month of production costs is realistically coverable at a 199 tier before you launch.",
    "See how much of your revenue the flat per-transaction charge eats on a low-priced tier compared with a high one.",
    "Work out how many new members a month you need just to replace churn at your target size.",
    "Test whether adding a high tier lets you break even on far fewer members than a single cheap tier would.",
  ],
  benefits: [
    ["Fees taken off properly", "Percentage and flat charges are both applied to the gross pledge, so the net figure is the one that lands."],
    ["Blended across tiers", "A share-weighted average member value, not a guess based on the middle tier."],
    ["Churn included", "Shows the replacements per month needed to hold the number, which most launch plans forget."],
  ],
  faqs: [
    [
      "How many subscribers do I need to break even?",
      "Divide your monthly costs by the net value of one member and round up. At 40,000 of monthly costs and an average member worth 174 after fees, that is 230 members. Raise the average pledge and the number falls steeply.",
    ],
    [
      "How do I calculate what a membership pledge is really worth?",
      "Take the price, subtract the platform's percentage and the processor's percentage, then subtract the flat per-transaction charge. A 199 pledge with an 8% platform fee, 2.9% processing and a flat 3 leaves 174.31 — about 87.6% of the pledge.",
    ],
    [
      "Why do cheap membership tiers perform so badly?",
      "The flat per-transaction charge is the same whatever the pledge. On a 999 tier a flat 3 is 0.3% of the pledge; on a 49 tier it is over 6%, on top of the percentage fees. Very low tiers can end up returning almost nothing after fees.",
    ],
    [
      "What does monthly churn mean for a membership?",
      "Churn is the share of members who cancel each month. At 5% monthly churn and 230 members you lose about 12 a month, so you must recruit 12 replacements before any growth at all. Growth targets should always be stated as net new after churn.",
    ],
  ],
};

export default seo;
