const seo = {
  intro:
    "Gold Price Checker fetches the current market rate for gold and three other precious metals — XAU, XAG, XPT and XPD, the ISO codes for gold, silver, platinum and palladium — and shows the price per troy ounce, per gram or per kilogram in any of ten currencies. The per-gram figure is derived by dividing the ounce price by 31.1035, the number of grams in a troy ounce, so the units line up with how jewellers and refiners actually quote. It also includes a standalone weight converter for moving between ounces, grams and kilograms, and an optional auto-refresh that re-checks the source every 60 seconds.",
  useCases: [
    "You are about to buy jewellery and want today's gold rate per gram in rupees before you accept the shop's quoted rate.",
    "You hold a silver or platinum position and want all four precious metals on one screen in your own currency rather than converting an ounce price in your head.",
    "You are watching a volatile session and leave auto-refresh on so the board updates itself every minute while you decide whether to transact.",
  ],
  benefits: [
    [
      "Troy ounce handled correctly",
      "Gram and kilogram prices are converted using 31.1035 g per troy ounce, not the 28.35 g avoirdupois ounce, which is the mistake that makes most quick conversions wrong by about 10%.",
    ],
    [
      "Four metals, one currency choice",
      "Switching currency re-requests gold, silver, platinum and palladium together, so the whole board stays denominated consistently instead of mixing sources.",
    ],
    [
      "Refreshes on a fixed minute cadence",
      "Auto-refresh polls once every 60 seconds when you turn it on and stays idle when you don't, so you control whether the page keeps hitting the source.",
    ],
  ],
  faqs: [
    [
      "How is the price per gram worked out?",
      "The source returns a rate expressed as metal per unit of currency, which is inverted to give the price of one troy ounce, then divided by 31.1035 for the gram price or by 0.0311035 for the kilogram price. One troy ounce is 31.1035 grams and one kilogram is about 32.15 troy ounces.",
    ],
    [
      "Which currencies and metals are covered?",
      "Ten currencies — USD, EUR, GBP, INR, JPY, CNY, AUD, CAD, CHF and AED — across four metals: gold (XAU), silver (XAG), platinum (XPT) and palladium (XPD). The currency selection re-fetches all four at once.",
    ],
    [
      "Is this the price I will pay at a jeweller?",
      "No. This is the market rate for pure metal, while a retail purchase adds purity adjustment, making charges, dealer margin and local taxes, and a 22K piece is priced at 0.916 of the pure-gold rate. Use this figure as the baseline you check a quote against, not as the final price.",
    ],
    [
      "How current is the figure, and what if it fails to load?",
      "Each successful fetch stamps the time it was retrieved, and with auto-refresh on that stamp advances every 60 seconds. If the price source cannot be reached an error message is shown and the board falls back to placeholder values, so always confirm the update timestamp before relying on a number, and verify against your dealer or exchange for anything transactional.",
    ],
  ],
};

export default seo;
