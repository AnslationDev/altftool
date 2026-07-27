const seo = {
  intro:
    "This calculator assembles New York sales tax from its three layers: the 4% state rate under Tax Law § 1105, the county or city rate under article 29, and the 0.375% Metropolitan Commuter Transportation District surcharge that applies in the five boroughs and seven suburban counties. It also applies the clothing rule in § 1115(a)(30) correctly — items under $110 each escape the state rate and the MCTD surcharge, and escape local tax only where the jurisdiction has elected the same exemption, as New York City has. Retailers, e-commerce sellers shipping into New York and shoppers checking a receipt get the same layer-by-layer split.",
  useCases: [
    "A clothing retailer ringing up a mixed basket in Manhattan, where a $95 shirt is untaxed but a $150 coat carries the full 8.875%.",
    "An out-of-state seller shipping to a Nassau County address, checking that the MCTD surcharge is added to the county rate.",
    "A bookkeeper splitting a month of receipts into state, local and MCTD components to complete the ST-100 quarterly return.",
  ],
  benefits: [
    ["Per-item clothing test", "Applies the $110 threshold item by item, the way the statute does, instead of to the basket total."],
    ["MCTD surcharge handled", "Adds the 0.375% surcharge only inside the district, so suburban and upstate rates come out right."],
    ["Three-layer breakdown", "Separates state, local and MCTD tax, matching how the ST-100 return is filed."],
  ],
  faqs: [
    [
      "What is the sales tax rate in New York City?",
      "8.875%, made up of the 4% New York State rate, the 4.5% New York City rate and the 0.375% MCTD surcharge. It is the highest combined rate in the state; most upstate counties land between 7% and 8.75%.",
    ],
    [
      "Is clothing taxed in New York?",
      "Clothing and footwear priced under $110 per item are exempt from the 4% state tax and the 0.375% MCTD surcharge. Local tax still applies unless the county or city has elected the exemption — New York City has, so a $95 pair of shoes is completely untaxed there but taxed at the county rate in most of the state.",
    ],
    [
      "What happens if a clothing item costs exactly $110?",
      "It is fully taxable. The exemption only covers items sold for less than $110, and once an item reaches that price the entire price is taxed, not just the amount above $110. Each item is tested on its own, so two $80 shirts on one receipt are both exempt.",
    ],
    [
      "Is shipping taxable in New York?",
      "Yes, when the goods being shipped are taxable. Delivery, shipping and handling charges are part of the taxable receipt under Tax Bulletin ST-838. If a shipment contains both taxable and exempt goods, the delivery charge is allocated between them; ask a tax professional if the split is significant.",
    ],
  ],
};

export default seo;
