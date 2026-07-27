const seo = {
  intro:
    "MSP realisation is the price a farmer actually keeps per quintal after a mandi sale, expressed against the notified Minimum Support Price. This calculator subtracts the market fee or cess, the arhtiya commission, hamali and weighing charges, bardana and transport from the price quoted in the yard, then shows the net per quintal, the rupee gap against MSP for the whole lot, and the mandi price you would need for your net to equal MSP. It also applies the Price Deficiency Payment Scheme rule under PM-AASHA, where the payment is capped at 25% of MSP.",
  useCases: [
    "A paddy grower is offered ₹2,350 a quintal against an MSP of ₹2,300 and wants to know whether the 4.5% fee-plus-commission deduction wipes out that premium.",
    "Deciding between a nearby mandi with high commission and a distant one with a better quoted price but ₹4,000 of transport on the lot.",
    "A farmer registered under a state price deficiency scheme wants to see the capped payment and the net realisation including it.",
  ],
  benefits: [
    ["Net, not headline", "Ad valorem charges scale with the price, so the premium over MSP shrinks exactly when the price rises."],
    ["A negotiating number", "The break-even mandi price tells you the figure to hold out for so your net matches MSP."],
    ["Lot-level totals", "Per-quintal charges and one-time transport are combined over the quantity actually sold."],
  ],
  faqs: [
    [
      "Does MSP mean I receive that exact price per quintal?",
      "No. MSP is a gross price at the procurement centre, and a mandi sale carries deductions — state market fee or cess, the commission agent's charge, hamali and weighing, gunny bags, and your own transport. Typical fee plus commission runs a few per cent of sale value, so the net you take home is usually below the quoted price.",
    ],
    [
      "Who fixes MSP and how often does it change?",
      "The Cabinet Committee on Economic Affairs notifies MSP on the recommendation of the Commission for Agricultural Costs and Prices, separately for each Kharif and Rabi season and for each crop and grade. Because it is revised every season, this tool takes MSP as an input rather than storing a rate that would go stale.",
    ],
    [
      "How much does the Price Deficiency Payment Scheme pay?",
      "PDPS, a component of PM-AASHA, pays a registered farmer the difference between MSP and the market price, with the payment limited to 25% of MSP. If MSP is ₹2,300 and the market price is ₹1,000, the ₹1,300 gap is capped and only ₹575 a quintal is payable.",
    ],
    [
      "Why is my net below MSP even when the mandi price is above it?",
      "Because market fee and commission are charged on the sale value, not on the surplus. On a ₹2,350 price with 2% fee, 2.5% commission, ₹25 of labour and bardana and ₹80 a quintal of transport, deductions come to about ₹211, leaving roughly ₹2,139 — below a ₹2,300 MSP despite the higher quote.",
    ],
  ],
};

export default seo;
