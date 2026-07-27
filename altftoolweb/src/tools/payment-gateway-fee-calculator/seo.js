const seo = {
  intro:
    "This calculator works out what actually settles into your account after a payment gateway takes its cut, using the standard fee shape every card processor shares: amount × percentage rate + fixed fee per transaction, with optional cross-border and currency-conversion uplifts, and tax charged on the fee itself where local rules require it. It also solves the reverse question exactly — charge = (target net + fixed × (1 + tax)) ÷ (1 − percentage × (1 + tax)) — so you can price a product to land on a round number after fees. A ticket-size ladder shows why the fixed fee matters far more on small payments than large ones.",
  useCases: [
    "Check the settlement on a 1,000 invoice paid by an international card with a conversion uplift.",
    "Price a digital product so exactly 25 reaches your account after processing fees.",
    "Compare the blended monthly cost of two providers on 500 transactions at an 80 average ticket.",
  ],
  benefits: [
    ["Reverse solve, not trial and error", "The gross-up formula is exact, so the amount to charge for a target net is right first time."],
    ["Fixed fee exposed", "The ticket ladder makes the effective rate on small payments obvious — and flags tickets where the fee exceeds the sale."],
    ["Tax on the fee handled", "Supports jurisdictions such as India where GST is charged on the processing fee, not just on the sale."],
  ],
  faqs: [
    [
      "How do I calculate payment gateway fees?",
      "Multiply the transaction amount by the percentage rate and add the fixed fee. On a 1,000 payment at 2.9% + 0.30 that is 29.00 + 0.30 = 29.30, leaving 970.70 to settle.",
    ],
    [
      "How much should I charge to receive an exact amount after fees?",
      "Divide your target by one minus the percentage rate, after adding back the fixed fee — charge = (target + fixed) ÷ (1 − rate). To net 100 at 2.9% + 0.30 you would charge about 103.30. Simply adding the fee percentage to your price undershoots, because the fee is then charged on the higher amount too.",
    ],
    [
      "Why do small transactions cost so much more in percentage terms?",
      "Because the fixed fee is the same whatever the amount. At 2.9% + 0.30, a 5 payment loses 0.445 — an effective 8.9% — while a 10,000 payment loses 2.9%. Below roughly ten times the fixed fee, the flat component dominates.",
    ],
    [
      "What extra fees apply to international payments?",
      "Processors typically add a cross-border or international-card uplift of around 1% to 1.5% and a currency-conversion uplift of roughly 1% to 3% when the payment settles in a different currency. Both are percentages layered on the base rate, so they compound with it rather than replacing it — confirm the exact figures in your merchant agreement.",
    ],
  ],
};

export default seo;
