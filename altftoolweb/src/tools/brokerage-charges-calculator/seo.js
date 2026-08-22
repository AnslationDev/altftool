const seo = {
  title: "Brokerage Charges Calculator: STT, GST, Net P&L",
  metaDescription:
    "Itemises STT/CTT, exchange, SEBI, stamp duty and 18% GST for delivery, intraday and F&O trades — with net P&L after costs and the break-even move.",
  steps: [
    "Pick a segment — Equity delivery, Equity intraday, Equity / index futures or Equity / index options — then enter Quantity, Buy price (INR) and Sell price (INR).",
    "Model your broker's plan with Flat brokerage per order (INR), Brokerage as % of turnover and the Maximum brokerage per order cap (0 = no cap).",
    "Read the itemised STT/CTT, exchange, SEBI, stamp duty and 18% GST lines with net P&L in hand and the break-even move, then click Copy result.",
  ],
  intro:
    "The Brokerage and Charges Calculator shows exactly what a trade costs in India once brokerage, STT/CTT, exchange transaction charges, SEBI turnover fees, stamp duty, 18% GST and DP charges are added up. Pick equity delivery, intraday, futures or options, enter your buy and sell prices, and it returns the total charges, net profit after costs and the price move you need just to break even.",
  useCases: [
    "Check whether a small intraday scalp still leaves a profit after ₹20-per-order brokerage and taxes.",
    "Compare a percentage-based full-service brokerage plan against a flat-fee discount plan on the same trade.",
    "Estimate the DP charge and STT hit before booking a delivery position you have held for months.",
  ],
  benefits: [
    ["Every statutory line item", "STT, exchange charges, SEBI fees, stamp duty and GST are calculated separately, not lumped together."],
    ["Any broker plan", "Model flat per-order fees, a percentage of turnover, or the common 'whichever is lower' cap."],
    ["Break-even in points", "See the exact price move per share or unit that only covers costs, before any profit starts."],
  ],
  faqs: [
    [
      "What charges apply to an equity delivery trade in India?",
      "STT at 0.1% on both the buy and the sell value, exchange transaction charges, SEBI turnover fees of ₹10 per crore, stamp duty of 0.015% on the buy side, 18% GST on brokerage plus exchange and SEBI fees, and a DP charge levied per scrip when you sell.",
    ],
    [
      "How is STT different for intraday and options?",
      "Equity intraday attracts STT of 0.025% on the sell side only, while options carry STT of 0.1% on the sell-side premium. Delivery is the only equity segment where STT is charged on both legs.",
    ],
    [
      "Is GST charged on the whole trade value?",
      "No. GST at 18% applies only to brokerage, exchange transaction charges and SEBI turnover fees — not to STT, stamp duty or the traded amount itself.",
    ],
    [
      "Why does a profitable-looking trade still end up negative?",
      "On small quantities the fixed portion of costs — flat brokerage on both legs, DP charges and stamp duty — can exceed the price difference. The break-even figure in the result shows the minimum move that covers those costs.",
    ],
  ],
};

export default seo;
