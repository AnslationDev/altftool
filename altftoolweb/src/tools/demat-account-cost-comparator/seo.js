const seo = {
  title: "Demat Charges Calculator: AMC, DP, Brokerage",
  metaDescription:
    "Compare demat plans on real yearly cost — AMC, DP charge per scrip sold, brokerage, 18% GST, STT, stamp duty and exchange fees.",
  steps: [
    "Under How you trade (equity delivery), enter Buy orders per month, Sell orders per month, Scrips debited per selling day and Average holding value (INR).",
    "For each plan set AMC per year (INR), DP charge per scrip sold (INR) and a Delivery brokerage model — Zero brokerage on delivery, Flat per executed order or Percentage of turnover — then Add a plan.",
    "Read the Cheapest plan for this pattern and the Full cost breakdown table of brokerage, DP, AMC and statutory levies, then Copy result.",
  ],
  intro:
    "This comparator adds up what a demat and trading account actually costs over a year — annual maintenance charge, the DP charge levied on every scrip you sell, brokerage under a zero, flat-fee or percentage model, 18% GST on all of those, and the statutory levies of STT, stamp duty, the SEBI turnover fee and exchange transaction charges. Enter how many buy and sell orders you place and how large they are, and it ranks the plans on total rupees, not headline brokerage. It is built for delivery investors deciding whether a 'zero brokerage' account is genuinely cheaper once DP charges are counted.",
  useCases: [
    "Test whether a zero-brokerage plan with a ₹20 DP charge beats a ₹300 AMC plan when you sell 24 times a year.",
    "See how much a 0.30% full-service brokerage costs on ₹25,000 orders before you negotiate a rate.",
    "Check what a Basic Services Demat Account saves once your holding value stays under the ₹4,00,000 free limit.",
  ],
  benefits: [
    ["Counts DP charges properly", "Charges per scrip debited on sale, which is where zero-brokerage plans quietly recover revenue."],
    ["Separates fixed from negotiable", "Shows the statutory floor every broker shares, so you see the part switching can actually reduce."],
    ["GST on the right items", "Applies 18% GST to brokerage, DP, AMC and exchange fees, and correctly leaves STT and stamp duty out."],
  ],
  faqs: [
    [
      "What is a DP charge and why is it added when I sell?",
      "It is a flat fee per scrip debited from your demat account, so it applies on sales and not on purchases. The depository bills the broker a few rupees per debit and the broker marks it up, typically to ₹13–₹25 plus GST, regardless of how many shares you sold.",
    ],
    [
      "Is a zero-brokerage demat account really free?",
      "No. Even with nil brokerage you still pay DP charges on every sell, STT at 0.1% on both legs, stamp duty at 0.015% on buys, the SEBI turnover fee, exchange transaction charges and 18% GST on the broker-side items. On small, frequent sells the DP charge often exceeds what flat ₹20 brokerage would have cost.",
    ],
    [
      "What is a BSDA and who qualifies?",
      "A Basic Services Demat Account is a low-cost demat account for investors holding a single demat account. Since 1 September 2024 there is no annual maintenance charge on holdings up to ₹4,00,000 and a maximum of ₹100 a year between ₹4,00,000 and ₹10,00,000; above that the regular tariff applies.",
    ],
    [
      "Which demat charges can I negotiate with my broker?",
      "Only brokerage, the DP charge markup, the annual maintenance charge and any account opening fee — these are set by the broker. STT, stamp duty, the SEBI turnover fee and exchange transaction charges are fixed by statute or by the exchange and are identical everywhere.",
    ],
  ],
};

export default seo;
