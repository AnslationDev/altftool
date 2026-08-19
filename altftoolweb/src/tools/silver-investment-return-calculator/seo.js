const seo = {
  title: "Silver Investment Calculator: GST & Buyback",
  metaDescription:
    "Prices both ends of a silver trade - 3% GST, premium and buyback discount - to show real profit, annualised return and break-even price per kg.",
  steps: [
    "Enter the 'Buying price (₹ per kg)', 'Selling price (₹ per kg)', 'Quantity (kg)' and the purchase and sale dates that set the holding period.",
    "Add the frictions: 'Making charge or premium (%)', 'GST on the purchase (%)' (default 3), 'Buyback deduction on sale (%)' and 'Tax on the gain (%)'.",
    "Read 'Profit after costs and tax' with absolute and annualised return, how much of the quote's move went to costs, and the break-even selling price per kg; press 'Copy result'.",
  ],
  intro:
    "Silver is bought above the quoted price and sold below it, so the price move is never the return. This calculator builds the real number from both ends: metal value plus any making charge or premium plus 3% GST plus buying costs on one side, and the sale value less the buyback discount, selling costs and tax on the other. It reports the profit in rupees, the absolute and annualised return on the money actually invested, and the selling price per kilogram at which you merely break even.",
  useCases: [
    "You bought 2 kg of silver bars three years ago and want the annualised return after GST and the dealer's buyback discount.",
    "Comparing the headline rise in the silver rate against what you would keep if you sold today.",
    "Working out the price per kilogram silver has to reach before a purchase stops being underwater.",
  ],
  benefits: [
    ["Both ends of the trade priced", "GST and premium at entry, buyback discount and tax at exit — the two places returns leak."],
    ["Annualised, not just absolute", "A holding period from real dates turns the profit into a rate you can compare with a deposit."],
    ["A break-even you can watch", "One price per kilogram tells you when the position turns positive."],
  ],
  faqs: [
    [
      "How much GST is charged on silver?",
      "3% on the supply — 1.5% CGST plus 1.5% SGST — the same rate as gold. On an article supplied as a composite supply the 3% applies to the metal and the making charge together, so ₹1.9 lakh of silver attracts about ₹5,700 of GST at purchase.",
    ],
    [
      "Why is my silver return lower than the price rise?",
      "Because GST, any premium or making charge and the buyback discount all sit between you and the quote. On a purchase at ₹95,000 a kg sold at ₹1,30,000, the quote rose about 37% but a 3% GST, ₹500 of costs, a 2% buyback discount and tax on the gain can leave closer to 26%.",
    ],
    [
      "What is the break-even price for a silver purchase?",
      "Divide everything you invested, plus any selling cost, by the quantity multiplied by one minus the buyback discount. A ₹1,96,200 investment in 2 kg with a 2% buyback discount breaks even at about ₹1,00,102 a kg — over 5% above the ₹95,000 you paid.",
    ],
    [
      "How is profit on selling silver taxed in India?",
      "Silver is a capital asset, so a gain on sale is taxable, with the rate depending on how long you held it and on the rules in force for the year of sale. Those rules and holding periods have been revised recently, so enter the rate that applies to your case and confirm it with a chartered accountant — this tool is informational and not tax advice.",
    ],
  ],
};

export default seo;
