const seo = {
  title: "Brokerage Calculator: STT, GST, Stamp Duty & P&L",
  metaDescription:
    "Prices an equity or F&O round trip across brokerage, STT, exchange, SEBI, stamp duty, GST and DP charges, and solves the breakeven sell price.",
  intro:
    "The Brokerage & Trading Charges Calculator prices a complete buy-and-sell round trip on an Indian equity or F&O trade and breaks the contract note into its seven line items — brokerage, STT/CTT, exchange transaction charges, SEBI turnover fees, stamp duty, 18 percent GST and DP charges — then subtracts the total from your gross P&L. Pick equity delivery, intraday, futures or options, enter your buy and sell price with quantity or lots, and it shows the net profit you keep plus the exact sell price you need just to break even. Every charge is shown with the formula it came from, so you can check the arithmetic against your broker's statement.",
  useCases: [
    "You made ₹7,000 on paper from a delivery trade and the credit in your account is smaller, and you want to see which line — STT, DP charges or stamp duty — accounted for the gap.",
    "You are scalping intraday for two-rupee moves on 500 shares and need to know the breakeven move in points before the trade is worth taking at all.",
    "You are comparing a full-service broker charging 0.25 percent per order against a flat ₹20 discount plan on the same 4-lot options trade.",
  ],
  benefits: [
    ["Segment-specific rates, not one flat number", "STT is charged on both legs for delivery but only on the sell side for intraday, futures and options, and the calculator applies the right rule per segment instead of averaging."],
    ["Solves the breakeven sell price properly", "Because charges depend on the sell price, the tool iterates to a fixed point rather than assuming a static cost, so the breakeven figure holds."],
    ["Shows the formula behind each line", "Each row states the rate and base it was applied to, so you can reconcile the output against an actual contract note line by line."],
  ],
  faqs: [
    [
      "Why is my actual profit less than the price difference on screen?",
      "Because a round trip pays up to seven separate charges, and only one of them is brokerage. On equity delivery the big ones are STT at 0.1 percent of both the buy and sell turnover, stamp duty at 0.015 percent of the buy value, and a flat DP charge on the sell.",
    ],
    [
      "How is GST calculated on a trade?",
      "GST is 18 percent, charged on brokerage plus exchange transaction charges plus SEBI turnover fees — plus the flat DP charge on an equity delivery sell, which the calculator already shows GST-inclusive. It is never levied on STT or on stamp duty, which is why GST stays small even on large delivery trades that pay heavy STT.",
    ],
    [
      "What are DP charges and when do they apply?",
      "DP (depository participant) charges are a flat per-scrip fee taken when shares leave your demat account, so they apply on the sell leg of an equity delivery trade only — never on intraday, futures or options. The calculator uses ₹13.50 plus 18 percent GST per scrip, and because it is flat, it hurts small delivery exits the most.",
    ],
    [
      "Are options charges based on the strike price or the premium?",
      "On the premium. Brokerage, STT, exchange transaction charges and stamp duty are all applied to premium turnover, not contract or strike value — which is why a deep out-of-the-money option costs far less to trade than its notional size suggests. Exercised or assigned options are the exception and are charged differently, so check your broker's expiry rules.",
    ],
  ],
};

export default seo;
