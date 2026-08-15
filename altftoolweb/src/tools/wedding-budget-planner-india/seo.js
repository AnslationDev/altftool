const seo = {
  title: "Wedding Budget Planner India: Per-Plate Rate",
  metaDescription:
    "Split a budget across venue, catering, jewellery and travel, hold back a contingency, and get the per-plate rate your catering share supports.",
  steps: [
    "Enter Total wedding budget (₹), Contingency held back (%), Number of guests and Per-plate rate quoted (₹).",
    "Choose the Tax and service charge on catering, edit each head's Share % and Quoted (₹), and press \"Rebalance to 100%\" if the shares stop adding up.",
    "Read \"Per-plate rate you can afford\", Contingency held back, Committed by quotes and Left to commit, then press Copy budget.",
  ],
  intro:
    "This planner divides a wedding budget into spending heads, holds back a contingency before anything is allocated, and tracks each vendor quote against its allocation. Catering is the one head it computes rather than allocates: guests multiplied by the per-plate rate plus tax, inverted to give the per-plate ceiling your catering allocation can actually support. The default shares are a conventional planning split that you are meant to edit, and the tool enforces that they add to 100% so no rupee is lost or double-counted.",
  useCases: [
    "You have a ₹25 lakh budget and 400 guests, and want the per-plate rate you can negotiate to without breaking catering.",
    "Three vendor quotes are in hand and you want to see which head is already over its allocation.",
    "Deciding between a shorter guest list and a lower plate rate to close a catering shortfall.",
  ],
  benefits: [
    ["A ceiling per vendor", "Each head gets a number you can quote at a vendor instead of negotiating blind."],
    ["Contingency taken off the top", "Overruns come out of a reserve you set aside first, not out of the last head to be booked."],
    ["Guest list priced honestly", "The per-plate ceiling makes the cost of every extra fifty guests explicit."],
  ],
  faqs: [
    [
      "How should a wedding budget be divided?",
      "A common planning split puts about a quarter into venue and decor and another quarter into catering, then roughly 15% jewellery, 10% clothing, 8% photography, 6% guest travel and stay, and the rest across music, rituals and beauty. Treat it as a starting point — families weight jewellery, venue and guest hospitality very differently.",
    ],
    [
      "What GST applies to wedding catering and venue hire?",
      "Outdoor catering is taxed at 5% without input tax credit, while a banquet package supplied by a hotel whose declared room tariff crosses ₹7,500 a day is taxed at 18%. Ask the vendor which head their invoice falls under, because on a ₹5 lakh catering bill the difference is around ₹65,000.",
    ],
    [
      "How much should I keep as a contingency?",
      "Around 10% of the total budget is a common reserve, taken off the top before anything is allocated. Weddings overrun on guest count, last-minute decor and gifting, and a contingency means the overrun does not come out of whichever vendor is booked last.",
    ],
    [
      "How do I work out an affordable per-plate rate?",
      "Divide the catering allocation by the guest count multiplied by one plus the tax rate. A ₹5,62,500 catering allocation for 400 guests at 5% tax supports about ₹1,339 a plate before tax — anything higher means cutting the guest list or moving budget from another head.",
    ],
  ],
};

export default seo;
