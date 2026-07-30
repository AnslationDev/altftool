const seo = {
  intro:
    "The Gold Jewellery Price Calculator rebuilds a jeweller's bill line by line: it converts the 24K rate per 10 g into a per-gram rate for your purity using the fineness ratio (0.916 for 22K, 0.750 for 18K, 0.585 for 14K), prices only the net gold weight after stones are deducted, then adds wastage, making charges, stone charges, 3% GST and the BIS hallmarking fee. It also estimates what the same piece fetches on resale after a buyback deduction, and how far the gold rate must rise before you break even. It is for anyone standing at a counter in India trying to work out how much of the quoted price is actually gold.",
  useCases: [
    "The shop quotes one lump-sum figure for a 22K 10 g chain and you want to see how that splits into metal value, making charges and tax before you agree.",
    "You are comparing two jewellers where one charges 12% making and the other charges a flat per-gram rate, and you need the same piece costed both ways.",
    "You are buying an 18K diamond ring and want to confirm the stone weight is deducted from the gold weight rather than being billed at the gold rate.",
  ],
  benefits: [
    [
      "Prices purity correctly, not by label",
      "The per-gram rate is scaled by fineness against 24K, so a 22K piece is charged at 0.916 of the pure-gold rate instead of the headline rate you see quoted in the news.",
    ],
    [
      "Exposes the wastage-plus-making double charge",
      "Wastage is shown as both a percentage and the extra grams of gold it silently adds, next to the making charge that pays for the same labour.",
    ],
    [
      "Shows the exit price, not just the entry price",
      "It subtracts your buyback deduction from the gold value alone, so you see the rupee loss the moment you walk out and the 24K rate the market must reach for you to break even.",
    ],
  ],
  faqs: [
    [
      "How much GST is charged on gold jewellery?",
      "The calculator applies 3% GST to the taxable value — gold value plus wastage plus making charges plus stone charges — which is the rate applicable to gold jewellery in India. Making charges are included in that same taxable base here, so the tax lands on the full pre-hallmark bill rather than on metal alone.",
    ],
    [
      "What is a fair making charge?",
      "Roughly 8% to 25% of gold value, or about Rs 300 to Rs 800 per gram on a flat basis, with plain gold at the lower end and intricate or studded work at the upper end. It is negotiable, and a zero-making offer usually reappears as a higher rate per gram or as wastage.",
    ],
    [
      "What does 916 mean on my jewellery?",
      "916 is the hallmark for 22K gold — 91.6% pure — and the same scheme gives 750 for 18K and 585 for 14K, which are the fineness figures this calculator uses to price each purity. A hallmarked piece also carries the BIS logo and a six-digit alphanumeric HUID you can verify in the BIS CARE app before paying; the Rs 45 hallmarking charge per piece is added as its own line.",
    ],
    [
      "Why do I lose money the moment I buy jewellery?",
      "Because making charges, wastage, GST and the hallmark fee buy no gold, and a buyback is normally settled on the metal value alone minus a deduction of about 2% to 5%. The calculator quantifies that gap as a rupee loss, as a percentage of what you paid, and as the rate rise needed to erase it. Figures are informational estimates based on the numbers you enter — confirm the actual rate, charges and buyback terms with the jeweller in writing.",
    ],
  ],
};

export default seo;
